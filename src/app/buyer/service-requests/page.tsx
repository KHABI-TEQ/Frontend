"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";
import { useRouter } from "next/navigation";

type Brief = {
  _id: string;
  serviceName?: string;
  status?: string;
  reference?: string;
  offers?: unknown[];
  customerPrice?: number;
};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Brief[]>([]);

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer/service-requests");
      return;
    }
    buyerFetch<{ requests: Brief[] }>("/buyer/auth/me/professional-service-requests").then((res) => {
      setRows(res.data?.requests || []);
    });
  }, [router]);

  return (
    <BuyerShell
      title="Professional offers"
      subtitle="Each brief collects offers from verified professionals. Open a brief to compare what they cover and the fee they set."
    >
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-[#5A5D63]">
          You have no service briefs yet. Engage a professional from a completed inspection to start one.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row._id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-[#09391C]">{row.serviceName}</p>
              <p className="mt-1 text-sm text-[#5A5D63]">
                {row.reference} · {String(row.status || "").replace(/-/g, " ")} · {row.offers?.length || 0} offer(s)
              </p>
              <Link
                href={`/buyer/service-requests/${row._id}`}
                className="mt-3 inline-flex text-sm font-semibold text-[#0F766E]"
              >
                View offers
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BuyerShell>
  );
}
