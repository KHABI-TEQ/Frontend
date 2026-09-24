/** @format */

"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { formatNairaAmountNumber, normalizeNairaAmountTyping } from "@/utils/nairaAmountInput";

function parseBudgetInput(raw: string): number {
  return Number(String(raw || "").replace(/,/g, ""));
}

type BudgetFit = "too_low" | "moderate";

type ReviewSummary = {
  reviewCount: number;
  budgetFit: Partial<Record<BudgetFit | "too_high", number>>;
};

type ReviewCapacity = {
  maxReviews: number;
  reviewCount: number;
  remaining: number;
  canSubmit: boolean;
  slotsFull: boolean;
};

type OwnReview = {
  budgetFit: BudgetFit;
  suggestedBudget?: { min: number; max: number; currency?: string } | null;
};

export default function MarketplacePreferenceReview({
  preferenceId,
  defaultMin,
  defaultMax,
  defaultBedrooms,
}: {
  preferenceId: string;
  defaultMin?: number;
  defaultMax?: number;
  defaultBedrooms?: string;
}) {
  const token = (Cookies.get("token") as string | undefined) || undefined;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [capacity, setCapacity] = useState<ReviewCapacity | null>(null);
  const [hasOwnReview, setHasOwnReview] = useState(false);
  const [budgetFit, setBudgetFit] = useState<BudgetFit>("moderate");
  const [suggestMin, setSuggestMin] = useState(defaultMin ? formatNairaAmountNumber(defaultMin) : "");
  const [suggestMax, setSuggestMax] = useState(defaultMax ? formatNairaAmountNumber(defaultMax) : "");

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await GET_REQUEST(
          `${URLS.BASE}${URLS.accountMarketplacePreferenceReview(preferenceId)}`,
          token
        );
        if (res?.success && res.data) {
          const data = res.data as {
            review?: OwnReview | null;
            summary?: ReviewSummary;
            capacity?: ReviewCapacity;
          };
          setSummary(data.summary || null);
          setCapacity(data.capacity || null);
          const mine = data.review;
          setHasOwnReview(Boolean(mine));
          if (mine) {
            setBudgetFit(mine.budgetFit === "too_low" ? "too_low" : "moderate");
            if (mine.suggestedBudget?.min) setSuggestMin(formatNairaAmountNumber(mine.suggestedBudget.min));
            if (mine.suggestedBudget?.max) setSuggestMax(formatNairaAmountNumber(mine.suggestedBudget.max));
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [preferenceId, token]);

  const slotsFull = Boolean(capacity?.slotsFull && !hasOwnReview);

  const save = async () => {
    if (!token) {
      toast.error("Log in as an agent to review this preference.");
      return;
    }
    if (slotsFull) {
      toast.error(`This preference already has ${capacity?.maxReviews || 5} agent reviews.`);
      return;
    }
    const body: Record<string, unknown> = { budgetFit };
    if (budgetFit === "too_low") {
      body.suggestedBudget = {
        min: parseBudgetInput(suggestMin),
        max: parseBudgetInput(suggestMax),
        currency: "NGN",
      };
    }

    setSaving(true);
    try {
      const res = await PUT_REQUEST(
        `${URLS.BASE}${URLS.accountMarketplacePreferenceReview(preferenceId)}`,
        body,
        token
      );
      if ((res as any)?.success) {
        toast.success("Review saved");
        const data = (res as any).data;
        if (data?.summary) setSummary(data.summary);
        if (data?.capacity) setCapacity(data.capacity);
        setHasOwnReview(true);
      } else {
        toast.error((res as any)?.message || "Could not save review");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#09391C] mb-2">Market review</h2>
      <p className="text-xs text-gray-600 mb-4">
        Tell the system if this preference is priced realistically for this market. The buyer receives this feedback and can adjust.
      </p>

      {summary && summary.reviewCount > 0 ? (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2 mb-4">
          {summary.reviewCount} of {capacity?.maxReviews || 5} agent
          {summary.reviewCount === 1 ? "" : "s"} reviewed this preference
          {summary.budgetFit?.too_low
            ? ` · ${summary.budgetFit.too_low} say budget is too low`
            : ""}
          {summary.budgetFit?.too_high
            ? ` · ${summary.budgetFit.too_high} say too high`
            : ""}
        </p>
      ) : (
        <p className="text-xs text-gray-500 mb-4">
          Up to {capacity?.maxReviews || 5} agents can review this preference.
        </p>
      )}

      {!token ? (
        <p className="text-sm text-gray-600">Log in as an agent to submit a review.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading review…</p>
      ) : slotsFull ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          This preference already has {capacity?.maxReviews || 5} agent reviews. Further reviews
          are closed. You can still view the preference details.
        </div>
      ) : (
        <div className="space-y-4">
          <fieldset>
            <legend className="text-sm font-medium text-gray-800 mb-2">Budget</legend>
            <div className="space-y-1.5">
              {(
                [
                  ["too_low", "Too low"],
                  ["moderate", "Moderate"],
                ] as [BudgetFit, string][]
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="budgetFit"
                    checked={budgetFit === value}
                    onChange={() => setBudgetFit(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {budgetFit !== "moderate" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-gray-600">
                  Suggested min (₦)
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={suggestMin}
                    onChange={(e) => setSuggestMin(normalizeNairaAmountTyping(e.target.value))}
                    className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Suggested max (₦)
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={suggestMax}
                    onChange={(e) => setSuggestMax(normalizeNairaAmountTyping(e.target.value))}
                    className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
            ) : null}
          </fieldset>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full bg-[#8DDB90] hover:bg-[#7BC97F] disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium"
          >
            {saving ? "Saving…" : hasOwnReview ? "Update review" : "Save review"}
          </button>
        </div>
      )}
    </div>
  );
}
