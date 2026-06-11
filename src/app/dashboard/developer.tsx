"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus as PlusIcon,
  Eye as EyeIcon,
  Building2 as BuildingIcon,
  Calendar as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Briefcase as BriefcaseIcon,
  MapPin as MapPinIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
  Copy,
  Link as LinkIcon,
  Mail as MailIcon,
  CheckCircle as CheckCircleIcon,
  Users as UsersIcon,
  Globe2,
  UserCircle,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";
import {
  InspectionRepresentativesSummary,
  SyndicationIntegrationSummary,
} from "@/components/dashboard/DashboardIntegrationSummaries";
import PublisherDashboardNotice from "@/components/publisher/PublisherDashboardNotice";

interface PendingBrief {
  _id: string;
  location: any;
  briefType: string;
  price: number;
  pictures: string[];
  isApproved?: boolean;
}

interface DashboardData {
  totalBriefs?: number;
  totalActiveBriefs?: number;
  totalInactiveBriefs?: number;
  totalViews?: number;
  totalInspectionRequests?: number;
  totalCompletedInspectionRequests?: number;
  newPendingBriefs?: PendingBrief[];
  completedDeals?: number;
  averageRating?: number;
  totalCommission?: number;
}

/** Recent property from /account/properties/fetchAll (all statuses, so approved listings appear). */
interface RecentProperty {
  _id: string;
  location?: { state?: string; localGovernment?: string };
  briefType?: string;
  price?: number;
  pictures?: string[];
  isApproved?: boolean;
}

