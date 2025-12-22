import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
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
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ========== NEW REQUEST ==========`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${requestId}] Step 1: Checking environment variables...`);
    if (!ABACATEPAY_API_TOKEN) {
      console.error(`[${requestId}] ERROR: ABACATEPAY_API_TOKEN not configured`);
      throw new Error('Payment gateway not configured');
    }
    console.log(`[${requestId}] ✓ ABACATEPAY_API_TOKEN configured`);

    // Initialize Supabase client with service role for user creation
    console.log(`[${requestId}] Step 2: Initializing Supabase client...`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${requestId}] ERROR: Missing Supabase credentials`);
      throw new Error('Supabase not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[${requestId}] ✓ Supabase client initialized`);

    // Parse Request Body Once
    console.log(`[${requestId}] Step 3: Parsing request body...`);
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] ✓ Body parsed:`, JSON.stringify(body, null, 2));
    } catch (error) {
      console.error(`[${requestId}] ERROR: Failed to parse JSON body:`, error);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate with Zod
    console.log(`[${requestId}] Step 4: Validating request data...`);
    const validation = billingSchema.safeParse(body);

    if (!validation.success) {
      console.error(`[${requestId}] ERROR: Validation failed:`, validation.error.format());
      return new Response(
        JSON.stringify({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.format()
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] ✓ Validation passed`);

    const { planSlug, planName, priceInCents, customer } = validation.data;

    console.log(`[${requestId}] Step 5: Processing billing request`);
    console.log(`[${requestId}] Plan: ${planSlug} (${planName})`);
    console.log(`[${requestId}] Price: ${priceInCents} cents`);
    console.log(`[${requestId}] Customer: ${customer.email}`);

    // Find or create user profile based on email
    console.log(`[${requestId}] Step 6: Finding or creating user...`);
    let userId: string;

    // Try to find existing profile by email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', customer.email)
      .single();

    if (existingProfile) {
      userId = existingProfile.user_id;
      console.log(`[${requestId}] ✓ Found existing user: ${userId}`);
    } else {
      console.log(`[${requestId}] No existing user found, creating new user...`);
      // Create a new auth user for this customer
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: customer.email,
        email_confirm: true,
        user_metadata: {
          full_name: customer.name,
          phone: customer.cellphone,
        }
      });

      if (authError || !authData.user) {
        console.error(`[${requestId}] ERROR creating user:`, authError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar usuário" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;
      console.log(`[${requestId}] ✓ Created new user: ${userId}`);

      // Create profile
      console.log(`[${requestId}] Creating profile for user...`);
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: customer.email,
          full_name: customer.name,
          phone: customer.cellphone,
        });

      if (profileError) {
        console.error(`[${requestId}] ERROR creating profile:`, profileError);
        // Continue anyway, profile might be created by trigger
      } else {
        console.log(`[${requestId}] ✓ Profile created`);
      }
    }


    // Get plan from database
    console.log(`[${requestId}] Step 7: Fetching plan from database...`);
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    if (planError || !plan) {
      console.error(`[${requestId}] ERROR: Plan not found:`, planSlug, planError);
      return new Response(
        JSON.stringify({ success: false, error: "Plano não encontrado" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] ✓ Plan found: ${plan.id} - ${plan.name}`);


    // Criar cobrança no AbacatePay
    console.log(`[${requestId}] Step 8: Creating billing in AbacatePay...`);
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
      returnUrl: `${req.headers.get('origin') || 'https://lucrofy.netlify.app'}/dashboard`,
      completionUrl: `${req.headers.get('origin') || 'https://lucrofy.netlify.app'}/dashboard?payment_status=success`,
      customer: {
        name: customer.name,
        email: customer.email,
        cellphone: customer.cellphone,
        taxId: customer.taxId,
      },
      metadata: {
        userId: userId,
        planId: plan.id,
        planSlug: planSlug,
      },
    };

    console.log(`[${requestId}] Billing payload:`, JSON.stringify(billingPayload, null, 2));

    const response = await fetch(`${ABACATEPAY_API_URL}/billing/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billingPayload),
    });

    const responseText = await response.text();
    console.log(`[${requestId}] AbacatePay response status: ${response.status}`);
    console.log(`[${requestId}] AbacatePay response body:`, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(`[${requestId}] ERROR: Failed to parse AbacatePay response:`, responseText);
      throw new Error(`Invalid response from gateway: ${responseText}`);
    }

    if (!response.ok || data.error) {
      console.error(`[${requestId}] ERROR: AbacatePay error:`, data.error || responseText);
      throw new Error(data.error || `Payment gateway error: ${response.status}`);
    }

    console.log(`[${requestId}] ✓ Billing created successfully in AbacatePay`);
    console.log(`[${requestId}] Billing ID: ${data.data?.id}`);
    console.log(`[${requestId}] Payment URL: ${data.data?.url}`);

    // Save payment record to database with pending status
    console.log(`[${requestId}] Step 9: Saving payment record to database...`);
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
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
      console.error(`[${requestId}] ERROR saving payment record:`, paymentError);
      console.error(`[${requestId}] Payment error details:`, JSON.stringify(paymentError, null, 2));
      // Don't fail the request, just log the error
      // The webhook will create the payment record when confirmed
    } else {
      console.log(`[${requestId}] ✓ Payment record created: ${paymentRecord.id}`);
    }

    console.log(`[${requestId}] Step 10: Sending success response...`);
    console.log(`[${requestId}] ========== REQUEST COMPLETED SUCCESSFULLY ==========`);

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
    console.error(`[${requestId}] ========== ERROR IN REQUEST ==========`);
    console.error(`[${requestId}] Error type:`, error.constructor.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create billing',
        requestId: requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
