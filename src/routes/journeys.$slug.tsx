import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getJourney, interpolate, type Journey } from "@/lib/journeys";
import { ShareCard } from "@/components/ShareCard";
import { useAppState } from "@/lib/app-state";
import { NoiseMixer, NOISE_LAYERS, type NoiseLayerId } from "@/lib/noise-mixer";
import { connectContinuousAudio, type ContinuousAudioOutput } from "@/lib/continuous-audio";
import { ChevronDown } from "lucide-react";
import { PremiumLock } from "@/components/PremiumLock";
import {
  setNativeAmbientMasterVolume,
  setNativeAmbientVolume,
  startNativeJourney,
  stopNativeAmbient,
  stopNativeBinaural,
  updateNativeBinaural,
  usesNativeBinaural,
  warmNativeBinaural,
} from "@/lib/native-binaural";

const AUDIO_FADE_SECONDS = 0.06;
const JOURNEY_AMBIENT_GAIN = 0.783;

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

function brainwaveBand(beat: number) {
  if (beat < 4) return "DELTA";
  if (beat < 8) return "THETA";
  if (beat < 13) return "ALPHA";
  if (beat < 30) return "BETA";
  return "GAMMA";
}

function JourneyPage() {
  const { hasPremiumAccess, t } = useAppState();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  if (!hasPremiumAccess) {
    return (
      <PremiumLock
        feature={tr("premium.journeys.feature", "Journeys")}
        description={tr(
          "premium.journeys.description",
          "Follow curated frequency arcs for meditation, lucid dreaming, deep rest, and astral exploration with Premium Chamber access.",
        )}
      />
    );
  }
  return <JourneyContent />;
}

