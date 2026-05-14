"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  Building2,
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
import type { InspectionRepresentative } from "@/components/dashboard/inspection-representatives-section";

function apiMessage(res: { message?: string; error?: string } | null | undefined): string {
  const m = res?.message || res?.error;
  return typeof m === "string" && m.trim() ? m.trim() : "Something went wrong";
}

function hasContact(email: string, whatsapp: string): boolean {
  return Boolean(email.trim() || whatsapp.trim());
}

function extractPropertiesFromFetchAllResponse(response: unknown): unknown[] {
  const r = response as { success?: boolean; data?: unknown };
  if (!r?.success) return [];
  const raw = r.data as Record<string, unknown> | unknown[] | null | undefined;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.results)) return o.results as unknown[];
    if (Array.isArray(o.properties)) return o.properties as unknown[];
    if (Array.isArray(o.data)) return o.data as unknown[];
  }
  return [];
}

function propertyOptionLabel(p: Record<string, unknown>): string {
  const bt = String(p.briefType ?? "Property");
  const loc = p.location as { area?: string; state?: string; localGovernment?: string } | undefined;
  const place =
    (loc?.area && String(loc.area).trim()) ||
    [loc?.localGovernment, loc?.state].filter(Boolean).join(", ") ||
    "";
  const shortId = String(p._id ?? "").slice(-6);
  return place ? `${bt} — ${place}` : `${bt} (…${shortId})`;
}

const s = {
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
};

/**
 * Developer (publisher): inspection representatives are scoped to each **approved** listing.
 * Uses GET/POST/PATCH/DELETE `/account/properties/:propertyId/inspection-representatives`.
 */
