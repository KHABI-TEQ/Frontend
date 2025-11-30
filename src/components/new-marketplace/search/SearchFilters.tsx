/** @format */

"use client";
import React, { useState, Fragment } from "react";
import Input from "../../general-components/Input";
import RadioCheck from "../../general-components/radioCheck";
import { AnimatePresence } from "framer-motion";
import LocationSearch from "./LocationSearch";
import FilterModal from "../FilterModal";
import StandardPreloader from "../StandardPreloader";
import ActiveFilters from "../ActiveFilters";
import PriceRangeFilter from "../filters/PriceRangeFilter";
import BedroomFilter from "../filters/BedroomFilter";
import DocumentTypeFilter from "../filters/DocumentTypeFilter";
import MoreFiltersModal from "../filters/MoreFiltersModal";
import SubmitPreferenceModal from "../modals/SubmitPreferenceModal";
import {
  getUsageOptions,
  getUsageOptionsLabel,
  getHomeConditionOptions,
} from "@/data/filter-data";

interface SearchFiltersProps {
  tab: "buy" | "jv" | "rent" | "shortlet";
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  onSearch: () => void;
  loading: boolean;
  selectedCount?: number;
  onOpenInspection?: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  tab,
  filters,
  onFilterChange,
  onClearFilters,
  onSearch,
  loading,
  selectedCount = 0,
  onOpenInspection,
}) => {
  // Modal states for new filter components
  const [isPriceRangeModalOpened, setIsPriceRangeModalOpened] = useState(false);
  const [isDocumentModalOpened, setIsDocumentModalOpened] = useState(false);
  const [isBedroomModalOpened, setIsBedroomModalOpened] = useState(false);
  const [isMoreFilterModalOpened, setIsMoreFilterModalOpened] = useState(false);

  // Mobile filter modal state
  const [isMobileFilterModalOpen, setIsMobileFilterModalOpen] = useState(false);

  // Submit preference modal state
  const [isSubmitPreferenceModalOpen, setIsSubmitPreferenceModalOpen] =
    useState(false);

  // Get dynamic filter data
  const usageOptions = getUsageOptions(tab);
  const usageOptionsLabel = getUsageOptionsLabel(tab);
  const homeConditionOptions = getHomeConditionOptions(tab);

  // Handlers for new filter components
  const handlePriceRangeSelect = (priceRange: {
    min: number;
    max: number;
    display: string;
  }) => {
    onFilterChange("priceRange", priceRange);
    setIsPriceRangeModalOpened(false);
  };

  const handleBedroomSelect = (bedrooms: number | string) => {
    onFilterChange("bedrooms", bedrooms);
    setIsBedroomModalOpened(false);
  };

  const handleDocumentSelect = (documents: string[]) => {
    onFilterChange("documentTypes", documents);
    setIsDocumentModalOpened(false);
  };

  const handleMoreFiltersApply = (moreFilters: any) => {
    // Apply all filters, including clearing ones that are undefined
    onFilterChange("bathrooms", moreFilters.bathrooms);
    onFilterChange("landSize", moreFilters.landSize);
    onFilterChange("desiredFeatures", moreFilters.features);
    onFilterChange("tenantCriteria", moreFilters.tenantCriteria);
    setIsMoreFilterModalOpened(false);
  };

  const formatPriceDisplay = () => {
    if (
      filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max > 0)
    ) {
      return (
        filters.priceRange.display ||
        `₦${filters.priceRange.min?.toLocaleString() || 0} - ₦${filters.priceRange.max?.toLocaleString() || 0}`
      );
    }
    return "";
  };

  const formatDocumentsDisplay = () => {
    const docs = filters.documentTypes || [];
    return docs.length > 0 ? `${docs.length} documents selected` : "";
  };

  // Generate active filters array for the modal
  const getActiveFiltersForModal = () => {
    const activeFilters: Array<{ key: string; label: string; value?: any }> =
      [];

    // Price Range
    if (
      filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max > 0)
    ) {
      activeFilters.push({
        key: "priceRange",
        label: `Price: ${filters.priceRange.display || `₦${filters.priceRange.min?.toLocaleString() || 0} - ₦${filters.priceRange.max?.toLocaleString() || 0}`}`,
      });
    }

    // Location
    if (filters.selectedState || filters.selectedLGA || filters.selectedArea) {
      const locationParts = [
        filters.selectedArea,
        filters.selectedLGA,
        filters.selectedState,
      ].filter(Boolean);
      if (locationParts.length > 0) {
        activeFilters.push({
          key: "location",
          label: `Location: ${locationParts.join(", ")}`,
        });
      }
    }

    // Usage Options
    if (filters.usageOptions && filters.usageOptions.length > 0) {
      const validOptions = filters.usageOptions.filter(
        (option: string) => option !== "All",
      );
      validOptions.forEach((option: string) => {
        activeFilters.push({
          key: "usageOptions",
          label: `Type: ${option}`,
          value: option,
        });
      });
    }

    // Bedrooms
    if (filters.bedrooms) {
      activeFilters.push({
        key: "bedrooms",
        label: `Bedrooms: ${filters.bedrooms}`,
      });
    }

    // Bathrooms
    if (filters.bathrooms) {
      activeFilters.push({
        key: "bathrooms",
        label: `Bathrooms: ${filters.bathrooms}`,
      });
    }

    // Document Types
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      filters.documentTypes.forEach((doc: string) => {
        activeFilters.push({
          key: "documentTypes",
          label: `Doc: ${doc}`,
          value: doc,
        });
      });
    }

    // Land Size
    if (filters.landSize && filters.landSize.size) {
      activeFilters.push({
        key: "landSize",
        label: `Land: ${filters.landSize.size} ${filters.landSize.type}`,
      });
    }

    // Desired Features
    if (filters.desiredFeatures && filters.desiredFeatures.length > 0) {
      filters.desiredFeatures.forEach((feature: string) => {
        activeFilters.push({
          key: "desiredFeatures",
          label: `Feature: ${feature}`,
          value: feature,
        });
      });
    }

    // Tenant Criteria
    if (filters.tenantCriteria && filters.tenantCriteria.length > 0) {
      filters.tenantCriteria.forEach((criteria: string) => {
        activeFilters.push({
          key: "tenantCriteria",
          label: `Criteria: ${criteria}`,
          value: criteria,
        });
      });
    }

    // Home Condition
    if (filters.homeCondition) {
      activeFilters.push({
        key: "homeCondition",
        label: `Condition: ${filters.homeCondition}`,
      });
    }

    return activeFilters;
  };

  return (
    <Fragment>
      {/* Loading Overlay */}
      <StandardPreloader
        isVisible={loading}
        message="Searching properties..."
        overlay={false}
      />

      {/* Mobile Filter Modal */}
      <FilterModal
        isOpen={isMobileFilterModalOpen}
        onClose={() => setIsMobileFilterModalOpen(false)}
        tab={tab}
        filters={filters}
        onFilterChange={onFilterChange}
        onApplyFilters={onSearch}
        onClearFilters={onClearFilters}
      />

      {/* Active Filters */}
      <ActiveFilters
        filters={filters}
        onRemoveFilter={(key, value) => {
          if (key === "usageOptions" && value) {
            const current = filters.usageOptions || [];
            const updated = current.filter((opt: string) => opt !== value);
            onFilterChange("usageOptions", updated);
          } else if (key === "documentTypes" && value) {
            const current = filters.documentTypes || [];
            const updated = current.filter((doc: string) => doc !== value);
            onFilterChange("documentTypes", updated);
          } else if (key === "desiredFeatures" && value) {
            const current = filters.desiredFeatures || [];
            const updated = current.filter(
              (feature: string) => feature !== value,
            );
            onFilterChange("desiredFeatures", updated);
          } else if (key === "tenantCriteria" && value) {
            const current = filters.tenantCriteria || [];
            const updated = current.filter(
              (criteria: string) => criteria !== value,
            );
            onFilterChange("tenantCriteria", updated);
          } else if (key === "location") {
            onFilterChange("selectedState", "");
            onFilterChange("selectedLGA", "");
            onFilterChange("selectedArea", "");
            onFilterChange("locationDisplay", "");
          } else {
            onFilterChange(
              key,
              key === "priceRange" ? { min: 0, max: 0, display: "" } : "",
            );
          }
        }}
        onClearAll={onClearFilters}
        onSubmitPreference={() => setIsSubmitPreferenceModalOpen(true)}
      />

      {/* Mobile Filter Section */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#09391C]">
            Filter Properties
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMobileFilterModalOpen(true)}
              className="px-4 py-2 border border-[#8DDB90] text-[#8DDB90] rounded-lg text-sm font-medium hover:bg-[#8DDB90] hover:text-white transition-colors"
            >
              Filters
            </button>
            <button
              onClick={() => onSearch()}
              disabled={loading}
              className="px-4 py-2 bg-[#8DDB90] text-white rounded-lg text-sm font-medium hover:bg-[#76c77a] transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div> 

        {/* Quick Location Search for Mobile */}
        <div className="w-full">
          <LocationSearch
            placeholder="Quick location search..."
            value={filters.locationDisplay || ""}
            onChange={(location, details) => {
              if (details) {
                onFilterChange("selectedState", details.state);
                onFilterChange("selectedLGA", details.lga);
                onFilterChange("selectedArea", details.area || "");
                onFilterChange("locationDisplay", location);
              } else {
                onFilterChange("selectedState", "");
                onFilterChange("selectedLGA", "");
                onFilterChange("selectedArea", "");
                onFilterChange("locationDisplay", "");
              }
            }}
          />
        </div>

        {/* Selected Properties Button for Mobile */}
        {selectedCount > 0 && (
          <button
            className="w-full bg-[#FF3D00] text-white py-3 rounded-lg font-medium hover:bg-[#E53100] transition-colors"
            type="button"
            onClick={() => {
              if (onOpenInspection) {
                onOpenInspection();
              }
            }}
          >
            {selectedCount} selected brief{selectedCount !== 1 ? "s" : ""} -
            Continue
          </button>
        )}
      </div>

      {/* Filter by checkboxes - exact copy of existing design - Hidden on mobile */}
      <div className="container min-h-[181px] hidden lg:flex flex-col gap-[25px] py-[25px] px-[30px] bg-[#FFFFFF] sticky top-0 z-20">
        <div className="w-full pb-[10px] flex flex-wrap justify-between items-center gap-[20px] border-b-[1px] border-[#C7CAD0]">
          <div className="flex flex-wrap gap-[15px]">
            <h3 className="font-semibold text-[#1E1E1E]">
              {usageOptionsLabel}
            </h3>
            {usageOptions.map((item: string, idx: number) => (
              <RadioCheck
                key={idx}
                type="checkbox"
                name="filterBy"
                isChecked={filters.usageOptions?.includes(item) || false}
                value={item}
                handleChange={() => {
                  const current = filters.usageOptions || [];
                  const updated = current.includes(item)
                    ? current.filter((opt: string) => opt !== item)
                    : [...current, item];
                  onFilterChange("usageOptions", updated);
                }}
              />
            ))}
          </div>
          <div className="flex gap-[30px]">
            <button
              className="h-[34px] w-[133px] bg-[#8DDB90] text-white shadow-md font-medium text-sm"
              type="button"
              onClick={() => {
                // Navigate to post property
                                window.open("/post-property", "_blank");
              }}
            >
              List property
            </button>
            <button
              className={`h-[34px] w-[140px] font-medium text-sm ${
                selectedCount > 0
                  ? "bg-[#FF3D00] text-white border-[1px] border-[#FF3D00] hover:bg-[#E53100]"
                  : "bg-transparent text-[#FF3D00] border-[1px] border-[#FF3D00]"
              }`}
              type="button"
              onClick={() => {
                if (selectedCount > 0 && onOpenInspection) {
                  onOpenInspection();
                } else {
                  console.log("No properties selected");
                }
              }}
              disabled={selectedCount === 0}
            >
              {selectedCount} selected brief{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {tab === "rent" && homeConditionOptions.length > 0 && (
          <div className="w-full pb-[10px] flex flex-wrap justify-between items-center gap-[20px] border-b-[1px] border-[#C7CAD0]">
            <div className="flex flex-wrap gap-[15px]">
              <h3 className="font-semibold text-[#1E1E1E]">Home Condition</h3>
              {homeConditionOptions.map((condition: string, idx: number) => (
                <RadioCheck
                  key={idx}
                  type="checkbox"
                  name="homeCondition"
                  isChecked={
                    filters.homeCondition === condition ||
                    (condition === "All" && !filters.homeCondition)
                  }
                  value={condition}
                  handleChange={() => {
                    if (condition === "All") {
                      onFilterChange("homeCondition", "");
                    } else {
                      onFilterChange("homeCondition", condition);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filter inputs row - customized per tab */}
        <div className="w-full flex items-center gap-[15px] flex-wrap lg:flex-nowrap">
          {/* Home Condition Filter for Rent Tab - Display like Filter by */}

          {/* Location Input - Fixed width */}
          <div className="w-[280px] min-w-[250px]">
            <LocationSearch
              placeholder="Enter state, LGA, or area..."
              value={filters.locationDisplay || ""}
              onChange={(location, details) => {
                if (details) {
                  onFilterChange("selectedState", details.state);
                  onFilterChange("selectedLGA", details.lga);
                  onFilterChange("selectedArea", details.area || "");
                  onFilterChange("locationDisplay", location);
                } else {
                  onFilterChange("selectedState", "");
                  onFilterChange("selectedLGA", "");
                  onFilterChange("selectedArea", "");
                  onFilterChange("locationDisplay", "");
                }
              }}
            />
          </div>

          {/* Price Range Input - Equal flex */}
          <div className="flex-1 min-w-0 relative">
            <Input
              className="w-full h-[50px]"
              style={{ marginTop: "-30px" }}
              placeholder="Price Range"
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              value={formatPriceDisplay()}
              name="price"
              onClick={() =>
                setIsPriceRangeModalOpened(!isPriceRangeModalOpened)
              }
            />
            <PriceRangeFilter
              isOpen={isPriceRangeModalOpened}
              onClose={() => setIsPriceRangeModalOpened(false)}
              tab={tab}
              onPriceSelect={handlePriceRangeSelect}
              currentValue={filters.priceRange}
            />
          </div>

          {/* Document Type Input - Show for all tabs as per specification */}
          <div className="flex-1 min-w-0 relative">
            <Input
              className="w-full h-[50px] text-sm"
              style={{ marginTop: "-30px" }}
              placeholder={tab === "jv" ? "Document" : "Document Type"}
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              name=""
              value={formatDocumentsDisplay()}
              onClick={() => setIsDocumentModalOpened(!isDocumentModalOpened)}
            />
            <DocumentTypeFilter
              isOpen={isDocumentModalOpened}
              onClose={() => setIsDocumentModalOpened(false)}
              tab={tab}
              onDocumentSelect={handleDocumentSelect}
              currentValue={filters.documentTypes}
            />
          </div>

          {/* Bedroom Input - Equal flex */}
          <div className="flex-1 min-w-0 relative">
            <Input
              className="w-full h-[50px] text-sm"
              style={{ marginTop: "-30px" }}
              placeholder="bedroom"
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              name=""
              value={filters.bedrooms || ""}
              onClick={() => setIsBedroomModalOpened(!isBedroomModalOpened)}
            />
            <BedroomFilter
              isOpen={isBedroomModalOpened}
              onClose={() => setIsBedroomModalOpened(false)}
              tab={tab}
              onBedroomSelect={handleBedroomSelect}
              currentValue={filters.bedrooms}
            />
          </div>

          {/* Buttons Container - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-[15px] shrink-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  setIsMoreFilterModalOpened(!isMoreFilterModalOpened)
                }
                className="w-full sm:w-[120px] h-[45px] sm:h-[50px] border border-[#09391C] text-sm sm:text-base text-[#09391C] font-medium hover:bg-[#09391C] hover:text-white transition-colors rounded-md"
              >
                More filter
              </button>
              <MoreFiltersModal
                isOpen={isMoreFilterModalOpened}
                onClose={() => setIsMoreFilterModalOpened(false)}
                tab={tab}
                onFiltersApply={handleMoreFiltersApply}
                currentFilters={{
                  bathrooms: filters.bathrooms,
                  landSize: filters.landSize,
                  features: filters.desiredFeatures,
                  tenantCriteria: filters.tenantCriteria,
                }}
              />
            </div>
            <button
              type="button"
              className="w-full sm:w-[140px] h-[45px] sm:h-[50px] bg-[#8DDB90] text-sm sm:text-base text-white font-bold hover:bg-[#7BC87F] transition-colors rounded-md"
              onClick={() => onSearch()}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Submit Preference Modal */}
      <SubmitPreferenceModal
        isOpen={isSubmitPreferenceModalOpen}
        onClose={() => setIsSubmitPreferenceModalOpen(false)}
        activeFilters={getActiveFiltersForModal()}
      />
    </Fragment>
  );
};

export default SearchFilters;
