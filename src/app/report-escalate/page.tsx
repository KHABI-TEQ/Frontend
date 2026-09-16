import MarketingShell from "@/components/landing/MarketingShell";
import Link from "next/link";

export const metadata = {
  title: "Report & Escalate | Khabiteq",
  description:
    "Report concerns and escalate serious issues through the appropriate Khabiteq pathway. Khabiteq is not a regulator.",
};

const steps = [
  ["Report", "Tell us what happened, with as much factual detail as you can."],
  ["Document", "Keep records of the property, professional, Property Code, inspection and transaction activity where available."],
  ["Escalate", "Serious issues can be directed through the appropriate channel where applicable."],
  ["Follow the channel", "Khabiteq cannot promise that every complaint will be resolved by Khabiteq, and Khabiteq is not a regulator."],
];

export default function ReportEscalatePage() {
  return (
    <MarketingShell
      eyebrow="Trust pathway"
      title="Something went wrong? You should know where to turn."
      intro="Khabiteq provides a structured pathway for reporting concerns and escalating serious issues through the appropriate channels where applicable."
    >
      <ol className="space-y-3">
        {steps.map(([title, text]) => (
          <li key={title} className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="font-bold text-[#09391C]">{title}</h2>
            <p className="mt-1 text-[#5A5D63]">{text}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Link href="/contact-us" className="inline-flex min-h-12 items-center rounded-full bg-[#09391C] px-6 font-semibold text-white">
          Report / Escalate
        </Link>
        <Link href="/trust-and-safety" className="inline-flex min-h-12 items-center rounded-full border border-[#09391C]/20 px-6 font-semibold text-[#09391C]">
          Trust & Safety
        </Link>
      </div>
    </MarketingShell>
  );
}
