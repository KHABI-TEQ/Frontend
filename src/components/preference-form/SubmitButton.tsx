/** @format */

"use client";
import React, { useMemo, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { usePreferenceForm } from "@/context/preference-form-context";

interface SubmitButtonProps {
  onSubmit: () => void;
  className?: string;
  buttonText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = memo(
  ({ onSubmit, className = "", buttonText }) => {
    const {
      state,
      isFormValid,
      canProceedToNextStep,
      goToNextStep,
      goToPreviousStep,
    } = usePreferenceForm();

    const { currentStep, steps, isSubmitting } = state;
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    // Check if current step is valid
    const canProceed = useMemo(() => {
      return canProceedToNextStep();
    }, [canProceedToNextStep, state.formData]); // Added formData dependency

    // Check if entire form is valid for final submission
    const canSubmit = useMemo(() => {
      return isFormValid() && isLastStep;
    }, [isFormValid, isLastStep, state.formData]); // Added formData dependency

    
        // Get button text based on current step and state
    const getButtonText = useMemo(() => {
      if (isSubmitting) {
        return buttonText?.includes("Update") ? "Updating..." : "Submitting...";
      }

      if (isLastStep) {
        return buttonText || "Submit Preference";
      }

      return "Continue";
    }, [isSubmitting, isLastStep, buttonText]);

    // Get button icon
    const getButtonIcon = useMemo(() => {
      if (isSubmitting) {
        return (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      }

      if (isLastStep) {
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      }

      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      );
    }, [isSubmitting, isLastStep]);

    // Handle button click - memoized to prevent recreation
    const handleClick = useCallback(() => {
      if (isSubmitting) return;

      if (isLastStep) {
        if (canSubmit) {
          onSubmit();
        }
      } else {
        if (canProceed) {
          goToNextStep();
        }
      }
    }, [
      isSubmitting,
      isLastStep,
      canSubmit,
      canProceed,
      onSubmit,
      goToNextStep,
    ]);

    // Get validation status message
    const getValidationMessage = useMemo(() => {
      if (isLastStep && !canSubmit && !isSubmitting) {
        return "Please complete all required fields to submit";
      }

      if (!canProceed && !isSubmitting) {
        return "Please complete this step to continue";
      }

      return null;
    }, [isLastStep, canSubmit, canProceed, isSubmitting]);

    // Button enabled state
    const isButtonEnabled = useMemo(() => {
      if (isSubmitting) return false;
      return isLastStep ? canSubmit : canProceed;
    }, [isSubmitting, isLastStep, canSubmit, canProceed]);

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Validation Message */}
        {getValidationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              {getValidationMessage}
            </p>
          </motion.div>
        )}

        {/* Button Container */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Back Button */}
          {!isFirstStep && (
            <motion.button
              type="button"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
              className={`flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium border border-gray-300 rounded-lg transition-all duration-200 ${
                isSubmitting
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              }`}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              <span>Back</span>
            </motion.button>
          )}

          {/* Main Action Button */}
          <motion.button
            type="button"
            onClick={handleClick}
            disabled={!isButtonEnabled}
            className={`flex items-center justify-center space-x-2 px-8 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !isButtonEnabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isLastStep
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            } ${isFirstStep ? "flex-1" : ""}`}
            whileHover={isButtonEnabled ? { scale: 1.02 } : {}}
            whileTap={isButtonEnabled ? { scale: 0.98 } : {}}
          >
            <span>{getButtonText}</span>
            {getButtonIcon}
          </motion.button>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index <= currentStep ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Progress Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    );
  },
);

SubmitButton.displayName = "SubmitButton";

export default SubmitButton;
