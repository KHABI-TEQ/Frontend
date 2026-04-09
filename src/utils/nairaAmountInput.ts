/** @format */

/**
 * Naira budget helpers: readable comma display in the UI, digits-only for API / merge logic.
 */

const MAX_SAFE_NAIRA = 9_999_999_999_999_999; // quadrillions — practical cap

const SMALL: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/** Digits only — safe for `toNum` / `buildPreferencePayload` / backend. */
export function stripNairaAmountToDigits(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

/** "1234567" → "1,234,567" */
export function formatNairaThousands(digitsOnly: string): string {
  const d = stripNairaAmountToDigits(digitsOnly);
  if (!d) return "";
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * While typing: keep only digits, show with commas (max length capped).
 */
export function normalizeNairaAmountTyping(raw: string, maxDigits = 15): string {
  let d = stripNairaAmountToDigits(raw);
  if (d.length > maxDigits) d = d.slice(0, maxDigits);
  return formatNairaThousands(d);
}

function tokenizeMoneyPhrase(text: string): string[] {
  let t = text
    .toLowerCase()
    .replace(/₦/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(/^(about|around|roughly|like|maybe)\s+/i, "");
  t = t.replace(/\b(naira|ngn|bucks?)\b/g, " ");
  t = t.replace(/\band\b/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t ? t.split(/\s+/) : [];
}

/**
 * Parse English (and digit) money phrases like "five million", "25 million naira",
 * "two hundred fifty thousand", "1 billion".
 */
export function parseEnglishMoneyToNumber(text: string): number | null {
  const raw = (text || "").trim();
  if (!raw) return null;
  const compact = raw.replace(/\s/g, "").replace(/,/g, "");
  if (/^\d+$/.test(compact)) {
    const n = parseInt(compact, 10);
    if (!Number.isFinite(n) || n < 0 || n > MAX_SAFE_NAIRA) return null;
    return n;
  }

  const words = tokenizeMoneyPhrase(raw);
  if (words.length === 0) return null;

  let total = 0;
  let current = 0;

  const flushScale = (mult: number) => {
    if (current === 0 && mult >= 1000) return false;
    total += current * mult;
    current = 0;
    return true;
  };

  for (const w of words) {
    if (/^\d+$/.test(w)) {
      const n = parseInt(w, 10);
      if (!Number.isFinite(n) || n < 0) return null;
      current += n;
      continue;
    }
    if (w === "a" || w === "an") {
      current += 1;
      continue;
    }
    if (SMALL[w] !== undefined) {
      current += SMALL[w];
      continue;
    }
    if (TENS[w] !== undefined) {
      current += TENS[w];
      continue;
    }
    if (w === "hundred") {
      current = (current === 0 ? 1 : current) * 100;
      continue;
    }
    if (w === "thousand") {
      if (!flushScale(1_000)) return null;
      continue;
    }
    if (w === "million") {
      if (!flushScale(1_000_000)) return null;
      continue;
    }
    if (w === "billion") {
      if (!flushScale(1_000_000_000)) return null;
      continue;
    }
    return null;
  }

  const result = total + current;
  if (!Number.isFinite(result) || result < 0 || result > MAX_SAFE_NAIRA) return null;
  return Math.round(result);
}

/**
 * If the whole string is a spoken/written amount, return formatted display e.g. "5,000,000".
 * Otherwise null (caller keeps raw STT text).
 */
export function tryEnglishMoneyToFormattedDisplay(text: string): string | null {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;
  const n = parseEnglishMoneyToNumber(trimmed);
  if (n === null) return null;
  return formatNairaThousands(String(n));
}

/**
 * Avoid normalizing partial STT ("five" before "million") into "5" — wait for scale words or long digit runs.
 */
function shouldNormalizeVoiceMoneyUtterance(utterance: string): boolean {
  const t = utterance.trim().toLowerCase();
  if (!t) return false;
  if (/\b(thousand|million|billion)\b/.test(t)) return true;
  const compact = t.replace(/\s/g, "").replace(/,/g, "");
  if (/^\d+$/.test(compact)) return compact.length >= 4;
  const n = parseEnglishMoneyToNumber(t);
  return n !== null && n >= 1000;
}

/**
 * Combine base + new voice chunk; if amount mode and the new chunk alone parses as money,
 * replace display with formatted digits. If full combined string parses as money only, use that.
 */
export function mergeVoiceTextWithSpokenAmount(
  base: string,
  utterance: string,
): { display: string; usedSpokenAmount: boolean } {
  const u = utterance.trim();
  const b = base.trimEnd();
  if (!u) return { display: b, usedSpokenAmount: false };

  if (shouldNormalizeVoiceMoneyUtterance(u)) {
    const tryUtter = tryEnglishMoneyToFormattedDisplay(u);
    if (tryUtter) {
      const display = b ? `${b} ${tryUtter}` : tryUtter;
      return { display, usedSpokenAmount: true };
    }
  }

  const combined = b ? `${b} ${u}` : u;
  const cTrim = combined.trim();
  if (!b && shouldNormalizeVoiceMoneyUtterance(cTrim)) {
    const tryFull = tryEnglishMoneyToFormattedDisplay(cTrim);
    if (tryFull) return { display: tryFull, usedSpokenAmount: true };
  }

  return { display: combined, usedSpokenAmount: false };
}
