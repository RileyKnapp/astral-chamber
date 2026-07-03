import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

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
const NATIVE_KEY = "astral.journal.entries.v2";
export const JOURNAL_ENTRIES_CHANGED_EVENT = "astral:journal-entries-changed";

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

async function loadNativeEntries(): Promise<JournalEntry[]> {
  const { value } = await Preferences.get({ key: NATIVE_KEY });
  if (!value) return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

async function saveNativeEntries(entries: JournalEntry[]) {
  await Preferences.set({ key: NATIVE_KEY, value: JSON.stringify(entries) });
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
  if (!Capacitor.isNativePlatform()) await openWebDatabase().then((db) => db.close());
  await migrateLegacyEntries();
}

export async function loadJournalEntries(migrate = true): Promise<JournalEntry[]> {
  if (migrate) await initializeJournalStorage();
  if (Capacitor.isNativePlatform()) {
    return (await loadNativeEntries()).sort((a, b) => b.date.localeCompare(a.date));
  }
  const entries = await webRequest<JournalEntry[]>("readonly", (store) => store.getAll());
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function putJournalEntry(entry: JournalEntry) {
  if (Capacitor.isNativePlatform()) {
    const entries = await loadNativeEntries();
    await saveNativeEntries([entry, ...entries.filter((existing) => existing.id !== entry.id)]);
    return;
  }
  await webRequest<IDBValidKey>("readwrite", (store) => store.put(entry));
}

export async function deleteJournalEntry(id: string) {
  if (Capacitor.isNativePlatform()) {
    await saveNativeEntries((await loadNativeEntries()).filter((entry) => entry.id !== id));
    return;
  }
  await webRequest<undefined>("readwrite", (store) => store.delete(id));
}

export async function replaceJournalEntries(entries: JournalEntry[]) {
  if (Capacitor.isNativePlatform()) {
    await saveNativeEntries(entries);
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
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Local storage can be unavailable in restricted WebViews.
  }

  const clearNative = Preferences.remove({ key: NATIVE_KEY }).catch(() => {});
  const clearWeb =
    typeof indexedDB === "undefined"
      ? Promise.resolve()
      : webRequest<undefined>("readwrite", (store) => store.clear()).catch(() => {});

  await Promise.all([clearNative, clearWeb]);
}

export async function getJournalStorageHealth(): Promise<JournalStorageHealth> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return { warning: false };
  const { usage, quota } = await navigator.storage.estimate();
  return { usage, quota, warning: Boolean(usage && quota && usage / quota >= 0.8) };
}
