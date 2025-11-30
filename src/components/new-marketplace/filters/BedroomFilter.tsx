/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { getBedroomOptions } from "@/data/filter-data";

interface BedroomFilterProps {
  isOpen: boolean;
  onClose: () => void;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onBedroomSelect: (bedrooms: number | string) => void;
  currentValue?: number | string;
}

const BedroomFilter: React.FC<BedroomFilterProps> = ({
  isOpen,
  onClose,
  tab,
  onBedroomSelect,
  currentValue,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | string>("");

  useClickOutside(modalRef, onClose);

  // Initialize selected value
  useEffect(() => {
    if (currentValue) {
      setSelectedBedrooms(currentValue);
    }
  }, [currentValue]);

  // Get bedroom options for the specific tab
  const bedroomOptions = getBedroomOptions(tab);

  const handleBedroomSelect = (bedrooms: number | string) => {
    setSelectedBedrooms(bedrooms);
    onBedroomSelect(bedrooms);
    onClose();
  };

  const handleClear = () => {
    setSelectedBedrooms("");
    onBedroomSelect("");
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
          className="absolute top-full left-0 mt-1 w-full max-w-xs sm:max-w-sm bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-4"
          style={{ minWidth: "240px", maxWidth: "min(90vw, 320px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#09391C]">Bedrooms</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Bedroom Options Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {bedroomOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBedroomSelect(option.value)}
                className={`p-3 rounded border text-sm font-medium transition-colors ${
                  selectedBedrooms === option.value
                    ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC87F] transition-colors text-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BedroomFilter;
