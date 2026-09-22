/** @format */

/**
 * Naira budget helpers: spoken English → number, comma display in the UI,
 * digits-only for API / merge logic.
 */

const MAX_SAFE_NAIRA = 9_999_999_999_999_999;

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

const SCALE: Record<string, number> = {
  thousand: 1_000,
  k: 1_000,
  million: 1_000_000,
  mill: 1_000_000,
  mil: 1_000_000,
  mn: 1_000_000,
  m: 1_000_000,
  billion: 1_000_000_000,
  b: 1_000_000_000,
};

/** Skip inside a phrase without splitting amounts (STT filler / currency). */
const SKIP_INSIDE_RUN = new Set([
  "um",
  "uh",
  "erm",
  "hmm",
  "naira",
  "nairas",
  "ngn",
  "please",
  "just",
  "only",
]);

const MIN_BARE_NAIRA = 1_000;

function isScaleWord(w: string): boolean {
  return SCALE[w] != null;
}

function isNumberWord(w: string): boolean {
  return SMALL[w] != null || TENS[w] != null || w === "hundred";
}

function isNumericToken(w: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(w);
}

function isMoneyToken(w: string): boolean {
  if (isNumericToken(w) || isNumberWord(w) || isScaleWord(w)) return true;
  if (w === "and" || w === "a" || w === "an") return true;
  return false;
}

