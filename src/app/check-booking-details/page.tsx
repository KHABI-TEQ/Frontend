"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  Users,
  Home,
  Download,
  Printer,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { buildLocationTitle } from "@/utils/helpers";

interface PropertyLocation {
  state?: string;
  localGovernment?: string;
  area?: string;
  streetAddress?: string;
}

interface Property {
  id?: string;
  _id?: string;
  title?: string;
  image?: string;
  pictures?: string[];
  videos?: string[];
  price?: number;
  briefType?: string;
  propertyType?: string;
  propertyCategory?: string;
  propertyCondition?: string;
  typeOfBuilding?: string;
  shortletDuration?: string;
  location?: PropertyLocation;
  features?: string[];
}

interface OwnerResponse {
  response?: string; // accepted | declined | pending
  respondedAt?: string | null;
  note?: string | null;
}

interface MetaPricing {
  duration?: number;
  nights?: number;
  pricePerNight?: number;
  totalPrice?: number;
  extralFees?: {
    cleaningFee?: number;
    securityDeposit?: number;
  };
  paymentLink?: string;
}

interface BookingDetailsData {
  checkInDateTime?: string;
  checkOutDateTime?: string;
  guestNumber?: number;
  note?: string | null;
}

interface BuyerInfo {
  _id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface TransactionInfo {
  _id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  reference?: string;
  paymentGateway?: string;
  paymentMode?: string;
}

interface Booking {
  id: string;
  code?: string;
  bookingCode?: string;
  status: string;
  bookingMode?: string;
  ownerResponse?: OwnerResponse;
  meta?: MetaPricing;
  bookedBy?: { fullName?: string; email?: string; phoneNumber?: string };
  buyer?: BuyerInfo;
  transaction?: TransactionInfo;
  bookingDetails?: BookingDetailsData;
  paymentDetails?: { amountToBePaid?: number; currency?: string };
  property?: Property | null;
  createdAt?: string;
}

const SESSION_CODE_KEY = "booking_session_code";
const SESSION_EXP_KEY = "booking_session_expiry";
const SESSION_MS = 10 * 60 * 1000;

const formatCurrency = (amount?: number, currency = "₦") =>
  typeof amount === "number" && amount > 0 ? `${currency}${amount.toLocaleString()}` : "-";

const statusBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "approved" || s === "accepted") return { label: "Completed", bg: "bg-green-100", text: "text-green-700", Icon: CheckCircle };
  if (s === "pending") return { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700", Icon: Clock };
  if (s === "cancelled" || s === "rejected" || s === "declined") return { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", Icon: XCircle };
  return { label: status || "Unknown", bg: "bg-gray-100", text: "text-gray-700", Icon: Clock };
};

export default function CheckBookingDetailsPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [view, setView] = useState<"form" | "details">("form");
  const [data, setData] = useState<Booking | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const startSession = (bookingCode: string) => {
    const exp = Date.now() + SESSION_MS;
    localStorage.setItem(SESSION_CODE_KEY, bookingCode);
    localStorage.setItem(SESSION_EXP_KEY, String(exp));
    setRemainingMs(SESSION_MS);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_CODE_KEY);
    localStorage.removeItem(SESSION_EXP_KEY);
    setData(null);
    setCode("");
    setView("form");
    setRemainingMs(0);
    setError("");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_CODE_KEY);
    const expStr = localStorage.getItem(SESSION_EXP_KEY);
    const exp = expStr ? parseInt(expStr, 10) : 0;
    const now = Date.now();
    if (stored && exp > now) {
      setCode(stored);
      setRemainingMs(exp - now);
      (async () => {
        const ok = await verifyAndLoad(stored);
        if (ok) setView("details");
        else setView("form");
      })();
    } else {
      clearSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view !== "details") return;
    const interval = setInterval(() => {
      const expStr = localStorage.getItem(SESSION_EXP_KEY);
      const exp = expStr ? parseInt(expStr, 10) : 0;
      const ms = Math.max(0, exp - Date.now());
      setRemainingMs(ms);
      if (ms <= 0) {
        toast("Session expired", { icon: "⏱️" });
        clearSession();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [view, clearSession]);

  const mmss = useMemo(() => {
    const secs = Math.floor(remainingMs / 1000);
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingMs]);

  const verifyAndLoad = async (bookingCode: string): Promise<boolean> => {
    const url = `${URLS.BASE}/inspections/bookings/verify-code`;
    try {
      setVerifying(true);
      setLoading(true);
      setError("");
      const res: any = await POST_REQUEST(url, { code: bookingCode });
      if (!res?.success || !res?.data) throw new Error(res?.message || "Invalid code");
      const payload = res.data as any;
      const normalized: Booking = {
        id: payload.id || payload._id || bookingCode,
        code: payload.code || payload.bookingCode || bookingCode,
        bookingCode: payload.bookingCode || payload.code || bookingCode,
        status: payload.status || "pending",
        bookingMode: payload.bookingMode,
        ownerResponse: payload.ownerResponse,
        meta: payload.meta,
        bookedBy: payload.bookedBy || payload.buyer,
        buyer: payload.buyer,
        transaction: payload.transaction,
        bookingDetails: payload.bookingDetails,
        paymentDetails: payload.paymentDetails,
        property: payload.property || payload.propertyId || null,
        createdAt: payload.createdAt,
      };
      setData(normalized);
      return true;
    } catch (err: any) {
      const msg = err?.message || "Unable to verify code";
      setError(msg);
      setData(null);
      setView("form");
      toast.error(msg);
      return false;
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter your booking code");
      return;
    }
    const ok = await verifyAndLoad(trimmed);
    if (!ok) return;
    startSession(trimmed);
    setView("details");
    toast.success("Booking code verified");
  };

  const onDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${data.bookingCode || data.code || data.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onPrint = () => window.print();

  const heroImage = data?.property?.pictures?.[0] || data?.property?.image || "";
  const address = useMemo(() => {
    const loc = data?.property?.location;
    if (!loc) return "-";
    const parts = [loc.streetAddress, loc.area, loc.localGovernment, loc.state].filter(Boolean);
    return parts.join(", ");
  }, [data?.property?.location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F6F5] via-[#EEF1F1] to-[#E6ECEA]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0B423D] hover:underline">
            <ArrowLeft size={18} /> Home
          </Link>
          {view === "details" && (
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="rounded bg-white/80 backdrop-blur border border-emerald-200 px-2 py-1">Session: {mmss}</span>
              <button onClick={clearSession} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">
                <LogOut size={14} /> End session
              </button>
            </div>
          )}
        </div>

        {view === "form" && (
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-0 -z-10 blur-2xl bg-[radial-gradient(circle_at_30%_20%,#8DDB90_0%,transparent_35%),radial-gradient(circle_at_70%_80%,#0B423D_0%,transparent_25%)] opacity-20" />
            <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-[#09391C]">View Booking Details</h1>
              </div>
              <p className="text-sm text-gray-600 mb-6">Enter the booking code you received to securely view your booking.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Code</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BK-2025-09-001"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-base tracking-wider uppercase"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0B423D] text-white py-3 px-4 rounded-xl font-semibold shadow hover:bg-[#09391C] disabled:opacity-60"
                >
                  {verifying ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 inline-block border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">Your code is case-insensitive. Keep it private.</p>
              </form>
            </div>
          </div>
        )}

        {view === "details" && (
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-2xl bg-[radial-gradient(circle_at_15%_10%,#8DDB90_0%,transparent_35%),radial-gradient(circle_at_85%_90%,#0B423D_0%,transparent_25%)] opacity-20" />

            <div className="bg-white/95 backdrop-blur border border-emerald-100 rounded-2xl overflow-hidden shadow-lg">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-48 sm:h-64 bg-gray-100" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-100 rounded w-2/3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-100 rounded" />
                      <div className="h-24 bg-gray-100 rounded" />
                      <div className="h-24 bg-gray-100 rounded" />
                      <div className="h-24 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {heroImage && (
                    <div className="w-full h-48 sm:h-64 bg-gray-100 overflow-hidden">
                      <img src={heroImage} alt={data?.property?.title || "Property"} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-[#09391C]">{buildLocationTitle(data?.property?.location) || "Property"}</h1>
                        <p className="text-sm text-gray-600">Booking Code: <span className="font-mono tracking-wider">{data?.bookingCode || data?.code || code}</span></p>
                        {address && <p className="text-xs text-gray-500 mt-1">{address}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusBadge(data?.status || "").bg} ${statusBadge(data?.status || "").text}`}>
                          {(() => { const b = statusBadge(data?.status || ""); const Icon = b.Icon; return <Icon size={16} />; })()}
                          {statusBadge(data?.status || "").label}
                        </span>
                        {data?.ownerResponse?.response && (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${statusBadge(data.ownerResponse.response).bg} ${statusBadge(data.ownerResponse.response).text}`}>
                            Owner: {data.ownerResponse.response}
                          </span>
                        )}
                      </div>
                    </div>

                    {data?.property?.pictures && data.property.pictures.length > 1 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                        {data.property.pictures.slice(0, 6).map((src, i) => (
                          <div key={i} className="h-16 rounded overflow-hidden bg-gray-100">
                            <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Calendar size={16} /> Dates</div>
                        <div className="text-sm"><span className="font-medium">Check-in:</span> {data?.bookingDetails?.checkInDateTime ? new Date(data.bookingDetails.checkInDateTime).toLocaleString() : "-"}</div>
                        <div className="text-sm"><span className="font-medium">Check-out:</span> {data?.bookingDetails?.checkOutDateTime ? new Date(data.bookingDetails.checkOutDateTime).toLocaleString() : "-"}</div>
                      </div>

                      <div className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Users size={16} /> Guests & Mode</div>
                        <div className="text-sm"><span className="font-medium">Guests:</span> {data?.bookingDetails?.guestNumber || 1}</div>
                        <div className="text-sm"><span className="font-medium">Mode:</span> {data?.bookingMode || "request"}</div>
                      </div>

                      <div className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Home size={16} /> Property</div>
                        <div className="text-sm"><span className="font-medium">Type:</span> {data?.property?.briefType || data?.property?.propertyType || "Shortlet"}</div>
                        <div className="text-sm"><span className="font-medium">Amount:</span> {formatCurrency(data?.paymentDetails?.amountToBePaid ?? data?.meta?.totalPrice ?? data?.transaction?.amount, "₦")}</div>
                      </div>

                      <div className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">Buyer</div>
                        <div className="text-sm"><span className="font-medium">Name:</span> {data?.buyer?.fullName || data?.bookedBy?.fullName || "-"}</div>
                        <div className="text-sm"><span className="font-medium">Email:</span> {data?.buyer?.email || data?.bookedBy?.email || "-"}</div>
                        <div className="text-sm"><span className="font-medium">Phone:</span> {data?.buyer?.phoneNumber || data?.bookedBy?.phoneNumber || "-"}</div>
                      </div>

                      <div className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">Transaction</div>
                        <div className="text-sm"><span className="font-medium">Amount:</span> {formatCurrency(data?.transaction?.amount, "₦")}</div>
                        <div className="text-sm"><span className="font-medium">Status:</span> <span className={`px-2 py-0.5 rounded text-xs ${statusBadge(data?.transaction?.status || "").bg} ${statusBadge(data?.transaction?.status || "").text}`}>{data?.transaction?.status || "-"}</span></div>
                        <div className="text-sm"><span className="font-medium">Gateway:</span> {data?.transaction?.paymentGateway || data?.transaction?.paymentMode || "-"}</div>
                        <div className="text-sm"><span className="font-medium">Reference:</span> {data?.transaction?.reference || "-"}</div>
                      </div>
                    </div>

                    {data?.ownerResponse?.note && (
                      <div className="mt-4 p-4 border border-gray-100 rounded-xl">
                        <div className="text-gray-500 text-sm mb-1">Owner Note</div>
                        <div className="text-sm text-gray-800">{data.ownerResponse.note}</div>
                        {data.ownerResponse.respondedAt && (
                          <div className="text-xs text-gray-500 mt-1">Responded: {new Date(data.ownerResponse.respondedAt).toLocaleString()}</div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      {(data?.status !== "confirmed" && data?.status !== "completed" && data?.meta?.paymentLink) && (
                        <a
                          href={data.meta.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-[#0B423D] text-white rounded-lg text-sm hover:bg-[#09391C]"
                        >
                          Pay now <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={onPrint} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Printer size={16} /> Print / PDF
                      </button>
                      <button onClick={onDownloadJson} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Download size={16} /> JSON
                      </button>
                      <button onClick={() => verifyAndLoad(code)} disabled={loading || verifying} className="inline-flex items-center gap-2 px-3 py-2 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 disabled:opacity-60">
                        Refresh
                      </button>
                      <button onClick={clearSession} className="ml-auto inline-flex items-center gap-2 px-3 py-2 border border-red-300 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100">
                        <LogOut size={16} /> End session
                      </button>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
