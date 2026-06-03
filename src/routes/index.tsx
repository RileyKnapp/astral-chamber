import { createFileRoute, Link } from "@tanstack/react-router";
import { JOURNEYS } from "@/lib/audio/engine";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Journeys — Threshold" },
      {
        name: "description",
        content:
          "Frequency journeys for lucid dreaming and astral projection. Smooth ramps across alpha, theta, and delta brainwave bands.",
      },
    ],
  }),
  component: JourneysIndex,
});

function fmtTotal(secs: number) {
  return `${Math.round(secs / 60)} min`;
}

function JourneysIndex() {
  return (
    <div className="px-6 pt-12">
      <p className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70">
        Threshold
      </p>
      <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-white">
        Cross the threshold.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Frequency journeys that descend through your brainwave bands the way a
        meditative practice does — alpha into theta into the dream.
      </p>

      <ul className="mt-8 space-y-3">
        {JOURNEYS.map((j) => {
          const total = j.segments.reduce((a, s) => a + s.duration, 0);
          return (
            <li key={j.id}>
              <Link
                to="/journey/$id"
                params={{ id: j.id }}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 transition-colors hover:border-violet-400/40"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-xl text-white">{j.title}</h2>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-violet-300/80">
                    {j.band}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-white/45">
                  {fmtTotal(total)} · {j.subtitle.split("·")[1]?.trim() ?? ""}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {j.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase text-violet-300">
                  Enter <ChevronRight size={14} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-center text-[10px] tracking-[0.3em] uppercase text-white/30">
        Headphones required · stereo only
      </p>
    </div>
  );
}
