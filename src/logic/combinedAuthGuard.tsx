"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";
import { Shield, CreditCard, CheckCircle2 } from "lucide-react";
import Block from "@/components/access/Block";
import { useAgentEligibility, resolveAgentKycStatus } from "@/hooks/useAgentEligibility";
import { usePublisherListingEligibility } from "@/hooks/usePublisherListingEligibility";
import { isLivePaidSubscription } from "@/utils/subscription-status";

/** Key used to redirect user back after subscription payment (e.g. to /post-property/outright-sales). */
export const REDIRECT_AFTER_SUBSCRIPTION_KEY = "redirectAfterSubscription";
  
interface CombinedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: ("Agent" | "Landowners" | "FieldAgent" | "Developer" | "PropertyScout" | "Lawyer" | "Surveyor" | "Valuer")[];
  redirectTo?: string;
  // Kept for backward-compatibility but ignored
  requireAgentOnboarding?: boolean;
  requireAgentApproval?: boolean;
  requireVerifiedAgent?: boolean;
  allowFreeAgents?: boolean;
  allowExpiredAgents?: boolean;
  // Active requirements
  requireActiveSubscription?: boolean;
  requireKycApproved?: boolean;
  agentCustomMessage?: string;
}

export const CombinedAuthGuard: React.FC<CombinedAuthGuardProps> = ({
  children,
  requireAuth = false,
  allowedUserTypes = [],
  redirectTo = "/auth/login",
  requireActiveSubscription = false,
  requireKycApproved = false,
  // ignored legacy props
}) => {
  const pathname = usePathname();
  const { user, isLoading, isInitialized } = useUserContext();
  const { eligibility, loading: eligibilityLoading } = useAgentEligibility();
  const { eligibility: listingEligibility, loading: listingLoading } = usePublisherListingEligibility();

  const isAgent = user?.userType === "Agent";
  const isDeveloper = user?.userType === "Developer";
  const isLandowner = user?.userType === "Landowners";
  const isPropertyScout = user?.userType === "PropertyScout";
  const isPublisher = isAgent || isDeveloper || isLandowner || isPropertyScout;
  const kycStatus = user && isAgent ? resolveAgentKycStatus(user) : undefined;
  const kycApproved = kycStatus === "approved";
  const snapshotPaid = isLivePaidSubscription(user?.activeSubscription);
  const hasPaidSubscription =
    listingEligibility?.hasPaidSubscription === true ||
    (isAgent && eligibility?.hasPaidSubscription === true) ||
    snapshotPaid;


  if (
    isLoading ||
    !isInitialized ||
    (isAgent && (requireKycApproved || requireActiveSubscription) && eligibilityLoading && !snapshotPaid) ||
    (isPublisher && requireActiveSubscription && listingLoading && !snapshotPaid)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <Loading />
      </div>
    );
  }

  if (requireAuth && !user) {
    if (typeof window !== "undefined") window.location.href = redirectTo;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <Loading />
      </div>
    );
  }

  if (requireAuth && user && allowedUserTypes.length > 0) {
    const raw =
      (user as { userType?: string }).userType ??
      (typeof window !== "undefined" ? localStorage.getItem("userType") : null) ??
      "";
    const normalized = String(raw).trim().toLowerCase();
    const allowedLower = allowedUserTypes.map((t) => t.toLowerCase());
    const isAllowed =
      allowedLower.includes(normalized) ||
      (normalized === "landowner" && allowedLower.includes("landowners"));
    if (!isAllowed) {
      return (
        <Block
          title="Access Denied"
          message="Your account type does not have permission to view this page."
          actionHref="/dashboard"
          actionLabel="Go to Dashboard"
          icon={<Shield size={32} className="text-[#8DDB90]" />}
        />
      );
    }
  }

  if (requireActiveSubscription && isPublisher && !hasPaidSubscription) {
    if (pathname && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(REDIRECT_AFTER_SUBSCRIPTION_KEY, pathname);
      } catch {}
    }
    const roleMessage = isLandowner
      ? "Property owners need an active subscription to list. Subscribe to a plan to continue."
      : isPropertyScout
        ? "Property scouts need an active subscription to list. Subscribe to a plan to continue."
        : isDeveloper
          ? "Developers need an active subscription to post properties. Subscribe to a plan to continue."
          : eligibility?.gate && !eligibility.gate.ok && eligibility.gate.reason === "subscription"
            ? eligibility.gate.message
            : "Subscribe to an active plan to list properties. Listing is only available with a paid subscription.";
    return (
      <Block
        title="Active Subscription Required"
        message={roleMessage}
        actionHref="/agent-subscriptions?tab=plans"
        actionLabel="Choose a paid plan"
        icon={<CreditCard size={32} className="text-[#EF4444]" />}
      />
    );
  }

  if (requireKycApproved && isAgent && !kycApproved) {
    const message =
      eligibility?.gate && !eligibility.gate.ok && eligibility.gate.reason === "kyc"
        ? eligibility.gate.message
        : "Complete KYC verification and obtain approval before listing properties.";
    return (
      <Block
        title="KYC Verification Required"
        message={`${message} You can still choose a paid plan while you wait.`}
        actionHref="/agent-kyc"
        actionLabel="View KYC status"
        secondaryHref="/agent-subscriptions?tab=plans"
        secondaryLabel="Choose a paid plan"
        icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
      />
    );
  }

  if (requireKycApproved && isPropertyScout && user?.kycStatus !== "approved") {
    return (
      <Block
        title="KYC Verification Required"
        message="Complete your KYC verification to start submitting property opportunities. You can still choose a paid plan while you wait."
        actionHref="/scout-kyc"
        actionLabel="View KYC status"
        secondaryHref="/agent-subscriptions?tab=plans"
        secondaryLabel="Choose a paid plan"
        icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
      />
    );
  }

  return <>{children}</>;
};

export default CombinedAuthGuard;
