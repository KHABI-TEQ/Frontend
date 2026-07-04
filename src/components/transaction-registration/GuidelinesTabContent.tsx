"use client";

import React, { useState } from "react";
import { FeeBandTable } from "./TransactionRegistrationUI";
import {
  KHABITEQ_GUIDELINE_BLOCKS,
  SAFE_TRANSACTION_GUIDELINES,
  type KhabiteqGuidelineAccent,
  type KhabiteqGuidelineBlock,
  type TransactionGuidelinesContent,
} from "@/config/transactionRegistration.config";

type GuidelineAccent = "emerald" | "sky" | "indigo" | "amber" | "violet" | "teal";

const ACCENT_STYLES: Record<
  GuidelineAccent,
  { border: string; bg: string; iconBg: string; iconText: string; title: string; check: string }
> = {
  emerald: {
    border: "border-l-emerald-500",
    bg: "from-emerald-50/70 to-white",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    title: "text-emerald-950",
    check: "bg-emerald-100 text-emerald-700",
  },
  sky: {
    border: "border-l-sky-500",
    bg: "from-sky-50/70 to-white",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    title: "text-sky-950",
    check: "bg-sky-100 text-sky-700",
  },
  indigo: {
    border: "border-l-indigo-500",
    bg: "from-indigo-50/70 to-white",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    title: "text-indigo-950",
    check: "bg-indigo-100 text-indigo-700",
  },
  amber: {
    border: "border-l-amber-500",
    bg: "from-amber-50/70 to-white",
    iconBg: "bg-amber-100",
    iconText: "text-amber-800",
    title: "text-amber-950",
    check: "bg-amber-100 text-amber-800",
  },
  violet: {
    border: "border-l-violet-500",
    bg: "from-violet-50/70 to-white",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    title: "text-violet-950",
    check: "bg-violet-100 text-violet-700",
  },
  teal: {
    border: "border-l-teal-500",
    bg: "from-teal-50/70 to-white",
    iconBg: "bg-teal-100",
    iconText: "text-teal-700",
    title: "text-teal-950",
    check: "bg-teal-100 text-teal-700",
  },
};

const TRANSACTION_TYPES_SHORT: { name: string; summary: string }[] = [
  { name: "Rental agreement", summary: "Tenancy at or above ₦5M" },
  { name: "Outright purchase", summary: "Sale of completed property" },
  { name: "Off-plan purchase", summary: "Allocation before completion" },
  { name: "Joint venture", summary: "JV involving real estate" },
  { name: "Contract of sale", summary: "Formal property sale contract" },
];

