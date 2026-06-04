import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Astral Chamber" },
      {
        name: "description",
        content:
          "Astral Chamber privacy policy. We don't collect personal data. All session data stays on your device.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 pb-32 pt-16 font-mono text-[#cfe7ff]">
      <h1 className="font-serif text-4xl text-white">Privacy Policy</h1>
      <p className="mt-2 text-[11px] tracking-[0.3em] text-[#7fa9c8]">
        LAST UPDATED · JUNE 2026
      </p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-[#cfe7ff]/85">
        <h2 className="font-serif text-xl text-white">What we collect</h2>
        <p>
          Nothing. Astral Chamber does not collect, transmit, or store any
          personal information on remote servers. We do not use analytics,
          tracking pixels, advertising identifiers, or third-party SDKs that
          profile you.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">What stays on your device</h2>
        <p>
          Your settings, journal entries, and session history are stored
          locally on your device using browser storage (or, on iOS, the
          equivalent native preferences). This data never leaves your device.
          If you uninstall the app or clear its data, this information is
          permanently deleted.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Audio generation</h2>
        <p>
          All binaural tones, isochronic pulses, and ambient mixes are
          generated on your device in real time. No audio is streamed or
          downloaded from a server.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Children</h2>
        <p>
          This app is not directed at children under 13 and does not knowingly
          collect any data from them.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Health disclaimer</h2>
        <p>
          Astral Chamber is a relaxation and meditation aid, not a medical
          device. It is not intended to diagnose, treat, cure, or prevent any
          condition. If you have epilepsy, a seizure disorder, or
          photosensitivity, consult a doctor before using brainwave
          entrainment or pulsing visuals. Do not use binaural or isochronic
          sessions while driving or operating machinery.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Changes</h2>
        <p>
          If this policy changes, the "Last Updated" date above will change
          and a notice will appear in the app on the next launch.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Contact</h2>
        <p>
          Questions? Reach out at{" "}
          <a className="text-[#c0b0f0] underline" href="mailto:support@astralchamber.app">
            support@astralchamber.app
          </a>
          .
        </p>
      </section>
    </main>
  );
}
