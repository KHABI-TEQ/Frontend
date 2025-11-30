/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import LocationSearch from "./search/LocationSearch";
import RadioCheck from "../general-components/radioCheck";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import BedroomFilter from "./filters/BedroomFilter";
import DocumentTypeFilter from "./filters/DocumentTypeFilter";
import MoreFiltersModal from "./filters/MoreFiltersModal";
import { Check } from "lucide-react";
import {
  getUsageOptions,
  getHomeConditionOptions,
  getDocumentTypes,
  getPropertyFeatures,
} from "@/data/filter-data";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: "buy" | "jv" | "rent" | "shortlet";
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  tab,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // State for form values
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0, display: "" });
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | string>("");
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | string>(
    "",
  );
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [landSizeType, setLandSizeType] = useState<string>("plot");
  const [landSizeValue, setLandSizeValue] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Get dynamic data for the specific tab
  const usageOptions = getUsageOptions(tab);
  const homeConditionOptions = getHomeConditionOptions(tab);
  const documentTypes = getDocumentTypes(tab);
  const propertyFeatures = getPropertyFeatures(tab);

  // Initialize values from filters
  useEffect(() => {
    if (filters.priceRange) {
      setPriceRange(filters.priceRange);
    }
    if (filters.bedrooms) {
      setSelectedBedrooms(filters.bedrooms);
    }
    if (filters.bathrooms) {
      setSelectedBathrooms(filters.bathrooms);
    }
    if (filters.documentTypes) {
      setSelectedDocuments([...filters.documentTypes]);
    }
    if (filters.landSize) {
      setLandSizeType(filters.landSize.type || "plot");
      setLandSizeValue(filters.landSize.size?.toString() || "");
    }
    if (filters.desiredFeatures) {
      setSelectedFeatures([...filters.desiredFeatures]);
    }
  }, [filters]);

  useClickOutside(modalRef, onClose);

  const handleApplyFilters = () => {
    // Apply all current form values to filters
    if (priceRange.min > 0 || priceRange.max > 0) {
      onFilterChange("priceRange", priceRange);
    }
    if (selectedBedrooms) {
      onFilterChange("bedrooms", selectedBedrooms);
    }
    if (selectedBathrooms) {
      onFilterChange("bathrooms", selectedBathrooms);
    }
    if (selectedDocuments.length > 0) {
      onFilterChange("documentTypes", selectedDocuments);
    }
    if (landSizeValue) {
      onFilterChange("landSize", {
        type: landSizeType,
        size: parseInt(landSizeValue.replace(/,/g, "")),
      });
    }
    if (selectedFeatures.length > 0) {
      onFilterChange("desiredFeatures", selectedFeatures);
    }

    onApplyFilters();
    onClose();
  };

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number ? parseInt(number).toLocaleString() : "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[9999] flex items-end sm:items-center justify-center"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-lg mx-4 mb-0 sm:mb-4 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#09391C]">
                  Filter Properties
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-[#5A5D63]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Usage Options */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Property Type
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {usageOptions.map((item: string, idx: number) => (
                    <RadioCheck
                      key={idx}
                      type="checkbox"
                      name="filterBy"
                      isChecked={filters.usageOptions?.includes(item) || false}
                      value={item}
                      handleChange={() => {
                        const current = filters.usageOptions || [];
                        const updated = current.includes(item)
                          ? current.filter((opt: string) => opt !== item)
                          : [...current, item];
                        onFilterChange("usageOptions", updated);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Location
                </h3>
                <LocationSearch
                  placeholder="Enter state, LGA, or area..."
                  value={filters.locationDisplay || ""}
                  onChange={(location, details) => {
                    if (details) {
                      onFilterChange("selectedState", details.state);
                      onFilterChange("selectedLGA", details.lga);
                      onFilterChange("selectedArea", details.area || "");
                      onFilterChange("locationDisplay", location);
                    } else {
                      onFilterChange("selectedState", "");
                      onFilterChange("selectedLGA", "");
                      onFilterChange("selectedArea", "");
                      onFilterChange("locationDisplay", "");
                    }
                  }}
                />
              </div>

              {/* Price Range - Direct Form */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Min Price
                      </label>
                      <input
                        type="text"
                        placeholder="Enter min"
                        value={
                          priceRange.min > 0
                            ? priceRange.min.toLocaleString()
                            : ""
                        }
                        onChange={(e) => {
                          const value = formatNumberInput(e.target.value);
                          setPriceRange((prev) => ({
                            ...prev,
                            min: value ? parseInt(value.replace(/,/g, "")) : 0,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#8DDB90] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Max Price
                      </label>
                      <input
                        type="text"
                        placeholder="Enter max"
                        value={
                          priceRange.max > 0
                            ? priceRange.max.toLocaleString()
                            : ""
                        }
                        onChange={(e) => {
                          const value = formatNumberInput(e.target.value);
                          setPriceRange((prev) => ({
                            ...prev,
                            max: value ? parseInt(value.replace(/,/g, "")) : 0,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#8DDB90] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Type - Direct Form */}
              {tab !== "jv" && (
                <div>
                  <h3 className="text-sm font-medium text-[#09391C] mb-3">
                    Document Types ({selectedDocuments.length} selected)
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {documentTypes.map((doc) => (
                      <label
                        key={doc}
                        className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc)}
                            onChange={() => {
                              if (selectedDocuments.includes(doc)) {
                                setSelectedDocuments((prev) =>
                                  prev.filter((d) => d !== doc),
                                );
                              } else {
                                setSelectedDocuments((prev) => [...prev, doc]);
                              }
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 border-2 rounded transition-colors ${
                              selectedDocuments.includes(doc)
                                ? "bg-[#8DDB90] border-[#8DDB90]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedDocuments.includes(doc) && (
                              <Check
                                size={10}
                                className="text-white absolute top-0.5 left-0.5"
                              />
                            )}
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-700 flex-1">
                          {doc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bedrooms - Direct Form */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Bedrooms
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((bedroom) => (
                    <button
                      key={bedroom}
                      onClick={() => setSelectedBedrooms(bedroom)}
                      className={`p-2 rounded border text-sm font-medium transition-colors ${
                        selectedBedrooms === bedroom
                          ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {bedroom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms - Direct Form */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Bathrooms
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((bathroom) => (
                    <button
                      key={bathroom}
                      onClick={() => setSelectedBathrooms(bathroom)}
                      className={`p-2 rounded border text-sm font-medium transition-colors ${
                        selectedBathrooms === bathroom
                          ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {bathroom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Size - Direct Form */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Land Size
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {["plot", "acres", "sqm"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setLandSizeType(type)}
                        className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors capitalize ${
                          landSizeType === type
                            ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter land size"
                    value={landSizeValue}
                    onChange={(e) =>
                      setLandSizeValue(formatNumberInput(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#8DDB90] text-sm"
                  />
                </div>
              </div>

              {/* Features - Direct Form */}
              <div>
                <h3 className="text-sm font-medium text-[#09391C] mb-3">
                  Desired Features ({selectedFeatures.length} selected)
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {propertyFeatures.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature)}
                          onChange={() => {
                            if (selectedFeatures.includes(feature)) {
                              setSelectedFeatures((prev) =>
                                prev.filter((f) => f !== feature),
                              );
                            } else {
                              setSelectedFeatures((prev) => [...prev, feature]);
                            }
                          }}
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
                      <span className="ml-3 text-sm text-gray-700 flex-1">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
              <button
                onClick={onClearFilters}
                className="w-full h-12 border border-[#FF3D00] text-[#FF3D00] rounded-lg font-medium hover:bg-[#FF3D00] hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="w-full h-12 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;
