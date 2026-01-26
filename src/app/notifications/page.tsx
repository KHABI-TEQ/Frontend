/** @format */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  CheckCircle,
  X,
  Filter,
  MoreVertical,
  ArrowLeft,
  Search,
  ArrowLeftIcon,
} from "lucide-react";
import { GET_REQUEST, PUT_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";
import NotificationCardSkeleton from "@/components/loading-component/NotificationCardSkeleton";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // New state for load more loading
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const { user } = useUserContext();

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  const fetchNotifications = async (page: number = currentPage, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await GET_REQUEST(
        `${URLS.BASE}/account/notifications?limit=5&withPagination=true&page=${page}`,
        Cookies.get("token") || "",
      );

      if (response?.success && response?.data) {
        if (reset) {
          // Replace notifications (for initial load or refresh)
          setNotifications(response.data as any);
        } else {
          // Append notifications (for load more)
          setNotifications(prev => [...prev, ...(response.data as any)]);
        }
        setTotalPages((response.pagination as any).totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const markAsRead = async (notificationId: string) => {

    try {
      const response = await PUT_REQUEST(
        `${URLS.BASE}/account/notifications/${notificationId}/markRead`,
        {},
        Cookies.get("token") || "",
      );

      if (response?.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      toast.error("Error marking notification as unread");
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await PUT_REQUEST(
        `${URLS.BASE}/account/notifications/${notificationId}/markUnRead`,
        {},
        Cookies.get("token") || "",
      );

      if (response?.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: false } : notif,
          ),
        );
        toast.success("Marked as unread");
      }
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      // Update local state anyway for better UX
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: false } : notif,
        ),
      );
      toast.success("Marked as unread");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Attempt API call
      await DELETE_REQUEST(
        `${URLS.BASE}/account/notifications/${notificationId}/delete`,
        {},
        Cookies.get("token"),
      );

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) {
      toast.error("No notifications selected");
      return;
    }

    try {
      await DELETE_REQUEST(
        `${URLS.BASE}/account/notifications/bulkDelete`,
        { notificationIds: selectedNotifications },
        Cookies.get("token") || "",
      );

      setNotifications((prev) =>
        prev.filter((notif) => !selectedNotifications.includes(notif._id)),
      );

      setSelectedNotifications([]);

      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((notif) => !notif.isRead)
        .map((notif) => notif._id);

      if (unreadIds.length === 0) {
        toast("No unread notifications");
        return;
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );

      toast.success("All notifications marked as read");

      // Attempt API call
      await PUT_REQUEST(
        `${URLS.BASE}/account/notifications/markAllRead`,
        {},
        Cookies.get("token") || "",
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "unread"
          ? !notif.isRead
          : notif.isRead;

    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const readCount = notifications.filter((notif) => notif.isRead).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map((notif) => notif._id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (
    notificationId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedNotifications((prev) => [...prev, notificationId]);
    } else {
      setSelectedNotifications((prev) =>
        prev.filter((id) => id !== notificationId),
      );
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchNotifications(currentPage + 1, false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-[#8DDB90] border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CombinedAuthGuard
      requireAuth={true} // User must be logged in
      allowedUserTypes={["Agent", "Landowners", "FieldAgent"]} // Only these user types can access
      requireAgentOnboarding={false} // If an agent, require onboarding
      requireAgentApproval={false} // If an agent, require approval
      agentCustomMessage="You must complete onboarding and be approved before you view notifications."
    >
      <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
              <ArrowLeftIcon size={20} />
              Back to Dashboard
            </Link>
          </div>
          
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft size={20} className="text-[#5A5D63]" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display">
                  Notifications
                </h1>
                <p className="text-[#5A5D63] text-sm md:text-base">
                  Stay updated with your property activities
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <AnimatePresence>
                    {showFilterMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                      >
                        {["all", "unread", "read"].map((filterOption) => (
                          <button
                            key={filterOption}
                            onClick={() => {
                              setFilter(filterOption as typeof filter);
                              setShowFilterMenu(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              filter === filterOption
                                ? "bg-[#8DDB90]/10 text-[#09391C]"
                                : ""
                            }`}
                          >
                            {filterOption === "all" &&
                              `All (${notifications.length})`}
                            {filterOption === "unread" &&
                              `Unread (${unreadCount})`}
                            {filterOption === "read" && `Read (${readCount})`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2.5 bg-[#8DDB90] hover:bg-[#7BC87F] text-white rounded-lg transition-colors text-sm"
                  >
                    Mark all read
                  </button>
                )}

                {/* Delete selected */}
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={deleteSelectedNotifications}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Delete ({selectedNotifications.length})
                  </button>
                )}
              </div>
            </div>

            {/* Bulk actions */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedNotifications.length ===
                      filteredNotifications.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#8DDB90] rounded focus:ring-[#8DDB90]"
                  />
                  <span className="text-sm text-gray-600">
                    Select all ({filteredNotifications.length})
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 && !loadingMore ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : filter === "unread"
                      ? "You have no unread notifications"
                      : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    isSelected={selectedNotifications.includes(notification._id)}
                    onSelect={(checked) =>
                      handleSelectNotification(notification._id, checked)
                    }
                    onMarkAsRead={() => markAsRead(notification._id)}
                    onMarkAsUnread={() => markAsUnread(notification._id)}
                    onDelete={() => deleteNotification(notification._id)}
                  />
                ))}
                
                {/* Show skeleton when loading more */}
                {loadingMore && (
                  <>
                    <NotificationCardSkeleton />
                    <NotificationCardSkeleton />
                    <NotificationCardSkeleton />
                  </>
                )}
              </>
            )}
          </div>

          {/* Load more button */}
          {currentPage < totalPages && !loadingMore && (
            <div className="text-center mt-8">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-3 border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white rounded-lg transition-colors font-medium"
              >
                Load more notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
};

interface NotificationCardProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onDelete: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "warning":
        return <Clock size={20} className="text-yellow-500" />;
      case "error":
        return <X size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
        !notification.isRead
          ? "border-l-4 border-l-[#8DDB90] bg-blue-50/30"
          : "border-gray-100"
      } ${isSelected ? "ring-2 ring-[#8DDB90]" : ""}`}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-[#8DDB90] rounded focus:ring-[#8DDB90] mt-1"
          />

          {/* Icon */}
          <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3
                  className={`text-base font-medium text-gray-900 mb-2 ${
                    !notification.isRead ? "font-semibold" : ""
                  }`}
                >
                  {notification.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{formatDate(notification.createdAt)}</span>
                  {!notification.isRead && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                      Unread
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More actions"
                >
                  <MoreVertical size={16} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                    >
                      <button
                        onClick={() => {
                          if (notification.isRead) {
                            onMarkAsUnread();
                          } else {
                            onMarkAsRead();
                          }
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm first:rounded-t-lg"
                      >
                        {notification.isRead
                          ? "Mark as unread"
                          : "Mark as read"}
                      </button>
                      <button
                        onClick={() => {
                          onDelete();
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors text-sm last:rounded-b-lg"
                      >
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
