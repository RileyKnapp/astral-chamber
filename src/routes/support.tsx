import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support - Astral Chamber" },
      {
        name: "description",
        content:
          "Astral Chamber support information for purchases, restores, privacy, safety, and contact.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 pb-32 pt-16 font-mono text-[#cfe7ff]">
      <h1 className="font-serif text-4xl text-white">Support</h1>
      <p className="mt-2 text-[11px] tracking-[0.3em] text-[#7fa9c8]">ASTRAL CHAMBER</p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-[#cfe7ff]/85">
        <p>
          Astral Chamber is a binaural meditation and relaxation app for focused listening,
          journaling, and inner exploration. If something is not working as expected, contact us and
          we will help.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Contact</h2>
        <p>
          Email{" "}
          <a className="text-[#c0b0f0] underline" href="mailto:hello@astralchamber.com">
            hello@astralchamber.com
          </a>{" "}
          with a short description of the issue, your device model, iOS version, and the app version
          shown in Settings.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Purchases and Restores</h2>
        <p>
          Premium Chamber access is handled by Apple as a one-time in-app purchase. If you already
          purchased access, open Settings in the app and tap Restore Purchases. Make sure you are
          signed in with the same Apple Account used for the original purchase.
        </p>
        <p>
          Apple handles payment, taxes, refunds, and purchase history. For refund requests, use
          Apple&apos;s reportaproblem.apple.com purchase support flow.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Privacy and Local Data</h2>
        <p>
          Journal entries, listening settings, onboarding choices, and backups are stored locally on
          your device. We cannot view or recover journal entries or encrypted backup passwords.
          Reset All Data in Settings removes local app data from the device.
        </p>
        <p>
          To keep a copy of your Dream Lab journal, open Settings and use Dream Lab Data to export
          your entries. Exports stay on your device unless you choose where to save or share them,
          so keep exported journal files somewhere private. You can also delete journal entries
          there without removing purchase access or other app settings.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Listening Safety</h2>
        <p>
          Use Astral Chamber while seated or lying down somewhere safe. Do not use audio sessions
          while driving, operating machinery, or in any situation that requires attention. If you
          have epilepsy, a seizure disorder, photosensitivity, or another medical concern, consult a
          qualified professional before using brainwave entrainment or pulsing visuals.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Legal</h2>
        <p>
          Review the{" "}
          <a className="text-[#c0b0f0] underline" href="/privacy">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a className="text-[#c0b0f0] underline" href="/terms">
            Terms of Use
          </a>
          .
        </p>
      </section>
    </main>
  );
}
