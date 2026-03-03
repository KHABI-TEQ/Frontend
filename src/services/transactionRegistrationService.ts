/**
 * Transaction registration API (public/DealSite; also for Agent, Developer, Landlord when they use the registration portal).
 * See docs/FRONTEND_API_GUIDE.md §5–6.
 *
 * §6.1–6.4: Do not calculate processing fee on the frontend. Send transactionValue in the register request;
 * the backend returns data.processingFee (bands: below ₦5M = 0, ₦5M–₦50M = ₦100k, above ₦50M = ₦150k)
 * and, when fee > 0, optionally data.paymentUrl. Any UI (Agent/Developer/Landlord or public) must use
 * response.data.processingFee and response.data.paymentUrl only — never compute fee client-side.
 */

import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

/** §6.3: Register success — use processingFee and paymentUrl from response; do not calculate fee on frontend. */
export interface TransactionRegistrationRegisterResponse {
  success: boolean;
  data?: {
    registrationId?: string;
    /** From backend per §6.1; 0 when value < ₦5M, else ₦100k or ₦150k. */
    processingFee?: number;
    /** Present when processingFee > 0 and backend generated a Paystack link. */
    paymentUrl?: string;
  };
}

export const transactionRegistrationService = {
  /** §6.2: List transaction types (labels, eligibility, display value bands for UI only). */
  getTypes: () =>
    GET_REQUEST<{ success: boolean; data: unknown }>(
      URLS.BASE + URLS.transactionRegistrationTypes
    ),

  /** §6.2: Safe transaction guidelines (required docs, commission, etc.). */
  getGuidelines: () =>
    GET_REQUEST<{ success: boolean; data: unknown }>(
      URLS.BASE + URLS.transactionRegistrationGuidelines
    ),

  /** §6.2: Search by address, propertyId, or lat+lng. */
  search: (params: { address?: string; propertyId?: string; lat?: number; lng?: number }) => {
    const q = new URLSearchParams();
    if (params.address) q.set("address", params.address);
    if (params.propertyId) q.set("propertyId", params.propertyId);
    if (params.lat != null) q.set("lat", String(params.lat));
    if (params.lng != null) q.set("lng", String(params.lng));
    return GET_REQUEST<{ success: boolean; data: unknown }>(
      `${URLS.BASE}${URLS.transactionRegistrationSearch}?${q.toString()}`
    );
  },

  /** §6.2: Check registration status for a property. */
  check: (propertyId: string) =>
    GET_REQUEST<{ success: boolean; data: unknown }>(
      `${URLS.BASE}${URLS.transactionRegistrationCheck}?propertyId=${encodeURIComponent(propertyId)}`
    ),

  /** §6.2: E-GIS validation stub (propertyId, address, or lat+lng). */
  egisValidate: (params: { propertyId?: string; address?: string; lat?: number; lng?: number }) => {
    const q = new URLSearchParams();
    if (params.propertyId) q.set("propertyId", params.propertyId);
    if (params.address) q.set("address", params.address);
    if (params.lat != null) q.set("lat", String(params.lat));
    if (params.lng != null) q.set("lng", String(params.lng));
    return GET_REQUEST<{ success: boolean; data: unknown }>(
      `${URLS.BASE}${URLS.transactionRegistrationEgisValidate}?${q.toString()}`
    );
  },

  /**
   * §6.2–6.4: Submit registration. Request body must include transactionType, transactionValue, propertyId, buyer, propertyIdentification.
   * Backend computes processingFee from transactionValue; do not calculate fee on frontend.
   * After submit: if data.processingFee === 0 show success (no payment); if > 0 show amount and data.paymentUrl "Pay now" link.
   */
  register: (body: Record<string, unknown>) =>
    POST_REQUEST<TransactionRegistrationRegisterResponse["data"]>(
      URLS.BASE + URLS.transactionRegistrationRegister,
      body
    ),
};
