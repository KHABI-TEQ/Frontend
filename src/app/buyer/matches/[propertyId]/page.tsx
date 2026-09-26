"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { getBuyerToken } from "@/lib/search-insurance";
import api from "@/utils/axiosConfig";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";
import sampleImage from "@/assets/noImageAvailable.png";

function marketTab(property: any): "buy" | "jv" | "rent" | "shortlet" {
  const brief = String(property?.briefType || property?.propertyType || "").toLowerCase();
  if (brief.includes("joint") || brief === "jv") return "jv";
  if (brief.includes("rent")) return "rent";
  if (brief.includes("short")) return "shortlet";
  return "buy";
}

function stripContact(property: any) {
  if (!property || typeof property !== "object") return property;
  const next = { ...property };
  delete next.owner;
  delete next.ownerPhone;
  delete next.ownerEmail;
  delete next.agent;
  delete next.agentPhone;
  delete next.agentEmail;
  delete next.phoneNumber;
  delete next.email;
  delete next.contact;
  delete next.contactInfo;
  delete next.whatsAppNumber;
  delete next.whatsapp;
  return next;
}

export default function InsuredMatchListingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = String(params?.propertyId || "");
  const preferenceId = searchParams.get("preferenceId") || "";
  const matchedId = searchParams.get("matchedId") || "";
  const { toggleInspectionSelection, clearInspectionSelection } = useGlobalPropertyActions();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const next = `/buyer/matches/${propertyId}${
      preferenceId || matchedId
        ? `?${new URLSearchParams({
            ...(preferenceId ? { preferenceId } : {}),
            ...(matchedId ? { matchedId } : {}),
          }).toString()}`
        : ""
    }`;
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!propertyId) return;
    api
      .get(`/properties/${propertyId}/getOne`)
      .then((res) => {
        const raw = res.data?.data?.property || res.data?.data || res.data?.property;
        if (!raw) {
          setError("Property not found");
          return;
        }
        setProperty(stripContact(raw));
      })
      .catch(() => setError("Could not load this match."))
      .finally(() => setLoading(false));
  }, [matchedId, preferenceId, propertyId, router]);

  const pictures = useMemo(() => {
    const list = Array.isArray(property?.pictures) ? property.pictures.filter(Boolean) : [];
    return list.length ? list : [sampleImage.src];
  }, [property]);

  const title =
    property?.propertyType ||
    property?.typeOfBuilding ||
    [property?.location?.area, property?.location?.state].filter(Boolean).join(", ") ||
    "Matched property";

  const scheduleInspection = () => {
    if (!property) return;
    clearInspectionSelection();
    toggleInspectionSelection(
      { ...property, inspectionFee: 0 },
      marketTab(property),
      "insured-match",
      {
        preferenceId: preferenceId || undefined,
        matchedId: matchedId || undefined,
      }
    );
    router.push("/continue-inspection");
  };

  return (
    <BuyerShell
      title={title}
      subtitle="Your insured match. Practitioner contact is hidden — schedule an inspection through Khabiteq."
    >
      {loading ? (
        <p className="text-sm text-[#5A5D63]">Loading listing...</p>
      ) : error || !property ? (
        <div className="rounded-3xl bg-white p-8 text-center">
          <p className="text-[#5A5D63]">{error || "This match is no longer available."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative h-64 w-full bg-[#EEF1F1]">
              <Image
                src={pictures[0]}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">
                Insured match
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#09391C]">{title}</h2>
              <p className="mt-2 text-sm text-[#5A5D63]">
                {[property.location?.streetAddress, property.location?.area, property.location?.localGovernment, property.location?.state]
                  .filter(Boolean)
                  .join(", ") || "Location on file"}
              </p>
              <p className="mt-3 text-xl font-bold text-[#09391C]">
                {Number.isFinite(Number(property.price))
                  ? `₦${Number(property.price).toLocaleString()}`
                  : "Price on request"}
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#5A5D63]">Bedrooms</dt>
                  <dd className="text-sm font-semibold text-[#09391C]">
                    {property.additionalFeatures?.noOfBedroom || property.additionalFeatures?.noOfBedrooms || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#5A5D63]">Bathrooms</dt>
                  <dd className="text-sm font-semibold text-[#09391C]">
                    {property.additionalFeatures?.noOfBathroom || property.additionalFeatures?.noOfBathrooms || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#5A5D63]">Condition</dt>
                  <dd className="text-sm font-semibold text-[#09391C]">
                    {property.propertyCondition || property.propertyStatus || "—"}
                  </dd>
                </div>
              </dl>
              {property.description ? (
                <p className="mt-5 text-sm leading-6 text-[#24272C]">{property.description}</p>
              ) : null}
              {Array.isArray(property.features) && property.features.length ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {property.features.slice(0, 12).map((feature: string) => (
                    <li
                      key={feature}
                      className="rounded-full bg-[#F5F7F9] px-3 py-1 text-xs font-semibold text-[#09391C]"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={scheduleInspection}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#09391C] px-6 text-sm font-semibold text-white"
              >
                Schedule inspection
              </button>
              <p className="mt-3 text-xs text-[#5A5D63]">
                Inspection fee is waived for this insured search. You will not see practitioner phone or email on this page.
              </p>
            </div>
          </article>
        </div>
      )}
    </BuyerShell>
  );
}
