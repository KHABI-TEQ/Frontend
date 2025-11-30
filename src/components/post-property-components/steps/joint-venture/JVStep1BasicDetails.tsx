"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
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
} from "@/data/comprehensive-post-property-config";
import { PropertyFormData } from "@/types/post-property.types";
import {
  formatPriceForDisplay,
  cleanNumericInput,
} from "@/utils/price-helpers";

interface Option {
  value: string;
  label: string;
}

const JVStep1BasicDetails: React.FC = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<PropertyFormData>();
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);

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

    if (isRequired && !hasValue) {
      return "border-red-500 focus:border-red-500 focus:ring-red-100";
    }

    if (isInvalid) {
      return "border-red-500 focus:border-red-500 focus:ring-red-100";
    }

    if (isValid) {
      return "border-green-500 focus:border-green-500 focus:ring-green-100";
    }

    return "border-[#C7CAD0]";
  };

  const getSelectBorderClass = (fieldName: string, isRequired = false) => {
    const isInvalid = touched[fieldName] && errors[fieldName];
    const fieldValue = propertyData[fieldName as keyof typeof propertyData];
    const hasValue = fieldValue && fieldValue !== "" && fieldValue !== 0;
    const isValid = hasValue && (!touched[fieldName] || !errors[fieldName]);

    if (isRequired && !hasValue) {
      return "#ef4444";
    }

    if (isInvalid) {
      return "#ef4444";
    }

    if (isValid) {
      return "#22c55e";
    }

    return "#C7CAD0";
  };

  const handlePriceChange = (value: string) => {
    const numericValue = cleanNumericInput(value);
    handleFieldChange("price", Number(numericValue));
  };

  useEffect(() => {
    const states = getStates().map((state: string) => ({
      value: state,
      label: state,
    }));
    setStateOptions(states);

    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (propertyData.state) {
      const lgas = getLGAsByState(propertyData.state.value).map(
        (lga: string) => ({
          value: lga,
          label: lga,
        }),
      );
      setLgaOptions(lgas);

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
      const areas = getAreasByStateLGA(
        propertyData.state.value,
        propertyData.lga.value,
      ).map((area: string) => ({
        value: area,
        label: area,
      }));
      setAreaOptions(areas);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Submit brief details for Joint Venture
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Provide basic information about your joint venture property
        </p>
      </div>

      <div className="space-y-6">
        {/* Property Category */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Property Category <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {briefTypeConfig.jv?.propertyCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  if (
                    propertyData.propertyCategory &&
                    propertyData.propertyCategory !== category
                  ) {
                    // Clear category-dependent fields - JV doesn't need property condition, building type, bedrooms
                    updatePropertyData("measurementType", "");
                    updatePropertyData("landSize", "");
                  }
                  handleFieldChange("propertyCategory", category);
                }}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  propertyData.propertyCategory === category
                    ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C] font-semibold"
                    : !propertyData.propertyCategory
                      ? "border-red-500 hover:border-red-600 text-[#5A5D63] bg-red-50/30"
                      : "border-[#C7CAD0] hover:border-[#8DDB90] text-[#5A5D63]"
                }`}
              >
                {category}
              </button>
            )) || []}
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Price Details <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <EnhancedPriceInput
                name="price"
                label="Property Value"
                value={formatPriceForDisplay(propertyData.price)}
                onChange={handlePriceChange}
                placeholder="Enter amount"
                prefix="₦"
                error={
                  typeof errors?.price === "string" ? errors.price : undefined
                }
                touched={!!touched?.price}
                required
                description="Enter the estimated property value for joint venture"
              />
            </div>
          </div>
        </div>

        {/* Land Size (ALWAYS required for JV) */}
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
                    borderColor: getSelectBorderClass("measurementType", true),
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
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
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
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#707281] mb-2">
            Property Description (Optional)
          </label>
          <textarea
            placeholder="Describe your joint venture property in detail..."
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

export default JVStep1BasicDetails;
