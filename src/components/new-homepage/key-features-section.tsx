/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useHomePageSettings } from '@/hooks/useSystemSettings';
import FeatureCard from './FeatureCard';

const KeyFeaturesSection = () => {
  const { settings: homePageSettings, loading } = useHomePageSettings();

  const features = [
    {
      id: 1,
      title: "For Landlords",
      headline: "Your property, your rules.",
      description: "List your property for sale, rent, shortlet, or joint venture. Add details easily and reach more serious buyers.",
      bullets: [
        "List up to 25 properties included (Portfolio Unlimited for larger portfolios)",
        "Let agents request to promote your listing — you decide",
        "More visibility through multiple agents",
        "Support for document checks to build trust",
        "Set your own agent commission where needed"
      ],
      videoThumbnail: homePageSettings?.document_verification_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings?.document_verification_video_url,
      link: "/post-property",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      ),
      color: "bg-[#09391C]",
      btnCTA: "List a property"
    },
    {
      id: 2,
      title: "For Developers",
      headline: "Show your project. Find the right partners.",
      description: "List your projects and joint ventures easily. Turn simple descriptions into full listings and reach serious investors.",
      bullets: [
        "First listing is free",
        "Control who can market your project",
        "Build trust with document verification",
        "Get more visibility through agents",
        "Manage different project types in one place",
        "Connect with buyers looking for your kind of property"
      ],
      videoThumbnail: homePageSettings?.submit_preference_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings?.submit_preference_video_url,
      link: "/post-property",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-[#0B423D]",
      btnCTA: "Publish a project"
    },
    {
      id: 3,
      title: "For Agents",
      headline: "Grow your business your way.",
      description: "Manage listings, attract clients, and promote properties — all from your own practitioner page.",
      bullets: [
        "First listing is free",
        "Get your own practitioner page with your listings",
        "Request to promote landlord and developer properties",
        "Confirm property locations on the map",
        "Help clients with trusted, verified listings",
        "Easy listing creation with AI support",
        "Manage inspections and client requests",
        "Match buyers with available properties"
      ],
      videoThumbnail: homePageSettings?.agent_marketplace_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings?.agent_marketplace_video_url,
      link: "/agent-marketplace",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      ),
      color: "bg-[#8DDB90]",
      btnCTA: "Activate your Practitioner Page"
    },
    {
      id: 4,
      title: "For Clients & Buyers",
      headline: "Tell us what you want.",
      description: "Looking to buy, rent, or invest? Just tell us in simple words. We help you find matching properties faster.",
      bullets: [
        "Describe what you need in simple terms",
        "Get matched with available properties",
        "Check property location on the map",
        "Book inspections easily",
        "Browse from the main site or agent pages",
        "Follow simple steps for secure transactions"
      ],
      videoThumbnail: homePageSettings?.subscription_plan_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings?.subscription_plan_video_url,
      link: "/preference",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 10a6 6 0 1012 0v-1a1 1 0 00-2 0v1a4 4 0 11-8 0V9a1 1 0 00-2 0v1zm6-6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-[#0A3E72]",
      btnCTA: "Submit a preference"
    }
  ];

  return (
    <section className='w-full py-16 sm:py-20 lg:py-24 bg-[#FFFEFB]'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className='text-center mb-12 sm:mb-16'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-[#09391C] mb-4 sm:mb-5 tracking-tight'>
            Who is Khabi-Teq For?
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            Simple tools for everyone in real estate — from listing to closing.
          </p>
        </motion.div>

        {/* Features Grid - Always show features regardless of video availability */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto'>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;