function JourneyContent() {
  const { journey } = Route.useLoaderData() as { journey: Journey };
  const totalSec = journey.durationMin * 60;
  const { settings, setCurrentBeat, t } = useAppState();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const journeyName = tr(`journey.${journey.slug}.name`, journey.name);
  const journeyDesc = tr(`journey.${journey.slug}.desc`, journey.desc);
  const journeyLongDesc = tr(`journey.${journey.slug}.longDesc`, journeyDesc || journey.longDesc);

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
    { name: t("journeyDetail.preset.deepFocus"), levels: { pink: 0.35, brown: 0.25 } },
    { name: t("journeyDetail.preset.oceanZen"), levels: { waves: 0.45, wind: 0.2 } },
    { name: t("journeyDetail.preset.stormyNight"), levels: { wind: 0.4, waves: 0.35, brown: 0.2 } },
    {
      name: t("journeyDetail.preset.fullImmersion"),
      levels: { pink: 0.25, brown: 0.2, wind: 0.2, waves: 0.2 },
    },
  ];

  const ctxRef = useRef<AudioContext | null>(null);
  const leftRef = useRef<OscillatorNode | null>(null);
  const rightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0); // ctx.currentTime when (re)started
  const startedWallTimeRef = useRef<number>(0);
  const elapsedOffsetRef = useRef<number>(0); // accumulated seconds before current run
  const lastUiUpdateRef = useRef<number>(0);
  const mixerRef = useRef<NoiseMixer | null>(null);
  const outputRef = useRef<ContinuousAudioOutput | null>(null);

  useEffect(() => {
    if (!usesNativeBinaural()) return;
    const timeout = window.setTimeout(() => {
      warmNativeBinaural().catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, []);

  const getJourneyNoiseLevel = (level: number) => Math.min(1, level * JOURNEY_AMBIENT_GAIN);

  const getMixer = () => {
    if (!mixerRef.current) {
      const boostedLevels = Object.fromEntries(
        Object.entries(noiseLevels).map(([id, level]) => [id, getJourneyNoiseLevel(level)]),
      ) as Record<NoiseLayerId, number>;
      mixerRef.current = new NoiseMixer(boostedLevels);
    }
    return mixerRef.current;
  };

  const setAllNoise = (next: Record<NoiseLayerId, number>) => {
    setNoiseLevels(next);
    if (usesNativeBinaural()) {
      (Object.keys(next) as NoiseLayerId[]).forEach((id) =>
        setNativeAmbientVolume(id, getJourneyNoiseLevel(next[id])).catch(() => {}),
      );
      return;
    }
    const mixer = getMixer();
    (Object.keys(next) as NoiseLayerId[]).forEach((id) =>
      mixer.setVolume(id, getJourneyNoiseLevel(next[id])),
    );
  };

  const updateNoise = (id: NoiseLayerId, v: number) => {
    setNoiseLevels((prev) => ({ ...prev, [id]: v }));
    if (usesNativeBinaural()) {
      setNativeAmbientVolume(id, getJourneyNoiseLevel(v)).catch(() => {});
      return;
    }
    getMixer().setVolume(id, getJourneyNoiseLevel(v));
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
  const currentBand = brainwaveBand(current.beat);

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
    if (usesNativeBinaural()) {
      setNativeAmbientMasterVolume(volume).catch(() => {});
    }
    if (playing && usesNativeBinaural()) {
      updateNativeBinaural(current.carrier, current.beat, volume).catch(() => {});
    }
  }, [current.beat, current.carrier, playing, volume]);

  const tick = () => {
    if (usesNativeBinaural()) {
      const e = elapsedOffsetRef.current + (Date.now() - startedWallTimeRef.current) / 1000;
      if (e >= totalSec) {
        setElapsed(totalSec);
        stop(true);
        return;
      }
      setElapsed(e);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const e = elapsedOffsetRef.current + (now - startedAtRef.current);
    if (e >= totalSec) {
      setElapsed(totalSec);
      stop(true);
      return;
    }
    // Audio progression is scheduled on the AudioContext. Updating the large
    // journey page four times per second keeps controls responsive on phones.
    if (now - lastUiUpdateRef.current >= 0.25) {
      lastUiUpdateRef.current = now;
      setElapsed(e);
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    const startElapsed = elapsed >= totalSec ? 0 : elapsed;
    if (startElapsed !== elapsed) setElapsed(startElapsed);

    if (usesNativeBinaural()) {
      elapsedOffsetRef.current = startElapsed;
      startedWallTimeRef.current = Date.now();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
      setNativeAmbientMasterVolume(volume).catch(() => {});
      (Object.keys(noiseLevels) as NoiseLayerId[]).forEach((id) => {
        if (noiseLevels[id] > 0) {
          setNativeAmbientVolume(id, getJourneyNoiseLevel(noiseLevels[id])).catch(() => {});
        }
      });
      startNativeJourney(journey.waypoints, totalSec, startElapsed, volume, journeyName).catch(
        () => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
          setPlaying(false);
        },
      );
      return;
    }

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(volume, ctx.currentTime + AUDIO_FADE_SECONDS);
    outputRef.current = connectContinuousAudio(ctx, master, journeyName);
    gainRef.current = master;
    const mixer = getMixer();
    mixer.attach(ctx, master);
    mixer.setMasterVolume(volume);

    const merger = ctx.createChannelMerger(2);
    merger.connect(master);

    const { carrier, beat } = interpolate(journey.waypoints, startElapsed / totalSec);

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
    const remaining = totalSec - startElapsed;
    const sampleCount = Math.max(2, Math.ceil(remaining / 2));
    const leftCurve = new Float32Array(sampleCount);
    const rightCurve = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const journeySecond = startElapsed + (remaining * i) / (sampleCount - 1);
      const point = interpolate(journey.waypoints, journeySecond / totalSec);
      leftCurve[i] = point.carrier;
      rightCurve[i] = point.carrier + point.beat;
    }
    left.frequency.setValueCurveAtTime(leftCurve, ctx.currentTime, remaining);
    right.frequency.setValueCurveAtTime(rightCurve, ctx.currentTime, remaining);
    left.stop(ctx.currentTime + remaining);
    right.stop(ctx.currentTime + remaining);
    left.onended = () => stop(true);
    leftRef.current = left;
    rightRef.current = right;

    if (ctx.state !== "running") ctx.resume().catch(() => {});

    elapsedOffsetRef.current = startElapsed;
    startedAtRef.current = ctx.currentTime;
    lastUiUpdateRef.current = ctx.currentTime;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = (finished = false) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (leftRef.current) leftRef.current.onended = null;
    const ctx = ctxRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const gain = gainRef.current;
    const output = outputRef.current;
    const mixer = mixerRef.current;

    if (ctx && gain) {
      const stopAt = ctx.currentTime + AUDIO_FADE_SECONDS;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, stopAt);
      try {
        left?.stop(stopAt + 0.01);
        right?.stop(stopAt + 0.01);
      } catch {
        // ignore - oscillator may already be stopped
      }
      window.setTimeout(
        () => {
          left?.disconnect();
          right?.disconnect();
          output?.dispose();
          gain.disconnect();
          mixer?.dispose();
          ctx.close().catch(() => {});
        },
        (AUDIO_FADE_SECONDS + 0.03) * 1000,
      );
    } else {
      try {
        left?.stop();
        right?.stop();
      } catch {
        // ignore - oscillator may already be stopped
      }
      left?.disconnect();
      right?.disconnect();
      output?.dispose();
      gain?.disconnect();
      mixer?.dispose();
      ctx?.close().catch(() => {});
    }
    leftRef.current = null;
    rightRef.current = null;
    gainRef.current = null;
    ctxRef.current = null;
    outputRef.current = null;
    mixerRef.current = null;
    if (usesNativeBinaural()) {
      stopNativeBinaural().catch(() => {});
      stopNativeAmbient().catch(() => {});
    }
    setCurrentBeat(settings.defaultBeat);
    setPlaying(false);
    if (finished) setElapsed(totalSec);
  };

  useEffect(() => {
    if (!playing) return;

    const resumeAudio = () => outputRef.current?.resume().catch(() => {});
    const ctx = ctxRef.current;
    const onStateChange = () => {
      if (ctx?.state === "suspended") resumeAudio();
    };

    document.addEventListener("visibilitychange", resumeAudio);
    window.addEventListener("focus", resumeAudio);
    window.addEventListener("pageshow", resumeAudio);
    if (ctx) ctx.onstatechange = onStateChange;

    return () => {
      document.removeEventListener("visibilitychange", resumeAudio);
      window.removeEventListener("focus", resumeAudio);
      window.removeEventListener("pageshow", resumeAudio);
      if (ctx) ctx.onstatechange = null;
    };
  }, [playing]);

  const reset = () => {
    if (playing) stop();
    setElapsed(0);
    elapsedOffsetRef.current = 0;
    resetAmbient();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (leftRef.current) leftRef.current.onended = null;
      try {
        leftRef.current?.stop();
        rightRef.current?.stop();
      } catch {
        // Oscillators may already be stopped.
      }
      leftRef.current?.disconnect();
      rightRef.current?.disconnect();
      outputRef.current?.dispose();
      gainRef.current?.disconnect();
      ctxRef.current?.close().catch(() => {});
      mixerRef.current?.dispose();
      if (usesNativeBinaural()) {
        stopNativeBinaural().catch(() => {});
        stopNativeAmbient().catch(() => {});
      }
      leftRef.current = null;
      rightRef.current = null;
      gainRef.current = null;
      ctxRef.current = null;
      outputRef.current = null;
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
          ← {t("journeys.title")}
        </Link>

        <h1 className="mt-6 font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
          <span className="text-[#c0b0f0]">{journeyName}</span>
        </h1>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] tracking-[0.25em] text-[#8ab8f0]">
            <span className="text-white">{journey.duration.toUpperCase()}</span>
          </p>
          <ShareCard kind="journey" name={journeyName} tag={journeyDesc} />
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-[#7fa9c8]">{journeyLongDesc}</p>

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
            {fmt(remaining)} {t("journeyDetail.remaining")}
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
          <div className="grid grid-cols-3 items-start gap-2 text-[10px] tracking-[0.22em] sm:tracking-[0.32em]">
            <div className="min-w-0 text-left text-[#8ab8f0]">
              <div>L ·</div>
              <div className="mt-2 whitespace-nowrap">{current.carrier.toFixed(1)} Hz</div>
            </div>
            <div className="min-w-0 text-center text-[#c0b0f0]">
              <div className="whitespace-nowrap">Δ {current.beat.toFixed(2)} Hz</div>
              <div className="mt-2">{currentBand}</div>
            </div>
            <div className="min-w-0 text-right text-[#e8a8d4]">
              <div>R ·</div>
              <div className="mt-2 whitespace-nowrap">
                {(current.carrier + current.beat).toFixed(1)} Hz
              </div>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="mt-8">
          <div className="mb-2 text-[10px] tracking-[0.3em] text-[#e8a8d4]">
            {t("chamber.volume")} · {Math.round(volume * 100)}%
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
            <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">
              ◆ {t("chamber.presets")}
            </div>
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
                          .map(
                            ([k, v]) =>
                              `${t(`noise.${k}.label`)} ${Math.round((v as number) * 100)}%`,
                          )
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
              <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">
                ◆ {t("chamber.ambientMix")}
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#7fa9c8]">
                {t("chamber.ambientCopy")}
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
                            {active ? "◆" : "◇"} {t(`noise.${layer.id}.label`)}
                          </div>
                          <div className="mt-0.5 text-[9px] text-[#7fa9c8]/70">
                            {t(`noise.${layer.id}.hint`)}
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
                    onClick={resetAmbient}
                    className="text-[10px] tracking-[0.3em] text-[#7fa9c8] hover:text-[#c0b0f0]"
                  >
                    ↺ {t("journeyDetail.resetAmbient")}
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
            ↺ {t("common.reset")}
          </button>
        </div>

        <p className="mt-14 text-center text-[10px] tracking-[0.3em] text-[#8ab8f0]/50">
          {t("journeyDetail.headphonesRequired")}
        </p>
      </main>
    </div>
  );
}
