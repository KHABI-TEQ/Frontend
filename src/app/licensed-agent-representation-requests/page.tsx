"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { CombinedAuthGuard } from "@/logic/combinedAuthGuard";
import Loading from "@/components/loading-component/loading";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { buildLocationTitle } from "@/utils/helpers";

interface RepresentationRequest {
  id?: string;
  _id?: string;
  property?: { location?: Record<string, string> };
  propertyId?: { location?: Record<string, string> };
  fieldAgentRequestedBy?: { firstName?: string; lastName?: string };
  fieldAgentRequestNote?: string;
  fieldAgentRequestedAt?: string;
  inspectionDate?: string;
  inspectionTime?: string;
}

export default function LicensedAgentRepresentationRequestsPage() {
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RepresentationRequest[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [bankConnected, setBankConnected] = useState(true);
  const [bankSetupPath, setBankSetupPath] = useState("/public-access-page/setup");
  const [platformShareNaira, setPlatformShareNaira] = useState(1000);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [res, terms] = await Promise.all([
        GET_REQUEST<RepresentationRequest[]>(
          `${URLS.BASE}${URLS.licensedAgentRepresentationRequests}?status=pending`,
          token,
        ),
        GET_REQUEST<{
          bankConnected?: boolean;
          bankSetupPath?: string;
          platformShareNaira?: number;
        }>(`${URLS.BASE}${URLS.licensedAgentRepresentationTerms}`, token),
      ]);
      if (res?.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
      if (terms?.success && terms.data) {
        setBankConnected(Boolean(terms.data.bankConnected));
        if (terms.data.bankSetupPath) setBankSetupPath(terms.data.bankSetupPath);
        if (terms.data.platformShareNaira != null) {
          setPlatformShareNaira(Number(terms.data.platformShareNaira));
        }
      }
    } catch {
      toast.error("Failed to load representation requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (inspectionId: string, action: "accept" | "reject") => {
    if (!token) return;
    setRespondingId(inspectionId);
    try {
      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.licensedAgentRepresentationRespond(inspectionId)}`,
        { action },
        token,
      );
      if (res?.success) {
        toast.success(
          (res as { message?: string }).message ??
            (action === "accept" ? "Request accepted" : "Request declined"),
        );
        await load();
      } else {
        toast.error((res as { message?: string })?.message ?? "Action failed");
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Action failed");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Agent"]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] mb-6"
          >
            <ArrowLeft size={18} />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-bold text-[#09391C] mb-2">
            Property Scout representation requests
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Property Scouts may ask you to handle inspections on their behalf. Accept to take over
            the inspection response and site visit. After the buyer pays, Khabiteq keeps ₦
            {platformShareNaira.toLocaleString()} and the remainder is paid to your public-page bank.
          </p>

          {!bankConnected ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-950 mb-3">
                Add your bank account on your public page to accept representation requests and
                receive inspection fees.
              </p>
              <Link
                href={bankSetupPath}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#09391C] text-white text-sm font-medium hover:bg-[#0B572B]"
              >
                Add bank to receive fees
              </Link>
            </div>
          ) : null}

          {loading ? (
            <Loading />
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              No pending representation requests.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const id = req.id || req._id || "";
                const loc = req.property?.location ?? req.propertyId?.location;
                const title = buildLocationTitle(loc) || "Property";
                const scout = req.fieldAgentRequestedBy;
                const scoutName = scout
                  ? [scout.firstName, scout.lastName].filter(Boolean).join(" ") || "Property Scout"
                  : "Property Scout";

                return (
                  <div key={id} className="bg-white rounded-xl border p-5 shadow-sm">
                    <h2 className="font-semibold text-[#09391C]">{title}</h2>
                    <p className="text-sm text-gray-600 mt-1">Requested by {scoutName}</p>
                    {req.inspectionDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.inspectionDate).toLocaleDateString()}
                        {req.inspectionTime ? ` at ${req.inspectionTime}` : ""}
                      </p>
                    )}
                    {req.fieldAgentRequestNote && (
                      <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded p-2">
                        {req.fieldAgentRequestNote}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        disabled={respondingId === id || !bankConnected}
                        onClick={() => respond(id, "accept")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8DDB90] text-white rounded-lg text-sm font-medium hover:bg-[#7BC87F] disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={respondingId === id}
                        onClick={() => respond(id, "reject")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
