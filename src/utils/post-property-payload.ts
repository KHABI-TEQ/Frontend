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
 * Backend policy 403 messages for listing eligibility (subscription + cap).
 */
export function isAgentListingPolicyError(message: string | undefined | null): boolean {
  if (!message || typeof message !== "string") return false;
  const m = message.toLowerCase();
  return (
    m.includes("subscribe to an active plan") ||
    m.includes("listing is only available with a paid subscription") ||
    m.includes("kyc-approved before creating") ||
    m.includes("complete kyc verification") ||
    m.includes("maximum of 25 property listings") ||
    m.includes("portfolio unlimited") ||
    (m.includes("subscribe") && (m.includes("property") || m.includes("plan") || m.includes("list")))
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
