# Shipping Astral Chamber to the iOS App Store

You picked the fastest path: wrap the existing web app in **Capacitor** and submit it as a paid download. Here's the full roadmap, in order.

---

## Reality check first (read this before anything else)

Two things Apple requires that you don't yet have:

1. **A Mac.** Apple's submission tool (Xcode) only runs on macOS. There is no legitimate workaround. Options:
   - Buy/borrow a Mac (Mac mini M2 ~$599 is the cheapest new option).
   - Rent a cloud Mac (MacInCloud, MacStadium — ~$30/mo).
   - Use a service like **Codemagic** or **Ionic Appflow** to build the `.ipa` in the cloud, but you'll still need a Mac at some point for signing certs, TestFlight uploads, and dealing with rejections. Not recommended for a first submission.
2. **Apple Developer Program membership** — $99/year, requires a 1–3 day identity verification.

Realistic timeline for a first-ever submission: **2–4 weeks**, mostly waiting on Apple (account approval + App Review, which takes 1–7 days and often requires 1–2 rejection cycles).

---

## The steps

### Phase 1 — Prep the web app (1–2 days)
1. **Audit what breaks on mobile Safari/WebView**: audio autoplay rules, `localStorage` persistence in a WKWebView, viewport `env(safe-area-inset-*)` (already used in `BottomNav`), tap target sizes.
2. **Lock the design to mobile-only** for the wrap — the current 390px viewport is already the target, good.
3. **Remove the demo paywall in `Onboarding.tsx`** (the "$4.99 once" screen). Apple **will reject** any app that takes payment outside their In-App Purchase system. For a paid download model, the price is set in App Store Connect, not in-app — so the unlock screen needs to go.
4. **Add a real privacy policy URL** (Apple requires one). Can be a single static page.
5. **Test offline behavior** — if the app shows a broken state with no network, Apple may reject. Audio generation looks client-side, so likely fine.

### Phase 2 — Wrap with Capacitor (1 day)
1. Install Capacitor: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`.
2. Add a `capacitor.config.ts` pointing to the built web assets.
3. Build the web app and run `npx cap add ios` → generates an `ios/` Xcode project.
4. Configure app metadata: bundle ID (e.g. `com.yourname.astralchamber`), display name, version.
5. Add native plugins as needed: `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/preferences` (replaces localStorage for reliability).
6. Generate app icons + splash screens (1024×1024 master → all required sizes via `@capacitor/assets`).

### Phase 3 — Apple account setup (parallel, 1–3 days)
1. Enroll in the **Apple Developer Program** ($99/yr) at developer.apple.com.
2. Wait for identity verification.
3. In **App Store Connect**, create the app record: name, bundle ID, primary category (Health & Fitness or Lifestyle), price tier.

### Phase 4 — Build, sign, and test (2–4 days, needs Mac)
1. Open `ios/App/App.xcworkspace` in Xcode.
2. Set signing team, provisioning profile (automatic signing works for most cases).
3. Run on iOS Simulator, then on a physical device (binaural beats **must** be tested on a real device with headphones — simulators don't render audio reliably).
4. Fix anything that breaks: audio context resume on tap, status bar overlap, back-gesture conflicts.
5. Upload a build to **TestFlight** for internal testing.

### Phase 5 — App Store submission (1–2 days work, then 1–7 days waiting)
1. Prepare **screenshots** (6.7" and 6.5" iPhone sizes minimum — can be generated from the simulator).
2. Write **app description, keywords, support URL, privacy policy URL**.
3. Fill out **App Privacy** questionnaire (what data you collect — looks like very little, which is great).
4. Submit for review.
5. Expect **at least one rejection** on the first submission. Most common reasons for an app like this:
   - Medical claims about "healing" or "consciousness" → soften language to "relaxation" / "meditation aid".
   - Missing disclaimer that binaural beats are not medical treatment (you already have this in onboarding — good).
   - Demo/placeholder content (the fake $4.99 unlock screen will get flagged).

### Phase 6 — Launch
1. Set release to "manual" so you control the go-live moment.
2. After approval, release. Live on the App Store within hours.

---

## Things to decide before I start

- **Bundle ID** (reverse-DNS, e.g. `com.tylername.astralchamber`) — permanent, can't change later.
- **App name** on the store — "Astral Chamber" if available, else a variant.
- **Price** ($2.99, $4.99, $9.99…).
- **Whether to keep the fake email/password onboarding** — for a paid download with no backend accounts, you can remove auth entirely and just persist locally. Simpler, fewer rejection risks, no Lovable Cloud needed.

---

## What I can do for you in build mode

When you approve and switch to build mode, I can do **Phase 1 + Phase 2** entirely in this project:
- Strip the fake paywall and auth from onboarding.
- Add a privacy policy route.
- Soften any medical-sounding copy.
- Install and configure Capacitor, add the iOS platform, set up icons/splash.
- Wire `@capacitor/preferences` for reliable persistence inside the WebView.
- Hand you a ready-to-open Xcode project.

**What I cannot do for you:** anything that requires a Mac (Xcode signing, simulator testing, TestFlight upload, App Store submission). That part is on you.

## Suggested next step

Tell me:
1. Do you want me to start Phase 1 + 2 now (strip paywall, add Capacitor)?
2. Bundle ID + final app name?
3. Are you going to get a Mac, or do you want me to also set up a Codemagic config for cloud builds?