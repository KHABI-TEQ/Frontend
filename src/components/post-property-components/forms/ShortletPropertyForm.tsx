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
import ShortletStep1BasicDetails from "@/components/post-property-components/steps/shortlet/ShortletStep1BasicDetails";
import ShortletStep2FeaturesConditions from "@/components/post-property-components/steps/shortlet/ShortletStep2FeaturesConditions";
import Step3ImageUpload from "@/components/post-property-components/Step3ImageUpload";
import EnhancedPropertySummary from "@/components/post-property-components/EnhancedPropertySummary";
import SuccessModal from "@/components/post-property-components/SuccessModal";
import Button from "@/components/general-components/button";
import Loading from "@/components/loading-component/loading";
import Preloader from "@/components/general-components/preloader";

// Import additional step components
import Step4OwnershipDeclaration from "@/components/post-property-components/Step4OwnershipDeclaration";

// Import step-specific validation schemas
import {
  step2ValidationSchema,
  step4ValidationSchema,
} from "@/utils/validation/post-property-validation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import AgreementModal from "@/components/post-property-components/AgreementModal";
import Breadcrumb from "@/components/extrals/Breadcrumb";

interface ShortletPropertyFormProps {
  pageTitle: string;
  pageDescription: string;
}

// Validation schemas for each step
const getValidationSchema = (currentStep: number, propertyData: Record<string, unknown>) => {
  switch (currentStep) {
    case 0:
      return Yup.object({});
    case 1:
      return Yup.object({
        propertyCategory: Yup.string().required("Property category is required"),
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
        shortletDuration: Yup.string().required("Shortlet duration is required"),
        typeOfBuilding: Yup.string().required("Building type is required"),
        bedrooms: Yup.number().required("Number of bedrooms is required"),
        streetAddress: Yup.string().required("Street address is required"),
        maxGuests: Yup.number().required("Maximum guests is required"),
      });
    case 2:
      return step2ValidationSchema("shortlet");
    case 3:
      return Yup.object({});
    case 4:
      return step4ValidationSchema();
    default:
      return Yup.object({});
  }
};

// Helper function to check if current step is valid
const isStepValid = (
  step: number,
  propertyData: any,
  areImagesValid: () => boolean,
) => {
  switch (step) {
    case 0:
      return checkShortletStep1RequiredFields(propertyData);
    case 1:
      return checkShortletStep2RequiredFields(propertyData);
    case 2:
      return areImagesValid();
    case 3:
      return checkStep4RequiredFields(propertyData);
    default:
      return true;
  }
};

// Helper function to check step 1 required fields for shortlet
const checkShortletStep1RequiredFields = (propertyData: any) => {
  const requiredFields = [
    "propertyCategory",
    "state",
    "lga",
    "area",
    "price",
    "shortletDuration",
    "typeOfBuilding",
    "bedrooms",
    "streetAddress",
    "maxGuests",
  ];

  return requiredFields.every((field) => {
    const value = propertyData[field];
    if (field === "state" || field === "lga") {
      return value && value.value && value.value !== "";
    }
    return value && value !== "" && value !== 0;
  });
};

// Helper function to check step 2 required fields for shortlet
const checkShortletStep2RequiredFields = (propertyData: any) => {
  // For shortlet, check required pricing and house rules
  const pricing = propertyData.pricing;
  const houseRules = propertyData.houseRules;
  const availability = propertyData.availability;

  // Check required shortlet fields
  if (!availability?.minStay || availability.minStay < 1) return false;
  if (!pricing?.nightly || pricing.nightly <= 0) return false;
  if (!houseRules?.checkIn || houseRules.checkIn === "") return false;
  if (!houseRules?.checkOut || houseRules.checkOut === "") return false;

  return true;
};

// Helper function to check step 4 required fields
const checkStep4RequiredFields = (propertyData: any) => {
  return propertyData.isLegalOwner !== undefined;
};


