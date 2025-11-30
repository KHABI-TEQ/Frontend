"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/axiosConfig';
import { Property } from '@/types/property.types';
import GlobalPropertyCard from '@/components/common/property-cards/GlobalPropertyCard';
import GlobalJVPropertyCard from '@/components/common/property-cards/GlobalJVPropertyCard';
import { ClipLoader } from 'react-spinners';

interface MatchDetails {
  _id: string;
  preference: {
    _id: string;
    title: string;
    budget: number;
    location: {
      state: string;
      localGovernment: string;
      area: string;
    };
  };
  buyer: {
    _id: string;
    fullName: string;
    email: string;
    userType: string;
  };
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
 
interface MatchedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  status: string;
  owner: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  carParks: number;
  isPremium: boolean;
  createdAt: string;
}

interface MatchData {
  matchDetails: MatchDetails;
  matchedProperties: MatchedProperty[];
}

interface ApiResponse {
  success: boolean;
  data: MatchData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

const PreferenceMatchesPage: React.FC = () => {
  const params = useParams();
  const preferenceId = params.preferenceId as string;
  const buyerId = params.buyerId as string;

  const [matchData, setMatchData] = useState<MatchData[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [allMatchedProperties, setAllMatchedProperties] = useState<MatchedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const fetchMatchedProperties = async () => {
      if (!preferenceId || !buyerId) {
        setError('Missing preference ID or buyer ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/api/preferences/getMatchedProps/${buyerId}/${preferenceId}`
        );

        if (response.data && response.data.success) {
          const apiData: ApiResponse = response.data;
          setMatchData(apiData.data || []);
          setPagination(apiData.pagination);

          // Extract the first match details for the header
          if (apiData.data && apiData.data.length > 0) {
            setMatchDetails(apiData.data[0].matchDetails);

            // Flatten all matched properties from all matches
            const allProperties = apiData.data.flatMap(match => match.matchedProperties);
            setAllMatchedProperties(allProperties);
          } else {
            setMatchDetails(null);
            setAllMatchedProperties([]);
          }
        } else {
          setMatchData([]);
          setMatchDetails(null);
          setAllMatchedProperties([]);
          setPagination(null);
        }
      } catch (err: any) {
        console.error('Error fetching matched properties:', err);
        setError(err.response?.data?.message || 'Failed to fetch matched properties');
        setMatchData([]);
        setMatchDetails(null);
        setAllMatchedProperties([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedProperties();
  }, [preferenceId, buyerId]);

  const generateCardData = (property: MatchedProperty) => {
    return [
      { header: 'Price', value: property.price ? `₦${Number(property.price).toLocaleString()}` : 'Contact for price' },
      { header: 'Location', value: property.location || 'Location not specified' },
      { header: 'Bedrooms', value: property.bedrooms?.toString() || 'N/A' },
      { header: 'Bathrooms', value: property.bathrooms?.toString() || 'N/A' },
      { header: 'Car Parks', value: property.carParks?.toString() || 'N/A' },
      { header: 'Status', value: property.status || 'Available' },
    ];
  };

  const isJointVenture = (property: MatchedProperty) => {
    return property.title?.toLowerCase().includes('joint') ||
           property.title?.toLowerCase().includes('venture');
  };

  const renderProperty = (property: MatchedProperty, index: number) => {
    const cardData = generateCardData(property);
    const images = property.image ? [{ id: 'main', url: property.image, alt: property.title }] : [];

    // Create a property object compatible with GlobalPropertyCard
    const adaptedProperty = {
      _id: property.id,
      title: property.title,
      location: property.location,
      price: property.price,
      bedroom: property.bedrooms,
      bathroom: property.bathrooms,
      toilet: property.toilets,
      carpark: property.carParks,
      images: images,
      isPremium: property.isPremium,
      status: property.status,
      owner: property.owner,
      createdAt: property.createdAt
    };

    if (isJointVenture(property)) {
      return (
        <GlobalJVPropertyCard
          key={property.id || index}
          property={adaptedProperty as any}
          cardData={cardData}
          images={images}
          isPremium={property.isPremium}
          onPropertyClick={() => {
            // Handle property click navigation if needed
            console.log('Property clicked:', property.id);
          }}
          className="h-full"
        />
      );
    }

    return (
      <GlobalPropertyCard
        key={property.id || index}
        property={adaptedProperty as any}
        cardData={cardData}
        images={images}
        isPremium={property.isPremium}
        onPropertyClick={() => {
          // Handle property click navigation if needed
          console.log('Property clicked:', property.id);
        }}
        className="h-full"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600">Loading matched properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Matches</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Matches</h1>
          {matchDetails ? (
            <div className="space-y-2">
              <p className="text-gray-600">
                Properties matching: <span className="font-semibold">{matchDetails.preference.title}</span>
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Budget: ₦{Number(matchDetails.preference.budget).toLocaleString()}</span>
                <span>Location: {matchDetails.preference.location.area}, {matchDetails.preference.location.localGovernment}, {matchDetails.preference.location.state}</span>
                <span>Status: <span className={`px-2 py-1 rounded-full text-xs ${
                  matchDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  matchDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{matchDetails.status}</span></span>
              </div>
              {matchDetails.notes && (
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  <span className="font-medium">Notes:</span> {matchDetails.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              Properties that match your preferences (Preference ID: {preferenceId})
            </p>
          )}
        </div>

        {/* Content */}
        {allMatchedProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H5m0 0h4m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No matches found</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn&apos;t find any properties that match your current preferences. 
              Try adjusting your criteria or check back later for new listings.
            </p>
          </div>
        ) : (
          <>
            {/* Results count and pagination info */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-700">
                Found <span className="font-semibold">{allMatchedProperties.length}</span> matching properties
                {pagination && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Page {pagination.page} of {pagination.totalPages}, {pagination.total} total)
                  </span>
                )}
              </p>
              {matchData.length > 1 && (
                <p className="text-sm text-blue-600">
                  {matchData.length} preference matches found
                </p>
              )}
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allMatchedProperties.map((property, index) => renderProperty(property, index))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreferenceMatchesPage;
