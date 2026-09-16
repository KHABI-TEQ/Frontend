"use client";

import { useState } from "react";
import Link from "next/link";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { normalizePropertyCode, storePropertyCode } from "@/utils/propertyCode";

type LookupResult = {
  propertyCode: string;
  isLive: boolean;
  status?: string;
  property?: {
    id: string;
    propertyType?: string;
    briefType?: string;
    price?: number;
    location?: { state?: string; localGovernment?: string; area?: string };
    pictures?: string[];
    description?: string;
  } | null;
  professional?: {
    id: string;
    name: string;
    userType?: string;
    profilePicture?: string | null;
  } | null;
  practitionerPage?: { slug: string; url: string } | null;
};

export default function PropertyCodeLookup({
  compact = false,
  tone = "dark",
}: {
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const dark = tone === "dark";

  const lookup = async () => {
    const normalized = storePropertyCode(code);
    if (!normalized || normalized.length < 6) {
      setError("Enter a valid Property Code, for example KH-VGR-08421.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await GET_REQUEST<LookupResult>(
        `${URLS.BASE}${URLS.propertyByCode}/${encodeURIComponent(normalized)}`,
      );
      if (!response.success || !response.data) {
        setResult(null);
        setError(response.message || response.error || "No property was found for that Property Code.");
        return;
      }
      setResult(response.data);
    } catch {
      setResult(null);
      setError("We could not look up that Property Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const outlineBtn = dark
    ? "inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white"
    : "inline-flex min-h-11 items-center rounded-full border border-[#09391C]/20 px-5 text-sm font-semibold text-[#09391C]";

  return (
    <div className={compact ? "" : "space-y-4"}>
      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup();
        }}
      >
        <label className="sr-only" htmlFor="property-code-input">
          Enter Property Code
        </label>
        <input
          id="property-code-input"
          value={code}
          onChange={(e) => setCode(normalizePropertyCode(e.target.value))}
          placeholder="ENTER PROPERTY CODE"
          className={
            dark
              ? "flex-1 min-h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
              : "flex-1 min-h-12 rounded-xl border border-gray-200 bg-white px-4 text-[#09391C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
          }
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 px-6 rounded-xl bg-[#8DDB90] text-[#09391C] font-semibold hover:bg-[#7BC87F] disabled:opacity-60"
        >
          {loading ? "Looking up…" : "FIND PROPERTY"}
        </button>
      </form>

      {error ? <p className={`mt-3 text-sm ${dark ? "text-red-200" : "text-red-700"}`}>{error}</p> : null}

      {result ? (
        <div
          className={`mt-5 rounded-2xl p-5 ${
            dark ? "border border-white/15 bg-white/10 text-white" : "border border-gray-100 bg-white text-[#09391C]"
          }`}
        >
          <p className={`text-xs tracking-[0.16em] uppercase ${dark ? "text-[#8DDB90]" : "text-[#5aa85d]"}`}>
            {result.propertyCode}
          </p>
          {result.isLive && result.property ? (
            <>
              <h4 className="mt-2 text-lg font-bold">
                {result.property.propertyType || "Property"} identified
              </h4>
              <p className={`mt-1 text-sm ${dark ? "text-white/80" : "text-[#5A5D63]"}`}>
                {[result.property.location?.area, result.property.location?.localGovernment, result.property.location?.state]
                  .filter(Boolean)
                  .join(", ") || "Location available after you continue."}
              </p>
            </>
          ) : (
            <p className={`mt-2 text-sm ${dark ? "text-white/85" : "text-[#5A5D63]"}`}>
              This Property Code is recognised. The listing is not live yet, but you can still associate your preference with the relevant professional.
            </p>
          )}
          {result.professional?.name ? (
            <p className="mt-3 text-sm">
              Listing professional: <span className="font-semibold">{result.professional.name}</span>
              {result.professional.userType ? ` · ${result.professional.userType}` : ""}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/preference?code=${encodeURIComponent(result.propertyCode)}`}
              className="inline-flex min-h-11 items-center rounded-full bg-[#8DDB90] px-5 text-sm font-semibold text-[#09391C]"
            >
              Continue with this code
            </Link>
            {result.isLive && result.property?.id ? (
              <Link
                href={`/property/${String(result.property.briefType || result.property.propertyType || "buy").toLowerCase()}/${result.property.id}`}
                className={outlineBtn}
              >
                View listing
              </Link>
            ) : null}
            {result.practitionerPage?.url ? (
              <a
                href={result.practitionerPage.url}
                target="_blank"
                rel="noopener noreferrer"
                className={outlineBtn}
              >
                Practitioner page
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
