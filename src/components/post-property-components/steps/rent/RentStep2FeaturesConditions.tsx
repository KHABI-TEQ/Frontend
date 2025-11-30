"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFormikContext } from "formik";
import { usePostPropertyContext } from "@/context/post-property-context";
import RadioCheck from "@/components/general-components/radioCheck";
import EnhancedCheckbox from "@/components/general-components/EnhancedCheckbox";
import {
  landFeatures,
  residentialFeatures,
  commercialFeatures,
  rentalConditions,
  employmentTypes,
  tenantGenderPreferences,
  tenancyStatusOptions,
  PROPERTY_CATEGORIES,
} from "@/data/comprehensive-post-property-config";

const RentStep2FeaturesConditions: React.FC = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<any>();

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
          Rent Property Features & Conditions
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Specify property features and rental conditions
        </p>
      </div>

      <div className="space-y-8">
        {/* Features & Amenities */}
        <div className="border border-[#E5E7EB] rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#09391C] mb-2">
              Features & Amenities
            </h3>
            <p className="text-sm text-[#5A5D63]">
              Select all features and amenities available in your rental property
            </p>
          </div>

          {/* Residential Features */}
          {propertyData.propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL && (
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
                    variant="card"
                  />
                ))}
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
                    checked={(propertyData.features || []).includes(option.value)}
                    onChange={() => handleMultiSelectChange("features", option.value)}
                    variant="card"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Commercial Features */}
          {propertyData.propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL &&
            renderCommercialFeatures()}
        </div>

        {/* Rental Conditions */}
        <div className="space-y-6">
          {/* Residential and Commercial Rental Properties */}
          {(propertyData.propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
            propertyData.propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL) && (
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
                        handleMultiSelectChange("rentalConditions", option.value)
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
                      title={option.label}
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
                      title={option.label}
                      value={option.value}
                      name="tenantGenderPreference"
                      variant="card"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Land Rental Properties */}
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
            placeholder="Provide any additional details about the rental property..."
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

export default RentStep2FeaturesConditions;
