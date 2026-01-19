/** @format */

"use client";
import { useCallback } from "react";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";
import type { IProperty } from "@/models/Property";

export interface InspectionProperty {
  propertyId: string;
  property: IProperty | Record<string, unknown>;
  sourceTab?: "buy" | "jv" | "rent" | "shortlet";
  sourcePage?: string;
  sourceMeta?: {
    matchedId?: string;
    preferenceId?: string;
  };
}

export interface NegotiatedPrice {
  propertyId: string;
  originalPrice: number;
  negotiatedPrice: number;
}

export interface LOIDocument {
  propertyId: string;
  document: File | null;
  documentUrl?: string;
}

export const useGlobalInspectionState = () => {
  const {
    selectedForInspection,
    negotiatedPrices,
    loiDocuments,
    toggleInspectionSelection,
    removeFromInspection,
    clearInspectionSelection,
    isSelectedForInspection,
    canSelectMoreForInspection,
    addNegotiatedPrice,
    removeNegotiatedPrice,
    getNegotiatedPrice,
    addLOIDocument,
    removeLOIDocument,
    getLOIDocument,
    hasSelectedProperties,
    selectedCount,
  } = useGlobalPropertyActions();

  // Add property to inspection (wrapper around global context)
  const addProperty = useCallback((
    property: IProperty | Record<string, unknown>,
    sourceTab?: "buy" | "jv" | "rent" | "shortlet",
    sourcePage?: string,
    sourceMeta?: { matchedId?: string; preferenceId?: string }
  ) => {
    toggleInspectionSelection(property, sourceTab, sourcePage, sourceMeta);
  }, [toggleInspectionSelection]);

  // Remove property from inspection (wrapper around global context)
  const removeProperty = useCallback((propertyId: string) => {
    removeFromInspection(propertyId);
  }, [removeFromInspection]);

  // Toggle property selection (wrapper around global context)
  const toggleProperty = useCallback((
    property: IProperty | Record<string, unknown>,
    sourceTab?: "buy" | "jv" | "rent" | "shortlet",
    sourcePage?: string,
    sourceMeta?: { matchedId?: string; preferenceId?: string }
  ) => {
    toggleInspectionSelection(property, sourceTab, sourcePage, sourceMeta);
  }, [toggleInspectionSelection]);

  // Check if property is selected (wrapper around global context)
  const isPropertySelected = useCallback((propertyId: string) => {
    return isSelectedForInspection(propertyId);
  }, [isSelectedForInspection]);

  // Remove negotiated price (wrapper around global context)
  const clearNegotiatedPrice = useCallback((propertyId: string) => {
    removeNegotiatedPrice(propertyId);
  }, [removeNegotiatedPrice]);

  // Remove LOI document (wrapper around global context)
  const clearLOIDocument = useCallback((propertyId: string) => {
    removeLOIDocument(propertyId);
  }, [removeLOIDocument]);

  // Clear all selections (wrapper around global context)
  const clearAllSelections = useCallback(() => {
    clearInspectionSelection();
  }, [clearInspectionSelection]);

  // Get property type for display
  const getPropertyType = useCallback((property: IProperty | Record<string, unknown>) => {
    // Prefer explicit briefType from backend
    if ((property as IProperty)?.briefType) {
      return (property as IProperty).briefType;
    }

    // Fallbacks: detect JV only when explicitly labeled as such
    const category = String((property as Record<string, unknown>)?.category || (property as Record<string, unknown>)?.propertyCategory || "").toLowerCase();
    if (category === "joint-venture" || category === "jv" || category === "joint venture") {
      return "Joint Venture";
    }

    // Otherwise default to Outright Sales (avoid inferring JV from propertyType alone)
    return "Outright Sales";
  }, []);

  // Check if can select more properties (wrapper around global context)
  const canSelectMore = useCallback(() => {
    return canSelectMoreForInspection();
  }, [canSelectMoreForInspection]);

  return {
    // State (from global context)
    selectedProperties: selectedForInspection,
    negotiatedPrices,
    loiDocuments,

    // Property selection
    addProperty,
    removeProperty,
    toggleProperty,
    isPropertySelected,
    canSelectMore,

    // Price negotiation
    addNegotiatedPrice,
    clearNegotiatedPrice,
    getNegotiatedPrice,

    // LOI documents
    addLOIDocument,
    clearLOIDocument,
    getLOIDocument,

    // Utilities
    clearAllSelections,
    getPropertyType,

    // Computed values (from global context)
    hasSelectedProperties,
    selectedCount,
    maxReached: selectedCount >= 2,
  };
};
