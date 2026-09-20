"use client";

import Link from "next/link";
import { CheckCircle2, CreditCard, Shield } from "lucide-react";
import type { AgentEligibility } from "@/types/agent-eligibility.types";
import { STANDARD_LISTING_CAP } from "@/utils/subscription-plan-features";

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
    hasPaidSubscription,
    unlimitedListings,
    gate,
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
        body={
          gate.message ||
          (isKyc
            ? "Complete KYC verification and obtain approval before listing."
            : "Subscribe to an active plan to list properties.")
        }
        actions={
          <>
            {isKyc ? cta("/agent-kyc", "Complete KYC") : null}
            {cta("/agent-subscriptions?tab=plans", isKyc ? "Choose a paid plan" : "View plans", !isKyc)}
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
        body={
          unlimitedListings
            ? "Portfolio Unlimited is active — unlimited listings plus full practitioner tools."
            : `Practitioner tools are enabled. Listings stay within the standard ${STANDARD_LISTING_CAP}-property cap unless you upgrade to Portfolio Unlimited.`
        }
      />
    );
  }

  if (hasPaidSubscription && unlimitedListings) {
    return (
      <BannerShell
        tone="emerald"
        icon={<CheckCircle2 size={18} />}
        title="Portfolio Unlimited active"
        body="Unlimited listings, public practitioner page, and preference matching are enabled."
        actions={cta("/agent-subscriptions", "Manage subscription", false)}
      />
    );
  }

  if (hasPaidSubscription) {
    return (
      <BannerShell
        tone="emerald"
        icon={<CheckCircle2 size={18} />}
        title="Practitioner subscription active"
        body={`Public page and matching tools are enabled. Listings remain capped at ${STANDARD_LISTING_CAP} — upgrade to Portfolio Unlimited when you need more.`}
        actions={cta("/agent-subscriptions", "Manage subscription", false)}
      />
    );
  }

  return (
    <BannerShell
      tone="amber"
      icon={<CreditCard size={18} />}
      title="Subscribe to start listing"
      body="After signup, an active paid plan is required before you can list properties. Complimentary or trial listings are no longer available."
      actions={cta("/agent-subscriptions?tab=plans", "View plans")}
    />
  );
}
