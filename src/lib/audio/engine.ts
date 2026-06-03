/**
 * Threshold binaural audio engine.
 *
 * Two sine oscillators are routed through a ChannelMergerNode so the
 * left oscillator is isolated to the left channel and the right
 * oscillator to the right channel. The brain perceives the difference
 * (beat frequency).
 *
 * ⚠️ Background audio limitation: web browsers suspend the AudioContext
 * when the screen locks or the tab is backgrounded. For a true sleep
 * experience this engine should be wrapped by a native background-audio
 * plugin (e.g. capacitor-background-audio or a custom Capacitor plugin)
 * when packaged with Capacitor. All audio side-effects are isolated in
 * this file so that swap is a single-surface change.
 */

export type JourneySegment = {
  name: string;
  /** Duration in seconds */
  duration: number;
  /** Beat Hz at the START of this segment */
  fromBeatHz: number;
  /** Beat Hz at the END of this segment (linear ramp) */
  toBeatHz: number;
};

export type Journey = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  segments: JourneySegment[];
};

export type EngineState = {
  isPlaying: boolean;
  beatHz: number;
  carrierHz: number;
  intensity: number; // 0..1
  droneOn: boolean;
  journey: Journey | null;
  journeyStartedAt: number | null; // audioContext.currentTime
  currentSegmentIndex: number;
};

