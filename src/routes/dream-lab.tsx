import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dream-lab")({
  head: () => ({ meta: [{ title: "Dream Lab — Threshold" }] }),
  component: DreamLab,
});

type Entry = {
  id: string;
  date: string; // ISO
  title: string;
  body: string;
  lucid: boolean;
  tags: string[];
};

const KEY = "threshold.journal";

function load(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function DreamLab() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<Entry>(empty());

  useEffect(() => setEntries(load()), []);

  function save(next: Entry[]) {
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function commit() {
    if (!draft.title.trim() && !draft.body.trim()) {
      setComposing(false);
      return;
    }
    save([{ ...draft, id: crypto.randomUUID() }, ...entries]);
    setDraft(empty());
    setComposing(false);
  }

  function remove(id: string) {
    save(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="px-6 pt-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extralight tracking-wide text-white">
            Dream Lab
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Catch them before they fade.
          </p>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black"
        >
          <Plus size={20} />
        </button>
      </div>

      {entries.length === 0 && !composing && (
        <div className="mt-16 text-center text-sm text-white/40">
          <p>No dreams logged yet.</p>
          <p className="mt-1 text-xs">Tap + to record one.</p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {entries.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-light text-white">
                    {e.title || "Untitled dream"}
                  </h3>
                  {e.lucid && (
                    <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-violet-200">
                      Lucid
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-white/35">
                  {new Date(e.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {e.body && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                    {e.body}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(e.id)}
                className="text-white/30 hover:text-white/60"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-md"
            onClick={() => setComposing(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="w-full rounded-t-3xl border-t border-white/10 bg-gradient-to-b from-indigo-950/95 to-black p-6"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
            >
              <h2 className="text-lg font-light text-white">New dream</h2>
              <input
                autoFocus
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
                className="mt-4 w-full border-b border-white/10 bg-transparent py-2 text-base text-white placeholder:text-white/30 focus:outline-none"
              />
              <textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="What did you see?"
                rows={6}
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
              <label className="mt-4 flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={draft.lucid}
                  onChange={(e) => setDraft({ ...draft, lucid: e.target.checked })}
                  className="h-4 w-4 accent-violet-400"
                />
                Lucid
              </label>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setComposing(false)}
                  className="flex-1 rounded-full border border-white/10 py-3 text-sm text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={commit}
                  className="flex-1 rounded-full bg-white py-3 text-sm text-black"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function empty(): Entry {
  return {
    id: "",
    date: new Date().toISOString(),
    title: "",
    body: "",
    lucid: false,
    tags: [],
  };
}
