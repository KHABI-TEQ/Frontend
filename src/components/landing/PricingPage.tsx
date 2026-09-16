"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { formatCatalogFeatureRow } from "@/utils/subscription-plan-features";
import { DarkCta, OutlineCta } from "@/components/landing/primitives";

type CatalogFeature = {
  feature?: { key?: string; label?: string };
  key?: string;
  label?: string;
  type?: string;
  value?: number | string | boolean;
};

type DiscountedPlan = {
  name?: string;
  price?: number;
  durationInDays?: number;
  billingInterval?: string;
  billingIntervalLabel?: string;
};

type CatalogPlan = {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  price?: number;
  basePrice?: number;
  currency?: string;
  durationInDays?: number;
  isTrial?: boolean;
  isFree?: boolean;
  audience?: string;
  audienceLabel?: string;
  category?: string;
  categoryLabel?: string;
  benefits?: string[];
  features?: CatalogFeature[];
  discountedPlans?: DiscountedPlan[];
  billingIntervalLabel?: string;
  maxProfessionals?: number;
  allowsOffPlan?: boolean;
  unlimitedListings?: boolean;
};

const naira = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `₦${Number(value).toLocaleString()}`;
};

const durationLabel = (days?: number) => {
  if (!days || days <= 0) return "";
  if (days >= 300) return "year";
  if (days >= 150) return "6 months";
  if (days >= 80) return "3 months";
  if (days >= 20) return "month";
  return `${days} days`;
};

function pickPriceByDays(plan: CatalogPlan, min: number, max: number) {
  const days = Number(plan.durationInDays || 0);
  const base = Number(plan.price ?? plan.basePrice ?? 0);
  if (days >= min && days < max) return base;
  const match = (plan.discountedPlans || []).find((dp) => {
    const d = Number(dp.durationInDays || 0);
    return d >= min && d < max;
  });
  return match ? Number(match.price || 0) : null;
}

function registerHref(audience?: string) {
  if (audience === "developer") return "/auth/register?userType=Developer";
  if (audience === "scout") return "/auth/register?intent=scout";
  return "/auth/register?userType=Agent";
}

function designedFor(audience?: string) {
  if (audience === "developer") return "Developers and property owners presenting projects and controlling who can market them.";
  if (audience === "scout") return "Property Scouts participating in opportunities without a professional real estate licence.";
  return "Licensed agents building a Practitioner Page, listings and demand matching.";
}

function capability(plan: CatalogPlan, testers: RegExp[]) {
  const hay = [
    ...(plan.benefits || []),
    ...(plan.features || []).map((f) => String(f.feature?.label || f.label || "")),
  ].join(" ").toLowerCase();
  return testers.some((re) => re.test(hay));
}

