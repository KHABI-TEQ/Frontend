/** @format */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Filter, Search, X, ChevronDown, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface SearchFilters {
  location?: string;
  type?: string[];
  briefType?: string[];
  status?: "approved" | "pending" | "rejected" | "all";
}

interface SimplifiedMyListingFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const SimplifiedMyListingFilters: React.FC<SimplifiedMyListingFiltersProps> = ({
  onSearch,
  loading = false,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    status: "all",
    briefType: [],
    type: [],
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBriefTypeDropdown, setShowBriefTypeDropdown] = useState(false);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const briefTypeDropdownRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const propertyTypes = ["Land", "Residential", "Commercial", "Duplex"];
  const briefTypes = ["Outright Sales", "Rent", "Joint Venture"];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectChange = (
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

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      status: "all",
      briefType: [],
      type: [],
    });
    setShowTypeDropdown(false);
    setShowBriefTypeDropdown(false);
    onSearch({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location?.trim()) count++;
    if (filters.type?.length) count++;
    if (filters.briefType?.length) count++;
    if (filters.status !== "all") count++;
    return count;
  };

  const formatSelectedItems = (items: string[]) => {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    return `${items[0]} +${items.length - 1} more`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#09391C]" />
            <h3 className="text-lg font-semibold text-[#09391C]">
              Filter Properties
            </h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-[#8DDB90] text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Quick search and filter your listings
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Primary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Status
            </label>
            <select
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent bg-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Under Review</option>
              <option value="rejected">❌ Rejected</option>
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between bg-white transition-all duration-200 hover:border-[#8DDB90]"
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
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
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

          {/* Property Type */}
          <div className="relative" ref={typeDropdownRef}>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Property Type
            </label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-left flex items-center justify-between bg-white transition-all duration-200 hover:border-[#8DDB90]"
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
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={filters.location || ""}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                placeholder="State, LGA, Area..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} />
            Reset Filters
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#7BC87F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SimplifiedMyListingFilters;
