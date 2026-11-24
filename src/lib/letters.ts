const ZWJ = "‍";
const ARABIC = /[ؠ-يٮ-ۓ]/;
const MARK = /[ً-ٰٟ]/;
/** Letters that connect to the one before them but never to the one after. */
const RIGHT_ONLY = new Set(["ا", "أ", "إ", "آ", "ٱ", "د", "ذ", "ر", "ز", "و", "ؤ", "ة", "ى"]);
/** Letters that connect to neither side (hamza). */
const NONE = new Set(["ء"]);

const joinsNext = (c: string) => ARABIC.test(c) && !RIGHT_ONLY.has(c) && !NONE.has(c);
const joinable = (c: string) => ARABIC.test(c) && !NONE.has(c);

/**
 * Splits a word into letters that can move independently. Arabic letters
 * get zero-width joiners on the sides where they connect, so every piece
 * keeps its initial/medial/final shape and the word still reads joined.
 */
export function splitLetters(word: string): string[] {
  // Keep diacritics with their base letter
  const units: string[] = [];
  for (const c of Array.from(word)) {
    if (MARK.test(c) && units.length) units[units.length - 1] += c;
    else units.push(c);
  }
  return units.map((u, i) => {
    const c = u[0];
    if (!ARABIC.test(c)) return u;
    const prev = units[i - 1]?.[0];
    const next = units[i + 1]?.[0];
    const before = prev && joinsNext(prev) && joinable(c) ? ZWJ : "";
    const after = next && joinsNext(c) && joinable(next) ? ZWJ : "";
    return before + u + after;
  });
}
