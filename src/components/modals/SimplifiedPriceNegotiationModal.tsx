/** @format */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, TrendingDown, Info, Building, MapPin, AlertTriangle } from "lucide-react";
import Button from "@/components/general-components/button";

interface SimplifiedPriceNegotiationModalProps {
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

const SimplifiedPriceNegotiationModal: React.FC<SimplifiedPriceNegotiationModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingNegotiation,
}) => {
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState<"percentage" | "amount">("percentage");
  const [percentageReduction, setPercentageReduction] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Extract original price from property
  const originalPrice = property?.price || property?.rentalPrice || 0;
  const minimumPrice = Math.ceil(originalPrice * 0.8); // 80% minimum

  useEffect(() => {
    if (existingNegotiation) {
      setNegotiatedPrice(existingNegotiation.negotiatedPrice.toString());
    } else {
      setNegotiatedPrice("");
    }
    setValidationError("");
  }, [existingNegotiation]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNumber = parseFloat(negotiatedPrice.replace(/,/g, ""));
    
    if (!priceNumber || priceNumber <= 0) {
      setValidationError("Please enter a valid price");
      return;
    }

    if (priceNumber < minimumPrice) {
      setValidationError(`Offer cannot be less than 80% of the original price (₦${minimumPrice.toLocaleString()})`);
      return;
    }

    if (priceNumber >= originalPrice) {
      setValidationError("Offer must be less than the original price");
      return;
    }

    setIsSubmitting(true);
    setValidationError("");
    
    try {
      await onSubmit(property, priceNumber);
      onClose();
    } catch (error) {
      console.error("Error submitting price negotiation:", error);
      setValidationError("Failed to submit negotiation. Please try again.");
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

  const calculatePercentageChange = () => {
    const priceNumber = parseFloat(negotiatedPrice.replace(/,/g, ""));
    if (!priceNumber || !originalPrice) return 0;
    return ((originalPrice - priceNumber) / originalPrice) * 100;
  };

  const calculateSavings = () => {
    const priceNumber = parseFloat(negotiatedPrice.replace(/,/g, ""));
    if (!priceNumber || !originalPrice) return 0;
    return originalPrice - priceNumber;
  };

  const handlePercentageChange = (percentage: string) => {
    setPercentageReduction(percentage);
    const percentNum = parseFloat(percentage);
    if (!isNaN(percentNum) && originalPrice) {
      const reduction = (originalPrice * percentNum) / 100;
      const newPrice = originalPrice - reduction;
      
      // Ensure it doesn't go below 80%
      const finalPrice = Math.max(newPrice, minimumPrice);
      const formatted = finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setNegotiatedPrice(formatted);
      
      // Update percentage if it was capped
      if (finalPrice === minimumPrice) {
        const actualPercentage = ((originalPrice - minimumPrice) / originalPrice) * 100;
        setPercentageReduction(actualPercentage.toFixed(1));
      }
    }
    setValidationError("");
  };

  const handlePriceInputChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setNegotiatedPrice(formatted);
    
    // Update percentage
    const priceNumber = parseFloat(numericValue);
    if (priceNumber && originalPrice) {
      const percentage = ((originalPrice - priceNumber) / originalPrice) * 100;
      setPercentageReduction(percentage.toFixed(1));
    }
    setValidationError("");
  };

  const getQuickPercentages = () => {
    // Calculate maximum percentage based on 80% minimum
    const maxPercentage = 20; // 20% is maximum reduction (80% minimum)
    return [5, 10, 15, 20].filter(p => p <= maxPercentage);
  };

  const isValidPrice = () => {
    const priceNumber = parseFloat(negotiatedPrice.replace(/,/g, ""));
    return priceNumber >= minimumPrice && priceNumber < originalPrice;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Price Negotiation
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Submit your offer for this property
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Property Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-blue-600" />
                  Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Property Type</p>
                    <p className="font-medium text-gray-900">
                      {property?.propertyType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin size={14} />
                      Location
                    </p>
                    <p className="font-medium text-gray-900">
                      {property?.state && property?.lga 
                        ? `${property.state}, ${property.lga}` 
                        : "Location not specified"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Current Listed Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(originalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimum Price Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <div>
                    <p className="text-amber-800 font-medium">Negotiation Guidelines</p>
                    <p className="text-amber-700 text-sm">
                      Minimum offer: {formatPrice(minimumPrice)} (80% of original price)
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <X size={20} className="text-red-600" />
                    <p className="text-red-800 text-sm">{validationError}</p>
                  </div>
                </div>
              )}

              {/* Calculator Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calculator size={20} className="text-green-600" />
                    Negotiation Calculator
                  </h3>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setCalculatorMode("percentage")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        calculatorMode === "percentage"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorMode("amount")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        calculatorMode === "amount"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Amount
                    </button>
                  </div>
                </div>

                {calculatorMode === "percentage" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Percentage Reductions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getQuickPercentages().map((percent) => (
                          <button
                            key={percent}
                            type="button"
                            onClick={() => handlePercentageChange(percent.toString())}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            -{percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={percentageReduction}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        placeholder="Enter percentage"
                        min="0"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="negotiatedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Amount (₦)
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    id="negotiatedPrice"
                    value={negotiatedPrice}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    placeholder="Enter your offer"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-lg font-medium ${
                      isValidPrice() 
                        ? "border-green-300 focus:ring-green-500" 
                        : negotiatedPrice 
                        ? "border-red-300 focus:ring-red-500" 
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    required
                  />
                </div>

                {/* Price Analysis */}
                {negotiatedPrice && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Percentage Reduction:</span>
                      <span className={`font-semibold ${calculatePercentageChange() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculatePercentageChange().toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Savings:</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(calculateSavings())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`font-semibold text-sm ${isValidPrice() ? 'text-green-600' : 'text-red-600'}`}>
                        {isValidPrice() ? 'Valid Offer' : 'Invalid Offer'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  value={isSubmitting ? "Negotiating..." : existingNegotiation ? "Update Offer" : "Negotiate"}
                  isDisabled={isSubmitting || !negotiatedPrice || !isValidPrice()}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium py-3 px-6 rounded-lg transition-all"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimplifiedPriceNegotiationModal;
