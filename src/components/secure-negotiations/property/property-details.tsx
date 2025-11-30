"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import type { InspectionDetails } from "@/types/secure-negotiation";

interface PropertyDetailsProps {
  propertyData: InspectionDetails;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ propertyData }) => {
  const { propertyId, inspectionDate, inspectionTime, inspectionMode, createdAt } =
    propertyData;
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInspectionModeDisplay = (mode?: string) => {
    switch (mode) {
      case "in_person":
        return { label: "In Person", icon: "🏠", description: "Physical inspection at property" };
      case "virtual":
        return { label: "Virtual", icon: "💻", description: "Online video inspection" };
      case "developer_visit":
        return { label: "Developer Visit", icon: "🏗️", description: "Visit developer's office" };
      default:
        return { label: "In Person", icon: "🏠", description: "Physical inspection at property" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#C7CAD0] overflow-hidden"
    >
      {/* Compact Header with Key Info */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#EEF1F1] to-[#F8F9FA] border-b border-[#C7CAD0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white rounded-lg border border-[#C7CAD0]">
              <FiHome className="w-4 h-4 text-[#09391C]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#09391C]">
                {propertyId.propertyType} • {propertyId.briefType}
              </h3>
              <p className="text-xs text-gray-600">
                {propertyId.location.area}, {propertyId.location.state}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-bold text-[#09391C]">
                {formatCurrency(propertyId.price)}
              </div>
              <div className="text-xs text-gray-600">Property Price</div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white hover:border-[#09391C] rounded-lg border border-transparent transition-all duration-200"
            >
              {isExpanded ? (
                <FiChevronUp className="w-4 h-4 text-[#09391C]" />
              ) : (
                <FiChevronDown className="w-4 h-4 text-[#09391C]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4">
          {/* Property Image */}
          {propertyId.thumbnail && (
            <div className="h-24 sm:h-32 bg-gray-200 overflow-hidden rounded-lg mb-4">
              <img
                src={propertyId.thumbnail}
                alt="Property"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/assets/noImageAvailable.png";
                }}
              />
            </div>
          )}

          {/* Full Location */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiMapPin className="w-4 h-4 text-[#09391C]" />
              <h4 className="font-medium text-gray-800 text-sm">
                Full Address
              </h4>
            </div>
            <div className="bg-[#EEF1F1] p-3 rounded-lg border border-[#C7CAD0]">
              <div className="text-gray-700 text-sm">
                {propertyId.location.area},{" "}
                {propertyId.location.localGovernment},{" "}
                {propertyId.location.state}
              </div>
            </div>
          </div>

          {/* Inspection Details */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiCalendar className="w-4 h-4 text-[#09391C]" />
              <h4 className="font-medium text-gray-800 text-sm">
                Current Inspection Schedule
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#EEF1F1] p-3 rounded-lg border border-[#C7CAD0]">
                <div className="text-xs text-gray-600 mb-1">Date</div>
                <div className="font-medium text-gray-800 text-sm">
                  {formatDate(inspectionDate)}
                </div>
              </div>

              <div className="bg-[#EEF1F1] p-3 rounded-lg border border-[#C7CAD0]">
                <div className="text-xs text-gray-600 mb-1">Time</div>
                <div className="font-medium text-gray-800 text-sm">
                  {inspectionTime}
                </div>
              </div>

              <div className="bg-[#EEF1F1] p-3 rounded-lg border border-[#C7CAD0]">
                <div className="text-xs text-gray-600 mb-1">Mode</div>
                <div className="font-medium text-gray-800 text-sm flex items-center space-x-2">
                  <span>{getInspectionModeDisplay(inspectionMode).icon}</span>
                  <span>{getInspectionModeDisplay(inspectionMode).label}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getInspectionModeDisplay(inspectionMode).description}
                </div>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <FiFileText className="w-4 h-4 text-[#09391C]" />
              <h4 className="font-medium text-gray-800 text-sm">
                Request Created
              </h4>
            </div>
            <div className="bg-[#EEF1F1] p-3 rounded-lg border border-[#C7CAD0]">
              <div className="text-gray-700 text-sm">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PropertyDetails;
