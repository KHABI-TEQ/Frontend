/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import {
  getBathroomOptions,
  getLandSizeTypes,
  getPropertyFeatures,
  getTenantCriteria,
} from "@/data/filter-data";

interface MoreFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onFiltersApply: (filters: {
    bathrooms?: number | string;
    landSize?: { type: string; size?: number };
    features?: string[];
    tenantCriteria?: string[];
  }) => void;
  currentFilters?: {
    bathrooms?: number | string;
    landSize?: { type: string; size?: number };
    features?: string[];
    tenantCriteria?: string[];
  };
}

const MoreFiltersModal: React.FC<MoreFiltersModalProps> = ({
  isOpen,
  onClose,
  tab,
  onFiltersApply,
  currentFilters = {},
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [bathrooms, setBathrooms] = useState<number | string>("");
  const [landSizeType, setLandSizeType] = useState<string>("plot");
  const [landSizeValue, setLandSizeValue] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTenantCriteria, setSelectedTenantCriteria] = useState<
    string[]
  >([]);

  useClickOutside(modalRef, onClose);

  // Get dynamic data for the specific tab
  const propertyFeatures = getPropertyFeatures(tab);
  const tenantCriteria = getTenantCriteria(tab);
  const landSizeTypes = getLandSizeTypes(tab);
  const bathroomOptions = getBathroomOptions(tab);

  // Initialize values
  useEffect(() => {
    if (currentFilters.bathrooms) {
      setBathrooms(currentFilters.bathrooms);
    }
    if (currentFilters.landSize) {
      setLandSizeType(currentFilters.landSize.type || "plot");
      setLandSizeValue(currentFilters.landSize.size?.toString() || "");
    }
    if (currentFilters.features) {
      setSelectedFeatures([...currentFilters.features]);
    }
    if (currentFilters.tenantCriteria) {
      setSelectedTenantCriteria([...currentFilters.tenantCriteria]);
    }
  }, [currentFilters]);

  const handleBathroomSelect = (value: number | string) => {
    setBathrooms(value);
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures((prev) => {
      if (prev.includes(feature)) {
        return prev.filter((f) => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const handleTenantCriteriaToggle = (criteria: string) => {
    setSelectedTenantCriteria((prev) => {
      if (prev.includes(criteria)) {
        return prev.filter((c) => c !== criteria);
      } else {
        return [...prev, criteria];
      }
    });
  };

  const handleApply = () => {
    const filters = {
      bathrooms: bathrooms || undefined,
      landSize: landSizeValue
        ? {
            type: landSizeType,
            size: parseInt(landSizeValue.replace(/,/g, "")),
          }
        : undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      tenantCriteria:
        selectedTenantCriteria.length > 0 ? selectedTenantCriteria : undefined,
    };

    onFiltersApply(filters);
    onClose();
  };

  const handleClear = () => {
    setBathrooms("");
    setLandSizeType("plot");
    setLandSizeValue("");
    setSelectedFeatures([]);
    setSelectedTenantCriteria([]);
    // Clear filters immediately
    onFiltersApply({
      bathrooms: undefined,
      landSize: undefined,
      features: undefined,
      tenantCriteria: undefined,
    });
  };

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number ? parseInt(number).toLocaleString() : "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-1 w-full max-w-md sm:max-w-lg md:max-w-xl bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-4 max-h-[80vh] overflow-y-auto"
          style={{ minWidth: "320px", maxWidth: "min(90vw, 500px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-[#09391C]">
              More Filters
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Bathrooms Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Bathrooms
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {bathroomOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleBathroomSelect(option.value)}
                  className={`p-2 rounded border text-sm font-medium transition-colors ${
                    bathrooms === option.value
                      ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Land Size Section - Only for buy and jv tabs */}
          {(tab === "buy" || tab === "jv") && landSizeTypes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Land Size
              </h4>

              {/* Land Size Type */}
              <div className="flex gap-2 mb-3">
                {landSizeTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setLandSizeType(type.value)}
                    className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                      landSizeType === type.value
                        ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Land Size Input */}
              <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
                <span className="text-sm text-gray-500">Min</span>
                <input
                  type="text"
                  placeholder="Enter size"
                  value={landSizeValue}
                  onChange={(e) =>
                    setLandSizeValue(formatNumberInput(e.target.value))
                  }
                  className="flex-1 outline-none text-center text-sm"
                />
                <span className="text-sm text-gray-700">
                  {landSizeTypes.find((t) => t.value === landSizeType)?.label}
                </span>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Desired Features
              </h4>
              <span className="text-xs text-gray-500">
                {selectedFeatures.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {propertyFeatures.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 border-2 rounded transition-colors ${
                        selectedFeatures.includes(feature)
                          ? "bg-[#8DDB90] border-[#8DDB90]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedFeatures.includes(feature) && (
                        <Check
                          size={10}
                          className="text-white absolute top-0.5 left-0.5"
                        />
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-gray-700 text-xs">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tenant Criteria Section - Only for rent tab */}
          {tab === "rent" && tenantCriteria.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Tenant Criteria
                </h4>
                <span className="text-xs text-gray-500">
                  {selectedTenantCriteria.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {tenantCriteria.map((criteria) => (
                  <label
                    key={criteria}
                    className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedTenantCriteria.includes(criteria)}
                        onChange={() => handleTenantCriteriaToggle(criteria)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 border-2 rounded transition-colors ${
                          selectedTenantCriteria.includes(criteria)
                            ? "bg-[#8DDB90] border-[#8DDB90]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedTenantCriteria.includes(criteria) && (
                          <Check
                            size={10}
                            className="text-white absolute top-0.5 left-0.5"
                          />
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-gray-700 text-xs">
                      {criteria}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC87F] transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoreFiltersModal;
