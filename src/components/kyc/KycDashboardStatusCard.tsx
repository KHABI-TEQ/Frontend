"use client";

import Link from "next/link";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import type { User } from "@/context/user-context";
import {
  KYC_ACCOUNT_TYPES,
  isApprovedKyc,
  isPendingKyc,
  kycPathForUser,
  kycRoleLabel,
  resolveKycStatus,
  type CanonicalKycStatus,
} from "@/lib/kyc-status";

const APPROVED_BANNER_MS = 24 * 60 * 60 * 1000;

function shouldShowApprovedBanner(user: User): boolean {
  const id = String(user.id || user._id || user.accountId || "anon");
  const key = `khabiteq-kyc-approved-shown-${id}`;
  const fromApi = (user as User & { kycApprovedAt?: string }).kycApprovedAt;
  const apiTime = fromApi ? new Date(fromApi).getTime() : NaN;
  try {
    if (Number.isFinite(apiTime)) {
      return Date.now() - apiTime < APPROVED_BANNER_MS;
    }
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, new Date().toISOString());
      return true;
    }
    const seen = new Date(stored).getTime();
    return Number.isFinite(seen) && Date.now() - seen < APPROVED_BANNER_MS;
  } catch {
    return true;
  }
}

type Props = {
  user: User;
  statusOverride?: CanonicalKycStatus | string;
};

export function shouldRenderKycDashboardStatus(
  user: User,
  statusOverride?: CanonicalKycStatus | string,
): boolean {
  if (!KYC_ACCOUNT_TYPES.has(String(user.userType || ""))) return false;
  const status = resolveKycStatus(user, statusOverride ? { kycStatus: statusOverride } : null);
  if (status === "none") return false;
  if (isApprovedKyc(status)) return shouldShowApprovedBanner(user);
  return true;
}

export default function KycDashboardStatusCard({ user, statusOverride }: Props) {
  if (!shouldRenderKycDashboardStatus(user, statusOverride)) return null;

  const status = resolveKycStatus(user, statusOverride ? { kycStatus: statusOverride } : null);

  const role = kycRoleLabel(user.userType);
  const href = kycPathForUser(user.userType);

  if (isPendingKyc(status)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-amber-950">Verification Pending</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900">
              Your KYC has been submitted successfully and is currently being reviewed.
              Estimated review time: 24–48 hours.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
              You can continue setting up your profile while you wait. Features that require
              verification will become available once your KYC is approved.
            </p>
            <Link
              href={href}
              className="mt-4 inline-flex text-sm font-semibold text-[#09391C] underline-offset-2 hover:underline"
            >
              View submission status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isApprovedKyc(status)) {
    if (!shouldShowApprovedBanner(user)) return null;
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-emerald-950">Verification Approved</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-900">
              Your professional {role} account has been verified. You now have access to your
              available account features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
          <ShieldAlert className="h-5 w-5 text-red-600" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-red-950">Verification needs attention</p>
          <p className="mt-1 text-sm leading-relaxed text-red-900">
            Khabiteq could not approve your KYC. Update the requested details and resubmit only
            if you were asked to.
          </p>
          <Link
            href={href}
            className="mt-4 inline-flex rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Update KYC
          </Link>
        </div>
      </div>
    </div>
  );
}
