"use client";

import Link from "next/link";
import { useUserContext } from "@/context/user-context";

export default function Valuer() {
  const { user } = useUserContext();
  const name = user?.firstName || "there";

  return (
    <div className="min-h-screen bg-[#EEF1F1] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[#16a34a]">Valuer</p>
          <h1 className="mt-1 text-3xl font-bold text-[#09391C]">Welcome, {name}</h1>
          <p className="mt-2 text-sm text-[#5A5D63]">
            Complete professional verification so seekers can request valuations from your profile.
          </p>
        </div>
        {user?.kycStatus === "none" || !user?.kycStatus ? (
          <Link
            href="/valuer-kyc"
            className="inline-flex rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Complete valuer KYC
          </Link>
        ) : null}
        <Link
          href="/agent-subscriptions?tab=plans"
          className="inline-flex rounded-xl border border-[#09391C]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#09391C]"
        >
          View subscription plans
        </Link>
        <Link href="/profile-settings" className="block text-sm font-medium text-[#09391C] underline">
          Account settings
        </Link>
      </div>
    </div>
  );
}
