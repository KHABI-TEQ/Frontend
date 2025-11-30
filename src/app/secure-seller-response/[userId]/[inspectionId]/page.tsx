"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SecureSellerResponseIndex from "@/components/secure-negotiations/seller-response/index";
import { SecureNegotiationProvider } from "@/context/secure-negotiations-context";
import AccessValidator from "@/components/secure-negotiations/access-validator";

const SecureSellerResponsePage = () => {
  const [credentials, setCredentials] = useState<{
    userId: string;
    inspectionId: string;
  } | null>(null);
  const params = useParams();

  useEffect(() => {
    const userId = params?.userId as string;
    const inspectionId = params?.inspectionId as string;

    console.log("Secure Seller Response - URL Params:", {
      userId,
      inspectionId,
    });

    if (typeof userId === "string" && typeof inspectionId === "string") {
      setCredentials({ userId, inspectionId });
    } else {
      console.error("Invalid URL parameters for secure seller response");
    }
  }, [params]);

  if (!credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading secure negotiation...</p>
        </div>
      </div>
    );
  }

  return (
    <SecureNegotiationProvider>
      <AccessValidator
        userId={credentials.userId}
        inspectionId={credentials.inspectionId}
        userType="seller"
      >
        <SecureSellerResponseIndex
          userId={credentials.userId}
          inspectionId={credentials.inspectionId}
        />
      </AccessValidator>
    </SecureNegotiationProvider>
  );
};

export default SecureSellerResponsePage;
