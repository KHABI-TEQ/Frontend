/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import JointVentureSearch from "../search/JointVentureSearch";
import PropertyGrid from "../PropertyGrid";

const JointVentureTab = () => {
  const {
    jvTab,
    fetchTabData,
    activeTab,
  } = useNewMarketplace();

  // Note: Modal states removed as per requirements

  // Fetch initial data when tab becomes active (only once)
  useEffect(() => {
    if (
      activeTab === "jv" &&
      jvTab.formikStatus === "idle" &&
      jvTab.properties.length === 0
    ) {
      fetchTabData("jv");
    }
  }, [activeTab, jvTab.formikStatus, jvTab.properties.length, fetchTabData]);

  const handlePropertyClick = (property: any) => {
    // Navigate to property details page
    const propertyId = property._id;
    window.open(`/property/jv/${propertyId}`, "_blank");
  };

  // Note: Inspection and LOI handlers removed as per requirements



  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <JointVentureSearch />

      {/* Properties Grid */}
      <PropertyGrid
        tab="jv"
        properties={jvTab.properties}
        loading={jvTab.formikStatus === "pending"}
        error={jvTab.errMessage}
        searchStatus={jvTab.searchStatus}
        currentPage={jvTab.currentPage}
        totalPages={jvTab.totalPages}
        totalItems={jvTab.totalItems}
        onPropertyClick={handlePropertyClick}
      />

      {/* Note: Modals removed as per requirements */}
    </div>
  );
};

export default JointVentureTab;
