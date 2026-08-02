# Astral Chamber App Store / TestFlight Handoff

Last updated: August 2, 2026

This file summarizes the App Store Connect, TestFlight, in-app purchase, and code-release prep work completed for **Binaural: Astral Chamber** so a new Codex chat can continue without needing the full prior thread.

## App Identity

- App name in App Store Connect: **Binaural: Astral Chamber**
- Developer account/company: **Amazing Apps Limited Liability Company**
- Bundle ID: `com.astralchamber.app`
- SKU: `astral-chamber-ios`
- Apple ID shown in App Store Connect: `6795283007`
- Bundle ID/App ID exists in Apple Developer Certificates, Identifiers & Profiles.
- Xcode signing team is set to **Amazing Apps Limited Liability Company**.
- App is free to download with a paid non-consumable in-app purchase.

## Developer / Business Status

Completed:

- Apple Developer Program accepted.
- Paid Apps Agreement signed and active.
- Bank account active.
- U.S. Form W-9 active.
- Digital Services Act compliance active.
- Free Apps Agreement active.

Important: User does **not** want the app to go live accidentally. App Store version release was set to **Manual Release**.

## Certificates / Signing / Provisioning

Completed:

- App ID created for `com.astralchamber.app`.
- Apple Distribution certificate created and installed in Keychain.
- Xcode recognizes Amazing Apps LLC team.
- Device was registered when prompted by Xcode.
- App builds and uploads successfully through Xcode Organizer.
- Automatic signing is enabled in Xcode.

Current Xcode state:

- Target: `App`
- Bundle identifier: `com.astralchamber.app`
- Marketing version: `1.0`
- Latest build number prepared: `6`

Relevant file:

- `/Users/riley/Codex Projects/Astral Chamber/astral-chamber/ios/App/App.xcodeproj/project.pbxproj`

## Builds / TestFlight

Uploaded builds:

- Build 1 uploaded and processed.
- Later builds uploaded during fixes/testing.
- Build 5 successfully showed the real TestFlight purchase sheet and allowed a test purchase.
- Build 6 was prepared/uploaded after removing a temporary diagnostic popup.

Build 6 code cleanup:

- Removed temporary diagnostic popup text like `Paywall button tap received...`
- Removed temporary Apple purchase error diagnostic alert.
- Kept real purchase flow intact.
- Verified the app still builds and Capacitor sync succeeds.

Relevant file changed:

- `/Users/riley/Codex Projects/Astral Chamber/astral-chamber/src/lib/app-state.tsx`

Verification already done:

- `npm run build:ios:web` succeeded.
- `npx cap sync ios` succeeded.
- Search confirmed the diagnostic popup strings are gone.

## TestFlight / IAP Testing Notes

The purchase button originally did nothing because the paid apps/IAP setup was not fully active yet. After the Paid Apps Agreement and App Store Connect IAP setup were complete, the Apple purchase sheet appeared.

Observed successful purchase sheet:

- Header: TestFlight
- Product: Lifetime Access
- App: Binaural: Astral Chamber
- Price: $7.99
- Message: testing purposes only, not charged
- Confirmation: side button double-click

Result:

- Purchase succeeded.
- User entered the app after purchase.
- Deleting and reinstalling did **not** show the paywall again, which is expected because the non-consumable entitlement persisted for that Apple account.

Important testing nuance:

- TestFlight purchases are sandbox/test purchases and should not charge the user.
- If testing with the normal Apple ID, there is no simple App Store Connect button to clear that normal Apple ID's purchase history for this app.
- For repeat clean purchase tests, use a **Sandbox Tester** account.

Sandbox tester currently created:

- `riley@stemport.co`
- Name shown: Riley Test1
- Country: United States

To cleanly retest purchases:

1. In App Store Connect, go to **Users and Access > Sandbox > Test Accounts**.
2. Select the sandbox tester.
3. Use **Clear Purchase History**.
4. On the iPhone, delete the TestFlight app.
5. Sign out of normal Media & Purchases if needed.
6. Sign into the sandbox account under **Settings > Developer > Sandbox Apple Account** if available, or sign in when the purchase sheet prompts.
7. Reinstall Build 6 from TestFlight.
8. Tap **Unlock Lifetime Access**.
9. Expected: no diagnostic popup, Apple purchase sheet appears, and purchase succeeds.

