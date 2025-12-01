"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Grid, ExternalLink } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

interface Listing {
  _id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
}

export default function ListingsPage() {
  const { settings } = useDealSite();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await GET_REQUEST<any>(
        `${URLS.BASE}/account/properties?status=all`,
        token
      );
      if (res?.success && Array.isArray(res.data)) {
        setListings(res.data as Listing[]);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={loading} message="Loading listings..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Grid size={32} />
          All Listings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and view all your property listings
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#09391C]">
              {filteredListings.length} Listing{filteredListings.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "active"
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "inactive"
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first property listing to see it here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr
                    key={listing._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {listing.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{listing.type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      ₦{listing.price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {listing.location}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        <ExternalLink size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
