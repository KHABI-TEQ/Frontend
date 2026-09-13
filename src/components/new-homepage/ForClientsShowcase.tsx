'use client';

import { ArrowRight, Scale, Shield, User } from 'lucide-react';
import Link from 'next/link';
import {
  AudienceCheckList,
  AudienceDetailList,
  AudienceJourneyPage,
  AudienceReadMoreSection,
  type AudienceSlide,
} from '@/components/new-homepage/AudienceJourneyShowcase';

const journeySlides: AudienceSlide[] = [
  {
    key: 'matching',
    step: '01',
    title: 'Tell us what you want — we match properties for you',
    caption: 'Submit your preferences once and get automatic matches from verified listings.',
    image: '/property-preference-matching.jpg',
    imageAlt: 'Couple reviewing matched property options together',
  },
  {
    key: 'documents',
    step: '02',
    title: 'Verify title documents before you commit',
    caption: 'Run document checks early so you buy with clarity and confidence.',
    image: '/title-document-verification.jpg',
    imageAlt: 'Professional reviewing property title documents',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'inspection',
    step: '03',
    title: 'Book inspections and negotiate with confidence',
    caption: 'Schedule visits, track responses, and move deals forward in one place.',
    image: '/property-inspection.jpg',
    imageAlt: 'Agent walking a client through a property inspection',
  },
  {
    key: 'transaction',
    step: '04',
    title: 'Register and protect your transaction',
    caption: 'Complete regulator-aligned registration steps and keep your purchase trail secure.',
    image: '/transaction-key-handover.jpg',
    imageAlt: 'Completed property transaction and key handover',
  },
];

const journeyDetails = [
  {
    title: 'Share Your Requirements',
    body: 'Tell us your preferred location, budget, property type and other requirements.',
  },
  {
    title: 'Discover Suitable Opportunities',
    body: "Explore property opportunities that align with what you're looking for.",
  },
  {
    title: 'Connect With Relevant Professionals',
    body: 'Access relevant real estate professionals to support your property journey.',
  },
  {
    title: 'Schedule Property Inspections',
    body: "Arrange physical or virtual inspections when you're ready to explore a property further.",
  },
  {
    title: 'Access Due Diligence Services',
    body: 'When you\'re ready to proceed, connect with licensed professionals for relevant legal, valuation, survey and other due-diligence services.',
  },
  {
    title: 'Register Your Transaction & Access Support',
    body: 'Register your completed transaction with Khabiteq and access applicable escalation pathways and legal support when needed.',
  },
];

const licensedServices = [
  'Legal & Title Review',
  'Property Valuation',
  'Survey & Property Verification',
  'Property Due Diligence',
  'Professional Consultation',
  'Other Relevant Property Services',
];

const ForClientsShowcase = () => {
  return (
    <AudienceJourneyPage
      title="Your property search, structured."
      titleIcon={User}
      headerCta={{ href: '/preference', label: 'Submit a preference' }}
      slides={journeySlides}
      lastCta={{ href: '/preference', label: 'Get started' }}
    >
      <AudienceReadMoreSection title="How the full journey works" icon={Shield}>
        <AudienceDetailList items={journeyDetails} />
      </AudienceReadMoreSection>

      <AudienceReadMoreSection title="Licensed professional services" icon={Scale}>
        <h3 className="mb-2 text-xl font-bold text-[#09391C]">Conduct due diligence with confidence.</h3>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Already found a property? Connect with licensed professionals for legal, valuation, survey
          and other checks. View credentials and pricing before you hire.
        </p>
        <AudienceCheckList items={licensedServices} />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/document-verification"
            className="inline-flex items-center gap-2 rounded-xl bg-[#09391C] px-5 py-3 text-sm font-semibold text-white"
          >
            Explore professional services
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/survey-services"
            className="inline-flex items-center gap-2 rounded-xl border border-[#09391C] px-5 py-3 text-sm font-semibold text-[#09391C]"
          >
            Survey services
          </Link>
          <Link
            href="/licensed-agents"
            className="inline-flex items-center gap-2 rounded-xl border border-[#09391C] px-5 py-3 text-sm font-semibold text-[#09391C]"
          >
            Find a professional
          </Link>
        </div>
      </AudienceReadMoreSection>
    </AudienceJourneyPage>
  );
};

export default ForClientsShowcase;
