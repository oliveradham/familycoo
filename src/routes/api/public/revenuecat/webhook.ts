// RevenueCat webhook handler
// Receives entitlement changes from RevenueCat and upserts the subscriptions
// table so useSubscription keeps working identically for iOS/Android IAP.
//
// Setup: RevenueCat dashboard → Integrations → Webhooks → paste this URL and
// the shared secret. Save the secret via add_secret as REVENUECAT_WEBHOOK_SECRET.
//
// Note: reuses the paddle_customer_id / paddle_subscription_id columns to hold
// RevenueCat's app_user_id / original_transaction_id — same semantics, no
// schema change required. Price/product IDs map to the same human-readable IDs
// used by the Paddle flow so tier gating is identical.

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

        const body = (await request.json()) as any;
        const event = body?.event;
        if (!event) return new Response('No event', { status: 400 });

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        const userId: string = event.app_user_id;
        const productId: string = event.product_id ?? '';
        const type: string = event.type ?? '';

        const tier = productId.includes('promax')
          ? 'promax'
          : productId.includes('pro')
          ? 'pro'
          : null;

        const activeTypes = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION'];
        const inactiveTypes = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];

        const isActive = activeTypes.includes(type);
        const isInactive = inactiveTypes.includes(type);

        if (!userId || !tier || (!isActive && !isInactive)) {
          return new Response('ok');
        }

        await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          paddle_customer_id: `rc_${userId}`,
          paddle_subscription_id: event.original_transaction_id ?? `rc_${Date.now()}`,
          product_id: tier === 'promax' ? 'promax_plan' : 'pro_plan',
          price_id: tier === 'promax' ? 'promax_monthly' : 'pro_monthly',
          status: isActive ? 'active' : 'canceled',
          environment: event.environment === 'SANDBOX' ? 'sandbox' : 'live',
          current_period_end: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
        });

        return new Response('ok');
      },
    },
  },
});
