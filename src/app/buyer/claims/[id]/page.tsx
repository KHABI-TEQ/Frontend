"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken, naira } from "@/lib/search-insurance";

export default function SearchInsuranceClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login");
      return;
    }
    buyerFetch(`/buyer/auth/me/search-insurance/claims/${params.id}`).then((res) => {
      if (!res.success) setError(res.message || "Claim not found");
      else setClaim(res.data);
    });
  }, [params.id, router]);

  return (
    <BuyerShell title="Claim status">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {claim ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[#5A5D63]">{claim.status}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#09391C]">{claim.description}</p>
          {claim.practitionerName ? (
            <p className="mt-2 text-sm text-[#5A5D63]">Practitioner: {claim.practitionerName}</p>
          ) : null}
          {claim.approvedAmount != null ? (
            <p className="mt-3 text-lg font-bold text-[#09391C]">Approved: {naira(claim.approvedAmount)}</p>
          ) : null}
          {claim.adminNotes ? (
            <p className="mt-3 rounded-2xl bg-[#F5F7F9] px-4 py-3 text-sm text-[#5A5D63]">{claim.adminNotes}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {(claim.evidence || []).map((item: any) => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noreferrer" className="font-semibold text-[#0F766E]">
                  {item.name || "Evidence"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : !error ? (
        <p className="text-sm text-[#5A5D63]">Loading...</p>
      ) : null}
    </BuyerShell>
  );
}
