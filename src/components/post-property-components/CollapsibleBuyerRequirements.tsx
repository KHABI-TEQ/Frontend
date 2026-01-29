"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, DollarSign, Home, CheckCircle } from "lucide-react";

interface PropertyDetails {
  purpose?: string;
  propertyType?: string;
  buildingType?: string;
  minBedrooms?: string;
  minBathrooms?: number;
  propertyCondition?: string;
  landSize?: string;
  minLandSize?: string;
  maxLandSize?: string;
  measurementUnit?: string;
  documentTypes?: string[];
}

interface BookingDetails {
  propertyType?: string;
  minBedrooms?: string;
  minBathrooms?: number;
  numberOfGuests?: number;
  checkInDate?: string;
  checkOutDate?: string;
  travelType?: string;
  preferredCheckInTime?: string;
  preferredCheckOutTime?: string;
}

interface Features {
  baseFeatures?: string[];
  premiumFeatures?: string[];
  autoAdjustToFeatures?: boolean;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  willingToPayExtra?: boolean;
  additionalRequests?: string;
}

interface Location {
  state: string;
  localGovernmentAreas?: string[];
  lgasWithAreas?: Array<{
    lgaName: string;
    areas: string[];
  }>;
  customLocation?: string;
}

interface Budget {
  minPrice: number;
  maxPrice: number;
  currency: string;
}

