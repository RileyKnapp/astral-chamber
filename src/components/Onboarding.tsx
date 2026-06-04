import { useState } from "react";
import { useAppState, type Intention, INTENTION_TO_PRESET } from "@/lib/app-state";
import { useNavigate } from "@tanstack/react-router";
import { INTENTION_TO_JOURNEY } from "@/lib/app-state";

export function Onboarding() {
  const { onboarding, setOnboarding, setSettings } = useAppState();
  const [step, setStep] = useState(0);
  const [intention, setIntention] = useState<Intention | null>(null);
  const navigate = useNavigate();

  if (onboarding.completed) return null;

  const intentions: { id: Intention; label: string; sub: string }[] = [
    { id: "sleep", label: "SLEEP", sub: "drift into delta" },
    { id: "meditate", label: "MEDITATE", sub: "settle into alpha" },
    { id: "lucid", label: "LUCID DREAM", sub: "the theta threshold" },
    { id: "astral", label: "ASTRAL", sub: "open the doorway" },
  ];

  const finish = () => {
    if (intention) {
      const preset = INTENTION_TO_PRESET[intention];
      setSettings({ defaultCarrier: preset.carrier, defaultBeat: preset.beat });
    }
    setOnboarding({
      completed: true,
      disclaimerAccepted: true,
      intention,
    });
    if (intention) {
      navigate({ to: "/journeys/$slug", params: { slug: INTENTION_TO_JOURNEY[intention] } });
    }
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
            <h2 className="font-serif text-2xl text-white">Pick your intention.</h2>
            <p className="text-[12px] leading-relaxed text-[#7fa9c8]">
              We'll drop you into a fitting starter journey. You can always change
              direction later.
            </p>
            <div className="grid gap-3">
              {intentions.map((i) => {
                const active = intention === i.id;
                return (
                  <button
                    key={i.id}
                    onClick={() => setIntention(i.id)}
                    className={`rounded-sm border px-4 py-3 text-left transition ${
                      active
                        ? "border-[#c0b0f0] bg-[#c0b0f0]/15"
                        : "border-white/15 hover:border-[#c0b0f0]/40"
                    }`}
                  >
                    <div className="font-serif text-base text-white">{i.label}</div>
                    <div className="text-[10px] tracking-[0.2em] text-[#7fa9c8]">
                      {i.sub}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!intention}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010] disabled:opacity-40"
            >
              ◆ CONTINUE
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center">
            <h2 className="font-serif text-3xl text-white">
              Yours <span className="text-[#c0b0f0]">forever.</span>
            </h2>
            <div className="space-y-2 rounded-sm border border-[#c0b0f0]/40 p-5 text-[12px] leading-relaxed text-[#cfe7ff]/85">
              <p>◆ No subscription. No ads.</p>
              <p>◆ Audio is generated on your device.</p>
              <p>◆ One-time purchase. Quiet integrity.</p>
            </div>
            <button
              onClick={finish}
              className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[11px] font-bold tracking-[0.3em] text-[#0a1010]"
            >
              ◆ ENTER THE CHAMBER
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
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
