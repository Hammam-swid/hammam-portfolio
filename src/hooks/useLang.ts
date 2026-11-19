import { useTranslation } from "react-i18next";
import type { Lang, Localized, LocalizedList } from "../types";

/** Current language plus a picker for localized JSON fields. */
export function useLang() {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  function l(v: Localized): string;
  function l(v: LocalizedList): string[];
  function l(v: Localized | LocalizedList) {
    return v[lang];
  }
  return { t, i18n, lang, isRTL: lang === "ar", l };
}
