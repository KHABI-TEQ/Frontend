"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Scale, Compass, Landmark } from "lucide-react";
import { GET_REQUEST, POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import InspectionBookingSelect from "@/components/due-diligence/InspectionBookingSelect";
import { getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

type CatalogField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "file" | "select";
  required: boolean;
  options?: string[];
  help?: string;
};

type CatalogService = {
  slug: string;
  name: string;
  category: "lawyer" | "surveyor" | "valuer";
  phase: 1 | 2;
  comingSoon: boolean;
  customerPrice: number;
  platformFee: number;
  professionalFee: number;
  deliveryTime: string;
  description: string;
  scope: string[];
  outOfScope: string[];
  requiredFields: CatalogField[];
  deliverable: string;
  disclaimer: string;
  fulfillment: string;
};

type CatalogPayload = {
  paymentNote: string;
  autoMatchNote?: string;
  disclaimer: string;
  services: CatalogService[];
};

const CATEGORY_LABEL: Record<CatalogService["category"], string> = {
  lawyer: "Property lawyer",
  surveyor: "Surveyor",
  valuer: "Property valuer",
};

const CATEGORY_POOL: Record<CatalogService["category"], string> = {
  lawyer: "lawyers",
  surveyor: "surveyors",
  valuer: "valuers",
};

function formatNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function categoryIcon(category: CatalogService["category"]) {
  if (category === "surveyor") return Compass;
  if (category === "valuer") return Landmark;
  return Scale;
}

export default function ProfessionalServicesPage() {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inspectionId, setInspectionId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await GET_REQUEST<CatalogPayload>(`${URLS.BASE}${URLS.professionalServices}`);
      if (res.success && res.data) {
        setCatalog(res.data);
      } else {
        toast.error(res.message || "Unable to load professional services.");
      }
      setLoading(false);
    };
    void load();
    const profile = getBuyerProfile();
    if (profile) {
      setContact((c) => ({
        fullName: c.fullName || profile.fullName || "",
        email: c.email || profile.email || "",
        phoneNumber: c.phoneNumber || profile.phoneNumber || "",
      }));
    }
  }, []);

  const selected = useMemo(
    () => catalog?.services.find((s) => s.slug === selectedSlug) || null,
    [catalog, selectedSlug],
  );

  const phase1 = catalog?.services.filter((s) => !s.comingSoon) || [];
  const phase2 = catalog?.services.filter((s) => s.comingSoon) || [];

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (fieldKey: string, file: File) => {
    setUploading(fieldKey);
    const form = new FormData();
    form.append("file", file);
    form.append("for", "professional-service");
    const res = await POST_REQUEST_FILE_UPLOAD(`${URLS.BASE}${URLS.uploadFile}`, form);
    setUploading(null);
    const url =
      (res as { url?: string }).url ||
      (res.data as { url?: string } | undefined)?.url;
    if (url) {
      setAnswer(fieldKey, String(url));
      toast.success("File uploaded.");
      return;
    }
    toast.error(res.message || "Upload failed.");
  };

  const submit = async () => {
    if (!selected) return;
    if (!contact.fullName.trim() || !contact.email.trim()) {
      toast.error("Enter your name and email.");
      return;
    }
    if (!inspectionId) {
      toast.error("Select the inspected property this due diligence is for.");
      return;
    }

    setSubmitting(true);
    const res = await POST_REQUEST(
      `${URLS.BASE}${URLS.professionalServiceRequests(selected.slug)}`,
      {
        contact,
        answers,
        inspectionId,
      },
      getBuyerToken() || undefined,
    );
    if (!res.success) {
      setSubmitting(false);
      toast.error(res.message || "Could not submit the request.");
      return;
    }

    toast.success(res.message || "Request submitted. Qualified professionals have been notified.");
    setSubmitting(false);
    setSelectedSlug(null);
    setAnswers({});
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFEFB] flex items-center justify-center text-[#09391C]">
        Loading professional services…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFEFB] text-[#09391C]">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B423D]/70">
          <ArrowLeft size={16} />
          Back to Khabiteq
        </Link>
        <p className="mt-6 text-xs font-semibold tracking-[0.18em] uppercase text-[#0B423D]/60">
          Khabiteq Realty · Paid professional services
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">Hire a lawyer, surveyor, or valuer.</h1>
        <p className="mt-4 max-w-3xl text-[#5A5D63] leading-relaxed">
          Select a service, view the price and scope, and upload the required information.
          We notify every approved professional in that category who can take the work. The first
          to accept handles your request — you pay the displayed fee after they accept. Khabiteq
          does not itself certify title or replace professional judgment.
        </p>
        {(catalog?.autoMatchNote || catalog?.paymentNote) && (
          <p className="mt-3 text-sm text-[#0B423D]/80">
            {catalog.autoMatchNote || catalog.paymentNote}
          </p>
        )}

        {!selected && (
          <>
            <h2 className="mt-10 text-xl font-bold">Phase 1 — digital services</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {phase1.map((service) => {
                const Icon = categoryIcon(service.category);
                return (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(service.slug);
                      setAnswers({});
                    }}
                    className="text-left rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_32px_-20px_rgba(9,57,28,0.35)] hover:border-[#8DDB90]"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0B423D]/70">
                      <Icon size={16} className="text-[#8DDB90]" />
                      {CATEGORY_LABEL[service.category]}
                    </div>
                    <h3 className="mt-3 text-xl font-bold">{service.name}</h3>
                    <p className="mt-2 text-sm text-[#5A5D63]">{service.description}</p>
                    <p className="mt-4 text-lg font-bold">{formatNaira(service.customerPrice)}</p>
                    <p className="text-xs text-[#5A5D63]">{service.deliveryTime}</p>
                  </button>
                );
              })}
            </div>

            {phase2.length > 0 && (
              <>
                <h2 className="mt-12 text-xl font-bold">Phase 2 — physical services</h2>
                <p className="mt-2 text-sm text-[#5A5D63]">
                  These require site work and will open after Phase 1. You can still see the intended scope.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phase2.map((service) => (
                    <article key={service.slug} className="rounded-2xl border border-dashed border-gray-200 p-5 bg-white/70">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0B423D]/50">Coming soon</p>
                      <h3 className="mt-2 font-bold">{service.name}</h3>
                      <p className="mt-2 text-sm text-[#5A5D63]">{service.description}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {selected && (
          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedSlug(null)}
              className="text-sm font-semibold text-[#0B423D]/70"
            >
              ← All services
            </button>
            <h2 className="mt-4 text-2xl font-bold">{selected.name}</h2>
            <p className="mt-2 text-sm font-semibold text-[#0B423D]/70">
              {CATEGORY_LABEL[selected.category]} · {formatNaira(selected.customerPrice)} · {selected.deliveryTime}
            </p>
            <p className="mt-3 text-[#5A5D63]">{selected.description}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold">Scope</h3>
                <ul className="mt-2 space-y-2 text-sm text-[#5A5D63]">
                  {selected.scope.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-[#8DDB90]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Not included</h3>
                <ul className="mt-2 space-y-2 text-sm text-[#5A5D63]">
                  {selected.outOfScope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#F5F7F9] p-4 text-sm">
              <p><span className="font-semibold">Deliverable:</span> {selected.deliverable}</p>
              <p className="mt-2"><span className="font-semibold">You pay:</span> {formatNaira(selected.customerPrice)}</p>
              <p className="mt-1 text-[#5A5D63]">
                Professional fee {formatNaira(selected.professionalFee)} · Khabiteq platform fee{" "}
                {formatNaira(selected.platformFee)}
              </p>
              <p className="mt-3 text-[#5A5D63]">{selected.disclaimer}</p>
            </div>

            <div className="mt-6 rounded-xl border border-[#8DDB90]/40 bg-[#F5FBF6] p-4 text-sm text-[#0B423D]">
              We will notify all approved {CATEGORY_POOL[selected.category]} who are set up to take
              this work. The first to accept will handle your request. You pay after they accept.
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-bold">Your details</h3>
              <InspectionBookingSelect value={inspectionId} onChange={setInspectionId} />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-3"
                placeholder="Full name"
                value={contact.fullName}
                onChange={(e) => setContact((c) => ({ ...c, fullName: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-3"
                placeholder="Email"
                type="email"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-3"
                placeholder="Phone number"
                value={contact.phoneNumber}
                onChange={(e) => setContact((c) => ({ ...c, phoneNumber: e.target.value }))}
              />

              {selected.requiredFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold mb-1">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                  {field.help && <p className="text-xs text-[#5A5D63] mb-2">{field.help}</p>}
                  {field.type === "textarea" && (
                    <textarea
                      className="w-full rounded-lg border border-gray-200 px-3 py-3 min-h-[110px]"
                      value={answers[field.key] || ""}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                    />
                  )}
                  {field.type === "text" && (
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-3"
                      value={answers[field.key] || ""}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      className="w-full rounded-lg border border-gray-200 px-3 py-3 bg-white"
                      value={answers[field.key] || ""}
                      onChange={(e) => setAnswer(field.key, e.target.value)}
                    >
                      <option value="">Select…</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  )}
                  {field.type === "file" && (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadFile(field.key, file);
                        }}
                      />
                      {uploading === field.key && <p className="text-xs mt-1">Uploading…</p>}
                      {answers[field.key] && (
                        <p className="text-xs mt-1 text-emerald-700">File attached.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="mt-8 w-full sm:w-auto rounded-xl bg-[#09391C] text-white px-6 py-3 font-semibold disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <p className="mt-3 text-sm text-[#5A5D63]">
              Qualified {CATEGORY_POOL[selected.category]} will be notified. You pay the displayed
              fee after the first professional accepts.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
