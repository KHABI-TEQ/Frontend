"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, LayoutDashboard, Settings } from "lucide-react";

export default function PublicPageSetupComplete({
  previewUrl,
  continueHref = "/public-access-page/branding",
  continueLabel = "Continue Setup",
}: {
  previewUrl?: string | null;
  continueHref?: string;
  continueLabel?: string;
}) {
  const viewHref = previewUrl
    ? `${previewUrl.replace(/\/$/, "")}/?preview=1`
    : "/public-access-page";

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={28} />
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#09391C]">
            Public Page Setup Complete
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#3d5244] leading-relaxed">
            Your practitioner page details have been saved. You can preview the page, return to your
            dashboard, or keep customizing branding. Listing a property is the next core action once
            KYC is approved and a paid plan is active.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
        <a
          href={viewHref}
          target={previewUrl ? "_blank" : undefined}
          rel={previewUrl ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B423D]"
        >
          View Public Page
          <ExternalLink size={16} />
        </a>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#09391C]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] hover:bg-white/80"
        >
          <LayoutDashboard size={16} />
          Go to Dashboard
        </Link>
        <Link
          href={continueHref}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#09391C]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] hover:bg-white/80"
        >
          <Settings size={16} />
          {continueLabel}
        </Link>
        <Link
          href="/dashboard#list-property"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#09391C]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] hover:bg-white/80"
        >
          List a property
        </Link>
      </div>
    </div>
  );
}