const ESSENTIAL_GUIDELINES: {
  title: string;
  subtitle: string;
  accent: GuidelineAccent;
  defaultOpen: boolean;
  numbered?: boolean;
  items: string[];
}[] = [
  {
    title: "Who must register",
    subtitle: "Your responsibility as buyer or tenant",
    accent: "emerald",
    defaultOpen: true,
    items: [
      "You register as the buyer or tenant — not your agent. Registration is your responsibility after you agree to proceed.",
      "All property transactions should be registered with KHABITEQ regardless of the transaction value.",
      "Registration protects you from double sales and shows others when a deal on the property is active or completed.",
    ],
  },
  {
    title: "What you need",
    subtitle: "Documents and details for the form",
    accent: "sky",
    defaultOpen: false,
    items: [
      "Your valid ID (e.g. NIN, international passport, or driver's licence) — upload on the registration form.",
      "A receipt or proof of payment for the transaction value you paid to the seller or landlord — upload on the registration form.",
      "Property ID from the listing (use Copy property ID on the marketplace, or from your inspection email).",
      "Your first and last name, email, and phone number as the buyer or tenant.",
      "For buildings (residential, commercial): provide the exact property address.",
      "For land: provide GPS coordinates; add survey plan reference if you have one.",
      "Optional: confirm that the property owner acknowledged receipt of your payment for this transaction.",
      "Inspection ID if you completed a viewing through KHABITEQ (only when your agent is on the platform).",
    ],
  },
  {
    title: "How it works",
    subtitle: "Step-by-step from check to registration",
    accent: "indigo",
    defaultOpen: false,
    numbered: true,
    items: [
      "Start with Check property status — search by Property ID, address, or GPS to see if an active or completed registration already exists.",
      "When an inspection is required, complete it first; after it finishes, confirm your intent to proceed and keep your Inspection ID for the form.",
      "On Register transaction, submit your details, Property ID, transaction value, your valid ID, deal payment receipt, and property identification.",
      "After you submit, you are redirected to Paystack to pay the processing fee that applies to your transaction value.",
      "Once registered, the property is flagged in the central registry so others see pending or completed transactions.",
    ],
  },
  {
    title: "Rules & limits",
    subtitle: "Agents, commissions, and fees",
    accent: "amber",
    defaultOpen: false,
    items: [
      "Only you (the buyer or tenant) can submit registration — do not ask your agent to register on your behalf.",
      "If an agent is involved, confirm they hold a valid KHABITEQ permit before you pay them.",
      "Agent commission is not paid by you — it is paid by the developer or landlord to the agent.",
      "The KHABITEQ processing fee is separate from agent commission; you pay it yourself on Paystack when you register a transaction.",
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-general-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function GuidelineSectionIcon({ accent }: { accent: GuidelineAccent }) {
  const cls = `h-5 w-5 ${ACCENT_STYLES[accent].iconText}`;
  if (accent === "emerald") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  if (accent === "sky") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (accent === "indigo") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (accent === "amber") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function GoodToKnowItemList({
  items,
  accent,
  numbered,
}: {
  items: string[];
  accent: GuidelineAccent;
  numbered?: boolean;
}) {
  const style = ACCENT_STYLES[accent];
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-general-800 leading-relaxed">
          {numbered ? (
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.check}`}
              aria-hidden
            >
              {i + 1}
            </span>
          ) : (
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.check}`}
              aria-hidden
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function GoodToKnowCard({
  title,
  subtitle,
  accent,
  defaultOpen,
  numbered,
  items,
}: {
  title: string;
  subtitle: string;
  accent: GuidelineAccent;
  defaultOpen: boolean;
  numbered?: boolean;
  items: string[];
}) {
  const [open, setOpen] = useState(defaultOpen);
  const style = ACCENT_STYLES[accent];

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200/90 border-l-4 bg-gradient-to-r shadow-sm transition-shadow hover:shadow-md ${style.border} ${style.bg}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left md:gap-4 md:px-5 md:py-4"
        aria-expanded={open}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
          <GuidelineSectionIcon accent={accent} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-base font-bold ${style.title}`}>{title}</h4>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-general-600 border border-gray-200/80">
              {items.length} {items.length === 1 ? "point" : "points"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-general-600">{subtitle}</p>
        </div>
        <ChevronIcon open={open} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-200/60 bg-white/70 px-4 py-4 md:px-5 md:py-5">
            <GoodToKnowItemList items={items} accent={accent} numbered={numbered} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GoodToKnowSection() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md shadow-gray-200/40"
      aria-labelledby="good-to-know-heading"
    >
      <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-white to-sky-50/50 px-5 py-5 md:px-6 md:py-6">
        <h3 id="good-to-know-heading" className="text-lg font-bold text-general-900 md:text-xl">
          Good to know before you register
        </h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-general-600">
          Expand each topic below for clear guidance on who registers, what to prepare, how the process works, and the
          rules that apply to your transaction.
        </p>
      </div>
      <div className="space-y-3 bg-slate-50/40 p-4 md:space-y-3.5 md:p-5">
        {ESSENTIAL_GUIDELINES.map((section) => (
          <GoodToKnowCard key={section.title} {...section} />
        ))}
      </div>
    </section>
  );
}

function KhabiteqBlockIcon({ blockKey, accent }: { blockKey: keyof TransactionGuidelinesContent; accent: KhabiteqGuidelineAccent }) {
  const cls = `h-5 w-5 ${ACCENT_STYLES[accent].iconText}`;
  if (blockKey === "requiredDocumentation") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (blockKey === "ownershipVerification") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (blockKey === "titleVerification") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
  }
  if (blockKey === "disputeResolution") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function KhabiteqOfficialCard({ block }: { block: KhabiteqGuidelineBlock }) {
  const [open, setOpen] = useState(block.defaultOpen ?? false);
  const style = ACCENT_STYLES[block.accent];

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-md ${style.border} border-l-[5px]`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left md:gap-4 md:px-5 md:py-5"
        aria-expanded={open}
      >
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.iconBg}`}>
          <KhabiteqBlockIcon blockKey={block.key} accent={block.accent} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-teal-950/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Official
            </span>
            <span className="rounded-full border border-gray-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-general-600">
              {block.items.length} {block.items.length === 1 ? "requirement" : "requirements"}
            </span>
          </div>
          <h4 className={`mt-2 text-base font-bold md:text-[1.05rem] ${style.title}`}>{block.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-general-600">{block.intro}</p>
        </div>
        <ChevronIcon open={open} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className={`border-t border-gray-100 bg-gradient-to-br px-4 py-4 md:px-5 md:py-5 ${style.bg}`}>
            <GoodToKnowItemList items={block.items} accent={block.accent} />
          </div>
        </div>
      </div>
    </article>
  );
}

function KhabiteqOfficialSection() {
  if (KHABITEQ_GUIDELINE_BLOCKS.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-teal-200/80 bg-white shadow-lg shadow-teal-950/5"
      aria-labelledby="khabiteq-official-heading"
    >
      <div className="relative overflow-hidden border-b border-teal-900/20 bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 px-5 py-6 md:px-7 md:py-7">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-100 backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              KHABITEQ compliance
            </div>
            <h3 id="khabiteq-official-heading" className="text-xl font-bold text-white md:text-2xl">
              More from KHABITEQ
            </h3>
            <p className="mt-1 text-sm font-medium text-teal-100/95">For buyers &amp; tenants</p>
          </div>
        </div>
        <p className="relative mt-4 max-w-3xl text-sm leading-relaxed text-teal-50/95 md:text-[0.95rem]">
          {SAFE_TRANSACTION_GUIDELINES.introduction}
        </p>
      </div>

      <div className="grid gap-3 bg-gradient-to-b from-slate-50/90 to-white p-4 md:grid-cols-1 md:gap-4 md:p-5 lg:gap-4">
        {KHABITEQ_GUIDELINE_BLOCKS.map((block) => (
          <KhabiteqOfficialCard key={block.key} block={block} />
        ))}
      </div>
    </section>
  );
}

export function GuidelinesTabContent({
  bands,
  formatNaira,
}: {
  bands: { label: string; feeNaira: number }[];
  formatNaira: (n?: number | null) => string;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white p-4 md:p-5">
        <p className="text-sm font-bold text-emerald-900 mb-1">At a glance — for buyers & tenants</p>
        <p className="text-sm text-emerald-800/90 mb-3 leading-relaxed">
          You complete registration yourself after agreeing to buy or rent. Your agent cannot register on your behalf.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm text-general-800">
          <li className="flex gap-2">
            <span className="text-emerald-600">1.</span>
            <span>Mandatory registration for all deals</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">2.</span>
            <span>Your processing fee depends on value — see the table below</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">3.</span>
            <span>Use <strong>Check property status</strong> before you commit</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">4.</span>
            <span>Pay your fee on <strong>Paystack</strong> after you submit registration</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="text-base font-bold text-general-900 mb-1">Processing fees</h3>
        <p className="text-sm text-general-600 mb-4">What you pay KHABITEQ to register — same fee bands for every transaction type.</p>
        <FeeBandTable bands={bands} formatNaira={formatNaira} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="text-base font-bold text-general-900 mb-3">Transaction types covered</h3>
        <ul className="divide-y divide-gray-100">
          {TRANSACTION_TYPES_SHORT.map((t) => (
            <li key={t.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
              <span className="font-medium text-general-900 text-sm">{t.name}</span>
              <span className="text-sm text-general-600">{t.summary}</span>
            </li>
          ))}
        </ul>
      </div>

      <GoodToKnowSection />

      <KhabiteqOfficialSection />
    </div>
  );
}
