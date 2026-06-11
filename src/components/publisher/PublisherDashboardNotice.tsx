"use client";

import Link from "next/link";

interface PublisherDashboardNoticeProps {
  userType: "Developer" | "Landowners";
}

/**
 * Developer and Landlord accounts are not subject to Agent KYC/subscription listing policy.
 */
export default function PublisherDashboardNotice({ userType }: PublisherDashboardNoticeProps) {
  const label = userType === "Developer" ? "Developer" : "Landlord";

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
      <p className="font-semibold text-[#09391C]">{label} listing access</p>
      <p className="mt-1 leading-relaxed text-slate-700">
        You can list <strong>unlimited properties</strong> on Khabi-Teq.{" "}
        <strong>KYC verification is optional</strong> and{" "}
        <strong>no subscription is required</strong> to publish listings or use your account features.
      </p>
      <p className="mt-2 text-xs text-slate-600">
        Optional:{" "}
        <Link href="/agent-kyc" className="text-emerald-700 hover:underline font-medium">
          submit KYC
        </Link>{" "}
        if you want a verified publisher profile.
      </p>
    </div>
  );
}
