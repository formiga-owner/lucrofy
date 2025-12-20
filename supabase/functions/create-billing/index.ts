import { z } from "zod";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const ABACATEPAY_API_TOKEN = Deno.env.get('ABACATEPAY_API_TOKEN');
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const billingSchema = z.object({
  planSlug: z.string(),
  planName: z.string(),
  priceInCents: z.number().positive(),
  customer: z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    cellphone: z.string().min(10, "Telefone inválido"),
    taxId: z.string().length(11, "CPF deve ter 11 dígitos")
  })
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ABACATEPAY_API_TOKEN) {
      console.error('ABACATEPAY_API_TOKEN not configured');
      throw new Error('Payment gateway not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id, user.email);

    // Parse Request Body Once
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate with Zod
    const validation = billingSchema.safeParse(body);

    if (!validation.success) {
      console.warn('Validação falhou:', validation.error.format());
      return new Response(
        JSON.stringify({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.format()
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { planSlug, planName, priceInCents, customer } = validation.data;

    console.log('Creating billing for:', { planSlug, planName, priceInCents, customerEmail: customer.email, userId: user.id });

    // Get plan from database
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', planSlug, planError);
      return new Response(
        JSON.stringify({ success: false, error: "Plano não encontrado" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Criar cobrança no AbacatePay
    const billingPayload = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [
        {
          externalId: planSlug,
          name: planName,
          description: `Assinatura do plano ${planName}`,
          quantity: 1,
          price: priceInCents,
        },
      ],
      returnUrl: `${req.headers.get('origin') || 'https://lucrofy.netlify.app'}/pricing?status=pending`,
      completionUrl: `${req.headers.get('origin') || 'https://lucrofy.netlify.app'}/dashboard?payment_status=success`,
      customer: {
        name: customer.name,
        email: customer.email,
        cellphone: customer.cellphone,
        taxId: customer.taxId,
      },
      metadata: {
        userId: user.id,
        planId: plan.id,
        planSlug: planSlug,
      },
    };

    console.log('Sending to AbacatePay:', JSON.stringify(billingPayload, null, 2));

    const response = await fetch(`${ABACATEPAY_API_URL}/billing/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billingPayload),
    });

    const responseText = await response.text();
    console.log('AbacatePay response status:', response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse AbacatePay response:', responseText);
      throw new Error(`Invalid response from gateway: ${responseText}`);
    }

    if (!response.ok || data.error) {
      console.error('AbacatePay error:', data.error || responseText);
      throw new Error(data.error || `Payment gateway error: ${response.status}`);
    }

    console.log('Billing created successfully:', data.data?.id);

    // Save payment record to database with pending status
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount: priceInCents / 100, // Convert cents to currency
        currency: 'BRL',
        status: 'pending',
        payment_method: 'pix',
        external_payment_id: data.data?.id,
        metadata: {
          customer,
          billingPayload,
          abacatepay_response: data.data,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment record:', paymentError);
      // Don't fail the request, just log the error
      // The webhook will create the payment record when confirmed
    } else {
      console.log('Payment record created:', paymentRecord.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        billingId: data.data?.id,
        paymentUrl: data.data?.url,
        status: data.data?.status,
        paymentId: paymentRecord?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );


  } catch (error: any) {
    console.error('Error in create-billing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create billing',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
