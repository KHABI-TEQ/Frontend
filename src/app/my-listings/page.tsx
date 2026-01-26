/** @format */
"use client";
import React, { useEffect, useState } from "react";
import { useUserContext } from "@/context/user-context";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { GET_REQUEST, PUT_REQUEST, DELETE_REQUEST, PATCH_REQUEST } from "@/utils/requests";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading-component/loading";
import toast from "react-hot-toast";
import { Plus, Grid, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import CollapsibleMyListingFilters from "@/components/mylisting/filters/CollapsibleMyListingFilters";
import MyListingPropertyCard from "@/components/mylisting/MyListingPropertyCard";
import Pagination from "@/components/mylisting/Pagination";
import DeleteConfirmationModal from "@/components/mylisting/delete-confirmation-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Property,
  PaginationData,
  SearchFilters,
  StatusUpdatePayload
} from "@/types/my-listings.types";
import "@/styles/my-listings.css";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import ProcessingRequest from "@/components/loading-component/ProcessingRequest";



const MyListingPage = () => {
  const { user } = useUserContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const router = useRouter();

  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async (filters?: SearchFilters) => {
    if (filters) {
      setSearchLoading(true);
      setCurrentFilters(filters);
    } else {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams();
      let filtersApplied = false;

      const activeFilters = filters || currentFilters;
      
      // Add pagination
      queryParams.append("page", (activeFilters.page || 1).toString());
      queryParams.append("limit", (activeFilters.limit || 12).toString());

      // Add filter parameters
      if (activeFilters.status?.trim()) {
        queryParams.append("status", activeFilters.status.trim());
        filtersApplied = true;
      }
      if (activeFilters.propertyType?.trim()) {
        queryParams.append("propertyType", activeFilters.propertyType.trim());
        filtersApplied = true;
      }
      if (activeFilters.propertyCategory?.trim()) {
        queryParams.append("propertyCategory", activeFilters.propertyCategory.trim());
        filtersApplied = true;
      }
      if (activeFilters.state?.trim()) {
        queryParams.append("state", activeFilters.state.trim());
        filtersApplied = true;
      }
      if (activeFilters.localGovernment?.trim()) {
        queryParams.append("localGovernment", activeFilters.localGovernment.trim());
        filtersApplied = true;
      }
      if (activeFilters.area?.trim()) {
        queryParams.append("area", activeFilters.area.trim());
        filtersApplied = true;
      }
      if (activeFilters.priceMin !== undefined && activeFilters.priceMin > 0) {
        queryParams.append("priceMin", activeFilters.priceMin.toString());
        filtersApplied = true;
      }
      if (activeFilters.priceMax !== undefined && activeFilters.priceMax > 0) {
        queryParams.append("priceMax", activeFilters.priceMax.toString());
        filtersApplied = true;
      }
      if (activeFilters.isApproved !== undefined) {
        queryParams.append("isApproved", activeFilters.isApproved.toString());
        filtersApplied = true;
      }

      setHasActiveFilters(filtersApplied);

      const url = `${URLS.BASE}/account/properties/fetchAll?${queryParams.toString()}`;
      const response = await GET_REQUEST(url, Cookies.get("token"));

      if (response?.success) {
        const propertiesData = (response.data as any) || [];
        const paginationData = (response.pagination as any) || {
          total: propertiesData.length,
          page: activeFilters.page || 1,
          limit: activeFilters.limit || 12,
          totalPages: Math.ceil(propertiesData.length / (activeFilters.limit || 12)),
        };

        setProperties(propertiesData);
        setPagination(paginationData);

        if (filters && filtersApplied) {
          toast.success(
            `Found ${paginationData.total} propert${paginationData.total !== 1 ? "ies" : "y"}`
          );
        }
      } else {
        console.error("Error fetching properties:", response);
        setProperties([]);
        setPagination({ total: 0, page: 1, limit: 12, totalPages: 1 });
        if (filters && filtersApplied) {
          toast.error("No properties found matching your criteria");
        } else {
          toast.error("Failed to fetch properties");
        }
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
      setPagination({ total: 0, page: 1, limit: 12, totalPages: 1 });
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    fetchProperties({ ...filters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page };
    setCurrentFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handleClearFilters = () => {
    setHasActiveFilters(false);
    setCurrentFilters({ page: 1, limit: 12 });
    fetchProperties({ page: 1, limit: 12 });
  };

  const handleDeleteProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleEditProperty = async (property: Property) => {
    // Determine property type route from briefType
    const propertyType = property.briefType === "Outright Sales" ? "outright-sales" :
                        property.briefType === "Rent" ? "rent" :
                        property.briefType === "Shortlet" ? "shortlet" :
                        property.briefType === "Joint Venture" ? "joint-venture" : "outright-sales";

    router.push(`/update-property/${property._id}/${propertyType}`);
  };

  const handleViewProperty = (property: Property) => {
    const briefType =
      property.briefType === "Outright Sales"
        ? "Buy"
        : property.briefType === "Rent"
          ? "Rent"
          : "JV";
    router.push(`/property/${briefType}/${property._id}`);
  };

  const handleChangeStatus = async (property: Property) => {
    if (property.status === "pending") {
      toast.error("This property is still under review. You can’t change its status until it’s approved.");
      return;
    }

    setIsUpdating(true)
    try {
      const url = `${URLS.BASE}/account/properties/${property._id}/updateStatus`;
      const payload: StatusUpdatePayload = {
        status: !property.isAvailable ? "available" : "unavailable",
        reason: "Status updated from my listings"
      };
      const response = await PATCH_REQUEST(
        url,
        payload,
        Cookies.get("token")
      );

      if (response?.success) {
        toast.success(
          `Property marked as ${!property.isAvailable ? "available" : "unavailable"}`
        );
        fetchProperties();
      } else {
        toast.error("Failed to update property status");
      }
    } catch (error) {
      console.error("Error updating property status:", error);
      toast.error("Failed to update property status");
    }finally{
      setIsUpdating(false)
    }
  };

  const confirmDelete = async () => {
    if (!selectedProperty) return;

    setIsDeleting(true)
    try {
      const url = `${URLS.BASE}/account/properties/${selectedProperty._id}/delete`;
      const response = await DELETE_REQUEST(url, null, Cookies.get("token"));

      if (response?.success) {
        toast.success("Property deleted successfully!");
        fetchProperties();
        setShowDeleteModal(false);
        setSelectedProperty(null);
      } else {
        toast.error("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }finally{
      setIsDeleting(false)
    }
  };

  const getApprovalStats = () => {
    const approved = properties.filter((p) => p.isApproved && !p.isRejected).length;
    const rejected = properties.filter((p) => p.isRejected).length;
    const pending = properties.filter((p) => !p.isApproved && !p.isRejected).length;

    return { approved, rejected, pending };
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const stats = getApprovalStats();

  return (
    <CombinedAuthGuard
      requireAuth={true} // User must be logged in
      allowedUserTypes={["Agent", "Landowners"]} // Only these user types can access
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      agentCustomMessage="You must complete onboarding and be approved before you view posted properties."
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">

        <ProcessingRequest
          isVisible={isDeleting || isUpdating}
          title={isDeleting ? "Deleting Property" : "Updating Property Status"}
          message={
            isDeleting
              ? "Please wait while we remove this property from your listings..."
              : "We’re updating the property status. This will only take a moment..."
          }
          iconColor={isDeleting ? "#F87171" : "#8DDB90"}
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
              <ArrowLeftIcon size={20} />
              Back to Dashboard
            </Link>
          </div>
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex-1">
              <nav className="text-sm text-gray-600 mb-4">
                <button
                  onClick={() => router.push("/")}
                  className="hover:text-[#09391C] transition-colors"
                >
                  Home
                </button>
                <span className="mx-2">›</span>
                <span className="text-[#09391C] font-medium">My Listings</span>
              </nav>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#09391C] font-display">
                  My Property Listings
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and view all your property listings
              </p>
            </div>
            
            <Link
              href="/post-property"
              className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 sm:px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full lg:w-auto shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add New Property</span>
              <span className="sm:hidden">Add Property</span>
            </Link>
          </div>

          {/* Filter Component */}
          <div className="mb-8">
            <CollapsibleMyListingFilters
              onSearch={handleSearch}
              loading={searchLoading}
            />
          </div>

          {/* Content */}
          {properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "No properties found" : "No properties yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to find properties."
                    : "Start by adding your first property listing."}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/post-property"
                    className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Your First Property
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-[#09391C] mb-1">
                    {pagination.total}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total Properties
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">
                    {stats.approved}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Approved
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                    {stats.pending}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Under Review
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                    {stats.rejected}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Rejected
                  </div>
                </motion.div>
              </div>

              {/* Results Info */}
              {hasActiveFilters && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        Showing {properties.length} of {pagination.total} result
                        {pagination.total !== 1 ? "s" : ""} (Page {pagination.page} of{" "}
                        {pagination.totalPages})
                      </span>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline self-start sm:self-auto"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}

              {/* Properties Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr mb-8`}>
                <AnimatePresence mode="popLayout">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <MyListingPropertyCard
                        property={property}
                        onView={() => handleViewProperty(property)}
                        onEdit={() => handleEditProperty(property)}
                        onDelete={() => handleDeleteProperty(property)}
                        onChangeStatus={() => handleChangeStatus(property)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    disabled={searchLoading}
                  />
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedProperty && (
            <DeleteConfirmationModal
              brief={selectedProperty as any}
              onClose={() => {
                setShowDeleteModal(false);
                setSelectedProperty(null);
              }}
              onConfirm={confirmDelete}
            />
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
};

export default MyListingPage;
