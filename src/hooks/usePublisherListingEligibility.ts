"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "@/context/user-context";

export interface PublisherListingEligibility {
  ownedProperties: number;
  listingLimit: number | null;
  listingsRemaining: number | null;
  unlimitedListings: boolean;
  canListProperties: boolean;
  hasPaidSubscription?: boolean;
  requiresActiveSubscription?: boolean;
  requiresSpecialPlan: boolean;
  specialPlanCode: string;
  specialPlanName: string;
  isPropertyScout?: boolean;
  isLicensedPublisher?: boolean;
  displayRoleLabel?: string;
  hasLicense?: boolean;
  canAcceptInspectionRequests?: boolean;
}

const PUBLISHER_TYPES = new Set(["Agent", "Developer", "Landowners", "PropertyScout"]);

export function usePublisherListingEligibility() {
  const { user, isInitialized } = useUserContext();
  const isPublisher =
    !!user?.userType && PUBLISHER_TYPES.has(String(user.userType));
  const [eligibility, setEligibility] = useState<PublisherListingEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isPublisher) {
      setEligibility(null);
      return null;
    }

    const token = Cookies.get("token");
    if (!token) return null;

    setLoading(true);
    try {
      const res = await GET_REQUEST<PublisherListingEligibility>(
        `${URLS.BASE}${URLS.publisherListingEligibility}`,
        token
      );
      if (res.success && res.data) {
        setEligibility(res.data);
        return res.data;
      }
      setEligibility(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isPublisher]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isPublisher) {
      setEligibility(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void refresh();
  }, [isInitialized, isPublisher, refresh, user?._id, user?.id]);

  return { eligibility, loading, refresh, isPublisher };
}
