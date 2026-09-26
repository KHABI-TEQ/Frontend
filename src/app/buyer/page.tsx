"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Home,
  ShieldCheck,
  Stamp,
  UserRound,
  ClipboardList,
} from "lucide-react";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

type Summary = {
  counts?: {
    preferences?: number;
    inspections?: number;
    documents?: number;
    surveys?: number;
    transactions?: number;
    searchInsurancePolicies?: number;
    searchInsuranceClaims?: number;
    professionalServices?: number;
  };
};

const TILES = [
  {
    href: "/buyer/profile",
    title: "My Profile",
    copy: "Personal details, password and notification settings.",
    icon: UserRound,
    empty: "Update your details",
    countKey: null as string | null,
  },
  {
    href: "/buyer/searches",
    title: "My Insured Preferences",
    copy: "View all your submitted preferences and insurance status.",
    icon: Home,
    empty: "Submit a preference",
    emptyHref: "/preference",
    countKey: "preferences",
  },
  {
    href: "/buyer/inspections",
    title: "My Inspections",
    copy: "See all inspection details, including property and agent information.",
    icon: ClipboardList,
    empty: "Book an inspection",
    emptyHref: "/",
    countKey: "inspections",
  },
  {
    href: "/buyer/services",
    title: "My Professional Services",
    copy: "Track professionals you have booked — lawyers, surveyors, valuers.",
    icon: FileCheck2,
    empty: "Hire a professional",
    emptyHref: "/professional-services",
    countKey: "professionalServices",
  },
  {
    href: "/my-transactions",
    title: "Transaction Registration",
    copy: "See your transaction registration records and certificates.",
    icon: Stamp,
    empty: "Register a transaction",
    emptyHref: "/transaction-registration",
    countKey: "transactions",
  },
  {
    href: "/buyer/claims/new",
    title: "Insurance and Claims",
    copy: "Track your insurance coverage and file a claim if needed.",
    icon: ShieldCheck,
    empty: "File a claim",
    emptyHref: "/buyer/claims/new",
    countKey: "searchInsurancePolicies",
  },
];

export default function BuyerHubPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const buyer = getBuyerProfile();

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer");
      return;
    }
    buyerFetch<Summary>("/buyer/auth/me/summary").then((res) => {
      if (res.success) setSummary(res.data || {});
    });
  }, [router]);

  return (
    <BuyerShell
      title={`Welcome${buyer?.fullName ? `, ${buyer.fullName}` : ""}`}
      subtitle="Once logged in, you have a complete record of your activities on Khabiteq."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const count = tile.countKey ? Number(summary?.counts?.[tile.countKey as keyof NonNullable<Summary["counts"]>] || 0) : null;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8DDB90]/20 text-[#09391C]">
                  <Icon size={22} />
                </span>
                {count != null ? (
                  <span className="rounded-full bg-[#F5F7F9] px-3 py-1 text-xs font-semibold text-[#09391C]">
                    {count}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#09391C]">{tile.title}</h2>
              <p className="mt-1 text-sm text-[#5A5D63]">{tile.copy}</p>
              {count === 0 && tile.emptyHref ? (
                <span className="mt-4 inline-flex text-sm font-semibold text-[#0F766E]">
                  {tile.empty} →
                </span>
              ) : (
                <span className="mt-4 inline-flex text-sm font-semibold text-[#09391C] group-hover:underline">
                  View details →
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </BuyerShell>
  );
}