export default function DeveloperDashboard() {
  const router = useRouter();
  const { user } = useUserContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  /** Total property count from /account/properties/fetchAll (used when dashboard stats are 0) */
  const [propertiesTotalFromApi, setPropertiesTotalFromApi] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referral, setReferral] = useState({ code: "", totalReferred: 0, points: 0, earnings: 0 });

  useEffect(() => {
    const preferred = (user as any)?.referralCode;
    if (preferred) {
      setReferral((prev) => ({ ...prev, code: preferred }));
    }
  }, [user]);

  // Sync userType to localStorage so the header profile dropdown shows Developer menu (Inspection Requests, Agent Requests, etc.)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("userType", "Developer");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    setIsLoading(true);
    const load = async () => {
      try {
        await fetchDashboardData();
        await fetchRecentProperties();
        await fetchReferralData();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?._id ?? user?.id]);

  const fetchDashboardData = async () => {
    try {
      const response = await GET_REQUEST(
        `${URLS.BASE}${URLS.fetchDashboardStats}`,
        Cookies.get("token"),
      );
      if (response?.success && response.data) {
        const raw = response.data as Record<string, unknown>;
        setDashboardData({
          totalBriefs: Number(raw.totalBriefs ?? 0),
          totalActiveBriefs: Number(raw.totalActiveBriefs ?? 0),
          totalInactiveBriefs: Number(raw.totalInactiveBriefs ?? 0),
          totalViews: Number(raw.totalViews ?? 0),
          totalInspectionRequests: Number(raw.totalInspectionRequests ?? 0),
          totalCompletedInspectionRequests: Number(raw.totalCompletedInspectionRequests ?? 0),
          newPendingBriefs: Array.isArray(raw.newPendingBriefs) ? (raw.newPendingBriefs as PendingBrief[]) : [],
          completedDeals: Number(raw.completedDeals ?? 0),
          averageRating: Number(raw.averageRating ?? 0),
          totalCommission: Number(raw.totalCommission ?? 0),
        });
      } else {
        setDashboardData({
          totalBriefs: 0,
          totalActiveBriefs: 0,
          totalInactiveBriefs: 0,
          totalViews: 0,
          totalInspectionRequests: 0,
          totalCompletedInspectionRequests: 0,
          newPendingBriefs: [],
          completedDeals: 0,
          averageRating: 0,
          totalCommission: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setDashboardData({
        totalBriefs: 0,
        totalActiveBriefs: 0,
        totalInactiveBriefs: 0,
        totalViews: 0,
        totalInspectionRequests: 0,
        totalCompletedInspectionRequests: 0,
        newPendingBriefs: [],
        completedDeals: 0,
        averageRating: 0,
        totalCommission: 0,
      });
    }
  };

  const fetchReferralData = async () => {
    try {
      const token = Cookies.get("token");
      const response = await GET_REQUEST<any>(`${URLS.BASE}/account/referrals/stats`, token);
      if (response?.success && response.data) {
        const data = response.data as any;
        const preferredCode = (user as any)?.referralCode;
        setReferral({
          code: (preferredCode || data.code || "").toString(),
          totalReferred: Number(data.totalReferred || 0),
          points: Number(data.points || 0),
          earnings: Number(data.earnings || 0),
        });
        return;
      }
    } catch (e) {
      // ignore
    }
    const preferredCode = (user as any)?.referralCode;
    if (preferredCode) {
      setReferral((prev) => ({ ...prev, code: preferredCode }));
    } else {
      const email = (user as any)?.email || "";
      const fallbackCode = email
        ? `${email.split("@")[0].toUpperCase()}2024`
        : `${(user?.firstName || "USER").toUpperCase()}2024`;
      setReferral((prev) => ({ ...prev, code: fallbackCode }));
    }
  };

  /** Fetch recent properties (all statuses) and total count for accurate dashboard metrics. */
  const fetchRecentProperties = async () => {
    try {
      const url = `${URLS.BASE}/account/properties/fetchAll?page=1&limit=5`;
      const response = await GET_REQUEST(url, Cookies.get("token"));
      console.log("[fetchAll /account/properties/fetchAll] response (Developer dashboard)", response);
      const raw = response as { success?: boolean; data?: unknown[]; pagination?: { total?: number } };
      if (raw?.success && Array.isArray(raw.data)) {
        setRecentProperties((raw.data as RecentProperty[]).slice(0, 5));
        const total = raw.pagination?.total ?? raw.data.length;
        setPropertiesTotalFromApi(typeof total === "number" ? total : raw.data.length);
      } else {
        setRecentProperties([]);
        setPropertiesTotalFromApi(null);
      }
    } catch (error) {
      console.error("Failed to fetch recent properties:", error);
      setRecentProperties([]);
      setPropertiesTotalFromApi(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const totalBriefs = Math.max(dashboardData?.totalBriefs ?? 0, propertiesTotalFromApi ?? 0);
  const totalActiveBriefs = Math.max(dashboardData?.totalActiveBriefs ?? 0, propertiesTotalFromApi ?? 0);
  const totalViews = dashboardData?.totalViews ?? 0;
  const totalInspectionRequests = dashboardData?.totalInspectionRequests ?? 0;
  const completedDeals = dashboardData?.completedDeals ?? 0;
  const displayProperties = recentProperties.length > 0 ? recentProperties : (dashboardData?.newPendingBriefs ?? []) as RecentProperty[];

  const statCards = [
    { title: "Total Properties", value: totalBriefs, icon: BuildingIcon, color: "bg-blue-500", textColor: "text-blue-600" },
    { title: "Active Listings", value: totalActiveBriefs, icon: TrendingUpIcon, color: "bg-green-500", textColor: "text-green-600" },
    { title: "Completed Deals", value: completedDeals, icon: CheckCircleIcon, color: "bg-yellow-500", textColor: "text-yellow-600" },
    { title: "Total Views", value: `${totalViews}`, icon: EyeIcon, color: "bg-purple-500", textColor: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        {/* Header: welcome on its own row so it always displays fully; buttons on next row(s) */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#09391C] font-display">
              Welcome back, Developer {user.firstName ?? "Developer"}!
            </h1>
            <p className="text-[#5A5D63] mt-2">
              Manage your developments, properties, and real estate activity
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center flex-wrap">
            <Link
              href="/my-listings"
              className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <BriefcaseIcon size={20} />
              <span className="hidden sm:inline">View </span>Listings
            </Link>
            <Link
              href="/my-inspection-requests"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CalendarIcon size={20} />
              <span className="hidden sm:inline">Inspection</span> Requests
            </Link>
            <Link
              href="/my-request-to-market"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <BriefcaseIcon size={20} />
              Agent Requests
            </Link>
            <Link
              href="/agent-broadcast"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MailIcon size={20} />
              <span className="hidden sm:inline">Broadcast</span>
            </Link>
            <Link
              href="/dashboard/syndication"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              title="Syndication integrations"
            >
              <Globe2 size={20} />
              Syndication
            </Link>
            <Link
              href="/dashboard/inspection-representatives"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              title="Inspection representatives"
            >
              <UserCircle size={20} />
              <span className="whitespace-nowrap">Inspection reps</span>
            </Link>
            <Link
              href="/post-property"
              className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PlusIcon size={20} />
              List New Property
            </Link>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              (user as any)?.isAccountVerified ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (user as any)?.isAccountVerified ? "bg-blue-600" : "bg-gray-400"
              }`}
            />
            {(user as any)?.isAccountVerified ? "Verified account" : "Unverified account"}
          </div>
        </div>

        <PublisherDashboardNotice userType="Developer" />

        {/* Performance Overview + Referral (same as Agent) */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#8DDB90] mb-2">
                ₦{(dashboardData?.totalCommission ?? 0).toLocaleString()}
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Total Commission</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <StarIcon size={20} className="text-yellow-500 fill-current sm:w-6 sm:h-6" />
                <span className="text-2xl sm:text-3xl font-bold text-[#09391C] ml-2">{dashboardData?.averageRating ?? 0}</span>
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#09391C] mb-2">
                {totalBriefs > 0 ? Math.round(((completedDeals ?? 0) / totalBriefs) * 100) : 0}%
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Referral</div>
              <div className="flex items-center justify-center gap-3">
                <code className="font-mono text-[#09391C] text-sm">{referral.code || "—"}</code>
                <button
                  onClick={async () => {
                    try {
                      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${referral.code}`;
                      await navigator.clipboard.writeText(url);
                      toast.success("Referral link copied");
                    } catch {
                      toast.error("Copy failed");
                    }
                  }}
                  className="p-1.5 rounded bg-gray-50 hover:bg-gray-100"
                  aria-label="Copy referral link"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="mt-2 text-xs text-[#5A5D63]">{referral.totalReferred} referred • ₦{(referral.earnings ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* At-a-glance metrics; full forms live on /dashboard/syndication and /dashboard/inspection-representatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <SyndicationIntegrationSummary />
          <InspectionRepresentativesSummary developerPropertyScoped />
        </div>

        {/* Stats Cards (same style as Agent) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5A5D63] mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <IconComponent size={24} className={card.textColor} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* My Properties + Quick Actions (same layout as Agent: Recent Briefs + Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* My Properties */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#09391C]">My Properties</h2>
                <Link href="/my-listings" className="text-[#8DDB90] hover:text-[#7BC87F] font-medium">
                  View All
                </Link>
              </div>
            </div>
            {displayProperties.length === 0 ? (
              <div className="p-8 text-center">
                <BriefcaseIcon size={32} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-600 mb-2">No Properties Listed Yet</h3>
                <p className="text-sm text-gray-500 mb-4">List your first development or property</p>
                <Link
                  href="/post-property"
                  className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors text-sm"
                >
                  <PlusIcon size={16} />
                  List New Property
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {displayProperties.slice(0, 5).map((brief, index) => (
                  <motion.div
                    key={`property-${brief._id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 min-h-[4.5rem] sm:min-h-[5rem]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8DDB90] bg-opacity-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {brief.pictures?.[0] ? (
                            <img src={brief.pictures[0]} alt={brief.briefType ?? "Property"} className="w-full h-full object-cover" />
                          ) : (
                            <BriefcaseIcon size={16} className="text-[#8DDB90]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-[#09391C] capitalize text-sm">{brief.briefType ?? "Property"}</h3>
                          <div className="flex items-center gap-1 text-xs text-[#5A5D63]">
                            <MapPinIcon size={10} />
                            {((brief as { location?: { state?: string; localGovernment?: string; area?: string } }).location?.area ?? `${brief.location?.state ?? ""} ${brief.location?.localGovernment ?? ""}`.trim()) || "—"}
                          </div>
                          {typeof brief.price === "number" && (
                            <p className="text-xs text-[#8DDB90] font-medium">₦{brief.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${brief.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {brief.isApproved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions (same as Agent: all actions Developer can use) */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C]">Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <Link
                href="/agent-broadcast"
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-indigo-500 bg-opacity-20 rounded-lg">
                  <MailIcon size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Broadcast to Subscribers</h3>
                  <p className="text-sm text-indigo-700/90">Send an email to all your Practitioner subscribers</p>
                </div>
              </Link>
              <Link
                href="/post-property"
                className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <PlusIcon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">List New Property</h3>
                  <p className="text-sm opacity-90">Add property to portfolio</p>
                </div>
              </Link>
              <Link
                href="/agent-marketplace"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-[#8DDB90] bg-opacity-10 rounded-lg">
                  <BriefcaseIcon size={20} className="text-[#8DDB90]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Browse Marketplace</h3>
                  <p className="text-sm text-[#5A5D63]">Find new opportunities</p>
                </div>
              </Link>
              <Link
                href="/my-inspection-requests"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
                  <CalendarIcon size={20} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Inspection Requests</h3>
                  <p className="text-sm text-[#5A5D63]">Manage inspections</p>
                </div>
              </Link>
              <Link
                href="/dashboard/syndication"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-[#09391C]/10 rounded-lg">
                  <Globe2 size={20} className="text-[#09391C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Syndication integrations</h3>
                  <p className="text-sm text-[#5A5D63]">Connect platforms and manage dispatch</p>
                </div>
              </Link>
              <Link
                href="/dashboard/inspection-representatives"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-[#8DDB90]/20 rounded-lg">
                  <UserCircle size={20} className="text-[#09391C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Inspection representatives</h3>
                  <p className="text-sm text-[#5A5D63]">Per-listing contacts for inspection notifications</p>
                </div>
              </Link>
              <Link
                href="/notifications"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
                  <UsersIcon size={20} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-sm text-[#5A5D63]">View notifications</p>
                </div>
              </Link>
              <Link
                href="/agent-kyc"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                  <CheckCircleIcon size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Optional KYC</h3>
                  <p className="text-sm text-[#5A5D63]">Verify your developer profile (not required)</p>
                </div>
              </Link>
              <Link
                href="/my-listings"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                  <UsersIcon size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">My Listings</h3>
                  <p className="text-sm text-[#5A5D63]">Manage properties</p>
                </div>
              </Link>
              <Link
                href="/profile-settings"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-gray-500 bg-opacity-10 rounded-lg">
                  <UsersIcon size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Profile Settings</h3>
                  <p className="text-sm text-[#5A5D63]">Manage account settings</p>
                </div>
              </Link>
              <Link
                href="/public-access-page"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-emerald-500 bg-opacity-10 rounded-lg">
                  <LinkIcon size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Practitioner Page</h3>
                  <p className="text-sm text-[#5A5D63]">Set up and manage your Practitioner page</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
