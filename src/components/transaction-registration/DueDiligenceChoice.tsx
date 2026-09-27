"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buyerFetch, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

export const INDEPENDENT_DUE_DILIGENCE_TEXT =
  "I confirm that I have conducted or obtained due diligence independently of Khabiteq and am satisfied with the outcome. I understand that Khabiteq is not responsible for the due diligence conducted outside this platform.";

const PLATFORM_STEPS = [
  { title: "Create service request", detail: "Choose a verified lawyer, surveyor, valuer, or other professional." },
  { title: "Professional responds", detail: "Review quotes and confirmations." },
  { title: "Book professional", detail: "Confirm and book the professional." },
  { title: "Communicate directly", detail: "Discuss requirements with the professional." },
  { title: "Pay through Khabiteq", detail: "Payment is made securely on the platform." },
];

type InspectionRow = {
  _id: string;
  status?: string;
  wishToProceed?: boolean;
  dueDiligencePath?: "platform" | "independent" | "";
  inspectionDate?: string;
  propertyId?: {
    title?: string;
    propertyName?: string;
    location?: { area?: string; state?: string };
  };
};

function propertyTitle(row?: InspectionRow | null) {
  const property = row?.propertyId;
  return (
    property?.title ||
    property?.propertyName ||
    [property?.location?.area, property?.location?.state].filter(Boolean).join(", ") ||
    "Inspected property"
  );
}

