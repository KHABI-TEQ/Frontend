"use client";

export type SearchInsuranceInfo = {
  optedIn?: boolean;
  status?: "none" | "pending_payment" | "active" | "expired" | "claimed" | string;
};

export function searchInsuranceLabel(si?: SearchInsuranceInfo | null): string | null {
  if (!si?.optedIn) return null;
  if (si.status === "pending_payment") return "Insurance pending";
  if (si.status === "active" || si.status === "claimed") return "Insured";
  return null;
}

export default function InsuredPreferenceTag({
  searchInsurance,
  className = "",
}: {
  searchInsurance?: SearchInsuranceInfo | null;
  className?: string;
}) {
  const label = searchInsuranceLabel(searchInsurance);
  if (!label) return null;
  const pending = label === "Insurance pending";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        pending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
      } ${className}`}
    >
      {label}
    </span>
  );
}
