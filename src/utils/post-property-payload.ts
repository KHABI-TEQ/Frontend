/**
 * Normalizes form values for the property create/update API.
 * Backend accepts "Yes"/"No"/"yes"/"no"/"i-live-in-it" and stores lowercase enum.
 * holdDuration must be non-empty.
 */

/**
 * Map form tenancy values to the API Title Case contract ("Yes" | "No").
 * "I live in it" / i-live-in-it is sent as "No" for the Yes/No API shape used by create;
 * edit also accepts "i-live-in-it" if the form stores that enum value.
 */
export function normalizeIsTenantedForApi(
  value: string | undefined | null
): "Yes" | "No" | "i-live-in-it" {
  if (!value || typeof value !== "string") return "No";
  const v = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (v === "yes") return "Yes";
  if (v === "i-live-in-it" || v === "iliveinit") return "i-live-in-it";
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
    m.includes("trial limit of") ||
    m.includes("4-week trial period has ended") ||
    m.includes("kyc-approved before creating") ||
    m.includes("maximum of 25 property listings") ||
    m.includes("portfolio unlimited") ||
    (m.includes("subscribe") && (m.includes("trial") || m.includes("property") || m.includes("plan")))
  );
}

export const LISTING_LIMIT_SPECIAL_PLAN_CODE = "LISTING_LIMIT_SPECIAL_PLAN";

export function parseListingLimitErrorDetails(details: unknown): {
  code?: string;
  ownedProperties?: number;
  listingLimit?: number;
  specialPlanCode?: string;
  specialPlanName?: string;
} | null {
  if (!details) return null;
  if (typeof details === "object") {
    return details as {
      code?: string;
      ownedProperties?: number;
      listingLimit?: number;
      specialPlanCode?: string;
      specialPlanName?: string;
    };
  }
  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }
  return null;
}

export function isPortfolioUnlimitedRequired(details: unknown): boolean {
  const parsed = parseListingLimitErrorDetails(details);
  return parsed?.code === LISTING_LIMIT_SPECIAL_PLAN_CODE;
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
