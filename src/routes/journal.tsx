import { createFileRoute, Link } from "@tanstack/react-router";
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
        mood,
        lucid,
      },
      ...entries,
    ];
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setTitle("");
    setBody("");
    setMood("calm");
    setLucid(false);
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const streak = useMemo(() => calcStreak(entries), [entries]);

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

        {/* STREAK */}
        <div className="mt-6 flex items-center gap-4 rounded-sm border border-[#c0b0f0]/20 px-4 py-3">
          <div className="font-serif text-3xl text-white">{streak}</div>
          <div className="flex-1 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
            {streak === 1 ? "DAY" : "DAYS"} JOURNALED
            <br />
            <span className="text-[#c0b0f0]/70">in a row</span>
          </div>
          {streak > 0 && <ShareCard kind="streak" days={streak} />}
        </div>

        {/* QUICK ENTRY */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
            ◆ DREAM JOURNAL
          </h2>
          <div className="space-y-3 rounded-sm border border-[#c0b0f0]/30 p-4">
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

            <div>
              <div className="mb-2 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                MOOD
              </div>
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
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
            ◆ PAST DREAMS
          </h2>
          <Calendar entries={entries} />
          <div className="mt-4 space-y-3">
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
                  <div className="font-serif text-base text-white">
                    {e.title}
                  </div>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-[10px] tracking-[0.2em] text-[#e8a8d4]/70 hover:text-[#e8a8d4]"
                  >
                    DELETE
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] tracking-[0.2em] text-[#8ab8f0]">
                  <span>{new Date(e.date).toLocaleString()}</span>
                  {e.mood && (
                    <span className="text-[#c0b0f0]">· {e.mood.toUpperCase()}</span>
                  )}
                  {e.lucid && (
                    <span className="text-[#e8a8d4]">· LUCID</span>
                  )}
                </div>
                {e.body && (
                  <p className="mt-2 whitespace-pre-wrap text-[12px] text-[#cfe7ff]/90">
                    {e.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* WBTB ALARM */}
        <section className="mt-12">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
            ◆ WAKE-BACK-TO-BED ALARM
          </h2>
          <WbtbAlarm />
        </section>

      </main>
    </div>
  );
}

function calcStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(
    entries.map((e) => new Date(e.date).toDateString())
  );
  let count = 0;
  const cursor = new Date();
  // allow today OR yesterday as the start of the streak
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  while (days.has(cursor.toDateString())) {
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
      .map((e) => new Date(e.date).getDate())
  );
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return (
    <div className="rounded-sm border border-white/15 p-4">
      <div className="mb-3 text-center text-[10px] tracking-[0.3em] text-[#c0b0f0]">
        {first.toLocaleString(undefined, { month: "long" }).toUpperCase()}{" "}
        {year}
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
                d == null
                  ? ""
                  : has
                  ? "bg-[#c0b0f0]/30 text-white"
                  : "text-[#7fa9c8]/50"
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

function WbtbAlarm() {
  const [bedtime, setBedtime] = useState("23:00");
  const [hours, setHours] = useState(5);
  const [armed, setArmed] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState<"idle" | "waking" | "return">("idle");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const wakeAt = useMemo(() => {
    const [h, m] = bedtime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    return d;
  }, [bedtime, hours]);

  useEffect(() => {
    if (!armed || phase !== "idle") return;
    if (now >= wakeAt.getTime()) {
      setPhase("waking");
      try {
        if ("vibrate" in navigator) navigator.vibrate?.([400, 200, 400, 200, 400]);
      } catch {}
    }
  }, [armed, now, wakeAt, phase]);

  const remaining = Math.max(0, wakeAt.getTime() - now);
  const hh = Math.floor(remaining / 3600000);
  const mm = Math.floor((remaining % 3600000) / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="space-y-4 rounded-sm border border-[#c0b0f0]/30 p-4">
      <p className="text-[12px] leading-relaxed text-[#cfe7ff]/80">
        Wake-Back-To-Bed is a classic lucid dreaming technique: you sleep
        through your first cycles, then wake briefly during a REM-rich window
        (~4.5–6 hours in), let your mind become alert while your body stays
        sleepy, then drift back down — often straight into a lucid dream. We'll
        nudge you awake, play a Theta journey to hold you at the threshold,
        and then guide you back under.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[10px] tracking-[0.25em] text-[#7fa9c8]">
            BEDTIME
          </span>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="mt-1 w-full rounded-sm border border-white/15 bg-transparent px-2 py-2 text-sm text-white focus:border-[#c0b0f0] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.25em] text-[#7fa9c8]">
            WAKE AFTER (HRS)
          </span>
          <input
            type="number"
            min={4.5}
            max={6}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-1 w-full rounded-sm border border-white/15 bg-transparent px-2 py-2 text-sm text-white focus:border-[#c0b0f0] focus:outline-none"
          />
        </label>
      </div>

      <div className="rounded-sm border border-white/10 px-3 py-2 text-[11px] tracking-[0.2em] text-[#8ab8f0]">
        WAKE AT ·{" "}
        <span className="text-white">
          {wakeAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {phase === "idle" && (
        <button
          onClick={() => setArmed((a) => !a)}
          className={`w-full rounded-sm border py-3 text-[10px] font-bold tracking-[0.3em] ${
            armed
              ? "border-[#e8a8d4] bg-transparent text-[#e8a8d4]"
              : "border-[#c0b0f0] bg-[#c0b0f0] text-[#0a1010]"
          }`}
        >
          {armed ? `◇ ARMED · ${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : "◆ ARM ALARM"}
        </button>
      )}

      {phase === "waking" && (
        <div className="space-y-3 rounded-sm border border-[#e8a8d4]/50 bg-[#e8a8d4]/5 p-4 text-center">
          <div className="font-serif text-2xl text-white">wake gently</div>
          <p className="text-[12px] text-[#cfe7ff]/80">
            Stay still. Eyes closed. Let the Theta carry you.
          </p>
          <Link
            to="/journeys/$slug"
            params={{ slug: "lucid-threshold" }}
            className="block w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
          >
            ◆ PLAY THETA JOURNEY
          </Link>
          <button
            onClick={() => setPhase("return")}
            className="w-full rounded-sm border border-white/20 py-2 text-[10px] tracking-[0.3em] text-[#cfe7ff]"
          >
            RETURN TO SLEEP
          </button>
        </div>
      )}

      {phase === "return" && (
        <div className="space-y-3 rounded-sm border border-[#c0b0f0]/40 p-4 text-center">
          <div className="font-serif text-2xl text-white">drift back</div>
          <p className="text-[12px] text-[#cfe7ff]/80">
            Repeat silently: <span className="text-[#c0b0f0]">"next time I'm dreaming, I'll know."</span>{" "}
            Let your body fall. Keep the mind a candle.
          </p>
          <button
            onClick={() => {
              setArmed(false);
              setPhase("idle");
            }}
            className="w-full rounded-sm border border-white/20 py-2 text-[10px] tracking-[0.3em] text-[#cfe7ff]"
          >
            END SESSION
          </button>
        </div>
      )}
    </div>
  );
}

