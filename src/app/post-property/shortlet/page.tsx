"use client";

import React from "react";
import ShortletPropertyForm from "@/components/post-property-components/forms/ShortletPropertyForm";
import FeatureGate from "@/components/access/FeatureGate";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";

const ShortletPage = () => {
  return (
    <FeatureGate featureKeys={[FEATURE_KEYS.LISTINGS]}>
      <ShortletPropertyForm
        pageTitle="List Your Property - Shortlet"
        pageDescription="Follow these simple steps to list your property for shortlet and connect with potential guests"
      />
    </FeatureGate>
  );
};

export default ShortletPage;
