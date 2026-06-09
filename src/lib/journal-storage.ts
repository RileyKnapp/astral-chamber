import { Capacitor } from "@capacitor/core";
import type { SQLiteDBConnection } from "@capacitor-community/sqlite";

export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: string;
  lucid: boolean;
};

export type JournalStorageHealth = {
  usage?: number;
  quota?: number;
  warning: boolean;
};

const DB_NAME = "astral-journal";
const STORE_NAME = "entries";
const LEGACY_KEY = "astral.journal.v1";
let nativeDatabase: Promise<SQLiteDBConnection> | null = null;

async function openWebDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" }).createIndex("date", "date");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function webRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openWebDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function getNativeDatabase() {
  if (!nativeDatabase) {
    nativeDatabase = (async () => {
      const { CapacitorSQLite, SQLiteConnection } = await import("@capacitor-community/sqlite");
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      const exists = await sqlite.isConnection(DB_NAME, false);
      const db = exists.result
        ? await sqlite.retrieveConnection(DB_NAME, false)
        : await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
      await db.open();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          mood TEXT NOT NULL,
          lucid INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS journal_entries_date ON journal_entries(date DESC);
      `);
      return db;
    })();
  }
  return nativeDatabase;
}

async function migrateLegacyEntries() {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const existing = await loadJournalEntries(false);
    const knownIds = new Set(existing.map((entry) => entry.id));
    const legacy = parsed.filter((entry): entry is JournalEntry => {
      return entry && typeof entry.id === "string" && !knownIds.has(entry.id);
    });
    for (const entry of legacy) await putJournalEntry(entry);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Leave legacy data untouched if migration cannot complete.
  }
}

export async function initializeJournalStorage() {
  if (Capacitor.isNativePlatform()) await getNativeDatabase();
  else await openWebDatabase().then((db) => db.close());
  await migrateLegacyEntries();
}

export async function loadJournalEntries(migrate = true): Promise<JournalEntry[]> {
  if (migrate) await initializeJournalStorage();
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDatabase();
    const result = await db.query(
      "SELECT id, date, title, body, mood, lucid FROM journal_entries ORDER BY date DESC",
    );
    return (result.values ?? []).map((entry) => ({
      ...entry,
      lucid: entry.lucid === 1,
    })) as JournalEntry[];
  }
  const entries = await webRequest<JournalEntry[]>("readonly", (store) => store.getAll());
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function putJournalEntry(entry: JournalEntry) {
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDatabase();
    await db.run(
      `INSERT OR REPLACE INTO journal_entries (id, date, title, body, mood, lucid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entry.id, entry.date, entry.title, entry.body, entry.mood, entry.lucid ? 1 : 0],
    );
    return;
  }
  await webRequest<IDBValidKey>("readwrite", (store) => store.put(entry));
}

export async function deleteJournalEntry(id: string) {
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDatabase();
    await db.run("DELETE FROM journal_entries WHERE id = ?", [id]);
    return;
  }
  await webRequest<undefined>("readwrite", (store) => store.delete(id));
}

export async function replaceJournalEntries(entries: JournalEntry[]) {
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDatabase();
    await db.beginTransaction();
    try {
      await db.run("DELETE FROM journal_entries");
      for (const entry of entries) {
        await db.run(
          `INSERT INTO journal_entries (id, date, title, body, mood, lucid)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [entry.id, entry.date, entry.title, entry.body, entry.mood, entry.lucid ? 1 : 0],
          false,
        );
      }
      await db.commitTransaction();
    } catch (error) {
      await db.rollbackTransaction();
      throw error;
    }
    return;
  }

  const db = await openWebDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    entries.forEach((entry) => store.put(entry));
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function clearJournalEntries() {
  localStorage.removeItem(LEGACY_KEY);
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDatabase();
    await db.run("DELETE FROM journal_entries");
    return;
  }
  await webRequest<undefined>("readwrite", (store) => store.clear());
}

export async function getJournalStorageHealth(): Promise<JournalStorageHealth> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return { warning: false };
  const { usage, quota } = await navigator.storage.estimate();
  return { usage, quota, warning: Boolean(usage && quota && usage / quota >= 0.8) };
}
