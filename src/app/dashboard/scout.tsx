"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import {
  BadgeCheck,
  Gift,
  LayoutDashboard,
  Plus,
  Share2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type ScoutSnapshot = {
  kycStatus?: string;
  kycDisplayLabel?: string;
  canSubmitOpportunity?: boolean;
  displayRoleLabel?: string;
  professionalUpgradeStatus?: string;
  pendingProfessionalType?: string | null;
};

export default function Scout() {
  const { user } = useUserContext();
  const [snapshot, setSnapshot] = useState<ScoutSnapshot | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;
    void GET_REQUEST(`${URLS.BASE}${URLS.propertyScoutStatus}`, token).then((res) => {
      if (res?.success) setSnapshot((res.data as ScoutSnapshot) || null);
    });
  }, []);

  const kycLabel = snapshot?.kycDisplayLabel || "KYC NOT STARTED";
  const kycVerified = snapshot?.kycStatus === "approved" || user?.kycStatus === "approved";
  const name = user?.firstName || "there";

  return (
    <div className="min-h-screen bg-[#EEF1F1] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[#16a34a]">Property Scout</p>
          <h1 className="mt-1 text-3xl font-bold text-[#09391C]">Welcome, {name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5A5D63]">
            KYC verifies your identity. Each property opportunity still needs Khabiteq listing review before it goes LIVE.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">KYC Status</p>
          <p className="mt-1 text-lg font-bold text-[#09391C]">{kycLabel}</p>
          {!kycVerified ? (
            <>
              <p className="mt-2 text-sm text-[#5A5D63]">
                Complete your KYC verification to start submitting property opportunities.
              </p>
              <Link
                href="/scout-kyc"
                className="mt-4 inline-flex rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Complete KYC
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#5A5D63]">
              Identity verified. Submit opportunities for Khabiteq review — they are not LIVE until approved.
            </p>
          )}
        </div>

        <Link
          href={kycVerified ? "/post-property" : "/scout-kyc"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#09391C] px-6 py-4 text-base font-semibold text-white shadow-md"
        >
          <Plus className="h-5 w-5" />
          Submit a Property Opportunity
        </Link>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashLink href="/my-listings" icon={<LayoutDashboard className="h-5 w-5" />} title="Property Opportunities" subtitle="Listings and review statuses" />
          <DashLink href="/referral" icon={<Share2 className="h-5 w-5" />} title="Referral Activity" subtitle={user?.referralCode ? `Code: ${user.referralCode}` : "Your referral code"} />
          <DashLink href="/referral" icon={<Gift className="h-5 w-5" />} title="Earnings / Rewards" subtitle="Rewards from successful referrals" />
          <DashLink href="/profile-settings" icon={<UserRound className="h-5 w-5" />} title="Profile" subtitle="Account details" />
          <DashLink href="/account/upgrade" icon={<BadgeCheck className="h-5 w-5" />} title="Upgrade Account" subtitle="Become a verified professional" />
          <DashLink href="/scout-kyc" icon={<ShieldCheck className="h-5 w-5" />} title="KYC Verification" subtitle={kycLabel} />
        </div>
      </div>
    </div>
  );
}

function DashLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#8DDB90]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8DDB90]/15 text-[#09391C]">
        {icon}
      </div>
      <h2 className="mt-3 font-semibold text-[#09391C]">{title}</h2>
      <p className="mt-1 text-sm text-[#5A5D63]">{subtitle}</p>
    </Link>
  );
}
