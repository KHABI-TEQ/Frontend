/** @format */

"use client";
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  PreferenceFormProvider,
  usePreferenceForm,
} from "@/context/preference-form-context";
import LocationSelection from "@/components/preference-form/LocationSelection";
import BudgetSelection from "@/components/preference-form/BudgetSelection";
import FeatureSelection from "@/components/preference-form/FeatureSelection";
import PropertyDetails from "@/components/preference-form/PropertyDetails";
import DateSelection from "@/components/preference-form/DateSelection";
import ContactInformation from "@/components/preference-form/ContactInformation";
import SubmitButton from "@/components/preference-form/SubmitButton";
import StepWrapper from "@/components/preference-form/StepWrapper";
import {
  PreferencePayload,
  BuyPreferencePayload,
  RentPreferencePayload,
  JointVenturePreferencePayload,
  ShortletPreferencePayload,
} from "@/types/preference-form";

// Preference type configurations - memoized to prevent recreation
const PREFERENCE_CONFIGS = {
  buy: {
    label: "Buy a Property",
    shortLabel: "Buy",
    icon: "🏠",
    description: "Find properties to purchase",
    preferenceType: "buy" as const,
    preferenceMode: "buy" as const,
  },
  rent: {
    label: "Rent Property",
    shortLabel: "Rent",
    icon: "🏡",
    description: "Find rental properties",
    preferenceType: "rent" as const,
    preferenceMode: "tenant" as const,
  },
  "joint-venture": {
    label: "Joint Venture",
    shortLabel: "JV",
    icon: "🏗",
    description: "Partner for development",
    preferenceType: "joint-venture" as const,
    preferenceMode: "developer" as const,
  },
  shortlet: {
    label: "Shortlet Guest Stay",
    shortLabel: "Shortlet",
    icon: "🏘",
    description: "Book short-term stays",
    preferenceType: "shortlet" as const,
    preferenceMode: "shortlet" as const,
  },
} as const;

