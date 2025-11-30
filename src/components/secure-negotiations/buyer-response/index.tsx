"use client";

import React, { useEffect } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import Loading from "@/components/loading-component/loading";
import SecureNegotiationLayout from "../layout/secure-negotiation-layout";
import TwoStepNegotiationFlow from "../flow/two-step-negotiation-flow";
import AwaitingResponseDisplay from "../flow/awaiting-response-display";
import EnhancedNegotiationSummary from "../pages/enhanced-negotiation-summary";
import EnhancedNegotiationCancelledSummary from "../pages/enhanced-negotiation-cancelled-summary";
import PropertyDetails from "../property/property-details";

interface SecureBuyerResponseIndexProps {
  userId: string;
  inspectionId: string;
}
 
const SecureBuyerResponseIndex: React.FC<SecureBuyerResponseIndexProps> = ({
  userId,
  inspectionId,
}) => {
  const { state, fetchNegotiationDetails, isUserTurn } =
    useSecureNegotiation();

  const { formStatus, details, stage, pendingResponseFrom } =
    state;

  useEffect(() => {
    if (userId && inspectionId) {
      fetchNegotiationDetails(userId, inspectionId, "buyer");
    }
  }, [userId, inspectionId, fetchNegotiationDetails]);

  const renderContent = () => {
    if (!details) return null;

    // Stage-based rendering logic according to new specifications
    switch (stage) {
      case "cancelled":
        return <EnhancedNegotiationCancelledSummary userType="buyer" />;

      case "completed":
        return <EnhancedNegotiationSummary userType="buyer" />;

      case "negotiation":
      case "inspection":
        // Check if it's user's turn to respond
        if (!isUserTurn("buyer")) {
          const timeRemaining = details?.updatedAt
            ? (() => {
                const updateTime = new Date(details.updatedAt).getTime();
                const now = new Date().getTime();
                const elapsed = now - updateTime;
                const fortyEightHours = 48 * 60 * 60 * 1000;
                const remaining = fortyEightHours - elapsed;

                if (remaining > 0) {
                  const hours = Math.floor(remaining / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (remaining % (1000 * 60 * 60)) / (1000 * 60),
                  );
                  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                  return `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                } else {
                  return "00:00:00";
                }
              })()
            : "Loading...";

          return (
            <AwaitingResponseDisplay
              userType="buyer"
              pendingResponseFrom={pendingResponseFrom!}
              timeRemaining={timeRemaining}
            />
          );
        }

        // User's turn - show appropriate negotiation flow
        return <TwoStepNegotiationFlow userType="buyer" />;

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading negotiation details...</p>
          </div>
        );
    }
  };

  if (formStatus === "pending") {
    return <Loading />;
  }

  if (formStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Failed to Load
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load negotiation details. Please check your connection and
            try again.
          </p>
          <button
            onClick={() =>
              fetchNegotiationDetails(userId, inspectionId, "buyer")
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SecureNegotiationLayout userType="buyer">
      <div className="space-y-8">
        {/* Property Details */}
        {details && <PropertyDetails propertyData={details} />}

        {/* Negotiation Content */}
        {renderContent()}
      </div>
    </SecureNegotiationLayout>
  );
};

export default SecureBuyerResponseIndex;
