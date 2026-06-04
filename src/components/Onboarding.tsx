import { useState } from "react";
import { useAppState } from "@/lib/app-state";

export function Onboarding() {
  const { onboarding, setOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  if (onboarding.completed) return null;

  const finish = () => {
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
        background:
          "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="font-serif text-4xl text-white">
              <span className="text-[#c0b0f0]">ASTRAL</span>
              <br /> CHAMBER
            </div>
            <p className="text-[12px] leading-relaxed text-[#cfe7ff]/80">
              Binaural beats play a slightly different tone in each ear. Your brain
              perceives the difference as a soft phantom hum — a frequency it can
              gently sync to. Honest fact: results vary. It's not magic, it's a nudge.
            </p>
            <div className="rounded-sm border border-[#c0b0f0]/40 px-4 py-3 text-[11px] leading-relaxed text-[#c0b0f0]">
              ◆ Headphones are required. Without stereo separation in each ear, the
              effect doesn't form.
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010]"
            >
              ◆ CONTINUE
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-white">A clear note before we begin.</h2>
            <div className="space-y-3 rounded-sm border border-white/15 p-4 text-[12px] leading-relaxed text-[#cfe7ff]/85">
              <p>
                This app is <span className="text-white">not medical advice</span>. If
                you have epilepsy, a seizure disorder, or photosensitivity,
                please consult a doctor before using brainwave entrainment or
                pulsing visuals.
              </p>
              <p>
                Don't use binaural or isochronic sessions while driving or operating
                machinery. Results vary from person to person, and nothing here is
                guaranteed. Approach it like meditation — with curiosity, not pressure.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010]"
            >
              ◆ I UNDERSTAND
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {mode === "signup" ? (
              <div className="text-center">
                <h2 className="font-serif text-3xl text-white">
                  Yours <span className="text-[#c0b0f0]">forever.</span>
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#7fa9c8]">
                  One-time purchase. No subscription. No ads.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="font-serif text-3xl text-white">
                  Welcome <span className="text-[#c0b0f0]">back.</span>
                </h2>
              </div>
            )}

            {mode === "signup" && (
              <div className="rounded-sm border border-[#c0b0f0]/40 p-5">
                <div className="flex items-baseline justify-between">
                  <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">
                    ◆ LIFETIME ACCESS
                  </div>
                  <div className="font-serif text-3xl text-white">
                    $9.99<span className="text-base text-[#7fa9c8]"> once</span>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5 text-[11px] leading-relaxed text-[#cfe7ff]/85">
                  <li>◇ Every journey, every band — forever</li>
                  <li>◇ Audio generated on your device</li>
                  <li>◇ No subscription. No ads. No tracking</li>
                  <li>◇ Free updates as the chamber grows</li>
                </ul>
              </div>
            )}

            <div className="flex gap-2 text-[10px] tracking-[0.3em]">
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-sm border py-2 ${
                  mode === "signup"
                    ? "border-[#c0b0f0] bg-[#c0b0f0]/15 text-white"
                    : "border-white/15 text-[#7fa9c8]"
                }`}
              >
                CREATE ACCOUNT
              </button>
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-sm border py-2 ${
                  mode === "signin"
                    ? "border-[#c0b0f0] bg-[#c0b0f0]/15 text-white"
                    : "border-white/15 text-[#7fa9c8]"
                }`}
              >
                SIGN IN
              </button>
            </div>

            <div className="space-y-3 rounded-sm border border-white/15 p-4">
              <label className="block">
                <span className="block text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                  EMAIL
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@elsewhere.com"
                  className="mt-1 w-full rounded-sm border border-white/15 bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#c0b0f0] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                  PASSWORD
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-sm border border-white/15 bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#c0b0f0] focus:outline-none"
                />
              </label>
            </div>

            <button
              onClick={finish}
              disabled={!email || !password}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] disabled:opacity-40"
            >
              {mode === "signup" ? "◆ UNLOCK — $9.99 ONCE" : "◆ SIGN IN"}
            </button>

            <p className="text-center text-[10px] leading-relaxed text-[#7fa9c8]/70">
              Demo screen — no real charge or account is created yet.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full ${
                i === step ? "bg-[#c0b0f0]" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
