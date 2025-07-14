/** @format */

"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Select, { SingleValue } from "react-select";
import { usePreferenceForm } from "@/context/preference-form-context";

interface Option {
  value: string;
  label: string;
}

interface PropertyDetailsProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

// Property type options by preference type
const PROPERTY_TYPE_OPTIONS = {
  buy: [
    { value: "Land", label: "Land" },
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ],
  rent: [
    { value: "Self-con", label: "Self-con" },
    { value: "Flat", label: "Flat" },
    { value: "Mini Flat", label: "Mini Flat" },
    { value: "Bungalow", label: "Bungalow" },
  ],
  "joint-venture": [
    { value: "Land", label: "Land" },
    { value: "Old Building", label: "Old Building" },
    { value: "Structure to demolish", label: "Structure to demolish" },
  ],
  shortlet: [
    { value: "Studio", label: "Studio" },
    { value: "1-Bed Apartment", label: "1-Bed Apartment" },
    { value: "2-Bed Flat", label: "2-Bed Flat" },
  ],
};

// Building type options (for buy)
const BUILDING_TYPE_OPTIONS = [
  { value: "Detached", label: "Detached" },
  { value: "Semi-Detached", label: "Semi-Detached" },
  { value: "Block of Flats", label: "Block of Flats" },
];

// Property condition options
const PROPERTY_CONDITION_OPTIONS = {
  buy: [
    { value: "New", label: "New" },
    { value: "Renovated", label: "Renovated" },
    { value: "Any", label: "Any" },
  ],
  rent: [
    { value: "New", label: "New" },
    { value: "Renovated", label: "Renovated" },
  ],
};

// Purpose options
const PURPOSE_OPTIONS = {
  buy: [
    { value: "For living", label: "For living" },
    { value: "Resale", label: "Resale" },
    { value: "Development", label: "Development" },
  ],
  rent: [
    { value: "Residential", label: "Residential" },
    { value: "Office", label: "Office" },
  ],
};

// Lease term options (for rent)
const LEASE_TERM_OPTIONS = [
  { value: "6 Months", label: "6 Months" },
  { value: "1 Year", label: "1 Year" },
];

// JV Type options (for joint-venture)
const JV_TYPE_OPTIONS = [
  { value: "Equity Split", label: "Equity Split" },
  { value: "Lease-to-Build", label: "Lease-to-Build" },
  { value: "Development Partner", label: "Development Partner" },
];

// Expected structure type options (for joint-venture)
const EXPECTED_STRUCTURE_TYPE_OPTIONS = [
  { value: "Mini Flats", label: "Mini Flats" },
  { value: "Luxury Duplexes", label: "Luxury Duplexes" },
];

// Timeline options (for joint-venture)
const TIMELINE_OPTIONS = [
  { value: "Ready Now", label: "Ready Now" },
  { value: "In 3 Months", label: "In 3 Months" },
  { value: "Within 1 Year", label: "Within 1 Year" },
];

// Bedroom options
const BEDROOM_OPTIONS = [
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5", label: "5 Bedrooms" },
  { value: "6", label: "6 Bedrooms" },
  { value: "7", label: "7 Bedrooms" },
  { value: "8", label: "8 Bedrooms" },
  { value: "9", label: "9 Bedrooms" },
  { value: "10", label: "10 Bedrooms" },
  { value: "More", label: "More than 10" },
];

