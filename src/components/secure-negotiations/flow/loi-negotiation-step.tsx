"use client";

import React, { useState, useEffect } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";
import StandardPreloader from "@/components/new-marketplace/StandardPreloader";
import toast from "react-hot-toast";

interface LOINegotiationStepProps {
  userType: "seller" | "buyer";
  onActionSelected: (
    action: "accept" | "reject",
    rejectReason?: string,
  ) => void;
}

const LOINegotiationStep: React.FC<LOINegotiationStepProps> = ({
  userType,
  onActionSelected,
}) => {
  const {
    state,
    submitNegotiationAction,
    createAcceptPayload,
    createRejectPayload,
    createCounterPayload,
    uploadFile,
  } = useSecureNegotiation();
  const { details, loadingStates, inspectionId, inspectionType } = state;
  const counterCount = details?.counterCount || 0;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isReuploadMode, setIsReuploadMode] = useState(false);

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (showRejectModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showRejectModal]);

  // Check if changes were requested and user is buyer
  const hasRequestedChanges =
    details?.stage === "negotiation" &&
    details?.pendingResponseFrom === "buyer";
  const isBuyerWithRequestedChanges =
    userType === "buyer" && hasRequestedChanges;

  useEffect(() => {
    setIsReuploadMode(isBuyerWithRequestedChanges);
  }, [isBuyerWithRequestedChanges]);

  const letterOfIntention = details?.letterOfIntention || "";

  const canRequestChanges = () => {
    return counterCount < 3;
  };

  const getRemainingChanges = () => {
    return Math.max(0, 3 - counterCount);
  };

  const handleAccept = async () => {
    if (userType !== "seller") {
      toast.error("Only sellers are allowed to perform this action");
      return;
    }
    onActionSelected("accept");
  };

  const handleReject = async () => {
    if (userType !== "seller") {
      toast.error("Only sellers are allowed to perform this action");
      return;
    }

    setShowRejectModal(false);
    onActionSelected("reject", rejectReason);
    setRejectReason("");
  };

  const downloadLOI = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([letterOfIntention], { type: "application/pdf" });
      element.href = URL.createObjectURL(file);
      element.download = `letter-of-intention-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download document. Please try again.");
    }
  };

  const viewFullLOI = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Letter of Intention</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Letter of Intention</h1>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">${letterOfIntention}</div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Helper function to get appropriate message for buyers
  const getBuyerStatusMessage = () => {
    if (isBuyerWithRequestedChanges) {
      return "Please update your LOI based on the seller's feedback and resubmit.";
    }
    return "Your Letter of Intention has been submitted and is awaiting the seller's review. You will be notified once they make a decision.";
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      <StandardPreloader
        isVisible={
          loadingStates.accepting ||
          loadingStates.rejecting ||
          loadingStates.submitting
        }
        message={
          loadingStates.accepting
            ? "Accepting LOI..."
            : loadingStates.rejecting
              ? "Rejecting LOI..."
              : loadingStates.submitting
                ? "Submitting changes..."
                : "Processing..."
        }
        overlay={true}
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#09391C] mb-2">
          Letter of Intention Review
        </h2>
        <p className="text-gray-600">
          {userType === "seller"
            ? "Review the buyer's Letter of Intention. You can accept or reject this proposal."
            : getBuyerStatusMessage()}
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#EEF1F1] rounded-lg border border-[#C7CAD0]">
            <p className="text-sm font-medium text-[#09391C]">
              Inspection Type: LOI Negotiation
            </p>
          </div>
          {userType === "seller" && (
            <div className="p-3 bg-[#FFF3E0] rounded-lg border border-[#FFB74D]">
              <p className="text-sm font-medium text-[#E65100]">
                Change Requests: {counterCount}/3 used
              </p>
              <p className="text-xs text-[#E65100] mt-1">
                {getRemainingChanges()} requests remaining
              </p>
            </div>
          )}
          {userType === "buyer" && (
            <div className="p-3 bg-[#E3F2FD] rounded-lg border border-[#2196F3]">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-[#1976D2]" />
                <p className="text-sm font-medium text-[#1976D2]">
                  Status: Under Review
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOI Document Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 border border-[#C7CAD0]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Letter of Intention Document
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={viewFullLOI}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              <FiFileText className="w-4 h-4" />
              <span>View Full</span>
            </button>

            <button
              onClick={downloadLOI}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#09391C] text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* LOI Preview */}
        <div className="bg-[#EEF1F1] rounded-lg p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto border border-[#C7CAD0]">
          <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed">
            {letterOfIntention.length > 500
              ? `${letterOfIntention.substring(0, 500)}...`
              : letterOfIntention}
          </div>
          {letterOfIntention.length > 500 && (
            <div className="mt-4 text-center">
              <button
                onClick={viewFullLOI}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Read Full Document →
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Buyer Status Card - Only shown to buyers when not in reupload mode */}
      {userType === "buyer" && !isReuploadMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-lg p-6 border border-blue-200"
        >
          <div className="flex items-center space-x-3 mb-3">
            <FiClock className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">
              Awaiting Seller Response
            </h4>
          </div>
          <p className="text-blue-700 text-sm">
            Your Letter of Intention has been submitted successfully. The seller will review your proposal and respond with either acceptance or rejection. You will receive a notification once they make their decision.
          </p>
        </motion.div>
      )}

      {/* Action Buttons for Seller ONLY */}
      {userType === "seller" && !isReuploadMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 border border-[#C7CAD0]"
        >
          <h4 className="font-medium text-[#09391C] mb-4">
            Choose Your Response
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Accept Button */}
            <button
              onClick={handleAccept}
              disabled={loadingStates.accepting}
              className="flex items-center justify-center space-x-2 p-4 bg-[#09391C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
            >
              <FiCheckCircle className="w-5 h-5" />
              <span>Accept LOI</span>
            </button>

            {/* Reject Button */}
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loadingStates.rejecting}
              className="flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
            >
              <FiXCircle className="w-5 h-5" />
              <span>Reject LOI</span>
            </button>
          </div>

          {/* Counter Limit Notice */}
          {!canRequestChanges() && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiAlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-600">
                  Change request limit reached (3/3)
                </p>
              </div>
              <p className="text-sm text-red-600 mt-1">
                You have used all available LOI change requests. You can accept or reject the current LOI.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reject Confirmation Modal - Only accessible by sellers */}
      {showRejectModal && userType === "seller" && (
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
                  Reject Letter of Intention
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to reject this Letter of Intention?
                You can still continue with the inspection process after rejecting this joint venture negotiation.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback for Rejecting (Optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="State the reason for rejecting LOI..."
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

export default LOINegotiationStep;