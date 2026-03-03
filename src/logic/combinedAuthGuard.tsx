"use client";

import React, { ReactNode } from "react";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";
import { motion } from "framer-motion";
import { Shield, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Block from "@/components/access/Block";
  
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
  const { user, isLoading, isInitialized } = useUserContext();

  const isAgent = user?.userType === "Agent";
  const isDeveloper = user?.userType === "Developer";
  const kycStatus = user && isAgent
    ? ((user as any)?.agentData?.kycStatus as "none" | "pending" | "in_review" | "approved" | "rejected" | undefined)
    : undefined;
  const kycApproved = kycStatus === "approved";
  const hasActiveSubscription = !!(
    user?.activeSubscription && user.activeSubscription.status === "active"
  );


  if (isLoading || !isInitialized) {
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

  // KYC restriction: if required, only allow Agents with approved KYC
  if (requireKycApproved && isAgent && !kycApproved) {
    return (
      <Block
        title="KYC Verification Required"
        message={
          "You must complete your onboarding and be approved before you can post properties."
        }
        actionHref="/agent-kyc"
        actionLabel="Submit KYC"
        icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
      />
    );
  }

  // Subscription restriction: applies to Agents and Developers (per backend)
  if (requireActiveSubscription && (isAgent || isDeveloper)) {
    // Agents only: KYC must be approved before subscribing
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

    if (!hasActiveSubscription) {
      return (
        <Block
          title="Active Subscription Required"
          message={
            isDeveloper
              ? "Developers need an active subscription to post properties. Subscribe to a plan to continue."
              : "This page requires an active agent subscription. Choose a plan to continue."
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
