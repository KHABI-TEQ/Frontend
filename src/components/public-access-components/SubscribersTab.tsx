"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Trash2, Download, Search, Users } from "lucide-react";
import { GET_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

interface Subscriber {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Subscriber[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const statusColors: Record<string, { badge: string; text: string }> = {
  subscribed: { badge: "badge-green", text: "Subscribed" },
  unsubscribed: { badge: "badge-gray", text: "Unsubscribed" },
};

const SubscribersTab: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | "all">("subscribed");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 10,
  });

  const loadSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      let url = `${URLS.BASE}/account/dealSite/email-subscribers?page=${page}&limit=${pagination.limit}`;

      if (selectedStatus !== "all") {
        url += `&status=${selectedStatus}`;
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const res = await GET_REQUEST<ApiResponse>(url, token);

      if (res?.success && res.data) {
        setSubscribers(res.data);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total,
            pages: res.pagination.pages,
            limit: res.pagination.limit,
          });
        }
      } else {
        toast.error("Failed to load subscribers");
      }
    } catch (error) {
      console.error("Error loading subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedStatus, searchTerm, pagination.limit]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const handleDelete = async (subscriberId: string) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = Cookies.get("token");
      const res = await DELETE_REQUEST(
        `${URLS.BASE}/account/dealSite/email-subscribers/${subscriberId}`,
        undefined,
        token
      );

      if (res?.success) {
        toast.success("Subscriber deleted successfully");
        setSubscribers((prev) => prev.filter((sub) => sub._id !== subscriberId));
      } else {
        toast.error(res?.message || "Failed to delete subscriber");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to delete subscriber");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = Cookies.get("token");

      let url = `${URLS.BASE}/account/dealSite/email-subscribers/export/csv`;
      if (selectedStatus !== "all") {
        url += `?status=${selectedStatus}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast.success("Subscribers exported successfully");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error("Failed to export subscribers");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilter = (status: string | "all") => {
    setSelectedStatus(status);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const colors = statusColors[status] || statusColors.subscribed;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
        {colors.text}
      </span>
    );
  };

  const getFullName = (subscriber: Subscriber) => {
    const name = [subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ");
    return name || "N/A";
  };

  return (
    <div className="space-y-6">
      <OverlayPreloader visible={isDeleting || isExporting} message={isExporting ? "Exporting..." : "Deleting..."} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2">
          <Users size={24} />
          Email Subscribers ({pagination.total})
        </h2>
        <button
          onClick={handleExport}
          disabled={isExporting || subscribers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">All Status</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No subscribers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Subscribed Date</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getFullName(subscriber)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(subscriber.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete subscriber"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscribersTab;
