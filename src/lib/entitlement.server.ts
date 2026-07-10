/**
 * Server-side entitlement helper — the single source of truth for whether a
 * signed-in user has an active paid subscription and what tier they're on.
 *
 * Server functions gate premium features by calling `assertPaidTier()` at the
 * top of their handler. The client-side `useSubscription` hook mirrors this
 * logic for UI, but the server is the actual security boundary.
 */

export type Tier = "free" | "pro" | "max";
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, max: 2 };

export type EntitlementSnapshot = {
  tier: Tier;
  isActive: boolean;
  isTrialing: boolean;
  isPastDue: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  environment: "sandbox" | "live";
};

function envFromEnv(): "sandbox" | "live" {
  // Server-side we can't read a client token; infer from Paddle API key.
  // If a LIVE Paddle key is configured, treat as live; otherwise sandbox.
  return process.env.PADDLE_LIVE_API_KEY ? "live" : "sandbox";
}

/**
 * Read a user's current entitlement from the subscriptions table using the
 * service-role client so RLS doesn't hide rows the user hasn't been sent yet.
 * Callers must have already authenticated the user upstream.
 */
export async function getEntitlement(userId: string): Promise<EntitlementSnapshot> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const env = envFromEnv();

  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("environment", env)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return {
      tier: "free",
      isActive: false,
      isTrialing: false,
      isPastDue: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      environment: env,
    };
  }

  const sub = data as {
    status: string;
    product_id: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  };
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const now = Date.now();
  const withinPeriod = end == null || end > now;

  const isActive =
    (["active", "trialing", "past_due"].includes(sub.status) && withinPeriod) ||
    (sub.status === "canceled" && end != null && end > now);

  const tier: Tier = !isActive
    ? "free"
    : sub.product_id === "family_coo_max"
      ? "max"
      : sub.product_id === "family_coo_pro"
        ? "pro"
        : "free";

  return {
    tier,
    isActive,
    isTrialing: sub.status === "trialing" && withinPeriod,
    isPastDue: sub.status === "past_due" && withinPeriod,
    cancelAtPeriodEnd: !!sub.cancel_at_period_end,
    currentPeriodEnd: sub.current_period_end,
    environment: env,
  };
}

/**
 * Throw a structured 402-shaped error if the user isn't on `minTier` or above.
 * The client can inspect `err.message` (JSON string) to render a paywall.
 */
export async function assertPaidTier(
  userId: string,
  minTier: Exclude<Tier, "free"> = "pro",
): Promise<EntitlementSnapshot> {
  const ent = await getEntitlement(userId);
  if (!ent.isActive || TIER_RANK[ent.tier] < TIER_RANK[minTier]) {
    // Serialise a structured payload so the client can distinguish
    // "upgrade required" from other errors and open the paywall.
    const payload = JSON.stringify({
      code: "upgrade_required",
      required: minTier,
      current: ent.tier,
    });
    throw new Error(`UPGRADE_REQUIRED:${payload}`);
  }
  return ent;
}
