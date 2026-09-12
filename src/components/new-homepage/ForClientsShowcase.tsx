'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, Shield, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const journeySteps = [
  {
    title: 'Share Your Requirements',
    body: 'Tell us your preferred location, budget, property type and other requirements.',
  },
  {
    title: 'Discover Suitable Opportunities',
    body: 'Explore property opportunities that align with what you\'re looking for.',
  },
  {
    title: 'Connect With Relevant Professionals',
    body: 'Access relevant real estate professionals to support your property journey.',
  },
  {
    title: 'Schedule Property Inspections',
    body: 'Arrange physical or virtual inspections when you\'re ready to explore a property further.',
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
            <span className="text-[#09391C] font-medium">For Clients</span>
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#09391C]/10 text-[#09391C] rounded-full text-sm font-medium">
            <User className="w-4 h-4" />
            For Clients
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
                YOUR PROPERTY SEARCH, STRUCTURED.
              </h1>
              <p className="text-lg sm:text-xl text-[#D6DDEB] max-w-3xl leading-relaxed mb-4">
                Tell Khabiteq what you&apos;re looking for and take the first step towards finding the right property opportunity.
              </p>
              <p className="text-base sm:text-lg text-[#D6DDEB]/90 max-w-3xl leading-relaxed">
                Whether you&apos;re looking to buy, rent, sell, shortlist or explore a joint venture opportunity, submit your requirements and navigate your journey with greater structure.
              </p>
            </motion.div>
          </div>

          <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C] mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#8DDB90]" />
                What your journey can look like
              </h2>
            </motion.div>

            <motion.ul
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {journeySteps.map((step) => (
                <motion.li
                  key={step.title}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAF8] hover:bg-[#EEF1F1] transition-colors duration-300 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8DDB90]/20 flex items-center justify-center mt-0.5 group-hover:bg-[#8DDB90]/30 transition-colors">
                    <Check className="w-4 h-4 text-[#09391C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#09391C] text-sm sm:text-base mb-1">
                      {step.title}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 bg-white rounded-3xl shadow-xl shadow-[#09391C]/5 border border-gray-100 overflow-hidden"
        >
          <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#09391C] mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#8DDB90]" />
                Licensed professional services
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#09391C] mb-4">
                Conduct Due Diligence With Confidence.
              </h3>
              <div className="space-y-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                <p>Already found a property you want to proceed with?</p>
                <p>
                  Connect with relevant licensed professionals for the legal, valuation, survey and other due-diligence services your property transaction may require.
                </p>
                <p>
                  View professional profiles, credentials, clearly stated services and subsidized pricing before hiring through Khabiteq.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6 mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[#09391C] mb-5">
                Services available through licensed professionals
              </h3>
            </motion.div>

            <motion.ul
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {licensedServices.map((service) => (
                <motion.li
                  key={service}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAF8] hover:bg-[#EEF1F1] transition-colors duration-300 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8DDB90]/20 flex items-center justify-center mt-0.5 group-hover:bg-[#8DDB90]/30 transition-colors">
                    <Check className="w-4 h-4 text-[#09391C]" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {service}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-3"
            >
              <Link
                href="/document-verification"
                className="group inline-flex items-center gap-2 bg-[#09391C] hover:bg-[#0B423D] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore professional services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/survey-services"
                className="inline-flex items-center gap-2 border border-[#09391C] text-[#09391C] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base"
              >
                Survey services
              </Link>
              <Link
                href="/licensed-agents"
                className="inline-flex items-center gap-2 border border-[#09391C] text-[#09391C] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base"
              >
                Find a professional
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForClientsShowcase;
