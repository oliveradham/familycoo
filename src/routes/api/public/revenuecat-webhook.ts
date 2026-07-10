import { createFileRoute } from "@tanstack/react-router";

// RevenueCat webhook — mirrors iOS/Android IAP events into the shared
// `subscriptions` table so tier gating (has_active_subscription) works
// uniformly across web (Paddle) and native (RevenueCat).
//
// Configure in RevenueCat dashboard → Project settings → Integrations →
// Webhooks. Set the Authorization header to `Bearer <REVENUECAT_WEBHOOK_SECRET>`.
//
// Event schema: https://www.revenuecat.com/docs/webhooks

export const Route = createFileRoute("/api/public/revenuecat-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 503 });

        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: {
          event?: {
            type?: string;
            app_user_id?: string;
            product_id?: string;
            entitlement_ids?: string[];
            expiration_at_ms?: number | null;
            purchased_at_ms?: number;
            store?: string;
            original_transaction_id?: string;
          };
        };
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const ev = payload.event;
        if (!ev?.type || !ev.app_user_id) {
          return new Response("Bad payload", { status: 400 });
        }

        const activeTypes = new Set([
          "INITIAL_PURCHASE",
          "RENEWAL",
          "PRODUCT_CHANGE",
          "UNCANCELLATION",
        ]);
        const canceledTypes = new Set(["CANCELLATION", "EXPIRATION"]);

        let status: "active" | "canceled" | "past_due" | "trialing" | null = null;
        if (activeTypes.has(ev.type)) status = "active";
        else if (canceledTypes.has(ev.type)) status = "canceled";
        else if (ev.type === "BILLING_ISSUE") status = "past_due";
        else if (ev.type === "TRIAL_STARTED") status = "trialing";

        if (!status) return new Response("Ignored", { status: 200 });

        // Map RevenueCat entitlement → our internal product/price identifiers.
        // useSubscription() keys tier off product_id, so these MUST match
        // the strings the Paddle webhook writes (`family_coo_pro` / `family_coo_max`).
        const entitlement = ev.entitlement_ids?.[0];
        const productId = entitlement === "pro_max" ? "family_coo_max" : "family_coo_pro";
        const priceId = entitlement === "pro_max" ? "max_monthly" : "pro_monthly";
        const periodEnd =
          ev.expiration_at_ms != null
            ? new Date(ev.expiration_at_ms).toISOString()
            : null;
        const periodStart = ev.purchased_at_ms
          ? new Date(ev.purchased_at_ms).toISOString()
          : new Date().toISOString();

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const paddleSubId = `rc_${ev.original_transaction_id ?? ev.app_user_id}`;

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: ev.app_user_id,
            paddle_subscription_id: paddleSubId,
            paddle_customer_id: `rc_${ev.app_user_id}`,
            product_id: productId,
            price_id: priceId,
            status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            // cancel_at_period_end means "will not renew" — true for CANCELLATION
            // (user turned off auto-renew, still has access until expiration).
            // EXPIRATION means access has already ended; leave the flag false.
            cancel_at_period_end: ev.type === "CANCELLATION",
            environment: "live",
          },
          { onConflict: "paddle_subscription_id" },
        );


        if (error) {
          console.error("[revenuecat-webhook] upsert failed", error);
          return new Response("DB error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
