"use client";

import React from "react";
import RentPropertyForm from "@/components/post-property-components/forms/RentPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";

const RentPage = () => {
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
        <RentPropertyForm
          pageTitle="List Your Property - For Rent"
          pageDescription="Follow these simple steps to list your property for rent and connect with potential tenants"
        />
      </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default RentPage;
