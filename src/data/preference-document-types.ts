/** Title / document options — same list as the preference form. */
export const PREFERENCE_DOCUMENT_TYPES = [
  { value: "deed-of-assignment", label: "Deed of Assignment" },
  { value: "deed-of-ownership", label: "Deed of Ownership" },
  { value: "deed-of-conveyance", label: "Deed of Conveyance" },
  { value: "survey-plan", label: "Survey Plan" },
  { value: "governors-consent", label: "Governor's Consent" },
  { value: "certificate-of-occupancy", label: "Certificate of Occupancy" },
  { value: "family-receipt", label: "Family Receipt" },
  { value: "contract-of-sale", label: "Contract of Sale" },
  { value: "land-certificate", label: "Land Certificate" },
  { value: "gazette", label: "Gazette" },
  { value: "excision", label: "Excision" },
] as const;

export const PREFERENCE_DOCUMENT_TYPE_LABELS = PREFERENCE_DOCUMENT_TYPES.map((d) => d.label);

export function normalizePreferenceDocumentValues(parts: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of parts) {
    const t = String(raw || "").trim();
    if (!t) continue;
    const lower = t.toLowerCase();
    const match = PREFERENCE_DOCUMENT_TYPES.find(
      (d) =>
        d.value === lower ||
        d.label.toLowerCase() === lower ||
        d.label.toLowerCase().includes(lower) ||
        lower.includes(d.label.toLowerCase()),
    );
    let value = match?.value;
    if (!value && /c\s*of\s*o|certificate of occup/i.test(t)) value = "certificate-of-occupancy";
    if (!value && /governor/.test(lower)) value = "governors-consent";
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function preferenceDocumentLabelsFromValues(values: string[]): string[] {
  return values
    .map((v) => PREFERENCE_DOCUMENT_TYPES.find((d) => d.value === v)?.label || v)
    .filter(Boolean);
}
