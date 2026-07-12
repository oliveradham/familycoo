# Family COO — No-Mac Submission Guide

End-to-end path from "Windows/Linux laptop" to "live in both stores." Expect
**3–7 days of your time** + **1–3 days Apple review** + **hours-to-days Google review**.

Total out-of-pocket for the first submission: **~$150** ($99 Apple + $25 Google + $30 optional EAS).

---

## Phase 0 — Accounts (do these today, they run in the background)

1. **Apple Developer Program** — https://developer.apple.com/programs/enroll/
   - $99/yr. Individual is fine; Organization needs a D-U-N-S number (2–3 weeks).
   - Verification: 24–48h. **Start now.**
2. **Google Play Console** — https://play.google.com/console/signup
   - $25 one-time. Verification: hours.
3. **Expo account** — https://expo.dev/signup (free).
4. **RevenueCat account** — https://app.revenuecat.com/signup (free tier fine).
5. (Optional) **Sentry** — https://sentry.io/signup/ for crash reporting.

While waiting on Apple, keep going with the rest of the phases.

---

## Phase 1 — Local machine setup (Windows or Linux)

Install:
- **Node 20+** and **Bun** (already required by this project).
- **Android Studio** — https://developer.android.com/studio (free). Needed only if you want to test the Android build locally; EAS can also build without it.
- **EAS CLI**: `npm install -g eas-cli`

