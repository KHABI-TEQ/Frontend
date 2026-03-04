"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import { requestToMarketService, DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA, type RequestToMarketListItem } from "@/services/requestToMarketService";
import { formatPriceForDisplay } from "@/utils/price-helpers";
import Loading from "@/components/loading-component/loading";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { ArrowLeft, Handshake, MapPin, Tag } from "lucide-react";

function buildLocationLabel(propertyId: RequestToMarketListItem["propertyId"]): string {
  if (!propertyId || typeof propertyId !== "object") return "—";
  const loc = (propertyId as { location?: { state?: string; localGovernment?: string; area?: string } }).location;
  if (!loc) return "—";
  const parts = [loc.state, loc.localGovernment, loc.area].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function MyRequestToMarketPage() {
  const { user } = useUserContext();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestToMarketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAgent = user?.userType === "Agent";
  const role: "agent" | "publisher" = isAgent ? "agent" : "publisher";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await requestToMarketService.list({ role, page: 1, limit: 50 });
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setRequests(res.data);
        } else {
          setRequests([]);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load requests.");
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role]);

  return (
    <CombinedAuthGuard
      requireAuth
      allowedUserTypes={["Agent", "Landowners", "Developer"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
    >
      <div className="min-h-screen bg-[#EEF1F1] py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href={isAgent ? "/lasrera-marketplace" : "/my-listings"}
            className="inline-flex items-center gap-2 text-[#09391C] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isAgent ? "Marketplace" : "My listings"}
          </Link>

          <h1 className="text-2xl font-bold text-[#09391C] mb-2">
            {isAgent ? "My request to market" : "Requests for my properties"}
          </h1>
          <p className="text-[#5A5D63] mb-6">
            {isAgent
              ? "Properties you have requested to market. The publisher can accept or reject."
              : "Agents who have requested to market your listings. Accept or reject from your listing."}
          </p>

          {loading && <Loading />}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {!loading && !error && requests.length === 0 && (
            <p className="text-[#5A5D63]">No requests found.</p>
          )}

          {!loading && requests.length > 0 && (
            <ul className="space-y-4">
              {requests.map((item) => {
                const displayAmount = item.agentCommissionAmount ?? DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA;
                const prop = item.propertyId && typeof item.propertyId === "object" ? item.propertyId as { briefType?: string; price?: number; pictures?: string[] } : null;
                return (
                  <li
                    key={item._id}
                    className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{buildLocationLabel(item.propertyId)}</span>
                        </div>
                        {prop?.briefType && (
                          <div className="flex items-center gap-2 text-sm text-[#5A5D63] mb-1">
                            <Tag className="w-4 h-4 flex-shrink-0" />
                            <span>{prop.briefType}</span>
                          </div>
                        )}
                        {isAgent && item.publisherId && typeof item.publisherId === "object" && "fullName" in item.publisherId && (
                          <p className="text-sm text-[#09391C] mt-1">
                            Publisher: {(item.publisherId as { fullName?: string }).fullName ?? "—"}
                          </p>
                        )}
                        {!isAgent && item.requestedByAgentId && typeof item.requestedByAgentId === "object" && "fullName" in item.requestedByAgentId && (
                          <p className="text-sm text-[#09391C] mt-1">
                            Requested by: {(item.requestedByAgentId as { fullName?: string }).fullName ?? "—"}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-[#5A5D63] uppercase tracking-wide">Status</span>
                        <span className={`text-sm font-medium ${item.status === "accepted" ? "text-green-600" : item.status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                          {item.status ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center gap-2 text-sm text-[#09391C]">
                      <Handshake className="w-4 h-4 text-[#8DDB90]" />
                      <span className="font-medium">Agent commission:</span>
                      <span>{formatPriceForDisplay(displayAmount)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
