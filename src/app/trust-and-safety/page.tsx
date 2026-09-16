import MarketingShell from "@/components/landing/MarketingShell";
import Link from "next/link";

export const metadata = {
  title: "Trust & Safety | Khabiteq",
  description:
    "Khabiteq is built around trust and transparency: professional connection, inspection, transaction records and reporting pathways.",
};

const claims = [
  "Secure platform",
  "Protected user data",
  "Professional verification where applicable",
  "Secure payment infrastructure",
  "Transaction records",
  "Transparent processes",
];

export default function TrustAndSafetyPage() {
  return (
    <MarketingShell
      eyebrow="Trust & safety"
      title="Built around trust and transparency."
      intro="Khabiteq provides infrastructure for discovery, matching, professional connection, inspection booking, transaction registration, digital records and reporting pathways. Licensed professionals provide their own services."
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {claims.map((claim) => (
          <li key={claim} className="rounded-2xl border border-gray-100 bg-white p-4 font-medium text-[#09391C]">
            {claim}
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-[#F5F7F9] p-6">
        <h2 className="text-xl font-bold text-[#09391C]">What Khabiteq does not claim</h2>
        <p className="mt-2 text-[#5A5D63]">
          Khabiteq is not a regulator. Transaction records document activity on the platform; they do not by themselves guarantee ownership or recovery of funds. Professional verification applies where a professional has completed the relevant KYC and credential checks.
        </p>
      </div>
      <Link href="/report-escalate" className="inline-flex min-h-12 items-center rounded-full bg-[#09391C] px-6 font-semibold text-white">
        Report / Escalate
      </Link>
    </MarketingShell>
  );
}
