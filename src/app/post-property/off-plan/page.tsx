"use client";

import React from "react";
import OutrightSalesPropertyForm from "@/components/post-property-components/forms/OutrightSalesPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";

const OffPlanPage = () => {
  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners", "Developer"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireKycApproved={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <FeatureGate featureKeys={[FEATURE_KEYS.LISTINGS]}>
        <OutrightSalesPropertyForm
          listingMode="off-plan"
          pageTitle="List Your Property - Off-Plan"
          pageDescription="Follow these simple steps to list your off-plan property and connect with interested buyers"
        />
      </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default OffPlanPage;
