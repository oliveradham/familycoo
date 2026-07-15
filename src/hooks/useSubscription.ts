import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/lib/auth-context";

export type Subscription = {
  id: string;
  user_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
};

export type Tier = "free" | "pro" | "max";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number | null>(null);

  const load = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", getPaddleEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as Subscription | null) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    setNow(Date.now());
    load();
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const end = subscription?.current_period_end ? new Date(subscription.current_period_end).getTime() : null;
  const withinPeriod = now == null || end == null || end > now;
  const isActive = !!subscription && (
    (["active", "trialing", "past_due"].includes(subscription.status) && withinPeriod) ||
    (subscription.status === "canceled" && !!end && (now == null || end > now))
  );
  const isTrialing = !!subscription && subscription.status === "trialing" && withinPeriod;
  const isPastDue = !!subscription && subscription.status === "past_due" && withinPeriod;
  const tier: Tier = !isActive
    ? "free"
    : subscription?.product_id === "family_coo_max"
      ? "max"
      : subscription?.product_id === "family_coo_pro"
        ? "pro"
        : "free";

  return {
    subscription,
    loading,
    isActive,
    isTrialing,
    isPastDue,
    tier,
    trialEndsAt: isTrialing ? subscription?.current_period_end ?? null : null,
    refetch: load,
  };
}

const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, max: 2 };
export function tierMeets(current: Tier, min: Tier): boolean {
  return TIER_RANK[current] >= TIER_RANK[min];
}
