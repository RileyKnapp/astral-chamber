import { useState } from "react";
import { useAppState } from "@/lib/app-state";

export function SettingsButton({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const { hasPremiumAccess, resetData } = useAppState();

  const updateOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      <button
        aria-label="Settings"
        onClick={() => updateOpen(true)}
        className="fixed right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#c0b0f0]/40 bg-[#02050d]/80 text-[#c0b0f0] backdrop-blur-md transition hover:border-[#c0b0f0]"
        style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.17 16.93l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 4.17l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => updateOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[#c0b0f0]/30 bg-[#070411] p-6 font-mono text-[#cfe7ff] sm:rounded-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-white">Settings</h2>
              <button
                onClick={() => updateOpen(false)}
                className="text-[10px] tracking-[0.3em] text-[#7fa9c8]"
              >
                CLOSE
              </button>
            </div>

            <div className="mt-5 rounded-sm border border-[#c0b0f0]/30 p-3 text-[11px] leading-relaxed text-[#c0b0f0]">
              ◆ Binaural chamber access is free. Audio stays on your device.
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-sm border border-white/15 p-3">
                <div className="text-[10px] tracking-[0.3em] text-[#7fa9c8]">ACCESS</div>
                <div className="mt-2 text-sm text-white">
                  {hasPremiumAccess ? "Premium Chamber" : "Free Chamber"}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    window.location.hash = "/privacy";
                    updateOpen(false);
                  }}
                  className="w-full rounded-sm border border-white/15 py-2 text-[10px] tracking-[0.3em] text-[#cfe7ff]"
                >
                  PRIVACY
                </button>
                <button
                  onClick={() => {
                    window.location.href = "mailto:support@astralchamber.app";
                  }}
                  className="w-full rounded-sm border border-white/15 py-2 text-[10px] tracking-[0.3em] text-[#cfe7ff]"
                >
                  SUPPORT
                </button>
                <button
                  onClick={() => {
                    if (confirm("Reset journal entries, settings, and onboarding?")) {
                      resetData();
                      updateOpen(false);
                    }
                  }}
                  className="w-full rounded-sm border border-[#e8a8d4]/50 py-2 text-[10px] tracking-[0.3em] text-[#e8a8d4]"
                >
                  ◇ RESET ALL DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
