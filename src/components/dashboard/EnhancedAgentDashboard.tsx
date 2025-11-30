/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Building,
  Eye,
  DollarSign,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Crown,
  Users,
  ArrowRight,
  Plus,
  BarChart3,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import AgentShortProfile from "@/components/dashboard/AgentShortProfile";

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalInspections: number;
  inspectionEarnings: number;
  profileViews: number;
  completedDeals: number;
  rating: number;
  reviewCount: number;
}

interface RecentActivity {
  id: string;
  type: "listing" | "inspection" | "profile_view" | "inquiry";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
}

const EnhancedAgentDashboard: React.FC = () => {
  const { user } = useUserContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock agent state - in real implementation, this would come from user context or API
  const agentState = "free"; // "free" | "verified" | "expired"
  const isVerifiedAgent = false; ///

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalListings: 8,
        activeListings: 5,
        totalInspections: isVerifiedAgent ? 23 : 0,
        inspectionEarnings: isVerifiedAgent ? 345000 : 0,
        profileViews: isVerifiedAgent ? 156 : 0,
        completedDeals: 3,
        rating: 4.7,
        reviewCount: 12,
      });

      setRecentActivity([
        {
          id: "1",
          type: "listing",
          title: "New Property Listed",
          description: "3 bedroom apartment in Victoria Island",
          timestamp: "2 hours ago",
          icon: Building,
          color: "text-blue-500",
        },
        {
          id: "2",
          type: "inquiry",
          title: "Property Inquiry",
          description: "Client interested in Lekki property",
          timestamp: "5 hours ago",
          icon: Users,
          color: "text-green-500",
        },
        {
          id: "3",
          type: "profile_view",
          title: "Profile View",
          description: isVerifiedAgent ? "Someone viewed your profile" : "Upgrade to track profile views",
          timestamp: "1 day ago",
          icon: Eye,
          color: "text-purple-500",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, [isVerifiedAgent]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DDB90]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          {/* Agent short public profile (only shows when public URL exists) */}
          <div className="mb-4">
            {/** Imported dynamically to avoid hydration issues */}
            <React.Suspense fallback={null}>
              {/* @ts-ignore */}
              <AgentShortProfile />
            </React.Suspense>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09391C] mb-2 font-display">
                {getGreeting()}, {user?.firstName}! 👋
              </h1>
              <p className="text-[#5A5D63]">
                {isVerifiedAgent 
                  ? "Welcome back to your verified agent dashboard"
                  : "Ready to unlock your full potential as a real estate agent?"
                }
              </p>
            </div>

            {/* Agent Status */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isVerifiedAgent 
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {isVerifiedAgent ? (
                  <>
                    <CheckCircle size={16} />
                    Verified Agent
                  </>
                ) : (
                  <>
                    <Crown size={16} />
                    Free Agent
                  </>
                )}
              </div>

          
            </div>
          </div>
        </motion.div>

  
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Listings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building size={24} className="text-blue-600" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-[#09391C] mb-1">
              {stats?.totalListings || 0}
            </h3>
            <p className="text-[#5A5D63] text-sm">Total Listings</p>
            <div className="mt-2 text-xs text-green-600">
              +{stats?.activeListings || 0} active
            </div>
          </div>

          {/* Profile Views */}
          <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${
            !isVerifiedAgent ? "opacity-50" : ""
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye size={24} className="text-purple-600" />
              </div>
              {!isVerifiedAgent && <Crown size={20} className="text-[#8DDB90]" />}
            </div>
            <h3 className="text-2xl font-bold text-[#09391C] mb-1">
              {isVerifiedAgent ? (stats?.profileViews || 0) : "—"}
            </h3>
            <p className="text-[#5A5D63] text-sm">Profile Views</p>
            {!isVerifiedAgent && (
              <div className="mt-2 text-xs text-[#8DDB90]">
                Upgrade to track
              </div>
            )}
          </div>

          {/* Inspection Earnings */}
          <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${
            !isVerifiedAgent ? "opacity-50" : ""
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
              {!isVerifiedAgent && <Crown size={20} className="text-[#8DDB90]" />}
            </div>
            <h3 className="text-2xl font-bold text-[#09391C] mb-1">
              {isVerifiedAgent ? formatCurrency(stats?.inspectionEarnings || 0) : "—"}
            </h3>
            <p className="text-[#5A5D63] text-sm">Inspection Earnings</p>
            {!isVerifiedAgent && (
              <div className="mt-2 text-xs text-[#8DDB90]">
                Upgrade to earn
              </div>
            )}
          </div>

          {/* Completed Deals */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-yellow-600" />
              </div>
              <Star size={20} className="text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-[#09391C] mb-1">
              {stats?.completedDeals || 0}
            </h3>
            <p className="text-[#5A5D63] text-sm">Completed Deals</p>
            <div className="mt-2 text-xs text-yellow-600">
              ⭐ {stats?.rating || 0} rating
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#09391C] font-display">
                Recent Activity
              </h2>
              <Link 
                href="/activity" 
                className="text-[#8DDB90] hover:text-[#7BC87F] text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.color.includes('blue') ? 'bg-blue-100' :
                    activity.color.includes('green') ? 'bg-green-100' :
                    activity.color.includes('purple') ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <activity.icon size={20} className={activity.color} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#09391C] mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-[#5A5D63] text-sm mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      {activity.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#09391C] mb-6 font-display">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <Link
                href="/post-property"
                className="w-full flex items-center gap-3 p-4 bg-[#8DDB90]/10 text-[#8DDB90] rounded-lg hover:bg-[#8DDB90]/20 transition-colors group"
              >
                <Plus size={20} />
                <span className="font-medium">Add New Property</span>
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/my-listings"
                className="w-full flex items-center gap-3 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Building size={20} />
                <span className="font-medium">Manage Listings</span>
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>

              {isVerifiedAgent ? (
                <Link
                  href={`/agent-profile/${user?.id || user?._id}`}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <Star size={20} />
                  <span className="font-medium">View Public Profile</span>
                  <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={() => window.location.href = "/agent-upgrade"}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#8DDB90]/10 to-[#09391C]/5 text-[#8DDB90] rounded-lg hover:from-[#8DDB90]/20 hover:to-[#09391C]/10 transition-all group border border-[#8DDB90]/20"
                >
                  <Crown size={20} />
                  <span className="font-medium">Get Verified</span>
                  <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <Link
                href="/profile-settings"
                className="w-full flex items-center gap-3 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Users size={20} />
                <span className="font-medium">Account Settings</span>
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Performance Insights */}
            <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={20} className="text-blue-600" />
                <h3 className="font-medium text-blue-900">This Month</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">New Listings</span>
                  <span className="font-medium text-blue-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Property Inquiries</span>
                  <span className="font-medium text-blue-900">12</span>
                </div>
                {isVerifiedAgent && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Inspections Booked</span>
                    <span className="font-medium text-blue-900">5</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAgentDashboard;
