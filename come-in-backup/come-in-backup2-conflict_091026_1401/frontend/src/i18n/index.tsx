// Lightweight i18n context for the Come In app.
//
// Usage:
//   const { t, lang, setLang, isRTL } = useT();
//   <Text>{t("home.popular")}</Text>
//   <Text>{t("cart.hint", { n: 50 })}</Text>
//
// Lookup order per key:
//   1. Current language dictionary
//   2. English dictionary
//   3. The key itself (surfaces missing keys obviously during dev)
//
// The selected language code is persisted via the shared storage util.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nManager } from "react-native";

import { storage } from "@/src/utils/storage";

import {
  EN,
  LANGUAGES,
  LanguageCode,
  LanguageOption,
  TRANSLATIONS,
} from "./translations";

export const LANGUAGE_STORAGE_KEY = "@comein_language_v1";

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  options: LanguageOption[];
  current: LanguageOption;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function format(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getItem<string>(LANGUAGE_STORAGE_KEY, "");
        if (typeof saved === "string" && saved.length > 0 && saved in TRANSLATIONS) {
          setLangState(saved as LanguageCode);
        }
      } catch {}
    })();
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    storage.setItem(LANGUAGE_STORAGE_KEY, code);
    // Try to tell native about RTL for Urdu. On a dev-build / Expo Go this
    // only fully applies after a reload; the <RTLRoot> wrapper below still
    // flips layout correctly on web and the current render.
    const opt = LANGUAGES.find((l) => l.code === code);
    const nextRTL = Boolean(opt?.isRTL);
    try {
      I18nManager.allowRTL(true);
      if (I18nManager.isRTL !== nextRTL) {
        I18nManager.forceRTL(nextRTL);
      }
    } catch {}
  }, []);

  const current = useMemo(
    () => LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0],
    [lang],
  );

  const isRTL = Boolean(current.isRTL);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[lang] ?? EN;
      const raw = dict[key] ?? EN[key] ?? key;
      return format(raw, vars);
    },
    [lang],
  );

  const value: I18nContextValue = {
    lang,
    setLang,
    t,
    isRTL,
    options: LANGUAGES,
    current,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}

export { LANGUAGES };
export type { LanguageCode, LanguageOption };
