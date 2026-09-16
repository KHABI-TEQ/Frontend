export const PROPERTY_CODE_STORAGE_KEY = "khabiteqPropertyCode";

export function normalizePropertyCode(raw: string | null | undefined): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export function storePropertyCode(code: string): string {
  const normalized = normalizePropertyCode(code);
  if (typeof window !== "undefined" && normalized) {
    try {
      sessionStorage.setItem(PROPERTY_CODE_STORAGE_KEY, normalized);
    } catch {
      /* ignore quota / private mode */
    }
  }
  return normalized;
}

export function readStoredPropertyCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("code") || "";
    const stored = sessionStorage.getItem(PROPERTY_CODE_STORAGE_KEY) || "";
    return normalizePropertyCode(fromQuery || stored);
  } catch {
    return "";
  }
}
