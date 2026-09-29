"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUserContext } from "@/context/user-context";
import { useNotifications } from "@/context/notification-context";
import { getBuyerToken } from "@/lib/search-insurance";

export function actionPathOf(notification: {
  actionUrl?: string;
  meta?: { actionPath?: string; href?: string };
}): string | null {
  const raw = notification.meta?.actionPath || notification.meta?.href || notification.actionUrl;
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return null;
}

/** Show stored email HTML as a readable notification sentence. */
export function notificationText(value: string): string {
  const raw = String(value || "");
  if (!/<[a-z!/][^>]*>/i.test(raw)) return raw;
  let next = raw
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  const greeting = next.search(/\bDear\b/i);
  if (greeting > 0 && greeting < 120) next = next.slice(greeting);
  next = next.replace(/\s*Copyright\s*©[\s\S]*$/i, "");
  next = next.replace(/\s+/g, " ").trim();
  return next.length > 280 ? `${next.slice(0, 277)}…` : next;
}

export function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

/** In-app notification bell for every signed-in account type. */
export default function NotificationBell({
  audience = "account",
}: {
  audience?: "account" | "buyer";
} = {}) {
  const { user } = useUserContext();
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(
      audience === "buyer"
        ? Boolean(getBuyerToken())
        : Boolean(user?._id || user?.id || getBuyerToken()),
    );
  }, [user, audience]);

  useEffect(() => {
    if (!signedIn) return;
    void fetchNotifications(audience === "buyer" ? "buyer" : undefined);
    const timer = window.setInterval(
      () => void fetchNotifications(audience === "buyer" ? "buyer" : undefined),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, [signedIn, fetchNotifications, audience]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  if (!signedIn) return null;

  const openItem = async (id: string, path: string | null, isRead: boolean) => {
    if (!isRead) await markAsRead(id);
    setOpen(false);
    if (path) router.push(path);
  };

  return (
    <div className="notification-dropdown relative" ref={panelRef}>
      <button
        type="button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        title="Notifications"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
          void fetchNotifications();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-[#09391C] shadow-sm transition hover:border-[#8DDB90]/40 hover:shadow-md"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#09391C] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[1000] mt-2 w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#09391C]">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-medium text-[#0F766E] hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">Loading notifications…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">
                You have no notifications yet. Updates for your account will appear here.
              </p>
            ) : (
              notifications.slice(0, 12).map((item) => {
                const path = actionPathOf(item);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => void openItem(item._id, path, item.isRead)}
                    className={`block w-full border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-[#F4FBF5] ${
                      item.isRead ? "bg-white" : "bg-[#F4FBF5]"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 break-words text-sm font-medium text-[#09391C]">{item.title}</span>
                      {!item.isRead ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8DDB90]" />
                      ) : null}
                    </span>
                    <span className="mt-1 block break-words text-sm text-gray-600 line-clamp-3">{notificationText(item.message)}</span>
                    <span className="mt-1 block text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
                  </button>
                );
              })
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
            className="w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-medium text-[#09391C] hover:bg-gray-50"
          >
            View all notifications
          </button>
        </div>
      ) : null}
    </div>
  );
}
