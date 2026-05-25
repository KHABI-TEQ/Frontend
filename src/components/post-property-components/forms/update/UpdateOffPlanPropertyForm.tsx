"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { usePostPropertyContext } from "@/context/post-property-context";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "@/components/loading-component/loading";
import OutrightSalesPropertyForm from "@/components/post-property-components/forms/OutrightSalesPropertyForm";

interface UpdateOffPlanPropertyFormProps {
  pageTitle: string;
  pageDescription: string;
}

const UpdateOffPlanPropertyForm: React.FC<UpdateOffPlanPropertyFormProps> = ({
  pageTitle,
  pageDescription,
}) => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { user } = useUserContext();
  const { populatePropertyData, propertyData } = usePostPropertyContext();

  const [propertyLoading, setPropertyLoading] = useState(true);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        if (!propertyId) return;

        if (propertyData?.propertyType === "off-plan") {
          setPropertyLoading(false);
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/account/properties/${propertyId}/getOne`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (response.data?.success) {
          populatePropertyData(response.data.data);
        } else {
          throw new Error(response.data?.message || "Failed to fetch property data");
        }
      } catch (error: unknown) {
        console.error("Error loading property:", error);
        toast.error("Failed to load property data");
        router.push("/my-listings");
      } finally {
        setPropertyLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId, populatePropertyData, router, propertyData?.propertyType]);

  if (!user || propertyLoading) {
    return <Loading />;
  }

  return (
    <OutrightSalesPropertyForm
      listingMode="off-plan"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
};

export default UpdateOffPlanPropertyForm;
