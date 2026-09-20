"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { AgentEligibility } from "@/types/agent-eligibility.types";
import type { PublisherListingEligibility } from "@/hooks/usePublisherListingEligibility";

type Variant = "hero" | "quick" | "inline";

type Props = {
  eligibility?: AgentEligibility | null;
  listingEligibility?: PublisherListingEligibility | null;
  variant?: Variant;
};

function listingState(
  eligibility?: AgentEligibility | null,
  listingEligibility?: PublisherListingEligibility | null,
) {
  const loaded = eligibility != null || listingEligibility != null;
  const kycBlocked =
    eligibility != null &&
    !eligibility.gate.ok &&
    eligibility.gate.reason === "kyc";
  const hasPaid =
    eligibility?.hasPaidSubscription === true ||
    listingEligibility?.hasPaidSubscription === true;
  const canList =
    !kycBlocked &&
    hasPaid &&
    (eligibility?.canListProperties === true ||
      listingEligibility?.canListProperties === true);

  return { loaded, kycBlocked, hasPaid, canList };
}

export default function ListPropertyCta({
  eligibility,
  listingEligibility,
  variant = "hero",
}: Props) {
  const { loaded, kycBlocked, hasPaid, canList } = listingState(eligibility, listingEligibility);

  if (!loaded) {
    if (variant === "quick") {
      return (
        <div className="w-full bg-[#8DDB90]/60 text-white p-4 rounded-lg font-medium flex items-center gap-3 animate-pulse">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Plus size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">List Property</h3>
            <p className="text-sm opacity-90">Checking listing eligibility…</p>
          </div>
        </div>
      );
    }
    return (
      <div
        id="list-property"
        className={
          variant === "inline"
            ? "bg-[#8DDB90]/70 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm animate-pulse"
            : "bg-[#09391C]/80 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 animate-pulse"
        }
      >
        <Plus size={variant === "inline" ? 16 : 20} />
        List Property
      </div>
    );
  }

  if (kycBlocked) {
    const label = "List Property — Available after KYC approval";
    const hint =
      "Listing unlocks after KYC is approved and a paid plan is active. While you wait, return to your dashboard, finish your public page, or choose a paid plan.";
    if (variant === "quick") {
      return (
        <div className="w-full bg-amber-50 text-amber-950 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200/60 rounded-lg">
              <Plus size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{label}</h3>
              <p className="text-sm mt-1 leading-relaxed">{hint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/agent-kyc"
                  className="px-3 py-1.5 bg-amber-700 text-white rounded text-xs font-semibold"
                >
                  View KYC status
                </Link>
                <Link
                  href="/agent-subscriptions?tab=plans"
                  className="px-3 py-1.5 border border-amber-700 text-amber-900 rounded text-xs font-semibold"
                >
                  Choose a paid plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div id="list-property" className="flex flex-col gap-1.5 min-w-0">
        <button
          type="button"
          disabled
          className={
            variant === "inline"
              ? "bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm cursor-not-allowed"
              : "bg-amber-100 text-amber-950 border border-amber-300 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          }
        >
          <Plus size={variant === "inline" ? 16 : 20} />
          {label}
        </button>
        <p className="text-xs text-amber-900/90 max-w-md leading-relaxed">{hint}</p>
      </div>
    );
  }

  if (!hasPaid || !canList) {
    const href = "/agent-subscriptions?tab=plans";
    const label = "Subscribe to list property";
    const hint = "An active paid plan is required before you can list. Choose a plan to continue.";
    if (variant === "quick") {
      return (
        <Link
          id="list-property"
          href={href}
          className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white p-4 rounded-lg font-medium flex items-center gap-3 transition-colors"
        >
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Plus size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{label}</h3>
            <p className="text-sm opacity-90">{hint}</p>
          </div>
        </Link>
      );
    }
    return (
      <div id="list-property" className="flex flex-col gap-1.5 min-w-0">
        <Link
          href={href}
          className={
            variant === "inline"
              ? "bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm"
              : "bg-[#09391C] hover:bg-[#0B423D] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          }
        >
          <Plus size={variant === "inline" ? 16 : 20} />
          {label}
        </Link>
        <p className="text-xs text-[#5A5D63] max-w-md">{hint}</p>
      </div>
    );
  }

  if (variant === "quick") {
    return (
      <Link
        id="list-property"
        href="/post-property"
        className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white p-4 rounded-lg font-medium flex items-center gap-3 transition-colors"
      >
        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
          <Plus size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">List New Property</h3>
          <p className="text-sm opacity-90">Add property to portfolio</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      id="list-property"
      href="/post-property"
      className={
        variant === "inline"
          ? "bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm"
          : "bg-[#09391C] hover:bg-[#0B423D] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      }
    >
      <Plus size={variant === "inline" ? 16 : 20} />
      List Property
    </Link>
  );
}
