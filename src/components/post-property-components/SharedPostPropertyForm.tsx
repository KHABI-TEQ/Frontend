"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import { POST_REQUEST } from "@/utils/requests";
import { extractNumericValue } from "@/utils/price-helpers";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Components
import Stepper from "@/components/post-property-components/Stepper";
import Step1BasicDetails from "@/components/post-property-components/Step1BasicDetails";
import Step3ImageUpload from "@/components/post-property-components/Step3ImageUpload";
import EnhancedPropertySummary from "@/components/post-property-components/EnhancedPropertySummary";
import SuccessModal from "@/components/post-property-components/SuccessModal";
import Button from "@/components/general-components/button";
import Loading from "@/components/loading-component/loading";
import Preloader from "@/components/general-components/preloader";

// Import additional step components
import Step2FeaturesConditions from "@/components/post-property-components/Step2FeaturesConditions";
import Step4OwnershipDeclaration from "@/components/post-property-components/Step4OwnershipDeclaration";

// Import step-specific validation schemas
import {
  step2ValidationSchema,
  step4ValidationSchema,
} from "@/utils/validation/post-property-validation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import AgreementModal from "@/components/post-property-components/AgreementModal";
import Breadcrumb from "@/components/extrals/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decrementFeature, selectShowCommissionFee, selectFeatureEntry } from "@/store/subscriptionFeaturesSlice";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";

interface SharedPostPropertyFormProps {
  propertyType: "sell" | "rent" | "jv" | "shortlet";
  pageTitle: string;
  pageDescription: string;
}

// Simplified validation schemas for each step - only validate basic fields to avoid cross-step validation
const getValidationSchema = (currentStep: number, propertyData: Record<string, unknown>) => {
  switch (currentStep) {
    case 0:
      // Step 0 is handled differently now - property type is pre-set
      return Yup.object({});

    case 1:
      // Only validate basic step 1 fields to avoid validating other steps
      return Yup.object({
        propertyCategory: Yup.string().required(
          "Property category is required",
        ),
        state: Yup.object({
          value: Yup.string().required(),
          label: Yup.string().required(),
        }).required("State is required"),
        lga: Yup.object({
          value: Yup.string().required(),
          label: Yup.string().required(),
        }).required("Local Government is required"),
        area: Yup.string().required("Area is required"),
        price: Yup.string().required("Price is required"),
      });

    case 2:
      // Only validate step 2 specific fields
      return step2ValidationSchema(propertyData.propertyType as string);

    case 3:
      // No validation needed - handled by component
      return Yup.object({});

    case 4:
      // Only validate step 4 fields
      return step4ValidationSchema();

    default:
      return Yup.object({});
  }
};

// Helper function to check if current step is valid using Formik validation
const isStepValid = (
  step: number,
  propertyData: any,
  areImagesValid: () => boolean,
  formikErrors: any,
  formikTouched: any,
) => {
  switch (step) {
    case 0:
      return !!propertyData.propertyType;
    case 1:
      // Step 1: Check basic required fields
      return checkStep1RequiredFields(propertyData);
    case 2:
      // Step 2: Check step 2 requirements
      return checkStep2RequiredFields(propertyData);
    case 3:
      // Step 3: Image validation
      return areImagesValid();
    case 4:
      // Step 4: Check step 4 requirements
      return checkStep4RequiredFields(propertyData);
    default:
      return true;
  }
};

