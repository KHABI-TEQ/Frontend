"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

type MatchRow = { propertyId: string; title: string };

export default function PreferenceMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const preferenceId = String(params?.preferenceId || "");
  const [loading, setLoading] = useState(true);
  const [matchedId, setMatchedId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=/buyer/searches/${preferenceId}/matches`);
      return;
    }
    buyerFetch<{ preferences: any[]; buyerId?: string }>("/buyer/auth/me/preferences").then(async (res) => {
      const preferences = res.data?.preferences || [];
      const pref = preferences.find((row) => String(row._id) === preferenceId);
      const ownerId = String(res.data?.buyerId || pref?.buyer || "");
      let nextMatchedId = String(pref?.matchedId || "");
      let nextMatches: MatchRow[] = Array.isArray(pref?.matches) ? pref.matches : [];

      if (!nextMatches.length && ownerId) {
        const detail = await buyerFetch<any>(`/preferences/getByBuyer/${ownerId}/${preferenceId}`);
        nextMatchedId = String(detail.data?.matchedId || nextMatchedId);
        if (nextMatchedId) {
          const listed = await buyerFetch<any>(
            `/properties/${nextMatchedId}/${preferenceId}/matches?limit=50`
          );
          const rows = listed.data?.matchedProperties || [];
          nextMatches = rows
            .map((property: any) => ({
              propertyId: String(property.id || property._id || ""),
              title:
                property.title ||
                [property.location?.area, property.location?.localGovernment, property.location?.state]
                  .filter(Boolean)
                  .join(", ") ||
                property.propertyType ||
                "Property",
            }))
            .filter((row: MatchRow) => row.propertyId);
        }
      }

      setMatchedId(nextMatchedId);
      setMatches(nextMatches);
      setLoading(false);
    });
  }, [preferenceId, router]);

  return (
    <BuyerShell
      title="Preference matches"
      subtitle="Open a matched property to schedule an inspection."
    >
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading matches...</p>
      ) : matches.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center">
          <p className="text-[#5A5D63]">No matches are ready for this preference yet.</p>
          <Link href="/buyer/searches" className="mt-4 inline-flex text-sm font-semibold text-[#09391C]">
            Back to preferences
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const href = `/buyer/matches/${match.propertyId}?${new URLSearchParams({
              preferenceId,
              ...(matchedId ? { matchedId } : {}),
            }).toString()}`;
            return (
              <article key={match.propertyId} className="rounded-3xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-[#09391C]">{match.title}</h2>
                <Link
                  href={href}
                  className="mt-3 inline-flex rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open listing
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </BuyerShell>
  );
}
