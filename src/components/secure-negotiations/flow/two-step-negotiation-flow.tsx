"use client";

import React, { useState, useEffect } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion, AnimatePresence } from "framer-motion";
import PriceNegotiationStep from "./price-negotiation-step";
import LOINegotiationStep from "./loi-negotiation-step";
import InspectionDateTimeStep from "./inspection-datetime-step";
import AwaitingResponseDisplay from "./awaiting-response-display";

interface TwoStepNegotiationFlowProps {
  userType: "seller" | "buyer";
}

const TwoStepNegotiationFlow: React.FC<TwoStepNegotiationFlowProps> = ({
  userType,
}) => {
  const { state, canNegotiate } = useSecureNegotiation();
  const { details, inspectionType, stage, pendingResponseFrom } = state;
  const [currentStep, setCurrentStep] = useState<
    "loi" | "price" | "inspection"
  >("loi");
  const [negotiationAction, setNegotiationAction] = useState<{
    type: "accept" | "counter" | "reject";
    counterPrice?: number;
    loiFile?: File;
    changeRequest?: string;
    rejectReason?: string;
  } | null>(null);

  // Determine which steps are needed based on inspectionType
  const hasLOI = inspectionType === "LOI" && details?.letterOfIntention;
  const hasPriceNegotiation =
    inspectionType === "price" &&
    ((details?.negotiationPrice && details.negotiationPrice > 0) ||
      details?.isNegotiating);

  // Check if user can negotiate (it's their turn and negotiation is active)
  const userCanNegotiate = canNegotiate(userType);
  const isAwaitingResponse = pendingResponseFrom !== userType;

  useEffect(() => {
    // Determine starting step based on stage and inspection type
    if (stage === "negotiation") {
      if (hasLOI) {
        setCurrentStep("loi");
      } else if (hasPriceNegotiation) {
        setCurrentStep("price");
      } else {
        setCurrentStep("inspection");
      }
    } else if (stage === "inspection") {
      setCurrentStep("inspection");
    }
  }, [hasLOI, hasPriceNegotiation, stage]);

  const handleLOIComplete = (
    action: "accept" | "reject",
    rejectReason?: string,
  ) => {
    setNegotiationAction({
      type: action,
      rejectReason
    });

    setCurrentStep("inspection");
  };

  const handlePriceNegotiationComplete = (
    action: "accept" | "counter" | "reject",
    counterPrice?: number,
    rejectReason?: string,
  ) => {
    setNegotiationAction({
      type: action,
      counterPrice,
      rejectReason,
    });
    // Always proceed to inspection section regardless of action
    setCurrentStep("inspection");
  };

  // Show awaiting response if it's not user's turn
  if (isAwaitingResponse) {
    return (
      <AwaitingResponseDisplay
        userType={userType}
        pendingResponseFrom={pendingResponseFrom || "admin"}
        timeRemaining=""
      />
    );
  }

  // If user cannot negotiate, show appropriate message
  if (!userCanNegotiate) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Negotiation Not Available
          </h3>
          <p className="text-gray-700">
            {stage === "completed"
              ? "This negotiation has been completed."
              : stage === "cancelled"
                ? "This negotiation has been cancelled."
                : "Negotiation is not available at this time."}
          </p>
        </div>
      </div>
    );
  }

  const canGoBackToPrice =
    currentStep === "inspection" &&
    details?.sellerCounterOffer &&
    details.sellerCounterOffer > 0;

  const canGoBackToLOI =
    (currentStep === "price" || currentStep === "inspection") &&
    hasLOI &&
    details?.stage !== "cancelled";

  const handleGoBackToPrice = () => {
    if (canGoBackToPrice) {
      setCurrentStep("price");
      setNegotiationAction(null);
    }
  };

  const handleGoBackToLOI = () => {
    if (canGoBackToLOI) {
      setCurrentStep("loi");
      setNegotiationAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      {canGoBackToLOI &&
      (currentStep === "price" || currentStep === "inspection") ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-yellow-700">
              <span className="font-medium">LOI Review in progress.</span> You
              can go back to review the Letter of Intention.
            </div>
            <button
              onClick={handleGoBackToLOI}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm"
            >
              ← Back to LOI Review
            </button>
          </div>
        </motion.div>
      ) : null}

      {currentStep === "inspection" && canGoBackToPrice ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-blue-700">
              <span className="font-medium">Price was countered.</span> You can
              go back to review the price negotiation.
            </div>
            <button
              onClick={handleGoBackToPrice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              ← Back to Price Negotiation
            </button>
          </div>
        </motion.div>
      ) : null}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === "loi" && hasLOI && (
          <motion.div
            key="loi-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LOINegotiationStep
              userType={userType}
              onActionSelected={handleLOIComplete}
            />
          </motion.div>
        )}

        {currentStep === "price" && hasPriceNegotiation && (
          <motion.div
            key="price-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PriceNegotiationStep
              userType={userType}
              onActionSelected={handlePriceNegotiationComplete}
            />
          </motion.div>
        )}

        {currentStep === "inspection" && (
          <motion.div
            key="inspection-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InspectionDateTimeStep
              userType={userType}
              negotiationAction={negotiationAction}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TwoStepNegotiationFlow;
