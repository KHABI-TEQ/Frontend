"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "@/components/loading-component/loading";
import ShortletPropertyForm from "@/components/post-property-components/forms/ShortletPropertyForm";

interface UpdateShortletPropertyFormProps {
  pageTitle: string;
  pageDescription: string;
}

const UpdateShortletPropertyForm: React.FC<UpdateShortletPropertyFormProps> = ({
  pageTitle,
  pageDescription,
}) => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { user } = useUserContext();
  const { populatePropertyData, updatePropertyData, propertyData } = usePostPropertyContext();

  const [propertyLoading, setPropertyLoading] = useState(true);

  // Load property data on component mount - skip if context already populated
  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        if (!propertyId) return;

        if (propertyData && propertyData.propertyType) {
          setPropertyLoading(false);
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
          populatePropertyData(property);
        } else {
          throw new Error(response.data?.message || "Failed to fetch property data");
        }
      } catch (error: any) {
        console.error("Error loading property:", error);
        toast.error("Failed to load property data");
        router.push("/my-listings");
      } finally {
        setPropertyLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId, populatePropertyData, router, propertyData]);

  // Set property type on component mount
  useEffect(() => {
    updatePropertyData("initializePropertyType", "shortlet");
  }, [updatePropertyData]);

  if (!user || propertyLoading) {
    return <Loading />;
  }

  return (
    <ShortletPropertyForm
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
};

export default UpdateShortletPropertyForm;
