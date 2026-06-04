import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Astral Chamber" },
      {
        name: "description",
        content:
          "A binaural beats chamber. Left ear hears one tone, right ear hears another, your brain hallucinates the difference.",
      },
    ],
  }),
  component: Chamber,
});

type Preset = { name: string; tag: string; carrier: number; beat: number };

const PRESETS: Preset[] = [
  { name: "DELTA", tag: "speak to the dead", carrier: 100, beat: 2.5 },
  { name: "THETA", tag: "meet your double", carrier: 136, beat: 6 },
  { name: "ALPHA", tag: "calm the moths", carrier: 200, beat: 10 },
  { name: "BETA", tag: "accept the prophecy", carrier: 240, beat: 18 },
  { name: "GAMMA", tag: "bend a spoon", carrier: 300, beat: 40 },
];

function Chamber() {
  const [carrier, setCarrier] = useState(200);
  const [beat, setBeat] = useState(10);
  const [volume, setVolume] = useState(0.15);
  const [playing, setPlaying] = useState(false);

  // Audio graph refs
  const ctxRef = useRef<AudioContext | null>(null);
  const leftRef = useRef<OscillatorNode | null>(null);
  const rightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

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
    if (!ctx || !gainRef.current) return;
    gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  }, [volume]);

  const start = () => {
    // CRITICAL: create AudioContext synchronously inside the gesture handler.
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    gainRef.current = master;

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
    try {
      leftRef.current?.stop();
      rightRef.current?.stop();
    } catch {}
    leftRef.current?.disconnect();
    rightRef.current?.disconnect();
    gainRef.current?.disconnect();
    ctxRef.current?.close().catch(() => {});
    leftRef.current = null;
    rightRef.current = null;
    gainRef.current = null;
    ctxRef.current = null;
    setPlaying(false);
  };

  const toggle = () => (playing ? stop() : start());

  const applyPreset = (p: Preset) => {
    setCarrier(p.carrier);
    setBeat(p.beat);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden font-mono text-[#cfe7ff]"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
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
          paddingBottom: "calc(env(safe-area-inset-bottom) + 3rem)",
        }}
      >
        {/* header line */}

        <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
          THE <span className="text-[#c0b0f0]">ASTRAL</span>
          <br /> CHAMBER
        </h1>

        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          headphones required. left ear hears{" "}
          <span className="text-[#cfe7ff]">{carrier.toFixed(1)} Hz</span>, right
          ear hears{" "}
          <span className="text-[#cfe7ff]">{(carrier + beat).toFixed(1)} Hz</span>
          . your brain hallucinates the difference:{" "}
          <span className="font-bold text-[#c0b0f0]">{beat.toFixed(1)} Hz</span>
          . side effects: clarity, dread, mild prophecy.
        </p>

        {/* Chamber visual */}
        <div
          className="mt-8 rounded-sm border border-[#c0b0f0]/60 p-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(192,176,240,0.04), rgba(0,0,0,0.4))",
          }}
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em]">
            <span className="text-[#8ab8f0]">L · {carrier.toFixed(1)}Hz</span>
            <span className="text-[#e8a8d4]">
              R · {(carrier + beat).toFixed(1)}Hz
            </span>
          </div>

          <div className="relative mt-4 flex h-44 items-center justify-around">
            <Bubble color="#8ab8f0" active={playing} speed={carrier / 100} />
            <Bubble
              color="#e8a8d4"
              active={playing}
              speed={(carrier + beat) / 100}
            />
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
            onChange={setVolume}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </div>

        {/* Transmit button */}
        <button
          onClick={toggle}
          className="mt-8 block w-full select-none rounded-sm border-2 border-[#c8ff3a] py-5 text-center text-sm font-bold tracking-[0.3em] text-[#0a1010] transition-all active:scale-[0.98]"
          style={{
            background: playing ? "#ff4d6d" : "#c8ff3a",
            color: playing ? "#0a0005" : "#0a1010",
            boxShadow: playing
              ? "0 0 30px rgba(255,77,109,0.5)"
              : "0 0 30px rgba(200,255,58,0.35)",
          }}
        >
          {playing ? "■ END TRANSMISSION" : "► BEGIN TRANSMISSION"}
        </button>

        <div className="my-10 border-t border-dashed border-white/10" />

        <p className="text-[10px] tracking-[0.3em] text-[#5cd1ff]">▸ PRESETS</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRESETS.map((p) => {
            const active = p.carrier === carrier && p.beat === beat;
            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`group rounded-sm border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-[#c8ff3a] bg-[#c8ff3a]/5"
                    : "border-white/15 hover:border-[#5cd1ff]/50"
                }`}
              >
                <div className="font-serif text-base text-white">
                  {p.name}{" "}
                  <span className="text-white/40">— {p.tag}</span>
                </div>
                <div className="mt-1 text-[10px] tracking-[0.2em] text-[#7fa9c8]">
                  {p.carrier}Hz · {p.beat}Hz beat
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-14 text-center text-[10px] tracking-[0.3em] text-[#5cd1ff]/50">
          IF YOU HEAR KNOCKING, IT IS NOT THE AUDIO.
        </p>
      </main>
    </div>
  );
}

function Bubble({
  color,
  active,
  speed,
}: {
  color: string;
  active: boolean;
  speed: number;
}) {
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
  const display = format
    ? format(value)
    : `${value.toFixed(decimals)} ${unit}`.trim();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div
        className="mb-2 text-[10px] tracking-[0.3em]"
        style={{ color }}
      >
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