export default function PricingPageContent() {
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await GET_REQUEST<CatalogPlan[]>(
        `${URLS.BASE}${URLS.getSubscriptionPlans}?category=all&audience=all`,
      );
      const rows = Array.isArray(res.data) ? res.data : [];
      setPlans(rows.filter((p) => p && p.name));
      setLoading(false);
    };
    void load();
  }, []);

  const groups = useMemo(() => {
    const agents = plans.filter((p) => (p.audience || "licensed") === "licensed");
    const developers = plans.filter((p) => p.audience === "developer");
    const scouts = plans.filter((p) => p.audience === "scout");
    return { agents, developers, scouts };
  }, [plans]);

  return (
    <main className="w-full min-h-screen bg-[#FFFEFB] pt-24 sm:pt-28 lg:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#0B423D]/60">
          For professionals
        </p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold text-[#09391C] leading-tight">
          KHABITEQ PROFESSIONAL PLANS
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-[#5A5D63] leading-relaxed">
          Choose the plan that fits your professional role and level of activity on Khabiteq.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-[#5A5D63]">
          Property seekers do not need a subscription for the core journey — submit a preference, get matched, connect with professionals, inspect and keep a record. Subscriptions are for professionals building a presence on Khabiteq.
        </p>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl border border-gray-100 bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-12 space-y-14">
            <PlanGroup
              title="AGENTS"
              intro="For licensed agents who want a Practitioner Page, listings and access to relevant property demand."
              plans={groups.agents}
              empty="Agent plans will appear here once published in the Khabiteq catalog."
            />
            <PlanGroup
              title="DEVELOPERS / PROPERTY OWNERS"
              intro="Present your property or development, stay in control of who can market it, and access applicable transaction tools."
              plans={groups.developers}
              empty="Developer and owner plans will appear here once published in the Khabiteq catalog."
            />
            <PlanGroup
              title="OTHER ELIGIBLE PROFESSIONALS"
              intro="Lawyers, surveyors, valuers and Property Scouts use Khabiteq to make their services or opportunities discoverable. The service is delivered by the professional; Khabiteq provides the connection and infrastructure."
              plans={groups.scouts}
              empty="Property Scout plans will appear here once published in the Khabiteq catalog."
              extra={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { role: "Lawyers", href: "/auth/register?userType=Lawyer", text: "Make property/legal services discoverable on a Practitioner Page." },
                    { role: "Surveyors", href: "/auth/register?userType=Surveyor", text: "Connect with property seekers who need survey and site services." },
                    { role: "Valuers", href: "/auth/register?userType=Valuer", text: "Make valuation services discoverable when independent valuation is required." },
                  ].map((item) => (
                    <article key={item.role} className="rounded-2xl border border-gray-100 bg-white p-6">
                      <h3 className="text-lg font-bold text-[#09391C]">{item.role}</h3>
                      <p className="mt-2 text-sm text-[#5A5D63] leading-relaxed">{item.text}</p>
                      <p className="mt-3 text-xs text-[#5A5D63]">Designed for credentialed professionals after KYC and licence verification.</p>
                      <Link href={item.href} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#09391C] px-5 text-sm font-semibold text-white">
                        GET STARTED
                      </Link>
                    </article>
                  ))}
                </div>
              }
            />
          </div>
        )}

        <section className="mt-16 rounded-2xl bg-[#F5F7F9] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#09391C]">FAQs</h2>
          <dl className="mt-6 space-y-5">
            {[
              ["Do property seekers need a subscription?", "No. Submitting a preference, matching, connecting with professionals and booking an inspection are part of the core seeker journey. A specific paid service only applies if you request one, such as professional due diligence."],
              ["Who are these plans for?", "Khabiteq professional plans are for agents, developers, property owners and other eligible professionals building a Practitioner Page and participating in the ecosystem."],
              ["Does a plan replace KYC?", "No. Licensed professionals complete KYC and credential verification. Property Scouts complete KYC, and each scout listing is reviewed separately before it can go live."],
              ["Does Khabiteq provide the professional service?", "No. Lawyers, surveyors, valuers and agents provide their services directly. Khabiteq provides discovery, matching, workflow and records."],
              ["How do I subscribe?", "Create a professional account, complete the applicable onboarding, then choose a plan. If you already have an account, you can subscribe from your dashboard."],
            ].map(([q, a]) => (
              <div key={q}>
                <dt className="font-semibold text-[#09391C]">{q}</dt>
                <dd className="mt-1 text-sm text-[#5A5D63] leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <DarkCta href="/auth/register">GET STARTED</DarkCta>
          <OutlineCta href="/for-professionals">FOR PROFESSIONALS</OutlineCta>
        </div>
      </div>
    </main>
  );
}

function PlanGroup({
  title,
  intro,
  plans,
  empty,
  extra,
}: {
  title: string;
  intro: string;
  plans: CatalogPlan[];
  empty: string;
  extra?: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#09391C]">{title}</h2>
      <p className="mt-2 max-w-3xl text-[#5A5D63]">{intro}</p>
      {plans.length === 0 ? (
        extra ? <div className="mt-6">{extra}</div> : <p className="mt-4 text-sm text-[#5A5D63]">{empty}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan._id || plan.id || plan.code || plan.name} plan={plan} />
            ))}
          </div>
          {plans.length > 1 ? <PlanComparison plans={plans} /> : null}
          {extra ? <div className="mt-6">{extra}</div> : null}
        </>
      )}
    </section>
  );
}

