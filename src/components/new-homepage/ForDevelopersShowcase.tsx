'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Building2, Shield, TrendingUp, HardHat, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DocumentVerificationPromoSection from '@/components/new-homepage/document-verification-promo-section';

const ForDevelopersShowcase = () => {
  const bullets = [
    'Showcase your projects to thousands of potential buyers',
    'Dedicated project pages with full details and media',
    'Connect with verified agents to promote your developments',
    'Track leads and inquiries in real-time',
    'Secure document verification for all transactions',
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

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF1F1] pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
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
            <span className="text-[#09391C] font-medium">For Developers</span>
          </nav>
        </motion.div>

        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#09391C]/10 text-[#09391C] rounded-full text-sm font-medium">
            <Building2 className="w-4 h-4" />
            For Developers
          </span>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 overflow-hidden"
        >
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DDB90] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8DDB90] rounded-full blur-3xl" />
            </div>

            <motion.div variants={itemVariants} className="relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Showcase your projects. Reach more buyers.
              </h1>
              <p className="text-lg sm:text-xl text-[#D6DDEB] max-w-2xl leading-relaxed">
                List your developments for sale, rent, or joint venture. Connect with verified agents and reach serious investors with ease.
              </p>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C] mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#8DDB90]" />
                Why list your projects with Khabi-Teq?
              </h2>
            </motion.div>

            <motion.ul
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {bullets.map((bullet, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAF8] hover:bg-[#EEF1F1] transition-colors duration-300 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8DDB90]/20 flex items-center justify-center mt-0.5 group-hover:bg-[#8DDB90]/30 transition-colors">
                    <Check className="w-4 h-4 text-[#09391C]" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {bullet}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-10 grid grid-cols-3 gap-4 py-6 border-t border-gray-100"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#09391C]">1000+</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Active Projects</div>
              </div>
              <div className="text-center border-x border-gray-100">
                <div className="text-2xl sm:text-3xl font-bold text-[#09391C]">500+</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Verified Developers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#09391C]">95%</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Sales Success</div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#09391C] mb-1">
                    Ready to showcase your development?
                  </h3>
                  <p className="text-sm text-gray-500">
                    Join hundreds of developers reaching more buyers today.
                  </p>
                </div>
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center gap-2 bg-[#09391C] hover:bg-[#0B423D] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <DocumentVerificationPromoSection />

        {/* Additional Info Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8DDB90]/20 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-[#09391C]" />
            </div>
            <h3 className="font-semibold text-[#09391C] mb-2">Project Showcase</h3>
            <p className="text-sm text-gray-500">
              Create detailed project pages with photos, floor plans, and virtual tours.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8DDB90]/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-[#09391C]" />
            </div>
            <h3 className="font-semibold text-[#09391C] mb-2">Lead Management</h3>
            <p className="text-sm text-gray-500">
              Track inquiries, manage leads, and convert prospects into buyers efficiently.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 border border-gray-100 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8DDB90]/20 flex items-center justify-center mb-4">
              <HardHat className="w-5 h-5 text-[#09391C]" />
            </div>
            <h3 className="font-semibold text-[#09391C] mb-2">Agent Network</h3>
            <p className="text-sm text-gray-500">
              Partner with verified agents who can promote your projects to their network.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForDevelopersShowcase;
