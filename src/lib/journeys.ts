export type Waypoint = { t: number; label: string; carrier: number; beat: number };

export type Journey = {
  slug: string;
  name: string;
  duration: string;
  durationMin: number;
  desc: string;
  longDesc: string;
  waypoints: Waypoint[];
};

export const JOURNEYS: Journey[] = [
  {
    slug: "first-descent",
    name: "THE FIRST DESCENT",
    duration: "20 min",
    durationMin: 20,
    desc: "Beta → Alpha → Theta. A gentle slide into the underworld.",
    longDesc:
      "A soft staircase down from waking mind into the dreaming layer. Begins in low beta, settles through alpha, and rests in theta.",
    waypoints: [
      { t: 0, label: "Beta", carrier: 220, beat: 16 },
      { t: 0.4, label: "Alpha", carrier: 200, beat: 10 },
      { t: 1, label: "Theta", carrier: 160, beat: 6 },
    ],
  },
  {
    slug: "astral-untethering",
    name: "ASTRAL UNTETHERING",
    duration: "30 min",
    durationMin: 30,
    desc: "Sustained theta with delta pulses. For projection attempts.",
    longDesc:
      "Long, steady theta holds the body still while slow delta swells loosen the cord. Best lying down, eyes closed.",
    waypoints: [
      { t: 0, label: "Alpha", carrier: 180, beat: 9 },
      { t: 0.25, label: "Theta", carrier: 150, beat: 6 },
      { t: 0.55, label: "Theta + Delta", carrier: 140, beat: 4 },
      { t: 0.8, label: "Deep Theta", carrier: 140, beat: 5.5 },
      { t: 1, label: "Theta", carrier: 150, beat: 6 },
    ],
  },
  {
    slug: "lucid-threshold",
    name: "LUCID THRESHOLD",
    duration: "45 min",
    durationMin: 45,
    desc: "Theta-gamma coupling. Wake the dreamer inside the dream.",
    longDesc:
      "Theta keeps you in dream territory while brief gamma surges flash awareness. The body sleeps, the witness watches.",
    waypoints: [
      { t: 0, label: "Alpha", carrier: 190, beat: 10 },
      { t: 0.3, label: "Theta", carrier: 150, beat: 6 },
      { t: 0.5, label: "Theta + Gamma flash", carrier: 200, beat: 38 },
      { t: 0.55, label: "Theta", carrier: 150, beat: 6 },
      { t: 0.75, label: "Theta + Gamma flash", carrier: 200, beat: 40 },
      { t: 0.8, label: "Theta", carrier: 150, beat: 6 },
      { t: 1, label: "Theta", carrier: 160, beat: 6.5 },
    ],
  },
  {
    slug: "void-sitting",
    name: "VOID SITTING",
    duration: "60 min",
    durationMin: 60,
    desc: "Deep delta. Speak to whatever answers.",
    longDesc:
      "An hour-long descent into delta. The chatter dissolves, and what remains is the room behind the room.",
    waypoints: [
      { t: 0, label: "Alpha", carrier: 180, beat: 9 },
      { t: 0.2, label: "Theta", carrier: 150, beat: 6 },
      { t: 0.45, label: "Delta", carrier: 120, beat: 3 },
      { t: 0.75, label: "Deep Delta", carrier: 100, beat: 2 },
      { t: 1, label: "Deep Delta", carrier: 100, beat: 2 },
    ],
  },
  {
    slug: "gateway",
    name: "GATEWAY",
    duration: "60 min",
    durationMin: 60,
    desc: "A Gateway-inspired descent into expanded, deeply relaxed awareness.",
    longDesc:
      "A one-hour Gateway-inspired meditation arc for maintaining a clear witness while the body settles deeply. It begins with relaxed alpha, descends through sustained theta into a brief deep-theta threshold, opens into a spacious theta plateau, then returns gradually to alert calm. This is an original meditation journey and is not affiliated with or a reproduction of the Monroe Institute's Gateway Experience or Hemi-Sync recordings.",
    waypoints: [
      { t: 0, label: "Orientation", carrier: 220, beat: 12 },
      { t: 0.08, label: "Relaxed Focus", carrier: 200, beat: 9 },
      { t: 0.18, label: "Body Asleep", carrier: 180, beat: 7 },
      { t: 0.3, label: "Threshold", carrier: 160, beat: 5.5 },
      { t: 0.42, label: "Deep Threshold", carrier: 140, beat: 4 },
      { t: 0.5, label: "Still Point", carrier: 120, beat: 3.2 },
      { t: 0.58, label: "Expanded Awareness", carrier: 136, beat: 4.5 },
      { t: 0.72, label: "Open Field", carrier: 150, beat: 5.5 },
      { t: 0.82, label: "Clear Witness", carrier: 170, beat: 7 },
      { t: 0.92, label: "Return", carrier: 195, beat: 9 },
      { t: 1, label: "Grounded", carrier: 220, beat: 12 },
    ],
  },
  {
    slug: "golden-frequency",
    name: "GOLDEN FREQUENCY",
    duration: "12 min",
    durationMin: 12,
    desc: "528 Hz carrier. A bright reset for calm, warmth, and return.",
    longDesc:
      "A short golden pass built around a 528 Hz carrier, a tone often associated with transformation in sound-healing traditions. The beat eases from alpha into theta, then rises back into a clear resting glow.",
    waypoints: [
      { t: 0, label: "Golden Alpha", carrier: 528, beat: 10 },
      { t: 0.35, label: "Soft Theta", carrier: 528, beat: 6 },
      { t: 0.75, label: "Warm Alpha", carrier: 528, beat: 8 },
      { t: 1, label: "Golden Alpha", carrier: 528, beat: 10 },
    ],
  },
  {
    slug: "celestial-attunement",
    name: "CELESTIAL ATTUNEMENT",
    duration: "15 min",
    durationMin: 15,
    desc: "432 Hz carrier. A brief attunement for spacious calm and inner harmony.",
    longDesc:
      "A short contemplative arc centered on a 432 Hz carrier, a tuning often described in modern sound-healing traditions as gentle and harmonious. It moves from clear alpha into a quiet theta center, then returns through a soft, grounded glow.",
    waypoints: [
      { t: 0, label: "Celestial Alpha", carrier: 432, beat: 10 },
      { t: 0.22, label: "Softening", carrier: 432, beat: 8 },
      { t: 0.5, label: "Inner Harmony", carrier: 432, beat: 5.5 },
      { t: 0.72, label: "Open Sky", carrier: 432, beat: 7 },
      { t: 1, label: "Grounded Glow", carrier: 432, beat: 10 },
    ],
  },
  {
    slug: "pineal-lantern",
    name: "PINEAL LANTERN",
    duration: "18 min",
    durationMin: 18,
    desc: "963 Hz carrier. Third-eye imagery with brief gamma sparks.",
    longDesc:
      "A pineal-themed meditation using a 963 Hz carrier, a tone commonly linked with crown and pineal work in Solfeggio practice. Theta holds the doorway open while short gamma flashes add a lucid edge.",
    waypoints: [
      { t: 0, label: "Pineal Theta", carrier: 963, beat: 7 },
      { t: 0.25, label: "Deep Theta", carrier: 963, beat: 5.5 },
      { t: 0.48, label: "Gamma Spark", carrier: 963, beat: 40 },
      { t: 0.54, label: "Pineal Theta", carrier: 963, beat: 6 },
      { t: 0.78, label: "Gamma Spark", carrier: 963, beat: 38 },
      { t: 0.84, label: "Theta Return", carrier: 963, beat: 6.5 },
      { t: 1, label: "Still Point", carrier: 963, beat: 7 },
    ],
  },
  {
    slug: "intuitive-clearing",
    name: "INTUITIVE CLEARING",
    duration: "35 min",
    durationMin: 35,
    desc: "741 Hz carrier. Clear the fog before journaling or ritual.",
    longDesc:
      "A mid-length clarity arc built on a 741 Hz carrier, traditionally associated with intuition and expression. It moves from relaxed alpha into dream-adjacent theta, then briefly lifts into beta for clean recall.",
    waypoints: [
      { t: 0, label: "Open Alpha", carrier: 741, beat: 9 },
      { t: 0.3, label: "Intuitive Theta", carrier: 741, beat: 6 },
      { t: 0.6, label: "Deep Theta", carrier: 741, beat: 5 },
      { t: 0.82, label: "Recall Beta", carrier: 741, beat: 14 },
      { t: 1, label: "Clear Alpha", carrier: 741, beat: 10 },
    ],
  },
  {
    slug: "mineral-sleep",
    name: "MINERAL SLEEP",
    duration: "75 min",
    durationMin: 75,
    desc: "174 → 285 Hz carriers. A long descent for heavy-body rest.",
    longDesc:
      "A long body-rest journey using low Solfeggio carriers often framed as grounding tones. It begins in alpha, sinks through theta, and settles into a slow delta bed for sleep or deep recovery practice.",
    waypoints: [
      { t: 0, label: "Ground Alpha", carrier: 285, beat: 9 },
      { t: 0.18, label: "Body Theta", carrier: 285, beat: 6 },
      { t: 0.38, label: "Low Theta", carrier: 174, beat: 4.5 },
      { t: 0.62, label: "Delta Bed", carrier: 174, beat: 3 },
      { t: 0.86, label: "Deep Delta", carrier: 174, beat: 2 },
      { t: 1, label: "Deep Delta", carrier: 174, beat: 2 },
    ],
  },
].sort((a, b) => a.durationMin - b.durationMin);

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug);
}

export function interpolate(waypoints: Waypoint[], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const span = b.t - a.t || 1;
      const k = (clamped - a.t) / span;
      // smoothstep
      const s = k * k * (3 - 2 * k);
      return {
        carrier: a.carrier + (b.carrier - a.carrier) * s,
        beat: a.beat + (b.beat - a.beat) * s,
        label: k < 0.5 ? a.label : b.label,
      };
    }
  }
  const last = waypoints[waypoints.length - 1];
  return { carrier: last.carrier, beat: last.beat, label: last.label };
}
