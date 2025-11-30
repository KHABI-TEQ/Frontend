"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import { extractNumericValue } from "@/utils/price-helpers";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import api from "@/utils/axiosConfig";

// Components
import Stepper from "@/components/post-property-components/Stepper";
import Step1BasicDetails from "@/components/post-property-components/Step1BasicDetails";
import Step3ImageUpload from "@/components/post-property-components/Step3ImageUpload";
import EnhancedPropertySummary from "@/components/post-property-components/EnhancedPropertySummary";
import AgreementModal from "@/components/post-property-components/AgreementModal";
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
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Breadcrumb from "@/components/extrals/Breadcrumb";

interface SharedUpdatePropertyFormProps {
  propertyType: "sell" | "rent" | "jv" | "shortlet";
  pageTitle: string;
  pageDescription: string;
}

// Simplified validation schemas for each step - only validate basic fields to avoid cross-step validation
const getValidationSchema = (currentStep: number, propertyData: any) => {
  switch (currentStep) {
    case 0:
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

    case 1:
      // Only validate step 2 specific fields
      return step2ValidationSchema(propertyData.propertyType);

    case 2:
      // No validation needed - handled by component
      return Yup.object({});

    case 3:
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
      // Step 0: Check basic required fields
      return checkStep1RequiredFields(propertyData);
    case 1:
      // Step 1: Check step 2 requirements
      return checkStep2RequiredFields(propertyData);
    case 2:
      // Step 2: Image validation
      return areImagesValid();
    case 3:
      // Step 3: Check step 4 requirements
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

const SharedUpdatePropertyForm: React.FC<SharedUpdatePropertyFormProps> = ({
  propertyType,
  pageTitle,
  pageDescription,
}) => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { user } = useUserContext();
  const {
    currentStep,
    setCurrentStep,
    propertyData,
    setPropertyData,
    images,
    setImages,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    setIsLoading,
    validateCurrentStep,
    resetForm,
    areImagesValid,
    showCommissionModal,
    setShowCommissionModal,
    showPropertySummary,
    setShowPropertySummary,
    getUserCommissionRate,
    getUserType,
    updatePropertyData,
  } = usePostPropertyContext();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch existing property data and validate property type match
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsInitialLoading(true);
        setLoadingError(null);

        const response = await api.get(`/account/properties/${propertyId}/getOne`);

        if (response.data && response.data.success) {
          const property = response.data.data;
          
          // Transform API response to property type
          const actualPropertyType = (property.briefType === "Outright Sales" ? "sell" :
                        property.briefType === "Rent" ? "rent" :
                        property.briefType === "Shortlet" ? "shortlet" :
                        property.briefType === "Joint Venture" ? "jv" : "sell") as "rent" | "shortlet" | "jv" | "sell";
          
          // Check if property type matches the route
          if (actualPropertyType !== propertyType) {
            // Redirect to the correct route for this property type
            const correctRoute = actualPropertyType === "sell" ? "outright-sales" : 
                                actualPropertyType === "jv" ? "joint-venture" : 
                                actualPropertyType;
            router.replace(`/update-property/${propertyId}/${correctRoute}`);
            return;
          }
          
          // Transform API response to match the form structure
          const transformedData = {
            propertyType: actualPropertyType,
            propertyCategory: (property.propertyType || "").replace(/^./, (c: string) => c.toUpperCase()),
            propertyCondition: (property.propertyCondition || "").replace(/^./, (c: string) => c.toUpperCase()),
            typeOfBuilding: property.typeOfBuilding || property.buildingType,
            rentalType: (property.rentalType || "").replace(/^./, (c: string) => c.toUpperCase()),
            leaseHold: property.leaseHold || "",
            holdDuration: property.holdDuration || "",
            shortletDuration: property.shortletDuration || "",
            state: property.location?.state ? { 
              value: property.location.state, 
              label: property.location.state 
            } : null,
            lga: property.location?.localGovernment ? { 
              value: property.location.localGovernment, 
              label: property.location.localGovernment 
            } : null,
            area: property.location?.area || "",
            streetAddress: property.location?.streetAddress || "",
            landSize: property.landSize?.size || "",
            measurementType: property.landSize?.measurementType || "",
            price: property.price?.toString() || "",
            bedrooms: parseInt(property.additionalFeatures?.noOfBedroom) || 0,
            bathrooms: parseInt(property.additionalFeatures?.noOfBathroom) || 0,
            toilets: parseInt(property.additionalFeatures?.noOfToilet) || 0,
            parkingSpaces: parseInt(property.additionalFeatures?.noOfCarPark) || 0,
            maxGuests: parseInt(property.additionalFeatures?.maxGuests) || 0,
            documents: property.docOnProperty?.map((doc: any) => doc.docName) || [],
            features: property.features || [],
            tenantCriteria: property.tenantCriteria || [],
            rentalConditions: property.tenantCriteria || [],
            employmentType: property.employmentType || "",
            tenantGenderPreference: property.tenantGenderPreference || "",
            jvConditions: property.jvConditions || [],
            contactInfo: {
              firstName: property.owner?.fullName?.split(' ')[0] || "",
              lastName: property.owner?.fullName?.split(' ').slice(1).join(' ') || "",
              email: property.owner?.email || "",
              phone: property.owner?.phoneNumber || "",
            },
            isLegalOwner: property.areYouTheOwner || false,
            ownershipDocuments: property.ownershipDocuments || [],
            isTenanted: property.isTenanted || "",
            description: property.description || "",
            additionalInfo: property.addtionalInfo || "",
            // Shortlet specific fields
            availability: property.availability || {
              minStay: 1,
              maxStay: undefined,
              calendar: "",
            },
            pricing: property.pricing || {
              nightly: 0,
              weeklyDiscount: 0,
              monthlyDiscount: 0,
              cleaningFee: 0,
              securityDeposit: 0,
              cancellationPolicy: "flexible",
            },
            houseRules: property.houseRules || {
              checkIn: "15:00",
              checkOut: "11:00",
              smoking: false,
              pets: false,
              parties: false,
              otherRules: "",
            },
            videos: property.videos || [],
          };

          // Update property data
          setPropertyData(transformedData);

          // Transform and set existing images
          if (property.pictures && property.pictures.length > 0) {
            const existingImages = property.pictures.map((url: string, index: number) => ({
              id: `existing-${index}`,
              file: null,
              preview: url,
              url: url,
              isUploading: false,
            }));
            setImages(existingImages);
          }

        } else {
          throw new Error(response.data?.message || "Failed to fetch property data");
        }
      } catch (error: any) {
        console.error("Error fetching property:", error);
        setLoadingError(error.response?.data?.message || error.message || "Failed to load property data");
        toast.error("Failed to load property data");
      } finally {
        setIsInitialLoading(false);
      }
    };

    // Only fetch from API when the post-property context has not been populated yet
    if (propertyId && user && (!propertyData || !propertyData.propertyType)) {
      fetchPropertyData();
    }
  }, [propertyId, user, setPropertyData, setImages, propertyType, router, propertyData]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
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
    toast.error("You need to be a landowner or agent to update properties");
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
    { label: "My Listings", href: "/my-listings" },
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
      const url = `${URLS.BASE}${URLS.accountPropertyBaseUrl}/${propertyId}/edit`;
      const response = await PUT_REQUEST(url, payload, Cookies.get("token"));
    
      if (response.success) {
        toast.success("Property updated successfully!");
        router.push("/my-listings");
      } else {
        const errorMessage =
          (response as any)?.data?.message || "Failed to update property";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("An error occurred while updating the property");
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

  // Show loading state
  if (!user || isInitialLoading) {
    return <Loading />;
  }

  // Show error state
  if (loadingError) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Property</h3>
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
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners"]}
      requireAgentOnboarding={true}
      requireAgentApproval={true}
      agentCustomMessage="You must complete onboarding and be approved before you can update properties."
    >
      <Preloader isVisible={isSubmitting} message="Updating Property..." />
      <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display mb-4">
              {pageTitle}
            </h1>
            <p className="text-[#5A5D63] text-sm md:text-lg max-w-2xl mx-auto px-4">
              {showPropertySummary
                ? "Review your updated property listing before submission"
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
            validationSchema={getValidationSchema(currentStep, propertyData)}
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
                          ? () => router.push("/my-listings")
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

          <AgreementModal
            open={showCommissionModal}
            onClose={() => setShowCommissionModal(false)}
            onAccept={() => {
              setShowCommissionModal(false);
              handleSubmit();
            }}
            textValue={"Agree and Update Property"}
            userName={`${user.firstName} ${user.lastName}`}
            userType={user?.userType === "Agent" ? "agent" : "landowner"}
          />

          {/* Success Modal */}
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            isUpdate={true}
          />
        </div>
      </div>
    </CombinedAuthGuard>
  );
};

export default SharedUpdatePropertyForm;
