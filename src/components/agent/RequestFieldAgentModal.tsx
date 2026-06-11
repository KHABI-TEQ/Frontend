"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { GET_REQUEST, POST_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Link from "next/link";
import { AlertCircle, MapPin, UserCheck, X } from "lucide-react";
import {
  FIELD_AGENT_COMMISSION_CHECKBOX_ACK,
  FIELD_AGENT_COMMISSION_DISCLOSURE,
} from "@/constants/fieldAgentRepresentation";

interface FieldAgentOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  regionOfOperation?: string[];
  whatsappNumber?: string;
}

interface RequestFieldAgentModalProps {
  inspectionId: string;
  propertyState?: string;
  propertyLga?: string;
  fieldAgentRequestStatus?: string;
  assignedFieldAgent?: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function RequestFieldAgentModal({
  inspectionId,
  propertyState,
  propertyLga,
  fieldAgentRequestStatus,
  assignedFieldAgent,
  onClose,
  onUpdated,
}: RequestFieldAgentModalProps) {
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<FieldAgentOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [commissionText, setCommissionText] = useState("");
  const [checkboxAckText, setCheckboxAckText] = useState(FIELD_AGENT_COMMISSION_CHECKBOX_ACK);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const termsRes = await GET_REQUEST<{
        commissionDisclosure?: string;
        commissionCheckboxAck?: string;
      }>(`${URLS.BASE}${URLS.fieldAgentRepresentationTerms}`, token);
      if (termsRes?.success && termsRes.data) {
        const data = termsRes.data as {
          commissionDisclosure?: string;
          commissionCheckboxAck?: string;
        };
        setCommissionText(data.commissionDisclosure ?? "");
        if (data.commissionCheckboxAck) {
          setCheckboxAckText(data.commissionCheckboxAck);
        }
      }

      const q = new URLSearchParams();
      // LGA is the primary match key (area/neighborhood is not used)
      if (propertyLga) {
        q.set("localGovernment", propertyLga);
      } else if (propertyState) {
        q.set("state", propertyState);
      }
      q.set("limit", "30");
      const listRes = await GET_REQUEST<{ _id: string }[]>(
        `${URLS.BASE}${URLS.fieldAgentsAvailable}?${q.toString()}`,
        token,
      );
      if (listRes?.success && Array.isArray(listRes.data)) {
        setAgents(listRes.data as FieldAgentOption[]);
      } else {
        setAgents([]);
      }
    } catch {
      toast.error("Could not load Field Agents");
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
        toast.success("Field Agent request cancelled");
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
      toast.error("Select a Field Agent");
      return;
    }
    if (!acknowledged) {
      toast.error("Please acknowledge the commission terms");
      return;
    }
    setSubmitting(true);
    try {
      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.requestFieldAgentForInspection(inspectionId)}`,
        {
          fieldAgentUserId: selectedId,
          note: note.trim() || undefined,
          acknowledgedCommissionTerms: true,
        },
        token,
      );
      if (res?.success) {
        toast.success(
          (res as { message?: string }).message ?? "Field Agent request sent.",
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
              <h3 className="text-xl font-semibold text-[#09391C]">Request Field Agent</h3>
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
              A Field Agent is already assigned to this inspection.
            </p>
          )}

          {pending && !assigned && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3">
                Your request is pending. The Field Agent will accept or decline.
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
            <p className="text-sm text-gray-500 py-4">Loading Field Agents…</p>
          )}

          {!assigned && !pending && noAgentsAvailable && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex gap-3">
                <MapPin className="text-[#09391C] shrink-0 mt-0.5" size={20} />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#09391C]">
                    No Field Agents available for this property
                  </p>
                  {regionLabel ? (
                    <p className="text-sm text-gray-600">
                      We could not find an approved Field Agent for{" "}
                      <span className="font-medium text-gray-800">{regionLabel}</span>.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      This property does not have a state/LGA on file, or no Field Agent is
                      registered for that LGA yet.
                    </p>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    You cannot submit a request from here until a Field Agent is available. Please
                    contact Khabi-Teq support so we can assign someone or onboard a Field Agent for
                    this region. You can try again later once coverage is in place.
                  </p>
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
                <p className="text-sm text-amber-950 leading-relaxed">
                  {commissionText || FIELD_AGENT_COMMISSION_DISCLOSURE}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Field Agent
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Choose a Field Agent</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {[a.firstName, a.lastName].filter(Boolean).join(" ") || a.email}
                      {Array.isArray(a.regionOfOperation) && a.regionOfOperation.length > 0
                        ? ` — ${a.regionOfOperation.slice(0, 2).join(", ")}`
                        : ""}
                    </option>
                  ))}
                </select>
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
                  placeholder="Any context for the Field Agent"
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
