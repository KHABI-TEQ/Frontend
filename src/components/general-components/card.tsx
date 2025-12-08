/** @format */
"use client";
import React, { Fragment, useEffect, useRef, useState, useMemo, Suspense, lazy } from "react";
import Image from "next/image";
import Button from "./button";
import { usePageContext } from "@/context/page-context";
import {
  StaticImageData,
  StaticImport,
} from "next/dist/shared/lib/get-img-props";
import { motion } from "framer-motion";
import randomImage from "@/assets/noImageAvailable.png";
import { Star } from "lucide-react";
import markerSVG from "@/svgs/marker.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load the image swiper with carousel functionality
const LazyImageSwiper = dynamic(() => import("./LazyImageSwiper"), {
  loading: () => <div className="w-full h-[148px] bg-gray-200 animate-pulse" />,
  ssr: true,
});

interface CardDataProps {
  isRed?: boolean;
  cardData: { header: string; value: string }[];
  onClick?: () => void;
  className?: string;
  images: StaticImport | StaticImageData[];
  isPremium?: boolean;
  style?: React.CSSProperties;
  isDisabled?: boolean;
  onCardPageClick?: () => void;
  isAddForInspectionModalOpened: boolean;
  setIsAddInspectionModalOpened?: (type: boolean) => void;
  property?: any;
  setPropertySelected?: (type: any[]) => void;
  isComingFromPriceNeg?: boolean;
  setIsComingFromPriceNeg?: (type: boolean) => void;
} 

const Card = ({
  isRed,
  cardData,
  onClick,
  className,
  images,
  style,
  isDisabled,
  onCardPageClick,
  setIsAddInspectionModalOpened,
  property,
  setPropertySelected,
  isComingFromPriceNeg,
  setIsComingFromPriceNeg,
  isAddForInspectionModalOpened,
  isPremium,
}: CardDataProps) => {
  const [count, setCount] = useState<number>(4);
  const [text, setText] = useState<string>("View more");
  const { setViewImage, setImageData } = usePageContext();
 
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Check if this property has a negotiated price
  const negotiatedPriceData = useMemo(
    () => property?._id,
    [property?._id],
  );

  const hasNegotiatedPrice = negotiatedPriceData !== null;

  // Check if this property is selected for inspection
  const isSelectedForInspectionCheck = useMemo(
    () => property?._id,
    [property?._id],
  );

  useEffect(() => {
    if (count === 6) {
      setText("View less");
    } else if (count === 4) {
      setText("View more");
    }
  }, [count]);
  return (
    <Fragment>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        exit={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        ref={cardRef}
        style={style}
        className={`w-full md:w-[296px] rounded-md shrink-0 bg-white border-[1px] py-[16px] px-[15px] gap-[10px] transition-all duration-500 ${className}`}
      >
        <div className="flex flex-col gap-[11px] w-full">
          <div className={`w-full h-[148px] bg-gray-200 relative`}>
            {/**Premium */}
            {isPremium ? (
              <div className="w-[88px] z-10 h-[28px] py-[8px] px-[6px] text-white flex gap-x-1 items-center bg-[#FF3D00] absolute rounded-br-md">
                <span className="text-sm">Premium</span>
                <Star size={14} className="text-white" />
              </div>
            ) : null}
            <ImageSwiper
              images={Array.isArray(images) ? images : [randomImage]}
            />
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex gap-[7px]">
              {cardData.map(
                (item: { header: string; value: string }, idx: number) => {
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
                },
              )}
            </div>
            {/**price */}
            <div className="flex items-center gap-2">
              {cardData.map(
                (item: { header: string; value: string }, idx: number) => {
                  if (item.header === "Price") {
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {hasNegotiatedPrice ? (
                          <div className="flex items-center gap-2">
                            <h2 className="text-md font-semibold text-[#8DDB90]">
                              ₦
                              {/* {Number(
                                negotiatedPriceData!.negotiatedPrice,
                              ).toLocaleString()} */}
                            </h2>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              title="Clear negotiated price"
                            >
                              <X size={16} className="text-[#5A5D63]" />
                            </button>
                            <span className="text-sm text-[#5A5D63] line-through">
                              {item.value}
                            </span>
                          </div>
                        ) : (
                          <h2 className="text-lg font-semibold text-[#000000]">
                            {item.value}
                          </h2>
                        )}
                      </div>
                    );
                  }
                },
              )}
            </div>
            {/**Bedrooms | Bathroom | sqft */}
            <div className="flex gap-[9px]">
              {cardData.map(
                (item: { header: string; value: string }, idx: number) => {
                  if (item.header === "Bedrooms") {
                    return (
                      <h2
                        key={idx}
                        className="text-xs font-normal text-[#000000]"
                      >
                        {item.value} Bedrooms
                      </h2>
                    );
                  }
                },
              )}
            </div>
            {/**Location and see images */}
            <div className="flex justify-between items-center">
              <div className="flex gap-[5px]">
                <Image
                  src={markerSVG}
                  width={16}
                  height={16}
                  alt="marker"
                  className="w-[16px] h-[16px]"
                />
                {cardData.map(
                  (item: { header: string; value: string }, idx: number) => {
                    if (item.header === "Location") {
                      return (
                        <h2
                          key={idx}
                          className="text-xs font-normal text-[#000000]"
                        >
                          {item.value}
                        </h2>
                      );
                    }
                  },
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  // setImageData(images);
                  // setViewImage(true);
                  onCardPageClick?.();
                }}
                className="text-xs font-semibold text-[#0B423D] underline"
              >
                View Details
              </button>
            </div>
          </div>
          {/* <BreadCrumb cardData={cardData} limit={count} /> */}
          {/* <button
            type='button'
            onClick={() => {
              setImageData(images);
              setViewImage(true);
            }}
            className='min-h-[42px] border-[1px] py-[10px] px-[20px] bg-[#F3F8FC] flex justify-center items-center text-[14px] leading-[22.4px] font-ubuntu text-[#1976D2] tracking-[0.1px]'>
            View Image
          </button> */}
          {/* <button
            type='button'
            onClick={() => {
              setCount((count: number) => count + 2);
              if (count === 6) {
                setCount(4);
              }
            }}
            className='min-h-[37px] border-[1px] py-[10px] px-[20px] bg-[#F7F7F8] flex justify-center items-center text-[12px] leading-[19.2px] text-[#5A5D63] tracking-[0.1px] gap-1 font-ubuntu'>
            <span>{text}</span>
            <Image
              src={arrowDown}
              alt=''
              width={16}
              height={16}
              className={`w-[16px] h-[16px] transition-all duration-500 ${
                count === 6 && 'transform rotate-180'
              }`}
            />
          </button> */}
          {/* <button
            type='button'
            className='min-h-[50px] py-[12px] px-[24px] bg-[#8DDB90] text-[#FFFFFF] text-base leading-[25.6px] font-bold'>
            Select of Inspection
          </button> */}
          {hasNegotiatedPrice ? (
            <div className="min-h-[50px] py-[12px] px-[24px] bg-[#8DDB90] text-[#FFFFFF] text-base leading-[25.6px] font-bold flex items-center justify-between">
              <span className="text-xs">
                New Offer: ₦
                {/* {Number(negotiatedPriceData!.negotiatedPrice).toLocaleString()} */}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors ml-2"
                title="Clear negotiated price"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            null
          )}
          <button
            onClick={onClick}
            disabled={false}
            className={`min-h-[50px] py-[12px] px-[24px] ${
              isSelectedForInspectionCheck
                ? "bg-[#09391C] hover:bg-[#0B423D] cursor-pointer"
                : "bg-[#8DDB90] hover:bg-[#76c77a]"
            } text-[#FFFFFF] text-base leading-[25.6px] font-bold flex items-center justify-center gap-2 transition-colors`}
            type="button"
          >
            {isSelectedForInspectionCheck ? (
              <>
                <span>Selected</span>
                <X size={16} className="text-white" />
              </>
            ) : (
              "Select for Inspection"
            )}
          </button>
        </div>
      </motion.div>
    </Fragment>
  );
};

