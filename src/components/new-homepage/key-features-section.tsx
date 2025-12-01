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
      title: "Document Verification",
      description: "Verify property ownership and documents.",
      videoThumbnail: homePageSettings.document_verification_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings.document_verification_video_url,
      link: "/document-verification",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-blue-500",
      btnCTA: "Get started"
    },
    {
      id: 2,
      title: "Submit Your Preference",
      description: "Share requirements, we'll match you.",
      videoThumbnail: homePageSettings.submit_preference_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings.submit_preference_video_url,
      link: "/preference",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 10a6 6 0 1012 0v-1a1 1 0 00-2 0v1a4 4 0 11-8 0V9a1 1 0 00-2 0v1zm6-6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-green-500",
      btnCTA: "Get started"
    },
    {
      id: 3,
      title: "Agent Marketplace",
      description: "Access verified client preferences matching your listings.",
      videoThumbnail: homePageSettings.agent_marketplace_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings.agent_marketplace_video_url,
      link: "/agent-marketplace",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      ),
      color: "bg-purple-500",
      btnCTA: "Get started"
    },
    {
      id: 4,
      title: "Subscription Plans",
      description: "Unlock premium tools for agents and landlords.",
      videoThumbnail: homePageSettings.subscription_plan_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings.subscription_plan_video_url,
      link: "/agent-subscriptions?tab=plans",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11.586 10 15 6.586V7z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-orange-500",
      btnCTA: "Learn More"
    },
    {
      id: 5,
      title: "Post a Property",
      description: "List your property for sale or rent in minutes.",
      videoThumbnail: homePageSettings.post_property_thumbnail_url || "/placeholder-property.svg",
      videoUrl: homePageSettings.post_property_video_url,
      link: "/post-property",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      ),
      color: "bg-red-500",
      btnCTA: "Get started"
    }
  ];

  return (
    <section className='w-full py-16 md:py-24 bg-[#FFFEFB]'>
      <div className='container mx-auto px-4 md:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#09391C] mb-6 font-display'>
            Key Features
          </h2>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
            Discover the powerful tools and services that make Khabiteq your trusted real estate partner.
          </p>
        </motion.div>

        {/* Features Grid - Always show features regardless of video availability */}
        {(() => {
          // Split all features into groups for responsive layout
          const firstRow = features.slice(0, 3);
          const secondRow = features.slice(3, 5);

          return (
            <>
              {/* First row - 3 features */}
              {firstRow.length > 0 && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12'>
                  {firstRow.map((feature, index) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      index={index}
                      loading={loading}
                    />
                  ))}
                </div>
              )}

              {/* Second row - 2 features, centered */}
              {secondRow.length > 0 && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-8 lg:mt-12 max-w-4xl mx-auto'>
                  {secondRow.map((feature, index) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      index={index + firstRow.length}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </section>
  );
};

export default KeyFeaturesSection;
