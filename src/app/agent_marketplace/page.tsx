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
  const [landSize, setLandSize] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]); // Store all fetched data
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8; // You can adjust this number

  // Calculate paginated properties
  const paginatedProperties = properties.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );
  const totalPages = Math.ceil(properties.length / cardsPerPage);

  // Fetch buyer preferences from API
  useEffect(() => {
    const fetchBuyerPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/agent/all-preferences`;
        console.log('Fetching from URL:', url); 
        
        // Use direct fetch instead of GET_REQUEST to avoid any automatic headers
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
        console.log('API Response:', data); // Debug log
        
        // Check different possible response structures
        if (data && data.preferences) {
          // Direct preferences array
          const preferences = Array.isArray(data.preferences) ? data.preferences : [];
          console.log('Found preferences (direct):', preferences.length);
          
          const transformedProperties = preferences.map((pref: any) => ({
            id: pref._id || pref.id,
            type: pref.preferenceType === 'buy' ? 'Outright sales' : 
                  pref.preferenceType === 'rent' ? 'Rent' : 'Joint venture(VJ)',
            location: pref.location ? 
              `${pref.location.state || ''}, ${pref.location.localGovernment || ''}`.trim().replace(/^,|,$/, '') : 'N/A',
            priceRange: pref.budgetMin && pref.budgetMax ? 
              `₦${pref.budgetMin.toLocaleString()} - ₦${pref.budgetMax.toLocaleString()}` : 
              pref.budgetMin ? `₦${pref.budgetMin.toLocaleString()}` : 'N/A',
            landSize: pref.landSize ? `${pref.landSize}${pref.measurementType || ''}` : '',
            document: pref.documents?.join(', ') || 'N/A',
            status: pref.status || 'active',
            building: pref.propertyCondition || '',
            bedroom: pref.noOfBedrooms ? pref.noOfBedrooms.toString() : '',
            bathroom: pref.noOfBathrooms ? pref.noOfBathrooms.toString() : '',
            propertyType: pref.propertyType || 'Residential',
            features: pref.features || [],
            dateCreated: pref.createdAt ? new Date(pref.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : 'N/A',
            additionalInfo: pref.additionalInfo || '',
            buyer: pref.buyer || null,
          }));

          setAllProperties(transformedProperties);
          setProperties(transformedProperties);
          
          // Filter matched properties
          const matched = transformedProperties.filter((prop: any) => prop.status === 'matched');
          setMatchedProperties(matched);
          
        } else if (data && data.data && data.data.preferences) {
          // Nested under data.preferences
          const preferences = Array.isArray(data.data.preferences) ? data.data.preferences : [];
          console.log('Found preferences (nested):', preferences.length);
          
          const transformedProperties = preferences.map((pref: any) => ({
            id: pref._id || pref.id,
            type: pref.preferenceType === 'buy' ? 'Outright sales' : 
                  pref.preferenceType === 'rent' ? 'Rent' : 'Joint venture(VJ)',
            location: pref.location ? 
              `${pref.location.state || ''}, ${pref.location.localGovernment || ''}`.trim().replace(/^,|,$/, '') : 'N/A',
            priceRange: pref.budgetMin && pref.budgetMax ? 
              `₦${pref.budgetMin.toLocaleString()} - ₦${pref.budgetMax.toLocaleString()}` : 
              pref.budgetMin ? `₦${pref.budgetMin.toLocaleString()}` : 'N/A',
            landSize: pref.landSize ? `${pref.landSize}${pref.measurementType || ''}` : '',
            document: pref.documents?.join(', ') || 'N/A',
            status: pref.status || 'active',
            building: pref.propertyCondition || '',
            bedroom: pref.noOfBedrooms ? pref.noOfBedrooms.toString() : '',
            bathroom: pref.noOfBathrooms ? pref.noOfBathrooms.toString() : '',
            propertyType: pref.propertyType || 'Residential',
            features: pref.features || [],
            dateCreated: pref.createdAt ? new Date(pref.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : 'N/A',
            additionalInfo: pref.additionalInfo || '',
            buyer: pref.buyer || null,
          }));

          setAllProperties(transformedProperties);
          setProperties(transformedProperties);
          
          // Filter matched properties
          const matched = transformedProperties.filter((prop: any) => prop.status === 'matched');
          setMatchedProperties(matched);
          
        } else if (data && Array.isArray(data)) {
          // Direct array response
          console.log('Found preferences (array):', data.length);
          
          const transformedProperties = data.map((pref: any) => ({
            id: pref._id || pref.id,
            type: pref.preferenceType === 'buy' ? 'Outright sales' : 
                  pref.preferenceType === 'rent' ? 'Rent' : 'Joint venture(VJ)',
            location: pref.location ? 
              `${pref.location.state || ''}, ${pref.location.localGovernment || ''}`.trim().replace(/^,|,$/, '') : 'N/A',
            priceRange: pref.budgetMin && pref.budgetMax ? 
              `₦${pref.budgetMin.toLocaleString()} - ₦${pref.budgetMax.toLocaleString()}` : 
              pref.budgetMin ? `₦${pref.budgetMin.toLocaleString()}` : 'N/A',
            landSize: pref.landSize ? `${pref.landSize}${pref.measurementType || ''}` : '',
            document: pref.documents?.join(', ') || 'N/A',
            status: pref.status || 'active',
            building: pref.propertyCondition || '',
            bedroom: pref.noOfBedrooms ? pref.noOfBedrooms.toString() : '',
            bathroom: pref.noOfBathrooms ? pref.noOfBathrooms.toString() : '',
            propertyType: pref.propertyType || 'Residential',
            features: pref.features || [],
            dateCreated: pref.createdAt ? new Date(pref.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : 'N/A',
            additionalInfo: pref.additionalInfo || '',
            buyer: pref.buyer || null,
          }));

          setAllProperties(transformedProperties);
          setProperties(transformedProperties);
          
          // Filter matched properties
          const matched = transformedProperties.filter((prop: any) => prop.status === 'matched');
          setMatchedProperties(matched);
          
        } else {
          console.log('No data received from API or unexpected format');
          console.log('Response structure:', data);
          setError('No buyer preferences found');
          
          // Set fallback mock data for testing
          const mockData = [
            {
              id: 'mock1',
              type: 'Outright sales',
              location: 'Lagos, Ikeja',
              priceRange: '₦150,000,000 - ₦200,000,000',
              landSize: '500sqm',
              document: 'C of O, Survey',
              status: 'active',
              building: 'New',
              bedroom: '4',
              bathroom: '3',
              propertyType: 'Residential',
              features: ['Security', 'Parking'],
              dateCreated: 'June 26, 2025',
              additionalInfo: '',
              buyer: null,
            }
          ];
          
          setAllProperties(mockData);
          setProperties(mockData);
          setMatchedProperties([]);
        }
      } catch (error) {
        console.error('Error fetching buyer preferences:', error);
        setError(`Failed to load buyer preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Set fallback mock data for testing
        const mockData = [
          {
            id: 'mock1',
            type: 'Outright sales',
            location: 'Lagos, Ikeja',
            priceRange: '₦150,000,000 - ₦200,000,000',
            landSize: '500sqm',
            document: 'C of O, Survey',
            status: 'active',
            building: 'New',
            bedroom: '4',
            bathroom: '3',
            propertyType: 'Residential',
            features: ['Security', 'Parking'],
            dateCreated: 'June 26, 2025',
            additionalInfo: '',
            buyer: null,
          }
        ];
        
        setAllProperties(mockData);
        setProperties(mockData);
        setMatchedProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyerPreferences();
  }, []);

  // Filter properties based on search and filter criteria
  useEffect(() => {
    let filtered = [...allProperties];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((property) =>
        property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply document type filter
    if (documentType) {
      filtered = filtered.filter((property) =>
        property.document?.toLowerCase().includes(documentType.toLowerCase())
      );
    }

    // Apply land size filter (you can customize this logic)
    if (landSize) {
      filtered = filtered.filter((property) => {
        if (landSize === 'small') return parseInt(property.landSize || '0') < 500;
        if (landSize === 'medium') return parseInt(property.landSize || '0') >= 500 && parseInt(property.landSize || '0') < 1000;
        if (landSize === 'large') return parseInt(property.landSize || '0') >= 1000;
        return true;
      });
    }

    // Apply developer preference filter (customize based on your needs)
    if (developerPreference) {
      // Add your developer preference filtering logic here
      filtered = filtered.filter((property) => 
        // Example: filter by property type or other criteria
        property.type?.toLowerCase().includes(developerPreference.toLowerCase())
      );
    }

    setProperties(filtered);
  }, [searchTerm, documentType, landSize, developerPreference, allProperties]);

  const handleSearch = () => {
    // The filtering is already handled by useEffect above
    // You can add additional search logic here if needed
    console.log('Search triggered with filters:', {
      searchTerm,
      documentType,
      landSize,
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
        <div className="text-blue-500 text-base font-normal mb-4">
          {property.status || 'active'}
        </div>
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
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
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
              <option value="coo">C of O</option>
              <option value="survey">Survey</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Land Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            More filter
          </button>

          <button 
            onClick={handleSearch}
            className="px-8 py-3 bg-green-400 hover:bg-green-500 text-white rounded-lg font-medium"
          >
            Search
          </button>
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
            {getMatchedProperties().map((property) => (
              <MatchedCard key={property.id} property={property} />
            ))}
          </div>
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
            paginatedProperties.map((property, idx) => (
              <PropertyCard key={property.id || idx} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Loading />
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-green-400 text-white' : 'bg-white'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplace;