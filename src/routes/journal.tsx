import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteJournalEntry,
  getJournalStorageHealth,
  initializeJournalStorage,
  JOURNAL_ENTRIES_CHANGED_EVENT,
  loadJournalEntries,
  putJournalEntry,
  replaceJournalEntries,
  type JournalEntry as Entry,
  type JournalStorageHealth,
} from "@/lib/journal-storage";
import { createEncryptedBackup, readEncryptedBackup } from "@/lib/journal-backup";
import { canUseNativeJournalEditor, composeNativeJournal } from "@/lib/native-journal-editor";
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
  const { hasPremiumAccess, t } = useAppState();
  if (!hasPremiumAccess) {
    return (
      <PremiumLock feature={t("journal.feature")} description={t("journal.premiumDescription")} />
    );
  }
  return <JournalContent />;
}

function JournalContent() {
  const { language, t } = useAppState();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));
  const [mood, setMood] = useState<string>("");
  const [lucid, setLucid] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "updated" | "empty" | "error">(
    "idle",
  );
  const [page, setPage] = useState(1);
  const [storageHealth, setStorageHealth] = useState<JournalStorageHealth>({ warning: false });
  const [backupPassword, setBackupPassword] = useState("");
  const [backupStatus, setBackupStatus] = useState("");
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const usesNativeEditor = canUseNativeJournalEditor();

  useEffect(() => {
    initializeJournalStorage()
      .then(async () => {
        setEntries(await loadJournalEntries());
        setStorageHealth(await getJournalStorageHealth());
      })
      .catch(() => setSaveStatus("error"));
  }, []);

  useEffect(() => {
    const refreshEntries = () => {
      loadJournalEntries()
        .then(async (nextEntries) => {
          setEntries(nextEntries);
          setPage(1);
          setStorageHealth(await getJournalStorageHealth());
        })
        .catch(() => setSaveStatus("error"));
    };
    window.addEventListener(JOURNAL_ENTRIES_CHANGED_EVENT, refreshEntries);
    return () => window.removeEventListener(JOURNAL_ENTRIES_CHANGED_EVENT, refreshEntries);
  }, []);

  const saveText = async (
    title: string,
    body: string,
    entryMood = mood,
    entryLucid = lucid,
    existingEntry = editingEntry,
  ) => {
    if (!title.trim() && !body.trim()) {
      setSaveStatus("empty");
      return;
    }
    const entry: Entry = {
      id: existingEntry?.id ?? createEntryId(),
      date: existingEntry?.date ?? new Date().toISOString(),
      title: limitText(title.trim() || t("journal.untitled")),
      body: limitText(body.trim()),
      mood: entryMood,
      lucid: entryLucid,
    };
    try {
      await putJournalEntry(entry);
      setEntries((current) =>
        [entry, ...current.filter((currentEntry) => currentEntry.id !== entry.id)].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      );
      setPage(1);
      if (titleInputRef.current) titleInputRef.current.value = "";
      if (bodyInputRef.current) bodyInputRef.current.value = "";
      setMood("");
      setLucid(false);
      setEditingEntry(null);
      setSaveStatus(existingEntry ? "updated" : "saved");
      setStorageHealth(await getJournalStorageHealth());
    } catch {
      setSaveStatus("error");
    }
  };

  const save = () =>
    saveText(titleInputRef.current?.value ?? "", bodyInputRef.current?.value ?? "");

  const writeNativeDream = async () => {
    try {
      const draft = await composeNativeJournal({ title: "", body: "", mood: "", lucid: false });
      if (!draft.cancelled) await saveText(draft.title, draft.body, draft.mood, draft.lucid);
    } catch {
      setSaveStatus("error");
    }
  };

  const edit = async (entry: Entry) => {
    setSaveStatus("idle");
    if (usesNativeEditor) {
      try {
        const draft = await composeNativeJournal({
          title: entry.title,
          body: entry.body,
          mood: entry.mood,
          lucid: entry.lucid,
        });
        if (!draft.cancelled) {
          await saveText(draft.title, draft.body, draft.mood, draft.lucid, entry);
        }
      } catch {
        setSaveStatus("error");
      }
      return;
    }

    setEditingEntry(entry);
    setMood(entry.mood);
    setLucid(entry.lucid);
    if (titleInputRef.current) titleInputRef.current.value = entry.title;
    if (bodyInputRef.current) bodyInputRef.current.value = entry.body;
    document
      .querySelector(".journal-editor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => bodyInputRef.current?.focus(), 250);
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setMood("");
    setLucid(false);
    setSaveStatus("idle");
    if (titleInputRef.current) titleInputRef.current.value = "";
    if (bodyInputRef.current) bodyInputRef.current.value = "";
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    await deleteJournalEntry(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
    if (editingEntry?.id === id) cancelEdit();
  };

  const selectedEntries = useMemo(
    () => entries.filter((entry) => isSameLocalDay(new Date(entry.date), selectedDate)),
    [entries, selectedDate],
  );
  const streak = useMemo(() => calcStreak(entries), [entries]);
  const visibleEntries = useMemo(
    () => selectedEntries.slice(0, page * PAGE_SIZE),
    [selectedEntries, page],
  );

  const exportBackup = async () => {
    if (!backupPassword) {
      setBackupStatus("journal.backupEnterPassword");
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
      setBackupStatus("journal.backupExported");
    } catch {
      setBackupStatus("journal.backupExportFailed");
    }
  };

  const importBackup = async (file: File) => {
    if (!backupPassword) {
      setBackupStatus("journal.backupEnterPasswordFirst");
      return;
    }
    try {
      const imported = await readEncryptedBackup(await file.text(), backupPassword);
      await replaceJournalEntries(imported);
      setEntries(await loadJournalEntries());
      setPage(1);
      setBackupStatus("journal.backupRestored");
    } catch {
      setBackupStatus("journal.backupInvalid");
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = "";
    }
  };

  return (
    <div
      className="app-scroll-page journal-page relative min-h-screen font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
      }}
    >
      <main className="app-page-main relative mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white">
          <span className="text-[#c0b0f0]">{t("journal.titleAccent")}</span>{" "}
          {t("journal.titleRest")}
        </h1>
        <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-[#7fa9c8]">
          {t("journal.intro")}
        </p>

        {/* STREAK */}
        <div className="mt-6 flex items-center gap-4 rounded-sm border border-[#c0b0f0]/20 px-4 py-3">
          <div className="font-serif text-3xl text-white">{streak}</div>
          <div className="flex-1 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
            {streak === 1 ? t("journal.day") : t("journal.days")} {t("journal.journaled")}
            <br />
            <span className="text-[#c0b0f0]/70">{t("journal.inARow")}</span>
          </div>
        </div>

        {/* QUICK ENTRY */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
            ◆ {editingEntry ? t("journal.editing") : t("journal.section")}
          </h2>
          <div className="journal-editor space-y-3 rounded-sm border border-[#c0b0f0]/30 p-4">
            {usesNativeEditor ? (
              <button
                type="button"
                onClick={writeNativeDream}
                className="w-full rounded-sm border border-[#c0b0f0]/45 bg-[#c0b0f0]/8 px-4 py-8 text-center"
              >
                <span className="block font-serif text-2xl text-white">
                  {t("journal.writeDream")}
                </span>
                <span className="mt-2 block text-[9px] tracking-[0.25em] text-[#8ab8f0]">
                  {t("journal.nativeEditor")}
                </span>
              </button>
            ) : (
              <>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder={t("journal.titlePlaceholder")}
                  maxLength={MAX_ENTRY_TEXT_LENGTH}
                  className="journal-text-field w-full rounded-sm border border-white/10 bg-black/20 px-3 py-3 text-white placeholder:text-white/30 focus:border-[#c0b0f0]/60 focus:outline-none"
                />
                <textarea
                  ref={bodyInputRef}
                  placeholder={t("journal.bodyPlaceholder")}
                  rows={4}
                  maxLength={MAX_ENTRY_TEXT_LENGTH}
                  className="journal-text-field w-full resize-none rounded-sm border border-white/10 bg-black/20 px-3 py-3 text-[#cfe7ff] placeholder:text-white/30 focus:border-[#c0b0f0]/60 focus:outline-none"
                />
              </>
            )}

            {!usesNativeEditor && (
              <>
                <div>
                  <div className="mb-2 text-[10px] tracking-[0.25em] text-[#7fa9c8]">
                    {t("journal.mood")}
                  </div>
                  <div className="relative">
                    <select
                      aria-label={t("journal.moodAria")}
                      value={mood}
                      onChange={(event) => setMood(event.target.value)}
                      className="min-h-12 w-full appearance-none rounded-sm border border-white/15 bg-[#090713] px-4 pr-12 text-[10px] tracking-[0.24em] text-[#c0b0f0] outline-none transition focus:border-[#c0b0f0]/70"
                    >
                      <option value=""></option>
                      {MOODS.map((option) => (
                        <option key={option} value={option}>
                          {t(`mood.${option}`).toUpperCase()}
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
                    {t("journal.lucidity")}
                  </div>
                  <div className="flex gap-2">
                    {[
                      { v: true, l: t("journal.yes") },
                      { v: false, l: t("journal.no") },
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
              </>
            )}

            {!usesNativeEditor && (
              <div className={editingEntry ? "grid grid-cols-[1fr_auto] gap-2" : ""}>
                <button
                  onClick={save}
                  className="w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
                >
                  ◆ {editingEntry ? t("journal.update") : t("journal.record")}
                </button>
                {editingEntry && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-sm border border-white/15 px-4 py-2 text-[10px] tracking-[0.2em] text-[#8ab8f0]"
                  >
                    {t("journal.cancel")}
                  </button>
                )}
              </div>
            )}
            {saveStatus !== "idle" && (
              <p
                className={`text-center text-[9px] tracking-[0.25em] ${
                  saveStatus === "saved" || saveStatus === "updated"
                    ? "text-[#8ab8f0]"
                    : "text-[#e8a8d4]"
                }`}
              >
                {saveStatus === "saved"
                  ? `◆ ${t("journal.saved")}`
                  : saveStatus === "updated"
                    ? `◆ ${t("journal.updated")}`
                    : saveStatus === "empty"
                      ? t("journal.empty")
                      : t("journal.error")}
              </p>
            )}
          </div>
        </section>

        {/* ENTRIES + CALENDAR */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] tracking-[0.3em] text-[#c0b0f0]">
            ◆ {t("journal.pastDreams")}
          </h2>
          {storageHealth.warning && (
            <div className="mb-4 rounded-sm border border-[#e8a8d4]/50 p-3 text-[10px] leading-relaxed text-[#e8a8d4]">
              {t("journal.storageWarning")}
            </div>
          )}
          {!usesNativeEditor && (
            <div className="mb-4 rounded-sm border border-white/15 p-4">
              <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]">
                ◆ {t("journal.backupTitle")}
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-[#7fa9c8]">
                {t("journal.backupCopy")}
              </p>
              <input
                type="password"
                value={backupPassword}
                onChange={(event) => setBackupPassword(event.target.value)}
                placeholder={t("journal.backupPassword")}
                className="mt-3 min-h-11 w-full rounded-sm border border-white/15 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/30"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={exportBackup}
                  className="min-h-11 rounded-sm border border-[#c0b0f0]/50 text-[9px] tracking-[0.2em] text-[#c0b0f0]"
                >
                  {t("journal.export")}
                </button>
                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="min-h-11 rounded-sm border border-[#c0b0f0]/50 text-[9px] tracking-[0.2em] text-[#c0b0f0]"
                >
                  {t("journal.import")}
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
                  {t(backupStatus)}
                </p>
              )}
            </div>
          )}
          <Calendar
            entries={entries}
            selectedDate={selectedDate}
            language={language}
            t={t}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setPage(1);
            }}
          />
          <div className="mt-4 space-y-3">
            {selectedEntries.length === 0 && (
              <p className="text-center text-[11px] tracking-[0.2em] text-[#7fa9c8]/60">
                ─ {t("journal.noEntries")} {formatDayLabel(selectedDate, language)} ─
              </p>
            )}
            {visibleEntries.map((e) => (
              <div key={e.id} className="rounded-sm border border-white/15 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-serif text-lg leading-snug text-white">{e.title}</div>
                    <div className="mt-1 text-[10px] leading-relaxed tracking-[0.18em] text-[#8ab8f0]">
                      {new Date(e.date).toLocaleString(localeForLanguage(language))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3 pt-1">
                    <button
                      onClick={() => edit(e)}
                      className="text-[10px] tracking-[0.2em] text-[#8ab8f0]/80 hover:text-[#8ab8f0]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="text-[10px] tracking-[0.2em] text-[#e8a8d4]/70 hover:text-[#e8a8d4]"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                {(e.mood || e.lucid) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[9px] tracking-[0.18em]">
                    {e.mood && (
                      <span className="rounded-sm border border-[#c0b0f0]/25 bg-[#c0b0f0]/10 px-2 py-1 text-[#c0b0f0]">
                        {t(`mood.${e.mood}`).toUpperCase()}
                      </span>
                    )}
                    {e.lucid && (
                      <span className="rounded-sm border border-[#e8a8d4]/25 bg-[#e8a8d4]/10 px-2 py-1 text-[#e8a8d4]">
                        {t("journal.lucid")}
                      </span>
                    )}
                  </div>
                )}
                {e.body && (
                  <p className="mt-4 whitespace-pre-wrap border-t border-white/10 pt-3 text-[12px] leading-relaxed text-[#cfe7ff]/90">
                    {e.body}
                  </p>
                )}
              </div>
            ))}
            {selectedEntries.length > visibleEntries.length && (
              <button
                onClick={() => setPage((current) => current + 1)}
                className="min-h-12 w-full rounded-sm border border-white/15 text-[10px] tracking-[0.25em] text-[#8ab8f0]"
              >
                {t("journal.loadMore")} · {visibleEntries.length} {t("journal.of")}{" "}
                {selectedEntries.length}
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

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function isSameLocalDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
}

function localeForLanguage(language: string) {
  return language === "zh-Hans" ? "zh-Hans" : language;
}

function formatDayLabel(date: Date, language: string) {
  return date.toLocaleDateString(localeForLanguage(language), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Calendar({
  entries,
  selectedDate,
  language,
  t,
  onSelectDate,
}: {
  entries: Entry[];
  selectedDate: Date;
  language: string;
  t: (key: string) => string;
  onSelectDate: (date: Date) => void;
}) {
  const today = startOfLocalDay(new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const days = new Set(
    entries
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => dayKey(new Date(e.date))),
  );
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return (
    <div className="rounded-sm border border-white/15 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelectDate(new Date(year, month - 1, 1))}
          className="h-9 w-9 rounded-sm border border-white/10 text-[#8ab8f0]"
          aria-label={t("journal.previousMonth")}
        >
          ‹
        </button>
        <div className="text-center text-[10px] tracking-[0.3em] text-[#c0b0f0]">
          {first.toLocaleString(localeForLanguage(language), { month: "long" }).toUpperCase()}{" "}
          {year}
          <div className="mt-1 text-[8px] tracking-[0.22em] text-[#7fa9c8]/60">
            {formatDayLabel(selectedDate, language).toUpperCase()}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectDate(new Date(year, month + 1, 1))}
          className="h-9 w-9 rounded-sm border border-white/10 text-[#8ab8f0]"
          aria-label={t("journal.nextMonth")}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] tracking-[0.15em] text-[#7fa9c8]/60">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i}>{t(`journal.weekday.${i}`)}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const date = d == null ? null : new Date(year, month, d);
          const isToday = Boolean(date && isSameLocalDay(date, today));
          const isSelected = Boolean(date && isSameLocalDay(date, selectedDate));
          const has = Boolean(date && days.has(dayKey(date)));
          return (
            <button
              type="button"
              key={i}
              disabled={date == null}
              onClick={() => date && onSelectDate(date)}
              className={`relative flex aspect-square items-center justify-center rounded-sm text-[10px] transition ${
                d == null
                  ? ""
                  : isSelected
                    ? "bg-[#c0b0f0]/35 text-white ring-1 ring-[#c0b0f0]"
                    : "text-[#7fa9c8]/65 hover:bg-white/[0.04] hover:text-white"
              } ${isToday ? "ring-1 ring-[#e8a8d4]" : ""}`}
            >
              {d ?? ""}
              {has && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#e8a8d4]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
