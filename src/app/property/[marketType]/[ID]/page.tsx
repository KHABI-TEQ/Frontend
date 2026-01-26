/** @format */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Share2,
  Heart,
  Bed,
  Bath,
  Car,
  Maximize,
  CheckCircle,
  ExternalLink,
  Camera,
  ArrowLeft,
  ArrowRight,
  X,
  Eye,
  Home,
  FileText,
  Shield,
  Play,
  Video,
  House,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import api from "@/utils/axiosConfig";
import toast from "react-hot-toast";
import { URLS } from "@/utils/URLS";
import { useSelectedBriefs } from "@/context/selected-briefs-context";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";
import GlobalPriceNegotiationModal from "@/components/modals/GlobalPriceNegotiationModal";
import sampleImage from "@/assets/noImageAvailable.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import Loading from "@/components/loading-component/loading";
import { kebabToTitleCase } from "@/utils/helpers";
import ShortletBookingModal from "@/components/shortlet/ShortletBookingModal";
import LOIUploadModal from "@/components/new-marketplace/modals/LOIUploadModal";
import PropertyLocationMap from "@/components/property/PropertyLocationMap";

interface PropertyDetails {
  _id: string;
  propertyId: string;
  price: number;
  propertyType: string;
  propertyCategory: string;
  bedRoom: number;
  propertyStatus: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
    streetAddress?: string;
  };
  streetAddress?: string;
  landSize: {
    measurementType: string;
    size: number | null;
  };
  additionalFeatures: {
    additionalFeatures: string[];
    noOfBedrooms: number;
    noOfBathrooms: number;
    noOfToilets: number;
    noOfCarParks: number;
  };
  features: string[];
  tenantCriteria: string[];
  jvConditions: string[];
  shortletDetails: any;
  areYouTheOwner: boolean;
  isAvailable: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isPreference?: boolean;
  isPremium: boolean;
  pictures: string[];
  videos: string[];
  createdAt?: string;
  updatedAt?: string;
  owner: string;
  docOnProperty: {
    docName: string;
    isProvided: boolean;
  }[];
  briefType: string;
  propertyCondition: string;
  noOfCarParks: number;
  noOfBathrooms: number;
  noOfToilets: number;
  description: string;
  addtionalInfo?: string;
}