Simulator note:

- Xcode Simulator can test basic paywall behavior and local StoreKit flows, but it is not the same as final TestFlight testing on a real device.
- Final proof should be on a real iPhone via TestFlight.

## In-App Purchase

Created:

- Type: Non-Consumable
- Reference Name: `Lifetime Access`
- Product ID: `lifetime_access`
- Price: `$7.99`
- Availability: all countries/regions
- Family Sharing: not turned on, unless changed later
- Localization:
  - Display Name: `Lifetime Access`
  - Description: `Unlock all journeys and premium chamber features.`
- Review screenshot uploaded and accepted after resizing/fixing dimensions.
- IAP was added to draft review/submission.

Important:

- The first non-consumable IAP must be submitted with a new app version.
- The IAP and app version should be reviewed together.

## App Store Listing

Screenshots:

- 8 screenshots uploaded successfully to the iPhone 6.5 display section.
- They came from:
  `/Users/riley/Codex Projects/Astral Chamber/astral-chamber/app-store-assets/iphone-6.9`
- Do **not** use the `high-quality-real-screens` folder; those were old.
- Screenshots were resized/cropped to accepted App Store dimensions.

Uploaded screenshot set included files similar to:

- `01-custom-chamber.png`
- `02-journey-through-states.png`
- `03-evolving-journeys.png`
- `04-live-frequency.png`
- `06-private-dream-lab.png`
- `07-no-music.png`
- `08-ambient-mixes.png`
- `09-gateway-inspired.png`

Promotional text entered:

```text
Explore binaural journeys for meditation, lucid dreaming, UAP contact, astral practice, remote viewing, and focused inner exploration.
```

Description:

- User preferred a longer mystical/SEO-forward description.
- The first pasted version was too long by 858 characters.
- A shortened version was accepted.
- The description included concepts like binaural journeys, astral projection, out-of-body experiences, UAP/UFO contact, remote viewing, psionics, paranormal phenomena, Gateway-style meditation, and inner exploration.

Keywords entered:

```text
binaural beats,astral projection,obe,ufo,uap,remote viewing,psionics,theta,gateway,paranormal,lucid
```

URLs:

- Support URL: `https://astralchamber.com/support`
- Marketing URL: `https://astralchamber.com`
- Privacy Policy URL: `https://astralchamber.com/privacy`

Copyright:

```text
2026 Amazing Apps Limited Liability Company
```

App Review notes entered:

```text
Astral Chamber does not require account sign-in. The app offers a one-time non-consumable in-app purchase called Lifetime Access. Please use the visible purchase and restore buttons on the paywall to review the in-app purchase flow. Journal data and app settings are stored on-device.
```

Sign-in required:

- Unchecked, because the app has no account login.

## App Privacy

Completed:

- App Privacy set to **Data Not Collected**.
- Privacy policy URL set to `https://astralchamber.com/privacy`.
- Published privacy disclosure.

Current understanding:

- No tracking.
- No analytics declared.
- Journal/audio/settings stay on-device.
- Purchases handled by Apple.

If analytics, crash reporting, accounts, server sync, or other third-party SDKs are added later, App Privacy must be updated.

## Ratings / Safety / Accessibility

Age rating:

- Completed.
- Result shown around 9+ in most countries, with regional variants.
- Not marked as Made for Kids.
- No age suitability URL provided.

Medical / wellness:

- App is positioned as meditation/audio/consciousness exploration.
- It should **not** claim to diagnose, treat, prevent, monitor, or manage medical conditions.
- Regulated Medical Device declaration was answered **No**.

Accessibility:

- User selected that the app does not support the listed accessibility features.
- Draft accessibility info saved.
- Publish button was disabled because accessibility info can only be published for released app versions.

## App Information

Categories:

- Primary: `Health & Fitness`
- Secondary: `Lifestyle`

Music category was discussed but not chosen because the app is more meditation/binaural practice than a general music/audio entertainment app.

Content Rights:

- User completed the modal.
- Guidance was: choose “No third-party content” only if all app content/audio/assets are owned or properly licensed and the app does not show/access third-party content.

