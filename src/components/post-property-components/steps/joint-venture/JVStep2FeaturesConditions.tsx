"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFormikContext } from "formik";
import { usePostPropertyContext } from "@/context/post-property-context";
import RadioCheck from "@/components/general-components/radioCheck";
import EnhancedCheckbox from "@/components/general-components/EnhancedCheckbox";
import {
  documentOptions,
  jvConditions,
  tenancyStatusOptions,
} from "@/data/comprehensive-post-property-config";

const JVStep2FeaturesConditions: React.FC = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Joint Venture Conditions & Documents
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          Specify property documents and joint venture conditions
        </p>
      </div>

      <div className="space-y-8">
        {/* Property Documents */}
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
                checked={(propertyData.documents || []).includes(option.value)}
                onChange={() =>
                  handleMultiSelectChange("documents", option.value)
                }
                variant="card"
                error={
                  !propertyData.documents || propertyData.documents.length === 0
                }
              />
            ))}
          </div>
          {(!propertyData.documents || propertyData.documents.length === 0) && (
            <p className="text-red-500 text-sm mt-2">
              At least one document type is required for joint venture properties
            </p>
          )}
        </div>

        {/* JV Conditions */}
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
                  !propertyData.jvConditions ||
                  propertyData.jvConditions.length === 0
                }
              />
            ))}
          </div>
          {(!propertyData.jvConditions ||
            propertyData.jvConditions.length === 0) && (
            <p className="text-red-500 text-sm mt-2">
              At least one JV condition is required
            </p>
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
            placeholder="Provide any additional details about the joint venture property..."
            value={propertyData.additionalInfo}
            onChange={(e) =>
              updatePropertyData("additionalInfo", e.target.value)
            }
            rows={4}
            className="w-full p-[12px] border border-[#C7CAD0] rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] resize-none text-[14px] leading-[22.4px]"
          />
        </div>

        {/* Joint Venture Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            💡 Joint Venture Information
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              • Joint venture properties focus on land development and investment partnerships
            </p>
            <p>
              • Property features and amenities are not required as the focus is on land potential
            </p>
            <p>
              • All property categories require land size specification for development planning
            </p>
            <p>
              • Ensure you have the necessary documents to verify ownership and development rights
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JVStep2FeaturesConditions;
