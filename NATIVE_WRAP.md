# Native Wrap — Family COO

Capacitor wraps the published web app in native iOS and Android shells. All steps below run on **your Mac** (Xcode required for iOS). The Lovable sandbox cannot run `cap add ios` — it needs macOS + Xcode.

## Prereqs

- macOS 14+ with Xcode 15+ (for iOS)
- Android Studio Hedgehog+ (for Android)
- Node 20+ / bun
- Apple Developer account ($99/yr)
- Google Play Console account ($25 one-time)

## One-time setup

```bash
bun add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
bun add @capacitor/browser @capacitor/splash-screen @capacitor/status-bar
bun add @revenuecat/purchases-capacitor

npx cap init "Family COO" app.lovable.familycoo --web-dir=dist
npx cap add ios
npx cap add android
```

`capacitor.config.ts` is already committed at the project root.

## Build + sync loop

```bash
bun run build           # produces dist/
npx cap sync            # copies web assets into ios/ and android/
npx cap open ios        # opens Xcode
npx cap open android    # opens Android Studio
```

Add these scripts to `package.json` locally:

```json
"cap:sync": "bun run build && npx cap sync",
"cap:ios":  "bun run build && npx cap sync ios && npx cap open ios",
"cap:android": "bun run build && npx cap sync android && npx cap open android"
```

## Icons & splash

Place a 1024×1024 icon at `resources/icon.png` and a 2732×2732 splash at `resources/splash.png`, then:

```bash
bun add -d @capacitor/assets
npx capacitor-assets generate
```

The source icon is already at `public/app-icon.png` — copy it to `resources/icon.png` locally.

## RevenueCat setup

See `REVENUECAT_SETUP.md` for keys, entitlements, and webhook configuration.

## Signing & submission

- iOS: Xcode → Signing & Capabilities → your team → Archive → Distribute via App Store Connect.
- Android: Android Studio → Build → Generate Signed Bundle → upload `.aab` to Play Console.

Store listing copy, screenshots, and asset paths: see `STORE_LISTING.md`.
