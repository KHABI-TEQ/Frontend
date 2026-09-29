"use client";

import Image from "next/image";
import type { ReactNode } from "react";
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
  propertyDetails?: {
    title?: string | null;
    listingType?: string | null;
    address?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parking?: number | null;
    landSize?: string | null;
    listedAt?: string | null;
    imageUrl?: string | null;
  } | null;
  journey?: Array<{ step: string; title: string; date: string; notApplicable?: boolean }>;
  participatingProfessionals?: Array<{
    name: string;
    category: string;
    licenceNumber?: string | null;
    verificationStatus?: string | null;
    practitionerPageUrl?: string | null;
  }>;
  parties?: Array<{ role: string; displayName: string }>;
  documentTrail?: Array<{ type: string; status: string }>;
  paymentRecord?: Array<{ description: string; reference?: string | null; amount?: number; date?: string | null; status: string }>;
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

function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#E5EBE7] bg-white p-4 sm:p-5 ${className}`}>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#102E20]">
        <span className="h-4 w-1 rounded-full bg-[#0B5D3B]" />{title}
      </h2>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#EEF1EF] py-2 last:border-0">
      <span className="text-[11px] text-[#6B7280]">{label}</span>
      <span className="text-right text-xs font-semibold text-[#172B22]">{value || "—"}</span>
    </div>
  );
}

