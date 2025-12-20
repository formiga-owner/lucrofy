import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ABACATEPAY_API_TOKEN = Deno.env.get('ABACATEPAY_API_TOKEN');
const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBillingRequest {
  planSlug: string;
  planName: string;
  priceInCents: number;
  customer: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ABACATEPAY_API_TOKEN) {
      console.error('ABACATEPAY_API_TOKEN not configured');
      throw new Error('Payment gateway not configured');
    }

    const { planSlug, planName, priceInCents, customer }: CreateBillingRequest = await req.json();

    console.log('Creating billing for:', { planSlug, planName, priceInCents, customerEmail: customer.email });

    // Validação básica
    if (!planSlug || !planName || !priceInCents || !customer) {
      throw new Error('Missing required fields');
    }

    if (!customer.name || !customer.email || !customer.cellphone || !customer.taxId) {
      throw new Error('Missing customer fields');
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
      returnUrl: `${req.headers.get('origin') || 'https://lucrozen.lovable.app'}/pricing?status=pending`,
      completionUrl: `${req.headers.get('origin') || 'https://lucrozen.lovable.app'}/pricing?status=success`,
      customer: {
        name: customer.name,
        email: customer.email,
        cellphone: customer.cellphone,
        taxId: customer.taxId,
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
    console.log('AbacatePay response:', responseText);

    if (!response.ok) {
      console.error('AbacatePay error:', responseText);
      throw new Error(`Payment gateway error: ${response.status}`);
    }

    const data = JSON.parse(responseText);

    if (data.error) {
      console.error('AbacatePay returned error:', data.error);
      throw new Error(data.error);
    }

    console.log('Billing created successfully:', data.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        billingId: data.data?.id,
        paymentUrl: data.data?.url,
        status: data.data?.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
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
