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

const ShortletPropertySearch = () => {
  const {
    shortletTab,
    searchTabProperties,
    setTabFilter,
    clearTabFilters,
    activeTab,
  } = useNewMarketplace();

  const isMobile = IsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states with better initialization
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
    tenantCriteria: [] as string[],
    homeCondition: "",
    numberOfGuests: undefined as number | undefined,
    checkInDate: "",
    checkOutDate: "",
    amenities: [] as string[],
    bookingDuration: "",
  });

  const handleSearch = useCallback(
    async (page = 1) => {
      const searchParams: SearchParams = {
        briefType: "shortlet",
        page,
        limit: 12,
      };

      // Add location filter - ensure proper values
      if (
        filters.selectedState ||
        filters.selectedLGA ||
        filters.selectedArea
      ) {
        const locationParts = [
          filters.selectedArea?.trim(),
          filters.selectedLGA?.trim(),
          filters.selectedState?.trim(),
        ].filter(Boolean);
        if (locationParts.length > 0) {
          searchParams.location = locationParts.join(", ");
        }
      }

      // Add price range - ensure valid numbers
      if (filters.priceRange?.min > 0 || filters.priceRange?.max > 0) {
        searchParams.priceRange = {};
        if (filters.priceRange.min > 0 && !isNaN(filters.priceRange.min)) {
          searchParams.priceRange.min = filters.priceRange.min;
        }
        if (filters.priceRange.max > 0 && !isNaN(filters.priceRange.max)) {
          searchParams.priceRange.max = filters.priceRange.max;
        }
      }

      // Add usage options filter
      if (filters.usageOptions && filters.usageOptions.length > 0) {
        const validUsageOptions = filters.usageOptions.filter(
          (option) => option && option !== "All",
        );
        if (validUsageOptions.length > 0) {
          searchParams.propertyType = validUsageOptions;
        }
      }

      // Add document types filter
      if (filters.documentTypes && filters.documentTypes.length > 0) {
        searchParams.documentType = filters.documentTypes;
      }

      // Add bedrooms filter
      if (filters.bedrooms && !isNaN(Number(filters.bedrooms))) {
        searchParams.bedroom = Number(filters.bedrooms);
      }

      // Add bathrooms filter
      if (filters.bathrooms && !isNaN(Number(filters.bathrooms))) {
        searchParams.bathroom = Number(filters.bathrooms);
      }

      // Add land size filter
      if (filters.landSize?.size && !isNaN(Number(filters.landSize.size))) {
        searchParams.landSize = Number(filters.landSize.size);
        if (filters.landSize.type) {
          searchParams.landSizeType = filters.landSize.type;
        }
      }

      // Add desired features filter
      if (filters.desiredFeatures && filters.desiredFeatures.length > 0) {
        searchParams.desireFeature = filters.desiredFeatures;
      }

      // Add home condition filter
      if (filters.homeCondition && filters.homeCondition.trim()) {
        searchParams.homeCondition = filters.homeCondition.trim();
      }

      // Add tenant criteria filter (for shortlet)
      if (filters.tenantCriteria && filters.tenantCriteria.length > 0) {
        searchParams.tenantCriteria = filters.tenantCriteria;
      }

      console.log("Shortlet search params:", searchParams); // Debug log

      // Perform search
      await searchTabProperties("shortlet", searchParams);
    },
    [filters, searchTabProperties],
  );

  // Listen for pagination events
  useEffect(() => {
    const handlePaginationSearch = (event: CustomEvent) => {
      const { tab, page } = event.detail;
      if (tab === "shortlet") {
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
    const clearedFilters = {
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
      tenantCriteria: [] as string[],
      homeCondition: "",
      numberOfGuests: undefined as number | undefined,
      checkInDate: "",
      checkOutDate: "",
      amenities: [] as string[],
      bookingDuration: "",
    };

    setFilters(clearedFilters);
    searchFormik.resetForm();
    clearTabFilters("shortlet");

    // Trigger search with cleared filters
    handleSearch(1);
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Initial load only
  useEffect(() => {
    if (activeTab === "shortlet" && shortletTab.formikStatus === "idle") {
      handleSearch();
    }
  }, [activeTab, handleSearch, shortletTab.formikStatus]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#09391C]">
            Find Shortlet Properties
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
          tab="shortlet"
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          loading={shortletTab.formikStatus === "pending"}
          selectedCount={0}
          onOpenInspection={() => {}}
        />
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-[#5A5D63]">
          <span>
            {shortletTab.properties.length > 0
              ? `${shortletTab.totalItems} shortlet properties found`
              : shortletTab.formikStatus === "success"
                ? "No shortlet properties found"
                : "Search for shortlet properties"}
          </span>
          {shortletTab.properties.length > 0 && (
            <span>
              Page {shortletTab.currentPage} of {shortletTab.totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortletPropertySearch;
