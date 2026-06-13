"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { formatSubscriptionBonusLabel, resolvePlanBonusDays } from "@/utils/subscription-bonus";

interface DiscountedPlanOption {
  name: string;
  code: string;
  price: number;
  durationInDays: number;
  bonusDays?: number;
}

interface UnlimitedPlanOffer {
  _id: string;
  name: string;
  code: string;
  price: number;
  currency?: string;
  durationInDays: number;
  bonusDays?: number;
  discountedPlans?: DiscountedPlanOption[];
}

interface PortfolioUnlimitedModalProps {
  open: boolean;
  onClose: () => void;
  message?: string | null;
}

const currencySymbol = (cur?: string) => (cur && /usd|\$|dollar/i.test(cur) ? "$" : "₦");

export default function PortfolioUnlimitedModal({
  open,
  onClose,
  message,
}: PortfolioUnlimitedModalProps) {
  const [plan, setPlan] = useState<UnlimitedPlanOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const token = Cookies.get("token");
    if (!token) return;

    setLoading(true);
    GET_REQUEST<UnlimitedPlanOffer>(
      `${URLS.BASE}${URLS.publisherUnlimitedListingPlan}`,
      token
    )
      .then((res) => {
        if (res.success && res.data) {
          setPlan(res.data);
          setSelectedCode(res.data.code);
        } else {
          toast.error(res.message || "Portfolio Unlimited plan is not available yet.");
        }
      })
      .catch(() => toast.error("Could not load Portfolio Unlimited plan"))
      .finally(() => setLoading(false));
  }, [open]);

  const options = useMemo(() => {
    if (!plan) return [];
    const base = {
      name: plan.name,
      code: plan.code,
      price: plan.price,
      durationInDays: plan.durationInDays,
      bonusDays: plan.bonusDays ?? resolvePlanBonusDays(plan),
    };
    const discounted = (plan.discountedPlans || []).map((dp) => ({
      ...dp,
      bonusDays: dp.bonusDays ?? resolvePlanBonusDays(dp),
    }));
    return [base, ...discounted];
  }, [plan]);

  const selected = options.find((o) => o.code === selectedCode) ?? options[0];

  const handleSubscribe = async () => {
    if (!selected?.code) return;
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please sign in to continue");
      return;
    }

    setSubmitting(true);
    try {
      const res = await POST_REQUEST<{ authorizationUrl?: string }>(
        `${URLS.BASE}/account/subscriptions/makeSub`,
        { planCode: selected.code, autoRenewal: false },
        token
      );

      const paymentUrl =
        (res as any)?.data?.authorizationUrl ||
        (res as any)?.data?.paymentDetails?.authorization_url ||
        (res as any)?.authorizationUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      if (res.success) {
        toast.success("Subscription initiated");
        onClose();
        return;
      }

      toast.error(res.message || res.error || "Could not start subscription");
    } catch {
      toast.error("Could not start subscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#09391C]">Portfolio Unlimited</h2>
            <p className="mt-1 text-sm text-[#5A5D63]">
              {message ||
                "You have reached the standard limit of 25 property listings. Upgrade for unlimited listings across your portfolio."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading plan…</p>
        ) : plan && selected ? (
          <>
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.code}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                    selectedCode === option.code
                      ? "border-[#8DDB90] bg-[#f0fdf4]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="portfolio-unlimited-duration"
                      checked={selectedCode === option.code}
                      onChange={() => setSelectedCode(option.code)}
                    />
                    <div>
                      <p className="font-semibold text-[#09391C]">{option.name}</p>
                      {option.bonusDays ? (
                        <p className="text-xs text-[#16a34a]">
                          {formatSubscriptionBonusLabel(option.bonusDays)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="font-bold text-[#09391C]">
                    {currencySymbol(plan.currency)}
                    {Number(option.price).toLocaleString()}
                  </p>
                </label>
              ))}
            </div>

            <ul className="mt-4 space-y-1 text-sm text-[#5A5D63]">
              <li>Unlimited property listings</li>
              <li>For landlords, agents, and developers with large portfolios</li>
              <li>Only available after you reach the 25-listing standard cap</li>
            </ul>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700"
              >
                Not now
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubscribe}
                className="flex-1 rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B423D] disabled:opacity-60"
              >
                {submitting ? "Redirecting…" : "Upgrade to Portfolio Unlimited"}
              </button>
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">
            Portfolio Unlimited is not configured yet. Please contact support.
          </p>
        )}
      </div>
    </div>
  );
}
