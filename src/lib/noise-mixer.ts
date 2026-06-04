// Ambient noise mixer — synthesizes white/pink/brown noise plus wind, waves
// using only the Web Audio API. Each layer has its own gain node; setting volume to 0
// silences but keeps the node graph alive so the toggle feels instant.

export type NoiseLayerId = "white" | "pink" | "brown" | "wind" | "waves";

export const NOISE_LAYERS: { id: NoiseLayerId; label: string; hint: string }[] = [
  { id: "white", label: "WHITE NOISE", hint: "Bright static — masks distractions" },
  { id: "pink", label: "PINK NOISE", hint: "Softer, balanced hush" },
  { id: "brown", label: "BROWN NOISE", hint: "Deep low rumble" },
  { id: "wind", label: "WIND", hint: "Slow shifting gusts" },
  { id: "waves", label: "OCEAN WAVES", hint: "Crashing surf, slow swell" },
];

function makeNoiseBuffer(ctx: AudioContext, kind: "white" | "pink" | "brown") {
  const seconds = 4;
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (kind === "white") {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  } else if (kind === "pink") {
    // Paul Kellet's refined pink noise filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    // brown / red noise — running integral of white, scaled
    let last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

type Layer = {
  gain: GainNode;
  nodes: AudioNode[];
  sources: AudioScheduledSourceNode[];
};

export class NoiseMixer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layers = new Map<NoiseLayerId, Layer>();
  private volumes: Record<NoiseLayerId, number>;

  constructor(initial?: Partial<Record<NoiseLayerId, number>>) {
    this.volumes = {
      white: 0, pink: 0, brown: 0, wind: 0, waves: 0,
      ...initial,
    };
  }

  private ensureCtx() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    this.master = master;
    return ctx;
  }

  private buildLayer(id: NoiseLayerId): Layer {
    const ctx = this.ensureCtx();
    const gain = ctx.createGain();
    gain.gain.value = this.curve(this.volumes[id]);
    gain.connect(this.master!);

    const sources: AudioScheduledSourceNode[] = [];
    const nodes: AudioNode[] = [gain];

    if (id === "white" || id === "pink" || id === "brown") {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, id);
      src.loop = true;
      src.connect(gain);
      src.start();
      sources.push(src);
      nodes.push(src);
    } else if (id === "wind") {
      // pink noise → bandpass with slowly modulated frequency
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, "pink");
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 600;
      bp.Q.value = 0.8;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 400;
      lfo.connect(lfoGain).connect(bp.frequency);
      const ampLfo = ctx.createOscillator();
      ampLfo.frequency.value = 0.05;
      const ampGain = ctx.createGain();
      ampGain.gain.value = 0.4;
      const tremolo = ctx.createGain();
      tremolo.gain.value = 0.7;
      ampLfo.connect(ampGain).connect(tremolo.gain);
      src.connect(bp).connect(tremolo).connect(gain);
      src.start(); lfo.start(); ampLfo.start();
      sources.push(src, lfo, ampLfo);
      nodes.push(bp, lfo, lfoGain, ampLfo, ampGain, tremolo);
    } else if (id === "waves") {
      // brown noise → lowpass → slow swell envelope via LFO
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, "brown");
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 80;
      const swell = ctx.createGain();
      swell.gain.value = 0.4;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.11; // ~9s cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.45;
      lfo.connect(lfoGain).connect(swell.gain);
      // gentle filter sweep for the "spray" on the crest
      const filterLfo = ctx.createOscillator();
      filterLfo.frequency.value = 0.11;
      const filterLfoGain = ctx.createGain();
      filterLfoGain.gain.value = 600;
      filterLfo.connect(filterLfoGain).connect(lp.frequency);
      src.connect(hp).connect(lp).connect(swell).connect(gain);
      src.start(); lfo.start(); filterLfo.start();
      sources.push(src, lfo, filterLfo);
      nodes.push(hp, lp, swell, lfo, lfoGain, filterLfo, filterLfoGain);
    }

    return { gain, nodes, sources };
  }

  // Map slider 0–1 to a much gentler perceptual curve so dragging feels
  // gradual instead of slamming to full volume in the first 20%.
  private curve(v: number) {
    const clamped = Math.max(0, Math.min(1, v));
    return Math.pow(clamped, 3) * 0.55;
  }

  setVolume(id: NoiseLayerId, v: number) {
    this.volumes[id] = v;
    if (v > 0 && !this.layers.has(id)) {
      this.layers.set(id, this.buildLayer(id));
      if (this.ctx && this.ctx.state !== "running") this.ctx.resume().catch(() => {});
    }
    const layer = this.layers.get(id);
    if (layer && this.ctx) {
      layer.gain.gain.setTargetAtTime(this.curve(v), this.ctx.currentTime, 0.08);
    }
  }

  setMasterVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  getVolume(id: NoiseLayerId) {
    return this.volumes[id];
  }

  dispose() {
    this.layers.forEach((layer) => {
      layer.sources.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
      layer.nodes.forEach((n) => { try { n.disconnect(); } catch { /* already gone */ } });
    });
    this.layers.clear();
    this.master?.disconnect();
    this.master = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