type Listener = (s: EngineState) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Ambient drone graph
  private droneNodes: {
    oscs: OscillatorNode[];
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;

  private listeners = new Set<Listener>();
  private rafId: number | null = null;

  state: EngineState = {
    isPlaying: false,
    beatHz: 6,
    carrierHz: 200,
    intensity: 0.4,
    droneOn: true,
    journey: null,
    journeyStartedAt: null,
    currentSegmentIndex: 0,
  };

  subscribe(l: Listener) {
    this.listeners.add(l);
    l({ ...this.state });
    return () => this.listeners.delete(l);
  }

  private emit() {
    // Pass a fresh object so React's setState doesn't bail out on ref equality.
    const snapshot = { ...this.state };
    for (const l of this.listeners) l(snapshot);
  }

  getAnalyser() {
    return this.analyser;
  }

  getContext() {
    return this.ctx;
  }

  private ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctor =
      typeof window !== "undefined"
        ? (window.AudioContext || (window as any).webkitAudioContext)
        : null;
    if (!Ctor) throw new Error("Web Audio not supported");
    this.ctx = new Ctor();
    return this.ctx;
  }

  async play() {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn("[Threshold] AudioContext.resume() failed", e);
      }
    }
    if (ctx.state !== "running") {
      console.warn(
        "[Threshold] AudioContext is " +
          ctx.state +
          " — audio is blocked. If you're inside the Lovable preview pane, open the preview in a new tab (the embedded iframe blocks audio).",
      );
    }
    if (this.state.isPlaying) return;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = this.state.intensity;
    master.connect(ctx.destination);
    this.masterGain = master;

    // Analyser pre-master so we see the actual mixed signal
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.85;
    analyser.connect(master);
    this.analyser = analyser;

    // Binaural pair → merger → analyser
    const merger = ctx.createChannelMerger(2);
    merger.connect(analyser);
    this.merger = merger;

    const left = ctx.createOscillator();
    left.type = "sine";
    left.frequency.value = this.state.carrierHz;
    left.connect(merger, 0, 0); // left channel only

    const right = ctx.createOscillator();
    right.type = "sine";
    right.frequency.value = this.state.carrierHz + this.state.beatHz;
    right.connect(merger, 0, 1); // right channel only

    left.start();
    right.start();
    this.leftOsc = left;
    this.rightOsc = right;

    if (this.state.droneOn) this.startDrone();

    this.state.isPlaying = true;
    this.emit();
    this.startTicker();
  }

  stop() {
    if (!this.state.isPlaying) return;
    try {
      this.leftOsc?.stop();
      this.rightOsc?.stop();
    } catch {}
    this.leftOsc?.disconnect();
    this.rightOsc?.disconnect();
    this.merger?.disconnect();
    this.analyser?.disconnect();
    this.masterGain?.disconnect();
    this.leftOsc = this.rightOsc = null;
    this.merger = null;
    this.analyser = null;
    this.masterGain = null;
    this.stopDrone();
    this.state.isPlaying = false;
    this.state.journey = null;
    this.state.journeyStartedAt = null;
    this.state.currentSegmentIndex = 0;
    this.emit();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  setBeatHz(hz: number) {
    this.state.beatHz = hz;
    // If a journey is running, manual change cancels it
    if (this.state.journey) {
      this.state.journey = null;
      this.state.journeyStartedAt = null;
      this.state.currentSegmentIndex = 0;
    }
    if (this.rightOsc && this.ctx) {
      this.rightOsc.frequency.cancelScheduledValues(this.ctx.currentTime);
      this.rightOsc.frequency.setTargetAtTime(
        this.state.carrierHz + hz,
        this.ctx.currentTime,
        0.05,
      );
    }
    this.emit();
  }

  setCarrierHz(hz: number) {
    this.state.carrierHz = hz;
    if (this.leftOsc && this.ctx) {
      this.leftOsc.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.05);
    }
    if (this.rightOsc && this.ctx) {
      this.rightOsc.frequency.setTargetAtTime(
        hz + this.state.beatHz,
        this.ctx.currentTime,
        0.05,
      );
    }
    this.emit();
  }

  setIntensity(v: number) {
    this.state.intensity = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
    this.emit();
  }

  setDrone(on: boolean) {
    this.state.droneOn = on;
    if (on && this.state.isPlaying && !this.droneNodes) this.startDrone();
    else if (!on) this.stopDrone();
    this.emit();
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    gain.connect(this.masterGain);
    filter.connect(gain);

    const baseFreqs = [55, 55 * 1.005, 82.5, 110 * 0.997];
    const oscs = baseFreqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(filter);
      o.start();
      return o;
    });

    // Gentle gain LFO
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    // Ramp drone in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3);

    this.droneNodes = { oscs, filter, gain, lfo, lfoGain };
  }

  private stopDrone() {
    if (!this.droneNodes || !this.ctx) return;
    const { oscs, filter, gain, lfo, lfoGain } = this.droneNodes;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => {
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
    this.droneNodes = null;
  }

  async playJourney(j: Journey) {
    if (this.state.isPlaying) this.stop();
    // Initialize at first segment's starting Hz
    this.state.beatHz = j.segments[0].fromBeatHz;
    await this.play();
    if (!this.ctx || !this.rightOsc) return;
    const ctx = this.ctx;
    const startTime = ctx.currentTime;
    const param = this.rightOsc.frequency;
    param.cancelScheduledValues(startTime);
    param.setValueAtTime(this.state.carrierHz + j.segments[0].fromBeatHz, startTime);

    let t = startTime;
    for (const seg of j.segments) {
      param.setValueAtTime(this.state.carrierHz + seg.fromBeatHz, t);
      param.linearRampToValueAtTime(
        this.state.carrierHz + seg.toBeatHz,
        t + seg.duration,
      );
      t += seg.duration;
    }

    this.state.journey = j;
    this.state.journeyStartedAt = startTime;
    this.state.currentSegmentIndex = 0;
    this.emit();
  }

  private startTicker() {
    const tick = () => {
      if (!this.state.isPlaying || !this.ctx) return;
      // Track live beat Hz from oscillator value
      if (this.rightOsc && this.leftOsc) {
        const live =
          this.rightOsc.frequency.value - this.leftOsc.frequency.value;
        if (Math.abs(live - this.state.beatHz) > 0.01) {
          this.state.beatHz = Math.max(0, live);
        }
      }
      // Journey segment tracking
      if (this.state.journey && this.state.journeyStartedAt != null) {
        const elapsed = this.ctx.currentTime - this.state.journeyStartedAt;
        let acc = 0;
        let idx = 0;
        let totalDur = 0;
        for (let i = 0; i < this.state.journey.segments.length; i++) {
          totalDur += this.state.journey.segments[i].duration;
        }
        for (let i = 0; i < this.state.journey.segments.length; i++) {
          acc += this.state.journey.segments[i].duration;
          if (elapsed < acc) {
            idx = i;
            break;
          }
          idx = i;
        }
        this.state.currentSegmentIndex = idx;
        if (elapsed >= totalDur) {
          // Journey complete — keep playing at final Hz
          this.state.journey = null;
          this.state.journeyStartedAt = null;
        }
      }
      this.emit();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  journeyProgress(): { elapsed: number; total: number } {
    if (!this.state.journey || this.state.journeyStartedAt == null || !this.ctx)
      return { elapsed: 0, total: 0 };
    const total = this.state.journey.segments.reduce((a, s) => a + s.duration, 0);
    const elapsed = Math.min(
      total,
      this.ctx.currentTime - this.state.journeyStartedAt,
    );
    return { elapsed, total };
  }
}

export const audioEngine = new AudioEngine();

export const PRESETS = [
  { name: "Delta", hz: 2.5, desc: "Deep sleep", range: "0.5–4 Hz" },
  { name: "Theta", hz: 6, desc: "Dreams · meditation", range: "4–8 Hz" },
  { name: "Alpha", hz: 10, desc: "Relaxed awareness", range: "8–12 Hz" },
  { name: "Beta", hz: 18, desc: "Alert focus", range: "12–30 Hz" },
  { name: "Gamma", hz: 40, desc: "Peak focus", range: "40 Hz" },
] as const;

export const JOURNEYS: Journey[] = [
  {
    id: "descent-to-theta",
    title: "Descent to Theta",
    subtitle: "12 min · the doorway",
    description:
      "Begin in relaxed Alpha, glide downward into the dream band, and rest in deep Theta.",
    segments: [
      { name: "Alpha settle", duration: 180, fromBeatHz: 10, toBeatHz: 10 },
      { name: "Descending", duration: 240, fromBeatHz: 10, toBeatHz: 6 },
      { name: "Deep Theta", duration: 300, fromBeatHz: 4.5, toBeatHz: 4.5 },
    ],
  },
];
