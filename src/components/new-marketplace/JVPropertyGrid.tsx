/** @format */

"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedGlobalPropertyCard, createPropertyCardData } from "@/components/common/property-cards";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Loading from "@/components/loading-component/loading";
import FailedRequest from "@/components/general-components/FailedRequest";
import { IsMobile } from "@/hooks/isMobile";
import { useNewMarketplace } from "@/context/new-marketplace-context";

interface JVPropertyGridProps {
  tab: "jv";
  properties: any[];
  loading: boolean;
  error: string;
  searchStatus: {
    status: "pending" | "success" | "failed" | "idle";
    couldNotFindAProperty: boolean;
  };
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPropertyClick: (property: any) => void;
  onInspectionToggle: (property: any) => void;
  onLOIUpload: (property: any) => void;
  onRemoveLOI: (propertyId: string) => void;
  selectedForInspection: any[];
  loiDocuments: any[];
  onOpenAddForInspection: () => void;
}

const JVPropertyGrid: React.FC<JVPropertyGridProps> = ({
  tab,
  properties,
  loading,
  error,
  searchStatus,
  currentPage,
  totalPages,
  totalItems,
  onPropertyClick,
  onInspectionToggle,
  onLOIUpload,
  onRemoveLOI,
  selectedForInspection,
  loiDocuments,
  onOpenAddForInspection,
}) => {
  const isMobile = IsMobile();
  const { setTabPage } = useNewMarketplace();

  // Create property cards data for JV properties
  const getJVPropertyCardData = (property: any) => {
    const cardData = [
      { header: "Property Type", value: property.propertyType || "N/A" },
      {
        header: "Investment Amount",
        value: `₦${Number(property.investmentAmount || property.price || 0).toLocaleString()}`,
      },
      { header: "Bedrooms", value: property.noOfBedrooms || "0" },
      {
        header: "Investment Type",
        value: property.investmentType || "Joint Venture",
      },
      { header: "Expected ROI", value: property.expectedROI || "15-20%" },
      {
        header: "Location",
        value: property.location
          ? `${property.location.area || ""}, ${property.location.localGovernment || ""}, ${property.location.state || ""}`.replace(
              /^,\s*|,\s*$/g,
              "",
            )
          : "Location not specified",
      },
    ];

    return cardData;
  };

  const handlePageChange = (page: number) => {
    setTabPage(tab, page);
    // Trigger search with new page
    window.dispatchEvent(
      new CustomEvent("marketplace-search", { detail: { tab, page } }),
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <FailedRequest
        message={error}
        onRetry={() => {
          // Trigger search retry
          window.dispatchEvent(
            new CustomEvent("marketplace-search", {
              detail: { tab, page: currentPage },
            }),
          );
        }}
      />
    );
  }

  // Empty state
  if (searchStatus.couldNotFindAProperty || properties.length === 0) {
    return <EmptyState tab={tab} />;
  }

  // Selected properties indicator
  const selectedCount = selectedForInspection.length;
  const hasSelectedProperties = selectedCount > 0;


  return (
    <div className="space-y-6">
      {/* Selected Properties Bar - Mobile */}
      {isMobile && hasSelectedProperties && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#09391C] text-white p-4 z-50">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {selectedCount} propert{selectedCount === 1 ? "y" : "ies"}{" "}
              selected
            </span>
            <button
              onClick={onOpenAddForInspection}
              className="bg-[#8DDB90] text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Selected Properties Bar - Desktop */}
      {!isMobile && hasSelectedProperties && (
        <div className="bg-[#FFF3E0] border border-[#FF9800] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-[#E65100] font-semibold">
                {selectedCount} propert{selectedCount === 1 ? "y" : "ies"}{" "}
                selected for inspection
              </span>
              <span className="text-[#5A5D63] text-sm">
                (Maximum 2 properties allowed)
              </span>
            </div>
            <button
              onClick={onOpenAddForInspection}
              className="bg-[#FF9800] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#F57C00] transition-colors"
            >
              Continue to Inspection
            </button>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-2 lg:gap-3 xl:gap-2 px-2 lg:px-4">
        <AnimatePresence>
          {properties.map((property, index) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="w-full"
            >
              <EnhancedGlobalPropertyCard
                type="jv"
                tab="buy"
                property={property}
                cardData={getJVPropertyCardData(property)}
                images={property.pictures || property.images || []}
                isPremium={property.isPremium || false}
                onPropertyClick={() => onPropertyClick(property)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[#5A5D63] text-xs sm:text-sm">
        <span className="text-center sm:text-left">
          Showing {(currentPage - 1) * 12 + 1} -{" "}
          {Math.min(currentPage * 12, totalItems)} of {totalItems} opportunities
        </span>
        <span className="text-center sm:text-right">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default JVPropertyGrid;
