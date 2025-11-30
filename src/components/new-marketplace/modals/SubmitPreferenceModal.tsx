/** @format */

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import Button from "@/components/general-components/button";
import Input from "@/components/general-components/Input";

interface SubmitPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: Array<{ key: string; label: string; value?: any }>;
}

const validationSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits"),
});

const SubmitPreferenceModal: React.FC<SubmitPreferenceModalProps> = ({
  isOpen,
  onClose,
  activeFilters,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Here you would typically send the data to your API
        console.log("Submitting preference:", {
          ...values,
          preferences: activeFilters,
        });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success(
          "Your preference has been submitted! We'll send you matching briefs.",
        );
        onClose();
        formik.resetForm();
      } catch (error) {
        toast.error("Failed to submit preference. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#09391C]">
                Submit Your Preference
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Message */}
              <div className="bg-[#E4EFE7] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#09391C] mb-3">
                  Can&apos;t find the brief you&apos;re looking for? Don&apos;t
                  worry! We&apos;ll provide a reference brief for you.
                </p>

                {/* Active Filters Display */}
                {activeFilters.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#09391C]">
                      Your selected preferences:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((filter, index) => (
                        <div
                          key={`${filter.key}-${index}`}
                          className="inline-flex items-center bg-[#8DDB90] text-white px-2 py-1 rounded-full text-xs"
                        >
                          {filter.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full"
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full"
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    value={isSubmitting ? "Submitting..." : "Submit Preference"}
                    className="flex-1 bg-[#8DDB90] text-white px-4 py-3 rounded-lg hover:bg-[#7BC87F] transition-colors disabled:opacity-50"
                    isDisabled={isSubmitting}
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitPreferenceModal;
