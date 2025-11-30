/** @format */

"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { X, FileText } from "lucide-react";
import markerSVG from "@/svgs/marker.svg";
import randomImage from "@/assets/noImageAvailable.png";
import ImageSwiper from "./ImageSwiper";
import Button from "@/components/general-components/button";

interface InspectionPropertyCardProps {
  property: any;
  tab: "buy" | "jv" | "rent";
  onRemove: () => void;
  onClearNegotiatedPrice?: () => void;
  onClearLOIDocument?: () => void;
  negotiatedPrice?: {
    propertyId: string;
    originalPrice: number;
    negotiatedPrice: number;
  } | null;
  loiDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
}

const InspectionPropertyCard: React.FC<InspectionPropertyCardProps> = ({
  property,
  tab,
  onRemove,
  onClearNegotiatedPrice,
  onClearLOIDocument,
  negotiatedPrice,
  loiDocument,
}) => {
  const hasNegotiatedPrice =
    negotiatedPrice != null && negotiatedPrice !== undefined;
  const hasLOIDocument = loiDocument != null && loiDocument !== undefined;

  const getPropertyPrice = () => {
    if (hasNegotiatedPrice && negotiatedPrice) {
      return `₦${Number(negotiatedPrice.negotiatedPrice).toLocaleString()}`;
    }

    const price =
      property?.price ||
      property?.rentalPrice ||
      property?.investmentAmount ||
      0;
    return `₦${Number(price).toLocaleString()}`;
  };

  const getOriginalPrice = () => {
    if (hasNegotiatedPrice && negotiatedPrice) {
      return `₦${Number(negotiatedPrice.originalPrice).toLocaleString()}`;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Image Section */}
      <div className="relative h-40">
        {property?.isPremium && (
          <div className="absolute top-2 left-2 z-10 bg-[#FF3D00] text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <span>Premium</span>
            <FontAwesomeIcon icon={faStar} size="xs" />
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          title="Remove from inspection"
        >
          <X size={16} />
        </button>

        <ImageSwiper images={property?.images || [randomImage]} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Property Type */}
        <div className="flex items-center gap-2">
          <span className="bg-[#E4EFE7] text-[#09391C] px-2 py-1 rounded text-xs font-medium">
            {property?.propertyType || "Property"}
          </span>
          {tab === "jv" && (
            <span className="bg-[#FFF3E0] text-[#E65100] px-2 py-1 rounded text-xs font-medium">
              Joint Venture
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-semibold ${hasNegotiatedPrice ? "text-[#8DDB90]" : "text-[#24272C]"}`}
            >
              {getPropertyPrice()}
            </span>
            {hasNegotiatedPrice && onClearNegotiatedPrice && (
              <button
                onClick={onClearNegotiatedPrice}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear negotiated price"
              >
                <X size={14} className="text-[#5A5D63]" />
              </button>
            )}
          </div>

          {hasNegotiatedPrice && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#5A5D63] line-through">
                {getOriginalPrice()}
              </span>
              <span className="text-[#8DDB90] font-medium">
                (Negotiated price)
              </span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="space-y-1 text-sm text-[#5A5D63]">
          <div>{property?.noOfBedrooms || "0"} Bedrooms</div>

          <div className="flex items-center gap-1">
            <Image src={markerSVG} width={12} height={12} alt="location" />
            <span>
              {property?.location?.area && `${property.location.area}, `}
              {property?.location?.localGovernment &&
                `${property.location.localGovernment}, `}
              {property?.location?.state || "Location not specified"}
            </span>
          </div>

          {tab === "jv" && property?.expectedROI && (
            <div className="text-[#8DDB90] font-medium">
              Expected ROI: {property.expectedROI}
            </div>
          )}
        </div>

        {/* Special Indicators */}
        {tab === "jv" && hasLOIDocument && (
          <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#E65100]" />
                <span className="text-xs text-[#E65100] font-medium">
                  LOI Document Uploaded
                </span>
              </div>
              {onClearLOIDocument && (
                <button
                  onClick={onClearLOIDocument}
                  className="p-1 hover:bg-[#E65100] hover:bg-opacity-10 rounded-full transition-colors"
                  title="Clear LOI document"
                >
                  <X size={14} className="text-[#E65100]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Documents List (if available) */}
        {property?.docOnProperty && property.docOnProperty.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-[#5A5D63] mb-1">
              Available Documents:
            </div>
            <div className="space-y-1">
              {property.docOnProperty
                .slice(0, 3)
                .map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="text-xs text-[#24272C] bg-gray-50 px-2 py-1 rounded"
                  >
                    {typeof doc === "string" ? doc : doc?.docName || "Document"}
                  </div>
                ))}
              {property.docOnProperty.length > 3 && (
                <div className="text-xs text-[#8DDB90]">
                  +{property.docOnProperty.length - 3} more documents
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionPropertyCard;
