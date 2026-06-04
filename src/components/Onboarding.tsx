import { useState } from "react";
import { useAppState } from "@/lib/app-state";

export function Onboarding() {
  const { account, onboarding, setAccount, setOnboarding } = useAppState();
  const [step, setStep] = useState(() => (onboarding.completed ? 2 : 0));
  const [authMode, setAuthMode] = useState<"sign-up" | "sign-in">("sign-up");

  if (onboarding.completed && account) return null;

  const acceptDisclaimer = () => {
    setOnboarding({
      disclaimerAccepted: true,
      intention: null,
    });
    setStep(2);
  };

  const finishAuth = (provider: "apple" | "google" | "app-store") => {
    const label =
      provider === "apple"
        ? "Apple ID"
        : provider === "google"
          ? "Google Account"
          : "App Store Account";
    setAccount({ email: label });
    setOnboarding({
      completed: true,
      disclaimerAccepted: true,
      intention: null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-6 py-10 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <style>{`
        @keyframes ob-rise { 0% { opacity: 0; transform: translateY(14px); filter: blur(8px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes ob-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ob-ring { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes ob-pulse-l { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(-2px) scale(1.08); opacity: 1; } }
        @keyframes ob-pulse-r { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(2px) scale(1.08); opacity: 1; } }
        @keyframes ob-hum { 0%, 100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.15); } }
        @keyframes ob-wave { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -40; } }
        @keyframes ob-orbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes ob-breath { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.06); opacity: 0.85; } }
        .ob-stagger > * { opacity: 0; animation: ob-rise 0.9s cubic-bezier(.2,.7,.2,1) forwards; }
        .ob-stagger > *:nth-child(1) { animation-delay: 0.1s; }
        .ob-stagger > *:nth-child(2) { animation-delay: 0.35s; }
        .ob-stagger > *:nth-child(3) { animation-delay: 0.6s; }
        .ob-stagger > *:nth-child(4) { animation-delay: 0.85s; }
        .ob-stagger > *:nth-child(5) { animation-delay: 1.1s; }
      `}</style>
      <div className="w-full max-w-md">
        {step === 0 && (
          <div className="ob-stagger space-y-6 text-center">
            <div className="font-serif text-4xl text-white">
              <span className="text-[#c0b0f0]">ASTRAL</span>
              <br /> CHAMBER
            </div>

            {/* Binaural visualization */}
            <div className="relative mx-auto flex h-40 w-full items-center justify-center">
              <div
                className="absolute h-16 w-16 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(192,176,240,0.7) 0%, rgba(192,176,240,0) 70%)",
                  animation: "ob-hum 2.4s ease-in-out infinite",
                }}
              />
              {[0, 0.8, 1.6].map((d, i) => (
                <div
                  key={i}
                  className="absolute h-16 w-16 rounded-full border border-[#c0b0f0]/50"
                  style={{ animation: `ob-ring 2.4s ease-out ${d}s infinite` }}
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

            <div className="space-y-2 text-left">
              {[
                "Binaural beats play a slightly different tone in each ear.",
                "Your brain perceives the difference as a soft phantom hum — a frequency it can gently sync to.",
                "Results vary. It's a meditation aid, not magic.",
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-sm border border-white/10 bg-black/15 px-4 py-3 text-[11px] leading-relaxed text-[#cfe7ff]/82"
                >
                  {line}
                </div>
              ))}
            </div>
            <div className="rounded-sm border border-[#c0b0f0]/40 px-4 py-3 text-[11px] leading-relaxed text-[#c0b0f0]">
              ◆ Headphones are required. Without stereo separation in each ear, the effect doesn't
              form.
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] transition-transform hover:scale-[1.02]"
            >
              ◆ CONTINUE
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="ob-stagger space-y-5">
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

            <h2 className="font-serif text-2xl text-white text-center">
              A clear note before we begin.
            </h2>
            <div className="space-y-3 rounded-sm border border-white/15 p-4 text-[12px] leading-relaxed text-[#cfe7ff]/85">
              <p>
                Astral Chamber is a relaxation and meditation aid — it is{" "}
                <span className="text-white">not medical advice</span>. If you have epilepsy, a
                seizure disorder, or photosensitivity, please consult a doctor before using
                brainwave entrainment or pulsing visuals.
              </p>
              <p>
                Don't use binaural or isochronic sessions while driving or operating machinery.
                Results vary from person to person, and nothing here is guaranteed. Approach it like
                meditation — with curiosity, not pressure.
              </p>
            </div>
            <button
              onClick={acceptDisclaimer}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] transition-transform hover:scale-[1.02]"
            >
              ◆ I UNDERSTAND
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.35em] text-[#8ab8f0]">ACCOUNT</div>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
                Keep your chamber.
              </h2>
              <p className="mt-3 text-[12px] leading-relaxed text-[#cfe7ff]/75">
                Continue with the App Store purchase attached to this device.
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-full border border-white/15 bg-black/20 p-1">
              {[
                { mode: "sign-up" as const, label: "SIGN UP" },
                { mode: "sign-in" as const, label: "SIGN IN" },
              ].map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onPointerDown={() => setAuthMode(item.mode)}
                  onClick={() => setAuthMode(item.mode)}
                  className={`rounded-full py-2 text-[10px] font-bold tracking-[0.25em] transition ${
                    authMode === item.mode ? "bg-[#c0b0f0] text-[#090713]" : "text-[#7fa9c8]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              className={`rounded-sm border border-[#c0b0f0]/35 bg-[#c0b0f0]/5 p-4 transition-opacity duration-150 ${
                authMode === "sign-up" ? "opacity-100" : "pointer-events-none hidden opacity-0"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] tracking-[0.3em] text-[#8ab8f0]">APP STORE</span>
                <span className="font-serif text-2xl text-white">$4.99</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] leading-relaxed text-[#cfe7ff]/80">
                <span>◆ One-time purchase</span>
                <span>◆ No subscription</span>
                <span>◆ No ads</span>
                <span>◆ Private journal</span>
              </div>
            </div>

            <div className="space-y-3">
              {authMode === "sign-in" && (
                <div className="rounded-sm border border-white/15 bg-black/20 p-4 text-[11px] leading-relaxed text-[#cfe7ff]/75">
                  Sign in with Apple or Google, or restore access from the App Store account on this
                  device.
                </div>
              )}
              <button
                type="button"
                onClick={() => finishAuth("apple")}
                className="flex w-full items-center justify-center gap-3 rounded-sm border border-white/70 bg-white py-3.5 text-[11px] font-bold tracking-[0.22em] text-[#090713] transition-transform hover:scale-[1.02]"
              >
                <span className="font-sans text-base leading-none"></span>
                {authMode === "sign-up" ? "CONTINUE WITH APPLE" : "SIGN IN WITH APPLE"}
              </button>
              <button
                type="button"
                onClick={() => finishAuth("google")}
                className="flex w-full items-center justify-center gap-3 rounded-sm border border-white/15 bg-black/20 py-3.5 text-[11px] font-bold tracking-[0.22em] text-white transition-transform hover:scale-[1.02]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-sans text-[12px] font-bold normal-case tracking-normal text-[#4285f4]">
                  G
                </span>
                {authMode === "sign-up" ? "CONTINUE WITH GOOGLE" : "SIGN IN WITH GOOGLE"}
              </button>
              <button
                type="button"
                onClick={() => finishAuth("app-store")}
                className="w-full rounded-sm border border-[#c0b0f0]/50 py-3.5 text-[10px] font-bold tracking-[0.28em] text-[#c0b0f0] transition-transform hover:scale-[1.02]"
              >
                ◆ RESTORE APP STORE ACCESS
              </button>
            </div>

            <p className="text-center text-[10px] leading-relaxed text-[#7fa9c8]/75">
              Purchase is handled by the App Store. No external checkout.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full ${i === step ? "bg-[#c0b0f0]" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
