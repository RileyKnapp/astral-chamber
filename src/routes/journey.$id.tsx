import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { audioEngine, JOURNEYS } from "@/lib/audio/engine";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Orb } from "@/components/Orb";
import { Visualizer } from "@/components/Visualizer";
import { ChevronLeft, Play, Square, Headphones } from "lucide-react";

export const Route = createFileRoute("/journey/$id")({
  component: JourneyPlayer,
});

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

function JourneyPlayer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const journey = useMemo(() => JOURNEYS.find((j) => j.id === id), [id]);
  const { state } = useAudioEngine();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  if (!journey) {
    return (
      <div className="px-6 pt-20 text-center text-white/60">
        Journey not found.
      </div>
    );
  }

  const isThis = state.isPlaying && state.journeyId === journey.id;
  const { elapsed, total } = audioEngine.progress();
  const totalDur =
    total || journey.segments.reduce((a, s) => a + s.duration, 0);
  const progress = totalDur ? elapsed / totalDur : 0;
  const currentSeg =
    (isThis && journey.segments[state.segmentIndex]) || journey.segments[0];

  const start = () => {
    // CRITICAL: synchronous inside the click handler — do not await.
    audioEngine.playJourney(journey);
  };

  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative min-h-screen px-6 pt-4">
      <button
        onClick={() => navigate({ to: "/" })}
        className="flex items-center gap-1 text-sm text-white/50"
      >
        <ChevronLeft size={18} /> Journeys
      </button>

      <div className="mt-6 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70">
          {currentSeg.name}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-light tracking-wide text-white">
          {journey.title}
        </h1>
      </div>

      <div className="relative mx-auto mt-7 flex h-[300px] w-[300px] items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90"
          width="300"
          height="300"
          viewBox="0 0 300 300"
        >
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
          />
          <motion.circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            initial={false}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>
        </svg>
        <Orb beatHz={state.beatHz} active={isThis} size={220} />
      </div>

      <div className="mt-4 text-center">
        <div className="font-mono text-4xl font-extralight tracking-wider text-white">
          {state.beatHz.toFixed(2)}
          <span className="ml-2 text-base text-white/40">Hz</span>
        </div>
        <div className="mt-1 text-xs text-white/40">
          {fmt(elapsed)} / {fmt(totalDur)}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/5 bg-black/30">
        <Visualizer height={90} />
      </div>

      <ul className="mt-5 space-y-1.5">
        {journey.segments.map((s, i) => {
          const active = isThis && i === state.segmentIndex;
          return (
            <li
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                active
                  ? "bg-violet-500/15 text-white"
                  : "text-white/45"
              }`}
            >
              <span>{s.name}</span>
              <span className="font-mono">
                {s.fromBeatHz === s.toBeatHz
                  ? `${s.fromBeatHz} Hz`
                  : `${s.fromBeatHz} → ${s.toBeatHz} Hz`}{" "}
                · {Math.round(s.duration / 60)}m
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-center">
        {isThis ? (
          <button
            onClick={() => audioEngine.stop()}
            aria-label="Stop"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md"
          >
            <Square size={22} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={start}
            aria-label="Start journey"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_0_40px_rgba(180,160,255,0.55)] active:scale-95 transition-transform"
          >
            <Play size={26} fill="currentColor" className="ml-1" />
          </button>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/35">
        <Headphones size={12} /> Headphones required
      </p>
      <span className="sr-only">{tick}</span>
    </div>
  );
}
