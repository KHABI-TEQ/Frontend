"use client";

import Link from "next/link";
import { Briefcase, Building2, Compass, Landmark, Scale } from "lucide-react";
import { DarkCta, FadeIn, LandingSection, OutlineCta, PrimaryCta, SectionHeading, SectionText } from "./primitives";

const professionals = [
  { label: "Agents", href: "/for-professionals?role=agent", icon: Briefcase },
  { label: "Lawyers", href: "/for-professionals?role=lawyer", icon: Scale },
  { label: "Surveyors", href: "/for-professionals?role=surveyor", icon: Compass },
  { label: "Valuers", href: "/for-professionals?role=valuer", icon: Landmark },
  { label: "Developers", href: "/for-owners-developers", icon: Building2 },
];

const agentFeatures = [
  "Practitioner Page",
  "Professional identity",
  "Property listings",
  "Property preference matching",
  "Inspection opportunities",
  "Relevant transaction activity",
];

const ownerFeatures = [
  "Submit property",
  "Complete required KYC",
  "Create listing",
  "Receive professional requests where applicable",
  "Approve who can market your opportunity",
  "Set commission terms",
  "Track activity",
];

export default function AudienceAndProfessionals() {
  return (
      <LandingSection id="professionals" tone="mist">
        <FadeIn className="mb-8 max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#0B423D]/60 mb-3">
            Your professional identity on Khabiteq
          </p>
          <SectionHeading>THE PROFESSIONAL NETWORK.</SectionHeading>
          <SectionText className="mt-4">
            Khabiteq connects property seekers with licensed and qualified professionals. Those professionals provide their services directly — Khabiteq provides the discovery, matching and workflow.
          </SectionText>
        </FadeIn>

        <div className="flex flex-wrap gap-3 mb-10">
          {professionals.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 text-sm font-semibold text-[#09391C] hover:border-[#8DDB90]"
              >
                <Icon size={16} className="text-[#8DDB90]" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FadeIn>
            <article className="h-full rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-[#09391C]">TURN PROPERTY DEMAND INTO OPPORTUNITY.</h3>
              <p className="mt-3 text-[#5A5D63] leading-relaxed">
                Property seekers submit what they are looking for. When their requirements match what you offer, Khabiteq creates an opportunity for you to engage with relevant demand.
              </p>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {agentFeatures.map((feature) => (
                  <li key={feature} className="text-sm text-[#09391C] flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8DDB90] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <DarkCta href="/for-professionals">JOIN KHABITEQ</DarkCta>
                <OutlineCta href="/pricing">VIEW PROFESSIONAL PLANS</OutlineCta>
              </div>
            </article>
          </FadeIn>
          <FadeIn delay={0.08}>
            <article className="h-full rounded-2xl bg-[#09391C] text-white p-6 sm:p-8">
              <h3 className="text-2xl font-bold">PRESENT YOUR PROPERTY. STAY IN CONTROL.</h3>
              <p className="mt-3 text-white/85 leading-relaxed">
                Present your property or development to participating professionals and relevant property demand.
              </p>
              <ul className="mt-5 space-y-2">
                {ownerFeatures.map((feature) => (
                  <li key={feature} className="text-sm text-white/90 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8DDB90] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PrimaryCta href="/post-property">PRESENT YOUR PROPERTY</PrimaryCta>
              </div>
            </article>
          </FadeIn>
        </div>

        <FadeIn className="mt-8 rounded-2xl border border-[#8DDB90]/40 bg-white p-6 sm:p-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#09391C]">
            BUILD YOUR PROFESSIONAL PRESENCE ON KHABITEQ.
          </h3>
          <p className="mt-3 max-w-3xl text-[#5A5D63] leading-relaxed">
            Get your Practitioner Page, showcase your listings, connect with relevant property demand and access applicable transaction tools.
          </p>
          <div className="mt-6">
            <DarkCta href="/pricing">VIEW PROFESSIONAL PLANS</DarkCta>
          </div>
        </FadeIn>
      </LandingSection>
  );
}
