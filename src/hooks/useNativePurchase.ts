// Native (iOS/Android) purchase flow via RevenueCat.
// Mirrors the surface of usePaddleCheckout so plans.tsx can swap based on platform.
//
// On native, Apple/Google require IAP for digital subscriptions — Paddle
// checkout inside the app would be rejected under App Store guideline 3.1.1.
// The RevenueCat webhook (src/routes/api/public/revenuecat/webhook.ts) mirrors
// entitlement into the `subscriptions` table so the rest of the app keeps
// working through the same useSubscription hook.

import { useState } from "react";
import { isNative } from "@/lib/platform";
import { purchasePackage, restorePurchases } from "@/lib/revenuecat";

// Package identifiers must match the RevenueCat dashboard "current" offering.
const NATIVE_PACKAGE_IDS: Record<string, string> = {
  pro: "pro_monthly",
  max: "max_monthly",
};

export function useNativePurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = isNative();

  async function buy(planId: string) {
    if (!available) throw new Error("Native purchase is only available inside the mobile app");
    const pkg = NATIVE_PACKAGE_IDS[planId];
    if (!pkg) throw new Error(`Unknown plan: ${planId}`);
    setLoading(true);
    setError(null);
    try {
      const result = await purchasePackage(pkg);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // RevenueCat surfaces a user-cancel error; treat that as a no-op.
      if (!/cancel/i.test(msg)) setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    if (!available) return;
    setLoading(true);
    setError(null);
    try {
      await restorePurchases();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return { available, loading, error, buy, restore };
}
