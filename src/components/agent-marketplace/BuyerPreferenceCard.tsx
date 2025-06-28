'use client';

import React from 'react';

interface BuyerPreference {
  id: string;
  propertyType: string;
  location: {
    state: string;
    lga: string;
    area?: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  transactionType: 'buy' | 'rent' | 'joint-venture';
  createdAt: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface BuyerPreferenceCardProps {
  preference: BuyerPreference;
  isVisible: boolean;
  onClose: () => void;
}

const BuyerPreferenceCard: React.FC<BuyerPreferenceCardProps> = ({
  preference,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'buy': return 'Purchase';
      case 'rent': return 'Rental';
      case 'joint-venture': return 'Joint Venture';
      default: return type;
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50' onClick={onClose}>
      <div 
        className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-[#1E1E1E]'>
            Buyer Preference Details
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Transaction Type & Urgency */}
          <div className='flex items-center gap-3'>
            <span className='px-3 py-1 bg-[#8DDB90] text-white text-sm font-medium rounded-full'>
              {getTransactionTypeLabel(preference.transactionType)}
            </span>
            {preference.urgency && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(preference.urgency)}`}>
                {preference.urgency.charAt(0).toUpperCase() + preference.urgency.slice(1)} Priority
              </span>
            )}
          </div>

          {/* Property Type */}
          <div>
            <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Property Type</h3>
            <p className='text-[#8D9090] bg-gray-50 px-4 py-2 rounded-md'>
              {preference.propertyType}
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Preferred Location</h3>
            <div className='bg-gray-50 px-4 py-3 rounded-md space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm text-gray-600'>State:</span>
                <span className='text-[#1E1E1E]'>{preference.location.state}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm text-gray-600'>LGA:</span>
                <span className='text-[#1E1E1E]'>{preference.location.lga}</span>
              </div>
              {preference.location.area && (
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm text-gray-600'>Area:</span>
                  <span className='text-[#1E1E1E]'>{preference.location.area}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Budget Range</h3>
            <div className='bg-gray-50 px-4 py-3 rounded-md'>
              <div className='flex items-center justify-between'>
                <span className='text-[#8D9090]'>Minimum:</span>
                <span className='font-medium text-[#1E1E1E]'>{formatPrice(preference.priceRange.min)}</span>
              </div>
              <div className='flex items-center justify-between mt-1'>
                <span className='text-[#8D9090]'>Maximum:</span>
                <span className='font-medium text-[#1E1E1E]'>{formatPrice(preference.priceRange.max)}</span>
              </div>
            </div>
          </div>

          {/* Property Specifications */}
          {(preference.bedrooms || preference.bathrooms) && (
            <div>
              <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Property Specifications</h3>
              <div className='bg-gray-50 px-4 py-3 rounded-md grid grid-cols-2 gap-4'>
                {preference.bedrooms && (
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm text-gray-600'>Bedrooms:</span>
                    <span className='text-[#1E1E1E]'>{preference.bedrooms}</span>
                  </div>
                )}
                {preference.bathrooms && (
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm text-gray-600'>Bathrooms:</span>
                    <span className='text-[#1E1E1E]'>{preference.bathrooms}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desired Features */}
          {preference.features && preference.features.length > 0 && (
            <div>
              <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Desired Features</h3>
              <div className='bg-gray-50 px-4 py-3 rounded-md'>
                <div className='flex flex-wrap gap-2'>
                  {preference.features.map((feature, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-white text-[#1E1E1E] text-sm rounded border'
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className='text-lg font-medium text-[#1E1E1E] mb-2'>Request Timeline</h3>
            <p className='text-[#8D9090] bg-gray-50 px-4 py-2 rounded-md'>
              Posted on {new Date(preference.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <p className='text-sm text-[#8D9090] text-center'>
            Ensure your property listing matches this buyer's preferences for better chances of matching.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerPreferenceCard;
