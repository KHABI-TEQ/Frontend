"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  DollarSign as DollarSignIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Grid2X2 as GridIcon,
  List as ListIcon,
  Timer,
  Users,
  Video,
  FileText,
  RefreshCw as RefreshIcon,
  Building,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";
import { CombinedAuthGuard } from "@/logic/combinedAuthGuard";
import { buildLocationTitle } from "@/utils/helpers";

interface Location {
  state?: string;
  localGovernment?: string;
  area?: string;
  streetAddress?: string;
}

interface Property {
  id?: string;
  _id?: string;
  location?: Location;
  price?: number;
  additionalFeatures?: Record<string, unknown>;
  shortletDetails?: Record<string, unknown>;
  image?: string;
  status?: string;
  briefType?: string;
  isAvailable?: boolean;
  propertyType?: string;
  features?: string[];
}
 
interface InspectionData {
  id: string;
  property: Property | null;
  inspectionDate: string | null;
  inspectionTime: string | null;
  inspectionType: string;
  inspectionMode: string;
  inspectionStatus?: string;
  status: string;
  isNegotiating?: boolean;
  isLOI?: boolean;
  owner?: string;
  negotiationPrice?: number;
  counterCount?: number;
  reason?: string | null;
  pendingResponseFrom?: "buyer" | "seller" | "admin";
  stage?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  requestSource?: string;
  origin?: string;
}

