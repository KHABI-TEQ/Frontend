"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserContext } from "@/context/user-context";
import { requestToMarketService, DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA, type RequestToMarketListItem } from "@/services/requestToMarketService";
import { formatPriceForDisplay, formatNumberWithCommas } from "@/utils/price-helpers";
import Loading from "@/components/loading-component/loading";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { ArrowLeft, Handshake, MapPin, Tag, CheckCircle, XCircle, ExternalLink, FileCheck, Mail, Phone, Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { URLS } from "@/utils/URLS";
import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";

/** §4.4: propertyId has location, price, briefType, pictures for display. */
function buildLocationLabel(propertyId: RequestToMarketListItem["propertyId"]): string {
  if (!propertyId || typeof propertyId !== "object") return "—";
  const loc = (propertyId as { location?: { state?: string; localGovernment?: string; area?: string } }).location;
  if (!loc) return "—";
  const parts = [loc.state, loc.localGovernment, loc.area].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function getAgentDisplay(item: RequestToMarketListItem): { name: string; email?: string; phone?: string } {
  const agent = item.requestedByAgentId;
  if (!agent || typeof agent !== "object") return { name: "—" };
  const name = (agent as { fullName?: string }).fullName ?? ([agent.firstName, agent.lastName].filter(Boolean).join(" ") || "—");
  return {
    name,
    email: (agent as { email?: string }).email,
    phone: (agent as { phoneNumber?: string }).phoneNumber,
  };
}

type PublisherStatusFilter = "" | "pending" | "accepted" | "rejected";

export default function MyRequestToMarketPage() {
  const { user } = useUserContext();
  const [requests, setRequests] = useState<RequestToMarketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublisherStatusFilter>("pending");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RequestToMarketListItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptResult, setAcceptResult] = useState<{ requestId: string; paymentUrl?: string; agentCommissionAmount?: number; agentName?: string; agentEmail?: string; agentPhone?: string } | null>(null);
  /** §4.4 Step 3: Register sale modal (accepted requests only). */
  const [registerSaleModal, setRegisterSaleModal] = useState<RequestToMarketListItem | null>(null);
  const [registerSalePrice, setRegisterSalePrice] = useState("");
  const [registerSaleCommissionPercent, setRegisterSaleCommissionPercent] = useState("");
  const [registerSaleReceiptUrl, setRegisterSaleReceiptUrl] = useState<string>("");
  const [registerSaleReceiptUploading, setRegisterSaleReceiptUploading] = useState(false);
  const [registerSaleReceiptFileName, setRegisterSaleReceiptFileName] = useState<string>("");
  const [registerSaleSubmitting, setRegisterSaleSubmitting] = useState(false);
  /** Confirm publisher has already paid the agent before registering the sale. */
  const [registerSalePaymentConfirmOpen, setRegisterSalePaymentConfirmOpen] = useState(false);
  const [registerSaleSuccessOpen, setRegisterSaleSuccessOpen] = useState(false);

  const isAgent = user?.userType === "Agent";
  const isDeveloper = user?.userType === "Developer";
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
        const agent = item.requestedByAgentId && typeof item.requestedByAgentId === "object" ? item.requestedByAgentId as { fullName?: string; email?: string; phoneNumber?: string } : null;
        setAcceptResult({
          requestId: item._id,
          paymentUrl: data?.paymentUrl,
          agentCommissionAmount: typeof data?.agentCommissionAmount === "number" ? data.agentCommissionAmount : (item.agentCommissionAmount ?? DEFAULT_AGENT_COMMISSION_DISPLAY_NAIRA),
          agentName: agent?.fullName,
          agentEmail: agent?.email,
          agentPhone: agent?.phoneNumber,
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

  /** Format actual sale price for display (e.g. 400,000,000). Stored value may include commas. */
  const handleRegisterSalePriceChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      setRegisterSalePrice("");
      return;
    }
    setRegisterSalePrice(formatNumberWithCommas(digits));
  };

  /** Parsed sale price from formatted input (for validation and commission calc). */
  const registerSalePriceNum = Number(registerSalePrice.replace(/\D/g, "")) || 0;
  /** Commission %: Landlord always 5; Developer from input (1–5). */
  const registerSaleCommissionPct = isDeveloper
    ? (Number(registerSaleCommissionPercent) || 0)
    : 5;
  /** Calculated agent commission to show as publisher types (when price > 0 and valid %). */
  const calculatedAgentCommission =
    registerSalePriceNum > 0 && registerSaleCommissionPct >= 1 && registerSaleCommissionPct <= 5
      ? (registerSalePriceNum * registerSaleCommissionPct) / 100
      : 0;
  const showCommissionPreview = registerSalePriceNum > 0;

  /** §4.4: Upload receipt (proof of payment); use returned URL as commissionReceiptUrl in register-sale. */
  const handleRegisterSaleReceiptUpload = async (file: File) => {
    setRegisterSaleReceiptUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("for", "default");
      const response = await POST_REQUEST_FILE_UPLOAD<{ url?: string }>(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formData,
        Cookies.get("token") ?? undefined
      );
      const url = (response as any)?.data?.url ?? (response as any)?.url;
      if (response?.success && url) {
        setRegisterSaleReceiptUrl(url);
        setRegisterSaleReceiptFileName(file.name);
        toast.success("Receipt uploaded.");
      } else {
        toast.error("Failed to upload receipt.");
      }
    } catch {
      toast.error("Failed to upload receipt.");
    } finally {
      setRegisterSaleReceiptUploading(false);
    }
  };

  /** Validate register-sale form; if OK, open “have you paid the agent?” confirmation. */
  const handleRegisterSaleSubmitClick = () => {
    const priceNum = Number(registerSalePrice.replace(/\D/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid actual sale price (Naira).");
      return;
    }
    if (isDeveloper) {
      const pct = Number(registerSaleCommissionPercent);
      if (!Number.isFinite(pct) || pct < 1 || pct > 5) {
        toast.error("Commission must be between 1 and 5% for Developers.");
        return;
      }
    }
    setRegisterSalePaymentConfirmOpen(true);
  };

  /** §4.4 Step 3: Register sale — runs after user confirms they already paid the agent. */
  const performRegisterSaleSubmit = async () => {
    const item = registerSaleModal;
    if (!item) return;
    const priceNum = Number(registerSalePrice.replace(/\D/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setRegisterSalePaymentConfirmOpen(false);
      return;
    }
    if (isDeveloper) {
      const pct = Number(registerSaleCommissionPercent);
      if (!Number.isFinite(pct) || pct < 1 || pct > 5) {
        setRegisterSalePaymentConfirmOpen(false);
        return;
      }
    }
    setRegisterSalePaymentConfirmOpen(false);
    setRegisterSaleSubmitting(true);
    try {
      const body: { actualSalePriceNaira: number; commissionPercent?: number; commissionReceiptUrl?: string } = { actualSalePriceNaira: priceNum };
      if (isDeveloper) body.commissionPercent = Number(registerSaleCommissionPercent);
      if (registerSaleReceiptUrl) body.commissionReceiptUrl = registerSaleReceiptUrl;
      const res = await requestToMarketService.registerSale(item._id, body);
      const data = (res as any)?.data;
      if ((res as any)?.success && data) {
        toast.success("Sale registered.");
        setRegisterSaleModal(null);
        setRegisterSalePrice("");
        setRegisterSaleCommissionPercent("");
        setRegisterSaleReceiptUrl("");
        setRegisterSaleReceiptFileName("");
        setRegisterSaleSuccessOpen(true);
        fetchRequests();
      } else {
        toast.error((res as any)?.message || (res as any)?.error || "Register sale failed.");
      }
    } catch (e) {
      toast.error("Failed to register sale.");
    } finally {
      setRegisterSaleSubmitting(false);
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
            <div className="flex flex-wrap gap-2 mb-6">
              {(["pending", "accepted", "rejected", ""] as const).map((s) => (
                <button
                  key={s || "all"}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-[#09391C] text-white" : "bg-white border border-[#E5E7EB] text-[#5A5D63]"}`}
                >
                  {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
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
                const agentDisplay = getAgentDisplay(item);
                const firstPicture = prop?.pictures?.[0];
                const isAccepted = item.status === "accepted";
                const saleRegistered = !!(item.saleRegisteredAt ?? (item as { saleRegisteredAt?: string }).saleRegisteredAt);

                return (
                  <li
                    key={item._id}
                    className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap gap-4">
                      {firstPicture && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={firstPicture} alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
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
                            {typeof prop?.price === "number" && (
                              <p className="text-sm font-medium text-[#09391C] mt-1">{formatPriceForDisplay(prop.price)}</p>
                            )}
                            {isAgent && item.publisherId && typeof item.publisherId === "object" && "fullName" in item.publisherId && (
                              <p className="text-sm text-[#09391C] mt-1">
                                Publisher: {(item.publisherId as { fullName?: string }).fullName ?? "—"}
                              </p>
                            )}
                            {!isAgent && (
                              <div className="mt-2 space-y-0.5">
                                <p className="text-sm font-medium text-[#09391C]">Agent: {agentDisplay.name}</p>
                                {agentDisplay.email && (
                                  <p className="text-xs text-[#5A5D63] flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <a href={`mailto:${agentDisplay.email}`} className="hover:underline">{agentDisplay.email}</a>
                                  </p>
                                )}
                                {agentDisplay.phone && (
                                  <p className="text-xs text-[#5A5D63] flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <a href={`tel:${agentDisplay.phone}`} className="hover:underline">{agentDisplay.phone}</a>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-[#5A5D63] uppercase tracking-wide">Status</span>
                            <span className={`text-sm font-medium ${item.status === "accepted" ? "text-green-600" : item.status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                              {item.status ?? "—"}
                            </span>
                            {isAccepted && saleRegistered && (
                              <span className="text-xs font-medium text-green-700 flex items-center gap-1 mt-1">
                                <FileCheck className="w-3 h-3" /> Sale registered
                                {item.commissionReceiptUrl && (
                                  <span className="text-[#5A5D63]">· Receipt uploaded</span>
                                )}
                              </span>
                            )}
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

                        {!isAgent && isAccepted && !saleRegistered && (
                          <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                            <button
                              type="button"
                              onClick={() => { setRegisterSaleModal(item); setRegisterSalePrice(""); setRegisterSaleCommissionPercent(isDeveloper ? "5" : ""); setRegisterSaleReceiptUrl(""); setRegisterSaleReceiptFileName(""); setRegisterSalePaymentConfirmOpen(false); }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#09391C] hover:bg-[#0d4a24] text-white font-medium rounded-lg text-sm"
                            >
                              <FileCheck className="w-4 h-4" />
                              Register sale
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
                    {(acceptResult.agentName || acceptResult.agentEmail || acceptResult.agentPhone) && (
                      <div className="text-sm text-[#5A5D63] mt-2 p-2 bg-gray-50 rounded">
                        {acceptResult.agentName && <p className="font-medium text-[#09391C]">{acceptResult.agentName}</p>}
                        {acceptResult.agentEmail && <p><a href={`mailto:${acceptResult.agentEmail}`} className="hover:underline">{acceptResult.agentEmail}</a></p>}
                        {acceptResult.agentPhone && <p><a href={`tel:${acceptResult.agentPhone}`} className="hover:underline">{acceptResult.agentPhone}</a></p>}
                      </div>
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

          {/* §4.4 Step 3: Register sale modal (Publisher, accepted requests only) */}
          {registerSaleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-2">Register sale</h3>
                <p className="text-sm text-[#5A5D63] mb-4">
                  Pay the agent commission outside the app <span className="font-medium text-[#09391C]">before</span> registering here. Enter the sale details below; admin will verify that payment was made.
                </p>
                <label className="block text-sm font-medium text-[#09391C] mb-1">Actual sale price (₦) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={registerSalePrice}
                  onChange={(e) => handleRegisterSalePriceChange(e.target.value)}
                  placeholder="e.g. 80,000,000"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] mb-4"
                />
                {isDeveloper && (
                  <>
                    <label className="block text-sm font-medium text-[#09391C] mb-1">Commission % (1–5) *</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={registerSaleCommissionPercent}
                      onChange={(e) => setRegisterSaleCommissionPercent(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] mb-4"
                    />
                  </>
                )}
                {/* Show calculated commission as publisher types (when sale price entered; Developer needs valid % 1–5). */}
                {showCommissionPreview && (
                  <div className="mb-4 p-3 bg-[#EEF1F1] rounded-lg border border-[#E5E7EB]">
                    {calculatedAgentCommission > 0 ? (
                      <p className="text-sm font-medium text-[#09391C]">
                        Agent commission ({isDeveloper ? `${registerSaleCommissionPct}%` : "5%"}): {formatPriceForDisplay(Math.round(calculatedAgentCommission))}
                      </p>
                    ) : isDeveloper ? (
                      <p className="text-sm text-[#5A5D63]">Enter commission % (1–5) above to see agent commission.</p>
                    ) : null}
                  </div>
                )}
                {/* §4.4: Receipt (proof of payment) — optional; after upload use URL as commissionReceiptUrl. */}
                <label className="block text-sm font-medium text-[#09391C] mb-1">Receipt (proof of payment) — optional</label>
                <p className="text-xs text-[#5A5D63] mb-2">Optional: upload proof of payment you already made so admin can verify.</p>
                {registerSaleReceiptFileName ? (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-[#EEF1F1] rounded-lg border border-[#E5E7EB]">
                    <FileText className="w-4 h-4 text-[#09391C] flex-shrink-0" />
                    <span className="text-sm text-[#09391C] truncate flex-1">{registerSaleReceiptFileName}</span>
                    <button
                      type="button"
                      onClick={() => { setRegisterSaleReceiptUrl(""); setRegisterSaleReceiptFileName(""); }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="file"
                      id="register-sale-receipt"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleRegisterSaleReceiptUpload(file);
                        e.target.value = "";
                      }}
                      disabled={registerSaleReceiptUploading}
                    />
                    <label
                      htmlFor="register-sale-receipt"
                      className={`inline-flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#5A5D63] cursor-pointer hover:bg-gray-50 ${registerSaleReceiptUploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Upload className="w-4 h-4" />
                      {registerSaleReceiptUploading ? "Uploading..." : "Choose file"}
                    </label>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleRegisterSaleSubmitClick}
                    disabled={registerSaleSubmitting}
                    className="flex-1 px-4 py-2 bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] font-medium rounded-lg disabled:opacity-50 text-sm"
                  >
                    {registerSaleSubmitting ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRegisterSaleModal(null); setRegisterSalePrice(""); setRegisterSaleCommissionPercent(""); setRegisterSaleReceiptUrl(""); setRegisterSaleReceiptFileName(""); setRegisterSalePaymentConfirmOpen(false); }}
                    disabled={registerSaleSubmitting}
                    className="px-4 py-2 bg-[#E5E7EB] hover:bg-gray-200 text-[#09391C] font-medium rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm publisher already paid the agent before registering */}
          {registerSaleModal && registerSalePaymentConfirmOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
              <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
                <h3 className="text-lg font-semibold text-[#09391C] mb-2">Confirm payment</h3>
                <p className="text-sm text-[#5A5D63] mb-6">
                  Are you sure you have paid the Agent?
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterSalePaymentConfirmOpen(false)}
                    disabled={registerSaleSubmitting}
                    className="flex-1 px-4 py-2 bg-[#E5E7EB] hover:bg-gray-200 text-[#09391C] font-medium rounded-lg text-sm disabled:opacity-50"
                  >
                    No, go back
                  </button>
                  <button
                    type="button"
                    onClick={performRegisterSaleSubmit}
                    disabled={registerSaleSubmitting}
                    className="flex-1 px-4 py-2 bg-[#09391C] hover:bg-[#0d4a24] text-white font-medium rounded-lg text-sm disabled:opacity-50"
                  >
                    {registerSaleSubmitting ? "Submitting..." : "Yes, I have paid"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sale registered — tone: admin will verify payment (publisher already paid before registering). */}
          {registerSaleSuccessOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Sale registered</h3>
                </div>
                <p className="text-sm text-[#5A5D63] mb-4">
                  Admin will verify the payment.
                </p>
                <button
                  type="button"
                  onClick={() => setRegisterSaleSuccessOpen(false)}
                  className="w-full px-4 py-2 bg-[#E5E7EB] hover:bg-gray-200 text-[#09391C] font-medium rounded-lg text-sm"
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
