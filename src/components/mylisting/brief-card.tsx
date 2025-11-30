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
  CheckCircle,
  XCircle,
  Clock,
  Star,
  FileText,
  TrendingUp,
  Building,
  Maximize,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ImageSlider from "./ImageSlider";
import ActionDropdown from "./ActionDropdown";

interface Brief {
  _id: string;
  propertyType: string;
  propertyCondition: string;
  briefType: string;
  price: number;
  features: string[];
  tenantCriteria: string[];
  owner: string;
  areYouTheOwner: boolean;
  isAvailable: string;
  pictures: string[];
  isApproved: boolean;
  isRejected: boolean;
  docOnProperty: Array<{
    docName: string;
    isProvided: boolean;
    _id: string;
  }>;
  isPreference: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  landSize: {
    measurementType: string;
    size: number;
  };
  additionalFeatures: {
    additionalFeatures: string[];
    noOfBedroom?: string;
    noOfBathroom?: string;
    noOfToilet?: string;
    noOfCarPark?: string;
  };
}

interface BriefCardProps {
  brief: Brief;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

const BriefCard: React.FC<BriefCardProps> = ({
  brief,
  onView,
  onEdit,
  onDelete,
  onShare,
  className = "",
}) => {
  const router = useRouter();

  const getApprovalStatus = () => {
    if (brief.isApproved && !brief.isRejected) {
      return {
        status: "approved",
        label: "Approved",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
        icon: CheckCircle,
      };
    } else if (brief.isRejected) {
      return {
        status: "rejected",
        label: "Rejected",
        color: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
        icon: XCircle,
      };
    } else {
      return {
        status: "pending",
        label: "Under Review",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
        icon: Clock,
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `₦${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleEditClick = () => {
    router.push(`/my-listings/edit/${brief._id}`);
  };

  const approval = getApprovalStatus();
  const StatusIcon = approval.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#8DDB90]/20 transition-all duration-300 ${className}`}
    >
      {/* Image Container with Slider */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <ImageSlider
          images={brief.pictures || []}
          propertyType={brief.propertyType}
          className="h-full"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-start justify-between z-20">
          <div className="flex flex-col gap-1.5">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${approval.color}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${approval.dotColor}`}
              />
              <span className="hidden sm:inline">{approval.label}</span>
              <span className="sm:hidden">{approval.label.split(" ")[0]}</span>
            </div>

            {/* Premium Badge */}
            {brief.isPremium && (
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                <Star size={10} className="fill-current" />
                <span className="hidden sm:inline">Premium</span>
              </div>
            )}

            {/* Preference Badge */}
            {brief.isPreference && (
              <div className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                <TrendingUp size={10} />
                <span className="ml-1 hidden sm:inline">Preference</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-20">
          <div
            className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
              brief.isAvailable === "yes"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            <span className="hidden sm:inline">
              {brief.isAvailable === "yes" ? "Available" : "Not Available"}
            </span>
            <span className="sm:hidden">
              {brief.isAvailable === "yes" ? "Avail." : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-[#09391C] text-base sm:text-lg capitalize truncate">
                {brief.propertyType}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-[#5A5D63] bg-gray-100 px-2 py-1 rounded-md font-medium">
                  {brief.briefType}
                </span>
                {brief.propertyCondition && (
                  <span className="text-xs text-[#5A5D63] bg-gray-50 px-2 py-1 rounded-md">
                    {brief.propertyCondition}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[#8DDB90] font-bold text-lg sm:text-xl">
                {formatPrice(brief.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-[#5A5D63] text-sm mb-3 sm:mb-4">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DDB90] flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">
            {brief.location.area}, {brief.location.localGovernment}
          </span>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {brief.additionalFeatures?.noOfBedroom && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#5A5D63]">
              <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DDB90] flex-shrink-0" />
              <span>{brief.additionalFeatures.noOfBedroom}</span>
            </div>
          )}
          {brief.additionalFeatures?.noOfBathroom && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#5A5D63]">
              <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DDB90] flex-shrink-0" />
              <span>{brief.additionalFeatures.noOfBathroom}</span>
            </div>
          )}
          {brief.additionalFeatures?.noOfCarPark && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#5A5D63]">
              <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DDB90] flex-shrink-0" />  
              <span>{brief.additionalFeatures.noOfCarPark}</span>
            </div>
          )}
        </div>

        {/* Land Size & Documents */}
        <div className="space-y-2 mb-3 sm:mb-4">
          {brief.landSize && brief.landSize.size && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#5A5D63]">
              <Maximize
                size={12}
                className="text-[#8DDB90] flex-shrink-0 sm:w-[14px] sm:h-[14px]"
              />
              <span>
                {brief.landSize.size.toLocaleString()}{" "}
                {brief.landSize.measurementType}
              </span>
            </div>
          )}

          {brief.docOnProperty && brief.docOnProperty.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#5A5D63]">
              <FileText
                size={12}
                className="text-[#8DDB90] flex-shrink-0 sm:w-[14px] sm:h-[14px]"
              />
              <span className="hidden sm:inline">
                {brief.docOnProperty.length} documents available
              </span>
              <span className="sm:hidden">
                {brief.docOnProperty.length} docs
              </span>
            </div>
          )}
        </div>

        {/* Features Tags */}
        {brief.features && brief.features.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {brief.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="bg-[#8DDB90]/10 text-[#09391C] px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium truncate max-w-[80px] sm:max-w-none"
                title={feature}
              >
                {feature}
              </span>
            ))}
            {brief.features.length > 2 && (
              <span className="text-[#5A5D63] text-xs px-1.5 sm:px-2 py-1 bg-gray-50 rounded-md font-medium">
                +{brief.features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-[#5A5D63]">
            <Calendar size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">
              {formatDate(brief.createdAt)}
            </span>
            <span className="sm:hidden">
              {formatDate(brief.createdAt).split(",")[0]}
            </span>
          </div>

          {/* Action Dropdown */}
          <ActionDropdown
            briefId={brief._id}
            onView={onView}
            onEdit={handleEditClick}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BriefCard;
