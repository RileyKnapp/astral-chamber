import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Entry = { id: string; date: string; title: string; body: string };

const KEY = "astral.journal.v1";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Dream Lab — The Astral Chamber" },
      { name: "description", content: "Record what came through." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    if (!title.trim() && !body.trim()) return;
    const next: Entry[] = [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        title: title.trim() || "untitled",
        body: body.trim(),
      },
      ...entries,
    ];
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setTitle("");
    setBody("");
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

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
          <span className="text-[#c0b0f0]">DREAM</span> LAB
        </h1>
        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          record what came through before it dissolves.
        </p>

        <div className="mt-8 space-y-3 rounded-sm border border-[#c0b0f0]/30 p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title of the dream"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="what did you see..."
            rows={4}
            className="w-full resize-none bg-transparent text-sm text-[#cfe7ff] placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={save}
            className="w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
          >
            ◆ RECORD
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {entries.length === 0 && (
            <p className="text-center text-[11px] tracking-[0.2em] text-[#7fa9c8]/60">
              ─ no entries yet ─
            </p>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-sm border border-white/15 p-4"
            >
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-base text-white">{e.title}</div>
                <button
                  onClick={() => remove(e.id)}
                  className="text-[10px] tracking-[0.2em] text-[#e8a8d4]/70 hover:text-[#e8a8d4]"
                >
                  DELETE
                </button>
              </div>
              <div className="mt-1 text-[10px] tracking-[0.2em] text-[#8ab8f0]">
                {new Date(e.date).toLocaleString()}
              </div>
              {e.body && (
                <p className="mt-2 whitespace-pre-wrap text-[12px] text-[#cfe7ff]/90">
                  {e.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
