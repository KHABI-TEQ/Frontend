"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    askingPrice: number;
    image?: string;
    location?: string;
  };
  onSubmit: (data: NegotiationData) => void;
}

interface NegotiationData {
  propertyId: string;
  proposedPrice: number;
  inspectionDate: string;
  inspectionTime: string;
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  message?: string;
}

const validationSchema = Yup.object({
  proposedPrice: Yup.number()
    .required("Proposed price is required")
    .positive("Price must be positive")
    .max(Yup.ref("askingPrice"), "Proposed price cannot exceed asking price"),
  inspectionDate: Yup.string().required("Inspection date is required"),
  inspectionTime: Yup.string().required("Inspection time is required"),
  fullName: Yup.string()
    .required("Full name is required")
    .min(2, "Name too short"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  email: Yup.string().email("Invalid email format"),
  message: Yup.string().max(500, "Message too long"),
});

const timeSlots = [
  "9:00 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:00 PM",
  "7:00 PM",
  "9:00 PM",
];

const getAvailableDates = () => {
  const dates: string[] = [];
  const dateI = new Date();
  dateI.setDate(dateI.getDate() + 3); // Start from 3 days from now

  // Get dates for the next 30 days
  for (let i = 0; i < 30; i++) {
    // Exclude Sundays (0 = Sunday)
    if (dateI.getDay() !== 0) {
      dates.push(format(dateI, "MMM d, yyyy"));
    }
    dateI.setDate(dateI.getDate() + 1);
  }

  return dates;
};

const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  property,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formattedPrice, setFormattedPrice] = useState("");
  const availableDates = getAvailableDates();

  const formik = useFormik({
    initialValues: {
      proposedPrice: 0,
      askingPrice: property.askingPrice,
      inspectionDate: availableDates[0] || "",
      inspectionTime: timeSlots[0],
      fullName: "",
      phoneNumber: "",
      email: "",
      message: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const negotiationData: NegotiationData = {
        propertyId: property.id,
        proposedPrice: values.proposedPrice,
        inspectionDate: values.inspectionDate,
        inspectionTime: values.inspectionTime,
        contactInfo: {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          email: values.email,
        },
        message: values.message,
      };

      onSubmit(negotiationData);
      toast.success("Negotiation request submitted successfully!");
      onClose();
      setCurrentStep(1);
      formik.resetForm();
      setFormattedPrice("");
    },
  });

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? Number(numericValue).toLocaleString() : "";
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const numericValue = Number(rawValue.replace(/,/g, ""));

    if (numericValue <= property.askingPrice) {
      const formatted = formatNumber(rawValue);
      setFormattedPrice(formatted);
      formik.setFieldValue("proposedPrice", numericValue);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        return formik.values.proposedPrice > 0 && !formik.errors.proposedPrice;
      case 2:
        return formik.values.inspectionDate && formik.values.inspectionTime;
      case 3:
        return (
          formik.values.fullName &&
          formik.values.phoneNumber &&
          !formik.errors.fullName &&
          !formik.errors.phoneNumber
        );
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8DDB90] to-[#6BC46D] text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={faClose} className="text-white" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Negotiate Price</h2>
            <p className="text-white/90">{property.title}</p>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? "bg-white text-[#8DDB90]"
                        : "bg-white/30 text-white"
                    }`}
                  >
                    {currentStep > step ? (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-[#8DDB90]"
                      />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-1 ${currentStep > step ? "bg-white" : "bg-white/30"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <form
            onSubmit={formik.handleSubmit}
            className="p-6 max-h-[60vh] overflow-y-auto"
          >
            {/* Step 1: Price Negotiation */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Enter Your Proposed Price
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Asking Price:</span>
                      <span className="text-xl font-bold text-gray-800">
                        ₦{property.askingPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proposed Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={formattedPrice}
                        onChange={handlePriceChange}
                        onBlur={formik.handleBlur}
                        name="proposedPrice"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        placeholder="Enter your offer"
                      />
                    </div>
                    {formik.touched.proposedPrice &&
                      formik.errors.proposedPrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.proposedPrice}
                        </p>
                      )}

                    {formik.values.proposedPrice > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Savings: ₦
                          {(
                            property.askingPrice - formik.values.proposedPrice
                          ).toLocaleString()}
                          (
                          {(
                            ((property.askingPrice -
                              formik.values.proposedPrice) /
                              property.askingPrice) *
                            100
                          ).toFixed(1)}
                          % discount)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Seller (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      placeholder="Explain your offer or add any additional information..."
                    />
                    {formik.touched.message && formik.errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Inspection Schedule */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Schedule Inspection
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspection Date *
                      </label>
                      <select
                        name="inspectionDate"
                        value={formik.values.inspectionDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      >
                        {availableDates.map((date) => (
                          <option key={date} value={date}>
                            {date}
                          </option>
                        ))}
                      </select>
                      {formik.touched.inspectionDate &&
                        formik.errors.inspectionDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.inspectionDate}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        name="inspectionTime"
                        value={formik.values.inspectionTime}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {formik.touched.inspectionTime &&
                        formik.errors.inspectionTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.inspectionTime}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-yellow-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Inspection Fee: ₦10,000
                        </p>
                        <p className="text-sm text-yellow-700">
                          This fee covers inspection and negotiation services
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      {formik.touched.fullName && formik.errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        placeholder="+234 123 456 7890"
                      />
                      {formik.touched.phoneNumber &&
                        formik.errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.phoneNumber}
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Negotiation Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Asking Price:</span>
                        <span>₦{property.askingPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Offer:</span>
                        <span>
                          ₦{formik.values.proposedPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Potential Savings:</span>
                        <span className="text-green-600">
                          ₦
                          {(
                            property.askingPrice - formik.values.proposedPrice
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Inspection Date:</span>
                        <span>
                          {formik.values.inspectionDate} at{" "}
                          {formik.values.inspectionTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </form>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : prevStep}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(currentStep)}
                  className="px-6 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                  }}
                  disabled={!canProceedFromStep(currentStep)}
                  className="px-6 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Negotiation
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NegotiationModal;
