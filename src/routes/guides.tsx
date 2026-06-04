import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — The Astral Chamber" },
      {
        name: "description",
        content: "Practical technique guides for lucid dreaming and astral exploration.",
      },
    ],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <main
        className="relative mx-auto max-w-3xl px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)" }}
      >
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white">
          <span className="text-[#c0b0f0]">TECHNIQUE</span> GUIDES
        </h1>
        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          Practical, honest explainers — no hype, just what works.
        </p>

        <section className="mt-8 space-y-3">
          {GUIDES.map((g) => (
            <details
              key={g.name}
              className="group rounded-sm border border-white/15 p-4 open:border-[#c0b0f0]/40"
            >
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="font-serif text-base text-white">{g.name}</span>
                <span className="text-[10px] tracking-[0.3em] text-[#7fa9c8] group-open:hidden">
                  OPEN
                </span>
                <span className="hidden text-[10px] tracking-[0.3em] text-[#7fa9c8] group-open:inline">
                  CLOSE
                </span>
              </summary>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-[#c0b0f0]/70">{g.tag}</p>
              <p className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[#cfe7ff]/90">
                {g.body}
              </p>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}

const GUIDES = [
  {
    name: "HEADPHONES & VOLUME",
    tag: "The chamber only works in stereo",
    body: "Use headphones. Binaural beats need one tone in the left ear and a slightly different tone in the right. Keep the volume low enough that your body can relax around it. If the sound feels sharp, tiring, or stressful, lower it or stop. The best setting usually feels almost too quiet at first.",
  },
  {
    name: "BINAURAL BASICS",
    tag: "Two tones, one perceived pulse",
    body: "A binaural beat is not a sound in the room. It is the difference your brain perceives between two steady tones. A 200 Hz tone in one ear and a 210 Hz tone in the other creates a 10 Hz pulse in perception. Treat it like a meditation anchor: useful, subtle, and personal.",
  },
  {
    name: "MILD",
    tag: "Mnemonic Induction of Lucid Dreams",
    body: "Before falling asleep, recall a recent dream as vividly as you can. Then repeat a clear intention: \"Next time I'm dreaming, I'll recognize it.\" Imagine yourself back in that dream, but this time noticing it's a dream. Hold the intention as you drift off. Works best after a WBTB wake.",
  },
  {
    name: "WILD",
    tag: "Wake-Initiated Lucid Dream",
    body: "Lie still on your back. Let your body fall asleep while your mind stays just barely awake. You may notice imagery, sounds, or vibrations — don't react, just observe. A dream scene will form around you. Step in. This one is advanced and uncomfortable at first; it's normal to fail many times before it clicks.",
  },
  {
    name: "REALITY CHECKS",
    tag: "All-day awareness training",
    body: "A few times each day, genuinely ask: \"Am I dreaming?\" Then test it — try to push a finger through your palm, read text twice, or check a clock. In waking life nothing strange happens. In dreams, the test fails and you wake up inside the dream. The point isn't the check itself, it's building the habit of questioning reality.",
  },
  {
    name: "WBTB",
    tag: "Wake-Back-To-Bed",
    body: "Sleep for four and a half to six hours, wake gently, then stay up just long enough for the mind to become clear. Keep the room dim. Read an intention, start a theta journey if you like, then return to sleep. This is one of the strongest windows for lucid practice because REM is closer to the surface.",
  },
  {
    name: "DREAM JOURNALING",
    tag: "Catch the signal before it fades",
    body: "Write something down as soon as you wake, even if it is only an image, a color, or a feeling. Titles help your mind index the dream. Mood helps you see patterns. Over time, repeated places, people, and impossibilities become signs you can recognize from inside the dream.",
  },
  {
    name: "USING JOURNEYS",
    tag: "Choose the arc, then let go",
    body: "Pick a journey by intention, not by force. Shorter alpha and theta sessions are better for practice and focus. Longer delta sessions are better for deep rest. Start low, use headphones, and let the sound become background. Chasing an experience usually pushes it farther away.",
  },
  {
    name: "SAFETY",
    tag: "Stay grounded",
    body: "Astral Chamber is a relaxation and meditation aid. Do not use sessions while driving or operating machinery. If you have epilepsy, a seizure disorder, or photosensitivity, talk with a doctor before using brainwave entrainment or pulsing visuals. Stop if you feel uncomfortable.",
  },
];
