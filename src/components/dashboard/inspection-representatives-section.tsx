"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GET_REQUEST, POST_REQUEST, PATCH_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export interface InspectionRepresentative {
  _id: string;
  label?: string;
  email?: string;
  whatsappNumber?: string;
}

function apiMessage(res: { message?: string; error?: string } | null | undefined): string {
  const m = res?.message || res?.error;
  return typeof m === "string" && m.trim() ? m.trim() : "Something went wrong";
}

function hasContact(email: string, whatsapp: string): boolean {
  return Boolean(email.trim() || whatsapp.trim());
}

type Variant = "landlord" | "developer";

const VARIANT_STYLES: Record<
  Variant,
  {
    card: string;
    title: string;
    subtitle: string;
    accentBtn: string;
    accentBtnOutline: string;
    input: string;
    iconWrap: string;
    badge: string;
  }
> = {
  landlord: {
    card: "bg-white rounded-xl shadow-sm border border-gray-100",
    title: "text-lg font-semibold text-gray-900",
    subtitle: "text-sm text-gray-600",
    accentBtn:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-green-700 disabled:opacity-50",
    accentBtnOutline:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",
    input:
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20",
    iconWrap: "rounded-lg bg-green-50 p-2.5 text-green-600",
    badge: "rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800",
  },
  developer: {
    card: "bg-white rounded-lg shadow-sm border border-gray-100",
    title: "text-lg font-semibold text-[#09391C]",
    subtitle: "text-sm text-[#5A5D63]",
    accentBtn:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-[#8DDB90] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7BC87F] disabled:opacity-50",
    accentBtnOutline:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-[#8DDB90] bg-white px-4 py-2.5 text-sm font-medium text-[#09391C] hover:bg-gray-50 disabled:opacity-50",
    input:
      "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#09391C] placeholder:text-gray-400 focus:border-[#8DDB90] focus:outline-none focus:ring-2 focus:ring-[#8DDB90]/25",
    iconWrap: "rounded-lg bg-[#8DDB90]/15 p-2.5 text-[#09391C]",
    badge: "rounded-full bg-[#8DDB90]/20 px-2.5 py-0.5 text-xs font-medium text-[#09391C]",
  },
};

export function InspectionRepresentativesSection({
  variant,
  anchorId = "inspection-representatives",
}: {
  variant: Variant;
  anchorId?: string;
}) {
  const s = VARIANT_STYLES[variant];
  const baseUrl = `${URLS.BASE}${URLS.accountInspectionRepresentatives}`;

  const [representatives, setRepresentatives] = useState<InspectionRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [addLabel, setAddLabel] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addWa, setAddWa] = useState("");

  const [editLabel, setEditLabel] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWa, setEditWa] = useState("");

  const load = useCallback(async () => {
    const token = Cookies.get("token");
    setLoading(true);
    try {
      const res = await GET_REQUEST<{ representatives: InspectionRepresentative[] }>(baseUrl, token);
      if (res?.success && res.data && Array.isArray((res.data as { representatives?: unknown }).representatives)) {
        const list = (res.data as { representatives: InspectionRepresentative[] }).representatives;
        setRepresentatives(
          list.map((r) => ({
            ...r,
            _id: String((r as { _id?: string })._id ?? ""),
          })),
        );
      } else if (!res?.success) {
        toast.error(apiMessage(res));
        setRepresentatives([]);
      } else {
        setRepresentatives([]);
      }
    } catch {
      toast.error("Could not load representatives");
      setRepresentatives([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetAdd = () => {
    setAddLabel("");
    setAddEmail("");
    setAddWa("");
  };

  const openEdit = (rep: InspectionRepresentative) => {
    setEditingId(rep._id);
    setEditLabel(rep.label ?? "");
    setEditEmail(rep.email ?? "");
    setEditWa(rep.whatsappNumber ?? "");
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditEmail("");
    setEditWa("");
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContact(addEmail, addWa)) {
      toast.error("Add at least an email or a WhatsApp number");
      return;
    }
    setBusy(true);
    try {
      const token = Cookies.get("token");
      const res = await POST_REQUEST<{ representative: InspectionRepresentative }>(
        baseUrl,
        {
          label: addLabel.trim() || undefined,
          email: addEmail.trim() || undefined,
          whatsappNumber: addWa.trim() || undefined,
        },
        token,
      );
      if (res?.success) {
        toast.success("Representative added");
        resetAdd();
        setShowAdd(false);
        await load();
      } else {
        toast.error(apiMessage(res));
      }
    } catch {
      toast.error("Failed to add representative");
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!hasContact(editEmail, editWa)) {
      toast.error("Keep at least an email or a WhatsApp number");
      return;
    }
    setBusy(true);
    try {
      const token = Cookies.get("token");
      const url = `${URLS.BASE}${URLS.accountInspectionRepresentative(editingId)}`;
      const res = await PATCH_REQUEST<{ representative: InspectionRepresentative }>(
        url,
        {
          label: editLabel.trim() || undefined,
          email: editEmail.trim() || undefined,
          whatsappNumber: editWa.trim() || undefined,
        },
        token,
      );
      if (res?.success) {
        toast.success("Saved");
        cancelEdit();
        await load();
      } else {
        toast.error(apiMessage(res));
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      const token = Cookies.get("token");
      const url = `${URLS.BASE}${URLS.accountInspectionRepresentative(deleteId)}`;
      const res = await DELETE_REQUEST(url, undefined, token);
      if (res?.success) {
        toast.success("Representative removed");
        setDeleteId(null);
        if (editingId === deleteId) cancelEdit();
        await load();
      } else {
        toast.error(apiMessage(res));
      }
    } catch {
      toast.error("Failed to remove");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id={anchorId} className="scroll-mt-28">
      <div className={s.card + " overflow-hidden"}>
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3 min-w-0">
          <div className={s.iconWrap + " flex-shrink-0"}>
            <UserCircle className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className={s.title}>Inspection representatives</h2>
            <p className={s.subtitle + " mt-1 max-w-2xl"}>
              People who should receive inspection-related notifications by email or WhatsApp. You can add multiple
              contacts; duplicate emails are not allowed.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
          {!showAdd && !editingId && (
            <button
              type="button"
              className={s.accentBtn}
              onClick={() => {
                setShowAdd(true);
                cancelEdit();
              }}
              disabled={loading || busy}
            >
              <Plus className="h-4 w-4" />
              Add contact
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {showAdd && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={submitAdd}
                  className="mb-6 overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">New representative</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdd(false);
                        resetAdd();
                      }}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-200/80"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-xs font-medium text-gray-600">Label (optional)</label>
                      <input
                        className={s.input}
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                        placeholder="e.g. Site manager"
                        maxLength={120}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                      <input
                        className={s.input}
                        type="email"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        placeholder="name@company.com"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">WhatsApp</label>
                      <input
                        className={s.input}
                        type="tel"
                        value={addWa}
                        onChange={(e) => setAddWa(e.target.value)}
                        placeholder="+234…"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">At least one of email or WhatsApp is required.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="submit" className={s.accentBtn} disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save contact
                    </button>
                    <button
                      type="button"
                      className={s.accentBtnOutline}
                      onClick={() => {
                        setShowAdd(false);
                        resetAdd();
                      }}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {representatives.length === 0 && !showAdd ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 py-12 text-center">
                <p className="text-gray-600">No representatives yet.</p>
                <p className="mt-1 text-sm text-gray-500">Add a contact so your team gets inspection updates.</p>
                <button
                  type="button"
                  className={s.accentBtn + " mt-4"}
                  onClick={() => setShowAdd(true)}
                  disabled={busy}
                >
                  <Plus className="h-4 w-4" />
                  Add your first contact
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {representatives.map((rep) => (
                  <li key={rep._id}>
                    {editingId === rep._id ? (
                      <form
                        onSubmit={submitEdit}
                        className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5"
                      >
                        <div className="mb-3 text-sm font-semibold text-gray-800">Edit representative</div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Label</label>
                            <input
                              className={s.input}
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Optional"
                              maxLength={120}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                            <input
                              className={s.input}
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">WhatsApp</label>
                            <input
                              className={s.input}
                              type="tel"
                              value={editWa}
                              onChange={(e) => setEditWa(e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">At least one of email or WhatsApp must stay filled.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="submit" className={s.accentBtn} disabled={busy}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save changes
                          </button>
                          <button type="button" className={s.accentBtnOutline} onClick={cancelEdit} disabled={busy}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:border-gray-200 hover:bg-gray-50/40 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {rep.label ? (
                              <span className={s.badge}>{rep.label}</span>
                            ) : (
                              <span className="text-xs text-gray-400">No label</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-4">
                            {rep.email ? (
                              <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                                <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                <span className="truncate">{rep.email}</span>
                              </span>
                            ) : null}
                            {rep.whatsappNumber ? (
                              <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                                <MessageCircle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                <span className="font-mono text-sm">{rep.whatsappNumber}</span>
                              </span>
                            ) : null}
                            {!rep.email && !rep.whatsappNumber ? (
                              <span className="text-sm text-amber-700">No contact on file</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => openEdit(rep)}
                            disabled={busy}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteId(rep._id)}
                            disabled={busy}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {deleteId ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rep-delete-title"
            onClick={() => !busy && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="rep-delete-title" className="text-lg font-semibold text-gray-900">
                Remove this representative?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                They will no longer receive inspection notifications. You can add them again later.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className={s.accentBtnOutline}
                  onClick={() => setDeleteId(null)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  onClick={() => void confirmDelete()}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </section>
  );
}
