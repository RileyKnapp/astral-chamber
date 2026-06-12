import { createFileRoute, Link } from "@tanstack/react-router";
import { JOURNEYS } from "@/lib/journeys";
import { PremiumLock } from "@/components/PremiumLock";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/journeys/")({
  head: () => ({
    meta: [
      { title: "Journeys — The Astral Chamber" },
      { name: "description", content: "Guided binaural journeys." },
    ],
  }),
  component: JourneysPage,
});

function JourneysPage() {
  const { hasPremiumAccess } = useAppState();
  if (!hasPremiumAccess) {
    return (
      <PremiumLock
        feature="Journeys"
        description="Follow curated frequency arcs for meditation, lucid dreaming, deep rest, and astral exploration with Premium Chamber access."
      />
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <main className="app-page-main relative mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white">
          <span className="text-[#c0b0f0]">JOURNEYS</span>
        </h1>
        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          Curated frequency arcs. Each one moves you somewhere specific. Headphones required.
        </p>

        <div className="mt-8 space-y-3">
          {JOURNEYS.map((j) => (
            <Link
              key={j.slug}
              to="/journeys/$slug"
              params={{ slug: j.slug }}
              className="block w-full rounded-sm border border-white/15 p-4 text-left transition-colors hover:border-[#c0b0f0]/50"
            >
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-lg text-white">{j.name}</div>
                <div className="text-[10px] tracking-[0.2em] text-[#8ab8f0]">{j.duration}</div>
              </div>
              <div className="mt-1 text-[11px] text-[#7fa9c8]">{j.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
