"use client";

import React from "react";
import OutrightSalesPropertyForm from "@/components/post-property-components/forms/OutrightSalesPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
 
const OutrightSalesPage = () => {
  return (
    <CombinedAuthGuard
        requireAuth={true}
        allowedUserTypes={["Agent", "Landowners"]}
        requireAgentOnboarding={false}
        requireAgentApproval={false}
        requireKycApproved={true}
        agentCustomMessage="You must complete onboarding and be approved before you can post properties."
      >
      <FeatureGate featureKeys={[FEATURE_KEYS.LISTINGS]}>
        <OutrightSalesPropertyForm
          pageTitle="List Your Property - Outright Sales"
          pageDescription="Follow these simple steps to list your property for outright sales and connect with potential buyers"
        />
      </FeatureGate>
    </CombinedAuthGuard>
  );
};
 
export default OutrightSalesPage;
