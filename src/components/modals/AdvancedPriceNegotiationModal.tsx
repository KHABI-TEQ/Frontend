/** @format */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, TrendingDown, TrendingUp, Info, DollarSign, Target, AlertCircle } from "lucide-react";
import Button from "@/components/general-components/button";

interface AdvancedPriceNegotiationModalProps {
  isOpen: boolean;
  property: any;
  onClose: () => void;
  onSubmit: (property: any, negotiatedPrice: number, strategy: string, reasoning: string) => void;
  existingNegotiation?: {
    propertyId: string;
    originalPrice: number;
    negotiatedPrice: number;
    strategy?: string;
    reasoning?: string;
  } | null;
}

const AdvancedPriceNegotiationModal: React.FC<AdvancedPriceNegotiationModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingNegotiation,
}) => {
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("market_analysis");
  const [reasoning, setReasoning] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState<"percentage" | "amount">("percentage");
  const [percentageReduction, setPercentageReduction] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract original price from property
  const originalPrice = property?.price || property?.rentalPrice || 0;

  useEffect(() => {
    if (existingNegotiation) {
      setNegotiatedPrice(existingNegotiation.negotiatedPrice.toString());
      setStrategy(existingNegotiation.strategy || "market_analysis");
      setReasoning(existingNegotiation.reasoning || "");
    } else {
      setNegotiatedPrice("");
      setStrategy("market_analysis");
      setReasoning("");
    }
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
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(property, priceNumber, strategy, reasoning);
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
      const formatted = newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setNegotiatedPrice(formatted);
    }
  };

  const getQuickPercentages = () => [5, 10, 15, 20, 25];

  const getStrategyInfo = (strategyType: string) => {
    const strategies = {
      market_analysis: {
        title: "Market Analysis",
        description: "Base negotiation on current market conditions and comparable properties",
        icon: TrendingDown,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      bulk_purchase: {
        title: "Bulk Purchase",
        description: "Leverage purchasing multiple properties or bringing other buyers",
        icon: Target,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      cash_offer: {
        title: "Cash Offer",
        description: "Offer immediate cash payment for a reduced price",
        icon: DollarSign,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      },
      quick_close: {
        title: "Quick Closing",
        description: "Offer to close the deal quickly in exchange for a lower price",
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      condition_based: {
        title: "Condition-Based",
        description: "Request price reduction based on property conditions or required repairs",
        icon: AlertCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      }
    };
    return strategies[strategyType as keyof typeof strategies] || strategies.market_analysis;
  };

  const currentStrategy = getStrategyInfo(strategy);

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
                  Submit a strategic offer for this property
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
                  <Info size={20} className="text-blue-600" />
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
                    <p className="text-sm text-gray-600 mb-1">Location</p>
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
                        max="50"
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      setNegotiatedPrice(formatted);
                    }}
                    placeholder="Enter your offer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
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
                  </div>
                )}
              </div>

              {/* Strategy Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Negotiation Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries({
                    market_analysis: "Market Analysis",
                    cash_offer: "Cash Offer",
                    quick_close: "Quick Closing",
                    bulk_purchase: "Bulk Purchase",
                    condition_based: "Condition-Based"
                  }).map(([key, title]) => {
                    const strategyInfo = getStrategyInfo(key);
                    const Icon = strategyInfo.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStrategy(key)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          strategy === key
                            ? `border-green-500 ${strategyInfo.bgColor}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={strategyInfo.color} />
                          <div>
                            <p className="font-medium text-gray-900">{title}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {strategyInfo.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>Advanced Options</span>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-2">
                        <div>
                          <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 mb-2">
                            Justification for Your Offer
                          </label>
                          <textarea
                            id="reasoning"
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="Explain why you believe this price is fair (market conditions, property condition, financing terms, etc.)"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            A well-reasoned offer increases your chances of acceptance
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  value={isSubmitting ? "Submitting..." : existingNegotiation ? "Update Offer" : "Submit Offer"}
                  isDisabled={isSubmitting || !negotiatedPrice}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedPriceNegotiationModal;
