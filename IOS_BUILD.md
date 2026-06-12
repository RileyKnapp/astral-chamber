# Shipping Astral Chamber to the iOS App Store

This project is wrapped with **Capacitor**. The web app stays unchanged; Capacitor packages it into a native iOS shell you can submit to the App Store.

> Everything below requires a **Mac** with Xcode 15+ and an active **Apple Developer Program** membership ($99/yr). There is no way around either one.

## App identity (already configured)

- **Bundle ID:** `com.astralchamber.app`
- **Display name:** Astral Chamber
- Defined in `capacitor.config.ts`. The Bundle ID is **permanent** once submitted to App Store Connect — change it now in `capacitor.config.ts` if you want something different (e.g. `com.yourname.astralchamber`).

## One-time setup on your Mac

1. Install Xcode from the Mac App Store.
2. Install Node 22+ and Bun. Capacitor 8 will fail on older Node versions.
3. Install CocoaPods: `sudo gem install cocoapods` (or `brew install cocoapods`).
4. Clone this repo on your Mac and install deps: `bun install`.
5. Build the native web bundle: `bun run build:ios:web`.
   - Confirm the build wrote `dist/capacitor/index.html`. Capacitor's `webDir` points there in `capacitor.config.ts`.
6. Add the iOS platform (creates the `ios/` Xcode project):
   ```
   bunx cap add ios
   ```
7. Open Xcode:
   ```
   bunx cap open ios
   ```

## Every time you make code changes

```
bun run build:ios:web  # rebuild the native web bundle
bunx cap sync ios      # copy the new build into the iOS project
bunx cap open ios      # open Xcode to run/archive
```

## App icons & splash

1. Save a 1024×1024 PNG master icon to `resources/icon.png` and a 2732×2732 splash to `resources/splash.png`.
2. Generate all required sizes:
   ```
   bun add -D @capacitor/assets
   bunx capacitor-assets generate --ios
   ```

## Submitting to the App Store

1. In Xcode: select **Any iOS Device** as the target, then **Product → Archive**.
2. In the Organizer window, click **Distribute App → App Store Connect → Upload**.
3. In **App Store Connect** (appstoreconnect.apple.com):
   - Create the app (Bundle ID must match `com.astralchamber.app`).
   - Set the price (this is your "paid download" — Apple takes 30%, or 15% in the Small Business Program).
   - Upload screenshots (6.7" iPhone required; 6.5" recommended). Generate from the iOS Simulator with **File → New Screen Capture**.
   - Fill in: description, keywords, support URL, **privacy policy URL** (use `https://YOUR-DOMAIN/privacy` — the `/privacy` route is live in this app).
   - Complete the **App Privacy** questionnaire — you can answer "No, we do not collect data" since all storage is on-device.
4. Submit for review. Expect 1–7 days, and budget for **one rejection cycle**.

## Common rejection reasons for an app like this

- **Health/medical claims** — say "relaxation aid" or "meditation aid", never "treats", "cures", "heals", or "increases consciousness".
- **Missing disclaimer** — already covered in the onboarding screen and `/privacy` route.
- **Incomplete purchases** — wire Premium Chamber access and restore purchases through RevenueCat before submission.
- **In-app purchases routed outside Apple** — there are none. Don't add Stripe/Paddle/external payment links inside the app.

## If you don't have a Mac

- Rent one: MacInCloud or MacStadium (~$30/mo).
- **Codemagic** can build the `.ipa` in the cloud from this repo, but you'll still need a Mac (even briefly) for signing certificates and TestFlight uploads on a first submission. Buying a used Mac mini is usually less painful than fighting the cloud-only path.

## Useful native APIs (already installed)

- `@capacitor/preferences` — reliable on-device persistence inside the WebView (more durable than `localStorage`).
- `@capacitor/haptics` — taptic feedback on chamber controls.
- `@capacitor/status-bar` — dark status bar matching the chamber theme.
- `@capacitor/splash-screen` — splash with the chamber background color.

Wire any of these in later if you want a more native feel.
