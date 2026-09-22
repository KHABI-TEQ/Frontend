"use client";
import React from 'react';
import Link from 'next/link';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useUserContext } from "@/context/user-context";
import { useAgentEligibility } from "@/hooks/useAgentEligibility";
import { usePublisherListingEligibility } from "@/hooks/usePublisherListingEligibility";
import { isLivePaidSubscription } from "@/utils/subscription-status";
import Loading from '../loading-component/loading';
 
interface FeatureGateProps {
  featureKeys: string[]; // All must be allowed
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
 
const DefaultFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center p-6">
    <div className="max-w-md w-full border border-gray-200 rounded-xl bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-[#0C1E1B] mb-3">Subscription required</h2>
      <p className="text-gray-600 mb-6">An active paid subscription is required to list properties. Subscribe to continue.</p>
      <Link href="/agent-subscriptions?tab=plans" className="bg-[#0B572B] hover:bg-[#094C25] text-white px-6 py-3 rounded-lg font-medium inline-block">View Plans</Link>
    </div>
  </div>
);

export default function FeatureGate({ featureKeys, children, fallback }: FeatureGateProps) {
  const checks = featureKeys.map(k => useFeatureGate(k));
  const { user, isLoading, isInitialized } = useUserContext();
  const { eligibility, loading: eligibilityLoading } = useAgentEligibility();
  const { eligibility: listingEligibility, loading: listingLoading } = usePublisherListingEligibility();
  const isAgent = user?.userType === "Agent";
  const isPublisher =
    isAgent ||
    user?.userType === "Developer" ||
    user?.userType === "Landowners" ||
    user?.userType === "PropertyScout";
  const snapshotPaid = isLivePaidSubscription(user?.activeSubscription);
  const hasPaidSubscription =
    listingEligibility?.hasPaidSubscription === true ||
    (isAgent && eligibility?.hasPaidSubscription === true) ||
    snapshotPaid;
  const listingBlocked =
    isPublisher && featureKeys.includes("LISTINGS") && !hasPaidSubscription;
  const allowed = !listingBlocked && checks.every(c => c.allowed);

  if (
    isLoading ||
    !isInitialized ||
    (isAgent && eligibilityLoading && !snapshotPaid) ||
    (isPublisher && listingLoading && !snapshotPaid)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <Loading />
      </div>
    );
  }

  if (!allowed && isPublisher) return <>{fallback ?? <DefaultFallback />}</>;
  return <>{children}</>;
}
