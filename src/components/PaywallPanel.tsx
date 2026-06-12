import { useAppState, type Intention } from "@/lib/app-state";

const OUTCOMES: Record<Intention, string> = {
  sleep: "deeper, uninterrupted rest",
  meditate: "a steadier meditation practice",
  lucid: "a lucid-dream practice",
  astral: "intentional astral exploration",
};

export function PaywallPanel({
  intention,
  onDismiss,
  compact = false,
}: {
  intention?: Intention | null;
  onDismiss?: () => void;
  compact?: boolean;
}) {
  const { unlockDemoPremium } = useAppState();
  const outcome = intention ? OUTCOMES[intention] : "your inner horizon";

  return (
    <div
      className={`w-full max-w-md ${compact ? "" : "rounded-sm border border-[#c0b0f0]/35 bg-black/25 p-6"}`}
    >
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#c0b0f0]/50 bg-[#c0b0f0]/10 text-2xl text-[#d8ccff] shadow-[0_0_45px_rgba(192,176,240,0.2)]">
          ✦
        </div>
        <div className="mt-5 text-[9px] font-bold tracking-[0.38em] text-[#8ab8f0]">
          PREMIUM CHAMBER
        </div>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
          Continue toward
          <br />
          <span className="text-[#c0b0f0]">{outcome}.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-[#cfe7ff]/70">
          Unlock every guided journey, the full frequency chamber, ambient soundscapes, sleep
          timers, technique guides, and your private Dream Lab with one purchase.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          ["12+", "JOURNEYS"],
          ["∞", "SESSIONS"],
          ["100%", "PRIVATE"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-sm border border-white/10 bg-white/[0.025] px-2 py-3">
            <div className="font-serif text-xl text-white">{value}</div>
            <div className="mt-1 text-[7px] tracking-[0.2em] text-[#8ab8f0]">{label}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={unlockDemoPremium}
        className="mt-6 w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[10px] font-bold tracking-[0.28em] text-[#080610] shadow-[0_0_35px_rgba(192,176,240,0.24)] transition hover:scale-[1.01]"
      >
        UNLOCK LIFETIME ACCESS · $7.99
      </button>
      <p className="mt-2 text-center text-[8px] tracking-[0.12em] text-white/35">
        ONE-TIME PURCHASE · NO SUBSCRIPTION
      </p>
      <button
        type="button"
        onClick={unlockDemoPremium}
        className="mt-4 w-full text-center text-[9px] tracking-[0.22em] text-[#8ab8f0]"
      >
        RESTORE PURCHASES
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full text-center text-[9px] tracking-[0.22em] text-white/35 transition hover:text-white/60"
        >
          NOT NOW
        </button>
      )}
    </div>
  );
}
