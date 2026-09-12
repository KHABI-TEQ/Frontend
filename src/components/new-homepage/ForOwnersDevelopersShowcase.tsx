'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Building2,
  Home,
  Shield,
  TrendingUp,
  HardHat,
  Users,
  FileCheck,
  Percent,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import DocumentVerificationPromoSection from '@/components/new-homepage/document-verification-promo-section';

const ownerBullets = [
  'List your property for sale, rent, shortlet, or joint venture',
  'List up to 25 properties included (Portfolio Unlimited for larger portfolios)',
  'Let agents request to promote your listing — you decide',
  'Your contact details remain private until you approve an agent',
  'Set your own agent commission where needed',
];

const developerBullets = [
  'Showcase developments with dedicated project pages and media',
  'Connect with verified agents to promote your projects',
  'Track leads and inquiries in real time',
  'Reach serious buyers and investors through structured demand',
  'Support document checks to build trust on every transaction',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((bullet) => (
        <li
          key={bullet}
          className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF8]"
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8DDB90]/20 flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-[#09391C]" />
          </div>
          <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {bullet}
          </span>
        </li>
      ))}
    </ul>
  );
}

const ForOwnersDevelopersShowcase = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF1F1] pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#09391C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#09391C] font-medium">Owners & Developers</span>
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#09391C]/10 text-[#09391C] rounded-full text-sm font-medium">
            <Building2 className="w-4 h-4" />
            For Owners & Developers
          </span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 overflow-hidden"
        >
          <div className="relative bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DDB90] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8DDB90] rounded-full blur-3xl" />
            </div>

            <motion.div variants={itemVariants} className="relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Bring your property opportunities into Africa&apos;s digital real estate ecosystem.
              </h1>
              <p className="text-lg sm:text-xl text-[#D6DDEB] max-w-3xl leading-relaxed">
                Present your property or development within an infrastructure designed to connect
                it with relevant property seekers and real estate professionals.
              </p>
            </motion.div>
          </div>

          <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C] mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#8DDB90]" />
                How Khabiteq supports owners and developers
              </h2>
              <p className="text-sm text-gray-500">
                Whether you hold a single property or a full development pipeline, the same
                listing, matching and inspection tools help you present opportunities with more
                structure.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-[#09391C]" />
                  <h3 className="text-lg font-semibold text-[#09391C]">For property owners</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  List for sale, rent, shortlet or joint venture. Keep control of who markets
                  your property and how buyers reach you.
                </p>
                <FeatureList items={ownerBullets} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#09391C]" />
                  <h3 className="text-lg font-semibold text-[#09391C]">For developers</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Showcase projects to verified agents and serious buyers. Manage inquiries and
                  grow visibility across your pipeline.
                </p>
                <FeatureList items={developerBullets} />
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#09391C] mb-1">
                    Ready to present your opportunity?
                  </h3>
                  <p className="text-sm text-gray-500">
                    Create an owner or developer account and start listing.
                  </p>
                </div>
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center gap-2 bg-[#09391C] hover:bg-[#0B423D] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <DocumentVerificationPromoSection />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Users,
              title: 'Agent requests',
              body: 'Let verified agents request to market your listing or project. You decide who represents you.',
            },
            {
              icon: FileCheck,
              title: 'Verified documents',
              body: 'Build trust with seekers through document verification and structured due diligence.',
            },
            {
              icon: Percent,
              title: 'Flexible commission',
              body: 'Set your own commission so the right professionals want to work your opportunity.',
            },
            {
              icon: TrendingUp,
              title: 'Lead management',
              body: 'Track inquiries and convert interest without losing control of the conversation.',
            },
            {
              icon: HardHat,
              title: 'Project showcase',
              body: 'Publish developments with photos, details and a dedicated project presence.',
            },
            {
              icon: Building2,
              title: 'Structured demand',
              body: 'Connect your supply with buyer preferences already submitted on Khabiteq.',
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8DDB90]/20 flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5 text-[#09391C]" />
              </div>
              <h3 className="font-semibold text-[#09391C] mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ForOwnersDevelopersShowcase;
