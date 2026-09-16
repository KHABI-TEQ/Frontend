"use client";

import MarketingShell from "@/components/landing/MarketingShell";
import PropertyCodeLookup from "@/components/landing/PropertyCodeLookup";

export default function PropertyCodePage() {
  return (
    <MarketingShell
      eyebrow="Identification & traceability"
      title="Have a Khabiteq Property Code?"
      intro="Every eligible Khabiteq listing has a unique Property Code. Enter it to identify the exact property and the relevant listing professional."
    >
      <PropertyCodeLookup tone="light" />
      <section className="rounded-2xl bg-[#F5F7F9] p-6 space-y-3">
        <h2 className="text-xl font-bold text-[#09391C]">How it works</h2>
        <p className="text-[#5A5D63] leading-relaxed">
          Example: Vanny Global Realty advertises <span className="font-semibold text-[#09391C]">KH-VGR-08421</span>.
          You enter that code. Khabiteq identifies the exact property, the listing professional and, where available, their Practitioner Page.
        </p>
        <p className="text-[#5A5D63] leading-relaxed">
          If you submit a property preference with that code, the system can associate your request with that property and return it as a direct or priority match where applicable.
        </p>
        <p className="text-sm text-[#5A5D63]">
          The Property Code is an identification and traceability mechanism. It does not turn Khabiteq into a conventional property marketplace.
        </p>
      </section>
    </MarketingShell>
  );
}
