"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Compass,
  HardHat,
  Quote,
  Scale,
  Sparkles,
} from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export type CatalogFeatureDetail = {
  title: string;
  description?: string;
};

export type CatalogBillingOption = {
  code: string;
  name?: string;
  price: number;
  durationInDays?: number;
  billingInterval?: string;
  billingIntervalLabel?: string;
  label?: string;
  listingLimit?: number;
};

export type CatalogPlan = {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  price?: number;
  durationInDays?: number;
  audience?: string;
  audienceLabel?: string;
  catalogGroup?: string;
  catalogGroupLabel?: string;
  headline?: string;
  tagline?: string;
  designedFor?: string;
  featureDetails?: CatalogFeatureDetail[];
  benefits?: string[];
  registerHref?: string;
  displayWithCode?: string | null;
  discountedPlans?: CatalogBillingOption[];
  maxProfessionals?: number;
  allowsOffPlan?: boolean;
  listingLimit?: number;
};

export type CatalogGroupMeta = {
  key: string;
  label: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  designedFor: string;
  quote?: { text: string; attribution: string } | null;
  highlights?: string[];
  registerHref: string;
  sortOrder?: number;
};

type CatalogResponse = {
  success?: boolean;
  data?: CatalogPlan[];
  meta?: { groups?: CatalogGroupMeta[] };
};

const FALLBACK_GROUPS: CatalogGroupMeta[] = [
  {
    key: "service-professional",
    label: "Service Professionals",
    eyebrow: "Service Professionals",
    headline: "Your Expertise Matters.",
    tagline: "Connect with property seekers who need legal, survey and valuation services. Grow your practice with Khabiteq.",
    designedFor: "For lawyers, surveyors and valuers who want to make their services discoverable.",
    registerHref: "/auth/register?userType=Lawyer",
    highlights: ["More Clients", "Verified & Trusted", "Professional Visibility"],
    sortOrder: 1,
  },
  {
    key: "licensed",
    label: "Licensed Agent Plans",
    eyebrow: "Licensed Agent Plan",
    headline: "Grow Your Real Estate Business with Khabiteq",
    tagline: "Get a verified professional page, manage your listings, connect with serious property seekers and close more opportunities.",
    designedFor: "For licensed real estate agents. Verified. Trusted. Visible.",
    registerHref: "/auth/register?userType=Agent",
    highlights: ["Serious Property Seekers", "Build Trust & Credibility", "Grow Your Earnings"],
    sortOrder: 2,
  },
  {
    key: "scout",
    label: "Property Scout Plans",
    eyebrow: "Property Scout",
    headline: "Turn Opportunities into Income",
    tagline: "List properties, get connected to buyers and earn commissions with Khabiteq.",
    designedFor: "Designed for verified Property Scouts who want to participate in property opportunities without a real estate license.",
    registerHref: "/auth/register?intent=scout",
    highlights: ["Real Opportunities", "Verified Platform", "Earn More"],
    quote: {
      text: "Khabiteq has made it easy for me to list properties and connect with serious clients.",
      attribution: "Property Scout, Lagos",
    },
    sortOrder: 3,
  },
  {
    key: "developer-distribution",
    label: "Property Distribution Plans for Developers",
    eyebrow: "Developers / Landowners",
    headline: "Showcase. Distribute. Sell.",
    tagline: "Present your properties, manage who can market them, and reach serious buyers through Khabiteq's trusted network of professionals.",
    designedFor: "Designed for developers and property owners seeking to showcase and distribute their properties.",
    registerHref: "/auth/register?userType=Developer",
    highlights: [
      "Connect with verified professionals",
      "Expand your marketing reach",
      "Stay in control of who can market",
    ],
    sortOrder: 4,
  },
  {
    key: "developer-offplan",
    label: "Off-plan Plans for Developers",
    eyebrow: "Developers",
    headline: "Off-plan Plan",
    tagline: "Designed for developers marketing off-plan projects with wider professional distribution.",
    designedFor: "Designed for developers marketing off-plan projects with wider professional distribution.",
    registerHref: "/auth/register?userType=Developer",
    highlights: [
      "Connect with verified professionals",
      "Expand your marketing reach",
      "Stay in control of who can market",
    ],
    sortOrder: 5,
  },
];

