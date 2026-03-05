/**
 * Request To Market — Agents create requests; Publishers (Landlord/Developer) accept or reject.
 * See docs/FRONTEND_API_GUIDE.md §4.
 */

import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";

/** Fallback agent commission (Naira) for display when backend does not return agentCommissionAmount. */
export const DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA = 50000;

export interface RequestToMarketListItem {
  _id: string;
  propertyId?: { _id?: string; location?: unknown; price?: number; briefType?: string; pictures?: string[]; [k: string]: unknown };
  requestedByAgentId?: { firstName?: string; lastName?: string; fullName?: string; email?: string; [k: string]: unknown };
  publisherId?: { firstName?: string; lastName?: string; fullName?: string; email?: string; [k: string]: unknown };
  status?: "pending" | "accepted" | "rejected";
  marketingFeeNaira?: number;
  /** Agent commission amount (Naira) for display; use DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA if not returned. */
  agentCommissionAmount?: number;
  rejectedReason?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt?: string;
  [k: string]: unknown;
}

function token() {
  return Cookies.get("token") ?? undefined;
}

export const requestToMarketService = {
  create: (propertyId: string) =>
    POST_REQUEST<{ success: boolean; data?: { requestId: string; propertyId: string; status: string; marketingFeeNaira: number } }>(
      URLS.BASE + URLS.requestToMarketCreate,
      { propertyId },
      token()
    ),

  list: (params?: { role?: "agent" | "publisher"; status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.status) q.set("status", params.status);
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.limit != null) q.set("limit", String(params.limit));
    const url = `${URLS.BASE}${URLS.requestToMarketList}${q.toString() ? `?${q.toString()}` : ""}`;
    return GET_REQUEST<{ success: boolean; data: RequestToMarketListItem[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>(
      url,
      token()
    );
  },

  respond: (requestId: string, action: "accept" | "reject", rejectedReason?: string) =>
    POST_REQUEST<{ success: boolean; message?: string; data?: { status: string; propertyId?: string; agentCommissionAmount?: number; paymentUrl?: string } }>(
      URLS.BASE + URLS.requestToMarketRespond(requestId),
      { action, ...(action === "reject" && rejectedReason ? { rejectedReason } : {}) },
      token()
    ),
};
