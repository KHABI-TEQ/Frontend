"use client";

import { Check, Home } from "lucide-react";

export type LicensedPlanChoice = {
  code: string;
  title: string;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  discountLabel: string | null;
  durationLabel: string;
  highlight: string;
  features: string[];
  ctaLabel: string;
  accent: "gold" | "green";
  mostPopular: boolean;
  durationMonths: number;
};

const YEAR_FEATURES = [
  "All core features",
  "Verified practitioner page",
  "Access to buyer & tenant demands",
  "Inspection & negotiation tools",
  "Transaction workflow tools",
  "Maximum value for long-term growth",
];

const QUARTER_FEATURES = YEAR_FEATURES.slice(0, 5);

export const LICENSED_AGENT_PLAN_CHOICES: LicensedPlanChoice[] = [
  {
    code: "LICENSED_AGENT_YEARLY",
    title: "1 Year Plan",
    tagline: "Best value for serious agents who want to grow",
    price: 140000,
    compareAtPrice: 350000,
    discountLabel: "60% OFF",
    durationLabel: "for 1 year",
    highlight: "Up to 50 properties",
    features: YEAR_FEATURES,
    ctaLabel: "Get 1 Year Plan",
    accent: "gold",
    mostPopular: false,
    durationMonths: 12,
  },
  {
    code: "LICENSED_AGENT_QTR",
    title: "3 Months Plan",
    tagline: "Perfect to get started and prove the platform",
    price: 40000,
    compareAtPrice: 150000,
    discountLabel: "73% OFF",
    durationLabel: "for 3 months",
    highlight: "Up to 25 properties",
    features: QUARTER_FEATURES,
    ctaLabel: "Get 3 Months Plan",
    accent: "green",
    mostPopular: true,
    durationMonths: 3,
  },
];

function naira(amount: number) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function asCard(raw: Record<string, unknown> | null | undefined): LicensedPlanChoice | null {
  if (!raw || typeof raw !== "object") return null;
  const card = (raw.card || raw) as Record<string, unknown>;
  const code = String(card.planCode || raw.code || "");
  const price = Number(card.price ?? raw.price ?? 0);
  if (!code || !price) return null;
  const durationInDays = Number(raw.durationInDays || (String(card.title || "").startsWith("1 Year") ? 365 : 90));
  const listingLimit = Number(raw.listingLimit || 0);
  const accent = card.accent === "gold" || durationInDays >= 360 ? "gold" : "green";
  const fallback = LICENSED_AGENT_PLAN_CHOICES.find((item) => item.accent === accent);
  const apiHighlight = String(card.highlight || "").replace(/^List up to /i, "Up to ");
  return {
    code,
    title: fallback?.title || String(card.title || "Plan"),
    tagline: fallback?.tagline || String(card.tagline || ""),
    price,
    compareAtPrice: card.compareAtPrice ? Number(card.compareAtPrice) : fallback?.compareAtPrice ?? null,
    discountLabel: card.discountLabel ? String(card.discountLabel) : fallback?.discountLabel ?? null,
    durationLabel: fallback?.durationLabel || String(card.durationLabel || ""),
    highlight: listingLimit > 0 ? `Up to ${listingLimit} properties` : apiHighlight || fallback?.highlight || "",
    features: fallback?.features || [],
    ctaLabel: fallback?.ctaLabel || String(card.ctaLabel || "Get this plan"),
    accent,
    mostPopular: Boolean(card.mostPopular),
    durationMonths: Math.max(1, Math.round(durationInDays / 30)),
  };
}

export function licensedPlanChoicesFromApi(plans: Array<Record<string, unknown>>): LicensedPlanChoice[] {
  const parent = plans.find((plan) => {
    const raw = (plan.raw || plan) as Record<string, unknown>;
    const code = String(raw.code || plan.code || "");
    const audience = String(raw.audience || plan.audience || "");
    return code === "LICENSED_AGENT_QTR" || audience === "licensed";
  });
  if (!parent) return LICENSED_AGENT_PLAN_CHOICES;
  const raw = (parent.raw || parent) as Record<string, unknown>;
  const quarterly = asCard(raw);
  const yearlySource = Array.isArray(raw.discountedPlans)
    ? (raw.discountedPlans as Record<string, unknown>[]).find((item) => Number(item.durationInDays) >= 360)
    : null;
  const yearly = asCard(yearlySource || undefined);
  const choices = [yearly, quarterly].filter((item): item is LicensedPlanChoice => !!item);
  if (choices.length < 2) return LICENSED_AGENT_PLAN_CHOICES;
  return choices.sort((left, right) => right.durationMonths - left.durationMonths);
}

function PlanCard({
  plan,
  onSelect,
}: {
  plan: LicensedPlanChoice;
  onSelect: (plan: LicensedPlanChoice) => void;
}) {
  const gold = plan.accent === "gold";
  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl px-6 pb-6 pt-7 shadow-sm ${
        gold ? "bg-[#FFF4CC] text-[#1A1A1A]" : "bg-[#0E7A45] text-white"
      }`}
    >
      {plan.mostPopular ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0E7A45] shadow-sm">
          Most Popular
        </span>
      ) : null}
      {plan.discountLabel ? (
        <span className="absolute right-4 top-4 rounded-md bg-[#E23B3B] px-2 py-1 text-[11px] font-bold tracking-wide text-white">
          {plan.discountLabel}
        </span>
      ) : null}

      <h2 className="pr-16 text-2xl font-bold">{plan.title}</h2>
      <p className={`mt-1 max-w-[16rem] text-sm leading-snug ${gold ? "text-[#3F3F3F]" : "text-white/85"}`}>
        {plan.tagline}
      </p>

      <div className="mt-5">
        {plan.compareAtPrice ? (
          <p className={`text-sm line-through ${gold ? "text-[#8A8A8A]" : "text-white/60"}`}>
            {naira(plan.compareAtPrice)}
          </p>
        ) : null}
        <p className="text-4xl font-extrabold tracking-tight">{naira(plan.price)}</p>
        <p className={`text-sm ${gold ? "text-[#4B4B4B]" : "text-white/80"}`}>{plan.durationLabel}</p>
      </div>

      {plan.highlight ? (
        <div
          className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
            gold ? "bg-[#FFFBE8] text-[#0E7A45]" : "bg-[#149454] text-white"
          }`}
        >
          <Home size={14} />
          {plan.highlight}
        </div>
      ) : null}

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                gold ? "bg-[#1F8A4C] text-white" : "bg-[#3DDA7A] text-[#083D1E]"
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold ${
          gold
            ? "bg-[#F5C400] text-[#1A1A1A] hover:bg-[#FFD24D]"
            : "border border-white bg-white text-[#0E7A45] hover:bg-[#F4FFF8]"
        }`}
      >
        {plan.ctaLabel}
        <span aria-hidden>→</span>
      </button>
    </article>
  );
}

export default function LicensedAgentPlanPicker({
  plans,
  onSelect,
}: {
  plans: Array<Record<string, unknown>>;
  onSelect: (plan: LicensedPlanChoice) => void;
}) {
  const choices = licensedPlanChoicesFromApi(plans);
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 pt-3 md:grid-cols-2 md:max-w-3xl">
      {choices.map((plan) => (
        <PlanCard key={plan.code} plan={plan} onSelect={onSelect} />
      ))}
    </div>
  );
}
