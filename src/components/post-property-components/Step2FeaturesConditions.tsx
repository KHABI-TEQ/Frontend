"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFormikContext } from "formik";
import { usePostPropertyContext } from "@/context/post-property-context";
import RadioCheck from "@/components/general-components/radioCheck";
import EnhancedCheckbox from "@/components/general-components/EnhancedCheckbox";
import AdvancedTimeSelector from "@/components/general-components/AdvancedTimeSelector";
import {
  step2ValidationSchema,
  formatCurrency,
} from "@/utils/validation/post-property-validation";
import {
  formatPriceForDisplay,
  cleanNumericInput,
} from "@/utils/price-helpers";
import {
  briefTypeConfig,
  documentOptions,
  getFeaturesByCategory,
  landFeatures,
  residentialFeatures,
  commercialFeatures,
  rentalConditions,
  employmentTypes,
  tenantGenderPreferences,
  jvConditions,
  tenancyStatusOptions,
  shortletOptions,
  shouldShowField,
  BRIEF_TYPES,
  PROPERTY_CATEGORIES,
} from "@/data/comprehensive-post-property-config";


const Step2FeaturesConditions: React.FC = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<any>();

  const handleFieldChange = async (fieldName: string, value: any) => {
    setFieldTouched(fieldName, true);
    setFieldValue(fieldName, value);
    updatePropertyData(fieldName as any, value);
  };

  const getFieldBorderClass = (fieldName: string, isRequired = false) => {
    const isInvalid = touched[fieldName] && errors[fieldName];
    const fieldValue = propertyData[fieldName as keyof typeof propertyData];
    const hasValue =
      fieldValue &&
      fieldValue !== "" &&
      fieldValue !== 0 &&
      (Array.isArray(fieldValue) ? fieldValue.length > 0 : true);
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

  const handleMultiSelectChange = (field: string, value: string) => {
    const currentValues = (propertyData as any)[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item: string) => item !== value)
      : [...currentValues, value];
    handleFieldChange(field, newValues);
  };

  const renderMultiSelectOptions = (
    options: Array<{ value: string; label: string }>,
    field: string,
    title: string,
  ) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#09391C] mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={((propertyData as any)[field] || []).includes(
                option.value,
              )}
              onChange={() => handleMultiSelectChange(field, option.value)}
              className="w-4 h-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
            />
            <span className="text-sm text-[#5A5D63]">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderCommercialFeatures = () => (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-[#09391C] mb-3">
          Structure & Layout
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commercialFeatures.structure.map((option) => (
            <EnhancedCheckbox
              key={option.value}
              label={option.label}
              name="features"
              value={option.value}
              checked={(propertyData.features || []).includes(option.value)}
              onChange={() => handleMultiSelectChange("features", option.value)}
              variant="card"
            />
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-[#09391C] mb-3">
          Utilities & Power
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commercialFeatures.utilities.map((option) => (
            <EnhancedCheckbox
              key={option.value}
              label={option.label}
              name="features"
              value={option.value}
              checked={(propertyData.features || []).includes(option.value)}
              onChange={() => handleMultiSelectChange("features", option.value)}
              variant="card"
            />
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-[#09391C] mb-3">
          Security & Access
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commercialFeatures.security.map((option) => (
            <EnhancedCheckbox
              key={option.value}
              label={option.label}
              name="features"
              value={option.value}
              checked={(propertyData.features || []).includes(option.value)}
              onChange={() => handleMultiSelectChange("features", option.value)}
              variant="card"
            />
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-semibold text-[#09391C] mb-3">
          Parking & Visibility
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commercialFeatures.parking.map((option) => (
            <EnhancedCheckbox
              key={option.value}
              label={option.label}
              name="features"
              value={option.value}
              checked={(propertyData.features || []).includes(option.value)}
              onChange={() => handleMultiSelectChange("features", option.value)}
              variant="card"
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Features & Conditions
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Specify property features, documents, and conditions
        </p>
      </div>

      <div className="space-y-8">
        {/* Property Documents for Sell and JV */}
        {shouldShowField(
          "documents",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Property Documents / Title <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documentOptions.map((option) => (
                <EnhancedCheckbox
                  key={option.value}
                  label={option.label}
                  name="documents"
                  value={option.value}
                  checked={(propertyData.documents || []).includes(
                    option.value,
                  )}
                  onChange={() =>
                    handleMultiSelectChange("documents", option.value)
                  }
                  variant="card"
                  error={
                    (propertyData.propertyType === "sell" ||
                      propertyData.propertyType === "jv") &&
                    (!propertyData.documents ||
                      propertyData.documents.length === 0)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Features & Amenities - NOT for Joint Venture */}
        {propertyData.propertyType !== BRIEF_TYPES.JV && (
          <div className="border border-[#E5E7EB] rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#09391C] mb-2">
                Features & Amenities
              </h3>
              <p className="text-sm text-[#5A5D63]">
                Select all features and amenities available in your property
              </p>
            </div>

          {/* Residential Features */}
          {propertyData.propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL &&
            propertyData.propertyType !== BRIEF_TYPES.SHORTLET && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-[#09391C] mb-3">
                    Residential Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {residentialFeatures.map((option) => (
                      <EnhancedCheckbox
                        key={option.value}
                        label={option.label}
                        name="features"
                        value={option.value}
                        checked={(propertyData.features || []).includes(
                          option.value,
                        )}
                        onChange={() =>
                          handleMultiSelectChange("features", option.value)
                        }
                        variant="card"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Shortlet Amenities */}
          {propertyData.propertyType === BRIEF_TYPES.SHORTLET && (
            <div className="space-y-6">
              {/* General Amenities */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  General Amenities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.general.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Kitchen & Dining */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Kitchen & Dining
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.kitchen.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Bathroom */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Bathroom
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.bathroom.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Leisure & Wellness */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Leisure & Wellness
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.leisure.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Transport & Parking */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Transport & Parking
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.transport.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.security.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Family Friendly & Accessibility */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Family & Accessibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    ...shortletOptions.amenities.family,
                    ...shortletOptions.amenities.accessibility,
                  ].map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>

              {/* Location Perks */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-[#09391C] mb-3">
                  Location Perks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortletOptions.amenities.location.map((option) => (
                    <EnhancedCheckbox
                      key={option.value}
                      label={option.label}
                      name="features"
                      value={option.value}
                      checked={(propertyData.features || []).includes(
                        option.value,
                      )}
                      onChange={() =>
                        handleMultiSelectChange("features", option.value)
                      }
                      variant="card"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Land Features */}
          {propertyData.propertyCategory === PROPERTY_CATEGORIES.LAND && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-semibold text-[#09391C] mb-3">
                Land Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {landFeatures.map((option) => (
                  <EnhancedCheckbox
                    key={option.value}
                    label={option.label}
                    name="features"
                    value={option.value}
                    checked={(propertyData.features || []).includes(
                      option.value,
                    )}
                    onChange={() =>
                      handleMultiSelectChange("features", option.value)
                    }
                    variant="card"
                  />
                ))}
              </div>
            </div>
          )}

                      {/* Commercial Features */}
            {propertyData.propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL &&
              propertyData.propertyType !== BRIEF_TYPES.SHORTLET &&
              renderCommercialFeatures()}
          </div>
        )}

        {/* Rental Conditions - Different for each property type */}
        {propertyData.propertyType === BRIEF_TYPES.RENT && (
          <div className="space-y-6">
            {/* Residential Rental Properties */}
            {propertyData.propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                  Rental Conditions
                </h3>

                {/* Rental Conditions Checkboxes */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rentalConditions.map((option) => (
                      <EnhancedCheckbox
                        key={option.value}
                        label={option.label}
                        name="rentalConditions"
                        value={option.value}
                        checked={(propertyData.rentalConditions || []).includes(
                          option.value,
                        )}
                        onChange={() =>
                          handleMultiSelectChange(
                            "rentalConditions",
                            option.value,
                          )
                        }
                        variant="card"
                      />
                    ))}
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <h4 className="text-md font-semibold text-[#09391C] mb-3">
                    Employment Type
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {employmentTypes.map((option) => (
                      <RadioCheck
                        key={option.value}
                        selectedValue={propertyData.employmentType}
                        handleChange={() =>
                          updatePropertyData("employmentType", option.value)
                        }
                        type="radio"
                        value={option.value}
                        name="employmentType"
                        variant="card"
                      />
                    ))}
                  </div>
                </div>

                {/* Tenant Gender Preference */}
                <div>
                  <h4 className="text-md font-semibold text-[#09391C] mb-3">
                    Tenant Gender Preference
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {tenantGenderPreferences.map((option) => (
                      <RadioCheck
                        key={option.value}
                        selectedValue={propertyData.tenantGenderPreference}
                        handleChange={() =>
                          updatePropertyData(
                            "tenantGenderPreference",
                            option.value,
                          )
                        }
                        type="radio"
                        value={option.value}
                        name="tenantGenderPreference"
                        variant="card"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Rental Properties */}
            {propertyData.propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                  Rental Conditions
                </h3>

                {/* Rental Conditions Checkboxes */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rentalConditions.map((option) => (
                      <EnhancedCheckbox
                        key={option.value}
                        label={option.label}
                        name="rentalConditions"
                        value={option.value}
                        checked={(propertyData.rentalConditions || []).includes(
                          option.value,
                        )}
                        onChange={() =>
                          handleMultiSelectChange(
                            "rentalConditions",
                            option.value,
                          )
                        }
                        variant="card"
                      />
                    ))}
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <h4 className="text-md font-semibold text-[#09391C] mb-3">
                    Employment Type
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {employmentTypes.map((option) => (
                      <RadioCheck
                        key={option.value}
                        selectedValue={propertyData.employmentType}
                        handleChange={() =>
                          updatePropertyData("employmentType", option.value)
                        }
                        type="radio"
                        value={option.value}
                        name="employmentType"
                        variant="card"
                      />
                    ))}
                  </div>
                </div>

                {/* Tenant Gender Preference */}
                <div>
                  <h4 className="text-md font-semibold text-[#09391C] mb-3">
                    Tenant Gender Preference
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {tenantGenderPreferences.map((option) => (
                      <RadioCheck
                        key={option.value}
                        selectedValue={propertyData.tenantGenderPreference}
                        handleChange={() =>
                          updatePropertyData(
                            "tenantGenderPreference",
                            option.value,
                          )
                        }
                        type="radio"
                        value={option.value}
                        name="tenantGenderPreference"
                        variant="card"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Land Rental Properties - No rental conditions, employment type, or gender preferences */}
            {propertyData.propertyCategory === PROPERTY_CATEGORIES.LAND && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                  Land Rental Details
                </h3>
                <p className="text-sm text-[#5A5D63]">
                  No additional rental conditions are required for land properties.
                </p>
              </div>
            )}
          </div>
        )}

        {/* JV Conditions for Joint Venture */}
        {shouldShowField(
          "jvConditions",
          propertyData.propertyType,
          propertyData.propertyCategory,
        ) && (
          <div>
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              JV Conditions <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {jvConditions.map((option) => (
                <EnhancedCheckbox
                  key={option.value}
                  label={option.label}
                  name="jvConditions"
                  value={option.value}
                  checked={(propertyData.jvConditions || []).includes(
                    option.value,
                  )}
                  onChange={() =>
                    handleMultiSelectChange("jvConditions", option.value)
                  }
                  variant="card"
                  error={
                    propertyData.propertyType === "jv" &&
                    (!propertyData.jvConditions ||
                      propertyData.jvConditions.length === 0)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Shortlet Specific Fields */}
        {propertyData.propertyType === BRIEF_TYPES.SHORTLET && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Shortlet Details
            </h3>

            {/* Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Minimum Stay (nights) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={propertyData.availability?.minStay || 1}
                  onChange={(e) => {
                    const newValue = {
                      ...propertyData.availability,
                      minStay: parseInt(e.target.value) || 1,
                    };
                    handleFieldChange("availability", newValue);
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] ${
                    touched["availability.minStay"] &&
                    errors["availability.minStay"]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : touched["availability.minStay"] &&
                          !errors["availability.minStay"]
                        ? "border-green-500 focus:border-green-500 focus:ring-green-100"
                        : "border-[#C7CAD0]"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Maximum Stay (nights)
                </label>
                <input
                  type="number"
                  min="1"
                  value={propertyData.availability?.maxStay || ""}
                  onChange={(e) =>
                    updatePropertyData("availability", {
                      ...propertyData.availability,
                      maxStay: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Nightly Rate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPriceForDisplay(
                      propertyData.pricing?.nightly || 0,
                    )}
                    onChange={(e) => {
                      const numericValue = cleanNumericInput(e.target.value);
                      const newValue = {
                        ...propertyData.pricing,
                        nightly: parseInt(numericValue) || 0,
                      };
                      handleFieldChange("pricing", newValue);
                    }}
                    placeholder="Enter nightly rate"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] ${
                      touched["pricing.nightly"] && errors["pricing.nightly"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : touched["pricing.nightly"] &&
                            !errors["pricing.nightly"]
                          ? "border-green-500 focus:border-green-500 focus:ring-green-100"
                          : "border-[#C7CAD0]"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Weekly Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={propertyData.pricing?.weeklyDiscount || ""}
                  onChange={(e) => {
                    const newValue = {
                      ...propertyData.pricing,
                      weeklyDiscount: parseInt(e.target.value) || 0,
                    };
                    handleFieldChange("pricing", newValue);
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] ${
                    errors?.["pricing.weeklyDiscount"] &&
                    touched?.["pricing.weeklyDiscount"]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-[#C7CAD0]"
                  }`}
                />
                {errors?.["pricing.weeklyDiscount"] &&
                  touched?.["pricing.weeklyDiscount"] && (
                    <p className="text-red-500 text-sm mt-1">
                      {typeof errors["pricing.weeklyDiscount"] === "string"
                        ? errors["pricing.weeklyDiscount"]
                        : "Invalid weekly discount"}
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Monthly Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={propertyData.pricing?.monthlyDiscount || ""}
                  onChange={(e) =>
                    updatePropertyData("pricing", {
                      ...propertyData.pricing,
                      monthlyDiscount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Cleaning Fee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPriceForDisplay(
                      propertyData.pricing?.cleaningFee || 0,
                    )}
                    onChange={(e) => {
                      const numericValue = cleanNumericInput(e.target.value);
                      updatePropertyData("pricing", {
                        ...propertyData.pricing,
                        cleaningFee: parseInt(numericValue) || 0,
                      });
                    }}
                    placeholder="Enter cleaning fee"
                    className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Security Deposit
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPriceForDisplay(
                      propertyData.pricing?.securityDeposit || 0,
                    )}
                    onChange={(e) => {
                      const numericValue = cleanNumericInput(e.target.value);
                      updatePropertyData("pricing", {
                        ...propertyData.pricing,
                        securityDeposit: parseInt(numericValue) || 0,
                      });
                    }}
                    placeholder="Enter security deposit"
                    className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <h4 className="text-md font-semibold text-[#09391C] mb-3">
                Cancellation Policy
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shortletOptions.cancellationPolicies.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      propertyData.pricing?.cancellationPolicy === option.value
                        ? "border-[#8DDB90] bg-[#8DDB90]/10 text-[#09391C]"
                        : "border-gray-200 hover:border-[#8DDB90]/50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value={option.value}
                      checked={
                        propertyData.pricing?.cancellationPolicy ===
                        option.value
                      }
                      onChange={() =>
                        updatePropertyData("pricing", {
                          ...propertyData.pricing,
                          cancellationPolicy: option.value,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${
                        propertyData.pricing?.cancellationPolicy ===
                        option.value
                          ? "border-[#8DDB90] bg-[#8DDB90]"
                          : "border-gray-300"
                      }`}
                    >
                      {propertyData.pricing?.cancellationPolicy ===
                        option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-[#09391C] mb-3">
                House Rules
              </h4>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 mb-2">
                    Check-in & Check-out Schedule
                  </h5>
                  <p className="text-sm text-gray-600">
                    Set your preferred arrival and departure times
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Check-in Time <span className="text-red-500">*</span>
                    </label>
                    <AdvancedTimeSelector
                      value={propertyData.houseRules?.checkIn || "15:00"}
                      onChange={(time) => {
                        const newValue = {
                          ...propertyData.houseRules,
                          checkIn: time,
                        };
                        handleFieldChange("houseRules", newValue);
                      }}
                      placeholder="Select check-in time"
                      error={
                        !!(
                          errors?.["houseRules.checkIn"] &&
                          touched?.["houseRules.checkIn"]
                        )
                      }
                    />
                    {errors?.["houseRules.checkIn"] &&
                      touched?.["houseRules.checkIn"] && (
                        <p className="text-red-500 text-sm mt-2">
                          {typeof errors["houseRules.checkIn"] === "string"
                            ? errors["houseRules.checkIn"]
                            : "Invalid check-in time"}
                        </p>
                      )}
                    <p className="text-xs text-gray-500 mt-2">
                      Guests can arrive from this time
                    </p>
                  </div>

                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Check-out Time <span className="text-red-500">*</span>
                    </label>
                    <AdvancedTimeSelector
                      value={propertyData.houseRules?.checkOut || "11:00"}
                      onChange={(time) => {
                        const newValue = {
                          ...propertyData.houseRules,
                          checkOut: time,
                        };
                        handleFieldChange("houseRules", newValue);
                      }}
                      placeholder="Select check-out time"
                      error={
                        !!(
                          errors?.["houseRules.checkOut"] &&
                          touched?.["houseRules.checkOut"]
                        )
                      }
                    />
                    {errors?.["houseRules.checkOut"] &&
                      touched?.["houseRules.checkOut"] && (
                        <p className="text-red-500 text-sm mt-2">
                          {typeof errors["houseRules.checkOut"] === "string"
                            ? errors["houseRules.checkOut"]
                            : "Invalid check-out time"}
                        </p>
                      )}
                    <p className="text-xs text-gray-500 mt-2">
                      Guests must leave by this time
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Standard check-in is 3:00 PM and
                    check-out is 11:00 AM. Flexible times can attract more
                    guests!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <EnhancedCheckbox
                  label="Smoking Allowed"
                  name="smoking"
                  checked={propertyData.houseRules?.smoking || false}
                  onChange={(e) =>
                    updatePropertyData("houseRules", {
                      ...propertyData.houseRules,
                      smoking: e.target.checked,
                    })
                  }
                  variant="card"
                />
                <EnhancedCheckbox
                  label="Pets Allowed"
                  name="pets"
                  checked={propertyData.houseRules?.pets || false}
                  onChange={(e) =>
                    updatePropertyData("houseRules", {
                      ...propertyData.houseRules,
                      pets: e.target.checked,
                    })
                  }
                  variant="card"
                />
                <EnhancedCheckbox
                  label="Parties Allowed"
                  name="parties"
                  checked={propertyData.houseRules?.parties || false}
                  onChange={(e) =>
                    updatePropertyData("houseRules", {
                      ...propertyData.houseRules,
                      parties: e.target.checked,
                    })
                  }
                  variant="card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#707281] mb-2">
                  Other Rules (Optional)
                </label>
                <textarea
                  value={propertyData.houseRules?.otherRules || ""}
                  onChange={(e) =>
                    updatePropertyData("houseRules", {
                      ...propertyData.houseRules,
                      otherRules: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Specify any additional house rules..."
                  className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Property Tenancy Status */}
        <div>
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Is the property currently tenanted?{" "}
            <span className="text-red-500">*</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {tenancyStatusOptions.map((option) => (
              <RadioCheck
                key={option.value}
                selectedValue={propertyData.isTenanted}
                handleChange={() =>
                  handleFieldChange("isTenanted", option.value)
                }
                title={option.label}
                type="radio"
                value={option.value}
                name="isTenanted"
                variant="card"
                error={!propertyData.isTenanted}
              />
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-[#707281] mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            placeholder="Provide any additional details about the property..."
            value={propertyData.additionalInfo}
            onChange={(e) =>
              updatePropertyData("additionalInfo", e.target.value)
            }
            rows={4}
            className="w-full p-[12px] border border-[#C7CAD0] rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] resize-none text-[14px] leading-[22.4px]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Step2FeaturesConditions;
