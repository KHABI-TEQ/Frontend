/** @format */

"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { usePreferenceForm } from "@/context/preference-form-context";
import { BudgetRange } from "@/types/preference-form";

interface BudgetSelectionProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

const BudgetSelection: React.FC<BudgetSelectionProps> = memo(
  ({ preferenceType, className = "" }) => {
    const {
      state,
      updateFormData,
      getValidationErrorsForField,
      getMinBudgetForLocation,
    } = usePreferenceForm();

    const [minPriceInput, setMinPriceInput] = useState<string>("");
    const [maxPriceInput, setMaxPriceInput] = useState<string>("");
    const [minPriceRaw, setMinPriceRaw] = useState<number>(0);
    const [maxPriceRaw, setMaxPriceRaw] = useState<number>(0);

    // Get validation errors
    const minPriceErrors = getValidationErrorsForField("budget.minPrice");
    const maxPriceErrors = getValidationErrorsForField("budget.maxPrice");

    // Format number with commas
    const formatNumberWithCommas = useCallback((value: string): string => {
      const cleaned = value.replace(/\D/g, "");
      return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, []);

    // Parse formatted number to raw number
    const parseFormattedNumber = useCallback((value: string): number => {
      return parseInt(value.replace(/,/g, ""), 10) || 0;
    }, []);

    // Initialize from context data and clear when form is reset
    useEffect(() => {
      // If formData is empty (form was reset), clear all local state
      if (
        !state.formData ||
        Object.keys(state.formData).length === 0 ||
        !state.formData.budget
      ) {
        setMinPriceInput("");
        setMaxPriceInput("");
        setMinPriceRaw(0);
        setMaxPriceRaw(0);
        return;
      }

      if (state.formData.budget) {
        const budget = state.formData.budget;
        if (budget.minPrice) {
          setMinPriceRaw(budget.minPrice);
          setMinPriceInput(formatNumberWithCommas(budget.minPrice.toString()));
        } else {
          setMinPriceInput("");
          setMinPriceRaw(0);
        }
        if (budget.maxPrice) {
          setMaxPriceRaw(budget.maxPrice);
          setMaxPriceInput(formatNumberWithCommas(budget.maxPrice.toString()));
        } else {
          setMaxPriceInput("");
          setMaxPriceRaw(0);
        }
      }
    }, [state.formData, formatNumberWithCommas]);

    // Get minimum budget requirement
    const minBudgetRequired = useMemo(() => {
      if (state.formData.location?.state) {
        return getMinBudgetForLocation(
          state.formData.location.state,
          preferenceType,
        );
      }
      return getMinBudgetForLocation("default", preferenceType);
    }, [
      state.formData.location?.state,
      preferenceType,
      getMinBudgetForLocation,
    ]);

    // Ref to track if we're updating to prevent loops
    const isUpdatingRef = useRef(false);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced update to prevent excessive context updates
    const debouncedUpdateBudget = useCallback(() => {
      if (isUpdatingRef.current) return;

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        if (minPriceRaw > 0 || maxPriceRaw > 0) {
          const budgetData: BudgetRange = {
            minPrice: minPriceRaw,
            maxPrice: maxPriceRaw,
            currency: "NGN",
          };

          isUpdatingRef.current = true;
          updateFormData({
            budget: budgetData,
          });

          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      }, 300);
    }, [minPriceRaw, maxPriceRaw, updateFormData]);

    // Update context when values change
    useEffect(() => {
      debouncedUpdateBudget();

      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [debouncedUpdateBudget]);

    // Handle min price change - optimized to batch state updates
    const handleMinPriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatNumberWithCommas(value);
        const raw = parseFormattedNumber(formatted);

        // Batch state updates to prevent multiple re-renders
        React.startTransition(() => {
          setMinPriceInput(formatted);
          setMinPriceRaw(raw);
        });
      },
      [formatNumberWithCommas, parseFormattedNumber],
    );

    // Handle max price change - optimized to batch state updates
    const handleMaxPriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatNumberWithCommas(value);
        const raw = parseFormattedNumber(formatted);

        // Batch state updates to prevent multiple re-renders
        React.startTransition(() => {
          setMaxPriceInput(formatted);
          setMaxPriceRaw(raw);
        });
      },
      [formatNumberWithCommas, parseFormattedNumber],
    );

    // Get budget label based on preference type
    const getBudgetLabel = useCallback(() => {
      switch (preferenceType) {
        case "buy":
          return "Purchase Budget";
        case "rent":
          return "Monthly Rent Budget";
        case "joint-venture":
          return "Investment Budget";
        case "shortlet":
          return "Budget Per Night";
        default:
          return "Budget Range";
      }
    }, [preferenceType]);

    // Get input placeholders
    const getPlaceholders = useCallback(() => {
      switch (preferenceType) {
        case "buy":
          return {
            min: "Enter minimum purchase price",
            max: "Enter maximum purchase price",
          };
        case "rent":
          return {
            min: "Enter minimum monthly rent",
            max: "Enter maximum monthly rent",
          };
        case "joint-venture":
          return {
            min: "Enter minimum investment amount",
            max: "Enter maximum investment amount",
          };
        case "shortlet":
          return {
            min: "Enter minimum price per night",
            max: "Enter maximum price per night",
          };
        default:
          return {
            min: "Enter minimum price",
            max: "Enter maximum price",
          };
      }
    }, [preferenceType]);

    const placeholders = useMemo(() => getPlaceholders(), [getPlaceholders]);

    // Memoized validation status to prevent recalculation on every render
    const validationStatus = useMemo(
      () => ({
        hasMinPriceError: minPriceErrors.length > 0,
        hasMaxPriceError: maxPriceErrors.length > 0,
        isMinBelowThreshold: minPriceRaw > 0 && minPriceRaw < minBudgetRequired,
        isMaxLessThanMin:
          maxPriceRaw > 0 && minPriceRaw > 0 && maxPriceRaw <= minPriceRaw,
      }),
      [
        minPriceErrors,
        maxPriceErrors,
        minPriceRaw,
        maxPriceRaw,
        minBudgetRequired,
      ],
    );

    const {
      hasMinPriceError,
      hasMaxPriceError,
      isMinBelowThreshold,
      isMaxLessThanMin,
    } = validationStatus;

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Budget Label */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getBudgetLabel()}
          </h3>
          <p className="text-sm text-gray-600">
            Specify your budget range in Nigerian Naira (₦)
          </p>
        </div>

        {/* Budget Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Minimum Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Minimum Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">₦</span>
              </div>
              <input
                type="text"
                value={minPriceInput}
                onChange={handleMinPriceChange}
                placeholder={placeholders.min}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Min Price Errors */}
            {hasMinPriceError && (
              <p className="text-sm text-red-500 font-medium">
                {minPriceErrors[0].message}
              </p>
            )}

            {/* Below Threshold Warning */}
            {isMinBelowThreshold && !hasMinPriceError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium"
              >
                ��{minBudgetRequired.toLocaleString()} is the minimum required
                for this location.
              </motion.p>
            )}

            {/* Min Price Valid */}
            {minPriceRaw > 0 && !hasMinPriceError && !isMinBelowThreshold && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-600 font-medium"
              >
                ₦{minPriceRaw.toLocaleString()}
              </motion.p>
            )}
          </div>

          {/* Maximum Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Maximum Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">₦</span>
              </div>
              <input
                type="text"
                value={maxPriceInput}
                onChange={handleMaxPriceChange}
                placeholder={placeholders.max}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Max Price Errors */}
            {hasMaxPriceError && (
              <p className="text-sm text-red-500 font-medium">
                {maxPriceErrors[0].message}
              </p>
            )}

            {/* Max Less Than Min Warning */}
            {isMaxLessThanMin && !hasMaxPriceError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium"
              >
                Maximum price must be greater than minimum price.
              </motion.p>
            )}

            {/* Max Price Valid */}
            {maxPriceRaw > 0 && !hasMaxPriceError && !isMaxLessThanMin && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-600 font-medium"
              >
                ₦{maxPriceRaw.toLocaleString()}
              </motion.p>
            )}
          </div>
        </div>

        {/* Budget Range Display */}
        {minPriceRaw > 0 && maxPriceRaw > 0 && minPriceRaw < maxPriceRaw && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">
              Budget Range
            </h4>
            <p className="text-sm text-emerald-700">
              <span className="font-medium">From:</span> ₦
              {minPriceRaw.toLocaleString()} <br />
              <span className="font-medium">To:</span> ₦
              {maxPriceRaw.toLocaleString()} <br />
              <span className="font-medium">Range:</span> ₦
              {(maxPriceRaw - minPriceRaw).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Budget Guidelines */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Budget Guidelines
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              • Minimum budget for{" "}
              {state.formData.location?.state || "this location"}: ��
              {minBudgetRequired.toLocaleString()}
            </p>
            <p>
              • Your budget range will help us find the best matches for you
            </p>
            <p>• Premium features may require higher budget ranges</p>
            {preferenceType === "rent" && (
              <p>• Consider additional costs like agent fees and deposits</p>
            )}
            {preferenceType === "buy" && (
              <p>
                • Consider additional costs like legal fees and registration
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

BudgetSelection.displayName = "BudgetSelection";

export default BudgetSelection;