Encryption:

- No custom encryption documentation has been uploaded.
- Likely no export documentation needed unless the app uses custom/proprietary encryption or non-standard encryption.
- If only using Apple platform networking/security or no custom encryption, do not upload documentation.
- If needed later, add the appropriate `App Uses Non-Exempt Encryption` answer/key before submission.

Availability:

- App price: `$0.00`
- IAP price: `$7.99`
- App availability: all selected countries/regions available on app release.
- Apple Silicon Mac availability was unchecked.
- Apple Vision Pro availability was unchecked.
- Distribution method: public/discoverable on the App Store.

## Current Situation / Where We Left Off

Most App Store Connect setup is complete.

The user asked about testing payments after getting Paid Apps Agreement/tax/banking active. Payment testing succeeded on TestFlight with a real Apple purchase sheet, but it was using the normal Apple ID shown on the device rather than the sandbox tester account. That is okay for proving the purchase flow works in TestFlight, but repeat clean testing is easier with a sandbox tester.

Build 6 was created to remove the temporary diagnostic popup. User was distributing Build 6 to App Store Connect.

Latest open question before handoff:

- User asked whether testing in Xcode Simulator would work the same.
- Guidance given: Simulator is useful for basic flow/local StoreKit testing, but final payment proof should be TestFlight on a real iPhone.

## Remaining To-Dos

Recommended next steps:

1. Confirm Build 6 is processed and available in TestFlight.
2. Install Build 6 on the real iPhone.
3. Verify the paywall CTA does **not** show the old diagnostic popup.
4. If the user needs a fresh purchase sheet:
   - Use sandbox tester `riley@stemport.co`.
   - Clear sandbox tester purchase history in App Store Connect.
   - Delete/reinstall the TestFlight app.
   - Sign into sandbox account when prompted or via iPhone Developer settings.
5. Verify restore purchase behavior still works.
6. Verify background audio, onboarding, premium locks, journal behavior, Dream Lab, chamber controls, and all main journeys.
7. In App Store Connect, confirm the app version and `Lifetime Access` IAP are both included in the same draft submission.
8. Do **not** submit or release accidentally until user confirms they are ready.
9. Before final submission, do one full pass through App Store Connect and resolve any banners/warnings:
   - Regulated Medical Device banner should be resolved.
   - App Privacy published.
   - App Accessibility saved.
   - Content Rights complete.
   - App pricing/availability saved.
   - IAP added for review.
   - App version added for review.
   - Manual release selected.
10. When user is ready, submit app + first IAP together for review.

## Important Caution For Review Copy

Apple can be sensitive around medical, health, consciousness, and paranormal claims. Keep the listing framed as meditation/audio/inner exploration. Avoid promising outcomes, diagnosis, treatment, guaranteed contact, guaranteed astral projection, or health effects.

Safe framing:

- “designed for”
- “intended to support”
- “tools for”
- “may help”
- “meditative / focused / receptive states”

Avoid:

- “will cause astral projection”
- “guarantees contact”
- “treats anxiety/insomnia”
- “changes brainwaves” as a guaranteed medical claim
- “medical” or “treatment” language

## Useful Paths

Project root:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber
```

Main app state / purchase logic:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber/src/lib/app-state.tsx
```

Xcode project build number:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber/ios/App/App.xcodeproj/project.pbxproj
```

App Store assets:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber/app-store-assets
```

Screenshot source folder:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber/app-store-assets/iphone-6.9
```

Old screenshots not to use:

```text
/Users/riley/Codex Projects/Astral Chamber/astral-chamber/app-store-assets/iphone-6.9/high-quality-real-screens
```

## Suggested First Message For New Codex Chat

Paste this into the new chat:

```text
I’m continuing App Store/TestFlight release prep for Binaural: Astral Chamber. Please read APP_STORE_RELEASE_HANDOFF.md in the repo first, then help me continue one step at a time. I want to keep the app on manual release and avoid accidentally pushing live. My next goal is to verify Build 6 in TestFlight, test the Lifetime Access IAP cleanly, and then finish any remaining App Store Connect submission checks.
```
