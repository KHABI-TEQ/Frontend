"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faMagnifyingGlass, faArrowLeft, faMapMarkerAlt, faFileAlt, faBed, faTag } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import Loading from '@/components/loading-component/loading';
import Cookies from 'js-cookie';

interface Buyer {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  id: string;
}

interface Location {
  state: string;
  localGovernmentAreas?: string[];
  lgasWithAreas?: Array<{
    lgaName: string;
    areas: string[];
    _id: string;
    id: string;
  }>;
}

interface Budget {
  minPrice: number;
  maxPrice: number;
  currency: string;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  willingToPayExtra?: boolean;
}

interface PropertyDetails {
  purpose?: string;
  propertyType?: string;
  buildingType?: string;
  minBedrooms?: string;
  minBathrooms?: number;
  propertyCondition?: string;
  landSize?: string;
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

interface Preference {
  preferenceId: string;
  buyer: Buyer;
  status: string;
  preferenceType: string;
  preferenceMode: string;
  location: Location;
  budget: Budget;
  features?: Features;
  contactInfo: ContactInfo;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  nearbyLandmark?: string;
  additionalNotes?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Preference[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const AgentMarketplace = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [preferenceMode, setPreferenceMode] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [propertyCondition, setPropertyCondition] = useState('');
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const limit = 12; // Items per page

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setCriticalError(`Application error: ${event.error?.message || 'Unknown error'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setCriticalError(`Network error: ${event.reason?.message || 'Request failed'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Fetch approved preferences from API
  useEffect(() => {
    const fetchApprovedPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if URLS.BASE is available
        if (!URLS.BASE || URLS.BASE.includes('undefined') || URLS.BASE === 'undefined') {
          console.error('NEXT_PUBLIC_API_URL environment variable is not set');
          // In development mode, show mock data instead of failing
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock data in development mode');
            setPreferences([]);
            setTotalPages(1);
            setTotalItems(0);
            return;
          }
          throw new Error('API base URL is not configured properly. Please check environment configuration.');
        }

        // Build query params from filters
        const params = new URLSearchParams();
        params.append('page', String(currentPage));
        params.append('limit', String(limit));
        if (searchTerm) params.append('search', searchTerm);
        if (preferenceMode) params.append('preferenceMode', preferenceMode);
        if (documentType) params.append('documentType', documentType);
        if (propertyCondition) params.append('propertyCondition', propertyCondition);

        const url = `${URLS.BASE}/preferences/getApprovedForAgent?${params.toString()}`;
       
        const response = await GET_REQUEST(url);

        if (response?.success && response?.data && Array.isArray(response.data)) {
          setPreferences(response.data);
          
          // Set pagination info from backend response
          if (response.pagination) {
            setTotalPages(response.pagination.pages || 1);
            setTotalItems(response.pagination.total || response.data.length);
          } else {
            setTotalPages(1);
            setTotalItems(response.data.length);
          }
        } else {
          console.log('No data received from API or unexpected format');
          console.log('Response structure:', response);
          setError('No buyer preferences found');
          setPreferences([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error fetching buyer preferences:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to load buyer preferences';
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
          } else if (error.message.includes('Authentication')) {
            errorMessage = 'Authentication error: Please log in again.';
          } else if (error.message.includes('API base URL')) {
            errorMessage = 'Configuration error: API endpoint not available.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }

        setError(errorMessage);
        setPreferences([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
        setIsPaginationLoading(false);
      }
    };

    // Only fetch if we have the basic requirements
    if (typeof window !== 'undefined') {
      fetchApprovedPreferences();
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    }
  }, [currentPage, searchTerm, documentType, propertyCondition, preferenceMode, hasInitialized]);

  const handleSearch = () => {
    setCurrentPage(1);
    console.log('Search triggered with filters:', {
      searchTerm,
      documentType,
      propertyCondition,
      preferenceMode
    });
  };

  const handleIHaveIt = (preferenceId: string) => {
    const href = `/agent-marketplace/${preferenceId}`;
    if (typeof window !== 'undefined') {
      try {
        // Force full navigation to avoid fetchServerResponse issues in some environments
        window.location.href = href;
      } catch {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  const formatPrice = (price: number | string | null | undefined, currency?: string) => {
    const normalizedCurrency = (currency || 'NGN').toUpperCase();
    const numericValue =
      typeof price === 'number'
        ? price
        : typeof price === 'string'
          ? Number(price.replace(/[^0-9.-]/g, ''))
          : NaN;

    if (!Number.isFinite(numericValue)) {
      return 'N/A';
    }

    const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    const prefix = normalizedCurrency === 'NGN' ? '₦' : `${normalizedCurrency} `;

    return `${prefix}${formatter.format(numericValue)}`;
  };

  const formatLocation = (location: Location) => {
    if (!location) return 'N/A';

    let locationStr = location.state || '';

    if (location.lgasWithAreas && location.lgasWithAreas.length > 0) {
      const lgas = location.lgasWithAreas.map(lga => lga.lgaName).join(', ');
      locationStr += lgas ? `, ${lgas}` : '';
    } else if (location.localGovernmentAreas && location.localGovernmentAreas.length > 0) {
      locationStr += `, ${location.localGovernmentAreas.join(', ')}`;
    }

    return locationStr.replace(/^,\s*/, '') || 'N/A';
  };



  const PreferenceCard = ({ preference }: { preference: Preference }) => (
    <div className={`group relative bg-white border border-gray-200/80 hover:border-gray-300 rounded-lg overflow-hidden flex flex-col h-full transition-all duration-500 hover:translate-y-[-2px] ${preference.status?.toLowerCase() === 'closed' ? 'select-none' : ''}`}>
      {/* Watermark for closed preferences */}
      {preference.status?.toLowerCase() === 'closed' && (
        <>
          <div className="absolute inset-0 bg-white/70 z-20 pointer-events-none"></div>
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="px-6 py-2 text-3xl md:text-4xl font-extrabold tracking-widest text-red-600/50 border-4 border-red-600/40 rounded rotate-[-20deg] bg-white/60">
              CLOSED
            </div>
          </div>
        </>
      )}
      {/* Animated Top Border */}
      <div className="absolute top-0 left-0 w-0 h-[2px] bg-[#8DDB90] group-hover:w-full transition-all duration-700 ease-out"></div>

      {/* Status Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${preference.status?.toLowerCase() === 'closed' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75 ${preference.status?.toLowerCase() === 'closed' ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Type Icon */}
          <div className="relative w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-300">
            <div className="text-gray-700 font-bold text-base">
              {preference.preferenceType === 'buy' ? '🏠' :
               preference.preferenceType === 'rent' ? '🏘️' :
               preference.preferenceType === 'shortlet' ? '🏖️' : '🏢'}
            </div>
            {/* Hover animation circle */}
            <div className="absolute inset-0 rounded-lg border-2 border-[#8DDB90] opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-300"></div>
          </div>

          <div className="flex-1">
            <h3 className="text-gray-900 font-semibold text-sm mb-1 group-hover:text-[#09391C] transition-colors">
              {preference.preferenceType === 'buy' ? 'Property Purchase' :
               preference.preferenceType === 'rent' ? 'Property Rental' :
               preference.preferenceType === 'shortlet' ? 'Short-term Stay' :
               preference.preferenceType}
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-gray-500 text-xs">Active Request</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        {/* Key Details Grid */}
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50 group-hover:border-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 text-xs font-medium">Location</span>
            </div>
            <span className="text-gray-900 text-sm font-medium text-right max-w-[60%] truncate">
              {formatLocation(preference.location)}
            </span>
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50 group-hover:border-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 text-xs font-medium">Budget</span>
            </div>
            <span className="text-gray-900 text-sm font-medium">
              {formatPrice(preference.budget?.minPrice, preference.budget?.currency)} - {formatPrice(preference.budget?.maxPrice, preference.budget?.currency)}
            </span>
          </div>

          {/* Bedrooms */}
          {(preference.propertyDetails?.minBedrooms || preference.bookingDetails?.minBedrooms) && (
            <div className="flex items-center justify-between py-2 border-b border-gray-50 group-hover:border-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBed} className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600 text-xs font-medium">Bedrooms</span>
              </div>
              <span className="text-gray-900 text-sm font-medium">
                {preference.propertyDetails?.minBedrooms || preference.bookingDetails?.minBedrooms}+ BR
              </span>
            </div>
          )}

          {/* Documents */}
          {preference.propertyDetails?.documentTypes && preference.propertyDetails.documentTypes.length > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-gray-50 group-hover:border-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600 text-xs font-medium">Documents</span>
              </div>
              <span className="text-gray-900 text-sm font-medium text-right max-w-[60%] truncate">
                {preference.propertyDetails.documentTypes.slice(0, 1).join(', ')}
                {preference.propertyDetails.documentTypes.length > 1 && `+${preference.propertyDetails.documentTypes.length - 1}`}
              </span>
            </div>
          )}

          {/* Property Condition */}
          {preference.propertyDetails?.propertyCondition && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">✓</span>
                <span className="text-gray-600 text-xs font-medium">Condition</span>
              </div>
              <span className="text-gray-900 text-sm font-medium capitalize">
                {preference.propertyDetails.propertyCondition}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 pt-0 space-y-3 border-t border-gray-50">
        {/* View Details */}
        {preference.status?.toLowerCase() !== 'closed' && (
          <a
            href={`/agent-marketplace/${preference.preferenceId}`}
            className="w-full text-gray-600 hover:text-gray-900 text-xs font-medium py-2 flex items-center justify-center gap-1 group/btn transition-colors"
          >
            <span>View Details</span>
            <svg className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {/* Primary Action or Matched Badge */}
        {preference.status?.toLowerCase() === 'closed' ? (
          <div className="w-full py-2.5 rounded bg-green-100 text-green-700 text-xs font-semibold text-center uppercase tracking-wide">
            Matched
          </div>
        ) : (
          <button
            onClick={() => handleIHaveIt(preference.preferenceId)}
            className="relative w-full bg-gray-900 hover:bg-black text-white py-3 text-sm font-medium rounded transition-all duration-300 overflow-hidden group/action"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>I Have This Property</span>
            </span>
            <div className="absolute inset-0 bg-[#8DDB90] transform scale-x-0 group-hover/action:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        )}
      </div>
    </div>
  );

  // Critical error boundary
  if (criticalError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Application Error</h2>
          <p className="text-gray-600 mb-4">{criticalError}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC97F] transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => router.push('/')}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Early return for initial loading state
  if (!hasInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Error boundary for configuration errors
  if (error && (error.includes('Configuration error') || error.includes('API base URL'))) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC97F] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
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
      <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-6 md:py-8">
        {/* Title Section */}
        <div className="text-center mb-6 md:mb-8 px-4">
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-[#09391C] mb-2">Agent Marketplace</h1>
          <p className="text-gray-600 text-sm md:text-base">Connect with Serious Buyers—Submit Now.</p>
        </div>

        {/* Featured Matched Buyers Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#8DDB90]/10 via-[#8DDB90]/5 to-transparent rounded-xl md:rounded-2xl p-4 md:p-8 mb-8 md:mb-12 border border-[#8DDB90]/20 mx-2 md:mx-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#8DDB90] rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#09391C] rounded-full translate-x-12 translate-y-12"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#8DDB90] rounded-full opacity-30"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[#8DDB90]/10 rounded-full text-[#09391C] text-xs md:text-sm font-medium mb-3 md:mb-4">
                <div className="w-2 h-2 bg-[#8DDB90] rounded-full animate-pulse"></div>
                Hot Opportunities
              </div>
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-[#09391C] mb-2 md:mb-3">
                🎯 Buyers Just Got Matched!
              </h2>
              <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
                Fresh opportunities waiting for the right properties.
                <span className="text-[#8DDB90] font-semibold"> Submit now to get featured</span> and connect with serious buyers.
              </p>
            </div>

          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Mobile-first responsive filters */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Search input - full width on mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter state, lga, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Filter selects - 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={preferenceMode}
                  onChange={(e) => setPreferenceMode(e.target.value)}
                  className="w-full appearance-none px-3 py-3 pr-8 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Mode</option>
                  <option value="buy">Buyer</option>
                  <option value="tenant">Tenant</option>
                  <option value="developer">Developer</option>
                  <option value="shortlet">Shortlet</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full appearance-none px-3 py-3 pr-8 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Document</option>
                  <option value="certificate-of-occupancy">C of O</option>
                  <option value="deed-of-assignment">Deed of Assignment</option>
                  <option value="deed-of-ownership">Deed of Ownership</option>
                  <option value="deed-of-conveyance">Deed of Conveyance</option>
                  <option value="land-certificate">Land Certificate</option>
                  <option value="governor-consent">Governor Consent</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative col-span-2">
                <select
                  value={propertyCondition}
                  onChange={(e) => setPropertyCondition(e.target.value)}
                  className="w-full appearance-none px-3 py-3 pr-8 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Property Condition</option>
                  <option value="new">New</option>
                  <option value="renovated">Renovated</option>
                  <option value="old">Old</option>
                  <option value="under-construction">Under Construction</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Search button - full width on mobile */}
            <button
              onClick={handleSearch}
              className="w-full py-3 bg-[#8DDB90] hover:bg-[#7BC97F] text-white rounded-lg font-medium transition-colors"
            >
              Search Properties
            </button>
          </div>

          {/* Desktop filters - hidden on mobile */}
          <div className="hidden md:flex flex-wrap gap-4 justify-center">
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
                value={preferenceMode}
                onChange={(e) => setPreferenceMode(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Preference Mode</option>
                <option value="buy">Buyer</option>
                <option value="tenant">Tenant</option>
                <option value="developer">Developer</option>
                <option value="shortlet">Shortlet</option>
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
                <option value="certificate-of-occupancy">Certificate of Occupancy</option>
                <option value="deed-of-assignment">Deed of Assignment</option>
                <option value="deed-of-ownership">Deed of Ownership</option>
                <option value="deed-of-conveyance">Deed of Conveyance</option>
                <option value="land-certificate">Land Certificate</option>
                <option value="governor-consent">Governor Consent</option>
                <option value="registered-deed-of-conveyance">Registered Deed of Conveyance</option>
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
                <option value="new">New</option>
                <option value="renovated">Renovated</option>
                <option value="old">Old</option>
                <option value="under-construction">Under Construction</option>
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-[#8DDB90] hover:bg-[#7BC97F] text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <Loading />
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC97F] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : preferences.length > 0 ? (
            preferences.map((preference: Preference, idx: number) => (
              <PreferenceCard key={preference.preferenceId || idx} preference={preference} />
            ))
          ) : (
            <div className="col-span-full">
              <div className="max-w-2xl mx-auto text-center py-16 px-6">
                {/* Illustration */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-[#8DDB90]/20 to-[#8DDB90]/10 rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#8DDB90]/30 to-[#8DDB90]/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 md:w-12 md:h-12 text-[#8DDB90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute top-0 left-1/4 w-3 h-3 bg-[#8DDB90] rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#09391C] rounded-full opacity-40 animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-[#8DDB90] rounded-full opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}></div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-[#09391C]">
                    No Buyer Preferences Found
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    We couldn&apos;t find any approved buyer preferences matching your current filters.
                    This could be because buyers are still reviewing requirements or there aren'&apos; any active preferences in your selected criteria.
                  </p>

                  {/* Suggestions */}
                  <div className="bg-[#8DDB90]/5 rounded-xl p-6 mt-6 border border-[#8DDB90]/20">
                    <h4 className="font-semibold text-[#09391C] mb-3 text-sm md:text-base">Try these suggestions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-xs md:text-sm">Clear your current filters and try again</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-xs md:text-sm">Search in different locations</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-xs md:text-sm">Try different property types</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-xs md:text-sm">Check back later for new preferences</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPreferenceMode('');
                        setDocumentType('');
                        setPropertyCondition('');
                        setCurrentPage(1);
                      }}
                      className="px-6 py-3 bg-[#8DDB90] hover:bg-[#7BC97F] text-white font-medium rounded-lg transition-colors text-sm md:text-base"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors text-sm md:text-base"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 md:mt-8 flex-wrap px-4">
            <button
              onClick={() => {
                setIsPaginationLoading(true);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1 || isPaginationLoading}
              className="px-2 md:px-4 py-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              <span className="hidden md:inline">Previous</span>
              <span className="md:hidden">Prev</span>
            </button>
            
            {/* Page numbers */}
            {(() => {
              const pageButtons = [];
              const windowSize = 2;
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
                  key="page-1"
                  onClick={() => {
                    if (currentPage !== 1) {
                      setIsPaginationLoading(true);
                      setCurrentPage(1);
                    }
                  }}
                  disabled={isPaginationLoading}
                  className={`px-2 md:px-3 py-2 rounded border ${currentPage === 1 ? 'bg-[#8DDB90] text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50 transition-colors text-sm md:text-base`}
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
                    className={`px-2 md:px-3 py-2 rounded border ${currentPage === i ? 'bg-[#8DDB90] text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50 transition-colors text-sm md:text-base`}
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
                    key={`page-${totalPages}`}
                    onClick={() => {
                      if (currentPage !== totalPages) {
                        setIsPaginationLoading(true);
                        setCurrentPage(totalPages);
                      }
                    }}
                    disabled={isPaginationLoading}
                    className={`px-2 md:px-3 py-2 rounded border ${currentPage === totalPages ? 'bg-[#8DDB90] text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50 transition-colors text-sm md:text-base`}
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
              className="px-2 md:px-4 py-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              Next
            </button>
          </div>
        )}

        {/* Display pagination info */}
        {totalItems > 0 && (
          <div className="text-center mt-4 text-gray-600 text-sm md:text-base px-4">
            <span className="hidden md:inline">
              Showing {Math.min(limit, preferences.length)} of {totalItems} preferences (Page {currentPage} of {totalPages})
            </span>
            <span className="md:hidden">
              {Math.min(limit, preferences.length)} of {totalItems} • Page {currentPage}/{totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplace;
