import MarketingShell from "@/components/landing/MarketingShell";
import Link from "next/link";

export const metadata = {
  title: "Due Diligence | Khabiteq",
  description:
    "Connect with a lawyer, surveyor or valuer for professional due diligence. Khabiteq provides the connection and platform infrastructure — professionals deliver the service.",
};

const cards = [
  {
    title: "Legal due diligence",
    body: "Connect with a property lawyer for relevant legal and document review. The lawyer provides the service directly.",
  },
  {
    title: "Survey / site services",
    body: "Connect with a licensed surveyor for relevant survey and site-related services.",
  },
  {
    title: "Valuation",
    body: "Connect with a qualified valuer when an independent valuation is required.",
  },
];

export default function DueDiligencePage() {
  return (
    <MarketingShell
      eyebrow="Professional checks"
      title="Don't just find a property. Do your due diligence."
      intro="When you need professional checks, connect directly with the right qualified professional for the service you require. Khabiteq does not perform property document verification itself."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#09391C]">What due diligence is</h2>
        <p className="text-[#5A5D63] leading-relaxed">
          Due diligence is the professional work that helps you understand the property, the documents, the site and the value before you commit. It is carried out by the relevant licensed or qualified professional — not by Khabiteq as a substitute for that professional.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#09391C]">Why it matters</h2>
        <p className="text-[#5A5D63] leading-relaxed">
          Real estate transactions involve significant money, important documents and serious decisions. Connecting with the right professional before you pay is part of a structured transaction journey.
        </p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5">
            <h3 className="font-bold text-[#09391C]">{card.title}</h3>
            <p className="mt-2 text-sm text-[#5A5D63]">{card.body}</p>
          </article>
        ))}
      </div>
      <section className="rounded-2xl bg-[#F5F7F9] p-6 space-y-3">
        <h2 className="text-xl font-bold text-[#09391C]">How to request a service</h2>
        <p className="text-[#5A5D63]">
          Choose the professional category, review their Practitioner Page, and request the relevant service through Khabiteq. Pricing is set by the professional where applicable. Documents a professional may review can include title documents and related papers — the professional decides what is required for the work.
        </p>
        <p className="text-sm text-[#5A5D63]">
          The service is delivered directly by the relevant professional. Khabiteq provides the connection and platform infrastructure.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/for-professionals" className="inline-flex min-h-12 items-center rounded-full bg-[#09391C] px-6 font-semibold text-white">
          Find a professional
        </Link>
        <Link href="/document-verification" className="inline-flex min-h-12 items-center rounded-full border border-[#09391C]/20 px-6 font-semibold text-[#09391C]">
          Request legal review
        </Link>
      </div>
    </MarketingShell>
  );
}