const GROUP_ICONS: Record<string, typeof Compass> = {
  "service-professional": Scale,
  licensed: Briefcase,
  scout: Compass,
  "developer-distribution": Building2,
  "developer-offplan": HardHat,
};

const GROUP_ORDER = [
  "service-professional",
  "licensed",
  "scout",
  "developer-distribution",
  "developer-offplan",
];

function sortCatalogGroups(groups: CatalogGroupMeta[]) {
  return [...groups].sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a.key);
    const bi = GROUP_ORDER.indexOf(b.key);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

function resolvePlanGroupKey(plan: CatalogPlan) {
  const code = String(plan.code || "").toUpperCase();
  const name = String(plan.name || "");
  const audience = String(plan.audience || "").toLowerCase();
  const key = String(plan.catalogGroup || "");

  if (
    code.includes("SCOUT") ||
    audience === "scout" ||
    /property\s*scout/i.test(name)
  ) {
    return "scout";
  }
  if (
    audience === "lawyer" ||
    audience === "surveyor" ||
    audience === "valuer" ||
    /LAWYER|SURVEYOR|VALUER/.test(code)
  ) {
    return "service-professional";
  }
  if (
    key === "developer-offplan" ||
    plan.allowsOffPlan ||
    /OFFPLAN|OFF-PLAN|OFF_PLAN/.test(code) ||
    /off-plan/i.test(name)
  ) {
    return "developer-offplan";
  }
  if (
    key === "developer-distribution" ||
    audience === "developer" ||
    /DISTRIBUTION/.test(code)
  ) {
    return "developer-distribution";
  }
  if (key === "licensed" || audience === "licensed" || /LICENSED_AGENT/.test(code)) {
    return "licensed";
  }
  if (key && GROUP_ORDER.includes(key)) return key;
  return "licensed";
}

function planRoleTag(plan: CatalogPlan, group: CatalogGroupMeta) {
  const key = resolvePlanGroupKey(plan);
  if (key === "developer-offplan") return "Developer";
  if (key === "developer-distribution") return "Developer / Landowner";
  if (key === "scout") return "Property Scout";
  if (key === "licensed") return "Licensed Agent";
  if (plan.audience === "lawyer") return "Lawyer";
  if (plan.audience === "surveyor") return "Surveyor";
  if (plan.audience === "valuer") return "Valuer";
  return plan.audienceLabel || group.label;
}

function naira(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `₦${Number(value).toLocaleString()}`;
}

function periodLabel(days?: number, interval?: string) {
  if (interval === "yearly" || (days || 0) >= 300) return "per year";
  if (interval === "quarterly" || (days || 0) >= 80) return "per 3 months";
  if (interval === "monthly" || (days || 0) >= 20) return "per month";
  return days ? `per ${days} days` : "";
}

