import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearJournalEntries } from "@/lib/journal-storage";

export type Intention = "sleep" | "meditate" | "lucid" | "astral";

export type Settings = {
  masterVolume: number;
  defaultCarrier: number;
  defaultBeat: number;
  nightMode: boolean;
};

export type Onboarding = {
  completed: boolean;
  disclaimerAccepted: boolean;
  intention: Intention | null;
};

const SETTINGS_KEY = "astral.settings.v1";
const ONBOARD_KEY = "astral.onboarding.v1";
const DEMO_PREMIUM_KEY = "astral.demo-premium.v1";

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.15,
  defaultCarrier: 200,
  defaultBeat: 10,
  nightMode: false,
};

const DEFAULT_ONBOARD: Onboarding = {
  completed: false,
  disclaimerAccepted: false,
  intention: null,
};

type Ctx = {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  resetData: () => void;
  onboarding: Onboarding;
  setOnboarding: (o: Partial<Onboarding>) => void;
  hasPremiumAccess: boolean;
  unlockDemoPremium: () => void;
  currentBeat: number;
  setCurrentBeat: (b: number) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [onboarding, setOnboardingState] = useState<Onboarding>(DEFAULT_ONBOARD);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number>(DEFAULT_SETTINGS.defaultBeat);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const o = localStorage.getItem(ONBOARD_KEY);
      if (o) setOnboardingState({ ...DEFAULT_ONBOARD, ...JSON.parse(o) });
      setHasPremiumAccess(localStorage.getItem(DEMO_PREMIUM_KEY) === "true");
    } catch {
      // Ignore malformed or unavailable local storage and use defaults.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarding));
  }, [onboarding, hydrated]);

  // toggle night mode body class
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("night-mode", settings.nightMode);
  }, [settings.nightMode]);

  // expose beat to CSS for aurora pulse syncing
  useEffect(() => {
    if (typeof document === "undefined") return;
    const period = Math.max(0.25, Math.min(8, 1 / Math.max(0.5, currentBeat)));
    // ~visual pulse one cycle every (period * 8) seconds — beat is too fast to render at raw rate
    const visualPeriod = Math.max(1.2, Math.min(6, 8 / Math.max(0.5, currentBeat) + 1));
    document.documentElement.style.setProperty("--beat-period", `${visualPeriod}s`);
    document.documentElement.style.setProperty("--beat-raw", String(period));
  }, [currentBeat]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      setSettings: (s) => setSettingsState((prev) => ({ ...prev, ...s })),
      resetData: () => {
        try {
          localStorage.removeItem(SETTINGS_KEY);
          localStorage.removeItem(ONBOARD_KEY);
          localStorage.removeItem(DEMO_PREMIUM_KEY);
          localStorage.removeItem("astral.account.v1");
          localStorage.removeItem("astral.journal.v1");
          void clearJournalEntries();
        } catch {
          // Storage may be unavailable in private or restricted WebViews.
        }
        setSettingsState(DEFAULT_SETTINGS);
        setOnboardingState(DEFAULT_ONBOARD);
        setHasPremiumAccess(false);
      },
      onboarding,
      setOnboarding: (o) => setOnboardingState((prev) => ({ ...prev, ...o })),
      hasPremiumAccess,
      unlockDemoPremium: () => {
        localStorage.setItem(DEMO_PREMIUM_KEY, "true");
        setHasPremiumAccess(true);
      },
      currentBeat,
      setCurrentBeat,
    }),
    [settings, onboarding, hasPremiumAccess, currentBeat],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export const INTENTION_TO_JOURNEY: Record<Intention, string> = {
  sleep: "void-sitting",
  meditate: "first-descent",
  lucid: "lucid-threshold",
  astral: "astral-untethering",
};

export const INTENTION_TO_PRESET: Record<Intention, { carrier: number; beat: number }> = {
  sleep: { carrier: 100, beat: 2.5 },
  meditate: { carrier: 200, beat: 10 },
  lucid: { carrier: 136, beat: 6 },
  astral: { carrier: 200, beat: 10 },
};
