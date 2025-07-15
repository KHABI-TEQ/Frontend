/** @format */

"use client";
import React, { useCallback, useEffect, useMemo, memo, useRef } from "react";
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

// Cancellation policy options for shortlet
const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible" },
  { value: "moderate", label: "Moderate" },
  { value: "strict", label: "Strict" },
];

// Check-in/out time options
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

// Custom select styles
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

const ContactInformation: React.FC<ContactInformationProps> = memo(({
  preferenceType,
  className = "",
}) => {
  const { state, updateFormData } = usePreferenceForm();

  // Format number with commas
  const formatNumberWithCommas = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  // Get initial values based on preference type
  const getInitialValues = useCallback(() => {
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

  // Get validation schema based on preference type
  const getValidationSchema = useCallback(() => {
    if (preferenceType === "joint-venture") {
      return jointVentureContactSchema;
    } else if (preferenceType === "shortlet") {
      return shortletContactSchema;
    } else {
      return contactInfoSchema;
    }
  }, [preferenceType]);

  // Memoized Custom Field component with animation
  const AnimatedField = memo(({
    name,
    label,
    required = false,
    type = "text",
    placeholder,
    ...props
  }: any) => (
    <Field name={name}>
      {({ field, meta }: any) => (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <motion.input
            {...field}
            {...props}
            type={type}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
              meta.touched && meta.error
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-emerald-500"
            }`}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <AnimatePresence>
            {meta.touched && meta.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-500 font-medium flex items-center space-x-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{meta.error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </Field>
  ));

    // Memoized Custom Phone Field component
  const PhoneField = memo(({ name, label, required = false }: any) => (
    <Field name={name}>
      {({ field, meta, form }: any) => (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
          <AnimatePresence>
            {meta.touched && meta.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-500 font-medium flex items-center space-x-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{meta.error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </Field>
  ));

    // Handle form submission - debounced
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = useCallback(
    (values: any) => {
      updateFormData({ contactInfo: values });
    },
    [updateFormData],
  );

  // Debounced update function to prevent rapid re-renders
  const debouncedUpdate = useCallback(
    (values: any) => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      submitTimeoutRef.current = setTimeout(() => {
        handleSubmit(values);
      }, 500);
    },
    [handleSubmit],
  );

  return (
    <motion.div
      className={`space-y-8 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={getValidationSchema()}
        onSubmit={handleSubmit}
        enableReinitialize
      >
                {({ values, setFieldValue, errors, touched }) => {
          // Auto-submit when values change using useEffect with debouncing
          React.useEffect(() => {
            // Only update if values have actually changed and are not empty
            if (Object.keys(values).length > 0) {
              debouncedUpdate(values);
            }

            // Cleanup function
            return () => {
              if (submitTimeoutRef.current) {
                clearTimeout(submitTimeoutRef.current);
              }
            };
          }, [values, debouncedUpdate]);

          return (
            <Form>
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {preferenceType === "joint-venture"
                    ? "Company Information"
                    : preferenceType === "shortlet"
                      ? "Contact Information & Stay Preferences"
                      : "Contact Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  {preferenceType === "joint-venture"
                    ? "Provide your company details for partnership opportunities"
                    : preferenceType === "shortlet"
                      ? "Provide your contact details and specify your stay preferences"
                      : "We'll use this information to contact you about matching properties"}
                </p>
              </motion.div>

              {/* Joint Venture Form */}
              {preferenceType === "joint-venture" && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatedField
                      name="companyName"
                      label="Company / Developer Name"
                      required
                      placeholder="Enter company or developer name"
                    />
                    <AnimatedField
                      name="contactPerson"
                      label="Contact Person"
                      required
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PhoneField
                      name="phoneNumber"
                      label="Phone Number"
                      required
                    />
                    <AnimatedField
                      name="email"
                      label="Email Address"
                      type="email"
                      required
                      placeholder="Enter email address"
                    />
                  </div>

                  <AnimatedField
                    name="cacRegistrationNumber"
                    label="CAC Registration Number"
                    placeholder="Enter CAC registration number (e.g., RC123456)"
                  />
                </motion.div>
              )}

              {/* Shortlet Form */}
              {preferenceType === "shortlet" && (
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
                      Contact Information
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <AnimatedField
                        name="fullName"
                        label="Full Name"
                        required
                        placeholder="Enter your full name"
                      />
                      <PhoneField
                        name="phoneNumber"
                        label="Phone Number"
                        required
                      />
                      <AnimatedField
                        name="email"
                        label="Email Address"
                        type="email"
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Stay Preferences Section */}
                  <div className="space-y-6">
                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
                      Stay Preferences
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Preferred Check-in Time
                        </label>
                        <Select
                          options={CHECK_TIMES}
                          value={CHECK_TIMES.find(
                            (time) =>
                              time.value === values.preferredCheckInTime,
                          )}
                          onChange={(option) =>
                            setFieldValue(
                              "preferredCheckInTime",
                              option?.value || "",
                            )
                          }
                          placeholder="Select check-in time..."
                          styles={customSelectStyles}
                          isClearable
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Preferred Check-out Time
                        </label>
                        <Select
                          options={CHECK_TIMES}
                          value={CHECK_TIMES.find(
                            (time) =>
                              time.value === values.preferredCheckOutTime,
                          )}
                          onChange={(option) =>
                            setFieldValue(
                              "preferredCheckOutTime",
                              option?.value || "",
                            )
                          }
                          placeholder="Select check-out time..."
                          styles={customSelectStyles}
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Property Rules */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-semibold text-gray-800">
                        Property Rules Preferences
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <motion.label
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Field
                            name="petsAllowed"
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">
                            Pets Allowed
                          </span>
                        </motion.label>

                        <motion.label
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Field
                            name="smokingAllowed"
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">
                            Smoking Allowed
                          </span>
                        </motion.label>

                        <motion.label
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Field
                            name="partiesAllowed"
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">
                            Parties/Events Allowed
                          </span>
                        </motion.label>
                      </div>
                    </div>
                  </div>

                  {/* Budget & Pricing */}
                  <div className="space-y-6">
                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
                      Budget & Pricing Expectations
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Max Budget per Night{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₦
                          </span>
                          <input
                            type="text"
                            value={formatNumberWithCommas(
                              values.maxBudgetPerNight?.toString() || "0",
                            )}
                            readOnly
                            disabled
                            className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700 font-medium"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Auto-populated from your budget range (max price)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Preferred Cancellation Policy
                        </label>
                        <Select
                          options={CANCELLATION_POLICIES}
                          value={CANCELLATION_POLICIES.find(
                            (policy) =>
                              policy.value === values.cancellationPolicy,
                          )}
                          onChange={(option) =>
                            setFieldValue(
                              "cancellationPolicy",
                              option?.value || "",
                            )
                          }
                          placeholder="Select cancellation policy..."
                          styles={customSelectStyles}
                          isClearable
                        />
                      </div>
                    </div>

                    <motion.div className="space-y-4">
                      <motion.label
                        className="flex items-center space-x-3"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Field
                          name="willingToPayExtra"
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          Willing to Pay Extra for Premium Features
                        </span>
                      </motion.label>

                      <AnimatePresence>
                        {values.willingToPayExtra && (
                          <motion.div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-6"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatedField
                              name="cleaningFeeBudget"
                              label="Cleaning Fee Budget"
                              type="number"
                              placeholder="Enter cleaning fee budget"
                            />
                            <AnimatedField
                              name="securityDepositBudget"
                              label="Security Deposit Budget"
                              type="number"
                              placeholder="Enter security deposit budget"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Additional Requests */}
                  <Field name="additionalRequests">
                    {({ field, meta }: any) => (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-sm font-semibold text-gray-800">
                          Additional Requests or Notes{" "}
                          <span className="text-gray-500">(Optional)</span>
                        </label>
                        <motion.textarea
                          {...field}
                          placeholder="Enter any additional requests or special requirements..."
                          rows={4}
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 resize-none ${
                            meta.touched && meta.error
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-emerald-500"
                          }`}
                          whileFocus={{ scale: 1.01 }}
                        />
                        <AnimatePresence>
                          {meta.touched && meta.error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-red-500 font-medium"
                            >
                              {meta.error}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </Field>
                </motion.div>
              )}

              {/* Regular Form (Buy/Rent) */}
              {(preferenceType === "buy" || preferenceType === "rent") && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatedField
                    name="fullName"
                    label="Full Name"
                    required
                    placeholder="Enter your full name"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PhoneField
                      name="phoneNumber"
                      label="Phone Number"
                      required
                    />
                    <AnimatedField
                      name="email"
                      label="Email Address"
                      type="email"
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                </motion.div>
              )}
            </Form>
          );
        }}
      </Formik>

      {/* Enhanced Phone Input Styles */}
      <style jsx global>{`
        .modern-phone-input .PhoneInputInput {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 15px;
          transition: all 0.2s ease;
          width: 100%;
        }

        .modern-phone-input .PhoneInputInput:focus {
          outline: none;
          border-color: #10b981;
          ring: 2px solid #dcfce7;
        }

        .modern-phone-input.error .PhoneInputInput {
          border-color: #ef4444;
        }

        .modern-phone-input .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          margin-right: 8px;
        }
      `}</style>
    </motion.div>
  );
};

export default ContactInformation;