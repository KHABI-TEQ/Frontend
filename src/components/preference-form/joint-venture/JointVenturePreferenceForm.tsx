/** @format */

"use client";
import React, { memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import OptimizedStepWrapper from "@/components/preference-form/OptimizedStepWrapper";
import JVStep1DeveloperInfo from "./JVStep1DeveloperInfo";
import JVStep2DevelopmentType from "./JVStep2DevelopmentType";
import JVStep3LandRequirements from "./JVStep3LandRequirements";
import JVStep4TermsProposal from "./JVStep4TermsProposal";
import JVStep5TitleDocumentation from "./JVStep5TitleDocumentation";

interface JointVenturePreferenceFormProps {
  className?: string;
}

const JointVenturePreferenceForm: React.FC<JointVenturePreferenceFormProps> = memo(
  ({ className = "" }) => {
    const { state } = usePreferenceForm();

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Step 0: Developer Information */}
        <OptimizedStepWrapper
          stepId="jv-developer-info"
          currentStep={state.currentStep}
          targetStep={0}
        >
          <JVStep1DeveloperInfo />
        </OptimizedStepWrapper>

        {/* Step 1: Development Type */}
        <OptimizedStepWrapper
          stepId="jv-development-type"
          currentStep={state.currentStep}
          targetStep={1}
        >
          <JVStep2DevelopmentType />
        </OptimizedStepWrapper>

        {/* Step 2: Land Requirements */}
        <OptimizedStepWrapper
          stepId="jv-land-requirements"
          currentStep={state.currentStep}
          targetStep={2}
        >
          <JVStep3LandRequirements />
        </OptimizedStepWrapper>

        {/* Step 3: Terms & Proposal */}
        <OptimizedStepWrapper
          stepId="jv-terms-proposal"
          currentStep={state.currentStep}
          targetStep={3}
        >
          <JVStep4TermsProposal />
        </OptimizedStepWrapper>

        {/* Step 4: Title & Documentation */}
        <OptimizedStepWrapper
          stepId="jv-title-documentation"
          currentStep={state.currentStep}
          targetStep={4}
        >
          <JVStep5TitleDocumentation />
        </OptimizedStepWrapper>
      </div>
    );
  },
);

JointVenturePreferenceForm.displayName = "JointVenturePreferenceForm";

export default JointVenturePreferenceForm;
