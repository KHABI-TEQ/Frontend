"use client";

import { useState } from "react";
import type { PublisherListingEligibility } from "@/hooks/usePublisherListingEligibility";
import PortfolioUnlimitedModal from "@/components/publisher/PortfolioUnlimitedModal";
import { STANDARD_LISTING_CAP } from "@/utils/subscription-plan-features";

type Props = {
  eligibility: PublisherListingEligibility | null;
  loading?: boolean;
};

/**
 * Listing allowance block — "View plans" opens Portfolio Unlimited
 * (the only plan that lifts the standard 25-listing cap).
 */
export default function PublisherListingAllowanceCard({
  eligibility,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);

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
    unlimitedListings,
    canListProperties,
    requiresSpecialPlan,
  } = eligibility;

  const limit = listingLimit ?? STANDARD_LISTING_CAP;
  const used = ownedProperties ?? 0;
  const remaining =
    listingsRemaining != null
      ? listingsRemaining
      : Math.max(0, limit - used);
  const progress =
    unlimitedListings || limit <= 0
      ? 1
      : Math.min(1, Math.max(0, used / limit));

  return (
    <>
      <div
        className={`mb-4 rounded-lg border px-4 py-3 ${
          unlimitedListings
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : requiresSpecialPlan || !canListProperties
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-slate-200 bg-slate-50 text-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#09391C]">
              Your listing allowance
            </p>
            {unlimitedListings ? (
              <p className="mt-1 text-sm leading-relaxed">
                Portfolio Unlimited is active — no hard cap on how many properties
                you can list. You currently have {used} listing
                {used === 1 ? "" : "s"}.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm leading-relaxed">
                  Free trial agents are capped at <strong>10 listings</strong>.
                  Premium access is capped at <strong>{limit} listings</strong>.
                  Only <strong>Portfolio Unlimited</strong> removes that Premium
                  cap.
                  {requiresSpecialPlan
                    ? " You have reached the Premium cap — upgrade to keep listing."
                    : ` ${remaining} Premium slot${remaining === 1 ? "" : "s"} remaining.`}
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
              </>
            )}
          </div>

          {!unlimitedListings ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs font-medium"
            >
              View Portfolio Unlimited
            </button>
          ) : null}
        </div>
      </div>

      <PortfolioUnlimitedModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
