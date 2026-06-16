import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use - Astral Chamber" },
      {
        name: "description",
        content: "Astral Chamber terms of use and Apple standard EULA reference.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 pb-32 pt-16 font-mono text-[#cfe7ff]">
      <h1 className="font-serif text-4xl text-white">Terms of Use</h1>
      <p className="mt-2 text-[11px] tracking-[0.3em] text-[#7fa9c8]">EFFECTIVE · JUNE 16, 2026</p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-[#cfe7ff]/85">
        <p>
          These terms apply to your use of Astral Chamber. By using the app, you agree to
          Apple&apos;s Standard End User License Agreement for apps distributed through the App
          Store.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Purchases</h2>
        <p>
          Astral Chamber is free to download and offers a one-time in-app purchase for lifetime
          Premium Chamber access. Purchases are processed by Apple through the App Store. Apple
          handles payment, taxes, refunds, purchase history, and restoration according to its own
          terms.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Wellness Disclaimer</h2>
        <p>
          Astral Chamber is a relaxation and meditation aid. It is not medical advice and is not
          intended to diagnose, treat, cure, or prevent any condition. Do not use audio sessions
          while driving, operating machinery, or in any situation that requires attention. If you
          have epilepsy, a seizure disorder, photosensitivity, or another medical concern, consult a
          qualified professional before using brainwave entrainment or pulsing visuals.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Local Content</h2>
        <p>
          Journal entries, backups, settings, and other local content are your responsibility. Keep
          backup passwords secure. We cannot recover journal entries or encrypted backup passwords.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Contact</h2>
        <p>
          For support or legal questions, contact{" "}
          <a className="text-[#c0b0f0] underline" href="mailto:hello@astralchamber.com">
            hello@astralchamber.com
          </a>
          .
        </p>

        <p className="pt-4 text-xs text-[#7fa9c8]">
          Apple Standard EULA:{" "}
          <a
            className="text-[#c0b0f0] underline"
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          >
            apple.com/legal/internet-services/itunes/dev/stdeula
          </a>
        </p>
      </section>
    </main>
  );
}
