"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import BackToDashboard from "@/components/common/BackToDashboard";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

type TransactionRow = {
  id: string;
  property: string;
  propertyCode?: string | null;
  transactionReference?: string | null;
  transactionStatus?: string;
  certificateStatus?: string | null;
  registrationDate?: string;
  certificateUrl?: string | null;
  hasCertificate?: boolean;
};

export default function MyTransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const accountToken = Cookies.get("token");
      const buyerToken = getBuyerToken();
      if (buyerToken && !accountToken) {
        const res = await buyerFetch<{ transactions: any[] }>("/buyer/auth/me/transaction-registrations");
        if (res.success && Array.isArray(res.data?.transactions)) {
          setRows(
            res.data.transactions.map((row) => ({
              id: String(row._id || row.id),
              property:
                row.propertyIdentification?.exactAddress ||
                row.propertyCode ||
                "Registered transaction",
              propertyCode: row.propertyCode,
              transactionReference: row.transactionReference,
              transactionStatus: row.status,
              certificateStatus: row.certificateStatus,
              registrationDate: row.createdAt,
              certificateUrl: row.certificateUrl,
              hasCertificate: Boolean(row.certificateUrl || row.certificateStatus),
            }))
          );
        } else {
          setError(res.message || "Unable to load transactions.");
        }
        setLoading(false);
        return;
      }
      if (!accountToken) {
        setError("Sign in to view your transaction records.");
        setLoading(false);
        return;
      }
      const res = await GET_REQUEST<{ transactions: TransactionRow[] }>(
        `${URLS.BASE}${URLS.myTransactionRegistrations}`,
        accountToken
      );
      if (res?.success && Array.isArray(res.data?.transactions)) {
        setRows(res.data.transactions);
      } else {
        setError(res?.message || "Unable to load transactions.");
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F6F4] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <BackToDashboard className="mb-6" />
        <h1 className="text-3xl font-bold text-[#09391C]">My Transactions</h1>
        <p className="text-sm text-[#4B5563] mt-2">
          Digital records of transaction journeys recorded through Khabiteq.
        </p>

        {loading ? (
          <p className="mt-10 text-gray-500">Loading transactions…</p>
        ) : error ? (
          <p className="mt-10 text-red-700">{error}</p>
        ) : rows.length === 0 ? (
          <div className="mt-10 bg-white border border-gray-200 p-8 text-center">
            <p className="text-[#09391C] font-semibold">No registered transactions yet</p>
            <Link href="/transaction-registration" className="inline-block mt-4 text-emerald-700 underline">
              Register a transaction
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {rows.map((row) => (
              <article key={row.id} className="bg-white border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#09391C]">{row.property}</p>
                    <p className="text-sm text-[#4B5563] mt-1">
                      {row.propertyCode || "Property code pending"} · {row.transactionReference || "Reference pending"}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-2">
                      Status {row.certificateStatus || row.transactionStatus || "Pending"}
                      {row.registrationDate
                        ? ` · Registered ${new Date(row.registrationDate).toLocaleDateString("en-GB")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.transactionReference ? (
                      <Link
                        href={`/my-transactions/${row.transactionReference}`}
                        className="px-4 py-2 bg-[#09391C] text-white text-sm font-semibold rounded-lg"
                      >
                        View Certificate
                      </Link>
                    ) : null}
                    {row.certificateUrl ? (
                      <a
                        href={row.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 border border-[#09391C] text-[#09391C] text-sm font-semibold rounded-lg"
                      >
                        Download Certificate
                      </a>
                    ) : null}
                    {row.transactionReference ? (
                      <Link
                        href={`/verify/${row.transactionReference}`}
                        className="px-4 py-2 text-sm text-emerald-700 underline"
                      >
                        View Digital Record
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
