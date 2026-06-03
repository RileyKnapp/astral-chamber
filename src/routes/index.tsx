import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { JOURNEYS } from "@/lib/audio/engine";
import { Orb } from "@/components/Orb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Journeys — Threshold" },
      {
        name: "description",
        content:
          "Guided binaural journeys that smoothly glide between brainwave states.",
      },
    ],
  }),
  component: JourneysPage,
});

function JourneysPage() {
  const navigate = useNavigate();
  return (
    <div className="px-6 pt-10">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-violet-300/70">
          Threshold
        </p>
        <h1 className="mt-2 text-3xl font-extralight tracking-wide text-white">
          Cross the doorway.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Guided frequency journeys for lucid dreaming, astral travel, and deep
          rest.
        </p>
      </header>

      <div className="mb-10 flex justify-center">
        <Orb beatHz={6} active={false} size={200} />
      </div>

      <h2 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-white/40">
        Journeys
      </h2>
      <ul className="space-y-3">
        {JOURNEYS.map((j) => (
          <motion.li
            key={j.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate({ to: "/journey/$id", params: { id: j.id } })}
            className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-light text-white">{j.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-violet-300/60">
                  {j.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {j.description}
                </p>
              </div>
              <div className="mt-1 text-white/30">→</div>
            </div>
          </motion.li>
        ))}
      </ul>

      <p className="mt-10 text-center text-[11px] tracking-wide text-white/30">
        No fake frequencies — watch them yourself.
      </p>
    </div>
  );
}
