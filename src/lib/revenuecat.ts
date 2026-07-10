// RevenueCat wrapper — only loaded on native platforms via dynamic import.
// Web checkout continues through Paddle (see hooks/usePaddleCheckout).
//
// Configure in Capacitor shell before first use:
//   await configureRevenueCat({ apiKey: RC_PUBLIC_SDK_KEY, appUserId: user.id })
//
// Entitlement identifiers must match those configured in RevenueCat dashboard:
//   - "pro"      → maps to product "pro_plan"
//   - "pro_max"  → maps to product "max_plan"

import { isNative } from "./platform";

export type RCOffering = {
  identifier: string;
  packages: Array<{
    identifier: string;
    product: {
      identifier: string;
      priceString: string;
      title: string;
      description: string;
    };
  }>;
};

async function loadPurchases() {
  if (!isNative()) throw new Error("RevenueCat is native-only");
  const mod = await import(/* @vite-ignore */ "@revenuecat/purchases-capacitor");
  return mod.Purchases;
}

export async function configureRevenueCat(opts: { apiKey: string; appUserId: string }) {
  const Purchases = await loadPurchases();
  await Purchases.configure({ apiKey: opts.apiKey, appUserID: opts.appUserId });
}

export async function getOfferings(): Promise<RCOffering | null> {
  const Purchases = await loadPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkgIdentifier: string) {
  const Purchases = await loadPurchases();
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) throw new Error("No active RevenueCat offering");
  const pkg = current.availablePackages.find(
    (p: { identifier: string }) => p.identifier === pkgIdentifier,
  );
  if (!pkg) throw new Error(`Package ${pkgIdentifier} not in current offering`);
  const result = await Purchases.purchasePackage({ aPackage: pkg });
  return result;
}

export async function restorePurchases() {
  const Purchases = await loadPurchases();
  return Purchases.restorePurchases();
}

export async function getCustomerInfo() {
  const Purchases = await loadPurchases();
  return Purchases.getCustomerInfo();
}

export function hasActiveEntitlement(
  info: { customerInfo?: { entitlements?: { active?: Record<string, unknown> } } },
  key: "pro" | "pro_max",
): boolean {
  return Boolean(info.customerInfo?.entitlements?.active?.[key]);
}
