"use client";

import React, { useState } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
} from "react-icons/fi";

interface EnhancedInspectionDateConfirmationProps {
  userType: "seller" | "buyer";
}

const EnhancedInspectionDateConfirmation: React.FC<
  EnhancedInspectionDateConfirmationProps
> = ({ userType }) => {
  const { state } = useSecureNegotiation();

  const { details, loadingStates, currentUserId, inspectionStatus } = state;
  const [alternativeDate, setAlternativeDate] = useState("");
  const [alternativeTime, setAlternativeTime] = useState("");
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);

  const proposedDate = details?.inspectionDate || "";
  const proposedTime = details?.inspectionTime || "";
  const propertyAddress = details?.propertyId?.location
    ? `${details.propertyId.location.area}, ${details.propertyId.location.localGovernment}, ${details.propertyId.location.state}`
    : "Property address not specified";

  const handleConfirmInspection = async () => {
    try {
      console.log("Inspection confirmed for:", {
        date: proposedDate,
        time: proposedTime,
      });
    } catch (error) {
      console.error("Failed to confirm inspection:", error);
    }
  };

  const handleRejectInspection = async () => {
    try {
      console.log("Inspection rejected");
    } catch (error) {
      console.error("Failed to reject inspection:", error);
    }
  };

  const handleProposeAlternative = async () => {
    if (!alternativeDate || !alternativeTime) {
      alert("Please select both date and time for the alternative");
      return;
    }

    try {
      setShowAlternativeForm(false);
      setAlternativeDate("");
      setAlternativeTime("");

      console.log("Alternative time proposed:", {
        date: alternativeDate,
        time: alternativeTime,
      });
    } catch (error) {
      console.error("Failed to propose alternative:", error);
    }
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

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not specified";
    return timeString;
  };

  const getStatusInfo = () => {
    switch (inspectionStatus) {
      case "accept":
        return {
          title: "Inspection Confirmed",
          subtitle: "Both parties have agreed to the inspection schedule",
          color: "green",
        };
      case "reject":
        return {
          title: "Inspection Declined",
          subtitle: "The proposed inspection time was not accepted",
          color: "red",
        };
      case "countered":
        return {
          title: "Alternative Time Proposed",
          subtitle: "A new inspection time has been suggested",
          color: "yellow",
        };
      default:
        return {
          title: "Inspection Scheduling",
          subtitle: "Please review and respond to the proposed inspection time",
          color: "blue",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {statusInfo.title}
        </h1>
        <p className="text-gray-600">{statusInfo.subtitle}</p>
      </div>

      {/* Inspection Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FiCalendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Proposed Inspection Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Date</span>
                </div>
                <p className="text-blue-700 text-lg">
                  {formatDate(proposedDate)}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FiClock className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Time</span>
                </div>
                <p className="text-green-700 text-lg">
                  {formatTime(proposedTime)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FiMapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">
                  Property Location
                </span>
              </div>
              <p className="text-purple-700">{propertyAddress}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      {inspectionStatus !== "accept" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Respond to Inspection Request
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Confirm Button */}
              <button
                onClick={handleConfirmInspection}
                disabled={loadingStates.accepting}
                className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
              >
                <FiCheckCircle className="w-5 h-5" />
                <span>Confirm Time</span>
              </button>

              {/* Suggest Alternative Button */}
              <button
                onClick={() => setShowAlternativeForm(true)}
                disabled={loadingStates.countering}
                className="flex items-center justify-center space-x-2 p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors duration-200"
              >
                <FiEdit3 className="w-5 h-5" />
                <span>Suggest Alternative</span>
              </button>

              {/* Decline Button */}
              <button
                onClick={handleRejectInspection}
                disabled={loadingStates.rejecting}
                className="flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
              >
                <FiXCircle className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alternative Time Form */}
      {showAlternativeForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Propose Alternative Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Date
                </label>
                <input
                  type="date"
                  value={alternativeDate}
                  onChange={(e) => setAlternativeDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Time
                </label>
                <input
                  type="time"
                  value={alternativeTime}
                  onChange={(e) => setAlternativeTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleProposeAlternative}
                disabled={
                  !alternativeDate ||
                  !alternativeTime ||
                  loadingStates.countering
                }
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
              >
                Propose Alternative
              </button>
              <button
                onClick={() => {
                  setShowAlternativeForm(false);
                  setAlternativeDate("");
                  setAlternativeTime("");
                }}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedInspectionDateConfirmation;
