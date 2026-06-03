/**
 * Threshold binaural audio engine.
 *
 * Two sine oscillators panned hard-left / hard-right via a ChannelMerger.
 * The brain perceives the difference (the "beat" frequency).
 *
 * A journey is a list of segments. Each segment ramps the right oscillator's
 * frequency from carrier+fromBeatHz → carrier+toBeatHz over its duration
 * using linearRampToValueAtTime, so the perceived beat glides smoothly.
 *
 * An ambient drone (a few detuned low oscillators through a lowpass filter
 * with a gentle gain LFO) plays underneath. No audio files needed.
 */

export type JourneySegment = {
  name: string;
  duration: number; // seconds
  fromBeatHz: number;
  toBeatHz: number;
};

export type Journey = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  band: string;
  segments: JourneySegment[];
};

type Listener = (s: EngineState) => void;

export type EngineState = {
  isPlaying: boolean;
  journeyId: string | null;
  startedAt: number | null; // ctx.currentTime when play began
  beatHz: number;
  carrierHz: number;
  volume: number;
  segmentIndex: number;
};

class Engine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private left: OscillatorNode | null = null;
  private right: OscillatorNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private drone: {
    oscs: OscillatorNode[];
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;
  private currentJourney: Journey | null = null;
  private rafId: number | null = null;

  state: EngineState = {
    isPlaying: false,
    journeyId: null,
    startedAt: null,
    beatHz: 6,
    carrierHz: 200,
    volume: 0.35,
    segmentIndex: 0,
  };

  private listeners = new Set<Listener>();

  subscribe(l: Listener) {
    this.listeners.add(l);
    l({ ...this.state });
    return () => this.listeners.delete(l);
  }

  private emit() {
    const snap = { ...this.state };
    for (const l of this.listeners) l(snap);
  }

  getAnalyser() {
    return this.analyser;
  }

  /**
   * CRITICAL: must be called synchronously inside a user gesture handler
   * (no awaits before it). Returns the active AudioContext.
   */
  private ensureContextSync(): AudioContext {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    return this.ctx;
  }

  playJourney(journey: Journey) {
    if (this.state.isPlaying) this.stop();
    const ctx = this.ensureContextSync();
    if (ctx.state !== "running") ctx.resume().catch(() => {});

    const carrier = this.state.carrierHz;

    // Master + analyser
    const master = ctx.createGain();
    master.gain.value = this.state.volume;
    master.connect(ctx.destination);
    this.master = master;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    analyser.connect(master);
    this.analyser = analyser;

    // Binaural pair → merger → analyser
    const merger = ctx.createChannelMerger(2);
    merger.connect(analyser);
    this.merger = merger;

    const left = ctx.createOscillator();
    left.type = "sine";
    left.frequency.value = carrier;
    left.connect(merger, 0, 0);

    const right = ctx.createOscillator();
    right.type = "sine";
    right.frequency.value = carrier + journey.segments[0].fromBeatHz;
    right.connect(merger, 0, 1);

    left.start();
    right.start();
    this.left = left;
    this.right = right;

    // Schedule the full journey on the right oscillator's frequency
    const startTime = ctx.currentTime;
    const param = right.frequency;
    param.cancelScheduledValues(startTime);
    param.setValueAtTime(carrier + journey.segments[0].fromBeatHz, startTime);
    let t = startTime;
    for (const seg of journey.segments) {
      param.setValueAtTime(carrier + seg.fromBeatHz, t);
      param.linearRampToValueAtTime(carrier + seg.toBeatHz, t + seg.duration);
      t += seg.duration;
    }

    this.startDrone();

    this.currentJourney = journey;
    this.state.isPlaying = true;
    this.state.journeyId = journey.id;
    this.state.startedAt = startTime;
    this.state.segmentIndex = 0;
    this.state.beatHz = journey.segments[0].fromBeatHz;
    this.emit();
    this.startTicker();
  }

  stop() {
    if (!this.state.isPlaying && !this.ctx) return;
    try {
      this.left?.stop();
      this.right?.stop();
    } catch {}
    this.left?.disconnect();
    this.right?.disconnect();
    this.merger?.disconnect();
    this.analyser?.disconnect();
    this.master?.disconnect();
    this.stopDrone();

    this.left = this.right = null;
    this.merger = null;
    this.analyser = null;
    this.master = null;

    this.state.isPlaying = false;
    this.state.journeyId = null;
    this.state.startedAt = null;
    this.state.segmentIndex = 0;
    this.currentJourney = null;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.emit();
  }

  setVolume(v: number) {
    this.state.volume = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
    this.emit();
  }

  progress() {
    if (
      !this.currentJourney ||
      this.state.startedAt == null ||
      !this.ctx
    )
      return { elapsed: 0, total: 0 };
    const total = this.currentJourney.segments.reduce(
      (a, s) => a + s.duration,
      0,
    );
    const elapsed = Math.min(total, this.ctx.currentTime - this.state.startedAt);
    return { elapsed, total };
  }

  currentSegment(): JourneySegment | null {
    if (!this.currentJourney) return null;
    return (
      this.currentJourney.segments[this.state.segmentIndex] ??
      this.currentJourney.segments[0]
    );
  }

  private startDrone() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 0.7;
    gain.connect(this.master);
    filter.connect(gain);

    const freqs = [55, 55 * 1.005, 82.5, 110 * 0.997];
    const oscs = freqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(filter);
      o.start();
      return o;
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4);

    this.drone = { oscs, filter, gain, lfo, lfoGain };
  }

  private stopDrone() {
    if (!this.drone || !this.ctx) return;
    const { oscs, filter, gain, lfo, lfoGain } = this.drone;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);
    window.setTimeout(() => {
      try {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      } catch {}
      oscs.forEach((o) => o.disconnect());
      lfo.disconnect();
      lfoGain.disconnect();
      filter.disconnect();
      gain.disconnect();
    }, 900);
    this.drone = null;
  }

  private startTicker() {
    const tick = () => {
      if (!this.state.isPlaying || !this.ctx || !this.currentJourney) return;
      // Track live beat Hz from the actual oscillator delta
      if (this.left && this.right) {
        const live = this.right.frequency.value - this.left.frequency.value;
        if (Math.abs(live - this.state.beatHz) > 0.01) {
          this.state.beatHz = Math.max(0, live);
        }
      }
      // Segment index
      const elapsed = this.ctx.currentTime - (this.state.startedAt ?? 0);
      let acc = 0;
      let idx = 0;
      let total = 0;
      const segs = this.currentJourney.segments;
      for (let i = 0; i < segs.length; i++) total += segs[i].duration;
      for (let i = 0; i < segs.length; i++) {
        acc += segs[i].duration;
        if (elapsed < acc) {
          idx = i;
          break;
        }
        idx = i;
      }
      this.state.segmentIndex = idx;
      if (elapsed >= total) {
        this.emit();
        this.stop();
        return;
      }
      this.emit();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }
}