// Helper function to check step 1 required fields
const checkStep1RequiredFields = (propertyData: any) => {
  // Basic required fields for all property types
  const requiredFields = ["propertyCategory", "state", "lga", "area", "price"];

  // Add conditional required fields based on property type and category
    if (propertyData.propertyType === "rent") {
    requiredFields.push("rentalType");
    if (propertyData.propertyCategory !== "Land") {
      requiredFields.push("propertyCondition", "typeOfBuilding", "bedrooms");
    }
    // Commercial rent needs land size
    if (propertyData.propertyCategory === "Commercial") {
      requiredFields.push("measurementType", "landSize");
    }
    // Land rental properties require lease hold if rental type is "Lease"
    if (propertyData.propertyCategory === "Land" && propertyData.rentalType === "Lease") {
      requiredFields.push("leaseHold");
    }
  }

  if (propertyData.propertyType === "shortlet") {
    requiredFields.push(
      "shortletDuration",
      "propertyCondition",
      "typeOfBuilding",
      "bedrooms",
      "streetAddress",
      "maxGuests",
    );
    // Shortlet properties do not require land size and measurement type
  }

  if (propertyData.propertyType === "jv") {
    // JV ALWAYS requires land size for ALL property categories
    // JV does NOT require property condition, building type, or bedrooms for ANY category
    requiredFields.push("measurementType", "landSize");
  }

  if (propertyData.propertyType === "sell") {
    if (propertyData.propertyCategory !== "Land") {
      requiredFields.push("propertyCondition", "typeOfBuilding", "bedrooms");
    }
    requiredFields.push("measurementType", "landSize");
  }

  // Additional validation: Land size is required for:
  // - All Sell properties
  // - All JV properties (already handled above)
  // - Commercial Rent properties (already handled above)
  // - Land category for all property types EXCEPT shortlet
  if (propertyData.propertyCategory === "Land" && propertyData.propertyType !== "shortlet") {
    if (!requiredFields.includes("measurementType"))
      requiredFields.push("measurementType");
    if (!requiredFields.includes("landSize")) requiredFields.push("landSize");
  }

  return requiredFields.every((field) => {
    const value = propertyData[field];
    if (field === "state" || field === "lga") {
      return value && value.value && value.value !== "";
    }
    return value && value !== "" && value !== 0;
  });
};

// Helper function to check step 2 required fields
const checkStep2RequiredFields = (propertyData: any) => {
  // isTenanted is required for all property types
  if (!propertyData.isTenanted || propertyData.isTenanted === "") {
    return false;
  }

  // Documents are required for sell and jv types
  if (
    propertyData.propertyType === "sell" ||
    propertyData.propertyType === "jv"
  ) {
    const hasDocuments =
      propertyData.documents && propertyData.documents.length > 0;
    if (!hasDocuments) return false;
  }

  // JV conditions are required for joint venture
  if (propertyData.propertyType === "jv") {
    const hasJvConditions =
      propertyData.jvConditions && propertyData.jvConditions.length > 0;
    if (!hasJvConditions) return false;
  }

  // For shortlet, check required pricing and house rules
  if (propertyData.propertyType === "shortlet") {
    const pricing = propertyData.pricing;
    const houseRules = propertyData.houseRules;
    const availability = propertyData.availability;

    // Check required shortlet fields
    if (!availability?.minStay || availability.minStay < 1) return false;
    if (!pricing?.nightly || pricing.nightly <= 0) return false;
    if (!houseRules?.checkIn || houseRules.checkIn === "") return false;
    if (!houseRules?.checkOut || houseRules.checkOut === "") return false;
  }

  return true;
};

// Helper function to check step 4 required fields
const checkStep4RequiredFields = (propertyData: any) => {
  const contactInfo = propertyData.contactInfo;
  return (
    !!(
      contactInfo.firstName &&
      contactInfo.lastName &&
      contactInfo.email &&
      contactInfo.phone
    ) && propertyData.isLegalOwner !== undefined
  );
};

