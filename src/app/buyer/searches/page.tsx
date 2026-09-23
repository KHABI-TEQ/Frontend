"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerProfile, getBuyerToken, naira } from "@/lib/search-insurance";

type MarketReview = {
  budgetFit?: "too_low" | "moderate";
  suggestedBudget?: { min: number; max: number; currency?: string } | null;
  reviewedAt?: string;
};

export default function BuyerSearchesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [buyerId, setBuyerId] = useState("");

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer/searches");
      return;
    }
    Promise.all([
      buyerFetch<{ policies: any[] }>("/buyer/auth/me/search-insurance"),
      buyerFetch<{ preferences: any[]; buyerId?: string }>("/buyer/auth/me/preferences"),
    ]).then(([ins, prefs]) => {
      setPolicies(ins.data?.policies || []);
      setPreferences(prefs.data?.preferences || []);
      setBuyerId(String(prefs.data?.buyerId || getBuyerProfile()?.id || ""));
      setLoading(false);
    });
  }, [router]);

  const policyByPreference = new Map(
    policies.map((p) => [String(p.preference?._id || p.preference), p])
  );

  return (
    <BuyerShell title="Your searches">
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading...</p>
      ) : (
        <div className="space-y-4">
          {preferences.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center">
              <p className="text-[#5A5D63]">No searches yet.</p>
              <Link href="/preference?insure=1" className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white">
                Submit a preference
              </Link>
            </div>
          ) : (
            preferences.map((pref) => {
              const policy = policyByPreference.get(String(pref._id));
              const insured = policy?.status === "active" || policy?.status === "claimed";
              const reviews: MarketReview[] = Array.isArray(pref.marketReviews) ? pref.marketReviews : [];
              const latest = reviews[0];
              const ownerId = buyerId || String(pref.buyer || "");
              const adjustHref = ownerId ? `/update-preference/${ownerId}/${pref._id}` : "";
              return (
                <article key={pref._id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#5A5D63]">{pref.preferenceType}</p>
                      <h2 className="text-lg font-bold text-[#09391C]">{pref.location?.state || "Search"}</h2>
                      <p className="text-sm text-[#5A5D63]">{pref.status}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${insured ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                      {insured ? `Insured · ${policy.policyReference}` : "Uninsured"}
                    </span>
                  </div>

                  {latest ? (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Market review</p>
                      <p className="mt-1 text-sm text-[#09391C]">
                        Budget is {latest.budgetFit === "too_low" ? "too low for this market" : "realistic for this market"}.
                      </p>
                      {latest.suggestedBudget?.min ? (
                        <p className="mt-1 text-sm text-[#09391C]">
                          Suggested range: {naira(latest.suggestedBudget.min)} – {naira(latest.suggestedBudget.max)}
                        </p>
                      ) : null}
                      {reviews.length > 1 ? (
                        <p className="mt-1 text-xs text-[#5A5D63]">{reviews.length} agent reviews received</p>
                      ) : null}
                      {adjustHref ? (
                        <Link
                          href={adjustHref}
                          className="mt-3 inline-flex rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Adjust this preference
                        </Link>
                      ) : null}
                    </div>
                  ) : adjustHref ? (
                    <Link
                      href={adjustHref}
                      className="mt-4 inline-flex text-sm font-semibold text-[#09391C]"
                    >
                      Open preference
                    </Link>
                  ) : null}

                  {insured ? (
                    <Link
                      href={`/buyer/claims/new?policyId=${policy._id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-[#09391C]"
                    >
                      File a claim ({naira(policy.coverAmount)} cover)
                    </Link>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      )}
    </BuyerShell>
  );
}
