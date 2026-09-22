/** Selectable preference-AI options aligned with the manual form. */

export const JV_DEVELOPMENT_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed-use", label: "Mixed-use Development" },
  { value: "industrial", label: "Industrial" },
] as const;

export const JV_DEVELOPMENT_TYPE_LABELS = JV_DEVELOPMENT_TYPES.map((d) => d.label);

export const SHORTLET_PROPERTY_TYPES = [
  { value: "studio", label: "Studio" },
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
] as const;

export const SHORTLET_PROPERTY_TYPE_LABELS = SHORTLET_PROPERTY_TYPES.map((d) => d.label);

export const SHORTLET_TRAVEL_TYPES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "business", label: "Business" },
] as const;

export const SHORTLET_TRAVEL_TYPE_LABELS = SHORTLET_TRAVEL_TYPES.map((d) => d.label);

export const RENT_LEASE_TERM_LABELS = ["6 months", "1 year", "2 years"];
export const RENT_PURPOSE_LABELS = ["Residential", "Office"];
export const JV_SHARING_RATIO_LABELS = ["50-50", "60-40", "70-30"];

function lookupValue(
  options: ReadonlyArray<{ value: string; label: string }>,
  raw: string,
): string | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  const match = options.find(
    (o) => o.value === t || o.label.toLowerCase() === t || t.includes(o.value) || o.label.toLowerCase().includes(t),
  );
  return match?.value ?? null;
}

export function normalizeJvDevelopmentTypes(text: string): string[] {
  const parts = text
    .replace(/\band\b/gi, ",")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    let value = lookupValue(JV_DEVELOPMENT_TYPES, part);
    const lower = part.toLowerCase();
    if (!value && /\b(flat|apartment|duplex|bungalow|terrace|mini|london)\b/.test(lower)) {
      value = "residential";
    }
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function normalizeShortletPropertyType(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\bstudio\b/.test(t)) return "studio";
  if (/\b1[\s-]*bed|apartment|flat\b/.test(t)) return "apartment";
  if (/\bduplex\b/.test(t)) return "duplex";
  if (/\bbungalow\b/.test(t)) return "bungalow";
  return lookupValue(SHORTLET_PROPERTY_TYPES, text);
}

export function normalizeTravelType(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\bfamil/.test(t)) return "family";
  if (/\bcouple|couple's|romantic\b/.test(t)) return "couple";
  if (/\bgroup\b/.test(t)) return "group";
  if (/\bbusiness|work|corporate\b/.test(t)) return "business";
  if (/\bsolo|alone|single\b/.test(t)) return "solo";
  return lookupValue(SHORTLET_TRAVEL_TYPES, text);
}
