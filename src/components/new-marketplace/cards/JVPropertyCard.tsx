/** @format */

"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { X } from "lucide-react";
import markerSVG from "@/svgs/marker.svg";
import randomImage from "@/assets/noImageAvailable.png";
import ImageSwiper from "../ImageSwiper";
import Button from "@/components/general-components/button";

interface JVPropertyCardProps {
  property: any;
  cardData: { header: string; value: string }[];
  images: any[];
  isPremium: boolean;
  onPropertyClick: () => void;
  onInspectionToggle: () => void;
  onLOIUpload: () => void;
  onRemoveLOI: (propertyId: string) => void;
  isSelected: boolean;
  loiDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
}

const JVPropertyCard: React.FC<JVPropertyCardProps> = ({
  property,
  cardData,
  images,
  isPremium,
  onPropertyClick,
  onInspectionToggle,
  onLOIUpload,
  onRemoveLOI,
  isSelected,
  loiDocument,
}) => {
  const hasLOIDocument = loiDocument != null && loiDocument !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      exit={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      className="w-full max-w-[320px] md:w-[280px] lg:w-[285px] xl:w-[280px] h-auto min-h-[400px] rounded-md shrink-0 bg-white border-[1px] p-3 gap-[10px] transition-all duration-500 hover:shadow-lg flex flex-col"
    >
      <div className="flex flex-col gap-[8px] w-full flex-grow">
        {/* Image Section */}
        <div className="w-full h-[148px] bg-gray-200 relative">
          {/* Premium Badge */}
          {isPremium && (
            <div className="w-[88px] z-10 h-[28px] py-[8px] px-[6px] text-white flex gap-x-1 items-center bg-[#FF3D00] absolute rounded-br-md">
              <span className="text-sm">Premium</span>
              <FontAwesomeIcon icon={faStar} size="xs" />
            </div>
          )}
          <ImageSwiper
            images={Array.isArray(images) ? images : [randomImage]}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-[6px] flex-grow">
          {/* Property Type */}
          <div className="flex gap-[7px]">
            {cardData.map((item, idx) => {
              if (item.header === "Property Type") {
                return (
                  <div
                    key={idx}
                    className="min-w-fit h-[26px] px-[6px] flex items-center rounded-[3px] bg-[#E4EFE7] text-xs text-[#000000]"
                  >
                    {item.value}
                  </div>
                );
              }
            })}
          </div>

          {/* Investment Amount */}
          <div className="flex items-center gap-2">
            {cardData.map((item, idx) => {
              if (
                item.header === "Investment Amount" ||
                item.header === "Price"
              ) {
                return (
                  <h2
                    key={idx}
                    className="text-lg font-semibold text-[#000000]"
                  >
                    {item.value}
                  </h2>
                );
              }
            })}
          </div>

          {/* Property Details */}
          <div className="flex gap-[9px]">
            {cardData.map((item, idx) => {
              if (item.header === "Bedrooms") {
                return (
                  <h2 key={idx} className="text-xs font-normal text-[#000000]">
                    {item.value} Bedrooms
                  </h2>
                );
              }
            })}
          </div>

          {/* Investment Type */}
          <div className="flex gap-[9px]">
            {cardData.map((item, idx) => {
              if (item.header === "Investment Type") {
                return (
                  <div
                    key={idx}
                    className="min-w-fit h-[22px] px-[4px] flex items-center rounded-[2px] bg-[#FFF3E0] text-xs text-[#E65100]"
                  >
                    {item.value}
                  </div>
                );
              }
            })}
          </div>

          {/* Expected ROI */}
          <div className="flex gap-[9px]">
            {cardData.map((item, idx) => {
              if (item.header === "Expected ROI") {
                return (
                  <h2
                    key={idx}
                    className="text-xs font-semibold text-[#8DDB90]"
                  >
                    Expected ROI: {item.value}
                  </h2>
                );
              }
            })}
          </div>

          {/* Location and View Details */}
          <div className="flex justify-between items-center">
            <div className="flex gap-[5px] flex-1 min-w-0">
              <Image
                src={markerSVG}
                width={16}
                height={16}
                alt="marker"
                className="w-[16px] h-[16px] flex-shrink-0"
              />
              {cardData.map((item, idx) => {
                if (item.header === "Location") {
                  return (
                    <h2
                      key={idx}
                      className="text-xs font-normal text-[#000000] truncate"
                    >
                      {item.value}
                    </h2>
                  );
                }
              })}
            </div>

            <button
              type="button"
              onClick={onPropertyClick}
              className="text-xs font-semibold text-[#0B423D] underline flex-shrink-0 ml-2"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-4">
          {/* Submit LOI Button */}
          {hasLOIDocument ? (
            <div className="min-h-[50px] py-[12px] px-[24px] bg-[#FF9800] text-[#FFFFFF] text-base leading-[25.6px] font-bold flex items-center justify-between rounded">
              <span className="text-xs">LOI Document Uploaded</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLOI(property._id);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors ml-2"
                title="Clear LOI document"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <Button
              value="Submit LOI"
              type="button"
              onClick={onLOIUpload}
              className="min-h-[50px] py-[12px] px-[24px] bg-[#FF9800] text-[#FFFFFF] text-base leading-[25.6px] font-bold hover:bg-[#F57C00] transition-colors"
            />
          )}

          {/* Select for Inspection Button */}
          <button
            onClick={onInspectionToggle}
            disabled={false}
            className={`min-h-[50px] py-[12px] px-[24px] ${
              isSelected
                ? "bg-[#09391C] hover:bg-[#0B423D] cursor-pointer"
                : "bg-[#8DDB90] hover:bg-[#76c77a]"
            } text-[#FFFFFF] text-base leading-[25.6px] font-bold flex items-center justify-center gap-2 transition-colors rounded`}
            type="button"
          >
            {isSelected ? (
              <>
                <span>Selected</span>
                <X size={16} className="text-white" />
              </>
            ) : (
              "Select for Inspection"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default JVPropertyCard;
