"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faMagnifyingGlass, faMapMarkerAlt, faFileAlt, faBed, faTag } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import Loading from '@/components/loading-component/loading';
import Cookies from 'js-cookie';
import InsuredPreferenceTag from '@/components/agent-marketplace/InsuredPreferenceTag';
import BackToDashboard from '@/components/common/BackToDashboard';

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

interface ReceiverMode {
  type?: string;
}

interface Preference {
  preferenceId?: string;
  _id?: string;
  buyer?: Buyer;
  status: string;
  preferenceType: string;
  preferenceMode: string;
  location: Location;
  budget: Budget;
  features?: Features;
  contactInfo?: ContactInfo;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  nearbyLandmark?: string;
  additionalNotes?: string;
  receiverMode?: ReceiverMode;
  searchInsurance?: { optedIn?: boolean; status?: string };
  isSearchInsured?: boolean;
  reviewSummary?: {
    reviewCount: number;
    budgetFit?: { too_low: number; moderate: number; too_high: number };
  };
  myReview?: { budgetFit?: string } | null;
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

/** Aligns with backend: general marketplace list must exclude DealSite submissions (receiverMode.type === "dealSite"). */
const isDealSiteReceiverMode = (p: Pick<Preference, "receiverMode">) =>
  String(p.receiverMode?.type ?? "").toLowerCase() === "dealsite";

const AgentMarketplace = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [preferenceMode, setPreferenceMode] = useState('');
  const [preferenceType, setPreferenceType] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [propertyCondition, setPropertyCondition] = useState('');
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

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

