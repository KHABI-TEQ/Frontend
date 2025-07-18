/** @format */

"use client";
import React, { useCallback, useMemo, memo, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import PhoneInput from "react-phone-number-input";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import "react-phone-number-input/style.css";
import { usePreferenceForm } from "@/context/preference-form-context";
import {
  contactInfoSchema,
  jointVentureContactSchema,
} from "@/utils/validation/preference-validation";
import * as Yup from "yup";

interface ContactInformationProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

// Memoized static data to prevent recreation
const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible" },
  { value: "moderate", label: "Moderate" },
  { value: "strict", label: "Strict" },
];

const CHECK_TIMES = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

// Custom select styles - memoized to prevent recreation
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
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "15px",
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
  }),
};

// Enhanced validation schema for shortlet
const shortletContactSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
    .required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number",
    )
    .required("Phone number is required"),
  preferredCheckInTime: Yup.string().nullable(),
  preferredCheckOutTime: Yup.string().nullable(),
  petsAllowed: Yup.boolean().default(false),
  smokingAllowed: Yup.boolean().default(false),
  partiesAllowed: Yup.boolean().default(false),
  additionalRequests: Yup.string()
    .max(1000, "Additional requests must be less than 1000 characters")
    .nullable(),
  maxBudgetPerNight: Yup.number()
    .min(0, "Budget cannot be negative")
    .nullable(),
  willingToPayExtra: Yup.boolean().default(false),
  cleaningFeeBudget: Yup.number()
    .min(0, "Cleaning fee budget cannot be negative")
    .nullable(),
  securityDepositBudget: Yup.number()
    .min(0, "Security deposit budget cannot be negative")
    .nullable(),
  cancellationPolicy: Yup.string().nullable(),
});

// Optimized field components with proper memoization
const OptimizedField = memo(
  ({
    name,
    label,
    required = false,
    type = "text",
    placeholder,
    disabled = false,
    ...props
  }: any) => (
    <Field name={name}>
      {({ field, meta }: any) => (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            {...field}
            {...props}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
              meta.touched && meta.error
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-emerald-500"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {meta.touched && meta.error && (
            <div className="text-sm text-red-500 font-medium flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{meta.error}</span>
            </div>
          )}
        </div>
      )}
    </Field>
  ),
);

OptimizedField.displayName = "OptimizedField";

// Optimized Phone Field component
const OptimizedPhoneField = memo(({ name, label, required = false }: any) => (
  <Field name={name}>
    {({ field, meta, form }: any) => (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <PhoneInput
          international
          defaultCountry="NG"
          value={field.value}
          onChange={(value) => form.setFieldValue(name, value || "")}
          placeholder="Enter phone number"
          className={`modern-phone-input ${
            meta.touched && meta.error ? "error" : ""
          }`}
        />
        {meta.touched && meta.error && (
          <div className="text-sm text-red-500 font-medium flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{meta.error}</span>
          </div>
        )}
      </div>
    )}
  </Field>
));

OptimizedPhoneField.displayName = "OptimizedPhoneField";

// Optimized Select Field component
const OptimizedSelectField = memo(
  ({ name, label, options, required = false, placeholder }: any) => (
    <Field name={name}>
      {({ field, meta, form }: any) => (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <Select
            value={options.find((option: any) => option.value === field.value)}
            onChange={(selectedOption: any) =>
              form.setFieldValue(name, selectedOption?.value || "")
            }
            options={options}
            styles={customSelectStyles}
            placeholder={placeholder}
            isSearchable={false}
            className={meta.touched && meta.error ? "error" : ""}
          />
          {meta.touched && meta.error && (
            <div className="text-sm text-red-500 font-medium flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{meta.error}</span>
            </div>
          )}
        </div>
      )}
    </Field>
  ),
);

OptimizedSelectField.displayName = "OptimizedSelectField";

// Optimized Toggle Field component
const OptimizedToggleField = memo(({ name, label, description }: any) => (
  <Field name={name}>
    {({ field, form }: any) => (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-800">{label}</label>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="ml-4">
          <input
            type="checkbox"
            checked={field.value}
            onChange={(e) => form.setFieldValue(name, e.target.checked)}
            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
          />
        </div>
      </div>
    )}
  </Field>
));

OptimizedToggleField.displayName = "OptimizedToggleField";

