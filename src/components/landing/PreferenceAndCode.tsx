"use client";

import { Mic } from "lucide-react";
import { DarkCta, FadeIn, LandingSection, PrimaryCta, SectionHeading, SectionText } from "./primitives";
import PropertyCodeLookup from "./PropertyCodeLookup";

export default function PreferenceAndCode() {
  return (
    <>
      <LandingSection id="preference" tone="mist">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <FadeIn className="lg:col-span-7">
            <SectionHeading>
              TELL US WHAT YOU&apos;RE LOOKING FOR.
            </SectionHeading>
            <SectionText className="mt-4">
              Tell Khabiteq your budget, preferred location, property type and requirements.
            </SectionText>
            <SectionText className="mt-3">
              Submit by voice or text and let the system structure your request for matching.
            </SectionText>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <DarkCta href="/preference">SUBMIT YOUR PREFERENCE</DarkCta>
              <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#09391C]/70">
                Speak or type. Your choice.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="lg:col-span-5">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_18px_50px_-28px_rgba(9,57,28,0.45)]">
              <div className="w-12 h-12 rounded-2xl bg-[#09391C] text-[#8DDB90] flex items-center justify-center mb-4">
                <Mic size={22} />
              </div>
              <h3 className="text-xl font-bold text-[#09391C]">Preference matching</h3>
              <p className="mt-2 text-sm text-[#5A5D63] leading-relaxed">
                Khabiteq is built around what you need — not around scrolling through hundreds of listings.
              </p>
            </div>
          </FadeIn>
        </div>
      </LandingSection>

      <LandingSection id="property-code" tone="dark">
        <FadeIn className="max-w-3xl">
          <SectionHeading light>
            HAVE A KHABITEQ PROPERTY CODE?
          </SectionHeading>
          <SectionText light className="mt-4">
            Seen a Khabiteq-linked property advertised on Instagram, WhatsApp, a flyer or elsewhere?
            Enter the Property Code to identify the exact property and connect it to the relevant listing professional.
          </SectionText>
          <p className="mt-3 text-sm text-[#8DDB90] font-semibold tracking-wide">Example: KH-VGR-08421</p>
          <div className="mt-7">
            <PropertyCodeLookup />
          </div>
          <p className="mt-5 text-sm text-white/70 max-w-xl">
            The Property Code is an identification and traceability mechanism. It does not turn Khabiteq into a conventional property marketplace.
          </p>
          <div className="mt-4">
            <PrimaryCta href="/property-code">Learn about Property Codes</PrimaryCta>
          </div>
        </FadeIn>
      </LandingSection>
    </>
  );
}
