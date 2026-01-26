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
  MapPin as MapPinIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  Calendar as CalendarIcon,
  Eye as EyeIcon,
  FileText as FileTextIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  User as UserIcon,
  Clipboard as ClipboardIcon,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";

interface Inspection {
  id: string;
  property: {
    id: string;
    title: string;
    price: number;
    image: string;
    status: string;
    briefType: string;
    isAvailable: boolean;
  };
  inspectionDate: string;
  inspectionTime: string;
  inspectionType: string;
  inspectionMode: string;
  inspectionStatus: string;
  status: string;
  isNegotiating: boolean;
  isLOI: boolean;
  owner: string;
  negotiationPrice: number;
  counterCount: number;
  reason: string | null;
  pendingResponseFrom: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

interface FieldAgentStats {
  totalInspections: number;
  assignedToday: number;
  completedInspections: number;
  completionRate: number;
  recentInspections: Inspection[];
}

export default function FieldAgentDashboard() {
  const router = useRouter();
  const { user } = useUserContext();
  const [stats, setStats] = useState<FieldAgentStats>({
    totalInspections: 0,
    assignedToday: 0,
    completedInspections: 0,
    completionRate: 0,
    recentInspections: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard stats
      const statsResponse = await GET_REQUEST(
        `${URLS.BASE}/account/dashboard`,
        Cookies.get("token")
      );

      // Fetch recent inspections
      const recentResponse = await GET_REQUEST(
        `${URLS.BASE}/account/inspectionsFieldAgent/fetchRecent`,
        Cookies.get("token")
      );

      if (statsResponse?.success && statsResponse.data) {
        const combinedStats: FieldAgentStats = {
          totalInspections: (statsResponse.data as any).totalInspections,
          assignedToday: (statsResponse.data as any).assignedToday,
          completedInspections: (statsResponse.data as any).completedInspections,
          completionRate: (statsResponse.data as any).completionRate,
          recentInspections: recentResponse?.success ? (recentResponse.data as any) || [] : [],
        };
        setStats(combinedStats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Inspections",
      value: stats.totalInspections,
      icon: <ClipboardIcon className="w-6 h-6" />,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Assigned Today",
      value: stats.assignedToday,
      icon: <CalendarIcon className="w-6 h-6" />,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: stats.completedInspections,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      title: "View Assigned Inspections",
      description: "See all inspections assigned to you",
      icon: <ClipboardIcon className="w-6 h-6" />,
      href: "/field-agent-inspections",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Today's Schedule",
      description: "View today's inspection appointments",
      icon: <CalendarIcon className="w-6 h-6" />,
      href: "/field-agent-inspections?filter=today",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Submit Report",
      description: "Complete and submit inspection reports",
      icon: <FileTextIcon className="w-6 h-6" />,
      href: "/field-agent-inspections?filter=pending-reports",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Profile Settings",
      description: "Update your profile and preferences",
      icon: <UserIcon className="w-6 h-6" />,
      href: "/profile-settings",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "negotiation_accepted":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "negotiation_accepted":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Field Agent Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/field-agent-inspections"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  View All Inspections
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inspections */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Inspections
                  </h2>
                  <Link
                    href="/field-agent-inspections"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {stats.recentInspections.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentInspections.map((inspection) => (
                      <div
                        key={inspection.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/field-agent-inspection/${inspection.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <HomeIcon className="w-4 h-4 text-gray-500" />
                              <h3 className="font-medium text-gray-900">
                                {inspection.property.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                                {inspection.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                {inspection.property.briefType}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              ₦{inspection.property.price.toLocaleString()}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {new Date(inspection.inspectionDate).toLocaleDateString()} at {inspection.inspectionTime}
                              </div>
                              <div className="flex items-center">
                                <UserIcon className="w-4 h-4 mr-1" />
                                {inspection.inspectionType} inspection
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center ml-4">
                            {getStatusIcon(inspection.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent inspections</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`${action.color} text-white p-4 rounded-lg block hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center">
                      {action.icon}
                      <div className="ml-3">
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-90 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
