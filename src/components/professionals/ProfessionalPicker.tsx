"use client";

import { useEffect, useState } from "react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export type MarketplaceProfessional = {
  id: string;
  fullName: string;
  profilePhoto?: string;
  bio?: string;
  firmName?: string;
  practiceAreas?: string[];
  serviceTypes?: string[];
  verificationFee?: number;
  surveyFee?: number;
};

function formatNaira(n?: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

export default function ProfessionalPicker({
  kind,
  selectedId,
  onChange,
  title,
}: {
  kind: "lawyer" | "surveyor";
  selectedId: string | null;
  onChange: (pro: MarketplaceProfessional | null) => void;
  title?: string;
}) {
  const [items, setItems] = useState<MarketplaceProfessional[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    const path =
      kind === "lawyer" ? URLS.lawyersMarketplace : URLS.surveyorsMarketplace;
    const qs = q?.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
    const res = await GET_REQUEST<MarketplaceProfessional[]>(
      `${URLS.BASE}${path}${qs}`,
    );
    if (res.success && Array.isArray(res.data)) {
      setItems(res.data);
      setError(null);
    } else {
      setItems([]);
      setError(res.message || `No ${kind}s available yet.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-[#09391C]">
          {title || (kind === "lawyer" ? "Choose a lawyer" : "Choose a surveyor")}
        </h3>
        <p className="text-sm text-[#5A5D63] mt-1">
          View credentials, services and pricing before you hire through Khabiteq.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Search by name or firm"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => load(search)}
          className="px-4 py-2 rounded-lg bg-[#09391C] text-white font-medium"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-sm text-[#5A5D63]">Loading marketplace…</p>}
      {error && !items.length && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {items.map((pro) => {
          const active = selectedId === pro.id;
          const fee = kind === "lawyer" ? pro.verificationFee : pro.surveyFee;
          return (
            <button
              key={pro.id}
              type="button"
              onClick={() => onChange(active ? null : pro)}
              className={`w-full text-left flex gap-3 p-4 rounded-xl border-2 transition-colors ${
                active
                  ? "border-[#8DDB90] bg-[#8DDB90]/10"
                  : "border-gray-200 bg-white hover:border-[#8DDB90]/50"
              }`}
            >
              {pro.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pro.profilePhoto}
                  alt={pro.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#09391C] text-white font-bold flex items-center justify-center">
                  {(pro.fullName || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#09391C]">{pro.fullName}</p>
                {pro.firmName && (
                  <p className="text-xs text-[#5A5D63]">{pro.firmName}</p>
                )}
                <p className="text-sm font-semibold text-[#16a34a] mt-1">
                  {formatNaira(fee)}
                </p>
                {pro.bio && (
                  <p className="text-sm text-[#5A5D63] mt-1 line-clamp-2">{pro.bio}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
