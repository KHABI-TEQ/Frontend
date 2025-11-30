/** @format */

"use client";
import React, { useState, useEffect, memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import OptimizedLocationSelection from "@/components/preference-form/OptimizedLocationSelection";

interface JVStep3LandRequirementsProps {
  className?: string;
}

const MEASUREMENT_UNITS = [
  { value: "sqm", label: "Square Meters (sqm)" },
  { value: "plot", label: "Plot(s)" },
  { value: "hectares", label: "Hectares" },
  { value: "acres", label: "Acres" },
];

const JVStep3LandRequirements: React.FC<JVStep3LandRequirementsProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();

    // Local state for land requirements
    const [minLandSize, setMinLandSize] = useState<string>("");
    const [maxLandSize, setMaxLandSize] = useState<string>("");
    const [measurementUnit, setMeasurementUnit] = useState<string>("");

    // Initialize from existing form data
    useEffect(() => {
      if (state.formData?.developmentDetails) {
        const details = state.formData.developmentDetails as any;
        setMinLandSize(details.minLandSize || "");
        setMaxLandSize(details.maxLandSize || "");
        setMeasurementUnit(details.measurementUnit || "");
      }
    }, [state.formData]);

    // Update context when values change
    useEffect(() => {
      updateFormData({
        developmentDetails: {
          ...state.formData?.developmentDetails,
          minLandSize: minLandSize.trim(),
          maxLandSize: maxLandSize.trim(),
          measurementUnit: measurementUnit.trim(),
        },
      } as any);
    }, [minLandSize, maxLandSize, measurementUnit, updateFormData, state.formData?.developmentDetails]);

    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step 3: Land Requirements
          </h3>
          <p className="text-sm text-gray-600">
            Specify your preferred locations and land size requirements
          </p>
        </div>

        {/* Location Selection - Reuse existing component */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800">
            Preferred Location(s) <span className="text-red-500">*</span>
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Select states, LGAs, and specific areas where you want to find land for development
          </p>
          <OptimizedLocationSelection />
        </div>

        {/* Land Size Requirements */}
        <div className="space-y-6">
          <h4 className="text-base font-semibold text-gray-800">
            Land Size Requirements
          </h4>

          {/* Measurement Unit */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Measurement Unit <span className="text-red-500">*</span>
            </label>
            <select
              value={measurementUnit}
              onChange={(e) => setMeasurementUnit(e.target.value)}
              className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="">Select measurement unit...</option>
              {MEASUREMENT_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Land Size */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Minimum Land Size Required <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={minLandSize}
                onChange={(e) => {
                  const value = Math.max(0, parseFloat(e.target.value) || 0);
                  setMinLandSize(value.toString());
                }}
                placeholder="e.g., 1000"
                min="0"
                step="0.01"
                className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                The minimum size of land you need for your development project
              </p>
            </div>

            {/* Maximum Land Size */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Maximum Land Size <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                value={maxLandSize}
                onChange={(e) => {
                  const value = Math.max(0, parseFloat(e.target.value) || 0);
                  setMaxLandSize(value.toString());
                }}
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
                className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                The maximum size you can handle (leave blank if no limit)
              </p>
            </div>
          </div>

          {/* Land Size Summary */}
          {minLandSize && measurementUnit && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h5 className="text-sm font-semibold text-emerald-800 mb-2">
                Land Size Requirements Summary:
              </h5>
              <div className="text-sm text-emerald-700">
                <p>
                  <strong>Minimum:</strong> {minLandSize} {MEASUREMENT_UNITS.find(u => u.value === measurementUnit)?.label}
                </p>
                {maxLandSize && (
                  <p>
                    <strong>Maximum:</strong> {maxLandSize} {MEASUREMENT_UNITS.find(u => u.value === measurementUnit)?.label}
                  </p>
                )}
                {!maxLandSize && (
                  <p className="text-emerald-600 italic">
                    No maximum limit specified
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Land Requirements Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Land Size Guidelines
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consider the type of development when specifying land size</li>
                <li>• Factor in setbacks, green spaces, and infrastructure requirements</li>
                <li>• Multiple smaller locations can be more flexible than one large area</li>
                <li>• Consider future expansion possibilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

JVStep3LandRequirements.displayName = "JVStep3LandRequirements";

export default JVStep3LandRequirements;
