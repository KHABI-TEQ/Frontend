"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import {
  lasreraMarketplaceService,
  type LasreraMarketplaceProperty,
} from "@/services/lasreraMarketplaceService";
import { requestToMarketService } from "@/services/requestToMarketService";
import { buildLocationTitle } from "@/utils/helpers";
import toast from "react-hot-toast";
import Loading from "@/components/loading-component/loading";
import { ArrowLeft, MapPin, Tag, Handshake, CheckCircle, X } from "lucide-react";
import PropertyLocationMap from "@/components/property/PropertyLocationMap";

export default function LasreraMarketplacePage() {
  const { user } = useUserContext();
  const [properties, setProperties] = useState<LasreraMarketplaceProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ briefType: "", state: "", minPrice: "", maxPrice: "" });
  /** Property selected for "Verify address on map" modal (agent can confirm location before requesting to market) */
  const [propertyForMap, setPropertyForMap] = useState<LasreraMarketplaceProperty | null>(null);

  const isAgent = user?.userType === "Agent";

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lasreraMarketplaceService.getProperties({
        page,
        limit: 20,
        ...(filters.briefType && { briefType: filters.briefType }),
        ...(filters.state && { state: filters.state }),
        ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
      });
      if (res?.success && Array.isArray((res as any).data)) {
        setProperties((res as any).data);
        const pag = (res as any).pagination;
        if (pag?.totalPages) setTotalPages(pag.totalPages);
      } else {
        setProperties([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load publisher properties.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.briefType, filters.state, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleRequestToMarket = async (propertyId: string) => {
    if (!isAgent) {
      toast.error("Only Agents can request to market. Please log in as an Agent.");
      return;
    }
    setRequestingId(propertyId);
    try {
      const res = await requestToMarketService.create(propertyId);
      if (res?.success) {
        toast.success("Request to market submitted. The publisher will be notified.");
        fetchProperties();
      } else {
        toast.error((res as any)?.message || (res as any)?.error || "Request failed.");
      }
    } catch (e) {
      toast.error("Failed to submit request.");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F1]">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#09391C] hover:text-[#8DDB90] font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#09391C] mb-2">
            KHABITEQ Market Place
          </h1>
          <p className="text-[#5A5D63] max-w-2xl">
            Properties published by Landlords and Developers. Contact details are not shown.
            {isAgent
              ? " As an Agent, you can request to market any listing below; the publisher will accept or reject."
              : " Sign in as an Agent to request to market a property."}
          </p>
        </div>

        {/* Simple filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.briefType}
              onChange={(e) => setFilters((f) => ({ ...f, briefType: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="Outright Sales">Outright Sales</option>
              <option value="Rent">Rent</option>
              <option value="Shortlet">Shortlet</option>
              <option value="Joint Venture">Joint Venture</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              placeholder="e.g. Lagos"
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min price (₦)</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max price (₦)</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
            />
          </div>
          <button
            type="button"
            onClick={() => setPage(1)}
            className="px-4 py-2 bg-[#09391C] text-white rounded-lg text-sm font-medium hover:bg-[#0d4a24]"
          >
            Apply
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-[#5A5D63]">
            <Tag className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-medium text-[#09391C]">No publisher properties found</p>
            <p className="mt-2">Try adjusting filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => {
                const title = buildLocationTitle(prop.location) || prop.propertyType || "Property";
                const img = (Array.isArray(prop.pictures) && prop.pictures[0]) ? prop.pictures[0] : null;
                return (
                  <div
                    key={prop._id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Tag size={40} />
                        </div>
                      )}
                      {prop.briefType && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-[#09391C] text-white text-xs font-medium rounded">
                          {prop.briefType}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-[#09391C] line-clamp-2 mb-1">{title}</h2>
                      {prop.location && (
                        <p className="flex items-center gap-1 text-sm text-[#5A5D63] mb-1">
                          <MapPin size={14} />
                          {buildLocationTitle(prop.location) || "—"}
                        </p>
                      )}
                      {prop.location && (buildLocationTitle(prop.location) || "").trim() && (
                        <button
                          type="button"
                          onClick={() => setPropertyForMap(prop)}
                          className="text-xs text-[#09391C] hover:text-[#8DDB90] font-medium underline mb-2"
                        >
                          Verify address on map
                        </button>
                      )}
                      {typeof prop.price === "number" && (
                        <p className="text-lg font-semibold text-[#8DDB90] mb-2">
                          ₦{prop.price.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-medium text-[#09391C] mb-2">
                        Agent commission: ₦{typeof prop.agentCommissionAmount === "number" ? prop.agentCommissionAmount.toLocaleString() : "0"}
                      </p>
                      {typeof prop.requestToMarketCount === "number" && prop.requestToMarketCount > 0 && (
                        <p className="text-xs text-[#5A5D63] mb-3">
                          {prop.requestToMarketCount} agent{prop.requestToMarketCount !== 1 ? "s have" : " has"} requested to market
                        </p>
                      )}
                      {isAgent ? (
                        prop.currentUserHasRequested ? (
                          <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200">
                            <CheckCircle size={16} />
                            You&apos;ve requested
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={requestingId === prop._id}
                            onClick={() => handleRequestToMarket(prop._id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#09391C] text-white rounded-lg text-sm font-medium hover:bg-[#0d4a24] disabled:opacity-50"
                          >
                            {requestingId === prop._id ? (
                              <span className="animate-pulse">Submitting...</span>
                            ) : (
                              <>
                                <Handshake size={16} />
                                Request To Market
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <p className="text-sm text-[#5A5D63] py-2">
                          Log in as an Agent to request to market this property.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[#5A5D63]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Verify address on map modal — agent can confirm location before requesting to market */}
        {propertyForMap && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setPropertyForMap(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-modal-title"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 id="map-modal-title" className="text-lg font-semibold text-[#09391C]">
                  Verify property address
                </h2>
                <button
                  type="button"
                  onClick={() => setPropertyForMap(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-[#5A5D63]"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-[#5A5D63] mb-4">
                  Confirm this address on the map before requesting to market. If the location looks correct, you can request to market below.
                </p>
                {propertyForMap.location &&
                (propertyForMap.location.state ||
                  propertyForMap.location.localGovernment ||
                  propertyForMap.location.area) ? (
                  <PropertyLocationMap
                    location={{
                      state: propertyForMap.location.state,
                      localGovernment: propertyForMap.location.localGovernment,
                      area: propertyForMap.location.area,
                      streetAddress: propertyForMap.location.streetAddress,
                    }}
                    propertyTitle={buildLocationTitle(propertyForMap.location) || "Property"}
                  />
                ) : (
                  <div className="py-8 text-center text-[#5A5D63]">
                    <MapPin className="mx-auto mb-2 text-gray-400" size={32} />
                    <p>Location information not available for this property.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPropertyForMap(null)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-[#09391C] font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {isAgent &&
                  propertyForMap &&
                  !propertyForMap.currentUserHasRequested && (
                    <button
                      type="button"
                      disabled={requestingId === propertyForMap._id}
                      onClick={() => {
                        handleRequestToMarket(propertyForMap._id);
                        setPropertyForMap(null);
                      }}
                      className="px-4 py-2.5 bg-[#09391C] text-white rounded-lg font-medium hover:bg-[#0d4a24] disabled:opacity-50 flex items-center gap-2"
                    >
                      {requestingId === propertyForMap._id ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Handshake size={18} />
                          Request To Market
                        </>
                      )}
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
