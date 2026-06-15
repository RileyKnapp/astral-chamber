import { Capacitor } from "@capacitor/core";

type NativeJournalDraft = {
  title: string;
  body: string;
  mood: string;
  lucid: boolean;
};

type NativeJournalResult = NativeJournalDraft & { cancelled?: boolean; requestId: string };

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        astralJournal?: {
          postMessage: (message: NativeJournalDraft & { requestId: string }) => void;
        };
      };
    };
  }
}

export function canUseNativeJournalEditor() {
  return Capacitor.getPlatform() === "ios";
}

export function composeNativeJournal(draft: NativeJournalDraft) {
  return new Promise<NativeJournalResult>((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.astralJournal;
    if (!handler) {
      reject(new Error("Native journal bridge is unavailable"));
      return;
    }

    const requestId = crypto.randomUUID();
    const receiveResult = (event: Event) => {
      const result = (event as CustomEvent<NativeJournalResult>).detail;
      if (result.requestId !== requestId) return;
      window.removeEventListener("astralJournalResult", receiveResult);
      resolve(result);
    };

    window.addEventListener("astralJournalResult", receiveResult);
    handler.postMessage({ ...draft, requestId });
  });
}
