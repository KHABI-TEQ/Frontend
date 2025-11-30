/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import ShortletPropertySearch from "../search/ShortletPropertySearch";
import PropertyGrid from "../PropertyGrid";

const ShortletTab = () => {
  const {
    shortletTab,
    fetchTabData,
    activeTab,
  } = useNewMarketplace();

  // Note: Modal states removed as per requirements

  // Fetch initial data when tab becomes active (only once)
  useEffect(() => {
    if (
      activeTab === "shortlet" &&
      shortletTab.formikStatus === "idle" &&
      shortletTab.properties.length === 0
    ) {
      fetchTabData("shortlet");
    }
  }, [
    activeTab,
    shortletTab.formikStatus,
    shortletTab.properties.length,
    fetchTabData,
  ]);

  const handlePropertyClick = (property: any) => {
    // Navigate to property details page
    const propertyId = property._id;
    window.open(`/property/shortlet/${propertyId}`, "_blank");
  };

  // Note: Inspection and negotiation handlers removed as per requirements

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <ShortletPropertySearch />

      {/* Properties Grid */}
      <PropertyGrid
        tab="shortlet"
        properties={shortletTab.properties}
        loading={shortletTab.formikStatus === "pending"}
        error={shortletTab.errMessage}
        searchStatus={shortletTab.searchStatus}
        currentPage={shortletTab.currentPage}
        totalPages={shortletTab.totalPages}
        totalItems={shortletTab.totalItems}
        onPropertyClick={handlePropertyClick}
      />

      {/* Note: Modals removed as per requirements */}
    </div>
  );
};

export default ShortletTab;
