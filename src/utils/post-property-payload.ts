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
 * Backend policy 403 messages for agent listing limits (grace, trial, subscription).
 */
export function isAgentListingPolicyError(message: string | undefined | null): boolean {
  if (!message || typeof message !== "string") return false;
  const m = message.toLowerCase();
  return (
    m.includes("7-day signup grace period") ||
    m.includes("7-day grace period has expired") ||
    m.includes("trial limit of 10") ||
    m.includes("4-week trial period has ended") ||
    m.includes("kyc-approved before creating") ||
    (m.includes("subscribe") && (m.includes("trial") || m.includes("property") || m.includes("plan")))
  );
}

/** @deprecated Use isAgentListingPolicyError */
export function isFreeLimitPropertyError(message: string | undefined | null): boolean {
  return isAgentListingPolicyError(message);
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
