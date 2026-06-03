import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { audioEngine, PRESETS } from "@/lib/audio/engine";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Visualizer } from "@/components/Visualizer";
import { Orb } from "@/components/Orb";
import { Play, Square, Heart, Headphones } from "lucide-react";

export const Route = createFileRoute("/mixer")({
  head: () => ({ meta: [{ title: "Mixer — Threshold" }] }),
  component: MixerPage,
});

type Fav = { name: string; beatHz: number; carrierHz: number };
const FAV_KEY = "threshold.favorites";

function loadFavs(): Fav[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

function MixerPage() {
  const { state } = useAudioEngine();

  // restore last settings
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("threshold.mixer") || "null");
      if (s) {
        audioEngine.setCarrierHz(s.carrierHz);
        audioEngine.setBeatHz(s.beatHz);
        audioEngine.setIntensity(s.intensity);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "threshold.mixer",
      JSON.stringify({
        carrierHz: state.carrierHz,
        beatHz: state.beatHz,
        intensity: state.intensity,
      }),
    );
  }, [state.carrierHz, state.beatHz, state.intensity]);

  const toggle = () => {
    if (state.isPlaying) audioEngine.stop();
    else void audioEngine.play();
  };

  const saveFav = () => {
    const favs = loadFavs();
    favs.unshift({
      name: `${state.beatHz.toFixed(1)} Hz · ${state.carrierHz} carrier`,
      beatHz: state.beatHz,
      carrierHz: state.carrierHz,
    });
    localStorage.setItem(FAV_KEY, JSON.stringify(favs.slice(0, 12)));
  };

  return (
    <div className="px-6 pt-10">
      <h1 className="text-2xl font-extralight tracking-wide text-white">Mixer</h1>
      <p className="mt-1 text-sm text-white/50">
        Sculpt your own frequency. Watch what you hear.
      </p>

      <div className="mt-6 flex justify-center">
        <Orb beatHz={state.beatHz} active={state.isPlaying} size={170} />
      </div>

      <div className="mt-4 text-center font-mono text-3xl font-extralight tracking-wider text-white">
        {state.beatHz.toFixed(2)}
        <span className="ml-2 text-sm text-white/40">Hz beat</span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-black/30">
        <Visualizer height={110} />
      </div>

      {/* Presets */}
      <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => audioEngine.setBeatHz(p.hz)}
            className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs transition-colors ${
              Math.abs(state.beatHz - p.hz) < 0.05
                ? "border-violet-300/60 bg-violet-400/15 text-white"
                : "border-white/10 text-white/60"
            }`}
          >
            <span className="font-medium">{p.name}</span>
            <span className="ml-2 text-white/40">{p.range}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-7 space-y-6">
        <SliderRow
          label="Beat frequency"
          value={state.beatHz}
          min={0.5}
          max={40}
          step={0.1}
          unit="Hz"
          onChange={(v) => audioEngine.setBeatHz(v)}
        />
        <SliderRow
          label="Carrier"
          value={state.carrierHz}
          min={80}
          max={500}
          step={1}
          unit="Hz"
          onChange={(v) => audioEngine.setCarrierHz(v)}
        />
        <SliderRow
          label="Intensity"
          value={state.intensity}
          min={0}
          max={1}
          step={0.01}
          unit=""
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => audioEngine.setIntensity(v)}
        />
        <label className="flex items-center justify-between text-sm text-white/70">
          <span>Ambient drone</span>
          <input
            type="checkbox"
            checked={state.droneOn}
            onChange={(e) => audioEngine.setDrone(e.target.checked)}
            className="h-5 w-5 accent-violet-400"
          />
        </label>
      </div>

      <div className="mt-7 flex items-center justify-center gap-4">
        <button
          onClick={saveFav}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"
          aria-label="Save favorite"
        >
          <Heart size={18} />
        </button>
        <button
          onClick={toggle}
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            state.isPlaying
              ? "border border-white/20 bg-white/5 text-white backdrop-blur-md"
              : "bg-white text-black shadow-[0_0_40px_rgba(180,160,255,0.55)]"
          }`}
        >
          {state.isPlaying ? (
            <Square size={22} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" className="ml-1" />
          )}
        </button>
        <div className="h-12 w-12" />
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/40">
        <Headphones size={12} /> Headphones required
      </p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>
        <span className="font-mono text-sm text-white">
          {format ? format(value) : `${value.toFixed(value < 10 ? 2 : 0)} ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-300"
      />
    </div>
  );
}
