"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import type { PropertyData } from "@/context/post-property-context";
import { POST_REQUEST, GET_REQUEST } from "@/utils/requests";
import { extractNumericValue } from "@/utils/price-helpers";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Components
import Stepper from "@/components/post-property-components/Stepper";
import Step0PropertyTypeSelection from "@/components/post-property-components/Step0PropertyTypeSelection";
import Step1BasicDetails from "@/components/post-property-components/Step1BasicDetails";
import Step3ImageUpload from "@/components/post-property-components/Step3ImageUpload";
import EnhancedPropertySummary from "@/components/post-property-components/EnhancedPropertySummary";
import PreferenceSuccessModal from "@/components/post-property-components/PreferenceSuccessModal";
import Button from "@/components/general-components/button";
import Loading from "@/components/loading-component/loading";
import Preloader from "@/components/general-components/preloader";

// Import additional step components
import Step2FeaturesConditions from "@/components/post-property-components/Step2FeaturesConditions";
import Step4OwnershipDeclaration from "@/components/post-property-components/Step4OwnershipDeclaration";
import CollapsibleBuyerRequirements from "@/components/post-property-components/CollapsibleBuyerRequirements";

// Import step-specific validation schemas
import {
  step2ValidationSchema,
  step4ValidationSchema,
} from "@/utils/validation/post-property-validation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import AgreementModal from "@/components/post-property-components/AgreementModal";
import Breadcrumb from "@/components/extrals/Breadcrumb";
import { useAppSelector } from "@/store/hooks";
import { selectFeatureEntry } from "@/store/subscriptionFeaturesSlice";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import FeatureGate from "@/components/access/FeatureGate";

// Preference interfaces
interface Buyer {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  id: string;
}

interface Location {
  state: string;
  localGovernmentAreas?: string[];
  lgasWithAreas?: Array<{
    lgaName: string;
    areas: string[];
    _id: string;
    id: string;
  }>;
}

interface Budget {
  minPrice: number;
  maxPrice: number;
  currency: string;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  willingToPayExtra?: boolean;
}

interface PropertyDetails {
  purpose?: string;
  propertyType?: string;
  buildingType?: string;
  minBedrooms?: string;
  minBathrooms?: number;
  propertyCondition?: string;
  landSize?: string;
  minLandSize?: string;
  maxLandSize?: string;
  measurementUnit?: string;
  documentTypes?: string[];
}

interface BookingDetails {
  propertyType?: string;
  minBedrooms?: string;
  minBathrooms?: number;
  numberOfGuests?: number;
  checkInDate?: string;
  checkOutDate?: string;
  travelType?: string;
  preferredCheckInTime?: string;
  preferredCheckOutTime?: string;
  landSize?: string;
  minLandSize?: string;
  maxLandSize?: string;
  measurementUnit?: string;
}

interface Features {
  baseFeatures?: string[];
  premiumFeatures?: string[];
  autoAdjustToFeatures?: boolean;
}

interface Preference {
  preferenceId: string;
  preferenceMode: string;
  preferenceType: string;
  location: Location;
  budget: Budget;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  features?: Features;
  status: string;
  createdAt: string;
  buyer: Buyer;
  contactInfo?: ContactInfo;
  nearbyLandmark?: string;
  additionalNotes?: string;
}

