"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

export default function BuyerServicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer/services");
      return;
    }
    Promise.all([
      buyerFetch<{ documents: any[] }>("/buyer/auth/me/document-verifications"),
      buyerFetch<{ surveys: any[] }>("/buyer/auth/me/survey-requests"),
      buyerFetch<{ requests: any[] }>("/buyer/auth/me/professional-service-requests"),
    ]).then(([docs, surveysRes, catalogRes]) => {
      setDocuments(docs.data?.documents || []);
      setSurveys(surveysRes.data?.surveys || []);
      setCatalog(catalogRes.data?.requests || []);
      setLoading(false);
    });
  }, [router]);

  return (
    <BuyerShell
      title="My Professional Services"
      subtitle="Track professionals you have booked — lawyers, surveyors, valuers."
    >
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Link href="/professional-services" className="rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white">
              Hire a professional
            </Link>
            <Link href="/document-verification" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#09391C] shadow-sm">
              Document verification
            </Link>
          </div>

          <Section title="Catalog requests" empty="No professional service requests yet." rows={catalog} render={(row) => (
            <>
              <p className="font-semibold text-[#09391C]">{row.serviceName || row.slug}</p>
              <p className="text-sm text-[#5A5D63] capitalize">{String(row.status || "").replace(/-/g, " ")}</p>
            </>
          )} />
          <Section title="Document verifications" empty="No document reviews yet." rows={documents} render={(row) => (
            <>
              <p className="font-semibold text-[#09391C]">{row.docType || row.docCode || "Document review"}</p>
              <p className="text-sm text-[#5A5D63] capitalize">{String(row.status || "").replace(/_/g, " ")}</p>
            </>
          )} />
          <Section title="Survey requests" empty="No survey requests yet." rows={surveys} render={(row) => (
            <>
              <p className="font-semibold text-[#09391C]">{row.serviceType || "Survey"}</p>
              <p className="text-sm text-[#5A5D63]">{row.propertyAddress || String(row.status || "")}</p>
            </>
          )} />
        </div>
      )}
    </BuyerShell>
  );
}

function Section({
  title,
  empty,
  rows,
  render,
}: {
  title: string;
  empty: string;
  rows: any[];
  render: (row: any) => ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-[#09391C]">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-3xl bg-white p-5 text-sm text-[#5A5D63]">{empty}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row._id || row.reference} className="rounded-3xl bg-white p-5 shadow-sm">
              {render(row)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
