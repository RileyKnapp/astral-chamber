import { useEffect, useRef, useState } from "react";
import { PaywallPanel } from "@/components/PaywallPanel";
import { useAppState, type Intention } from "@/lib/app-state";

const EXPERIENCES: Record<
  Intention,
  {
    label: string;
    title: string;
    color: string;
  }
> = {
  sleep: { label: "DEEP REST", title: "Quiet the waking mind", color: "#8ab8f0" },
  meditate: { label: "MEDITATION", title: "Settle into stillness", color: "#c0b0f0" },
  lucid: { label: "LUCID DREAMING", title: "Wake the dreamer", color: "#e8a8d4" },
  astral: { label: "ASTRAL EXPLORATION", title: "Loosen the ordinary edges", color: "#d8ccff" },
};

export function Onboarding() {
  const { onboarding, setOnboarding, hasPremiumAccess } = useAppState();
  const [step, setStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intention = onboarding.intention;
  const experience = intention ? EXPERIENCES[intention] : null;
  const accentColor = experience?.color ?? "#c0b0f0";

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [step]);

  if (onboarding.completed || hasPremiumAccess) return null;

  const selectIntention = (next: Intention) => {
    setOnboarding({ intention: next });
    window.setTimeout(() => setStep(3), 260);
  };

  const dismissPaywall = () => setOnboarding({ disclaimerAccepted: true, completed: true });

  return (
    <div
      ref={scrollContainerRef}
      className="fixed inset-0 z-[150] overflow-y-auto px-6 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at 50% -5%, #26091c 0%, #080817 45%, #02050d 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <OnboardingAtmosphere color={accentColor} />
      <style>{`
        @keyframes ob-rise { 0% { opacity: 0; transform: translateY(18px); filter: blur(8px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes ob-ring { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes ob-pulse-l { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(-2px) scale(1.08); opacity: 1; } }
        @keyframes ob-pulse-r { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.85; } 50% { transform: translateX(2px) scale(1.08); opacity: 1; } }
        @keyframes ob-hum { 0%, 100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.15); } }
        @keyframes ob-wave { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -40; } }
        @keyframes ob-breathe { 0%,100% { transform: scale(.94); opacity:.45 } 50% { transform: scale(1.08); opacity:.9 } }
        @keyframes ob-drift { 0% { transform: translateY(18px); opacity:0 } 35% { opacity:.65 } 100% { transform: translateY(-80px); opacity:0 } }
        @keyframes ob-path { 0%, 12% { left: 3%; } 44%, 58% { left: 49%; } 90%, 100% { left: 94%; } }
        @keyframes ob-path-glow { 0%,100% { opacity:.35 } 50% { opacity:1 } }
        @keyframes ob-transcend { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-18px) } }
        @keyframes ob-counter-drift { 0%,100% { transform:translateY(-50%) } 50% { transform:translateY(calc(-50% + 10px)) } }
        @keyframes ob-reveal-question { 0% { opacity:0; transform:scale(.9); filter:blur(16px); letter-spacing:.02em } 55% { opacity:1; filter:blur(0); } 100% { opacity:1; transform:scale(1); letter-spacing:.01em } }
        @keyframes ob-question-glow { 0%,100% { opacity:.15; transform:translate(-50%,-50%) scale(.84) } 50% { opacity:.32; transform:translate(-50%,-50%) scale(1.08) } }
        .ob-enter > * { opacity: 0; animation: ob-rise .85s cubic-bezier(.2,.7,.2,1) forwards; }
        .ob-enter > *:nth-child(2) { animation-delay: .12s } .ob-enter > *:nth-child(3) { animation-delay: .24s }
        .ob-enter > *:nth-child(4) { animation-delay: .36s } .ob-enter > *:nth-child(5) { animation-delay: .48s }
      `}</style>

      <div
        key={step}
        className={`${step === 0 ? "" : "ob-enter"} relative mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-md flex-col ${
          step === 0
            ? "justify-start"
            : step === 4
              ? "justify-center py-6"
              : step === 6 || step === 7
                ? "justify-start pb-4 pt-[clamp(1rem,2.5dvh,2rem)]"
                : "justify-start pb-8 pt-[clamp(2rem,5dvh,4.5rem)]"
        }`}
      >
        {step === 0 && (
          <>
            <div
              className="absolute inset-x-0 top-[8dvh]"
              style={{ animation: "ob-transcend 8s ease-in-out infinite" }}
            >
              <BinauralBrand />
            </div>
            <div
              className="absolute inset-x-0 top-[calc(51dvh-2rem)]"
              style={{ animation: "ob-counter-drift 10s ease-in-out infinite" }}
            >
              <div className="text-center">
                <div className="text-[9px] tracking-[0.42em] text-[#8ab8f0]">
                  YOUR INNER HORIZON
                </div>
                <h1 className="mt-4 font-serif text-5xl leading-[0.94] text-white">
                  <span className="text-[#c0b0f0]">ASTRAL</span>
                  <br />
                  CHAMBER
                </h1>
                <p className="mx-auto mt-5 max-w-xs text-[11px] leading-relaxed text-[#cfe7ff]/65">
                  Evolving binaural journeys designed to guide the mind from one state to another.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-[6dvh]">
              <PrimaryButton onClick={() => setStep(5)}>ENTER</PrimaryButton>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <StepLabel current={1} total={1} label="BEFORE YOU BEGIN" />
            <div className="my-auto py-10 text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[#c0b0f0]/35 bg-[#c0b0f0]/5 shadow-[0_0_75px_rgba(192,176,240,.16)]">
                <div className="flex items-center gap-3 font-serif text-xl text-white">
                  <span className="text-[#8ab8f0]">L</span>
                  <span className="text-[#c0b0f0]/60">+</span>
                  <span className="text-[#e8a8d4]">R</span>
                </div>
              </div>
              <div className="mt-8 text-[9px] tracking-[0.35em] text-[#8ab8f0]">
                A QUICK QUESTION
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-white">
                Are you familiar with binaural beats?
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-[11px] leading-relaxed text-[#cfe7ff]/60">
                We can give you a brief introduction before shaping your first journey.
              </p>
            </div>
            <div className="grid gap-3 pb-2">
              <PrimaryButton onClick={() => setStep(8)}>YES, I AM</PrimaryButton>
              <SecondaryButton onClick={() => setStep(6)}>NO, TEACH ME</SecondaryButton>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <StepLabel current={1} total={2} label="BINAURAL BASICS" />
            <div className="mt-3 text-center">
              <div className="text-[9px] tracking-[0.35em] text-[#c0b0f0]">TWO TONES, ONE BEAT</div>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-white">
                Your mind hears the difference.
              </h2>
              <p className="mt-3 text-[11px] leading-relaxed text-[#cfe7ff]/60">
                A binaural beat appears when each ear receives a slightly different steady tone.
                Your brain perceives the gap between them as a gentle pulse.
              </p>
            </div>
            <FrequencyExample />
            <div className="mt-4 rounded-sm border border-white/12 bg-black/15 p-4">
              <div className="text-[9px] tracking-[0.28em] text-[#8ab8f0]">
                FREQUENCY VS. BEAT FREQUENCY
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-[#cfe7ff]/60">
                Frequency is the pitch of each tone, measured in hertz (Hz). Beat frequency is the
                difference between those pitches. It is the slower rhythm associated with states
                such as relaxed alpha or dreamy theta.
              </p>
            </div>
            <div className="mt-auto pt-5">
              <PrimaryButton onClick={() => setStep(7)}>HOW TO LISTEN</PrimaryButton>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <StepLabel current={2} total={2} label="LISTENING WELL" />
            <div className="mt-3 text-center">
              <div className="text-[9px] tracking-[0.35em] text-[#e8a8d4]">HEADPHONES REQUIRED</div>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-white">
                Give each ear its own tone.
              </h2>
              <p className="mt-3 text-[11px] leading-relaxed text-[#cfe7ff]/60">
                Wear stereo headphones, settle somewhere safe, and keep the volume comfortable. You
                do not need to strain or actively chase the beat.
              </p>
            </div>
            <div className="mt-5 grid gap-2">
              {[
                [
                  "WEAR HEADPHONES",
                  "The effect depends on separate left and right audio channels.",
                ],
                ["GET COMFORTABLE", "Listen seated or lying down, never while driving."],
                [
                  "LET IT BE SUBTLE",
                  "Lower volume is enough. Relax and allow the session to unfold.",
                ],
              ].map(([title, copy], index) => (
                <div key={title} className="rounded-sm border border-white/12 bg-black/15 p-3">
                  <div className="flex items-start gap-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c0b0f0]/35 text-[9px] text-[#c0b0f0]">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.25em] text-white">{title}</div>
                      <p className="mt-2 text-[10px] leading-relaxed text-[#cfe7ff]/55">{copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-[9px] tracking-[0.28em] text-[#8ab8f0]">
                THE SCIENCE, BRIEFLY
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[#cfe7ff]/55">
                Research suggests binaural beats may support relaxation, focus, or sleep for some
                listeners. These are the same deeply relaxed, dreamlike meditative states
                practitioners intentionally cultivate for lucid dreaming and astral exploration.
                Results vary and the evidence is still developing, so think of binaural beats as a
                meditation aid, not a medical treatment.
              </p>
            </div>
            <div className="mt-auto pt-5">
              <PrimaryButton onClick={() => setStep(8)}>CONTINUE</PrimaryButton>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepLabel current={2} total={3} label="SET YOUR INTENTION" />
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white">
              Where would you like to go?
            </h2>
            <p className="mt-3 text-[11px] leading-relaxed text-[#cfe7ff]/60">
              We will shape your experience around what draws you inward.
            </p>
            <div className="mt-7 grid gap-3">
              {(Object.keys(EXPERIENCES) as Intention[]).map((key) => {
                const item = EXPERIENCES[key];
                return (
                  <button
                    key={key}
                    onClick={() => selectIntention(key)}
                    className="group rounded-sm border border-white/15 bg-white/[0.02] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#c0b0f0]/60 hover:bg-[#c0b0f0]/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] tracking-[0.3em]" style={{ color: item.color }}>
                          {item.label}
                        </div>
                        <div className="mt-1 font-serif text-xl text-white">{item.title}</div>
                      </div>
                      <div className="text-lg text-white/25 transition group-hover:text-[#c0b0f0]">
                        ◇
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto flex justify-center pt-8">
              <div className="h-16 w-px bg-gradient-to-b from-[#8ab8f0]/35 to-transparent" />
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <div className="relative my-auto flex min-h-72 items-center justify-center text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 rounded-full blur-3xl"
                style={{
                  background: accentColor,
                  animation: "ob-question-glow 4s ease-in-out infinite",
                }}
              />
              <div className="relative">
                <div className="text-[9px] tracking-[0.42em]" style={{ color: accentColor }}>
                  BEFORE WE GO FURTHER
                </div>
                <h2
                  className="mt-6 font-serif text-5xl leading-[1.08] text-white"
                  style={{
                    animation: "ob-reveal-question 1.5s cubic-bezier(.16,1,.3,1) .18s both",
                    textShadow: `0 0 38px ${accentColor}55`,
                  }}
                >
                  What Makes Us Different?
                </h2>
              </div>
            </div>
            <div className="pb-2">
              <PrimaryButton onClick={() => setStep(2)}>CONTINUE</PrimaryButton>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepLabel current={1} total={3} label="WHAT MAKES US DIFFERENT" />
            <div className="mt-5 text-center">
              <div className="text-[9px] tracking-[0.35em]" style={{ color: accentColor }}>
                NOT A STATIC TRACK
              </div>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-white">
                A journey through states.
              </h2>
              <p className="mt-3 text-[11px] leading-relaxed text-[#cfe7ff]/60">
                Each session automatically transitions through carefully chosen frequencies,
                creating a smooth path from one state to another.
              </p>
            </div>
            <JourneyArc color={accentColor} />
            <div className="mt-6 grid gap-3">
              <div className="rounded-sm border border-white/12 bg-black/15 p-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e8a8d4]/35 bg-[#e8a8d4]/5 text-[#e8a8d4]">
                    ◇
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.28em] text-[#e8a8d4]">
                      PRIVATE DREAM LAB
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-[#cfe7ff]/60">
                      Capture what surfaced, notice patterns, and build a private record that never
                      leaves your device.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-sm border border-white/12 bg-black/15 p-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#8ab8f0]/35 bg-[#8ab8f0]/5 text-[#8ab8f0]">
                    ≋
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.28em] text-[#8ab8f0]">
                      AMBIENT SOUNDSCAPES
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-[#cfe7ff]/60">
                      Blend white, pink, and brown noise with wind or ocean waves beneath every
                      journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <PrimaryButton onClick={() => setStep(1)}>CONTINUE</PrimaryButton>
            </div>
          </>
        )}

        {step === 3 && experience && (
          <>
            <StepLabel current={3} total={3} label="ONE CLEAR NOTE" />
            <div className="my-8 flex flex-1 flex-col justify-center rounded-sm border border-white/12 bg-white/[0.018] px-5 py-8 text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[#c0b0f0]/40 bg-[#c0b0f0]/5 font-serif text-3xl text-white shadow-[0_0_75px_rgba(192,176,240,.2)]">
                ✦
              </div>
              <h2 className="mt-8 font-serif text-4xl text-white">Explore with care.</h2>
              <p className="mt-4 text-[11px] leading-relaxed text-[#cfe7ff]/60">
                Astral Chamber is a relaxation and meditation aid, not medical advice. Do not use
                while driving. If you have epilepsy, a seizure disorder, or photosensitivity,
                consult a doctor before using brainwave entrainment or pulsing visuals.
              </p>
              <div className="mt-8 border-t border-white/10 pt-6 text-left">
                {[
                  ["RESTING ONLY", "Use sessions while seated or lying somewhere safe."],
                  ["LISTEN TO YOUR BODY", "Pause immediately if anything feels uncomfortable."],
                  [
                    "GOOD INTENTIONS",
                    "Begin with a calm purpose and give yourself room to return.",
                  ],
                ].map(([title, copy]) => (
                  <div key={title} className="flex gap-4 py-2 first:pt-0 last:pb-0">
                    <div className="mt-1 text-[#c0b0f0]">◇</div>
                    <div>
                      <div className="text-[8px] tracking-[0.24em] text-[#8ab8f0]">{title}</div>
                      <p className="mt-1 text-[9px] leading-relaxed text-[#cfe7ff]/50">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pb-2">
              <PrimaryButton onClick={() => setStep(4)}>I UNDERSTAND</PrimaryButton>
            </div>
          </>
        )}

        {step === 4 && experience && (
          <>
            <div className="text-center">
              <div className="text-[9px] tracking-[0.38em]" style={{ color: experience.color }}>
                YOUR CHAMBER IS READY
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-white">
                Begin your first journey.
              </h2>
            </div>
            <div className="mt-7">
              <PaywallPanel intention={intention} onDismiss={dismissPaywall} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-sm border-2 border-[#c0b0f0] bg-[#c0b0f0] py-4 text-[10px] font-bold tracking-[0.32em] text-[#080610] shadow-[0_0_40px_rgba(192,176,240,.2)] transition hover:scale-[1.01]"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-sm border border-white/20 bg-white/[0.025] py-4 text-[10px] font-bold tracking-[0.32em] text-[#cfe7ff] transition hover:border-[#c0b0f0]/60 hover:bg-[#c0b0f0]/5"
    >
      {children}
    </button>
  );
}

function StepLabel({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="flex items-center justify-between text-[8px] tracking-[0.28em] text-[#8ab8f0]">
      <span>{label}</span>
      <span>
        {current} / {total}
      </span>
    </div>
  );
}

function FrequencyExample() {
  return (
    <div className="mt-5 rounded-sm border border-white/12 bg-white/[0.02] px-4 py-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div className="rounded-sm border border-[#8ab8f0]/30 bg-[#8ab8f0]/5 px-2 py-3">
          <div className="text-[8px] tracking-[0.24em] text-[#8ab8f0]">LEFT EAR</div>
          <div className="mt-2 font-serif text-2xl text-white">200 Hz</div>
        </div>
        <div className="text-[#c0b0f0]/60">+</div>
        <div className="rounded-sm border border-[#e8a8d4]/30 bg-[#e8a8d4]/5 px-2 py-3">
          <div className="text-[8px] tracking-[0.24em] text-[#e8a8d4]">RIGHT EAR</div>
          <div className="mt-2 font-serif text-2xl text-white">210 Hz</div>
        </div>
      </div>
      <div className="mx-auto my-3 h-6 w-px bg-gradient-to-b from-[#c0b0f0]/60 to-transparent" />
      <div className="text-center">
        <div className="text-[8px] tracking-[0.25em] text-[#c0b0f0]">PERCEIVED BEAT</div>
        <div className="mt-2 font-serif text-3xl text-white">10 Hz</div>
        <div className="mt-2 text-[8px] tracking-[0.2em] text-white/35">210 − 200 = 10</div>
      </div>
    </div>
  );
}

function JourneyArc({ color }: { color: string }) {
  const stages = [
    ["BETA", "CLEAR"],
    ["ALPHA", "CALM"],
    ["THETA", "DEEP"],
  ];
  return (
    <div className="mt-8 rounded-sm border border-white/12 bg-white/[0.02] px-4 py-6">
      <div className="relative mx-3">
        <div className="absolute left-0 right-0 top-3 h-px bg-white/15" />
        <div
          className="absolute left-0 top-3 h-px w-full origin-left"
          style={{
            background: `linear-gradient(to right, #8ab8f0, ${color}, #e8a8d4)`,
            boxShadow: `0 0 12px ${color}`,
            animation: "ob-path-glow 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[7px] h-3 w-3 -translate-x-1/2 rounded-full border border-white"
          style={{
            background: color,
            boxShadow: `0 0 18px ${color}`,
            animation: "ob-path 6s ease-in-out infinite",
          }}
        />
        <div className="relative flex justify-between">
          {stages.map(([state, feeling]) => (
            <div key={state} className="w-16 text-center">
              <div className="mx-auto h-6 w-px bg-white/25" />
              <div className="mt-3 text-[8px] tracking-[0.22em] text-white">{state}</div>
              <div className="mt-1 text-[7px] tracking-[0.18em] text-[#8ab8f0]/60">{feeling}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-[8px] tracking-[0.2em] text-white/35">
        FREQUENCIES SHIFT AS THE JOURNEY UNFOLDS
      </p>
    </div>
  );
}

function BinauralBrand() {
  return (
    <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center">
      <div
        className="absolute h-16 w-16 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(192,176,240,0.7) 0%, rgba(192,176,240,0) 70%)",
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
        className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#8ab8f0]/60 bg-[#090713]/90 shadow-[0_0_25px_rgba(138,184,240,.18)]"
        style={{ animation: "ob-pulse-l 2.4s ease-in-out infinite" }}
      >
        <span className="text-[9px] tracking-[0.2em] text-[#8ab8f0]">L</span>
      </div>
      <div
        className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8a8d4]/60 bg-[#090713]/90 shadow-[0_0_25px_rgba(232,168,212,.18)]"
        style={{ animation: "ob-pulse-r 2.4s ease-in-out infinite" }}
      >
        <span className="text-[9px] tracking-[0.2em] text-[#e8a8d4]">R</span>
      </div>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
      >
        <path
          d="M 50 80 Q 85 55, 120 80 T 190 80 T 260 80 T 350 80"
          fill="none"
          stroke="#8ab8f0"
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="3 4"
          style={{ animation: "ob-wave 3s linear infinite" }}
        />
        <path
          d="M 50 80 Q 90 105, 130 80 T 205 80 T 280 80 T 350 80"
          fill="none"
          stroke="#e8a8d4"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="3 4"
          style={{ animation: "ob-wave 4s linear infinite reverse" }}
        />
      </svg>
    </div>
  );
}

function OnboardingAtmosphere({ color = "#c0b0f0" }: { color?: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: color, opacity: 0.06 }}
      />
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className="absolute text-[6px] text-white"
          style={{
            left: `${8 + ((index * 31) % 86)}%`,
            bottom: `${-5 + ((index * 17) % 26)}%`,
            animation: `ob-drift ${5 + (index % 4)}s ease-out ${index * 0.6}s infinite`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
