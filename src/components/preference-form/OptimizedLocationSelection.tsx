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
import { toast } from "react-hot-toast";
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

interface LGAAreaMapping {
  lgaName: string;
  areas: string[];
}

interface EnhancedLocationData {
  state: string;
  lgasWithAreas: LGAAreaMapping[];
  customLocation: string;
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

    // Enhanced local state for LGA-area mapping
    const [selectedState, setSelectedState] = useState<Option | null>(null);
    const [selectedLGAs, setSelectedLGAs] = useState<Option[]>([]);
    const [lgasWithAreas, setLgasWithAreas] = useState<LGAAreaMapping[]>([]);
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

    // Get available areas for a specific LGA
    const getAreasForLGA = useCallback(
      (lgaName: string) => {
        if (!selectedState?.value) return [];
        return getAreasByStateLGA(selectedState.value, lgaName).map((area) => ({
          value: area,
          label: area,
        }));
      },
      [selectedState?.value],
    );

    // Get already selected areas for an LGA
    const getSelectedAreasForLGA = useCallback(
      (lgaName: string) => {
        const lgaData = lgasWithAreas.find((item) => item.lgaName === lgaName);
        return lgaData
          ? lgaData.areas.map((area) => ({ value: area, label: area }))
          : [];
      },
      [lgasWithAreas],
    );

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

