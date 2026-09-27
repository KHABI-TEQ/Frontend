"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch } from "@/lib/search-insurance";

const SERVICES = [
  {
    category: "lawyer" as const,
    serviceName: "Legal due diligence",
    detail: "Title search, ownership check, encumbrances, and a legal opinion.",
  },
  {
    category: "surveyor" as const,
    serviceName: "Survey / title verification",
    detail: "Land survey, title search, and boundary verification.",
  },
  {
    category: "valuer" as const,
    serviceName: "Property valuation",
    detail: "Market valuation and a valuation report.",
  },
];

function NewBriefForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inspectionId = params.get("inspectionId") || "";
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<(typeof SERVICES)[number]["category"] | "">("");
  const [brief, setBrief] = useState({
    objective: "",
    questions: "",
    timeline: "7–14 days",
    deliverable: "",
    additional: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => SERVICES.find((item) => item.category === category) || null,
    [category]
  );

  const publish = async () => {
    if (!selected || !inspectionId) {
      setError("Choose a service and keep this request linked to your inspection.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await buyerFetch<{ request: { _id: string } }>(
      "/buyer/auth/me/professional-service-requests/briefs",
      {
        method: "POST",
        body: JSON.stringify({
          category: selected.category,
          serviceName: selected.serviceName,
          inspectionId,
          brief,
        }),
      }
    );
    setBusy(false);
    if (!res.success || !res.data?.request?._id) {
      setError(res.message || "Could not publish this brief.");
      return;
    }
    router.push(`/buyer/service-requests/${res.data.request._id}?submitted=1`);
  };

  return (
    <BuyerShell
      title="Create a service request"
      subtitle="Tell verified professionals what you need. They will send offers. Documents are shared directly with the professional you choose, not stored as a Khabiteq review."
    >
      <div className="mb-6 flex gap-2 text-sm font-semibold text-[#5A5D63]">
        {["Service", "Inspection", "Brief"].map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 ${step === index + 1 ? "bg-[#09391C] text-white" : "bg-white"}`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-3">
          {SERVICES.map((item) => (
            <button
              key={item.category}
              type="button"
              onClick={() => {
                setCategory(item.category);
                setStep(2);
              }}
              className="rounded-2xl bg-white p-5 text-left shadow-sm"
            >
              <p className="font-bold text-[#09391C]">{item.serviceName}</p>
              <p className="mt-1 text-sm text-[#5A5D63]">{item.detail}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#09391C]">Link this request to your inspection</h2>
          <p className="mt-2 text-sm text-[#5A5D63]">
            This brief stays on the inspection you just completed. Share title documents and site papers directly with the professional after you engage them.
          </p>
          <p className="mt-4 text-sm font-semibold text-[#09391C]">
            Inspection {inspectionId || "is missing from this link"}
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" className="text-sm font-semibold text-[#5A5D63]" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              disabled={!inspectionId}
              onClick={() => setStep(3)}
              className="rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </article>
      ) : null}

      {step === 3 ? (
        <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#09391C]">Submit your service brief</h2>
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Service objective</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 p-3"
              rows={4}
              value={brief.objective}
              onChange={(event) => setBrief({ ...brief, objective: event.target.value })}
              placeholder="For example: confirm ownership, check encumbrances, and provide a written opinion."
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Specific questions</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 p-3"
              rows={3}
              value={brief.questions}
              onChange={(event) => setBrief({ ...brief, questions: event.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Preferred timeline</span>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 p-3"
              value={brief.timeline}
              onChange={(event) => setBrief({ ...brief, timeline: event.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Expected deliverable</span>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 p-3"
              value={brief.deliverable}
              onChange={(event) => setBrief({ ...brief, deliverable: event.target.value })}
              placeholder="Written due diligence report"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Additional information</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 p-3"
              rows={3}
              value={brief.additional}
              onChange={(event) => setBrief({ ...brief, additional: event.target.value })}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-3">
            <button type="button" className="text-sm font-semibold text-[#5A5D63]" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void publish()}
              className="rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Publishing…" : "Publish service request"}
            </button>
          </div>
        </article>
      ) : null}
    </BuyerShell>
  );
}

export default function NewServiceBriefPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#5A5D63]">Loading…</p>}>
      <NewBriefForm />
    </Suspense>
  );
}
