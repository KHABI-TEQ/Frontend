"use client";

import {
  Eye,
  FileSearch,
  Flag,
  FolderOpen,
  Handshake,
  Mic,
  Search,
  Stamp,
  Users,
} from "lucide-react";
import { DarkCta, FadeIn, LandingSection, OutlineCta, SectionHeading, SectionText } from "./primitives";

const stages = [
  { n: "01", title: "TELL US WHAT YOU NEED", text: "Submit your property preference by voice or text.", icon: Mic },
  { n: "02", title: "GET MATCHED", text: "Receive relevant property opportunities based on your requirements.", icon: Search },
  { n: "03", title: "CONNECT WITH THE RIGHT PROFESSIONAL", text: "Engage with the relevant agent, developer or other professional.", icon: Users },
  { n: "04", title: "DO YOUR DUE DILIGENCE", text: "Connect directly with the appropriate lawyer, surveyor, valuer or other qualified professional.", icon: FileSearch },
  { n: "05", title: "INSPECT", text: "Book a physical or virtual inspection where applicable.", icon: Eye },
  { n: "06", title: "TRANSACT", text: "Proceed with the relevant parties.", icon: Handshake },
  { n: "07", title: "REGISTER", text: "Register eligible transactions through Khabiteq and create a structured transaction record.", icon: Stamp },
  { n: "08", title: "KEEP YOUR DIGITAL TRAIL", text: "Maintain relevant records of your transaction journey.", icon: FolderOpen },
  { n: "09", title: "REPORT & ESCALATE", text: "Access the applicable reporting and escalation pathway if a serious issue arises.", icon: Flag },
];

export default function JourneySection() {
  return (
    <>
      <LandingSection id="trust" tone="mist">
        <FadeIn className="max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#8DDB90] mb-3">
            Before you commit
          </p>
          <SectionHeading>
            BEFORE YOU PAY,
            <br />
            KNOW WHO YOU&apos;RE DEALING WITH.
          </SectionHeading>
          <SectionText className="mt-4">
            Real estate transactions involve significant money, important documents and serious decisions.
          </SectionText>
          <SectionText className="mt-3">
            Khabiteq creates a more structured pathway to help you identify the professional you&apos;re dealing with, access the right experts, inspect properties, document your transaction and know where to turn when serious concerns arise.
          </SectionText>
          <div className="mt-7">
            <DarkCta href="/how-it-works">SEE HOW KHABITEQ WORKS</DarkCta>
          </div>
        </FadeIn>
      </LandingSection>

      <LandingSection id="how-it-works">
        <FadeIn className="mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#0B423D]/60 mb-3">
            Find · Match · Connect · Transact
          </p>
          <SectionHeading>
            YOUR PROPERTY JOURNEY,
            <br />
            STRUCTURED.
          </SectionHeading>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <FadeIn key={stage.n} delay={index * 0.04}>
                <article className="h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_8px_30px_-18px_rgba(9,57,28,0.25)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-[0.16em] text-[#8DDB90]">STAGE {stage.n}</span>
                    <span className="w-10 h-10 rounded-xl bg-[#09391C] text-[#8DDB90] flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#09391C] leading-snug">{stage.title}</h3>
                  <p className="mt-2 text-sm text-[#5A5D63] leading-relaxed">{stage.text}</p>
                </article>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={0.2} className="mt-8 flex flex-wrap gap-3">
          <DarkCta href="/preference">SUBMIT YOUR PREFERENCE</DarkCta>
          <OutlineCta href="/how-it-works">SEE THE FULL JOURNEY</OutlineCta>
        </FadeIn>
      </LandingSection>
    </>
  );
}
