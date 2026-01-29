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
  __isScoped__?: boolean;
  __lgaScope__?: string;
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
  clearIndicator: (provided: any) => ({
    ...provided,
    padding: "8px 4px",
    cursor: "pointer",
    color: "#9CA3AF",
    "&:hover": {
      color: "#EF4444",
    },
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
    position: "absolute",
    width: "100%",
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: "4px",
    maxHeight: "200px",
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999,
  }),
};

// Compact styles for area selects
const compactSelectStyles = {
  ...customSelectStyles,
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "40px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "6px",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "4px 8px",
    fontSize: "13px",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontSize: "13px",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#EBF8FF",
    borderRadius: "4px",
    border: "1px solid #3B82F6",
    margin: "1px",
    maxWidth: "120px",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#1E40AF",
    fontSize: "11px",
    fontWeight: "500",
    padding: "1px 4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#1E40AF",
    "&:hover": {
      backgroundColor: "#3B82F6",
      color: "white",
    },
  }),
};

interface LocationSelectionProps {
  className?: string;
}

const OptimizedLocationSelection: React.FC<LocationSelectionProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();
 
    // Enhanced local state for LGA-area mapping with proper scoping
    const [selectedState, setSelectedState] = useState<Option | null>(null);
    const [selectedLGAs, setSelectedLGAs] = useState<Option[]>([]);
    const [lgasWithAreas, setLgasWithAreas] = useState<LGAAreaMapping[]>([]);
    const [customLocation, setCustomLocation] = useState("");
    const [showCustomLocation, setShowCustomLocation] = useState(false);

    // Refs for stable rendering and preventing re-ordering
    const lgaOrderRef = useRef<string[]>([]);
    const stableSelectStylesRef = useRef(customSelectStyles);
    const compactSelectStylesRef = useRef(compactSelectStyles);

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
          __isScoped__: false,
          __lgaScope__: lgaName,
        }));
      },
      [selectedState?.value],
    );

    // Get selected areas for an LGA with stable keys and proper scoping
    const getSelectedAreasForLGA = useCallback(
      (lgaName: string) => {
        const lgaData = lgasWithAreas.find((item) => item.lgaName === lgaName);
        return lgaData
          ? lgaData.areas.map((area, index) => ({
              value: `${area}__${lgaName}__${index}`, // Stable, scoped key
              label: area,
              __isScoped__: true, // Marker for scoped area
              __lgaScope__: lgaName, // Explicit LGA scope
            }))
          : [];
      },
      [lgasWithAreas],
    );

    // Stable LGA order to prevent re-ordering during renders
    const stableLGAOrder = useMemo(() => {
      const currentLGAs = selectedLGAs.map((lga) => lga.value);
      const existingOrder = lgaOrderRef.current;

      // Maintain existing order and append new ones
      const newOrder = existingOrder.filter((lga) =>
        currentLGAs.includes(lga),
      );
      currentLGAs.forEach((lga) => {
        if (!newOrder.includes(lga)) {
          newOrder.push(lga);
        }
      });

      lgaOrderRef.current = newOrder;
      return newOrder;
    }, [selectedLGAs]);

    // Initialize local state from context and reset when context resets
    useEffect(() => {
      const locationData = state.formData.location;

      // Reset local state if no location data (form was reset)
      if (!locationData || Object.keys(state.formData).length === 0) {
        setSelectedState(null);
        setSelectedLGAs([]);
        setLgasWithAreas([]);
        setCustomLocation("");
        setShowCustomLocation(false);
        lgaOrderRef.current = [];
        return;
      }

      if (locationData) {
        if (locationData.state && !selectedState) {
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

          // Create initial LGA-area mapping from enhanced data if available
          const enhancedLocation = (state.formData as any).enhancedLocation;
          if (
            enhancedLocation?.lgasWithAreas &&
            enhancedLocation.lgasWithAreas.length > 0
          ) {
            setLgasWithAreas(enhancedLocation.lgasWithAreas);
          } else {
            // Fallback: create initial mapping with empty areas
            const initialMapping: LGAAreaMapping[] = locationData.lgas.map(
              (lga) => ({
                lgaName: lga,
                areas: [], // Areas will be populated separately
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

          // Set stable order
          lgaOrderRef.current = locationData.lgas;
        }

        if (locationData.customLocation) {
          setCustomLocation(locationData.customLocation);
          setShowCustomLocation(true);
        }
      }
    }, [state.formData, state.currentStep, selectedState]);

    // Use context's built-in debouncing
    const debouncedUpdateFormData = useCallback(
      (data: any) => {
        updateFormData(data); // Context handles debouncing
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

      // Update with both structures for compatibility
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
      lgaOrderRef.current = [];
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

        // Update stable order
        const newOrder = lgaArray.map((lga) => lga.value);
        lgaOrderRef.current = newOrder;
      },
      [lgasWithAreas],
    );

    // Handle area selection for a specific LGA with proper scoping
    const handleAreaChangeForLGA = useCallback(
      (lgaName: string, newAreas: MultiValue<Option>) => {
        const areaArray = Array.from(newAreas);

        // Limit to 3 areas per LGA
        if (areaArray.length > 3) {
          toast.error(`Maximum 3 areas can be selected per LGA`);
          return;
        }

        // Update only the specific LGA's areas without affecting others
        setLgasWithAreas((prev) => {
          return prev.map((item) =>
            item.lgaName === lgaName
              ? {
                  ...item,
                  areas: areaArray.map((area) => {
                    // Extract the actual area name from scoped value or use label
                    if (area.value.includes("__")) {
                      return area.label; // Use label for scoped areas
                    }
                    return area.value; // Use value for new areas
                  }),
                }
              : item,
          );
        });
      },
      [],
    );

    // Memoized area change handler factory to prevent re-creation
    const createAreaChangeHandler = useCallback(
      (lgaName: string) => {
        return (newAreas: MultiValue<Option>) =>
          handleAreaChangeForLGA(lgaName, newAreas);
      },
      [handleAreaChangeForLGA],
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

    // Compact Tags Component for displaying selected areas
    const CompactAreaTags = memo(
      ({ lgaName, areas }: { lgaName: string; areas: string[] }) => {
        if (areas.length === 0) return null;

        return (
          <motion.div
            className="flex flex-wrap gap-1 mt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {areas.map((area, index) => (
              <motion.span
                key={`${lgaName}-${area}-${index}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="truncate max-w-20">{area}</span>
              </motion.span>
            ))}
          </motion.div>
        );
      },
    );

    CompactAreaTags.displayName = "CompactAreaTags";

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
              styles={stableSelectStylesRef.current}
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
                styles={stableSelectStylesRef.current}
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

          {/* Enhanced Area Selection per LGA with Proper Scoping */}
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
                  Select specific areas for each chosen LGA. Areas are kept
                  separate for each LGA.
                </p>
              </div>

              {/* Dynamic area selection layout based on LGA count */}
              <div className={`grid gap-4 ${
                selectedLGAs.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 lg:grid-cols-2"
              }`}>
                {stableLGAOrder
                  .filter((lgaValue) =>
                    selectedLGAs.some((lga) => lga.value === lgaValue),
                  )
                  .map((lgaValue, index) => {
                    const lga = selectedLGAs.find(
                      (l) => l.value === lgaValue,
                    )!;
                    const selectedAreasForLGA = getSelectedAreasForLGA(lgaValue);
                    const availableAreasForLGA = getAreasForLGA(lgaValue);
                    const isAtLimit = selectedAreasForLGA.length >= 3;
                    const areaChangeHandler = createAreaChangeHandler(lgaValue);
                    const lgaData = lgasWithAreas.find(
                      (item) => item.lgaName === lgaValue,
                    );

                    return (
                      <motion.div
                        key={`lga-scope-${lgaValue}`} // Stable scoped key
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        layout // Smooth layout changes
                      >
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            📍 {lga.label}
                            <span className="text-xs text-gray-500 ml-1">
                              ({selectedAreasForLGA.length}/3)
                            </span>
                          </label>
                          {isAtLimit && (
                            <span className="text-xs text-amber-600 font-medium">
                              Limit reached
                            </span>
                          )}
                        </div>

                        <CreatableSelect
                          key={`areas-${lgaValue}-${selectedAreasForLGA.length}`} // Force re-render when count changes
                          isMulti
                          value={selectedAreasForLGA}
                          onChange={areaChangeHandler}
                          options={availableAreasForLGA}
                          styles={compactSelectStylesRef.current}
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
                          menuPortalTarget={
                            typeof document !== "undefined"
                              ? document.body
                              : null
                          }
                          menuPosition="fixed"
                          instanceId={`area-select-${lgaValue}`} // Unique instance ID
                          maxMenuHeight={150}
                          closeMenuOnSelect={false}
                          hideSelectedOptions={false}
                          blurInputOnSelect={false}
                        />

                        {/* Compact Area Tags Display */}
                        <CompactAreaTags
                          lgaName={lgaValue}
                          areas={lgaData?.areas || []}
                        />

                        {isAtLimit && (
                          <p className="text-xs text-amber-600">
                            Maximum areas reached for this LGA.
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
              </div>

              {/* Overall Stats Summary - memoized to prevent re-renders */}
              {selectedLGAs.length > 0 && (
                <MemoizedStatsSummary
                  lgaCount={selectedLGAs.length}
                  totalAreas={lgasWithAreas.reduce(
                    (total, item) => total + item.areas.length,
                    0,
                  )}
                  lgasWithAreas={lgasWithAreas}
                />
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

          {/* Enhanced Location Summary with Scoped Areas */}
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
                            <span className="inline-flex flex-wrap gap-1">
                              {item.areas.map((area, areaIndex) => (
                                <span
                                  key={`${item.lgaName}-${area}-${areaIndex}`}
                                  className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-800"
                                >
                                  {area}
                                </span>
                              ))}
                            </span>{" "}
                            ({item.areas.length}/3)
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

// Memoized stats summary to prevent unnecessary re-renders
const MemoizedStatsSummary = memo(
  ({
    lgaCount,
    totalAreas,
    lgasWithAreas,
  }: {
    lgaCount: number;
    totalAreas: number;
    lgasWithAreas: LGAAreaMapping[];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
      layout
    >
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-blue-700">
          <strong>{lgaCount}</strong> LGA{lgaCount !== 1 ? "s" : ""} selected
        </span>
        <span className="text-blue-600">
          <strong>{totalAreas}</strong> areas total
        </span>
      </div>
      <div className="text-xs text-blue-600">
        {lgaCount < 3 && "Add more LGAs for broader search"}
        {lgaCount === 3 && "Maximum LGAs reached"}
      </div>
    </motion.div>
  ),
);

MemoizedStatsSummary.displayName = "MemoizedStatsSummary";

export default OptimizedLocationSelection;
