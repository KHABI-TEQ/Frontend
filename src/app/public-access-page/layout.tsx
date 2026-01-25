/**
 * Public Access Page Dashboard Layout
 * Wraps all public-access-page routes with sidebar navigation
 * Handles setup completion guard logic and page gating modal
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { DealSiteProvider, useDealSite } from "@/context/deal-site-context";
import { useUserContext } from "@/context/user-context";
import DashboardSidebar from "@/components/public-access-page/DashboardSidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserContext();
  const { isSetupComplete, slugLocked, isLoading } = useDealSite();
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Guard logic: redirect based on setup completion
  useEffect(() => {
    if (isLoading) return;

    // Check if user is an agent
    if (user?.userType !== "Agent") {
      return;
    }

    // If trying to access setup and already setup complete, redirect to overview
    if (pathname === "/public-access-page/setup" && isSetupComplete) {
      router.replace("/public-access-page");
    }

    // If trying to access dashboard but setup not complete, redirect to setup
    if (
      pathname !== "/public-access-page/setup" &&
      !isSetupComplete &&
      pathname.startsWith("/public-access-page")
    ) {
      setShowSetupModal(true);
    }
  }, [isLoading, isSetupComplete, pathname, user, router]);

  // Show error for non-agents
  if (!user || user?.userType !== "Agent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only agents can access the Public Access Page dashboard.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If on setup page, don't show sidebar
  if (pathname === "/public-access-page/setup") {
    return <>{children}</>;
  }

  // Dashboard layout with sidebar
  return (
    <>
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold text-[#09391C] mb-2">
              Setup Your Public Page
            </h2>
            <p className="text-gray-600 mb-6">
              Your public access page is not yet configured. Set it up now to get started.
            </p>
            <button
              onClick={() => router.push("/public-access-page/setup")}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
            >
              Set Up Your Public Page Now
            </button>
          </div>
        </div>
      )}
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function PublicAccessPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DealSiteProvider>
      <DashboardContent>{children}</DashboardContent>
    </DealSiteProvider>
  );
}
