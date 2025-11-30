/** @format */

"use client";
import React, { useState, useEffect, memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";

interface JVStep2DevelopmentTypeProps {
  className?: string;
}

const DEVELOPMENT_TYPES = [
  {
    value: "residential",
    label: "Residential",
    description: "Houses, apartments, condos, and other living spaces",
    icon: "🏠",
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Office buildings, retail spaces, and business properties",
    icon: "🏢",
  },
  {
    value: "mixed-use",
    label: "Mixed-use Development",
    description: "Combined residential and commercial properties",
    icon: "🏗️",
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "Warehouses, factories, and industrial facilities",
    icon: "🏭",
  },
];

const JVStep2DevelopmentType: React.FC<JVStep2DevelopmentTypeProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();

    // Local state for selected development types
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Initialize from existing form data
    useEffect(() => {
      if (state.formData?.developmentDetails?.developmentTypes) {
        setSelectedTypes(state.formData.developmentDetails.developmentTypes);
      }
    }, [state.formData]);

    // Update context when selection changes
    useEffect(() => {
      updateFormData({
        developmentDetails: {
          ...state.formData?.developmentDetails,
          developmentTypes: selectedTypes,
        },
      } as any);
    }, [selectedTypes, updateFormData, state.formData?.developmentDetails]);

    const handleTypeToggle = (type: string) => {
      setSelectedTypes(prev => {
        if (prev.includes(type)) {
          return prev.filter(t => t !== type);
        } else {
          return [...prev, type];
        }
      });
    };

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step 2: Preferred Development Type
          </h3>
          <p className="text-sm text-gray-600">
            Select all development types you're interested in partnering on
          </p>
        </div>

        <div className="space-y-4">
          {DEVELOPMENT_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.value);
            
            return (
              <div
                key={type.value}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                }`}
                onClick={() => handleTypeToggle(type.value)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 mt-1">
                    {type.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {type.label}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </div>
                      
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedTypes.length > 0 && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">
              Selected Development Types:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((type) => {
                const typeData = DEVELOPMENT_TYPES.find(t => t.value === type);
                return (
                  <span
                    key={type}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    {typeData?.icon} {typeData?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Development Expertise
              </h4>
              <p className="text-sm text-blue-700">
                Selecting multiple development types increases your chances of finding suitable joint venture opportunities. You can always refine your preferences later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

JVStep2DevelopmentType.displayName = "JVStep2DevelopmentType";

export default JVStep2DevelopmentType;
