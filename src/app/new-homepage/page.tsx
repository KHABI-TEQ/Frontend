/** @format */

"use client";
import React, { Fragment, Suspense, lazy, dynamic } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import { useHomePageSettings } from "@/hooks/useSystemSettings";
import ErrorBoundary from "@/components/general-components/ErrorBoundary";
import EmailVerification from "@/components/EmailVerification";
import DevelopmentNotice from "@/components/general-components/DevelopmentNotice";
import KeyFeaturesSection from "@/components/new-homepage/key-features-section";

// Optimize Hero Section: Dynamic import with loading fallback
const NewHeroSection = dynamic(
  () => import("@/components/new-homepage/new-hero-section"),
  {
    loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true // Keep SSR for SEO
  }
);

// Non-critical: Lazy load lower sections
const ValuePropositionSection = lazy(() => import("@/components/new-homepage/value-proposition-section"));
const FeaturedPropertiesSection = lazy(() => import("@/components/new-homepage/featured-properties-section"));
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
                  <h1 className="text-4xl font-bold mb-4">Find the Perfect Property</h1>
                  <p className="text-xl">Unable to load hero section at the moment.</p>
                </div>
              </div>
            }>
            <NewHeroSection />
          </ErrorBoundary>

          {/* 2. KEY FEATURES SECTION */}
          <ErrorBoundary
            fallback={
              <div className="w-full py-16 bg-[#FFFEFB]">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl font-bold text-[#09391C] mb-4">Key Features</h2>
                  <p className="text-gray-600">Unable to load key features section.</p>
                </div>
              </div>
            }>
            <KeyFeaturesSection />
          </ErrorBoundary>

          {/* 3. VALUE PROPOSITION SECTION (Replacement from Section 2) */}
          <Suspense>
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

          {/* 4. FEATURED PROPERTIES SECTION */}
          <Suspense>
            <ErrorBoundary
              fallback={
                <div className="w-full py-16 bg-[#FFFEFB]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[#09391C] mb-4">Featured Properties</h2>
                    <p className="text-gray-600">Unable to load featured properties section.</p>
                  </div>
                </div>
              }>
              <FeaturedPropertiesSection />
            </ErrorBoundary>
          </Suspense>

          {/* 5. REVIEWS & COUNTERS (SOCIAL PROOF & TRUST SIGNALS) */}
          <Suspense>
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

          {/* 6. FOR REAL ESTATE AGENTS SECTION */}
          <Suspense>
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

          {/* 7. SECURITY & TRANSPARENCY SECTION */}
          <Suspense>
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

          {/* 8. FINAL CALL TO ACTION (BOTTOM) */}
          <Suspense>
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
        </main>
      </section>

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
