'use client';

import { Suspense, useCallback } from 'react';
import { ArrowRight, Briefcase, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AudienceCheckList,
  AudienceDetailList,
  AudienceJourneyPage,
  AudienceReadMoreSection,
  type AudienceSlide,
} from '@/components/new-homepage/AudienceJourneyShowcase';

const professionalRoles = ['agent', 'lawyer', 'surveyor', 'valuer'] as const;
type ProfessionalRole = (typeof professionalRoles)[number];

const roleLabels: Record<ProfessionalRole, string> = {
  agent: 'Agent',
  lawyer: 'Lawyer',
  surveyor: 'Surveyor',
  valuer: 'Property Valuer',
};

const roleRegisterTypes: Record<ProfessionalRole, string> = {
  agent: 'Agent',
  lawyer: 'Lawyer',
  surveyor: 'Surveyor',
  valuer: 'Valuer',
};

const headroomCrop = 'object-[center_28%]';

const presenceSlide: AudienceSlide = {
  key: 'identity',
  step: '01',
  title: 'Create your professional presence',
  caption: 'Build a structured profile where clients can view your credentials, services and expertise.',
  image: '/digital-identity.jpg',
  imageAlt: 'Licensed real estate professional standing outside a modern office',
  imagePosition: headroomCrop,
};

const roleContent: Record<
  ProfessionalRole,
  {
    slides: AudienceSlide[];
    howItWorks: { title: string; body: string }[];
  }
