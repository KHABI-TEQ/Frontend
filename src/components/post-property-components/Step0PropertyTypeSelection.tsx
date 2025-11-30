"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFormikContext } from "formik";
import RadioCheck from "@/components/general-components/radioCheck";
import { usePostPropertyContext } from "@/context/post-property-context";
import { briefTypeConfig } from "@/data/comprehensive-post-property-config";

interface StepProps {
  // No props needed
}

const Step0PropertyTypeSelection: React.FC<StepProps> = () => {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { errors, touched, setFieldTouched, setFieldValue } =
    useFormikContext<any>();

  const handlePropertyTypeChange = (
    newBriefType: "sell" | "rent" | "jv" | "shortlet",
  ) => {
    // Mark field as touched for validation
    setFieldTouched("propertyType", true);
    setFieldValue("propertyType", newBriefType);

    // Reset form when brief type changes
    if (
      propertyData.propertyType &&
      propertyData.propertyType !== newBriefType
    ) {
      // Reset all form fields except the new property type
      updatePropertyData("resetFormExcept", ["propertyType"]);
    }

    updatePropertyData("propertyType", newBriefType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Type of Brief
        </h2>
        <p className="text-[16px] text-[#5A5D63]">
          What would you like to do with your property?
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(briefTypeConfig).map(([key, type]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
              propertyData.propertyType === key
                ? "border-[#8DDB90] bg-[#8DDB90] bg-opacity-10"
                : touched.propertyType && errors.propertyType
                  ? "border-red-500 hover:border-red-600 bg-red-50"
                  : "border-[#E5E7EB] hover:border-[#8DDB90] hover:bg-gray-50"
            }`}
            onClick={() => {
              const newBriefType = key as "sell" | "rent" | "jv" | "shortlet";
              handlePropertyTypeChange(newBriefType);
            }}
          >
            <div className="flex items-start gap-4">
              <RadioCheck
                name="propertyType"
                value={key}
                type="radio"
                isChecked={propertyData.propertyType === key}
                handleChange={(e) =>
                  handlePropertyTypeChange(
                    e.target.value as "sell" | "rent" | "jv" | "shortlet",
                  )
                }
                className="mt-1"
                showLabel={false}
                error={
                  !!(
                    touched.propertyType &&
                    (errors.propertyType || !propertyData.propertyType)
                  )
                }
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  <h3 className="text-lg font-semibold text-[#09391C]">
                    {type.label}
                  </h3>
                </div>
                <p className="text-[#5A5D63] text-sm leading-relaxed">
                  {type.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {propertyData.propertyType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-[#E4EFE7] rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {
                briefTypeConfig[
                  propertyData.propertyType as keyof typeof briefTypeConfig
                ]?.icon
              }
            </span>
            <span className="text-[#09391C] font-medium">
              {
                briefTypeConfig[
                  propertyData.propertyType as keyof typeof briefTypeConfig
                ]?.label
              }{" "}
              selected
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step0PropertyTypeSelection;
