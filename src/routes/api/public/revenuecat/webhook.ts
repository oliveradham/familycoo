// RevenueCat webhook handler
// Receives entitlement changes from RevenueCat and upserts the subscriptions table
// so useSubscription keeps working identically for iOS/Android IAP customers.
//
// Setup: RevenueCat dashboard → Integrations → Webhooks → paste this URL and
// the shared secret. Save the secret via add_secret as REVENUECAT_WEBHOOK_SECRET.

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/revenuecat/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        const auth = request.headers.get('authorization');
        if (!secret || auth !== `Bearer ${secret}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        const body = await request.json() as any;
        const event = body?.event;
        if (!event) return new Response('No event', { status: 400 });

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        const userId = event.app_user_id;
        const productId: string = event.product_id ?? '';
        const type: string = event.type ?? '';

        // Map product IDs to tiers
        const tier = productId.includes('promax') ? 'promax'
          : productId.includes('pro') ? 'pro'
          : null;

        // Determine status from event type
        const activeTypes = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION'];
        const inactiveTypes = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];

        const isActive = activeTypes.includes(type);
        const isInactive = inactiveTypes.includes(type);

        if (!tier || (!isActive && !isInactive)) {
          return new Response('ok'); // ignore unrelated events
        }

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          provider: 'revenuecat',
          product_id: tier === 'promax' ? 'promax_plan' : 'pro_plan',
          price_id: tier === 'promax' ? 'promax_monthly' : 'pro_monthly',
          status: isActive ? 'active' : 'canceled',
          environment: event.environment === 'SANDBOX' ? 'sandbox' : 'live',
          current_period_end: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
          revenuecat_subscription_id: event.original_transaction_id ?? null,
        }, { onConflict: 'user_id,provider,environment' });

        return new Response('ok');
      },
    },
  },
});
