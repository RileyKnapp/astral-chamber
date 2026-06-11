import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/lib/app-state";
import { NoiseMixer, NOISE_LAYERS, type NoiseLayerId } from "@/lib/noise-mixer";
import { ChevronDown } from "lucide-react";
import { PremiumLock } from "@/components/PremiumLock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astral Chamber" },
      {
        name: "description",
        content:
          "The Astral Chamber — binaural soundscapes for astral projection, lucid dreams, and deep meditation. Two tones, one mind.",
      },
    ],
  }),
  component: Chamber,
});

type Preset = { name: string; tag: string; carrier: number; beat: number };

const PRESETS: Preset[] = [
  { name: "DELTA", tag: "deep rest & healing", carrier: 100, beat: 2.5 },
  { name: "THETA", tag: "lucid dream threshold", carrier: 136, beat: 6 },
  { name: "ALPHA", tag: "astral doorway", carrier: 200, beat: 10 },
  { name: "BETA", tag: "lucid focus", carrier: 240, beat: 18 },
  { name: "GAMMA", tag: "higher consciousness", carrier: 300, beat: 40 },
];

const TIMER_HOURS = Array.from({ length: 11 }, (_, i) => i);
const TIMER_MINUTES_SECONDS = Array.from({ length: 60 }, (_, i) => i);

