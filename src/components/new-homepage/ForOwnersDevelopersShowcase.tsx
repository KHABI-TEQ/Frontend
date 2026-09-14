'use client';

import { useState } from 'react';
import { ArrowRight, Building2, Scale, Shield } from 'lucide-react';
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
    key: 'list',
    step: '01',
    title: 'Present your property professionally',
    caption: 'Create a dedicated property or project page with key details, images and information clearly presented.',
    image: '/property-listings.jpg',
    imageAlt: 'Owner reviewing a property listing with a professional outside a development',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'requests',
    step: '02',
    title: 'Choose Who Markets Your Property',
    caption:
      'Receive requests from licensed professionals and review their profiles and credentials before deciding who to engage.',
    image: '/owner-review-professionals.jpg',
    imageAlt: 'Property owner reviewing professional profiles on a tablet',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'commission',
    step: '03',
    title: 'Set Your Terms Before You Engage',
    caption:
      'Define the commission or payout you are prepared to offer for a successful sale, rental or joint venture.',
    image: '/owner-commission-terms.jpg',
    imageAlt: 'Developer agreeing commission terms for a residential project',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'services',
    step: '04',
    title: 'Access the Right Professionals for Your Property.',
    caption:
      'Connect with licensed agents and relevant professionals for marketing, legal, valuation, survey, property management and other services your property may require.',
    image: '/professionals-network.jpg',
    imageAlt: 'Lawyer and surveyor supporting a property transaction',
    imagePosition: 'object-[center_28%]',
  },
];

const listingBenefits = [
  {
    title: 'Present Your Property Professionally',
    body: 'Create a dedicated property or project page with key details, images and information clearly presented.',
  },
  {
    title: 'Receive Marketing Requests From Professionals',
    body: 'Licensed real estate professionals and marketers can request to market your property or development.',
  },
  {
    title: 'Review Professional Profiles Before Accepting',
    body: 'View professional profiles, credentials, services and relevant information before deciding who to engage.',
  },
  {
    title: 'Define Your Commission Terms',
    body: 'Set the commission or payout terms you are prepared to offer for successful transactions.',
  },
  {
    title: 'Access Multiple Professionals',
    body: 'Receive requests from multiple professionals and choose who you want to engage for marketing or other property-related services.',
  },
  {
    title: 'Access Property Management & Professional Services',
    body: 'Connect with relevant professionals for property management, due diligence and other services your property may require.',
  },
  {
    title: 'Mutual Accountability & Reporting',
    body: 'Property owners and professionals can raise concerns through structured reporting pathways, supporting greater transparency and accountability throughout the engagement.',
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

const ownerRoles = [
  { id: 'Landowners', label: 'Landlord' },
  { id: 'Developer', label: 'Developer' },
] as const;

const ForOwnersDevelopersShowcase = () => {
  const [ownerType, setOwnerType] = useState<(typeof ownerRoles)[number]['id']>('Landowners');
  const registerHref = `/auth/register?userType=${ownerType}`;

  return (
    <AudienceJourneyPage
      title="Showcase your property. Stay in control."
      titleIcon={Building2}
      headerCta={{ href: registerHref, label: 'List a property' }}
      slides={journeySlides}
      lastCta={{ href: registerHref, label: 'Get started' }}
      toolbar={
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Owner or developer"
        >
          {ownerRoles.map((item) => {
            const selected = item.id === ownerType;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setOwnerType(item.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                  selected
                    ? 'bg-[#09391C] text-white'
                    : 'bg-white text-[#09391C] ring-1 ring-[#09391C]/15 hover:bg-[#09391C]/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      }
    >
      <AudienceReadMoreSection title="Why list with Khabiteq?" icon={Shield}>
        <AudienceDetailList items={listingBenefits} />
        <div className="mt-6">
          <Link
            href={registerHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#09391C] px-5 py-3 text-sm font-semibold text-white"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AudienceReadMoreSection>

      <AudienceReadMoreSection title="Licensed professional services" icon={Scale}>
        <h3 className="mb-2 text-xl font-bold text-[#09391C]">Conduct due diligence with confidence.</h3>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Already proceeding with a sale, rent or joint venture? Connect with licensed professionals for
          legal, valuation, survey and other checks. View credentials and pricing before you hire.
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

export default ForOwnersDevelopersShowcase;
