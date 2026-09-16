"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import TransactionCertificateView, {
  type CertificateViewData,
} from "@/components/certificates/TransactionCertificateView";

export default function MyTransactionCertificatePage() {
  const params = useParams();
  const reference = String(params.reference || "").toUpperCase();
  const [data, setData] = useState<(CertificateViewData & { certificateUrl?: string | null }) | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("Sign in to view this certificate.");
        setLoading(false);
        return;
      }
      const res = await GET_REQUEST<CertificateViewData & { certificateUrl?: string | null }>(
        `${URLS.BASE}${URLS.myTransactionRegistrations}/${encodeURIComponent(reference)}`,
        token
      );
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError(res?.message || "You are not authorized to view this record.");
      }
      setLoading(false);
    };
    if (reference) load();
  }, [reference]);

  return (
    <main className="min-h-screen bg-[#F4F6F4] py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between gap-3">
        <Link href="/my-transactions" className="text-sm text-emerald-700 underline">
          Back to My Transactions
        </Link>
        {data?.certificateUrl ? (
          <a
            href={data.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#09391C] text-white text-sm font-semibold rounded-lg"
          >
            Download Certificate
          </a>
        ) : null}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading certificate…</p>
      ) : error ? (
        <p className="text-center text-red-700">{error}</p>
      ) : data ? (
        <TransactionCertificateView data={data} />
      ) : null}
    </main>
  );
}
