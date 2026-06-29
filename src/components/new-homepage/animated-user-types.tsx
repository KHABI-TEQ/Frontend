/** @format */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, Search, Home, ArrowRight, Check } from 'lucide-react';

type UserTypeId = 'landlords' | 'developers' | 'agents' | 'buyers';

const userTypes: {
  id: UserTypeId;
  icon: typeof Home;
  title: string;
  headline: string;
  bullets: string[];
  cta: string;
  ctaUrl: string;
  color: string;
  iconBg: string;
  iconColor: string;
  imageSrc: string;
  imageAlt: string;
}[] = [
  {
    id: 'landlords',
    icon: Home,
    title: 'Landlords',
    headline: 'List for free with complete control',
    bullets: [
      'List one or multiple properties for free',
      'Receive marketing requests from verified agents',
      'Choose the agents you want to work with',
      'Your contact details remain private until you approve an agent',
      'Sell or rent faster with complete control',
    ],
    cta: 'List Property',
    ctaUrl: '/for-landlords',
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    imageSrc: '/images/user-types/landlords.webp',
    imageAlt: 'Nigerian property owner standing in front of a well-maintained home',
  },
  {
    id: 'developers',
    icon: Building2,
    title: 'Developers',
    headline: 'Reach serious buyers faster',
    bullets: [
      'Publish developments with a dedicated project page',
      'Set your commission payout percentage',
      'Let multiple verified agents request to market your project',
      'Reach more qualified buyers and sell faster',
    ],
    cta: 'Publish Project',
    ctaUrl: '/for-developers',
    color: 'from-emerald-600 to-teal-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    imageSrc: '/images/user-types/developers.webp',
    imageAlt: 'Nigerian real estate developer reviewing plans at a construction site',
  },
  {
    id: 'agents',
    icon: Users,
    title: 'Agents',
    headline: 'Every agent has the mandate',
    bullets: [
      'Get your own Practitioner Page with a personalized URL',
      'Request to market landlord and developer listings',
      'Earn the commissions they offer when you close deals',
      'Listings automatically matched to buyer preferences',
      'Help qualified buyers discover your properties without extra effort',
    ],
    cta: 'Activate Page',
    ctaUrl: '/agent-marketplace',
    color: 'from-[#8DDB90] to-emerald-600',
    iconBg: 'bg-[#dcfce7]',
    iconColor: 'text-[#16a34a]',
    imageSrc: '/images/user-types/agents.webp',
    imageAlt: 'Nigerian real estate agent showing a property to clients',
  },
  {
    id: 'buyers',
    icon: Search,
    title: 'Buyers & Clients',
    headline: 'Find your dream property',
    bullets: [
      'Submit your preference and let our system search verified agent Practitioner Pages',
      'Receive tailored property briefs matched to your needs',
      'Book inspections through the platform',
      'Rate or report agents after your experience for transparency and accountability',
    ],
    cta: 'Submit Preference',
    ctaUrl: '/preference',
    color: 'from-blue-600 to-indigo-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    imageSrc: '/images/user-types/buyers.webp',
    imageAlt: 'Nigerian couple celebrating their new home',
  },
];

function UserTypeCardMedia({
  title,
  imageSrc,
  imageAlt,
}: {
  title: string;
  imageSrc: string;
  imageAlt: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={imageAlt}
        width={960}
        height={600}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-property.svg';
          setLoaded(true);
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {title}
      </span>
    </div>
  );
}

export default function AnimatedUserTypes() {
  return (
    <section className="w-full overflow-hidden bg-gradient-to-b from-[#F5F7F9] to-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="mb-4 inline-block rounded-full bg-[#09391C]/10 px-4 py-1.5 text-sm font-semibold text-[#09391C]">
            Who is Khabiteq For?
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#09391C] sm:text-4xl lg:text-5xl">
            Built for everyone in <span className="text-[#8DDB90]">real estate</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Simple tools for every role — from listing to closing.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;

            return (
              <motion.article
                key={userType.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: '-40px' }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_24px_-6px_rgba(9,57,28,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(9,57,28,0.14)]"
              >
                <UserTypeCardMedia
                  title={userType.title}
                  imageSrc={userType.imageSrc}
                  imageAlt={userType.imageAlt}
                />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${userType.iconBg}`}>
                      <Icon className={`h-5 w-5 ${userType.iconColor}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${userType.iconColor}`}>
                        {userType.title}
                      </p>
                      <h3 className="text-lg font-bold leading-snug text-[#09391C] sm:text-xl">
                        {userType.headline}
                      </h3>
                    </div>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2.5">
                    {userType.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${userType.iconBg}`}>
                          <Check className={`h-3 w-3 ${userType.iconColor}`} />
                        </span>
                        <span className="text-sm leading-relaxed text-gray-600 sm:text-[0.9375rem]">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={userType.ctaUrl}
                    className={`inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r ${userType.color} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:gap-3 hover:shadow-lg`}
                  >
                    {userType.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
