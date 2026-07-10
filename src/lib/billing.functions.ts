import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Create a Paddle customer-portal session for the signed-in user's most recent
 * subscription. The client opens the returned URL in a new tab so users can
 * cancel, update payment method, or view invoices.
 */
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getPaddleClient } = await import("@/lib/paddle.server");

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("paddle_customer_id, paddle_subscription_id, environment")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub || !sub.paddle_customer_id) {
      throw new Error("No subscription found. Start a plan first.");
    }

    const env = (sub.environment as "sandbox" | "live") ?? "sandbox";
    const paddle = getPaddleClient(env);
    const portal = await paddle.customerPortalSessions.create(
      sub.paddle_customer_id as string,
      sub.paddle_subscription_id ? [sub.paddle_subscription_id as string] : [],
    );

    return {
      overviewUrl: portal.urls?.general?.overview ?? null,
      subscriptionUrls: portal.urls?.subscriptions ?? [],
    };
  });

/**
 * Cancel the signed-in user's Paddle subscription immediately.
 * Used before permanent account deletion to prevent orphaned billing.
 */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { immediate?: boolean } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getPaddleClient } = await import("@/lib/paddle.server");

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("paddle_subscription_id, environment, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub || !sub.paddle_subscription_id) return { ok: true, canceled: false };

    const env = (sub.environment as "sandbox" | "live") ?? "sandbox";
    const paddle = getPaddleClient(env);
    try {
      await paddle.subscriptions.cancel(sub.paddle_subscription_id as string, {
        effectiveFrom: data.immediate ? "immediately" : "next_billing_period",
      });
    } catch (e) {
      console.error("Paddle cancel failed", e);
    }

    return { ok: true, canceled: true };
  });

/**
 * Return current entitlement so protected routes can gate on the server.
 * The client hook `useSubscription` gives the same data client-side; this fn
 * is used by loaders and defensive checks.
 */
export const getMyEntitlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getEntitlement } = await import("@/lib/entitlement.server");
    return getEntitlement(context.userId);
  });
