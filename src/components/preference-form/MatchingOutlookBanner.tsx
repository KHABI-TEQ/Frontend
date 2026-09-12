/** @format */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export type MatchingOutlookDraft = {
  preferenceType?: string;
  propertyType?: string;
  location?: Record<string, unknown> | null;
  enhancedLocation?: Record<string, unknown> | null;
  budget?: { minPrice?: number; maxPrice?: number; currency?: string } | null;
  minBedrooms?: string;
};

export type MatchingOutlookResult = {
  outlook: "low" | "moderate" | "high" | "unknown";
  confidence?: "low" | "medium" | "high";
  listingCountInBudget?: number;
  listingCountNearby?: number;
  reviewSampleSize?: number;
  budgetSignal?: "too_low" | "moderate" | "too_high" | null;
  typicalBudget?: { min: number; max: number; currency?: string } | null;
  typicalBedrooms?: string | null;
  message?: string;
};

function normalizeOutlookLocation(
  location?: Record<string, unknown> | null,
  enhanced?: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!location && !enhanced) return null;
  const loc = { ...(location || {}) };
  const lgasWithAreas =
    loc.lgasWithAreas || enhanced?.lgasWithAreas || loc.lgasWithAreas;
  const localGovernmentAreas =
    (Array.isArray(loc.localGovernmentAreas) && loc.localGovernmentAreas.length
      ? loc.localGovernmentAreas
      : Array.isArray(loc.lgas) && loc.lgas.length
        ? loc.lgas
        : Array.isArray(lgasWithAreas)
          ? (lgasWithAreas as { lgaName?: string }[])
              .map((row) => String(row?.lgaName || "").trim())
              .filter(Boolean)
          : []);
  return {
    ...loc,
    state: loc.state || enhanced?.state,
    localGovernmentAreas,
    lgasWithAreas,
  };
}

function hasLga(location?: Record<string, unknown> | null): boolean {
  if (!location) return false;
  const lgas = location.localGovernmentAreas;
  const alt = location.lgas;
  const nested = location.lgasWithAreas;
  if (Array.isArray(lgas) && lgas.some((x) => String(x || "").trim())) return true;
  if (Array.isArray(alt) && alt.some((x) => String(x || "").trim())) return true;
  if (
    Array.isArray(nested) &&
    nested.some((row: any) => String(row?.lgaName || "").trim())
  ) {
    return true;
  }
  return false;
}

export function isMatchingOutlookReady(draft: MatchingOutlookDraft): boolean {
  const type = String(draft.preferenceType || "").trim();
  const location = normalizeOutlookLocation(draft.location, draft.enhancedLocation);
  const state = String(location?.state || "").trim();
  const min = Number(draft.budget?.minPrice);
  const max = Number(draft.budget?.maxPrice);
  return Boolean(type && state && hasLga(location) && min > 0 && max >= min);
}

export function outlookDraftFromCollected(
  data?: Record<string, unknown> | null
): MatchingOutlookDraft {
  const loc = (data?.location || {}) as Record<string, unknown>;
  const budget = (data?.budget || {}) as {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
  };
  const pd = (data?.propertyDetails || {}) as Record<string, unknown>;
  const bd = (data?.bookingDetails || {}) as Record<string, unknown>;
  return {
    preferenceType: String(data?.preferenceType || ""),
    propertyType: String(pd.propertyType || bd.propertyType || data?.propertyType || ""),
    location: loc,
    enhancedLocation: (data?.enhancedLocation || null) as Record<string, unknown> | null,
    budget,
    minBedrooms: String(pd.minBedrooms || pd.bedrooms || bd.minBedrooms || ""),
  };
}

const TONE: Record<
  MatchingOutlookResult["outlook"],
  { wrap: string; title: string; body: string }
> = {
  high: {
    wrap: "bg-emerald-50 border-emerald-200",
    title: "text-emerald-900",
    body: "text-emerald-800",
  },
  moderate: {
    wrap: "bg-sky-50 border-sky-200",
    title: "text-sky-900",
    body: "text-sky-800",
  },
  low: {
    wrap: "bg-amber-50 border-amber-200",
    title: "text-amber-900",
    body: "text-amber-800",
  },
  unknown: {
    wrap: "bg-gray-50 border-gray-200",
    title: "text-gray-800",
    body: "text-gray-600",
  },
};

export default function MatchingOutlookBanner(draft: MatchingOutlookDraft) {
  const ready = isMatchingOutlookReady(draft);
  const [result, setResult] = useState<MatchingOutlookResult | null>(null);
  const [loading, setLoading] = useState(false);

  const signature = useMemo(
    () =>
      JSON.stringify({
        preferenceType: draft.preferenceType,
        propertyType: draft.propertyType,
        location: draft.location,
        enhancedLocation: draft.enhancedLocation,
        budget: draft.budget,
        minBedrooms: draft.minBedrooms,
      }),
    [
      draft.preferenceType,
      draft.propertyType,
      draft.location,
      draft.enhancedLocation,
      draft.budget,
      draft.minBedrooms,
    ]
  );

  useEffect(() => {
    if (!ready) {
      setResult(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const location = normalizeOutlookLocation(
          draft.location,
          draft.enhancedLocation
        );
        const res = await POST_REQUEST(
          `${URLS.BASE}${URLS.preferenceMatchingOutlook}`,
          {
            preferenceType: draft.preferenceType,
            propertyType: draft.propertyType,
            location,
            budget: {
              minPrice: Number(draft.budget?.minPrice),
              maxPrice: Number(draft.budget?.maxPrice),
              currency: draft.budget?.currency || "NGN",
            },
            propertyDetails: {
              propertyType: draft.propertyType,
              minBedrooms: draft.minBedrooms || undefined,
            },
          }
        );
        if (cancelled) return;
        if (res?.success && res.data) {
          setResult(res.data as MatchingOutlookResult);
        }
      } catch {
        /* outlook is advisory only */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, ready]);

  if (!ready) return null;

  const outlook = result?.outlook || "unknown";
  const tone = TONE[outlook] || TONE.unknown;
  const title =
    outlook === "high"
      ? "Matching chance looks high"
      : outlook === "low"
        ? "Matching chance looks low"
        : outlook === "moderate"
          ? "Matching chance looks moderate"
          : loading
            ? "Checking matching possibility…"
            : "Matching outlook";

  return (
    <div className={`rounded-lg border p-3 sm:p-4 ${tone.wrap}`}>
      <p className={`text-sm font-semibold ${tone.title}`}>{title}</p>
      <p className={`text-sm mt-1 ${tone.body}`}>
        {loading && !result
          ? "Looking at similar briefs and live listings in this location…"
          : result?.message ||
            "This is an estimate only. You can still submit your preference."}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        This does not block submit. Typical market ranges are a guide, not a requirement.
      </p>
    </div>
  );
}