const ShortletPropertyForm: React.FC<ShortletPropertyFormProps> = ({
  pageTitle,
  pageDescription,
}) => {
  const router = useRouter();
  const { user } = useUserContext();
  const {
    currentStep,
    setCurrentStep,
    propertyData,
    images,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    resetForm,
    areImagesValid,
    showCommissionModal,
    setShowCommissionModal,
    showPropertySummary,
    setShowPropertySummary,
    updatePropertyData,
  } = usePostPropertyContext();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Set property type on component mount
  useEffect(() => {
    updatePropertyData("initializePropertyType", "shortlet");
  }, [updatePropertyData]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
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

    if (user.userType === "Landowners") {
      return;
    }

    if (user.userType === "Agent") {
      return;
    }

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
    let isCurrentStepValid = false;

    switch (currentStep) {
      case 0:
        isCurrentStepValid = checkShortletStep1RequiredFields(propertyData);
        break;
      case 1:
        isCurrentStepValid = checkShortletStep2RequiredFields(propertyData);
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
          "shortletDuration",
          "typeOfBuilding",
          "bedrooms",
          "streetAddress",
          "maxGuests",
        ];
        step1Fields.forEach((field) => setFieldTouched(field, true));
      } else if (currentStep === 1) {
        setFieldTouched("availability.minStay", true);
        setFieldTouched("pricing.nightly", true);
        setFieldTouched("houseRules.checkIn", true);
        setFieldTouched("houseRules.checkOut", true);
      } else if (currentStep === 3) {
        setFieldTouched("isLegalOwner", true);
      }
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } else {
      setShowPropertySummary(true);
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

      const uploadedImageUrls: string[] = images
        .filter((img) => img.url)
        .map((img) => img.url!);

      const uploadedVideoUrls: string[] = [];
      if (propertyData.videos && propertyData.videos.length > 0) {
        const video = propertyData.videos[0];
        if (video.url) {
          uploadedVideoUrls.push(video.url);
        }
      }

      const payload = {
        propertyType: "shortlet",
        propertyCategory: propertyData.propertyCategory,
        propertyCondition: propertyData.propertyCondition,
        typeOfBuilding: propertyData.typeOfBuilding,
        shortletDuration: propertyData.shortletDuration,
        features: propertyData.features,
        docOnProperty: [],
        location: {
          state: propertyData.state?.value || "",
          localGovernment: propertyData.lga?.value || "",
          area: propertyData.area,
          streetAddress: propertyData.streetAddress,
        },
        price: extractNumericValue(propertyData.price),
        areYouTheOwner: propertyData.isLegalOwner,
        ownershipDocuments: propertyData.ownershipDocuments || [],
        landSize: {
          measurementType: "",
          size: "",
        },
        briefType: "Shortlet",
        additionalFeatures: {
          noOfBedroom: propertyData.bedrooms?.toString() || "0",
          noOfBathroom: propertyData.bathrooms?.toString() || "0",
          noOfToilet: propertyData.toilets?.toString() || "0",
          noOfCarPark: propertyData.parkingSpaces?.toString() || "0",
          maxGuests: propertyData.maxGuests?.toString() || "1",
        },
        description: propertyData.description,
        addtionalInfo: propertyData.additionalInfo,
        pictures: uploadedImageUrls,
        videos: uploadedVideoUrls,
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

      const response = await POST_REQUEST(
        `${URLS.BASE}${URLS.accountPropertyBaseUrl}/create`,
        payload,
        Cookies.get("token"),
      );

      if (response.success) {
        toast.success("Shortlet property created successfully!");
        resetForm();
        setShowSuccessModal(true);
      } else {
        const errorMessage =
          (response as any)?.error || "Failed to submit property";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.log(error, "form error");
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
        return <ShortletStep1BasicDetails />;
      case 1:
        return <ShortletStep2FeaturesConditions />;
      case 2:
        return <Step3ImageUpload />;
      case 3:
        return <Step4OwnershipDeclaration />;
      default:
        return <ShortletStep1BasicDetails />;
    }
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireActiveSubscription={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <Preloader isVisible={isSubmitting} message="Submitting Property..." />
      <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display mb-4">
              {pageTitle}
            </h1>
            <p className="text-[#5A5D63] text-sm md:text-lg max-w-2xl mx-auto px-4">
              {showPropertySummary
                ? "Review your shortlet property listing before submission"
                : showCommissionModal
                  ? "Review and accept the commission terms"
                  : pageDescription}
            </p>
          </div>

          {!showPropertySummary && !showCommissionModal && (
            <div className="mb-6 md:mb-8 overflow-x-auto">
              <Stepper steps={steps} />
            </div>
          )}

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
            }) => (
              <Form>
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6 md:mb-8">
                  {renderCurrentStep()}
                </div>

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

                    <div className="flex md:hidden justify-center">
                      <span className="text-sm text-[#5A5D63] font-medium">
                        Step {currentStep + 1} of {steps.length}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
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

          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </div>
    </CombinedAuthGuard>
  );
};

export default ShortletPropertyForm;
