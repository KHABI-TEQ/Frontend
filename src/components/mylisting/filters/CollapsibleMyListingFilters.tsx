/** @format */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Filter, Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFilters {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  propertyCategory?: string;
  state?: string;
  localGovernment?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  isApproved?: boolean;
}

interface CollapsibleMyListingFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const CollapsibleMyListingFilters: React.FC<CollapsibleMyListingFiltersProps> = ({
  onSearch,
  loading = false,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 10,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const propertyTypes = [
    "apartment", "bungalow", "duplex", "townhouse", "villa", "penthouse",
    "studio", "warehouse", "office", "shop", "land", "farm"
  ];
  
  const propertyCategories = ["residential", "commercial", "industrial", "mixed-use"];
  
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
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

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));

    const numValue = value ? parseFloat(value) : undefined;
    setFilters((prev) => ({
      ...prev,
      [`price${type.charAt(0).toUpperCase() + type.slice(1)}`]: numValue,
    }));
  };

  const handlePricePresetSelect = (preset: { min: number; max?: number }) => {
    setPriceRange({
      min: preset.min.toString(),
      max: preset.max ? preset.max.toString() : "",
    });
    setFilters((prev) => ({
      ...prev,
      priceMin: preset.min,
      priceMax: preset.max,
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
    setPriceRange({ min: "", max: "" });
    onSearch({
      page: 1,
      limit: 10,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.propertyType) count++;
    if (filters.propertyCategory) count++;
    if (filters.state) count++;
    if (filters.localGovernment) count++;
    if (filters.area) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.isApproved !== undefined) count++;
    return count;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-[#09391C]" />
              <h3 className="text-lg font-semibold text-[#09391C]">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-[#8DDB90] text-white text-xs px-2 py-1 rounded-full font-medium">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Status Filter */}
            <select
              value={filters.status || ""}
              onChange={(e) => {
                handleFilterChange("status", e.target.value);
                // Auto-search on quick filters
                const newFilters = { ...filters, status: e.target.value };
                onSearch(newFilters);
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#09391C] border border-[#09391C] rounded-lg hover:bg-[#09391C] hover:text-white transition-colors"
            >
              <Filter size={16} />
              {isExpanded ? "Hide Filters" : "More Filters"}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType || ""}
                    onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  >
                    <option value="">All Property Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Category */}
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Category
                  </label>
                  <select
                    value={filters.propertyCategory || ""}
                    onChange={(e) => handleFilterChange("propertyCategory", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {propertyCategories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Approval Status */}
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    Approval Status
                  </label>
                  <select
                    value={filters.isApproved === undefined ? "" : filters.isApproved.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange(
                        "isApproved",
                        value === "" ? undefined : value === "true"
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Approved</option>
                    <option value="false">Not Approved</option>
                  </select>
                </div>
              </div>

              {/* Location Filters */}
              <div>
                <h4 className="text-sm font-medium text-[#09391C] mb-3">Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={filters.state || ""}
                      onChange={(e) => handleFilterChange("state", e.target.value)}
                      placeholder="e.g., Lagos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Local Government
                    </label>
                    <input
                      type="text"
                      value={filters.localGovernment || ""}
                      onChange={(e) => handleFilterChange("localGovernment", e.target.value)}
                      placeholder="e.g., Ikeja"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={filters.area || ""}
                      onChange={(e) => handleFilterChange("area", e.target.value)}
                      placeholder="e.g., Alausa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-[#09391C] mb-3">Price Range</h4>
                <div className="space-y-3">
                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2">
                    {priceRangePresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePricePresetSelect(preset)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-[#8DDB90] hover:text-white rounded-full transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                        placeholder="Minimum price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                        placeholder="Maximum price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Reset All Filters
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleMyListingFilters;
