import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canUseApplePurchases,
  loadLifetimeProduct,
  purchaseLifetimeAccess,
  refreshLifetimeAccess,
  restoreLifetimeAccess,
  type PurchaseProduct,
} from "@/lib/apple-purchases";
import { clearJournalEntries } from "@/lib/journal-storage";
import {
  LANGUAGE_AUTO,
  getDeviceLanguages,
  isSupportedLanguage,
  resolveLanguage,
  translate,
  type AppLanguage,
  type LanguageSetting,
} from "@/lib/i18n";

export type Intention = "sleep" | "meditate" | "lucid" | "astral";

export type Settings = {
  masterVolume: number;
  defaultCarrier: number;
  defaultBeat: number;
  nightMode: boolean;
  language: LanguageSetting;
};

export type Onboarding = {
  completed: boolean;
  disclaimerAccepted: boolean;
  intention: Intention | null;
};

const SETTINGS_KEY = "astral.settings.v1";
const ONBOARD_KEY = "astral.onboarding.v1";
const PREMIUM_ACCESS_KEY = "astral.premium-access.v1";

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.15,
  defaultCarrier: 200,
  defaultBeat: 10,
  nightMode: false,
  language: LANGUAGE_AUTO,
};

const DEFAULT_ONBOARD: Onboarding = {
  completed: false,
  disclaimerAccepted: false,
  intention: null,
};

