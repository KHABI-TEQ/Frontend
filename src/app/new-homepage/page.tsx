/** @format */

"use client";
import React, { Fragment, Suspense, lazy, useState, useEffect } from "react";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import { useHomePageSettings } from "@/hooks/useSystemSettings";
import ErrorBoundary from "@/components/general-components/ErrorBoundary";
import EmailVerification from "@/components/EmailVerification";
import DevelopmentNotice from "@/components/general-components/DevelopmentNotice";
import AIAdvantageSection from "@/components/new-homepage/ai-advantage-section";
import NewHeroSection from "@/components/new-homepage/new-hero-section";
import AnimatedUserTypes from "@/components/new-homepage/animated-user-types";
import UserTypeOverlay from "@/components/new-homepage/UserTypeOverlay";
import UserTypeFloatingButton from "@/components/new-homepage/UserTypeFloatingButton";
import PartnerApiSection from "@/components/new-homepage/partner-api-section";

// Non-critical: Lazy load lower sections
const ValuePropositionSection = lazy(() => import("@/components/new-homepage/value-proposition-section"));
const SocialProofSection = lazy(() => import("@/components/new-homepage/social-proof-section"));
const ForAgentsSection = lazy(() => import("@/components/new-homepage/for-agents-section"));
const SecurityTransparencySection = lazy(() => import("@/components/new-homepage/security-transparency-section"));
const FinalCTASection = lazy(() => import("@/components/new-homepage/final-cta-section"));

/**
 * @NewHomepage - Modern, redesigned landing page following the new specifications
 * Features: Clean design, mobile-first, Nigerian real estate focus
 * Design feel: Airbnb meets Nigerian real estate flavor
 */

interface VerifiedUser {
  id: string;
  token: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  accountApproved: boolean;
  userType: string;
}

const NewHomepage = ({
  isComingSoon = false,
}: { isComingSoon?: boolean } = {}) => {
  // Simulating the loading page
  const isLoading = useLoading();
  // Get settings loading state 
  const { loading: settingsLoading } = useHomePageSettings();
  // User type overlay state
  const [showUserTypeOverlay, setShowUserTypeOverlay] = useState(false);

  // Always show overlay on every visit (for testing)
  useEffect(() => {
    if (!isLoading && !settingsLoading) {
      // Small delay for smooth entrance after loading
      const timer = setTimeout(() => {
        setShowUserTypeOverlay(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, settingsLoading]);

  /**
   * Loading state - show loading component for 3 seconds OR until settings are loaded
   */
  if (isLoading || settingsLoading) return <Loading />;

  return (
    <Fragment>

      <section className={`w-full filter ${isComingSoon && "blur-sm"}`}>
        <main className="w-full bg-[#FFFEFB]">

          {/* 1. HERO SECTION */}
          <ErrorBoundary
            fallback={
              <div className="w-full min-h-[600px] bg-[#0B423D] flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-4">List smarter. Match faster. Close with confidence.</h1>
                  <p className="text-xl">Unable to load hero section at the moment.</p>
                </div>
              </div>
            }>
            <NewHeroSection />
          </ErrorBoundary>

          {/* 2. ANIMATED USER TYPES SHOWCASE */}
          <ErrorBoundary
            fallback={
              <div className="w-full py-16 bg-gradient-to-b from-[#F5F7F9] to-white">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl font-bold text-[#09391C] mb-4">Who is Khabiteq For?</h2>
                  <p className="text-gray-600">Simple tools for everyone in real estate.</p>
                </div>
              </div>
            }>
            <AnimatedUserTypes />
          </ErrorBoundary>

          {/* 3. AI ADVANTAGE BANNER */}
          <ErrorBoundary
            fallback={
              <div className="w-full py-12 bg-gradient-to-r from-[#09391C] to-[#0B423D]">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Speak or type — we make it work.</h2>
                  <p className="text-white/80">AI-powered property listing and matching.</p>
                </div>
              </div>
            }>
            <AIAdvantageSection />
          </ErrorBoundary>

          {/* 4. VALUE PROPOSITION SECTION */}
          <Suspense fallback={<div className="w-full py-16 bg-[#FFFEFB]" />}>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#FFFEFB]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[#09391C] mb-4">Why Choose Khabiteq?</h2>
                    <p className="text-gray-600">Unable to load value proposition section.</p>
                  </div>
                </div>
              }>
              <ValuePropositionSection />
            </ErrorBoundary>
          </Suspense>

          {/* 6. REVIEWS & COUNTERS (SOCIAL PROOF & TRUST SIGNALS) */}
          <Suspense fallback={<div className="w-full py-16 bg-[#F5F7F9]" />}>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#F5F7F9]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[#09391C] mb-4">Trusted by Thousands</h2>
                    <p className="text-gray-600">Unable to load testimonials and stats.</p>
                  </div>
                </div>
              }>
              <SocialProofSection />
            </ErrorBoundary>
          </Suspense>

          {/* 7. FOR REAL ESTATE AGENTS SECTION */}
          <Suspense fallback={<div className="w-full py-16 bg-[#FFFEFB]" />}>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#FFFEFB]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[#09391C] mb-4">For Real Estate Agents</h2>
                    <p className="text-gray-600">Unable to load agent information.</p>
                  </div>
                </div>
              }>
              <ForAgentsSection />
            </ErrorBoundary>
          </Suspense>

          {/* 8. SECURITY & TRANSPARENCY SECTION */}
          <Suspense fallback={<div className="w-full py-16 bg-[#09391C]" />}>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#09391C]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Security & Transparency</h2>
                    <p className="text-gray-200">Unable to load security information.</p>
                  </div>
                </div>
              }>
              <SecurityTransparencySection />
            </ErrorBoundary>
          </Suspense>

          {/* 9. FINAL CALL TO ACTION (BOTTOM) */}
          <Suspense fallback={<div className="w-full py-16 bg-[#8DDB90]" />}>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#8DDB90]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Get Started Today</h2>
                    <button className="bg-[#09391C] text-white px-8 py-4 rounded-full font-bold">
                      Get Started Now
                    </button>
                  </div>
                </div>
              }>
              <FinalCTASection />
            </ErrorBoundary>
          </Suspense>

          {/* 10. Partner syndication (external listing platforms only) */}
          <ErrorBoundary
            fallback={
              <div className="w-full py-12 bg-[#0B2A24]">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-xl font-bold text-white mb-2">Listing platform partners</h2>
                  <p className="text-sm text-white/70">Partner onboarding is temporarily unavailable.</p>
                </div>
              </div>
            }>
            <PartnerApiSection />
          </ErrorBoundary>
        </main>
      </section>

      {/* User Type Selection Overlay */}
      <UserTypeOverlay
        isOpen={showUserTypeOverlay}
        onClose={() => setShowUserTypeOverlay(false)}
      />

      {/* Floating Button to Reopen Overlay */}
      <UserTypeFloatingButton
        onClick={() => setShowUserTypeOverlay(true)}
        isVisible={!showUserTypeOverlay}
      />

      {/* Email Verification Modal */}
      <Suspense fallback={null}>
        <EmailVerification />
      </Suspense>

      {/* Development Notice */}
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
