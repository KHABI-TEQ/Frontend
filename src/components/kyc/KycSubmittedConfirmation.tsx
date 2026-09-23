"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { kycRoleLabel } from "@/lib/kyc-status";

type Props = {
  userType?: string;
  variant?: "pending" | "approved";
  embedded?: boolean;
  children?: React.ReactNode;
};

export default function KycSubmittedConfirmation({
  userType,
  variant = "pending",
  embedded = false,
  children,
}: Props) {
  const role = kycRoleLabel(userType);
  const shell = embedded ? "py-2" : "min-h-screen bg-[#EEF1F1] py-10 px-4";

  if (variant === "approved") {
    return (
      <div className={shell}>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#09391C]">Verification Approved</h1>
            <p className="mt-3 text-[#5A5D63] leading-relaxed">
              Your professional account has been verified. You now have access to your available {role} account features.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-[#09391C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0B423D]"
            >
              Go to Dashboard
            </Link>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-amber-50 px-6 py-8 text-center sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Clock className="h-9 w-9 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#09391C] sm:text-3xl">
              KYC Submitted Successfully
            </h1>
            <p className="mt-3 text-[#5A5D63] leading-relaxed">
              Your documents have been successfully submitted and are currently under review.
            </p>
          </div>
          <div className="space-y-4 px-6 py-6 sm:px-10">
            <p className="text-[#3A3F3D] leading-relaxed">
              Review typically takes <span className="font-semibold text-[#09391C]">24–48 hours</span>.
              You’ll be notified once your verification has been completed.
            </p>
            <p className="text-[#3A3F3D] leading-relaxed">
              While your verification is pending, some account features may remain unavailable.
              Once your KYC is approved, you’ll be able to access the full features available for your {role} account.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Status: Verification Pending
            </div>
            <p className="text-sm font-medium text-[#5A5D63]">
              Please do not resubmit your documents unless requested.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl bg-[#09391C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0B423D]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
