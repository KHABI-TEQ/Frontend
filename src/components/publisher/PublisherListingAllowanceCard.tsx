"use client";

import Link from "next/link";
import type { PublisherListingEligibility } from "@/hooks/usePublisherListingEligibility";
import { STANDARD_LISTING_CAP } from "@/utils/subscription-plan-features";

type Props = {
  eligibility: PublisherListingEligibility | null;
  loading?: boolean;
};

export default function PublisherListingAllowanceCard({
  eligibility,
  loading,
}: Props) {
  if (loading && !eligibility) {
    return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 animate-pulse">
        Loading listing allowance…
      </div>
    );
  }

  if (!eligibility) return null;

  const {
    ownedProperties,
    listingLimit,
    listingsRemaining,
    canListProperties,
    requiresSpecialPlan,
  } = eligibility;

  const limit = listingLimit ?? STANDARD_LISTING_CAP;
  const used = ownedProperties ?? 0;
  const remaining =
    listingsRemaining != null
      ? listingsRemaining
      : Math.max(0, limit - used);
  const progress = limit <= 0 ? 1 : Math.min(1, Math.max(0, used / limit));

  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 ${
        requiresSpecialPlan || !canListProperties
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#09391C]">
            Your listing allowance
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            {eligibility.hasPaidSubscription
              ? <>This plan is capped at <strong>{limit} listings</strong>.</>
              : <>An active paid subscription is required to list. Plans are capped at <strong>{limit} listings</strong> (50 on the annual Licensed Agent plan).</>}
            {requiresSpecialPlan
              ? " You have reached that cap."
              : eligibility.hasPaidSubscription
                ? ` ${remaining} slot${remaining === 1 ? "" : "s"} remaining.`
                : " Subscribe to start listing."}
          </p>
          <div className="mt-3">
            <div className="h-2 rounded-full bg-white/80 overflow-hidden border border-black/5">
              <div
                className={`h-full rounded-full ${
                  requiresSpecialPlan ? "bg-amber-500" : "bg-emerald-600"
                }`}
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs font-medium opacity-80">
              {used}/{limit} used
            </p>
          </div>
        </div>

        <Link
          href="/agent-subscriptions?tab=plans"
          className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs font-medium text-center"
        >
          View plans
        </Link>
      </div>
    </div>
  );
}