function billingOptionsFor(plan: CatalogPlan, extras: CatalogPlan[] = []): CatalogBillingOption[] {
  const options: CatalogBillingOption[] = [
    {
      code: String(plan.code || ""),
      name: plan.name,
      price: Number(plan.price || 0),
      durationInDays: plan.durationInDays,
      billingInterval: periodLabel(plan.durationInDays) === "per year" ? "yearly" : "quarterly",
      label: periodLabel(plan.durationInDays),
      listingLimit: plan.listingLimit,
    },
  ];
  for (const dp of plan.discountedPlans || []) {
    options.push({
      ...dp,
      label: dp.label || periodLabel(dp.durationInDays, dp.billingInterval),
    });
  }
  for (const extra of extras) {
    options.push({
      code: String(extra.code || ""),
      name: extra.name,
      price: Number(extra.price || 0),
      durationInDays: extra.durationInDays,
      label: periodLabel(extra.durationInDays),
    });
  }
  const seen = new Set<string>();
  return options.filter((opt) => {
    const key = `${opt.code}-${opt.price}-${opt.durationInDays}`;
    if (!opt.code || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupKeyForUserType(userType?: string | null) {
  const t = String(userType || "").trim();
  if (t === "PropertyScout") return "scout";
  if (t === "Developer" || t === "Landowners") return "developer-distribution";
  if (t === "Lawyer" || t === "Surveyor" || t === "Valuer") return "service-professional";
  if (t === "Agent") return "licensed";
  return null;
}

export function groupKeysForUserType(userType?: string | null, _isPropertyScout?: boolean) {
  const t = String(userType || "").trim();
  const lower = t.toLowerCase();
  if (t === "PropertyScout" || lower === "propertyscout") return ["scout"];
  if (t === "Landowners" || lower === "landowners" || lower === "landlord") {
    return ["developer-distribution"];
  }
  if (t === "Developer" || lower === "developer") {
    return ["developer-distribution", "developer-offplan"];
  }
  if (
    t === "Lawyer" ||
    t === "Surveyor" ||
    t === "Valuer" ||
    lower === "lawyer" ||
    lower === "surveyor" ||
    lower === "valuer"
  ) {
    return ["service-professional"];
  }
  if (t === "Agent" || lower === "agent") return ["licensed"];
  return [];
}

function planMatchesDashboardUser(
  plan: CatalogPlan,
  userType?: string | null,
  _isPropertyScout?: boolean,
) {
  const t = String(userType || "").trim();
  const lower = t.toLowerCase();
  const audience = String(plan.audience || "").toLowerCase();
  const key = resolvePlanGroupKey(plan);

  if (t === "PropertyScout" || lower === "propertyscout") {
    return key === "scout";
  }
  if (t === "Agent" || lower === "agent") return key === "licensed";
  if (t === "Lawyer" || lower === "lawyer") return audience === "lawyer";
  if (t === "Surveyor" || lower === "surveyor") return audience === "surveyor";
  if (t === "Valuer" || lower === "valuer") return audience === "valuer";
  if (t === "Landowners" || lower === "landowners" || lower === "landlord") {
    return key === "developer-distribution";
  }
  if (t === "Developer" || lower === "developer") {
    return key === "developer-distribution" || key === "developer-offplan";
  }
  return false;
}

export function dashboardPlanSummaries(
  userType?: string | null,
  _isPropertyScout?: boolean,
) {
  const t = String(userType || "").trim();
  const lower = t.toLowerCase();
  if (t === "PropertyScout" || lower === "propertyscout") {
    return ["Property Scout — ₦23,500 / 3 months"];
  }
  if (t === "Agent" || lower === "agent") {
    return ["Licensed Agent — ₦40,000 / 3 months or ₦140,000 / year (up to 50 listings)"];
  }
  if (t === "Developer" || lower === "developer") {
    return [
      "Property Distribution — ₦50,000 / 3 months",
      "Off-plan — ₦130,000 / 3 months or ₦390,000 / year",
    ];
  }
  if (t === "Landowners" || lower === "landowners" || lower === "landlord") {
    return ["Property Distribution — ₦50,000 / 3 months"];
  }
  if (t === "Lawyer" || lower === "lawyer") {
    return ["Lawyer — ₦50,000 / 3 months or ₦130,000 / year"];
  }
  if (t === "Surveyor" || lower === "surveyor") {
    return ["Surveyor — ₦50,000 / 3 months or ₦130,000 / year"];
  }
  if (t === "Valuer" || lower === "valuer") {
    return ["Valuer — ₦50,000 / 3 months or ₦130,000 / year"];
  }
  return [];
}

const GROUP_THEMES: Record<
  string,
  {
    from: string;
    via: string;
    to: string;
    ink: string;
    soft: string;
    glow: string;
    chip: string;
    check: string;
    cta: string;
    orb: string;
  }
> = {
  "service-professional": {
    from: "#4C1D95",
    via: "#7C3AED",
    to: "#F59E0B",
    ink: "#4C1D95",
    soft: "from-[#F5F3FF] via-white to-[#FEF3C7]",
    glow: "rgba(124,58,237,0.35)",
    chip: "bg-violet-100 text-violet-800",
    check: "bg-violet-100 text-violet-700",
    cta: "bg-violet-700 hover:bg-violet-800",
    orb: "bg-amber-400/40",
  },
  licensed: {
    from: "#064E3B",
    via: "#059669",
    to: "#FBBF24",
    ink: "#065F46",
    soft: "from-[#ECFDF5] via-white to-[#FEF9C3]",
    glow: "rgba(5,150,105,0.35)",
    chip: "bg-emerald-100 text-emerald-800",
    check: "bg-emerald-100 text-emerald-700",
    cta: "bg-emerald-700 hover:bg-emerald-800",
    orb: "bg-amber-300/50",
  },
  scout: {
    from: "#0F766E",
    via: "#22C55E",
    to: "#38BDF8",
    ink: "#0F766E",
    soft: "from-[#ECFDF5] via-white to-[#E0F2FE]",
    glow: "rgba(34,197,94,0.35)",
    chip: "bg-sky-100 text-sky-800",
    check: "bg-lime-100 text-lime-700",
    cta: "bg-teal-700 hover:bg-teal-800",
    orb: "bg-sky-400/40",
  },
  "developer-distribution": {
    from: "#0F766E",
    via: "#0EA5A4",
    to: "#F59E0B",
    ink: "#0F766E",
    soft: "from-[#F0FDFA] via-white to-[#FEF3C7]",
    glow: "rgba(13,148,136,0.35)",
    chip: "bg-teal-100 text-teal-800",
    check: "bg-teal-100 text-teal-700",
    cta: "bg-teal-700 hover:bg-teal-800",
    orb: "bg-amber-400/40",
  },
  "developer-offplan": {
    from: "#1E3A8A",
    via: "#2563EB",
    to: "#F97316",
    ink: "#1E3A8A",
    soft: "from-[#EFF6FF] via-white to-[#FFEDD5]",
    glow: "rgba(37,99,235,0.35)",
    chip: "bg-orange-100 text-orange-800",
    check: "bg-blue-100 text-blue-700",
    cta: "bg-blue-700 hover:bg-blue-800",
    orb: "bg-orange-400/40",
  },
};

export function useSubscriptionCatalog() {
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [groups, setGroups] = useState<CatalogGroupMeta[]>(FALLBACK_GROUPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const request = await fetch(
          `${URLS.BASE}${URLS.getSubscriptionPlans}?category=standard&audience=all`,
          { cache: "no-store" },
        );
        const json = (await request.json()) as CatalogResponse;
        const rows = Array.isArray(json.data) ? json.data : [];
        setPlans(rows.filter((p) => p && p.name && String(p.audience) !== "white-labeling"));
        if (Array.isArray(json.meta?.groups) && json.meta.groups.length) {
          const byKey = new Map(json.meta.groups.map((g) => [g.key, g]));
          setGroups(
            sortCatalogGroups(
              FALLBACK_GROUPS.map((fallback) => ({
                ...fallback,
                ...(byKey.get(fallback.key) || {}),
                key: fallback.key,
                sortOrder: fallback.sortOrder,
              })),
            ),
          );
        }
      } catch {
        const res = await GET_REQUEST<CatalogPlan[]>(
          `${URLS.BASE}${URLS.getSubscriptionPlans}?category=standard&audience=all`,
        );
        const rows = Array.isArray(res.data) ? res.data : [];
        setPlans(rows.filter((p) => p && p.name));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return { plans, groups, loading };
}

export default function CatalogPricing({
  mode = "public",
  userType,
  isPropertyScout,
  hasPaidSubscription,
  onSubscribe,
}: {
  mode?: "public" | "dashboard";
  userType?: string | null;
  isPropertyScout?: boolean;
  hasPaidSubscription?: boolean;
  onSubscribe?: (plan: CatalogPlan, option: CatalogBillingOption) => void;
}) {
  const { plans, groups, loading } = useSubscriptionCatalog();
  const userGroups = groupKeysForUserType(userType, isPropertyScout);
  const visibleGroups = useMemo(() => {
    if (mode !== "dashboard") return groups;
    if (!userGroups.length) return [];
    return groups.filter((group) => userGroups.includes(group.key));
  }, [groups, mode, userGroups]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const userGroupsKey = userGroups.join("|");

  useEffect(() => {
    if (mode === "public") return;
    if (userGroups[0]) {
      setOpenKey((cur) => (cur && userGroups.includes(cur) ? cur : userGroups[0]));
    }
  }, [mode, userGroupsKey]);

  const toggleGroup = (
    key: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    const section = event.currentTarget.closest("section");
    const offsetBefore = section?.getBoundingClientRect().top ?? 0;
    setOpenKey((cur) => (cur === key ? null : key));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!section) return;
        const delta = section.getBoundingClientRect().top - offsetBefore;
        if (Math.abs(delta) < 1) return;
        window.scrollTo({
          top: window.scrollY + delta,
          behavior: "auto",
        });
      });
    });
  };

  const groupedPlans = useMemo(() => {
    const extras = plans.filter((p) => p.displayWithCode);
    const primaries = plans.filter((p) => !p.displayWithCode);
    const byGroup: Record<string, CatalogPlan[]> = {};
    for (const plan of primaries) {
      const key = resolvePlanGroupKey(plan);
      byGroup[key] = byGroup[key] || [];
      byGroup[key].push({
        ...plan,
        discountedPlans: billingOptionsFor(
          plan,
          extras.filter((extra) => extra.displayWithCode === plan.code),
        ),
      });
    }
    return byGroup;
  }, [plans]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#8DDB90]/20 blur-3xl" />
        <div className="absolute top-40 -left-16 h-64 w-64 rounded-full bg-[#09391C]/10 blur-3xl" />
      </div>

      {loading ? (
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/80 ring-1 ring-black/5" />
          ))}
        </div>
      ) : (
        <div className="relative space-y-4 [overflow-anchor:none]">
          {mode === "public" ? (
            <p className="pb-1 text-sm text-[#5A5D63]">
              Open a role to explore its colorful plan cards. All sections, including Service Professionals, start closed.
            </p>
          ) : null}
          {mode === "dashboard" && visibleGroups.length === 0 ? (
            <p className="rounded-3xl bg-white px-6 py-10 text-center text-sm text-[#5A5D63] shadow-sm">
              No subscription plans are available for this account type yet.
            </p>
          ) : null}
          {visibleGroups.map((group) => {
            const Icon = GROUP_ICONS[group.key] || Sparkles;
            const theme = GROUP_THEMES[group.key] || GROUP_THEMES.licensed;
            const isOpen = openKey === group.key;
            const isYours = mode === "dashboard";
            const groupPlans = (groupedPlans[group.key] || []).filter((plan) =>
              mode !== "dashboard" ||
              planMatchesDashboardUser(plan, userType, isPropertyScout),
            );

            return (
              <section
                key={group.key}
                className={`overflow-hidden rounded-[28px] border bg-white/90 shadow-[0_18px_50px_-28px_rgba(9,57,28,0.45)] backdrop-blur [overflow-anchor:none] ${
                  isOpen ? "border-transparent" : "border-black/5"
                }`}
                style={isOpen ? { boxShadow: `0 18px 50px -18px ${theme.glow}` } : undefined}
              >
                <button
                  type="button"
                  onClick={(event) => toggleGroup(group.key, event)}
                  className="relative flex w-full items-start gap-4 overflow-hidden px-5 py-5 text-left sm:px-7 sm:py-6"
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-95"
                    style={{
                      background: `linear-gradient(120deg, ${theme.from}, ${theme.via}, ${theme.to})`,
                    }}
                  />
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-140%", "320%"] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30">
                    <Icon size={22} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                        {group.eyebrow}
                      </span>
                      {isYours && mode === "dashboard" ? (
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          Your plans
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {group.headline}
                    </span>
                    <span className="mt-1 block max-w-3xl text-sm leading-relaxed text-white/80">
                      {group.tagline}
                    </span>
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="relative mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden [overflow-anchor:none]"
                    >
                      <div className="border-t border-black/5 px-5 pb-6 pt-2 sm:px-7">
                        {groupPlans.length === 0 ? (
                          <p className="py-6 text-sm text-[#5A5D63]">
                            Plans for this role will appear here once published on the server.
                          </p>
                        ) : (
                          <div className={`grid gap-4 ${groupPlans.length > 1 ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-1"}`}>
                            {groupPlans.map((plan, planIndex) => (
                              <PlanCard
                                key={plan.code || plan.name}
                                plan={plan}
                                group={group}
                                theme={theme}
                                delay={planIndex * 0.08}
                                mode={mode}
                                canSubscribe={mode === "dashboard" && !hasPaidSubscription}
                                locked={false}
                                hasPaidSubscription={!!hasPaidSubscription}
                                onSubscribe={onSubscribe}
                              />
                            ))}
                          </div>
                        )}

                        {group.quote ? (
                          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F5F7F9] px-4 py-4">
                            <Quote size={18} className="mt-0.5 shrink-0 text-[#8DDB90]" />
                            <div>
                              <p className="text-sm italic text-[#09391C]">“{group.quote.text}”</p>
                              <p className="mt-1 text-xs font-medium text-[#5A5D63]">— {group.quote.attribution}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  group,
  theme,
  delay,
  mode,
  canSubscribe,
  locked,
  hasPaidSubscription,
  onSubscribe,
}: {
  plan: CatalogPlan;
  group: CatalogGroupMeta;
  theme: (typeof GROUP_THEMES)[string];
  delay: number;
  mode: "public" | "dashboard";
  canSubscribe: boolean;
  locked: boolean;
  hasPaidSubscription: boolean;
  onSubscribe?: (plan: CatalogPlan, option: CatalogBillingOption) => void;
}) {
  const options = plan.discountedPlans?.length
    ? plan.discountedPlans
    : billingOptionsFor(plan);
  const primary = options[0];
  const secondary = options.slice(1);
  const features: CatalogFeatureDetail[] =
    plan.featureDetails?.length
      ? plan.featureDetails
      : (plan.benefits || []).map((title) => ({ title }));
  const registerHref =
    plan.registerHref ||
    (plan.audience === "lawyer"
      ? "/auth/register?userType=Lawyer"
      : plan.audience === "surveyor"
        ? "/auth/register?userType=Surveyor"
        : plan.audience === "valuer"
          ? "/auth/register?userType=Valuer"
          : group.registerHref);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.96, rotate: -0.4 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        boxShadow: [
          `0 22px 50px -24px ${theme.glow}`,
          `0 30px 64px -16px ${theme.glow}`,
          `0 22px 50px -24px ${theme.glow}`,
        ],
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
        boxShadow: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ y: -10, scale: 1.025 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.soft} p-5 ring-1 ring-black/5 sm:p-6`}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(115deg, transparent 20%, ${theme.via}33, transparent 80%)`,
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl ${theme.orb}`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-white/70 blur-2xl"
        animate={{ x: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${theme.chip}`}>
            {planRoleTag(plan, group)}
          </p>
          <h3 className="mt-2 text-xl font-bold" style={{ color: theme.ink }}>{plan.name}</h3>
        </div>
        {plan.allowsOffPlan ? (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: theme.from }}>
            Off-plan
          </span>
        ) : (
          <motion.span
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-xl"
          >
            <Sparkles size={18} style={{ color: theme.via }} />
          </motion.span>
        )}
      </div>

      <div className="relative mt-4 flex flex-wrap items-end gap-4">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-3xl font-black tracking-tight" style={{ color: theme.ink }}>{naira(primary?.price)}</p>
          <p className="text-sm text-[#5A5D63]">{primary?.label || "per 3 months"}</p>
          {primary?.listingLimit ? (
            <p className="text-xs text-[#5A5D63]">Up to {primary.listingLimit} listings</p>
          ) : null}
        </motion.div>
        {secondary.map((opt) => (
          <div key={opt.code} className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-black/5">
            <p className="text-lg font-bold" style={{ color: theme.ink }}>{naira(opt.price)}</p>
            <p className="text-xs text-[#5A5D63]">{opt.label || "per year"}</p>
            {opt.listingLimit ? (
              <p className="text-[11px] text-[#5A5D63]">Up to {opt.listingLimit} listings</p>
            ) : null}
          </div>
        ))}
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-[#5A5D63]">{plan.designedFor || group.designedFor}</p>

      <ul className="relative mt-5 space-y-2.5">
        {features.map((item, index) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.08 * index }}
            className="flex items-start gap-2.5 text-sm"
            style={{ color: theme.ink }}
          >
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.check}`}>
              <Check size={13} strokeWidth={3} />
            </span>
            <span>
              <span className="font-semibold">{item.title}</span>
              {item.description ? (
                <span className="block text-[#5A5D63]">{item.description}</span>
              ) : null}
            </span>
          </motion.li>
        ))}
      </ul>

      {group.highlights?.length ? (
        <div className="relative mt-5 flex flex-wrap gap-2">
          {group.highlights.slice(0, 3).map((item) => (
            <span
              key={item}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.chip}`}
            >
              <BadgeCheck size={12} />
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative mt-auto flex flex-col gap-2 pt-6">
        {mode === "public" ? (
          <>
            <Link
              href={registerHref}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition ${theme.cta}`}
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              href="/agent-subscriptions?tab=plans"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-semibold transition hover:bg-white"
              style={{ color: theme.ink }}
            >
              View on dashboard
            </Link>
          </>
        ) : locked ? (
          <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-[#5A5D63]">
            This plan is for {group.label.toLowerCase()} accounts.
          </p>
        ) : hasPaidSubscription ? (
          <p className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold ${theme.chip}`}>
            Active on your account
          </p>
        ) : (
          options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              disabled={!canSubscribe || !onSubscribe}
              title={
                !canSubscribe || !onSubscribe
                  ? "Checkout is unavailable for this plan on your account."
                  : `Subscribe to ${plan.name}`
              }
              onClick={() => {
                if (!onSubscribe) return;
                onSubscribe(plan, opt);
              }}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:bg-gray-300 ${theme.cta}`}
            >
              Subscribe · {naira(opt.price)} {opt.label}
            </button>
          ))
        )}
      </div>
    </motion.article>
  );
}

export function CatalogHero({
  kicker = "Professional plans",
  title = "Khabiteq professional plans",
  text = "Choose the plan that fits your role. Property seekers do not need a subscription for the core journey.",
}: {
  kicker?: string;
  title?: string;
  text?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#09391C] px-6 py-10 text-white sm:px-10 sm:py-12">
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#8DDB90]/30 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        animate={{ x: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-[#8DDB90]">
        {kicker}
      </p>
      <h1 className="relative mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
        {title}
      </h1>
      <p className="relative mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
        {text}
      </p>
      <div className="relative mt-6 flex flex-wrap gap-3 text-sm text-white/80">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <Building2 size={14} /> Agents & developers
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <Compass size={14} /> Property scouts
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <Scale size={14} /> Lawyers, surveyors & valuers
        </span>
      </div>
    </div>
  );
}
