/** @format */

"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Eye, Trash2, Clock, CheckCircle } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { useNotifications } from "@/context/notification-context";
import toast from "react-hot-toast";

type UserNotificationsProps = {
  closeNotificationModal: (type: boolean) => void;
};

const UserNotifications: React.FC<UserNotificationsProps> = ({
  closeNotificationModal,
}) => {
  const {
    notifications,
    isLoading: loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const divRef = useRef<HTMLDivElement | null>(null);

  // Prevent closing when clicking on tab buttons
  useClickOutside(divRef, (event) => {
    // Don't close if clicking on filter tab buttons
    if (
      event.target instanceof Element &&
      event.target.closest("[data-notification-tabs]")
    ) {
      return;
    }
    closeNotificationModal(false);
  });

  const deleteNotification = async (notificationId: string) => {
    try {
      toast.success("Notification deleted");
      // Note: You may want to add a delete function to the context if needed
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.isRead;
    return notif.isRead;
  });

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  const formatTimeAgo = (dateString: string) => {
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
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      ref={divRef}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed md:absolute right-2 md:right-0 top-16 md:top-full mt-2 w-[calc(100vw-1rem)] max-w-sm md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={() => closeNotificationModal(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex space-x-1 bg-gray-100 rounded-lg p-1"
          data-notification-tabs
        >
          {[
            { key: "all", label: `All (${notifications.length})` },
            { key: "unread", label: `Unread (${unreadCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={(e) => {
                e.stopPropagation();
                setFilter(tab.key as "all" | "unread");
              }}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <button
            onClick={() => {
              markAllAsRead();
              toast.success("All notifications marked as read");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm">
              {filter === "unread"
                ? "You're all caught up!"
                : "You'll see notifications here when you get them."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.slice(0, 10).map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50/50" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p
                        className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? "font-semibold" : ""
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            onClick={() => {
              closeNotificationModal(false);
              window.open("/notifications", "_blank");
            }}
            className="w-full text-sm text-center text-blue-600 hover:text-blue-700 font-medium py-1"
          >
            View all notifications
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default UserNotifications;