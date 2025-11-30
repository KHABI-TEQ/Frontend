"use client";

import React, { useState } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import { FiShield, FiRefreshCw } from "react-icons/fi";
import ExpiryModal from "../modals/expiry-modal";

interface SecureNegotiationLayoutProps {
  children: React.ReactNode;
  userType: "seller" | "buyer";
}

const SecureNegotiationLayout: React.FC<SecureNegotiationLayoutProps> = ({
  children,
  userType,
}) => {
  const { state, refreshData, reopenInspection } = useSecureNegotiation();
  const { details, loadingStates, isExpired, stage, pendingResponseFrom } =
    state;
  const [isReopening, setIsReopening] = useState(false);

  const getStatusMessage = () => {
    if (!details) return "";

    if (pendingResponseFrom !== userType) {
      return `Awaiting response from ${pendingResponseFrom}...`;
    }

    switch (stage) {
      case "negotiation":
        if (details.inspectionType === "LOI") {
          return "Please review and respond to the Letter of Intention";
        } else if (details.inspectionType === "price") {
          return "Please review and respond to the price negotiation";
        }
        return "Please review and respond to the negotiation";
      case "inspection":
        return "Please confirm the inspection schedule";
      case "completed":
        return "Negotiation completed successfully";
      case "cancelled":
        return "Negotiation has been cancelled";
      default:
        return "Please review and respond";
    }
  };

  const getFullName = () => {
    if (userType === "seller") {
      return `${details?.owner?.firstName || ""} ${details?.owner?.lastName || ""}`.trim();
    } else {
      return details?.requestedBy?.fullName || "";
    }
  };

  const handleReopenInspection = async () => {
    setIsReopening(true);
    try {
      await reopenInspection();
    } catch (error) {
      console.error("Failed to reopen inspection:", error);
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <>
      {/* Expiry Modal */}
      {isExpired && (
        <ExpiryModal
          onReopen={handleReopenInspection}
          isReopening={isReopening}
        />
      )}

      <div className="w-full min-h-screen flex items-start justify-center flex-col gap-6 sm:gap-8 md:gap-10 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-[#EEF1F1]">
        {/* Security Banner */}
        <div className="w-full max-w-5xl mx-auto bg-[#09391C] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FiShield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-base sm:text-lg">
                Secure Negotiation Portal
              </span>
            </div>
            <button
              onClick={refreshData}
              disabled={loadingStates.loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loadingStates.loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Header - Matching seller negotiation style */}
        <div className="flex gap-[20px] mx-auto md:gap-[40px] justify-center items-center flex-col">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="font-display text-3xl md:text-4xl text-center font-semibold text-[#09391C]"
          >
            {userType === "seller" ? "Seller Response" : "Buyer Response"}
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-[1px] items-center justify-center"
          >
            <p className="text-center text-base md:text-lg text-black">
              Hi, {getFullName()},
            </p>
            <p className="text-center text-base md:text-lg text-black">
              {getStatusMessage()}
            </p>
            <p className="text-center text-base md:text-lg text-black">
              Please reply within{" "}
              <span className="text-base md:text-lg text-[#FF3D00]">
                48 hours
              </span>{" "}
              — the countdown starts now.
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-5xl flex flex-col gap-6 sm:gap-8 lg:gap-10 bg-[#FFFFFF] py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-10 border border-[#C7CAD0] rounded-2xl mx-auto min-h-[400px]">
          {/* Timer - Matching seller negotiation style */}
          <time
            dateTime=""
            className="font-semibold text-black font-display text-2xl text-center"
          >
            {details?.updatedAt
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
                    const seconds = Math.floor(
                      (remaining % (1000 * 60)) / 1000,
                    );
                    return `${hours.toString().padStart(2, "0")}:${minutes
                      .toString()
                      .padStart(
                        2,
                        "0",
                      )}:${seconds.toString().padStart(2, "0")}`;
                  } else {
                    return "00:00:00";
                  }
                })()
              : "Loading..."}
          </time>

          {/* Content */}
          <div className="negotiation-content">{children}</div>
        </div>
      </div>
    </>
  );
};

export default SecureNegotiationLayout;
