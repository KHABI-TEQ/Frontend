"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import Loading from "@/components/loading-component/loading";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, DollarSign, Home, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { EnhancedGlobalPropertyCard, createPropertyCardData } from "@/components/common/property-cards";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";

interface MatchDetails {
  _id: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Preference {
  _id: string;
  buyer: string;
  preferenceType: string;
  location: {
    state: string;
    localGovernmentAreas: string[];
  };
  budget: {
    minPrice: number;
    maxPrice: number;
  };
  bedroom: number;
  bathroom: number;
  type: string;
  documentType: string[];
  desireFeature: string[];
  tenantCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

interface MatchedProperty {
  id: string;
  _id?: string;
  image: string;
  owner: {
    id: string;
    fullName: string;
  };
  propertyType: string;
  propertyCategory: string;
  propertyCondition: string;
  typeOfBuilding: string;
  rentalType: string;
  shortletDuration: string;
  holdDuration: string;
  price: number;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  landSize: {
    measurementType: string;
    size: number;
  };
  docOnProperty: {
    isProvided: boolean;
    _id: string;
    docName: string;
  }[];
  areYouTheOwner: boolean;
  features: string[];
  tenantCriteria: string[];
  additionalFeatures: {
    noOfBedrooms: number;
    noOfBathrooms: number;
    noOfToilets: number;
    noOfCarParks: number;
  };
  jvConditions: string[];
  shortletDetails: {
    streetAddress: string;
    maxGuests: number;
    availability: {
      minStay: number;
    };
    pricing: {
      nightly: number;
      weeklyDiscount: number;
    };
    houseRules: {
      checkIn: string;
      checkOut: string;
    };
  };
  pictures: string[];
  videos: string[];
  description: string;
  additionalInfo: string;
  isTenanted: string;
  isAvailable: string;
  status: string;
  reason: string;
  briefType: string;
  isPremium: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isDeleted: boolean;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  matchedId: string;
}

interface MatchedPropertiesData {
  matchDetails: MatchDetails;
  preference: Preference;
  matchedProperties: MatchedProperty[];
}

const MatchedPropertiesPage = () => {
  const router = useRouter();
  const params = useParams();
  const { matchedId, preferenceId } = params;
  const { toggleInspectionSelection } = useGlobalPropertyActions();

  const [data, setData] = useState<MatchedPropertiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(8); // 2 rows of 4 properties each

  useEffect(() => {
    const fetchMatchedProperties = async () => {
      try {
        setLoading(true);
        const response = await GET_REQUEST(`${URLS.BASE}/properties/${matchedId}/${preferenceId}/matches`);

        if (response?.success) {
          setData(response.data as any);
        } else {
          setError(response?.error || "Failed to fetch matched properties");
          toast.error("Failed to load matched properties");
        }
      } catch (error) {
        console.error("Error fetching matched properties:", error);
        setError("An error occurred while fetching data");
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (matchedId && preferenceId) {
      fetchMatchedProperties();
    }
  }, [matchedId, preferenceId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Failed to load data"}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#8DDB90] text-white px-6 py-2 rounded-lg hover:bg-[#7BC87F] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { matchDetails, preference, matchedProperties } = data;

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#09391C] hover:text-[#8DDB90] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Previous Page</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-3xl font-bold text-[#09391C] font-display mb-2">
              Matched Properties
            </h1>
            <p className="text-[#5A5D63] text-lg">
              Properties matching your preferences • {matchedProperties.length} match{matchedProperties.length !== 1 ? 'es' : ''} found
            </p>
          </div>
        </div>

        {/* Match Details Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#09391C] mb-4">Match Summary</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Match Status</p>
                <p className="font-medium capitalize">{matchDetails.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(matchDetails.updatedAt)}</p>
              </div>
            </div>
          </div>
          {matchDetails.notes && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Notes:</strong> {matchDetails.notes}
              </p>
            </div>
          )}
        </motion.div>

        {/* Preference Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-[#09391C] mb-6">Your Preference Details</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium text-gray-900">{preference.location.state}</p>
                <p className="text-sm text-gray-600">
                  {preference.location.localGovernmentAreas.join(", ")}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Budget Range</p>
                <p className="font-medium text-gray-900">
                  {formatPrice(preference.budget.minPrice)} - {formatPrice(preference.budget.maxPrice)}
                </p>
                <p className="text-sm text-gray-600 capitalize">{preference.preferenceType}</p>
              </div>
            </div>

            {/* Property Details */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Home size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Property Requirements</p>
                <p className="font-medium text-gray-900 capitalize">{preference.type}</p>
                <p className="text-sm text-gray-600">
                  {preference.bedroom} beds • {preference.bathroom} baths
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {/* Documents */}
            {preference.documentType && preference.documentType.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {preference.documentType.map((doc, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Desired Features */}
            {preference.desireFeature && preference.desireFeature.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Desired Features</h3>
                <div className="flex flex-wrap gap-2">
                  {preference.desireFeature.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tenant Criteria */}
          {preference.tenantCriteria && preference.tenantCriteria.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Tenant Criteria</h3>
              <div className="flex flex-wrap gap-2">
                {preference.tenantCriteria.map((criteria, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200"
                  >
                    {criteria}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Matched Properties Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#09391C]">
              Matched Properties ({matchedProperties.length})
            </h2>
            {matchedProperties.length > propertiesPerPage && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(matchedProperties.length / propertiesPerPage)}
              </div>
            )}
          </div>

          {matchedProperties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">
                No properties currently match your preferences. Check back later for new listings.
              </p>
            </div>
          ) : (
            <>
              {/* Properties Grid - 4 columns, minimal gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {matchedProperties
                  .slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage)
                  .map((property, index) => {
                    // Transform the property data to match the expected format
                    const transformedProperty = {
                      _id: property.id,
                      id: property.id,
                      price: property.price,
                      title: property.description || `${property.propertyType} in ${property.location.area}`,
                      description: property.description,
                      additionalFeatures: property.additionalFeatures,
                      location: {
                        state: property.location.state,
                        lga: property.location.localGovernment,
                        area: property.location.area
                      },
                      propertyType: property.propertyType,
                      briefType: property.briefType,
                      isPremium: property.isPremium
                    };

                    // Create card data using the helper function
                    const cardData = createPropertyCardData(property);

                    // Transform images data
                    const images = property.pictures?.map((picture, idx) => ({
                      id: `${property.id}-${idx}`,
                      url: picture,
                      alt: `Property image ${idx + 1}`
                    })) || [];

                    return (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="w-full"
                      >
                        <EnhancedGlobalPropertyCard
                          type="standard"
                          tab="buy"
                          property={transformedProperty}
                          cardData={cardData}
                          images={images}
                          isPremium={property.isPremium}
                          onPropertyClick={() => {
                            const marketType = property.briefType === "Outright Sales" ? "buy" : "rent";
                            router.push(`/property/${marketType}/${property.id}`);
                          }}
                          onInspectionToggle={() => {
                            // Tag selection with matched-properties source and meta
                            toggleInspectionSelection(
                              transformedProperty,
                              "buy",
                              "matched-properties",
                              { matchedId: String(matchedId), preferenceId: String(preferenceId) }
                            );
                          }}
                          className="w-full h-full"
                        />
                      </motion.div>
                    );
                  })}
              </div>

              {/* Pagination */}
              {matchedProperties.length > propertiesPerPage && (
                <div className="flex items-center justify-center mt-8 space-x-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-2">
                    {Array.from({ length: Math.ceil(matchedProperties.length / propertiesPerPage) }, (_, i) => i + 1)
                      .slice(
                        Math.max(0, currentPage - 3),
                        Math.min(Math.ceil(matchedProperties.length / propertiesPerPage), currentPage + 2)
                      )
                      .map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            pageNum === currentPage
                              ? 'bg-[#8DDB90] border-[#8DDB90] text-white'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(matchedProperties.length / propertiesPerPage)))}
                    disabled={currentPage === Math.ceil(matchedProperties.length / propertiesPerPage)}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      currentPage === Math.ceil(matchedProperties.length / propertiesPerPage)
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MatchedPropertiesPage;