export default function TransactionCertificateView({ data, compact = false }: { data: CertificateViewData; compact?: boolean }) {
  const verifyUrl = data.verifyUrl || "";
  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`
    : "";

  return (
    <article className="relative mx-auto max-w-6xl overflow-hidden rounded-[26px] border-2 border-[#238357] bg-[#FBFDFC] shadow-xl print:rounded-none print:shadow-none">
      <div className="pointer-events-none absolute inset-[5px] rounded-[21px] border border-[#CFE7D8]" />
      <div className={`relative px-4 sm:px-7 ${compact ? "py-5" : "py-7 sm:px-8 sm:py-8"}`}>
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/khabiteq_logo_nobg.png" alt="Khabiteq" width={214} height={62} className="h-auto w-40 sm:w-52" priority />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#D9F7E3] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#075B2A]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#087A35] text-white">✓</span>
            Certificate status&nbsp; {data.certificateStatus || (data.valid ? "ACTIVE" : "RECORDED")}
          </div>
        </header>

        <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_270px] sm:items-end">
          <div>
            <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-tight text-[#073B25] sm:text-4xl">
              {data.title || "KHABITEQ TRANSACTION REGISTRATION CERTIFICATE"}
            </h1>
            <p className="mt-2 text-[10px] font-semibold tracking-[0.32em] text-[#66756C] sm:text-xs">{data.subtitle || "DIGITAL RECORD OF TRANSACTION JOURNEY"}</p>
          </div>
          <div className="rounded-2xl bg-[#EAF6EF] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">Transaction reference</p>
            <p className="mt-1 text-xl font-extrabold text-[#122C20]">{data.transactionReference || "REFERENCE PENDING"}</p>
            <p className="mt-1 text-xs text-[#59665E]">Property Code: <strong className="text-[#173B2A]">{data.propertyCode || "—"}</strong></p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E3EBE6] bg-white sm:grid-cols-4">
          {[
            ["Property Type", data.propertyType],
            ["Transaction Type", data.transactionType],
            ["Property Location", data.propertyLocation],
            ["Registration Date", data.registrationDate],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-r border-[#E9EFEB] px-3 py-3 last:border-r-0 sm:border-b-0">
              <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">{label}</p>
              <p className="mt-1 text-xs font-bold text-[#142B20]">{value || "—"}</p>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Section title="Transaction Journey" className="bg-[#EFF9F2]">
            {data.journey?.length ? (
              <ol className="space-y-1">
                {data.journey.map((item, index) => (
                  <li key={`${item.step}-${item.title}`} className="relative flex gap-3 pb-3 last:pb-0">
                    {index !== data.journey!.length - 1 ? <span className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-px bg-[#82C69A]" /> : null}
                    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#087A35] text-[10px] font-bold text-white">{item.step}</span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-extrabold uppercase leading-snug text-[#1B2C23]">{item.title}</p>
                        <span className="rounded-full bg-[#D6F5DF] px-2 py-0.5 text-[9px] font-bold text-[#16713B]">{item.notApplicable ? "Not applicable" : "Completed"}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#68746D]">{item.notApplicable ? "Not applicable" : item.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="text-xs text-[#69756D]">No journey events have been recorded yet.</p>}
          </Section>

          <div className="space-y-4">
            <Section title="Property Details">
              <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                {data.propertyDetails?.imageUrl ? (
                  // Public listing image is part of the record; alt text uses the property's identifying details.
                  <img src={data.propertyDetails.imageUrl} alt={data.propertyDetails.title || "Registered property"} className="h-32 w-full rounded-xl object-cover sm:h-full" />
                ) : <div className="flex h-28 items-center justify-center rounded-xl bg-[#EEF4F0] text-xs text-[#758078]">Property image unavailable</div>}
                <div>
                  <DetailRow label="Property Code" value={data.propertyCode} />
                  <DetailRow label="Property Type" value={data.propertyType} />
                  <DetailRow label="Listing Type" value={data.propertyDetails?.listingType} />
                  <DetailRow label="Location" value={data.propertyDetails?.address || data.propertyLocation} />
                  <DetailRow label="Bedrooms" value={data.propertyDetails?.bedrooms} />
                  <DetailRow label="Bathrooms" value={data.propertyDetails?.bathrooms} />
                  <DetailRow label="Parking" value={data.propertyDetails?.parking} />
                  <DetailRow label="Land Size" value={data.propertyDetails?.landSize} />
                  <DetailRow label="Listed on Khabiteq" value={data.propertyDetails?.listedAt} />
                </div>
              </div>
            </Section>

            {data.parties?.length ? <Section title="Transaction Parties">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.parties.map((party) => <div key={`${party.role}-${party.displayName}`} className="rounded-xl bg-[#F5F8F6] p-3"><p className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">{party.role}</p><p className="mt-1 text-xs font-bold text-[#153727]">{party.displayName}</p></div>)}
              </div>
            </Section> : null}

            {data.participatingProfessionals?.length || data.dueDiligence?.length ? <Section title="Professionals Engaged">
              <div className="space-y-2">
                {data.participatingProfessionals?.map((pro) => <div key={`${pro.category}-${pro.name}`} className="flex items-start gap-3 rounded-xl bg-[#F5F8F6] p-3"><span className="mt-1 h-7 w-7 rounded-full bg-[#DDF2E4]" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#153727]">{pro.category} · {pro.name}</p><p className="mt-1 text-[10px] text-[#69756D]">{[pro.licenceNumber ? `Licence No: ${pro.licenceNumber}` : "", pro.verificationStatus].filter(Boolean).join(" · ")}</p></div><span className="rounded-full bg-[#D6F5DF] px-2 py-1 text-[9px] font-bold text-[#16713B]">Completed</span></div>)}
                {data.dueDiligence?.map((item) => <div key={`${item.label}-${item.status}`} className="rounded-xl bg-[#F5F8F6] p-3"><p className="text-xs font-bold text-[#153727]">{item.label}</p><p className="mt-1 text-[10px] text-[#69756D]">{item.professionalName || item.status}{item.engagedAt ? ` · ${item.engagedAt}` : ""}</p></div>)}
              </div>
            </Section> : null}

            {data.documentTrail?.length ? <Section title="Document Trail">
              <div className="grid grid-cols-[1fr_auto] gap-x-3 text-[10px]">
                {data.documentTrail.map((item) => <div key={item.type} className="contents"><span className="border-b border-[#EDF1EE] py-2 text-[#4D5A52]">{item.type}</span><span className="border-b border-[#EDF1EE] py-2 font-semibold text-[#14713B]">{item.status}</span></div>)}
              </div>
            </Section> : null}

            {data.paymentRecord?.length ? <Section title="Payment Record">
              <div className="space-y-2">
                {data.paymentRecord.map((item) => <div key={`${item.description}-${item.reference || ""}`} className="grid grid-cols-[1fr_auto] gap-2 border-b border-[#EDF1EE] pb-2 text-[10px] last:border-0"><div><p className="font-semibold text-[#27372D]">{item.description}</p><p className="mt-0.5 text-[#69756D]">{item.reference || "—"} · {item.date || "—"}</p></div><div className="text-right"><p className="font-bold text-[#173B2A]">{item.amount != null ? `₦${item.amount.toLocaleString("en-NG")}` : "—"}</p><p className="text-[#14713B]">{item.status}</p></div></div>)}
              </div>
            </Section> : null}
          </div>
        </div>

        <footer className="mt-4 grid gap-4 rounded-2xl border border-[#E5EBE7] bg-white p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="flex items-center gap-3">
            {qrSrc ? <img src={qrSrc} alt="Verify this certificate" className="h-20 w-20 border border-[#E5E7EB]" /> : null}
            <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#153727]">Verify this certificate</p><p className="mt-1 max-w-sm break-all text-[9px] text-[#58645D]">Scan the QR code or visit the public record on Khabiteq.</p>{verifyUrl ? <p className="mt-1 break-all text-[9px] font-medium text-blue-800">{verifyUrl}</p> : null}</div>
          </div>
          <div className="h-px bg-[#E5EBE7] sm:h-14 sm:w-px" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[9px] uppercase tracking-wide text-[#6B7280]">
            <span>Issued date</span><strong className="text-[#26372D]">{data.issuedAt || data.registrationDate || "—"}</strong>
            <span>Last updated</span><strong className="text-[#26372D]">{data.lastUpdated || "—"}</strong>
            <span>Version</span><strong className="text-[#26372D]">{data.certificateVersion ? `${data.certificateVersion}.0` : "1.0"}</strong>
          </div>
        </footer>
        <p className="mt-3 text-[8px] leading-relaxed text-[#68746D]">{data.disclaimer || CERTIFICATE_DISCLAIMER}</p>
        <div className="mt-3 flex justify-end"><Image src="/khabiteq_logo_nobg.png" alt="Khabiteq" width={142} height={42} className="h-auto w-32" /></div>
      </div>
    </article>
  );
}
