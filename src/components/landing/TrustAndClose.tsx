"use client";

import { FileSearch, FolderOpen, Flag, Landmark, Scale, Shield, Eye } from "lucide-react";
import {
  DarkCta,
  FadeIn,
  GhostCta,
  LandingSection,
  PrimaryCta,
  SectionHeading,
  SectionText,
} from "./primitives";

const diligence = [
  {
    title: "LEGAL DUE DILIGENCE",
    text: "Connect with a property lawyer for relevant legal and document review.",
    icon: Scale,
  },
  {
    title: "SURVEY / SITE SERVICES",
    text: "Connect with a licensed surveyor for relevant survey and site-related services.",
    icon: FileSearch,
  },
  {
    title: "VALUATION",
    text: "Connect with a qualified valuer when an independent valuation is required.",
    icon: Landmark,
  },
];

const trailItems = [
  "Property",
  "Property Code",
  "Professional",
  "Inspection",
  "Transaction registration",
  "Relevant records",
  "Transaction status",
];

const trustClaims = [
  "Secure Platform",
  "Protected User Data",
  "Professional Verification Where Applicable",
  "Secure Payment Infrastructure",
  "Transaction Records",
  "Transparent Processes",
];

export default function TrustAndClose() {
  return (
    <>
      <LandingSection id="due-diligence">
        <FadeIn className="max-w-3xl mb-8">
          <SectionHeading>
            DON&apos;T JUST FIND A PROPERTY.
            <br />
            DO YOUR DUE DILIGENCE.
          </SectionHeading>
          <SectionText className="mt-4">
            When you need professional checks, connect directly with the right qualified professional for the service you require.
          </SectionText>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diligence.map((item, index) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.title} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-gray-100 bg-white p-6">
                  <Icon className="text-[#8DDB90] mb-4" size={22} />
                  <h3 className="font-bold text-[#09391C]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#5A5D63] leading-relaxed">{item.text}</p>
                </article>
              </FadeIn>
            );
          })}
        </div>
        <FadeIn className="mt-8">
          <DarkCta href="/due-diligence">FIND A PROFESSIONAL</DarkCta>
        </FadeIn>
      </LandingSection>

      <LandingSection id="inspect" tone="mist">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FadeIn>
            <article className="h-full rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <Eye className="text-[#8DDB90] mb-4" size={24} />
              <SectionHeading className="text-3xl sm:text-4xl">SEE IT. INSPECT IT. DECIDE.</SectionHeading>
              <SectionText className="mt-4">
                Book a physical or virtual inspection through Khabiteq and coordinate with the relevant professional.
              </SectionText>
              <div className="mt-6">
                <DarkCta href="/preference">BOOK AN INSPECTION</DarkCta>
              </div>
            </article>
          </FadeIn>
          <FadeIn delay={0.08}>
            <article className="h-full rounded-2xl bg-[#09391C] text-white p-6 sm:p-8">
              <FolderOpen className="text-[#8DDB90] mb-4" size={24} />
              <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                REGISTER YOUR TRANSACTION.
                <br />
                KEEP A RECORD.
              </h3>
              <p className="mt-4 text-white/85 leading-relaxed">
                Khabiteq provides a transaction registration process for eligible transactions, creating a structured record of the transaction journey.
              </p>
              <p className="mt-3 text-sm text-[#8DDB90]">
                Where applicable, this may include a Khabiteq Transaction Registration Certificate. Khabiteq is not a regulator.
              </p>
              <div className="mt-6">
                <PrimaryCta href="/transaction-registration">LEARN ABOUT TRANSACTION REGISTRATION</PrimaryCta>
              </div>
            </article>
          </FadeIn>
        </div>
      </LandingSection>

      <LandingSection id="digital-trail">
        <FadeIn className="max-w-3xl">
          <SectionHeading>YOUR TRANSACTION SHOULD LEAVE A TRAIL.</SectionHeading>
          <SectionText className="mt-4">
            Keep a structured digital record of relevant property, professional, inspection and transaction activity carried out through Khabiteq.
          </SectionText>
          <div className="mt-6 flex flex-wrap gap-2">
            {trailItems.map((item) => (
              <span key={item} className="rounded-full bg-[#F5F7F9] px-3 py-1.5 text-sm text-[#09391C]">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-[#5A5D63] max-w-2xl">
            The digital record documents activity on Khabiteq. It does not by itself guarantee ownership or recovery of funds.
          </p>
        </FadeIn>
      </LandingSection>

      <LandingSection id="report" tone="dark">
        <FadeIn className="max-w-3xl">
          <Flag className="text-[#8DDB90] mb-4" size={24} />
          <SectionHeading light>
            SOMETHING WENT WRONG?
            <br />
            YOU SHOULD KNOW WHERE TO TURN.
          </SectionHeading>
          <SectionText light className="mt-4">
            Khabiteq provides a structured pathway for reporting concerns and escalating serious issues through the appropriate channels where applicable.
          </SectionText>
          <p className="mt-3 text-sm text-white/70">
            Report. Document. Escalate. Follow the appropriate channel. Khabiteq is not a regulator and cannot promise that every complaint will be resolved by Khabiteq.
          </p>
          <div className="mt-7">
            <PrimaryCta href="/report-escalate">REPORT / ESCALATE</PrimaryCta>
          </div>
        </FadeIn>
      </LandingSection>

      <LandingSection id="trust-strip" tone="mist">
        <FadeIn className="text-center mx-auto max-w-3xl">
          <Shield className="mx-auto text-[#8DDB90] mb-4" size={24} />
          <SectionHeading>BUILT AROUND TRUST AND TRANSPARENCY.</SectionHeading>
          <div className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-3">
            {trustClaims.map((claim) => (
              <span
                key={claim}
                className="rounded-full bg-white border border-gray-100 px-4 py-2 text-sm font-medium text-[#09391C]"
              >
                {claim}
              </span>
            ))}
          </div>
        </FadeIn>
      </LandingSection>
    </>
  );
}

export function FinalJourneyCta() {
  return (
    <LandingSection id="start" tone="green">
      <FadeIn className="text-center mx-auto max-w-3xl">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          YOUR NEXT PROPERTY DECISION
          <br />
          SHOULD BE MORE STRUCTURED.
        </h2>
        <p className="mt-5 text-lg text-white/90">
          Whether you&apos;re buying, renting, selling or providing professional services, start your real estate journey with Khabiteq.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <DarkCta href="/auth/register">START YOUR JOURNEY</DarkCta>
          <GhostCta href="/preference">SUBMIT YOUR PREFERENCE</GhostCta>
        </div>
      </FadeIn>
    </LandingSection>
  );
}