function formatTimer(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function Chamber() {
  const { hasPremiumAccess } = useAppState();
  if (!hasPremiumAccess) {
    return (
      <PremiumLock
        feature="The Full Chamber"
        description="Unlock unlimited sessions, precise frequency controls, ambient layers, and sleep timers."
      />
    );
  }
  return <ChamberContent />;
}

function ChamberContent() {
  const { hasPremiumAccess, settings, setSettings, setCurrentBeat, unlockDemoPremium } =
    useAppState();
  const [carrier, setCarrier] = useState(settings.defaultCarrier);
  const [beat, setBeat] = useState(settings.defaultBeat);
  const [volume, setVolume] = useState(settings.masterVolume);
  const [playing, setPlaying] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [ambientOpen, setAmbientOpen] = useState(true);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [noiseLevels, setNoiseLevels] = useState<Record<NoiseLayerId, number>>({
    white: 0,
    pink: 0,
    brown: 0,
    wind: 0,
    waves: 0,
  });

  // Push beat to global state so aurora/orb visuals across the app pulse with it
  useEffect(() => {
    if (playing) setCurrentBeat(beat);
  }, [beat, playing, setCurrentBeat]);

  // Persist volume changes as master volume (no effect — avoid render loop)
  const updateVolume = (v: number) => {
    setVolume(v);
    setSettings({ masterVolume: v });
  };

  // Audio graph refs
  const ctxRef = useRef<AudioContext | null>(null);
  const leftRef = useRef<OscillatorNode | null>(null);
  const rightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const mixerRef = useRef<NoiseMixer | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const getMixer = () => {
    if (!mixerRef.current) mixerRef.current = new NoiseMixer(noiseLevels);
    return mixerRef.current;
  };

  const setAllNoise = (next: Record<NoiseLayerId, number>) => {
    setNoiseLevels(next);
    const mixer = getMixer();
    (Object.keys(next) as NoiseLayerId[]).forEach((id) => mixer.setVolume(id, next[id]));
  };

  const updateNoise = (id: NoiseLayerId, v: number) => {
    setNoiseLevels((prev) => ({ ...prev, [id]: v }));
    getMixer().setVolume(id, v);
  };

  // Live updates while playing
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !leftRef.current || !rightRef.current) return;
    const t = ctx.currentTime;
    leftRef.current.frequency.setTargetAtTime(carrier, t, 0.03);
    rightRef.current.frequency.setTargetAtTime(carrier + beat, t, 0.03);
  }, [carrier, beat]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx && gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    }
    mixerRef.current?.setMasterVolume(volume);
  }, [volume]);

  const start = () => {
    // CRITICAL: create AudioContext synchronously inside the gesture handler.
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    gainRef.current = master;
    const mixer = getMixer();
    mixer.attach(ctx, master);
    mixer.setMasterVolume(volume);

    const merger = ctx.createChannelMerger(2);
    merger.connect(master);

    const left = ctx.createOscillator();
    left.type = "sine";
    left.frequency.value = carrier;
    left.connect(merger, 0, 0);

    const right = ctx.createOscillator();
    right.type = "sine";
    right.frequency.value = carrier + beat;
    right.connect(merger, 0, 1);

    left.start();
    right.start();
    leftRef.current = left;
    rightRef.current = right;

    // Resume in case context started suspended.
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    setPlaying(true);
  };

  const stop = () => {
    setTimerEndsAt(null);
    setTimerRemaining(0);
    try {
      leftRef.current?.stop();
      rightRef.current?.stop();
    } catch {
      // Oscillators may already be stopped by route cleanup.
    }
    leftRef.current?.disconnect();
    rightRef.current?.disconnect();
    gainRef.current?.disconnect();
    ctxRef.current?.close().catch(() => {});
    leftRef.current = null;
    rightRef.current = null;
    gainRef.current = null;
    ctxRef.current = null;
    mixerRef.current?.dispose();
    mixerRef.current = null;
    setCurrentBeat(settings.defaultBeat);
    setPlaying(false);
  };
  stopRef.current = stop;

  const toggle = () => (playing ? stop() : start());

  const selectedTimerSeconds = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
  const validTimerSeconds = selectedTimerSeconds >= 1 && selectedTimerSeconds <= 10 * 3600;

  const setSleepTimer = () => {
    if (!validTimerSeconds) return;
    setTimerEndsAt(Date.now() + selectedTimerSeconds * 1000);
    setTimerRemaining(selectedTimerSeconds);
    setTimerOpen(false);
  };

  const updateTimerHours = (hours: number) => {
    setTimerHours(hours);
    if (hours === 10) {
      setTimerMinutes(0);
      setTimerSeconds(0);
    }
  };

  useEffect(() => {
    if (!timerEndsAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      setTimerRemaining(remaining);
      if (remaining === 0) stopRef.current();
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [timerEndsAt]);

  useEffect(() => {
    return () => {
      try {
        leftRef.current?.stop();
        rightRef.current?.stop();
      } catch {
        // oscillator may already be stopped
      }
      leftRef.current?.disconnect();
      rightRef.current?.disconnect();
      gainRef.current?.disconnect();
      ctxRef.current?.close().catch(() => {});
      mixerRef.current?.dispose();
      setCurrentBeat(settings.defaultBeat);
      leftRef.current = null;
      rightRef.current = null;
      gainRef.current = null;
      ctxRef.current = null;
      mixerRef.current = null;
    };
  }, [setCurrentBeat, settings.defaultBeat]);

  const isPresetActive = (p: Preset) => p.carrier === carrier && p.beat === beat;

  const togglePreset = (p: Preset) => {
    if (isPresetActive(p)) {
      // toggle off — restore defaults
      setCarrier(settings.defaultCarrier);
      setBeat(settings.defaultBeat);
      return;
    }
    setCarrier(p.carrier);
    setBeat(p.beat);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      {/* aurora — pulses subtly in sync with active beat */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 ${playing ? "beat-sync" : ""}`}
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(192,176,240,0.18), transparent 60%), radial-gradient(ellipse 70% 60% at 80% 20%, rgba(138,184,240,0.14), transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(232,168,212,0.14), transparent 65%)",
        }}
      />

      {/* scanline overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }}
      />

      <main
        className="relative mx-auto max-w-3xl px-6 py-10"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)",
        }}
      >
        {/* header line */}

        <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
          <span className="text-[#c0b0f0]">ASTRAL</span>
          <br /> CHAMBER
        </h1>

        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          Headphones required. Left ear receives{" "}
          <span className="text-[#cfe7ff]">{carrier.toFixed(1)} Hz</span>, right ear receives{" "}
          <span className="text-[#cfe7ff]">{(carrier + beat).toFixed(1)} Hz</span>. Your brain
          weaves the difference into{" "}
          <span className="font-bold text-[#c0b0f0]">{beat.toFixed(1)} Hz</span>— a soft hum that
          can open doors to lucid dreams, astral vistas, and quiet inner flight.
        </p>

        {/* Chamber visual */}
        <div
          className="mt-8 rounded-sm border border-[#c0b0f0]/60 p-6"
          style={{
            background: "linear-gradient(180deg, rgba(192,176,240,0.04), rgba(0,0,0,0.4))",
          }}
        >
          {(() => {
            const band =
              beat < 4
                ? { name: "DELTA", tag: "deep rest", color: "#8ab8f0" }
                : beat < 8
                  ? { name: "THETA", tag: "dream threshold", color: "#c0b0f0" }
                  : beat < 13
                    ? { name: "ALPHA", tag: "calm focus", color: "#c0b0f0" }
                    : beat < 30
                      ? { name: "BETA", tag: "alert focus", color: "#e8a8d4" }
                      : { name: "GAMMA", tag: "heightened awareness", color: "#e8a8d4" };
            return (
              <div className="mb-4 flex flex-col items-center gap-1">
                <span className="text-[11px] tracking-[0.4em]" style={{ color: band.color }}>
                  {band.name} · {beat.toFixed(1)} Hz
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#7fa9c8]/70">{band.tag}</span>
              </div>
            );
          })()}
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em]">
            <span className="text-[#8ab8f0]">L · {carrier.toFixed(1)}Hz</span>
            <span className="text-[#e8a8d4]">R · {(carrier + beat).toFixed(1)}Hz</span>
          </div>

          <div
            className={`relative mt-4 flex h-44 items-center justify-around ${playing ? "beat-sync" : ""}`}
          >
            <Bubble color="#8ab8f0" active={playing} speed={Math.max(1, beat / 4)} />
            <Bubble color="#e8a8d4" active={playing} speed={Math.max(1, beat / 4)} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
              ─ · ─
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-8 space-y-6">
          <Slider
            label="CARRIER"
            color="#8ab8f0"
            value={carrier}
            min={50}
            max={500}
            step={1}
            unit="Hz"
            onChange={setCarrier}
          />
          <Slider
            label="BEAT"
            color="#c0b0f0"
            value={beat}
            min={0.5}
            max={40}
            step={0.1}
            unit="Hz"
            onChange={setBeat}
            decimals={1}
          />
          <Slider
            label="VOLUME"
            color="#e8a8d4"
            value={volume}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={updateVolume}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </div>

        {/* Transmit button */}
        <button
          onClick={toggle}
          className="mt-8 block w-full select-none rounded-sm border-2 border-[#c0b0f0] py-5 text-center text-sm font-bold tracking-[0.3em] text-[#0a1010] transition-all active:scale-[0.98]"
          style={{
            background: playing ? "#e8a8d4" : "#c0b0f0",
            color: playing ? "#0a0005" : "#0a1010",
            boxShadow: playing
              ? "0 0 30px rgba(232,168,212,0.5)"
              : "0 0 30px rgba(192,176,240,0.35)",
          }}
        >
          {playing ? "■ CLOSE DOORWAY" : "► OPEN DOORWAY"}
        </button>

        <div className="mt-3 rounded-sm border border-white/15 bg-black/10">
          {hasPremiumAccess ? (
            <>
              <button
                onClick={() => setTimerOpen((open) => !open)}
                className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">◷ SLEEP TIMER</span>
                <span className="text-[10px] tracking-[0.2em] text-[#8ab8f0]">
                  {timerEndsAt ? formatTimer(timerRemaining) : "OFF"}
                </span>
              </button>
              <div
                className="grid transition-all duration-200 ease-out"
                style={{
                  gridTemplateRows: timerOpen ? "1fr" : "0fr",
                  opacity: timerOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      <TimerSelect
                        label="HOURS"
                        value={timerHours}
                        values={TIMER_HOURS}
                        onChange={updateTimerHours}
                      />
                      <TimerSelect
                        label="MINUTES"
                        value={timerMinutes}
                        values={TIMER_MINUTES_SECONDS}
                        onChange={setTimerMinutes}
                        disabled={timerHours === 10}
                      />
                      <TimerSelect
                        label="SECONDS"
                        value={timerSeconds}
                        values={TIMER_MINUTES_SECONDS}
                        onChange={setTimerSeconds}
                        disabled={timerHours === 10}
                      />
                    </div>
                    <button
                      onClick={setSleepTimer}
                      disabled={!validTimerSeconds}
                      className="mt-4 min-h-12 w-full rounded-sm border border-[#c0b0f0]/60 bg-[#c0b0f0]/10 text-[10px] font-bold tracking-[0.25em] text-[#cfe7ff] transition-colors disabled:opacity-35"
                    >
                      SET TIMER · {formatTimer(selectedTimerSeconds)}
                    </button>
                  </div>
                  {timerEndsAt && (
                    <button
                      onClick={() => {
                        setTimerEndsAt(null);
                        setTimerRemaining(0);
                        setTimerOpen(false);
                      }}
                      className="mb-4 w-full text-center text-[9px] tracking-[0.3em] text-[#e8a8d4]"
                    >
                      CANCEL TIMER
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="text-[10px] tracking-[0.3em] text-white/40">◷ SLEEP TIMER</div>
                <div className="mt-1 text-[9px] text-[#7fa9c8]/60">Premium Chamber feature</div>
              </div>
              <button
                type="button"
                onClick={unlockDemoPremium}
                className="shrink-0 rounded-full border border-[#c0b0f0]/35 px-3 py-2 text-[8px] font-bold tracking-[0.12em] text-[#c0b0f0]"
              >
                PURCHASE PREMIUM TO ACCESS
              </button>
            </div>
          )}
        </div>

        <div className="my-10 border-t border-dashed border-white/10" />

        {/* Presets — collapsable */}
        <div className="rounded-sm border border-white/15 overflow-hidden">
          <button
            onClick={() => setPresetsOpen((p) => !p)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="text-[10px] tracking-[0.3em] text-[#8ab8f0]">▸ PRESETS</div>
            <ChevronDown
              className="h-3.5 w-3.5 text-[#8ab8f0] transition-transform duration-300"
              style={{ transform: presetsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <div
            className="grid transition-all duration-300 ease-out"
            style={{
              gridTemplateRows: presetsOpen ? "1fr" : "0fr",
              opacity: presetsOpen ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5 grid gap-3 sm:grid-cols-2">
                {PRESETS.map((p) => {
                  const active = isPresetActive(p);
                  return (
                    <button
                      key={p.name}
                      onClick={() => togglePreset(p)}
                      className={`group rounded-sm border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-[#c0b0f0] bg-[#c0b0f0]/5"
                          : "border-white/15 hover:border-[#8ab8f0]/50"
                      }`}
                    >
                      <div className="font-serif text-base text-white">
                        {p.name} <span className="text-white/40">— {p.tag}</span>
                      </div>
                      <div className="mt-1 text-[10px] tracking-[0.2em] text-[#7fa9c8]">
                        {p.carrier}Hz · {p.beat}Hz beat
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient noise mixer — premium */}
        <div className="mt-6 overflow-hidden rounded-sm border border-white/15">
          {hasPremiumAccess ? (
            <>
              <button
                onClick={() => setAmbientOpen((p) => !p)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ AMBIENT MIX</div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[#7fa9c8]">
                    Layer environmental sound under the beat.
                  </p>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 text-[#8ab8f0] transition-transform duration-300"
                  style={{ transform: ambientOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{
                  gridTemplateRows: ambientOpen ? "1fr" : "0fr",
                  opacity: ambientOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-4 px-5 pb-5">
                    {NOISE_LAYERS.map((layer) => {
                      const v = noiseLevels[layer.id];
                      const active = v > 0;
                      return (
                        <div key={layer.id}>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <div
                                className="text-[10px] tracking-[0.3em]"
                                style={{ color: active ? "#c0b0f0" : "#7fa9c8" }}
                              >
                                {active ? "◆" : "◇"} {layer.label}
                              </div>
                              <div className="mt-0.5 text-[9px] text-[#7fa9c8]/70">
                                {layer.hint}
                              </div>
                            </div>
                            <div className="text-[10px] tabular-nums text-[#8ab8f0]">
                              {Math.round(v * 100)}%
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={v}
                            onChange={(e) => updateNoise(layer.id, parseFloat(e.target.value))}
                            className="noise-slider mt-2 w-full"
                            style={{ ["--pct" as string]: `${v * 100}%` } as React.CSSProperties}
                          />
                        </div>
                      );
                    })}
                    <div className="flex justify-center pt-1">
                      <button
                        onClick={() =>
                          setAllNoise({ white: 0, pink: 0, brown: 0, wind: 0, waves: 0 })
                        }
                        className="text-[10px] tracking-[0.3em] text-[#7fa9c8] hover:text-[#c0b0f0]"
                      >
                        ↺ RESET
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">◇ AMBIENT MIX</div>
                  <p className="mt-2 text-[10px] leading-relaxed text-[#7fa9c8]">
                    White, pink, and brown noise, wind, and ocean waves are included with Premium
                    Chamber access.
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[#c0b0f0]/35 px-2 py-1 text-[8px] tracking-[0.2em] text-[#c0b0f0]">
                  LOCKED
                </span>
              </div>
              <button
                type="button"
                onClick={unlockDemoPremium}
                className="mt-4 w-full rounded-sm border border-white/10 py-2 text-center text-[9px] font-bold tracking-[0.18em] text-[#8ab8f0]"
              >
                PURCHASE PREMIUM TO ACCESS
              </button>
            </div>
          )}
          <style>{`
            .noise-slider {
              -webkit-appearance: none;
              appearance: none;
              height: 2px;
              background: linear-gradient(
                to right,
                #c0b0f0 0%,
                #c0b0f0 var(--pct),
                rgba(255,255,255,0.15) var(--pct),
                rgba(255,255,255,0.15) 100%
              );
              outline: none;
              cursor: pointer;
            }
            .noise-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #c0b0f0;
              box-shadow: 0 0 10px #c0b0f0;
              border: 2px solid #02050d;
            }
            .noise-slider::-moz-range-thumb {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #c0b0f0;
              box-shadow: 0 0 10px #c0b0f0;
              border: 2px solid #02050d;
            }
          `}</style>
        </div>

        <p className="mt-14 text-center text-[10px] tracking-[0.3em] text-[#8ab8f0]/50">
          MAY YOUR DREAMS BE WIDE AND STARLIT.
        </p>
      </main>
    </div>
  );
}

function TimerSelect({
  label,
  value,
  values,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  values: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-center">
      <span className="mb-1 block text-[8px] tracking-[0.18em] text-[#7fa9c8]">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-12 w-full rounded-sm border border-[#c0b0f0]/35 bg-[#070411] px-2 text-center font-mono text-base tabular-nums text-white outline-none disabled:opacity-35"
      >
        {values.map((option) => (
          <option key={option} value={option}>
            {String(option).padStart(2, "0")}
          </option>
        ))}
      </select>
    </label>
  );
}

function Bubble({ color, active, speed }: { color: string; active: boolean; speed: number }) {
  return (
    <div
      className="relative h-28 w-28 rounded-full border-2"
      style={{
        borderColor: color,
        background: `radial-gradient(circle at 50% 50%, ${color}55, ${color}10 70%, transparent 75%)`,
        animation: active
          ? `pulse-ring ${Math.max(0.4, 2.4 - speed * 0.4)}s ease-in-out infinite`
          : "none",
      }}
    >
      <div
        className="absolute inset-2 rounded-full opacity-60"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, ${color}88 0 1px, transparent 1px 4px)`,
        }}
      />
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

function Slider({
  label,
  color,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
  decimals = 0,
}: {
  label: string;
  color: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  decimals?: number;
}) {
  const display = format ? format(value) : `${value.toFixed(decimals)} ${unit}`.trim();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 text-[10px] tracking-[0.3em]" style={{ color }}>
        {label} · {display}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="chamber-slider w-full"
        style={
          {
            ["--c" as string]: color,
            ["--pct" as string]: `${pct}%`,
          } as React.CSSProperties
        }
      />
      <style>{`
        .chamber-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 2px;
          background: linear-gradient(
            to right,
            var(--c) 0%,
            var(--c) var(--pct),
            rgba(255,255,255,0.18) var(--pct),
            rgba(255,255,255,0.18) 100%
          );
          outline: none;
          cursor: pointer;
        }
        .chamber-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--c);
          box-shadow: 0 0 12px var(--c);
          border: 2px solid #02050d;
        }
        .chamber-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--c);
          box-shadow: 0 0 12px var(--c);
          border: 2px solid #02050d;
        }
      `}</style>
    </div>
  );
}
