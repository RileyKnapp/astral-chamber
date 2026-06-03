import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Threshold" }] }),
  component: SettingsPage,
});

const KEY = "threshold.settings";

type Settings = {
  nightMode: boolean;
  defaultCarrier: number;
};

function load(): Settings {
  try {
    return (
      JSON.parse(localStorage.getItem(KEY) || "null") || {
        nightMode: false,
        defaultCarrier: 200,
      }
    );
  } catch {
    return { nightMode: false, defaultCarrier: 200 };
  }
}

function SettingsPage() {
  const [s, setS] = useState<Settings>(load());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s));
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("night-mode", s.nightMode);
    }
  }, [s]);

  return (
    <div className="px-6 pt-10">
      <h1 className="text-2xl font-extralight tracking-wide text-white">
        Settings
      </h1>

      <section className="mt-8 space-y-4">
        <Row
          label="Night mode"
          help="Dim the entire app to near-black for bedtime."
        >
          <input
            type="checkbox"
            checked={s.nightMode}
            onChange={(e) => setS({ ...s, nightMode: e.target.checked })}
            className="h-5 w-5 accent-violet-400"
          />
        </Row>

        <Row
          label="Default carrier"
          help="The base tone in Hz. Lower carriers feel deeper."
        >
          <input
            type="number"
            min={80}
            max={500}
            value={s.defaultCarrier}
            onChange={(e) =>
              setS({ ...s, defaultCarrier: parseInt(e.target.value || "200") })
            }
            className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:outline-none"
          />
        </Row>
      </section>

      <section className="mt-10 rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-xs leading-relaxed text-amber-100/70">
        <p className="font-medium text-amber-100">Background audio note</p>
        <p className="mt-1">
          Browsers may pause audio when your phone screen locks. For an
          uninterrupted sleep session, install Threshold to your home screen —
          and a native build (Capacitor) will support true background playback.
        </p>
      </section>

      <section className="mt-8 text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
        Threshold · v0.1
      </section>

      <button
        onClick={() => {
          if (confirm("Clear all journal entries, favorites, and settings?")) {
            localStorage.clear();
            location.reload();
          }
        }}
        className="mx-auto mt-6 block text-xs text-white/40 underline"
      >
        Reset all data
      </button>
    </div>
  );
}

function Row({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-white">{label}</div>
        {help && <div className="mt-1 text-xs text-white/45">{help}</div>}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
