"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import TransactionCertificateView, {
  type CertificateViewData,
} from "@/components/certificates/TransactionCertificateView";

export default function VerifyCertificatePage() {
  const params = useParams();
  const reference = String(params.reference || "").toUpperCase();
  const [data, setData] = useState<CertificateViewData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const res = await GET_REQUEST<CertificateViewData>(
        `${URLS.BASE}${URLS.transactionRegistrationVerify}/${encodeURIComponent(reference)}`
      );
      if (cancelled) return;
      if (res?.success && res.data) {
        setData(res.data);
        setError("");
      } else {
        setError(res?.message || "Certificate not found.");
      }
      setLoading(false);
    };
    if (reference) load();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <main className="min-h-screen bg-[#F4F6F4] py-10 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-xs tracking-[0.28em] text-[#09391C] font-semibold">KHABITEQ</p>
        <h1 className="mt-2 text-2xl font-bold text-[#09391C]">Verify Certificate</h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          This page confirms a digital record of a transaction journey recorded on Khabiteq.
        </p>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Checking certificate…</p>
      ) : error ? (
        <div className="max-w-xl mx-auto bg-white border border-red-200 p-6 text-center">
          <p className="font-semibold text-red-800">Certificate not found</p>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      ) : data ? (
        <TransactionCertificateView data={data} />
      ) : null}
    </main>
  );
}
