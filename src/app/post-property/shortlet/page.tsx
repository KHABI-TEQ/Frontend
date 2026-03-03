"use client";

import React from "react";
import ShortletPropertyForm from "@/components/post-property-components/forms/ShortletPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";

const ShortletPage = () => {
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
      <ShortletPropertyForm
        pageTitle="List Your Property - Shortlet"
        pageDescription="Follow these simple steps to list your property for shortlet and connect with potential guests"
      />
    </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default ShortletPage;
