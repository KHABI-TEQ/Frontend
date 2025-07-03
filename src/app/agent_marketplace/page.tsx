"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faMagnifyingGlass, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { archivo } from '@/styles/font';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { toast } from 'react-hot-toast';
import Loading from '@/components/loading-component/loading';

const AgentMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [developerPreference, setDeveloperPreference] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [propertyCondition, setPropertyCondition] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Backend pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const limit = 8; // Items per page

  // Fetch buyer preferences from API with pagination and filters
  useEffect(() => {
    const fetchBuyerPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Build query params from filters
        const params = new URLSearchParams();
        params.append('page', String(currentPage));
        params.append('limit', String(limit));
        if (searchTerm) params.append('locationSearch', searchTerm);
        if (propertyCondition) params.append('propertyCondition', propertyCondition);
        if (documentType) params.append('documents', documentType);
        // developerPreference: buy/rent/joint-venture
        if (developerPreference) {
          if (developerPreference === 'buy') params.append('preferenceType', 'buy');
          else if (developerPreference === 'rent') params.append('preferenceType', 'rent');
          // add more if needed
        }
        // Add more filters as needed (budgetMin, budgetMax, features, propertyType, propertyCondition, noOfBedrooms, noOfBathrooms)
        // Example: if you add more filter states, append them here

        const url = `${process.env.NEXT_PUBLIC_API_URL}/agent/all-preferences?${params.toString()}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle the backend response structure
        if (data && data.data && Array.isArray(data.data)) {
          const preferences = data.data;
          console.log('Found preferences:', preferences.length);
          
          const transformedProperties = preferences.map((pref: any) => ({
            id: pref._id || pref.id,
            type: pref.preferenceType === 'buy' ? 'Outright sales' : 
                  pref.preferenceType === 'rent' ? 'Rent' : 'Joint venture(VJ)',
            location: pref.location ? 
              `${pref.location.state || ''}, ${pref.location.localGovernment || ''}`.trim().replace(/^,|,$/, '') : 'N/A',
            priceRange: pref.budgetMin && pref.budgetMax ? 
              `₦${pref.budgetMin.toLocaleString('en-US')} - ₦${pref.budgetMax.toLocaleString('en-US')}` : 
              pref.budgetMin ? `₦${pref.budgetMin.toLocaleString('en-US')}` : 'N/A',
            landSize: pref.landSize ? `${pref.landSize}${pref.measurementType || ''}` : '',
            document: pref.documents?.join(', ') || 'N/A',
            status: pref.status || 'active',
            building: pref.propertyCondition || '',
            bedroom: pref.noOfBedrooms ? pref.noOfBedrooms.toString() : '',
            bathroom: pref.noOfBathrooms ? pref.noOfBathrooms.toString() : '',
            propertyType: pref.propertyType || 'Residential',
            features: pref.features || [],
            dateCreated: pref.createdAt ? new Date(pref.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }) : 'N/A',
            additionalInfo: pref.additionalInfo || '',
            buyer: pref.buyer || null,
          }));

          setProperties(transformedProperties);
          
          // Set pagination info from backend response
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || transformedProperties.length);
          
          // Filter matched properties from current page
          const matched = transformedProperties.filter((prop: any) => prop.status === 'matched');
          setMatchedProperties(matched);
          
        } else {
          console.log('No data received from API or unexpected format');
          console.log('Response structure:', data);
          setError('No buyer preferences found');
          setProperties([]);
          setMatchedProperties([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error fetching buyer preferences:', error);
        setError(`Failed to load buyer preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setProperties([]);
        setMatchedProperties([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
        setIsPaginationLoading(false);
      }
    };

    fetchBuyerPreferences();
  }, [currentPage, limit, searchTerm ?? '', documentType ?? '', propertyCondition ?? '', developerPreference ?? '']); // Always same length

  const handleSearch = () => {
    // Reset to first page when searching/filters change
    setCurrentPage(1);
    // The useEffect will re-run with the latest filter states
    // Optionally, you can add more logic here if you want to debounce or validate
    console.log('Search triggered with filters:', {
      searchTerm,
      documentType,
      propertyCondition,
      developerPreference
    });
  };

  type Property = {
    id?: number | string;
    type?: string;
    location?: string;
    priceRange?: string;
    landSize?: string;
    document?: string;
    status?: string;
    isMatched?: boolean;
    building?: string;
    bedroom?: string;
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-sm p-2 shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Property Details Table */}
      <div className="bg-[#F7F7F9] flex-1">
        <table className="w-full border-collapse h-full">
          <tbody className=' '>
            <tr className=" border-gray-200">
              <td className="py-2 px-4 text-gray-500 text-base font-normal w-1/2">Type</td>
              <td className="py-2 px-4 text-black text-base font-bold text-right">{property.type || 'N/A'}</td>
            </tr>
            
            {/* Always show Building row, even if empty */}
            {(property.building || property.type === 'Rent') && (
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 text-gray-500 text-base font-normal">Building</td>
                <td className="py-2 px-4 text-black text-base font-bold text-right">{property.building || ''}</td>
              </tr>
            )}
            
            <tr className="border-b border-gray-200">
              <td className="py-2 px-4 text-gray-500 text-base font-normal">Location</td>
              <td className="py-2 px-4 text-black text-base font-bold text-right">{property.location || 'N/A'}</td>
            </tr>
            
            {/* Always show Bedroom row for Rent type */}
            {(property.bedroom || property.type === 'Rent') && (
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 text-gray-500 text-base font-normal">Bedroom</td>
                <td className="py-2 px-4 text-black text-base font-bold text-right">{property.bedroom || ''}</td>
              </tr>
            )}
            
            <tr className="border-b border-gray-200">
              <td className="py-2 px-4 text-gray-500 text-base font-normal">Price Range</td>
              <td className="py-2 px-4 text-black text-base font-bold text-right">{property.priceRange || 'N/A'}</td>
            </tr>
            
            {/* Always show Land size row, even if empty for some types */}
            {(property.landSize || property.type !== 'Rent') && (
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 text-gray-500 text-base font-normal">Land size</td>
                <td className="py-2 px-4 text-black text-base font-bold text-right">{property.landSize || ''}</td>
              </tr>
            )}
            
            <tr>
              <td className="py-2 px-4 text-gray-500 text-base font-normal">Document</td>
              <td className="py-2 px-4 text-black text-base font-bold text-right">{property.document || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* View More Button - Fixed Position */}
      <div className="bg-[#F7F7F9] py-4 text-center border-t border-gray-200">
        <button 
          onClick={() => router.push(`/agent_marketplace/${property.id}`)}
          className="text-black text-base font-medium underline hover:no-underline cursor-pointer"
        >
          View more
        </button>
      </div>

      {/* Status and Action Button */}
      <div className="bg-white py-6 text-center">
        {/* <div className="text-blue-500 text-base font-normal mb-4">
          {property.status || 'active'}
        </div> */}
        <div className="px-2">
          <button 
            onClick={() => router.push(`/agent_marketplace/${property.id}`)}
            className="bg-[#8DDB90] hover:bg-[#7BC97F] text-white py-3 text-base font-medium w-full rounded cursor-pointer"
          >
            Yes I have
          </button>
        </div>
      </div>
    </div>
  );

  // Add MatchedCard component
  const MatchedCard = ({ property }: { property: any }) => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
      <div className="space-y-2">
        <div className="flex justify-between bg-[#F7F7F9] p-3 items-center">
          <span className="text-gray-500 text-sm font-normal">Type</span>
          <span className="text-black text-sm font-bold">{property.type}</span>
        </div>
        <div className="flex justify-between bg-[#F7F7F9] p-3 items-center">
          <span className="text-gray-500 text-sm font-normal">Location</span>
          <span className="text-black text-sm font-bold">{property.location}</span>
        </div>
        <div className="text-center pt-2">
          <span className="text-green-500 text-sm font-medium">{property.status}</span>
        </div>
      </div>
    </div>
  );

  // Add matched properties dummy data (this will be replaced by API data)
  const getMatchedProperties = () => {
    if (matchedProperties.length > 0) {
      return matchedProperties;
    }
    // Fallback matched properties if none from API
    return [
      {
        id: 'match1',
        type: 'Joint venture(VJ)',
        location: 'Lagos, Ikeja',
        status: 'Matched'
      },
      {
        id: 'match2',
        type: 'Rent',
        location: 'Lagos, Ikeja',
        status: 'Matched'
      },
      {
        id: 'match3',
        type: 'Joint venture(VJ)',
        location: 'Lagos, Ikeja',
        status: 'Matched'
      },
      {
        id: 'match4',
        type: 'Outright sales',
        location: 'Lagos, Ikeja',
        status: 'Matched'
      }
    ];
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>•</span>
            <span className="text-gray-900">agent marketplace</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className={`font-display text-4xl font-extrabold text-[#09391C] mb-2`}>Agent Marketplace</h1>
          <p className="text-gray-600">Connect with Serious Buyers—Submit Now.</p>
        </div>

 {/* Matched Properties Section */}
        <div className="bg-[#e2efe2] rounded-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className={`font-display text-xl font-semibold text-[#09391C]`}>
              Buyers just got matched. Submit now to get featured.
            </h2>
          </div>
          
          {/* Matched Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getMatchedProperties().map((property, idx) => (
              <MatchedCard key={property.id || property._id || `matched-${idx}`} property={property} />
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter state, lga, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-3 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={developerPreference}
              onChange={(e) => setDeveloperPreference(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Developer preference</option>
              <option value="buy">Buyer Preferences</option>
              <option value="rent">Tenant Preferences</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Document Type</option>
              <option value="C of O">C of O</option>
              <option value="Deed of assignments">Deed of assignments</option>
              <option value="Receipt">Receipt</option>
              <option value="Government consent">Government consent</option>
              <option value="Land certificate">Land certificate</option>
              <option value="Register deed of conveyance">Register deed of conveyance</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={propertyCondition}
              onChange={(e) => setPropertyCondition(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Property Condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Good Condition">Good Condition</option>
              <option value="Needs Renovation">Needs Renovation</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

        

          <button 
            onClick={handleSearch}
            className="px-8 py-3 bg-green-400 hover:bg-green-500 text-white rounded-lg font-medium"
          >
            Search
          </button>
        </div>

       
        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <Loading />
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Retry
              </button>
            </div>
          ) : properties.length > 0 ? (
            properties.map((property: any, idx: number) => (
              <PropertyCard key={property.id || property._id || idx} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No properties found</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => {
                setIsPaginationLoading(true);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1 || isPaginationLoading}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {/* Smart Pagination: show first, last, current, +/-2, and ellipsis */}
            {(() => {
              const pageButtons = [];
              const windowSize = 2; // how many pages to show around current
              let start = Math.max(2, currentPage - windowSize);
              let end = Math.min(totalPages - 1, currentPage + windowSize);
              if (currentPage <= 3) {
                start = 2;
                end = Math.min(5, totalPages - 1);
              }
              if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 4);
                end = totalPages - 1;
              }
              // Always show first page
              pageButtons.push(
                <button
                  key={1}
                  onClick={() => {
                    if (currentPage !== 1) {
                      setIsPaginationLoading(true);
                      setCurrentPage(1);
                    }
                  }}
                  disabled={isPaginationLoading}
                  className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-green-400 text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50`}
                >
                  1
                </button>
              );
              // Ellipsis if needed
              if (start > 2) {
                pageButtons.push(<span key="start-ellipsis" className="px-2">...</span>);
              }
              // Middle page numbers
              for (let i = start; i <= end; i++) {
                pageButtons.push(
                  <button
                    key={i}
                    onClick={() => {
                      if (currentPage !== i) {
                        setIsPaginationLoading(true);
                        setCurrentPage(i);
                      }
                    }}
                    disabled={isPaginationLoading}
                    className={`px-3 py-1 rounded border ${currentPage === i ? 'bg-green-400 text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50`}
                  >
                    {i}
                  </button>
                );
              }
              // Ellipsis if needed
              if (end < totalPages - 1) {
                pageButtons.push(<span key="end-ellipsis" className="px-2">...</span>);
              }
              // Always show last page if more than 1
              if (totalPages > 1) {
                pageButtons.push(
                  <button
                    key={totalPages}
                    onClick={() => {
                      if (currentPage !== totalPages) {
                        setIsPaginationLoading(true);
                        setCurrentPage(totalPages);
                      }
                    }}
                    disabled={isPaginationLoading}
                    className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-green-400 text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50`}
                  >
                    {totalPages}
                  </button>
                );
              }
              return pageButtons;
            })()}
            <button
              onClick={() => {
                setIsPaginationLoading(true);
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages || isPaginationLoading}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Display pagination info */}
        {totalItems > 0 && (
          <div className="text-center mt-4 text-gray-600">
            Showing {Math.min(limit, properties.length)} of {totalItems} items (Page {currentPage} of {totalPages})
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplace;