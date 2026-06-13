/**
 * Location extraction and sanitization for AI preference/property conversations.
 * Enforces question order State → LGA → Area while allowing area-first mentions
 * (e.g. "3 bedroom in Lekki to buy" → capture area, then ask state, then LGA).
 */

import { getAreasByLGA, getLGAsByState, searchPreferenceLocations } from "./location-resolver";

function locationPayloadHasAreas(l: Record<string, unknown>): boolean {
  const sel = l.selectedAreas;
  if (Array.isArray(sel) && sel.some((x) => x != null && String(x).trim() !== "")) return true;
  if (sel && typeof sel === "object" && !Array.isArray(sel)) {
    for (const v of Object.values(sel)) {
      if (Array.isArray(v) && v.some((x) => x != null && String(x).trim() !== "")) return true;
      if (typeof v === "string" && String(v).trim() !== "") return true;
    }
  }
  const areas = l.areas;
  if (Array.isArray(areas) && areas.some((a) => String(a).trim() !== "")) return true;
  const custom = l.customLocation;
  if (typeof custom === "string" && custom.trim() !== "") return true;
  return false;
}

export type LocationSearchHit = {
  state: string;
  lga?: string;
  area?: string;
};

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeUserBlob(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Common voice-ASR mis-hearings → canonical area names (especially Lagos). */
const VOICE_AREA_ALIASES: Record<string, string> = {
  leki: "Lekki",
  leky: "Lekki",
  lucky: "Lekki",
  lucki: "Lekki",
  lekky: "Lekki",
  "lekki phase one": "Lekki Phase 1",
  "lekki phase two": "Lekki Phase 2",
  "v i": "Victoria Island",
  victoriaisland: "Victoria Island",
  "eti osa": "Eti-Osa",
  "ibeju lekki": "Ibeju-Lekki",
  ajah: "Ajah",
  ikeja: "Ikeja",
  yaba: "Yaba",
  ikoyi: "Ikoyi",
  chevron: "Chevron",
  sangotedo: "Sangotedo",
};

function resolveVoiceAreaAlias(phrase: string): string | null {
  const key = normalizeUserBlob(phrase);
  if (!key) return null;
  if (VOICE_AREA_ALIASES[key]) return VOICE_AREA_ALIASES[key];
  const compact = normalizeForMatch(phrase);
  if (VOICE_AREA_ALIASES[compact]) return VOICE_AREA_ALIASES[compact];
  return null;
}

function correctPlacePhrase(phrase: string): string | null {
  const trimmed = phrase.trim();
  if (!trimmed) return null;
  const alias = resolveVoiceAreaAlias(trimmed);
  if (alias) return alias;
  const hit = bestSearchHit(trimmed);
  if (hit?.area) {
    const dist = levenshtein(trimmed, hit.area);
    const maxDist = normalizeForMatch(trimmed).length <= 5 ? 2 : 3;
    if (dist <= maxDist) return hit.area;
  }
  return null;
}

/**
 * Fix common location ASR typos in free-form dictation (e.g. "in Lucky" → "in Lekki").
 * Safe to run on every voice update and before location extraction.
 */
export function correctTranscriptionLocationTypos(text: string): string {
  const raw = text.trim();
  if (!raw) return text;

  let out = raw;

  out = out.replace(
    /\b(in|at|around|within|near)\s+([a-zA-Z][a-zA-Z0-9\s'-]{0,48}?)(?=\s*,|\s+(?:lagos|state|nigeria|to|for|with|and|buy|rent|lease|naira|million|billion|bedroom|bed|flat|house|₦)|[,;.]|\s*$)/gi,
    (match, prep: string, place: string) => {
      const corrected = correctPlacePhrase(String(place).trim());
      return corrected ? `${prep} ${corrected}` : match;
    }
  );

  for (const [alias, canonical] of Object.entries(VOICE_AREA_ALIASES)) {
    if (alias === normalizeForMatch(canonical)) continue;
    const re = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    out = out.replace(re, canonical);
  }

  return out;
}

function levenshtein(a: string, b: string): number {
  const s = normalizeForMatch(a);
  const t = normalizeForMatch(b);
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

/** True if the user's combined messages mention a place name (substring or near-typo). */
export function userTextMentionsPhrase(userMessagesCombined: string, phrase: string): boolean {
  const blob = normalizeUserBlob(userMessagesCombined);
  const p = normalizeUserBlob(phrase);
  if (!blob || !p) return false;
  if (blob.includes(p)) return true;

  const blobNorm = normalizeForMatch(blob);
  const phraseNorm = normalizeForMatch(phrase);
  if (!phraseNorm) return false;
  if (blobNorm.includes(phraseNorm)) return true;

  // Fuzzy: voice often yields "leki" for "Lekki", "eti osa" for "Eti-Osa", etc.
  const phraseWords = p.split(/\s+/).filter(Boolean);
  if (phraseWords.length <= 3) {
    const maxDist = phraseNorm.length <= 4 ? 1 : 2;
    if (levenshtein(blobNorm, phraseNorm) <= maxDist) return true;
    for (const token of blob.split(/\s+/)) {
      const tn = normalizeForMatch(token);
      if (!tn) continue;
      if (tn.includes(phraseNorm) || phraseNorm.includes(tn)) return true;
      if (levenshtein(tn, phraseNorm) <= maxDist) return true;
    }
  }

  // Multi-word phrases: every significant word should appear (fuzzy) in blob.
  if (phraseWords.length > 1) {
    const significant = phraseWords.filter((w) => w.length > 2);
    if (significant.length > 0) {
      return significant.every((word) => userTextMentionsPhrase(userMessagesCombined, word));
    }
  }

  return false;
}

function isMeaningful(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.some((x) => isMeaningful(x));
  return false;
}

function getLoc(data: Record<string, unknown>): Record<string, unknown> | null {
  const loc = data.location;
  if (loc && typeof loc === "object" && !Array.isArray(loc)) return loc as Record<string, unknown>;
  return null;
}

function mergeSelectedAreasMaps(existing: unknown, incoming: Record<string, string[]>): Record<string, unknown> {
  const prev =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  const out = { ...prev };
  for (const [lga, areas] of Object.entries(incoming)) {
    if (!areas?.length) continue;
    const add = areas.map(String).map((s) => s.trim()).filter(Boolean);
    const p = out[lga];
    if (!Array.isArray(p)) out[lga] = add;
    else {
      const cur = (p as unknown[]).map(String);
      for (const a of add) {
        if (!cur.some((x) => x.toLowerCase() === a.toLowerCase())) cur.push(a);
      }
      out[lga] = cur;
    }
  }
  return out;
}

function getAreaListFromLoc(loc: Record<string, unknown>): string[] {
  const fromAreas = Array.isArray(loc.areas)
    ? (loc.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : [];
  if (fromAreas.length > 0) return fromAreas;
  const custom = String(loc.customLocation ?? "").trim();
  if (custom) return [custom];
  const sel = loc.selectedAreas;
  if (sel && typeof sel === "object" && !Array.isArray(sel)) {
    const out: string[] = [];
    for (const v of Object.values(sel as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        for (const a of v) {
          const s = String(a).trim();
          if (s) out.push(s);
        }
      }
    }
    if (out.length > 0) return out;
  }
  return [];
}

function setAreasOnLoc(loc: Record<string, unknown>, areas: string[]): Record<string, unknown> {
  const next: Record<string, unknown> = { ...loc, areas: [...areas] };
  if (areas.length > 0) next.area = areas[0];
  else delete next.area;
  return next;
}

function isRecognizedStateName(raw: string, stateOptions: string[]): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return false;
  return stateOptions.some((st) => st.trim().toLowerCase() === s);
}

function resolveStateName(raw: string, stateOptions: string[]): string | null {
  const n = normalizeForMatch(raw);
  if (!n) return null;
  const exact = stateOptions.find((st) => normalizeForMatch(st) === n);
  if (exact) return exact;
  const partial = stateOptions.find((st) => {
    const sn = normalizeForMatch(st);
    return sn.includes(n) || n.includes(sn);
  });
  if (partial) return partial;
  let best: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const st of stateOptions) {
    const d = levenshtein(n, st);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  }
  return best && bestDist <= 2 ? best : null;
}

function resolveLgaName(raw: string, state: string): string | null {
  const available = getLGAsByState(state);
  const n = normalizeForMatch(raw);
  if (!n || available.length === 0) return null;
  const exact = available.find((lga) => normalizeForMatch(lga) === n);
  if (exact) return exact;
  const partial = available.find((lga) => {
    const ln = normalizeForMatch(lga);
    return ln.includes(n) || n.includes(ln);
  });
  if (partial) return partial;
  let best: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const lga of available) {
    const d = levenshtein(n, lga);
    if (d < bestDist) {
      bestDist = d;
      best = lga;
    }
  }
  return best && bestDist <= 2 ? best : null;
}

function resolveAreaName(raw: string, state: string, lga: string): string | null {
  const available = getAreasByLGA(state, lga);
  const n = normalizeForMatch(raw);
  if (!n) return null;
  if (available.length > 0) {
    const exact = available.find((a) => normalizeForMatch(a) === n);
    if (exact) return exact;
    const partial = available.find((a) => {
      const an = normalizeForMatch(a);
      return an.includes(n) || n.includes(an);
    });
    if (partial) return partial;
    let best: string | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const a of available) {
      const d = levenshtein(n, a);
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
    if (best && bestDist <= 2) return best;
  }
  return raw.trim();
}

function bestSearchHit(query: string): LocationSearchHit | null {
  const alias = resolveVoiceAreaAlias(query);
  const searchQuery = alias ?? query;
  const hits = searchPreferenceLocations(searchQuery, 8);
  if (hits.length === 0) return null;
  const q = normalizeForMatch(searchQuery);
  let best = hits[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const hit of hits) {
    const candidates = [hit.area, hit.lga, hit.state].filter(Boolean) as string[];
    for (const c of candidates) {
      const cn = normalizeForMatch(c);
      let score = levenshtein(q, cn);
      if (cn.includes(q) || q.includes(cn)) score -= 1;
      if (hit.area) score -= 0.5;
      if (score < bestScore) {
        bestScore = score;
        best = hit;
      }
    }
  }
  return best;
}

/** Extract "in Lekki", "at Ikeja", etc. from free-form text. */
function extractPlaceCandidatesFromText(text: string): string[] {
  const out: string[] = [];
  const patterns = [
    /\b(?:in|at|around|within|near)\s+([a-z][a-z0-9\s'-]{1,48}?)(?=\s+(?:to|for|with|and|budget|buy|rent|lease|naira|million|billion|bedroom|bed|₦|sqm|plot)|[,;.]|$)/gi,
    /\b(?:state|lga|area)\s*(?:is|:)?\s*([a-z][a-z0-9\s'-]{1,48}?)(?=\s+(?:to|for|with|and|budget|buy|rent)|[,;.]|$)/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const candidate = m[1].trim().replace(/\s+/g, " ");
      if (candidate.length >= 2 && !/^\d+$/.test(candidate)) out.push(candidate);
    }
  }
  return [...new Set(out)];
}

/**
 * Drop API-inferred state/LGA/area the user never typed or said.
 * Keeps area-first mentions even when state/LGA are still empty.
 */
export function filterLocationToUserMentionedOnly(
  loc: Record<string, unknown>,
  userMessagesCombined: string
): Record<string, unknown> {
  const blob = normalizeUserBlob(userMessagesCombined);
  if (!blob) return { ...loc };

  let out: Record<string, unknown> = { ...loc };

  const st = String(out.state ?? "").trim();
  if (st && !userTextMentionsPhrase(userMessagesCombined, st)) {
    out = { ...out, state: "" };
  }

  const stateForLga = String(out.state ?? "").trim();
  const lgasRaw = out.localGovernmentAreas ?? out.lgas;
  const lgaList = Array.isArray(lgasRaw)
    ? lgasRaw.map(String).map((s) => s.trim()).filter(Boolean)
    : [];
  const keptLgas = lgaList.filter((g) => userTextMentionsPhrase(userMessagesCombined, g));
  if (lgaList.length > 0 && keptLgas.length === 0) {
    out = { ...out, localGovernmentAreas: [], lgas: [] };
  } else {
    out = { ...out, localGovernmentAreas: keptLgas, lgas: keptLgas };
  }

  const areas = getAreaListFromLoc(out);
  const keptAreas = areas.filter((a) => userTextMentionsPhrase(userMessagesCombined, a));
  if (areas.length > 0 && keptAreas.length === 0) {
    out = { ...out, areas: [] };
    delete out.area;
    delete out.customLocation;
    if (out.selectedAreas && typeof out.selectedAreas === "object") {
      out.selectedAreas = {};
    }
  } else if (keptAreas.length > 0) {
    out = setAreasOnLoc(out, keptAreas);
  }

  const custom = String(out.customLocation ?? "").trim();
  if (custom && !userTextMentionsPhrase(userMessagesCombined, custom)) {
    delete out.customLocation;
  }

  return out;
}

function stripImplausibleState(loc: Record<string, unknown>): Record<string, unknown> {
  const st = String(loc.state ?? "").trim();
  if (!st) return { ...loc };
  const wordCount = st.split(/\s+/).filter(Boolean).length;
  const looksLikeNarration =
    wordCount > 5 ||
    /\b(i want|i'd like|i need|looking for|searching for|help me|submit|preference)\b/i.test(st);
  const looksLikeIntentNotState =
    /^(buy|rent|sale|sell|shortlet|jv|property|properties|land|flat|apartment|house|duplex|bungalow|studio|commercial|residential)$/i.test(
      st
    ) || /\b(i want|looking)\b.*\b(buy|rent)\b/i.test(st);
  if (!looksLikeNarration && !looksLikeIntentNotState) return { ...loc };
  const next = { ...loc };
  delete next.state;
  return next;
}

function coerceLocationHierarchy(loc: Record<string, unknown>, stateOptions: string[]): Record<string, unknown> {
  const st = String(loc.state ?? "").trim();
  if (!st) {
    const next: Record<string, unknown> = { ...loc, localGovernmentAreas: [], lgas: [] };
    return next;
  }
  if (!isRecognizedStateName(st, stateOptions)) {
    return {
      ...loc,
      state: "",
      localGovernmentAreas: [],
      lgas: [],
    };
  }
  return loc;
}

/**
 * Full sanitization after API merge: strip hallucinated locations, enforce hierarchy,
 * but preserve user-mentioned areas even before state/LGA are confirmed.
 */
export function sanitizeConversationLocation(
  loc: Record<string, unknown> | undefined,
  userMessagesCombined: string,
  stateOptions: string[] = []
): Record<string, unknown> {
  let out = stripImplausibleState({ ...(loc || {}) });
  out = filterLocationToUserMentionedOnly(out, userMessagesCombined);
  if (stateOptions.length > 0) {
    out = coerceLocationHierarchy(out, stateOptions);
  }
  return out;
}

/**
 * Parse location from natural text. Comma lists follow State → LGA → Area order.
 * Phrases like "in Lekki" resolve via the location dataset without auto-filling state/LGA.
 */
function applyAreaSearchHitToLoc(
  next: Record<string, unknown>,
  hit: LocationSearchHit,
  raw: string,
  flags: { hasState: boolean; hasLga: boolean }
): void {
  if (hit.area) {
    next.areas = [hit.area];
    next.area = hit.area;
    next.customLocation = hit.area;
  }
  if (hit.state && userTextMentionsPhrase(raw, hit.state) && !flags.hasState) {
    next.state = hit.state;
  }
  if (hit.lga && userTextMentionsPhrase(raw, hit.lga) && !flags.hasLga) {
    next.localGovernmentAreas = [hit.lga];
    next.lgas = [hit.lga];
  }
}

function tryExtractAreaFromClause(
  clause: string,
  raw: string,
  next: Record<string, unknown>,
  flags: { hasState: boolean; hasLga: boolean; hasArea: boolean }
): boolean {
  if (flags.hasArea) return false;
  for (const candidate of extractPlaceCandidatesFromText(clause)) {
    const hit = bestSearchHit(candidate);
    if (hit?.area) {
      applyAreaSearchHitToLoc(next, hit, raw, flags);
      return true;
    }
  }
  const direct = bestSearchHit(clause);
  if (direct?.area && levenshtein(clause, direct.area) <= 3) {
    applyAreaSearchHitToLoc(next, direct, raw, flags);
    return true;
  }
  return false;
}

export function applySmartLocationFromNaturalText(
  data: Record<string, unknown>,
  text: string,
  stateOptions: string[] = []
): Record<string, unknown> {
  const raw = correctTranscriptionLocationTypos(text.trim());
  if (!raw) return data;

  const loc = getLoc(data) || {};
  const hasState = isMeaningful(loc.state);
  const lgasRaw = loc.localGovernmentAreas ?? loc.lgas;
  const hasLga = Array.isArray(lgasRaw) && lgasRaw.some((x) => String(x).trim());
  const hasArea = locationPayloadHasAreas(loc);
  const flags = { hasState, hasLga, hasArea };

  const next: Record<string, unknown> = { ...loc };
  const parts = raw.split(/[,;]/).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    next.state = parts[0];
    next.localGovernmentAreas = [parts[1]];
    next.lgas = [parts[1]];
    next.areas = [parts.slice(2).join(", ")];
    next.area = parts.slice(2).join(", ");
    return { ...data, location: next };
  }

  if (parts.length === 2) {
    const head = parts[0];
    const tail = parts[1].replace(/[.!?]+$/, "").trim();

    if (!hasState) {
      const tailAsState = stateOptions.length ? resolveStateName(tail, stateOptions) : null;
      if (tailAsState) {
        next.state = tailAsState;
        if (tryExtractAreaFromClause(head, raw, next, flags)) {
          return { ...data, location: next };
        }
        return { ...data, location: next };
      }

      const headAsState = stateOptions.length ? resolveStateName(head, stateOptions) : null;
      if (headAsState) {
        next.state = headAsState;
        const lga = resolveLgaName(tail, headAsState) ?? tail;
        next.localGovernmentAreas = [lga];
        next.lgas = [lga];
        return { ...data, location: next };
      }
    }
    if (!hasLga) {
      const st = String(next.state ?? "").trim();
      const lga = st ? resolveLgaName(parts[0], st) ?? parts[0] : parts[0];
      next.localGovernmentAreas = [lga];
      next.lgas = [lga];
      const area = st ? resolveAreaName(parts[1], st, lga) ?? parts[1] : parts[1];
      next.areas = [area];
      next.area = area;
      return { ...data, location: next };
    }
    if (!hasArea) {
      const st = String(next.state ?? "").trim();
      const lgaList = Array.isArray(next.localGovernmentAreas)
        ? (next.localGovernmentAreas as string[]).map(String)
        : [];
      const lga = lgaList[0] || parts[0];
      const area = st ? resolveAreaName(parts.join(", "), st, lga) ?? parts.join(", ") : parts.join(", ");
      next.areas = [area];
      next.area = area;
      return { ...data, location: next };
    }
  }

  if (parts.length === 1) {
    const v = parts[0];
    const st = String(next.state ?? "").trim();

    if (!hasState) {
      const asState = stateOptions.length ? resolveStateName(v, stateOptions) : null;
      if (asState) {
        next.state = asState;
        return { ...data, location: next };
      }
      const hit = bestSearchHit(v);
      if (hit?.area) {
        const areaName = hit.area;
        if (!hasArea) {
          next.areas = [areaName];
          next.area = areaName;
          next.customLocation = areaName;
        }
        if (userTextMentionsPhrase(raw, hit.state) && !hasState) next.state = hit.state;
        if (hit.lga && userTextMentionsPhrase(raw, hit.lga) && !hasLga) {
          next.localGovernmentAreas = [hit.lga];
          next.lgas = [hit.lga];
        }
        return { ...data, location: next };
      }
      if (hit?.lga && !hit.area) {
        if (userTextMentionsPhrase(raw, hit.state)) next.state = hit.state;
        if (!hasLga) {
          next.localGovernmentAreas = [hit.lga];
          next.lgas = [hit.lga];
        }
        return { ...data, location: next };
      }
      if (hit?.state && !hit.lga && userTextMentionsPhrase(raw, hit.state)) {
        next.state = hit.state;
        return { ...data, location: next };
      }
    } else if (!hasLga) {
      const lga = resolveLgaName(v, st) ?? v;
      next.localGovernmentAreas = [lga];
      next.lgas = [lga];
      return { ...data, location: next };
    } else if (!hasArea) {
      const lgaList = Array.isArray(next.localGovernmentAreas)
        ? (next.localGovernmentAreas as string[]).map(String)
        : [];
      const lga = lgaList[0];
      const area = lga ? resolveAreaName(v, st, lga) ?? v : v;
      next.areas = [area];
      next.area = area;
      return { ...data, location: next };
    }
  }

  // Multi-clause sentences: "3 bedroom in leki to buy at 50 million"
  if (!hasArea && tryExtractAreaFromClause(raw, raw, next, flags)) {
    return { ...data, location: next };
  }

  if (!hasState && stateOptions.length > 0) {
    for (const st of stateOptions) {
      if (userTextMentionsPhrase(raw, st)) {
        next.state = st;
        return { ...data, location: next };
      }
    }
  }

  return data;
}
