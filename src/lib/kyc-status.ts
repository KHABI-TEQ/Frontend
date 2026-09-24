import type { User } from "@/context/user-context";

export type CanonicalKycStatus =
  | "none"
  | "pending"
  | "in_review"
  | "approved"
  | "rejected";

export const KYC_ACCOUNT_TYPES = new Set([
  "Agent",
  "Developer",
  "Lawyer",
  "Surveyor",
  "Valuer",
  "PropertyScout",
]);

export function kycPathForUser(userType?: string) {
  switch (userType) {
    case "Developer":
      return "/developer-kyc";
    case "Lawyer":
      return "/lawyer-kyc";
    case "Surveyor":
      return "/surveyor-kyc";
    case "Valuer":
      return "/valuer-kyc";
    case "PropertyScout":
      return "/scout-kyc";
    default:
      return "/agent-kyc";
  }
}

export function kycRoleLabel(userType?: string) {
  switch (userType) {
    case "PropertyScout":
      return "Property Scout";
    case "Agent":
    case "Developer":
    case "Lawyer":
    case "Surveyor":
    case "Valuer":
      return "practitioner";
    default:
      return "professional";
  }
}

export function isPendingKyc(status?: string | null) {
  return status === "pending" || status === "in_review";
}

export function isApprovedKyc(status?: string | null) {
  return status === "approved";
}

export function normalizeKycStatus(value?: string | null): CanonicalKycStatus {
  const s = String(value || "none").toLowerCase();
  if (s === "pending" || s === "in_review" || s === "approved") return s;
  if (s === "rejected" || s === "reject" || s === "requires_attention") return "rejected";
  if (s === "verified") return "approved";
  return "none";
}

/** Profile kycStatus first, then agentData / professional profile fallbacks. */
export function resolveKycStatus(
  user?: Pick<User, "kycStatus" | "agentData" | "userType"> | null,
  extra?: { kycStatus?: string | null } | null,
): CanonicalKycStatus {
  if (extra?.kycStatus && extra.kycStatus !== "none") {
    return normalizeKycStatus(extra.kycStatus);
  }
  if (!user) return "none";
  if (user.kycStatus && user.kycStatus !== "none") {
    return normalizeKycStatus(user.kycStatus);
  }
  return normalizeKycStatus(user.agentData?.kycStatus || extra?.kycStatus || user.kycStatus);
}
