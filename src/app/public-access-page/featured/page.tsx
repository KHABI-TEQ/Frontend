"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Star, Save, ExternalLink } from "lucide-react";
import api from "@/utils/axiosConfig";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

interface Property {
  _id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  images?: string[];
  isFeatured?: boolean;
}

export default function FeaturedPage() {
  const { settings, updateSettings } = useDealSite();
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all properties
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await api.get("/account/properties/fetchAll");

      if (response.data?.success && Array.isArray(response.data.data)) {
        setProperties(response.data.data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      toast.error("Failed to load properties");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load featured list from settings
  useEffect(() => {
    fetchProperties();
    
    // Initialize featured IDs from settings
    if (settings?.featureSelection?.featuredListings) {
      setFeaturedIds(new Set(settings.featureSelection.featuredListings));
    }
  }, [fetchProperties, settings]);

  const handleToggleFeatured = useCallback((propertyId: string) => {
    setFeaturedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        featureSelection: {
          ...settings.featureSelection,
          featuredListings: Array.from(featuredIds),
        },
      };
 
      const res = await api.put(`/account/dealSite/${settings.publicSlug}/featureSelection/update`, payload);

      if (res?.data?.success) {
        updateSettings(payload as any);
        toast.success("Featured listings updated successfully");
      } else {
        toast.error(res?.data?.message || "Failed to save featured listings");
      }
    } catch (error) {
      console.error("Failed to save featured listings:", error);
      toast.error("Failed to save featured listings");
    } finally {
      setIsSaving(false);
    }
  }, [featuredIds, settings, updateSettings]);

  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={isSaving} message="Saving featured listings..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Star size={32} />
          Featured Listings
        </h1>
        <p className="text-gray-600 mt-2">
          Select which properties appear as featured on your public access page
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Featured Listings</p>
            <p className="text-2xl font-bold text-[#09391C]">
              {featuredIds.size} of {properties.length}
            </p>
          </div>
          <Star size={48} className="text-amber-500" />
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Properties Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-2">No properties found</p>
            <p className="text-sm text-gray-400">
              Create and list properties first to feature them on your public page
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No properties match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProperties.map((property) => {
              const isFeatured = featuredIds.has(property._id);
              return (
                <div
                  key={property._id}
                  className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
                    isFeatured
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleToggleFeatured(property._id)}
                >
                  {/* Image */}
                  {property.images && property.images.length > 0 && (
                    <div className="relative h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      {isFeatured && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-2">
                          <Star size={20} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-[#09391C] text-lg mb-1 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-bold text-[#09391C]">{formatCurrency(property.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-semibold text-gray-700">{property.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            property.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : property.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {property.status}
                        </span>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isFeatured
                            ? "bg-amber-500 border-amber-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isFeatured && (
                          <Star size={14} className="text-white" fill="currentColor" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {isFeatured ? "Featured" : "Not Featured"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      {properties.length > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Featured listings are prominently displayed on your public access page and in your
          marketplace. Click on a property card to toggle its featured status.
        </p>
      </div>
    </div>
  );
}