  // Fetch general (main-site) preferences — GET /account/marketplace/general-preferences
  useEffect(() => {
    const fetchApprovedPreferences = async () => {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);

      const token = Cookies.get("token");
      if (!token) {
        setAuthRequired(true);
        setPreferences([]);
        setTotalPages(0);
        setTotalItems(0);
        setIsLoading(false);
        setIsPaginationLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("limit", String(limit));
        if (searchTerm) params.append("keyword", searchTerm);
        if (preferenceMode) params.append("preferenceMode", preferenceMode);
        if (preferenceType) params.append("preferenceType", preferenceType);
        if (documentType) params.append("documentType", documentType);
        if (propertyCondition) params.append("propertyCondition", propertyCondition);

        const url = `${URLS.BASE}${URLS.accountMarketplaceGeneralPreferences}?${params.toString()}`;
        const response = await GET_REQUEST(url, token);

        if (String(response?.error || "").includes("401") || String(response?.message || "").includes("401")) {
          setAuthRequired(true);
          setPreferences([]);
          setTotalPages(0);
          setTotalItems(0);
          setIsLoading(false);
          setIsPaginationLoading(false);
          return;
        }

        if (response?.success && response?.data && Array.isArray(response.data)) {
          const raw = response.data as Preference[];
          // Client safety net: never show DealSite-submitted prefs here (backend GET should omit them for correct pagination).
          const filtered = raw.filter((p) => !isDealSiteReceiverMode(p));
          setPreferences(filtered);

          if (response.pagination as any) {
            setTotalPages((response.pagination as any).pages || 1);
            setTotalItems((response.pagination as any).total || filtered.length);
          } else {
            setTotalPages(1);
            setTotalItems(filtered.length);
          }
        } else {
          setError(response?.message || "No buyer preferences found");
          setPreferences([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching buyer preferences:", error);

        let errorMessage = "Failed to load buyer preferences";
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            errorMessage =
              "Network error: Unable to connect to server. Please check your internet connection.";
          } else if (error.message.includes("Authentication")) {
            errorMessage = "Authentication error: Please log in again.";
          } else if (error.message.includes("API base URL")) {
            errorMessage = "Configuration error: API endpoint not available.";
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

    if (typeof window !== "undefined") {
      fetchApprovedPreferences();
    }
  }, [currentPage, searchTerm, documentType, propertyCondition, preferenceMode, preferenceType]);

  const handleSearch = () => {
    setCurrentPage(1);
    console.log('Search triggered with filters:', {
      searchTerm,
      documentType,
      propertyCondition,
      preferenceMode
    });
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



  const isPreferenceInactive = (status?: string) => {
    const s = status?.toLowerCase() || "";
    return s === "closed" || s === "matched";
  };

  const getPreferenceRowId = (p: Preference) => p.preferenceId || p._id || "";

  const PreferenceCard = ({ preference, index = 0 }: { preference: Preference; index?: number }) => {
    const rowId = getPreferenceRowId(preference);
    const inactive = isPreferenceInactive(preference.status);
    const isDealSitePref = isDealSiteReceiverMode(preference);
    const type = preference.preferenceType;
    const typeLabel =
      type === 'buy' ? 'Property Purchase' :
      type === 'rent' ? 'Property Rental' :
      type === 'shortlet' ? 'Short-term Stay' :
      type;
    const typeEmoji =
      type === 'buy' ? '🏠' :
      type === 'rent' ? '🏘️' :
      type === 'shortlet' ? '🏖️' : '🏢';

    return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#09391C]/10 bg-white shadow-[0_8px_24px_-18px_rgba(9,57,28,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#8DDB90] hover:shadow-[0_20px_40px_-18px_rgba(9,57,28,0.4)] ${inactive ? 'select-none' : ''}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-[#8DDB90]/25 via-[#EEF1F1] to-transparent" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#8DDB90] via-[#7BC97F] to-[#09391C] transition-all duration-300 group-hover:w-1.5" />

      {inactive && (
        <>
          <div className="absolute inset-0 z-20 bg-white/70 pointer-events-none" />
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="rotate-[-18deg] rounded-xl border-2 border-[#09391C]/25 bg-white/80 px-5 py-2 text-2xl font-extrabold tracking-[0.2em] text-[#09391C]/45">
              {preference.status?.toLowerCase() === "matched" ? "MATCHED" : "CLOSED"}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 flex items-start justify-between px-5 pt-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#09391C] to-[#0B572B] text-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
            {typeEmoji}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#09391C]">{typeLabel}</h3>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#8DDB90]/20 px-2 py-0.5 text-[11px] font-semibold text-[#09391C]">
                <span className={`h-1.5 w-1.5 rounded-full ${inactive ? 'bg-red-500' : 'bg-[#8DDB90]'}`} />
                {inactive ? 'Closed brief' : 'Active request'}
              </span>
              <InsuredPreferenceTag searchInsurance={preference.searchInsurance} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-5 py-4">
        <div className="mb-4 rounded-xl border border-[#8DDB90]/20 bg-[#EEF1F1]/80 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#09391C]/70">Client</p>
          <p className="mt-0.5 text-sm font-medium text-[#09391C]">Contact details are private</p>
          <p className="mt-0.5 text-xs text-[#5A5D63]">Open details to review this brief.</p>
          {preference.myReview?.budgetFit ? (
            <p className="mt-1 text-xs font-semibold text-[#0B572B]">You reviewed this</p>
          ) : preference.reviewSummary?.reviewCount ? (
            <p className="mt-1 text-xs text-[#5A5D63]">
              {preference.reviewSummary.reviewCount} agent review
              {preference.reviewSummary.reviewCount === 1 ? "" : "s"}
              {preference.reviewSummary.budgetFit?.too_low
                ? ` · ${preference.reviewSummary.budgetFit.too_low} say budget too low`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-[#FAFDFB] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8DDB90]/20 text-[#09391C]">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
              </span>
              <span className="text-xs font-medium text-[#5A5D63]">Location</span>
            </div>
            <span className="max-w-[58%] truncate text-right text-sm font-semibold text-[#09391C]">
              {formatLocation(preference.location)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#FAFDFB] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#09391C]/10 text-[#09391C]">
                <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
              </span>
              <span className="text-xs font-medium text-[#5A5D63]">Budget</span>
            </div>
            <span className="text-sm font-semibold text-[#09391C]">
              {formatPrice(preference.budget?.minPrice, preference.budget?.currency)} - {formatPrice(preference.budget?.maxPrice, preference.budget?.currency)}
            </span>
          </div>

          {(preference.propertyDetails?.minBedrooms || preference.bookingDetails?.minBedrooms) && (
            <div className="flex items-center justify-between rounded-lg bg-[#FAFDFB] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8DDB90]/20 text-[#09391C]">
                  <FontAwesomeIcon icon={faBed} className="w-3 h-3" />
                </span>
                <span className="text-xs font-medium text-[#5A5D63]">Bedrooms</span>
              </div>
              <span className="text-sm font-semibold text-[#09391C]">
                {preference.propertyDetails?.minBedrooms || preference.bookingDetails?.minBedrooms}+ BR
              </span>
            </div>
          )}

          {preference.propertyDetails?.documentTypes && preference.propertyDetails.documentTypes.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-[#FAFDFB] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#09391C]/10 text-[#09391C]">
                  <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3" />
                </span>
                <span className="text-xs font-medium text-[#5A5D63]">Documents</span>
              </div>
              <span className="max-w-[58%] truncate text-right text-sm font-semibold capitalize text-[#09391C]">
                {preference.propertyDetails.documentTypes.slice(0, 1).join(', ')}
                {preference.propertyDetails.documentTypes.length > 1 && ` +${preference.propertyDetails.documentTypes.length - 1}`}
              </span>
            </div>
          )}

          {preference.propertyDetails?.propertyCondition && (
            <div className="flex items-center justify-between rounded-lg bg-[#FAFDFB] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8DDB90]/20 text-[#09391C] text-[11px] font-bold">✓</span>
                <span className="text-xs font-medium text-[#5A5D63]">Condition</span>
              </div>
              <span className="text-sm font-semibold capitalize text-[#09391C]">
                {preference.propertyDetails.propertyCondition}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto space-y-2 border-t border-[#09391C]/10 px-5 py-4">
        {!inactive && !isDealSitePref && rowId ? (
          <a
            href={`/agent-marketplace/${rowId}`}
            className="flex w-full items-center justify-center gap-1 py-1 text-xs font-semibold text-[#0B572B] transition-all duration-300 hover:gap-2 hover:text-[#09391C]"
          >
            <span>View details</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ) : null}

        {isDealSitePref ? (
          <div className="w-full rounded-xl bg-[#EEF1F1] py-2.5 text-center text-xs font-medium text-[#5A5D63]">
            Submitted via an agent DealSite — not available here
          </div>
        ) : inactive ? (
          <div className="w-full rounded-xl bg-[#8DDB90]/20 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[#09391C]">
            {preference.status?.toLowerCase() === "matched" ? "Matched" : "Closed"}
          </div>
        ) : (
          <a
            href={`/agent-marketplace/${rowId}`}
            className="block w-full rounded-xl bg-gradient-to-r from-[#09391C] to-[#0B572B] py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-[#0B572B] hover:to-[#09391C] hover:shadow-md"
          >
            Review this preference
          </a>
        )}
      </div>
    </motion.article>
  );
  };

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
    <div className="min-h-screen bg-[#EEF1F1]">
      {/* Header */}
      <div className="border-b border-[#09391C]/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <BackToDashboard />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-6 md:py-8">
        {/* Title Section */}
        <div className="text-center mb-6 md:mb-8 px-4">
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-[#09391C] mb-2">Agent Marketplace</h1>
          <p className="text-gray-600 text-sm md:text-base">Review buyer briefs for this market.</p>
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
                Buyer briefs waiting for review
              </h2>
              <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
                Tell the system if a brief is priced and specified realistically for this market.
                <span className="text-[#8DDB90] font-semibold"> Matching happens when the buyer submits.</span>
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
              <div className="relative col-span-2">
                <select
                  value={preferenceType}
                  onChange={(e) => setPreferenceType(e.target.value)}
                  className="w-full appearance-none px-3 py-3 pr-8 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All listing types</option>
                  <option value="buy">Outright purchase</option>
                  <option value="rent">Rental</option>
                  <option value="joint-venture">Joint venture</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
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
                value={preferenceType}
                onChange={(e) => setPreferenceType(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All listing types</option>
                <option value="buy">Outright purchase</option>
                <option value="rent">Rental</option>
                <option value="joint-venture">Joint venture</option>
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
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
          {authRequired ? (
            <div className="col-span-full max-w-lg mx-auto text-center py-16 px-6 border border-gray-200 rounded-xl bg-gray-50/80">
              <h3 className="text-lg font-semibold text-[#09391C] mb-2">Sign in required</h3>
              <p className="text-gray-600 text-sm mb-6">
                The agent marketplace uses your account to load buyer preferences from the main site. Log in to continue.
              </p>
              <button
                type="button"
                onClick={() => {
                  const path =
                    typeof window !== "undefined"
                      ? `${window.location.pathname}${window.location.search || ""}`
                      : "/agent-marketplace";
                  try {
                    sessionStorage.setItem("redirectAfterLogin", path);
                  } catch {
                    /* ignore */
                  }
                  router.push("/auth/login");
                }}
                className="px-6 py-3 bg-[#8DDB90] hover:bg-[#7BC97F] text-white font-medium rounded-lg transition-colors text-sm"
              >
                Log in
              </button>
            </div>
          ) : isLoading ? (
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
              <PreferenceCard
                key={getPreferenceRowId(preference) || idx}
                preference={preference}
                index={idx}
              />
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
                    This could be because buyers are still reviewing requirements or there are no active preferences in your selected criteria.
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
