/**
 * Public Access Page - Overview Dashboard
 * Main dashboard view showing statistics and recent activity
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { BarChart3, Copy, ExternalLink, Pause, Play, Settings } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import type { DealSiteLog } from "@/types/api-responses";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import ConfirmationModal from "@/components/public-access-page/ConfirmationModal";

interface DashboardStats {
  viewsByDay: Array<{ date: string; count: number }>;
  totalViews?: number;
  totalClicks?: number;
}

export default function OverviewPage() {
  const router = useRouter();
  const { settings, previewUrl, isPaused, isOnHold, dealSiteStatus, pauseDealSite, resumeDealSite } = useDealSite();

  // Analytics state
  const [stats, setStats] = useState<DashboardStats>({ viewsByDay: [] });
  const [logs, setLogs] = useState<DealSiteLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [preloader, setPreloader] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action?: "pause" | "resume";
    isLoading?: boolean;
  }>({ isOpen: false });

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await GET_REQUEST<any>(`${URLS.BASE}${URLS.fetchDashboardStats}`, token);
      if (res?.success && res.data) {
        setStats({
          viewsByDay: res.data.viewsByDay || [],
          totalViews: res.data.totalViews,
          totalClicks: res.data.totalClicks,
        });
      }
    } catch (error) {
      console.warn("Failed to fetch analytics:", error);
      // Continue with empty stats - don't crash
      setStats({ viewsByDay: [] });
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const token = Cookies.get("token");

      if (!token || !settings.publicSlug) {
        setLogs([]);
        return;
      }

      const res = await GET_REQUEST<any>(
        `${URLS.BASE}${URLS.dealSiteLogs}`.replace(":slug", settings.publicSlug) + "?limit=10",
        token
      );
      if (res?.success && Array.isArray(res.data)) {
        setLogs(res.data as DealSiteLog[]);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.warn("Failed to fetch logs:", error);
      // Continue with empty logs - don't crash
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [settings.publicSlug]);

  useEffect(() => {
    fetchAnalytics();
    if (settings.publicSlug) {
      fetchLogs();
    }
  }, [fetchAnalytics, fetchLogs, settings.publicSlug]);

  const openPauseConfirmation = useCallback(() => {
    setConfirmModal({ isOpen: true, action: "pause", isLoading: false });
  }, []);

  const openResumeConfirmation = useCallback(() => {
    setConfirmModal({ isOpen: true, action: "resume", isLoading: false });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      if (confirmModal.action === "pause") {
        await pauseDealSite();
        toast.success("Public Access Page paused successfully");
      } else if (confirmModal.action === "resume") {
        await resumeDealSite();
        toast.success("Public Access Page resumed successfully");
      }
      setConfirmModal({ isOpen: false });
    } catch (error) {
      toast.error(`Failed to ${confirmModal.action} page`);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  }, [confirmModal.action, pauseDealSite, resumeDealSite]);

  const handleCancelAction = useCallback(() => {
    setConfirmModal({ isOpen: false });
  }, []);

  const copyLink = useCallback(async () => {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [previewUrl]);

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cleanLogText = (text: string | undefined) => {
    if (!text) return "";
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Loading..." />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <BarChart3 size={32} />
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Monitor your public access page performance and activity</p>
      </div>

      {/* Pending Review Banner */}
      {dealSiteStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Public Access Page is Pending Review</h3>
            <p className="text-sm text-amber-800 mt-1">
              Your page is currently under review. You can continue customizing your settings, but the page will not be visible to the public until approved.
            </p>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#09391C]">
              Your page is {dealSiteStatus === "on-hold" ? "under review" : isPaused ? "paused" : "live"}
            </h2>
            {previewUrl && dealSiteStatus !== "pending" && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1 break-all"
                >
                  {previewUrl}
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={copyLink}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Only show pause/resume buttons when status is paused or running */}
            {(dealSiteStatus === "paused" || dealSiteStatus === "running") && (
              <>
                {!isPaused ? (
                  <button
                    onClick={openPauseConfirmation}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={openResumeConfirmation}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <Play size={16} />
                    Resume
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => router.push("/public-access-page/branding")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all"
            >
              <Settings size={16} />
              Edit Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={stats?.totalViews?.toLocaleString() || "0"}
          icon="👁️"
        />
        <StatCard
          title="This Month"
          value={Array.isArray(stats?.viewsByDay) && stats.viewsByDay.length > 0 ? stats.viewsByDay[stats.viewsByDay.length - 1].count : "0"}
          icon="📊"
        />
        <StatCard
          title="Status"
          value={isPaused ? "Paused" : "Live"}
          icon={isPaused ? "⏸️" : "✅"}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#09391C] mb-4">Recent Activity</h2>

        {logsLoading ? (
          <div className="py-12 text-center text-gray-500">Loading activities...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No activities recorded yet</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-[#09391C]">
                      {cleanLogText(log.action) || cleanLogText(log.category) || "Activity"}
                    </p>
                    {log.description && (
                      <p className="text-sm text-gray-600 mt-1">{cleanLogText(log.description)}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-gray-500">
                      <span>By {log.actor?.firstName || log.actor?.email || "Unknown"}</span>
                      {log.actorModel && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
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
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickLink
          title="Edit Page Branding"
          description="Customize your page title, description, and logo"
          icon="🎨"
          onClick={() => router.push("/public-access-page/branding")}
        />
        <QuickLink
          title="View Live Page"
          description="See how your page looks to visitors"
          icon="👁️"
          onClick={() => previewUrl && window.open(previewUrl, "_blank")}
        />
        <QuickLink
          title="Manage Listings"
          description="Select featured and manage all your listings"
          icon="📋"
          onClick={() => router.push("/public-access-page/featured")}
        />
        <QuickLink
          title="Payment Settings"
          description="Update your bank details and payment information"
          icon="💳"
          onClick={() => router.push("/public-access-page/payment")}
        />
      </div>

      {/* Confirmation Modal for Pause/Resume */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === "pause" ? "Pause Public Access Page?" : "Resume Public Access Page?"}
        description={
          confirmModal.action === "pause"
            ? "Your public access page will no longer be visible to visitors."
            : "Your public access page will be live again for all visitors."
        }
        message={
          confirmModal.action === "pause"
            ? "Visitors will see a 'page unavailable' message. You can resume at any time."
            : "All your listings and settings will be visible immediately."
        }
        confirmText={confirmModal.action === "pause" ? "Yes, Pause" : "Yes, Resume"}
        cancelText="Cancel"
        isDangerous={confirmModal.action === "pause"}
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        icon={confirmModal.action === "pause" ? "alert" : "check"}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-[#09391C] mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-30">{icon}</div>
      </div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[#09391C]">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </button>
  );
}
