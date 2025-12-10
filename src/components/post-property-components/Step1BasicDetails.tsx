"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import RadioCheck from "@/components/general-components/radioCheck";
import EnhancedPriceInput from "@/components/general-components/EnhancedPriceInput";
import { useFormikContext } from "formik";
import { usePostPropertyContext } from "@/context/post-property-context";
import customStyles from "@/styles/inputStyle";
import {
  getStates,
  getLGAsByState,
  getAreasByStateLGA,
} from "@/utils/location-utils";
import {
  briefTypeConfig,
  propertyConditionOptions,
  buildingTypeOptions,
  numberOptions,
  shouldShowField,
  getFieldsToClearOnCategoryChange,
} from "@/data/comprehensive-post-property-config";
import { PropertyFormData, StepProps } from "@/types/post-property.types";
import {
  formatPriceForDisplay,
  extractNumericValue,
  cleanNumericInput,
} from "@/utils/price-helpers";

interface Option {
  value: string;
  label: string;
}


 
const Step1BasicDetails: React.FC<StepProps> = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<PropertyFormData>();
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);

  // Track initial mount and state/lga changes to prevent unwanted resets during auto-population
  const isInitialMount = useRef(true);
  const previousState = useRef(propertyData.state);
  const previousLga = useRef(propertyData.lga);

  const handleFieldChange = async <K extends keyof PropertyFormData>(
    fieldName: K,
    value: PropertyFormData[K]
  ) => {
    setFieldTouched(fieldName as string, true);
    setFieldValue(fieldName as string, value);
    updatePropertyData(fieldName as any, value);
  };

  const getFieldBorderClass = (fieldName: string, isRequired = false) => {
    const isInvalid = touched[fieldName] && errors[fieldName];
    const fieldValue = propertyData[fieldName as keyof typeof propertyData];
    const hasValue = fieldValue && fieldValue !== "" && fieldValue !== 0;
    const isValid = hasValue && (!touched[fieldName] || !errors[fieldName]);

    // Show red border for required fields that are empty (regardless of touched state)
    if (isRequired && !hasValue) {
      return "border-red-500 focus:border-red-500 focus:ring-red-100";
    }

    // Show red border for invalid fields that have been touched
    if (isInvalid) {
      return "border-red-500 focus:border-red-500 focus:ring-red-100";
    }

    // Show green border for valid fields with values
    if (isValid) {
      return "border-green-500 focus:border-green-500 focus:ring-green-100";
    }

    // Default border color for non-required empty fields
    return "border-[#C7CAD0]";
  };

  const getSelectBorderClass = (fieldName: string, isRequired = false) => {
    const isInvalid = touched[fieldName] && errors[fieldName];
    const fieldValue = propertyData[fieldName as keyof typeof propertyData];
    const hasValue = fieldValue && fieldValue !== "" && fieldValue !== 0;
    const isValid = hasValue && (!touched[fieldName] || !errors[fieldName]);

    // Show red border for required fields that are empty (regardless of touched state)
    if (isRequired && !hasValue) {
      return "#ef4444";
    }

    // Show red border for invalid fields that have been touched
    if (isInvalid) {
      return "#ef4444";
    }

    // Show green border for valid fields with values
    if (isValid) {
      return "#22c55e";
    }

    // Default border color for non-required empty fields
    return "#C7CAD0";
  };

  const handlePriceChange = (value: string) => {
    // Store only numeric value for the payload, but display formatted
    const numericValue = cleanNumericInput(value);
    handleFieldChange("price", Number(numericValue));
  };

  useEffect(() => {
    // Format states data using new location data
    const states = getStates().map((state: string) => ({
      value: state,
      label: state,
    }));
    setStateOptions(states);

    // After initial mount, set isInitialMount to false
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (propertyData.state) {
      // Get LGAs for selected state using new location data
      const lgas = getLGAsByState(propertyData.state.value).map(
        (lga: string) => ({
          value: lga,
          label: lga,
        }),
      );
      setLgaOptions(lgas);

      // Only reset LGA and area when state actually changes (not during initial mount/auto-population)
      const stateChanged = previousState.current &&
        (!previousState.current || previousState.current.value !== propertyData.state.value);

      if (stateChanged && !isInitialMount.current) {
        updatePropertyData("lga", null);
        updatePropertyData("area", "");
      }

      previousState.current = propertyData.state;
    } else {
      setLgaOptions([]);
      setAreaOptions([]);
      if (!isInitialMount.current) {
        updatePropertyData("lga", null);
        updatePropertyData("area", "");
      }
      previousState.current = null;
    }
  }, [propertyData.state]);
 
  useEffect(() => {
    if (propertyData.state && propertyData.lga) {
      // Get areas for selected state and LGA
      const areas = getAreasByStateLGA(
        propertyData.state.value,
        propertyData.lga.value,
      ).map((area: string) => ({
        value: area,
        label: area,
      }));
      setAreaOptions(areas);

      // Only reset area when LGA actually changes (not during initial mount/auto-population)
      const lgaChanged = previousLga.current &&
        (!previousLga.current || previousLga.current.value !== propertyData.lga.value);

      if (lgaChanged && !isInitialMount.current) {
        updatePropertyData("area", "");
      }

      previousLga.current = propertyData.lga;
    } else {
      setAreaOptions([]);
      if (!isInitialMount.current) {
        updatePropertyData("area", "");
      }
      previousLga.current = null;
    }
  }, [propertyData.state, propertyData.lga]);

    // Mark required fields as touched on component mount to show validation borders
  useEffect(() => {
    const requiredFields = [
      "propertyCategory",
      "state",
      "lga",
      "area",
      "price",
    ];

    // Add conditional required fields based on property type
    if (propertyData.propertyType === "rent") {
      requiredFields.push("rentalType");
      if (propertyData.propertyCategory !== "Land") {
        requiredFields.push("propertyCondition", "typeOfBuilding", "bedrooms");
      }
      if (propertyData.propertyCategory === "Commercial") {
        requiredFields.push("measurementType", "landSize");
      }
    }

    if (propertyData.propertyType === "shortlet") {
      requiredFields.push(
        "shortletDuration",
        "propertyCondition",
        "typeOfBuilding",
        "bedrooms",
        "streetAddress",
        "maxGuests",
      );
    }

        if (propertyData.propertyType === "jv") {
      requiredFields.push("holdDuration");
      // JV ALWAYS requires land size for ALL property categories
      // JV does NOT require property condition, building type, or bedrooms for ANY category
      requiredFields.push("measurementType", "landSize");
    }

    if (propertyData.propertyType === "sell") {
      if (propertyData.propertyCategory !== "Land") {
        requiredFields.push("propertyCondition", "typeOfBuilding", "bedrooms");
      }
      requiredFields.push("measurementType", "landSize");
    }

    // Additional validation: Land size is required for:
    // - All Sell properties (already handled above)
    // - All JV properties (already handled above)
    // - Commercial Rent properties (already handled above)
    // - Land category for all property types
    if (propertyData.propertyCategory === "Land") {
      if (!requiredFields.includes("measurementType"))
        requiredFields.push("measurementType");
      if (!requiredFields.includes("landSize")) requiredFields.push("landSize");
    }

    // Mark fields as touched only if they don't have values
    requiredFields.forEach((field) => {
      const fieldValue = propertyData[field as keyof typeof propertyData];
      const hasValue = fieldValue && fieldValue !== "" && fieldValue !== 0;
      if (!hasValue) {
        setFieldTouched(field, false); // Don't mark as touched to use the isRequired logic
      }
    });
  }, [
    propertyData.propertyType,
    propertyData.propertyCategory,
    setFieldTouched,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Submit brief details
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Provide basic information about your property
        </p>
      </div>

      <div className="space-y-6">
        {/* Property Category */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Property Category <span className="text-red-500">*</span>
          </h3> 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {briefTypeConfig[
              propertyData.propertyType as keyof typeof briefTypeConfig
            ]?.propertyCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  // Clear subsequent fields if category changes
                  if (
                    propertyData.propertyCategory &&
                    propertyData.propertyCategory !== category
                  ) {
                    const fieldsToClear = getFieldsToClearOnCategoryChange(
                      propertyData.propertyType,
                    );
                    updatePropertyData(
                      "resetFieldsAfterCategory",
                      fieldsToClear,
                    );
                  }
                  handleFieldChange("propertyCategory", category);
                }}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  propertyData.propertyCategory === category
                    ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C] font-semibold"
                    : !propertyData.propertyCategory
                      ? "border-red-500 hover:border-red-600 text-[#5A5D63] bg-red-50/30"
                      : propertyData.propertyCategory &&
                          !errors.propertyCategory
                        ? "border-green-500 hover:border-green-600 text-[#5A5D63]"
                        : "border-[#C7CAD0] hover:border-[#8DDB90] text-[#5A5D63]"
                }`}
              >
                {category}
              </button>
            )) || []}
          </div>
        </div>

        {/* Rental Type (for rent only) */}
        {shouldShowField(
          "rentalType",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Select your rental type <span className="text-red-500">*</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <RadioCheck
                selectedValue={propertyData.rentalType}
                handleChange={() => handleFieldChange("rentalType", "Rent")}
                type="radio"
                value="Rent"
                name="rentalType"
                variant="card"
                error={!propertyData.rentalType}
              />
              <RadioCheck
                selectedValue={propertyData.rentalType}
                handleChange={() => handleFieldChange("rentalType", "Lease")}
                type="radio"
                name="rentalType"
                value="Lease"
                variant="card"
                error={!propertyData.rentalType}
              />
            </div>
          </div>
        )}
 
        {/* Shortlet Duration (for shortlet only) */}
        {shouldShowField(
          "shortletDuration",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Shortlet Duration <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RadioCheck
                selectedValue={propertyData.shortletDuration}
                handleChange={() =>
                  handleFieldChange("shortletDuration", "Daily")
                }
                type="radio"
                value="Daily"
                name="shortletDuration"
                variant="card"
                error={!propertyData.shortletDuration}
              />
              <RadioCheck
                selectedValue={propertyData.shortletDuration}
                handleChange={() =>
                  handleFieldChange("shortletDuration", "Weekly")
                }
                type="radio"
                name="shortletDuration"
                value="Weekly"
                variant="card"
                error={!propertyData.shortletDuration}
              />
              <RadioCheck
                selectedValue={propertyData.shortletDuration}
                handleChange={() =>
                  handleFieldChange("shortletDuration", "Monthly")
                }
                type="radio"
                name="shortletDuration"
                value="Monthly"
                variant="card"
                error={!propertyData.shortletDuration}
              />
            </div>
          </div>
        )}

        {/* Property Condition (for sell, rent and shortlet) */}
        {shouldShowField(
          "propertyCondition",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Property Condition <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyConditionOptions.map((option) => (
                <RadioCheck
                  key={option.value}
                  selectedValue={propertyData.propertyCondition}
                  handleChange={() =>
                    handleFieldChange("propertyCondition", option.value)
                  }
                  type="radio"
                  value={option.value}
                  name="propertyCondition"
                  variant="card"
                  error={!propertyData.propertyCondition}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Price Details <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <EnhancedPriceInput
                name="price"
                label={
                  propertyData.propertyType === "sell"
                    ? "Selling Price"
                    : propertyData.propertyType === "rent"
                      ? "Annual Rent"
                      : "Property Value"
                }
                value={formatPriceForDisplay(propertyData.price)}
                onChange={handlePriceChange}
                placeholder="Enter amount"
                prefix="₦"
                error={
                  typeof errors?.price === "string" ? errors.price : undefined
                }
                touched={!!touched?.price}
                required
                description={
                  propertyData.propertyType === "rent"
                    ? "Enter the total annual rent amount"
                    : propertyData.propertyType === "sell"
                      ? "Enter your desired selling price"
                      : "Enter the estimated property value"
                }
              />
            </div>

            

            {/* Lease Hold for Rent (when Lease is selected) */}
            {shouldShowField(
              "leaseHold",
              propertyData.propertyType,
              propertyData.propertyCategory,
              { rentalType: propertyData.rentalType },
            ) && (
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Lease Hold Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter duration in years"
                  value={propertyData.leaseHold || ""}
                  onChange={(e) => {
                    // Allow only numbers for lease duration
                    const value = cleanNumericInput(e.target.value);
                    updatePropertyData("leaseHold", value);
                  }}
                  className={`w-full p-[12px] border rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-[14px] leading-[22.4px] ${getFieldBorderClass("leaseHold", true)}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many years is the lease valid for?
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Land Size (for Land, Sell, JV) */}
        {shouldShowField(
          "landSize",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Land Size <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Type of Measurement <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  options={[
                    { value: "Plot", label: "Plot" },
                    { value: "Acres", label: "Acres" },
                    { value: "Square Meter", label: "Square Meter" },
                  ]}
                  value={
                    propertyData.measurementType
                      ? {
                          value: propertyData.measurementType,
                          label: propertyData.measurementType,
                        }
                      : null
                  }
                  onChange={(option) => {
                    const value = option?.value || "";
                    setFieldTouched("measurementType", true);
                    updatePropertyData("measurementType", value);
                    setFieldValue("measurementType", value);
                  }}
                  placeholder="Select measurement type"
                  styles={{
                    ...customStyles,
                    control: (provided, state) => ({
                      ...customStyles.control?.(provided, state),
                      borderColor: getSelectBorderClass(
                        "measurementType",
                        true,
                      ),
                      minHeight: "44px",
                    }),
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Land Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`${!propertyData.measurementType ? "Select measurement type first" : `Enter size${propertyData.measurementType ? ` in ${propertyData.measurementType.toLowerCase()}` : ""}`}`}
                    value={
                      propertyData.landSize
                        ? Number(
                            propertyData.landSize
                              .toString()
                              .replace(/[^0-9]/g, ""),
                          ).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      if (!propertyData.measurementType) return;
                      // Only allow numbers and format with commas
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      handleFieldChange("landSize", numericValue);
                    }}
                    disabled={!propertyData.measurementType}
                    className={`w-full p-[12px] border rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-[14px] leading-[22.4px] ${propertyData.measurementType ? "pr-20" : ""} ${!propertyData.measurementType ? "bg-gray-100 cursor-not-allowed" : ""} ${getFieldBorderClass("landSize", true)}`}
                  />
                  {propertyData.measurementType && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {propertyData.measurementType === "Square Meter"
                          ? "sqm"
                          : propertyData.measurementType.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Property Location <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-[#707281] mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <ReactSelect
                options={stateOptions}
                value={propertyData.state}
                onChange={(option) => {
                  setFieldTouched("state", true);
                  updatePropertyData("state", option);
                  setFieldValue("state", option);
                }}
                placeholder="Search and select state"
                styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                    ...customStyles.control?.(provided, state),
                    borderColor: getSelectBorderClass("state", true),
                    minHeight: "44px",
                  }),
                }}
                isSearchable
                isClearable
                filterOption={(option, searchText) =>
                  option.label.toLowerCase().includes(searchText.toLowerCase())
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#707281] mb-2">
                Local Government <span className="text-red-500">*</span>
              </label>
              <CreatableSelect
                options={lgaOptions}
                value={propertyData.lga}
                onChange={(option) => {
                  setFieldTouched("lga", true);
                  updatePropertyData("lga", option);
                  setFieldValue("lga", option);
                }}
                onCreateOption={(inputValue) => {
                  const newOption = { value: inputValue, label: inputValue };
                  setFieldTouched("lga", true);
                  updatePropertyData("lga", newOption);
                  setFieldValue("lga", newOption);
                }}
                placeholder={
                  propertyData.state
                    ? lgaOptions.length > 0
                      ? "Search or type LGA"
                      : "Type LGA name"
                    : "Select state first"
                }
                styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                    ...customStyles.control?.(provided, state),
                    borderColor: getSelectBorderClass("lga", true),
                    minHeight: "44px",
                  }),
                }}
                isSearchable
                isClearable
                isDisabled={!propertyData.state}
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                noOptionsMessage={() => "Type to add LGA"}
                filterOption={(option, searchText) =>
                  option.label.toLowerCase().includes(searchText.toLowerCase())
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#707281] mb-2">
                Area/Neighborhood <span className="text-red-500">*</span>
              </label>
              <CreatableSelect
                options={areaOptions}
                value={
                  propertyData.area
                    ? { value: propertyData.area, label: propertyData.area }
                    : null
                }
                onChange={(option) => {
                  const value = option?.value || "";
                  setFieldTouched("area", true);
                  updatePropertyData("area", value);
                  setFieldValue("area", value);
                }}
                onCreateOption={(inputValue) => {
                  setFieldTouched("area", true);
                  updatePropertyData("area", inputValue);
                  setFieldValue("area", inputValue);
                }}
                placeholder={
                  propertyData.lga
                    ? areaOptions.length > 0
                      ? "Search or type area"
                      : "Type area name"
                    : "Select LGA first"
                }
                styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                    ...customStyles.control?.(provided, state),
                    borderColor: getSelectBorderClass("area", true),
                    minHeight: "44px",
                  }),
                }}
                isSearchable
                isDisabled={!propertyData.lga}
                isClearable
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                noOptionsMessage={() => "Type to add area"}
                filterOption={(option, searchText) =>
                  option.label.toLowerCase().includes(searchText.toLowerCase())
                }
              />
            </div>
          </div>

          {/* Street Address - Available for all property types */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#707281] mb-2">
              Street Address (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter street address, building name, or landmarks"
              value={propertyData.streetAddress || ""}
              onChange={(e) =>
                handleFieldChange("streetAddress", e.target.value)
              }
              className={`w-full p-[12px] border rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-[14px] leading-[22.4px] ${getFieldBorderClass("streetAddress")}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide additional details like street name, building number, or nearby landmarks
            </p>
          </div>
        </div>

        {/* Property Details (for non-Land properties) */}
        {shouldShowField(
          "typeOfBuilding",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Property Details <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Building Type <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  options={
                    propertyData.propertyCategory === "Residential"
                      ? propertyData.propertyType === "shortlet"
                        ? buildingTypeOptions.shortlet
                        : buildingTypeOptions.residential
                      : propertyData.propertyCategory === "Commercial"
                        ? buildingTypeOptions.commercial
                        : []
                  }
                  value={
                    propertyData.typeOfBuilding
                      ? {
                          value: propertyData.typeOfBuilding,
                          label: propertyData.typeOfBuilding,
                        }
                      : null
                  }
                  onChange={(option) => {
                    const value = option?.value || "";
                    setFieldTouched("typeOfBuilding", true);
                    updatePropertyData("typeOfBuilding", value);
                    setFieldValue("typeOfBuilding", value);
                  }}
                  placeholder="Select building type"
                  styles={{
                    ...customStyles,
                    control: (provided, state) => ({
                      ...customStyles.control?.(provided, state),
                      borderColor: getSelectBorderClass("typeOfBuilding", true),
                    }),
                  }}
                />
              </div>

              {/* Room Details */}
              {shouldShowField(
                "bedrooms",
                propertyData.propertyType,
                propertyData.propertyCategory,
              ) && (
                <div>
                  <label className="block text-sm font-medium text-[#707281] mb-2">
                    Number of Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <ReactSelect
                    options={numberOptions}
                    value={
                      propertyData.bedrooms
                        ? {
                            value: propertyData.bedrooms.toString(),
                            label: propertyData.bedrooms.toString(),
                          }
                        : null
                    }
                    onChange={(option) => {
                      const value = parseInt(option?.value || "0") || 0;
                      setFieldTouched("bedrooms", true);
                      updatePropertyData("bedrooms", value);
                      setFieldValue("bedrooms", value);
                    }}
                    placeholder="Select bedrooms"
                    styles={{
                      ...customStyles,
                      control: (provided, state) => ({
                        ...customStyles.control?.(provided, state),
                        borderColor: getSelectBorderClass("bedrooms", true),
                      }),
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shouldShowField(
                "bathrooms",
                propertyData.propertyType,
                propertyData.propertyCategory,
              ) && (
                <div>
                  <label className="block text-sm font-medium text-[#707281] mb-2">
                    Number of Bathrooms
                  </label>
                  <ReactSelect
                    options={numberOptions}
                    value={
                      propertyData.bathrooms
                        ? {
                            value: propertyData.bathrooms.toString(),
                            label: propertyData.bathrooms.toString(),
                          }
                        : null
                    }
                    onChange={(option) =>
                      updatePropertyData(
                        "bathrooms",
                        parseInt(option?.value || "0") || 0,
                      )
                    }
                    placeholder="Select bathrooms"
                    styles={customStyles}
                  />
                </div>
              )}

              {shouldShowField(
                "toilets",
                propertyData.propertyType,
                propertyData.propertyCategory,
              ) && (
                <div>
                  <label className="block text-sm font-medium text-[#707281] mb-2">
                    Number of Toilets
                  </label>
                  <ReactSelect
                    options={numberOptions}
                    value={
                      propertyData.toilets
                        ? {
                            value: propertyData.toilets.toString(),
                            label: propertyData.toilets.toString(),
                          }
                        : null
                    }
                    onChange={(option) =>
                      updatePropertyData(
                        "toilets",
                        parseInt(option?.value || "0") || 0,
                      )
                    }
                    placeholder="Select toilets"
                    styles={customStyles}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Number of Car Parks
                </label>
                <ReactSelect
                  options={numberOptions}
                  value={
                    propertyData.parkingSpaces
                      ? {
                          value: propertyData.parkingSpaces.toString(),
                          label: propertyData.parkingSpaces.toString(),
                        }
                      : null
                  }
                  onChange={(option) =>
                    updatePropertyData(
                      "parkingSpaces",
                      parseInt(option?.value || "0") || 0,
                    )
                  }
                  placeholder="Select car parks"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
        )}

        {/* Shortlet Specific Fields */}
        {propertyData.propertyType === "shortlet" && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Shortlet Details <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full street address"
                  value={propertyData.streetAddress || ""}
                  onChange={(e) =>
                    handleFieldChange("streetAddress", e.target.value)
                  }
                  className={`w-full p-[12px] border rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-[14px] leading-[22.4px] ${getFieldBorderClass("streetAddress", true)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Max Number of Guests <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter max guests"
                  value={propertyData.maxGuests || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "maxGuests",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className={`w-full p-[12px] border rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-[14px] leading-[22.4px] ${getFieldBorderClass("maxGuests", true)}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#707281] mb-2">
            Property Description (Optional)
          </label>
          <textarea
            placeholder="Describe your property in detail..."
            value={propertyData.description}
            onChange={(e) => updatePropertyData("description", e.target.value)}
            rows={4}
            className="w-full p-[12px] border border-[#C7CAD0] rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] resize-none text-[14px] leading-[22.4px]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Step1BasicDetails;
