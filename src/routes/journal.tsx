import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShareCard } from "@/components/ShareCard";

type Entry = {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: string;
  lucid: boolean;
};

const KEY = "astral.journal.v1";
const MOODS = ["calm", "vivid", "uneasy", "blissful", "strange"];
const MAX_STORED_ENTRIES = 60;
const MAX_RENDERED_ENTRIES = 25;
const MAX_JOURNAL_STORAGE_BYTES = 200_000;
const MAX_ENTRY_TEXT_LENGTH = 6_000;

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
  const [mood, setMood] = useState<string>("calm");
  const [lucid, setLucid] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const save = () => {
    if (!title.trim() && !body.trim()) return;
    const next: Entry[] = [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        title: limitText(title.trim() || "Untitled"),
        body: limitText(body.trim()),
        mood,
        lucid,
      },
      ...entries,
    ].slice(0, MAX_STORED_ENTRIES);
    setEntries(next);
    saveEntries(next);
    setTitle("");
    setBody("");
    setMood("calm");
    setLucid(false);
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  };

  const streak = useMemo(() => calcStreak(entries), [entries]);
  const visibleEntries = useMemo(() => entries.slice(0, MAX_RENDERED_ENTRIES), [entries]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
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
          Record what came through before it dissolves.
        </p>

        {/* STREAK */}
        <div className="mt-6 flex items-center gap-4 rounded-sm border border-[#c0b0f0]/20 px-4 py-3">
          <div className="font-serif text-3xl text-white">{streak}</div>
          <div className="flex-1 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
            {streak === 1 ? "DAY" : "DAYS"} JOURNALED
            <br />
            <span className="text-[#c0b0f0]/70">In a row</span>
          </div>
          {streak > 0 && <ShareCard kind="streak" days={streak} />}
        </div>

        {/* QUICK ENTRY */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ DREAM JOURNAL</h2>
          <div className="space-y-3 rounded-sm border border-[#c0b0f0]/30 p-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of the dream"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you see..."
              rows={4}
              className="w-full resize-none bg-transparent text-sm text-[#cfe7ff] placeholder:text-white/30 focus:outline-none"
            />

            <div>
              <div className="mb-2 text-[10px] tracking-[0.25em] text-[#7fa9c8]">MOOD</div>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`rounded-sm border px-3 py-1 text-[10px] tracking-[0.2em] transition ${
                      mood === m
                        ? "border-[#c0b0f0] bg-[#c0b0f0]/20 text-white"
                        : "border-white/15 text-[#7fa9c8] hover:border-white/30"
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                LUCIDITY ACHIEVED?
              </div>
              <div className="flex gap-2">
                {[
                  { v: true, l: "YES" },
                  { v: false, l: "NO" },
                ].map((o) => (
                  <button
                    key={o.l}
                    onClick={() => setLucid(o.v)}
                    className={`flex-1 rounded-sm border py-2 text-[10px] tracking-[0.3em] transition ${
                      lucid === o.v
                        ? "border-[#c0b0f0] bg-[#c0b0f0]/20 text-white"
                        : "border-white/15 text-[#7fa9c8] hover:border-white/30"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={save}
              className="w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
            >
              ◆ RECORD
            </button>
          </div>
        </section>

        {/* ENTRIES + CALENDAR */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ PAST DREAMS</h2>
          <Calendar entries={entries} />
          <div className="mt-4 space-y-3">
            {entries.length === 0 && (
              <p className="text-center text-[11px] tracking-[0.2em] text-[#7fa9c8]/60">
                ─ no entries yet ─
              </p>
            )}
            {visibleEntries.map((e) => (
              <div key={e.id} className="rounded-sm border border-white/15 p-4">
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-base text-white">{e.title}</div>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-[10px] tracking-[0.2em] text-[#e8a8d4]/70 hover:text-[#e8a8d4]"
                  >
                    DELETE
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] tracking-[0.2em] text-[#8ab8f0]">
                  <span>{new Date(e.date).toLocaleString()}</span>
                  {e.mood && <span className="text-[#c0b0f0]">· {e.mood.toUpperCase()}</span>}
                  {e.lucid && <span className="text-[#e8a8d4]">· LUCID</span>}
                </div>
                {e.body && (
                  <p className="mt-2 whitespace-pre-wrap text-[12px] text-[#cfe7ff]/90">{e.body}</p>
                )}
              </div>
            ))}
            {entries.length > visibleEntries.length && (
              <p className="text-center text-[10px] tracking-[0.2em] text-[#7fa9c8]/60">
                Showing latest {visibleEntries.length} of {entries.length} entries.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    if (raw.length > MAX_JOURNAL_STORAGE_BYTES) {
      localStorage.removeItem(KEY);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed.map(normalizeEntry).filter((entry): entry is Entry => entry != null);
    const limited = entries.slice(0, MAX_STORED_ENTRIES);
    if (limited.length !== parsed.length) saveEntries(limited);
    return limited;
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_STORED_ENTRIES)));
  } catch {
    // Storage can be full or unavailable; keep the in-memory session usable.
  }
}

function normalizeEntry(value: unknown): Entry | null {
  if (value == null || typeof value !== "object") return null;
  const entry = value as Partial<Entry>;
  const date =
    typeof entry.date === "string" && !Number.isNaN(Date.parse(entry.date))
      ? entry.date
      : new Date().toISOString();
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID(),
    date,
    title: limitText(
      typeof entry.title === "string" && entry.title.trim() ? entry.title : "Untitled",
    ),
    body: limitText(typeof entry.body === "string" ? entry.body : ""),
    mood: typeof entry.mood === "string" && MOODS.includes(entry.mood) ? entry.mood : "calm",
    lucid: entry.lucid === true,
  };
}

function limitText(value: string) {
  return value.slice(0, MAX_ENTRY_TEXT_LENGTH);
}

function calcStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(
    entries
      .map((e) => new Date(e.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toDateString()),
  );
  let count = 0;
  const cursor = new Date();
  // allow today OR yesterday as the start of the streak
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  while (days.has(cursor.toDateString()) && count < MAX_STORED_ENTRIES) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function Calendar({ entries }: { entries: Entry[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const days = new Set(
    entries
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.date).getDate()),
  );
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return (
    <div className="rounded-sm border border-white/15 p-4">
      <div className="mb-3 text-center text-[10px] tracking-[0.3em] text-[#c0b0f0]">
        {first.toLocaleString(undefined, { month: "long" }).toUpperCase()} {year}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] tracking-[0.15em] text-[#7fa9c8]/60">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const isToday = d === today.getDate();
          const has = d != null && days.has(d);
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-sm text-[10px] ${
                d == null ? "" : has ? "bg-[#c0b0f0]/30 text-white" : "text-[#7fa9c8]/50"
              } ${isToday ? "ring-1 ring-[#e8a8d4]" : ""}`}
            >
              {d ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
