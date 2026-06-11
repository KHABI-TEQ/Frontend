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
  fieldAgentRequestedBy?: { firstName?: string; lastName?: string; email?: string };
  fieldAgentRequestNote?: string;
  fieldAgentRequestedAt?: string;
  inspectionDate?: string;
  inspectionTime?: string;
}

export default function FieldAgentRepresentationRequestsPage() {
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RepresentationRequest[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await GET_REQUEST<RepresentationRequest[]>(
        `${URLS.BASE}${URLS.fieldAgentRepresentationRequests}?status=pending`,
        token,
      );
      if (res?.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
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
        `${URLS.BASE}${URLS.fieldAgentRepresentationRespond(inspectionId)}`,
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
    <CombinedAuthGuard requireAuth allowedUserTypes={["FieldAgent"]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] mb-6"
          >
            <ArrowLeft size={18} />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-bold text-[#09391C] mb-2">Representation requests</h1>
          <p className="text-sm text-gray-600 mb-6">
            Agents request you to represent them on inspections. You are company staff — no in-app
            payment is involved. Accept to be assigned to the inspection.
          </p>

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
                const agent = req.fieldAgentRequestedBy;
                const agentName = agent
                  ? [agent.firstName, agent.lastName].filter(Boolean).join(" ") || agent.email
                  : "Agent";

                return (
                  <div key={id} className="bg-white rounded-xl border p-5 shadow-sm">
                    <h2 className="font-semibold text-[#09391C]">{title}</h2>
                    <p className="text-sm text-gray-600 mt-1">Requested by {agentName}</p>
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
                        disabled={respondingId === id}
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