// Image Gallery Component
const ImageGallery = ({ images }: { images: string[] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const validImages = images.length > 0 ? images : [sampleImage.src];

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Swiper */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Autoplay]}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={validImages.length > 1}
          className="w-full aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden shadow-lg"
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {validImages.map((image, index) => (
            <SwiperSlide key={index} className="relative">
              <Image
                src={image}
                alt={`Property image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
              />
              <button
                onClick={() => openLightbox(index)}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <Camera className="w-5 h-5" />
              </button>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            <ArrowRight className="w-5 h-5" />
          </button>
        </Swiper>
      </div>

      {/* Thumbnail Gallery */}
      {validImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={4}
          breakpoints={{
            640: { slidesPerView: 5 },
            768: { slidesPerView: 6 },
            1024: { slidesPerView: 7 },
          }}
          watchSlidesProgress
          className="thumbnail-swiper"
        >
          {validImages.map((image, index) => (
            <SwiperSlide key={index} className="cursor-pointer">
              <div
                className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                  index === activeIndex
                    ? "ring-2 ring-blue-500 opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={validImages[activeIndex]}
                alt={`Property image ${activeIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Video Gallery Component
const VideoGallery = ({ videos }: { videos: string[] }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isVideoLightboxOpen, setIsVideoLightboxOpen] = useState(false);

  if (!videos || videos.length === 0) return null;

  const openVideoLightbox = (index: number) => {
    setActiveVideoIndex(index);
    setIsVideoLightboxOpen(true);
  };

  const getVideoId = (url: string) => {
    // Extract video ID for different platforms (YouTube, Vimeo, etc.)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getVideoId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('vimeo.com')) {
      const videoId = getVideoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  const getThumbnailUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getVideoId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    }
    if (url.includes('vimeo.com')) {
      // For Vimeo, we'll use a placeholder or default thumbnail
      return '';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-blue-600" />
          Property Videos ({videos.length})
        </h3>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => {
          const thumbnailUrl = getThumbnailUrl(video);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => openVideoLightbox(index)}
            >
              <div className="relative aspect-video bg-gray-900">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={`Property video ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 group-hover:bg-black/70 transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>

                {/* Video Number */}
                <div className="absolute top-3 left-3 bg-black/70 text-white text-sm px-2 py-1 rounded-md">
                  {index + 1} of {videos.length}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  Property Video {index + 1}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Video Lightbox Modal */}
      <AnimatePresence>
        {isVideoLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsVideoLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={getEmbedUrl(videos[activeVideoIndex])}
                title={`Property video ${activeVideoIndex + 1}`}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {/* Close Button */}
              <button
                onClick={() => setIsVideoLightboxOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Navigation */}
              {videos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex(activeVideoIndex > 0 ? activeVideoIndex - 1 : videos.length - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoIndex(activeVideoIndex < videos.length - 1 ? activeVideoIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Video Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {activeVideoIndex + 1} of {videos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Property Stats Component
const PropertyStats = ({ details }: { details: PropertyDetails }) => {
  const stats = [
    {
      icon: <Bed className="w-5 h-5" />,
      label: "Bedrooms",
      value: details.additionalFeatures?.noOfBedrooms || details.bedRoom || 0,
    },
    {
      icon: <Bath className="w-5 h-5" />,
      label: "Bathrooms",
      value:
        details.additionalFeatures?.noOfBathrooms || details.noOfBathrooms || 0,
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: "Parking",
      value:
        details.additionalFeatures?.noOfCarParks || details.noOfCarParks || 0,
    },
    {
      icon: <Maximize className="w-5 h-5" />,
      label: "Land Size",
      value: details.landSize?.size
        ? `${details.landSize.size} ${details.landSize.measurementType || ""}`
        : "N/A",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-center text-blue-600 mb-2">
            {stat.icon}
          </div>
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="font-semibold text-gray-900">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Feature List Component
const FeatureList = ({
  features,
  title,
}: {
  features: string[];
  title: string;
}) => {
  if (!features.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
            <span className="text-sm">{kebabToTitleCase(feature)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Property Info Card Component
const PropertyInfoCard = ({ details }: { details: PropertyDetails }) => {
  const infoItems = [
    {
      label: "Property Type",
      value: details.propertyType,
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: "Listing Type",
      value: details.briefType || "Standard",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Condition",
      value: details.propertyCondition || "Good",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: "Property Category",
      value: details.propertyCategory,
      icon: <House className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Property Information
      </h3>
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center text-gray-600">
              {item.icon}
              <span className="ml-2 text-sm">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {kebabToTitleCase(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Documents Component
const DocumentsList = ({
  documents,
}: {
  documents: PropertyDetails["docOnProperty"];
}) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Available Documents
      </h3>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-900">
              {kebabToTitleCase(doc.docName)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                doc.isProvided
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {doc.isProvided ? "Available" : "Not Available"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({
  details,
  onInspection,
  onNegotiation,
  isSelected,
  onBookNow,
  onRequestToBook,
  onLOIUpload,
  hasLOI,
  onClearLOI,
}: {
  details: PropertyDetails;
  onInspection: () => void;
  onNegotiation: () => void;
  isSelected: boolean;
  onBookNow?: () => void;
  onRequestToBook?: () => void;
  onLOIUpload?: () => void;
  hasLOI?: boolean;
  onClearLOI?: () => void;
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Property Listing",
      text: `Check out this property in ${details.location.area}, ${details.location.state}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard write failed:", err);
        alert("Could not copy link.");
      }
    }
  };

  const isShortlet = details.briefType === "Shortlet" || (details as any).propertyType === "Shortlet";
  const isJV = details.briefType === "Joint Venture";

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="text-center md:text-left">
        <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          ₦
          {details.price
            ? Number(details.price).toLocaleString()
            : "Contact for price"}
        </div>
        <div className="flex items-center justify-center md:justify-start text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {details.location.area}, {details.location.localGovernment},{" "}
            {details.location.state}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {isShortlet ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBookNow}
            className="flex-1 min-h-[44px] py-3 px-4 bg-[#0B423D] text-white text-sm font-bold rounded-xl hover:bg-[#09391C] transition-colors flex items-center justify-center"
          >
            Book Now
          </button>
          <button
            type="button"
            onClick={onRequestToBook}
            className="flex-1 min-h-[44px] py-3 px-4 bg-[#1976D2] text-white text-sm font-bold rounded-xl hover:bg-[#1565C0] transition-colors flex items-center justify-center"
          >
            Request to Book
          </button>
        </div>
      ) : isJV ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onLOIUpload || (() => {})}
            className="flex-1 bg-[#FF9800] hover:bg-[#F57C00] whitespace-nowrap text-sm text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {hasLOI ? "Edit LOI" : "Submit LOI"}
          </button>
          {hasLOI && (
            <button
              onClick={onClearLOI || (() => {})}
              className="flex-1 bg-[#F44336] hover:bg-[#D32F2F] whitespace-nowrap text-sm text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              Clear LOI
            </button>
          )}
          <button
            onClick={onInspection}
            className={`flex-1 font-semibold py-3 px-4 whitespace-nowrap text-sm rounded-xl transition-colors duration-200 flex items-center justify-center ${
              isSelected
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            <Eye className="w-5 h-5 mr-2" />
            {isSelected ? "Remove" : "Add to Inspection"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onInspection}
            className={`flex-1 font-semibold py-3 px-4 whitespace-nowrap text-sm rounded-xl transition-colors duration-200 flex items-center justify-center ${
              isSelected
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            <Eye className="w-5 h-5 mr-2" />
            {isSelected ? "Remove" : "Add to Inspection"}
          </button>
          {/* Price Negotiation button disabled */}
          {/**
          <button
            onClick={onNegotiation}
            className="flex-1 bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-sm text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Price Negotiation
          </button>
          **/}
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex-1 border-2 ${isLiked ? "border-red-500 text-red-500" : "border-gray-300 text-gray-600"} hover:border-red-500 hover:text-red-500 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center`}
        >
          <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Saved" : "Save"}
        </button>
        <button onClick={handleShare} className="flex-1 border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center">
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center md:justify-start">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            details.isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {details.isAvailable ? "Available" : "Not Available"}
        </span>
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; mode: "instant" | "request" }>({ isOpen: false, mode: "instant" });
  const { selectedBriefs } = useSelectedBriefs();
  const {
    toggleInspectionSelection,
    isSelectedForInspection,
    addNegotiatedPrice,
    getNegotiatedPrice,
    addLOIDocument,
    getLOIDocument,
    removeLOIDocument,
  } = useGlobalPropertyActions();

  // Price negotiation modal state
  const [priceNegotiationModal, setPriceNegotiationModal] = useState<{
    isOpen: boolean;
    property: PropertyDetails | null;
  }>({ isOpen: false, property: null });

  const [loiModal, setLoiModal] = useState<{ isOpen: boolean }>({ isOpen: false });

  const marketType = params?.marketType ?? "";
  const id = params?.ID ?? "";

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);

        // Use the new endpoint format
        const response = await api.get(`/properties/${id}/getOne`);

        if (!response || !response.data || !response.data.success) {
          throw new Error("Property not found");
        }

        // Handle the new response structure: response.data.data.property
        const propertyData = response.data.data.property;

        if (propertyData) {
          setDetails({
            _id: propertyData._id,
            propertyId: propertyData._id,
            price: propertyData.price,
            propertyCategory: propertyData.propertyCategory,
            propertyType:
              propertyData.typeOfBuilding || propertyData.propertyType,
            bedRoom: propertyData.additionalFeatures?.noOfBedroom || 0,
            propertyStatus: propertyData.propertyCondition || "",
            location: propertyData.location,
            landSize: propertyData.landSize || {
              measurementType: "",
              size: null,
            },
            additionalFeatures: {
              additionalFeatures: propertyData.features || [],
              noOfBedrooms: propertyData.additionalFeatures?.noOfBedroom || 0,
              noOfBathrooms: propertyData.additionalFeatures?.noOfBathroom || 0,
              noOfToilets: propertyData.additionalFeatures?.noOfToilet || 0,
              noOfCarParks: propertyData.additionalFeatures?.noOfCarPark || 0,
            },
            features: propertyData.features || [],
            tenantCriteria: propertyData.tenantCriteria || [],
            areYouTheOwner: propertyData.areYouTheOwner ?? false,
            isAvailable:
              propertyData.isAvailable === "yes" ||
              propertyData.isAvailable === true,
            isApproved: propertyData.isApproved ?? false,
            isRejected: propertyData.isRejected ?? false,
            isPreference: propertyData.isPreference ?? false,
            isPremium: propertyData.isPremium ?? false,
            pictures:
              propertyData.pictures && propertyData.pictures.length > 0
                ? propertyData.pictures
                : [sampleImage.src],
            videos: propertyData.videos || [],
            createdAt: propertyData.createdAt,
            updatedAt: propertyData.updatedAt,
            owner: propertyData.owner,
            docOnProperty: propertyData.docOnProperty || [],
            shortletDetails: propertyData.shortletDetails || {},
            briefType:
              propertyData.briefType ||
              (propertyData.propertyCategory === "for_sale"
                ? "Outright Sales"
                : propertyData.propertyCategory === "for_rent"
                  ? "Rent"
                  : "Unknown"),
            propertyCondition: propertyData.propertyCondition || "",
            noOfCarParks: propertyData.additionalFeatures?.noOfCarPark || 0,
            noOfBathrooms: propertyData.additionalFeatures?.noOfBathroom || 0,
            noOfToilets: propertyData.additionalFeatures?.noOfToilet || 0,
            // Add additional fields from new API
            description: propertyData.description,
            addtionalInfo: propertyData.addtionalInfo,
          } as any);

          // Handle similar properties from the new response
          if (response.data.data.similarProperties) {
            setSimilarProperties(
              response.data.data.similarProperties.slice(0, 3),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message || error.message;
          console.error(`API Error ${status}:`, message);

          if (status === 404) {
            toast.error("Property not found");
          } else if (status && status >= 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error(`Failed to load property details: ${message}`);
          }
        } else {
          toast.error("Failed to load property details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  // Similar properties are now fetched with the main property data

  const handleInspection = () => {
    if (details) {
      // Determine the tab based on property category
      const sourceTab =
        details.briefType === "Joint Venture"
          ? "jv"
          : details.briefType === "Rent"
            ? "rent"
            : "buy";

      toggleInspectionSelection(details, sourceTab, "property-details");

      // // Check if now selected for inspection
      // if (isSelectedForInspection(details._id)) {
      //   toast.success("Property added to inspection");
      // } else {
      //   toast.success("Property removed from inspection");
      // }
    }
  };

  const handleNegotiation = () => {
    if (details) {
      setPriceNegotiationModal({
        isOpen: true,
        property: details,
      });
    }
  };

  const handleNegotiationSubmit = (property: PropertyDetails, negotiatedPrice: number) => {
    if (property) {
      addNegotiatedPrice(property._id, property.price, negotiatedPrice);

      // Auto-add to inspection if not already selected
      if (!isSelectedForInspection(property._id)) {
        toggleInspectionSelection(property);
      }

      toast.success("Price negotiation submitted successfully!");
      setPriceNegotiationModal({ isOpen: false, property: null });
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The property you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                // Fallback to market-place if no history
                router.push('/market-place');
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  // Fallback to market-place if no history
                  router.push('/market-place');
                }
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                ID: {details.owner.slice(-8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ImageGallery images={details.pictures} />
            </motion.div>

            {/* Video Gallery */}
            {details.videos && details.videos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <VideoGallery videos={details.videos} />
              </motion.div>
            )}

            {/* Property Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PropertyStats details={details} />
            </motion.div>

            {/* Property Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <PropertyLocationMap
                location={{
                  state: details.location?.state,
                  localGovernment: details.location?.localGovernment,
                  area: details.location?.area,
                  streetAddress: (details as any).streetAddress,
                }}
                propertyTitle={`${details.propertyType} in ${details.location?.state}`}
              />
            </motion.div>

            {/* Property Features */}
            {details.features.length > 0 && (
              <FeatureList
                features={details.features}
                title="Property Features"
              />
            )}

            {/* Tenant Criteria */}
            {details.tenantCriteria.length > 0 && (
              <FeatureList
                features={details.tenantCriteria.map((c) => typeof c === 'string' ? c : (c as any).criteria || c)}
                title="Tenant Requirements"
              />
            )}

            {/* Property Description */}
            {(details as any).description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Description
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {(details as any).description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-sm leading-relaxed">
                  This property is managed by Khabi-Teq Realty. All transactions
                  are secure and verified. For more information about this
                  property, please contact us directly or schedule an
                  inspection.
                </p>
                {(details as any).addtionalInfo && (
                  <p className="text-gray-700 text-sm leading-relaxed mt-3">
                    {(details as any).addtionalInfo}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <ActionButtons
                details={details}
                onInspection={handleInspection}
                onNegotiation={handleNegotiation}
                isSelected={isSelectedForInspection(details._id)}
                onBookNow={() => setBookingModal({ isOpen: true, mode: "instant" })}
                onRequestToBook={() => setBookingModal({ isOpen: true, mode: "request" })}
                onLOIUpload={() => setLoiModal({ isOpen: true })}
                hasLOI={!!getLOIDocument(details._id)}
                onClearLOI={() => removeLOIDocument(details._id)}
              />
            </motion.div>


            {/* Property Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PropertyInfoCard details={details} />
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <DocumentsList documents={details.docOnProperty} />
            </motion.div>

            {/* Selected Briefs */}
            {Array.from(selectedBriefs).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Briefs
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <p className="text-orange-800 font-medium">
                    {Array.from(selectedBriefs).length} brief
                    {Array.from(selectedBriefs).length !== 1 ? "s" : ""}{" "}
                    selected
                  </p>
                  <button className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </motion.div>
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Similar Properties
                </h3>
                <div className="space-y-4">
                  {similarProperties.slice(0, 2).map((property, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        router.push(`/property/Rent/${property._id}`)
                      }
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex space-x-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={property.pictures?.[0] || sampleImage.src}
                            alt="Property thumbnail"
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {property.propertyType}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {property.location.state},{" "}
                            {property.location.localGovernment}
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            ₦
                            {Number(
                              property.rentalPrice || property.price || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Price Negotiation Modal */}
      <GlobalPriceNegotiationModal
        isOpen={priceNegotiationModal.isOpen}
        property={priceNegotiationModal.property}
        onClose={() => setPriceNegotiationModal({ isOpen: false, property: null })}
        onSubmit={handleNegotiationSubmit}
        existingNegotiation={details ? getNegotiatedPrice(details._id) : null}
      />
      {/* LOI Upload Modal for JV */}
      {details && (
        <LOIUploadModal
          isOpen={loiModal.isOpen && details.briefType === "Joint Venture"}
          property={details}
          onClose={() => setLoiModal({ isOpen: false })}
          onSubmit={(prop, file, url) => {
            addLOIDocument(prop._id, file, url);
            if (!isSelectedForInspection(prop._id)) toggleInspectionSelection(prop, "jv", "auto-loi");
          }}
          existingDocument={getLOIDocument(details._id)}
        />
      )}
      {/* Shortlet Booking Modal */}
      <ShortletBookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, mode: "instant" })}
        property={details}
        mode={bookingModal.mode}
      />
    </div>
  );
};

export default ProductDetailsPage;
