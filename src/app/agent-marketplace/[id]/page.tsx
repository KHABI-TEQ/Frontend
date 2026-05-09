"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapMarkerAlt, faFileAlt, faBed, faTag, faUser, faEnvelope, faPhone, faCalendarAlt, faClock, faUsers, faHome } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useUserContext } from '@/context/user-context';
import { GET_REQUEST, POST_REQUEST } from '@/utils/requests';
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

interface ReceiverMode {
  type?: string;
}

interface Preference {
  id: string;
  preferenceMode: string;
  preferenceType: string;
  location: Location;
  budget: Budget;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  features?: Features;
  status: string;
  createdAt: string;
  buyer?: Buyer;
  contactInfo?: ContactInfo;
  nearbyLandmark?: string;
  additionalNotes?: string;
  receiverMode?: ReceiverMode;
}

interface MatchPreferenceResponseData {
  matchedCount: number;
  matchEmailBaseUrl?: string;
}

const DEAL_SITE_GENERAL_MARKETPLACE_COPY =
  "This preference was submitted on an agent DealSite; matching is not available through the general marketplace action.";

const isDealSiteReceiverModePref = (p: Pick<Preference, "receiverMode"> | null) =>
  p ? String(p.receiverMode?.type ?? "").toLowerCase() === "dealsite" : false;

const isDealSiteGeneralMarketplaceApiMessage = (msg: string) => {
  const m = (msg || "").toLowerCase();
  return (
    /submitted\s+on\s+an\s+agent\s+dealsite/.test(m) ||
    /matching\s+is\s+not\s+available\s+through\s+the\s+general\s+marketplace/.test(m) ||
    /general\s+marketplace\s+action/.test(m)
  );
};

interface ApiResponse {
  success: boolean;
  message: string;
  data: Preference;
}

const PreferenceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserContext();
  const [preference, setPreference] = useState<Preference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchLockedAfterSuccess, setMatchLockedAfterSuccess] = useState(false);
  const [practitionerPageCta, setPractitionerPageCta] = useState(false);
  const [dealSiteGeneralMatchDenied, setDealSiteGeneralMatchDenied] = useState(false);
  const [dealSiteGeneralMatchMessage, setDealSiteGeneralMatchMessage] = useState<string | null>(null);

  const preferenceId = params?.id as string;

  const isUnauthorizedMessage = (msg: string) =>
    /unauthorized|jwt|expired|session|log\s*in|authentication/i.test(msg || "");

  const isDealSiteSubmissionRejection = (msg: string) =>
    /submitted\s+on\s+an\s+agent|receiver\s*mode|not\s+a\s+general|deal\s*site\s+submission|general\s+marketplace\s+action/i.test(
      (msg || "").toLowerCase(),
    );

  const suggestsActivatePractitionerPage = (msg: string) => {
    const m = (msg || "").toLowerCase();
    if (isDealSiteSubmissionRejection(msg)) return false;
    return /public\s*access|public\s*page|active.*public|must\s+activate|running|resume|paused|on\s*hold/.test(
      m,
    );
  };

  useEffect(() => {
    const fetchPreferenceDetails = async () => {
      if (!preferenceId) {
        setError('Preference ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const token = Cookies.get('token');
        const url = `${URLS.BASE}/preferences/${preferenceId}/getOne`;
        
        const response = await GET_REQUEST(url, token);

        if (response?.success && response?.data) {
          const data = response.data as Preference;
          setPreference(data);
          if (isDealSiteReceiverModePref(data)) {
            setDealSiteGeneralMatchDenied(true);
            setDealSiteGeneralMatchMessage(DEAL_SITE_GENERAL_MARKETPLACE_COPY);
          } else {
            setDealSiteGeneralMatchDenied(false);
            setDealSiteGeneralMatchMessage(null);
          }
        } else {
          toast.error("Failed to load preference details")
          setError(response?.message || 'Failed to load preference details');
        }
      } catch (error) {
        console.error('Error fetching preference details:', error);
        setError(`Failed to load preference details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferenceDetails();
  }, [preferenceId]);

  const handleMatchPreference = async () => {
    if (!preferenceId) return;

    const token = Cookies.get("token");
    if (!user || !token) {
      try {
        sessionStorage.setItem(
          "redirectAfterLogin",
          `/agent-marketplace/${preferenceId}`,
        );
      } catch {
        /* ignore */
      }
      router.push("/auth/login");
      return;
    }

    setMatchLoading(true);
    setPractitionerPageCta(false);

    try {
      const url = `${URLS.BASE}${URLS.accountMarketplaceMatchPreference(preferenceId)}`;
      const response = await POST_REQUEST(url, {}, token);

      if (response?.success && response.data) {
        const data = response.data as MatchPreferenceResponseData;
        const count = typeof data.matchedCount === "number" ? data.matchedCount : 0;
        toast.success(
          response.message ||
            (count > 0
              ? `Matched ${count} listing(s). The buyer will be notified by email.`
              : "Request completed. The buyer will be notified by email."),
        );
        if (count > 0) {
          setMatchLockedAfterSuccess(true);
        }
        return;
      }

      const errText = String(
        response?.message || response?.error || "Could not match preference",
      );

      if (isUnauthorizedMessage(errText)) {
        toast.error("Please log in again to continue.");
        try {
          sessionStorage.setItem(
            "redirectAfterLogin",
            `/agent-marketplace/${preferenceId}`,
          );
        } catch {
          /* ignore */
        }
        router.push("/auth/login");
        return;
      }

      if (isDealSiteGeneralMarketplaceApiMessage(errText)) {
        setDealSiteGeneralMatchDenied(true);
        setDealSiteGeneralMatchMessage(errText.trim() || DEAL_SITE_GENERAL_MARKETPLACE_COPY);
        return;
      }

      if (suggestsActivatePractitionerPage(errText)) {
        setPractitionerPageCta(true);
      }

      toast.error(errText);
    } catch (e) {
      console.error("Match preference error:", e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMatchLoading(false);
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
      const areasText = location.lgasWithAreas.map(lga => 
        `${lga.lgaName}: ${lga.areas.join(', ')}`
      ).join(' | ');
      locationStr += areasText ? `, ${areasText}` : '';
    } else if (location.localGovernmentAreas && location.localGovernmentAreas.length > 0) {
      locationStr += `, ${location.localGovernmentAreas.join(', ')}`;
    }
    
    return locationStr.replace(/^,\s*/, '') || 'N/A';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !preference) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error || 'Preference not found'}</p>
            <button 
              onClick={() => router.push('/agent-marketplace')} 
              className="px-6 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC97F] transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
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
            <Link href="/agent-marketplace" className="hover:text-gray-900">agent marketplace</Link>
            <span>•</span>
            <span className="text-gray-900">preference details</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Title Section */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-display text-xl md:text-3xl font-extrabold text-[#09391C] mb-2">
            {preference.preferenceType === 'buy' ? 'Buy' :
             preference.preferenceType === 'rent' ? 'Rent' :
             preference.preferenceType === 'shortlet' ? 'Shortlet' :
             preference.preferenceType} Preference Details
          </h1>
          <p className="text-gray-600 text-sm md:text-base">Complete buyer preference information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold text-[#09391C] mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHome} className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {preference.preferenceType === 'buy' ? 'Buy' : 
                     preference.preferenceType === 'rent' ? 'Rent' : 
                     preference.preferenceType === 'shortlet' ? 'Shortlet' : 
                     preference.preferenceType}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize">{preference.preferenceMode}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(preference.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {preference.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#09391C] mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 mr-2" />
                Location
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">{formatLocation(preference.location)}</p>
                {preference.nearbyLandmark && (
                  <div>
                    <span className="text-gray-600">Nearby Landmark:</span>
                    <span className="ml-2 font-medium">{preference.nearbyLandmark}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#09391C] mb-4">Budget</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-semibold text-lg text-[#09391C]">
                    {formatPrice(preference.budget?.minPrice, preference.budget?.currency)} - {formatPrice(preference.budget?.maxPrice, preference.budget?.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{preference.budget?.currency ? preference.budget.currency.toUpperCase() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            {preference.propertyDetails && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#09391C] mb-4">Property Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preference.propertyDetails.propertyType && (
                    <div>
                      <span className="text-gray-600">Property Type:</span>
                      <span className="ml-2 font-medium">{preference.propertyDetails.propertyType}</span>
                    </div>
                  )}
                  
                  {preference.propertyDetails.buildingType && (
                    <div>
                      <span className="text-gray-600">Building Type:</span>
                      <span className="ml-2 font-medium">{preference.propertyDetails.buildingType}</span>
                    </div>
                  )}

                  {preference.propertyDetails.minBedrooms && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Min Bedrooms:</span>
                      <span className="font-medium">{preference.propertyDetails.minBedrooms}</span>
                    </div>
                  )}

                  {preference.propertyDetails.minBathrooms && (
                    <div>
                      <span className="text-gray-600">Min Bathrooms:</span>
                      <span className="ml-2 font-medium">{preference.propertyDetails.minBathrooms}</span>
                    </div>
                  )}

                  {preference.propertyDetails.propertyCondition && (
                    <div>
                      <span className="text-gray-600">Condition:</span>
                      <span className="ml-2 font-medium">{preference.propertyDetails.propertyCondition}</span>
                    </div>
                  )}

                  {preference.propertyDetails.landSize && (
                    <div>
                      <span className="text-gray-600">Land Size:</span>
                      <span className="ml-2 font-medium">
                        {preference.propertyDetails.landSize} {preference.propertyDetails.measurementUnit}
                      </span>
                    </div>
                  )}
                </div>

                {preference.propertyDetails.documentTypes && preference.propertyDetails.documentTypes.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-600">Required Documents:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preference.propertyDetails.documentTypes.map((doc, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Booking Details for Shortlet */}
            {preference.bookingDetails && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#09391C] mb-4">Booking Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preference.bookingDetails.checkInDate && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{formatDate(preference.bookingDetails.checkInDate)}</span>
                    </div>
                  )}

                  {preference.bookingDetails.checkOutDate && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{formatDate(preference.bookingDetails.checkOutDate)}</span>
                    </div>
                  )}

                  {preference.bookingDetails.numberOfGuests && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{preference.bookingDetails.numberOfGuests}</span>
                    </div>
                  )}

                  {preference.bookingDetails.travelType && (
                    <div>
                      <span className="text-gray-600">Travel Type:</span>
                      <span className="ml-2 font-medium">{preference.bookingDetails.travelType}</span>
                    </div>
                  )}

                  {preference.bookingDetails.preferredCheckInTime && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Check-in Time:</span>
                      <span className="font-medium">{preference.bookingDetails.preferredCheckInTime}</span>
                    </div>
                  )}

                  {preference.bookingDetails.preferredCheckOutTime && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Check-out Time:</span>
                      <span className="font-medium">{preference.bookingDetails.preferredCheckOutTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {preference.features && (preference.features.baseFeatures?.length || preference.features.premiumFeatures?.length) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#09391C] mb-4">Desired Features</h2>
                
                {preference.features.baseFeatures && preference.features.baseFeatures.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Base Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {preference.features.baseFeatures.map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {preference.features.premiumFeatures && preference.features.premiumFeatures.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Premium Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {preference.features.premiumFeatures.map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Notes */}
            {preference.additionalNotes && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#09391C] mb-4">Additional Notes</h2>
                <p className="text-gray-700">{preference.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Client name & contact */}
            {(preference.contactInfo || preference.buyer) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#09391C] mb-4">Client contact</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-gray-600 block">Name</span>
                      <span className="font-medium text-gray-900">
                        {preference.contactInfo?.fullName ||
                          preference.buyer?.fullName ||
                          "—"}
                      </span>
                    </div>
                  </div>
                  {(preference.contactInfo?.email || preference.buyer?.email) && (
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-600 block">Email</span>
                        <a
                          href={`mailto:${preference.contactInfo?.email || preference.buyer?.email}`}
                          className="font-medium text-[#09391C] break-all hover:underline"
                        >
                          {preference.contactInfo?.email || preference.buyer?.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {(preference.contactInfo?.phoneNumber || preference.buyer?.phoneNumber) && (
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-600 block">Phone</span>
                        <a
                          href={`tel:${preference.contactInfo?.phoneNumber || preference.buyer?.phoneNumber}`}
                          className="font-medium text-gray-900"
                        >
                          {preference.contactInfo?.phoneNumber || preference.buyer?.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {preference.contactInfo &&
              (preference.contactInfo.petsAllowed !== undefined ||
                preference.contactInfo.smokingAllowed !== undefined ||
                preference.contactInfo.partiesAllowed !== undefined ||
                preference.contactInfo.willingToPayExtra !== undefined) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-[#09391C] mb-4">Preferences</h2>
                  <div className="space-y-2">
                    {preference.contactInfo.petsAllowed !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pets Allowed:</span>
                        <span
                          className={`font-medium ${
                            preference.contactInfo.petsAllowed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {preference.contactInfo.petsAllowed ? "Yes" : "No"}
                        </span>
                      </div>
                    )}

                    {preference.contactInfo.smokingAllowed !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smoking Allowed:</span>
                        <span
                          className={`font-medium ${
                            preference.contactInfo.smokingAllowed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {preference.contactInfo.smokingAllowed ? "Yes" : "No"}
                        </span>
                      </div>
                    )}

                    {preference.contactInfo.partiesAllowed !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parties Allowed:</span>
                        <span
                          className={`font-medium ${
                            preference.contactInfo.partiesAllowed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {preference.contactInfo.partiesAllowed ? "Yes" : "No"}
                        </span>
                      </div>
                    )}

                    {preference.contactInfo.willingToPayExtra !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Willing to Pay Extra:</span>
                        <span
                          className={`font-medium ${
                            preference.contactInfo.willingToPayExtra ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {preference.contactInfo.willingToPayExtra ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}


            {/* Match preference (auto-pair with agent listings) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#09391C] mb-4">Match this preference</h2>

              {!isDealSiteReceiverModePref(preference) && !dealSiteGeneralMatchDenied ? (
              <div className="bg-[#8DDB90]/5 rounded-lg p-4 mb-4 border border-[#8DDB90]/20">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#8DDB90] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#09391C] text-sm mb-1">Auto-pair your listings</h3>
                    <p className="text-gray-600 text-xs">
                      We&apos;ll compare this buyer&apos;s preference with properties on your Practitioner page and email them when there are matches (or if there are none).
                    </p>
                  </div>
                </div>
              </div>
              ) : null}

              {publicPageCta && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                  <p className="mb-2">
                    Your Practitioner page must be active (<strong>running</strong>) to match preferences.
                  </p>
                  <Link
                    href="/public-access-page"
                    className="inline-flex font-semibold text-[#09391C] underline hover:text-[#8DDB90]"
                  >
                    Open Practitioner settings
                  </Link>
                </div>
              )}

              {isDealSiteReceiverModePref(preference) || dealSiteGeneralMatchDenied ? (
                <p className="text-sm text-gray-600 text-center py-2">
                  {dealSiteGeneralMatchMessage || DEAL_SITE_GENERAL_MARKETPLACE_COPY}
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleMatchPreference}
                    disabled={
                      matchLoading ||
                      matchLockedAfterSuccess ||
                      !["approved", "matched"].includes(
                        (preference.status || "").toLowerCase(),
                      )
                    }
                    className="w-full bg-[#8DDB90] hover:bg-[#7BC97F] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {matchLoading ? (
                      <span>Matching…</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Match preference
                      </>
                    )}
                  </button>

                  {!["approved", "matched"].includes((preference.status || "").toLowerCase()) && (
                    <p className="text-xs text-amber-700 mt-2 text-center">
                      Matching is only available when this preference is approved or already matched.
                    </p>
                  )}

                  {matchLockedAfterSuccess && (
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Matches were sent. Avoid running match again unless you intend to refresh pairing.
                    </p>
                  )}

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    {!user ? (
                      <>
                        You must{" "}
                        <span className="font-medium text-[#8DDB90]">log in</span> as an agent to match.
                      </>
                    ) : (
                      <>Requires an active practitioner page with running status.</>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceDetailPage;
