"use client";

import Link from "next/link";
import type { User } from "@/context/user-context";

function footerText(dealSite: Record<string, unknown> | null | undefined) {
  const footer = (dealSite?.footer || dealSite?.footerSection || {}) as Record<string, unknown>;
  return {
    shortDescription: String(footer.shortDescription || footer.shortDesc || "").trim(),
    copyrightText: String(footer.copyrightText || footer.copyRight || "").trim(),
  };
}

export function isPractitionerPageSetupIncomplete(user: User | null | undefined): boolean {
  if (!user || !["Agent", "Developer"].includes(String(user.userType || ""))) return false;
  const dealSite = (user.dealSite || null) as Record<string, unknown> | null;
  if (!dealSite || !(dealSite.publicSlug || dealSite._id)) return true;
  const footer = footerText(dealSite);
  return !(
    String(dealSite.logoUrl || "").trim() &&
    String(dealSite.title || "").trim() &&
    String(dealSite.description || "").trim() &&
    footer.shortDescription &&
    footer.copyrightText
  );
}

export default function CompletePractitionerPageBanner({ user }: { user: User }) {
  if (!isPractitionerPageSetupIncomplete(user)) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#8DDB90]/40 bg-[#8DDB90]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#09391C]">
          <span className="font-semibold">Complete your practitioner page setup.</span>{" "}
          Add your branding and footer details so visitors see a finished page.
        </p>
        <Link
          href="/public-access-page"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Open practitioner page
        </Link>
      </div>
    </div>
  );
}
