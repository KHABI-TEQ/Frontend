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
import { BuyPropertyFilters, FilterUpdateFunction } from "@/types/search.types";
 
const BuyPropertySearch = () => {
  const {
    buyTab,
    searchTabProperties,
    setTabFilter,
    clearTabFilters,
    activeTab,
  } = useNewMarketplace();

  const isMobile = IsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states with better initialization
  const [filters, setFilters] = useState<BuyPropertyFilters>({
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
    tenantCriteria: [],
    homeCondition: "",
  });

  const handleSearch = useCallback(
    async (page = 1) => {
      const searchParams: SearchParams = {
        briefType: "buy",
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

      // Add usage options filter (property type)
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

      // Perform search
      await searchTabProperties("buy", searchParams);
    },
    [filters, searchTabProperties],
  );

  // Listen for pagination events
  useEffect(() => {
    const handlePaginationSearch = (event: CustomEvent) => {
      const { tab, page } = event.detail;
      if (tab === "buy") {
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
      documentTypes: [],
      usageOptions: [],
      bedrooms: undefined,
      bathrooms: undefined,
      landSize: {
        type: "plot",
        size: undefined,
      },
      desiredFeatures: [],
      tenantCriteria: [],
      homeCondition: "",
    } as BuyPropertyFilters;

    setFilters(clearedFilters);
    searchFormik.resetForm();
    clearTabFilters("buy");

    // Trigger search with cleared filters
    handleSearch(1);
  };

  const updateFilter: FilterUpdateFunction<BuyPropertyFilters> = <K extends keyof BuyPropertyFilters>(
    key: K,
    value: BuyPropertyFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#09391C]">
            Find Properties to Buy
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
          tab="buy"
          filters={filters}
          onFilterChange={updateFilter as (key: string, value: any) => void}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          loading={buyTab.formikStatus === "pending"}
          selectedCount={0}
          onOpenInspection={() => {}}
        />
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-[#5A5D63]">
          <span>
            {buyTab.properties.length > 0
              ? `${buyTab.totalItems} properties found`
              : buyTab.formikStatus === "success"
                ? "No properties found"
                : "Search for properties"}
          </span>
          {buyTab.properties.length > 0 && (
            <span>
              Page {buyTab.currentPage} of {buyTab.totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyPropertySearch;
