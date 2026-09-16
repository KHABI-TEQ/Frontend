"use client";
import React, { Suspense } from "react";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { Loader2 } from "lucide-react";
import ScoutKycForm from "@/components/scout-kyc/ScoutKycForm";

export default function ScoutKycPage() {
  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["PropertyScout"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
    >
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#8DDB90]" />
          </div>
        }
      >
        <div className="min-h-screen bg-[#EEF1F1] px-4 py-10">
          <ScoutKycForm />
        </div>
      </Suspense>
    </CombinedAuthGuard>
  );
}
