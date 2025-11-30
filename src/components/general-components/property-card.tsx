/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Calendar,
  Eye,
  MoreVertical,
  Edit,
  Trash,
  Share,
} from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    _id: string;
    propertyType: string;
    price: number;
    location: {
      state: string;
      localGovernment: string;
      area: string;
    };
    pictures?: string[];
    additionalFeatures?: {
      noOfBedroom?: string;
      noOfBathroom?: string;
      noOfCarPark?: string;
    };
    createdAt: string;
    views?: number;
    status?: "active" | "pending" | "sold" | "rented";
    statusLabel?: string;
    briefType?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  onEdit,
  onDelete,
  onShare,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "rented":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {property.pictures && property.pictures.length > 0 ? (
          <img
            src={property.pictures[0]}
            alt={property.propertyType}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8DDB90] to-[#09391C]">
            <span className="text-white text-lg font-semibold">
              {property.propertyType.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Status Badge */}
        {(property.statusLabel || property.status) && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.statusLabel
                  ? property.statusLabel === "Approved"
                    ? "bg-green-100 text-green-800"
                    : property.statusLabel === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  : getStatusColor(property.status)
              }`}
            >
              {property.statusLabel ||
                (property.status?.charAt(0).toUpperCase() ?? "") +
                  (property.status?.slice(1) ?? "")}
            </span>
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <MoreVertical size={16} className="text-gray-600" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px] z-10"
              >
                {onView && (
                  <button
                    onClick={() => {
                      onView();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => {
                      onShare();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Share size={14} />
                    Share
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type and Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-[#09391C] text-lg capitalize mb-1">
            {property.propertyType}
          </h3>
          <p className="text-[#8DDB90] font-bold text-xl">
            ₦{property.price.toLocaleString()}
          </p>
          {property.briefType && (
            <span className="text-xs text-[#5A5D63] bg-gray-100 px-2 py-1 rounded-full">
              {property.briefType}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#5A5D63] text-sm mb-3">
          <MapPin size={14} />
          <span>
            {property.location.area}, {property.location.localGovernment},{" "}
            {property.location.state}
          </span>
        </div>

        {/* Features */}
        {property.additionalFeatures && (
          <div className="flex items-center gap-4 text-[#5A5D63] text-sm mb-3">
            {property.additionalFeatures.noOfBedroom && (
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.additionalFeatures.noOfBedroom} bed</span>
              </div>
            )}
            {property.additionalFeatures.noOfBathroom && (
              <div className="flex items-center gap-1">
                <Bath size={14} />
                <span>{property.additionalFeatures.noOfBathroom} bath</span>
              </div>
            )}
            {property.additionalFeatures.noOfCarPark && (
              <div className="flex items-center gap-1">
                <Car size={14} />
                <span>{property.additionalFeatures.noOfCarPark} parking</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-[#5A5D63]">
            <Calendar size={12} />
            <span>{formatDate(property.createdAt)}</span>
          </div>

          {property.views !== undefined && (
            <div className="flex items-center gap-1 text-xs text-[#5A5D63]">
              <Eye size={12} />
              <span>{property.views} views</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
