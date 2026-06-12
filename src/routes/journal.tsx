import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShareCard } from "@/components/ShareCard";
import {
  deleteJournalEntry,
  getJournalStorageHealth,
  initializeJournalStorage,
  loadJournalEntries,
  putJournalEntry,
  replaceJournalEntries,
  type JournalEntry as Entry,
  type JournalStorageHealth,
} from "@/lib/journal-storage";
import { createEncryptedBackup, readEncryptedBackup } from "@/lib/journal-backup";
import { PremiumLock } from "@/components/PremiumLock";
import { useAppState } from "@/lib/app-state";

const MOODS = [
  "calm",
  "beautiful",
  "exciting",
  "enlightening",
  "blissful",
  "peaceful",
  "joyful",
  "inspiring",
  "mysterious",
  "surreal",
  "vivid",
  "nostalgic",
  "emotional",
  "intense",
  "uneasy",
  "strange",
];
const PAGE_SIZE = 20;
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
  const { hasPremiumAccess } = useAppState();
  if (!hasPremiumAccess) {
    return (
      <PremiumLock
        feature="Dream Lab"
        description="Record dreams, track lucid streaks, and keep encrypted local backups with Premium Chamber access."
      />
    );
  }
  return <JournalContent />;
}

function JournalContent() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<string>("calm");
  const [lucid, setLucid] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "empty" | "error">("idle");
  const [page, setPage] = useState(1);
  const [storageHealth, setStorageHealth] = useState<JournalStorageHealth>({ warning: false });
  const [backupPassword, setBackupPassword] = useState("");
  const [backupStatus, setBackupStatus] = useState("");
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    initializeJournalStorage()
      .then(async () => {
        setEntries(await loadJournalEntries());
        setStorageHealth(await getJournalStorageHealth());
      })
      .catch(() => setSaveStatus("error"));
  }, []);

  const save = async () => {
    if (!title.trim() && !body.trim()) {
      setSaveStatus("empty");
      return;
    }
    const entry: Entry = {
      id: createEntryId(),
      date: new Date().toISOString(),
      title: limitText(title.trim() || "Untitled"),
      body: limitText(body.trim()),
      mood,
      lucid,
    };
    try {
      await putJournalEntry(entry);
      setEntries((current) => [entry, ...current]);
      setPage(1);
      setTitle("");
      setBody("");
      setMood("calm");
      setLucid(false);
      setSaveStatus("saved");
      setStorageHealth(await getJournalStorageHealth());
    } catch {
      setSaveStatus("error");
    }
  };

  const remove = async (id: string) => {
    await deleteJournalEntry(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const streak = useMemo(() => calcStreak(entries), [entries]);
  const visibleEntries = useMemo(() => entries.slice(0, page * PAGE_SIZE), [entries, page]);

  const exportBackup = async () => {
    if (!backupPassword) {
      setBackupStatus("ENTER A BACKUP PASSWORD");
      return;
    }
    try {
      const contents = await createEncryptedBackup(entries, backupPassword);
      const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `astral-dreams-${new Date().toISOString().slice(0, 10)}.astralbackup`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupStatus("ENCRYPTED BACKUP EXPORTED");
    } catch {
      setBackupStatus("BACKUP EXPORT FAILED");
    }
  };

  const importBackup = async (file: File) => {
    if (!backupPassword) {
      setBackupStatus("ENTER THE BACKUP PASSWORD FIRST");
      return;
    }
    try {
      const imported = await readEncryptedBackup(await file.text(), backupPassword);
      await replaceJournalEntries(imported);
      setEntries(await loadJournalEntries());
      setPage(1);
      setBackupStatus("ENCRYPTED BACKUP RESTORED");
    } catch {
      setBackupStatus("WRONG PASSWORD OR INVALID BACKUP");
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <main className="app-page-main relative mx-auto max-w-3xl px-6">
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
              onInput={() => setSaveStatus("idle")}
              placeholder="Title of the dream"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onInput={() => setSaveStatus("idle")}
              placeholder="What did you see..."
              rows={4}
              className="w-full resize-none bg-transparent text-sm text-[#cfe7ff] placeholder:text-white/30 focus:outline-none"
            />

            <div>
              <div className="mb-2 text-[10px] tracking-[0.25em] text-[#7fa9c8]">MOOD</div>
              <div className="relative">
                <select
                  aria-label="Dream mood"
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  className="min-h-12 w-full appearance-none rounded-sm border border-white/15 bg-[#090713] px-4 pr-12 text-[10px] tracking-[0.24em] text-[#c0b0f0] outline-none transition focus:border-[#c0b0f0]/70"
                >
                  {MOODS.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#8ab8f0]">
                  ▾
                </span>
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
            {saveStatus !== "idle" && (
              <p
                className={`text-center text-[9px] tracking-[0.25em] ${
                  saveStatus === "saved" ? "text-[#8ab8f0]" : "text-[#e8a8d4]"
                }`}
              >
                {saveStatus === "saved"
                  ? "◆ DREAM RECORDED"
                  : saveStatus === "empty"
                    ? "WRITE SOMETHING FIRST"
                    : "COULD NOT SAVE ON THIS DEVICE"}
              </p>
            )}
          </div>
        </section>

        {/* ENTRIES + CALENDAR */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ PAST DREAMS</h2>
          {storageHealth.warning && (
            <div className="mb-4 rounded-sm border border-[#e8a8d4]/50 p-3 text-[10px] leading-relaxed text-[#e8a8d4]">
              DEVICE STORAGE IS ABOVE 80%. EXPORT A BACKUP AND FREE SPACE SO NEW DREAMS CAN SAVE.
            </div>
          )}
          <div className="mb-4 rounded-sm border border-white/15 p-4">
            <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">◆ ENCRYPTED BACKUP</div>
            <p className="mt-1 text-[9px] leading-relaxed text-[#7fa9c8]">
              Your password encrypts the backup. It cannot be recovered if forgotten.
            </p>
            <input
              type="password"
              value={backupPassword}
              onChange={(event) => setBackupPassword(event.target.value)}
              placeholder="Backup password"
              className="mt-3 min-h-11 w-full rounded-sm border border-white/15 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/30"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={exportBackup}
                className="min-h-11 rounded-sm border border-[#c0b0f0]/50 text-[9px] tracking-[0.2em] text-[#c0b0f0]"
              >
                EXPORT
              </button>
              <button
                onClick={() => backupInputRef.current?.click()}
                className="min-h-11 rounded-sm border border-[#c0b0f0]/50 text-[9px] tracking-[0.2em] text-[#c0b0f0]"
              >
                IMPORT
              </button>
              <input
                ref={backupInputRef}
                type="file"
                accept=".astralbackup,application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importBackup(file);
                }}
              />
            </div>
            {backupStatus && (
              <p className="mt-3 text-center text-[9px] tracking-[0.2em] text-[#8ab8f0]">
                {backupStatus}
              </p>
            )}
          </div>
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
              <button
                onClick={() => setPage((current) => current + 1)}
                className="min-h-12 w-full rounded-sm border border-white/15 text-[10px] tracking-[0.25em] text-[#8ab8f0]"
              >
                LOAD MORE · {visibleEntries.length} OF {entries.length}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function createEntryId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dream-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  while (days.has(cursor.toDateString()) && count < entries.length) {
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
