import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

type KBEntry = {
  keywords: string[];
  title: string;
  body: string;
  cta?: { label: string; to: string; params?: Record<string, string> };
};

const KB: KBEntry[] = [
  {
    keywords: ["anxious", "anxiety", "stress", "overwhelm", "panic", "calm"],
    title: "Try a slow Alpha drift.",
    body:
      "When the mind is racing, Alpha (~10 Hz) is the most reliable settle. Sit, headphones in, eyes soft. Let the hum take the foreground for ten minutes — no goal beyond that.",
    cta: { label: "Open Alpha Meadow", to: "/journeys/$slug", params: { slug: "alpha-meadow" } },
  },
  {
    keywords: ["sleep", "insomnia", "can't sleep", "bedtime", "tired"],
    title: "Drop into Delta.",
    body:
      "Delta sits below 4 Hz — the deep rest band. Lay down, turn the volume low, close your eyes. Don't try to sleep; just listen and breathe out a little longer than you breathe in.",
    cta: { label: "Open Delta Descent", to: "/journeys/$slug", params: { slug: "delta-descent" } },
  },
  {
    keywords: ["lucid", "dream", "wbtb", "mild", "wild"],
    title: "Aim for the Theta threshold.",
    body:
      "Lucid dreams cluster around Theta (~6 Hz). Use the WBTB alarm: sleep ~5 hours, wake briefly, run a short Theta session, and drift back while repeating 'next time I'm dreaming, I'll know.'",
    cta: { label: "Open Lucid Threshold", to: "/journeys/$slug", params: { slug: "lucid-threshold" } },
  },
  {
    keywords: ["astral", "projection", "out of body", "obe"],
    title: "Astral practice is patience.",
    body:
      "Most reports describe a quiet body and an alert mind. Lie still, run a long Alpha session, and notice sensations without grabbing at them. Treat it like meditation — the experience comes when you stop reaching.",
    cta: { label: "Open Astral Doorway", to: "/journeys/$slug", params: { slug: "astral-doorway" } },
  },
  {
    keywords: ["gamma", "focus", "sharp"],
    title: "What's Gamma?",
    body:
      "Gamma (~40 Hz) is associated with focus, binding, and moments of insight. Use it sparingly and earlier in the day — it tends to wake the system up rather than settle it.",
  },
  {
    keywords: ["beta", "alert", "study"],
    title: "What's Beta?",
    body:
      "Beta (~13–30 Hz) is everyday waking attention. A small Beta nudge can help with focused tasks, but heavy doses can feel jittery — use briefly.",
  },
  {
    keywords: ["alpha", "relax"],
    title: "What's Alpha?",
    body:
      "Alpha (~8–12 Hz) is the relaxed-awake state — closed eyes, easy breathing, daydream mode. The most pleasant entry point for meditation.",
  },
  {
    keywords: ["theta"],
    title: "What's Theta?",
    body:
      "Theta (~4–8 Hz) is the drowsy threshold between waking and dreaming. Where memories soften and hypnagogic images form. The lucid-dream band.",
  },
  {
    keywords: ["delta"],
    title: "What's Delta?",
    body:
      "Delta (~0.5–4 Hz) is deep dreamless sleep — the recovery band. Listen low, lie down, and don't expect to remember much.",
  },
  {
    keywords: ["binaural"],
    title: "Binaural vs Isochronic.",
    body:
      "Binaural uses two tones — one per ear — and your brain perceives the difference. Needs headphones. Isochronic pulses a single tone on and off; works on speakers but is less subtle.",
  },
  {
    keywords: ["safe", "safety", "seizure", "epilepsy"],
    title: "A safety note.",
    body:
      "If you have epilepsy, a seizure disorder, or photosensitivity, please consult a doctor before using brainwave entrainment or pulsing visuals. Never use during driving. Results vary.",
  },
];

const QUICK = [
  "I'm anxious",
  "I can't sleep",
  "I want to lucid",
  "What's gamma?",
];

export function AstralGuide() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const answer = useMemo(() => match(query), [query]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Astral Guide"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#c0b0f0]/50 bg-[#02050d]/90 text-[#c0b0f0] shadow-[0_0_30px_rgba(192,176,240,0.25)] backdrop-blur-md transition hover:border-[#c0b0f0]"
      >
        <span className="font-serif text-lg">⌬</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[#c0b0f0]/30 bg-[#070411] p-6 font-mono text-[#cfe7ff] sm:rounded-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-xl text-white">Astral Guide</div>
                <div className="text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                  A QUIET IN-APP COMPANION
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] tracking-[0.3em] text-[#7fa9c8]"
              >
                CLOSE
              </button>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ask: 'I'm anxious', 'what's theta?'"
              className="mt-5 w-full rounded-sm border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#c0b0f0] focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="rounded-sm border border-white/15 px-2 py-1 text-[10px] tracking-[0.2em] text-[#7fa9c8] hover:border-[#c0b0f0]/40"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-sm border border-[#c0b0f0]/30 p-4">
              <div className="font-serif text-base text-white">{answer.title}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#cfe7ff]/85">
                {answer.body}
              </p>
              {answer.cta && (
                <Link
                  to={answer.cta.to as "/journeys/$slug"}
                  params={answer.cta.params as { slug: string }}
                  onClick={() => setOpen(false)}
                  className="mt-3 block w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-center text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
                >
                  ◆ {answer.cta.label.toUpperCase()}
                </Link>
              )}
            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-[#7fa9c8]/70">
              The Guide reads from a small, curated knowledge base — not the open web.
              It won't make medical claims or invent facts.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function match(query: string): KBEntry {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      keywords: [],
      title: "How can I help?",
      body:
        "Tell me a mood ('anxious', 'can't sleep'), a goal ('lucid dream'), or a question ('what's gamma?'). I'll point you somewhere useful.",
    };
  }
  let best: { entry: KBEntry; score: number } | null = null;
  for (const entry of KB) {
    let score = 0;
    for (const k of entry.keywords) {
      if (q.includes(k)) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  if (best) return best.entry;
  return {
    keywords: [],
    title: "I don't have a clean answer for that.",
    body:
      "I'm intentionally small and curated. Try a mood word ('anxious', 'tired') or a band name ('alpha', 'theta', 'gamma').",
  };
}
