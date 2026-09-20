"use client";

import { ShieldCheck } from "lucide-react";
import { SEARCH_INSURANCE, naira } from "@/lib/search-insurance";

export default function SearchInsuranceCard({
  optedIn,
  onToggle,
}: {
  optedIn: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_-28px_rgba(9,57,28,0.4)] sm:p-6">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#09391C] text-white">
          <ShieldCheck size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
            {SEARCH_INSURANCE.partner}
          </p>
          <h3 className="mt-1 text-xl font-bold text-[#09391C]">
            {SEARCH_INSURANCE.headline}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5A5D63]">
            {SEARCH_INSURANCE.tagline}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-3xl font-black text-[#09391C]">
                {naira(SEARCH_INSURANCE.premiumAmount)}
              </p>
              <p className="text-xs text-[#5A5D63]">per search</p>
            </div>
            <div className="rounded-2xl bg-[#09391C] px-4 py-2 text-white">
              <p className="text-lg font-bold">{naira(SEARCH_INSURANCE.coverAmount)}</p>
              <p className="text-[11px] text-white/70">maximum cover</p>
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F0FDF4] px-4 py-3">
            <input
              type="checkbox"
              checked={optedIn}
              onChange={(e) => onToggle(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#09391C]"
            />
            <span>
              <span className="block text-sm font-semibold text-[#09391C]">
                Add insurance to this search
              </span>
              <span className="mt-0.5 block text-xs text-[#5A5D63]">
                Requires a free buyer account so we can track this journey and you can file a claim with evidence.
              </span>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
