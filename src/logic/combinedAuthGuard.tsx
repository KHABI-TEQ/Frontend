"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";
import { motion } from "framer-motion";
import { Shield, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Block from "@/components/access/Block";
import { useAgentEligibility, resolveAgentKycStatus } from "@/hooks/useAgentEligibility";

/** Key used to redirect user back after subscription payment (e.g. to /post-property/outright-sales). */
export const REDIRECT_AFTER_SUBSCRIPTION_KEY = "redirectAfterSubscription";
  
interface CombinedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: ("Agent" | "Landowners" | "FieldAgent" | "Developer")[];
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

  const isAgent = user?.userType === "Agent";
  const isDeveloper = user?.userType === "Developer";
  const kycStatus = user && isAgent ? resolveAgentKycStatus(user) : undefined;
  const kycApproved = kycStatus === "approved";
  const hasActiveSubscription = !!(
    user?.activeSubscription && user.activeSubscription.status === "active"
  );
  const hasPaidSubscription = eligibility?.hasPaidSubscription === true;
  const canListDuringPolicy = eligibility?.canListProperties ?? (kycApproved || !requireKycApproved);


  if (isLoading || !isInitialized || (isAgent && (requireKycApproved || requireActiveSubscription) && eligibilityLoading)) {
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

  // KYC restriction: agents in the 7-day grace may post 1 property; otherwise require approval or policy pass.
  if (requireKycApproved && isAgent && !canListDuringPolicy) {
    const message =
      eligibility?.gate && !eligibility.gate.ok
        ? eligibility.gate.message
        : "You must complete KYC verification and obtain approval to continue (the 7-day grace period has expired).";
    return (
      <Block
        title="KYC Verification Required"
        message={message}
        actionHref="/agent-kyc"
        actionLabel="Submit KYC"
        icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
      />
    );
  }

  // Subscription restriction: agents need paid subscription only after trial/cap (backend policy).
  if (requireActiveSubscription && (isAgent || isDeveloper)) {
    if (isAgent && !kycApproved) {
      return (
        <Block
          title="KYC Required Before Subscribing"
          message={
            "Please submit your KYC for approval before purchasing a subscription."
          }
          actionHref="/agent-kyc"
          actionLabel="Submit KYC"
          icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
        />
      );
    }

    const subscriptionBlocked =
      isAgent
        ? eligibility?.subscriptionRequired === true && !hasPaidSubscription
        : !hasActiveSubscription;

    if (subscriptionBlocked) {
      // Remember where they wanted to go so payment-verification can redirect back (e.g. /post-property/outright-sales)
      if (pathname && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(REDIRECT_AFTER_SUBSCRIPTION_KEY, pathname);
        } catch {}
      }
      return (
        <Block
          title="Active Subscription Required"
          message={
            isDeveloper
              ? "Developers need an active subscription to post properties. Subscribe to a plan to continue."
              : eligibility?.gate && !eligibility.gate.ok && eligibility.gate.reason === "subscription"
                ? eligibility.gate.message
                : "Your trial has ended or you have reached the listing limit. Subscribe to a paid plan to continue."
          }
          actionHref="/agent-subscriptions?tab=plans"
          actionLabel="View Plans"
          icon={<CreditCard size={32} className="text-[#EF4444]" />}
        />
      );
    }
  }

  return <>{children}</>;
};

export default CombinedAuthGuard;
