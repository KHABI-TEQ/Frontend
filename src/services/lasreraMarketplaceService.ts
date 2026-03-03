/**
 * KHABITEQ Market Place — list public properties.
 * See docs/FRONTEND_API_GUIDE.md §3.
 * Contact is not returned; Agents use Request To Market to request.
 * Sends Authorization: Bearer <token> when available so response includes currentUserHasRequested for the agent.
 */

import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export interface LasreraMarketplaceParams {
  page?: number;
  limit?: number;
  briefType?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface LasreraMarketplaceProperty {
  _id: string;
  propertyType?: string;
  propertyCategory?: string;
  price?: number;
  location?: { state?: string; localGovernment?: string; area?: string };
  additionalFeatures?: Record<string, unknown>;
  pictures?: string[];
  description?: string;
  briefType?: string;
  createdAt?: string;
  /** Number of agents who have requested to market this property (for publishers). */
  requestToMarketCount?: number;
  /** True when the current user (agent) has already requested to market this property. */
  currentUserHasRequested?: boolean;
}

export const lasreraMarketplaceService = {
  getProperties: (params: LasreraMarketplaceParams = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.briefType) q.set("briefType", params.briefType);
    if (params.state) q.set("state", params.state);
    if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
    const url = `${URLS.BASE}${URLS.lasreraMarketplaceProperties}?${q.toString()}`;
    const token = Cookies.get("token");
    return GET_REQUEST<{
      success: boolean;
      data: LasreraMarketplaceProperty[];
      pagination?: { total: number; page: number; limit: number; totalPages: number };
    }>(url, token);
  },
};
