'use client';

import { ArrowRight, Building2, Check, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  AudienceCheckList,
  AudienceJourneyPage,
  AudienceReadMoreSection,
  type AudienceSlide,
} from '@/components/new-homepage/AudienceJourneyShowcase';

const journeySlides: AudienceSlide[] = [
  {
    key: 'profile',
    step: '01',
    title: 'Create Your Developer Profile',
    caption:
      'Set up your verified developer profile so professionals and property seekers understand who they are dealing with.',
    image: '/digital-identity.jpg',
    imageAlt: 'Developer setting up a professional profile',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'properties',
    step: '02',
    title: 'Add Your Properties or Projects',
    caption:
      'Showcase your available properties and development projects. You remain in control of what you present.',
    image: '/property-listings.jpg',
    imageAlt: 'Developer reviewing property and project listings',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'distribution',
    step: '03',
    title: 'Expand Your Property Distribution',
    caption:
      "Don't rely only on your internal sales team. Work with real estate professionals who can market your properties.",
    image: '/owner-review-professionals.jpg',
    imageAlt: 'Developer reviewing professionals who can market a project',
    imagePosition: 'object-[center_28%]',
  },
  {
    key: 'offplan',
    step: '04',
    title: 'Want to Sell Off-Plan?',
    caption:
      'Selling off-plan requires a higher level of buyer confidence. Activate Off-Plan access through Advanced KYC and an Off-Plan plan.',
    image: '/owner-commission-terms.jpg',
    imageAlt: 'Off-plan development project under construction',
    imagePosition: 'object-[center_28%]',
  },
];

const distributionBenefits = [
  'Developer Profile',
  'Showcase Your Properties',
  'Accept Up To 10 Professionals',
  'Expand Your Marketing Reach',
  'Manage The Professionals You Work With',
  'Reach More Potential Buyers',
];

const offPlanBenefits = [
  'Everything In The Developer Property Distribution Plan',
  'Activate Off-Plan Sales',
  'Complete Advanced KYC',
  'Accept Up To 30 Professionals To Market Your Project',
  'Wider Professional Distribution',
  'Stronger Buyer Confidence Proposition',
  "Participation In Khabiteq's Structured Trust Framework",
  'Reach More Serious Local And Diaspora Buyers',
];

const offPlanAnnualBenefits = [
  'Full Off-Plan Access',
  'Advanced KYC',
  'Accept Up To 100 Professionals To Market Your Projects',
  'Maximum Professional Distribution',
  'Continuous Project Visibility',
  'Stronger Long-Term Buyer Confidence Proposition',
  "Participation In Khabiteq's Structured Trust Framework",
  'Reach Serious Local And Diaspora Buyers',
];

const whyJoin = [
  'Professional distribution',
  'More potential buyers',
  'Greater market reach',
  'A stronger trust proposition',
  'A structured environment for off-plan sales',
];

const offPlanActivate = [
  'Complete Advanced KYC',
  'Provide Required Business Information',
  'Provide Required Project Information',
  'Subscribe To An Off-Plan Plan',
];

const registerHref = '/auth/register?userType=Developer';

