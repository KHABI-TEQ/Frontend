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
import { usePathname, useRouter } from "next/navigation";
import type { AgentKycSubmissionPayload } from "@/types/agent-upgrade.types";
  
export interface User {
  accountApproved: boolean;
  _id?: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  selectedRegion?: string[];
  userType?: "Agent" | "Landowners" | "FieldAgent" | "Developer";
  accountId?: string;
  profile_picture?: string;
  referralCode?: string;
  createdAt?: string;
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
}

const CANONICAL_USER_TYPES = ["Agent", "Landowners", "FieldAgent", "Developer"] as const;
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
  return CANONICAL_USER_TYPES.includes(s as CanonicalUserType) ? (s as CanonicalUserType) : undefined;
}

/** Ensures API/partial user has required User fields (e.g. accountApproved) and canonical userType before setUser. */
export function normalizeUser(partial: Partial<User> | Record<string, unknown> | null): User | null {
  if (partial == null) return null;
  const p = partial as Record<string, unknown>;
  const userType = toCanonicalUserType(p.userType ?? p.user_type) ?? (p.userType as User["userType"]);
  return { accountApproved: Boolean(p.accountApproved), ...p, userType } as User;
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

  const pathName = usePathname();
  const router = useRouter();

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
      if (pathName && !pathName.includes("/auth")) {
        const from = typeof window !== 'undefined' ? (window.location.pathname + (window.location.search || '')) : (pathName || '/');
        router.push(`/auth/login?from=${encodeURIComponent(from)}`);
      }
      return;
    }

    const url = URLS.BASE + URLS.accountSettingsBaseUrl + "/profile";

    try {
      const response = await GET_REQUEST(url, token);

      const data = response?.data as any;
      const userPayload = data?.user ?? data; // some APIs return { data: { user } }, others { data: { id, userType, ... } }
      if (response?.success && (userPayload?.id || userPayload?._id)) {
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
        setUserState(normalized ?? userPayload);
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
        const from = typeof window !== 'undefined' ? (window.location.pathname + (window.location.search || '')) : (pathName || '/');
        try { if (!sessionStorage.getItem('redirectAfterLogin')) sessionStorage.setItem('redirectAfterLogin', from); } catch {}
        router.push(`/auth/login?from=${encodeURIComponent(from)}`);
      }
    } catch (error) {
      console.log("Error", error);
      if (pathName && !pathName.includes("/auth")) {
        const from = typeof window !== 'undefined' ? (window.location.pathname + (window.location.search || '')) : (pathName || '/');
        router.push(`/auth/login?from=${encodeURIComponent(from)}`);
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
        await router.push("/auth/login");
        if (callback) await callback();
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout");
        throw error;
      }
    },
    [router],
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
      if (pathName && !pathName.includes("/auth")) {
        // Optionally redirect to login
        // router.push("/auth/login");
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