function normalizeMoneyText(text: string): string {
  let t = (text || "").toLowerCase();
  t = t.replace(/₦/g, " ");
  t = t.replace(/[’']/g, "");
  t = t.replace(/-/g, " ");
  t = t.replace(/[–—]/g, " to ");
  // 20,000,000 or 20 000 000 → 20000000 before punctuation splitting
  t = t.replace(/\d{1,3}(?:[,\s]\d{3})+(?:\.\d+)?/g, (m) => m.replace(/[,\s]/g, ""));
  t = t.replace(/(\d)\.(\d)/g, "$1DEC$2");
  t = t.replace(/[.,!?;:()"“”]/g, " ");
  t = t.replace(/DEC/g, ".");
  t = t.replace(/\b(nairas?|ngn|bucks?)\b/g, " ");
  // 20m / 20mn / 20mil → 20 m
  t = t.replace(/(\d)\s*(mn|mil|mill|million|billion|thousand|k|m|b)\b/g, "$1 $2");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

/**
 * "twenty to fifty million" → "twenty million to fifty million"
 */
function expandSharedScaleRanges(text: string): string {
  const unit = "million|billion|thousand";
  const chunk = String.raw`(?:\d+(?:\.\d+)?|${Object.keys(SMALL).join("|")}|${Object.keys(TENS).join("|")}|hundred|and|\s)+`;
  const re = new RegExp(
    `(${chunk}?)\\s+(?:to|and|-)\\s+(${chunk}?)\\s+(${unit})\\b`,
    "gi",
  );
  return text.replace(re, (_m, a: string, b: string, scale: string) => {
    const left = String(a).trim();
    const right = String(b).trim();
    if (!left || !right) return _m;
    if (new RegExp(`\\b(${unit})\\b`, "i").test(left)) return _m;
    return `${left} ${scale} to ${right} ${scale}`;
  });
}

function tokenizeMoneyText(text: string): string[] {
  const expanded = expandSharedScaleRanges(normalizeMoneyText(text));
  return expanded.split(/\s+/).filter(Boolean);
}

function parseMoneyTokenRun(words: string[]): number | null {
  if (words.length === 0) return null;
  let total = 0;
  let current = 0;
  let sawScale = false;

  const flushScale = (mult: number): boolean => {
    if (current === 0) {
      if (mult >= 1000 && total === 0) return false;
      return true;
    }
    total += current * mult;
    current = 0;
    sawScale = true;
    return true;
  };

  for (const w of words) {
    if (w === "and") continue;
    if (w === "a" || w === "an") {
      current += 1;
      continue;
    }
    if (isNumericToken(w)) {
      const n = parseFloat(w);
      if (!Number.isFinite(n) || n < 0) return null;
      current += n;
      continue;
    }
    if (SMALL[w] != null) {
      current += SMALL[w];
      continue;
    }
    if (TENS[w] != null) {
      current += TENS[w];
      continue;
    }
    if (w === "hundred") {
      current = (current === 0 ? 1 : current) * 100;
      continue;
    }
    const scale = SCALE[w];
    if (scale != null) {
      if (w === "m" || w === "k" || w === "b" || w === "mn" || w === "mil" || w === "mill") {
        if (current === 0 && total === 0) return null;
      }
      if (!flushScale(scale)) return null;
      continue;
    }
    return null;
  }

  const result = total + current;
  if (!Number.isFinite(result) || result <= 0 || result > MAX_SAFE_NAIRA) return null;
  if (!sawScale && result < MIN_BARE_NAIRA) return null;
  return Math.round(result);
}

function collectMoneyTokenRuns(tokens: string[]): string[][] {
  const runs: string[][] = [];
  let current: string[] = [];
  for (const w of tokens) {
    if (SKIP_INSIDE_RUN.has(w) && !isMoneyToken(w)) continue;
    if (isMoneyToken(w)) {
      current.push(w);
      continue;
    }
    if (current.length) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length) runs.push(current);
  return runs;
}

/** Every distinct Naira amount found in spoken or typed text. */
export function extractAllEnglishMoneyAmounts(text: string): number[] {
  const raw = (text || "").trim();
  if (!raw) return [];

  const compact = raw.replace(/[₦\s,]/g, "");
  const amounts: number[] = [];
  if (/^\d+$/.test(compact)) {
    const n = parseInt(compact, 10);
    if (Number.isFinite(n) && n > 0 && n <= MAX_SAFE_NAIRA) amounts.push(n);
  }

  const runs = collectMoneyTokenRuns(tokenizeMoneyText(raw));
  for (const run of runs) {
    const n = parseMoneyTokenRun(run);
    if (n != null && n > 0) amounts.push(n);
  }

  return [...new Set(amounts)].filter((n) => n > 0);
}

/**
 * Parse English (and digit) money phrases like "twenty million naira",
 * "25 million", "2.5m", "20,000,000", "my budget is fifty million".
 * Prefers the largest plausible amount in the utterance (budget).
 */
export function parseEnglishMoneyToNumber(text: string): number | null {
  const amounts = extractAllEnglishMoneyAmounts(text);
  if (amounts.length === 0) return null;
  return Math.max(...amounts);
}

/** Digits only — safe for `toNum` / `buildPreferencePayload` / backend. */
export function stripNairaAmountToDigits(raw: string): string {
  const parsed = parseEnglishMoneyToNumber(raw);
  if (parsed != null) return String(parsed);
  return (raw || "").replace(/\D/g, "");
}

/** "1234567" → "1,234,567" */
export function formatNairaThousands(digitsOnly: string): string {
  const d = String(digitsOnly || "").replace(/\D/g, "");
  if (!d) return "";
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatNairaAmountNumber(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  return formatNairaThousands(String(Math.round(amount)));
}

/**
 * While typing: keep digits comma-formatted. If the field contains a complete
 * spoken amount ("twenty million"), convert it. Incomplete words stay as-is.
 */
export function normalizeNairaAmountTyping(raw: string, maxDigits = 15): string {
  if (/[a-zA-Z]/.test(raw || "")) {
    const spoken = parseEnglishMoneyToNumber(raw);
    if (spoken != null) return formatNairaAmountNumber(spoken);
    return raw;
  }
  let d = (raw || "").replace(/\D/g, "");
  if (d.length > maxDigits) d = d.slice(0, maxDigits);
  return formatNairaThousands(d);
}

/**
 * Format digit runs of 4+ as comma-separated thousands
 * (e.g. "Lekki 50000000" → "Lekki 50,000,000") while preserving other text.
 */
export function formatAmountRunsInText(raw: string): string {
  if (!raw) return "";
  return raw.replace(/\d[\d,]*/g, (run) => {
    const digits = run.replace(/,/g, "");
    if (digits.length < 4 || !/^\d+$/.test(digits)) return run;
    return formatNairaThousands(digits);
  });
}

/**
 * In mixed sentences, format digit runs of 4+ as comma-separated thousands
 * (e.g. "Lekki 50000000" → "Lekki 50,000,000") while preserving other text.
 */
export function formatSpokenMoneyPhrasesInText(raw: string): string {
  let out = formatAmountRunsInText(raw || "");
  const phraseRe =
    /\b((?:\d+(?:\.\d+)?|(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and))(?:[\s-]+(?:\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and))*)[\s-]+(thousand|million|billion|mill|mil)(?:\s+nairas?)?\b/gi;
  out = out.replace(phraseRe, (m) => {
    const n = parseEnglishMoneyToNumber(m);
    return n != null ? formatNairaAmountNumber(n) : m;
  });
  out = out.replace(/\b(\d+(?:\.\d+)?)\s*(mn|m)\b/gi, (m) => {
    const n = parseEnglishMoneyToNumber(m);
    return n != null ? formatNairaAmountNumber(n) : m;
  });
  return out;
}

/**
 * If the string contains a spoken/written amount, return formatted display e.g. "20,000,000".
 */
export function tryEnglishMoneyToFormattedDisplay(text: string): string | null {
  const n = parseEnglishMoneyToNumber(text);
  if (n === null) return null;
  return formatNairaAmountNumber(n);
}

export function isCompleteSpokenNairaAmount(utterance: string): boolean {
  const t = utterance.trim().toLowerCase();
  if (!t) return false;
  if (/\b(thousand|million|billion|mill|mil)\b/.test(t)) {
    return parseEnglishMoneyToNumber(t) != null;
  }
  if (/\d\s*(k|m|b|mn)\b/i.test(t)) {
    return parseEnglishMoneyToNumber(t) != null;
  }
  const compact = t.replace(/\s/g, "").replace(/,/g, "");
  if (/^\d+$/.test(compact)) return compact.length >= 4;
  const n = parseEnglishMoneyToNumber(t);
  return n !== null && n >= MIN_BARE_NAIRA;
}

/**
 * Combine base + new voice chunk; spoken amounts become comma-formatted digits.
 */
export function mergeVoiceTextWithSpokenAmount(
  base: string,
  utterance: string,
): { display: string; usedSpokenAmount: boolean } {
  const u = utterance.trim();
  const b = base.trimEnd();
  if (!u) return { display: b, usedSpokenAmount: false };

  if (isCompleteSpokenNairaAmount(u)) {
    const tryUtter = tryEnglishMoneyToFormattedDisplay(u);
    if (tryUtter) {
      return { display: b ? `${b} ${tryUtter}` : tryUtter, usedSpokenAmount: true };
    }
  }

  const combined = b ? `${b} ${u}` : u;
  const cTrim = combined.trim();
  if (isCompleteSpokenNairaAmount(cTrim)) {
    const tryFull = tryEnglishMoneyToFormattedDisplay(cTrim);
    if (tryFull) return { display: tryFull, usedSpokenAmount: true };
  }

  return { display: combined, usedSpokenAmount: false };
}
