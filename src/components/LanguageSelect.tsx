import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { LANGUAGE_AUTO, SUPPORTED_LANGUAGES, type LanguageSetting } from "@/lib/i18n";
import { Check, Globe2 } from "lucide-react";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { settings, setSettings, language: activeLanguage, t } = useAppState();
  const [open, setOpen] = useState(false);

  const chooseLanguage = (next: LanguageSetting) => {
    setSettings({ language: next });
    setOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label={t("settings.language")}
          onClick={() => setOpen((current) => !current)}
          className="flex h-10 items-center gap-1.5 rounded-full border border-[#c0b0f0]/35 bg-[#02050d]/80 px-3 text-[#cfe7ff] shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
        >
          <Globe2 className="h-4 w-4 text-[#c0b0f0]" strokeWidth={1.7} />
          <span className="text-[9px] font-bold tracking-[0.16em]">
            {settings.language === LANGUAGE_AUTO ? "AUTO" : activeLanguage.toUpperCase()}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-sm border border-[#c0b0f0]/25 bg-[#070411]/95 py-1 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <LanguageOption
              active={settings.language === LANGUAGE_AUTO}
              label={t("settings.languageDevice")}
              onClick={() => chooseLanguage(LANGUAGE_AUTO)}
            />
            {SUPPORTED_LANGUAGES.map((language) => (
              <LanguageOption
                key={language.code}
                active={settings.language === language.code}
                label={language.nativeLabel}
                sublabel={language.label}
                onClick={() => chooseLanguage(language.code)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <label className="block rounded-sm border border-white/15 p-3">
      <span className="text-[10px] tracking-[0.3em] text-[#7fa9c8]">{t("settings.language")}</span>
      <select
        aria-label={t("settings.language")}
        value={settings.language}
        onChange={(event) =>
          setSettings({ language: event.currentTarget.value as LanguageSetting })
        }
        className="mt-3 w-full rounded-sm border border-[#c0b0f0]/30 bg-[#02050d] px-3 py-2 text-sm text-white outline-none"
      >
        <option value={LANGUAGE_AUTO}>{t("settings.languageDevice")}</option>
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function LanguageOption({
  active,
  label,
  sublabel,
  onClick,
}: {
  active: boolean;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[#cfe7ff] transition hover:bg-white/8"
    >
      <span>
        <span className="block text-[11px] leading-tight">{label}</span>
        {sublabel && <span className="mt-0.5 block text-[8px] text-[#7fa9c8]/70">{sublabel}</span>}
      </span>
      {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#c0b0f0]" strokeWidth={2} />}
    </button>
  );
}