// Custom select styles
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "48px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#10B981",
    },
    transition: "all 0.2s ease",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "8px 12px",
    fontSize: "15px",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "15px",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10B981"
      : state.isFocused
        ? "#F3F4F6"
        : "white",
    color: state.isSelected ? "white" : "#374151",
    padding: "10px 12px",
    fontSize: "15px",
    "&:hover": {
      backgroundColor: state.isSelected ? "#10B981" : "#F3F4F6",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 50,
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: "4px",
    borderRadius: "8px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#6B7280",
    "&:hover": {
      color: "#10B981",
    },
  }),
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  preferenceType,
  className = "",
}) => {
  const { state, updateFormData, getValidationErrorsForField } =
    usePreferenceForm();

  // Form state
  const [propertyType, setPropertyType] = useState<Option | null>(null);
  const [buildingType, setBuildingType] = useState<Option | null>(null);
  const [minBedrooms, setMinBedrooms] = useState<Option | null>(null);
  const [minBathrooms, setMinBathrooms] = useState<string>("");
  const [propertyCondition, setPropertyCondition] = useState<Option | null>(
    null,
  );
  const [purpose, setPurpose] = useState<Option | null>(null);
  const [leaseTerm, setLeaseTerm] = useState<Option | null>(null);
  const [jvType, setJvType] = useState<Option | null>(null);
  const [expectedStructureType, setExpectedStructureType] =
    useState<Option | null>(null);
  const [timeline, setTimeline] = useState<Option | null>(null);
  const [minLandSize, setMinLandSize] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [numberOfGuests, setNumberOfGuests] = useState<string>("");
  const [nearbyLandmark, setNearbyLandmark] = useState<string>("");

  // Clear all fields when form is reset or preference type changes
  useEffect(() => {
    const formData = state.formData as any;

    // If formData is empty (form was reset), clear all local state
    if (
      !formData ||
      Object.keys(formData).length === 0 ||
      !formData.propertyDetails
    ) {
      setPropertyType(null);
      setBuildingType(null);
      setMinBedrooms(null);
      setMinBathrooms("");
      setPropertyCondition(null);
      setPurpose(null);
      setLeaseTerm(null);
      setJvType(null);
      setExpectedStructureType(null);
      setTimeline(null);
      setMinLandSize("");
      setBudgetRange("");
      setNumberOfGuests("");
      setNearbyLandmark("");
      return;
    }

    if (formData.propertyDetails) {
      const details = formData.propertyDetails;

      // Common fields
      if (details.propertyType) {
        const option = PROPERTY_TYPE_OPTIONS[preferenceType].find(
          (opt) => opt.value === details.propertyType,
        );
        setPropertyType(option || null);
      }

      if (details.minBedrooms) {
        const option = BEDROOM_OPTIONS.find(
          (opt) => opt.value === details.minBedrooms,
        );
        setMinBedrooms(option || null);
      }

      if (details.propertyCondition) {
        const options =
          PROPERTY_CONDITION_OPTIONS[
            preferenceType as keyof typeof PROPERTY_CONDITION_OPTIONS
          ];
        const option = options?.find(
          (opt) => opt.value === details.propertyCondition,
        );
        setPropertyCondition(option || null);
      }

      if (details.purpose) {
        const options =
          PURPOSE_OPTIONS[preferenceType as keyof typeof PURPOSE_OPTIONS];
        const option = options?.find((opt) => opt.value === details.purpose);
        setPurpose(option || null);
      }

      // Buy specific fields
      if (preferenceType === "buy") {
        if (details.buildingType) {
          const option = BUILDING_TYPE_OPTIONS.find(
            (opt) => opt.value === details.buildingType,
          );
          setBuildingType(option || null);
        }
        setMinBathrooms(details.minBathrooms || "");
      }

      // Rent specific fields
      if (preferenceType === "rent" && details.leaseTerm) {
        const option = LEASE_TERM_OPTIONS.find(
          (opt) => opt.value === details.leaseTerm,
        );
        setLeaseTerm(option || null);
      }

      // Joint venture specific fields
      if (preferenceType === "joint-venture") {
        if (details.jvType) {
          const option = JV_TYPE_OPTIONS.find(
            (opt) => opt.value === details.jvType,
          );
          setJvType(option || null);
        }
        if (details.expectedStructureType) {
          const option = EXPECTED_STRUCTURE_TYPE_OPTIONS.find(
            (opt) => opt.value === details.expectedStructureType,
          );
          setExpectedStructureType(option || null);
        }
        if (details.timeline) {
          const option = TIMELINE_OPTIONS.find(
            (opt) => opt.value === details.timeline,
          );
          setTimeline(option || null);
        }
        setMinLandSize(details.minLandSize || "");
        setBudgetRange(details.budgetRange || "");
      }

      // Shortlet specific fields
      if (preferenceType === "shortlet") {
        setNumberOfGuests(details.numberOfGuests || "");
      }
    }

    // Initialize other fields
    if (formData.nearbyLandmark) {
      setNearbyLandmark(formData.nearbyLandmark);
    } else {
      setNearbyLandmark("");
    }
  }, [state.formData, preferenceType]);

  // Update context when values change
  useEffect(() => {
    switch (preferenceType) {
      case "buy":
        const buyPropertyDetails = {
          propertyType: (propertyType?.value || "") as
            | "Land"
            | "Residential"
            | "Commercial",
          buildingType: (buildingType?.value || "") as
            | "Detached"
            | "Semi-Detached"
            | "Block of Flats",
          minBedrooms:
            minBedrooms?.value === "More"
              ? ("More" as const)
              : parseInt(minBedrooms?.value || "0") || 0,
          minBathrooms: parseInt(minBathrooms) || 0,
          propertyCondition: (propertyCondition?.value || "") as
            | "New"
            | "Renovated"
            | "Any",
          purpose: (purpose?.value || "") as
            | "For living"
            | "Resale"
            | "Development",
        };
        updateFormData({
          propertyDetails: buyPropertyDetails,
          nearbyLandmark,
        });
        break;

      case "rent":
        const rentPropertyDetails = {
          propertyType: (propertyType?.value || "") as
            | "Self-con"
            | "Flat"
            | "Mini Flat"
            | "Bungalow",
          minBedrooms:
            minBedrooms?.value === "More"
              ? ("More" as const)
              : parseInt(minBedrooms?.value || "0") || 0,
          leaseTerm: (leaseTerm?.value || "") as "6 Months" | "1 Year",
          propertyCondition: (propertyCondition?.value || "") as
            | "New"
            | "Renovated",
          purpose: (purpose?.value || "") as "Residential" | "Office",
        };
        updateFormData({
          propertyDetails: rentPropertyDetails,
        });
        break;

      case "joint-venture":
        const developmentDetails = {
          minLandSize: minLandSize || "",
          jvType: (jvType?.value || "") as
            | "Equity Split"
            | "Lease-to-Build"
            | "Development Partner",
          propertyType: (propertyType?.value || "") as
            | "Land"
            | "Old Building"
            | "Structure to demolish",
          expectedStructureType: (expectedStructureType?.value || "") as
            | "Mini Flats"
            | "Luxury Duplexes",
          timeline: (timeline?.value || "") as
            | "Ready Now"
            | "In 3 Months"
            | "Within 1 Year",
          budgetRange: budgetRange
            ? parseFloat(budgetRange.replace(/,/g, ""))
            : undefined,
        };
        updateFormData({
          developmentDetails,
        });
        break;

      case "shortlet":
        const bookingDetails = {
          propertyType: (propertyType?.value || "") as
            | "Studio"
            | "1-Bed Apartment"
            | "2-Bed Flat",
          minBedrooms:
            minBedrooms?.value === "More"
              ? ("More" as const)
              : parseInt(minBedrooms?.value || "0") || 0,
          numberOfGuests: parseInt(numberOfGuests) || 0,
          checkInDate: "", // These need to be set elsewhere in the form
          checkOutDate: "", // These need to be set elsewhere in the form
        };
        updateFormData({
          bookingDetails,
        });
        break;
    }
  }, [
    preferenceType,
    propertyType,
    buildingType,
    minBedrooms,
    minBathrooms,
    propertyCondition,
    purpose,
    leaseTerm,
    jvType,
    expectedStructureType,
    timeline,
    minLandSize,
    budgetRange,
    numberOfGuests,
    nearbyLandmark,
    updateFormData,
  ]);

  // Format number with commas
  const formatNumberWithCommas = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  // Render buy property details
  const renderBuyDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_TYPE_OPTIONS.buy}
            value={propertyType}
            onChange={(selected) => setPropertyType(selected)}
            placeholder="Select property type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Building Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={BUILDING_TYPE_OPTIONS}
            value={buildingType}
            onChange={(selected) => setBuildingType(selected)}
            placeholder="Select building type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Minimum Bedrooms <span className="text-red-500">*</span>
          </label>
          <Select
            options={BEDROOM_OPTIONS}
            value={minBedrooms}
            onChange={(selected) => setMinBedrooms(selected)}
            placeholder="Select bedrooms..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Minimum Bathrooms <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={minBathrooms}
            onChange={(e) => setMinBathrooms(e.target.value)}
            placeholder="Enter number of bathrooms"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Condition <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_CONDITION_OPTIONS.buy}
            value={propertyCondition}
            onChange={(selected) => setPropertyCondition(selected)}
            placeholder="Select condition..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Purpose <span className="text-red-500">*</span>
          </label>
          <Select
            options={PURPOSE_OPTIONS.buy}
            value={purpose}
            onChange={(selected) => setPurpose(selected)}
            placeholder="Select purpose..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Nearby Landmark <span className="text-gray-500">(Optional)</span>
        </label>
        <input
          type="text"
          value={nearbyLandmark}
          onChange={(e) => setNearbyLandmark(e.target.value)}
          placeholder="Enter nearby landmark"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
        />
      </div>
    </div>
  );

  // Render rent property details
  const renderRentDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_TYPE_OPTIONS.rent}
            value={propertyType}
            onChange={(selected) => setPropertyType(selected)}
            placeholder="Select property type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Minimum Bedrooms <span className="text-red-500">*</span>
          </label>
          <Select
            options={BEDROOM_OPTIONS}
            value={minBedrooms}
            onChange={(selected) => setMinBedrooms(selected)}
            placeholder="Select bedrooms..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Lease Term <span className="text-red-500">*</span>
          </label>
          <Select
            options={LEASE_TERM_OPTIONS}
            value={leaseTerm}
            onChange={(selected) => setLeaseTerm(selected)}
            placeholder="Select lease term..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Condition <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_CONDITION_OPTIONS.rent}
            value={propertyCondition}
            onChange={(selected) => setPropertyCondition(selected)}
            placeholder="Select condition..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Purpose <span className="text-red-500">*</span>
        </label>
        <Select
          options={PURPOSE_OPTIONS.rent}
          value={purpose}
          onChange={(selected) => setPurpose(selected)}
          placeholder="Select purpose..."
          styles={customSelectStyles}
          isSearchable
        />
      </div>
    </div>
  );

  // Render joint venture details
  const renderJointVentureDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Minimum Land Size <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={minLandSize}
            onChange={(e) => setMinLandSize(e.target.value)}
            placeholder="e.g., 2 plots, 1000 sqm"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Budget Range <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={budgetRange}
            onChange={(e) =>
              setBudgetRange(formatNumberWithCommas(e.target.value))
            }
            placeholder="Enter investment budget"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Preferred JV Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={JV_TYPE_OPTIONS}
            value={jvType}
            onChange={(selected) => setJvType(selected)}
            placeholder="Select JV type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_TYPE_OPTIONS["joint-venture"]}
            value={propertyType}
            onChange={(selected) => setPropertyType(selected)}
            placeholder="Select property type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Expected Structure Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={EXPECTED_STRUCTURE_TYPE_OPTIONS}
            value={expectedStructureType}
            onChange={(selected) => setExpectedStructureType(selected)}
            placeholder="Select structure type..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Timeline <span className="text-red-500">*</span>
          </label>
          <Select
            options={TIMELINE_OPTIONS}
            value={timeline}
            onChange={(selected) => setTimeline(selected)}
            placeholder="Select timeline..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>
      </div>
    </div>
  );

  // Render shortlet details
  const renderShortletDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Property Type <span className="text-red-500">*</span>
        </label>
        <Select
          options={PROPERTY_TYPE_OPTIONS.shortlet}
          value={propertyType}
          onChange={(selected) => setPropertyType(selected)}
          placeholder="Select property type..."
          styles={customSelectStyles}
          isSearchable
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Minimum Bedrooms <span className="text-red-500">*</span>
          </label>
          <Select
            options={BEDROOM_OPTIONS}
            value={minBedrooms}
            onChange={(selected) => setMinBedrooms(selected)}
            placeholder="Select bedrooms..."
            styles={customSelectStyles}
            isSearchable
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Number of Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(e.target.value)}
            placeholder="Enter number of guests"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Property Details
        </h3>
        <p className="text-sm text-gray-600">
          Specify your property requirements and preferences
        </p>
      </div>

      {preferenceType === "buy" && renderBuyDetails()}
      {preferenceType === "rent" && renderRentDetails()}
      {preferenceType === "joint-venture" && renderJointVentureDetails()}
      {preferenceType === "shortlet" && renderShortletDetails()}
    </div>
  );
};

export default PropertyDetails;
