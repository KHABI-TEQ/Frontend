/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "@/components/general-components/button";

interface GlobalPriceNegotiationModalProps {
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

const GlobalPriceNegotiationModal: React.FC<GlobalPriceNegotiationModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingNegotiation,
}) => {
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract original price from property
  const originalPrice = property?.price || property?.rentalPrice || 0;

  useEffect(() => {
    if (existingNegotiation) {
      setNegotiatedPrice(existingNegotiation.negotiatedPrice.toString());
    } else {
      setNegotiatedPrice("");
    }
  }, [existingNegotiation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNumber = parseFloat(negotiatedPrice.replace(/,/g, ""));
    
    if (!priceNumber || priceNumber <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(property, priceNumber);
      onClose();
    } catch (error) {
      console.error("Error submitting price negotiation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Price Negotiation
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Property Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Property Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Property Type</p>
                <p className="font-medium text-gray-900 mb-3">
                  {property?.propertyType || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mb-1">Current Price</p>
                <p className="font-medium text-gray-900">
                  {formatPrice(originalPrice)}
                </p>
              </div>
            </div>

            {/* Price Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="negotiatedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Offer (₦)
                </label>
                <input
                  type="text"
                  id="negotiatedPrice"
                  value={negotiatedPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    setNegotiatedPrice(formatted);
                  }}
                  placeholder="Enter your offer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the amount you're willing to pay for this property
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  value={isSubmitting ? "Submitting..." : existingNegotiation ? "Update Offer" : "Submit Offer"}
                  isDisabled={isSubmitting || !negotiatedPrice}
                  className="flex-1 bg-[#1976D2] text-white hover:bg-[#1565C0] disabled:bg-gray-300 disabled:cursor-not-allowed"
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

export default GlobalPriceNegotiationModal;
