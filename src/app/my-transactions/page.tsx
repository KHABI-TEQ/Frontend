"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

type ServicePayment = {
  id: string;
  serviceName: string;
  status: string;
  reference?: string;
  serviceFee?: number;
  professionalName?: string;
};

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

const PAID_BRIEF = new Set(["in-progress", "delivered", "completed", "paid-awaiting-assignment"]);
const ISSUED = new Set(["certificate_issued", "completed"]);

function certificateReady(row: TransactionRow) {
  return Boolean(row.certificateUrl) && ISSUED.has(String(row.transactionStatus || ""));
}

function registrationNote(row: TransactionRow) {
  if (certificateReady(row)) return "";
  const status = String(row.transactionStatus || "");
  if (status === "submitted" || status === "draft") {
    return "The registration form was saved, but the registration fee has not been paid. No certificate has been issued.";
  }
  return "No certificate has been issued for this registration yet.";
}

function briefStatusLine(row: ServicePayment) {
  const name = row.professionalName || "the professional";
  if (PAID_BRIEF.has(row.status)) return `Paid. Waiting for the report from ${name}.`;
  if (row.status === "awaiting-payment") return `Offer selected from ${name}. Payment is still due.`;
  return String(row.status || "").replace(/-/g, " ");
}

export default function MyTransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [services, setServices] = useState<ServicePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const accountToken = Cookies.get("token");
      const buyerToken = getBuyerToken();
      if (buyerToken) {
        const [res, briefs] = await Promise.all([
          buyerFetch<{ transactions: any[] }>("/buyer/auth/me/transaction-registrations"),
          buyerFetch<{ requests: any[] }>("/buyer/auth/me/professional-service-requests"),
        ]);
        const paidServices = (briefs.data?.requests || []).filter((row) =>
          ["awaiting-payment", "in-progress", "delivered", "completed", "paid-awaiting-assignment"].includes(
            String(row.status)
          )
        );
        setServices(
          paidServices.map((row) => ({
            id: String(row._id),
            serviceName: row.serviceName || "Professional service",
            status: String(row.status || ""),
            reference: row.reference,
            serviceFee: row.serviceFee,
            professionalName: row.professionalName,
          }))
        );
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
              hasCertificate: Boolean(row.certificateUrl) && ISSUED.has(String(row.status || "")),
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
    <BuyerShell
      title="Transactions"
      subtitle="Professional fees you have paid, and property registrations recorded on Khabiteq."
    >
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading transactions…</p>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#09391C]">Due diligence</h2>
            {services.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 text-sm text-[#5A5D63]">
                No professional fee has been paid yet. That payment appears here after you choose an offer.
              </p>
            ) : (
              services.map((row) => (
                <article key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-[#09391C]">{row.serviceName}</p>
                  <p className="mt-1 text-sm text-[#09391C]">{briefStatusLine(row)}</p>
                  <p className="mt-2 text-xs text-[#5A5D63]">
                    {row.reference || "Reference pending"}
                    {row.serviceFee ? ` · ₦${Number(row.serviceFee).toLocaleString()}` : ""}
                  </p>
                  <Link
                    href={`/buyer/service-requests/${row.id}`}
                    className="mt-3 inline-flex text-sm font-semibold text-[#0F766E]"
                  >
                    View professional
                  </Link>
                </article>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#09391C]">Property registrations</h2>
            <p className="text-sm text-[#5A5D63]">
              These are property transactions registered with Khabiteq. They are separate from a professional’s fee.
            </p>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {rows.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 text-sm text-[#5A5D63]">No property has been registered yet.</p>
            ) : (
              rows.map((row) => (
                <article key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#09391C]">{row.property}</p>
                      <p className="mt-1 text-sm text-[#4B5563]">
                        {row.propertyCode || "Property code pending"} · {row.transactionReference || "Reference pending"}
                      </p>
                      <p className="mt-2 text-xs text-[#6B7280]">
                        Status {row.transactionStatus || "Pending"}
                        {row.registrationDate
                          ? ` · ${certificateReady(row) ? "Registered" : "Saved"} ${new Date(row.registrationDate).toLocaleDateString("en-GB")}`
                          : ""}
                      </p>
                      {registrationNote(row) ? (
                        <p className="mt-2 text-sm text-[#09391C]">{registrationNote(row)}</p>
                      ) : null}
                    </div>
                    {certificateReady(row) ? (
                      <div className="flex flex-wrap gap-2">
                        {row.transactionReference ? (
                          <Link
                            href={`/my-transactions/${row.transactionReference}`}
                            className="rounded-lg bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
                          >
                            View Certificate
                          </Link>
                        ) : null}
                        {row.certificateUrl ? (
                          <a
                            href={row.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-[#09391C] px-4 py-2 text-sm font-semibold text-[#09391C]"
                          >
                            Download Certificate
                          </a>
                        ) : null}
                        {row.transactionReference ? (
                          <Link href={`/verify/${row.transactionReference}`} className="px-4 py-2 text-sm text-emerald-700 underline">
                            View Digital Record
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      )}
    </BuyerShell>
  );
}
