/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { getPriceRanges, PriceRange } from "@/data/filter-data";

interface PriceRangeFilterProps {
  isOpen: boolean;
  onClose: () => void;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onPriceSelect: (priceRange: {
    min: number;
    max: number;
    display: string;
  }) => void;
  currentValue?: { min: number; max: number; display: string };
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  isOpen,
  onClose,
  tab,
  onPriceSelect,
  currentValue,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<string>("");
  const [customMin, setCustomMin] = useState<string>("");
  const [customMax, setCustomMax] = useState<string>("");

  useClickOutside(modalRef, onClose);

  // Get predefined price ranges for the specific tab
  const priceRanges = getPriceRanges(tab);

  // Initialize values
  useEffect(() => {
    if (currentValue) {
      setCustomMin(currentValue.min > 0 ? currentValue.min.toString() : "");
      setCustomMax(currentValue.max > 0 ? currentValue.max.toString() : "");

      // Check if current value matches any predefined range
      const matchingRange = priceRanges.find(
        (range) =>
          range.min === currentValue.min && range.max === currentValue.max,
      );
      if (matchingRange) {
        setSelectedRange(matchingRange.label);
      }
    }
  }, [currentValue]);

  const handlePredefinedRangeSelect = (range: PriceRange) => {
    setSelectedRange(range.label);
    setCustomMin("");
    setCustomMax("");

    onPriceSelect({
      min: range.min,
      max: range.max,
      display: range.label,
    });
  };

  const handleCustomRangeApply = () => {
    const min = customMin ? parseInt(customMin.replace(/,/g, "")) : 0;
    const max = customMax ? parseInt(customMax.replace(/,/g, "")) : 0;

    if (min > 0 || max > 0) {
      const minDisplay = min > 0 ? `₦${min.toLocaleString()}` : "Min";
      const maxDisplay = max > 0 ? `₦${max.toLocaleString()}` : "Max";

      onPriceSelect({
        min,
        max,
        display: `${minDisplay} - ${maxDisplay}`,
      });
    }

    setSelectedRange("");
  };

  const handleClear = () => {
    setSelectedRange("");
    setCustomMin("");
    setCustomMax("");
    onPriceSelect({ min: 0, max: 0, display: "" });
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
          className="absolute top-full left-0 mt-1 w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-4"
          style={{ minWidth: "280px", maxWidth: "min(90vw, 400px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#09391C]">
              Price Range
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Predefined Ranges */}
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </h4>
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePredefinedRangeSelect(range)}
                className={`w-full text-left p-2 rounded border transition-colors ${
                  selectedRange === range.label
                    ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Custom Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Min Price
                </label>
                <input
                  type="text"
                  placeholder="Enter min"
                  value={customMin}
                  onChange={(e) =>
                    setCustomMin(formatNumberInput(e.target.value))
                  }
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
                  value={customMax}
                  onChange={(e) =>
                    setCustomMax(formatNumberInput(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#8DDB90] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleCustomRangeApply}
              className="flex-1 px-3 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC87F] transition-colors text-sm"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceRangeFilter;