interface BookingData {
  _id: string;
  propertyId: Property | null;
  ownerResponse: {
    response?: string;
    note?: string;
  },
  bookingDetails?: {
    checkInDateTime?: string;
    checkOutDateTime?: string;
    guestNumber?: number;
    note?: string;
  };
  bookedBy?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  paymentDetails?: {
    amountToBePaid?: number;
    currency?: string;
  };
  bookingMode?: "instant" | "request" | string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StatsResponse {
  success: boolean;
  data: {
    totalInspections: number;
    pendingInspections: number;
    completedInspections: number;
    cancelledInspections: number;
    averageResponseTimeInHours: number;
  };
}

const STATUS_CONFIG = {
  pending_transaction: {
    label: "Pending Transaction",
    color: "bg-[#8DDB90]",
    textColor: "text-amber-800",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    icon: Timer,
  },
  inspection_approved: {
    label: "Inspection Approved",
    color: "bg-[#8DDB90]",
    textColor: "text-green-800",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: CheckCircleIcon,
  },
  confirmed: {
    label: "Payment Approved",
    color: "bg-[#8DDB90]",
    textColor: "text-green-800",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: CheckCircleIcon,
  },
  new: {
    label: "New Request",
    color: "bg-[#8DDB90]",
    textColor: "text-blue-800",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    icon: AlertCircleIcon,
  },
  completed: {
    label: "Completed",
    color: "bg-[#8DDB90]",
    textColor: "text-blue-800",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-[#8DDB90]",
    textColor: "text-red-800",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    icon: XCircleIcon,
  },
  pending: {
    label: "Pending",
    color: "bg-[#8DDB90]",
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    icon: AlertCircleIcon,
  },
} as const;

const TYPE_CONFIG = {
  price: {
    label: "Price Negotiation",
    icon: DollarSignIcon,
    color: "bg-[#8DDB90]",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  LOI: {
    label: "Letter of Intent",
    icon: FileText,
    color: "bg-[#8DDB90]",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
} as const;

const MODE_CONFIG = {
  in_person: {
    label: "In Person",
    icon: Users,
    color: "text-[#09391C]",
  },
  virtual: {
    label: "Virtual",
    icon: Video,
    color: "text-[#8DDB90]",
  },
} as const;

type TabKey = "inspections" | "bookings";

export default function MyInspectionRequestsPage() {
  const router = useRouter();
  const { user } = useUserContext();

  const [activeTab, setActiveTab] = useState<TabKey>("inspections");

  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);

  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    status: "",
    inspectionType: "",
    inspectionMode: "",
    sortBy: "newest",
    dateFrom: "",
    dateTo: "",
  });

  const token = useMemo(() => Cookies.get("token"), []);

  // UI state for bookings actions
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingData | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingData | null>(null);
  const [reviewResponse, setReviewResponse] = useState<"available" | "unavailable">("available");
  const [reviewNote, setReviewNote] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchInspections = useCallback(
    async (page = 1, showLoading = true) => {
      if (showLoading) setIsLoading(true);
      if (!showLoading) setIsRefreshing(true);

      try {
        const url = `${URLS.BASE + URLS.accountInspectionBaseUrl}/fetchAll?page=${page}&limit=10`;
        const response = await GET_REQUEST(url, token);

        if (response?.success) {
          setInspections(Array.isArray(response.data) ? (response.data as any) : []);
          setTotalPages((response.pagination as any)?.totalPages || 1);
          setTotalCount((response.pagination as any)?.total || ((response.data as any)?.length || 0));
          setCurrentPage((response.pagination as any)?.page || page);
        } else {
          throw new Error(response?.message || "Failed to fetch inspections");
        }
      } catch (error) {
        console.error("Failed to fetch inspections:", error);
        toast.error("Failed to load inspection requests");
        setInspections([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  const fetchBookings = useCallback(
    async (page = 1, showLoading = true) => {
      if (showLoading) setIsLoading(true);
      if (!showLoading) setIsRefreshing(true);

      try {
        // Endpoint aligned with inspections namespace used for booking creation
        const url = `${URLS.BASE + URLS.accountBookingsBaseUrl}/fetchAll?page=${page}&limit=10`;
        const response = await GET_REQUEST(url, token);

        if (response?.success) {
          setBookings(Array.isArray(response.data) ? response.data : []);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalCount(response.pagination?.total || (response.data?.length || 0));
          setCurrentPage(response.pagination?.page || page);
        } else {
          throw new Error(response?.message || "Failed to fetch bookings");
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        // Be non-blocking: if API not available yet, show empty state
        setBookings([]);
        toast.error("Failed to load booking requests");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  const fetchStats = useCallback(async () => {
    try {
      const url = `${URLS.BASE}/account/my-inspections/stats`;
      if (!token) return;
      const response = await GET_REQUEST(url, token);
      if (response?.success) setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "inspections") {
      fetchInspections(1);
      fetchStats();
    } else {
      fetchBookings(1);
    }
  }, [user, activeTab, fetchInspections, fetchBookings, fetchStats]);

  const respondToBookingRequest = useCallback(async (bookingId: string, responseVal: "available" | "unavailable", note?: string) => {
    if (!token) { toast.error("Not authenticated"); return; }
    setIsSubmittingReview(true);
    try {
      const base = URLS.BASE + URLS.accountBookingsBaseUrl;
      const primary = `${base}/${bookingId}/respondToRequest`;
      const payload = { response: responseVal, ...(note && note.trim() ? { note: note.trim() } : {}) };
      let res: any;
      try {
        res = await POST_REQUEST<any>(primary, payload, token);
      } catch (e) {
        const fallback = `${base}/${bookingId}/repondToRequest`;
        res = await POST_REQUEST<any>(fallback, payload, token);
      }
      if (res && (res.success === true || res.status === "success")) {
        toast.success("Response submitted");
        setReviewBooking(null);
        setReviewNote("");
        setReviewResponse("available");
        fetchBookings(currentPage, false);
      } else {
        toast.error((res && (res.message || res.error)) || "Failed to submit response");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit response");
    } finally {
      setIsSubmittingReview(false);
    }
  }, [token, fetchBookings, currentPage]);

  const handleRefresh = useCallback(() => {
    if (activeTab === "inspections") {
      fetchInspections(currentPage, false);
      fetchStats();
    } else {
      fetchBookings(currentPage, false);
    }
  }, [activeTab, fetchInspections, fetchStats, fetchBookings, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      if (activeTab === "inspections") fetchInspections(page);
      else fetchBookings(page);
    },
    [activeTab, fetchInspections, fetchBookings]
  );

  const getSourceBadge = (ins: any) => {
    const src = (ins && (ins.source || ins.requestSource || ins.origin)) || "";
    const isPublic = String(src).toLowerCase().includes("public");
    return isPublic
      ? { label: "Public", classes: "bg-blue-100 text-blue-800 border-blue-200" }
      : { label: "Marketplace", classes: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const filteredInspections = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    return inspections.filter((inspection) => {
      if (searchLower) {
        const type = String(inspection.inspectionType || "").toLowerCase();
        const status = String(inspection.status || inspection.inspectionStatus || "").toLowerCase();
        if (!type.includes(searchLower) && !status.includes(searchLower)) return false;
      }

      if (filters.status && inspection.status !== filters.status) return false;
      if (filters.inspectionType && inspection.inspectionType !== filters.inspectionType) return false;
      if (filters.inspectionMode && inspection.inspectionMode !== filters.inspectionMode) return false;

      return true;
    });
  }, [inspections, searchTerm, filters]);

  const filteredBookings = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    return bookings.filter((b) => {
      if (searchLower) {
        const status = String(b.status || "").toLowerCase();
        const mode = String(b.bookingMode || "").toLowerCase();
        if (!status.includes(searchLower) && !mode.includes(searchLower)) return false;
      }
      if (filters.status && b.status !== filters.status) return false;
      return true;
    });
  }, [bookings, searchTerm, filters.status]);

  const getStatusConfig = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const getTypeConfig = (type: string) => TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.price;
  const getModeConfig = (mode: string) => MODE_CONFIG[mode as keyof typeof MODE_CONFIG] || MODE_CONFIG.in_person;

  const clearFilters = () => {
    setFilters({ status: "", inspectionType: "", inspectionMode: "", sortBy: "newest", dateFrom: "", dateTo: "" });
    setSearchTerm("");
  };

  const listTotalCount = activeTab === "inspections" ? filteredInspections.length : filteredBookings.length;

 
  return (
    <CombinedAuthGuard requireAuth={true} allowedUserTypes={["Agent", "Landowners"]} requireAgentOnboarding={false} requireAgentApproval={false} requireActiveSubscription={true} agentCustomMessage="You must complete onboarding and be approved before you view inspection requests.">
      <div className="min-h-screen bg-[#EEF1F1]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
                <ArrowLeftIcon size={20} />
                Back to Dashboard
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#09391C] font-display mb-3">My Inspection & Booking Requests</h1>
                <p className="text-[#5A5D63] text-lg">Monitor and manage all your property inspection and booking requests in one place</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleRefresh} disabled={isRefreshing} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#09391C] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <RefreshIcon size={16} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
                <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors">
                  {/* icon space reserved by design */}
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-2 mb-6 border border-gray-100 inline-flex">
            <button onClick={() => setActiveTab("inspections")} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "inspections" ? "bg-[#09391C] text-white" : "text-[#09391C]"}`}>Inspection Requests</button>
            <button onClick={() => setActiveTab("bookings")} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "bookings" ? "bg-[#09391C] text-white" : "text-[#09391C]"}`}>Booking Requests</button>
          </div>

          {activeTab === "inspections" && stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-[#09391C]">{stats.totalInspections}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircleIcon size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingInspections}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircleIcon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedInspections}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircleIcon size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelledInspections}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ClockIcon size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-lg font-bold text-purple-600">{stats.averageResponseTimeInHours.toFixed(1)}h</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white rounded-xl p-6 mb-6 border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#09391C]">Advanced Filters</h3>
                  <button onClick={clearFilters} className="text-sm text-[#5A5D63] hover:text-[#09391C] transition-colors">Clear All</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent">
                      <option value="">All Status</option>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {activeTab === "inspections" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select value={filters.inspectionType} onChange={(e) => setFilters({ ...filters, inspectionType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent">
                          <option value="">All Types</option>
                          <option value="price">Price Negotiation</option>
                          <option value="LOI">Letter of Intent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                        <select value={filters.inspectionMode} onChange={(e) => setFilters({ ...filters, inspectionMode: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent">
                          <option value="">All Modes</option>
                          <option value="in_person">In Person</option>
                          <option value="virtual">Virtual</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={activeTab === "inspections" ? "Search by property title, type, or status..." : "Search by property title, status, or mode..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-lg" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-[#8DDB90]" : "text-gray-500 hover:text-gray-700"}`}>
                    <GridIcon size={18} />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-[#8DDB90]" : "text-gray-500 hover:text-gray-700"}`}>
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-[#5A5D63]">
              <div>
                {listTotalCount} of {totalCount} {activeTab === "inspections" ? "inspections" : "bookings"}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
              <div>Page {currentPage} of {totalPages}</div>
            </div>
          </div>

          {activeTab === "inspections" ? (
            isLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`bg-white border border-gray-100 rounded-xl overflow-hidden ${viewMode === "list" ? "flex" : ""} animate-pulse`}>
                    {viewMode === "grid" && (
                      <div className="h-48 bg-gray-200" />
                    )}
                    {viewMode === "list" && (
                      <div className="w-32 h-32 bg-gray-200" />
                    )}
                    <div className="p-6 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-24" />
                        <div className="h-8 bg-gray-200 rounded w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredInspections.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                <Building size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">{searchTerm || Object.values(filters).some((f) => f) ? "No matching inspection requests found" : "No inspection requests yet"}</h3>
                <p className="text-gray-500 mb-6">{searchTerm || Object.values(filters).some((f) => f) ? "Try adjusting your search criteria or filters" : "Inspection requests will appear here when buyers request to inspect your properties"}</p>
                {(searchTerm || Object.values(filters).some((f) => f)) && (
                  <button onClick={clearFilters} className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-lg font-medium transition-colors">Clear All Filters</button>
                )}
              </motion.div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}>
                {filteredInspections.map((inspection, index) => {
                  const statusConfig = getStatusConfig(String(inspection.status || inspection.inspectionStatus || "pending"));
                  const typeConfig = getTypeConfig(String(inspection.inspectionType || "price"));
                  const modeConfig = getModeConfig(String(inspection.inspectionMode || "in_person"));
                  const StatusIcon = statusConfig.icon;
                  const TypeIcon = typeConfig.icon;
                  const ModeIcon = modeConfig.icon;

                  const altTitle = buildLocationTitle(inspection.property?.location)

                  return (
                    <motion.div key={inspection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white border border-gray-100 rounded-xl overflow-visible hover:border-gray-300 transition-all duration-200 ${viewMode === "list" ? "flex" : ""}`}>
                      {viewMode === "grid" && inspection.property?.image && (
                        <div className="h-48 relative overflow-hidden">
                          <img src={inspection.property.image} alt={altTitle || "Property"} className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} text-white`}>{statusConfig.label}</span>
                            {inspection.isLOI && <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">LOI</span>}
                          </div>
                        </div>
                      )}

                      {viewMode === "list" && inspection.property?.image && (
                        <div className="w-32 h-32 relative overflow-hidden">
                          <img src={inspection.property.image} alt={altTitle || "Property"} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-[#09391C] mb-1 truncate">{altTitle || "Property details unavailable"}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63]">
                              <MapPinIcon size={14} />
                              <span>Inspection Request</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {viewMode === "grid" && (
                              <>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                                  <StatusIcon size={12} className="inline mr-1" />
                                  {statusConfig.label}
                                </span>
                                {inspection.isLOI && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">LOI</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {typeof inspection.property?.price === "number" && (
                          <div className="mb-4">
                            <p className="text-lg font-semibold text-[#8DDB90]">₦{Number(inspection.property.price || 0).toLocaleString()}</p>
                            {typeof inspection.negotiationPrice === "number" && inspection.negotiationPrice > 0 && (
                              <p className="text-sm text-orange-600 font-medium">Offered: ₦{Number(inspection.negotiationPrice || 0).toLocaleString()}</p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                              <CalendarIcon size={14} />
                              <span>Date & Time</span>
                            </div>
                            <p className="text-sm font-medium text-[#09391C]">{inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : "-"}</p>
                            <p className="text-sm text-[#5A5D63]">{inspection.inspectionTime || "-"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                              <TypeIcon size={14} />
                              <span>Type & Mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeConfig(String(inspection.inspectionType || "price")).bgColor} ${getTypeConfig(String(inspection.inspectionType || "price")).textColor}`}>
                                {getTypeConfig(String(inspection.inspectionType || "price")).label}
                              </span>
                              <span className={`text-xs ${getModeConfig(String(inspection.inspectionMode || "in_person")).color}`}>
                                <ModeIcon size={12} className="inline mr-1" />
                                {getModeConfig(String(inspection.inspectionMode || "in_person")).label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-[#5A5D63]">
                            <span>Stage: </span>
                            <span className="font-medium capitalize">{inspection.stage || "-"}</span>
                          </div>
                          {typeof inspection.counterCount === "number" && inspection.counterCount > 0 && (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700">{inspection.counterCount} Counter{inspection.counterCount !== 1 ? "s" : ""}</span>
                          )}
                        </div>

                        {inspection.reason && (
                          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-[#5A5D63]">{inspection.reason}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                          {inspection.pendingResponseFrom === "seller" && (
                            <button onClick={() => router.push(`/secure-seller-response/${inspection.owner}/${inspection.id}`)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Respond</button>
                          )}

                          {inspection.property && (
                            <button onClick={() => router.push(`/property/buy/${inspection.property!.id || inspection.property!._id}`)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#09391C] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                              <HomeIcon size={16} />
                              View Property
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
            )
          ) : (
            isLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`bg-white border border-gray-100 rounded-xl overflow-hidden ${viewMode === "list" ? "flex" : ""} animate-pulse`}>
                    {viewMode === "grid" && (
                      <div className="h-48 bg-gray-200" />
                    )}
                    {viewMode === "list" && (
                      <div className="w-32 h-32 bg-gray-200" />
                    )}
                    <div className="p-6 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-24" />
                        <div className="h-8 bg-gray-200 rounded w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredBookings.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                <Building size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">{searchTerm || Object.values(filters).some((f) => f) ? "No matching booking requests found" : "No booking requests yet"}</h3>
                <p className="text-gray-500 mb-6">{searchTerm || Object.values(filters).some((f) => f) ? "Try adjusting your search criteria or filters" : "Shortlet booking requests will appear here when guests request to book your properties"}</p>
                {(searchTerm || Object.values(filters).some((f) => f)) && (
                  <button onClick={clearFilters} className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-lg font-medium transition-colors">Clear All Filters</button>
                )}
              </motion.div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}>
                {filteredBookings.map((b, index) => {
                  const statusConfig = getStatusConfig(String(b.status || "pending"));
                  const StatusIcon = statusConfig.icon;
                  const title = buildLocationTitle(b.propertyId?.location) || "Property details unavailable";
                  const amount = Number(b.paymentDetails?.amountToBePaid || 0);
                  const currency = b.paymentDetails?.currency || "₦";
                  const checkIn = b.bookingDetails?.checkInDateTime ? new Date(b.bookingDetails.checkInDateTime) : null;
                  const checkOut = b.bookingDetails?.checkOutDateTime ? new Date(b.bookingDetails.checkOutDateTime) : null;

                  return (
                    <motion.div key={b._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white border border-gray-100 rounded-xl overflow-visible hover:border-gray-300 transition-all duration-200 ${viewMode === "list" ? "flex" : ""}`}>
                      {viewMode === "list" && b.propertyId?.image && (
                        <div className="w-32 h-32 relative overflow-hidden">
                          <img src={b.propertyId.image} alt={title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {viewMode === "grid" && b.propertyId?.image && (
                        <div className="h-48 relative overflow-hidden">
                          <img src={b.propertyId.image} alt={title} className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} text-white`}>{statusConfig.label}</span>
                          </div>
                        </div>
                      )}

                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-[#09391C] mb-1 truncate">{title}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63]">
                              <MapPinIcon size={14} />
                              <span>Booking Request</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {viewMode === "grid" && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                                <StatusIcon size={12} className="inline mr-1" />
                                {statusConfig.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {amount > 0 && (
                          <div className="mb-4">
                            <p className="text-lg font-semibold text-[#8DDB90]">{currency}{amount.toLocaleString()}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                              <CalendarIcon size={14} />
                              <span>Dates</span>
                            </div>
                            <p className="text-sm font-medium text-[#09391C]">{checkIn ? checkIn.toLocaleString() : "-"}</p>
                            <p className="text-sm text-[#5A5D63]">{checkOut ? checkOut.toLocaleString() : "-"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                              <Users size={14} />
                              <span>Guests & Mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">{b.bookingDetails?.guestNumber || 1} Guest{(b.bookingDetails?.guestNumber || 1) > 1 ? "s" : ""}</span>
                              <span className="text-xs text-gray-700 capitalize">{String(b.bookingMode || "request")}</span>
                            </div>
                          </div>
                        </div>

                        {b.bookedBy?.fullName && (
                          <div className="text-sm text-[#5A5D63] mb-2">Booked by: <span className="font-medium text-[#09391C]">{b.bookedBy.fullName}</span></div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 relative">
                          {b.propertyId && (
                            <button onClick={() => router.push(`/property/buy/${b.propertyId!.id || b.propertyId!._id}`)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#09391C] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                              <HomeIcon size={16} />
                              View Property
                            </button>
                          )}

                          <div className="ml-auto">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === b._id ? null : b._id)}
                                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Actions
                              </button>
                              <AnimatePresence>
                                {openMenuId === b._id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => { setViewingBooking(b); setOpenMenuId(null); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        View details
                                      </button>
                                      {String(b.status || "").toLowerCase() === "requested" && (
                                        <button
                                          onClick={() => { setReviewBooking(b); setOpenMenuId(null); }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Review request
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
            )
          )}

          {totalPages > 1 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeftIcon size={16} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;

                      return (
                        <button key={page} onClick={() => handlePageChange(page as number)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === currentPage ? "bg-[#8DDB90] text-white" : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"}`}>
                          {page as number}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Next
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {viewingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setViewingBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#09391C]">Booking Details</h3>
                <button onClick={() => setViewingBooking(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium capitalize">{String(viewingBooking.status || "-")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Mode</span><span className="font-medium capitalize">{String(viewingBooking.bookingMode || "-")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Guests</span><span className="font-medium">{viewingBooking.bookingDetails?.guestNumber || 1}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span className="font-medium">{viewingBooking.bookingDetails?.checkInDateTime ? new Date(viewingBooking.bookingDetails.checkInDateTime).toLocaleString() : "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span className="font-medium">{viewingBooking.bookingDetails?.checkOutDateTime ? new Date(viewingBooking.bookingDetails.checkOutDateTime).toLocaleString() : "-"}</span></div>
                {/* {viewingBooking.bookedBy && (
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 mb-1">Booked By</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> <span className="font-medium">{viewingBooking.bookedBy.fullName || "-"}</span></div>
                      <div><span className="text-gray-600">Phone:</span> <a className="font-medium text-blue-600" href={`tel:${viewingBooking.bookedBy.phoneNumber || ""}`}>{viewingBooking.bookedBy.phoneNumber || "-"}</a></div>
                      <div className="col-span-2"><span className="text-gray-600">Email:</span> <a className="font-medium text-blue-600" href={`mailto:${viewingBooking.bookedBy.email || ""}`}>{viewingBooking.bookedBy.email || "-"}</a></div>
                    </div>
                  </div>
                )} */}
                {viewingBooking.bookingDetails?.note && (
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 mb-1">Guest Note</div>
                    <p className="text-gray-800 whitespace-pre-wrap">{viewingBooking.bookingDetails.note}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewingBooking(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Request Modal */}
      <AnimatePresence>
        {reviewBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => (isSubmittingReview ? null : setReviewBooking(null))}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#09391C]">Review Booking Request</h3>
                <button disabled={isSubmittingReview} onClick={() => setReviewBooking(null)} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Your response</div>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="resp" value="available" checked={reviewResponse === "available"} onChange={() => setReviewResponse("available")} />
                      Available
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="resp" value="unavailable" checked={reviewResponse === "unavailable"} onChange={() => setReviewResponse("unavailable")} />
                      Unavailable
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} placeholder="Add a message for the guest (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button disabled={isSubmittingReview} onClick={() => setReviewBooking(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button
                  disabled={isSubmittingReview}
                  onClick={() => respondToBookingRequest(reviewBooking._id, reviewResponse, reviewNote)}
                  className={`px-5 py-2 rounded-lg text-white ${reviewResponse === "available" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"} disabled:opacity-60`}
                >
                  {isSubmittingReview ? "Submitting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </CombinedAuthGuard>
  );
}
