"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "@/context/user-context";
import { DUE_DILIGENCE_SERVICES, type DueDiligenceRole } from "@/data/professional-due-diligence-services";

type Job = {
  _id: string;
  serviceName?: string;
  reference?: string;
  status?: string;
  answers?: {
    objective?: string;
    questions?: string;
    timeline?: string;
    deliverable?: string;
    additional?: string;
    requestedServices?: Array<{ serviceId: string; name: string }>;
  };
};

export default function ServiceBriefsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [active, setActive] = useState<Job | null>(null);
  const [serviceFees, setServiceFees] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [letterhead, setLetterhead] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useUserContext();
  const roleText = String(user?.userType || "").toLowerCase();
  const role: DueDiligenceRole | null = roleText.includes("lawyer") ? "Lawyer" : roleText.includes("surveyor") ? "Surveyor" : roleText.includes("valuer") ? "Valuer" : null;
  const services = role ? DUE_DILIGENCE_SERVICES[role] : [];
  const parseFee = (value: string) => Number(value.replace(/\D/g, "") || 0);
  const formatFee = (value: number) => value ? value.toLocaleString("en-NG") : "";
  const selectedServices = services.filter((service) => serviceFees[service.id] !== undefined);
  const totalFee = selectedServices.reduce((sum, service) => sum + parseFee(serviceFees[service.id]), 0);

  const load = async () => {
    const token = Cookies.get("token");
    const res = await GET_REQUEST(`${URLS.BASE}/account/professional-services/jobs`, token);
    const rows = (res.data as Job[] | undefined) || [];
    setJobs(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const send = async () => {
    if (!active) return;
    setError("");
    setMessage("");
    const token = Cookies.get("token");
    const res = await POST_REQUEST(
      `${URLS.BASE}/account/professional-services/${active._id}/respond`,
      {
        coverageNote: selectedServices.map((service) => service.name).join("; "),
        serviceItems: selectedServices.map((service) => ({ serviceId: service.id, name: service.name, fee: parseFee(serviceFees[service.id]) })),
        fee: totalFee,
        commissionAccepted: agreed,
        letterheadReportAccepted: letterhead,
      },
      token
    );
    if (!res.success) {
      setError(res.message || "Could not send this offer.");
      return;
    }
    setMessage("Quotation sent. The client sees each service and fee before accepting and paying.");
    setActive(null);
    setServiceFees({});
    setAgreed(false);
    setLetterhead(false);
    void load();
  };

  return (
    <main className="min-h-screen bg-[#F5F7F9] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[#09391C]">Service briefs</h1>
        <p className="mt-2 text-sm text-[#5A5D63]">
          Clients publish a structured brief. Review it, select the work required, and set a fee for each item. Khabiteq totals the quotation. The client must accept it before payment.
        </p>
        {message ? <p className="mt-4 text-sm font-semibold text-[#0F766E]">{message}</p> : null}
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li key={job._id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-[#09391C]">{job.serviceName}</p>
              <p className="mt-1 text-xs text-[#5A5D63]">{job.reference} · {job.status}</p>
              <p className="mt-3 text-sm text-[#24272C]">{job.answers?.objective}</p>
              {job.answers?.requestedServices?.length ? (
                <p className="mt-2 text-xs text-[#5A5D63]">
                  Requested: {job.answers.requestedServices.map((item) => item.name).join("; ")}
                </p>
              ) : null}
              {job.status === "awaiting-offers" || job.status === "awaiting-payment" ? (
                <button
                  type="button"
                  onClick={() => {
                    const requested = new Set((job.answers?.requestedServices || []).map((item) => item.serviceId));
                    const starter: Record<string, string> = {};
                    services.forEach((service) => {
                      if (requested.has(service.id)) starter[service.id] = formatFee(service.suggestedFee);
                    });
                    setServiceFees(starter);
                    setActive(job);
                  }}
                  className="mt-4 text-sm font-semibold text-[#0F766E]"
                >
                  {job.status === "awaiting-payment" ? "Send a revised quotation" : "Create itemised quotation"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {jobs.length === 0 ? (
          <p className="mt-6 text-sm text-[#5A5D63]">No open briefs for your profession right now.</p>
        ) : null}

        {active ? (
          <form
            className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <h2 className="text-lg font-bold text-[#09391C]">Quotation for {active.serviceName}</h2>
            <p className="text-sm text-[#5A5D63]">{active.answers?.objective}</p>
            {active.answers?.questions ? <p className="text-sm text-[#5A5D63]">Questions: {active.answers.questions}</p> : null}
            {active.answers?.timeline ? <p className="text-sm text-[#5A5D63]">Timeline: {active.answers.timeline}</p> : null}
            {active.answers?.deliverable ? <p className="text-sm text-[#5A5D63]">Deliverable: {active.answers.deliverable}</p> : null}
            <section>
              <h3 className="text-sm font-semibold">Scope of work and fees</h3>
              <p className="mt-1 text-xs text-gray-500">You control the services and pricing. Suggested amounts are starting points only. The total is calculated automatically.</p>
              <div className="mt-3 space-y-2">
                {services.map((service) => {
                  const selected = serviceFees[service.id] !== undefined;
                  return <div key={service.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center">
                    <label className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                      <input type="checkbox" checked={selected} onChange={(event) => setServiceFees((current) => {
                        const next = { ...current };
                        if (event.target.checked) next[service.id] = formatFee(service.suggestedFee);
                        else delete next[service.id];
                        return next;
                      })} />
                      <span>
                        {service.name}
                        {active.answers?.requestedServices?.some((item) => item.serviceId === service.id) ? (
                          <span className="ml-2 text-xs font-semibold text-[#0F766E]">Requested</span>
                        ) : null}
                      </span>
                    </label>
                    {selected ? <label className="sm:w-44"><span className="sr-only">Fee for {service.name}</span><span className="mr-2 text-gray-500">₦</span><input inputMode="numeric" value={serviceFees[service.id]} onChange={(event) => setServiceFees((current) => ({ ...current, [service.id]: formatFee(parseFee(event.target.value)) }))} className="w-[calc(100%-1.5rem)] rounded-lg border border-gray-200 p-2" /></label> : null}
                  </div>;
                })}
                {!role ? <p className="text-sm text-amber-700">A Lawyer, Surveyor or Valuer account is required to respond to this brief.</p> : null}
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-semibold text-[#09391C]"><span>Total quotation</span><span>₦{formatFee(totalFee) || "0"}</span></div>
            </section>
            <label className="flex items-start gap-2 text-sm text-[#09391C]">
              <input type="checkbox" className="mt-1" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              I agree Khabiteq deducts 10% of this fee from my settlement. The client pays only the fee I set, and my share is settled to my registered bank account.
            </label>
            <label className="flex items-start gap-2 text-sm text-[#09391C]">
              <input type="checkbox" className="mt-1" checked={letterhead} onChange={(event) => setLetterhead(event.target.checked)} />
              I will deliver the agreed services and send the full report on my company letterhead.
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={!agreed || !letterhead || !totalFee || !selectedServices.length}
              className="rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Submit quotation
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
