/**
 * Transaction registration API — public main website & practitioner pages.
 * Processing fee is always returned by the backend; never compute client-side for submission.
 */

import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export type TransactionPractitionerBody = {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  licenceNumber?: string;
  isOnPlatform?: boolean;
};

export type OffPlatformPartyType = "agent" | "property_owner";

export type RegisterTransactionBody = {
  transactionType: string;
  propertyId?: string;
  agentId?: string;
  offPlatformPartyType?: OffPlatformPartyType;
  practitioner?: TransactionPractitionerBody;
  inspectionId?: string;
  buyer: { email: string; fullName: string; phoneNumber: string };
  transactionValue: number;
  propertyIdentification: {
    type: "land" | "residential" | "commercial";
    exactAddress?: string;
    titleNumber?: string;
    ownerName?: string;
    lat?: number;
    lng?: number;
    surveyPlanRef?: string;
    ownerConfirmation?: boolean;
  };
  paymentReceiptFileName?: string;
  paymentReceiptUrl?: string;
  buyerIdFileName?: string;
  buyerIdUrl?: string;
  deedsOfAssignmentFileName?: string;
  deedsOfAssignmentUrl?: string;
  conveyanceFileName?: string;
  conveyanceUrl?: string;
};

export interface TransactionRegistrationRegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    registrationId?: string;
    processingFee?: number;
    paymentUrl?: string;
  };
}

export type TransactionRegistrationSearchResult = {
  address?: string | null;
  propertyId?: string | null;
  hasRegisteredTransaction?: boolean;
  registrationStatus?: string;
  propertyStatus?: string | null;
  soldOrLeasedRegistered?: boolean;
  inspectionHistoryCount?: number;
};

export const transactionRegistrationService = {
  getTypes: () =>
    GET_REQUEST<{ success: boolean; data: unknown }>(
      URLS.BASE + URLS.transactionRegistrationTypes
    ),

  getGuidelines: () =>
    GET_REQUEST<{ success: boolean; data: unknown }>(
      URLS.BASE + URLS.transactionRegistrationGuidelines
    ),

  search: (params: { address?: string; propertyId?: string; lat?: number; lng?: number }) => {
    const q = new URLSearchParams();
    if (params.address) q.set("address", params.address);
    if (params.propertyId) q.set("propertyId", params.propertyId);
    if (params.lat != null) q.set("lat", String(params.lat));
    if (params.lng != null) q.set("lng", String(params.lng));
    return GET_REQUEST<{ success: boolean; data: TransactionRegistrationSearchResult[] }>(
      `${URLS.BASE}${URLS.transactionRegistrationSearch}?${q.toString()}`
    );
  },

  check: (params: { propertyId?: string; address?: string; lat?: number; lng?: number }) => {
    const q = new URLSearchParams();
    if (params.propertyId) q.set("propertyId", params.propertyId);
    if (params.address) q.set("address", params.address);
    if (params.lat != null) q.set("lat", String(params.lat));
    if (params.lng != null) q.set("lng", String(params.lng));
    return GET_REQUEST<{ success: boolean; hasRegistration?: boolean; warning?: string; data?: unknown }>(
      `${URLS.BASE}${URLS.transactionRegistrationCheck}?${q.toString()}`
    );
  },

  register: (body: RegisterTransactionBody) =>
    POST_REQUEST<TransactionRegistrationRegisterResponse["data"]>(
      URLS.BASE + URLS.transactionRegistrationRegister,
      body
    ),
};
