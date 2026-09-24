/** @format */

"use client";
import React, { Fragment, Suspense, lazy, useEffect, useState } from "react";
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
import SearchInsuranceMarketing from "@/components/search-insurance/SearchInsuranceMarketing";
import PartnerApiSection from "@/components/new-homepage/partner-api-section";
import UserTypeOverlay from "@/components/new-homepage/UserTypeOverlay";
import UserTypeFloatingButton from "@/components/new-homepage/UserTypeFloatingButton";

const SocialProofSection = lazy(() => import("@/components/new-homepage/social-proof-section"));

export type NewHomepageProps = {
  isComingSoon?: boolean;
  showOverlayOnLoad?: boolean;
};

const NewHomepage = ({
  isComingSoon = false,
  showOverlayOnLoad = true,
}: NewHomepageProps) => {
  const isLoading = useLoading();
  useHomePageSettings();
  const [showUserTypeOverlay, setShowUserTypeOverlay] = useState(showOverlayOnLoad);

  useEffect(() => {
    if (!showOverlayOnLoad) {
      setShowUserTypeOverlay(false);
      return;
    }
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/home") {
      setShowUserTypeOverlay(false);
      return;
    }
    try {
      if (sessionStorage.getItem("khabiteq_user_type_overlay_dismissed") === "1") {
        setShowUserTypeOverlay(false);
      }
    } catch {
      /* ignore */
    }
  }, [showOverlayOnLoad]);

  const closeOverlay = () => {
    setShowUserTypeOverlay(false);
    try {
      sessionStorage.setItem("khabiteq_user_type_overlay_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (isLoading) return <Loading />;

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
          <SearchInsuranceMarketing />

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

      <UserTypeOverlay
        isOpen={showUserTypeOverlay}
        onClose={closeOverlay}
      />
      <UserTypeFloatingButton
        onClick={() => setShowUserTypeOverlay(true)}
        isVisible={!showUserTypeOverlay}
      />

      <Suspense fallback={null}>
        <EmailVerification />
      </Suspense>
      <Suspense fallback={null}>
        <DevelopmentNotice />
      </Suspense>
    </Fragment>
  );
};

export default function NewHomepageWrapper({
  isComingSoon = false,
  showOverlayOnLoad = true,
}: NewHomepageProps = {}) {
  return (
    <Suspense fallback={<Loading />}>
      <NewHomepage isComingSoon={isComingSoon} showOverlayOnLoad={showOverlayOnLoad} />
    </Suspense>
  );
}
