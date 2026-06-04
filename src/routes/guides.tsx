import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — The Astral Chamber" },
      { name: "description", content: "Practical technique guides for lucid dreaming and astral exploration." },
    ],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 font-mono text-[#cfe7ff]"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
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
          practical, honest explainers — no hype, just what works.
        </p>

        <section className="mt-8 space-y-3">
          {GUIDES.map((g) => (
            <details
              key={g.name}
              className="group rounded-sm border border-white/15 p-4 open:border-[#c0b0f0]/40"
            >
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="font-serif text-base text-white">
                  {g.name}
                </span>
                <span className="text-[10px] tracking-[0.3em] text-[#7fa9c8] group-open:hidden">
                  OPEN
                </span>
                <span className="hidden text-[10px] tracking-[0.3em] text-[#7fa9c8] group-open:inline">
                  CLOSE
                </span>
              </summary>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-[#c0b0f0]/70">
                {g.tag}
              </p>
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
    name: "MILD",
    tag: "Mnemonic Induction of Lucid Dreams",
    body: "Before falling asleep, recall a recent dream as vividly as you can. Then repeat a clear intention: \"next time I'm dreaming, I'll recognize it.\" Imagine yourself back in that dream, but this time noticing it's a dream. Hold the intention as you drift off. Works best after a WBTB wake.",
  },
  {
    name: "WILD",
    tag: "Wake-Initiated Lucid Dream",
    body: "Lie still on your back. Let your body fall asleep while your mind stays just barely awake. You may notice imagery, sounds, or vibrations — don't react, just observe. A dream scene will form around you. Step in. This one is advanced and uncomfortable at first; it's normal to fail many times before it clicks.",
  },
  {
    name: "REALITY CHECKS",
    tag: "All-day awareness training",
    body: "A few times each day, genuinely ask: \"am I dreaming?\" Then test it — try to push a finger through your palm, read text twice, or check a clock. In waking life nothing strange happens. In dreams, the test fails and you wake up inside the dream. The point isn't the check itself, it's building the habit of questioning reality.",
  },
];
