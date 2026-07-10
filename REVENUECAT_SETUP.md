# RevenueCat Setup — Family COO

RevenueCat handles native in-app purchases on iOS and Android. Web keeps Paddle. Both providers write to the shared `subscriptions` table, so tier gating is uniform.

## 1. Create products in App Store Connect & Play Console

| Product ID    | Type              | Price  | Entitlement key |
| ------------- | ----------------- | ------ | --------------- |
| `pro_monthly` | Auto-renewable    | $49.99 | `pro`           |
| `max_monthly` | Auto-renewable    | $99.99 | `pro_max`       |

Both stores must use the exact product IDs above (RevenueCat matches on them).

## 2. RevenueCat dashboard

1. Create app "Family COO" — one project, two apps (iOS + Android).
2. Add products above, map each to its entitlement key.
3. Create an **Offering** named `default` containing both packages.
4. Copy the **Public SDK key** for each platform.

## 3. Configure in the Capacitor shell

Inside the Capacitor project (after `cap add ios`), on app boot after auth:

```ts
import { configureRevenueCat } from "@/lib/revenuecat";
import { isIOS } from "@/lib/platform";

const RC_KEY = isIOS()
  ? "appl_XXXXXXXXXXXXXXXXXXXXXXXXXX"   // iOS public SDK key
  : "goog_XXXXXXXXXXXXXXXXXXXXXXXXXX"; // Android public SDK key

await configureRevenueCat({ apiKey: RC_KEY, appUserId: user.id });
```

Public SDK keys are safe to embed in the client bundle (RevenueCat's design).

## 4. Server webhook

RevenueCat → Project settings → Integrations → Webhooks:

- **URL**: `https://familycoo.lovable.app/api/public/revenuecat-webhook`
- **Authorization header**: `Bearer <REVENUECAT_WEBHOOK_SECRET>`

Then add the secret to Lovable Cloud:

- Secret name: `REVENUECAT_WEBHOOK_SECRET`
- Value: a strong random string you paste identically into the RevenueCat webhook config

The route is already implemented at `src/routes/api/public/revenuecat-webhook.ts` and upserts into the `subscriptions` table with `environment='live'`.

## 5. Testing

- iOS: create a sandbox tester in App Store Connect, sign into TestFlight on device.
- Android: add tester emails to a closed test track in Play Console.

Verify: purchase → webhook fires → `subscriptions` row appears with correct `price_id` and `status='active'` → premium UI unlocks.
