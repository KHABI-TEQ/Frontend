/** @format */

"use client";
import React, { useEffect } from "react";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import BuyPropertySearch from "../search/BuyPropertySearch";
import PropertyGrid from "../PropertyGrid";
 
const BuyTab = () => {
  const {
    buyTab,
    fetchTabData,
    activeTab,
  } = useNewMarketplace();
 
  // Fetch initial data when tab becomes active
  useEffect(() => {
    if (
      activeTab === "buy" &&
      buyTab.formikStatus === "idle" &&
      buyTab.properties.length === 0
    ) {
      fetchTabData("buy");
    }
  }, [activeTab, buyTab.formikStatus, buyTab.properties.length, fetchTabData]);

  const handlePropertyClick = (property: any) => {
    // Navigate to property details page
    const propertyId = property._id;
    window.open(`/property/buy/${propertyId}`, "_blank");
  };


  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <BuyPropertySearch />

      {/* Properties Grid */}
      <PropertyGrid
        tab="buy"
        properties={buyTab.properties}
        loading={buyTab.formikStatus === "pending"}
        error={buyTab.errMessage}
        searchStatus={buyTab.searchStatus}
        currentPage={buyTab.currentPage}
        totalPages={buyTab.totalPages}
        totalItems={buyTab.totalItems}
        onPropertyClick={handlePropertyClick}
      />

      {/* Note: Modals removed as per requirements */}
    </div>
  );
};

export default BuyTab;
