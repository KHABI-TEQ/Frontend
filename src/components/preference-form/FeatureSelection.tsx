/** @format */

"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferenceForm } from "@/context/preference-form-context";
import {
  FeatureSelection as FeatureSelectionType,
  FeatureDefinition,
} from "@/types/preference-form";

interface FeatureSelectionProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  preferenceType,
  className = "",
}) => {
  const { state, updateFormData, getAvailableFeatures } = usePreferenceForm();

  const [selectedBasicFeatures, setSelectedBasicFeatures] = useState<string[]>(
    [],
  );
  const [selectedPremiumFeatures, setSelectedPremiumFeatures] = useState<
    string[]
  >([]);
  const [autoAdjustToBudget, setAutoAdjustToBudget] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Get current budget
  const currentBudget = useMemo(() => {
    return state.formData.budget?.minPrice || 0;
  }, [state.formData.budget?.minPrice]);

  // Get available features based on budget
  const availableFeatures = useMemo(() => {
    return getAvailableFeatures(preferenceType, currentBudget);
  }, [preferenceType, currentBudget, getAvailableFeatures]);

  // Initialize from context data
  useEffect(() => {
    if (state.formData.features) {
      const features = state.formData.features;
      setSelectedBasicFeatures(features.basicFeatures || []);
      setSelectedPremiumFeatures(features.premiumFeatures || []);
      setAutoAdjustToBudget(features.autoAdjustToBudget || false);
    }
  }, [state.formData.features]);

  // Update context when values change
  useEffect(() => {
    const featureData: FeatureSelectionType = {
      basicFeatures: selectedBasicFeatures,
      premiumFeatures: selectedPremiumFeatures,
      autoAdjustToBudget,
    };

    updateFormData({
      features: featureData,
    });
  }, [
    selectedBasicFeatures,
    selectedPremiumFeatures,
    autoAdjustToBudget,
    updateFormData,
  ]);

  // Auto-adjust features when budget changes
  useEffect(() => {
    if (autoAdjustToBudget && currentBudget > 0) {
      // Remove premium features that exceed budget
      const validPremiumFeatures = selectedPremiumFeatures.filter(
        (featureName) => {
          const feature = availableFeatures.premium.find(
            (f) => f.name === featureName,
          );
          return (
            feature &&
            (!feature.minBudgetRequired ||
              currentBudget >= feature.minBudgetRequired)
          );
        },
      );

      if (validPremiumFeatures.length !== selectedPremiumFeatures.length) {
        setSelectedPremiumFeatures(validPremiumFeatures);
      }
    }
  }, [
    currentBudget,
    autoAdjustToBudget,
    availableFeatures.premium,
    selectedPremiumFeatures,
  ]);

  // Handle basic feature toggle
  const handleBasicFeatureToggle = useCallback((featureName: string) => {
    setSelectedBasicFeatures((prev) => {
      if (prev.includes(featureName)) {
        return prev.filter((name) => name !== featureName);
      } else {
        return [...prev, featureName];
      }
    });
  }, []);

  // Handle premium feature toggle
  const handlePremiumFeatureToggle = useCallback((featureName: string) => {
    // Allow selection of any premium feature regardless of budget
    setSelectedPremiumFeatures((prev) => {
      if (prev.includes(featureName)) {
        return prev.filter((name) => name !== featureName);
      } else {
        return [...prev, featureName];
      }
    });
  }, []);

  // Allow all premium features (no longer disabled based on budget)
  const isPremiumFeatureDisabled = useCallback(
    (feature: FeatureDefinition): boolean => {
      return false; // Never disable any premium features
    },
    [],
  );

  // Show tooltip
  const handleTooltipShow = useCallback((featureName: string) => {
    setShowTooltip(featureName);
  }, []);

  // Hide tooltip
  const handleTooltipHide = useCallback(() => {
    setShowTooltip(null);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Your Preferred Features
        </h3>
        <p className="text-sm text-gray-600">
          Choose the features that matter most to you
        </p>
      </div>

      {/* Auto-adjust toggle */}
      <div className="flex items-center justify-center">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAdjustToBudget}
            onChange={(e) => setAutoAdjustToBudget(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-12 h-6 rounded-full transition-colors ${
              autoAdjustToBudget ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                autoAdjustToBudget ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Auto-adjust my features to match my budget
          </span>
        </label>
      </div>

      {/* Basic Features */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900 flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
          Basic Features
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableFeatures.basic.map((feature) => (
            <motion.div
              key={feature.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedBasicFeatures.includes(feature.name)
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
              }`}
              onClick={() => handleBasicFeatureToggle(feature.name)}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded border-2 transition-all ${
                    selectedBasicFeatures.includes(feature.name)
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedBasicFeatures.includes(feature.name) && (
                    <svg
                      className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {feature.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900 flex items-center">
          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
          Premium Features
          <span className="text-xs text-gray-500 ml-2">(Budget dependent)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableFeatures.premium.map((feature) => {
            const isDisabled = isPremiumFeatureDisabled(feature);
            const isSelected = selectedPremiumFeatures.includes(feature.name);

            return (
              <div key={feature.name} className="relative">
                <motion.div
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50 cursor-pointer"
                      : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50 cursor-pointer"
                  }`}
                  onClick={() => handlePremiumFeatureToggle(feature.name)}
                  onMouseLeave={handleTooltipHide}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded border-2 transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {feature.name}
                      </span>
                    </div>
                  </div>

                  {feature.minBudgetRequired && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-600">
                        Min: ₦{feature.minBudgetRequired.toLocaleString()}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Tooltip - removed since features are no longer disabled */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Summary */}
      {(selectedBasicFeatures.length > 0 ||
        selectedPremiumFeatures.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            Selected Features
          </h4>
          <div className="space-y-2">
            {selectedBasicFeatures.length > 0 && (
              <div>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  Basic Features:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBasicFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPremiumFeatures.length > 0 && (
              <div>
                <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Premium Features:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPremiumFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Info notice about premium features */}
      {selectedPremiumFeatures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-blue-800">
                Premium Features Selected
              </h5>
              <p className="text-xs text-blue-700 mt-1">
                You've selected premium features. Make sure your budget aligns
                with these preferences for the best matching results.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FeatureSelection;
