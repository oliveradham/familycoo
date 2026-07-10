# RevenueCat / StoreKit Setup (iOS IAP)

Apple **requires** StoreKit In-App Purchase for digital subscriptions. Paddle is fine for web + Android; iOS must use IAP or the app is rejected under Guideline 3.1.1.

RevenueCat gives you a single SDK that speaks StoreKit (iOS) and Google Play Billing (Android), and syncs entitlements back to your backend via webhooks — matching your existing Paddle webhook pattern.

## 1. Local prereqs (after Capacitor wrap)

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

## 2. Create RevenueCat account
- Sign up at revenuecat.com (free up to $2.5k MTR)
- Create project "Family COO"
- Add two apps: iOS bundle `app.familycoo.ios`, Android package `app.familycoo.android`

## 3. App Store Connect
- Create subscription group "Family COO Premium"
- Products (must match tier names in `src/lib/revenuecat.ts`):
  - `familycoo_pro_monthly` — $49.99/mo
  - `familycoo_promax_monthly` — $99.99/mo
- Enable "Sign in with Apple" (Apple requires it since you offer social login)
- Upload paid apps agreement + tax forms

## 4. Google Play Console
- Create subscriptions with the SAME product IDs
- Set base plans + offers if you want intro pricing

## 5. RevenueCat entitlements
- Create entitlement `pro` → attach `familycoo_pro_monthly` + `familycoo_promax_monthly`
- Create entitlement `promax` → attach only `familycoo_promax_monthly`

## 6. Webhook to your backend
- RevenueCat dashboard → Integrations → Webhooks
- URL: `https://familycoo.lovable.app/api/public/revenuecat/webhook`
- Copy the shared secret and save via `add_secret` as `REVENUECAT_WEBHOOK_SECRET`

## 7. iOS-only checkout swap

In `src/routes/plans.tsx`, wrap the Paddle CTA:

```tsx
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

async function buy(tier: 'pro' | 'promax') {
  if (Capacitor.getPlatform() === 'ios') {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      p => p.identifier === (tier === 'pro' ? 'monthly_pro' : 'monthly_promax')
    );
    if (pkg) await Purchases.purchasePackage({ aPackage: pkg });
  } else {
    // existing Paddle overlay
    openCheckout({ priceId: tier === 'pro' ? 'pro_monthly' : 'promax_monthly', ... });
  }
}
```

## 8. Init on app boot

In `src/routes/__root.tsx` inside a `useEffect`:

```ts
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;
  const key = Capacitor.getPlatform() === 'ios'
    ? import.meta.env.VITE_REVENUECAT_IOS_KEY
    : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
  Purchases.setLogLevel({ level: LOG_LEVEL.INFO });
  Purchases.configure({ apiKey: key, appUserID: userId });
}, [userId]);
```

## 9. Webhook handler (backend, already scaffolded)

See `src/routes/api/public/revenuecat/webhook.ts` — verifies the signature, upserts the subscription row with `provider = 'revenuecat'` so your existing `useSubscription` hook keeps working.

## 10. Test
- Sandbox testers in App Store Connect → Users and Access → Sandbox
- Log in with sandbox account on device, buy, cancel, upgrade
- Verify subscription row appears in DB with correct tier
