/** @format */

"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

// Types
interface PropertyDetails {
  _id: string;
  title: string;
  location: string;
  price: number;
  propertyType: string;
  briefType: string;
  pictures: string[];
}

interface Transaction {
  _id: string;
  transactionRef: string;
  amount: number;
  status: string;
}

interface Inspection {
  _id: string;
  propertyId: PropertyDetails;
  bookedBy: string | null;
  bookedByModel: string | null;
  inspectionDate: string;
  inspectionTime: string;
  status: string;
  transaction: Transaction;
  isNegotiating: boolean;
  isLOI: boolean;
  inspectionType: string;
  inspectionStatus: string;
  negotiationPrice?: number;
  letterOfIntention?: string | null;
  reason?: string;
  owner: string;
  pendingResponseFrom: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    inspections: Inspection[];
    pagination: PaginationInfo;
  };
}

// Filter options
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active_negotiation", label: "Active Negotiation" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const INSPECTION_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "price", label: "Price Negotiation" },
  { value: "loi", label: "Letter of Intention" },
  { value: "inspection", label: "Property Inspection" },
];

const MyInspectionRequests: React.FC = () => {
  // State management
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("");
  const [inspectionType, setInspectionType] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch inspections
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pagination.limit.toString());

      if (status) params.append("status", status);
      if (inspectionType) params.append("inspectionType", inspectionType);
      if (search) params.append("search", search);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/agent/my-inspections?${params.toString()}`;
      const response = await axios.get<ApiResponse>(url);

      if (response.data.success) {
        setInspections(response.data.data.inspections);
        setPagination(response.data.data.pagination);
      } else {
        toast.error("Failed to fetch inspections");
      }
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toast.error("Failed to fetch inspections");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pagination.limit,
    status,
    inspectionType,
    search,
    dateFrom,
    dateTo,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Get status badge color
  const getStatusBadgeColor = useCallback((status: string): string => {
    switch (status) {
      case "active_negotiation":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Get inspection type badge color
  const getInspectionTypeBadgeColor = useCallback((type: string): string => {
    switch (type) {
      case "price":
        return "bg-emerald-100 text-emerald-800";
      case "loi":
        return "bg-purple-100 text-purple-800";
      case "inspection":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setStatus("");
    setInspectionType("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  // Memoized filtered data count
  const totalInspections = useMemo(() => pagination.total, [pagination.total]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Inspection Requests
          </h1>
          <p className="text-gray-600">
            View and manage all your property inspection requests
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Total: {totalInspections} inspection
            {totalInspections !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by property, location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Inspection Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                {INSPECTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Clear All Filters
            </button>

            <button
              onClick={fetchInspections}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading inspections...</span>
            </div>
          </div>
        ) : inspections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No inspections found
            </h3>
            <p className="text-gray-600">
              No inspection requests match your current filters.
            </p>
          </div>
        ) : (
          <>
            {/* Inspections List */}
            <div className="space-y-4">
              <AnimatePresence>
                {inspections.map((inspection) => (
                  <motion.div
                    key={inspection._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {inspection.propertyId.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {inspection.propertyId.location} •{" "}
                            {inspection.propertyId.propertyType}
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(inspection.status)}`}
                          >
                            {inspection.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInspectionTypeBadgeColor(inspection.inspectionType)}`}
                          >
                            {inspection.inspectionType.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Property Price
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(inspection.propertyId.price)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Inspection Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(
                              new Date(inspection.inspectionDate),
                              "MMM dd, yyyy",
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            {inspection.inspectionTime}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Transaction
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(inspection.transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {inspection.transaction.transactionRef}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Stage
                          </p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {inspection.stage}
                          </p>
                          <p className="text-xs text-gray-600">
                            Response from: {inspection.pendingResponseFrom}
                          </p>
                        </div>
                      </div>

                      {/* Negotiation Details */}
                      {inspection.isNegotiating &&
                        inspection.negotiationPrice && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  Negotiation Price
                                </p>
                                <p className="text-lg font-bold text-blue-900">
                                  {formatCurrency(inspection.negotiationPrice)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-blue-700">
                                  Status: {inspection.inspectionStatus}
                                </p>
                              </div>
                            </div>
                            {inspection.reason && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-blue-700 mb-1">
                                  Reason:
                                </p>
                                <p className="text-sm text-blue-900">
                                  {inspection.reason}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Created:{" "}
                            {format(
                              new Date(inspection.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </span>
                          <span>
                            Updated:{" "}
                            {format(
                              new Date(inspection.updatedAt),
                              "MMM dd, yyyy",
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            View Details
                          </button>
                          {inspection.isNegotiating && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Manage Negotiation
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, pagination.page - 1))
                      }
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: pagination.pages },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === pagination.page
                              ? "bg-emerald-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(pagination.pages, pagination.page + 1),
                        )
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyInspectionRequests;
