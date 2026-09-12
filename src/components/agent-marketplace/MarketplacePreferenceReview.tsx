/** @format */

"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type BudgetFit = "too_low" | "moderate";

type ReviewSummary = {
  reviewCount: number;
  budgetFit: Partial<Record<BudgetFit | "too_high", number>>;
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
  const [budgetFit, setBudgetFit] = useState<BudgetFit>("moderate");
  const [suggestMin, setSuggestMin] = useState(String(defaultMin || ""));
  const [suggestMax, setSuggestMax] = useState(String(defaultMax || ""));

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
          const data = res.data as { review?: OwnReview | null; summary?: ReviewSummary };
          setSummary(data.summary || null);
          const mine = data.review;
          if (mine) {
            setBudgetFit(mine.budgetFit === "too_low" ? "too_low" : "moderate");
            if (mine.suggestedBudget?.min) setSuggestMin(String(mine.suggestedBudget.min));
            if (mine.suggestedBudget?.max) setSuggestMax(String(mine.suggestedBudget.max));
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

  const save = async () => {
    if (!token) {
      toast.error("Log in as an agent to review this preference.");
      return;
    }
    const body: Record<string, unknown> = { budgetFit };
    if (budgetFit === "too_low") {
      body.suggestedBudget = {
        min: Number(suggestMin),
        max: Number(suggestMax),
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
        Tell the system if this brief is priced and specified realistically for this LGA, area, or estate. Buyers will not see your notes.
      </p>

      {summary && summary.reviewCount > 0 ? (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2 mb-4">
          {summary.reviewCount} agent{summary.reviewCount === 1 ? "" : "s"} reviewed this brief
          {summary.budgetFit?.too_low
            ? ` · ${summary.budgetFit.too_low} say budget is too low`
            : ""}
          {summary.budgetFit?.too_high
            ? ` · ${summary.budgetFit.too_high} say too high`
            : ""}
        </p>
      ) : null}

      {!token ? (
        <p className="text-sm text-gray-600">Log in as an agent to submit a review.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading review…</p>
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
                    type="number"
                    min={1}
                    value={suggestMin}
                    onChange={(e) => setSuggestMin(e.target.value)}
                    className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Suggested max (₦)
                  <input
                    type="number"
                    min={1}
                    value={suggestMax}
                    onChange={(e) => setSuggestMax(e.target.value)}
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
            {saving ? "Saving…" : "Save review"}
          </button>
        </div>
      )}
    </div>
  );
}
