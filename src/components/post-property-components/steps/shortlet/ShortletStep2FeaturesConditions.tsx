"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useFormikContext } from "formik";
import { usePostPropertyContext } from "@/context/post-property-context";
import RadioCheck from "@/components/general-components/radioCheck";
import EnhancedCheckbox from "@/components/general-components/EnhancedCheckbox";
import AdvancedTimeSelector from "@/components/general-components/AdvancedTimeSelector";
import {
  shortletOptions,
} from "@/data/comprehensive-post-property-config";
import {
  formatPriceForDisplay,
  cleanNumericInput,
} from "@/utils/price-helpers";

const ShortletStep2FeaturesConditions: React.FC = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<any>();

  useEffect(() => {
    const rawPrice = typeof propertyData.price === "number"
      ? (propertyData.price as number)
      : parseFloat((propertyData.price as any) || "0") || 0;
    const duration = propertyData.shortletDuration;
    let nightly = 0;
    if (duration === "Daily") nightly = rawPrice;
    else if (duration === "Weekly") nightly = Math.round(rawPrice / 7);
    else if (duration === "Monthly") nightly = Math.round(rawPrice / 30);

    const existingPricing = propertyData.pricing || {};
    if (existingPricing.nightly !== nightly) {
      updatePropertyData("pricing", { ...existingPricing, nightly });
    }
  }, [propertyData.price, propertyData.shortletDuration]);

  const handleFieldChange = async (fieldName: string, value: any) => {
    setFieldTouched(fieldName, true);
    setFieldValue(fieldName, value);
    updatePropertyData(fieldName as any, value);
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    const currentValues = (propertyData as any)[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item: string) => item !== value)
      : [...currentValues, value];
    handleFieldChange(field, newValues);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Shortlet Features & Conditions
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Specify shortlet amenities, pricing, and house rules
        </p>
      </div>

      <div className="space-y-8">
        {/* Shortlet Amenities */}
        <div className="border border-[#E5E7EB] rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#09391C] mb-2">
              Shortlet Amenities
            </h3>
            <p className="text-sm text-[#5A5D63]">
              Select all amenities available in your shortlet property
            </p>
          </div>

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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
                    variant="card"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shortlet Availability & Pricing */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#09391C] mb-4">
            Availability & Pricing
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
                  touched["availability.minStay"] && errors["availability.minStay"]
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : touched["availability.minStay"] && !errors["availability.minStay"]
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
                  value={formatPriceForDisplay(propertyData.pricing?.nightly || 0)}
                  readOnly
                  disabled
                  placeholder={
                    propertyData.shortletDuration
                      ? `Auto-calculated from ${propertyData.shortletDuration.toLowerCase()} price`
                      : "Auto-calculated nightly rate"
                  }
                  className={`w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] ${
                    touched["pricing.nightly"] && errors["pricing.nightly"]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : touched["pricing.nightly"] && !errors["pricing.nightly"]
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
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={propertyData.pricing?.weeklyDiscount ?? 0}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, parseInt(e.target.value || '0')));
                    updatePropertyData("pricing", {
                      ...propertyData.pricing,
                      weeklyDiscount: v,
                    });
                  }}
                  placeholder="Enter weekly discount percentage"
                  className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#707281] mb-2">
                Monthly Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={propertyData.pricing?.monthlyDiscount ?? 0}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, parseInt(e.target.value || '0')));
                    updatePropertyData("pricing", {
                      ...propertyData.pricing,
                      monthlyDiscount: v,
                    });
                  }}
                  placeholder="Enter monthly discount percentage"
                  className="w-full p-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#707281] mb-2">
                Cleaning Fee
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatPriceForDisplay(propertyData.pricing?.cleaningFee || 0)}
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
                  value={formatPriceForDisplay(propertyData.pricing?.securityDeposit || 0)}
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
                    checked={propertyData.pricing?.cancellationPolicy === option.value}
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
                      propertyData.pricing?.cancellationPolicy === option.value
                        ? "border-[#8DDB90] bg-[#8DDB90]"
                        : "border-gray-300"
                    }`}
                  >
                    {propertyData.pricing?.cancellationPolicy === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
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
                <strong>Tip:</strong> Standard check-in is 3:00 PM and check-out is 11:00 AM. 
                Flexible times can attract more guests!
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


        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-[#707281] mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            placeholder="Provide any additional details about the shortlet property..."
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

export default ShortletStep2FeaturesConditions;