> = {
  agent: {
    slides: [
      presenceSlide,
      {
        key: 'opportunities',
        step: '02',
        title: 'Access demand and opportunities',
        caption: 'Review unmatched property requests and discover where your expertise is needed.',
        image: '/client-opportunities.jpg',
        imageAlt: 'Professional meeting qualified property seekers',
        imagePosition: headroomCrop,
      },
      {
        key: 'matching',
        step: '03',
        title: 'Get matched to qualified buyers',
        caption: 'Your listings are automatically matched with buyers and tenants looking for properties like yours.',
        image: '/property-matching-map.jpg',
        imageAlt: 'Property matches shown on a map and listing gallery',
      },
      {
        key: 'deals',
        step: '04',
        title: 'Close more deals, grow your practice',
        caption: 'Request to market listings, offer hireable services, and collaborate on transactions in one place.',
        image: '/more-deals.jpg',
        imageAlt: 'Agent handing over keys after a successful property deal',
        imagePosition: headroomCrop,
      },
    ],
    howItWorks: [
      {
        title: 'Create Your Professional Presence',
        body: 'Build a structured profile where clients, property seekers and property owners can view your professional information, credentials, services and areas of expertise.',
      },
      {
        title: 'Access Demand & Opportunities',
        body: 'Discover where your expertise may be needed, access relevant client and service opportunities, and review unmatched property requests through tools such as the Agent Marketplace.',
      },
      {
        title: 'Participate in Property Transactions',
        body: 'Provide professional services, request to market properties and participate in relevant property transactions and collaborations through Khabiteq.',
      },
      {
        title: 'Grow With Dedicated Support',
        body: 'Use dashboard tools for marketing requests, professional services and collaboration — with support from Khabiteq to follow up and close more deals.',
      },
    ],
  },
  lawyer: {
    slides: [
      { ...presenceSlide, key: 'lawyer-identity' },
      {
        key: 'marketplace',
        step: '02',
        title: 'Make legal due diligence discoverable',
        caption: 'After KYC approval, property seekers can connect with you for relevant legal and document review.',
        image: '/title-document-verification.jpg',
        imageAlt: 'Lawyer reviewing property title documents',
        imagePosition: headroomCrop,
      },
      {
        key: 'jobs',
        step: '03',
        title: 'Accept or decline professional requests',
        caption: 'Review incoming requests, take the work that fits your practice, and keep your pipeline clear.',
        image: '/professionals-network.jpg',
        imageAlt: 'Legal professional reviewing documents while a surveyor works on site',
      },
      {
        key: 'payouts',
        step: '04',
        title: 'Deliver the service and get paid',
        caption: 'Provide the review directly and receive payouts through your settlement account.',
        image: '/practice-dashboard.jpg',
        imageAlt: 'Professionals coordinating transaction work from one dashboard',
      },
    ],
    howItWorks: [
      {
        title: 'Publish a Professional Page',
        body: 'Create a structured profile so property seekers, owners and developers can find you, review credentials and hire you.',
      },
      {
        title: 'Make legal services discoverable',
        body: 'After KYC approval, appear so property seekers can connect with you for relevant legal and document review.',
      },
      {
        title: 'Accept professional requests',
        body: 'Receive incoming requests, accept or decline them, and complete the work through Khabiteq.',
      },
      {
        title: 'Deliver reports and receive payouts',
        body: 'Provide the service directly and get paid through your connected settlement account.',
      },
    ],
  },
  surveyor: {
    slides: [
      { ...presenceSlide, key: 'surveyor-identity' },
      {
        key: 'services',
        step: '02',
        title: 'Offer plan and site verification',
        caption: 'Present plan verification and site survey services so clients can hire you with clear pricing.',
        image: '/professionals-network.jpg',
        imageAlt: 'Surveyor on site with a lawyer reviewing related documents',
        imagePosition: headroomCrop,
      },
      {
        key: 'marketplace',
        step: '03',
        title: 'Appear on the marketplace after KYC',
        caption: 'Once KYC is approved and your payout account is connected, clients can find and request you.',
        image: '/property-inspection.jpg',
        imageAlt: 'On-site property inspection and verification',
      },
      {
        key: 'reports',
        step: '04',
        title: 'Complete reports and get paid',
        caption: 'Accept requests, deliver survey reports, and receive payouts through Khabiteq.',
        image: '/practice-dashboard.jpg',
        imageAlt: 'Professionals tracking completed survey and transaction work',
      },
    ],
    howItWorks: [
      {
        title: 'Build a Public Professional Page',
        body: 'Publish your practice details, services and credentials so clients can find and hire you.',
      },
      {
        title: 'Offer Plan and Site Verification',
        body: 'List plan verification and site survey services with clear scope and pricing.',
      },
      {
        title: 'Go Live After KYC',
        body: 'Appear on the surveyor marketplace after KYC approval and connect a payout account before taking jobs.',
      },
      {
        title: 'Accept Requests and Get Paid',
        body: 'Accept incoming survey requests, complete reports and receive payouts through Khabiteq.',
      },
    ],
  },
  valuer: {
    slides: [
      { ...presenceSlide, key: 'valuer-identity' },
      {
        key: 'services',
        step: '02',
        title: 'Offer valuation services',
        caption: 'Present property valuation on your profile so seekers, owners and developers can hire you.',
        image: '/title-document-verification.jpg',
        imageAlt: 'Valuer reviewing property documents and figures',
        imagePosition: headroomCrop,
      },
      {
        key: 'requests',
        step: '03',
        title: 'Accept valuation requests',
        caption: 'Review incoming valuation jobs, take the assignments that fit, and schedule inspections.',
        image: '/property-listings.jpg',
        imageAlt: 'Professional assessing a property with the owner',
      },
      {
        key: 'reports',
        step: '04',
        title: 'Deliver reports and get paid',
        caption: 'Submit your valuation report and receive payouts through your settlement account.',
        image: '/practice-dashboard.jpg',
        imageAlt: 'Professionals reviewing completed valuation and transaction work',
      },
    ],
    howItWorks: [
      {
        title: 'Create Your Professional Presence',
        body: 'Build a structured profile where clients can view your valuation credentials, services and pricing.',
      },
      {
        title: 'Offer Valuation Services',
        body: 'Present what clients can hire you for and display applicable pricing on your professional page.',
      },
      {
        title: 'Accept Valuation Requests',
        body: 'Receive incoming valuation jobs from property seekers, owners and developers, and accept the work that fits.',
      },
      {
        title: 'Deliver Reports and Receive Payouts',
        body: 'Complete the assignment, submit your report and get paid through Khabiteq.',
      },
    ],
  },
};

