"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import OutrightSalesPropertyForm from "@/components/post-property-components/forms/OutrightSalesPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import DeveloperOffPlanGate from "@/components/developer/DeveloperOffPlanGate";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";

const OffPlanPage = () => {
  const router = useRouter();
  const { user, isInitialized } = useUserContext();

  useEffect(() => {
    if (!isInitialized) return;
    if (user?.userType === "Developer") {
      router.replace("/developer/projects/new");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || user?.userType === "Developer") {
    return <Loading />;
  }

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Developer"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireKycApproved={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <FeatureGate featureKeys={[FEATURE_KEYS.LISTINGS]}>
        <DeveloperOffPlanGate>
          <OutrightSalesPropertyForm
            listingMode="off-plan"
            pageTitle="List Your Property - Off-Plan"
            pageDescription="Follow these simple steps to list your off-plan property and connect with interested buyers"
          />
        </DeveloperOffPlanGate>
      </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default OffPlanPage;
