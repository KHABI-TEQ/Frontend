"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import Breadcrumb from "@/components/extrals/Breadcrumb";
import Loading from "@/components/loading-component/loading";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";
import { selectFeatureEntry } from "@/store/subscriptionFeaturesSlice";
import { FEATURE_KEYS } from "@/hooks/useFeatureGate";
import FeatureGate from "@/components/access/FeatureGate";

interface PropertyTypeCard {
  type: "sell" | "rent" | "shortlet" | "jv";
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

const propertyTypes: PropertyTypeCard[] = [
  {
    type: "sell",
    title: "Outright Sales",
    description: "Sell your property outright to potential buyers",
    route: "/post-property/outright-sales",
    icon: "🏠",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    type: "rent",
    title: "For Rent",
    description: "List your property for rental to tenants",
    route: "/post-property/rent",
    icon: "🔑",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    type: "shortlet",
    title: "Shortlet",
    description: "List your property for short-term rental",
    route: "/post-property/shortlet",
    icon: "📅",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    type: "jv",
    title: "Joint Venture",
    description: "Partner with investors for property development",
    route: "/post-property/joint-venture",
    icon: "🤝",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
];

const PostPropertyPage = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const isAgent = user?.userType === "Agent";
  const listingsEntry = useAppSelector(selectFeatureEntry(FEATURE_KEYS.LISTINGS));
  const quotaText = listingsEntry
    ? (listingsEntry.type === 'unlimited' || listingsEntry.remaining === -1)
      ? 'Unlimited'
      : (listingsEntry.type === 'count')
        ? `${Math.max(0, Number(listingsEntry.remaining || 0))} remaining`
        : (Number(listingsEntry.value) === 1 ? 'Enabled' : 'Disabled')
    : '—';

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
 
    // Allow Landowners to access directly
    if (user.userType === "Landowners") {
      return;
    }

    // For Agents, the AgentAccessBarrier will handle the onboarding and approval checks
    if (user.userType === "Agent") {
      return;
    }

    // User is neither landowner nor agent
    toast.error("You need to be a landowner or agent to post properties");
    router.push("/dashboard");
  }, [user, router]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Post Property" },
  ];

  const handlePropertyTypeSelect = (route: string) => {
    router.push(route);
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireKycApproved={true}
      agentCustomMessage="You must complete onboarding and be approved before you can post properties."
    >
      <FeatureGate featureKeys={[FEATURE_KEYS.LISTINGS]}>
        <div className="min-h-screen bg-[#EEF1F1] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#09391C] font-display mb-2 md:mb-4">
              Post Your Property
            </h1>
            {
              isAgent && (
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-[#EEF1F1] text-[#09391C] text-xs md:text-sm px-3 py-1 font-medium">
                    Listings quota: {quotaText}
                  </span>
                </div>
              )
            }
            <p className="text-[#5A5D63] text-lg md:text-xl max-w-3xl mx-auto px-4">
              Choose the type of property listing that best suits your needs
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {propertyTypes.map((propertyType) => (
                <div
                  key={propertyType.type}
                  onClick={() => handlePropertyTypeSelect(propertyType.route)}
                  className={`${propertyType.color} border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 transform`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{propertyType.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#09391C] mb-2">
                        {propertyType.title}
                      </h3>
                      <p className="text-[#5A5D63] text-sm md:text-base">
                        {propertyType.description}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex items-center text-sm font-medium text-[#8DDB90] hover:text-[#7BC87F]">
                          Get Started
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
              <h3 className="text-xl font-bold text-[#09391C] mb-4">
                Need Help Choosing?
              </h3>
              <p className="text-[#5A5D63] mb-6 max-w-2xl mx-auto">
                Each property type has different requirements and benefits. All forms follow the same easy steps - just with fields tailored to your specific listing type.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#EEF1F1] rounded-lg p-4">
                  <div className="font-semibold text-[#09391C] mb-2">Basic Details</div>
                  <div className="text-[#5A5D63]">Location, size, pricing</div>
                </div>
                <div className="bg-[#EEF1F1] rounded-lg p-4">
                  <div className="font-semibold text-[#09391C] mb-2">Features</div>
                  <div className="text-[#5A5D63]">Amenities, conditions</div>
                </div>
                <div className="bg-[#EEF1F1] rounded-lg p-4">
                  <div className="font-semibold text-[#09391C] mb-2">Images</div>
                  <div className="text-[#5A5D63]">Property photos</div>
                </div>
                <div className="bg-[#EEF1F1] rounded-lg p-4">
                  <div className="font-semibold text-[#09391C] mb-2">Verification</div>
                  <div className="text-[#5A5D63]">Owner details</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </FeatureGate>
    </CombinedAuthGuard>
  );
};

export default PostPropertyPage;
