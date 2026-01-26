"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Filter as FilterIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  ChevronLeft as ChevronLeftIcon,
  Grid3X3 as GridIcon,
  List as ListIcon,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";

interface Inspection {
  _id: string;
  propertyId: string;
  propertyType: string;
  propertyAddress: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  sellerName: string;
  sellerPhone: string;
  inspectionType: "initial" | "follow_up" | "final";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  status: string;
  priority: string;
  date: string;
  search: string;
}

export default function FieldAgentInspections() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserContext();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState<FilterState>({
    status: searchParams?.get("filter") || "all",
    priority: "all",
    date: "all",
    search: "",
  });

  useEffect(() => {
    fetchInspections();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [inspections, filters]);

  const fetchInspections = async () => {
    try {
      setIsLoading(true);

      const response = await GET_REQUEST(
        `${URLS.BASE}/account/inspectionsFieldAgent/fetchAll`,
        Cookies.get("token")
      );

      if (response?.success && response.data) {
        // Transform the response data to match our interface
        const transformedInspections: Inspection[] = (response.data as any).map((inspection: any) => ({
          _id: inspection._id || inspection.id,
          propertyId: inspection.propertyId?._id || inspection.propertyId,
          propertyType: inspection.propertyId?.propertyType || "Property",
          propertyAddress: inspection.propertyId?.location ?
            `${inspection.propertyId.location.area}, ${inspection.propertyId.location.localGovernment}, ${inspection.propertyId.location.state}` :
            "Address not available",
          location: inspection.propertyId?.location || {
            state: "N/A",
            localGovernment: "N/A",
            area: "N/A"
          },
          scheduledDate: inspection.inspectionDate || inspection.scheduledDate,
          scheduledTime: inspection.inspectionTime || inspection.scheduledTime,
          status: inspection.status,
          priority: inspection.priority || "medium",
          buyerName: inspection.requestedBy?.fullName || "N/A",
          buyerPhone: inspection.requestedBy?.phoneNumber || "N/A",
          buyerEmail: inspection.requestedBy?.email || "N/A",
          sellerName: "N/A", // Not available in current API response
          sellerPhone: "N/A", // Not available in current API response
          inspectionType: inspection.inspectionType || "initial",
          notes: inspection.inspectionReport?.notes || "",
          createdAt: inspection.createdAt,
          updatedAt: inspection.updatedAt
        }));

        setInspections(transformedInspections);
      } else {
        toast.error(response?.message || "Failed to load inspections");
        setInspections([]);
      }
    } catch (error) {
      console.error("Failed to fetch inspections:", error);
      toast.error("Failed to load inspections");
      setInspections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inspections];

    // Filter by status
    if (filters.status !== "all") {
      if (filters.status === "today") {
        const today = new Date().toDateString();
        filtered = filtered.filter(
          (inspection) => new Date(inspection.scheduledDate).toDateString() === today
        );
      } else if (filters.status === "pending-reports") {
        filtered = filtered.filter(
          (inspection) => inspection.status === "completed" && !inspection.notes
        );
      } else {
        filtered = filtered.filter((inspection) => inspection.status === filters.status);
      }
    }

    // Filter by priority
    if (filters.priority !== "all") {
      filtered = filtered.filter((inspection) => inspection.priority === filters.priority);
    }

    // Filter by date
    if (filters.date !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.date) {
        case "today":
          filterDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(
            (inspection) => new Date(inspection.scheduledDate) <= filterDate
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() + 7);
          filtered = filtered.filter(
            (inspection) => new Date(inspection.scheduledDate) <= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() + 1);
          filtered = filtered.filter(
            (inspection) => new Date(inspection.scheduledDate) <= filterDate
          );
          break;
      }
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (inspection) =>
          inspection.propertyType.toLowerCase().includes(searchLower) ||
          inspection.buyerName.toLowerCase().includes(searchLower) ||
          inspection.location.area.toLowerCase().includes(searchLower) ||
          inspection.location.localGovernment.toLowerCase().includes(searchLower)
      );
    }

    setFilteredInspections(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <AlertCircleIcon className="w-4 h-4 text-yellow-500" />;
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
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
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
    <CombinedAuthGuard
      requireAuth={true} // User must be logged in
      allowedUserTypes={["FieldAgent"]} // Only these user types can access
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => router.back()}
                    className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Assigned Inspections
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage your property inspection assignments
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <GridIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="negotiation_accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="today">Today&apos;s Inspections</option>
                <option value="pending-reports">Pending Reports</option>
              </select>

              {/* Inspection Type Filter */}
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="price">Price Inspection</option>
                <option value="physical">Physical Inspection</option>
              </select>

              {/* Date Filter */}
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                Showing {filteredInspections.length} of {inspections.length} inspections
              </p>
            </div>
          </div>

          {/* Inspections List/Grid */}
          {filteredInspections.length > 0 ? (
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
            }`}>
              {filteredInspections.map((inspection, index) => (
                <motion.div
                  key={inspection._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/field-agent-inspection/${inspection._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">
                        {inspection.propertyType}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(inspection.priority)}`}>
                        {inspection.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {inspection.propertyAddress}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(inspection.scheduledDate).toLocaleDateString()} at {inspection.scheduledTime}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Buyer: {inspection.buyerName}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {inspection.buyerPhone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      {getStatusIcon(inspection.status)}
                      <span className="ml-1 capitalize">
                        {inspection.inspectionType.replace('_', ' ')} Inspection
                      </span>
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No inspections found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or check back later for new assignments.
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