const dashboardTools = [
  {
    title: 'Agent Marketplace',
    body: 'Review unmatched property requests and understand what people are actively looking for.',
  },
  {
    title: 'Property marketing opportunities',
    body: 'Explore properties and developments and request permission to market them. Owners review your profile and set commission terms.',
  },
  {
    title: 'Professional services',
    body: 'Present your services, display pricing, and be engaged by property seekers, owners and developers.',
  },
  {
    title: 'Transaction partners',
    body: 'Collaborate with other professionals and Property Scouts through defined roles.',
  },
];

const supportedRoles = [
  'Licensed agents',
  'Lawyers',
  'Valuers',
  'Surveyors',
  'Property managers',
  'Other relevant professionals',
  'Property Scouts within their appropriate role',
];

function parseRole(value: string | null): ProfessionalRole {
  return professionalRoles.includes(value as ProfessionalRole) ? (value as ProfessionalRole) : 'agent';
}

function RoleSwitcher({
  role,
  onSelect,
}: {
  role: ProfessionalRole;
  onSelect: (next: ProfessionalRole) => void;
}) {
  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Professional role"
    >
      {professionalRoles.map((item) => {
        const selected = item === role;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(item)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              selected
                ? 'bg-[#09391C] text-white'
                : 'bg-white text-[#09391C] ring-1 ring-[#09391C]/15 hover:bg-[#09391C]/5'
            }`}
          >
            {roleLabels[item]}
          </button>
        );
      })}
    </div>
  );
}

function ForProfessionalsShowcaseInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = parseRole(searchParams.get('role'));
  const content = roleContent[role];

  const selectRole = useCallback(
    (next: ProfessionalRole) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('role', next);
      router.replace(`/for-professionals?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <AudienceJourneyPage
      title="Build your digital practice."
      titleIcon={Briefcase}
      headerCta={{ href: '/for-professionals/tools', label: 'Explore your tools' }}
      slides={content.slides}
      lastCta={{ href: `/auth/register?userType=${roleRegisterTypes[role]}`, label: 'Get started' }}
      carouselKey={role}
      toolbar={<RoleSwitcher role={role} onSelect={selectRole} />}
    >
      <AudienceReadMoreSection title="How the full journey works" icon={LayoutDashboard}>
        <AudienceDetailList items={content.howItWorks} />
        <div className="mt-6">
          <Link
            href="/for-professionals/tools"
            className="inline-flex items-center gap-2 rounded-xl bg-[#09391C] px-5 py-3 text-sm font-semibold text-white"
          >
            Explore your tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AudienceReadMoreSection>

      <AudienceReadMoreSection title="Tools and professional roles" icon={Users}>
        <h3 className="mb-2 text-xl font-bold text-[#09391C]">Practice tools in one dashboard.</h3>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Create your professional profile and access the tools and opportunities available within
          the Khabiteq ecosystem.
        </p>
        <AudienceDetailList items={dashboardTools} />
        <h3 className="mb-3 mt-8 text-lg font-bold text-[#09391C]">Supported professional roles</h3>
        <AudienceCheckList items={supportedRoles} />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/auth/register?userType=${roleRegisterTypes[role]}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#09391C] px-5 py-3 text-sm font-semibold text-white"
          >
            Create your profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-[#09391C]/20 px-5 py-3 text-sm font-semibold text-[#09391C]"
          >
            View professional plans
          </Link>
        </div>
      </AudienceReadMoreSection>
    </AudienceJourneyPage>
  );
}

const ForProfessionalsShowcase = () => {
  return (
    <Suspense
      fallback={
        <AudienceJourneyPage
          title="Build your digital practice."
          titleIcon={Briefcase}
          headerCta={{ href: '/for-professionals/tools', label: 'Explore your tools' }}
          slides={roleContent.agent.slides}
          lastCta={{ href: '/auth/register?userType=Agent', label: 'Get started' }}
        >
          <div className="h-24" />
        </AudienceJourneyPage>
      }
    >
      <ForProfessionalsShowcaseInner />
    </Suspense>
  );
};

export default ForProfessionalsShowcase;
