/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import {
  useNewMarketplace,
  SearchParams,
} from "@/context/new-marketplace-context";
import SearchFilters from "./SearchFilters";
import { IsMobile } from "@/hooks/isMobile";

const RentPropertySearch = () => {
  const {
    rentTab,
    searchTabProperties,
    setTabFilter,
    clearTabFilters,
    activeTab,
  } = useNewMarketplace();

  const isMobile = IsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    selectedState: "",
    selectedLGA: "",
    selectedArea: "",
    locationDisplay: "",
    priceRange: { min: 0, max: 0 },
    documentTypes: [] as string[],
    usageOptions: [] as string[],
    bedrooms: undefined as number | undefined,
    bathrooms: undefined as number | undefined,
    landSize: {
      type: "plot",
      size: undefined as number | undefined,
    },
    desiredFeatures: [] as string[],
    homeCondition: "",
    tenantCriteria: [] as string[],
  });

  const handleSearch = useCallback(
    async (page = 1) => {
      const searchParams: SearchParams = {
        briefType: "rent",
        page,
        limit: 12,
      };

      // Add location filter
      if (
        filters.selectedState ||
        filters.selectedLGA ||
        filters.selectedArea
      ) {
        const locationParts = [
          filters.selectedArea,
          filters.selectedLGA,
          filters.selectedState,
        ].filter(Boolean);
        searchParams.location = locationParts.join(", ");
      }

      // Add price range
      if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
        searchParams.priceRange = {
          min: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
          max: filters.priceRange.max > 0 ? filters.priceRange.max : undefined,
        };
      }

      // Add usage options filter (property type)
      if (filters.usageOptions && filters.usageOptions.length > 0) {
        const validUsageOptions = filters.usageOptions.filter(
          (option) => option && option !== "All",
        );
        if (validUsageOptions.length > 0) {
          searchParams.propertyType = validUsageOptions;
        }
      }

      // Add other filters
      if (filters.documentTypes.length > 0) {
        searchParams.documentType = filters.documentTypes;
      }

      if (filters.bedrooms) {
        searchParams.bedroom = filters.bedrooms;
      }

      if (filters.bathrooms) {
        searchParams.bathroom = filters.bathrooms;
      }

      if (filters.landSize.size) {
        searchParams.landSize = filters.landSize.size;
        searchParams.landSizeType = filters.landSize.type;
      }

      if (filters.desiredFeatures.length > 0) {
        searchParams.desireFeature = filters.desiredFeatures;
      }

      if (filters.homeCondition) {
        searchParams.homeCondition = filters.homeCondition;
      }

      if (filters.tenantCriteria.length > 0) {
        searchParams.tenantCriteria = filters.tenantCriteria;
      }

      // Perform search
      await searchTabProperties("rent", searchParams);
    },
    [filters, searchTabProperties],
  );

  // Listen for pagination events
  useEffect(() => {
    const handlePaginationSearch = (event: CustomEvent) => {
      const { tab, page } = event.detail;
      if (tab === "rent") {
        handleSearch(page);
      }
    };

    window.addEventListener(
      "marketplace-search",
      handlePaginationSearch as EventListener,
    );

    return () => {
      window.removeEventListener(
        "marketplace-search",
        handlePaginationSearch as EventListener,
      );
    };
  }, [handleSearch]);

  // Search form
  const searchFormik = useFormik({
    initialValues: {
      location: "",
      propertyType: "",
      priceMin: "",
      priceMax: "",
      bedrooms: "",
    },
    onSubmit: (values) => {
      handleSearch();
    },
  });

  const handleClearFilters = () => {
    setFilters({
      selectedState: "",
      selectedLGA: "",
      selectedArea: "",
      locationDisplay: "",
      priceRange: { min: 0, max: 0 },
      documentTypes: [],
      usageOptions: [],
      bedrooms: undefined,
      bathrooms: undefined,
      landSize: {
        type: "plot",
        size: undefined,
      },
      desiredFeatures: [],
      homeCondition: "",
      tenantCriteria: [],
    });

    searchFormik.resetForm();
    clearTabFilters("rent");
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Initial load only
  useEffect(() => {
    if (activeTab === "rent" && rentTab.formikStatus === "idle") {
      handleSearch();
    }
  }, [activeTab, handleSearch, rentTab.formikStatus]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#09391C]">
            Find Properties to Rent/Lease
          </h3>
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-[#8DDB90] font-medium"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>
      </div>

      {/* Search Filters */}
      <div className={`${isMobile && !showFilters ? "hidden" : "block"}`}>
        <SearchFilters
          tab="rent"
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          loading={rentTab.formikStatus === "pending"}
          selectedCount={0}
          onOpenInspection={() => {}}
        />
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-[#5A5D63]">
          <span>
            {rentTab.properties.length > 0
              ? `${rentTab.totalItems} properties found`
              : rentTab.formikStatus === "success"
                ? "No properties found"
                : "Search for properties"}
          </span>
          {rentTab.properties.length > 0 && (
            <span>
              Page {rentTab.currentPage} of {rentTab.totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentPropertySearch;
