"use client";

import React from "react";
import { usePostPropertyContext } from "@/context/post-property-context";
import { CheckCircle } from "lucide-react";

/** Human-readable labels for API data keys */
const DATA_LABELS: Record<string, string> = {
  propertyType: "Property type",
  propertyCategory: "Property category",
  propertyCondition: "Condition",
  typeOfBuilding: "Type of building",
  price: "Price (₦)",
  description: "Description",
  additionalInfo: "Additional info",
  state: "State",
  localGovernment: "Local government",
  area: "Area",
  streetAddress: "Street address",
  noOfBedroom: "Bedrooms",
  noOfBathroom: "Bathrooms",
  noOfToilet: "Toilets",
  noOfCarPark: "Parking spaces",
  features: "Features",
  location: "Location",
  landSize: "Land size",
  measurementType: "Measurement type",
};

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "object" && !Array.isArray(value)) {
    const loc = value as Record<string, unknown>;
    const parts = [loc.state, loc.localGovernment, loc.area].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function flattenData(data: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const out: { key: string; label: string; value: string }[] = [];
  const loc = data.location as Record<string, unknown> | undefined;
  if (loc) {
    if (loc.state) out.push({ key: "state", label: "State", value: String(loc.state) });
    if (loc.localGovernment) out.push({ key: "localGovernment", label: "Local government", value: String(loc.localGovernment) });
    if (loc.area) out.push({ key: "area", label: "Area", value: String(loc.area) });
    if (loc.streetAddress) out.push({ key: "streetAddress", label: "Street address", value: String(loc.streetAddress) });
  }
  const add = data.additionalFeatures as Record<string, unknown> | undefined;
  if (add) {
    if (add.noOfBedroom != null) out.push({ key: "noOfBedroom", label: "Bedrooms", value: String(add.noOfBedroom) });
    if (add.noOfBathroom != null) out.push({ key: "noOfBathroom", label: "Bathrooms", value: String(add.noOfBathroom) });
    if (add.noOfToilet != null) out.push({ key: "noOfToilet", label: "Toilets", value: String(add.noOfToilet) });
    if (add.noOfCarPark != null) out.push({ key: "noOfCarPark", label: "Parking spaces", value: String(add.noOfCarPark) });
  }
  const landSizeObj = data.landSize as { measurementType?: string; size?: number } | undefined;
  if (landSizeObj && (landSizeObj.measurementType || landSizeObj.size != null)) {
    out.push({ key: "landSize", label: "Land size", value: `${landSizeObj.size ?? ""} ${landSizeObj.measurementType ?? ""}`.trim() });
  }
  const docs = data.documents ?? data.docOnProperty;
  if (Array.isArray(docs) && docs.length > 0) {
    const names = docs.map((d) => (typeof d === "string" ? d : (d as { docName?: string })?.docName)).filter(Boolean);
    if (names.length) out.push({ key: "documents", label: "Documents / title", value: names.join(", ") });
  }
  for (const [key, val] of Object.entries(data)) {
    if (key === "location" || key === "additionalFeatures" || key === "landSize" || key === "documents" || key === "docOnProperty") continue;
    if (val === undefined || val === null) continue;
    const label = DATA_LABELS[key] || key;
    out.push({ key, label, value: formatValue(val) });
  }
  return out;
}

interface PropertyAiDataSummaryProps {
  /** Called when user clicks "Continue to image upload" — caller should merge data and set step */
  onContinueToImageUpload: () => void;
}

export default function PropertyAiDataSummary({ onContinueToImageUpload }: PropertyAiDataSummaryProps) {
  const { aiCollectedData } = usePostPropertyContext();
  const data = aiCollectedData || {};
  const rows = flattenData(data);

  return (
    <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[#09391C] mb-2 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-[#8DDB90]" />
        Property data (from your description)
      </h2>
      <p className="text-sm text-[#5A5D63] mb-6">
        Review the details below. Then continue to upload images and complete the process.
      </p>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-[#09391C]">Field</th>
              <th className="text-left py-3 px-4 font-medium text-[#09391C]">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-6 px-4 text-[#5A5D63] text-center">
                  No data to display. Add more in the conversation.
                </td>
              </tr>
            ) : (
              rows.map(({ key, label, value }) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-[#5A5D63]">{label}</td>
                  <td className="py-3 px-4 text-[#09391C] font-medium">{value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={onContinueToImageUpload}
        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] font-semibold transition-colors"
      >
        Continue to image upload
      </button>
    </div>
  );
}

export { flattenData, DATA_LABELS };
