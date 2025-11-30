/** @format */

"use client";
import React, { useState, useCallback, useMemo, memo, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/axiosConfig";
import { toast } from "react-hot-toast";
import {
  PreferenceFormProvider,
  usePreferenceForm,
} from "@/context/preference-form-context";
import OptimizedLocationSelection from "@/components/preference-form/OptimizedLocationSelection";
import OptimizedBudgetSelection from "@/components/preference-form/OptimizedBudgetSelection";
import FeatureSelection from "@/components/preference-form/FeatureSelection";
import PropertyDetails from "@/components/preference-form/PropertyDetails";
import DateSelection from "@/components/preference-form/DateSelection";
import OptimizedContactInformation from "@/components/preference-form/OptimizedContactInformation";
import JointVenturePreferenceForm from "@/components/preference-form/joint-venture/JointVenturePreferenceForm";
import SubmitButton from "@/components/preference-form/SubmitButton";
import OptimizedStepWrapper from "@/components/preference-form/OptimizedStepWrapper";
import {
  PreferencePayload,
  BuyPreferencePayload,
  RentPreferencePayload,
  JointVenturePreferencePayload,
  ShortletPreferencePayload,
} from "@/types/preference-form";
import Loading from "@/components/loading-component/loading";

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
                Updating Your Preference
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your update...
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
    onGoToMarketplace,
  }: {
    showSuccessModal: boolean;
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
                  Preference Updated Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your property preference has been updated successfully. We&apos;ll
                  continue matching you with suitable properties based on your updated criteria.
                </p>
              </div>

              {/* Go to Marketplace Button */}
              <button
                onClick={onGoToMarketplace}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Go to Market Place
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
      className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left ${
        isSelected
          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 lg:mb-3">
        {config.icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
        <span className="block lg:hidden">{config.shortLabel}</span>
        <span className="hidden lg:block">{config.label}</span>
      </h3>
      <p className="text-xs sm:text-xs lg:text-sm text-gray-600 hidden sm:block">
        {config.description}
      </p>
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
const UpdatePreferenceFormContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const buyerId = params?.buyerId as string;
  const preferenceId = params?.preferenceId as string;
  
  const { state, updateFormData, resetForm, goToStep, dispatch, isFormValid } =
    usePreferenceForm();

  const [selectedPreferenceType, setSelectedPreferenceType] =
    useState<keyof typeof PREFERENCE_CONFIGS>("buy");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Fetch existing preference data
  useEffect(() => {
    const fetchPreferenceData = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);

        const response = await api.get(`/preferences/getByBuyer/${buyerId}/${preferenceId}`);

        if (response.data && response.data.success) {
          const preferenceData = response.data.data;
          
          // Determine preference type from the data
          const preferenceType = preferenceData.preferenceType || "buy";
          setSelectedPreferenceType(preferenceType as keyof typeof PREFERENCE_CONFIGS);

          // Transform the API response to match the form structure
          const formData = {
            preferenceType: preferenceData.preferenceType,
            location: {
              state: preferenceData.location?.state || "",
              lgas: preferenceData.location?.localGovernmentAreas || [],
              areas: preferenceData.location?.areas || [],
              customLocation: preferenceData.location?.customLocation || "",
            },
            enhancedLocation: {
              lgasWithAreas: preferenceData.location?.lgasWithAreas || [],
              customLocation: preferenceData.location?.customLocation || "",
            },
            budget: {
              minPrice: preferenceData.budget?.minPrice || 0,
              maxPrice: preferenceData.budget?.maxPrice || 0,
              currency: preferenceData.budget?.currency || "NGN",
            },
            features: {
              basicFeatures: preferenceData.features?.baseFeatures || [],
              premiumFeatures: preferenceData.features?.premiumFeatures || [],
              autoAdjustToBudget: preferenceData.features?.autoAdjustToFeatures || false,
            },
            contactInfo: preferenceData.contactInfo || {},
            propertyDetails: preferenceData.propertyDetails || preferenceData.developmentDetails || preferenceData.bookingDetails || {},
            nearbyLandmark: preferenceData.nearbyLandmark || "",
            additionalNotes: preferenceData.additionalNotes || "",
          };

          // Update form data
          updateFormData(formData, true);
          
        } else {
          throw new Error(response.data?.message || "Failed to fetch preference data");
        }
      } catch (error: any) {
        console.error("Error fetching preference:", error);
        setLoadingError(error.response?.data?.message || error.message || "Failed to load preference data");
        toast.error("Failed to load preference data");
      } finally {
        setIsLoading(false);
      }
    };

    if (buyerId && preferenceId) {
      fetchPreferenceData();
    }
  }, [buyerId, preferenceId, updateFormData]);

  // Handle preference type change - memoized to prevent recreation
  const handlePreferenceTypeChange = useCallback(
    (preferenceKey: keyof typeof PREFERENCE_CONFIGS) => {
      // Only proceed if actually changing preference type
      if (preferenceKey === selectedPreferenceType) return;

      setSelectedPreferenceType(preferenceKey);

      // Reset form data immediately without confirmation only when switching tabs
      dispatch({ type: "RESET_FORM" });

      // Use immediate updates for step changes
      setTimeout(() => {
        // Set the new preference type with immediate flag
        updateFormData(
          {
            preferenceType: PREFERENCE_CONFIGS[preferenceKey].preferenceType,
          },
          true,
        );
        // Reset to first step
        goToStep(0);
      }, 50);
    },
    [dispatch, updateFormData, goToStep, selectedPreferenceType],
  );

  // Generate API payload with filtering - memoized to prevent recreation
  const generatePayload = useCallback((): PreferencePayload => {
    const { formData } = state;

    const config = PREFERENCE_CONFIGS[selectedPreferenceType];

    const basePayload = {
  preferenceType: config.preferenceType,
  preferenceMode: config.preferenceMode,
  location: {
    state: formData.location?.state || "",
    localGovernmentAreas:
      formData.location?.lgas?.filter((lga) => lga.trim() !== "") || [],
    lgasWithAreas: (
      (formData as any).enhancedLocation?.lgasWithAreas ||
      // ✅ Fallback: create lgasWithAreas structure from legacy data
      (formData.location?.lgas || []).map((lga: string) => ({
        lgaName: lga,
        areas: [],
      }))
    )
      // ✅ Remove only _id field from each LGA
      .map(({ _id, ...rest }: any) => rest)
      .filter((item: any) => item.lgaName?.trim() !== ""),
    customLocation: formData.location?.customLocation?.trim() || "",
  },
  budget: {
    minPrice: formData.budget?.minPrice || 0,
    maxPrice: formData.budget?.maxPrice || 0,
    currency: "NGN" as const,
  },
  features: {
    baseFeatures:
      formData.features?.basicFeatures?.filter(
        (feature) => feature.trim() !== "",
      ) || [],
    premiumFeatures:
      formData.features?.premiumFeatures?.filter(
        (feature) => feature.trim() !== "",
      ) || [],
    autoAdjustToFeatures: formData.features?.autoAdjustToBudget || false,
  },
};


    // Helper function to remove empty/null/undefined values
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj
          .filter((item) => item !== null && item !== undefined && item !== "")
          .map(cleanObject);
      }
      if (obj !== null && typeof obj === "object") {
        const cleaned: any = {};
        Object.keys(obj).forEach((key) => {
          const value = cleanObject(obj[key]);
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === "object" && Object.keys(value).length === 0)
          ) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      }
      return obj;
    };

    switch (selectedPreferenceType) {
      case "buy": {
        const buyData = formData as any;
        const buyPayload = {
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
            documentTypes:
              buyData.propertyDetails?.documentTypes?.filter(
                (doc: string) => doc.trim() !== "",
              ) || [],
            landConditions:
              buyData.propertyDetails?.landConditions?.filter(
                (condition: string) => condition.trim() !== "",
              ) || [],
          },
          contactInfo: {
            fullName: buyData.contactInfo?.fullName?.trim() || "",
            email: buyData.contactInfo?.email?.trim() || "",
            phoneNumber: buyData.contactInfo?.phoneNumber?.trim() || "",
          },
          nearbyLandmark: (
            buyData.propertyDetails?.nearbyLandmark ||
            buyData.nearbyLandmark ||
            ""
          ).trim(),
          additionalNotes: (buyData.additionalNotes || "").trim(),
        };
        return cleanObject(buyPayload) as BuyPreferencePayload;
      }

      case "rent": {
        const rentData = formData as any;
        const rentPayload = {
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
            documentTypes:
              rentData.propertyDetails?.documentTypes?.filter(
                (doc: string) => doc.trim() !== "",
              ) || [],
            landConditions:
              rentData.propertyDetails?.landConditions?.filter(
                (condition: string) => condition.trim() !== "",
              ) || [],
          },
          contactInfo: {
            fullName: rentData.contactInfo?.fullName?.trim() || "",
            email: rentData.contactInfo?.email?.trim() || "",
            phoneNumber: rentData.contactInfo?.phoneNumber?.trim() || "",
          },
          nearbyLandmark: (
            rentData.propertyDetails?.nearbyLandmark ||
            rentData.nearbyLandmark ||
            ""
          ).trim(),
          additionalNotes: (rentData.additionalNotes || "").trim(),
        };
        return cleanObject(rentPayload) as RentPreferencePayload;
      }

      case "joint-venture": {
        const jvData = formData as any;
        const jvPayload = {
          ...basePayload,
          preferenceType: "joint-venture",
          preferenceMode: "developer",
          developmentDetails: {
            // Land requirements from step 3
            minLandSize: (jvData.developmentDetails?.minLandSize || "").trim(),
            maxLandSize: (jvData.developmentDetails?.maxLandSize || "").trim(),
            measurementUnit: (jvData.developmentDetails?.measurementUnit || "").trim(),

            // Development types from step 2
            developmentTypes: jvData.developmentDetails?.developmentTypes || [],

            // JV terms from step 4
            preferredSharingRatio: (jvData.developmentDetails?.preferredSharingRatio || "").trim(),
            proposalDetails: (jvData.developmentDetails?.proposalDetails || "").trim(),

            // Title requirements from step 5
            minimumTitleRequirements: jvData.developmentDetails?.minimumTitleRequirements || [],
            willingToConsiderPendingTitle: jvData.developmentDetails?.willingToConsiderPendingTitle || false,
            additionalRequirements: (jvData.developmentDetails?.additionalRequirements || "").trim(),
          },
          contactInfo: {
            // Developer info from step 1
            fullName: (jvData.contactInfo?.fullName || "").trim(),
            email: (jvData.contactInfo?.email || "").trim(),
            phoneNumber: (jvData.contactInfo?.phoneNumber || "").trim(),
          },
        };
        return cleanObject(jvPayload) as JointVenturePreferencePayload;
      }

      case "shortlet": {
        const shortletData = formData as any;
        const shortletPayload = {
          ...basePayload,
          preferenceType: "shortlet",
          preferenceMode: "shortlet",
          bookingDetails: {
            propertyType: (
              shortletData.propertyDetails?.propertyType ||
              shortletData.bookingDetails?.propertyType ||
              ""
            ).trim(),
            buildingType: (
              shortletData.propertyDetails?.buildingType || ""
            ).trim(),
            minBedrooms: (
              shortletData.propertyDetails?.bedrooms ||
              shortletData.bookingDetails?.minBedrooms ||
              ""
            )
              .toString()
              .trim(),
            minBathrooms:
              shortletData.propertyDetails?.bathrooms ||
              shortletData.bookingDetails?.minBathrooms ||
              0,
            numberOfGuests:
              shortletData.propertyDetails?.maxGuests ||
              shortletData.bookingDetails?.numberOfGuests ||
              0,
            checkInDate: (
              shortletData.bookingDetails?.checkInDate || ""
            ).trim(),
            checkOutDate: (
              shortletData.bookingDetails?.checkOutDate || ""
            ).trim(),
            travelType: (
              shortletData.propertyDetails?.travelType ||
              shortletData.bookingDetails?.travelType ||
              ""
            ).trim(),
            preferredCheckInTime: (
              shortletData.contactInfo?.preferredCheckInTime || ""
            ).trim(),
            preferredCheckOutTime: (
              shortletData.contactInfo?.preferredCheckOutTime || ""
            ).trim(),
            propertyCondition: (
              shortletData.propertyDetails?.propertyCondition || ""
            ).trim(),
            purpose: (shortletData.propertyDetails?.purpose || "").trim(),
            landSize: (shortletData.propertyDetails?.landSize || "").trim(),
            measurementUnit: (
              shortletData.propertyDetails?.measurementUnit || ""
            ).trim(),
            documentTypes:
              shortletData.propertyDetails?.documentTypes?.filter(
                (doc: string) => doc.trim() !== "",
              ) || [],
            landConditions:
              shortletData.propertyDetails?.landConditions?.filter(
                (condition: string) => condition.trim() !== "",
              ) || [],
          },
          contactInfo: {
            fullName: (shortletData.contactInfo?.fullName || "").trim(),
            email: (shortletData.contactInfo?.email || "").trim(),
            phoneNumber: (shortletData.contactInfo?.phoneNumber || "").trim(),
            petsAllowed: shortletData.contactInfo?.petsAllowed || false,
            smokingAllowed: shortletData.contactInfo?.smokingAllowed || false,
            partiesAllowed: shortletData.contactInfo?.partiesAllowed || false,
            additionalRequests: (
              shortletData.contactInfo?.additionalRequests || ""
            ).trim(),
            maxBudgetPerNight: shortletData.contactInfo?.maxBudgetPerNight || 0,
            willingToPayExtra:
              shortletData.contactInfo?.willingToPayExtra || false,
            cleaningFeeBudget: shortletData.contactInfo?.cleaningFeeBudget || 0,
            securityDepositBudget:
              shortletData.contactInfo?.securityDepositBudget || 0,
            cancellationPolicy: (
              shortletData.contactInfo?.cancellationPolicy || ""
            ).trim(),
          },
          nearbyLandmark: (
            shortletData.propertyDetails?.nearbyLandmark ||
            shortletData.nearbyLandmark ||
            ""
          ).trim(),
          additionalNotes: (shortletData.additionalNotes || "").trim(),
        };
        return cleanObject(shortletPayload) as ShortletPreferencePayload;
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
        console.log("Generated Update Payload:", JSON.stringify(payload, null, 2));
      }

      const response = await api.put(`/preferences/update/${buyerId}/${preferenceId}`, payload);

      if (response.status === 200 || response.status === 201) {
        console.log("Preference updated successfully:", response);
        toast.success("Preference updated successfully!");
        // Show success modal
        setShowSuccessModal(true);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update preference. Please try again.");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [generatePayload, dispatch, isFormValid, preferenceId]);

  // Handle go to marketplace - memoized to prevent recreation
  const handleGoToMarketplace = useCallback(() => {
    setShowSuccessModal(false);
    router.push("/market-place");
  }, [router]);

  // Render preference type selector - memoized to prevent recreation
  const renderPreferenceTypeSelector = useMemo(
    () => (
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Update Your Preference Type
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Change the type of property transaction you&apos;re interested in
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
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

  // Show loading state
  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Preference</h3>
            <p className="text-gray-600 mb-6">{loadingError}</p>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <span>Back</span>
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
              Update Your {PREFERENCE_CONFIGS[selectedPreferenceType].label}
            </motion.h1>
            <motion.p
              className="text-base sm:text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Revise your preferences to get better matches
            </motion.p>
          </motion.div>
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

        {/* Form Content with Enhanced Mobile-Responsive Step Wrapper */}
        <motion.div
          className="bg-white rounded-xl p-3 sm:p-6 shadow-lg border"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
        >
          <div className="min-h-[400px] sm:min-h-[300px]">
            {/* Joint Venture Form - 5 steps */}
            {selectedPreferenceType === "joint-venture" ? (
              <JointVenturePreferenceForm />
            ) : (
              <>
                {/* Step 0: Location */}
                <OptimizedStepWrapper
                  stepId="location"
                  currentStep={state.currentStep}
                  targetStep={0}
                >
                  <OptimizedLocationSelection />
                </OptimizedStepWrapper>

                {/* Step 1: Property Details & Budget */}
                <OptimizedStepWrapper
                  stepId="property-budget"
                  currentStep={state.currentStep}
                  targetStep={1}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="space-y-6 sm:space-y-8">
                    <PropertyDetails preferenceType={selectedPreferenceType} />
                    <OptimizedBudgetSelection
                      preferenceType={selectedPreferenceType}
                    />
                  </div>
                </OptimizedStepWrapper>

                {/* Step 2: Features & Amenities */}
                <OptimizedStepWrapper
                  stepId="features"
                  currentStep={state.currentStep}
                  targetStep={2}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="space-y-6 sm:space-y-8">
                    <FeatureSelection preferenceType={selectedPreferenceType} />
                    {selectedPreferenceType === "shortlet" && <DateSelection />}
                  </div>
                </OptimizedStepWrapper>

                {/* Step 3: Contact */}
                <OptimizedStepWrapper
                  stepId="contact"
                  currentStep={state.currentStep}
                  targetStep={3}
                >
                  <OptimizedContactInformation
                    preferenceType={selectedPreferenceType}
                  />
                </OptimizedStepWrapper>
              </>
            )}
          </div>

          {/* Submit Button */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SubmitButton onSubmit={handleSubmit} buttonText="Update Preference" />
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        showSuccessModal={showSuccessModal}
        onGoToMarketplace={handleGoToMarketplace}
      />
    </motion.div>
  );
};

// Main component with provider
const UpdatePreferencePage: React.FC = () => {
  return (
    <PreferenceFormProvider>
      <UpdatePreferenceFormContent />
    </PreferenceFormProvider>
  );
};

export default memo(UpdatePreferencePage);
