import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getJourney, interpolate, type Journey } from "@/lib/journeys";
import { ShareCard } from "@/components/ShareCard";
import { useAppState } from "@/lib/app-state";
import { NoiseMixer, NOISE_LAYERS, type NoiseLayerId } from "@/lib/noise-mixer";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/journeys/$slug")({
  head: ({ params }) => {
    const j = getJourney(params.slug);
    return {
      meta: [
        { title: j ? `${j.name} — The Astral Chamber` : "Journey" },
        { name: "description", content: j?.desc ?? "Binaural journey." },
      ],
    };
  },
  loader: ({ params }) => {
    const journey = getJourney(params.slug);
    if (!journey) throw notFound();
    return { journey };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-black p-10 font-mono text-[#cfe7ff]">
      <p className="mb-6">Journey not found.</p>
      <Link to="/journeys" className="text-[#c0b0f0] underline">
        ← Back to journeys
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-black p-10 font-mono text-[#cfe7ff]">{error.message}</div>
  ),
  component: JourneyPage,
});

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function JourneyPage() {
  const { journey } = Route.useLoaderData() as { journey: Journey };
  const totalSec = journey.durationMin * 60;
  const { settings, setCurrentBeat } = useAppState();

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [volume, setVolume] = useState(settings.masterVolume);
  const [noiseLevels, setNoiseLevels] = useState<Record<NoiseLayerId, number>>({
    white: 0,
    pink: 0,
    brown: 0,
    wind: 0,
    waves: 0,
  });
  const [ambientOpen, setAmbientOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);

  const presets: { name: string; levels: Partial<Record<NoiseLayerId, number>> }[] = [
    { name: "Deep Focus", levels: { pink: 0.35, brown: 0.25 } },
    { name: "Ocean Zen", levels: { waves: 0.45, wind: 0.2 } },
    { name: "Stormy Night", levels: { wind: 0.4, waves: 0.35, brown: 0.2 } },
    { name: "Full Immersion", levels: { pink: 0.25, brown: 0.2, wind: 0.2, waves: 0.2 } },
  ];

  const ctxRef = useRef<AudioContext | null>(null);
  const leftRef = useRef<OscillatorNode | null>(null);
  const rightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0); // ctx.currentTime when (re)started
  const elapsedOffsetRef = useRef<number>(0); // accumulated seconds before current run
  const mixerRef = useRef<NoiseMixer | null>(null);

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

  const ALL_IDS: NoiseLayerId[] = ["white", "pink", "brown", "wind", "waves"];

  const isPresetActive = (levels: Partial<Record<NoiseLayerId, number>>) =>
    ALL_IDS.every((id) => Math.abs((noiseLevels[id] ?? 0) - (levels[id] ?? 0)) < 0.001);

  const togglePreset = (levels: Partial<Record<NoiseLayerId, number>>) => {
    const empty: Record<NoiseLayerId, number> = { white: 0, pink: 0, brown: 0, wind: 0, waves: 0 };
    if (isPresetActive(levels)) {
      setAllNoise(empty);
      return;
    }
    const next: Record<NoiseLayerId, number> = { ...empty };
    ALL_IDS.forEach((id) => {
      next[id] = levels[id] ?? 0;
    });
    setAllNoise(next);
  };

  const resetAmbient = () => {
    setAllNoise({ white: 0, pink: 0, brown: 0, wind: 0, waves: 0 });
  };

  const current = interpolate(journey.waypoints, elapsed / totalSec);

  // sync aurora pulse to current beat
  useEffect(() => {
    if (playing) setCurrentBeat(current.beat);
  }, [playing, current.beat, setCurrentBeat]);

  // Volume live update
  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx && gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    }
    mixerRef.current?.setMasterVolume(volume);
  }, [volume]);

  const tick = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const e = elapsedOffsetRef.current + (now - startedAtRef.current);
    if (e >= totalSec) {
      setElapsed(totalSec);
      stop(true);
      return;
    }
    setElapsed(e);
    const { carrier, beat } = interpolate(journey.waypoints, e / totalSec);
    if (leftRef.current && rightRef.current) {
      leftRef.current.frequency.setTargetAtTime(carrier, now, 0.2);
      rightRef.current.frequency.setTargetAtTime(carrier + beat, now, 0.2);
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    gainRef.current = master;

    const merger = ctx.createChannelMerger(2);
    merger.connect(master);

    const { carrier, beat } = interpolate(journey.waypoints, elapsed / totalSec);

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

    if (ctx.state !== "running") ctx.resume().catch(() => {});

    elapsedOffsetRef.current = elapsed;
    startedAtRef.current = ctx.currentTime;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = (finished = false) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      leftRef.current?.stop();
      rightRef.current?.stop();
    } catch {
      // ignore - oscillator may already be stopped
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
    if (finished) setElapsed(totalSec);
  };

  const reset = () => {
    if (playing) stop();
    setElapsed(0);
    elapsedOffsetRef.current = 0;
    resetAmbient();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        leftRef.current?.stop();
        rightRef.current?.stop();
      } catch {
        // Oscillators may already be stopped.
      }
      leftRef.current?.disconnect();
      rightRef.current?.disconnect();
      gainRef.current?.disconnect();
      ctxRef.current?.close().catch(() => {});
      mixerRef.current?.dispose();
      leftRef.current = null;
      rightRef.current = null;
      gainRef.current = null;
      ctxRef.current = null;
      mixerRef.current = null;
      setCurrentBeat(settings.defaultBeat);
    };
  }, [setCurrentBeat, settings.defaultBeat]);

  const progress = Math.min(1, elapsed / totalSec);
  const remaining = totalSec - elapsed;

  return (
    <div
      className="relative min-h-screen overflow-hidden font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <main
        className="relative mx-auto max-w-2xl px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 2rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)",
        }}
      >
        <Link
          to="/journeys"
          className="text-[10px] tracking-[0.3em] text-[#8ab8f0] hover:text-[#c0b0f0]"
        >
          ← JOURNEYS
        </Link>

        <h1 className="mt-6 font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
          <span className="text-[#c0b0f0]">{journey.name}</span>
        </h1>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] tracking-[0.25em] text-[#8ab8f0]">
            <span className="text-white">{journey.duration.toUpperCase()}</span> ·{" "}
            {journey.waypoints.map((w) => w.label).join(" → ")}
          </p>
          <ShareCard kind="journey" name={journey.name} tag={journey.desc} />
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-[#7fa9c8]">{journey.longDesc}</p>

        {/* Big play button */}
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={() => (playing ? stop() : start())}
            aria-label={playing ? "Pause" : "Play"}
            className="group relative grid h-44 w-44 place-items-center rounded-full border-2 transition-all active:scale-[0.97]"
            style={{
              borderColor: playing ? "#e8a8d4" : "#c0b0f0",
              background: `radial-gradient(circle, ${
                playing ? "rgba(232,168,212,0.18)" : "rgba(192,176,240,0.15)"
              }, transparent 70%)`,
              boxShadow: playing
                ? "0 0 60px rgba(232,168,212,0.45)"
                : "0 0 60px rgba(192,176,240,0.35)",
            }}
          >
            <span className="text-5xl" style={{ color: playing ? "#e8a8d4" : "#c0b0f0" }}>
              {playing ? "❚❚" : "▶"}
            </span>
            {playing && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: "1px solid rgba(192,176,240,0.4)",
                  animation: "ring 2.4s ease-out infinite",
                }}
              />
            )}
          </button>
          <style>{`
            @keyframes ring {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>

          <div className="mt-6 font-serif text-2xl text-white tabular-nums">
            {fmt(elapsed)} <span className="text-white/30">/ {fmt(totalSec)}</span>
          </div>
          <div className="mt-1 text-[10px] tracking-[0.3em] text-[#8ab8f0]">
            {fmt(remaining)} REMAINING
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full transition-[width] duration-300 ease-linear"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(to right, #8ab8f0, #c0b0f0, #e8a8d4)",
                boxShadow: "0 0 12px rgba(192,176,240,0.6)",
              }}
            />
          </div>
          {/* Waypoint ticks */}
          <div className="relative mt-1 h-2">
            {journey.waypoints.map((w) => (
              <div
                key={`tick-${w.t}-${w.label}`}
                className="absolute top-0 h-1.5 w-px bg-[#7fa9c8]/50"
                style={{ left: `${w.t * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Live state */}
        <div
          className="mt-10 rounded-sm border border-[#c0b0f0]/40 p-5"
          style={{
            background: "linear-gradient(180deg, rgba(192,176,240,0.04), rgba(0,0,0,0.4))",
          }}
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.25em]">
            <span className="text-[#8ab8f0]">L · {current.carrier.toFixed(1)} Hz</span>
            <span className="text-[#c0b0f0]">
              Δ {current.beat.toFixed(2)} Hz · {current.label.toUpperCase()}
            </span>
            <span className="text-[#e8a8d4]">
              R · {(current.carrier + current.beat).toFixed(1)} Hz
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="mt-8">
          <div className="mb-2 text-[10px] tracking-[0.3em] text-[#e8a8d4]">
            VOLUME · {Math.round(volume * 100)}%
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="journey-slider w-full"
            style={
              {
                ["--pct" as string]: `${volume * 100}%`,
              } as React.CSSProperties
            }
          />
          <style>{`
            .journey-slider {
              -webkit-appearance: none;
              appearance: none;
              height: 2px;
              background: linear-gradient(
                to right,
                #e8a8d4 0%,
                #e8a8d4 var(--pct),
                rgba(255,255,255,0.18) var(--pct),
                rgba(255,255,255,0.18) 100%
              );
              outline: none;
              cursor: pointer;
            }
            .journey-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #e8a8d4;
              box-shadow: 0 0 12px #e8a8d4;
              border: 2px solid #02050d;
            }
            .journey-slider::-moz-range-thumb {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #e8a8d4;
              box-shadow: 0 0 12px #e8a8d4;
              border: 2px solid #02050d;
            }
          `}</style>
        </div>

        {/* Presets */}
        <div className="mt-10 rounded-sm border border-white/15 overflow-hidden">
          <button
            onClick={() => setPresetsOpen((p) => !p)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ PRESETS</div>
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
              <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
                {presets.map((p) => {
                  const active = isPresetActive(p.levels);
                  return (
                    <button
                      key={p.name}
                      onClick={() => togglePreset(p.levels)}
                      className={`rounded-sm border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                        active
                          ? "border-[#c0b0f0] bg-[#c0b0f0]/10"
                          : "border-white/10 bg-white/[0.03] hover:border-[#c0b0f0]/40 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="text-[10px] tracking-[0.2em] text-[#cfe7ff]">
                        {active ? "◆" : "◇"} {p.name}
                      </div>
                      <div className="mt-1 text-[9px] text-[#7fa9c8]/70">
                        {Object.entries(p.levels)
                          .map(([k, v]) => `${k} ${Math.round((v as number) * 100)}%`)
                          .join(" · ")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient noise mixer */}
        <div className="mt-6 rounded-sm border border-white/15 overflow-hidden">
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
                          <div className="mt-0.5 text-[9px] text-[#7fa9c8]/70">{layer.hint}</div>
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
                    onClick={resetAmbient}
                    className="text-[10px] tracking-[0.3em] text-[#7fa9c8] hover:text-[#c0b0f0]"
                  >
                    ↺ RESET AMBIENT MIX
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        <div className="mt-6 flex justify-center">
          <button
            onClick={reset}
            className="text-[10px] tracking-[0.3em] text-[#7fa9c8] hover:text-[#c0b0f0]"
          >
            ↺ RESET
          </button>
        </div>

        <p className="mt-14 text-center text-[10px] tracking-[0.3em] text-[#8ab8f0]/50">
          HEADPHONES REQUIRED.
        </p>
      </main>
    </div>
  );
}
