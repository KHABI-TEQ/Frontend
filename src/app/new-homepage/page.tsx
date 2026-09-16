/** @format */

"use client";
import React, { Fragment, Suspense, lazy } from "react";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import { useHomePageSettings } from "@/hooks/useSystemSettings";
import ErrorBoundary from "@/components/general-components/ErrorBoundary";
import EmailVerification from "@/components/EmailVerification";
import DevelopmentNotice from "@/components/general-components/DevelopmentNotice";
import NewHeroSection from "@/components/new-homepage/new-hero-section";
import JourneySection from "@/components/landing/JourneySection";
import PreferenceAndCode from "@/components/landing/PreferenceAndCode";
import AudienceAndProfessionals from "@/components/landing/AudienceAndProfessionals";
import TrustAndClose, { FinalJourneyCta } from "@/components/landing/TrustAndClose";
import PartnerApiSection from "@/components/new-homepage/partner-api-section";

const SocialProofSection = lazy(() => import("@/components/new-homepage/social-proof-section"));

const NewHomepage = ({
  isComingSoon = false,
}: { isComingSoon?: boolean } = {}) => {
  const isLoading = useLoading();
  const { loading: settingsLoading } = useHomePageSettings();

  if (isLoading || settingsLoading) return <Loading />;

  return (
    <Fragment>
      <section className={`w-full filter ${isComingSoon && "blur-sm"}`}>
        <main className="w-full bg-[#FFFEFB]">
          <ErrorBoundary
            fallback={
              <div className="w-full min-h-[600px] bg-[#0B423D] flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl font-bold mb-4">REAL ESTATE, STRUCTURED FOR TRUST.</h1>
                  <p className="text-xl">Unable to load hero section at the moment.</p>
                </div>
              </div>
            }
          >
            <NewHeroSection />
          </ErrorBoundary>

          <JourneySection />
          <PreferenceAndCode />
          <AudienceAndProfessionals />
          <TrustAndClose />

          <Suspense fallback={<div className="w-full py-16 bg-[#F5F7F9]" />}>
            <ErrorBoundary fallback={null}>
              <SocialProofSection />
            </ErrorBoundary>
          </Suspense>

          <ErrorBoundary fallback={null}>
            <PartnerApiSection />
          </ErrorBoundary>

          <FinalJourneyCta />
        </main>
      </section>

      <Suspense fallback={null}>
        <EmailVerification />
      </Suspense>
      <Suspense fallback={null}>
        <DevelopmentNotice />
      </Suspense>
    </Fragment>
  );
};

const NewHomepageWrapper = () => (
  <Suspense fallback={<Loading />}>
    <NewHomepage />
  </Suspense>
);

export default NewHomepageWrapper;
