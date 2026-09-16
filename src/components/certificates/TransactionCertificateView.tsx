"use client";

import { CERTIFICATE_DISCLAIMER } from "@/data/certificate-disclaimer";

export type CertificateViewData = {
  title?: string;
  subtitle?: string;
  transactionReference?: string | null;
  propertyCode?: string | null;
  propertyType?: string | null;
  propertyLocation?: string | null;
  transactionType?: string | null;
  transactionStatus?: string | null;
  certificateStatus?: string | null;
  certificateVersion?: number | null;
  registrationDate?: string | null;
  issuedAt?: string | null;
  lastUpdated?: string | null;
  valid?: boolean;
  verifyUrl?: string | null;
  journey?: Array<{ step: string; title: string; date: string; notApplicable?: boolean }>;
  participatingProfessionals?: Array<{
    name: string;
    category: string;
    licenceNumber?: string | null;
    verificationStatus?: string | null;
    practitionerPageUrl?: string | null;
  }>;
  parties?: Array<{ role: string; displayName: string }>;
  dueDiligence?: Array<{
    label: string;
    professionalName?: string | null;
    engagedAt?: string | null;
    status: string;
  }>;
  insurance?: {
    provider: string;
    policyReference?: string | null;
    status?: string | null;
    date?: string | null;
  } | null;
  disclaimer?: string;
};

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-[#E8EEE9]">
      <p className="text-[11px] tracking-[0.12em] uppercase text-[#6B7280]">{label}</p>
      <p className="text-sm font-semibold text-[#09391C]">{value || "—"}</p>
    </div>
  );
}

export default function TransactionCertificateView({
  data,
  compact = false,
}: {
  data: CertificateViewData;
  compact?: boolean;
}) {
  const verifyUrl = data.verifyUrl || "";
  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}`
    : "";

  return (
    <article className="bg-white border-[3px] border-[#09391C] shadow-xl max-w-3xl mx-auto relative">
      <div className="absolute inset-1 border border-[#C9A227] pointer-events-none" />
      <div className={`px-6 sm:px-10 ${compact ? "py-8" : "py-12"}`}>
        <header className="text-center mb-8">
          <p className="text-xs tracking-[0.35em] text-[#09391C] font-semibold">KHABITEQ</p>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold text-[#09391C] leading-tight">
            {data.title || "KHABITEQ TRANSACTION REGISTRATION CERTIFICATE"}
          </h1>
          <p className="mt-2 text-[11px] tracking-[0.22em] text-[#6B7280]">
            {data.subtitle || "DIGITAL RECORD OF TRANSACTION JOURNEY"}
          </p>
          <div className="mt-5 inline-flex flex-col items-center gap-1">
            <p className="text-sm font-bold text-[#09391C]">
              {data.transactionReference || "REFERENCE PENDING"}
            </p>
            {data.propertyCode ? (
              <p className="text-xs text-[#4B5563]">Property Code {data.propertyCode}</p>
            ) : null}
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-2">
            Transaction Summary
          </h2>
          <MetaRow label="Transaction Reference" value={data.transactionReference} />
          <MetaRow label="Property Code" value={data.propertyCode} />
          <MetaRow label="Property Type" value={data.propertyType} />
          <MetaRow label="Property Location" value={data.propertyLocation} />
          <MetaRow label="Transaction Type" value={data.transactionType} />
          <MetaRow label="Transaction Status" value={data.transactionStatus} />
          <MetaRow label="Certificate Status" value={data.certificateStatus} />
          <MetaRow label="Registration Date" value={data.registrationDate} />
          <MetaRow
            label="Version"
            value={data.certificateVersion ? `${data.certificateVersion}.0` : "1.0"}
          />
        </section>

        {data.journey && data.journey.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-4">
              Transaction Journey
            </h2>
            <ol className="space-y-3">
              {data.journey.map((item) => (
                <li key={`${item.step}-${item.title}`} className="flex gap-4">
                  <span className="text-xs font-bold text-[#09391C] w-8 shrink-0">{item.step}</span>
                  <div className="flex-1 border-l border-[#D1D5DB] pl-4">
                    <p className="text-sm font-semibold text-[#111827] uppercase tracking-wide">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {item.notApplicable ? "NOT APPLICABLE" : item.date}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {data.participatingProfessionals && data.participatingProfessionals.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-3">
              Participating Professionals
            </h2>
            <div className="space-y-3">
              {data.participatingProfessionals.map((pro) => (
                <div key={`${pro.category}-${pro.name}`} className="bg-[#F8FAF8] border border-[#E5E7EB] p-3">
                  <p className="text-sm font-semibold text-[#09391C]">{pro.name}</p>
                  <p className="text-xs text-[#4B5563] mt-1">
                    {[pro.category, pro.licenceNumber, pro.verificationStatus].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-2">
                    Participation recorded on Khabiteq. This does not guarantee professional conduct or opinion.
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.parties && data.parties.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-3">
              Transaction Parties
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.parties.map((party) => (
                <div key={`${party.role}-${party.displayName}`} className="border border-[#E5E7EB] p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">{party.role}</p>
                  <p className="text-sm font-semibold text-[#09391C] mt-1">{party.displayName}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.dueDiligence && data.dueDiligence.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-3">
              Due Diligence Record
            </h2>
            <div className="space-y-2">
              {data.dueDiligence.map((row) => (
                <div key={`${row.label}-${row.status}`} className="text-sm">
                  <p className="font-semibold text-[#09391C]">{row.label}</p>
                  <p className="text-xs text-[#4B5563]">
                    {row.professionalName
                      ? `${row.status === "Completed" ? "Legal Due Diligence Completed by" : "Engaged"} ${row.professionalName}`
                      : row.status === "Not Applicable"
                        ? "Not Applicable"
                        : row.status}
                    {row.engagedAt ? ` · ${row.engagedAt}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.insurance ? (
          <section className="mb-8">
            <h2 className="text-[11px] tracking-[0.16em] uppercase text-[#09391C] font-bold mb-3">
              Insurance
            </h2>
            <p className="text-sm text-[#111827]">
              Provider: {data.insurance.provider}
            </p>
            {data.insurance.policyReference ? (
              <p className="text-sm text-[#4B5563]">Policy Reference: {data.insurance.policyReference}</p>
            ) : null}
            <p className="text-xs text-[#6B7280] mt-2">
              Insurance is provided by the named insurer, not by Khabiteq. Coverage remains subject to the insurer&apos;s policy.
            </p>
          </section>
        ) : null}

        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-10">
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase font-bold text-[#09391C]">
              Verify This Certificate
            </p>
            {verifyUrl ? <p className="text-xs text-[#4B5563] mt-1 break-all">{verifyUrl}</p> : null}
            <p className="text-xs text-[#6B7280] mt-2">
              Issued {data.issuedAt || data.registrationDate || "—"}
              {data.lastUpdated ? ` · Last updated ${data.lastUpdated}` : ""}
            </p>
          </div>
          {qrSrc ? (
            <img src={qrSrc} alt="Certificate verification QR code" className="w-24 h-24 border border-[#E5E7EB]" />
          ) : null}
        </section>

        <p className="mt-10 text-[10px] leading-relaxed text-[#6B7280]">
          {data.disclaimer || CERTIFICATE_DISCLAIMER}
        </p>
      </div>
    </article>
  );
}
