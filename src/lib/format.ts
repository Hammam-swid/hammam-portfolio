import type { Lang } from "../types";

export function formatMonth(ym: string, lang: Lang) {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-LY" : "en-US", {
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  }).format(new Date(y, m - 1, 1));
}