// Main component
const OptimizedContactInformation: React.FC<ContactInformationProps> = memo(
  ({ preferenceType, className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized initial values to prevent recreation on every render
    const initialValues = useMemo(() => {
      const contactInfo = state.formData.contactInfo || {};

      if (preferenceType === "joint-venture") {
        return {
          companyName: contactInfo.companyName || "",
          contactPerson: contactInfo.contactPerson || "",
          email: contactInfo.email || "",
          phoneNumber: contactInfo.phoneNumber || "",
          cacRegistrationNumber: contactInfo.cacRegistrationNumber || "",
        };
      } else if (preferenceType === "shortlet") {
        return {
          fullName: contactInfo.fullName || "",
          email: contactInfo.email || "",
          phoneNumber: contactInfo.phoneNumber || "",
          preferredCheckInTime: contactInfo.preferredCheckInTime || "",
          preferredCheckOutTime: contactInfo.preferredCheckOutTime || "",
          petsAllowed: contactInfo.petsAllowed || false,
          smokingAllowed: contactInfo.smokingAllowed || false,
          partiesAllowed: contactInfo.partiesAllowed || false,
          additionalRequests: contactInfo.additionalRequests || "",
          maxBudgetPerNight: state.formData.budget?.maxPrice || 0,
          willingToPayExtra: contactInfo.willingToPayExtra || false,
          cleaningFeeBudget: contactInfo.cleaningFeeBudget || 0,
          securityDepositBudget: contactInfo.securityDepositBudget || 0,
          cancellationPolicy: contactInfo.cancellationPolicy || "",
        };
      } else {
        return {
          fullName: contactInfo.fullName || "",
          email: contactInfo.email || "",
          phoneNumber: contactInfo.phoneNumber || "",
        };
      }
    }, [
      preferenceType,
      state.formData.contactInfo,
      state.formData.budget?.maxPrice,
    ]);

    // Memoized validation schema
    const validationSchema = useMemo(() => {
      if (preferenceType === "joint-venture") {
        return jointVentureContactSchema;
      } else if (preferenceType === "shortlet") {
        return shortletContactSchema;
      } else {
        return contactInfoSchema;
      }
    }, [preferenceType]);

    // Debounced form submission to prevent excessive updates
    const handleFormSubmit = useCallback(
      (values: any) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          updateFormData({ contactInfo: values });
        }, 300);
      },
      [updateFormData],
    );

    // Format number with commas
    const formatNumberWithCommas = useCallback((value: string): string => {
      const cleaned = value.replace(/\D/g, "");
      return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, []);

    return (
      <motion.div
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Contact Information
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {preferenceType === "joint-venture"
              ? "Please provide your company details and contact information."
              : "Please provide your contact details so we can reach you about matching properties."}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize={false} // Prevent unnecessary reinitializations
        >
          {({ values, setFieldValue, submitForm }) => {
            // Auto-submit on value changes with debouncing
            React.useEffect(() => {
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
              }

              debounceTimeoutRef.current = setTimeout(() => {
                submitForm();
              }, 500);

              return () => {
                if (debounceTimeoutRef.current) {
                  clearTimeout(debounceTimeoutRef.current);
                }
              };
            }, [values, submitForm]);

            return (
              <Form className="space-y-6">
                {/* Joint Venture specific fields */}
                {preferenceType === "joint-venture" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <OptimizedField
                        name="companyName"
                        label="Company Name"
                        placeholder="Enter your company name"
                        required
                      />
                      <OptimizedField
                        name="contactPerson"
                        label="Contact Person"
                        placeholder="Enter contact person name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <OptimizedField
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter email address"
                        required
                      />
                      <OptimizedPhoneField
                        name="phoneNumber"
                        label="Phone Number"
                        required
                      />
                    </div>

                    <OptimizedField
                      name="cacRegistrationNumber"
                      label="CAC Registration Number"
                      placeholder="Enter CAC registration number (optional)"
                    />
                  </>
                )}

                {/* Regular contact fields for buy/rent */}
                {(preferenceType === "buy" || preferenceType === "rent") && (
                  <>
                    <OptimizedField
                      name="fullName"
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <OptimizedField
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter email address"
                        required
                      />
                      <OptimizedPhoneField
                        name="phoneNumber"
                        label="Phone Number"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Shortlet specific fields */}
                {preferenceType === "shortlet" && (
                  <>
                    <OptimizedField
                      name="fullName"
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <OptimizedField
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter email address"
                        required
                      />
                      <OptimizedPhoneField
                        name="phoneNumber"
                        label="Phone Number"
                        required
                      />
                    </div>

                    {/* Check-in/out preferences */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-800">
                        Check-in/Check-out Preferences
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OptimizedSelectField
                          name="preferredCheckInTime"
                          label="Preferred Check-in Time"
                          options={CHECK_TIMES}
                          placeholder="Select check-in time"
                        />
                        <OptimizedSelectField
                          name="preferredCheckOutTime"
                          label="Preferred Check-out Time"
                          options={CHECK_TIMES}
                          placeholder="Select check-out time"
                        />
                      </div>
                    </div>

                    {/* Guest preferences */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-800">
                        Guest Preferences
                      </h4>
                      <div className="space-y-3">
                        <OptimizedToggleField
                          name="petsAllowed"
                          label="Pets Allowed"
                          description="Do you need pet-friendly accommodation?"
                        />
                        <OptimizedToggleField
                          name="smokingAllowed"
                          label="Smoking Allowed"
                          description="Do you need smoking-friendly accommodation?"
                        />
                        <OptimizedToggleField
                          name="partiesAllowed"
                          label="Parties/Events Allowed"
                          description="Do you plan to host parties or events?"
                        />
                      </div>
                    </div>

                    {/* Additional preferences */}
                    <div className="space-y-4">
                      <Field name="additionalRequests">
                        {({ field, meta }: any) => (
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                              Additional Requests
                            </label>
                            <textarea
                              {...field}
                              placeholder="Any special requirements or additional requests..."
                              rows={4}
                              className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 resize-none ${
                                meta.touched && meta.error
                                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 focus:border-emerald-500"
                              }`}
                            />
                            {meta.touched && meta.error && (
                              <div className="text-sm text-red-500 font-medium">
                                {meta.error}
                              </div>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    {/* Budget preferences */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-800">
                        Budget Preferences
                      </h4>

                      <Field name="maxBudgetPerNight">
                        {({ field, meta }: any) => (
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                              Maximum Budget Per Night (₦)
                            </label>
                            <input
                              {...field}
                              type="text"
                              placeholder="0"
                              value={formatNumberWithCommas(
                                field.value?.toString() || "",
                              )}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, "");
                                setFieldValue(
                                  "maxBudgetPerNight",
                                  parseInt(value) || 0,
                                );
                              }}
                              className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                                meta.touched && meta.error
                                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 focus:border-emerald-500"
                              }`}
                            />
                            {meta.touched && meta.error && (
                              <div className="text-sm text-red-500 font-medium">
                                {meta.error}
                              </div>
                            )}
                          </div>
                        )}
                      </Field>

                      <OptimizedToggleField
                        name="willingToPayExtra"
                        label="Willing to Pay Extra for Premium Features"
                        description="Are you willing to pay additional fees for premium amenities?"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field name="cleaningFeeBudget">
                          {({ field, meta }: any) => (
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-800">
                                Cleaning Fee Budget (₦)
                              </label>
                              <input
                                {...field}
                                type="text"
                                placeholder="0"
                                value={formatNumberWithCommas(
                                  field.value?.toString() || "",
                                )}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /,/g,
                                    "",
                                  );
                                  setFieldValue(
                                    "cleaningFeeBudget",
                                    parseInt(value) || 0,
                                  );
                                }}
                                className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                                  meta.touched && meta.error
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-emerald-500"
                                }`}
                              />
                              {meta.touched && meta.error && (
                                <div className="text-sm text-red-500 font-medium">
                                  {meta.error}
                                </div>
                              )}
                            </div>
                          )}
                        </Field>

                        <Field name="securityDepositBudget">
                          {({ field, meta }: any) => (
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-800">
                                Security Deposit Budget (₦)
                              </label>
                              <input
                                {...field}
                                type="text"
                                placeholder="0"
                                value={formatNumberWithCommas(
                                  field.value?.toString() || "",
                                )}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /,/g,
                                    "",
                                  );
                                  setFieldValue(
                                    "securityDepositBudget",
                                    parseInt(value) || 0,
                                  );
                                }}
                                className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                                  meta.touched && meta.error
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-emerald-500"
                                }`}
                              />
                              {meta.touched && meta.error && (
                                <div className="text-sm text-red-500 font-medium">
                                  {meta.error}
                                </div>
                              )}
                            </div>
                          )}
                        </Field>
                      </div>

                      <OptimizedSelectField
                        name="cancellationPolicy"
                        label="Preferred Cancellation Policy"
                        options={CANCELLATION_POLICIES}
                        placeholder="Select cancellation policy"
                      />
                    </div>
                  </>
                )}
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    );
  },
);

OptimizedContactInformation.displayName = "OptimizedContactInformation";

export default OptimizedContactInformation;
