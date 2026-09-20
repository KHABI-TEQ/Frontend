/**
 * Resolve spoken/typed places to the same Lagos catalog the manual listing form uses.
 */

import { LAGOS_AREA_ALIASES, LAGOS_LGA_ALIASES } from "@/data/lagos-location-inventory";
import {
  getAreasByStateLGA,
  getLGAsByState,
  PILOT_STATE,
  searchLocations,
} from "@/utils/location-utils";

export type CatalogLocationMatch = {
  state: string;
  lga: string;
  area?: string;
  label: string;
};

export type SpokenLocationResolution = {
  resolved: { state: string; localGovernment: string; area: string } | null;
  suggestions: CatalogLocationMatch[];
};

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  const s = norm(a);
  const t = norm(b);
  if (!s) return t.length;
  if (!t) return s.length;
  const dp = Array.from({ length: s.length + 1 }, () => new Array<number>(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[s.length][t.length];
}

function aliasToCanonical(query: string): string {
  const key = query.toLowerCase().trim();
  const compact = norm(query);
  return (
    LAGOS_AREA_ALIASES[key] ||
    LAGOS_AREA_ALIASES[compact] ||
    LAGOS_LGA_ALIASES[key] ||
    LAGOS_LGA_ALIASES[compact] ||
    query.trim()
  );
}

function matchLabel(hit: CatalogLocationMatch): string {
  return hit.area ? `${hit.area} (${hit.lga})` : hit.lga;
}

function uniqueKey(hit: CatalogLocationMatch): string {
  return `${hit.state}|${hit.lga}|${hit.area || ""}`.toLowerCase();
}

function collectCatalogHits(query: string): CatalogLocationMatch[] {
  const canonical = aliasToCanonical(query);
  const qn = norm(canonical);
  if (!qn) return [];

  const out: CatalogLocationMatch[] = [];
  const seen = new Set<string>();
  const push = (hit: CatalogLocationMatch) => {
    const key = uniqueKey(hit);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...hit, label: matchLabel(hit) });
  };

  for (const hit of searchLocations(canonical, 24)) {
    if (!hit.lga) continue;
    push({
      state: hit.state || PILOT_STATE,
      lga: hit.lga,
      area: hit.area,
      label: "",
    });
  }

  const lgas = getLGAsByState(PILOT_STATE);
  for (const lga of lgas) {
    const ln = norm(lga);
    if (ln === qn || ln.includes(qn) || qn.includes(ln) || levenshtein(lga, canonical) <= 2) {
      push({ state: PILOT_STATE, lga, label: "" });
    }
    for (const area of getAreasByStateLGA(PILOT_STATE, lga)) {
      const an = norm(area);
      if (an === qn || an.includes(qn) || qn.includes(an) || levenshtein(area, canonical) <= 2) {
        push({ state: PILOT_STATE, lga, area, label: "" });
      }
    }
  }

  return out;
}

function scoreHit(hit: CatalogLocationMatch, query: string): number {
  const canonical = aliasToCanonical(query);
  const qn = norm(canonical);
  let score = 40;
  if (hit.area) {
    const an = norm(hit.area);
    if (an === qn) score = 0;
    else if (an.includes(qn) || qn.includes(an)) score = 4;
    else score = 8 + levenshtein(hit.area, canonical);
  } else {
    const ln = norm(hit.lga);
    if (ln === qn) score = 1;
    else if (ln.includes(qn) || qn.includes(ln)) score = 6;
    else score = 10 + levenshtein(hit.lga, canonical);
  }
  return score;
}

export function formatCatalogLocation(match: CatalogLocationMatch): string {
  return match.area ? `${match.area}, ${match.lga}` : match.lga;
}

export function resolveSpokenLocationAgainstCatalog(
  spoken: string,
  opts?: { currentLga?: string; focus?: "lga" | "area" | "any" },
): SpokenLocationResolution {
  const raw = spoken.trim().replace(/[.!?]+$/, "");
  if (!raw) return { resolved: null, suggestions: [] };

  const focus = opts?.focus || "any";
  const currentLga = (opts?.currentLga || "").trim();
  const candidates = [
    raw,
    aliasToCanonical(raw),
    ...Array.from(
      raw.matchAll(
        /\b(?:in|at|around|near|within)\s+([A-Za-z][A-Za-z0-9\s'-]{1,40})/gi,
      ),
    ).map((m) => m[1].trim()),
  ].filter(Boolean);

  let hits: CatalogLocationMatch[] = [];
  for (const candidate of candidates) {
    hits = hits.concat(collectCatalogHits(candidate));
  }
  const seen = new Set<string>();
  hits = hits.filter((hit) => {
    const key = uniqueKey(hit);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (focus === "area" && currentLga) {
    const scoped = hits.filter((h) => h.lga.toLowerCase() === currentLga.toLowerCase() && h.area);
    if (scoped.length > 0) hits = scoped;
  }

  if (hits.length === 0) return { resolved: null, suggestions: [] };

  const query = aliasToCanonical(candidates[1] || candidates[0]);
  hits.sort((a, b) => scoreHit(a, query) - scoreHit(b, query));
  const best = hits[0];
  const bestScore = scoreHit(best, query);
  const close = hits.filter((h) => scoreHit(h, query) <= bestScore + 1).slice(0, 6);

  if (focus === "lga") {
    const exactLga = hits.find((h) => !h.area && norm(h.lga) === norm(query));
    if (exactLga) {
      return {
        resolved: { state: PILOT_STATE, localGovernment: exactLga.lga, area: "" },
        suggestions: close.filter((h) => h.area || h.lga !== exactLga.lga).slice(0, 4),
      };
    }
  }

  if (best.area && bestScore <= 4) {
    return {
      resolved: { state: PILOT_STATE, localGovernment: best.lga, area: best.area },
      suggestions: close.filter((h) => uniqueKey(h) !== uniqueKey(best)).slice(0, 4),
    };
  }

  if (!best.area && bestScore <= 2) {
    return {
      resolved: { state: PILOT_STATE, localGovernment: best.lga, area: "" },
      suggestions: close.filter((h) => uniqueKey(h) !== uniqueKey(best)).slice(0, 4),
    };
  }

  if (close.length === 1) {
    return {
      resolved: {
        state: PILOT_STATE,
        localGovernment: close[0].lga,
        area: close[0].area || "",
      },
      suggestions: [],
    };
  }

  return { resolved: null, suggestions: close };
}

export function applyCatalogLocationToPropertyLoc(
  location: Record<string, unknown>,
  resolved: { state: string; localGovernment: string; area: string },
): Record<string, unknown> {
  const areas = resolved.area
    ? [resolved.area]
    : Array.isArray(location.areas)
      ? (location.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
      : [];
  return {
    ...location,
    state: resolved.state || PILOT_STATE,
    localGovernment: resolved.localGovernment,
    area: resolved.area || areas[0] || "",
    areas,
  };
}
