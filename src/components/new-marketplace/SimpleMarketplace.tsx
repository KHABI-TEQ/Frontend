"use client";
import React, { useState, useEffect } from 'react';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';
import { EnhancedGlobalPropertyCard, createPropertyCardData } from '@/components/common/property-cards';

interface Property {
  _id: string;
  propertyType: string;
  price: number;
  noOfBedrooms?: number;
  noOfBathrooms?: number;
  noOfToilets?: number;
  noOfCarParks?: number;
  location?: {
    state: string;
    localGovernment: string;
    area?: string;
  };
  pictures?: string[];
  images?: string[];
  isPremium?: boolean;
  additionalFeatures?: {
    noOfBedrooms?: number;
    noOfBathrooms?: number;
    noOfToilets?: number;
    noOfCarParks?: number;
  };
}

const SimpleMarketplace = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'shortlet' | 'jv'>('buy');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabMapping = {
    buy: 'Outright Sales',
    rent: 'Rent', 
    shortlet: 'Shortlet',
    jv: 'Joint Venture'
  };

  const fetchProperties = async (tab: typeof activeTab) => {
    setLoading(true);
    setError('');
    
    try {
      const briefType = tabMapping[tab];
      const url = `${URLS.BASE}${URLS.propertyBaseUrl}/all?briefType=${encodeURIComponent(briefType)}&page=1&limit=12`;
      console.log('Fetching from:', url);
      
      const response = await GET_REQUEST(url);
      console.log('Response:', response);
      
      if (response?.success && response?.data) {
        setProperties((response.data as any) || []);
      } else {
        setError('Failed to load properties');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(activeTab);
  }, [activeTab]);



  const handlePropertyClick = (property: Property) => {
    window.open(`/property/${activeTab}/${property._id}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex space-x-4 border-b">
        {Object.keys(tabMapping).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-[#09391C] border-b-2 border-[#09391C]'
                : 'text-gray-500 hover:text-[#09391C]'
            }`}
          >
            {tab === 'jv' ? 'Joint Venture' : tab}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="text-sm text-gray-600">
        {loading && 'Loading properties...'}
        {!loading && properties.length > 0 && `${properties.length} properties found`}
        {!loading && properties.length === 0 && !error && 'No properties found'}
        {error && <span className="text-red-600">Error: {error}</span>}
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#8DDB90] border-opacity-20 rounded-full border-t-[#8DDB90] animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProperties(activeTab)}
            className="px-4 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#76c77a]"
          >
            Try Again
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No properties found for {activeTab}</p>
          <button 
            onClick={() => fetchProperties(activeTab)}
            className="px-4 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#76c77a]"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => {
            const cardData = createPropertyCardData(property, tabMapping[activeTab]);
            const isJVProperty = activeTab === 'jv';

            return (
              <EnhancedGlobalPropertyCard
                key={property._id}
                type={isJVProperty ? "jv" : "standard"}
                tab={isJVProperty ? "buy" : activeTab as "buy" | "rent" | "shortlet"}
                property={property}
                cardData={cardData}
                images={property.pictures || property.images || []}
                isPremium={property.isPremium || false}
                onPropertyClick={() => handlePropertyClick(property)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimpleMarketplace;