interface Preference {
  preferenceType: string;
  preferenceMode: string;
  location: Location;
  budget: Budget;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  features?: Features;
  contactInfo?: ContactInfo;
  nearbyLandmark?: string;
  additionalNotes?: string;
  buyer?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

interface CollapsibleBuyerRequirementsProps {
  preference: Preference;
}

export const CollapsibleBuyerRequirements: React.FC<CollapsibleBuyerRequirementsProps> = ({ preference }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    location: false,
    details: false,
    features: false,
    contact: false,
    additional: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getPreferenceTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      buy: "Looking to Buy",
      rent: "Looking to Rent",
      shortlet: "Looking for Shortlet",
      "joint-venture": "Joint Venture Partner",
    };
    return typeMap[type] || type;
  };

  const renderSection = (
    title: string,
    sectionKey: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-[#8DDB90]">{icon}</div>
            <h3 className="text-lg font-semibold text-[#09391C]">{title}</h3>
          </div>
          <div className="text-[#8DDB90]">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 bg-gray-50">
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border-l-4 border-[#8DDB90] overflow-hidden">
      {/* Basic Information Section */}
      {renderSection(
        "Preference Requirements",
        "basic",
        <Home size={20} />,
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Preference Type</span>
            <span className="font-semibold text-[#09391C]">
              {getPreferenceTypeLabel(preference.preferenceType)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Preference Mode</span>
            <span className="font-semibold text-[#09391C] capitalize">
              {preference.preferenceMode}
            </span>
          </div>
        </div>
      )}

      {/* Budget Section */}
      {renderSection(
        "Budget & Pricing",
        "budget",
        <DollarSign size={20} />,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Minimum Price</span>
            <span className="font-semibold text-[#09391C]">
              {preference.budget?.minPrice
                ? `₦${preference.budget.minPrice.toLocaleString()}`
                : "Not specified"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Maximum Price</span>
            <span className="font-semibold text-[#09391C]">
              {preference.budget?.maxPrice
                ? `₦${preference.budget.maxPrice.toLocaleString()}`
                : "Not specified"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Currency</span>
            <span className="font-semibold text-[#09391C]">
              {preference.budget?.currency || "NGN"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">Average Budget</span>
            <span className="font-semibold text-[#09391C]">
              {preference.budget?.minPrice && preference.budget?.maxPrice
                ? `₦${Math.round((preference.budget.minPrice + preference.budget.maxPrice) / 2).toLocaleString()}`
                : "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Location Section */}
      {renderSection(
        "Location Preferences",
        "location",
        <MapPin size={20} />,
        <div className="space-y-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600 font-medium mb-1">State</span>
            <span className="font-semibold text-[#09391C]">
              {preference.location?.state || "Not specified"}
            </span>
          </div>
          
          {preference.location?.localGovernmentAreas && 
            preference.location.localGovernmentAreas.length > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-2">Local Government Areas</span>
              <div className="flex flex-wrap gap-2">
                {preference.location.localGovernmentAreas.map((lga, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#EEF1F1] text-[#09391C] rounded-full text-xs font-medium"
                  >
                    {lga}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preference.location?.lgasWithAreas && 
            preference.location.lgasWithAreas.length > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-2">Areas by LGA</span>
              <div className="space-y-3">
                {preference.location.lgasWithAreas.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-[#8DDB90] pl-3">
                    <span className="font-medium text-[#09391C] block mb-1">
                      {item.lgaName}
                    </span>
                    {item.areas && item.areas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.areas.map((area, areaIdx) => (
                          <span
                            key={areaIdx}
                            className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">All areas</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {preference.location?.customLocation && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-1">Custom Location</span>
              <span className="font-semibold text-[#09391C]">
                {preference.location.customLocation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Property Details Section */}
      {(preference.propertyDetails || preference.bookingDetails) && renderSection(
        preference.preferenceType === "shortlet" ? "Shortlet Requirements" : "Property Requirements",
        "details",
        <Home size={20} />,
        <div className="space-y-4 text-sm">
          {preference.propertyDetails && (
            <>
              {preference.propertyDetails.propertyType && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Property Type</span>
                  <span className="font-semibold text-[#09391C] capitalize">
                    {preference.propertyDetails.propertyType}
                  </span>
                </div>
              )}
              
              {preference.propertyDetails.buildingType && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Building Type</span>
                  <span className="font-semibold text-[#09391C] capitalize">
                    {preference.propertyDetails.buildingType}
                  </span>
                </div>
              )}

              {preference.propertyDetails.minBedrooms && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Minimum Bedrooms</span>
                  <span className="font-semibold text-[#09391C]">
                    {preference.propertyDetails.minBedrooms}
                  </span>
                </div>
              )}

              {preference.propertyDetails.minBathrooms !== undefined && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Minimum Bathrooms</span>
                  <span className="font-semibold text-[#09391C]">
                    {preference.propertyDetails.minBathrooms}
                  </span>
                </div>
              )}

              {preference.propertyDetails.propertyCondition && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Property Condition</span>
                  <span className="font-semibold text-[#09391C] capitalize">
                    {preference.propertyDetails.propertyCondition}
                  </span>
                </div>
              )}

              {preference.propertyDetails.purpose && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Purpose</span>
                  <span className="font-semibold text-[#09391C] capitalize">
                    {preference.propertyDetails.purpose}
                  </span>
                </div>
              )}

              {(preference.propertyDetails.landSize || 
                preference.propertyDetails.minLandSize || 
                preference.propertyDetails.maxLandSize) && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Land Size</span>
                  <div className="space-y-1">
                    {preference.propertyDetails.minLandSize && (
                      <span className="block font-semibold text-[#09391C]">
                        Min: {preference.propertyDetails.minLandSize} {preference.propertyDetails.measurementUnit}
                      </span>
                    )}
                    {preference.propertyDetails.maxLandSize && (
                      <span className="block font-semibold text-[#09391C]">
                        Max: {preference.propertyDetails.maxLandSize} {preference.propertyDetails.measurementUnit}
                      </span>
                    )}
                    {preference.propertyDetails.landSize && !preference.propertyDetails.minLandSize && (
                      <span className="block font-semibold text-[#09391C]">
                        {preference.propertyDetails.landSize} {preference.propertyDetails.measurementUnit}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {preference.propertyDetails.documentTypes && 
                preference.propertyDetails.documentTypes.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-2">Document Types</span>
                  <div className="flex flex-wrap gap-2">
                    {preference.propertyDetails.documentTypes.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {preference.bookingDetails && (
            <>
              {preference.bookingDetails.numberOfGuests && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Number of Guests</span>
                  <span className="font-semibold text-[#09391C]">
                    {preference.bookingDetails.numberOfGuests}
                  </span>
                </div>
              )}

              {preference.bookingDetails.checkInDate && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Check-in Date</span>
                  <span className="font-semibold text-[#09391C]">
                    {new Date(preference.bookingDetails.checkInDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {preference.bookingDetails.checkOutDate && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Check-out Date</span>
                  <span className="font-semibold text-[#09391C]">
                    {new Date(preference.bookingDetails.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {preference.bookingDetails.travelType && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Travel Type</span>
                  <span className="font-semibold text-[#09391C] capitalize">
                    {preference.bookingDetails.travelType}
                  </span>
                </div>
              )}

              {preference.bookingDetails.preferredCheckInTime && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Preferred Check-in Time</span>
                  <span className="font-semibold text-[#09391C]">
                    {preference.bookingDetails.preferredCheckInTime}
                  </span>
                </div>
              )}

              {preference.bookingDetails.preferredCheckOutTime && (
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Preferred Check-out Time</span>
                  <span className="font-semibold text-[#09391C]">
                    {preference.bookingDetails.preferredCheckOutTime}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Features Section */}
      {preference.features && 
        (preference.features.baseFeatures?.length || preference.features.premiumFeatures?.length) && 
        renderSection(
        "Features & Amenities",
        "features",
        <CheckCircle size={20} />,
        <div className="space-y-4 text-sm">
          {preference.features.baseFeatures && preference.features.baseFeatures.length > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-2">Base Features</span>
              <div className="flex flex-wrap gap-2">
                {preference.features.baseFeatures.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preference.features.premiumFeatures && preference.features.premiumFeatures.length > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-2">Premium Features</span>
              <div className="flex flex-wrap gap-2">
                {preference.features.premiumFeatures.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preference.features.autoAdjustToFeatures && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
              <CheckCircle size={16} className="text-yellow-600" />
              <span className="text-yellow-700 font-medium text-xs">
                Auto-adjust to Features Budget
              </span>
            </div>
          )}
        </div>
      )}


      {/* Additional Information Section */}
      {(preference.nearbyLandmark || preference.additionalNotes) && renderSection(
        "Additional Information",
        "additional",
        <CheckCircle size={20} />,
        <div className="space-y-4 text-sm">
          {preference.nearbyLandmark && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-1">Nearby Landmark</span>
              <span className="font-semibold text-[#09391C] bg-gray-50 p-3 rounded">
                {preference.nearbyLandmark}
              </span>
            </div>
          )}

          {preference.additionalNotes && (
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium mb-1">Additional Notes</span>
              <span className="text-[#09391C] bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {preference.additionalNotes}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleBuyerRequirements;
