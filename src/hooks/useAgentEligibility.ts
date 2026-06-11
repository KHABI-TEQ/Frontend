"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "@/context/user-context";
import type { User } from "@/context/user-context";
import type { AgentEligibility } from "@/types/agent-eligibility.types";

type KycStatusSource = Pick<User, "kycStatus" | "agentData"> | null | undefined;

export function useAgentEligibility() {
  const { user, isInitialized } = useUserContext();
  const [eligibility, setEligibility] = useState<AgentEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAgent = user?.userType === "Agent";

  const refresh = useCallback(async () => {
    if (!isAgent) {
      setEligibility(null);
      setError(null);
      return null;
    }

    const token = Cookies.get("token");
    if (!token) {
      setEligibility(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await GET_REQUEST<AgentEligibility>(
        `${URLS.BASE}${URLS.agentEligibility}`,
        token
      );
      if (res?.success && res.data) {
        setEligibility(res.data);
        return res.data;
      }
      setError(res?.message || "Failed to load agent eligibility");
      setEligibility(null);
      return null;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load agent eligibility";
      setError(msg);
      setEligibility(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAgent]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAgent) {
      setEligibility(null);
      return;
    }
    void refresh();
  }, [isInitialized, isAgent, refresh, user?._id, user?.id]);

  return { eligibility, loading, error, refresh, isAgent };
}

/** Canonical KYC status: profile kycStatus, then agentData fallback. */
export function resolveAgentKycStatus(user: KycStatusSource): string {
  if (!user) return "none";
  if (user.kycStatus) return user.kycStatus;
  return user.agentData?.kycStatus ?? "none";
}
