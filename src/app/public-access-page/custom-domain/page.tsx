"use client";

import Link from "next/link";

export default function CustomDomainPage() {
  return (
    <div className="min-h-screen bg-[#FFFEFB] px-4 py-16">
      <div className="mx-auto max-w-xl rounded-[28px] border border-black/5 bg-white p-8 text-center shadow-[0_18px_50px_-32px_rgba(9,57,28,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B423D]/60">
          No longer offered
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#09391C]">
          Custom domain / white labeling
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5A5D63]">
          Custom domain and white-labeling packages are no longer available. Professional subscriptions are now the role-based plans on Pricing.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#09391C] px-5 text-sm font-semibold text-white"
          >
            View professional plans
          </Link>
          <Link
            href="/agent-subscriptions?tab=plans"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#09391C]/15 px-5 text-sm font-semibold text-[#09391C]"
          >
            Open my subscriptions
          </Link>
        </div>
      </div>
    </div>
  );
}
