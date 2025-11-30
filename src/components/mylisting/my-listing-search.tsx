/** @format */

"use client";
import { useFormik } from "formik";
import { Fragment, useState } from "react";
import Input from "../general-components/Input";
import React from "react";
import RadioCheck from "../general-components/radioCheck";
import { Search, Filter, X } from "lucide-react";

interface SearchFilters {
  location?: string;
  priceRange?: { min?: number; max?: number };
  documentType?: string[];
  bedroom?: number;
  bathroom?: number;
  landSizeType?: string;
  landSize?: number;
  desireFeature?: string[];
  homeCondition?: string;
  tenantCriteria?: string[];
  type?: string;
  briefType?: string;
  isPremium?: boolean;
  isPreference?: boolean;
  status?: "approved" | "pending" | "all";
}

const MyListingSearch = ({
  onSearch,
  loading = false,
}: {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}) => {
  const [usageOptions, setUsageOptions] = useState<string[]>(["All"]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [briefTypeFilter, setBriefTypeFilter] = useState<string>("All");
  const [isPremiumFilter, setIsPremiumFilter] = useState<boolean | undefined>(
    undefined,
  );
  const [isPreferenceFilter, setIsPreferenceFilter] = useState<
    boolean | undefined
  >(undefined);

  const formik = useFormik({
    initialValues: {
      selectedLGA: "",
      selectedState: "",
    },
    onSubmit: (values) => {
      // console.log(values);
    },
  });

  const [isPriceRangeModalOpened, setIsPriceRangeModalOpened] =
    useState<boolean>(false);
  const [priceRadioValue, setPriceRadioValue] = useState<string>("");
  const [isDocumentModalOpened, setIsDocumentModalOpened] =
    useState<boolean>(false);
  const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [isBedroomModalOpened, setIsBedroomModalOpened] =
    useState<boolean>(false);
  const [noOfBedrooms, setNoOfBedrooms] = useState<number | undefined>(
    undefined,
  );
  const [isMoreFilterModalOpened, setIsMoreFilterModalOpened] =
    useState<boolean>(false);
  const [filters, setFilters] = useState<{
    bathroom: number | undefined | string;
    landSize: {
      type: string;
      size: undefined | number;
    };
    desirer_features: string[];
    homeCondition: string;
    tenantCriteria: string[];
  }>({
    bathroom: undefined,
    landSize: {
      type: "plot",
      size: undefined,
    },
    desirer_features: [],
    homeCondition: "",
    tenantCriteria: [],
  });

  const priceFormik = useFormik({
    initialValues: {
      minPrice: 0,
      maxPrice: 0,
    },
    onSubmit: (values) => {
      // console.log(values);
    },
  });

  const locationValue = [formik.values.selectedLGA, formik.values.selectedState]
    .filter(Boolean)
    .join(", ")
    .trim();

  const parsePriceRange = (priceString: string) => {
    if (!priceString || priceString.trim() === "") return null;

    if (priceString.includes(" - ")) {
      const [minStr, maxStr] = priceString.split(" - ");

      const parsePrice = (str: string) => {
        const cleanStr = str.toLowerCase().trim();

        if (cleanStr.includes("million")) {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
          return num * 1000000;
        } else if (cleanStr.includes("k")) {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
          return num * 1000;
        } else if (cleanStr === "above" || cleanStr.includes("above")) {
          return Number.MAX_SAFE_INTEGER;
        } else {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
          return isNaN(num) ? 0 : num;
        }
      };

      const minPrice = parsePrice(minStr);
      const maxPrice = maxStr.includes("above")
        ? Number.MAX_SAFE_INTEGER
        : parsePrice(maxStr);

      return {
        min: minPrice,
        max: maxPrice,
      };
    }

    return null;
  };

  const formatPriceDisplay = (priceString: string, priceFormik: any) => {
    if (priceString !== "") {
      return priceString;
    }

    const minPrice = priceFormik.values.minPrice;
    const maxPrice = priceFormik.values.maxPrice;

    if (minPrice === 0 && maxPrice === 0) {
      return "";
    }

    const formatNumber = (num: number) => {
      if (num === 0) return "0";
      return num.toLocaleString();
    };

    if (minPrice > 0 && maxPrice > 0) {
      return `₦${formatNumber(minPrice)} - ₦${formatNumber(maxPrice)}`;
    } else if (minPrice > 0) {
      return `₦${formatNumber(minPrice)} and above`;
    } else if (maxPrice > 0) {
      return `Up to ₦${formatNumber(maxPrice)}`;
    }

    return "";
  };

  const buildPriceQuery = (priceString: string, priceFormik: any) => {
    if (priceString && priceString.trim() !== "") {
      const parsed = parsePriceRange(priceString);
      if (parsed) {
        return parsed;
      }
    }

    const minPrice = Number(priceFormik.values.minPrice) || 0;
    const maxPrice = Number(priceFormik.values.maxPrice) || 0;

    if (minPrice > 0 || maxPrice > 0) {
      const query: any = {};

      if (minPrice > 0) {
        query.min = minPrice;
      }

      if (maxPrice > 0) {
        query.max = maxPrice;
      }

      return Object.keys(query).length > 0 ? query : undefined;
    }

    return undefined;
  };

  const buildSearchFilters = (): SearchFilters => {
    const searchFilters: SearchFilters = {};

    // Location
    if (locationValue !== "") {
      searchFilters.location = locationValue;
    }

    // Price
    const priceQuery = buildPriceQuery(priceRadioValue, priceFormik);
    if (priceQuery) {
      searchFilters.priceRange = priceQuery;
    }

    // Property Type
    if (!usageOptions.includes("All") && usageOptions.length > 0) {
      searchFilters.type = usageOptions.join(",");
    }

    // Document Type
    if (documentsSelected.length > 0) {
      searchFilters.documentType = documentsSelected;
    }

    // Bedrooms
    if (noOfBedrooms !== undefined) {
      searchFilters.bedroom = noOfBedrooms;
    }

    // Bathroom
    if (
      filters.bathroom !== undefined &&
      String(filters.bathroom) !== "" &&
      filters.bathroom !== 0
    ) {
      searchFilters.bathroom = Number(filters.bathroom);
    }

    // Land Size
    if (
      filters.landSize &&
      typeof filters.landSize === "object" &&
      "size" in filters.landSize &&
      filters.landSize.size
    ) {
      searchFilters.landSizeType = filters.landSize.type;
      searchFilters.landSize = filters.landSize.size;
    }

    // Home Condition
    if (filters.homeCondition !== "") {
      searchFilters.homeCondition = filters.homeCondition;
    }

    // Tenant Criteria
    if (filters.tenantCriteria && filters.tenantCriteria.length > 0) {
      searchFilters.tenantCriteria = filters.tenantCriteria;
    }

    // Brief Type
    if (briefTypeFilter !== "All") {
      searchFilters.briefType = briefTypeFilter;
    }

    // Status
    if (statusFilter !== "all") {
      searchFilters.status = statusFilter;
    }

    // Premium
    if (isPremiumFilter !== undefined) {
      searchFilters.isPremium = isPremiumFilter;
    }

    // Preference
    if (isPreferenceFilter !== undefined) {
      searchFilters.isPreference = isPreferenceFilter;
    }

    return searchFilters;
  };


  const handleSearch = () => {
    const searchFilters = buildSearchFilters();
    onSearch(searchFilters);
  };

  const handleReset = () => {
    // Reset all filters
    setUsageOptions(["All"]);
    setStatusFilter("all");
    setBriefTypeFilter("All");
    setIsPremiumFilter(undefined);
    setIsPreferenceFilter(undefined);
    formik.resetForm();
    setPriceRadioValue("");
    priceFormik.resetForm();
    setDocumentsSelected([]);
    setNoOfBedrooms(undefined);
    setFilters({
      bathroom: undefined,
      landSize: {
        type: "plot",
        size: undefined,
      },
      desirer_features: [],
      homeCondition: "",
      tenantCriteria: [],
    });

    // Trigger search with empty filters
    onSearch({});
  };

  const docsValues = documentsSelected.map((item: string) => item);

  return (
    <Fragment>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={20} className="text-[#09391C]" />
          <h3 className="text-lg font-semibold text-[#09391C]">
            Search & Filter Briefs
          </h3>
        </div>

        {/* Property Type Filters */}
        <div className="mb-6">
          <h4 className="font-medium text-[#09391C] mb-3">Property Type</h4>
          <div className="flex flex-wrap gap-3">
            {["All", "Land", "Residential", "Commercial", "Duplex"].map(
              (item: string, idx: number) => (
                <label
                  key={idx}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioCheck
                    type="checkbox"
                    name="propertyType"
                    isChecked={usageOptions.some(
                      (text: string) => text === item,
                    )}
                    value={item}
                    handleChange={() => {
                      const uniqueValues = new Set(
                        usageOptions as Array<string>,
                      );
                      if (uniqueValues.has(item)) {
                        uniqueValues.delete(item);
                        setUsageOptions([...uniqueValues]);
                      } else {
                        uniqueValues.add(item);
                        setUsageOptions([...uniqueValues]);
                      }
                    }}
                  />
                  <span className="text-sm text-[#5A5D63]">{item}</span>
                </label>
              ),
            )}
          </div>
        </div>

        {/* Status and Type Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Approval Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "approved" | "pending",
                )
              }
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Brief Type
            </label>
            <select
              value={briefTypeFilter}
              onChange={(e) => setBriefTypeFilter(e.target.value)}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Outright Sales">Outright Sales</option>
              <option value="Rent">Rent</option>
              <option value="Joint Venture">Joint Venture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Premium Status
            </label>
            <select
              value={
                isPremiumFilter === undefined ? "" : isPremiumFilter.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                setIsPremiumFilter(value === "" ? undefined : value === "true");
              }}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Premium Only</option>
              <option value="false">Regular Only</option>
            </select>
          </div>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Location */}
          <div>
            {/* <SelectStateLGA
              placeholder="Enter state, lga, city...."
              formik={formik}
            /> */}
          </div>

          {/* Price Range */}
          <div>
            <Input
              className="w-full h-[50px]"
              style={{ marginTop: "-30px" }}
              placeholder="Price Range"
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              value={formatPriceDisplay(priceRadioValue, priceFormik)}
              name="price"
              onClick={() => setIsPriceRangeModalOpened(true)}
            />
            {isPriceRangeModalOpened && (
              // <PriceRange
              //   heading="Price Range"
              //   formik={priceFormik}
              //   closeModal={setIsPriceRangeModalOpened}
              //   setSlectedRadioValue={setPriceRadioValue}
              //   selectedRadioValue={priceRadioValue}
              // />
              <></>
            )}
          </div>

          {/* Document Type */}
          <div>
            <Input
              className="w-full h-[50px] text-sm"
              style={{ marginTop: "-30px" }}
              placeholder="Document Type"
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              name=""
              value={docsValues.toString()}
              onClick={() => setIsDocumentModalOpened(true)}
            />
            {isDocumentModalOpened && (
              // <DocumentTypeComponent
              //   docsSelected={documentsSelected}
              //   setDocsSelected={setDocumentsSelected}
              //   closeModal={setIsDocumentModalOpened}
              // />
              <></>
            )}
          </div>

          {/* Bedroom */}
          <div>
            <Input
              className="w-full h-[50px] text-sm"
              style={{ marginTop: "-30px" }}
              placeholder="Bedrooms"
              type="text"
              label=""
              readOnly
              showDropdownIcon={true}
              name=""
              value={noOfBedrooms}
              onClick={() => setIsBedroomModalOpened(true)}
            />
            {isBedroomModalOpened && (
              // <BedroomComponent
              //   noOfBedrooms={noOfBedrooms}
              //   closeModal={setIsBedroomModalOpened}
              //   setNumberOfBedrooms={setNoOfBedrooms}
              // />
              <></>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreFilterModalOpened(true)}
              className="px-6 py-3 border-2 border-[#09391C] text-[#09391C] rounded-lg font-medium hover:bg-[#09391C] hover:text-white transition-colors"
            >
              More Filters
            </button>
            {isMoreFilterModalOpened && (
              // <MoreFilter
              //   filters={filters}
              //   setFilters={setFilters}
              //   closeModal={setIsMoreFilterModalOpened}
              // />
              <></>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-[#8DDB90] text-white rounded-lg font-bold hover:bg-[#7BC87F] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={16} />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MyListingSearch;
