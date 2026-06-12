import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Astral Chamber" },
      {
        name: "description",
        content:
          "Astral Chamber privacy policy describing local journal storage, purchases, support communications, and your privacy choices.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 pb-32 pt-16 font-mono text-[#cfe7ff]">
      <h1 className="font-serif text-4xl text-white">Privacy Policy</h1>
      <p className="mt-2 text-[11px] tracking-[0.3em] text-[#7fa9c8]">EFFECTIVE · JUNE 12, 2026</p>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-[#cfe7ff]/85">
        <p>
          This Privacy Policy explains how Astral Chamber (&quot;Astral Chamber,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles information when you use the
          Astral Chamber mobile application or website (the &quot;App&quot;). We designed the App so
          that sensitive journal content and listening activity remain under your control.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Information stored on your device</h2>
        <p>
          The App stores your journal entries, journal dates, titles, moods, lucid-dream indicators,
          settings, onboarding choices, and access status locally on your device. On supported
          native devices, journal entries are stored in the App&apos;s local database. The App does
          not send this content to us, and we cannot view or recover it.
        </p>
        <p>
          Binaural tones, isochronic pulses, and ambient mixes are generated on your device. We do
          not receive recordings from your microphone or recordings of your listening sessions.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Backups and sharing you initiate</h2>
        <p>
          If you export a journal backup, the App creates a password-encrypted backup file on your
          device. The password is not sent to us and cannot be recovered by us. You control where
          the file is saved or shared. Anyone with both the file and its password may be able to
          read its contents, so keep both secure.
        </p>
        <p>
          If you use a sharing feature, the App opens your device&apos;s sharing tools or copies the
          selected message to your clipboard. The recipient, sharing service, operating-system
          provider, or other app you choose may process that information under its own privacy
          policy. The App does not automatically share journal-entry text.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Purchases</h2>
        <p>
          Purchases are processed by the applicable app store, such as Apple App Store or Google
          Play. We do not receive your full payment-card details. We may use RevenueCat to manage
          purchases, restore access, and understand purchase performance. The app store and
          RevenueCat may process purchase receipts or tokens, product and transaction information,
          an app-specific customer identifier, device type, operating system, country or region, and
          the last time the App contacted the purchase service.
        </p>
        <p>
          Purchase providers process information under their own terms and privacy policies. We use
          purchase information only to provide and maintain paid access, restore purchases, prevent
          fraud, provide support, and understand aggregate purchase performance. We do not use it
          for third-party advertising.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Support communications</h2>
        <p>
          If you contact us by email, we receive your email address and the information you choose
          to include. Please do not include journal entries or other sensitive information unless it
          is necessary for your request. We use support communications to respond, troubleshoot,
          protect the App, and comply with legal obligations.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Website and technical information</h2>
        <p>
          When you visit a publicly hosted Astral Chamber webpage, the hosting provider may
          automatically process limited technical information needed to deliver and secure the site,
          such as your IP address, browser or device type, request time, and requested page. The App
          does not use third-party advertising trackers or sell information for targeted
          advertising.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">How information is disclosed</h2>
        <p>
          We may disclose limited information to service providers that operate purchases, hosting,
          email, or support services on our behalf; when you direct us or initiate sharing; to
          comply with law or protect rights and safety; or as part of a merger, acquisition,
          financing, or sale of assets. Service providers may use information only to provide their
          services or as permitted by their own terms and applicable law. We do not sell personal
          information or share it for cross-context behavioral advertising.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Retention and deletion</h2>
        <p>
          Local App data remains on your device until you delete it, reset App data, clear storage,
          or uninstall the App. Exported backups remain wherever you save them until you delete
          them. Resetting or uninstalling may permanently delete local data, and we cannot recover
          it.
        </p>
        <p>
          App stores and purchase providers retain transaction records according to their legal,
          fraud-prevention, accounting, and operational requirements. We retain support
          communications only as long as reasonably needed to respond, maintain business records,
          resolve disputes, enforce agreements, and comply with law.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational safeguards appropriate to
          the information we handle. Journal backups are encrypted using a password you choose. No
          storage or transmission method is completely secure, and we cannot guarantee absolute
          security. Protect your device, backup files, and backup passwords.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Your choices and rights</h2>
        <p>
          You can review and delete journal entries in the App and use Reset All Data to delete
          local App data. You can manage or restore purchases through the applicable app store.
          Depending on where you live, you may have rights regarding personal information we
          control, including rights to access, correct, delete, or obtain a copy of it. Contact us
          to make a request. We may need to verify your request, and some information may be exempt
          from deletion where retention is required by law.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Children</h2>
        <p>
          The App is not directed to children under 13, and we do not knowingly collect personal
          information from children under 13. If you believe a child has provided personal
          information to us, contact us so we can address it.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">International processing</h2>
        <p>
          Purchase, hosting, and support providers may process information in countries other than
          your own. Where required, those providers and we use appropriate safeguards for
          international transfers.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy as the App, its service providers, or legal requirements
          change. We will update the effective date above and provide additional notice when
          required by law. Your continued use of the App after an update is subject to the updated
          policy.
        </p>

        <h2 className="mt-6 font-serif text-xl text-white">Contact</h2>
        <p>
          For privacy questions or requests, contact Astral Chamber at{" "}
          <a className="text-[#c0b0f0] underline" href="mailto:support@astralchamber.app">
            support@astralchamber.app
          </a>
          .
        </p>
      </section>
    </main>
  );
}
