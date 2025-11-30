"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { briefTypeConfig } from "@/data/comprehensive-post-property-config";

interface PropertyImage {
  file: File | null;
  preview: string | null;
  id: string;
  url?: string | null;
  isUploading?: boolean;
}

interface PropertyVideo {
  file: File | null;
  preview: string | null;
  id: string;
  url?: string | null;
  isUploading?: boolean;
}

export interface PropertyData {
  // Step 1: Brief Type Selection
  propertyType: "sell" | "rent" | "jv" | "shortlet" | "";

  // Step 2: Property Category and Basic Info
  propertyCategory:
    | "Residential"
    | "Commercial"
    | "Land"
    | "Mixed Development"
    | "";
  propertyCondition: string;
  typeOfBuilding: string;
  rentalType: string; // For rent: "Rent" | "Lease"
  leaseHold: string;
  holdDuration?: string;
  shortletDuration?: string;

  // Step 3: Location
  state: { value: string; label: string } | null;
  lga: { value: string; label: string } | null;
  area: string;
  streetAddress?: string; // For shortlet

  // Step 4: Size and Pricing
  landSize: string;
  measurementType: string;
  price: string;

  // Step 5: Room Details (for Residential/Commercial)
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parkingSpaces: number;
  maxGuests?: number; // For shortlet

  // Step 6: Documents and Features
  documents: string[];
  features: string[];

  // Step 7: Rental/Sale Specific Fields
  tenantCriteria: string[];
  rentalConditions: string[];
  employmentType: string;
  tenantGenderPreference: string;
  jvConditions: string[];

  // Step 8: Ownership Declaration
  isLegalOwner: boolean;
  ownershipDocuments: string[];
  isTenanted: string;

  // Additional Fields
  description: string;
  additionalInfo: string;

  // Shortlet specific fields
  availability?: {
    minStay: number;
    maxStay?: number;
    calendar?: string;
  };
  pricing?: {
    nightly?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
    cleaningFee?: number;
    securityDeposit?: number;
    cancellationPolicy?: string;
  };
  houseRules?: {
    checkIn: string;
    checkOut: string;
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    otherRules?: string;
  };

  // Contact info
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  // Media
  videos?: PropertyVideo[];
}

interface PostPropertyContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  images: PropertyImage[];
  setImages: Dispatch<SetStateAction<PropertyImage[]>>;
  propertyData: PropertyData;
  setPropertyData: (data: PropertyData) => void;
  updatePropertyData: (
    field: keyof PropertyData | "resetFormExcept" | "resetFieldsAfterCategory" | "initializePropertyType",
    value: any,
  ) => void;
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  validateCurrentStep: () => boolean;
  resetForm: () => void;
  populatePropertyData: (propertyData: any) => void;
  getMinimumRequiredImages: () => number;
  areImagesValid: () => boolean;
  showCommissionModal: boolean;
  setShowCommissionModal: (show: boolean) => void;
  showPropertySummary: boolean;
  setShowPropertySummary: (show: boolean) => void;
  getUserCommissionRate: () => number;
  getUserType: () => "landowner" | "agent";
}

const PostPropertyContext = createContext<PostPropertyContextType | undefined>(
  undefined,
);

const initialPropertyData: PropertyData = {
  propertyType: "",
  propertyCategory: "Residential",
  propertyCondition: "",
  typeOfBuilding: "",
  rentalType: "",
  price: "",
  leaseHold: "",
  holdDuration: "",
  shortletDuration: "",
  state: null,
  lga: null,
  area: "",
  streetAddress: "",
  landSize: "",
  measurementType: "",
  bedrooms: 0,
  bathrooms: 0,
  toilets: 0,
  parkingSpaces: 0,
  maxGuests: 0,
  features: [],
  tenantCriteria: [],
  rentalConditions: [],
  employmentType: "",
  tenantGenderPreference: "",
  jvConditions: [],
  documents: [],
  contactInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  isLegalOwner: false,
  ownershipDocuments: [],
  isTenanted: "",
  description: "",
  additionalInfo: "",
  availability: {
    minStay: 1,
    maxStay: undefined,
    calendar: "",
  },
  pricing: {
    nightly: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    cleaningFee: 0,
    securityDeposit: 0,
    cancellationPolicy: "flexible",
  },
  houseRules: {
    checkIn: "15:00",
    checkOut: "11:00",
    smoking: false,
    pets: false,
    parties: false,
    otherRules: "",
  },
  videos: [],
};

