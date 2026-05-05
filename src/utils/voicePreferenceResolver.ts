import {
  LAGOS_LGAS,
  LAGOS_MAJOR_AREAS,
  LAGOS_LGA_ALIASES,
  LAGOS_AREA_ALIASES,
} from "@/data/lagos-location-inventory";
import { PREFERENCE_INTENT_INVENTORY } from "@/data/voice-intent-inventory";

type ResolveResult =
  | { kind: "normalized"; value: string }
  | { kind: "clarify"; prompt: string; options?: string[] };

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  const s = norm(a);
  const t = norm(b);
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function bestCandidate(raw: string, options: readonly string[]): string | null {
  const n = norm(raw);
  if (!n) return null;
  const exact = options.find((o) => norm(o) === n);
  if (exact) return exact;
  const byContain = options.find((o) => norm(o).includes(n) || n.includes(norm(o)));
  if (byContain) return byContain;

  let best: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const o of options) {
    const d = levenshtein(n, o);
    if (d < bestDist) {
      bestDist = d;
      best = o;
    }
  }
  // Only accept near matches for short voice phrases.
  return best && bestDist <= 2 ? best : null;
}

function topCandidates(raw: string, options: readonly string[], max = 4): string[] {
  const n = norm(raw);
  if (!n) return [...options].slice(0, max);
  const ranked = [...options]
    .map((o) => {
      const on = norm(o);
      const containsBoost = on.includes(n) || n.includes(on) ? -0.5 : 0;
      return { value: o, score: levenshtein(n, o) + containsBoost };
    })
    .sort((a, b) => a.score - b.score)
    .map((x) => x.value);
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const r of ranked) {
    const k = norm(r);
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(r);
    if (deduped.length >= max) break;
  }
  return deduped;
}

export function resolveVoiceIntent(raw: string): ResolveResult {
  const n = norm(raw);
  if (!n) return { kind: "normalized", value: raw };
  const entries = Object.entries(PREFERENCE_INTENT_INVENTORY) as Array<[string, readonly string[]]>;
  for (const [key, aliases] of entries) {
    if (aliases.some((a) => norm(a) === n)) {
      return { kind: "normalized", value: key };
    }
  }
  const best = bestCandidate(raw, ["buy", "rent", "shortlet", "joint venture"]);
  if (best) {
    const canonical = best === "joint venture" ? "joint-venture" : best;
    return { kind: "normalized", value: canonical };
  }
  return {
    kind: "clarify",
    prompt: "Did you mean Buy, Rent, Shortlet, or JV? Please reply with one.",
    options: ["Buy", "Rent", "Shortlet", "JV"],
  };
}

export function resolveVoiceState(raw: string, stateOptions: readonly string[]): ResolveResult {
  const n = norm(raw);
  if (n === "lagos state") return { kind: "normalized", value: "Lagos" };
  if (n === "fct" || n === "abuja" || n === "abuja fct") {
    const fct = stateOptions.find((s) => /fct|abuja/i.test(s));
    if (fct) return { kind: "normalized", value: fct };
  }
  const match = bestCandidate(raw, stateOptions);
  if (match) return { kind: "normalized", value: match };
  return {
    kind: "clarify",
    prompt: "I couldn't match that state clearly. Please pick one:",
    options: topCandidates(raw, stateOptions, 5),
  };
}

export function resolveVoiceLga(raw: string, stateRaw: string | undefined): ResolveResult {
  const state = norm(stateRaw || "");
  // For now we apply curated LGA inventory only for Lagos, per request.
  if (state !== "lagos") return { kind: "normalized", value: raw.trim() };
  const alias = LAGOS_LGA_ALIASES[norm(raw)];
  if (alias) return { kind: "normalized", value: alias };
  const match = bestCandidate(raw, LAGOS_LGAS);
  if (match) return { kind: "normalized", value: match };
  return {
    kind: "clarify",
    prompt: "I couldn't match that Lagos LGA. Please pick/type one (e.g. Ikeja, Ifako-Ijaiye, Eti-Osa).",
    options: topCandidates(raw, LAGOS_LGAS, 5),
  };
}

export function resolveVoiceArea(raw: string, stateRaw: string | undefined): ResolveResult {
  const state = norm(stateRaw || "");
  if (state !== "lagos") return { kind: "normalized", value: raw.trim() };
  const alias = LAGOS_AREA_ALIASES[norm(raw)];
  if (alias) return { kind: "normalized", value: alias };
  const match = bestCandidate(raw, LAGOS_MAJOR_AREAS);
  if (match) return { kind: "normalized", value: match };
  // Fall back to user-provided text; the conversation layer already presents canonical area options.
  return { kind: "normalized", value: raw.trim() };
}
