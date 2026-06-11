"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, CreditCard, Shield } from "lucide-react";
import type { AgentEligibility } from "@/types/agent-eligibility.types";

interface AgentEligibilityBannerProps {
  eligibility: AgentEligibility | null;
  loading?: boolean;
  compact?: boolean;
}

function BannerShell({
  tone,
  icon,
  title,
  body,
  actions,
}: {
  tone: "blue" | "amber" | "red" | "emerald";
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const tones = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-red-50 border-red-200 text-red-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="shrink-0 mt-0.5">{icon}</div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{title}</p>
            <div className="mt-1 text-sm leading-relaxed opacity-90">{body}</div>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export default function AgentEligibilityBanner({
  eligibility,
  loading,
  compact,
}: AgentEligibilityBannerProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 animate-pulse">
        Loading account policy status…
      </div>
    );
  }

  if (!eligibility) return null;

  const {
    policyPhase,
    kycGraceDaysRemaining,
    trialDaysRemaining,
    ownedProperties,
    listingLimit,
    listingsRemaining,
    unlimitedListings,
    hasPaidSubscription,
    hasComplimentarySubscription,
    gate,
    constants,
  } = eligibility;

  const cta = (href: string, label: string, primary = true) => (
    <Link
      href={href}
      className={
        primary
          ? "px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium"
          : "px-3 py-1.5 border border-current rounded hover:bg-white/60 text-sm font-medium"
      }
    >
      {label}
    </Link>
  );

  if (!gate.ok) {
    const isKyc = gate.reason === "kyc";
    return (
      <BannerShell
        tone="red"
        icon={isKyc ? <Shield size={18} /> : <CreditCard size={18} />}
        title={isKyc ? "KYC verification required" : "Paid subscription required"}
        body={gate.message}
        actions={
          <>
            {isKyc ? cta("/agent-kyc", "Complete KYC") : null}
            {!isKyc ? cta("/agent-subscriptions?tab=plans", "View plans") : null}
          </>
        }
      />
    );
  }

  if (compact && hasPaidSubscription) {
    return (
      <BannerShell
        tone="emerald"
        icon={<CheckCircle2 size={18} />}
        title="Paid subscription active"
        body="Unlimited property listings, full practitioner page access, and preference-matching visibility are enabled."
      />
    );
  }

  const items: React.ReactNode[] = [];

  if (policyPhase === "kyc_grace") {
    items.push(
      <BannerShell
        key="grace"
        tone="blue"
        icon={<Clock size={18} />}
        title={`KYC grace period — ${kycGraceDaysRemaining ?? constants.kycGracePeriodDays} day(s) left`}
        body={
          <>
            You may list <strong>1 property</strong> and use your practitioner page while you complete KYC.
            {ownedProperties >= 1 ? (
              <> You have reached the grace-period listing limit until KYC is approved.</>
            ) : (
              <> Submit KYC early to unlock up to {constants.trialMaxPropertiesWithoutSubscription} trial listings.</>
            )}
          </>
        }
        actions={cta("/agent-kyc", "Complete KYC")}
      />
    );
  }

  if (policyPhase === "trial") {
    items.push(
      <BannerShell
        key="trial"
        tone="blue"
        icon={<Clock size={18} />}
        title={`Trial period — ${trialDaysRemaining ?? "?"} day(s) left`}
        body={
          <>
            KYC approved. You may list up to{" "}
            <strong>
              {listingLimit ?? constants.trialMaxPropertiesWithoutSubscription} properties
            </strong>{" "}
            without a paid subscription
            {listingsRemaining != null ? (
              <> ({listingsRemaining} remaining)</>
            ) : null}
            . A paid plan unlocks unlimited listings and bonus validity on every tier.
          </>
        }
        actions={
          <>
            {cta("/agent-subscriptions?tab=plans", "View plans", false)}
            {cta("/post-property", "Post property")}
          </>
        }
      />
    );
  }

  if (hasPaidSubscription && unlimitedListings) {
    items.push(
      <BannerShell
        key="paid"
        tone="emerald"
        icon={<CheckCircle2 size={18} />}
        title="Practitioner subscription active"
        body="Unlimited listings, public practitioner page, and preference matching are enabled."
        actions={cta("/agent-subscriptions", "Manage subscription", false)}
      />
    );
  } else if (hasComplimentarySubscription && !hasPaidSubscription) {
    items.push(
      <BannerShell
        key="complimentary"
        tone="amber"
        icon={<AlertCircle size={18} />}
        title="Complimentary welcome plan"
        body="Your KYC welcome grant does not replace a paid practitioner subscription after the trial window. Subscribe to keep listing, your public page, and Request To Market access."
        actions={cta("/agent-subscriptions?tab=plans", "Choose a paid plan")}
      />
    );
  }

  if (items.length === 0) {
    return (
      <BannerShell
        tone="blue"
        icon={<Shield size={18} />}
        title="Agent account policy"
        body={
          <>
            Days 0–7: up to 1 listing without KYC approval. After KYC: up to{" "}
            {constants.trialMaxPropertiesWithoutSubscription} listings during the 4-week trial. Paid
            subscriptions include unlimited listings plus bonus validity on each plan tier.
          </>
        }
        actions={cta("/agent-kyc", "KYC status", false)}
      />
    );
  }

  return <div className="space-y-3">{items}</div>;
}
