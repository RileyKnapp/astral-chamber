import type { JournalEntry } from "@/lib/journal-storage";

type EncryptedBackup = {
  version: 1;
  algorithm: "AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  data: string;
};

const ITERATIONS = 250_000;

function requireWebCrypto() {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Encrypted backups require a secure app connection.");
  }
  return crypto;
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.date === "string" &&
    !Number.isNaN(new Date(entry.date).getTime()) &&
    typeof entry.title === "string" &&
    typeof entry.body === "string" &&
    typeof entry.mood === "string" &&
    typeof entry.lucid === "boolean"
  );
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array, usage: KeyUsage[]) {
  const webCrypto = requireWebCrypto();
  const material = await webCrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return webCrypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: ITERATIONS },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    usage,
  );
}

export async function createEncryptedBackup(entries: JournalEntry[], password: string) {
  const webCrypto = requireWebCrypto();
  const salt = webCrypto.getRandomValues(new Uint8Array(16));
  const iv = webCrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ["encrypt"]);
  const payload = new TextEncoder().encode(
    JSON.stringify({ exportedAt: new Date().toISOString(), entries }),
  );
  const encrypted = await webCrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);
  const backup: EncryptedBackup = {
    version: 1,
    algorithm: "AES-GCM",
    iterations: ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(backup);
}

export async function readEncryptedBackup(
  contents: string,
  password: string,
): Promise<JournalEntry[]> {
  const webCrypto = requireWebCrypto();
  const backup = JSON.parse(contents) as EncryptedBackup;
  if (backup.version !== 1 || backup.algorithm !== "AES-GCM")
    throw new Error("Invalid backup file.");
  const salt = fromBase64(backup.salt);
  const iv = fromBase64(backup.iv);
  const key = await deriveKey(password, salt, ["decrypt"]);
  const decrypted = await webCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    fromBase64(backup.data),
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted));
  if (!Array.isArray(parsed.entries) || !parsed.entries.every(isJournalEntry)) {
    throw new Error("Invalid backup contents.");
  }
  return parsed.entries;
}
