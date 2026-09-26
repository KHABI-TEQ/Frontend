"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

const BLOCKED = new Set(["cancelled", "agent_rejected", "transaction_failed"]);

export type InspectionBookingOption = {
  _id: string;
  status?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  propertyId?: {
    _id?: string;
    title?: string;
    propertyName?: string;
    location?: { area?: string; city?: string; state?: string };
  };
};

export function inspectionBookingLabel(row: InspectionBookingOption): string {
  const property = row.propertyId;
  const title =
    property?.title ||
    property?.propertyName ||
    [property?.location?.area || property?.location?.city, property?.location?.state]
      .filter(Boolean)
      .join(", ") ||
    "Inspected property";
  const date = row.inspectionDate
    ? new Date(row.inspectionDate).toLocaleDateString()
    : "Date pending";
  const time = row.inspectionTime ? ` · ${row.inspectionTime}` : "";
  return `${title} · ${date}${time}`;
}

function queryInspectionId(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("inspectionId") || "";
}

function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export default function InspectionBookingSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (inspectionId: string) => void;
}) {
  const [bookings, setBookings] = useState<InspectionBookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const loggedIn = Boolean(getBuyerToken());

  useEffect(() => {
    const preset = queryInspectionId();
    if (preset && !value) onChange(preset);
    if (!getBuyerToken()) {
      setLoading(false);
      return;
    }
    buyerFetch<{ inspections: InspectionBookingOption[] }>("/buyer/auth/me/inspections").then(
      (res) => {
        const rows = (res.data?.inspections || []).filter(
          (row) => !BLOCKED.has(String(row.status || ""))
        );
        setBookings(rows);
        const next = value || preset;
        if (next && rows.some((row) => String(row._id) === next)) {
          onChange(next);
        }
        setLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => bookings.find((row) => String(row._id) === value) || null,
    [bookings, value]
  );

  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-[#09391C]">
        <p className="font-semibold">Link an inspected property</p>
        <p className="mt-1 text-[#5A5D63]">
          Sign in to choose the property from your past inspection bookings. This is required so
          due diligence can be matched to that search for claims.
        </p>
        <Link
          href={`/buyer/login?next=${encodeURIComponent(currentPath())}`}
          className="mt-3 inline-flex rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-[#5A5D63]">Loading your inspected properties…</p>;
  }

  if (!bookings.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-[#09391C]">
        <p className="font-semibold">No inspection booking found</p>
        <p className="mt-1 text-[#5A5D63]">
          Due diligence must be linked to a property you have already booked for inspection.
        </p>
        <Link
          href="/buyer/inspections"
          className="mt-3 inline-flex text-sm font-semibold text-[#0F766E]"
        >
          View my inspections →
        </Link>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#09391C] mb-1">
        Link inspected property *
      </span>
      <p className="text-xs text-[#5A5D63] mb-2">
        Choose the property from your past inspection bookings. Claims and transaction
        registration use this link.
      </p>
      <select
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="">Select an inspected property…</option>
        {bookings.map((row) => (
          <option key={row._id} value={row._id}>
            {inspectionBookingLabel(row)}
          </option>
        ))}
      </select>
      {selected?.propertyId?._id ? (
        <Link
          href={`/property/buy/${selected.propertyId._id}`}
          className="mt-2 inline-block text-xs font-semibold text-[#0F766E]"
        >
          View selected property →
        </Link>
      ) : null}
    </label>
  );
}
