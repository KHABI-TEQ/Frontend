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
  Home as HomeIcon,
  Eye as EyeIcon,
  Building2 as BuildingIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Briefcase as BriefcaseIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";

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
  const { user, logout } = useUserContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    setIsLoading(true);
    const load = async () => {
      try {
        await fetchDashboardData();
        await fetchRecentProperties();
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
      });
    }
  };

  /** Fetch recent properties (all statuses) so auto-approved listings appear on the dashboard. */
  const fetchRecentProperties = async () => {
    try {
      const url = `${URLS.BASE}/account/properties/fetchAll?page=1&limit=5`;
      const response = await GET_REQUEST(url, Cookies.get("token"));
      if (response?.success && Array.isArray(response.data)) {
        setRecentProperties((response.data as RecentProperty[]).slice(0, 5));
      } else {
        setRecentProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch recent properties:", error);
      setRecentProperties([]);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const totalBriefs = dashboardData?.totalBriefs ?? 0;
  const totalActiveBriefs = dashboardData?.totalActiveBriefs ?? 0;
  const totalViews = dashboardData?.totalViews ?? 0;
  const totalInspectionRequests = dashboardData?.totalInspectionRequests ?? 0;
  const displayProperties = recentProperties.length > 0 ? recentProperties : (dashboardData?.newPendingBriefs ?? []) as RecentProperty[];

  const statCards = [
    {
      title: "Total Properties",
      value: totalBriefs,
      icon: BuildingIcon,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Listings",
      value: totalActiveBriefs,
      icon: TrendingUpIcon,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: EyeIcon,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Inspection Requests",
      value: totalInspectionRequests,
      icon: CalendarIcon,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const quickActions = [
    {
      title: "List New Property",
      description: "Add a new development or property",
      href: "/post-property",
      icon: PlusIcon,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "My Listings",
      description: "Manage your property listings",
      href: "/my-listings",
      icon: HomeIcon,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Inspection Requests",
      description: "Manage property inspections",
      href: "/my-inspection-requests",
      icon: CalendarIcon,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Profile Settings",
      description: "Manage your profile and account",
      href: "/profile-settings",
      icon: SettingsIcon,
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-full">
          <div className="flex flex-col gap-4">
            {/* Top row: Log out on the right to avoid widening the main content */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => logout(() => router.push("/auth/login"))}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1.5 transition-colors py-1.5 px-2 -my-1.5 -mx-2 rounded hover:bg-gray-100"
              >
                <LogOutIcon size={18} />
                Log out
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display truncate">
                  Welcome back, {user.firstName ?? "Developer"}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your developments and property portfolio
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/post-property"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <PlusIcon size={20} />
                  List New Property
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <IconComponent size={24} className={card.textColor} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      My Properties
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {totalBriefs} total listing{totalBriefs !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href="/my-listings"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
              </div>
              {displayProperties.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BriefcaseIcon size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Properties Listed Yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Start by listing your first development or property
                  </p>
                  <Link
                    href="/post-property"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <PlusIcon size={20} />
                    List Your First Property
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {displayProperties.slice(0, 5).map((brief, index) => (
                    <motion.div
                      key={`property-${brief._id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {brief.pictures?.[0] ? (
                              <img
                                src={brief.pictures[0]}
                                alt={brief.briefType ?? "Property"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BriefcaseIcon size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {brief.location?.state} {brief.location?.localGovernment} | {brief.briefType ?? "—"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {brief.pictures?.length || 0} images uploaded
                            </p>
                          </div>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${brief.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {brief.isApproved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={action.href}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}
                          >
                            <IconComponent size={18} className={action.textColor} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                              {action.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
