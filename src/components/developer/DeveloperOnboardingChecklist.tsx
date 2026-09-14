"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { useDeveloperPlanEntitlement } from "@/hooks/useDeveloperPlanEntitlement";

export default function DeveloperOnboardingChecklist() {
  const { entitlement, loading } = useDeveloperPlanEntitlement();

  const steps = [
    {
      title: "Complete developer profile",
      done: Boolean(entitlement?.hasBasicProfile),
      href: "/developer-kyc",
      detail: "Company or individual, bio, and regions of operation.",
    },
    {
      title: "Add a property or project",
      done: (entitlement?.propertyCount ?? 0) > 0,
      href: "/post-property",
      detail: "List a completed property. No plan required for this step.",
    },
    {
      title: "Subscribe to Distribution and accept professionals",
      done: Boolean(entitlement?.hasActivePlan),
      href: "/agent-subscriptions?tab=plans",
      detail: entitlement?.hasActivePlan
        ? `${entitlement.acceptedCount} of ${entitlement.maxProfessionals} professionals accepted.`
        : "₦50,000 / 3 months unlocks up to 10 professionals.",
    },
    {
      title: "Unlock off-plan",
      done: Boolean(entitlement?.canListOffPlan),
      href: entitlement?.advancedKycApproved
        ? "/agent-subscriptions?tab=plans"
        : "/developer-kyc",
      detail: "Advanced KYC plus Off-Plan (₦130,000) or Off-Plan Annual (₦390,000).",
    },
  ];

  return (
    <div className="mb-6 rounded-lg border border-emerald-200 bg-white px-4 py-4">
      <h2 className="font-semibold text-[#09391C]">Get started as a developer</h2>
      <p className="text-sm text-[#5A5D63] mt-1">
        Four steps: profile, listings, distribution, then off-plan.
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3">
            {step.done ? (
              <CheckCircle2 className="text-[#8DDB90] mt-0.5 shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-300 mt-0.5 shrink-0" size={20} />
            )}
            <div>
              <p className="text-sm font-medium text-[#09391C]">
                {index + 1}. {step.title}
                {loading && index === 0 ? "" : step.done ? " — done" : ""}
              </p>
              <p className="text-xs text-[#5A5D63]">{step.detail}</p>
              {!step.done && (
                <Link href={step.href} className="text-xs font-medium text-emerald-700 hover:underline">
                  Continue
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
