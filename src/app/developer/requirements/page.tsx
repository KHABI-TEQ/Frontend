"use client";

import Link from "next/link";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";

export default function OffPlanRequirementsPage() {
  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Developer"]} requireAgentOnboarding={false} requireAgentApproval={false}>
      <div className="min-h-screen bg-[#EEF1F1] py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <h1 className="text-2xl font-bold text-[#09391C]">Off-plan project requirements</h1>
          <p className="text-[#5A5D63]">
            Off-plan projects may require additional verification and an applicable plan. Paying for a plan does not make a developer verified.
          </p>
          <ul className="space-y-3 text-sm text-[#09391C]">
            <li>1. Complete Developer Verification — company (if applicable), authorized representative or identity, and address.</li>
            <li>2. Subscribe to an Off-Plan plan. The Distribution plan covers completed properties only.</li>
            <li>3. Submit the project for review. Project approval is separate from developer verification.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/developer-kyc" className="rounded-lg bg-[#09391C] text-white px-4 py-2 text-sm font-semibold">
              Complete Verification
            </Link>
            <Link href="/agent-subscriptions?tab=plans" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#09391C]">
              View plans
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-[#09391C] px-2 py-2">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
