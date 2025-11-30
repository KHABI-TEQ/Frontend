"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import Loading from "@/components/loading-component/loading";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import api from "@/utils/axiosConfig";

const UpdatePropertyRedirect = () => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { user } = useUserContext();
  const { populatePropertyData, setImages } = usePostPropertyContext();
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyAndRedirect = async () => {
      try {
        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Check user permissions
        if (user.userType !== "Landowners" && user.userType !== "Agent") {
          toast.error("You need to be a landowner or agent to update properties");
          router.push("/dashboard");
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/account/properties/${propertyId}/getOne`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (response.data && response.data.success) {
          const property = response.data.data;

          // Populate post property context so downstream pages don't re-fetch
          try {
            populatePropertyData && populatePropertyData(property);
            // also set existing images in local context for faster load
            if (property.pictures && property.pictures.length > 0) {
              const existingImages = property.pictures.map((url: string, index: number) => ({
                id: `existing-${index}`,
                file: null,
                preview: url,
                url,
                isUploading: false,
              }));
              setImages && setImages(existingImages);
            }
          } catch (err) {
            // ignore if provider not available
          }

          // Determine property type from briefType
          const propertyType = property.briefType === "Outright Sales" ? "outright-sales" :
                              property.briefType === "Rent" ? "rent" :
                              property.briefType === "Shortlet" ? "shortlet" :
                              property.briefType === "Joint Venture" ? "joint-venture" : "outright-sales";

          // Redirect to the specific property type route
          router.replace(`/update-property/${propertyId}/${propertyType}`);
        } else {
          throw new Error(response.data?.message || "Failed to fetch property data");
        }
      } catch (error: any) {
        console.error("Error fetching property:", error);
        setLoadingError(error.response?.data?.message || error.message || "Failed to load property data");
        toast.error("Failed to load property data");
      }
    };

    if (propertyId && user) {
      fetchPropertyAndRedirect();
    }
  }, [propertyId, user, router]);

  // Show error state
  if (loadingError) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Property</h3>
            <p className="text-gray-600 mb-6">{loadingError}</p>
            <button
              onClick={() => router.push("/my-listings")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to My Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Loading />;
};

export default UpdatePropertyRedirect;