export default function DueDiligenceChoice({
  inspectionId,
  onContinueToRegistration,
}: {
  inspectionId?: string;
  onContinueToRegistration: (inspectionId: string) => void;
}) {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [selectedId, setSelectedId] = useState(inspectionId || "");
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [stage, setStage] = useState<"proceed" | "options" | "search">("proceed");
  const [path, setPath] = useState<"" | "platform" | "independent">("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const active = Boolean(getBuyerToken());
    setSignedIn(active);
    if (!active) {
      setLoading(false);
      return;
    }
    buyerFetch<{ inspections: InspectionRow[] }>("/buyer/auth/me/inspections").then((res) => {
      const completed = (res.data?.inspections || []).filter(
        (row) => String(row.status || "") === "completed"
      );
      setRows(completed);
      const current =
        completed.find((row) => String(row._id) === (inspectionId || selectedId)) ||
        (completed.length === 1 ? completed[0] : null);
      if (current) {
        setSelectedId(String(current._id));
        if (current.wishToProceed === false) setStage("search");
        else if (current.dueDiligencePath === "platform" || current.dueDiligencePath === "independent") {
          setPath(current.dueDiligencePath);
          setStage("options");
        } else if (current.wishToProceed) {
          setStage("options");
        }
      }
      setLoading(false);
    });
  }, [inspectionId]);

  const selected = rows.find((row) => String(row._id) === selectedId) || null;

  const submitIntent = async (payload: {
    wishToProceed: boolean;
    dueDiligencePath?: "platform" | "independent";
    independentDeclaration?: { accepted: true; acceptedText: string };
  }) => {
    const email = getBuyerProfile()?.email;
    if (!email || !selectedId) {
      setError("Sign in and select the inspected property to continue.");
      return false;
    }
    setBusy(true);
    setError("");
    const res = await buyerFetch("/transaction-registration/intent", {
      method: "POST",
      body: JSON.stringify({ inspectionId: selectedId, email, ...payload }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not save your decision.");
      return false;
    }
    return true;
  };

  if (!signedIn) {
    const next = inspectionId
      ? `/transaction-registration?inspectionId=${encodeURIComponent(inspectionId)}&tab=diligence`
      : "/transaction-registration?tab=diligence";
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Due diligence before registration</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to choose how you will handle due diligence for the property you inspected.
        </p>
        <Link
          href={`/buyer/login?next=${encodeURIComponent(next)}`}
          className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading your completed inspections…</p>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Proceed with the transaction</h2>
        <p className="mt-2 text-sm text-gray-600">
          When you are ready to proceed with a property, choose how to handle due diligence. Registration opens after that choice.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-600">
          Due diligence starts after a completed inspection. Finish the inspection, then return here.
        </p>
      ) : (
        <label className="block max-w-xl">
          <span className="mb-2 block text-sm font-semibold text-gray-800">Inspected property</span>
          <select
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4"
            value={selectedId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedId(nextId);
              setError("");
              setAccepted(false);
              const next = rows.find((row) => String(row._id) === nextId);
              if (!next) {
                setStage("proceed");
                setPath("");
                return;
              }
              if (next.wishToProceed === false) setStage("search");
              else if (next.dueDiligencePath === "platform" || next.dueDiligencePath === "independent") {
                setPath(next.dueDiligencePath);
                setStage("options");
              } else {
                setPath("");
                setStage(next.wishToProceed ? "options" : "proceed");
              }
            }}
          >
            <option value="">Select the inspected property</option>
            {rows.map((row) => (
              <option key={row._id} value={row._id}>
                {propertyTitle(row)}
              </option>
            ))}
          </select>
        </label>
      )}

      {selected && stage === "search" ? (
        <div>
          <h3 className="text-lg font-bold text-[#09391C]">Continue searching</h3>
          <p className="mt-2 text-sm text-gray-600">
            You can keep exploring other properties that match your preference.
          </p>
          <Link
            href="/buyer/searches"
            className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to property search
          </Link>
        </div>
      ) : null}

      {selected && stage === "proceed" ? (
        <div>
          <h3 className="text-lg font-bold text-[#09391C]">Do you want to proceed with this property?</h3>
          <p className="mt-2 text-sm text-gray-600">{propertyTitle(selected)}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setStage("options")}
              className="rounded-2xl bg-[#09391C] px-4 py-4 text-left text-white"
            >
              <p className="font-semibold">Yes, proceed</p>
              <p className="mt-1 text-sm text-white/80">Handle due diligence before proceeding.</p>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const saved = await submitIntent({ wishToProceed: false });
                if (saved) setStage("search");
              }}
              className="rounded-2xl bg-[#F5F7F9] px-4 py-4 text-left text-[#09391C]"
            >
              <p className="font-semibold">No, continue searching</p>
              <p className="mt-1 text-sm text-[#5A5D63]">
                Keep exploring other properties that match your preference.
              </p>
            </button>
          </div>
        </div>
      ) : null}

      {selected && stage === "options" ? (
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#09391C]">Due diligence options</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Option A</p>
              <h4 className="mt-1 font-bold text-[#09391C]">Engage a professional on Khabiteq</h4>
              <p className="mt-2 text-sm text-gray-600">
                Hire a verified lawyer, surveyor, valuer, or other professional.
              </p>
              <ol className="mt-4 space-y-3">
                {PLATFORM_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#09391C] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>
                      <span className="font-semibold text-[#09391C]">{step.title}</span>
                      <span className="mt-0.5 block text-gray-600">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const saved = await submitIntent({
                    wishToProceed: true,
                    dueDiligencePath: "platform",
                  });
                  if (!saved) return;
                  setPath("platform");
                  window.location.href = `/buyer/service-requests/new?inspectionId=${encodeURIComponent(selectedId)}`;
                }}
                className="mt-5 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Create service request
              </button>
            </article>

            <article className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Option B</p>
              <h4 className="mt-1 font-bold text-[#09391C]">I have conducted due diligence independently</h4>
              <p className="mt-2 text-sm text-gray-600">
                If you have already carried out due diligence outside Khabiteq, confirm below.
              </p>
              <p className="mt-4 rounded-xl bg-[#F5F7F9] p-4 text-sm text-[#09391C]">
                {INDEPENDENT_DUE_DILIGENCE_TEXT}
              </p>
              <label className="mt-4 flex items-start gap-2 text-sm text-[#09391C]">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={accepted || path === "independent"}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                I agree to the above declaration
              </label>
              <button
                type="button"
                disabled={busy || (!(accepted || path === "independent"))}
                onClick={async () => {
                  if (path === "independent") {
                    onContinueToRegistration(selectedId);
                    return;
                  }
                  const saved = await submitIntent({
                    wishToProceed: true,
                    dueDiligencePath: "independent",
                    independentDeclaration: {
                      accepted: true,
                      acceptedText: INDEPENDENT_DUE_DILIGENCE_TEXT,
                    },
                  });
                  if (!saved) return;
                  setPath("independent");
                  onContinueToRegistration(selectedId);
                }}
                className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm and continue
              </button>
            </article>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F4FBF5] px-4 py-4">
            <p className="text-sm text-[#09391C]">
              Once due diligence is completed or confirmed, continue to transaction registration.
            </p>
            <button
              type="button"
              disabled={!path}
              onClick={() => onContinueToRegistration(selectedId)}
              className="inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continue to transaction registration
            </button>
          </div>
          {stage === "options" && !path ? (
            <button
              type="button"
              className="text-sm font-semibold text-[#5A5D63]"
              onClick={() => setStage("proceed")}
            >
              Back
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
