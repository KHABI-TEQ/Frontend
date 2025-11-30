"use client";

import React, { ReactNode } from "react";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: string[];
  redirectTo?: string;
}

/**
 * AuthGuard component that ensures user profile is loaded before rendering children
 * Also provides authentication and authorization checks
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  allowedUserTypes = [],
  redirectTo = "/auth/login",
}) => {
  const { user, isLoading, isInitialized } = useUserContext();

  // ⏳ While loading user context
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F8F8] to-[#E8EEEE]">
        <Loading />
      </div>
    );
  }
 
  // 🔒 User not logged in but required
  if (requireAuth && !user) {
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <Loading />
      </div>
    );
  }

  // ❌ User type is not allowed
  if (
    allowedUserTypes.length > 0 &&
    user &&
    !allowedUserTypes.includes(user.userType || "")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFA] to-[#E5EAEA] p-4">
        <div className="max-w-md w-full border border-red-100 rounded-xl bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#BF0A30] mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to view this page with your current
            account type.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 rounded-md bg-[#0B572B] hover:bg-[#094C25] text-white font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Access granted
  return <>{children}</>;
};

export default AuthGuard;
