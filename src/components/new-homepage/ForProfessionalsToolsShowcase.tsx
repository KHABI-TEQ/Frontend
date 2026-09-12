'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Handshake,
  Home,
  IdCard,
  LayoutDashboard,
  Scale,
  Store,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';

const profileSections = [
  {
    icon: UserRound,
    title: 'Professional identity',
    body: 'Who you are and where you operate.',
  },
  {
    icon: BadgeCheck,
    title: 'Credentials & affiliations',
    body: 'Relevant licences, qualifications and affiliations where applicable.',
  },
  {
    icon: Briefcase,
    title: 'Services & expertise',
    body: 'What you professionally offer.',
  },
  {
    icon: Scale,
    title: 'Services & pricing',
    body: 'What clients can hire you for and the applicable pricing.',
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

const dashboardTools = [
  {
    icon: Store,
    title: 'Agent Marketplace',
    subtitle: 'Access unmatched property demand',
    body: 'You can review unmatched property requests and understand what people are actively looking for. This also helps Khabiteq gather market and pricing intelligence.',
  },
  {
    icon: Building2,
    title: 'Property marketing opportunities',
    subtitle: 'Request to represent listings and developments',
    body: 'You can explore properties and developments and request permission to market them. Owners and developers can receive your marketing requests, review your profile, choose who to engage, and define commission or payout terms.',
  },
  {
    icon: Home,
    title: 'Professional services',
    subtitle: 'Present what clients can hire you for',
    body: 'You can present your services, display pricing, receive relevant service opportunities, and be engaged by property seekers, owners and developers.',
  },
  {
    icon: Handshake,
    title: 'Transaction partners',
    subtitle: 'Collaborate through defined roles',
    body: 'You can collaborate with other professionals and Property Scouts to progress opportunities and transactions through defined roles.',
  },
];

const ForProfessionalsToolsShowcase = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF1F1] pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#09391C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/for-professionals" className="hover:text-[#09391C] transition-colors">
              Professionals
            </Link>
            <span>/</span>
            <span className="text-[#09391C] font-medium">Your tools</span>
          </nav>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 overflow-hidden"
          >
            <div className="relative bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-10 lg:px-16 py-12 sm:py-14">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DDB90] rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <p className="text-[#8DDB90] text-sm font-semibold uppercase tracking-wider mb-3">
                  Explore your tools
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                  Tools for a specialist practice — and for property opportunities.
                </h1>
                <p className="text-lg text-[#D6DDEB] max-w-3xl leading-relaxed">
                  You can build a specialist practice and also participate in property
                  opportunities. Start with your profile, then work from a dashboard built
                  for demand, marketing, services and collaboration.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.section
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 p-6 sm:p-10"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xs font-bold tracking-wider text-[#8DDB90] bg-[#09391C] px-2.5 py-1 rounded-full">
                I
              </span>
              <div>
                <h2 className="text-2xl font-bold text-[#09391C]">
                  Create your professional profile
                </h2>
                <p className="text-gray-600 mt-2 max-w-3xl">
                  This takes you into onboarding and profile creation. Make it clear who you
                  are, what you offer, and how clients can engage you — then use the same
                  presence to participate in property opportunities.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {profileSections.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 p-4 rounded-2xl bg-[#F8FAF8] border border-gray-100"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#8DDB90]/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#09391C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#09391C] mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-[#09391C] mb-3">This supports</p>
              <div className="flex flex-wrap gap-2">
                {supportedRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 rounded-full bg-[#EEF1F1] text-[#09391C] text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 p-6 sm:p-10"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xs font-bold tracking-wider text-[#8DDB90] bg-[#09391C] px-2.5 py-1 rounded-full">
                II
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LayoutDashboard className="w-5 h-5 text-[#09391C]" />
                  <h2 className="text-2xl font-bold text-[#09391C]">
                    Professional dashboard
                  </h2>
                </div>
                <p className="text-gray-600 max-w-3xl">
                  Once your profile is complete, this is where the working tools live.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-8">
              {dashboardTools.map((tool) => (
                <article
                  key={tool.title}
                  className="rounded-2xl border border-gray-100 bg-[#F8FAF8] p-5 hover:bg-[#EEF1F1] transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#09391C] text-white flex items-center justify-center mb-4">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#09391C] text-lg">{tool.title}</h3>
                  <p className="text-sm font-medium text-[#16a34a] mt-1 mb-2">
                    {tool.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.body}</p>
                </article>
              ))}
            </div>
          </motion.section>

          <motion.div
            variants={itemVariants}
            className="bg-[#09391C] rounded-3xl px-6 sm:px-10 py-10 text-center"
          >
            <IdCard className="w-10 h-10 text-[#8DDB90] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Create your professional profile
            </h2>
            <p className="text-[#D6DDEB] max-w-2xl mx-auto mb-6">
              Start onboarding, set up your practice, and unlock the dashboard tools
              available to professionals on Khabiteq.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-colors"
            >
              Create your professional profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForProfessionalsToolsShowcase;
