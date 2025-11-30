/** @format */

"use client";
import React from "react";
import { X } from "lucide-react";

interface SelectedFiltersCardProps {
  filters: any;
  onRemoveFilter: (key: string, value?: any) => void;
  onClearAll: () => void;
}

const SelectedFiltersCard: React.FC<SelectedFiltersCardProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const getActiveFilters = () => {
    const active = [];

    // Location filters
    if (filters.selectedState) {
      active.push({
        key: "selectedState",
        label: `State: ${filters.selectedState}`,
        value: filters.selectedState,
      });
    }

    if (filters.selectedLGA) {
      active.push({
        key: "selectedLGA",
        label: `LGA: ${filters.selectedLGA}`,
        value: filters.selectedLGA,
      });
    }

    if (filters.selectedArea) {
      active.push({
        key: "selectedArea",
        label: `Area: ${filters.selectedArea}`,
        value: filters.selectedArea,
      });
    }

    // Price range
    if (
      filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max > 0)
    ) {
      const min =
        filters.priceRange.min > 0
          ? `₦${filters.priceRange.min.toLocaleString()}`
          : "Min";
      const max =
        filters.priceRange.max > 0
          ? `₦${filters.priceRange.max.toLocaleString()}`
          : "Max";
      active.push({
        key: "priceRange",
        label: `Price: ${min} - ${max}`,
        value: filters.priceRange,
      });
    }

    // Bedrooms
    if (filters.bedrooms) {
      active.push({
        key: "bedrooms",
        label: `${filters.bedrooms}+ Bedrooms`,
        value: filters.bedrooms,
      });
    }

    // Bathrooms
    if (filters.bathrooms) {
      active.push({
        key: "bathrooms",
        label: `${filters.bathrooms}+ Bathrooms`,
        value: filters.bathrooms,
      });
    }

    // Document types
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      filters.documentTypes.forEach((doc: string) => {
        active.push({
          key: "documentTypes",
          label: `Doc: ${doc}`,
          value: doc,
        });
      });
    }

    // Home condition
    if (filters.homeCondition) {
      active.push({
        key: "homeCondition",
        label: `Condition: ${filters.homeCondition}`,
        value: filters.homeCondition,
      });
    }

    // Desired features
    if (filters.desiredFeatures && filters.desiredFeatures.length > 0) {
      filters.desiredFeatures.forEach((feature: string) => {
        active.push({
          key: "desiredFeatures",
          label: `Feature: ${feature}`,
          value: feature,
        });
      });
    }

    // Usage options (filter by)
    if (filters.usageOptions && filters.usageOptions.length > 0) {
      const filtered = filters.usageOptions.filter(
        (opt: string) => opt !== "All",
      );
      filtered.forEach((option: string) => {
        active.push({
          key: "usageOptions",
          label: `Type: ${option}`,
          value: option,
        });
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemoveFilter = (filter: any) => {
    if (filter.key === "documentTypes") {
      const updated = filters.documentTypes.filter(
        (doc: string) => doc !== filter.value,
      );
      onRemoveFilter("documentTypes", updated);
    } else if (filter.key === "desiredFeatures") {
      const updated = filters.desiredFeatures.filter(
        (feature: string) => feature !== filter.value,
      );
      onRemoveFilter("desiredFeatures", updated);
    } else if (filter.key === "usageOptions") {
      const updated = filters.usageOptions.filter(
        (opt: string) => opt !== filter.value,
      );
      onRemoveFilter("usageOptions", updated);
    } else if (filter.key === "priceRange") {
      onRemoveFilter("priceRange", { min: 0, max: 0 });
    } else {
      onRemoveFilter(filter.key, "");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#09391C]">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-[#FF3D00] hover:text-[#E53935] font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.key}-${filter.value}-${index}`}
            className="inline-flex items-center gap-1 bg-[#E4EFE7] text-[#09391C] px-3 py-1 rounded-full text-xs font-medium"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => handleRemoveFilter(filter)}
              className="hover:bg-[#09391C] hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
              title="Remove filter"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedFiltersCard;
