/** @format */

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";

interface UseAgentAccessProps {
  requireOnboarding?: boolean;
  requireApproval?: boolean;
  redirectTo?: string;
}

export const useAgentAccess = ({
  requireOnboarding = true,
  requireApproval = true,
  redirectTo = "/auth/login",
}: UseAgentAccessProps = {}) => {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    // Not logged in
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Not an agent
    if (user.userType !== "Agent") {
      router.push("/dashboard");
      return;
    }

    // Agent hasn't completed onboarding
    if (requireOnboarding && !user.agentData?.agentType) {
      router.push("/agent-onboard");
      return;
    }

    // Agent hasn't been approved yet
    if (requireApproval && user.accountApproved === false) {
      router.push("/agent-under-review");
      return;
    }
  }, [user, router, requireOnboarding, requireApproval, redirectTo]);

  return {
    user,
    isAgent: user?.userType === "Agent",
    hasCompletedOnboarding: user?.agentData?.agentType,
    isApproved: user?.accountApproved,
    canAccessBriefs:
      user?.userType === "Agent" &&
      user?.agentData?.agentType &&
      user?.accountApproved,
    canPostProperty:
      user?.userType === "Agent" &&
      user?.agentData?.agentType &&
      user?.accountApproved,
  };
};
