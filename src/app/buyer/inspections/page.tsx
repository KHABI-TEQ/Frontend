"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

function propertyLabel(inspection: any) {
  const property = inspection.propertyId || {};
  return (
    property.title ||
    property.propertyName ||
    [property.location?.area, property.location?.state].filter(Boolean).join(", ") ||
    "Inspection"
  );
}

export default function BuyerInspectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<any[]>([]);

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer/inspections");
      return;
    }
    buyerFetch<{ inspections: any[] }>("/buyer/auth/me/inspections").then((res) => {
      setInspections(res.data?.inspections || []);
      setLoading(false);
    });
  }, [router]);

  return (
    <BuyerShell title="My Inspections" subtitle="See all your inspection details, including property and agent information.">
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading...</p>
      ) : inspections.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center">
          <p className="text-[#5A5D63]">No inspections yet.</p>
          <Link href="/" className="mt-4 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white">
            Book an inspection
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => {
            const property = inspection.propertyId || {};
            const date = inspection.inspectionDate
              ? new Date(inspection.inspectionDate).toLocaleDateString()
              : "Date pending";
            return (
              <article key={inspection._id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#5A5D63]">
                      {inspection.inspectionMode === "virtual" ? "Virtual inspection" : "Physical inspection"}
                    </p>
                    <h2 className="text-lg font-bold text-[#09391C]">{propertyLabel(inspection)}</h2>
                    <p className="text-sm text-[#5A5D63]">
                      {date}
                      {inspection.inspectionTime ? ` · ${inspection.inspectionTime}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#F5F7F9] px-3 py-1 text-xs font-semibold capitalize text-[#09391C]">
                    {String(inspection.status || "").replace(/_/g, " ")}
                  </span>
                </div>
                {property.price ? (
                  <p className="mt-2 text-sm font-semibold text-[#09391C]">
                    ₦{Number(property.price).toLocaleString()}
                  </p>
                ) : null}
                <Link
                  href={`/buyer/inspections/${inspection._id}`}
                  className="mt-4 inline-flex text-sm font-semibold text-[#0F766E]"
                >
                  View inspection details →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </BuyerShell>
  );
}