// Loading Overlay Component - Memoized to prevent unnecessary re-renders
const LoadingOverlay = memo(({ isSubmitting }: { isSubmitting: boolean }) => (
  <AnimatePresence>
    {isSubmitting && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-sm mx-4 text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Animated spinner */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>

            {/* Loading text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Submitting Your Preference
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your request...
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

LoadingOverlay.displayName = "LoadingOverlay";

// Success Modal Component - Memoized to prevent unnecessary re-renders
const SuccessModal = memo(
  ({
    showSuccessModal,
    onSubmitNew,
    onGoToMarketplace,
  }: {
    showSuccessModal: boolean;
    onSubmitNew: () => void;
    onGoToMarketplace: () => void;
  }) => {
    // Prevent body scroll when modal is open
    React.useEffect(() => {
      if (showSuccessModal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      // Cleanup on unmount
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [showSuccessModal]);

    return (
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ overflow: "hidden" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
            >
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-emerald-600"
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
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Preference Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for submitting your property preference. We&apos;ll
                  start matching you with suitable properties right away.
                </p>
              </div>

              {/* Submit New Preference Button */}
              <button
                onClick={onSubmitNew}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mb-4"
              >
                Do you want to submit a new preference
              </button>

              {/* Go to Marketplace Link */}
              <button
                onClick={onGoToMarketplace}
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
              >
                No, go to market place
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

SuccessModal.displayName = "SuccessModal";

// Preference Type Button Component - Memoized to prevent unnecessary re-renders
const PreferenceTypeButton = memo(
  ({
    preferenceKey,
    config,
    isSelected,
    onClick,
  }: {
    preferenceKey: string;
    config: (typeof PREFERENCE_CONFIGS)[keyof typeof PREFERENCE_CONFIGS];
    isSelected: boolean;
    onClick: (key: keyof typeof PREFERENCE_CONFIGS) => void;
  }) => (
    <motion.button
      type="button"
      onClick={() => onClick(preferenceKey as keyof typeof PREFERENCE_CONFIGS)}
      className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
        isSelected
          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{config.icon}</div>
      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
        <span className="block sm:hidden">{config.shortLabel}</span>
        <span className="hidden sm:block">{config.label}</span>
      </h3>
      <p className="text-xs sm:text-sm text-gray-600">{config.description}</p>
    </motion.button>
  ),
);

PreferenceTypeButton.displayName = "PreferenceTypeButton";

// Step Progress Indicator Component - Memoized to prevent unnecessary re-renders
const StepProgressIndicator = memo(
  ({
    steps,
    currentStep,
    onStepClick,
  }: {
    steps: any[];
    currentStep: number;
    onStepClick: (index: number) => void;
  }) => (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                className={`flex items-center space-x-2 ${
                  index <= currentStep
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                } ${
                  index === currentStep
                    ? "text-emerald-600"
                    : index < currentStep
                      ? "text-emerald-500"
                      : "text-gray-400"
                }`}
                onClick={() => {
                  // Only allow navigation to current step or completed steps
                  if (index <= currentStep) {
                    onStepClick(index);
                  }
                }}
                whileHover={index <= currentStep ? { scale: 1.05 } : {}}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    index < currentStep
                      ? "bg-emerald-500 text-white"
                      : index === currentStep
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
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
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 rounded-full"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  ),
);

StepProgressIndicator.displayName = "StepProgressIndicator";

// Form content component
const PreferenceFormContent: React.FC = () => {
  const router = useRouter();
  const { state, updateFormData, resetForm, goToStep, dispatch, isFormValid } =
    usePreferenceForm();

  const [selectedPreferenceType, setSelectedPreferenceType] =
    useState<keyof typeof PREFERENCE_CONFIGS>("buy");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle preference type change - memoized to prevent recreation
  const handlePreferenceTypeChange = useCallback(
    (preferenceKey: keyof typeof PREFERENCE_CONFIGS) => {
      setSelectedPreferenceType(preferenceKey);
      // Reset form data immediately without confirmation
      dispatch({ type: "RESET_FORM" });
      // Set the new preference type
      updateFormData({
        preferenceType: PREFERENCE_CONFIGS[preferenceKey].preferenceType,
      });
      // Reset to first step
      goToStep(0);
    },
    [dispatch, updateFormData, goToStep],
  );

  // Generate API payload - memoized to prevent recreation
  const generatePayload = useCallback((): PreferencePayload => {
    const { formData } = state;

    const config = PREFERENCE_CONFIGS[selectedPreferenceType];

    const basePayload = {
      preferenceType: config.preferenceType,
      preferenceMode: config.preferenceMode,
      location: {
        state: formData.location?.state || "",
        localGovernmentAreas: formData.location?.lgas || [],
        selectedAreas: formData.location?.areas || [],
        customLocation: formData.location?.customLocation || "",
      },
      budget: {
        minPrice: formData.budget?.minPrice || 0,
        maxPrice: formData.budget?.maxPrice || 0,
        currency: "NGN" as const,
      },
      features: {
        baseFeatures: formData.features?.basicFeatures || [],
        premiumFeatures: formData.features?.premiumFeatures || [],
        autoAdjustToFeatures: formData.features?.autoAdjustToBudget || false,
      },
    };

    switch (selectedPreferenceType) {
      case "buy": {
        const buyData = formData as any;
        return {
          ...basePayload,
          preferenceType: "buy",
          preferenceMode: "buy",
          propertyDetails: {
            propertyType:
              buyData.propertyDetails?.propertySubtype ||
              buyData.propertyDetails?.propertyType ||
              "",
            buildingType: buyData.propertyDetails?.buildingType || "",
            minBedrooms:
              buyData.propertyDetails?.bedrooms ||
              buyData.propertyDetails?.minBedrooms ||
              "",
            minBathrooms:
              buyData.propertyDetails?.bathrooms ||
              buyData.propertyDetails?.minBathrooms ||
              0,
            propertyCondition: buyData.propertyDetails?.propertyCondition || "",
            purpose: buyData.propertyDetails?.purpose || "For living",
            landSize: buyData.propertyDetails?.landSize || "",
            measurementUnit: buyData.propertyDetails?.measurementUnit || "",
            documentTypes: buyData.propertyDetails?.documentTypes || [],
            landConditions: buyData.propertyDetails?.landConditions || [],
          },
          contactInfo: {
            fullName: buyData.contactInfo?.fullName || "",
            email: buyData.contactInfo?.email || "",
            phoneNumber: buyData.contactInfo?.phoneNumber || "",
          },
          nearbyLandmark:
            buyData.propertyDetails?.nearbyLandmark ||
            buyData.nearbyLandmark ||
            "",
          additionalNotes: buyData.additionalNotes || "",
        } as BuyPreferencePayload;
      }

      case "rent": {
        const rentData = formData as any;
        return {
          ...basePayload,
          preferenceType: "rent",
          preferenceMode: "tenant",
          propertyDetails: {
            propertyType:
              rentData.propertyDetails?.propertySubtype ||
              rentData.propertyDetails?.propertyType ||
              "",
            buildingType: rentData.propertyDetails?.buildingType || "",
            minBedrooms:
              rentData.propertyDetails?.bedrooms ||
              rentData.propertyDetails?.minBedrooms ||
              "",
            minBathrooms:
              rentData.propertyDetails?.bathrooms ||
              rentData.propertyDetails?.minBathrooms ||
              0,
            leaseTerm: rentData.propertyDetails?.leaseTerm || "1 Year",
            propertyCondition:
              rentData.propertyDetails?.propertyCondition || "",
            purpose: rentData.propertyDetails?.purpose || "Residential",
            landSize: rentData.propertyDetails?.landSize || "",
            measurementUnit: rentData.propertyDetails?.measurementUnit || "",
            documentTypes: rentData.propertyDetails?.documentTypes || [],
            landConditions: rentData.propertyDetails?.landConditions || [],
          },
          contactInfo: {
            fullName: rentData.contactInfo?.fullName || "",
            email: rentData.contactInfo?.email || "",
            phoneNumber: rentData.contactInfo?.phoneNumber || "",
          },
          nearbyLandmark:
            rentData.propertyDetails?.nearbyLandmark ||
            rentData.nearbyLandmark ||
            "",
          additionalNotes: rentData.additionalNotes || "",
        } as RentPreferencePayload;
      }

      case "joint-venture": {
        const jvData = formData as any;
        return {
          ...basePayload,
          preferenceType: "joint-venture",
          preferenceMode: "developer",
          developmentDetails: {
            minLandSize:
              jvData.propertyDetails?.landSize ||
              jvData.developmentDetails?.minLandSize ||
              "",
            measurementUnit:
              jvData.propertyDetails?.measurementUnit ||
              jvData.developmentDetails?.measurementUnit ||
              "",
            jvType: jvData.developmentDetails?.jvType || "Equity Split",
            propertyType:
              jvData.propertyDetails?.propertySubtype ||
              jvData.developmentDetails?.propertyType ||
              "",
            expectedStructureType:
              jvData.developmentDetails?.expectedStructureType || "",
            timeline: jvData.developmentDetails?.timeline || "",
            budgetRange: jvData.developmentDetails?.budgetRange || "",
            documentTypes: jvData.propertyDetails?.documentTypes || [],
            landConditions: jvData.propertyDetails?.landConditions || [],
            buildingType: jvData.propertyDetails?.buildingType || "",
            propertyCondition: jvData.propertyDetails?.propertyCondition || "",
            minBedrooms: jvData.propertyDetails?.minBedrooms || "",
            minBathrooms: jvData.propertyDetails?.minBathrooms || 0,
            purpose: jvData.propertyDetails?.purpose || "",
          },
          contactInfo: {
            companyName: jvData.contactInfo?.companyName || "",
            contactPerson: jvData.contactInfo?.contactPerson || "",
            email: jvData.contactInfo?.email || "",
            phoneNumber: jvData.contactInfo?.phoneNumber || "",
            cacRegistrationNumber:
              jvData.contactInfo?.cacRegistrationNumber || "",
          },
          partnerExpectations: jvData.partnerExpectations || "",
          nearbyLandmark:
            jvData.propertyDetails?.nearbyLandmark ||
            jvData.nearbyLandmark ||
            "",
          additionalNotes: jvData.additionalNotes || "",
        } as JointVenturePreferencePayload;
      }

      case "shortlet": {
        const shortletData = formData as any;
        return {
          ...basePayload,
          preferenceType: "shortlet",
          preferenceMode: "shortlet",
          bookingDetails: {
            propertyType:
              shortletData.propertyDetails?.propertyType ||
              shortletData.bookingDetails?.propertyType ||
              "",
            buildingType: shortletData.propertyDetails?.buildingType || "",
            minBedrooms:
              shortletData.propertyDetails?.bedrooms ||
              shortletData.bookingDetails?.minBedrooms ||
              "",
            minBathrooms:
              shortletData.propertyDetails?.bathrooms ||
              shortletData.bookingDetails?.minBathrooms ||
              0,
            numberOfGuests:
              shortletData.propertyDetails?.maxGuests ||
              shortletData.bookingDetails?.numberOfGuests ||
              0,
            checkInDate: shortletData.bookingDetails?.checkInDate || "",
            checkOutDate: shortletData.bookingDetails?.checkOutDate || "",
            travelType:
              shortletData.propertyDetails?.travelType ||
              shortletData.bookingDetails?.travelType ||
              "",
            preferredCheckInTime:
              shortletData.contactInfo?.preferredCheckInTime || "",
            preferredCheckOutTime:
              shortletData.contactInfo?.preferredCheckOutTime || "",
            propertyCondition:
              shortletData.propertyDetails?.propertyCondition || "",
            purpose: shortletData.propertyDetails?.purpose || "",
            landSize: shortletData.propertyDetails?.landSize || "",
            measurementUnit:
              shortletData.propertyDetails?.measurementUnit || "",
            documentTypes: shortletData.propertyDetails?.documentTypes || [],
            landConditions: shortletData.propertyDetails?.landConditions || [],
          },
          contactInfo: {
            fullName: shortletData.contactInfo?.fullName || "",
            email: shortletData.contactInfo?.email || "",
            phoneNumber: shortletData.contactInfo?.phoneNumber || "",
            petsAllowed: shortletData.contactInfo?.petsAllowed || false,
            smokingAllowed: shortletData.contactInfo?.smokingAllowed || false,
            partiesAllowed: shortletData.contactInfo?.partiesAllowed || false,
            additionalRequests:
              shortletData.contactInfo?.additionalRequests || "",
            maxBudgetPerNight: shortletData.contactInfo?.maxBudgetPerNight || 0,
            willingToPayExtra:
              shortletData.contactInfo?.willingToPayExtra || false,
            cleaningFeeBudget: shortletData.contactInfo?.cleaningFeeBudget || 0,
            securityDepositBudget:
              shortletData.contactInfo?.securityDepositBudget || 0,
            cancellationPolicy:
              shortletData.contactInfo?.cancellationPolicy || "",
          },
          nearbyLandmark:
            shortletData.propertyDetails?.nearbyLandmark ||
            shortletData.nearbyLandmark ||
            "",
          additionalNotes: shortletData.additionalNotes || "",
        } as ShortletPreferencePayload;
      }

      default:
        throw new Error("Invalid preference type");
    }
  }, [state, selectedPreferenceType]);

  // Handle form submission - memoized to prevent recreation
  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) {
      toast.error("Please complete all required fields before submitting");
      return;
    }

    dispatch({ type: "SET_SUBMITTING", payload: true });

    try {
      const payload = generatePayload();

      // Log payload for debugging (keeping as requested in development only)
      if (process.env.NODE_ENV === "development") {
        console.log("Generated Payload:", JSON.stringify(payload, null, 2));
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/buyers/submit-preference`;

      const response = await axios.post(url, payload);

      if (response.status === 201 || response.status === 200) {
        console.log("Preference submitted successfully:", response);
        toast.success("Preference submitted successfully!");
        // Reset form data immediately after successful submission
        dispatch({ type: "RESET_FORM" });
        // Show success modal
        setShowSuccessModal(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit preference. Please try again.");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [generatePayload, dispatch, isFormValid]);

  // Handle submit new preference - memoized to prevent recreation
  const handleSubmitNew = useCallback(() => {
    setShowSuccessModal(false);
    // Reset form data immediately without confirmation
    dispatch({ type: "RESET_FORM" });
    goToStep(0);
  }, [dispatch, goToStep]);

  // Handle go to marketplace - memoized to prevent recreation
  const handleGoToMarketplace = useCallback(() => {
    setShowSuccessModal(false);
    // Reset form data immediately without confirmation
    dispatch({ type: "RESET_FORM" });
    router.push("/market-place");
  }, [dispatch, router]);

  // Render preference type selector - memoized to prevent recreation
  const renderPreferenceTypeSelector = useMemo(
    () => (
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Choose Your Preference
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Select the type of property transaction you&apos;re interested in
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(PREFERENCE_CONFIGS).map(([key, config]) => (
            <PreferenceTypeButton
              key={key}
              preferenceKey={key}
              config={config}
              isSelected={key === selectedPreferenceType}
              onClick={handlePreferenceTypeChange}
            />
          ))}
        </div>
      </div>
    ),
    [selectedPreferenceType, handlePreferenceTypeChange],
  );

  // Debug panel - only show in development
  const debugPanel = useMemo(() => {
    if (process.env.NODE_ENV !== "development") return null;

    return (
      <div className="mt-8 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto">
        <h4 className="text-sm font-semibold mb-2">
          Current Form Data (Debug):
        </h4>
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(generatePayload(), null, 2)}
        </pre>
      </div>
    );
  }, [state.formData, generatePayload]);

  // Handle step navigation - memoized to prevent recreation
  const handleStepClick = useCallback(
    (index: number) => {
      goToStep(index);
    },
    [goToStep],
  );

  // Handle back navigation - memoized to prevent recreation
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-100 relative"
    >
      {/* Loading Overlay */}
      <LoadingOverlay isSubmitting={state.isSubmitting} />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <motion.button
            onClick={handleBackClick}
            className="mb-4 sm:mb-6 flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
            whileHover={{ x: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </motion.svg>
            <span>Back to Marketplace</span>
          </motion.button>

          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.h1
              className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              Submit Your Property Preference
            </motion.h1>
            <motion.p
              className="text-base sm:text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Tell us what you&apos;re looking for and we&apos;ll help you find
              the perfect match
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Preference Type Selector */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {renderPreferenceTypeSelector}
        </motion.div>

        {/* Step Progress */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <StepProgressIndicator
            steps={state.steps}
            currentStep={state.currentStep}
            onStepClick={handleStepClick}
          />
        </motion.div>

        {/* Form Content with Step Wrapper to preserve state */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-lg border"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
        >
          <div className="min-h-[80px]">
            {/* Step 0: Location */}
            <AnimatePresence mode="wait">
              <StepWrapper
                stepId="location"
                currentStep={state.currentStep}
                targetStep={0}
              >
                <motion.div
                  key="location"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LocationSelection />
                </motion.div>
              </StepWrapper>
            </AnimatePresence>

            {/* Step 1: Property Details & Budget */}
            <AnimatePresence mode="wait">
              <StepWrapper
                stepId="property-budget"
                currentStep={state.currentStep}
                targetStep={1}
              >
                <motion.div
                  key="property-budget"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <PropertyDetails preferenceType={selectedPreferenceType} />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <BudgetSelection preferenceType={selectedPreferenceType} />
                  </motion.div>
                </motion.div>
              </StepWrapper>
            </AnimatePresence>

            {/* Step 2: Features & Amenities */}
            <AnimatePresence mode="wait">
              <StepWrapper
                stepId="features"
                currentStep={state.currentStep}
                targetStep={2}
              >
                <motion.div
                  key="features"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FeatureSelection preferenceType={selectedPreferenceType} />
                  </motion.div>
                  {selectedPreferenceType === "shortlet" && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <DateSelection />
                    </motion.div>
                  )}
                </motion.div>
              </StepWrapper>
            </AnimatePresence>

            {/* Step 3: Contact */}
            <AnimatePresence mode="wait">
              <StepWrapper
                stepId="contact"
                currentStep={state.currentStep}
                targetStep={3}
              >
                <motion.div
                  key="contact"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContactInformation preferenceType={selectedPreferenceType} />
                </motion.div>
              </StepWrapper>
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SubmitButton onSubmit={handleSubmit} />
          </motion.div>
        </motion.div>

        {/* Debug Panel - Show current form data in development only */}
        {debugPanel}
      </div>

      {/* Success Modal */}
      <SuccessModal
        showSuccessModal={showSuccessModal}
        onSubmitNew={handleSubmitNew}
        onGoToMarketplace={handleGoToMarketplace}
      />
    </motion.div>
  );
};

// Main component with provider
const NewPreferencePage: React.FC = () => {
  return (
    <PreferenceFormProvider>
      <PreferenceFormContent />
    </PreferenceFormProvider>
  );
};

export default memo(NewPreferencePage);
