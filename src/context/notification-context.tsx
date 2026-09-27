"use client";
/** @format */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { getBuyerToken } from "@/lib/search-insurance";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "general" | "property_update" | "inspection" | "booking" | "other" | string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionUrl?: string;
  meta?: {
    actionPath?: string;
    href?: string;
    [key: string]: unknown;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (audience?: "account" | "buyer") => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const sourceRef = useRef<"account" | "buyer">("account");

  const fetchNotifications = useCallback(async (audience?: "account" | "buyer") => {
    const token = Cookies.get("token");
    const buyerToken = getBuyerToken();
    const useBuyer = audience === "buyer" ? Boolean(buyerToken) : !token && Boolean(buyerToken);
    if ((!token && !buyerToken) || (audience === "buyer" && !buyerToken) || inFlightRef.current) return;

    try {
      inFlightRef.current = true;
      setIsLoading(true);
      sourceRef.current = useBuyer ? "buyer" : "account";

      if (!useBuyer && token) {
        const response = await GET_REQUEST(
          `${URLS.BASE}/account/notifications?limit=50&page=1`,
          token,
        );

        if (response?.success && response?.data) {
          setNotifications((response.data as Notification[]) || []);
        }
      } else if (useBuyer && buyerToken) {
        const response = await fetch(
          `${URLS.BASE}/buyer/auth/me/notifications?limit=50&page=1`,
          { headers: { Authorization: `Bearer ${buyerToken}` } },
        );
        const json = (await response.json()) as { success?: boolean; data?: Notification[] };
        if (json?.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );

      // Update server
      const accountToken = Cookies.get("token");
      const buyerToken = accountToken ? null : getBuyerToken();
      const url =
        sourceRef.current === "buyer" && buyerToken
          ? `${URLS.BASE}/buyer/auth/me/notifications/${notificationId}/read`
          : `${URLS.BASE}/account/notifications/${notificationId}/markRead`;
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountToken || buyerToken || ""}`,
        },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );

      // Update server
      const accountToken = Cookies.get("token");
      const buyerToken = accountToken ? null : getBuyerToken();
      const url =
        sourceRef.current === "buyer" && buyerToken
          ? `${URLS.BASE}/buyer/auth/me/notifications/mark-all-read`
          : `${URLS.BASE}/account/notifications/markAllRead`;
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountToken || buyerToken || ""}`,
        },
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