// Simplified validation schemas for each step - only validate basic fields to avoid cross-step validation
const getValidationSchema = (currentStep: number, propertyData: Record<string, unknown>) => {
  switch (currentStep) {
    case 0:
      return Yup.object({
        propertyType: Yup.string().required("Property type is required"),
      });

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
  // - Land category for all property types
  if (propertyData.propertyCategory === "Land") {
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

const PostPropertyByPreference = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserContext();
  const {
    currentStep,
    setCurrentStep,
    propertyData,
    updatePropertyData,
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
    getUserCommissionRate,
    getUserType,
  } = usePostPropertyContext();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const listingsEntry = useAppSelector(selectFeatureEntry(FEATURE_KEYS.AGENT_MARKETPLACE));

  const preferenceId = searchParams?.get('preferenceId');

  // Memoize the fetch function to prevent re-renders
  const fetchAndPopulatePreference = useCallback(async () => {
      if (!preferenceId) {
        setPreferenceError('Preference ID is required');
        setIsLoadingPreference(false);
        return;
      }

      try {
        const token = Cookies.get('token');
        const url = `${URLS.BASE}/preferences/${preferenceId}/getOne`;
        
        const response = await GET_REQUEST(url, token);

        if (response?.success && response?.data) {
          const data = response.data as any;
          const pref: Preference = {
            preferenceId: data._id || data.preferenceId,
            preferenceMode: data.preferenceMode,
            preferenceType: data.preferenceType,
            location: data.location,
            budget: data.budget,
            propertyDetails: data.propertyDetails,
            bookingDetails: data.bookingDetails,
            features: data.features,
            status: data.status,
            createdAt: data.createdAt,
            buyer: data.buyer,
            contactInfo: data.contactInfo,
            nearbyLandmark: data.nearbyLandmark,
            additionalNotes: data.additionalNotes,
          };
          setPreference(pref);
 
          // Auto-populate the form based on preference data
          const updatedData: Record<string, any> = {};

          // Set property type based on preference type
          if (pref.preferenceType === 'buy') {
            updatedData.propertyType = 'sell';
          } else if (pref.preferenceType === 'rent') {
            updatedData.propertyType = 'rent';
          } else if (pref.preferenceType === 'shortlet') {
            updatedData.propertyType = 'shortlet';
          }

          // Set location data
          if (pref.location?.state) {
            updatedData.state = {
              value: pref.location.state,
              label: pref.location.state
            };
          }

          // Set LGA from the first available LGA
          if (pref.location?.lgasWithAreas && pref.location.lgasWithAreas.length > 0) {
            const firstLga = pref.location.lgasWithAreas[0];
            updatedData.lga = {
              value: firstLga.lgaName,
              label: firstLga.lgaName
            };
            
            // Set area from the first available area
            if (firstLga.areas && firstLga.areas.length > 0) {
              updatedData.area = firstLga.areas[0];
            }
          } else if (pref.location?.localGovernmentAreas && pref.location.localGovernmentAreas.length > 0) {
            updatedData.lga = {
              value: pref.location.localGovernmentAreas[0],
              label: pref.location.localGovernmentAreas[0]
            };
          }

          // Set budget information - use the average of min and max
          if (pref.budget?.minPrice && pref.budget?.maxPrice) {
            const averagePrice = Math.round((pref.budget.minPrice + pref.budget.maxPrice) / 2);
            updatedData.price = averagePrice.toString();
          }

          // Set property details
          if (pref.propertyDetails) {
            if (pref.propertyDetails.propertyType) {
              updatedData.propertyCategory = pref.propertyDetails.propertyType;
            }
            if (pref.propertyDetails.buildingType) {
              updatedData.typeOfBuilding = pref.propertyDetails.buildingType;
            }
            if (pref.propertyDetails.minBedrooms) {
              updatedData.bedrooms = parseInt(pref.propertyDetails.minBedrooms) || 1;
            }
            if (pref.propertyDetails.minBathrooms) {
              updatedData.bathrooms = pref.propertyDetails.minBathrooms;
            }
            if (pref.propertyDetails.propertyCondition) {
              updatedData.propertyCondition = pref.propertyDetails.propertyCondition;
            }
            if (pref.propertyDetails.landSize && pref.propertyDetails.measurementUnit) {
              updatedData.landSize = parseInt(pref.propertyDetails.landSize) || 0;
              updatedData.measurementType = pref.propertyDetails.measurementUnit;
            }
            if (pref.propertyDetails.documentTypes && pref.propertyDetails.documentTypes.length > 0) {
              updatedData.documents = pref.propertyDetails.documentTypes;
            }
          }

          // Set booking details for shortlet
          if (pref.bookingDetails) {
            if (pref.bookingDetails.minBedrooms) {
              updatedData.bedrooms = parseInt(pref.bookingDetails.minBedrooms) || 1;
            }
            if (pref.bookingDetails.minBathrooms) {
              updatedData.bathrooms = pref.bookingDetails.minBathrooms;
            }
            if (pref.bookingDetails.numberOfGuests) {
              updatedData.maxGuests = pref.bookingDetails.numberOfGuests;
            }
          }

          // Set features
          if (pref.features) {
            const allFeatures = [
              ...(pref.features.baseFeatures || []),
              ...(pref.features.premiumFeatures || [])
            ];
            if (allFeatures.length > 0) {
              updatedData.features = allFeatures;
            }
          }

          // Set buyer contact information
          if (pref.buyer) {
            const fullName = pref.buyer.fullName || '';
            const [first, ...rest] = fullName.split(' ').filter(Boolean);
            updatedData.contactInfo = {
              firstName: first || '',
              lastName: rest.join(' ') || '',
              email: pref.buyer.email || '',
              phone: pref.buyer.phoneNumber || '',
            };
          }

          // Set additional notes
          if (pref.additionalNotes) {
            updatedData.description = `Matching property for buyer preference: ${pref.additionalNotes}`;
          } else {
            updatedData.description = `Property matching buyer preference ID: ${preferenceId}`;
          }

          // Set nearby landmark if available
          if (pref.nearbyLandmark) {
            updatedData.additionalInfo = `Nearby landmark: ${pref.nearbyLandmark}`;
          }

          // Apply all updates to the contextb 
          Object.keys(updatedData).forEach(key => {
            if (key in updatedData) {
              updatePropertyData(key as keyof PropertyData, updatedData[key]);
            }
          });

          toast.success('Preference details loaded and form auto-populated!');
        } else {
          setPreferenceError(response?.message || 'Failed to load preference details');
        }
      } catch (error) {
        console.error('Error fetching preference details:', error);
        setPreferenceError(`Failed to load preference details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoadingPreference(false);
      }
  }, [preferenceId]);

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

  // Fetch preference details and auto-populate form
  useEffect(() => {
    fetchAndPopulatePreference();
  }, [fetchAndPopulatePreference]);


  const steps = [
    {
      label: "Property Type",
      status:
        currentStep > 0
          ? "completed"
          : currentStep === 0
            ? "active"
            : "pending",
    },
    {
      label: "Basic Details",
      status:
        currentStep > 1
          ? "completed"
          : currentStep === 1
            ? "active"
            : "pending",
    },
    {
      label: "Features & Conditions",
      status:
        currentStep > 2
          ? "completed"
          : currentStep === 2
            ? "active"
            : "pending",
    },
    {
      label: "Upload Images",
      status:
        currentStep > 3
          ? "completed"
          : currentStep === 3
            ? "active"
            : "pending",
    },
    {
      label: "Owner Declaration",
      status:
        currentStep > 4
          ? "completed"
          : currentStep === 4
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
        isCurrentStepValid = !!propertyData.propertyType;
        break;
      case 1:
        isCurrentStepValid = checkStep1RequiredFields(propertyData);
        break;
      case 2:
        isCurrentStepValid = checkStep2RequiredFields(propertyData);
        break;
      case 3:
        isCurrentStepValid = areImagesValid();
        break;
      case 4:
        isCurrentStepValid = checkStep4RequiredFields(propertyData);
        break;
      default:
        isCurrentStepValid = true;
    }

    if (!isCurrentStepValid) {
      // Mark relevant fields as touched to show validation errors
      if (currentStep === 1) {
        const step1Fields = [
          "propertyCategory",
          "state",
          "lga",
          "area",
          "price",
        ];
        step1Fields.forEach((field) => setFieldTouched(field, true));
      } else if (currentStep === 2) {
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
      } else if (currentStep === 4) {
        setFieldTouched("contactInfo.firstName", true);
        setFieldTouched("contactInfo.lastName", true);
        setFieldTouched("contactInfo.email", true);
        setFieldTouched("contactInfo.phone", true);
        setFieldTouched("isLegalOwner", true);
      }
      return; // Don't proceed if validation fails
    }


    if (currentStep < 4) {
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
    { label: "Agent Marketplace", href: "/agent-marketplace" },
    { label: "Post Property by Preference" },
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
        docOnProperty: (propertyData.documents || []).map((doc) => ({
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
          measurementType: propertyData.measurementType,
          size: propertyData.landSize,
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
        // Add preference reference
        matchingPreferenceId: preferenceId,
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
        `${URLS.BASE}/account/preferences/${preferenceId}/properties`,
        payload,
        Cookies.get("token"),
      );

      if (response && (response as any).success && (response as any).data) {
        toast.success("Property created successfully and matched to buyer preference!");
        resetForm();
        setShowSuccessModal(true);
      } else {
        const errorMessage =
          (response as any)?.error || "Failed to submit property";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting property:", error);
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
        return <Step0PropertyTypeSelection />;
      case 1:
        return <Step1BasicDetails />;
      case 2:
        return <Step2FeaturesConditions />;
      case 3:
        return <Step3ImageUpload />;
      case 4:
        return <Step4OwnershipDeclaration />;
      default:
        return <Step0PropertyTypeSelection />;
    }
  };

  const getStepTitle = () => {
    if (showPropertySummary) return "Property Summary";
    if (showCommissionModal) return "Commission Agreement";
    return steps[currentStep]?.label || "Post Property";
  };

  // Loading state while fetching preference
  if (isLoadingPreference) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading buyer preference...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (preferenceError) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 mb-4">{preferenceError}</p>
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/agent-marketplace')} 
              className="block w-full px-6 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC97F] transition-colors"
            >
              Back to Marketplace
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  const quotaText = listingsEntry
    ? (listingsEntry.type === 'unlimited' || listingsEntry.remaining === -1)
      ? 'Unlimited'
      : (listingsEntry.type === 'count')
        ? `${Math.max(0, Number(listingsEntry.remaining || 0))} remaining`
        : (Number(listingsEntry.value) === 1 ? 'Enabled' : 'Disabled')
    : '—';

  if (!user) {
    return <Loading />;
  }

  // If preference is already closed/matched, show notice and actions
  if (preference && preference.status?.toLowerCase() === 'closed') {
    return (
      <CombinedAuthGuard
        requireAuth={true}
        allowedUserTypes={["Agent"]}
        requireAgentOnboarding={false}
        requireAgentApproval={false}
        requireActiveSubscription={true}
        agentCustomMessage="You must complete onboarding and be approved before you can post properties."
      >
        <FeatureGate featureKeys={[FEATURE_KEYS.AGENT_MARKETPLACE]}>
          <div className="min-h-screen bg-[#EEF1F1] py-10">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center border border-gray-200">
                <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">✓</div>
                <h2 className="text-xl md:text-2xl font-bold text-[#09391C] mb-2">Preference Already Matched</h2>
                <p className="text-[#5A5D63] mb-6">This buyer preference has been closed because it’s already matched. You can find another active preference to submit your property to.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push('/agent-marketplace')}
                    className="px-6 py-3 bg-[#8DDB90] hover:bg-[#7BC97F] text-white rounded-lg font-semibold transition-colors"
                  >
                    Find another preference
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                  >
                    Go to dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FeatureGate>
      </CombinedAuthGuard>
    );
  }

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireActiveSubscription={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <FeatureGate featureKeys={[FEATURE_KEYS.AGENT_MARKETPLACE]}>
        <Preloader isVisible={isSubmitting} message="Submitting Property..." />
        <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
          <div className="container mx-auto px-4 md:px-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display mb-2 md:mb-4">
                Submit Property for Buyer Preference
              </h1>
              <div className="mb-3">
                <span className="inline-flex items-center rounded-full bg-[#EEF1F1] text-[#09391C] text-xs md:text-sm px-3 py-1 font-medium">
                  Listings quota: {quotaText}
                </span>
              </div>
              <p className="text-[#5A5D63] text-sm md:text-lg max-w-2xl mx-auto px-4">
                {preference && (
                  <span className="block mb-2">
                    Preference Type: <strong>{preference.preferenceType === 'buy' ? 'Looking to Buy' : preference.preferenceType === 'rent' ? 'Looking to Rent' : 'Looking for Shortlet'}</strong>
                  </span>
                )}
                {showPropertySummary
                  ? "Review your property listing before submission"
                  : showCommissionModal
                    ? "Review and accept the commission terms"
                    : "Follow these simple steps to list your property that matches the preference requirements"}
              </p>
            </div>

            {preference && !showPropertySummary && !showCommissionModal && (
              <div className="mb-6 md:mb-8 max-w-4xl mx-auto">
                <CollapsibleBuyerRequirements preference={preference as any} />
              </div>
            )}

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
              {({ errors, touched, validateForm, setFieldTouched, isValid, isSubmitting: formikSubmitting }) => (
                <Form>
                  <div className="bg-white rounded-xl p-4 md:p-8 mb-6 md:mb-8">
                    {renderCurrentStep()}
                  </div>

                  {!showCommissionModal && !showPropertySummary && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
                      <Button
                        type="button"
                        value={currentStep === 0 ? "Back to Marketplace" : "Previous"}
                        onClick={currentStep === 0 ? () => router.push("/agent-marketplace") : handlePrevious}
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
                          {currentStep === 4 && (
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
                            value={currentStep === 4 ? "Complete" : "Next"}
                            onClick={() => handleNext(validateForm, errors, setFieldTouched)}
                            className="w-full md:w-auto bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            isDisabled={
                              isSubmitting ||
                              isLoading ||
                              images.some((img) => img.isUploading) ||
                              (propertyData.videos && propertyData.videos.some((video) => video.isUploading)) ||
                              !isStepValid(currentStep, propertyData, areImagesValid, errors, touched)
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

            <PreferenceSuccessModal
              isOpen={showSuccessModal}
              onClose={() => setShowSuccessModal(false)}
              buyerName={preference?.buyer?.fullName}
            />
          </div>
        </div>
      </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default PostPropertyByPreference;
