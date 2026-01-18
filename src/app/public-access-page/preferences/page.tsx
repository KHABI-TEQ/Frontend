"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Eye, Download, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface Preference {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  propertyType?: string;
  preferenceMode?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  location?: string;
  status?: string;
  createdAt?: string;
}

export default function PreferencesRequestsPage() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPropertyType, setFilterPropertyType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(itemsPerPage));
      if (searchTerm) params.append("search", searchTerm);
      if (filterPropertyType) params.append("preferenceMode", filterPropertyType);

      const url = `${URLS.BASE}${URLS.preferenceBaseUrl}/getApprovedForAgent?${params.toString()}`;
      const response = await GET_REQUEST<any>(url, token);

      if (response?.success && response?.data) {
        const prefsArray = Array.isArray(response.data) ? response.data : [];
        setPreferences(prefsArray);

        // Set pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.total || prefsArray.length);
        } else {
          setTotalPages(1);
          setTotalItems(prefsArray.length);
        }
      } else {
        setPreferences([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      toast.error("Failed to load preferences requests");
      setPreferences([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filterPropertyType]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterPropertyType(value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadCSV = () => {
    if (preferences.length === 0) {
      toast.error("No preferences to download");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Property Type", "Budget Min", "Budget Max", "Location", "Date"];
    const rows = preferences.map((pref) => [
      `${pref.firstName || ""} ${pref.lastName || ""}`.trim(),
      pref.email || "",
      pref.phoneNumber || "",
      pref.propertyType || "",
      pref.budget?.min || "",
      pref.budget?.max || "",
      pref.location || "",
      formatDate(pref.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `preferences-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Preferences downloaded successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] mb-2">Preferences Requests</h1>
        <p className="text-gray-600">View and manage all buyer preference requests submitted through your public access page</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-[#09391C]">{totalItems}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">This Page</p>
          <p className="text-3xl font-bold text-[#09391C]">{preferences.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Current Page</p>
          <p className="text-3xl font-bold text-[#09391C]">{currentPage} of {totalPages || 1}</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterPropertyType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Property Types</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="shortlet">Shortlet</option>
            <option value="joint-venture">Joint Venture</option>
          </select>

          {/* Download Button */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : preferences.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No preference requests found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Phone</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Property Type</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Budget Range</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Location</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map((pref, index) => (
                    <tr key={pref._id || `pref-${index}`} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {`${pref.firstName || ""} ${pref.lastName || ""}`.trim() || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{pref.email || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{pref.phoneNumber || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {pref.propertyType || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {pref.budget?.min || pref.budget?.max ? (
                            <>
                              {formatCurrency(pref.budget?.min)} - {formatCurrency(pref.budget?.max)}
                            </>
                          ) : (
                            "—"
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{pref.location || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-xs">{formatDate(pref.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