const SharedPostPropertyForm: React.FC<SharedPostPropertyFormProps> = ({
  propertyType,
  pageTitle,
  pageDescription,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const showCommissionFee = useAppSelector(selectShowCommissionFee);
  const { user } = useUserContext();
  const {
    currentStep,
    setCurrentStep,
    propertyData,
    images,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    validateCurrentStep,
    resetForm,
    areImagesValid,
    showCommissionModal,
    setShowCommissionModal,
    showPropertySummary,
    setShowPropertySummary,
    getUserType,
    updatePropertyData,
  } = usePostPropertyContext();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const listingsEntry = useAppSelector(selectFeatureEntry(FEATURE_KEYS.LISTINGS));
  const quotaText = listingsEntry
    ? (listingsEntry.type === 'unlimited' || listingsEntry.remaining === -1)
      ? 'Unlimited'
      : (listingsEntry.type === 'count')
        ? `${Math.max(0, Number(listingsEntry.remaining || 0))} remaining`
        : (Number(listingsEntry.value) === 1 ? 'Enabled' : 'Disabled')
    : '—';

  // Set property type on component mount
  useEffect(() => {
    updatePropertyData("initializePropertyType", propertyType);
  }, [propertyType, updatePropertyData]);

  // Bridge Redux flag to summary component via window variable
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__khabiteq_no_commission__ = !showCommissionFee;
    }
  }, [showCommissionFee]);

  // Allow EnhancedPropertySummary to trigger submit directly when no commission
  useEffect(() => {
    const handler = () => handleSubmit();
    if (typeof window !== "undefined") {
      window.addEventListener("khabiteq:submit-property", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("khabiteq:submit-property", handler);
      }
    };
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);

    // Also scroll smoothly after a delay for late-loading content
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Allow Landowners to access directly
    if (user.userType === "Landowners") {
      return;
    }

    // For Agents, the AgentAccessBarrier will handle the onboarding and approval checks
    if (user.userType === "Agent") {
      return;
    }

    // User is neither landowner nor agent
    toast.error("You need to be a landowner or agent to post properties");
    router.push("/dashboard");
  }, [user, router]);

  const steps = [
    {
      label: "Basic Details",
      status:
        currentStep > 0
          ? "completed"
          : currentStep === 0
            ? "active"
            : "pending",
    },
    {
      label: "Features & Conditions",
      status:
        currentStep > 1
          ? "completed"
          : currentStep === 1
            ? "active"
            : "pending",
    },
    {
      label: "Upload Images",
      status:
        currentStep > 2
          ? "completed"
          : currentStep === 2
            ? "active"
            : "pending",
    },
    {
      label: "Owner Declaration",
      status:
        currentStep > 3
          ? "completed"
          : currentStep === 3
            ? "active"
            : "pending",
    },
  ] as { label: string; status: "completed" | "active" | "pending" }[];

  const handleNext = async (
    validateForm: () => Promise<any>,
    errors: any,
    setFieldTouched: (field: string, isTouched: boolean) => void,
  ) => {
    // Use step-specific validation instead of full form validation
    let isCurrentStepValid = false;

    switch (currentStep) {
      case 0:
        isCurrentStepValid = checkStep1RequiredFields(propertyData);
        break;
      case 1:
        isCurrentStepValid = checkStep2RequiredFields(propertyData);
        break;
      case 2:
        isCurrentStepValid = areImagesValid();
        break;
      case 3:
        isCurrentStepValid = checkStep4RequiredFields(propertyData);
        break;
      default:
        isCurrentStepValid = true;
    }

    if (!isCurrentStepValid) {
      // Mark relevant fields as touched to show validation errors
      if (currentStep === 0) {
        const step1Fields = [
          "propertyCategory",
          "state",
          "lga",
          "area",
          "price",
        ];
        step1Fields.forEach((field) => setFieldTouched(field, true));
      } else if (currentStep === 1) {
        setFieldTouched("isTenanted", true);
        if (
          propertyData.propertyType === "sell" ||
          propertyData.propertyType === "jv"
        ) {
          setFieldTouched("documents", true);
        }
        if (propertyData.propertyType === "jv") {
          setFieldTouched("jvConditions", true);
        }
      } else if (currentStep === 3) {
        setFieldTouched("contactInfo.firstName", true);
        setFieldTouched("contactInfo.lastName", true);
        setFieldTouched("contactInfo.email", true);
        setFieldTouched("contactInfo.phone", true);
        setFieldTouched("isLegalOwner", true);
      }
      return; // Don't proceed if validation fails
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } else {
      setShowPropertySummary(true);
      // Scroll to top when showing property summary
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handlePrevious = () => {
    if (showPropertySummary) {
      setShowPropertySummary(false);
    } else if (showCommissionModal) {
      setShowCommissionModal(false);
      setShowPropertySummary(true);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }

    // Scroll to top when navigating backwards
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: pageTitle },
  ];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // 1. Collect uploaded image URLs (images are auto-uploaded)
      const uploadedImageUrls: string[] = images
        .filter((img) => img.url)
        .map((img) => img.url!);

      // 2. Collect uploaded video URLs
      const uploadedVideoUrls: string[] = [];
      if (propertyData.videos && propertyData.videos.length > 0) {
        const video = propertyData.videos[0];
        if (video.url) {
          uploadedVideoUrls.push(video.url);
        }
      }

      // 3. Determine brief type
      let briefType = "";
      if (propertyData.propertyType === "sell") briefType = "Outright Sales";
      else if (propertyData.propertyType === "rent") briefType = "Rent";
      else if (propertyData.propertyType === "shortlet") briefType = "Shortlet";
      else if (propertyData.propertyType === "jv") briefType = "Joint Venture";

      // 4. Prepare property payload
      const payload = {
        propertyType: propertyData.propertyType,
        propertyCategory: propertyData.propertyCategory,
        propertyCondition: propertyData.propertyCondition,
        typeOfBuilding: propertyData.typeOfBuilding,
        rentalType: propertyData.rentalType,
        features: propertyData.features,
        docOnProperty: propertyData.documents.map((doc) => ({
          docName: doc,
          isProvided: true,
        })),
        location: {
          state: propertyData.state?.value || "",
          localGovernment: propertyData.lga?.value || "",
          area: propertyData.area,
          streetAddress: propertyData.streetAddress,
        },
        price: extractNumericValue(propertyData.price),
        leaseHold: propertyData.leaseHold,
        shortletDuration: propertyData.shortletDuration,
        owner: {
          fullName: `${propertyData.contactInfo.firstName} ${propertyData.contactInfo.lastName}`,
          phoneNumber: propertyData.contactInfo.phone,
          email: propertyData.contactInfo.email,
        },
        areYouTheOwner: propertyData.isLegalOwner,
        ownershipDocuments: propertyData.ownershipDocuments || [],
        landSize: {
          measurementType: propertyData.propertyType === "shortlet" ? "" : propertyData.measurementType,
          size: propertyData.propertyType === "shortlet" ? "" : propertyData.landSize,
        },
        briefType: briefType,
        additionalFeatures: {
          noOfBedroom: propertyData.bedrooms.toString(),
          noOfBathroom: propertyData.bathrooms.toString(),
          noOfToilet: propertyData.toilets.toString(),
          noOfCarPark: propertyData.parkingSpaces.toString(),
          maxGuests: propertyData.maxGuests?.toString(),
        },
        tenantCriteria: propertyData.tenantCriteria,
        jvConditions: propertyData.jvConditions,
        description: propertyData.description,
        addtionalInfo: propertyData.additionalInfo,
        pictures: uploadedImageUrls,
        videos: uploadedVideoUrls,
        isTenanted: propertyData.isTenanted,
        holdDuration: propertyData.holdDuration,
        // Shortlet specific fields
        availability: propertyData.availability
          ? {
              minStay: propertyData.availability.minStay,
              maxStay: propertyData.availability.maxStay,
              calendar: propertyData.availability.calendar,
            }
          : undefined,
        pricing: propertyData.pricing
          ? {
              nightly: propertyData.pricing.nightly,
              weeklyDiscount: propertyData.pricing.weeklyDiscount,
              monthlyDiscount: propertyData.pricing.monthlyDiscount,
              cleaningFee: propertyData.pricing.cleaningFee,
              securityDeposit: propertyData.pricing.securityDeposit,
              cancellationPolicy: propertyData.pricing.cancellationPolicy,
            }
          : undefined,
        houseRules: propertyData.houseRules
          ? {
              checkIn: propertyData.houseRules.checkIn,
              checkOut: propertyData.houseRules.checkOut,
              smoking: propertyData.houseRules.smoking,
              pets: propertyData.houseRules.pets,
              parties: propertyData.houseRules.parties,
              otherRules: propertyData.houseRules.otherRules,
            }
          : undefined,
      };

      // 5. Submit to API
      const response = await POST_REQUEST(
        `${URLS.BASE}${URLS.accountPropertyBaseUrl}/create`,
        payload,
        Cookies.get("token"),
      );

      if (response.success) {
        toast.success("Property created successfully!");
        // Decrease LISTINGS usage on success
        dispatch(decrementFeature({ key: FEATURE_KEYS.LISTINGS, amount: 1 }));
        resetForm();
        setShowSuccessModal(true);
      } else {
        const errorMessage =
          (response as any)?.error || "Failed to submit property";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.log(error, "form error")
      toast.error("An error occurred while submitting the property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    if (showPropertySummary) {
      return <EnhancedPropertySummary />;
    }

    switch (currentStep) {
      case 0:
        return <Step1BasicDetails />;
      case 1:
        return <Step2FeaturesConditions />;
      case 2:
        return <Step3ImageUpload />;
      case 3:
        return <Step4OwnershipDeclaration />;
      default:
        return <Step1BasicDetails />;
    }
  };

  const getStepTitle = () => {
    if (showPropertySummary) return "Property Summary";
    if (showCommissionModal) return "Commission Agreement";
    return steps[currentStep]?.label || pageTitle;
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <CombinedAuthGuard
      requireAuth={true} // User must be logged in
      allowedUserTypes={["Agent", "Landowners"]} // Only these user types can access
      requireAgentOnboarding={true} // If an agent, require onboarding
      requireAgentApproval={true} // If an agent, require approval
      requireActiveSubscription={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <Preloader isVisible={isSubmitting} message="Submitting Property..." />
      <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display mb-2 md:mb-4">
              {pageTitle}
            </h1>
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-[#EEF1F1] text-[#09391C] text-xs md:text-sm px-3 py-1 font-medium">
                Listings quota: {quotaText}
              </span>
            </div>
            <p className="text-[#5A5D63] text-sm md:text-lg max-w-2xl mx-auto px-4">
              {showPropertySummary
                ? "Review your property listing before submission"
                : showCommissionModal
                  ? "Review and accept the commission terms"
                  : pageDescription}
            </p>
          </div>

          {/* Stepper */}
          {!showPropertySummary && !showCommissionModal && (
            <div className="mb-6 md:mb-8 overflow-x-auto">
              <Stepper steps={steps} />
            </div>
          )}

          {/* Main Content with Formik */}
          <Formik
            initialValues={propertyData}
            validationSchema={getValidationSchema(currentStep, propertyData as unknown as Record<string, unknown>)}
            onSubmit={() => {}}
            enableReinitialize
          >
            {({
              errors,
              touched,
              validateForm,
              setFieldTouched,
              isValid,
              isSubmitting: formikSubmitting,
            }) => (
              <Form>
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6 md:mb-8">
                  {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                {!showCommissionModal && !showPropertySummary && (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
                    <Button
                      type="button"
                      value={currentStep === 0 ? "Cancel" : "Previous"}
                      onClick={
                        currentStep === 0
                          ? () => router.push("/")
                          : handlePrevious
                      }
                      className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors"
                      isDisabled={isSubmitting}
                    />

                    {/* Step indicator - centered */}
                    <div className="flex md:hidden justify-center">
                      <span className="text-sm text-[#5A5D63] font-medium">
                        Step {currentStep + 1} of {steps.length}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                      {/* Desktop step indicator */}
                      <div className="hidden md:block">
                        <span className="text-sm text-[#5A5D63] font-medium">
                          Step {currentStep + 1} of {steps.length}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {currentStep === 3 && (
                          <Button
                            type="button"
                            value="Review Property"
                            onClick={() => setShowPropertySummary(true)}
                            className="w-full md:w-auto border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors"
                            isDisabled={isSubmitting}
                          />
                        )}
                        <Button
                          type="button"
                          value={currentStep === 3 ? "Complete" : "Next"}
                          onClick={() =>
                            handleNext(validateForm, errors, setFieldTouched)
                          }
                          className="w-full md:w-auto bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          isDisabled={
                            isSubmitting ||
                            isLoading ||
                            images.some((img) => img.isUploading) ||
                            (propertyData.videos &&
                              propertyData.videos.some(
                                (video) => video.isUploading,
                              )) ||
                            !isStepValid(
                              currentStep,
                              propertyData,
                              areImagesValid,
                              errors,
                              touched,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Form>
            )}
          </Formik>

          {/* Commission Modal */}
          <AgreementModal
            open={showCommissionModal}
            onClose={() => setShowCommissionModal(false)}
            onAccept={() => {
              setShowCommissionModal(false);
              handleSubmit();
            }}
            textValue={"Agree and Post Property"}
            userName={`${user.firstName} ${user.lastName}`}
            userType={user?.userType === "Agent" ? "agent" : "landowner"}
          />

          {/* Success Modal */}
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </div>
    </CombinedAuthGuard>
  );
};

export default SharedPostPropertyForm;
