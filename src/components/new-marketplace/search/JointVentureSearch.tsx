/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import { SearchParams } from "@/context/new-marketplace-context";
import SearchFilters from "./SearchFilters";
import { IsMobile } from "@/hooks/isMobile";

const JointVentureSearch = () => {
  const {
    jvTab,
    searchTabProperties,
    setTabFilter,
    clearTabFilters,
    activeTab,
  } = useNewMarketplace();

  const isMobile = IsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states specific to JV
  const [filters, setFilters] = useState({
    selectedState: "",
    selectedLGA: "",
    selectedArea: "",
    locationDisplay: "",
    priceRange: { min: 0, max: 0 }, // Investment amount range
    usageOptions: [] as string[],
    bedrooms: undefined as number | undefined,
    bathrooms: undefined as number | undefined,
    landSize: {
      type: "plot",
      size: undefined as number | undefined,
    },
    desiredFeatures: [] as string[],
    investmentType: "",
    expectedROI: "",
    projectDuration: "",
  });

  const handleSearch = useCallback(
    async (page = 1) => {
      const searchParams: SearchParams = {
        briefType: "jv",
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

      // Add investment amount range (price range for JV)
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

      // Add other JV-specific filters
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

      // Perform search
      await searchTabProperties("jv", searchParams);
    },
    [filters, searchTabProperties],
  );

  // Listen for pagination events
  useEffect(() => {
    const handlePaginationSearch = (event: CustomEvent) => {
      const { tab, page } = event.detail;
      if (tab === "jv") {
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
      investmentType: "",
      investmentMin: "",
      investmentMax: "",
      expectedROI: "",
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
      usageOptions: [],
      bedrooms: undefined,
      bathrooms: undefined,
      landSize: {
        type: "plot",
        size: undefined,
      },
      desiredFeatures: [],
      investmentType: "",
      expectedROI: "",
      projectDuration: "",
    });

    searchFormik.resetForm();
    clearTabFilters("jv");
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Initial load only
  useEffect(() => {
    if (activeTab === "jv" && jvTab.formikStatus === "idle") {
      handleSearch();
    }
  }, [activeTab, handleSearch, jvTab.formikStatus]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#09391C]">
            Find Joint Venture Opportunities
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

      {/* JV Specific Notice */}
      <div className="px-4 py-2 bg-[#FFF3E0] border-b border-[#FFE0B2]">
        <p className="text-sm text-[#E65100]">
         <strong>Note:</strong> For joint venture investments, you may optionally submit a 
          Letter of Intent (LOI) document.
        </p>
      </div>

      {/* Search Filters */}
      <div className={`${isMobile && !showFilters ? "hidden" : "block"}`}>
        <SearchFilters
          tab="jv"
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          loading={jvTab.formikStatus === "pending"}
          selectedCount={0}
          onOpenInspection={() => {}}
        />
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-[#5A5D63]">
          <span>
            {jvTab.properties.length > 0
              ? `${jvTab.totalItems} opportunities found`
              : jvTab.formikStatus === "success"
                ? "No opportunities found"
                : "Search for investment opportunities"}
          </span>
          {jvTab.properties.length > 0 && (
            <span>
              Page {jvTab.currentPage} of {jvTab.totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JointVentureSearch;
