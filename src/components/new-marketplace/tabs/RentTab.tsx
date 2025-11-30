/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import RentPropertySearch from "../search/RentPropertySearch";
import PropertyGrid from "../PropertyGrid";

const RentTab = () => {
  const {
    rentTab,
    fetchTabData,
    activeTab,
  } = useNewMarketplace();

  // Note: Modal states removed as per requirements

  // Fetch initial data when tab becomes active (only once)
  useEffect(() => {
    if (
      activeTab === "rent" &&
      rentTab.formikStatus === "idle" &&
      rentTab.properties.length === 0
    ) {
      fetchTabData("rent");
    }
  }, [
    activeTab,
    rentTab.formikStatus,
    rentTab.properties.length,
    fetchTabData,
  ]);

  const handlePropertyClick = (property: any) => {
    // Navigate to property details page
    const propertyId = property._id;
    window.open(`/property/rent/${propertyId}`, "_blank");
  };

  // Note: Inspection and negotiation handlers removed as per requirements

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <RentPropertySearch />

      {/* Properties Grid */}
      <PropertyGrid
        tab="rent"
        properties={rentTab.properties}
        loading={rentTab.formikStatus === "pending"}
        error={rentTab.errMessage}
        searchStatus={rentTab.searchStatus}
        currentPage={rentTab.currentPage}
        totalPages={rentTab.totalPages}
        totalItems={rentTab.totalItems}
        onPropertyClick={handlePropertyClick}
      />

      {/* Note: Modals removed as per requirements */}
    </div>
  );
};

export default RentTab;
