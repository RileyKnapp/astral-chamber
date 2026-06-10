import { useState } from "react";
import { useAppState } from "@/lib/app-state";

export function Onboarding() {
  const { onboarding, setOnboarding } = useAppState();
  const [step, setStep] = useState(0);

  if (onboarding.completed) return null;

  const acceptDisclaimer = () => {
    setOnboarding({
      disclaimerAccepted: true,
      intention: null,
      completed: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto px-6 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <style>{`
        @keyframes ob-rise { 0% { opacity: 0; transform: translateY(14px); filter: blur(8px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes ob-ring { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes ob-pulse-l { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(-2px) scale(1.08); opacity: 1; } }
        @keyframes ob-pulse-r { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(2px) scale(1.08); opacity: 1; } }
        @keyframes ob-hum { 0%, 100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.15); } }
        @keyframes ob-wave { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -40; } }
        @keyframes ob-orbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes ob-breath { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.06); opacity: 0.85; } }
        @keyframes ob-star-drift { 0% { transform: translate3d(0, 8px, 0) scale(0.8); opacity: 0; } 35% { opacity: 0.8; } 100% { transform: translate3d(0, -55px, 0) scale(1.2); opacity: 0; } }
        @keyframes ob-glow { 0%, 100% { opacity: 0.35; transform: scale(0.92); } 50% { opacity: 0.75; transform: scale(1.08); } }
        .ob-stagger > * { opacity: 0; animation: ob-rise 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        .ob-stagger > *:nth-child(1) { animation-delay: 0.12s; }
        .ob-stagger > *:nth-child(2) { animation-delay: 0.3s; }
        .ob-stagger > *:nth-child(3) { animation-delay: 0.48s; }
        .ob-stagger > *:nth-child(4) { animation-delay: 0.66s; }
        .ob-stagger > *:nth-child(5) { animation-delay: 0.84s; }
      `}</style>

      {step < 2 && (
        <div
          className={`mx-auto flex max-w-md flex-col transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
            step === 0
              ? "min-h-screen justify-center pb-8 pt-8"
              : "min-h-0 justify-start pb-0 pt-[calc(env(safe-area-inset-top)+2rem)]"
          }`}
        >
          <AnimatedBrand compact={step === 1} />

          {step === 0 && (
            <div className="ob-stagger mt-14 text-center">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-sm border border-[#c0b0f0]/60 bg-[#c0b0f0]/10 py-4 text-[11px] font-bold tracking-[0.38em] text-[#d8ccff] shadow-[0_0_30px_rgba(192,176,240,0.12)] transition hover:bg-[#c0b0f0]/20"
              >
                ENTER
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="ob-stagger mt-4 space-y-5 pb-10">
              <div className="overflow-hidden rounded-sm border border-white/12 bg-black/15 text-left">
                <div className="border-b border-white/10 px-4 py-3 text-[9px] tracking-[0.34em] text-[#8ab8f0]">
                  HOW BINAURAL BEATS WORK
                </div>
                <div className="divide-y divide-white/8 px-4">
                  <div className="py-4">
                    <div className="text-[9px] tracking-[0.28em] text-[#8ab8f0]">TWO TONES</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#cfe7ff]/80">
                      A slightly different frequency plays in each ear.
                    </p>
                  </div>
                  <div className="py-4">
                    <div className="text-[9px] tracking-[0.28em] text-[#e8a8d4]">
                      ONE PERCEIVED PULSE
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#cfe7ff]/80">
                      Your brain perceives the difference as a soft phantom hum it can gently sync
                      to.
                    </p>
                  </div>
                  <div className="py-4">
                    <div className="text-[9px] tracking-[0.28em] text-[#c0b0f0]">
                      ENTER THE INNER HORIZON
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#cfe7ff]/80">
                      Settle into the pulse and let the edges of ordinary awareness soften.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-sm border border-[#c0b0f0]/40 bg-[#c0b0f0]/5 px-4 py-3">
                <div className="mt-0.5 text-[#c0b0f0]">◆</div>
                <div>
                  <div className="text-[9px] font-bold tracking-[0.28em] text-[#c0b0f0]">
                    HEADPHONES REQUIRED
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#cfe7ff]/70">
                    Stereo separation is what allows the perceived pulse to form.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] transition-transform hover:scale-[1.02]"
              >
                ◆ CONTINUE
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="ob-stagger mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-10">
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
            <div
              className="absolute h-32 w-32 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(192,176,240,0.25) 0%, rgba(192,176,240,0) 70%)",
                animation: "ob-breath 3.5s ease-in-out infinite",
              }}
            />
            <div
              className="absolute h-28 w-28"
              style={{ animation: "ob-orbit 14s linear infinite" }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#c0b0f0"
                  strokeOpacity="0.35"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
                {[0, 90, 180, 270].map((a) => (
                  <g key={a} transform={`rotate(${a} 50 50) translate(0 -46)`}>
                    <text x="50" y="54" textAnchor="middle" fontSize="6" fill="#c0b0f0">
                      ◆
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div
              className="absolute h-20 w-20"
              style={{ animation: "ob-orbit 9s linear infinite reverse" }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#c0b0f0"
                  strokeOpacity="0.5"
                  strokeWidth="0.5"
                  strokeDasharray="1 3"
                />
              </svg>
            </div>
            <div
              className="relative font-serif text-2xl text-white"
              style={{ animation: "ob-hum 3s ease-in-out infinite" }}
            >
              ✦
            </div>
          </div>

          <h2 className="mt-5 text-center font-serif text-2xl text-white">
            A clear note before we begin.
          </h2>
          <div className="mt-5 space-y-3 rounded-sm border border-white/15 p-4 text-[12px] leading-relaxed text-[#cfe7ff]/85">
            <p>
              Astral Chamber is a relaxation and meditation aid. It is{" "}
              <span className="text-white">not medical advice</span>. If you have epilepsy, a
              seizure disorder, or photosensitivity, please consult a doctor before using brainwave
              entrainment or pulsing visuals.
            </p>
            <p>
              Don't use binaural or isochronic sessions while driving or operating machinery.
              Results vary from person to person, and nothing here is guaranteed. Approach it like
              meditation, with curiosity and without pressure.
            </p>
          </div>
          <button
            onClick={acceptDisclaimer}
            className="mt-5 w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] transition-transform hover:scale-[1.02]"
          >
            ◆ I UNDERSTAND
          </button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 w-6 rounded-full ${i === step ? "bg-[#c0b0f0]" : "bg-white/15"}`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedBrand({ compact }: { compact: boolean }) {
  return (
    <div
      className={`relative text-center transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
        compact ? "scale-[0.72]" : "scale-100"
      }`}
      style={{ transformOrigin: "top center" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(192,176,240,0.18), rgba(138,184,240,0.05) 45%, transparent 72%)",
          animation: "ob-glow 4.5s ease-in-out infinite",
        }}
      />
      {[0, 1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 text-[7px] text-[#c0b0f0]"
          style={{
            marginLeft: `${((star * 47) % 170) - 85}px`,
            marginTop: `${((star * 31) % 90) - 15}px`,
            animation: `ob-star-drift ${3.6 + (star % 3) * 0.7}s ease-out ${star * 0.55}s infinite`,
          }}
        >
          ✦
        </span>
      ))}

      <div
        className={`relative font-serif leading-[0.95] text-white transition-all duration-700 ${
          compact ? "text-4xl" : "text-5xl"
        }`}
      >
        <span className="text-[#c0b0f0]">ASTRAL</span>
        <br /> CHAMBER
      </div>

      <div
        className={`relative mx-auto flex w-full items-center justify-center transition-all duration-700 ${
          compact ? "mt-2 h-28" : "mt-8 h-44"
        }`}
      >
        <div
          className="absolute h-16 w-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(192,176,240,0.7) 0%, rgba(192,176,240,0) 70%)",
            animation: "ob-hum 2.4s ease-in-out infinite",
          }}
        />
        {[0, 0.8, 1.6].map((delay) => (
          <div
            key={delay}
            className="absolute h-16 w-16 rounded-full border border-[#c0b0f0]/50"
            style={{ animation: `ob-ring 2.4s ease-out ${delay}s infinite` }}
          />
        ))}
        <div
          className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#c0b0f0]/60 bg-[#1a0510]/80"
          style={{ animation: "ob-pulse-l 2.4s ease-in-out infinite" }}
        >
          <span className="text-[9px] tracking-[0.2em] text-[#c0b0f0]">L</span>
        </div>
        <div
          className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#c0b0f0]/60 bg-[#1a0510]/80"
          style={{ animation: "ob-pulse-r 2.4s ease-in-out infinite" }}
        >
          <span className="text-[9px] tracking-[0.2em] text-[#c0b0f0]">R</span>
        </div>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
        >
          <path
            d="M 60 80 Q 90 60, 120 80 T 180 80 T 240 80 T 300 80 T 360 80"
            fill="none"
            stroke="#c0b0f0"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ animation: "ob-wave 3s linear infinite" }}
          />
          <path
            d="M 60 80 Q 95 100, 130 80 T 195 80 T 260 80 T 325 80 T 360 80"
            fill="none"
            stroke="#c0b0f0"
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ animation: "ob-wave 4s linear infinite reverse" }}
          />
        </svg>
      </div>
    </div>
  );
}
