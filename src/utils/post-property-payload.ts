/**
 * Normalizes form values for the property create/update API.
 * Backend expects isTenanted as "Yes" | "No" and holdDuration as non-empty.
 */

/**
 * API expects isTenanted to be exactly "Yes" or "No".
 * Form may store "yes", "no", "i-live-in-it", or empty.
 */
export function normalizeIsTenantedForApi(
  value: string | undefined | null
): "Yes" | "No" {
  if (!value || typeof value !== "string") return "No";
  const v = value.trim().toLowerCase();
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  if (v === "i-live-in-it") return "No";
  return "No";
}

/**
 * API does not allow empty holdDuration. Use "0" when not provided.
 */
export function normalizeHoldDurationForApi(
  value: string | number | undefined | null
): string {
  if (value === undefined || value === null) return "0";
  if (typeof value === "number") return String(value);
  const s = String(value).trim();
  return s === "" ? "0" : s;
}
