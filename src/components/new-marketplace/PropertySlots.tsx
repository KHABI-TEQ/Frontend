/** @format */

"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { EnhancedGlobalPropertyCard, createPropertyCardData } from "@/components/common/property-cards";
import { useGlobalInspectionState } from "@/hooks/useGlobalInspectionState";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";

interface PropertySlotsProps {
  selectedProperties: any[];
  maxSlots: number;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onRemove: (propertyId: string) => void;
  onClearNegotiatedPrice?: (propertyId: string) => void;
  onClearLOIDocument?: (propertyId: string) => void;
  onAddProperty: () => void;
  onPropertyClick?: (property: any) => void;
  negotiatedPrices?: any[];
  loiDocuments?: any[];
}

// Helper function to determine if a property is a Joint Venture property
const isJVProperty = (property: any): boolean => {
  if (!property) return false;

  // Check briefType first (most reliable)
  const brief = String(property.briefType || "").toLowerCase();
  if (brief === "joint venture" || brief === "jv") {
    return true;
  }

  // Check category field explicitly for JV
  const category = String(property.category || property.propertyCategory || "").toLowerCase();
  if (category === "joint-venture" || category === "jv" || category === "joint venture") {
    return true;
  }

  // Do not infer JV from property type alone (e.g., Land/Commercial can be sell/rent)
  return false;
};

// Wrapper component for property cards in inspection view
const InspectionPropertyCard: React.FC<{
  property: any;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onRemove: () => void;
  onPropertyClick?: (property: any) => void;
}> = ({ property, tab, onRemove, onPropertyClick }) => {
  return (
    <EnhancedGlobalPropertyCard
      type={isJVProperty(property) ? "jv" : "standard"}
      tab={tab === "jv" ? "buy" : tab}
      property={property}
      cardData={createPropertyCardData(
        property,
        isJVProperty(property) ? "Joint Venture" : undefined
      )}
      images={
        property?.pictures ||
        property?.images ||
        []
      }
      isPremium={property?.isPremium || false}
      onPropertyClick={() => onPropertyClick?.(property)}
      onInspectionToggle={onRemove} // Custom handler for inspection removal
      className="max-w-[320px] md:w-[280px] lg:w-[285px] xl:w-[280px]"
    />
  );
};

const PropertySlots: React.FC<PropertySlotsProps> = ({
  selectedProperties,
  maxSlots,
  tab,
  onRemove,
  onClearNegotiatedPrice,
  onClearLOIDocument,
  onAddProperty,
  onPropertyClick,
  negotiatedPrices = [],
  loiDocuments = [],
}) => {
 
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const property = selectedProperties[index];
    return { index, property };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {slots.map(({ index, property }) => (
        <div
          key={index}
          className="relative w-full flex justify-center max-w-sm mx-auto lg:max-w-none"
        >
          {property ? (
            <div className="relative w-full flex justify-end">
              <InspectionPropertyCard
                property={property.property}
                tab={tab}
                onRemove={() => onRemove(property.propertyId)}
                onPropertyClick={onPropertyClick}
              />
              {/* Remove Button Overlay */}
              <button
                onClick={() => onRemove(property.propertyId)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                title="Remove from inspection"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onClick={onAddProperty}
              className="bg-white rounded-lg flex justify-center items-center border-2 border-dashed border-gray-300 hover:border-[#8DDB90] transition-colors cursor-pointer w-full max-w-[320px] md:w-[280px] lg:w-[285px] xl:w-[280px] min-h-[400px] flex-col mx-auto"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 bg-[#E4EFE7] rounded-full flex items-center justify-center mb-4">
                  <Plus size={32} className="text-[#8DDB90]" />
                </div>
                <h3 className="text-lg font-semibold text-[#09391C] mb-3">
                  Property Slot {index + 1}
                </h3>
                <p className="text-sm text-[#5A5D63] mb-4">
                  Click to browse and add a property for inspection
                </p>
              </div>
            </div>
          )}
        </div>
      ))}



    </div>
  );
};

export default PropertySlots;