export function PropertyInspectionRepresentativesSection({ anchorId = "property-inspection-representatives" }: { anchorId?: string }) {
  const [properties, setProperties] = useState<{ _id: string; label: string }[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const [representatives, setRepresentatives] = useState<InspectionRepresentative[]>([]);
  const [repsLoading, setRepsLoading] = useState(false);
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

  const token = Cookies.get("token");

  const loadProperties = useCallback(async () => {
    if (!token) return;
    setPropertiesLoading(true);
    try {
      const url = `${URLS.BASE}/account/properties/fetchAll?page=1&limit=200&isApproved=true`;
      const res = await GET_REQUEST(url, token);
      const raw = extractPropertiesFromFetchAllResponse(res);
      const opts = raw
        .map((row) => {
          const p = row as Record<string, unknown>;
          const id = String(p._id ?? "");
          if (!id) return null;
          if (p.isApproved === false) return null;
          return { _id: id, label: propertyOptionLabel(p) };
        })
        .filter(Boolean) as { _id: string; label: string }[];
      setProperties(opts);
      setSelectedPropertyId((prev) => {
        if (prev && opts.some((o) => o._id === prev)) return prev;
        return opts[0]?._id ?? "";
      });
    } catch {
      toast.error("Could not load your listings.");
      setProperties([]);
      setSelectedPropertyId("");
    } finally {
      setPropertiesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  const repsBaseUrl = useMemo(() => {
    if (!selectedPropertyId) return "";
    return `${URLS.BASE}${URLS.propertyInspectionRepresentatives(selectedPropertyId)}`;
  }, [selectedPropertyId]);

  const loadRepresentatives = useCallback(async () => {
    if (!token || !selectedPropertyId || !repsBaseUrl) {
      setRepresentatives([]);
      setRepsLoading(false);
      return;
    }
    setRepsLoading(true);
    try {
      const res = await GET_REQUEST<{ representatives: InspectionRepresentative[] }>(repsBaseUrl, token);
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
      toast.error("Could not load representatives for this listing.");
      setRepresentatives([]);
    } finally {
      setRepsLoading(false);
    }
  }, [repsBaseUrl, selectedPropertyId, token]);

  const resetAdd = useCallback(() => {
    setAddLabel("");
    setAddEmail("");
    setAddWa("");
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditLabel("");
    setEditEmail("");
    setEditWa("");
  }, []);

  const openEdit = (rep: InspectionRepresentative) => {
    setEditingId(rep._id);
    setEditLabel(rep.label ?? "");
    setEditEmail(rep.email ?? "");
    setEditWa(rep.whatsappNumber ?? "");
    setShowAdd(false);
  };

  useEffect(() => {
    setShowAdd(false);
    setEditingId(null);
    setDeleteId(null);
    resetAdd();
    cancelEdit();
    void loadRepresentatives();
  }, [selectedPropertyId, loadRepresentatives, resetAdd, cancelEdit]);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;
    if (!hasContact(addEmail, addWa)) {
      toast.error("Add at least an email or a WhatsApp number");
      return;
    }
    setBusy(true);
    try {
      const res = await POST_REQUEST<{ representative: InspectionRepresentative }>(
        repsBaseUrl,
        {
          label: addLabel.trim() || undefined,
          email: addEmail.trim() || undefined,
          whatsappNumber: addWa.trim() || undefined,
        },
        token,
      );
      if (res?.success) {
        toast.success(res.message?.trim() || "Representative added for this listing.");
        resetAdd();
        setShowAdd(false);
        await loadRepresentatives();
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
    if (!editingId || !selectedPropertyId) return;
    if (!hasContact(editEmail, editWa)) {
      toast.error("Keep at least an email or a WhatsApp number");
      return;
    }
    setBusy(true);
    try {
      const url = `${URLS.BASE}${URLS.propertyInspectionRepresentative(selectedPropertyId, editingId)}`;
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
        toast.success(res.message?.trim() || "Saved");
        cancelEdit();
        await loadRepresentatives();
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
    if (!deleteId || !selectedPropertyId) return;
    setBusy(true);
    try {
      const url = `${URLS.BASE}${URLS.propertyInspectionRepresentative(selectedPropertyId, deleteId)}`;
      const res = await DELETE_REQUEST(url, undefined, token);
      if (res?.success) {
        toast.success(typeof res.message === "string" && res.message.trim() ? res.message : "Representative removed");
        setDeleteId(null);
        if (editingId === deleteId) cancelEdit();
        await loadRepresentatives();
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
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className={s.title}>Inspection representatives (per listing)</h2>
              <p className={s.subtitle + " mt-1 max-w-2xl"}>
                Choose one of your <strong className="text-[#09391C]">approved</strong> listings, then add contacts who
                receive inspection notifications for <strong className="text-[#09391C]">that property only</strong>. Each
                listing has its own list; duplicate emails are not allowed within the same listing.
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-[#FAFCFE] px-5 py-4 sm:px-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A5560] mb-2">Listing</label>
          {propertiesLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#5A5D63]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your listings…
            </div>
          ) : properties.length === 0 ? (
            <p className="text-sm text-[#5A5D63]">
              You do not have any approved listings yet.{" "}
              <Link href="/post-property" className="font-medium text-[#09391C] underline">
                Post a listing
              </Link>{" "}
              and wait for approval, then return here to add inspection contacts.
            </p>
          ) : (
            <select
              className={s.input + " max-w-xl font-medium"}
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={busy}
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {!selectedPropertyId ? null : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#5A6570]">
                  Managing representatives for listing ID{" "}
                  <code className="rounded bg-[#EEF1F1] px-1 py-0.5 font-mono text-[11px]">{selectedPropertyId}</code>
                </p>
                {!showAdd && !editingId && (
                  <button
                    type="button"
                    className={s.accentBtn}
                    onClick={() => {
                      setShowAdd(true);
                      cancelEdit();
                    }}
                    disabled={repsLoading || busy}
                  >
                    <Plus className="h-4 w-4" />
                    Add contact for this listing
                  </button>
                )}
              </div>

              {repsLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-[#5A5D63]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading representatives…</span>
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
                        className="mb-6 overflow-hidden rounded-xl border border-dashed border-[#D5DDE6] bg-[#F8FBF9] p-4 sm:p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#09391C]">New representative</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdd(false);
                              resetAdd();
                            }}
                            className="rounded-lg p-1 text-[#5A5D63] hover:bg-gray-200/80"
                            aria-label="Close"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="sm:col-span-1">
                            <label className="mb-1 block text-xs font-medium text-[#5A6570]">Label (optional)</label>
                            <input
                              className={s.input}
                              value={addLabel}
                              onChange={(e) => setAddLabel(e.target.value)}
                              placeholder="e.g. Site manager"
                              maxLength={120}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#5A6570]">Email</label>
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
                            <label className="mb-1 block text-xs font-medium text-[#5A6570]">WhatsApp</label>
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
                        <p className="mt-2 text-xs text-[#5A6570]">At least one of email or WhatsApp is required.</p>
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
                    <div className="rounded-xl border border-[#E8EDF3] bg-[#FAFCFF] py-12 text-center">
                      <UserCircle className="mx-auto h-10 w-10 text-[#8DDB90]" aria-hidden />
                      <p className="mt-2 text-[#09391C] font-medium">No representatives for this listing yet.</p>
                      <p className="mt-1 text-sm text-[#5A6570]">Add a contact so your team gets inspection updates for this property.</p>
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
                              className="rounded-xl border border-[#D5DDE6] bg-[#F8FBF9] p-4 sm:p-5"
                            >
                              <div className="mb-3 text-sm font-semibold text-[#09391C]">Edit representative</div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-[#5A6570]">Label</label>
                                  <input
                                    className={s.input}
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    placeholder="Optional"
                                    maxLength={120}
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-[#5A6570]">Email</label>
                                  <input
                                    className={s.input}
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-[#5A6570]">WhatsApp</label>
                                  <input
                                    className={s.input}
                                    type="tel"
                                    value={editWa}
                                    onChange={(e) => setEditWa(e.target.value)}
                                  />
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-[#5A6570]">At least one of email or WhatsApp must stay filled.</p>
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
                            <div className="flex flex-col gap-3 rounded-xl border border-[#E8EDF3] p-4 transition-colors hover:border-[#8DDB90]/40 hover:bg-[#FAFCFF]/80 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {rep.label ? (
                                    <span className={s.badge}>{rep.label}</span>
                                  ) : (
                                    <span className="text-xs text-[#8B9299]">No label</span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-4">
                                  {rep.email ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-[#09391C]">
                                      <Mail className="h-4 w-4 flex-shrink-0 text-[#8DDB90]" />
                                      <span className="truncate">{rep.email}</span>
                                    </span>
                                  ) : null}
                                  {rep.whatsappNumber ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-[#09391C]">
                                      <MessageCircle className="h-4 w-4 flex-shrink-0 text-[#8DDB90]" />
                                      <span className="font-mono text-sm">{rep.whatsappNumber}</span>
                                    </span>
                                  ) : null}
                                  {!rep.email && !rep.whatsappNumber ? (
                                    <span className="text-sm text-amber-800">No contact on file</span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex flex-shrink-0 gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5DDE6] bg-white px-3 py-2 text-sm font-medium text-[#09391C] hover:bg-gray-50"
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
              aria-labelledby="prop-rep-delete-title"
              onClick={() => !busy && setDeleteId(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 id="prop-rep-delete-title" className="text-lg font-semibold text-[#09391C]">
                  Remove this representative?
                </h3>
                <p className="mt-2 text-sm text-[#5A6570]">
                  They will no longer receive inspection notifications for this listing. You can add them again later.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button type="button" className={s.accentBtnOutline} onClick={() => setDeleteId(null)} disabled={busy}>
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
