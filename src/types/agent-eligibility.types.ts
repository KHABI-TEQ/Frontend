/** @format */

export type AgentPolicyPhase =
  | "kyc_grace"
  | "trial"
  | "subscription_required"
  | "subscribed"
  | "kyc_blocked"
  | "active";

export type PublisherKycStatus =
  | "none"
  | "pending"
  | "in_review"
  | "approved"
  | "rejected";

export interface AgentEligibility {
  kycStatus: PublisherKycStatus;
  kycApproved: boolean;
  kycGraceActive: boolean;
  kycGraceDaysRemaining: number | null;
  kycGraceDeadline: string | null;
  trialActive: boolean;
  trialDaysRemaining: number | null;
  trialDeadline: string | null;
  ownedProperties: number;
  listingLimit: number | null;
  listingsRemaining: number | null;
  subscriptionRequired: boolean;
  hasPaidSubscription: boolean;
  hasComplimentarySubscription: boolean;
  unlimitedListings: boolean;
  requiresSpecialPlan?: boolean;
  specialPlanCode?: string | null;
  specialPlanName?: string | null;
  canListProperties: boolean;
  canUseDealSite: boolean;
  canRequestToMarket: boolean;
  canSubscribe: boolean;
  gate: { ok: true } | { ok: false; reason: "kyc" | "subscription"; message: string };
  policyPhase: AgentPolicyPhase;
  constants: {
    kycGracePeriodDays: number;
    kycGraceMaxPropertiesWithoutApproval: number;
    trialPeriodDays: number;
    trialMaxPropertiesWithoutSubscription: number;
  };
  subscriptionIncentives: {
    monthlyBonusDays: number;
    quarterlyBonusDays: number;
    halfYearlyBonusDays: number;
    yearlyBonusDays: number;
  };
  paidSubscription: {
    expiresAt: string;
    bonusDays: number | null;
    planCode: string | null;
    planName: string | null;
  } | null;
}
