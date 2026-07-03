import { Capacitor, registerPlugin } from "@capacitor/core";

type NativeJournalExportPlugin = {
  shareJournalExport(options: {
    fileName: string;
    contents: string;
  }): Promise<{ completed: boolean }>;
};

const NativeJournalExport = registerPlugin<NativeJournalExportPlugin>("NativeJournalExport");

export function canUseNativeJournalExport() {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("NativeJournalExport");
}

export function shareNativeJournalExport(fileName: string, contents: string) {
  return NativeJournalExport.shareJournalExport({ fileName, contents });
}
