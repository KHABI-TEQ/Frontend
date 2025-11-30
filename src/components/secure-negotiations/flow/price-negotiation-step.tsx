"use client";

import React, { useState, useEffect } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import StandardPreloader from "@/components/new-marketplace/StandardPreloader";
import toast from "react-hot-toast";

interface PriceNegotiationStepProps {
  userType: "seller" | "buyer";
  onActionSelected: (
    action: "accept" | "counter" | "reject",
    counterPrice?: number,
    rejectReason?: string,
  ) => void;
}
 
const PriceNegotiationStep: React.FC<PriceNegotiationStepProps> = ({
  userType,
  onActionSelected,
}) => {
  const {
    state,
    submitNegotiationAction,
    createAcceptPayload,
    createRejectPayload,
    createCounterPayload,
  } = useSecureNegotiation();

  const { details, loadingStates, inspectionId, inspectionType } = state;
  const [counterPrice, setCounterPrice] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (showCounterModal || showRejectModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCounterModal, showRejectModal]);

  const propertyPrice = details?.propertyId?.price || 0;
  const negotiationPrice = details?.negotiationPrice || 0;
  const sellerCounterOffer = details?.sellerCounterOffer || 0;
  const counterCount = details?.counterCount || 0;

  // Determine current offer based on user type and available data
  const getCurrentOffer = () => {
    if (userType === "seller") {
      // Seller sees buyer's offer or negotiation price
      return negotiationPrice > 0 ? negotiationPrice : propertyPrice;
    } else {
      // Buyer sees seller's counter offer or their own negotiation price
      return sellerCounterOffer > 0 ? sellerCounterOffer : negotiationPrice;
    }
  };

  const currentOffer = getCurrentOffer();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDifference = () => {
    const diff = Math.abs(propertyPrice - currentOffer);
    const percentage =
      propertyPrice > 0 ? ((diff / propertyPrice) * 100).toFixed(1) : "0";
    return { amount: diff, percentage };
  };

  const canCounter = () => {
    return counterCount < 3;
  };

  const getRemainingCounters = () => {
    return Math.max(0, 3 - counterCount);
  }; 

  const isAboveAsk = currentOffer > propertyPrice;
  const difference = calculateDifference();

  const handleAccept = async () => {
    // Don't submit immediately, proceed to next step (inspection)
    onActionSelected("accept");
  };

  const handleReject = async () => {
    // Don't submit immediately, proceed to next step (inspection)
    setShowRejectModal(false);
    onActionSelected("reject", undefined, rejectReason);
    setRejectReason("")
  };

  const formatCounterPrice = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, "");
    // Add commas for thousands separator
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCounterPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCounterPrice(e.target.value);
    setCounterPrice(formattedValue);
  };

  const validateCounterPrice = (
    amount: number,
  ): { isValid: boolean; message: string } => {
    if (!amount || amount <= 0) {
      return {
        isValid: false,
        message: "Please enter a valid counter offer amount",
      };
    }

    if (amount > propertyPrice) {
      return {
        isValid: false,
        message: `Counter offer cannot exceed the original property price of ${formatCurrency(propertyPrice)}`,
      };
    }

    // 80% minimum rule for buyers only
    if (userType === "buyer") {
      const minimumOffer = propertyPrice * 0.8;
      if (amount < minimumOffer) {
        return {
          isValid: false,
          message: `You can't offer less than 80% of the seller's price. Minimum offer: ${formatCurrency(minimumOffer)}`,
        };
      }
    }

    return { isValid: true, message: "" };
  };

  const handleCounterSubmit = async () => {
    if (!canCounter()) {
      toast.error("You have reached the maximum number of counter negotiations (3)")
      return;
    }

    const counterAmount = parseFloat(counterPrice.replace(/[^\d.-]/g, ""));
    const validation = validateCounterPrice(counterAmount);

    if (!validation.isValid) {
      toast.error(validation.message)
      return;
    }

    // Don't submit immediately, proceed to next step (inspection)
    onActionSelected("counter", counterAmount);
    setShowCounterModal(false);
    setCounterPrice("");
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      <StandardPreloader
        isVisible={
          loadingStates.accepting ||
          loadingStates.countering ||
          loadingStates.rejecting
        }
        message={
          loadingStates.accepting
            ? "Accepting offer..."
            : loadingStates.countering
              ? "Submitting counter offer..."
              : loadingStates.rejecting
                ? "Rejecting offer..."
                : "Processing..."
        }
        overlay={true}
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#09391C] mb-2">
          Price Negotiation
        </h2>
        <p className="text-gray-600">
          Review the offer and choose your response. You&apos;ll select
          inspection date/time on the next step.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#EEF1F1] rounded-lg border border-[#C7CAD0]">
            <p className="text-sm font-medium text-[#09391C]">
              Inspection Type: Price Negotiation
            </p>
          </div>
          <div className="p-3 bg-[#FFF3E0] rounded-lg border border-[#FFB74D]">
            <p className="text-sm font-medium text-[#E65100]">
              Counter Negotiations: {counterCount}/3 used
            </p>
            <p className="text-xs text-[#E65100] mt-1">
              {getRemainingCounters()} negotiations remaining
            </p>
          </div>
        </div>
      </div>

      {/* Price Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#EEF1F1] rounded-lg p-6 border border-[#C7CAD0]"
      >
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Price Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Price */}
          <div className="bg-white p-4 rounded-lg border border-[#C7CAD0]">
            <div className="text-sm text-gray-600 mb-1">Original Price</div>
            <div className="text-2xl font-bold text-[#09391C]">
              {formatCurrency(propertyPrice)}
            </div>
          </div>

          {/* Current Offer */}
          <div
            className={`p-4 rounded-lg border ${
              isAboveAsk
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">
              {userType === "seller" ? "Buyer's Offer" : "Current Offer"}
            </div>
            <div
              className={`text-2xl font-bold ${
                isAboveAsk ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(currentOffer)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isAboveAsk ? "+" : "-"}
              {difference.percentage}% from original
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons - Only 3 buttons as per requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#EEF1F1] rounded-lg p-6 border border-[#C7CAD0]"
      >
        <h4 className="font-medium text-[#09391C] mb-4">
          Choose Your Response
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex items-center justify-center space-x-2 p-4 bg-[#09391C] text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FiCheckCircle className="w-5 h-5" />
            <span>Accept Offer</span>
          </button>

          {/* Counter Offer Button */}
          <button
            onClick={() => setShowCounterModal(true)}
            disabled={!canCounter()}
            className="flex items-center justify-center space-x-2 p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <FiDollarSign className="w-5 h-5" />
            <span>{userType === "buyer" ? "Negotiate" : "Counter Offer"}</span>
          </button>

          {/* Reject Button */}
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loadingStates.rejecting}
            className="flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
          >
            <FiXCircle className="w-5 h-5" />
            <span>Reject Offer</span>
          </button>
        </div>

        {/* Counter Limit Notice */}
        {!canCounter() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiAlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm font-medium text-red-600">
                Counter limit reached (3/3)
              </p>
            </div>
            <p className="text-sm text-red-600 mt-1">
              You have used all available counter negotiations. You can accept or reject the current offer.
            </p>
          </div>
        )}
      </motion.div>

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 -top-6 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#C7CAD0]"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                Make Counter Offer
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counter Offer Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <input
                      type="text"
                      value={counterPrice}
                      onChange={handleCounterPriceChange}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 border border-[#C7CAD0] rounded-lg focus:ring-2 focus:ring-[#09391C] focus:border-transparent"
                    />
                  </div>

                  {/* Validation feedback */}
                  {counterPrice &&
                    (() => {
                      const amount = parseFloat(
                        counterPrice.replace(/[^\d.-]/g, ""),
                      );
                      const validation = validateCounterPrice(amount);
                      if (!validation.isValid) {
                        return (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600 font-medium">
                              {validation.message}
                            </p>
                          </div>
                        );
                      } else if (amount > 0) {
                        // Show success message for valid offers
                        return (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-600 font-medium">
                              ✅ Valid offer amount
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                  {/* Price reference */}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      Original price: {formatCurrency(propertyPrice)}
                    </p>
                    {userType === "buyer" && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-700">
                          <span className="font-medium">Note:</span> Minimum
                          offer allowed is 80% of seller&spos;s price:{" "}
                          {formatCurrency(propertyPrice * 0.8)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleCounterSubmit}
                    disabled={(() => {
                      if (!counterPrice.trim()) return true;
                      const amount = parseFloat(
                        counterPrice.replace(/[^\d.-]/g, ""),
                      );
                      return !validateCounterPrice(amount).isValid;
                    })()}
                    className="flex-1 py-3 bg-[#09391C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    Continue to Inspection
                  </button>
                  <button
                    onClick={() => {
                      setShowCounterModal(false);
                      setCounterPrice("");
                    }}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 -top-6 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#C7CAD0]"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-[#09391C]">
                  Confirm Rejection
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to reject this offer?
                This will end the current negotiation, but you can still proceed with the inspection process.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback for Rejecting (Optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="state the reason for rejecting this price offer..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#09391C] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleReject}
                    disabled={loadingStates.rejecting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {loadingStates.rejecting ? "Rejecting..." : "Yes, Reject"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                    }}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PriceNegotiationStep;
