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
  buildingTypeOptions,
  numberOptions,
} from "@/data/comprehensive-post-property-config";
import { PropertyFormData } from "@/types/post-property.types";
import {
  formatPriceForDisplay,
  cleanNumericInput,
} from "@/utils/price-helpers";
import { kebabToTitleCase } from "@/utils/helpers";

interface Option {
  value: string;
  label: string;
}

const ShortletStep1BasicDetails: React.FC = () => {
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
          Submit brief details for Shortlet Property
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Provide basic information about your shortlet property
        </p>
      </div>

      <div className="space-y-6">
        {/* Property Category - Only Residential for Shortlet */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Property Category <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {briefTypeConfig.shortlet?.propertyCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
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

        {/* Shortlet Duration */}
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
                  propertyData.shortletDuration
                    ? `${propertyData.shortletDuration} Price`
                    : "Property Value"
                }
                value={formatPriceForDisplay(propertyData.price)}
                onChange={handlePriceChange}
                placeholder={
                  propertyData.shortletDuration
                    ? `Enter ${propertyData.shortletDuration.toLowerCase()} price`
                    : "Enter amount"
                }
                prefix="₦"
                error={
                  typeof errors?.price === "string" ? errors.price : undefined
                }
                touched={!!touched?.price}
                required
                description={
                  propertyData.shortletDuration
                    ? `Enter the ${propertyData.shortletDuration.toLowerCase()} price`
                    : "Enter the estimated property value"
                }
              />
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

        {/* Property Details */}
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
                options={buildingTypeOptions.shortlet}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Shortlet Specific Fields */}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#707281] mb-2">
            Property Description (Optional)
          </label>
          <textarea
            placeholder="Describe your shortlet property in detail..."
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

export default ShortletStep1BasicDetails;
