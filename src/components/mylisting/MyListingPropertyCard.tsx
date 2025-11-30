/** @format */

"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Property } from "@/types/my-listings.types";

interface MyListingPropertyCardProps {
  property: Property;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeStatus: () => void;
}

const MyListingPropertyCard: React.FC<MyListingPropertyCardProps> = ({
  property,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const actionBtnRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const MENU_WIDTH = 220; // px

  const computeAndSetMenuPos = () => {
    const btn = actionBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    // Prefer right-aligned to the button, clamp within viewport
    const desiredLeft = rect.right + window.scrollX - MENU_WIDTH;
    const minLeft = 8 + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - MENU_WIDTH - 8;
    const left = Math.max(minLeft, Math.min(maxLeft, desiredLeft));
    setMenuPos({ top, left });
  };

  useEffect(() => {
    if (!showDropdown) return;
    const updatePos = () => computeAndSetMenuPos();
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!showDropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        actionBtnRef.current &&
        (actionBtnRef.current === target || actionBtnRef.current.contains(target))
      ) {
        return;
      }
      // Close if clicking outside the portal menu
      if (!document.getElementById("listing-action-menu")) return;
      const menu = document.getElementById("listing-action-menu");
      if (menu && !menu.contains(target)) setShowDropdown(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showDropdown]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "rejected":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const formatLocation = (location: any) => {
    return [location.area, location.localGovernment, location.state]
      .filter(Boolean)
      .join(", ");
  };

  const getPropertyImages = () => {
    if (property.pictures && property.pictures.length > 0) {
      return property.pictures;
    }
    return ["/placeholder-property.svg"]; // fallback image
  };

  const images = getPropertyImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const documentsProvided = property.docOnProperty?.filter(doc => doc.isProvided).length || 0;
  const totalDocuments = property.docOnProperty?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="property-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col"
    >
      {/* Image Section */}
      <div className="image-slider relative h-48 bg-gray-100">
        {images.length > 0 && (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={`${property.propertyType} property`}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-property.svg";
              }}
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                  {currentImageIndex + 1}/{images.length}
                </div>

                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(property.status)}`}>
            {getStatusIcon(property.status)}
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </div>
        </div>

        {/* Premium Badge */}
        {property.isPremium && (
          <div className="absolute top-3 right-12">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              Premium
            </div>
          </div>
        )}

        {/* Actions Dropdown */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              ref={actionBtnRef}
              onClick={() => {
                if (!showDropdown) computeAndSetMenuPos();
                setShowDropdown((v) => !v);
              }}
              aria-haspopup="menu"
              aria-expanded={showDropdown}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
            >
              <MoreVertical size={16} className="text-gray-600" />
            </button>

            {showDropdown && menuPos && createPortal(
              <motion.div
                id="listing-action-menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                className="bg-white border border-gray-200 rounded-lg shadow-2xl"
                style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 100000, width: MENU_WIDTH }}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      onView();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View Listing
                  </button>
                  <button
                    onClick={() => {
                      onEdit();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit Property
                  </button>
                  {!["pending", "deleted", "rejected", "hold", "flagged"].includes(property.status) && (
                    <button
                      onClick={() => {
                        onChangeStatus();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {property.isAvailable ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                      {property.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    </button>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete Property
                  </button>
                </div>
              </motion.div>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Property Type & Brief Type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {property.propertyCategory}
            </span>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
              {property.briefType}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(property.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Property Type & Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-[#09391C]">
              {formatPrice(property.price)}
            </p>
            {property.landSize && (
              <span className="text-sm text-gray-600">
                {property.landSize.size} {property.landSize.measurementType}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-3 text-gray-600">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{formatLocation(property.location)}</span>
        </div>

        {/* Property Details */}
        {property.additionalFeatures && (
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            {property.additionalFeatures.noOfBedroom && (
              <div className="flex items-center gap-1">
                <Bed size={14} className="text-gray-400" />
                <span>{property.additionalFeatures.noOfBedroom}</span>
              </div>
            )}
            {property.additionalFeatures.noOfBathroom && (
              <div className="flex items-center gap-1">
                <Bath size={14} className="text-gray-400" />
                <span>{property.additionalFeatures.noOfBathroom}</span>
              </div>
            )}
            {property.additionalFeatures.noOfCarPark && (
              <div className="flex items-center gap-1">
                <Car size={14} className="text-gray-400" />
                <span>{property.additionalFeatures.noOfCarPark}</span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{property.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Tag size={14} className="text-gray-400" />
            <span>
              {documentsProvided}/{totalDocuments} Documents
            </span>
          </div>
          <div className={`flex items-center gap-1 ${property.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${property.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium">
              {property.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-auto pt-2">
          {property.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {property.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyListingPropertyCard;
