/** @format */

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { IsMobile } from "@/hooks/isMobile"; 
import PropertySlots from "@/components/new-marketplace/PropertySlots";
import DateTimeSelection from "@/components/new-marketplace/DateTimeSelection";
import Button from "@/components/general-components/button";
import { useGlobalInspectionState } from "@/hooks/useGlobalInspectionState";
import InspectionSuccessModal from "@/components/modals/InspectionSuccessModal";
import { useInspectionSettings } from "@/hooks/useSystemSettings";

const ContinueInspectionPage = () => {
  const router = useRouter();
  const isMobile = IsMobile();

  // System settings for dynamic pricing
  const { settings: inspectionSettings, loading: settingsLoading } = useInspectionSettings();

  const {
    selectedProperties,
    negotiatedPrices,
    loiDocuments,
    removeProperty,
    clearNegotiatedPrice,
    clearLOIDocument,
    clearAllSelections,
    getPropertyType,
  } = useGlobalInspectionState();

  const [currentStep, setCurrentStep] = useState<
    "selection" | "datetime"
  >("selection");

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track if we started with properties to avoid immediate redirect
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setInitialLoad(false);
  }, []);

  // Only redirect if we started with no properties or they were all removed after initial load
  useEffect(() => {
    if (!initialLoad && selectedProperties.length === 0) {
      // Add a small delay to prevent immediate redirect during navigation
      const timer = setTimeout(() => {
        router.push("/market-place");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedProperties.length, router, initialLoad]);

  // Calculate inspection fee using system settings
  const inspectionFee = useMemo(() => {
    // Use dynamic pricing from system settings with fallback to original prices
    const baseAmount = inspectionSettings.inspection_base_fee || 5000;
    const additionalAmount = inspectionSettings.inspection_different_lga_fee || 10000;

    if (selectedProperties.length === 1) {
      return baseAmount;
    }

    if (selectedProperties.length === 2) {
      const [propertyA, propertyB] = selectedProperties;
      const lgaA = propertyA.property?.location?.localGovernment;
      const lgaB = propertyB.property?.location?.localGovernment;
      const uniqueLGAs = new Set([lgaA, lgaB]);

      return uniqueLGAs.size === 1 ? baseAmount : baseAmount + additionalAmount;
    }

    return baseAmount;
  }, [selectedProperties, inspectionSettings]);

  const handleBack = () => {
    if (currentStep === "selection") {
      router.back();
    } else if (currentStep === "datetime") {
      setCurrentStep("selection");
    }
  };

  const handleRemoveProperty = (propertyId: string) => {
    removeProperty(propertyId);
  };

  const handleClearNegotiatedPrice = (propertyId: string) => {
    clearNegotiatedPrice(propertyId);
  };

  const handleClearLOIDocument = (propertyId: string) => {
    clearLOIDocument(propertyId);
  };

  const handleProceedToDateTime = () => {
    if (selectedProperties.length === 0) {
      alert("Please select at least one property for inspection.");
      return;
    }
    setCurrentStep("datetime");
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "selection":
        return "Selected Properties for Inspection";
      case "datetime":
        return "Select Inspection Date & Time";
      default:
        return "Continue Inspection";
    }
  };

  const getPropertyTypesDisplay = () => {
    const types = new Set(selectedProperties.map(p => getPropertyType(p.property)));
    return Array.from(types).join(", ");
  };

  const getDominantTab = (): "buy" | "jv" | "rent" | "shortlet" => {
    // Determine the most common property type to use for context
    const types = selectedProperties.map(p => getPropertyType(p.property));
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeCount).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

    switch (dominantType) {
      case "Joint Venture":
        return "jv";
      case "Rent":
        return "rent";
      case "Shortlet":
        return "shortlet";
      default:
        return "buy";
    }
  };

  const getMarketType = (property: any): string => {
    if (!property) return "buy";

    switch(property.briefType) {
      case "Joint Venture":
        return "jv";
      case "Rent":
        return "rent";
      case "Shortlet":
        return "shortlet";
      case "Outright Sales":
      default:
        return "buy";
    }
  };

  const handlePropertyClick = (property: any) => {
    const marketType = getMarketType(property);
    router.push(`/property/${marketType}/${property._id}`);
  };

  // Success modal handlers
  const handleRequestAgain = () => {
    setShowSuccessModal(false);
    clearAllSelections();
    router.push("/market-place");
  };

  const handleWaitForReply = () => {
    setShowSuccessModal(false);
    clearAllSelections();
    router.push("/");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    clearAllSelections();
    router.push("/");
  };

  if (!initialLoad && selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#09391C] mb-4">
            No Properties Selected
          </h1>
          <p className="text-[#5A5D63] mb-6">
            Please select properties from the marketplace to continue with inspection.
          </p>
          <Button
            onClick={() => router.push("/market-place")}
            value="Go to Marketplace"
            className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 mt-1"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-[#09391C] text-sm sm:text-base"
            />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#09391C] font-display leading-tight">
              {getStepTitle()}
            </h1>
            <p className="text-[#5A5D63] mt-1 text-sm sm:text-base">
              {getPropertyTypesDisplay()} Properties • Maximum 2 properties allowed
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {["selection", "datetime"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                    currentStep === step
                      ? "bg-[#8DDB90] text-white"
                      : index <
                          ["selection", "datetime"].indexOf(
                            currentStep,
                          )
                        ? "bg-[#09391C] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                      index <
                      ["selection", "datetime"].indexOf(currentStep)
                        ? "bg-[#09391C]"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 sm:space-x-12 mt-2">
            <span className="text-xs text-[#5A5D63]">Selection</span>
            <span className="text-xs text-[#5A5D63]">Date & Time</span>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Inspection Fee Info */}
              <div className="bg-[#E4EFE7] mx-auto max-w-3xl border border-[#8DDB90] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#09391C]">
                      Inspection Fee
                    </h3>
                    <p className="text-sm text-[#5A5D63]">
                      {selectedProperties.length === 2
                        ? inspectionFee > (inspectionSettings.inspection_base_fee || 5000)
                          ? "Two properties in different areas"
                          : "Two properties in same area"
                        : "Single property inspection"}
                    </p>
                    {/* Show fee breakdown if multiple properties in different areas */}
                    {selectedProperties.length === 2 && inspectionFee > (inspectionSettings.inspection_base_fee || 5000) && (
                      <p className="text-xs text-[#5A5D63] mt-1">
                        Base fee: ₦{(inspectionSettings.inspection_base_fee || 5000).toLocaleString()} +
                        Different LGA fee: ₦{(inspectionSettings.inspection_different_lga_fee || 10000).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#09391C]">
                      {settingsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                      ) : (
                        `₦${inspectionFee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Slots */}
              <PropertySlots
                selectedProperties={selectedProperties}
                maxSlots={2}
                tab={getDominantTab()}
                onRemove={handleRemoveProperty}
                onClearNegotiatedPrice={handleClearNegotiatedPrice}
                onClearLOIDocument={handleClearLOIDocument}
                onAddProperty={() => router.push("/market-place")}
                onPropertyClick={handlePropertyClick}
                negotiatedPrices={negotiatedPrices}
                loiDocuments={loiDocuments}
              />

              {/* Action Buttons */}
              {selectedProperties.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <button
                    onClick={() => router.push("/market-place")}
                    className="px-6 py-3 border border-[#E9EBEB] text-[#5A5D63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Marketplace
                  </button>
                  <Button
                    onClick={handleProceedToDateTime}
                    value="Proceed to Date Selection"
                    className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors"
                  />
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DateTimeSelection
                selectedProperties={selectedProperties}
                inspectionFee={inspectionFee}
                activeTab={getDominantTab()}
                negotiatedPrices={negotiatedPrices}
                loiDocuments={loiDocuments}
                onComplete={() => {
                  setShowSuccessModal(true);
                }}
                onBack={() => setCurrentStep("selection")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <InspectionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onRequestAgain={handleRequestAgain}
        onWaitForReply={handleWaitForReply}
      />
    </div>
  );
};

export default ContinueInspectionPage;