export const audioEngine = new Engine();

export const JOURNEYS: Journey[] = [
  {
    id: "descent-to-theta",
    title: "Descent to Theta",
    subtitle: "12 min · the doorway",
    band: "α → θ",
    description:
      "Begin in relaxed Alpha, glide downward across the dream band, and rest in deep Theta. The classic descent.",
    segments: [
      { name: "Alpha settle", duration: 180, fromBeatHz: 10, toBeatHz: 10 },
      { name: "Descending", duration: 240, fromBeatHz: 10, toBeatHz: 6 },
      { name: "Deep Theta", duration: 300, fromBeatHz: 4.5, toBeatHz: 4.5 },
    ],
  },
  {
    id: "wbtb-return",
    title: "Wake-Back-To-Bed",
    subtitle: "18 min · re-entry",
    band: "α → θ → δ",
    description:
      "For lucid attempts after a 4–6 hour sleep. Calm Alpha to settle, slow into Theta, brief Delta dip, lift back to dream-Theta.",
    segments: [
      { name: "Settle", duration: 180, fromBeatHz: 10, toBeatHz: 8 },
      { name: "Theta drift", duration: 360, fromBeatHz: 8, toBeatHz: 5 },
      { name: "Delta dip", duration: 240, fromBeatHz: 5, toBeatHz: 2.5 },
      { name: "Dream rise", duration: 300, fromBeatHz: 2.5, toBeatHz: 5.5 },
    ],
  },
  {
    id: "astral-gateway",
    title: "Astral Gateway",
    subtitle: "20 min · the vibrations",
    band: "θ ↔ δ",
    description:
      "A long Theta hold with brief Delta brushes — the state described by Monroe practitioners as the 'vibrational stage' before separation.",
    segments: [
      { name: "Approach", duration: 240, fromBeatHz: 8, toBeatHz: 5 },
      { name: "Vibrational hold", duration: 600, fromBeatHz: 4, toBeatHz: 4 },
      { name: "Crossing", duration: 360, fromBeatHz: 4, toBeatHz: 3 },
    ],
  },
];
