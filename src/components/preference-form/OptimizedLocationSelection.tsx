/** @format */

"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
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

// Memoized custom select styles to prevent recreation
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "48px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#10B981",
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
  }),
};

interface LocationSelectionProps {
  className?: string;
}

const OptimizedLocationSelection: React.FC<LocationSelectionProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Local state for form values to prevent excessive re-renders
    const [selectedState, setSelectedState] = useState<Option | null>(null);
    const [selectedLGAs, setSelectedLGAs] = useState<Option[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<Option[]>([]);
    const [customLocation, setCustomLocation] = useState("");
    const [showCustomLocation, setShowCustomLocation] = useState(false);

    // Memoized options to prevent recreation
    const stateOptions = useMemo(
      () =>
        getStates().map((state) => ({
          value: state,
          label: state,
        })),
      [],
    );

    const lgaOptions = useMemo(() => {
      if (!selectedState?.value) return [];
      return getLGAsByState(selectedState.value).map((lga) => ({
        value: lga,
        label: lga,
      }));
    }, [selectedState?.value]);

    const areaOptions = useMemo(() => {
      if (!selectedState?.value || selectedLGAs.length === 0) return [];

      const allAreas = selectedLGAs.flatMap((lga) =>
        getAreasByStateLGA(selectedState.value, lga.value).map((area) => ({
          value: area,
          label: area,
        })),
      );

      // Remove duplicates
      const uniqueAreas = allAreas.filter(
        (area, index, self) =>
          index === self.findIndex((a) => a.value === area.value),
      );

      return uniqueAreas;
    }, [selectedState?.value, selectedLGAs]);

    // Initialize local state from context
    useEffect(() => {
      const locationData = state.formData.location;
      if (locationData) {
        if (locationData.state) {
          setSelectedState({
            value: locationData.state,
            label: locationData.state,
          });
        }

        if (locationData.lgas && locationData.lgas.length > 0) {
          const lgaOptions = locationData.lgas.map((lga) => ({
            value: lga,
            label: lga,
          }));
          setSelectedLGAs(lgaOptions);
        }

        if (locationData.areas && locationData.areas.length > 0) {
          const areaOptions = locationData.areas.map((area) => ({
            value: area,
            label: area,
          }));
          setSelectedAreas(areaOptions);
        }

        if (locationData.customLocation) {
          setCustomLocation(locationData.customLocation);
          setShowCustomLocation(true);
        }
      }
    }, []); // Only run once on mount

    // Debounced update function
    const debouncedUpdateFormData = useCallback(
      (locationData: LocationSelectionType) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          updateFormData({ location: locationData });
        }, 300);
      },
      [updateFormData],
    );

    // Update form data when local state changes
    useEffect(() => {
      const locationData: LocationSelectionType = {
        state: selectedState?.value || "",
        lgas: selectedLGAs.map((lga) => lga.value),
        areas: selectedAreas.map((area) => area.value),
        customLocation: showCustomLocation ? customLocation : "",
      };

      debouncedUpdateFormData(locationData);
    }, [
      selectedState,
      selectedLGAs,
      selectedAreas,
      customLocation,
      showCustomLocation,
      debouncedUpdateFormData,
    ]);

    // Handler functions
    const handleStateChange = useCallback((newValue: SingleValue<Option>) => {
      setSelectedState(newValue);
      // Reset LGAs and areas when state changes
      setSelectedLGAs([]);
      setSelectedAreas([]);
    }, []);

    const handleLGAChange = useCallback((newValue: MultiValue<Option>) => {
      const lgaArray = Array.from(newValue);
      setSelectedLGAs(lgaArray);
      // Reset areas when LGAs change
      setSelectedAreas([]);
    }, []);

    const handleAreaChange = useCallback((newValue: MultiValue<Option>) => {
      const areaArray = Array.from(newValue);

      // Limit to 3 areas maximum
      if (areaArray.length <= 3) {
        setSelectedAreas(areaArray);
      }
    }, []);

    const handleCustomLocationChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomLocation(e.target.value);
      },
      [],
    );

    const toggleCustomLocation = useCallback(() => {
      setShowCustomLocation(!showCustomLocation);
      if (showCustomLocation) {
        setCustomLocation("");
      }
    }, [showCustomLocation]);

    return (
      <motion.div
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Location & Area Preferences
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Tell us where you&apos;d like to find your ideal property
          </p>
        </div>

        <div className="space-y-6">
          {/* State Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              State <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedState}
              onChange={handleStateChange}
              options={stateOptions}
              styles={customSelectStyles}
              placeholder="Select a state"
              isSearchable={true}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <p className="text-xs text-gray-500">
              Choose the state where you want to find properties
            </p>
          </div>

          {/* LGA Selection */}
          {selectedState && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-800">
                Local Government Areas <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                value={selectedLGAs}
                onChange={handleLGAChange}
                options={lgaOptions}
                styles={customSelectStyles}
                placeholder="Select local government areas"
                isSearchable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "No LGAs found for selected state"}
              />
              <p className="text-xs text-gray-500">
                Select one or more local government areas in{" "}
                {selectedState.label}
              </p>
            </motion.div>
          )}

          {/* Area Selection */}
          {selectedLGAs.length > 0 && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-800">
                Specific Areas
                {selectedAreas.length > 0 && (
                  <span className="text-emerald-600 text-xs ml-2">
                    ({selectedAreas.length}/3 selected)
                  </span>
                )}
              </label>
              <CreatableSelect
                isMulti
                value={selectedAreas}
                onChange={handleAreaChange}
                options={areaOptions}
                styles={customSelectStyles}
                placeholder="Select or type specific areas"
                isSearchable={true}
                isClearable={false}
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Type to add a custom area"}
                isValidNewOption={(inputValue) =>
                  inputValue.length > 0 && selectedAreas.length < 3
                }
              />
              <p className="text-xs text-gray-500">
                Select up to 3 specific areas or neighborhoods. You can type to
                add custom areas.
              </p>

              {selectedAreas.length >= 3 && (
                <div className="text-xs text-amber-600 font-medium">
                  Maximum of 3 areas allowed. Remove some to add more.
                </div>
              )}
            </motion.div>
          )}

          {/* Custom Location Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                Can&apos;t find your preferred area?
              </span>
              <button
                type="button"
                onClick={toggleCustomLocation}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showCustomLocation
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showCustomLocation
                  ? "Hide Custom Location"
                  : "Add Custom Location"}
              </button>
            </div>

            <AnimatePresence>
              {showCustomLocation && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-800">
                    Custom Location
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={handleCustomLocationChange}
                    placeholder="e.g., Near Lagos University Teaching Hospital, Ikeja"
                    className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">
                    Describe the specific location or landmark you&apos;re
                    interested in
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Summary */}
          {(selectedState ||
            selectedLGAs.length > 0 ||
            selectedAreas.length > 0 ||
            (showCustomLocation && customLocation)) && (
            <motion.div
              className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                Location Summary
              </h4>
              <div className="space-y-1 text-sm text-emerald-700">
                {selectedState && (
                  <div>
                    <span className="font-medium">State:</span>{" "}
                    {selectedState.label}
                  </div>
                )}
                {selectedLGAs.length > 0 && (
                  <div>
                    <span className="font-medium">LGAs:</span>{" "}
                    {selectedLGAs.map((lga) => lga.label).join(", ")}
                  </div>
                )}
                {selectedAreas.length > 0 && (
                  <div>
                    <span className="font-medium">Areas:</span>{" "}
                    {selectedAreas.map((area) => area.label).join(", ")}
                  </div>
                )}
                {showCustomLocation && customLocation && (
                  <div>
                    <span className="font-medium">Custom Location:</span>{" "}
                    {customLocation}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
);

OptimizedLocationSelection.displayName = "OptimizedLocationSelection";

export default OptimizedLocationSelection;
