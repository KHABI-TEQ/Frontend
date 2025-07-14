/** @format */

"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Select, { MultiValue, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferenceForm } from "@/context/preference-form-context";
import { LocationSelection as LocationSelectionType } from "@/types/preference-form";
import {
  getStates,
  getLGAsByState,
  getAreasByStateLGA,
} from "@/utils/location-utils";

// Types
interface Option {
  value: string;
  label: string;
}

// Custom select styles
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "48px",
    border:
      state.hasValue && !state.selectProps.hasError
        ? "2px solid #10B981"
        : state.selectProps.hasError
          ? "2px solid #EF4444"
          : state.isFocused
            ? "2px solid #10B981"
            : "1px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.selectProps.hasError ? "#EF4444" : "#10B981",
    },
    transition: "all 0.2s ease",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "8px 12px",
    fontSize: "15px",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "15px",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#D1FAE5",
    borderRadius: "6px",
    border: "1px solid #10B981",
    maxWidth: "150px",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#047857",
    fontSize: "13px",
    fontWeight: "500",
    padding: "2px 6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#047857",
    "&:hover": {
      backgroundColor: "#10B981",
      color: "white",
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10B981"
      : state.isFocused
        ? "#F3F4F6"
        : "white",
    color: state.isSelected ? "white" : "#374151",
    padding: "10px 12px",
    fontSize: "15px",
    "&:hover": {
      backgroundColor: state.isSelected ? "#10B981" : "#F3F4F6",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 50,
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: "4px",
    borderRadius: "8px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#6B7280",
    "&:hover": {
      color: "#10B981",
    },
  }),
};

// Compact select styles for areas
const compactSelectStyles = {
  ...customSelectStyles,
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "40px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "6px",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontSize: "13px",
  }),
};

interface LocationSelectionProps {
  className?: string;
}

