/** @format */

"use client";
import React from "react";
import { usePathname } from "next/navigation";
import StandardPropertyCard, { StandardPropertyCardProps } from "./StandardPropertyCard";
import JVPropertyCard, { JVPropertyCardProps } from "./JVPropertyCard";
import { useGlobalInspectionState } from "@/hooks/useGlobalInspectionState";
import toast from "react-hot-toast";

// Combined props interface
export interface UniversalPropertyCardProps {
  property: any;
  cardData: { header: string; value: string }[];
  images: any[];
  isPremium: boolean;
  onPropertyClick: () => void;
  onInspectionToggle: () => void;
  isSelected: boolean;
  
  // Standard property card props (for Outright Sales, Rent, Shortlet)
  onPriceNegotiation?: () => void;
  onRemoveNegotiation?: (propertyId: string) => void;
  negotiatedPrice?: {
    propertyId: string;
    originalPrice: number;
    negotiatedPrice: number;
  } | null;
  
  // JV property card props (for Joint Venture)
  onLOIUpload?: () => void;
  onRemoveLOI?: (propertyId: string) => void;
  loiDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
  
  // Common optional props
  showPriceNegotiation?: boolean;
  showInspectionToggle?: boolean;
  showLOIUpload?: boolean;
  className?: string;
  maxSelections?: number;
  currentSelections?: number;
  
  // Property type override (if you want to force a specific card type)
  forceCardType?: "standard" | "jv";

  // Global inspection integration
  useGlobalInspection?: boolean;
  sourceTab?: "buy" | "jv" | "rent" | "shortlet";
  sourcePage?: string;
}

/**
 * UniversalPropertyCard - Automatically selects the appropriate property card
 * based on the property type or briefType
 * 
 * For "Joint Venture" properties: Uses JVPropertyCard
 * For "Outright Sales", "Rent", "Shortlet": Uses StandardPropertyCard
 */
