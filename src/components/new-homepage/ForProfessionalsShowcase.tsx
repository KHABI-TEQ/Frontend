'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const howItWorks = [
  {
    step: '01',
    title: 'Create Your Professional Presence',
    body: 'Build a structured profile where clients, property seekers and property owners can view your professional information, credentials, services and areas of expertise.',
  },
  {
    step: '02',
    title: 'Access Demand & Opportunities',
    body: 'Discover where your expertise may be needed, access relevant client and service opportunities, and review unmatched property requests through tools such as the Agent Marketplace.',
  },
  {
    step: '03',
    title: 'Participate in Property Transactions',
    body: 'Provide professional services, request to market properties and participate in relevant property transactions and collaborations through Khabiteq.',
  },
];

const ForProfessionalsShowcase = () => {
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
            <span className="text-[#09391C] font-medium">Real Estate Professionals</span>
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#09391C]/10 text-[#09391C] rounded-full text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            For Real Estate Professionals
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
                Build your digital practice.
                <br />
                Access real opportunities.
              </h1>
              <p className="text-lg sm:text-xl text-[#D6DDEB] max-w-3xl leading-relaxed">
                Create your professional presence and access tools designed to help you
                showcase your expertise, discover property demand and participate in
                opportunities across the Khabiteq ecosystem.
              </p>
            </motion.div>
          </div>

          <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <motion.h2
              variants={itemVariants}
              className="text-lg sm:text-xl font-semibold text-[#09391C] mb-8"
            >
              How it works
            </motion.h2>

            <div className="space-y-5">
              {howItWorks.map((item) => (
                <motion.div
                  key={item.step}
                  variants={itemVariants}
                  className="flex gap-4 sm:gap-5 p-5 rounded-2xl bg-[#F8FAF8] hover:bg-[#EEF1F1] transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#09391C] text-white font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#09391C] text-base sm:text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-gray-100"
            >
              <h3 className="text-lg font-semibold text-[#09391C] mb-2">
                Ready to build your practice?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl">
                Create your professional profile and access the tools and opportunities
                available within the Khabiteq ecosystem.
              </p>
              <Link
                href="/for-professionals/tools"
                className="group inline-flex items-center gap-2 bg-[#09391C] hover:bg-[#0B423D] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore your tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForProfessionalsShowcase;
