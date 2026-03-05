"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import { requestToMarketService, DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA, type RequestToMarketListItem } from "@/services/requestToMarketService";
import { formatPriceForDisplay } from "@/utils/price-helpers";
import Loading from "@/components/loading-component/loading";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { ArrowLeft, Handshake, MapPin, Tag, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function buildLocationLabel(propertyId: RequestToMarketListItem["propertyId"]): string {
  if (!propertyId || typeof propertyId !== "object") return "—";
  const loc = (propertyId as { location?: { state?: string; localGovernment?: string; area?: string } }).location;
  if (!loc) return "—";
  const parts = [loc.state, loc.localGovernment, loc.area].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function MyRequestToMarketPage() {
  const { user } = useUserContext();
  const [requests, setRequests] = useState<RequestToMarketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "">("pending");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RequestToMarketListItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptResult, setAcceptResult] = useState<{ requestId: string; paymentUrl?: string; agentCommissionAmount?: number; agentName?: string } | null>(null);

  const isAgent = user?.userType === "Agent";
  const role: "agent" | "publisher" = isAgent ? "agent" : "publisher";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestToMarketService.list({
        role,
        page: 1,
        limit: 50,
        ...(role === "publisher" && statusFilter ? { status: statusFilter } : {}),
      });
      if (res?.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (e) {
      setError("Failed to load requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [role, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (item: RequestToMarketListItem) => {
    setRespondingId(item._id);
    try {
      const res = await requestToMarketService.respond(item._id, "accept");
      const data = (res as any)?.data;
      if (res?.success) {
        toast.success((res as any)?.message || "Request accepted.");
        setAcceptResult({
          requestId: item._id,
          paymentUrl: data?.paymentUrl,
          agentCommissionAmount: typeof data?.agentCommissionAmount === "number" ? data.agentCommissionAmount : (item.agentCommissionAmount ?? DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA),
          agentName: item.requestedByAgentId && typeof item.requestedByAgentId === "object" && "fullName" in item.requestedByAgentId ? (item.requestedByAgentId as { fullName?: string }).fullName : undefined,
        });
        fetchRequests();
      } else {
        toast.error((res as any)?.message || (res as any)?.error || "Accept failed.");
      }
    } catch (e) {
      toast.error("Failed to accept request.");
    } finally {
      setRespondingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    const item = rejectModal;
    if (!item) return;
    setRespondingId(item._id);
    try {
      const res = await requestToMarketService.respond(item._id, "reject", rejectReason.trim() || undefined);
      if (res?.success) {
        toast.success((res as any)?.message || "Request rejected.");
        setRejectModal(null);
        setRejectReason("");
        fetchRequests();
      } else {
        toast.error((res as any)?.message || (res as any)?.error || "Reject failed.");
      }
    } catch (e) {
      toast.error("Failed to reject request.");
    } finally {
      setRespondingId(null);
    }
  };

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
              : "Agents who have requested to market your listings. Accept or reject below."}
          </p>

          {!isAgent && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "pending" ? "bg-[#09391C] text-white" : "bg-white border border-[#E5E7EB] text-[#5A5D63]"}`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "" ? "bg-[#09391C] text-white" : "bg-white border border-[#E5E7EB] text-[#5A5D63]"}`}
              >
                All
              </button>
            </div>
          )}

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

                    {!isAgent && item.status === "pending" && (
                      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={respondingId !== null}
                          onClick={() => handleAccept(item)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] font-medium rounded-lg disabled:opacity-50 text-sm"
                        >
                          {respondingId === item._id ? (
                            <span>Accepting...</span>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={respondingId !== null}
                          onClick={() => { setRejectModal(item); setRejectReason(""); }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 font-medium rounded-lg disabled:opacity-50 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Reject modal (Publisher) */}
          {rejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-2">Reject request</h3>
                <p className="text-sm text-[#5A5D63] mb-4">
                  Reject &quot;Request to market&quot; from {rejectModal.requestedByAgentId && typeof rejectModal.requestedByAgentId === "object" && "fullName" in rejectModal.requestedByAgentId ? (rejectModal.requestedByAgentId as { fullName?: string }).fullName : "Agent"}?
                </p>
                <label className="block text-sm font-medium text-[#5A5D63] mb-1">Reason (optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Already have an agent for this property"
                  rows={3}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleRejectSubmit}
                    disabled={respondingId !== null}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 text-sm"
                  >
                    {respondingId === rejectModal._id ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRejectModal(null); setRejectReason(""); }}
                    className="px-4 py-2 bg-[#E5E7EB] hover:bg-gray-200 text-[#09391C] font-medium rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accept success: payment link or arrange payment (Publisher) */}
          {acceptResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Request accepted</h3>
                </div>
                {acceptResult.paymentUrl ? (
                  <>
                    <p className="text-sm text-[#5A5D63] mb-4">
                      Pay the agent commission via the link below. You can also use the payment link sent to your email.
                    </p>
                    <a
                      href={acceptResult.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] font-semibold rounded-lg text-sm"
                    >
                      Pay agent commission: {formatPriceForDisplay(acceptResult.agentCommissionAmount ?? 0)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#5A5D63] mb-2">
                      No payment link was generated. Please arrange payment with the Agent directly.
                    </p>
                    <p className="text-sm text-[#09391C] font-medium">
                      Amount: {formatPriceForDisplay(acceptResult.agentCommissionAmount ?? 0)}
                    </p>
                    {acceptResult.agentName && (
                      <p className="text-sm text-[#5A5D63] mt-1">Agent: {acceptResult.agentName}</p>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setAcceptResult(null)}
                  className="mt-4 w-full px-4 py-2 bg-[#E5E7EB] hover:bg-gray-200 text-[#09391C] font-medium rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
