"use client";
import React, { Suspense } from "react";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { Loader2 } from "lucide-react";
import DeveloperKycForm from "@/components/developer-kyc/DeveloperKycForm";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1F1] to-[#F8FFFE]">
    <div className="text-center">
      <Loader2 size={48} className="animate-spin text-[#8DDB90] mx-auto mb-4" />
      <p className="text-[#5A5D63] font-medium">Loading practitioner profile…</p>
    </div>
  </div>
);

export default function DeveloperKycPage() {
  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Developer"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DeveloperKycForm />
      </Suspense>
    </CombinedAuthGuard>
  );
}
