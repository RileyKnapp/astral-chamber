import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Dream Journal — Threshold" },
      {
        name: "description",
        content:
          "Capture dreams the moment you wake. The single most effective practice for building dream recall and lucidity.",
      },
    ],
  }),
  component: Journal,
});

type Entry = {
  id: string;
  ts: number;
  body: string;
  lucid: boolean;
};

const KEY = "threshold.journal";

function load(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(entries: Entry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [lucid, setLucid] = useState(false);

  useEffect(() => {
    setEntries(load());
  }, []);

  const add = () => {
    const body = draft.trim();
    if (!body) return;
    const next: Entry = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      body,
      lucid,
    };
    const updated = [next, ...entries];
    setEntries(updated);
    save(updated);
    setDraft("");
    setLucid(false);
  };

  const remove = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    save(updated);
  };

  return (
    <div className="px-6 pt-12">
      <p className="text-[11px] tracking-[0.3em] uppercase text-violet-300/70">
        Practice
      </p>
      <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-white">
        Dream Journal
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Write the instant you wake — fragments, colors, feelings. Recall
        compounds.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="I was in a place where…"
          rows={5}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={lucid}
              onChange={(e) => setLucid(e.target.checked)}
              className="h-4 w-4 accent-violet-400"
            />
            <Sparkles size={13} className="text-violet-300" />
            <span>I was lucid</span>
          </label>
          <button
            onClick={add}
            disabled={!draft.trim()}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-opacity disabled:opacity-30"
          >
            <Plus size={14} /> Save
          </button>
        </div>
      </div>

      <h2 className="mt-8 text-[11px] tracking-[0.3em] uppercase text-white/40">
        {entries.length === 0
          ? "No entries yet"
          : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
      </h2>

      <ul className="mt-3 space-y-2">
        {entries.map((e) => {
          const d = new Date(e.ts);
          const label = d.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          return (
            <li
              key={e.id}
              className="group rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/40">
                  {label}
                  {e.lucid && (
                    <span className="flex items-center gap-1 rounded-full bg-violet-400/15 px-2 py-0.5 text-violet-200">
                      <Sparkles size={10} /> lucid
                    </span>
                  )}
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="text-white/20 transition-colors hover:text-white/60"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                {e.body}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
