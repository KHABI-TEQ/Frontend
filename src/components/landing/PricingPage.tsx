"use client";

import { DarkCta, OutlineCta } from "@/components/landing/primitives";
import CatalogPricing, { CatalogHero } from "@/components/subscription/CatalogPricing";
import SearchInsuranceMarketing from "@/components/search-insurance/SearchInsuranceMarketing";

export default function PricingPageContent() {
  return (
    <main className="w-full min-h-screen bg-[radial-gradient(circle_at_top_right,#E8F6E9,transparent_28%),radial-gradient(circle_at_bottom_left,#F5F7F9,transparent_32%),#FFFEFB] pt-24 sm:pt-28 lg:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CatalogHero />

        <p className="mt-8 max-w-3xl text-sm text-[#5A5D63]">
          Property seekers do not need a professional subscription to submit a preference, get matched, connect with professionals or book an inspection. Optional Property Search Insurance is a separate ₦20,000 per-search add-on for clients.
        </p>

        <div className="mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">For clients</p>
          <SearchInsuranceMarketing compact />
        </div>

        <div className="mt-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">For professionals</p>
          <CatalogPricing mode="public" />
        </div>

        <section className="mt-16 rounded-[28px] border border-black/5 bg-white/80 p-6 sm:p-8 shadow-[0_18px_50px_-32px_rgba(9,57,28,0.4)]">
          <h2 className="text-2xl font-bold text-[#09391C]">FAQs</h2>
          <dl className="mt-6 space-y-5">
            {[
              ["Do property seekers need a subscription?", "No. Submitting a preference, matching, connecting with professionals and booking an inspection are part of the core seeker journey."],
              ["What is Property Search Insurance?", "An optional ₦20,000 payment per search that makes you eligible to claim up to ₦2,000,000 if a practitioner scams you on that journey. It is underwritten with Consolidated Hallmark Insurance Plc."],
              ["Do I need an account to insure a search?", "Yes. You must create or sign in to a buyer account so the search can be tracked and you can file a claim with evidence."],
              ["How do I claim?", "Sign in at /buyer/searches, open the insured search, submit a claim with evidence. Khabiteq admin reviews and records a decision."],
              ["Who are these plans for?", "Property Scouts, licensed agents, developers / property owners, lawyers, surveyors and valuers."],
              ["Does a plan replace KYC?", "No. Licensed professionals complete KYC and credential verification. Property Scouts complete KYC, and each scout listing is reviewed separately before it can go live."],
              ["Does Khabiteq provide the professional service?", "No. Lawyers, surveyors, valuers and agents provide their services directly. Khabiteq provides discovery, matching, workflow and records."],
              ["How do I subscribe?", "Create the matching professional account, complete applicable onboarding, then choose a plan from this page or your dashboard."],
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
