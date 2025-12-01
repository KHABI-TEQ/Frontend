"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Activity, Download, Filter } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import type { DealSiteLog } from "@/types/api-responses";

export default function LogsPage() {
  const { settings } = useDealSite();
  const [logs, setLogs] = useState<DealSiteLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");

      if (!token || !settings.publicSlug) {
        setLogs([]);
        return;
      }

      let url = `${URLS.BASE}${URLS.dealSiteLogs}`.replace(":slug", settings.publicSlug) + `?limit=${limit}&page=${page}`;

      if (filter !== "all") {
        url += `&category=${filter}`;
      }

      const res = await GET_REQUEST<any>(url, token);
      if (res?.success && Array.isArray(res.data)) {
        setLogs(res.data as DealSiteLog[]);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [settings.publicSlug, filter, page, limit]);

  useEffect(() => {
    if (settings.publicSlug) {
      fetchLogs();
    }
  }, [fetchLogs, settings.publicSlug]);

  const cleanLogText = (text: string | undefined) => {
    if (!text) return "";
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadLogs = () => {
    try {
      const csvContent = [
        ["Date", "Action", "Category", "Actor", "Role", "Description"],
        ...logs.map((log) => [
          formatDateTime(log.createdAt),
          cleanLogText(log.action),
          log.category || "General",
          log.actor?.firstName || log.actor?.email || "Unknown",
          log.actorModel || "N/A",
          log.description || "",
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Logs downloaded successfully");
    } catch (error) {
      toast.error("Failed to download logs");
    }
  };

  const getCategoryColor = (category?: string) => {
    const colorMap: Record<string, string> = {
      view: "bg-blue-50 text-blue-700 border-blue-200",
      edit: "bg-amber-50 text-amber-700 border-amber-200",
      delete: "bg-red-50 text-red-700 border-red-200",
      create: "bg-emerald-50 text-emerald-700 border-emerald-200",
      publish: "bg-purple-50 text-purple-700 border-purple-200",
      archive: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      colorMap[category?.toLowerCase() || ""] ||
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  };

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={loading} message="Loading logs..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Activity size={32} />
          Activity Logs
        </h1>
        <p className="text-gray-600 mt-2">
          View all activities and changes made to your public page
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
            >
              <option value="all">All Activities</option>
              <option value="view">Views</option>
              <option value="edit">Edits</option>
              <option value="create">Creates</option>
              <option value="delete">Deletes</option>
              <option value="publish">Publishes</option>
            </select>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleDownloadLogs}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No activity logs found</p>
            <p className="text-gray-400 text-sm mt-1">
              Activities will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="font-semibold text-[#09391C]">
                        {cleanLogText(log.action) ||
                          cleanLogText(log.category) ||
                          "Activity"}
                      </p>
                      {log.category && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {cleanLogText(log.description)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                      <span>
                        By{" "}
                        {log.actor?.firstName || log.actor?.email || "Unknown"}
                      </span>
                      {log.actorModel && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {log.actorModel}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, logs.length)} of {logs.length} logs
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={logs.length < limit}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
