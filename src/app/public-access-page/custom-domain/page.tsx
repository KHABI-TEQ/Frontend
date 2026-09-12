/**
 * Custom Domain / White Labeling
 * Quarterly or yearly subscription: practitioner listing eligibility + branded domain.
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { CheckCircle2, Globe, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { formatSubscriptionBonusLabel } from "@/utils/subscription-bonus";

type WhiteLabelPlan = {
  planCode: string;
  name: string;
  price: number;
  currency?: string;
  durationInDays?: number;
  billingInterval?: string;
  billingIntervalLabel?: string;
  benefits?: string[];
  categoryLabel?: string;
  bonusDays?: number;
};

function parsePreferredNames(raw: string) {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CustomDomainPage() {
  const token = (Cookies.get("token") as string | undefined) || undefined;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [preferredNames, setPreferredNames] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const applyPayload = useCallback((payload: any) => {
    setData(payload);
    const req = payload?.request;
    setPreferredNames((req?.preferredNames || []).join(", "));
    setContactEmail(req?.contactEmail || "");
    setNotes(req?.notes || "");
    const plans: WhiteLabelPlan[] = Array.isArray(payload?.plans) ? payload.plans : [];
    const activeCode = payload?.activeSubscription?.planCode || null;
    setSelectedPlanCode((current) => {
      if (current && plans.some((p) => p.planCode === current)) return current;
      if (activeCode && plans.some((p) => p.planCode === activeCode)) return activeCode;
      return plans[0]?.planCode || null;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GET_REQUEST(`${URLS.BASE}${URLS.customDomain}`, token);
      if (res?.success) {
        applyPayload(res.data);
      } else {
        toast.error(res?.message || "Failed to load custom domain details");
      }
    } catch {
      toast.error("Failed to load custom domain details");
    } finally {
      setLoading(false);
    }
  }, [applyPayload, token]);

  useEffect(() => {
    load();
  }, [load]);

  const plans: WhiteLabelPlan[] = Array.isArray(data?.plans) ? data.plans : [];
  const selectedPlan = useMemo(
    () => plans.find((p) => p.planCode === selectedPlanCode) || null,
    [plans, selectedPlanCode]
  );
  const request = data?.request;
  const site = data?.site;
  const activeSub = data?.activeSubscription;
  const needsPublicPage = !!data?.needsPublicPage;
  const needsKyc = !!data?.needsKyc;
  const setupBlocked = needsPublicPage || needsKyc;
  const status = request?.status || "draft";
  const cdStatus = site?.customDomainStatus || "none";
  const canPayPackage =
    !!request && !setupBlocked && ["draft", "awaiting-payment"].includes(status);
  const canRenew =
    !setupBlocked &&
    !!site?.customDomain &&
    ["live", "disabled"].includes(cdStatus);
  const graceDays = Number(data?.graceDays) || 14;

  const persistPreferences = async () => {
    if (setupBlocked) {
      throw new Error(
        needsKyc
          ? "KYC must be approved before requesting a custom domain."
          : "Set up your practitioner page before requesting a custom domain."
      );
    }
    const names = parsePreferredNames(preferredNames);
    const res = await POST_REQUEST(
      `${URLS.BASE}${URLS.customDomain}`,
      { preferredNames: names, contactEmail, notes },
      token
    );
    if (!res?.success) {
      throw new Error(res?.message || "Failed to save preferences");
    }
    applyPayload(res.data);
    return names;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await persistPreferences();
      toast.success("Preferred domain names saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const startPayment = async (mode: "package" | "renewal") => {
    if (setupBlocked) {
      toast.error(
        needsKyc
          ? "KYC must be approved before you can subscribe"
          : "Set up your practitioner page first"
      );
      return;
    }
    if (!selectedPlanCode) {
      toast.error("Select a quarterly or yearly plan first");
      return;
    }
    setPaying(true);
    try {
      if (mode === "package") {
        const names = await persistPreferences();
        if (!names.length) {
          toast.error("Add at least one preferred domain name before paying");
          return;
        }
      }
      const endpoint =
        mode === "package" ? URLS.customDomainPay : URLS.customDomainRenew;
      const res = await POST_REQUEST(
        `${URLS.BASE}${endpoint}`,
        { planCode: selectedPlanCode, autoRenewal },
        token
      );
      const payUrl = (res as any)?.data?.payment?.authorization_url;
      if ((res as any)?.success && payUrl) {
        toast.success("Redirecting to payment...");
        window.location.href = payUrl;
        return;
      }
      toast.error((res as any)?.message || "Could not start payment");
    } catch (err: any) {
      toast.error(err?.message || "Could not start payment");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="text-emerald-600" size={24} />
            Custom Domain / White Labeling
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Quarterly or yearly. This plan includes practitioner listing eligibility and your own branded domain.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-950">
        <p className="font-semibold mb-1">How this differs from Standard</p>
        <ul className="list-disc ml-5 space-y-0.5">
          <li>Standard subscriptions: listing eligibility only</li>
          <li>White-labeling: listing eligibility + custom domain, SSL, and branded hosting</li>
          <li>After payment, admin forwards your preferred names to tech to go live</li>
        </ul>
      </div>

      {needsPublicPage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold">Set up your practitioner page first</p>
            <p className="mt-1">
              White-labeling attaches a custom domain to your live public page. Complete setup, then subscribe here.
            </p>
          </div>
          <Link
            href="/public-access-page/setup"
            className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center"
          >
            Set up page
          </Link>
        </div>
      ) : null}

      {needsKyc ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">KYC approval required</p>
          <p className="mt-1">Your KYC must be approved before you can request a custom domain.</p>
        </div>
      ) : null}

      {site?.publicUrl ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p className="text-gray-500">Fallback page</p>
          <p className="font-medium text-gray-900 break-all">{site.publicUrl}</p>
        </div>
      ) : null}

      {site?.customDomain ? (
        <div
          className={`rounded-lg border p-4 text-sm ${
            cdStatus === "live"
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold">Custom domain: {site.customDomain}</p>
          <p className="mt-1">
            Status: {cdStatus}
            {site.customDomainExpiresAt
              ? ` · Expires ${new Date(site.customDomainExpiresAt).toLocaleDateString()}`
              : ""}
            {` · ${graceDays}-day grace after expiry`}
          </p>
        </div>
      ) : request ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-gray-700">
          Request status: <span className="font-semibold">{status}</span>
        </div>
      ) : null}

      {activeSub ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Active white-labeling subscription
          {activeSub.planCode ? ` · ${activeSub.planCode}` : ""}
          {activeSub.expiresAt
            ? ` · expires ${new Date(activeSub.expiresAt).toLocaleDateString()}`
            : ""}
          {` · auto-renew ${activeSub.autoRenew ? "on" : "off"}`}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const selected = plan.planCode === selectedPlanCode;
          const bonus = formatSubscriptionBonusLabel(Number(plan.bonusDays) || 0);
          return (
            <button
              key={plan.planCode}
              type="button"
              onClick={() => setSelectedPlanCode(plan.planCode)}
              className={`text-left rounded-xl border-2 p-5 bg-white transition-colors ${
                selected ? "border-emerald-500 shadow-sm" : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {plan.billingIntervalLabel || plan.name}
                  </h2>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    {plan.categoryLabel || "Custom Domain / White Labeling"}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ₦{Number(plan.price || 0).toLocaleString()}
                </p>
              </div>
              {bonus ? (
                <p className="text-sm font-medium text-emerald-700 mt-2">{bonus} on activation</p>
              ) : null}
              <ul className="mt-4 space-y-2">
                {(plan.benefits || []).map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {selected ? (
                <p className="mt-4 text-xs font-semibold text-emerald-700">Selected</p>
              ) : null}
            </button>
          );
        })}
      </div>

      {!plans.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No white-labeling plans are published yet. Ask admin to seed the quarterly and yearly Custom Domain packages.
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Preferred domain details</h3>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Preferred domain names</span>
          <input
            value={preferredNames}
            onChange={(e) => setPreferredNames(e.target.value)}
            placeholder="ayochamber.com, ayo-chamber.com"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Contact email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Notes for tech (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
          <input
            type="checkbox"
            checked={autoRenewal}
            onChange={(e) => setAutoRenewal(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">Auto-renew</span>
            <span className="block text-xs text-gray-500">
              Charge this plan again at expiry so listing access and the domain stay live.
            </span>
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || paying || setupBlocked}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save preferences"}
          </button>
          {canPayPackage ? (
            <button
              type="button"
              onClick={() => startPayment("package")}
              disabled={paying || saving || !selectedPlan}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {paying
                ? "Starting payment..."
                : selectedPlan
                  ? `Subscribe ${selectedPlan.billingIntervalLabel || ""} · ₦${Number(selectedPlan.price).toLocaleString()}`
                  : "Subscribe"}
            </button>
          ) : null}
          {canRenew ? (
            <button
              type="button"
              onClick={() => startPayment("renewal")}
              disabled={paying || saving || !selectedPlan}
              className="px-4 py-2 border border-emerald-600 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-60"
            >
              {selectedPlan
                ? `Renew ${selectedPlan.billingIntervalLabel || ""} · ₦${Number(selectedPlan.price).toLocaleString()}`
                : "Renew"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