        // Initialize enhanced LGA-area mapping from existing data
        if (locationData.lgas && locationData.lgas.length > 0) {
          const lgaOptions = locationData.lgas.map((lga) => ({
            value: lga,
            label: lga,
          }));
          setSelectedLGAs(lgaOptions);

          // Create initial LGA-area mapping from legacy data
          const initialMapping: LGAAreaMapping[] = locationData.lgas.map(
            (lga) => ({
              lgaName: lga,
              areas: [], // Areas will be distributed among LGAs later
            }),
          );

          // If we have legacy areas data, distribute them among LGAs
          if (locationData.areas && locationData.areas.length > 0) {
            locationData.areas.forEach((area, index) => {
              const lgaIndex = index % initialMapping.length;
              if (initialMapping[lgaIndex].areas.length < 3) {
                initialMapping[lgaIndex].areas.push(area);
              }
            });
          }

          setLgasWithAreas(initialMapping);
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

    // Update form data when local state changes with enhanced structure
    useEffect(() => {
      const enhancedLocationData: EnhancedLocationData = {
        state: selectedState?.value || "",
        lgasWithAreas: lgasWithAreas,
        customLocation: showCustomLocation ? customLocation : "",
      };

      // Also maintain backward compatibility
      const locationData: LocationSelectionType = {
        state: selectedState?.value || "",
        lgas: selectedLGAs.map((lga) => lga.value),
        areas: lgasWithAreas.flatMap((item) => item.areas),
        customLocation: showCustomLocation ? customLocation : "",
      };

      // Update with both structures for compatibility and debug display
      debouncedUpdateFormData({
        location: locationData,
        enhancedLocation: enhancedLocationData,
      } as any);
    }, [
      selectedState,
      selectedLGAs,
      lgasWithAreas,
      customLocation,
      showCustomLocation,
      debouncedUpdateFormData,
    ]);

    // Handler functions
    const handleStateChange = useCallback((newValue: SingleValue<Option>) => {
      setSelectedState(newValue);
      // Reset LGAs and areas when state changes
      setSelectedLGAs([]);
      setLgasWithAreas([]);
    }, []);

    const handleLGAChange = useCallback(
      (newValue: MultiValue<Option>) => {
        const lgaArray = Array.from(newValue);

        // Limit to 3 LGAs maximum
        if (lgaArray.length > 3) {
          toast.error("Maximum 3 LGAs can be selected");
          return;
        }

        setSelectedLGAs(lgaArray);

        // Update LGA-area mapping, preserving existing areas for unchanged LGAs
        const newLgasWithAreas: LGAAreaMapping[] = lgaArray.map((lga) => {
          const existingMapping = lgasWithAreas.find(
            (item) => item.lgaName === lga.value,
          );
          return existingMapping || { lgaName: lga.value, areas: [] };
        });

        setLgasWithAreas(newLgasWithAreas);
      },
      [lgasWithAreas],
    );

    // Handle area selection for a specific LGA
    const handleAreaChangeForLGA = useCallback(
      (lgaName: string, newAreas: MultiValue<Option>) => {
        const areaArray = Array.from(newAreas);

        // Limit to 3 areas per LGA
        if (areaArray.length > 3) {
          toast.error(`Maximum 3 areas can be selected per LGA`);
          return;
        }

        setLgasWithAreas((prev) =>
          prev.map((item) =>
            item.lgaName === lgaName
              ? { ...item, areas: areaArray.map((area) => area.value) }
              : item,
          ),
        );
      },
      [],
    );

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
                placeholder="Select up to 3 local government areas"
                isSearchable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "No LGAs found for selected state"}
                isOptionDisabled={() => selectedLGAs.length >= 3}
              />
              <p className="text-xs text-gray-500">
                Select up to 3 local government areas in {selectedState.label}
                {selectedLGAs.length > 0 && (
                  <span className="text-emerald-600 font-medium ml-1">
                    ({selectedLGAs.length}/3 selected)
                  </span>
                )}
              </p>
              {selectedLGAs.length >= 3 && (
                <div className="text-xs text-amber-600 font-medium">
                  Maximum LGAs reached. Remove some to add more.
                </div>
              )}
            </motion.div>
          )}

          {/* Enhanced Area Selection per LGA */}
          {selectedLGAs.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Areas by Local Government
                  <span className="text-emerald-600 text-xs ml-2">
                    (Up to 3 areas per LGA)
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Select specific areas for each chosen LGA. You can select up
                  to 3 areas per LGA.
                </p>
              </div>

              {/* Clean minimal area selection with dynamic layout */}
              <div
                className={`${
                  selectedLGAs.length === 2
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : selectedLGAs.length === 3
                      ? "space-y-4"
                      : "space-y-4"
                }`}
              >
                {selectedLGAs
                  .sort((a, b) => {
                    const aHasAreas =
                      getSelectedAreasForLGA(a.value).length > 0;
                    const bHasAreas =
                      getSelectedAreasForLGA(b.value).length > 0;
                    if (aHasAreas && !bHasAreas) return -1;
                    if (!aHasAreas && bHasAreas) return 1;
                    return a.label.localeCompare(b.label);
                  })
                  .map((lga, index) => {
                    const selectedAreasForLGA = getSelectedAreasForLGA(
                      lga.value,
                    );
                    const availableAreasForLGA = getAreasForLGA(lga.value);
                    const isAtLimit = selectedAreasForLGA.length >= 3;

                    // For 3 LGAs: first two side by side, third full width
                    const shouldUseSpecialLayout = selectedLGAs.length === 3;
                    const isFirstTwo = shouldUseSpecialLayout && index < 2;
                    const isThird = shouldUseSpecialLayout && index === 2;

                    const containerClass = shouldUseSpecialLayout
                      ? isFirstTwo
                        ? "grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full"
                        : isThird
                          ? "col-span-full"
                          : ""
                      : "";

                    const itemClass =
                      shouldUseSpecialLayout && isFirstTwo ? "" : "space-y-2";

                    if (shouldUseSpecialLayout && index === 0) {
                      // Render first two items together for 3 LGA layout
                      return (
                        <div key="first-two" className={containerClass}>
                          {selectedLGAs.slice(0, 2).map((subLga, subIndex) => {
                            const subSelectedAreas = getSelectedAreasForLGA(
                              subLga.value,
                            );
                            const subAvailableAreas = getAreasForLGA(
                              subLga.value,
                            );
                            const subIsAtLimit = subSelectedAreas.length >= 3;

                            return (
                              <motion.div
                                key={subLga.value}
                                className="space-y-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: subIndex * 0.1,
                                }}
                              >
                                <label className="block text-sm font-medium text-gray-700">
                                  {subLga.label}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({subSelectedAreas.length}/3)
                                  </span>
                                </label>

                                <CreatableSelect
                                  isMulti
                                  value={subSelectedAreas}
                                  onChange={(newAreas) =>
                                    handleAreaChangeForLGA(
                                      subLga.value,
                                      newAreas,
                                    )
                                  }
                                  options={subAvailableAreas}
                                  styles={customSelectStyles}
                                  placeholder={`Areas in ${subLga.label}...`}
                                  isSearchable={true}
                                  isClearable={false}
                                  formatCreateLabel={(inputValue) =>
                                    `Add "${inputValue}"`
                                  }
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  noOptionsMessage={() => "Type to add area"}
                                  isValidNewOption={(inputValue) =>
                                    inputValue.length > 0 &&
                                    subSelectedAreas.length < 3
                                  }
                                />

                                {subIsAtLimit && (
                                  <p className="text-xs text-amber-600">
                                    Maximum areas reached.
                                  </p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    } else if (shouldUseSpecialLayout && index < 2) {
                      // Skip rendering items 0 and 1 individually since they're handled above
                      return null;
                    }

                    return (
                      <motion.div
                        key={lga.value}
                        className={itemClass}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {lga.label}
                          <span className="text-xs text-gray-500 ml-1">
                            ({selectedAreasForLGA.length}/3)
                          </span>
                        </label>

                        <CreatableSelect
                          isMulti
                          value={selectedAreasForLGA}
                          onChange={(newAreas) =>
                            handleAreaChangeForLGA(lga.value, newAreas)
                          }
                          options={availableAreasForLGA}
                          styles={customSelectStyles}
                          placeholder={`Areas in ${lga.label}...`}
                          isSearchable={true}
                          isClearable={false}
                          formatCreateLabel={(inputValue) =>
                            `Add "${inputValue}"`
                          }
                          className="react-select-container"
                          classNamePrefix="react-select"
                          noOptionsMessage={() => "Type to add area"}
                          isValidNewOption={(inputValue) =>
                            inputValue.length > 0 &&
                            selectedAreasForLGA.length < 3
                          }
                        />

                        {isAtLimit && (
                          <p className="text-xs text-amber-600">
                            Maximum areas reached.
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
              </div>

              {/* Quick stats summary */}
              {selectedLGAs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-700">
                      <strong>{selectedLGAs.length}</strong> LGA
                      {selectedLGAs.length !== 1 ? "s" : ""} selected
                    </span>
                    <span className="text-blue-600">
                      <strong>
                        {lgasWithAreas.reduce(
                          (total, item) => total + item.areas.length,
                          0,
                        )}
                      </strong>{" "}
                      areas total
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {selectedLGAs.length < 3 &&
                      "Add more LGAs for broader search"}
                    {selectedLGAs.length === 3 && "Maximum LGAs reached"}
                  </div>
                </motion.div>
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
            lgasWithAreas.some((item) => item.areas.length > 0) ||
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
              <div className="space-y-2 text-sm text-emerald-700">
                {selectedState && (
                  <div>
                    <span className="font-medium">State:</span>{" "}
                    {selectedState.label}
                  </div>
                )}
                {selectedLGAs.length > 0 && (
                  <div>
                    <span className="font-medium">
                      LGAs ({selectedLGAs.length}/3):
                    </span>{" "}
                    {selectedLGAs.map((lga) => lga.label).join(", ")}
                  </div>
                )}
                {lgasWithAreas.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-medium">Areas by LGA:</span>
                    {lgasWithAreas.map(
                      (item, index) =>
                        item.areas.length > 0 && (
                          <div key={index} className="ml-2 text-xs">
                            <span className="font-medium">{item.lgaName}:</span>{" "}
                            {item.areas.join(", ")} ({item.areas.length}/3)
                          </div>
                        ),
                    )}
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

// Memoized LGA Area Field Component for better performance
const LGAAreaField = memo(
  ({
    lga,
    index,
    selectedAreas,
    availableAreas,
    onAreaChange,
    hasAreas,
    isAtLimit,
  }: {
    lga: { value: string; label: string };
    index: number;
    selectedAreas: { value: string; label: string }[];
    availableAreas: { value: string; label: string }[];
    onAreaChange: (lgaName: string, areas: any) => void;
    hasAreas: boolean;
    isAtLimit: boolean;
  }) => {
    return (
      <motion.div
        key={lga.value}
        className={`rounded-lg p-4 border transition-all duration-200 ${
          hasAreas
            ? "bg-emerald-50 border-emerald-200 shadow-sm"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Component content stays the same */}
      </motion.div>
    );
  },
);

LGAAreaField.displayName = "LGAAreaField";

export default OptimizedLocationSelection;