type Ctx = {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  language: AppLanguage;
  t: typeof translate;
  resetData: () => void;
  resetOnboarding: () => void;
  onboarding: Onboarding;
  setOnboarding: (o: Partial<Onboarding>) => void;
  hasPremiumAccess: boolean;
  purchaseProduct: PurchaseProduct | null;
  purchaseStatus: "idle" | "loading" | "purchasing" | "restoring";
  purchaseError: string | null;
  loadPurchaseProduct: () => Promise<void>;
  purchaseLifetime: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  bypassPremiumForTesting: () => void;
  currentBeat: number;
  setCurrentBeat: (b: number) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [deviceLanguages, setDeviceLanguages] = useState<string[]>(["en"]);
  const [onboarding, setOnboardingState] = useState<Onboarding>(DEFAULT_ONBOARD);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [purchaseProduct, setPurchaseProduct] = useState<PurchaseProduct | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<Ctx["purchaseStatus"]>("idle");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState<number>(DEFAULT_SETTINGS.defaultBeat);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettingsState({ ...DEFAULT_SETTINGS, ...normalizeSettings(JSON.parse(s)) });
      const o = localStorage.getItem(ONBOARD_KEY);
      if (o) setOnboardingState({ ...DEFAULT_ONBOARD, ...JSON.parse(o) });
      setHasPremiumAccess(localStorage.getItem(PREMIUM_ACCESS_KEY) === "true");
    } catch {
      // Ignore malformed or unavailable local storage and use defaults.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    setDeviceLanguages(getDeviceLanguages());
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const language = useMemo(
    () => resolveLanguage(settings.language, deviceLanguages),
    [settings.language, deviceLanguages],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarding));
  }, [onboarding, hydrated]);

  const applyPremiumAccess = useCallback(
    (hasAccess: boolean, options?: { clearSavedAccess?: boolean }) => {
      setHasPremiumAccess(hasAccess);
      try {
        if (hasAccess) {
          localStorage.setItem(PREMIUM_ACCESS_KEY, "true");
        } else if (options?.clearSavedAccess) {
          localStorage.removeItem(PREMIUM_ACCESS_KEY);
        }
      } catch {
        // Storage may be unavailable in private or restricted WebViews.
      }
      if (hasAccess) {
        setOnboardingState((prev) => ({
          ...prev,
          disclaimerAccepted: true,
          completed: true,
        }));
      }
    },
    [],
  );

  const loadPurchaseProduct = useCallback(async () => {
    if (!canUseApplePurchases() || purchaseProduct) return;
    setPurchaseStatus("loading");
    setPurchaseError(null);
    try {
      const result = await loadLifetimeProduct();
      if (result?.product) setPurchaseProduct(result.product);
      if (result?.hasLifetimeAccess) applyPremiumAccess(true);
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : String(error));
    } finally {
      setPurchaseStatus("idle");
    }
  }, [applyPremiumAccess, purchaseProduct]);

  useEffect(() => {
    if (!hydrated || hasPremiumAccess || !canUseApplePurchases()) return;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      refreshLifetimeAccess()
        .then((result) => {
          if (!cancelled && canUseApplePurchases() && result.hasLifetimeAccess) {
            applyPremiumAccess(true);
          }
        })
        .catch(() => {});
    }, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [applyPremiumAccess, hasPremiumAccess, hydrated]);

  const purchaseLifetime = useCallback(async () => {
    setPurchaseStatus("purchasing");
    setPurchaseError(null);
    try {
      const result = await purchaseLifetimeAccess();
      if (result.hasLifetimeAccess) applyPremiumAccess(true);
      if (result.cancelled) setPurchaseError("Purchase cancelled.");
      if (result.pending) setPurchaseError("Purchase pending approval.");
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : String(error));
    } finally {
      setPurchaseStatus("idle");
    }
  }, [applyPremiumAccess]);

  const restorePurchases = useCallback(async () => {
    setPurchaseStatus("restoring");
    setPurchaseError(null);
    try {
      const result = await restoreLifetimeAccess();
      if (result.hasLifetimeAccess) applyPremiumAccess(true);
      if (!result.hasLifetimeAccess) setPurchaseError("No lifetime access purchase was found.");
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : String(error));
    } finally {
      setPurchaseStatus("idle");
    }
  }, [applyPremiumAccess]);

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
      language,
      t: (key) => translate(language, key),
      resetData: () => {
        const keepPremiumAccess = hasPremiumAccess;
        try {
          localStorage.removeItem(SETTINGS_KEY);
          localStorage.removeItem(ONBOARD_KEY);
          localStorage.removeItem("astral.account.v1");
          localStorage.removeItem("astral.journal.v1");
          if (keepPremiumAccess) {
            localStorage.setItem(PREMIUM_ACCESS_KEY, "true");
          } else {
            localStorage.removeItem(PREMIUM_ACCESS_KEY);
          }
          void clearJournalEntries();
        } catch {
          // Storage may be unavailable in private or restricted WebViews.
        }
        setSettingsState((prev) => ({ ...DEFAULT_SETTINGS, language: prev.language }));
        setOnboardingState(
          keepPremiumAccess
            ? { ...DEFAULT_ONBOARD, completed: true, disclaimerAccepted: true }
            : DEFAULT_ONBOARD,
        );
        setHasPremiumAccess(keepPremiumAccess);
      },
      resetOnboarding: () => {
        try {
          localStorage.removeItem(ONBOARD_KEY);
          localStorage.removeItem(PREMIUM_ACCESS_KEY);
        } catch {
          // Storage may be unavailable in private or restricted WebViews.
        }
        setOnboardingState(DEFAULT_ONBOARD);
        setHasPremiumAccess(false);
      },
      onboarding,
      setOnboarding: (o) => setOnboardingState((prev) => ({ ...prev, ...o })),
      hasPremiumAccess,
      purchaseProduct,
      purchaseStatus,
      purchaseError,
      loadPurchaseProduct,
      purchaseLifetime,
      restorePurchases,
      bypassPremiumForTesting: () => applyPremiumAccess(true),
      currentBeat,
      setCurrentBeat,
    }),
    [
      settings,
      language,
      onboarding,
      hasPremiumAccess,
      purchaseProduct,
      purchaseStatus,
      purchaseError,
      loadPurchaseProduct,
      purchaseLifetime,
      restorePurchases,
      applyPremiumAccess,
      currentBeat,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

function normalizeSettings(value: Partial<Settings>): Partial<Settings> {
  const language =
    value.language === LANGUAGE_AUTO ||
    (typeof value.language === "string" && isSupportedLanguage(value.language))
      ? value.language
      : LANGUAGE_AUTO;

  return { ...value, language };
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