const BreadCrumb = ({
  limit,
  cardData,
}: {
  limit: number;
  cardData: { header: string; value: string }[];
}) => {
  return (
    <>
      {cardData?.map((item, idx: number) => {
        if (idx < limit) {
          return (
            <div
              key={idx}
              className="min-h-[60px] w-full py-[5px] px-[20px] gap-[6px] flex flex-row justify-between items-center lg:items-start lg:flex-col bg-[#F7F7F8]"
            >
              <h2 className="text-[14px] font-ubuntu leading-[22.4px] tracking-[0.1px] text-[#707281]">
                {item.header}
              </h2>
              <span
                dangerouslySetInnerHTML={{ __html: item.value }}
                className={`font-medium overflow-hidden ${
                  limit < 6 ? "h-[20px]" : "min-h-[20px]"
                } text-[14px] font-ubuntu leading-[22.4px] tracking-[0.1px] text-[#0B0D0C]`}
              />
            </div>
          );
        }
      })}
    </>
  );
};

//specifically built for image swiper

type NavigationButtonProps = {
  handleNav: () => void;
  type: "arrow left" | "arrow right";
  className?: string;
};
const NavigationButton: React.FC<NavigationButtonProps> = ({
  handleNav,
  type,
  className,
}): React.JSX.Element => {
  const renderArrow = () => {
    switch (type) {
      case "arrow left":
        return (
          <ChevronLeft
            size={16}
            color="#09391C"
            className="w-[16px] h-[16px]"
          />
        );
      case "arrow right":
        return (
          <ChevronRight
            size={16}
            color="#09391C"
            className="w-[16px] h-[16px]"
          />
        );
    }
  };
  return (
    <button
      onClick={handleNav}
      type="button"
      className={`w-[35px] h-[35px] border-[1px] border-[#5A5D63]/[50%] flex items-center justify-center ${className}`}
    >
      {type && renderArrow()}
    </button>
  );
};


export default Card;
