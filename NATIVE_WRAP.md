# Native Wrap Handoff — Family COO

This document is everything you need to take the current web app to the Apple App Store and Google Play. The web app is production-ready and installable as a PWA today. The final `.ipa` / `.aab` builds must be done locally with Xcode + Android Studio — Lovable cannot run those toolchains.

Estimated hands-on time: **2–4 days** if you already have Apple + Google developer accounts. First-time submission review: Apple 24–48h, Google 3–7 days.

---

## 0. Prerequisites (do these once)

- [ ] **Apple Developer Program** account ($99/yr) — https://developer.apple.com/programs/
- [ ] **Google Play Console** account ($25 one-time) — https://play.google.com/console
- [ ] **macOS + Xcode 15+** (required for iOS builds — no way around this)
- [ ] **Android Studio Hedgehog+** with SDK 34
- [ ] **Node 20+**, **npm** or **bun**
- [ ] **CocoaPods**: `sudo gem install cocoapods`

---

## 1. Clone and build the web app locally

```bash
git clone <your-lovable-git-url>
cd family-coo
npm install
npm run build          # builds to dist/
```

Confirm `dist/index.html` and `dist/assets/*` exist.

---

## 2. Add Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/app @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen @capacitor/preferences @capacitor/push-notifications
npx cap init "Family COO" com.familycoo.app --web-dir=dist
```

Create `capacitor.config.ts` in the repo root:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familycoo.app',
  appName: 'Family COO',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#fcfcfc',
  },
  android: {
    backgroundColor: '#fcfcfc',
  },
  server: {
    // Point to the published web app so the shell always serves latest.
    // Remove `url` if you want to ship offline-first with the built assets.
    url: 'https://familycoo.lovable.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#fcfcfc',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
```

Add the native projects:

```bash
npx cap add ios
npx cap add android
npx cap sync
```

---

## 3. Icons and splash screens

Use https://icon.kitchen or the `@capacitor/assets` tool.

```bash
npm install --save-dev @capacitor/assets
mkdir -p resources
# Copy public/app-icon.png (already in repo) to resources/icon-only.png (1024x1024)
cp public/app-icon.png resources/icon-only.png
# Splash: 2732x2732 centered version of the icon
# (create manually in Figma/Sketch or reuse the icon on a #FCFCFC background)
npx capacitor-assets generate --iconBackgroundColor '#fcfcfc' --splashBackgroundColor '#fcfcfc'
```

This regenerates every required size for iOS + Android automatically.

---

## 4. iOS-specific requirements (the strict ones)

### 4a. Apple IAP replaces Paddle on iOS
Apple guideline 3.1.1 forbids external payment for digital subscriptions inside iOS apps. Paddle checkout **must be hidden on iOS** and replaced with StoreKit.

Install and wire:
```bash
npm install @revenuecat/purchases-capacitor
```

Then in `src/routes/plans.tsx`, gate the pricing UI:
```ts
import { Capacitor } from '@capacitor/core';
const isIos = Capacitor.getPlatform() === 'ios';
// if (isIos) render StoreKit UI via RevenueCat, else render Paddle checkout
```

Create your products in App Store Connect → In-App Purchases with the same IDs as your Paddle catalog (`starter_monthly`, `pro_monthly`, `pro_max_monthly`). Link them in RevenueCat.

### 4b. Sign in with Apple parity
You already enabled SIWA. Confirm the auth screen shows Apple **and** Google side by side — Apple 4.8 requires equal prominence when Google is offered.

### 4c. Push notifications
```bash
# In Xcode:
# 1. Open ios/App/App.xcworkspace
# 2. Signing & Capabilities → + Capability → Push Notifications
# 3. Signing & Capabilities → + Capability → Background Modes → Remote notifications
```

APNs auth key: Apple Developer → Keys → Create new APNs key. Upload the .p8 to your push provider (OneSignal / Firebase / your Supabase edge).

### 4d. Info.plist strings
Open `ios/App/App/Info.plist` and add usage strings for every permission you touch:
```xml
<key>NSCameraUsageDescription</key>
<string>Family COO uses the camera to capture receipts, forms, and screenshots for OCR.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Family COO uses the microphone for voice capture of family notes.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Family COO reads selected photos to import screenshots into your inbox.</string>
<key>NSUserTrackingUsageDescription</key>
<string>Only used for analytics if you opt in. You can decline.</string>
```

### 4e. Build and archive
```bash
npm run build && npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive → Distribute App → App Store Connect
```

---

## 5. Android-specific requirements

### 5a. Google Play Billing (only if you also want subscriptions on Android)
Paddle is allowed on Android, but if you want in-app purchase, use `@revenuecat/purchases-capacitor` the same way.

### 5b. AndroidManifest.xml permissions
Only include what you use. Open `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 5c. Build the release AAB
```bash
npm run build && npx cap sync android
npx cap open android
# Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle
```

Create a **release keystore** and store it safely — losing it locks you out of future updates.

---

## 6. Store listing content

See `STORE_LISTING.md` for the exact copy: app name, subtitle, description, keywords, category, screenshots requirements.

---

## 7. Privacy & compliance final pass

- [ ] `/privacy-policy` route reflects real data collection: email (auth), household data (Cloud DB), AI prompt content (Lovable AI Gateway → Google/OpenAI), Paddle payment metadata.
- [ ] `/terms` reflects the actual subscription tiers you offer on each store.
- [ ] Delete Account button (already present in Settings) — **verify it works end-to-end before submitting**.
- [ ] Data Safety form in Play Console + App Privacy nutrition label in App Store Connect must match the privacy policy exactly. Apple audits mismatches.

---

## 8. Testing before submission

- **iOS**: TestFlight internal testing → invite 5 people → run the flows for 3 days minimum.
- **Android**: Play Console → Internal testing track → same drill.

Common rejection reasons to pre-check:
1. Broken links in the app (Terms, Privacy).
2. Blank screens on first open (make sure auth flow works with no cached session).
3. Payment gating that doesn't gracefully fall back on iOS (Guideline 3.1.1).
4. Placeholder / lorem ipsum text (Guideline 2.3.7).

---

## 9. Submission

- **App Store**: App Store Connect → My Apps → + → New App → fill listing → submit for review.
- **Play Console**: Create app → set up → production → create release → upload AAB → roll out.

---

## Support & rollback

- Web app deploys are instant and don't require app store re-review.
- Any change that touches native code (Capacitor plugins, Info.plist, permissions) **does** require a new store submission.
- Because `capacitor.config.ts` sets `server.url`, most feature changes ship as web deploys — the app store binary is a thin wrapper.
