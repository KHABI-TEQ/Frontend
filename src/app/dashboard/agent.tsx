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
  Briefcase as BriefcaseIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  Eye,
  Gift,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";

interface Brief {
  _id: string;
  briefType: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  pictures: string[];
  price: number;
  createdAt: string;
  status: "pending";
}

interface DashboardStats {
  totalBriefs: number;
  totalActiveBriefs: number;
  totalInactiveBriefs: number;
  totalViews: number;
  totalInspectionRequests: number;
  totalCompletedInspectionRequests: number;
  newPendingBriefs: Brief[]; // This should hold the recent briefs
  averageRating: number;
  completedDeals: number;
  totalCommission: number; // Added based on usage in statCards
}


export default function AgentDashboard() {
  const router = useRouter();
  const { user } = useUserContext();
  // Briefs state will now be directly from stats.newPendingBriefs for "Recent Briefs" section
  const [stats, setStats] = useState<DashboardStats>({
    totalBriefs: 0,
    totalActiveBriefs: 0,
    totalInactiveBriefs: 0,
    completedDeals: 0,
    totalViews: 0,
    totalInspectionRequests: 0,
    totalCompletedInspectionRequests: 0,
    newPendingBriefs: [],
    averageRating: 0,
    totalCommission: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [referral, setReferral] = useState({ code: "", totalReferred: 0, points: 0, earnings: 0 });

  useEffect(() => {
    const preferred = (user as any)?.referralCode;
    if (preferred) {
      setReferral((prev) => ({ ...prev, code: preferred }));
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
    fetchReferralData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Assuming there's a single dashboard endpoint that returns all these stats
      // Replace URLS.fetchDashboardStats with your actual dashboard stats endpoint
      const dashboardResponse = await GET_REQUEST(
        `${URLS.BASE}${URLS.fetchDashboardStats}`, // This URL needs to be defined in URLS.ts
        Cookies.get("token"),
      );

      if (dashboardResponse?.data) {
        setStats({
          ...(dashboardResponse.data as any),
          // Ensure newPendingBriefs is an array, default to empty if not present
          newPendingBriefs: (dashboardResponse.data as any).newPendingBriefs || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch referral stats with graceful fallback
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
      // ignore and use fallback
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

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const statCards = [
    {
      title: "Total Briefs",
      value: stats.totalBriefs,
      icon: BriefcaseIcon,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Active Briefs",
      value: stats.totalActiveBriefs, // Changed to totalActiveBriefs from stats
      icon: TrendingUpIcon,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Completed Deals",
      value: stats.completedDeals,
      icon: CheckCircleIcon,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Total Views",
      value: `${stats.totalViews}`,
      icon: Eye,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#09391C] font-display">
              Welcome back, Agent {user.firstName}!
            </h1>
            <p className="text-[#5A5D63] mt-2">
              Manage your briefs and track your real estate performance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link
              href="/my-listings"
              className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <BriefcaseIcon size={20} />
              <span className="hidden sm:inline">View </span>Briefs
            </Link>
            <Link
              href="/my-inspection-requests"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-[#8DDB90] px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CalendarIcon size={20} />
              <span className="hidden sm:inline">Inspection</span>Requests
            </Link>
            <Link
              href="/agent-marketplace"
              className="bg-white hover:bg-gray-50 text-[#09391C] border border-gray-300 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PlusIcon size={20} />
              Agent Marketplace
            </Link>
          </div>
        </div>

        {/* Account Badges */}
        <div className="mb-4 space-y-2">
          {(() => {
            const sub = (user as any)?.activeSubscription;
            const isVerified = !!(user as any)?.isAccountVerified;
            const startISO = sub?.startedAt || sub?.startDate || null;
            const endISO = sub?.expiresAt || sub?.endDate || null;
            const daysLeft = endISO ? Math.max(0, Math.ceil((new Date(endISO).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
            const planName = sub?.meta?.appliedPlanName || sub?.meta?.planType || sub?.plan || '—';
            const planCode = sub?.meta?.planCode || '';
            const statusLabel = sub?.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : '—';
            const autoRenew = sub?.autoRenew === true;

            return (
              <>
                {sub && (
                  <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold">{planName}</span>
                        {planCode && <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200 text-xs">{planCode}</span>}
                        <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200 text-xs">{statusLabel}</span>
                        {typeof daysLeft === 'number' && endISO && (
                          <span className="text-xs">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-emerald-800">
                        {startISO && <span>Started: {new Date(startISO).toLocaleDateString()} • </span>}
                        {endISO && <span>Expires: {new Date(endISO).toLocaleDateString()}</span>}
                        {typeof autoRenew === 'boolean' && <span> • Auto-renew: {autoRenew ? 'On' : 'Off'}</span>}
                      </div>
                    </div>
                    <Link href="/agent-subscriptions" className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs font-medium">Manage</Link>
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-blue-600' : 'bg-gray-400'}`}></span>
                  {isVerified ? 'Verified account' : 'Unverified account'}
                </div>
              </>
            );
          })()}
        </div>

        {/* Notices */}
        {(() => {
          const isKycApproved = ((user as any)?.agentData?.kycStatus === 'approved') || ((user as any)?.verificationStatus?.kycCompleted) || ((user as any)?.agentVerificationData?.kycCompleted);
          const hasActiveSub = !!((user as any)?.activeSubscription && (user as any)?.activeSubscription.status === 'active');
          const freeDays = 7;
          return (
            <div className="space-y-3 mb-4">
 
              {!isKycApproved && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
                  <div>Enjoy free {freeDays} days premium by completing your agent KYC verification.</div>
                  <Link href="/agent-kyc" className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">Complete KYC</Link>
                </div>
              )}

              {(isKycApproved &&!hasActiveSub) && (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                  <div>Subscribe for a plan to enjoy full features and get your public access page.</div>
                  <Link href="/agent-subscriptions?tab=plans" className="px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">View Plans</Link>
                </div>
              )}

            </div>
          );
        })()}

        {/* Performance Overview + Referral */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#8DDB90] mb-2">
                ₦{stats.totalCommission.toLocaleString()}
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Total Commission</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <StarIcon size={20} className="text-yellow-500 fill-current sm:w-6 sm:h-6" />
                <span className="text-2xl sm:text-3xl font-bold text-[#09391C] ml-2">{stats.averageRating}</span>
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#09391C] mb-2">
                {stats.totalBriefs > 0 ? Math.round((stats.completedDeals / stats.totalBriefs) * 100) : 0}%
              </div>
              <p className="text-sm sm:text-base text-[#5A5D63]">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Referral</div>
              <div className="flex items-center justify-center gap-3">
                <code className="font-mono text-[#09391C] text-sm">{referral.code || "—"}</code>
                <button onClick={async () => { try { const url = `${window.location.origin}/auth/register?ref=${referral.code}`; await navigator.clipboard.writeText(url); toast.success("Referral link copied"); } catch { toast.error("Copy failed"); } }} className="p-1.5 rounded bg-gray-50 hover:bg-gray-100" aria-label="Copy referral link"><Copy size={14} /></button>
              </div>
              <div className="mt-2 text-xs text-[#5A5D63]">{referral.totalReferred} referred • ₦{referral.earnings.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                    <p className="text-sm font-medium text-[#5A5D63] mb-1">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {typeof card.value === "number"
                        ? card.value.toLocaleString()
                        : card.value}
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

        {/* Recent Briefs and Properties Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Recent Briefs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#09391C]">
                  Recent Briefs
                </h2>
                <Link
                  href="/my-listings"
                  className="text-[#8DDB90] hover:text-[#7BC87F] font-medium"
                >
                  View All
                </Link>
              </div>
            </div>

            {stats.newPendingBriefs.length === 0 ? (
              <div className="p-8 text-center">
                <BriefcaseIcon
                  size={32}
                  className="mx-auto text-gray-400 mb-3"
                />
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  No Briefs Available
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create new brief / Listing
                </p>
                <Link
                  href="/post-property"
                  className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors text-sm"
                >
                  <PlusIcon size={16} />
                  Post Brief
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {stats.newPendingBriefs.slice(0, 5).map((brief, index) => (
                  <motion.div
                    key={brief._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8DDB90] bg-opacity-10 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon size={16} className="text-[#8DDB90]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#09391C] capitalize text-sm">
                            {brief.briefType}
                          </h3> {/* Changed from propertyType to briefType as per Brief interface */}
                          <div className="flex items-center gap-1 text-xs text-[#5A5D63]">
                            <MapPinIcon size={10} />
                            {brief.location.area}
                          </div>
                          <p className="text-xs text-[#8DDB90] font-medium">
                            ₦{brief.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C]">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <Link
                href="/post-property"
                className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <PlusIcon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">List New Property</h3>
                  <p className="text-sm opacity-90">
                    Add property to portfolio
                  </p>
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
                  <p className="text-sm text-[#5A5D63]">
                    Find new opportunities
                  </p>
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
                href="/agent-subscriptions"
                className="w-full bg-white hover:bg-gray-50 text-[#09391C] border border-gray-200 p-4 rounded-lg font-medium flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                  <CreditCardIcon size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Manage Subscriptions</h3>
                  <p className="text-sm text-[#5A5D63]">View plans & renewals</p>
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
                  <p className="text-sm text-[#5A5D63]">
                    Manage account settings
                  </p>
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
                  <h3 className="font-semibold">Public Access Page</h3>
                  <p className="text-sm text-[#5A5D63]">Set up and manage your public access page</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