function PlanCard({
  name,
  price,
  term,
  audience,
  benefits,
  tagline,
  featured,
}: {
  name: string;
  price: string;
  term: string;
  audience: string;
  benefits: readonly string[];
  tagline: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-5 sm:p-6 ${
        featured
          ? 'border-[#8DDB90] bg-[#f0fdf4] shadow-md'
          : 'border-gray-100 bg-white'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5A5D63]">{audience}</p>
      <h3 className="mt-1 text-lg font-bold text-[#09391C]">{name}</h3>
      <p className="mt-2 text-2xl font-extrabold text-[#09391C]">
        {price} <span className="text-sm font-semibold text-[#5A5D63]">/ {term}</span>
      </p>
      <ul className="mt-4 flex-1 space-y-2">
        {benefits.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#09391C]">{tagline}</p>
      <Link
        href={registerHref}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
      >
        Get started
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

const ForDevelopersShowcase = () => {
  return (
    <AudienceJourneyPage
      title="Develop. Distribute. Sell with Trust."
      titleIcon={Building2}
      headerCta={{ href: registerHref, label: 'Get started' }}
      slides={journeySlides}
      lastCta={{ href: registerHref, label: 'Create developer account' }}
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_24px_-8px_rgba(9,57,28,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">Welcome to Khabiteq</p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Whether you&apos;re selling completed properties or developing off-plan projects, Khabiteq gives you
          the tools and professional network to expand your reach and grow your property business.
        </p>
      </div>

      <AudienceReadMoreSection title="Developer Property Distribution Plan" icon={Sparkles}>
        <p className="mb-4 text-sm font-semibold text-[#09391C]">
          Your properties. Your control. More professionals marketing for you.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <PlanCard
            name="Property Distribution"
            price="₦50,000"
            term="3 months"
            audience="Best for completed or available properties"
            benefits={distributionBenefits}
            tagline="More professionals. More reach. More sales."
          />
          <PlanCard
            name="Off-Plan"
            price="₦130,000"
            term="3 months"
            audience="Built for developers selling off-plan"
            benefits={offPlanBenefits}
            tagline="More trust. More professionals. More serious buyers."
            featured
          />
          <PlanCard
            name="Off-Plan Annual"
            price="₦390,000"
            term="year"
            audience="Maximum long-term reach"
            benefits={offPlanAnnualBenefits}
            tagline="Longer reach. Greater value. Bigger opportunities."
          />
        </div>
      </AudienceReadMoreSection>

      <AudienceReadMoreSection title="Want to sell off-plan?" icon={Shield}>
        <p className="mb-3 text-sm leading-relaxed text-gray-600 sm:text-base">
          Selling off-plan requires a higher level of buyer confidence. When buyers commit money to a project
          that is still under development, they need greater confidence in the developer and the process.
          That&apos;s why Khabiteq&apos;s Off-Plan access operates within a stronger trust and accountability framework.
        </p>
        <p className="mb-3 text-sm font-semibold text-[#09391C]">To activate off-plan sales:</p>
        <AudienceCheckList items={offPlanActivate} />
        <h3 className="mb-2 mt-6 text-lg font-bold text-[#09391C]">Buyer trust &amp; confidence</h3>
        <p className="max-w-4xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Khabiteq provides buyers with a structured pathway for regulatory escalation and access to free legal
          support where applicable. This helps create a stronger environment of confidence for buyers when
          considering participating developers and their projects.
        </p>
        <p className="mt-3 text-sm font-semibold text-[#09391C]">
          More confidence for buyers. A stronger trust proposition for credible developers.
        </p>
      </AudienceReadMoreSection>

      <AudienceReadMoreSection title="Why developers join Khabiteq" icon={Building2}>
        <p className="mb-4 text-sm font-semibold text-[#09391C]">
          Developers need more than visibility. They need:
        </p>
        <AudienceCheckList items={whyJoin} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F8FAF8] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63]">For completed properties</p>
            <h3 className="mt-1 font-bold text-[#09391C]">Distribution</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get more professionals involved in marketing your properties.
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAF8] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63]">For off-plan projects</p>
            <h3 className="mt-1 font-bold text-[#09391C]">Distribution + Trust</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get wider professional distribution while participating in a stronger trust-focused framework
              designed to give buyers greater confidence.
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm font-semibold text-[#09391C]">
          We help credible developers reach more people. We help buyers engage with greater confidence.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Build. Distribute. Sell with trust. Real estate. Reimagined for Africa.
        </p>
        <div className="mt-6">
          <Link
            href={registerHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#09391C] px-5 py-3 text-sm font-semibold text-white"
          >
            Create your developer account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AudienceReadMoreSection>
    </AudienceJourneyPage>
  );
};

export default ForDevelopersShowcase;
