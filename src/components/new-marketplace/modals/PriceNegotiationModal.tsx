/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Input from "@/components/general-components/Input";
import Button from "@/components/general-components/button";
import { archivo } from "@/styles/font";

interface PriceNegotiationModalProps {
  isOpen: boolean;
  property: any;
  onClose: () => void;
  onSubmit: (property: any, negotiatedPrice: number) => void;
  existingNegotiation?: {
    propertyId: string;
    originalPrice: number;
    negotiatedPrice: number;
  } | null;
}

const PriceNegotiationModal: React.FC<PriceNegotiationModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingNegotiation,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format number with commas
  const formatNumber = (value: string | number): string => {
    const numValue =
      typeof value === "string" ? value.replace(/,/g, "") : value.toString();
    if (!numValue || isNaN(Number(numValue))) return "";
    return Number(numValue).toLocaleString();
  };

  // Remove commas for numeric operations
  const unformatNumber = (value: string): string => {
    return value.replace(/,/g, "");
  };

  const validationSchema = Yup.object({
    negotiatedPrice: Yup.string()
      .required("Negotiated price is required")
      .test("is-valid-number", "Please enter a valid number", (value) => {
        if (!value) return false;
        const numValue = Number(unformatNumber(value));
        return !isNaN(numValue) && numValue > 0;
      })
      .test(
        "not-greater-than-asking",
        "Negotiated price cannot be higher than asking price",
        (value) => {
          if (!value) return true;
          const numValue = Number(unformatNumber(value));
          const askingPrice = property?.price || 0;
          return numValue <= askingPrice;
        },
      ),
  });

  const formik = useFormik({
    initialValues: {
      negotiatedPrice: existingNegotiation?.negotiatedPrice || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const numericPrice = Number(
          unformatNumber(String(values.negotiatedPrice)),
        );
        const askingPrice = property?.price || 0;

        if (numericPrice > askingPrice) {
          toast.error("Negotiated price cannot be higher than asking price");
          return;
        }

        onSubmit(property, numericPrice);
      } catch (error) {
        console.error("Error submitting negotiation:", error);
        toast.error("Failed to submit negotiation. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (existingNegotiation) {
      formik.setFieldValue(
        "negotiatedPrice",
        formatNumber(existingNegotiation.negotiatedPrice),
      );
    }
  }, [existingNegotiation]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle input change with formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const unformattedValue = unformatNumber(value);

    // Only allow numeric input
    if (unformattedValue === "" || /^\d+$/.test(unformattedValue)) {
      const formattedValue = unformattedValue
        ? formatNumber(unformattedValue)
        : "";
      formik.setFieldValue("negotiatedPrice", formattedValue);
    }
  };

  const askingPrice = property?.price || 0;
  const savings = formik.values.negotiatedPrice
    ? askingPrice -
      Number(unformatNumber(String(formik.values.negotiatedPrice)))
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={onClose}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2
                className={`text-xl font-semibold text-[#24272C] ${archivo.className}`}
              >
                {existingNegotiation
                  ? "Update Price Negotiation"
                  : "Price Negotiation"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faClose} className="text-[#5A5D63]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Property Info */}
              <div className="bg-[#F7F7F8] rounded-lg p-4 mb-6">
                <h3
                  className={`font-medium text-[#24272C] mb-2 ${archivo.className}`}
                >
                  Property Details
                </h3>
                <div className="space-y-1 text-sm text-[#5A5D63]">
                  <p>Type: {property?.propertyType || "N/A"}</p>
                  <p>
                    Location: {property?.location?.area || "N/A"},{" "}
                    {property?.location?.localGovernment || ""}
                  </p>
                  <p className="font-semibold text-[#24272C]">
                    Asking Price: ₦{Number(askingPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Negotiated Price Input */}
                <div>
                  <label
                    htmlFor="negotiatedPrice"
                    className={`block text-base text-[#24272C] ${archivo.className} font-medium mb-1`}
                  >
                    Your Offer Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5A5D63]">
                      ₦
                    </span>
                    <input
                      name="negotiatedPrice"
                      id="negotiatedPrice"
                      type="text"
                      placeholder="Enter your offer price"
                      value={formik.values.negotiatedPrice}
                      onChange={handlePriceChange}
                      onBlur={formik.handleBlur}
                      className={`pl-8 pr-3 h-[50px] bg-[#FFFFFF] border-[1px] border-[#E9EBEB] w-full text-base placeholder:text-[#A7A9AD] text-black ${archivo.className} rounded-[5px] outline-none focus:border-[#8DDB90]`}
                    />
                  </div>
                  {formik.errors.negotiatedPrice &&
                    formik.touched.negotiatedPrice && (
                      <span
                        className={`${archivo.className} text-xs text-red-500 mt-1 block`}
                      >
                        {formik.errors.negotiatedPrice}
                      </span>
                    )}
                </div>

                {/* Savings Display */}
                {savings > 0 && (
                  <div className="bg-[#E4EFE7] rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#09391C] font-medium">
                        Potential Savings:
                      </span>
                      <span className="text-[#8DDB90] font-semibold">
                        ₦{Number(savings).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submission Note */}
                <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-lg p-3">
                  <p className="text-[#E65100] text-xs">
                    <strong>Note:</strong> Submitting this negotiation will
                    automatically add this property to your inspection list.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-[#E9EBEB] text-[#5A5D63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    value={
                      isSubmitting
                        ? "Submitting..."
                        : existingNegotiation
                          ? "Update Offer"
                          : "Submit Offer"
                    }
                    isDisabled={
                      isSubmitting ||
                      !formik.isValid ||
                      !formik.values.negotiatedPrice ||
                      Number(
                        unformatNumber(String(formik.values.negotiatedPrice)),
                      ) > askingPrice
                    }
                    className="flex-1 py-3 px-4 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PriceNegotiationModal;
