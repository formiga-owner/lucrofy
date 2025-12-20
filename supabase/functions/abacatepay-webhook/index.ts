import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AbacatePayWebhookPayload {
    event: string;
    data: {
        id: string;
        status: string;
        amount: number;
        customer: {
            email: string;
            name: string;
            taxId: string;
            cellphone: string;
        };
        products: Array<{
            externalId: string;
            name: string;
            price: number;
            quantity: number;
        }>;
        metadata?: {
            userId?: string;
            planSlug?: string;
        };
    };
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Initialize Supabase client with service role key for admin operations
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse webhook payload
        const payload: AbacatePayWebhookPayload = await req.json();
        console.log('Webhook received:', JSON.stringify(payload, null, 2));

        const { event, data } = payload;

        // Process only payment confirmation events
        if (event === 'billing.paid' || event === 'billing.confirmed') {
            const { id: billingId, status, amount, customer, products, metadata } = data;

            // Find the plan
            const planSlug = products[0]?.externalId || metadata?.planSlug;
            if (!planSlug) {
                throw new Error('Plan slug not found in webhook data');
            }

            const { data: plan, error: planError } = await supabase
                .from('plans')
                .select('*')
                .eq('slug', planSlug)
                .single();

            if (planError || !plan) {
                throw new Error(`Plan not found: ${planSlug}`);
            }

            // Find user by email
            const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

            if (userError) {
                throw new Error(`Error fetching users: ${userError.message}`);
            }

            const user = users.find(u => u.email === customer.email);

            if (!user) {
                throw new Error(`User not found with email: ${customer.email}`);
            }

            // Create payment record
            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    plan_id: plan.id,
                    amount: amount / 100, // Convert cents to currency
                    currency: 'BRL',
                    status: 'completed',
                    payment_method: 'pix',
                    external_payment_id: billingId,
                    metadata: {
                        customer,
                        products,
                        abacatepay_event: event,
                    },
                })
                .select()
                .single();

            if (paymentError) {
                console.error('Error creating payment:', paymentError);
                throw new Error(`Failed to create payment: ${paymentError.message}`);
            }

            console.log('Payment created:', payment.id);

            // Check if user already has an active subscription for this plan
            const { data: existingSubscription } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('plan_id', plan.id)
                .eq('status', 'active')
                .single();

            if (existingSubscription) {
                // Extend existing subscription
                const currentEndDate = new Date(existingSubscription.end_at);
                const newEndDate = new Date(currentEndDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);

                const { error: updateError } = await supabase
                    .from('subscriptions')
                    .update({
                        end_at: newEndDate.toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingSubscription.id);

                if (updateError) {
                    console.error('Error updating subscription:', updateError);
                    throw new Error(`Failed to update subscription: ${updateError.message}`);
                }

                console.log('Subscription extended:', existingSubscription.id);
            } else {
                // Create new subscription
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                const { data: newSubscription, error: subscriptionError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: user.id,
                        plan_id: plan.id,
                        status: 'active',
                        start_at: startDate.toISOString(),
                        end_at: endDate.toISOString(),
                        canceled_at: null,
                    })
                    .select()
                    .single();

                if (subscriptionError) {
                    console.error('Error creating subscription:', subscriptionError);
                    throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
                }

                console.log('Subscription created:', newSubscription.id);
            }

            return new Response(
                JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // For other events, just acknowledge
        return new Response(
            JSON.stringify({ success: true, message: 'Event acknowledged' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to process webhook',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