const UniversalPropertyCard: React.FC<UniversalPropertyCardProps> = (props) => {
  const pathname = usePathname();
  const globalInspection = useGlobalInspectionState();

  const {
    property,
    cardData,
    forceCardType,
    useGlobalInspection = true, // Default to true for global integration
    sourceTab,
    sourcePage = pathname,
    onPriceNegotiation = () => {},
    onRemoveNegotiation = () => {},
    onLOIUpload = () => {},
    onRemoveLOI = () => {},
    isSelected: propIsSelected,
    onInspectionToggle: propOnInspectionToggle,
    currentSelections: propCurrentSelections,
    maxSelections: propMaxSelections = 2,
    ...commonProps
  } = props;

  // Use global inspection state if enabled, otherwise use props
  const isSelected = useGlobalInspection
    ? globalInspection.isPropertySelected(property._id)
    : propIsSelected || false;

  const currentSelections = useGlobalInspection
    ? globalInspection.selectedCount
    : propCurrentSelections || 0;

  const maxSelections = propMaxSelections;

  const handleInspectionToggle = () => {
    if (useGlobalInspection) {
      try {
        globalInspection.toggleProperty(property, sourceTab, sourcePage || undefined);

        if (!isSelected) {
          toast.success("Property added for inspection");
        } else {
          toast.success("Property removed from inspection");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update inspection selection");
      }
    } else {
      propOnInspectionToggle?.();
    }
  };

  const handlePriceNegotiation = () => {
    if (useGlobalInspection) {
      // Handle global price negotiation if needed
      onPriceNegotiation();
    } else {
      onPriceNegotiation();
    }
  };

  const handleRemoveNegotiation = (propertyId: string) => {
    if (useGlobalInspection) {
      globalInspection.clearNegotiatedPrice(propertyId);
    }
    onRemoveNegotiation(propertyId);
  };

  const handleLOIUpload = () => {
    if (useGlobalInspection) {
      // Handle global LOI upload if needed
      onLOIUpload();
    } else {
      onLOIUpload();
    }
  };

  const handleRemoveLOI = (propertyId: string) => {
    if (useGlobalInspection) {
      globalInspection.clearLOIDocument(propertyId);
    }
    onRemoveLOI(propertyId);
  };

  // Get negotiated price and LOI document from global state if using global inspection
  const negotiatedPrice = useGlobalInspection
    ? globalInspection.getNegotiatedPrice(property._id)
    : props.negotiatedPrice;

  const loiDocument = useGlobalInspection
    ? globalInspection.getLOIDocument(property._id)
    : props.loiDocument;

  // Determine card type based on property
  const getCardType = (): "standard" | "jv" => {
    if (forceCardType) return forceCardType;
    
    // Check property briefType first
    if (property?.briefType === "Joint Venture") return "jv";
    
    // Check property type in cardData
    const propertyTypeData = cardData.find(item => item.header === "Property Type");
    if (propertyTypeData?.value === "Joint Venture") return "jv";
    
    // Check investment type (JV specific field)
    const hasInvestmentType = cardData.some(item => item.header === "Investment Type");
    const hasExpectedROI = cardData.some(item => item.header === "Expected ROI");
    const hasInvestmentAmount = cardData.some(item => item.header === "Investment Amount");
    
    if (hasInvestmentType || hasExpectedROI || hasInvestmentAmount) return "jv";
    
    // Default to standard card
    return "standard";
  };

  const cardType = getCardType();

  if (cardType === "jv") {
    const jvProps: JVPropertyCardProps = {
      ...commonProps,
      property,
      cardData,
      onInspectionToggle: handleInspectionToggle,
      onLOIUpload: handleLOIUpload,
      onRemoveLOI: handleRemoveLOI,
      isSelected,
      loiDocument,
      showLOIUpload: props.showLOIUpload,
      currentSelections,
      maxSelections,
    };

    return <JVPropertyCard {...jvProps} />;
  }

  // Standard property card for Outright Sales, Rent, Shortlet
  const standardProps: StandardPropertyCardProps = {
    ...commonProps,
    property,
    cardData,
    onInspectionToggle: handleInspectionToggle,
    onPriceNegotiation: handlePriceNegotiation,
    onRemoveNegotiation: handleRemoveNegotiation,
    isSelected,
    negotiatedPrice,
    showPriceNegotiation: props.showPriceNegotiation,
    currentSelections,
    maxSelections,
  };

  return <StandardPropertyCard {...standardProps} />;
};

// Helper function to create card data for different property types
export const createPropertyCardData = (property: any, propertyType?: string): { header: string; value: string }[] => {
  const type = propertyType || property?.briefType || property?.propertyType || "Unknown";
  
  if (type === "Joint Venture") {
    return [
      { header: "Property Type", value: property.propertyType || "N/A" },
      { header: "Investment Amount", value: `₦${Number(property.investmentAmount || property.price || 0).toLocaleString()}` },
      { header: "Expected ROI", value: property.expectedROI || "N/A" },
      { header: "Investment Type", value: property.investmentType || "Joint Venture" },
      { header: "Bedrooms", value: property.additionalFeatures?.noOfBedroom || property.noOfBedroom || "0" },
      { header: "Bathrooms", value: property.additionalFeatures?.noOfBathroom || property.noOfBathroom || "0" },
      { header: "Car Parks", value: property.additionalFeatures?.noOfCarPark || property.noOfCarPark || "0" },
      { header: "Toilets", value: property.additionalFeatures?.noOfToilet || property.noOfToilet || "0" },
      {
        header: "Location",
        value: property.location
          ? `${property.location.area || ""}, ${property.location.localGovernment || ""}, ${property.location.state || ""}`.replace(/^,\s*|,\s*$/g, "")
          : "Location not specified",
      },
    ];
  }

  // Standard property card data (for Outright Sales, Rent, Shortlet)
  return [
    { header: "Property Type", value: property.propertyType || "N/A" },
    { header: "Price", value: `₦${Number(property.price || 0).toLocaleString()}` },
    { header: "Bedrooms", value: property.additionalFeatures?.noOfBedroom || property.noOfBedroom || "0" },
    { header: "Bathrooms", value: property.additionalFeatures?.noOfBathroom || property.noOfBathroom || "0" },
    { header: "CarParks", value: property.additionalFeatures?.noOfCarPark || property.noOfCarPark || "0" },
    { header: "Toilets", value: property.additionalFeatures?.noOfToilet || property.noOfToilet || "0" },
    {
      header: "Location",
      value: property.location
        ? `${property.location.area || ""}, ${property.location.localGovernment || ""}, ${property.location.state || ""}`.replace(/^,\s*|,\s*$/g, "")
        : "Location not specified",
    },
  ];
};

export default UniversalPropertyCard;
