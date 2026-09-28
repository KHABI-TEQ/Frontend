"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { JourneyTrail, type JourneyStep } from "@/components/search-insurance/JourneyTrail";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

type PropertyJourney = {
  propertyId: string | null;
  inspectionId: string | null;
  title: string;
  steps: JourneyStep[];
};

type Journey = {
  preference: { id: string; title: string; status?: string };
  steps: JourneyStep[];
  properties: PropertyJourney[];
};

export default function PreferenceJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const preferenceId = String(params?.preferenceId || "");
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=/buyer/searches/${preferenceId}`);
      return;
    }
    buyerFetch<Journey>(`/buyer/auth/me/preferences/${preferenceId}/journey`).then((res) => {
      if (!res.success) setError(res.message || "Could not load this journey.");
      setJourney(res.data || null);
    });
  }, [preferenceId, router]);

  return (
    <BuyerShell
      title={journey?.preference.title || "Your journey"}
      subtitle="What is done on this search, and the one next step."
    >
      {!journey && !error ? (
        <p className="text-sm text-[#5A5D63]">Loading journey...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : journey ? (
        <div className="space-y-4">
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <JourneyTrail steps={journey.steps} />
          </article>
          {journey.properties.length === 0 ? (
            <article className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-[#5A5D63]">
                When a property matches, it will appear here with its own inspection, due diligence, and registration steps.
              </p>
            </article>
          ) : (
            journey.properties.map((property) => (
              <article key={property.inspectionId || property.propertyId} className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#09391C]">{property.title}</h2>
                <div className="mt-4">
                  <JourneyTrail steps={property.steps} />
                </div>
              </article>
            ))
          )}
          <Link href="/buyer/searches" className="inline-flex text-sm font-semibold text-[#0F766E]">
            All preferences
          </Link>
        </div>
      ) : null}
    </BuyerShell>
  );
}
