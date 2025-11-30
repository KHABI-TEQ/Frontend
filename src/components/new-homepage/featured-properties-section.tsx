/** @format */

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { EnhancedGlobalPropertyCard, createPropertyCardData } from '@/components/common/property-cards';
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";

interface Property {
  _id: string;
  propertyType: string;
  propertyCondition?: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  briefType: string;
  price: number;
  pictures: string[];
  landSize?: {
    measurementType: string;
    size: number;
  };
  additionalFeatures: {
    noOfBedroom: number;
    noOfBathroom: number;
    noOfToilet: number;
    noOfCarPark: number;
  };
  features: string[];
  docOnProperty: Array<{
    isProvided: boolean;
    _id: string;
    docName: string;
  }>;
  owner: string;
  createdAt: string;
  updatedAt: string;
  isAvailable: string;
  areYouTheOwner: boolean;
  isApproved: boolean;
  description?: string;
  typeOfBuilding?: string;
  isPremium?: boolean;
}

const FeaturedPropertiesSection = () => {
  const { toggleInspectionSelection } = useGlobalPropertyActions();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured properties from new endpoint
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);

        // Check if API base URL is properly configured
        if (!URLS.BASE || URLS.BASE.includes('undefined')) {
          throw new Error('API configuration missing');
        }

        const response = await GET_REQUEST(`${URLS.BASE}/properties/featuredProps`);

        if (response.success && response.data && Array.isArray(response.data)) {
          setProperties(response.data.slice(0, 4)); // Limit to 4 properties
          setError(null); // Clear any previous errors
        } else {
          throw new Error(response.error || 'Invalid response format');
        }

      } catch (err) {
        console.warn('📦 Featured properties API not available - using sample data:', err instanceof Error ? err.message : err);
        // Only show error in console, not to user - fallback gracefully
        setError(null);

      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);


  // Get property type for card data generation
  const getPropertyType = (property: Property) => {
    if (property.briefType === 'Joint Venture') {
      return 'Joint Venture';
    }
    return undefined; // Let createPropertyCardData determine from briefType
  };

  // Handle property click to navigate to property details
  const handlePropertyClick = (property: Property) => {
    const marketType = property.briefType.toLowerCase().includes('sale') ? 'buy' : 
                      property.briefType.toLowerCase().includes('rent') ? 'rent' : 
                      property.briefType.toLowerCase().replace(/\s+/g, '-');
    window.open(`/property/${marketType}/${property._id}`, '_blank');
  };

  if (loading) {
    return (
      <section className='w-full py-16 md:py-24 bg-[#FFFEFB]'>
        <div className='container mx-auto px-4 md:px-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DDB90] mx-auto'></div>
            <p className='text-gray-600 mt-4'>Loading featured properties...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='w-full py-16 md:py-24 bg-[#FFFEFB]'>
      <div className='container mx-auto px-4 md:px-8'>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#09391C] mb-6 font-display'>
            Featured Properties
          </h2>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
            Discover hand-picked properties from our marketplace that match various needs and budgets.
          </p>
        </motion.div>

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center'>
            {properties.map((property, index) => {
              const cardData = createPropertyCardData(property, getPropertyType(property));
              const isJVProperty = property.briefType === 'Joint Venture';

              return (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="w-full max-w-[320px]">
                  
                  <EnhancedGlobalPropertyCard
                    type={isJVProperty ? "jv" : "standard"}
                    tab={isJVProperty ? undefined : property.briefType.toLowerCase().includes('rent') ? 'rent' : 'buy'}
                    property={property}
                    cardData={cardData}
                    images={property.pictures}
                    isPremium={property.isPremium || false}
                    onPropertyClick={() => handlePropertyClick(property)}
                    onInspectionToggle={() => {
                      const sourceTab = isJVProperty ? "jv" : (property.briefType.toLowerCase().includes('rent') ? 'rent' : 'buy') as any;
                      toggleInspectionSelection(property, sourceTab, "home-page");
                    }}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='text-gray-600 mb-4'>No featured properties available at the moment.</p>
          </div>
        )}

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='text-center mt-12'>
          <Link href="/market-place">
            <button className='bg-white border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl'>
              View More Properties
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
