"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

const INDEPENDENT_TEXT =
  "I confirm that I have conducted or opted out of due diligence independently of Khabiteq, and I understand that Khabiteq is not responsible for the due diligence conducted outside this platform.";

export default function BuyerInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = String(params?.id || "");
  const [inspection, setInspection] = useState<any>(null);
  const [step, setStep] = useState<"review" | "diligence">("review");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"search" | "platform" | "independent" | "">("");

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=/buyer/inspections/${inspectionId}`);
      return;
    }
    buyerFetch<{ inspections: any[] }>("/buyer/auth/me/inspections").then((res) => {
      const found = (res.data?.inspections || []).find((row: any) => String(row._id) === inspectionId);
      setInspection(found || null);
      if (found?.wishToProceed === false) setDone("search");
      if (found?.dueDiligencePath === "platform") setDone("platform");
      if (found?.dueDiligencePath === "independent") setDone("independent");
    });
  }, [inspectionId, router]);

  const submitIntent = async (payload: {
    wishToProceed: boolean;
    dueDiligencePath?: "platform" | "independent";
    independentDeclaration?: { accepted: true; acceptedText: string };
  }) => {
    const email = getBuyerProfile()?.email;
    if (!email) {
      setError("Sign in again to continue.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await buyerFetch("/transaction-registration/intent", {
      method: "POST",
      body: JSON.stringify({ inspectionId, email, ...payload }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not save your decision.");
      return;
    }
    if (!payload.wishToProceed) {
      setDone("search");
      return;
    }
    setDone(payload.dueDiligencePath || "platform");
  };

  const property = inspection?.propertyId || {};
  const title =
    property.title ||
    property.propertyName ||
    [property.location?.area, property.location?.state].filter(Boolean).join(", ") ||
    "Inspection";
  const cancelled = ["cancelled", "agent_rejected", "transaction_failed"].includes(
    String(inspection?.status || "")
  );
  const slotPassed =
    inspection?.inspectionDate &&
    Date.now() >=
      new Date(inspection.inspectionDate).getTime() +
        (inspection.proceedToTransactionPromptSentAt ? 0 : 2 * 60 * 60 * 1000);
  const showProceed = !cancelled && Boolean(inspection?.proceedToTransactionPromptSentAt || slotPassed);

  return (
    <BuyerShell title={title} subtitle="Inspection details and next steps after your visit.">
      {!inspection ? (
        <p className="text-sm text-[#5A5D63]">Loading inspection...</p>
      ) : (
        <div className="space-y-4">
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#5A5D63]">
              {inspection.inspectionMode === "virtual" ? "Virtual inspection" : "Physical inspection"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#09391C]">{title}</h2>
            <p className="mt-2 text-sm text-[#5A5D63]">
              {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : "Date pending"}
              {inspection.inspectionTime ? ` · ${inspection.inspectionTime}` : ""}
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#F5F7F9] px-3 py-1 text-xs font-semibold capitalize text-[#09391C]">
              {String(inspection.status || "").replace(/_/g, " ")}
            </p>
            {property._id ? (
              <Link href={`/property/buy/${property._id}`} className="mt-4 block text-sm font-semibold text-[#0F766E]">
                View property →
              </Link>
            ) : null}
          </article>

          {showProceed ? (
            <article className="rounded-3xl bg-white p-6 shadow-sm">
              {done === "search" ? (
                <div>
                  <h3 className="text-lg font-bold text-[#09391C]">Continue searching</h3>
                  <p className="mt-2 text-sm text-[#5A5D63]">
                    You can keep exploring other properties that match your preference.
                  </p>
                  <Link href="/buyer/searches" className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white">
                    Back to property search
                  </Link>
                </div>
              ) : done === "platform" ? (
                <div>
                  <h3 className="text-lg font-bold text-[#09391C]">Engage a professional on Khabiteq</h3>
                  <p className="mt-2 text-sm text-[#5A5D63]">
                    Select a service request, review requirements, book a professional, and pay through the platform.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/professional-services?inspectionId=${inspectionId}`} className="rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white">
                      Hire a professional
                    </Link>
                    <Link href={`/document-verification?inspectionId=${inspectionId}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] ring-1 ring-black/10">
                      Document verification
                    </Link>
                    <Link href={`/survey-services?inspectionId=${inspectionId}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] ring-1 ring-black/10">
                      Survey services
                    </Link>
                    <Link href={`/transaction-registration?inspectionId=${inspectionId}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#09391C] ring-1 ring-black/10">
                      Continue to transaction registration
                    </Link>
                  </div>
                </div>
              ) : done === "independent" ? (
                <div>
                  <h3 className="text-lg font-bold text-[#09391C]">Due diligence confirmed</h3>
                  <p className="mt-2 text-sm text-[#5A5D63]">
                    Once due diligence is completed or confirmed, you can proceed with transaction registration on Khabiteq.
                  </p>
                  <Link href={`/transaction-registration?inspectionId=${inspectionId}`} className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white">
                    Continue to transaction registration
                  </Link>
                </div>
              ) : step === "review" ? (
                <div>
                  <h3 className="text-lg font-bold text-[#09391C]">Do you want to proceed with this property?</h3>
                  <p className="mt-2 text-sm text-[#5A5D63]">
                    When you are ready to proceed with a property, the system guides you on due diligence.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setStep("diligence")}
                      className="rounded-2xl bg-[#09391C] px-4 py-4 text-left text-white"
                    >
                      <p className="font-semibold">Yes, proceeding</p>
                      <p className="mt-1 text-sm text-white/80">Handle due diligence before proceeding.</p>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void submitIntent({ wishToProceed: false })}
                      className="rounded-2xl bg-[#F5F7F9] px-4 py-4 text-left text-[#09391C]"
                    >
                      <p className="font-semibold">No, continue searching</p>
                      <p className="mt-1 text-sm text-[#5A5D63]">Keep exploring other properties that match your preference.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-[#09391C]">Choose how to handle due diligence</h3>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void submitIntent({ wishToProceed: true, dueDiligencePath: "platform" })}
                      className="rounded-2xl border border-black/10 p-5 text-left hover:border-[#09391C]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Option A</p>
                      <p className="mt-1 font-bold text-[#09391C]">Engage a professional on Khabiteq</p>
                      <p className="mt-2 text-sm text-[#5A5D63]">
                        Hire a verified lawyer, surveyor, valuer or other professional. Review requirements, book, communicate, and pay through the platform.
                      </p>
                    </button>
                    <div className="rounded-2xl border border-black/10 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Option B</p>
                      <p className="mt-1 font-bold text-[#09391C]">I have conducted due diligence independently</p>
                      <p className="mt-2 text-sm text-[#5A5D63]">{INDEPENDENT_TEXT}</p>
                      <label className="mt-4 flex items-start gap-2 text-sm text-[#09391C]">
                        <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                        I agree to the above declaration
                      </label>
                      <button
                        type="button"
                        disabled={busy || !accepted}
                        onClick={() =>
                          void submitIntent({
                            wishToProceed: true,
                            dueDiligencePath: "independent",
                            independentDeclaration: { accepted: true, acceptedText: INDEPENDENT_TEXT },
                          })
                        }
                        className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Confirm and continue
                      </button>
                    </div>
                  </div>
                  <button type="button" className="mt-4 text-sm font-semibold text-[#5A5D63]" onClick={() => setStep("review")}>
                    Back
                  </button>
                </div>
              )}
              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </article>
          ) : (
            <article className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-[#5A5D63]">
                After this inspection is completed, you can choose to proceed with the property or keep searching.
              </p>
            </article>
          )}
        </div>
      )}
    </BuyerShell>
  );
}
