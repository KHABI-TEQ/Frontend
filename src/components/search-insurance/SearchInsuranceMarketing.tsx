"use client";

import Link from "next/link";
import { Handshake, Search, ShieldCheck } from "lucide-react";
import { SEARCH_INSURANCE, naira } from "@/lib/search-insurance";

export default function SearchInsuranceMarketing({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : "bg-white py-16 sm:py-20"}>
      <div className={compact ? "" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
        <div className="overflow-hidden rounded-[32px] border border-emerald-100 bg-[radial-gradient(circle_at_top_right,#ECFDF5,white_42%)] p-6 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                {SEARCH_INSURANCE.productName} · {SEARCH_INSURANCE.partner}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#09391C] sm:text-5xl">
                {SEARCH_INSURANCE.headline}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5A5D63]">
                {SEARCH_INSURANCE.tagline}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, title: "Financial Protection", text: "Cover for unexpected loss up to ₦2,000,000." },
                  { icon: Search, title: "Greater Peace of Mind", text: "Search and explore without fear." },
                  { icon: Handshake, title: "Trusted Partnership", text: "Backed by Consolidated Hallmark Insurance Plc." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5">
                    <item.icon className="text-[#0F766E]" size={20} />
                    <p className="mt-2 text-sm font-semibold text-[#09391C]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#5A5D63]">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/buyer/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-[#09391C]"
                >
                  Open a buyer account
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] bg-[#09391C] p-6 text-white shadow-xl">
              <p className="text-sm text-white/70">Insure your search for just</p>
              <p className="mt-2 text-4xl font-black">{naira(SEARCH_INSURANCE.premiumAmount)}</p>
              <p className="mt-1 text-sm text-white/70">per search · complete peace of mind</p>
              <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/60">Maximum claim</p>
                <p className="text-2xl font-bold">{naira(SEARCH_INSURANCE.coverAmount)}</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/70">
                Same property dream. More protection. Eligible after signup, payment, and a claim with evidence if a practitioner scams you on that search.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
