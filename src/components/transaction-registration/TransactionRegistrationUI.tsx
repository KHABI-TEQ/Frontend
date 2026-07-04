import React from "react";

const FEE_BAND_VISUAL = [
  { stripe: "#10b981", chip: "bg-emerald-100 text-emerald-800 border-emerald-200", row: "bg-emerald-50/60" },
  { stripe: "#f59e0b", chip: "bg-amber-100 text-amber-900 border-amber-200", row: "bg-amber-50/50" },
  { stripe: "#8b5cf6", chip: "bg-violet-100 text-violet-900 border-violet-200", row: "bg-violet-50/50" },
  { stripe: "#ec4899", chip: "bg-pink-100 text-pink-900 border-pink-200", row: "bg-pink-50/50" },
  { stripe: "#0ea5e9", chip: "bg-sky-100 text-sky-900 border-sky-200", row: "bg-sky-50/50" },
];

export function FeeBandTable({
  bands,
  formatNaira,
}: {
  bands: { label: string; feeNaira: number }[];
  formatNaira: (n?: number | null) => string;
}) {
  return (
    <div className="space-y-3">
      {bands.map((b, j) => {
        const vis = FEE_BAND_VISUAL[j] ?? FEE_BAND_VISUAL[0];
        return (
          <div
            key={b.label}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-100 px-4 py-4 ${vis.row}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 self-stretch rounded-full shrink-0 min-h-[2.5rem]" style={{ backgroundColor: vis.stripe }} />
              <div>
                <p className="font-semibold text-gray-900">{b.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">Based on declared transaction value</p>
              </div>
            </div>
            <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-bold ${vis.chip}`}>
              {b.feeNaira === 0 ? "No fee" : formatNaira(b.feeNaira)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