const LocationSelectionComponent: React.FC<LocationSelectionProps> = ({
  className = "",
}) => {
  const { state, updateFormData, getValidationErrorsForField } =
    usePreferenceForm();
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGAs, setSelectedLGAs] = useState<Option[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<Option[]>([]);
  const [lgaAreaMap, setLgaAreaMap] = useState<{ [lga: string]: Option[] }>({});

  // Get validation errors
  const stateErrors = getValidationErrorsForField("location.state");
  const lgaErrors = getValidationErrorsForField("location.lgas");
  const areaErrors = getValidationErrorsForField("location.areas");

  // Initialize from context data and clear when form is reset
  useEffect(() => {
    // If formData is empty (form was reset), clear all local state
    if (
      !state.formData ||
      Object.keys(state.formData).length === 0 ||
      !state.formData.location
    ) {
      setSelectedState(null);
      setSelectedLGAs([]);
      setSelectedAreas([]);
      setLgaAreaMap({});
      return;
    }

    if (state.formData.location) {
      const location = state.formData.location;

      if (location.state && !selectedState) {
        setSelectedState({ value: location.state, label: location.state });
      }

      if (location.lgas && selectedLGAs.length === 0) {
        const lgaOptions = location.lgas.map((lga) => ({
          value: lga,
          label: lga,
        }));
        setSelectedLGAs(lgaOptions);
      }

      if (location.areas && selectedAreas.length === 0) {
        const areaOptions = location.areas.map((area) => ({
          value: area,
          label: area,
        }));
        setSelectedAreas(areaOptions);
      }
    }
  }, [state.formData]);

  // Memoized options
  const stateOptions = useMemo(
    () =>
      getStates().map((state: string) => ({
        value: state,
        label: state,
      })),
    [],
  );

  const lgaOptions = useMemo(() => {
    if (!selectedState) return [];
    const lgas = getLGAsByState(selectedState.value);
    return lgas.map((lga: string) => ({
      value: lga,
      label: lga,
    }));
  }, [selectedState]);

  // Build area options for each selected LGA separately
  useEffect(() => {
    if (!selectedState || selectedLGAs.length === 0) {
      setLgaAreaMap({});
      return;
    }

    const newLgaAreaMap: { [lga: string]: Option[] } = {};
    selectedLGAs.forEach((lga) => {
      const areas = getAreasByStateLGA(selectedState.value, lga.value);
      newLgaAreaMap[lga.value] = areas.map((area) => ({
        value: `${area} - ${lga.label}`,
        label: area,
      }));
    });
    setLgaAreaMap(newLgaAreaMap);
  }, [selectedLGAs, selectedState]);

  // Update context when values change
  useEffect(() => {
    const locationData: LocationSelectionType = {
      state: selectedState?.value || "",
      lgas: selectedLGAs.map((lga) => lga.value),
      areas: selectedAreas.map((area) => area.value),
    };

    updateFormData({
      location: locationData,
    });
  }, [selectedState, selectedLGAs, selectedAreas, updateFormData]);

  // Handle state change
  const handleStateChange = useCallback((selected: SingleValue<Option>) => {
    setSelectedState(selected);
    setSelectedLGAs([]);
    setSelectedAreas([]);
    setLgaAreaMap({});
  }, []);

  // Handle LGA change (with create option for custom LGAs)
  const handleLGAChange = useCallback(
    (selectedOptions: MultiValue<Option>) => {
      const options = Array.from(selectedOptions);
      setSelectedLGAs(options);

      // Reset areas that are not in the selected LGAs
      const validAreas = selectedAreas.filter((area) => {
        return options.some((lga) => area.value.includes(lga.label));
      });
      setSelectedAreas(validAreas);
    },
    [selectedAreas],
  );

  // Handle area change for specific LGA (with create option for custom areas)
  const handleAreaChangeForLGA = useCallback(
    (lgaValue: string, selectedOptions: MultiValue<Option>) => {
      const options = Array.from(selectedOptions);

      // Remove existing areas for this LGA and add new ones
      const otherLGAAreas = selectedAreas.filter(
        (area) => !area.value.includes(lgaValue),
      );

      const newAreas = [...otherLGAAreas, ...options];

      if (newAreas.length <= 3) {
        setSelectedAreas(newAreas);
      }
    },
    [selectedAreas],
  );

  // Generate area display text
  const getAreaDisplayText = useCallback(() => {
    if (selectedAreas.length === 0) return "";

    if (selectedAreas.length <= 3) {
      return selectedAreas.map((area) => area.label.split(" - ")[0]).join(", ");
    }

    const first3 = selectedAreas
      .slice(0, 3)
      .map((area) => area.label.split(" - ")[0]);
    const remaining = selectedAreas.length - 3;
    return `${first3.join(", ")} +${remaining} more`;
  }, [selectedAreas]);

  // Check if we should show sections
  const shouldShowLGASection = selectedState !== null;
  const shouldShowAreasSection = selectedLGAs.length > 0;

  // Dynamic spacing based on visible sections
  const getSectionSpacing = () => {
    if (!shouldShowLGASection) return "space-y-2"; // Minimal spacing when only state
    if (!shouldShowAreasSection) return "space-y-3"; // Medium spacing for state + LGA
    return "space-y-4"; // Full spacing for all sections
  };

  return (
    <div className={`${getSectionSpacing()} ${className}`}>
      {/* State Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          State <span className="text-red-500">*</span>
        </label>
        <Select
          options={stateOptions}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Search and select state..."
          styles={{
            ...customSelectStyles,
            control: (provided: any, state: any) => ({
              ...provided,
              minHeight: "48px",
              border:
                state.hasValue && stateErrors.length === 0
                  ? "2px solid #10B981"
                  : stateErrors.length > 0
                    ? "2px solid #EF4444"
                    : state.isFocused
                      ? "2px solid #10B981"
                      : "1px solid #E5E7EB",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              boxShadow: "none",
              "&:hover": {
                borderColor: stateErrors.length > 0 ? "#EF4444" : "#10B981",
              },
              transition: "all 0.2s ease",
            }),
          }}
          isSearchable
          isClearable
        />
        {stateErrors.length > 0 && (
          <p className="text-sm text-red-500 font-medium">
            {stateErrors[0].message}
          </p>
        )}
      </div>

      {/* LGA Selection - Only show if state is selected */}
      {shouldShowLGASection && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Local Government Areas <span className="text-red-500">*</span>
          </label>
          <CreatableSelect
            options={lgaOptions}
            value={selectedLGAs}
            onChange={handleLGAChange}
            placeholder="Select or type LGAs..."
            isMulti
            styles={{
              ...customSelectStyles,
              control: (provided: any, state: any) => ({
                ...provided,
                minHeight: "48px",
                border:
                  state.hasValue && lgaErrors.length === 0
                    ? "2px solid #10B981"
                    : lgaErrors.length > 0
                      ? "2px solid #EF4444"
                      : state.isFocused
                        ? "2px solid #10B981"
                        : "1px solid #E5E7EB",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                boxShadow: "none",
                "&:hover": {
                  borderColor: lgaErrors.length > 0 ? "#EF4444" : "#10B981",
                },
                transition: "all 0.2s ease",
              }),
            }}
            isSearchable
            isClearable
            formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            createOptionPosition="first"
          />
          <p className="text-xs text-gray-500">
            💡 Can't find your LGA? Just type it and press Enter to add it.
          </p>
          {lgaErrors.length > 0 && (
            <p className="text-sm text-red-500 font-medium">
              {lgaErrors[0].message}
            </p>
          )}
        </div>
      )}

      {/* Dynamic Area Selection - Only show when there are LGAs */}
      {shouldShowAreasSection && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Preferred Areas <span className="text-gray-500">(Max 3 total)</span>
          </label>

          {/* Dynamic Grid Layout */}
          <div
            className={`grid gap-3 ${
              selectedLGAs.length === 1
                ? "grid-cols-1"
                : selectedLGAs.length === 2
                  ? "grid-cols-1 lg:grid-cols-2"
                  : selectedLGAs.length === 3
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {/* Show area selectors for each selected LGA */}
            {selectedLGAs.map((lga) => (
              <motion.div
                key={lga.value}
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  📍 {lga.label}
                </label>
                <CreatableSelect
                  options={lgaAreaMap[lga.value] || []}
                  value={selectedAreas.filter((area) =>
                    area.value.includes(lga.label),
                  )}
                  onChange={(selectedOptions) =>
                    handleAreaChangeForLGA(lga.value, selectedOptions)
                  }
                  placeholder={`Select or type areas...`}
                  isMulti
                  styles={compactSelectStyles}
                  isSearchable
                  isClearable
                  isOptionDisabled={() => selectedAreas.length >= 3}
                  formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  createOptionPosition="first"
                  onCreateOption={(inputValue) => {
                    if (selectedAreas.length < 3) {
                      const newOption = {
                        value: `${inputValue} - ${lga.label}`,
                        label: inputValue,
                      };
                      handleAreaChangeForLGA(lga.value, [
                        ...selectedAreas.filter((area) =>
                          area.value.includes(lga.label),
                        ),
                        newOption,
                      ]);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            💡 Can't find your area? Just type it and press Enter to add it.
          </p>

          {/* Selected areas display */}
          {selectedAreas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <span className="text-sm font-medium text-emerald-700">
                Selected ({selectedAreas.length}/3): {getAreaDisplayText()}
              </span>
            </motion.div>
          )}

          {areaErrors.length > 0 && (
            <p className="text-sm text-red-500 font-medium">
              {areaErrors[0].message}
            </p>
          )}
        </div>
      )}

      {/* Location Summary */}
      {(selectedAreas.length > 0 || selectedLGAs.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gray-50 rounded-lg border"
        >
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Location Summary
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">State:</span> {selectedState?.label}
            </p>
            <p>
              <span className="font-medium">LGAs:</span>{" "}
              {selectedLGAs.map((lga) => lga.label).join(", ") ||
                "Not specified"}
            </p>
            {selectedAreas.length > 0 && (
              <p>
                <span className="font-medium">Areas:</span>{" "}
                {getAreaDisplayText()}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationSelectionComponent;
