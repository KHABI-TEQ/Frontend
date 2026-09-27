"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUserContext } from "@/context/user-context";
import { useNotifications } from "@/context/notification-context";
import { getBuyerToken } from "@/lib/search-insurance";
import { actionPathOf, notificationText, timeAgo } from "@/components/new-homepage/NotificationBell";

export default function NotificationsPage() {
  const { user } = useUserContext();
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const active = Boolean(user?._id || user?.id || getBuyerToken());
    setSignedIn(active);
    setReady(true);
    if (active) void fetchNotifications();
  }, [user, fetchNotifications]);

  const openItem = async (id: string, path: string | null, isRead: boolean) => {
    if (!isRead) await markAsRead(id);
    if (path) router.push(path);
  };

  return (
    <main className="min-h-screen bg-[#EEF1F1] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#09391C]">Notifications</h1>
            <p className="mt-1 text-sm text-[#5A5D63]">
              Updates for your account, including requests that need a response.
            </p>
          </div>
          {signedIn && unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              className="shrink-0 rounded-full border border-[#8DDB90] bg-white px-4 py-2 text-sm font-medium text-[#09391C] hover:bg-[#F4FBF5]"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {!ready || (signedIn && isLoading && notifications.length === 0) ? (
          <p className="rounded-2xl bg-white px-5 py-8 text-sm text-[#5A5D63]">Loading notifications…</p>
        ) : !signedIn ? (
          <div className="rounded-2xl bg-white px-5 py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#09391C]" />
            <p className="mt-3 text-sm text-[#5A5D63]">Sign in to see notifications for your account.</p>
            <Link
              href="/auth/login?from=%2Fnotifications"
              className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl bg-white px-5 py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#8DDB90]" />
            <p className="mt-3 text-sm text-[#5A5D63]">
              You have no notifications yet. Updates for your account will appear here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {notifications.map((item) => {
              const path = actionPathOf(item);
              return (
                <li key={item._id} className="border-b border-gray-50 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => void openItem(item._id, path, item.isRead)}
                    className={`block w-full px-5 py-4 text-left hover:bg-[#F4FBF5] ${
                      item.isRead ? "bg-white" : "bg-[#F4FBF5]"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-[#09391C]">{item.title}</span>
                      {!item.isRead ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8DDB90]" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">{notificationText(item.message)}</span>
                    <span className="mt-2 block text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