function PlanCard({ plan }: { plan: CatalogPlan }) {
  const monthly = pickPriceByDays(plan, 20, 80);
  const yearly = pickPriceByDays(plan, 300, 800);
  const billed = Number(plan.price ?? plan.basePrice ?? 0);
  const billedLabel = durationLabel(plan.durationInDays);
  const featureRows = (plan.features || [])
    .map((f) =>
      formatCatalogFeatureRow(plan, {
        key: f.feature?.key || f.key,
        label: f.feature?.label || f.label,
        type: f.type,
        value: f.value,
      }),
    )
    .filter((row) => row.isOn && row.label);

  const highlights = [
    { label: "Practitioner Page", on: true },
    { label: "Listing benefits", on: capability(plan, [/listing/, /showcase/, /publish/]) || plan.audience === "licensed" || plan.audience === "developer" || plan.audience === "scout" },
    { label: "Property matching", on: capability(plan, [/match/, /demand/, /preference/]) || plan.audience === "licensed" },
    { label: "Inspection opportunities", on: capability(plan, [/inspect/]) || plan.audience === "licensed" },
    { label: "Transaction tools", on: capability(plan, [/transaction/, /request to market/, /distribution/, /off-plan/]) || plan.audience === "developer" || !!plan.allowsOffPlan || plan.audience === "licensed" },
  ];

  const benefitList = (plan.benefits || []).slice(0, 8);

  return (
    <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 flex flex-col shadow-[0_10px_32px_-22px_rgba(9,57,28,0.4)]">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8DDB90]">
        {plan.categoryLabel || "Professional plan"}
      </p>
      <h3 className="mt-2 text-xl font-bold text-[#09391C]">{plan.name}</h3>
      <div className="mt-4">
        <p className="text-3xl font-bold text-[#09391C]">{naira(billed)}</p>
        <p className="text-sm text-[#5A5D63]">{billedLabel ? `Billed per ${billedLabel}` : "Catalog price"}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {monthly != null ? (
          <span className="rounded-full bg-[#F5F7F9] px-3 py-1 text-[#09391C]">Monthly {naira(monthly)}</span>
        ) : null}
        {yearly != null ? (
          <span className="rounded-full bg-[#F5F7F9] px-3 py-1 text-[#09391C]">Annual {naira(yearly)}</span>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-[#5A5D63] leading-relaxed">
        <span className="font-semibold text-[#09391C]">Designed for: </span>
        {designedFor(plan.audience)}
      </p>
      <ul className="mt-5 space-y-2">
        {highlights.map((item) => (
          <li key={item.label} className={`flex items-start gap-2 text-sm ${item.on ? "text-[#09391C]" : "text-gray-400"}`}>
            <Check size={16} className={item.on ? "text-[#8DDB90] mt-0.5 shrink-0" : "text-gray-300 mt-0.5 shrink-0"} />
            {item.label}
          </li>
        ))}
      </ul>
      {(benefitList.length ? benefitList : featureRows.slice(0, 6).map((r) => `${r.label}${r.valueText}`)).length ? (
        <ul className="mt-4 space-y-1.5">
          {(benefitList.length ? benefitList : featureRows.slice(0, 6).map((r) => `${r.label}${r.valueText}`)).map((item) => (
            <li key={item} className="text-sm text-[#5A5D63] flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8DDB90] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto pt-6 flex flex-col gap-2">
        <Link
          href={registerHref(plan.audience)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#09391C] px-5 text-sm font-semibold text-white"
        >
          GET STARTED
        </Link>
        <Link
          href="/agent-subscriptions?tab=plans"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#09391C]/20 px-5 text-sm font-semibold text-[#09391C]"
        >
          CHOOSE PLAN
        </Link>
      </div>
    </article>
  );
}

function PlanComparison({ plans }: { plans: CatalogPlan[] }) {
  const rows = [
    { label: "Practitioner Page", test: () => true },
    { label: "Listings", test: () => true },
    { label: "Property matching", test: (p: CatalogPlan) => capability(p, [/match/, /demand/]) || p.audience === "licensed" },
    { label: "Inspection opportunities", test: (p: CatalogPlan) => capability(p, [/inspect/]) || p.audience === "licensed" },
    { label: "Transaction tools", test: (p: CatalogPlan) => capability(p, [/transaction/, /distribution/, /off-plan/]) || p.audience === "developer" || !!p.allowsOffPlan || p.audience === "licensed" },
    { label: "Off-plan", test: (p: CatalogPlan) => !!p.allowsOffPlan || /off-plan/i.test(p.name) },
  ];

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left p-4 text-[#5A5D63] font-medium">Feature</th>
            {plans.map((plan) => (
              <th key={plan.code || plan.name} className="text-left p-4 text-[#09391C] font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-gray-50">
              <td className="p-4 text-[#5A5D63]">{row.label}</td>
              {plans.map((plan) => (
                <td key={`${plan.code}-${row.label}`} className="p-4">
                  {row.test(plan) ? <Check size={16} className="text-[#8DDB90]" /> : <span className="text-gray-300">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
