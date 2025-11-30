/** @format */

"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedGlobalPropertyCard, createPropertyCardData } from "@/components/common/property-cards";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Loading from "@/components/loading-component/loading";
import FailedRequest from "@/components/general-components/FailedRequest";
import StandardPreloader from "./StandardPreloader";
import { IsMobile } from "@/hooks/isMobile";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";

interface PropertyGridProps {
  tab: "buy" | "rent" | "shortlet" | "jv";
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
  // Note: Inspection and action functionalities removed as per requirements

}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  tab,
  properties,
  loading,
  error,
  searchStatus,
  currentPage,
  totalPages,
  totalItems,
  onPropertyClick,
}) => {
  const isMobile = IsMobile();
  const { setTabPage } = useNewMarketplace();
  const { toggleInspectionSelection } = useGlobalPropertyActions();



  const handlePageChange = (page: number) => {
    setTabPage(tab, page);
    // Trigger search with new page
    window.dispatchEvent(
      new CustomEvent("marketplace-search", { detail: { tab, page } }),
    );
  };

  // Loading state - check both loading prop and search status
  if (loading || searchStatus.status === "pending") {
    return (
      <StandardPreloader
        isVisible={true}
        message={searchStatus.status === "pending" ? "Searching properties..." : "Loading properties..."}
        overlay={false}
      />
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

  // Empty state - only show if search is complete and no properties found
  if (searchStatus.status === "success" && (searchStatus.couldNotFindAProperty || properties.length === 0)) {
    return <EmptyState tab={tab} />;
  }

  // Note: Selected properties functionality removed as per requirements


  return (
    <div className="w-full">
      <div className="space-y-6 mx-auto max-w-6xl">

        {/* Properties Grid */}
        <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-2 xl:gap-4 justify-items-center px-2 lg:px-2">
          <AnimatePresence>
            {properties.map((property, index) => {
              const cardData = createPropertyCardData(property, tab === "jv" ? "Joint Venture" : undefined);

              return (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="w-full"
                > 
                  <EnhancedGlobalPropertyCard
                    type={tab === "jv" ? "jv" : "standard"}
                    tab={tab === "jv" ? "buy" : tab}
                    property={property}
                    cardData={cardData}
                    images={property.pictures || property.images || []}
                    isPremium={property.isPremium || false}
                    onPropertyClick={() => onPropertyClick(property)}
                    onInspectionToggle={() => {
                      const sourceTab = tab === "jv" ? "jv" : tab;
                      toggleInspectionSelection(property, sourceTab, "market-place");
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[#5A5D63] text-xs sm:text-sm">
          <span className="text-center sm:text-left">
            Showing {(currentPage - 1) * 12 + 1} -{" "}
            {Math.min(currentPage * 12, totalItems)} of {totalItems} properties
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
    </div>
  );
};

export default PropertyGrid;
