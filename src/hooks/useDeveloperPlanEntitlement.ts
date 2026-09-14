"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "@/context/user-context";

export interface DeveloperPlanEntitlement {
  hasActivePlan: boolean;
  maxProfessionals: number;
  allowsOffPlan: boolean;
  planCode: string | null;
  planName: string | null;
  acceptedCount: number;
  remainingProfessionals: number;
  hasBasicProfile: boolean;
  kycStatus: string;
  advancedKycStatus: string;
  advancedKycApproved: boolean;
  propertyCount: number;
  canListOffPlan: boolean;
}

export function useDeveloperPlanEntitlement() {
  const { user, isInitialized } = useUserContext();
  const [entitlement, setEntitlement] = useState<DeveloperPlanEntitlement | null>(null);
  const [loading, setLoading] = useState(false);
  const isDeveloper = String(user?.userType || "").toLowerCase() === "developer";

  const refresh = useCallback(async () => {
    if (!isDeveloper) {
      setEntitlement(null);
      return null;
    }
    const token = Cookies.get("token");
    if (!token) return null;
    setLoading(true);
    try {
      const res = await GET_REQUEST<DeveloperPlanEntitlement>(
        `${URLS.BASE}${URLS.developerPlanEntitlement}`,
        token
      );
      if (res.success && res.data) {
        setEntitlement(res.data);
        return res.data;
      }
      setEntitlement(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isDeveloper]);

  useEffect(() => {
    if (!isInitialized || !isDeveloper) return;
    void refresh();
  }, [isInitialized, isDeveloper, refresh, user?._id, user?.id]);

  return { entitlement, loading, refresh, isDeveloper };
}
