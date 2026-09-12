"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, POST_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Link from "next/link";
import { AlertCircle, MapPin, UserCheck, X } from "lucide-react";

interface LicensedAgentOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  profile_picture?: string;
  profileBio?: string;
  specializations?: string[];
  regionOfOperation?: string[];
  companyName?: string;
  practitionerType?: string;
  publicSlug?: string | null;
}

interface RequestLicensedAgentModalProps {
  inspectionId: string;
  propertyState?: string;
  propertyLga?: string;
  fieldAgentRequestStatus?: string;
  assignedFieldAgent?: string;
  onClose: () => void;
  onUpdated: () => void;
}

const FALLBACK_DISCLOSURE =
  "By requesting a licensed Agent, you ask them to handle this inspection on your behalf. They may contact the buyer and manage site access. Agree only if you understand and accept their professional representation.";
const FALLBACK_CHECKBOX =
  "I understand I am requesting a licensed Agent to represent this inspection.";

export function RequestLicensedAgentModal({
  inspectionId,
  propertyState,
  propertyLga,
  fieldAgentRequestStatus,
  assignedFieldAgent,
  onClose,
  onUpdated,
}: RequestLicensedAgentModalProps) {
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<LicensedAgentOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [commissionText, setCommissionText] = useState(FALLBACK_DISCLOSURE);
  const [checkboxAckText, setCheckboxAckText] = useState(FALLBACK_CHECKBOX);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const termsRes = await GET_REQUEST<{
        commissionDisclosure?: string;
        commissionCheckboxAck?: string;
      }>(`${URLS.BASE}${URLS.licensedAgentRepresentationTerms}`, token);
      if (termsRes?.success && termsRes.data) {
        const data = termsRes.data as {
          commissionDisclosure?: string;
          commissionCheckboxAck?: string;
        };
        if (data.commissionDisclosure) setCommissionText(data.commissionDisclosure);
        if (data.commissionCheckboxAck) setCheckboxAckText(data.commissionCheckboxAck);
      }

      const q = new URLSearchParams();
      if (propertyLga) q.set("localGovernment", propertyLga);
      else if (propertyState) q.set("state", propertyState);
      q.set("limit", "30");
      const listRes = await GET_REQUEST<LicensedAgentOption[]>(
        `${URLS.BASE}${URLS.licensedAgentsAvailable}?${q.toString()}`,
        token,
      );
      if (listRes?.success && Array.isArray(listRes.data)) {
        setAgents(listRes.data);
      } else {
        setAgents([]);
      }
    } catch {
      toast.error("Could not load licensed Agents");
    } finally {
      setLoading(false);
    }
  }, [token, propertyState, propertyLga]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancelRequest = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await DELETE_REQUEST(
        `${URLS.BASE}${URLS.cancelFieldAgentRequest(inspectionId)}`,
        undefined,
        token,
      );
      if (res?.success) {
        toast.success("Licensed Agent request cancelled");
        onUpdated();
        onClose();
      } else {
        toast.error((res as { message?: string })?.message ?? "Failed to cancel");
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to cancel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || !selectedId) {
      toast.error("Select a licensed Agent");
      return;
    }
    if (!acknowledged) {
      toast.error("Please acknowledge the representation terms");
      return;
    }
    setSubmitting(true);
    try {
      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.requestLicensedAgentForInspection(inspectionId)}`,
        {
          licensedAgentUserId: selectedId,
          fieldAgentUserId: selectedId,
          note: note.trim() || undefined,
          acknowledgedCommissionTerms: true,
        },
        token,
      );
      if (res?.success) {
        toast.success(
          (res as { message?: string }).message ?? "Licensed Agent request sent.",
        );
        onUpdated();
        onClose();
      } else {
        toast.error((res as { message?: string })?.message ?? "Request failed");
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = fieldAgentRequestStatus === "pending";
  const assigned = Boolean(assignedFieldAgent);
  const noAgentsAvailable = !loading && !assigned && !pending && agents.length === 0;
  const regionLabel = [propertyLga, propertyState].filter(Boolean).join(", ");
  const selected = agents.find((a) => a._id === selectedId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={() => !submitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="text-[#09391C]" size={22} />
              <h3 className="text-xl font-semibold text-[#09391C]">
                Request licensed Agent
              </h3>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {assigned && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              A licensed Agent is already assigned to this inspection.
            </p>
          )}

          {pending && !assigned && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3">
                Your request is pending. The licensed Agent will accept or decline.
              </p>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCancelRequest}
                className="text-sm px-3 py-1.5 rounded-lg border border-blue-300 text-blue-900 hover:bg-blue-100"
              >
                Cancel request
              </button>
            </div>
          )}

          {!assigned && !pending && loading && (
            <p className="text-sm text-gray-500 py-4">Loading licensed Agents…</p>
          )}

          {!assigned && !pending && noAgentsAvailable && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex gap-3">
                <MapPin className="text-[#09391C] shrink-0 mt-0.5" size={20} />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#09391C]">
                    No licensed Agents available for this area
                  </p>
                  {regionLabel ? (
                    <p className="text-sm text-gray-600">
                      We could not find a licensed Agent for{" "}
                      <span className="font-medium text-gray-800">{regionLabel}</span>.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No licensed Agents matched this search. Try again later or contact support.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                >
                  Close
                </button>
                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="inline-flex justify-center px-5 py-2 rounded-lg bg-[#09391C] text-white hover:bg-[#0B572B] text-sm font-medium"
                >
                  Contact support
                </Link>
              </div>
            </div>
          )}

          {!assigned && !pending && !loading && agents.length > 0 && (
            <>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-950 leading-relaxed">{commissionText}</p>
              </div>

              <div className="mb-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select licensed Agent
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {agents.map((a) => {
                    const name =
                      [a.firstName, a.lastName].filter(Boolean).join(" ") || "Agent";
                    const active = selectedId === a._id;
                    return (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setSelectedId(a._id)}
                        className={`w-full text-left flex gap-3 p-2 rounded-lg border transition ${
                          active
                            ? "border-[#09391C] bg-[#F3FBF4]"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {a.profile_picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.profile_picture}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-gray-500">
                              {name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#09391C] truncate">
                            {name}
                          </p>
                          {a.companyName ? (
                            <p className="text-xs text-gray-600 truncate">{a.companyName}</p>
                          ) : null}
                          {a.profileBio ? (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {a.profileBio}
                            </p>
                          ) : null}
                          {Array.isArray(a.regionOfOperation) &&
                          a.regionOfOperation.length > 0 ? (
                            <p className="text-[11px] text-gray-500 mt-1">
                              {a.regionOfOperation.slice(0, 3).join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selected?.profileBio ? (
                  <p className="text-xs text-gray-500">Selected profile loaded.</p>
                ) : null}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Any context for the licensed Agent"
                />
              </div>

              <label className="flex items-start gap-2 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">{checkboxAckText}</span>
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={submitting || !selectedId || !acknowledged}
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-lg bg-[#8DDB90] text-white hover:bg-[#7BC87F] disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send request"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** @deprecated Use RequestLicensedAgentModal */
export { RequestLicensedAgentModal as RequestFieldAgentModal };
