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

interface BudgetSelectionProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

// Memoized budget period labels
const BUDGET_PERIOD_LABELS = {
  buy: "Total Purchase Budget",
  rent: "Yearly Rent Budget",
  "joint-venture": "Investment Budget",
  shortlet: "Per Night Budget",
};
 
const OptimizedBudgetSelection: React.FC<BudgetSelectionProps> = memo(
  ({ preferenceType, className = "" }) => {
    const { state, updateFormData, getMinBudgetForLocation } =
      usePreferenceForm();
    // Remove local debouncing - now handled by context

    // Local state to prevent excessive re-renders
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [isCustomBudget, setIsCustomBudget] = useState(false);


    // Memoized budget label
    const budgetLabel = useMemo(
      () => BUDGET_PERIOD_LABELS[preferenceType] || "Budget",
      [preferenceType],
    ); 

    // Memoized minimum budget requirement
    const minimumBudget = useMemo(() => {
      const location = state.formData.location?.state;
      if (location) {
        return getMinBudgetForLocation(location, preferenceType);
      }
      return 0;
    }, [
      state.formData.location?.state,
      preferenceType,
      getMinBudgetForLocation,
    ]);

    // Initialize local state from context and reset when context resets
    useEffect(() => {
      const budgetData = state.formData.budget;

      // Reset local state if no budget data (form was reset)
      if (!budgetData || Object.keys(state.formData).length === 0) {
        setMinPrice(0);
        setMaxPrice(0);
        setSelectedPreset("");
        setIsCustomBudget(false);
        return;
      }
 
      if (budgetData) {
        setMinPrice(budgetData.minPrice || 0);
        setMaxPrice(budgetData.maxPrice || 0);

        setIsCustomBudget(true);
        setSelectedPreset("");
      }
    }, [state.formData, state.currentStep]); // Watch for changes in form data and step

    // Format number with commas
    const formatNumberWithCommas = useCallback((value: number): string => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, []);

    // Parse number from formatted string
    const parseFormattedNumber = useCallback((value: string): number => {
      const cleaned = value.replace(/,/g, "");
      return parseInt(cleaned) || 0;
    }, []);

    // Use context's built-in debouncing
    const debouncedUpdateFormData = useCallback(
      (min: number, max: number) => {
        updateFormData({
          budget: {
            minPrice: min,
            maxPrice: max,
            currency: "NGN",
          },
        }); // Context handles debouncing
      },
      [updateFormData],
    );

    // Update form data when local state changes
    useEffect(() => {
      if (minPrice || maxPrice) {
        debouncedUpdateFormData(minPrice, maxPrice);
      }
    }, [minPrice, maxPrice, debouncedUpdateFormData]);


    // Handle min price change
    const handleMinPriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFormattedNumber(e.target.value);
        setMinPrice(value);
        setSelectedPreset("");
        setIsCustomBudget(true);
      },
      [parseFormattedNumber],
    );

    // Handle max price change
    const handleMaxPriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFormattedNumber(e.target.value);
        setMaxPrice(value);
        setSelectedPreset("");
        setIsCustomBudget(true);
      },
      [parseFormattedNumber],
    );

    // Validation messages
    const validationMessage = useMemo(() => {
      if (minPrice && maxPrice && minPrice >= maxPrice) {
        return "Maximum budget must be greater than minimum budget";
      }
      if (minimumBudget && minPrice && minPrice < minimumBudget) {
        return `Minimum budget for ${state.formData.location?.state} is ₦${formatNumberWithCommas(minimumBudget)}`;
      }
      return "";
    }, [
      minPrice,
      maxPrice,
      minimumBudget,
      state.formData.location?.state,
      formatNumberWithCommas,
    ]);

    return (
      <motion.div
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {budgetLabel}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Select your preferred budget range for{" "}
            {preferenceType === "buy"
              ? "purchasing"
              : preferenceType === "rent"
                ? "renting"
                : preferenceType === "joint-venture"
                  ? "investment"
                  : "booking"}{" "}
            a property
          </p>
        </div>

 

        {/* Custom Budget Option */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Custom Budget Range
            </h4>
          </div>

          {/* Custom Budget Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Minimum Budget (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  ₦
                </span>
                <input
                  type="text"
                  value={minPrice ? formatNumberWithCommas(minPrice) : ""}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  className={`w-full pl-8 pr-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    validationMessage && validationMessage.includes("Minimum")
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Maximum Budget (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  ₦
                </span>
                <input
                  type="text"
                  value={maxPrice ? formatNumberWithCommas(maxPrice) : ""}
                  onChange={handleMaxPriceChange}
                  placeholder="0"
                  className={`w-full pl-8 pr-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    validationMessage && validationMessage.includes("Maximum")
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <motion.div
              className="text-sm text-red-500 font-medium flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{validationMessage}</span>
            </motion.div>
          )}

          {/* Minimum Budget Information */}
          {minimumBudget > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <span className="font-medium">
                  Minimum budget for {state.formData.location?.state}:
                </span>{" "}
                ₦{formatNumberWithCommas(minimumBudget)}
              </div>
            </div>
          )}
        </div>

        {/* Budget Summary */}
        {(minPrice || maxPrice) ? (
          <motion.div
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">
              Budget Summary
            </h4>
            <div className="space-y-1 text-sm text-emerald-700">
              <div>
                <span className="font-medium">Budget Range:</span> ₦
                {formatNumberWithCommas(minPrice)} - ₦
                {formatNumberWithCommas(maxPrice)}
              </div>
              <div>
                <span className="font-medium">Preference Type:</span>{" "}
                {preferenceType.charAt(0).toUpperCase() +
                  preferenceType.slice(1)}
              </div>
              {state.formData.location?.state && (
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {state.formData.location.state}
                </div>
              )}
            </div>
          </motion.div>
        ): null}

        {/* Budget Tips */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            💡 Budget Tips
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {preferenceType === "buy" && (
              <>
                <li>
                  • Consider additional costs like legal fees, agency fees, and
                  property registration
                </li>
                <li>
                  • Budget for property inspection and due diligence costs
                </li>
                <li>• Factor in renovation or furnishing costs if needed</li>
              </>
            )}
            {preferenceType === "rent" && (
              <>
                <li>
                  • Remember to budget for security deposit (usually 1-2 years
                  rent)
                </li>
                <li>• Consider agency fees (typically 10% of annual rent)</li>
                <li>• Factor in utility costs and maintenance fees</li>
              </>
            )}
            {preferenceType === "joint-venture" && (
              <>
                <li>
                  • Consider development timeline and cash flow requirements
                </li>
                <li>
                  • Factor in professional fees for legal and architectural
                  services
                </li>
                <li>
                  • Budget for contingencies (typically 10-15% of total budget)
                </li>
              </>
            )}
            {preferenceType === "shortlet" && (
              <>
                <li>• Consider cleaning fees and security deposits</li>
                <li>• Factor in service charges and utility costs</li>
                <li>• Check for peak season pricing variations</li>
              </>
            )}
          </ul>
        </div>
      </motion.div>
    );
  },
);

OptimizedBudgetSelection.displayName = "OptimizedBudgetSelection";

export default OptimizedBudgetSelection;
