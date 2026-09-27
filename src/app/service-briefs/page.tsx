"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type Job = {
  _id: string;
  serviceName?: string;
  reference?: string;
  status?: string;
  answers?: { objective?: string; questions?: string; timeline?: string; deliverable?: string };
};

export default function ServiceBriefsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [active, setActive] = useState<Job | null>(null);
  const [note, setNote] = useState("");
  const [fee, setFee] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        coverageNote: note,
        fee: Number(fee),
        commissionAccepted: agreed,
      },
      token
    );
    if (!res.success) {
      setError(res.message || "Could not send this offer.");
      return;
    }
    setMessage("Offer sent. The client can now compare it with other professionals.");
    setActive(null);
    setNote("");
    setFee("");
    setAgreed(false);
    void load();
  };

  return (
    <main className="min-h-screen bg-[#F5F7F9] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[#09391C]">Service briefs</h1>
        <p className="mt-2 text-sm text-[#5A5D63]">
          Clients publish what they need after an inspection. Write what your service covers and set the fee the client will pay. Khabiteq deducts 10% of that fee when the payment is split. Your share is paid to the bank account from your KYC. A brief cannot be answered without that account.
        </p>
        {message ? <p className="mt-4 text-sm font-semibold text-[#0F766E]">{message}</p> : null}
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li key={job._id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-[#09391C]">{job.serviceName}</p>
              <p className="mt-1 text-xs text-[#5A5D63]">{job.reference} · {job.status}</p>
              <p className="mt-3 text-sm text-[#24272C]">{job.answers?.objective}</p>
              {job.status === "awaiting-offers" ? (
                <button
                  type="button"
                  onClick={() => setActive(job)}
                  className="mt-4 text-sm font-semibold text-[#0F766E]"
                >
                  Send an offer
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
            <h2 className="text-lg font-bold text-[#09391C]">Offer for {active.serviceName}</h2>
            <label className="block text-sm">
              <span className="font-semibold">What this service covers</span>
              <textarea
                required
                className="mt-1 w-full rounded-xl border border-gray-200 p-3"
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Your fee for this brief (₦)</span>
              <input
                required
                type="number"
                min={1000}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3"
                value={fee}
                onChange={(event) => setFee(event.target.value)}
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-[#09391C]">
              <input type="checkbox" className="mt-1" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              I agree Khabiteq deducts 10% of this fee from my settlement. The client pays only the fee I set, and my share is settled to my registered bank account.
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={!agreed}
              className="rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Submit offer
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
