/** @format */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Filter, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  type?: string[];
  briefType?: string[];
  isPremium?: boolean;
  isPreference?: boolean[];
  status?: "approved" | "pending" | "all";
}

interface MyListingFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const MyListingFilters: React.FC<MyListingFiltersProps> = ({
  onSearch,
  loading = false,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    status: "all",
    briefType: [],
    type: [],
    isPremium: undefined,
    isPreference: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBriefTypeDropdown, setShowBriefTypeDropdown] = useState(false);
  const [showPreferenceDropdown, setShowPreferenceDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const briefTypeDropdownRef = useRef<HTMLDivElement>(null);
  const preferenceDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeDropdown(false);
      }
      if (
        briefTypeDropdownRef.current &&
        !briefTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBriefTypeDropdown(false);
      }
      if (
        preferenceDropdownRef.current &&
        !preferenceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPreferenceDropdown(false);
      }
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const propertyTypes = ["Land", "Residential", "Commercial", "Duplex"];
  const briefTypes = ["Outright Sales", "Rent", "Joint Venture"];
  const preferenceOptions = [
    { label: "Preference", value: true },
    { label: "Non-Preference", value: false },
  ];
  const priceRangePresets = [
    { label: "Under ₦500K", min: 0, max: 500000 },
    { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
    { label: "₦1M - ₦5M", min: 1000000, max: 5000000 },
    { label: "₦5M - ₦10M", min: 5000000, max: 10000000 },
    { label: "₦10M - ₦50M", min: 10000000, max: 50000000 },
    { label: "₦50M - ₦100M", min: 50000000, max: 100000000 },
    { label: "Above ₦100M", min: 100000000, max: undefined },
  ];
  const documentTypes = [
    "Certificate of Occupancy",
    "Deed of Assignment",
    "Survey Plan",
    "Building Plan",
    "Tax Receipt",
  ];
  const desiredFeatures = [
    "Air conditioner",
    "POP Ceilings",
    "Built-in cupboards",
    "Staff Room",
    "In-house Cinema",
    "Parking",
    "Gym house",
    "Children Playground",
    "Bath Tub",
    "Walk-in closet",
    "Outdoor Kitchen",
  ];
  const homeConditions = [
    "New",
    "Excellent",
    "Good",
    "Fair",
    "Needs renovation",
  ];
  const tenantCriteriaOptions = [
    "No smoking",
    "No pets",
    "Family only",
    "Working professionals",
    "Students welcome",
    "Short term lease",
    "Long term lease",
  ];
  const landSizeTypes = [
    "Plot",
    "Acres",
    "Square meters",
    "Square feet",
    "Hectares",
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayFilterChange = (
    key: keyof SearchFilters,
    value: string,
    checked: boolean,
  ) => {
    setFilters((prev) => {
      const currentArray = (prev[key] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [key]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [key]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));

    const numValue = value ? parseFloat(value) : undefined;
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue,
      },
    }));
  };

  const handlePricePresetSelect = (preset: { min: number; max?: number }) => {
    setPriceRange({
      min: preset.min.toString(),
      max: preset.max ? preset.max.toString() : "",
    });
    setFilters((prev) => ({
      ...prev,
      priceRange: preset,
    }));
    setShowPriceDropdown(false);
  };

  const handleMultiSelectChange = (
    key: keyof SearchFilters,
    value: any,
    checked: boolean,
  ) => {
    setFilters((prev) => {
      const currentArray = (prev[key] as any[]) || [];
      if (checked) {
        return {
          ...prev,
          [key]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [key]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      status: "all",
      briefType: [],
      type: [],
      isPremium: undefined,
      isPreference: [],
    });
    setPriceRange({ min: "", max: "" });
    setShowTypeDropdown(false);
    setShowBriefTypeDropdown(false);
    setShowPreferenceDropdown(false);
    setShowPriceDropdown(false);
    onSearch({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.priceRange?.min || filters.priceRange?.max) count++;
    if (filters.documentType?.length) count++;
    if (filters.bedroom) count++;
    if (filters.bathroom) count++;
    if (filters.landSize) count++;
    if (filters.desireFeature?.length) count++;
    if (filters.homeCondition) count++;
    if (filters.tenantCriteria?.length) count++;
    if (filters.type?.length) count++;
    if (filters.briefType?.length) count++;
    if (filters.isPremium !== undefined) count++;
    if (filters.isPreference?.length) count++;
    if (filters.status !== "all") count++;
    return count;
  };

  const formatSelectedItems = (items: string[]) => {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    return `${items[0]} +${items.length - 1} more`;
  };

  const formatPriceDisplay = () => {
    if (priceRange.min || priceRange.max) {
      const min = priceRange.min
        ? `₦${Number(priceRange.min).toLocaleString()}`
        : "";
      const max = priceRange.max
        ? `₦${Number(priceRange.max).toLocaleString()}`
        : "";
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min} +`;
      if (max) return `Up to ${max}`;
    }
    return "Select price range";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#09391C]" />
            <h3 className="text-lg font-semibold text-[#09391C]">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-[#8DDB90] text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-[#5A5D63] hover:text-[#09391C] transition-colors"
          >
            Advanced
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Status
            </label>
            <select
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Brief Type Filter */}
          <div className="relative" ref={briefTypeDropdownRef}>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Brief Type
            </label>
            <button
              type="button"
              onClick={() => setShowBriefTypeDropdown(!showBriefTypeDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between"
            >
              <span className="truncate">
                {filters.briefType?.length
                  ? formatSelectedItems(filters.briefType)
                  : "Select brief types"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showBriefTypeDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showBriefTypeDropdown && (
              <div
                className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl"
                style={{ zIndex: 9999 }}
              >
                <div className="p-2 max-h-40 overflow-y-auto">
                  {briefTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.briefType || []).includes(type)}
                        onChange={(e) =>
                          handleMultiSelectChange(
                            "briefType",
                            type,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Location
            </label>
            <input
              type="text"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="State, LGA, Area..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            />
          </div>

          {/* Property Type */}
          <div className="relative" ref={typeDropdownRef}>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Property Type
            </label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between"
            >
              <span className="truncate">
                {filters.type?.length
                  ? formatSelectedItems(filters.type)
                  : "Select property types"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showTypeDropdown && (
              <div
                className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl"
                style={{ zIndex: 9999 }}
              >
                <div className="p-2 max-h-40 overflow-y-auto">
                  {propertyTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.type || []).includes(type)}
                        onChange={(e) =>
                          handleMultiSelectChange(
                            "type",
                            type,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4 relative">
          <div className="relative" ref={priceDropdownRef}>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Price Range
            </label>
            <button
              type="button"
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between"
            >
              <span className="truncate">{formatPriceDisplay()}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showPriceDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showPriceDropdown && (
              <div
                className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                style={{ zIndex: 9999 }}
              >
                <div className="p-3 space-y-3">
                  <div className="text-xs font-medium text-[#09391C] mb-2">
                    Quick Select:
                  </div>
                  <div className="grid gap-1">
                    {priceRangePresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePricePresetSelect(preset)}
                        className="text-left p-2 text-sm hover:bg-gray-50 rounded transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <div className="text-xs font-medium text-[#09391C] mb-2">
                      Custom Range:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceRangeChange("min", e.target.value)
                        }
                        placeholder="Min price"
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8DDB90]"
                      />
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceRangeChange("max", e.target.value)
                        }
                        placeholder="Max price"
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8DDB90]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-4 border-t border-gray-200"
            >
              {/* Room Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={filters.bedroom || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "bedroom",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="Number of bedrooms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={filters.bathroom || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "bathroom",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="Number of bathrooms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Land Size Type
                  </label>
                  <select
                    value={filters.landSizeType || ""}
                    onChange={(e) =>
                      handleFilterChange("landSizeType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {landSizeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Land Size
                  </label>
                  <input
                    type="number"
                    value={filters.landSize || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "landSize",
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="Size"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Home Condition */}
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-2">
                  Home Condition
                </label>
                <select
                  value={filters.homeCondition || ""}
                  onChange={(e) =>
                    handleFilterChange("homeCondition", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                >
                  <option value="">All conditions</option>
                  {homeConditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Premium Status
                  </label>
                  <select
                    value={
                      filters.isPremium === undefined
                        ? ""
                        : filters.isPremium.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange(
                        "isPremium",
                        value === "" ? undefined : value === "true",
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Premium Only</option>
                    <option value="false">Regular Only</option>
                  </select>
                </div>
                <div className="relative" ref={preferenceDropdownRef}>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Preference Status
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowPreferenceDropdown(!showPreferenceDropdown)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {filters.isPreference?.length
                        ? filters.isPreference
                            .map((p) => (p ? "Preference" : "Non-Preference"))
                            .join(", ")
                        : "Select preference status"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showPreferenceDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showPreferenceDropdown && (
                    <div
                      className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl"
                      style={{ zIndex: 9999 }}
                    >
                      <div className="p-2 max-h-40 overflow-y-auto">
                        {preferenceOptions.map((option) => (
                          <label
                            key={option.label}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                          >
                            <input
                              type="checkbox"
                              checked={(filters.isPreference || []).includes(
                                option.value,
                              )}
                              onChange={(e) =>
                                handleMultiSelectChange(
                                  "isPreference",
                                  option.value,
                                  e.target.checked,
                                )
                              }
                              className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Types */}
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-2">
                  Document Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {documentTypes.map((doc) => (
                    <label
                      key={doc}
                      className="flex items-center text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.documentType || []).includes(doc)}
                        onChange={(e) =>
                          handleArrayFilterChange(
                            "documentType",
                            doc,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-[#5A5D63]">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Desired Features */}
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-2">
                  Desired Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {desiredFeatures.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.desireFeature || []).includes(
                          feature,
                        )}
                        onChange={(e) =>
                          handleArrayFilterChange(
                            "desireFeature",
                            feature,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-[#5A5D63]">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tenant Criteria */}
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-2">
                  Tenant Criteria
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {tenantCriteriaOptions.map((criteria) => (
                    <label
                      key={criteria}
                      className="flex items-center text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.tenantCriteria || []).includes(
                          criteria,
                        )}
                        onChange={(e) =>
                          handleArrayFilterChange(
                            "tenantCriteria",
                            criteria,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-[#5A5D63]">{criteria}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} />
            Reset Filters
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#7BC87F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyListingFilters;