Clone the project from GitHub (Plus menu → GitHub → Connect project inside Lovable if you haven't).

```bash
git clone <your-repo-url>
cd <repo>
bun install
```

---

## Phase 2 — Wrap the web app with Capacitor

The web app is your source of truth; Capacitor just puts it in a native shell.

```bash
bun add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
bun add @capacitor/push-notifications @capacitor/browser
bun add @revenuecat/purchases-capacitor

# capacitor.config.ts is already in the repo
npx cap add android
# iOS platform folder is added by EAS on the cloud build — you cannot add it locally without Xcode
```

Build the web bundle and sync it:

```bash
bun run build
npx cap sync android
```

Test Android locally in Android Studio: `npx cap open android` → Run.

---

## Phase 3 — Configure RevenueCat (~30 min)

Follow `REVENUECAT_SETUP.md` in the repo. Summary:

1. In RevenueCat dashboard → create app for iOS and Android.
2. Create Entitlements: `pro`, `pro_max`.
3. Create Products (do this in App Store Connect + Play Console first, then attach in RC):
   - iOS: `pro_monthly`, `pro_max_monthly`
   - Android: `pro_monthly`, `pro_max_monthly`
4. Create an Offering with these packages.
5. Grab the **public SDK keys** (one for iOS, one for Android) and add them to the app.
6. Set the webhook URL in RC → **Integrations → Webhooks**:
   `https://family-coo.com/api/public/revenuecat-webhook`
   Copy the webhook auth header token; ask me to save it as a Lovable secret.

---

## Phase 4 — Create IAP products in the stores

### App Store Connect (once Apple approves your enrollment)
1. My Apps → **+** → New App → iOS → Bundle ID `app.lovable.familycoo`.
2. App Information: fill from `STORE_LISTING.md`.
3. **Features → In-App Purchases**:
   - Add auto-renewable subscription group "Family COO Premium".
   - Add subscriptions `pro_monthly` ($49.99/mo) and `pro_max_monthly` ($99.99/mo).
   - Localize titles/descriptions, add a screenshot for each (any 640×920 screenshot works).
4. **App Privacy** → paste answers from `STORE_COMPLIANCE.md`.
5. **Pricing and Availability** → pick countries.

### Google Play Console
1. Create app → Fill from `STORE_LISTING.md`.
2. **Monetize → Products → Subscriptions** → add same two IDs.
3. **Policy → App content → Data safety** → paste answers from `STORE_COMPLIANCE.md`.
4. **Policy → App content → Privacy Policy** → `https://family-coo.com/privacy-policy`.
5. **Content rating** → complete questionnaire → Everyone.

---

## Phase 5 — Push notification credentials

### APNs (iOS)
1. Apple Developer → **Certificates, IDs & Profiles → Keys → +**.
2. Enable "Apple Push Notifications service (APNs)". Download the `.p8` file.
3. Note the **Key ID** and **Team ID**.
4. Upload the `.p8` to RevenueCat (Project settings → Apple) **and** to your push provider (Supabase Edge or wherever your server sends push from).

### FCM (Android)
1. https://console.firebase.google.com → Add project → Add Android app with package `app.lovable.familycoo`.
2. Download `google-services.json` → drop into `android/app/`.
3. Firebase → Project Settings → Cloud Messaging → **Generate service account JSON** → upload to your push provider.

---

## Phase 6 — Screenshots

Screenshots for 4 device sizes are already generated at `/mnt/documents/store-screenshots/`. The Calendar shot is empty; either re-run the script after seeding sample data, or manually crop a good frame from the app.

If you need new ones:

```bash
DEMO_HOUSEHOLD_ID=<uuid> bun run scripts/seed-demo.ts
bun dev
node scripts/capture-store-screenshots.mjs
```

Upload 6 shots per required size in App Store Connect and Play Console.

---

## Phase 7 — EAS Build (this is where "no Mac" pays off)

`eas.json` is already in the repo. Edit the three placeholders under `submit.production.ios`:

```json
"appleId": "you@example.com",
"ascAppId": "<from App Store Connect → App Information → Apple ID>",
"appleTeamId": "<from developer.apple.com membership page>"
```

Then, from your project folder:

```bash
eas login
eas init                              # links project to your Expo account
eas credentials                       # generate/upload iOS signing certs — EAS handles this for you
eas build --platform ios --profile production
eas build --platform android --profile production
```

Each build takes ~15–30 min in the cloud. When done:

```bash
eas submit --platform ios --latest    # uploads to App Store Connect
eas submit --platform android --latest # uploads to Play Console internal track
```

**No Xcode. No Mac. No Android Studio required for the final build.**

Cost: EAS free tier gives ~30 builds/mo. If you exceed it, the **$19/mo "Production"** plan is plenty for a solo dev.

---

## Phase 8 — Fill submission forms and submit

### Apple
1. App Store Connect → your app → **Prepare for Submission**.
2. Paste description, keywords, screenshots (`STORE_LISTING.md`).
3. **App Review Information**:
   - Demo account: `reviewer@familycoo.app` / a strong password you set.
   - Notes: copy from `STORE_COMPLIANCE.md` "Reviewer demo account" section.
4. Version → **Add for Review** → **Submit for Review**.
5. Review time: 24–72h typically.

### Google
1. Play Console → Testing → **Internal testing** → add yourself as a tester → verify install works.
2. Promote to **Closed testing → Open testing → Production** (Google requires ~14 days of closed testing with 12+ testers for new personal accounts opened after Nov 2023 — check the current rule).
3. Fill **Store listing**, **Content rating**, **Target audience**, **Data safety**, **Privacy policy**.
4. **Release → Production → Create new release** → Review → Rollout.

---

## Phase 9 — If Apple rejects (they usually do the first time)

Most common reasons and fixes:

| Rejection | Fix |
|---|---|
| Guideline 2.1 — crashes on launch | Look at Sentry, fix, resubmit. |
| 3.1.1 — external purchase links | Verify no Paddle URL is reachable from iOS build. Platform branch in `plans.tsx` already handles this. |
| 4.8 — Sign in with Apple missing | Already present in `auth.tsx` — screenshot it in the review notes. |
| 5.1.1(v) — account deletion | Point reviewer to Settings → Delete account. |
| 2.3.3 — screenshots don't match app | Re-capture with real data (use sample family seeder). |

Respond in Resolution Center within 24h. Re-review is usually faster than the first pass.

---

## Timeline (realistic)

| Day | What happens |
|---|---|
| 0 | Enroll Apple + Google, create RevenueCat |
| 1–2 | Apple verifies your account |
| 2 | Wrap with Capacitor + EAS init |
| 3 | Configure IAP products in both stores + RevenueCat |
| 4 | First EAS builds, internal test install |
| 5 | Fill store listings + submit to Apple + start Google internal test |
| 6–8 | Apple review |
| 9 | Live on App Store 🎉 |
| 10–24 | Google closed→open→production testing rollout |
| 25 | Live on Google Play 🎉 |

---

## Files in this repo you'll reference

- `STORE_LISTING.md` — copy/paste text for both stores
- `STORE_COMPLIANCE.md` — privacy questionnaire answers
- `REVENUECAT_SETUP.md` — IAP wiring
- `NATIVE_WRAP.md` — Capacitor specifics
- `PRIVACY.md`, `TERMS.md` — legal
- `ios-privacy/PrivacyInfo.xcprivacy` — Apple privacy manifest (EAS bundles it automatically once placed correctly in the iOS project; see `NATIVE_WRAP.md`)
- `eas.json` — EAS build/submit config
- `capacitor.config.ts` — native shell config

Ping me when you hit a snag — most rejections have a specific fix.
