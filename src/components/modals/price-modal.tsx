"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import * as Yup from "yup";

interface PriceRange {
  min: number;
  max: number;
}

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: PriceFilters) => void;
  currentFilters?: PriceFilters;
  propertyType?: "buy" | "rent" | "lease";
}

interface PriceFilters {
  priceRange: PriceRange;
  sortBy: "price_asc" | "price_desc" | "date_new" | "date_old";
  currency: "NGN" | "USD";
  includeNegotiable: boolean;
}

const validationSchema = Yup.object({
  minPrice: Yup.number()
    .min(0, "Minimum price cannot be negative")
    .required("Minimum price is required"),
  maxPrice: Yup.number()
    .min(
      Yup.ref("minPrice"),
      "Maximum price must be greater than minimum price",
    )
    .required("Maximum price is required"),
});

const predefinedRanges = {
  buy: [
    { label: "Under ₦5M", min: 0, max: 5000000 },
    { label: "₦5M - ₦15M", min: 5000000, max: 15000000 },
    { label: "₦15M - ₦30M", min: 15000000, max: 30000000 },
    { label: "₦30M - ₦50M", min: 30000000, max: 50000000 },
    { label: "₦50M - ₦100M", min: 50000000, max: 100000000 },
    { label: "Above ₦100M", min: 100000000, max: 1000000000 },
  ],
  rent: [
    { label: "Under ₦50K", min: 0, max: 50000 },
    { label: "₦50K - ₦100K", min: 50000, max: 100000 },
    { label: "₦100K - ₦200K", min: 100000, max: 200000 },
    { label: "₦200K - ₦500K", min: 200000, max: 500000 },
    { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
    { label: "Above ₦1M", min: 1000000, max: 10000000 },
  ],
  lease: [
    { label: "Under ₦500K", min: 0, max: 500000 },
    { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
    { label: "₦1M - ₦3M", min: 1000000, max: 3000000 },
    { label: "₦3M - ₦5M", min: 3000000, max: 5000000 },
    { label: "₦5M - ₦10M", min: 5000000, max: 10000000 },
    { label: "Above ₦10M", min: 10000000, max: 100000000 },
  ],
};

const sortOptions = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "date_new", label: "Newest First" },
  { value: "date_old", label: "Oldest First" },
];

const PriceModal: React.FC<PriceModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters,
  propertyType = "buy",
}) => {
  const [selectedRange, setSelectedRange] = useState<PriceRange | null>(null);
  const [customRange, setCustomRange] = useState(false);

  const ranges = predefinedRanges[propertyType];

  const formik = useFormik({
    initialValues: {
      minPrice: currentFilters?.priceRange.min || 0,
      maxPrice: currentFilters?.priceRange.max || 100000000,
      sortBy: currentFilters?.sortBy || "date_new",
      currency: currentFilters?.currency || "NGN",
      includeNegotiable: currentFilters?.includeNegotiable || false,
    },
    validationSchema,
    onSubmit: (values) => {
      const filters: PriceFilters = {
        priceRange: {
          min: values.minPrice,
          max: values.maxPrice,
        },
        sortBy: values.sortBy as any,
        currency: values.currency as any,
        includeNegotiable: values.includeNegotiable,
      };
      onApply(filters);
      onClose();
    },
  });

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? Number(numericValue).toLocaleString() : "";
  };

  const handlePredefinedRange = (range: { min: number; max: number }) => {
    setSelectedRange(range);
    setCustomRange(false);
    formik.setFieldValue("minPrice", range.min);
    formik.setFieldValue("maxPrice", range.max);
  };

  const handleCustomRange = () => {
    setCustomRange(true);
    setSelectedRange(null);
  };

  const resetFilters = () => {
    formik.resetForm();
    setSelectedRange(null);
    setCustomRange(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8DDB90] to-[#6BC46D] text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={faClose} className="text-white" />
            </button>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faFilter} className="text-2xl" />
              <div>
                <h2 className="text-xl font-bold">Price & Sort Filters</h2>
                <p className="text-white/90 text-sm">
                  Customize your search criteria
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <form
            onSubmit={formik.handleSubmit}
            className="p-6 max-h-[60vh] overflow-y-auto space-y-6"
          >
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Currency
              </label>
              <div className="flex space-x-3">
                {["NGN", "USD"].map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => formik.setFieldValue("currency", currency)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      formik.values.currency === currency
                        ? "border-[#8DDB90] bg-[#8DDB90] text-white"
                        : "border-gray-200 hover:border-[#8DDB90] text-gray-700"
                    }`}
                  >
                    {currency === "NGN" ? "₦ Nigerian Naira" : "$ US Dollar"}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range
              </label>

              {/* Predefined Ranges */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ranges.map((range, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePredefinedRange(range)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedRange?.min === range.min &&
                      selectedRange?.max === range.max
                        ? "border-[#8DDB90] bg-[#8DDB90] text-white"
                        : "border-gray-200 hover:border-[#8DDB90] text-gray-700"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Custom Range Toggle */}
              <button
                type="button"
                onClick={handleCustomRange}
                className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                  customRange
                    ? "border-[#8DDB90] bg-[#8DDB90] text-white"
                    : "border-gray-200 hover:border-[#8DDB90] text-gray-700"
                }`}
              >
                Custom Range
              </button>

              {/* Custom Range Inputs */}
              {customRange && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Minimum Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {formik.values.currency === "NGN" ? "₦" : "$"}
                      </span>
                      <input
                        type="text"
                        name="minPrice"
                        value={formatNumber(formik.values.minPrice.toString())}
                        onChange={(e) => {
                          const numericValue = Number(
                            e.target.value.replace(/,/g, ""),
                          );
                          formik.setFieldValue("minPrice", numericValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-sm"
                        placeholder="0"
                      />
                    </div>
                    {formik.touched.minPrice && formik.errors.minPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.minPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Maximum Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {formik.values.currency === "NGN" ? "₦" : "$"}
                      </span>
                      <input
                        type="text"
                        name="maxPrice"
                        value={formatNumber(formik.values.maxPrice.toString())}
                        onChange={(e) => {
                          const numericValue = Number(
                            e.target.value.replace(/,/g, ""),
                          );
                          formik.setFieldValue("maxPrice", numericValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-sm"
                        placeholder="1000000"
                      />
                    </div>
                    {formik.touched.maxPrice && formik.errors.maxPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.maxPrice}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FontAwesomeIcon icon={faSort} className="mr-2" />
                Sort By
              </label>
              <select
                name="sortBy"
                value={formik.values.sortBy}
                onChange={formik.handleChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Options */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="includeNegotiable"
                  checked={formik.values.includeNegotiable}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                />
                <span className="text-sm text-gray-700">
                  Include properties marked as &quot;Price Negotiable&quot;
                </span>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset Filters
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  formik.handleSubmit();
                }}
                className="px-6 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PriceModal;
