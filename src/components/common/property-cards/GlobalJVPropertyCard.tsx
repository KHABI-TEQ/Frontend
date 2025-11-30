/** @format */

"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import markerSVG from "@/svgs/marker.svg";
import randomImage from "@/assets/noImageAvailable.png";
import ImageSwiper from "@/components/new-marketplace/ImageSwiper";
import Button from "@/components/general-components/button";
import { X } from "lucide-react";
import { PropertyImage } from "@/types";

interface GlobalJVPropertyCardProps {
  property: any;
  cardData: { header: string; value: string }[];
  images: PropertyImage[];
  isPremium: boolean;
  onPropertyClick?: () => void;
  onInspectionToggle?: () => void;
  isSelected?: boolean;
  className?: string;
  // LOI-specific props
  onLOIUpload?: () => void;
  onRemoveLOI?: (propertyId: string) => void;
  loiDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
} 

const GlobalJVPropertyCard: React.FC<GlobalJVPropertyCardProps> = ({
  property,
  cardData,
  images,
  isPremium,
  onPropertyClick,
  onInspectionToggle,
  isSelected = false,
  className = "",
  onLOIUpload,
  onRemoveLOI,
  loiDocument,
}) => {
  const hasLOI = !!loiDocument;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      exit={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      className={`w-full max-w-[320px] sm:max-w-[280px] md:w-[280px] lg:w-[285px] xl:w-[280px] h-auto min-h-[420px] sm:min-h-[400px] rounded-md shrink-0 bg-white border-[1px] p-3 gap-[10px] transition-all duration-500 hover:shadow-lg flex flex-col mx-auto ${className}`}
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
          {/* Property Type (hide generic JV label) */}
          <div className="flex gap-[7px]">
            {cardData.map((item, idx) => {
              if (item.header === "Property Type") {
                const val = String(item.value || "").trim();
                if (val.toLowerCase() === "joint venture") return null;
                return (
                  <div
                    key={idx}
                    className="min-w-fit h-[26px] px-[6px] flex items-center rounded-[3px] bg-[#E4EFE7] text-xs text-[#000000]"
                  >
                    {val}
                  </div>
                );
              }
              return null;
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

          {/* Quick stats with icons */}
          <div className="flex items-center gap-4 text-[#000000]">
            {(() => {
              const get = (h: string) => cardData.find((i) => i.header === h)?.value as any;
              const bedrooms = get("Bedrooms") || (property as any)?.additionalFeatures?.noOfBedroom || (property as any)?.noOfBedroom || 0;
              const bathrooms = get("Bathrooms") || (property as any)?.additionalFeatures?.noOfBathroom || (property as any)?.noOfBathroom || 0;
              const carParks = cardData.find((i) => i.header === "CarParks" || i.header === "Car Parks")?.value as any || (property as any)?.additionalFeatures?.noOfCarPark || (property as any)?.noOfCarPark || 0;
              const landSize = (property as any)?.landSize?.size || (property as any)?.landSize || (property as any)?.additionalFeatures?.landSize;
              const landUnit = (property as any)?.landSize?.measurementType || (property as any)?.landSizeType || "sqm";
              return (
                <>
                  <div className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18"/><path d="M6 7v10"/><path d="M18 7v10"/><path d="M6 17h12"/></svg><span>{bedrooms}</span></div>
                  <div className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18"/><path d="M7 10v-2a5 5 0 0 1 10 0v2"/><path d="M5 16h14"/></svg><span>{bathrooms}</span></div>
                  <div className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg><span>{landSize ? `${landSize} ${landUnit}` : 'N/A'}</span></div>
                  <div className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><circle cx="7.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg><span>{carParks}</span></div>
                </>
              );
            })()}
          </div>

          {/* Location and View Details - Moved above buttons */}
          <div className="flex justify-between items-center pt-2">
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
              onClick={onPropertyClick || (() => {})}
              className="text-xs font-semibold text-[#0B423D] underline flex-shrink-0 ml-2"
            >
              View Details
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 mt-auto">
            {/* Submit LOI Button */}
            {hasLOI ? (
              <div className="flex gap-2">
                <Button
                  value="Edit LOI"
                  type="button"
                  onClick={onLOIUpload || (() => {})}
                  className="flex-1 min-h-[40px] py-[8px] px-[16px] bg-[#FF9800] text-[#FFFFFF] text-sm leading-[20px] font-bold hover:bg-[#F57C00] transition-colors rounded"
                />
                {loiDocument?.documentUrl && (
                  <a
                    href={loiDocument.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[40px] py-[8px] px-[16px] bg-[#0B423D] text-[#FFFFFF] text-sm leading-[20px] font-bold hover:bg-[#09391C] transition-colors rounded text-center flex items-center justify-center"
                  >
                    View LOI
                  </a>
                )}
                {onRemoveLOI && (
                  <Button
                    value="Clear"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (property._id) onRemoveLOI(property._id);
                    }}
                    className="flex-1 min-h-[40px] py-[8px] px-[16px] bg-[#F44336] text-[#FFFFFF] text-sm leading-[20px] font-bold hover:bg-[#D32F2F] transition-colors rounded"
                  />
                )}
              </div>
            ) : (
              <Button
                value="Submit LOI"
                type="button"
                onClick={onLOIUpload || (() => {})}
                className="min-h-[40px] py-[8px] px-[16px] bg-[#FF9800] text-[#FFFFFF] text-sm leading-[20px] font-bold hover:bg-[#F57C00] transition-colors rounded"
              />
            )}

            {/* Select for Inspection Button */}
            <button
              onClick={onInspectionToggle || (() => {})}
              disabled={false}
              className={`min-h-[40px] py-[8px] px-[16px] ${
                isSelected
                  ? "bg-[#09391C] hover:bg-[#0B423D] cursor-pointer"
                  : "bg-[#8DDB90] hover:bg-[#76c77a]"
              } text-[#FFFFFF] text-sm leading-[20px] font-bold flex items-center justify-center gap-2 transition-colors rounded`}
              type="button"
            >
              {isSelected ? (
                <>
                  <span>Selected</span>
                  <X size={14} className="text-white" />
                </>
              ) : (
                "Select for Inspection"
              )}
            </button>
          </div>
        </div>


      </div>
    </motion.div>
  );
};

export default GlobalJVPropertyCard;
