"use client";
/** @format */

import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import type { AgentKycSubmissionPayload } from "@/types/agent-upgrade.types";

function getCurrentPathWithSearch(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + (window.location.search || "");
}

function redirectToLogin(from?: string): void {
  if (typeof window === "undefined") return;
  const target = from ?? getCurrentPathWithSearch();
  window.location.href = `/auth/login?from=${encodeURIComponent(target)}`;
}
  
export interface User {
  accountApproved: boolean;
  _id?: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  selectedRegion?: string[];
  userType?: "Agent" | "Landowners" | "FieldAgent" | "Developer" | "Lawyer" | "Surveyor";
  accountId?: string;
  profile_picture?: string;
  referralCode?: string;
  createdAt?: string;
  /** Canonical publisher KYC status from GET /account/profile */
  kycStatus?: "none" | "pending" | "in_review" | "approved" | "rejected";
  isAccountVerified?: boolean;
  activeSubscription?: {
    _id: string;
    user: string;
    plan: string;
    status: "active" | "inactive" | string;
    startDate: string;
    endDate: string;
    transaction?: string;
    autoRenew?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  address?: {
    localGovtArea: string;
    city: string;
    state: string;
    street: string;
  };
  agentType?: string;
  doc?: string;
  individualAgent?: {
    idNumber: string;
    typeOfId: string;
  };
  agentData?: {
    accountApproved: boolean;
    agentType: string;
    kycStatus?: "none" | "pending" | "in_review" | "approved" | "rejected";
    kycData?: AgentKycSubmissionPayload;
  };
  companyAgent?: {
    companyName: string;
    companyRegNumber: string;
  };
  /** When true (e.g. admin-created account), user must change password before using the app. */
  mustChangePassword?: boolean;
  /** From GET /account/profile; `null` means not configured yet (Deal Site / public page). */
  dealSite?: Record<string, unknown> | null;
}

const CANONICAL_USER_TYPES = ["Agent", "Landowners", "FieldAgent", "Developer", "Lawyer", "Surveyor"] as const;
type CanonicalUserType = (typeof CANONICAL_USER_TYPES)[number];

function toCanonicalUserType(value: unknown): User["userType"] | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower === "developer") return "Developer";
  if (lower === "agent") return "Agent";
  if (lower === "landowners" || lower === "landowner") return "Landowners";
  if (lower === "fieldagent" || lower === "field_agent") return "FieldAgent";
  if (lower === "lawyer") return "Lawyer";
  if (lower === "surveyor") return "Surveyor";
  return CANONICAL_USER_TYPES.includes(s as CanonicalUserType) ? (s as CanonicalUserType) : undefined;
}

/** True when the account is restricted to change-password (and sign-out) until the flag clears. */
export function userMustChangePassword(user: User | null | undefined): boolean {
  return user?.mustChangePassword === true;
}

/** Ensures API/partial user has required User fields (e.g. accountApproved) and canonical userType before setUser. */
export function normalizeUser(partial: Partial<User> | Record<string, unknown> | null): User | null {
  if (partial == null) return null;
  const p = partial as Record<string, unknown>;
  const userType = toCanonicalUserType(p.userType ?? p.user_type) ?? (p.userType as User["userType"]);
  const rawFlag = p.mustChangePassword ?? p.must_change_password;
  const mustChangePassword =
    rawFlag === true || rawFlag === "true"
      ? true
      : rawFlag === false || rawFlag === "false"
        ? false
        : undefined;
  return {
    accountApproved: Boolean(p.accountApproved),
    ...p,
    userType,
    ...(mustChangePassword !== undefined ? { mustChangePassword } : {}),
  } as User;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: (callback?: () => void) => void;
  isLoading: boolean;
  isInitialized: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Memoize setUser to prevent unnecessary re-renders
  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const getUser = async () => {
    const token = Cookies.get("token");

    setIsLoading(true);

    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      if (!getCurrentPathWithSearch().includes("/auth")) {
        redirectToLogin();
      }
      return;
    }

    const url = URLS.BASE + URLS.accountSettingsBaseUrl + "/profile";

    try {
      const response = await GET_REQUEST(url, token);

      const data = response?.data as any;
      const userPayload = data?.user ?? data; // some APIs return { data: { user } }, others { data: { id, userType, ... } }
      if (response?.success && (userPayload?.id || userPayload?._id)) {
        const rawPayload = userPayload as Record<string, unknown>;
        const profileDeclaresMustChange =
          Object.prototype.hasOwnProperty.call(rawPayload, "mustChangePassword") ||
          Object.prototype.hasOwnProperty.call(rawPayload, "must_change_password");
        const normalized = normalizeUser(userPayload);
        if (normalized && typeof window !== "undefined") {
          try {
            if (!normalized.userType) {
              const stored = localStorage.getItem("userType");
              if (stored) (normalized as unknown as Record<string, unknown>).userType = stored.trim();
            }
            if (normalized.userType) localStorage.setItem("userType", normalized.userType);
          } catch {}
        }
        setUserState((prev) => {
          const next = normalized ?? (userPayload as User);
          const prevId = prev?.id ?? prev?._id;
          const nextId = next ? ((next as User).id ?? (next as User)._id) : undefined;
          const sameSessionUser =
            prevId != null && nextId != null && String(prevId) === String(nextId);
          if (!profileDeclaresMustChange && prev?.mustChangePassword === true && next && sameSessionUser) {
            return { ...(next as User), mustChangePassword: true };
          }
          return next;
        });
      } else if (
        typeof response?.message === "string" &&
        (response.message.toLowerCase().includes("unauthorized") ||
          response.message.toLowerCase().includes("jwt") ||
          response.message.toLowerCase().includes("expired") ||
          response.message.toLowerCase().includes("malformed"))
      ) {
        Cookies.remove("token");
        try { localStorage.removeItem('token'); } catch {}
        toast.error("Session expired, please login again");
        const from = getCurrentPathWithSearch();
        try { if (!sessionStorage.getItem('redirectAfterLogin')) sessionStorage.setItem('redirectAfterLogin', from); } catch {}
        redirectToLogin(from);
      }
    } catch (error) {
      console.log("Error", error);
      if (!getCurrentPathWithSearch().includes("/auth")) {
        redirectToLogin();
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const logout = useCallback(
    async (callback?: () => void) => {
      try {
        Cookies.remove("token");
        sessionStorage.removeItem("user");
        localStorage.removeItem("email");
        localStorage.removeItem("fullname");
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("token");
        setUserState(null);
        toast.success("Logged out successfully");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        if (callback) await callback();
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout");
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    // Only initialize once on mount, not on every route change
    if (initRef.current) return;
    initRef.current = true;

    const token = Cookies.get("token");
    if (token) {
      getUser();
    } else {
      setIsLoading(false);
      setIsInitialized(true);
      if (!getCurrentPathWithSearch().includes("/auth")) {
        // Optionally redirect to login via redirectToLogin()
      }
    }
  }, []); // Only run on mount, not on every route change

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      logout,
      isLoading,
      isInitialized,
    }),
    [user, setUser, logout, isLoading, isInitialized],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