export function PostPropertyProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [propertyData, setPropertyData] =
    useState<PropertyData>(initialPropertyData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showPropertySummary, setShowPropertySummary] = useState(false);

  const updatePropertyData = (
    field: keyof PropertyData | "resetFormExcept" | "resetFieldsAfterCategory" | "initializePropertyType",
    value: any,
  ) => {
    if (field === "resetFormExcept") {
      // Reset all fields except the ones specified in value array
      const fieldsToPreserve = value as string[];
      const newData = { ...initialPropertyData };

      fieldsToPreserve.forEach((fieldName) => {
        if (fieldName in propertyData) {
          (newData as any)[fieldName] = (propertyData as any)[fieldName];
        }
      });

      setPropertyData(newData);
      // Reset images and go back to step 0 when brief type changes
      setImages([]);
      setCurrentStep(0);
    } else if (field === "resetFieldsAfterCategory") {
      // Reset specific fields after property category change - clear fields AFTER category, not before
      const fieldsToReset = value as string[];
      const newData = { ...propertyData };

      fieldsToReset.forEach((fieldName) => {
        if (fieldName in initialPropertyData) {
          (newData as any)[fieldName] = (initialPropertyData as any)[fieldName];
        }
      });

      // Preserve propertyType and propertyCategory when clearing fields after category change
      newData.propertyType = propertyData.propertyType;
      newData.propertyCategory = propertyData.propertyCategory;

      setPropertyData(newData);
      // Reset images when property category changes
      setImages([]);
    } else if (field === "initializePropertyType") {
      // Initialize property type when entering a specific property type page
      const newPropertyType = value as "sell" | "rent" | "jv" | "shortlet";

      // Only reset if we're changing to a different property type
      if (propertyData.propertyType !== newPropertyType) {
        const newData = { ...initialPropertyData };
        newData.propertyType = newPropertyType;

        setPropertyData(newData);
        setImages([]);
        setCurrentStep(0);
        setShowCommissionModal(false);
        setShowPropertySummary(false);
      }
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getMinimumRequiredImages = () => 1;

  const areImagesValid = () => {
    const validImages = images.filter((img) => img.file !== null || img.url);
    return validImages.length >= getMinimumRequiredImages();
  };

  const validateCurrentStep = () => {
    // Validation is now handled by Formik
    // This function is kept for compatibility but should rely on Formik validation
    switch (currentStep) {
      case 0: // Property type selection
        return !!propertyData.propertyType;
      case 1: // Basic details - will be validated by Formik
        return true;
      case 2: // Features and conditions - will be validated by Formik
        return true;
      case 3: // Image upload
        return areImagesValid();
      case 4: // Ownership and contact - will be validated by Formik
        return true;
      default:
        return true;
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setImages([]);
    setPropertyData(initialPropertyData);
    setIsSubmitting(false);
    setShowCommissionModal(false);
    setShowPropertySummary(false);
  };

  const populatePropertyData = (property: any) => {
    const populatedData: PropertyData = {
      propertyType: property.briefType === "Outright Sales" ? "sell" :
                   property.briefType === "Rent" ? "rent" :
                   property.briefType === "Shortlet" ? "shortlet" :
                   property.briefType === "Joint Venture" ? "jv" : "",
      propertyCategory: property.propertyCategory || "Residential",
      propertyCondition: property.propertyCondition || "",
      typeOfBuilding: property.typeOfBuilding || "",
      rentalType: property.rentalType || "",
      price: property.price?.toString() || "",
      leaseHold: property.leaseHold || "",
      holdDuration: property.holdDuration || "",
      shortletDuration: property.shortletDuration || "",
      state: property.location?.state ? { value: property.location.state, label: property.location.state } : null,
      lga: property.location?.localGovernment ? { value: property.location.localGovernment, label: property.location.localGovernment } : null,
      area: property.location?.area || "",
      streetAddress: property.location?.streetAddress || "",
      landSize: property.landSize?.size || "",
      measurementType: property.landSize?.measurementType || "",
      bedrooms: parseInt(property.additionalFeatures?.noOfBedroom) || 0,
      bathrooms: parseInt(property.additionalFeatures?.noOfBathroom) || 0,
      toilets: parseInt(property.additionalFeatures?.noOfToilet) || 0,
      parkingSpaces: parseInt(property.additionalFeatures?.noOfCarPark) || 0,
      maxGuests: parseInt(property.additionalFeatures?.maxGuests) || 0,
      features: property.features || [],
      tenantCriteria: property.tenantCriteria || [],
      rentalConditions: property.rentalConditions || [],
      employmentType: property.employmentType || "",
      tenantGenderPreference: property.tenantGenderPreference || "",
      jvConditions: property.jvConditions || [],
      documents: property.docOnProperty?.map((doc: any) => doc.docName) || [],
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
      videos: property.videos || [],
      pricing: property.pricing || null,
      availability: property.availability || null,
      houseRules: property.houseRules || null,
    };

    setPropertyData(populatedData);

    // Populate images if they exist
    if (property.pictures && property.pictures.length > 0) {
      const imageData = property.pictures.map((url: string, index: number) => ({
        file: null,
        preview: url,
        id: `existing-${index}`,
        url: url,
        isUploading: false,
      }));
      setImages(imageData);
    }
  };

  const getUserType = (): "landowner" | "agent" => {
    // Import useUserContext here to avoid circular dependencies
    if (typeof window !== "undefined") {
      try {
        // Try to get from global context first
        const userContextString = localStorage.getItem("user");
        if (userContextString) {
          const userData = JSON.parse(userContextString);
          return userData.userType === "Agent" ? "agent" : "landowner";
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
    // Default to landowner for property owners/individuals
    return "landowner";
  };

  const getUserCommissionRate = (): number => {
    const userType = getUserType();
    const briefType = propertyData.propertyType as keyof typeof briefTypeConfig;
    const config = (briefType && (briefTypeConfig as any)[briefType]) || null;
    if (briefType === 'shortlet') return 7;
    if (!config) return userType === 'agent' ? 50 : 10;
    return userType === 'agent' ? config.commission.agent : config.commission.landowner;
  };

  const contextValue: PostPropertyContextType = {
    currentStep,
    setCurrentStep,
    images,
    setImages,
    propertyData,
    setPropertyData,
    updatePropertyData,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    setIsLoading,
    validateCurrentStep,
    resetForm,
    populatePropertyData,
    getMinimumRequiredImages,
    areImagesValid,
    showCommissionModal,
    setShowCommissionModal,
    showPropertySummary,
    setShowPropertySummary,
    getUserCommissionRate,
    getUserType,
  };

  return (
    <PostPropertyContext.Provider value={contextValue}>
      {children}
    </PostPropertyContext.Provider>
  );
}

export function usePostPropertyContext() {
  const context = useContext(PostPropertyContext);
  if (context === undefined) {
    throw new Error(
      "usePostPropertyContext must be used within a PostPropertyProvider",
    );
  }
  return context;
}
