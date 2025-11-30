"use client";

import React from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiDownload,
  FiShare2,
  FiMapPin,
  FiClock,
  FiUser,
} from "react-icons/fi";

interface EnhancedNegotiationSummaryProps {
  userType: "seller" | "buyer";
}

const EnhancedNegotiationSummary: React.FC<EnhancedNegotiationSummaryProps> = ({
  userType,
}) => {
  const { state } = useSecureNegotiation();
  const { details, inspectionType, createdAt } = state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateSummaryDocument = () => {
    const summaryData = {
      inspectionType,
      userType,
      finalPrice:
        details?.finalPrice ||
        details?.negotiationPrice ||
        details?.propertyId?.price,
      propertyTitle: details?.propertyId?.propertyType || "Property",
      propertyLocation: details?.propertyId?.location
        ? `${details.propertyId.location.area}, ${details.propertyId.location.localGovernment}, ${details.propertyId.location.state}`
        : "Location not specified",
      inspectionDate: details?.inspectionDate,
      inspectionTime: details?.inspectionTime,
      completedAt: new Date().toISOString(),
      agreementTerms: details?.agreementTerms || [],
    };

    const summaryText = `
NEGOTIATION SUMMARY
==================

Property: ${summaryData.propertyTitle || "Property Details"}
Location: ${summaryData.propertyLocation || "Not specified"}
Inspection Type: ${summaryData.inspectionType} Negotiation

Final Agreement:
${summaryData.inspectionType === "LOI" ? "Joint Venture Partnership" : `Purchase Price: ${formatCurrency(summaryData.finalPrice || 0)}`}

Inspection Details:
Date: ${formatDate(summaryData.inspectionDate || "")}
Time: ${summaryData.inspectionTime || "Not specified"}

Completed: ${new Date(summaryData.completedAt).toLocaleString()}

This summary serves as confirmation of the negotiated terms.
    `;

    return summaryText;
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([generateSummaryDocument()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `negotiation-summary-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareSummary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Negotiation Summary",
          text: "Property negotiation completed successfully",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert("Summary link copied to clipboard");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
        >
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-[#09391C] mb-2">
          Negotiation Complete!
        </h1>
        <p className="text-gray-600">
          Congratulations! Your negotiation has been successfully completed.
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-[#C7CAD0] mb-8"
      >
        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={downloadSummary}
              className="flex items-center space-x-2 px-4 py-2 bg-[#09391C] text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download Summary</span>
            </button>

            <button
              onClick={shareSummary}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiShare2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                Property Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiFileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Property</div>
                    <div className="font-medium text-gray-800">
                      {details?.propertyId?.propertyType || "Property"} -{" "}
                      {details?.propertyId?.briefType || "Sale"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiMapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium text-gray-800">
                      {details?.propertyId?.location
                        ? `${details.propertyId.location.area}, ${details.propertyId.location.localGovernment}, ${details.propertyId.location.state}`
                        : "Location not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                Agreement Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiFileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Inspection Type</div>
                    <div className="font-medium text-gray-800 capitalize">
                      {inspectionType || "Standard"} Negotiation
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {inspectionType === "LOI"
                        ? "Partnership Type"
                        : "Final Price"}
                    </div>
                    <div className="font-medium text-gray-800">
                      {inspectionType === "LOI"
                        ? "Joint Venture"
                        : formatCurrency(
                            details?.finalPrice ||
                              details?.negotiationPrice ||
                              details?.propertyId?.price ||
                              0,
                          )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Your Role</div>
                    <div className="font-medium text-gray-800 capitalize">
                      {userType}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Details */}
          <div className="border-t border-[#C7CAD0] pt-6">
            <h3 className="text-lg font-semibold text-[#09391C] mb-4">
              Inspection Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-[#EEF1F1] rounded-lg border border-[#C7CAD0]">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Inspection Date
                  </span>
                </div>
                <p className="text-blue-700">
                  {formatDate(details?.inspectionDate || "")}
                </p>
              </div>

              <div className="p-4 bg-[#EEF1F1] rounded-lg border border-[#C7CAD0]">
                <div className="flex items-center space-x-2 mb-2">
                  <FiClock className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Inspection Time
                  </span>
                </div>
                <p className="text-green-700">
                  {details?.inspectionTime || "To be confirmed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#EEF1F1] rounded-xl border border-[#C7CAD0] p-6 text-center"
      >
        <h3 className="text-lg font-semibold text-[#09391C] mb-2">
          Need Support?
        </h3>
        <p className="text-gray-600 mb-4">
          If you have any questions about this negotiation or need assistance,
          our team is here to help.
        </p>
        <button className="px-6 py-2 bg-[#09391C] text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
          Contact Support
        </button>
      </motion.div>
    </div>
  );
};

export default EnhancedNegotiationSummary;
