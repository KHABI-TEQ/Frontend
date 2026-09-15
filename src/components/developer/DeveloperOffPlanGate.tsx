"use client";

import Link from "next/link";
import { Shield, CreditCard } from "lucide-react";
import Loading from "@/components/loading-component/loading";
import { useDeveloperPlanEntitlement } from "@/hooks/useDeveloperPlanEntitlement";
import { useUserContext } from "@/context/user-context";
import { canUserListOffPlan, LANDLORD_CANNOT_LIST_OFF_PLAN } from "@/utils/listingAccess";

export default function DeveloperOffPlanGate({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();
  const { entitlement, loading, isDeveloper } = useDeveloperPlanEntitlement();

  if (!canUserListOffPlan(user?.userType)) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] py-10 px-4">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8">
          <h1 className="text-2xl font-semibold text-[#09391C]">Off-plan listing is not available</h1>
          <p className="text-[#5A5D63] mt-2">{LANDLORD_CANNOT_LIST_OFF_PLAN}</p>
          <Link href="/post-property" className="inline-flex items-center justify-center mt-6 px-4 py-2 rounded-lg bg-[#8DDB90] text-white font-medium">
            List a completed property instead
          </Link>
        </div>
      </div>
    );
  }

  if (!isDeveloper) return <>{children}</>;

  if (loading && !entitlement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <Loading />
      </div>
    );
  }

  if (entitlement?.canListOffPlan) return <>{children}</>;

  const needsKyc = !entitlement?.advancedKycApproved;
  const needsPlan = !entitlement?.allowsOffPlan;

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-10 px-4">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-[#09391C]">Off-plan listing is locked</h1>
        <p className="text-[#5A5D63] mt-2">
          Developers can list completed properties without a plan. Off-plan projects require approved Advanced KYC and an Off-Plan subscription.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#09391C]">
          <li>
            Advanced KYC:{" "}
            <strong>
              {entitlement?.advancedKycApproved
                ? "Approved"
                : entitlement?.advancedKycStatus === "pending" || entitlement?.advancedKycStatus === "in_review"
                  ? "Pending review"
                  : "Not submitted"}
            </strong>
          </li>
          <li>
            Off-Plan plan:{" "}
            <strong>{entitlement?.allowsOffPlan ? entitlement.planName : "Not active"}</strong>
          </li>
        </ul>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {needsKyc && (
            <Link
              href="/developer-kyc"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#8DDB90] text-white font-medium"
            >
              <Shield size={16} />
              Complete Advanced KYC
            </Link>
          )}
          {needsPlan && (
            <Link
              href="/agent-subscriptions?tab=plans"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#8DDB90] text-[#09391C] font-medium"
            >
              <CreditCard size={16} />
              Subscribe to Off-Plan
            </Link>
          )}
          <Link href="/post-property" className="inline-flex items-center justify-center px-4 py-2 text-sm text-[#5A5D63] hover:underline">
            List a completed property instead
          </Link>
        </div>
      </div>
    </div>
  );
}
