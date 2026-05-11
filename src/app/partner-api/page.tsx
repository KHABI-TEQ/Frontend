"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Layers,
  Send,
  Sparkles,
  UserCircle,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

const initialForm = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  platformName: "",
  platformKeySuggestion: "",
  authType: "api_key",
  baseUrl: "",
  webhookSupport: true,
  docsUrl: "",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-[#D5DDE6] bg-white px-3.5 py-2.5 text-sm text-[#1a1d21] placeholder:text-[#8B9299] shadow-sm transition focus:border-[#09391C] focus:outline-none focus:ring-2 focus:ring-[#8DDB90]/35";

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-[#4A5560] mb-1.5";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function PartnerApiPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.syndicationPlatformApplications}`,
        form,
      );
      if (res?.success) {
        toast.success(res.message || "Platform application submitted successfully.");
        setForm(initialForm);
      } else {
        toast.error(res?.message || "Unable to submit application.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F4F8]">
      {/* Hero — keep content z-index below the form block so overlap does not cover inputs */}
      <div className="relative z-0 overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#061512] via-[#0B2A24] to-[#0A1E2E]">
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 30%, rgba(141, 219, 144, 0.14) 0%, transparent 42%), radial-gradient(circle at 90% 70%, rgba(96, 165, 250, 0.1) 0%, transparent 38%)",
          }}
          aria-hidden
        />
        <div className="relative z-[1] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <Link
            href="/new-homepage"
            className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#8DDB90]/95 mb-3">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Listing platform partners
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Partner onboarding
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#B8C9C4] leading-relaxed">
              Apply to syndicate your property catalogue with Khabiteq. Submissions are reviewed
              before connections go live.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Integration guide — above form on mobile, sidebar on desktop */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="relative z-10 lg:col-span-4 lg:order-2 lg:sticky lg:top-6"
          >
            <div className="rounded-2xl border border-[#C5D4E0] bg-gradient-to-br from-white to-[#F4F8FC] p-5 sm:p-6 shadow-[0_20px_50px_-28px_rgba(9,57,28,0.25)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#09391C] text-[#8DDB90] shadow-inner">
                <BookOpen className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#09391C] tracking-tight">
                Syndication integration guide
              </h2>
              <p className="mt-2 text-sm text-[#5A6570] leading-relaxed">
                Review flows for partner onboarding, approved platforms, and how developers and
                agents connect accounts—before you submit this form.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#4A5560]">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8DDB90]" />
                  What data we ask for at registration
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8DDB90]" />
                  Partner vs account-level steps
                </li>
              </ul>
              <Link
                href="/syndication-integration-guide"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#09391C] bg-[#09391C] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0d4d27] hover:border-[#0d4d27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2"
              >
                Open integration guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-3 text-xs text-[#7A8490] leading-snug">
                Same information your engineering and partnerships leads will use during review.
              </p>
            </div>
          </motion.aside>

          {/* Form */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative z-10 lg:col-span-8 lg:order-1"
          >
            <div className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-3 border-b border-[#EEF2F6] pb-5 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF7ED] text-[#09391C]">
                  <Layers className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#09391C]">Application form</h2>
                  <p className="text-sm text-[#5A6570] mt-0.5">
                    Fields marked with <span className="text-red-600 font-medium">*</span> are
                    required for review.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-[#09391C] font-semibold text-sm mb-4">
                    <Building2 className="h-4 w-4" aria-hidden />
                    Company &amp; contact
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Company name *">
                      <input
                        className={inputClass}
                        placeholder="Registered business name"
                        value={form.companyName}
                        onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Contact name *">
                      <input
                        className={inputClass}
                        placeholder="Primary contact"
                        value={form.contactName}
                        onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Contact email *">
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="name@company.com"
                        value={form.contactEmail}
                        onChange={(e) => setForm((s) => ({ ...s, contactEmail: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Contact phone">
                      <input
                        className={inputClass}
                        placeholder="+234 …"
                        value={form.contactPhone}
                        onChange={(e) => setForm((s) => ({ ...s, contactPhone: e.target.value }))}
                      />
                    </Field>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#09391C] font-semibold text-sm mb-4">
                    <UserCircle className="h-4 w-4" aria-hidden />
                    Platform identity
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Platform name *">
                      <input
                        className={inputClass}
                        placeholder="How your product is known publicly"
                        value={form.platformName}
                        onChange={(e) => setForm((s) => ({ ...s, platformName: e.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Platform key suggestion *">
                      <input
                        className={inputClass}
                        placeholder="e.g. my_portal_kebab"
                        value={form.platformKeySuggestion}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, platformKeySuggestion: e.target.value }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Auth type">
                      <select
                        className={inputClass}
                        value={form.authType}
                        onChange={(e) => setForm((s) => ({ ...s, authType: e.target.value }))}
                      >
                        <option value="api_key">API key</option>
                        <option value="oauth2">OAuth 2.0</option>
                        <option value="bearer">Bearer token</option>
                        <option value="other">Other (describe in notes)</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#09391C] font-semibold text-sm mb-4">
                    <Wrench className="h-4 w-4" aria-hidden />
                    Technical details
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Base URL">
                      <input
                        className={inputClass}
                        placeholder="https://api.yourplatform.com/v1"
                        value={form.baseUrl}
                        onChange={(e) => setForm((s) => ({ ...s, baseUrl: e.target.value }))}
                      />
                    </Field>
                    <Field label="Documentation URL">
                      <input
                        className={inputClass}
                        placeholder="Link to your API or integration docs"
                        value={form.docsUrl}
                        onChange={(e) => setForm((s) => ({ ...s, docsUrl: e.target.value }))}
                      />
                    </Field>
                    <Field label="Additional notes">
                      <textarea
                        className={`${inputClass} min-h-[100px] resize-y`}
                        placeholder="Webhooks, rate limits, staging environments, or other context for reviewers"
                        value={form.notes}
                        onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#E8EEF4] bg-[#FAFCFE] p-4 transition hover:border-[#D0DCE8]">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#09391C] focus:ring-[#8DDB90]"
                      checked={form.webhookSupport}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, webhookSupport: e.target.checked }))
                      }
                    />
                    <span className="text-sm text-[#3D454D] leading-snug">
                      <span className="font-semibold text-[#09391C]">Webhook support</span>
                      <br />
                      Our team can factor webhook delivery into the integration plan.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-[#EEF2F6]">
                  <p className="text-xs text-[#7A8490] max-w-md">
                    By submitting, you confirm the details are accurate for our onboarding and
                    compliance review.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#09391C] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0d4d27] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    {submitting ? "Submitting…" : "Submit application"}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
