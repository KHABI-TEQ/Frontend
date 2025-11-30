"use client";

import { useState, useEffect } from "react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import type {
  PotentialClientData,
  NegotiationType,
  DateTimeObj,
} from "@/types/negotiation";

export const useNegotiationData = (potentialClientID: string) => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "success" | "failed" | "pending"
  >("pending");
  const [details, setDetails] = useState<any>(null);
  const [negotiationType, setNegotiationType] =
    useState<NegotiationType>("NORMAL");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [dateTimeObj, setDateTimeObj] = useState<DateTimeObj>({
    date: "",
    time: "",
    selectedDate: "",
    selectedTime: "",
  });

  useEffect(() => {
    const fetchPotentialClientDetails = async (): Promise<void> => {
      if (!potentialClientID) return;

      setFormStatus("pending");

      try {
        const response = await GET_REQUEST(
          `${URLS.BASE + URLS.accountInspectionBaseUrl}/${potentialClientID}`,
          Cookies.get("token"),
        );

        if (response.success === true) {
          setFormStatus("success");
          const data: PotentialClientData = response.data;
          const property = data.propertyId || {};

          // Determine negotiation type
          if (data.letterOfIntention && data.letterOfIntention !== "") {
            setNegotiationType("LOI");
          } else {
            const briefType = property.briefType;
            setNegotiationType(
              briefType === "Outright Sales" || briefType === "Rent"
                ? "NORMAL"
                : "LOI",
            );
          }

          setCreatedAt(data.createdAt || null);

          setDateTimeObj({
            date: data.inspectionDate || "",
            time: data.inspectionTime || "",
            selectedDate: data.inspectionDate
              ? new Date(data.inspectionDate).toLocaleDateString()
              : "N/A",
            selectedTime: data.inspectionTime || "N/A",
          });

          const ownerData = data.owner;

          setDetails({
            firstName: ownerData?.firstName || "",
            lastName: ownerData?.lastName || "",
            currentAmount: property.price || 0,
            buyOffer: data.negotiationPrice || 0,
            letterOfIntention: data.letterOfIntention || "",
            propertyData: property,
            clientData: data.requestedBy,
          });
        }
      } catch (error) {
        setFormStatus("failed");
        console.error("Error fetching negotiation data:", error);
      }
    };

    fetchPotentialClientDetails();
  }, [potentialClientID]);

  return {
    formStatus,
    details,
    negotiationType,
    createdAt,
    dateTimeObj,
    setDateTimeObj,
  };
};
