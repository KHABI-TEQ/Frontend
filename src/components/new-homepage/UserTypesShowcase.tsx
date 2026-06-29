/** @format */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, Search, ArrowRight, Check, Home } from 'lucide-react';

const userTypes = [
  {
    id: 'landlords',
    icon: Home,
    title: 'For Landlords',
    headline: 'Your property, your rules.',
    lead: 'List your property for sale, rent, shortlet, or joint venture. Add details easily and reach more serious buyers.',
    bullets: [
      'List up to 25 properties included (Portfolio Unlimited available for larger portfolios)',
      'Let agents request to promote your listing you decide',
      'More visibility through multiple agents',
      'Support for document checks to build trust',
      'Set your own agent commission where needed',
    ],
    cta: 'List a property',
    ctaUrl: '/post-property',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'developers',
    icon: Building2,
    title: 'For Developers',
    headline: 'Show your project. Find the right partners.',
    lead: 'List your projects and joint ventures easily. Turn simple descriptions into full listings and reach serious investors.',
    bullets: [
      'First listing is free',
      'Control who can market your project',
      'Build trust with document verification',
      'Get more visibility through agents',
      'Manage different project types in one place',
      'Connect with buyers looking for your kind of property',
    ],
    cta: 'Publish a project',
    ctaUrl: '/post-property',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'agents',
    icon: Users,
    title: 'For Agents',
    headline: 'Grow your business your way.',
    lead: 'Manage listings, attract clients, and promote properties — all from your own Practitioner page.',
    bullets: [
      'First listing is free',
      'Get your own Practitioner page with your listings',
      'Request to promote landlord and developer properties',
      'Confirm property locations on the map',
      'Help clients with trusted, verified listings',
      'Easy listing creation with AI support',
      'Manage inspections and client requests',
      'Match buyers with available properties',
    ],
    cta: 'Activate your Practitioner Page',
    ctaUrl: '/agent-marketplace',
    color: 'from-[#8DDB90] to-emerald-600',
    bgColor: 'bg-[#f0fdf4]',
    iconBg: 'bg-[#dcfce7]',
    iconColor: 'text-[#16a34a]',
  },
  {
    id: 'buyers',
    icon: Search,
    title: 'For Clients & Buyers',
    headline: 'Tell us what you want.',
    lead: 'Looking to buy, rent, or invest? Just tell us in simple words. We help you find matching properties faster.',
    bullets: [
      'Describe what you need in simple terms',
      'Get matched with available properties',
      'Check property location on the map',
      'Book inspections easily',
      'Browse from the main site or agent pages',
      'Follow simple steps for secure transactions',
    ],
    cta: 'Submit a preference',
    ctaUrl: '/preference',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function UserTypesShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A3E72] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Who is <span className="text-[#8DDB90]">Khabiteq</span> For?
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Simple tools for everyone in real estate — from listing to closing.
              Choose your path and get started today.
            </p>
          </motion.div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* User Types Cards */}
      <section className="py-16 sm:py-24 -mt-8 relative z-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {userTypes.map((userType) => {
              const Icon = userType.icon;
              return (
                <motion.div
                  key={userType.id}
                  variants={itemVariants}
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100`}
                >
                  {/* Top gradient bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${userType.color}`} />
                  
                  <div className="p-8 sm:p-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${userType.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${userType.iconColor}`} />
                    </div>

                    {/* Title */}
                    <p className={`text-sm font-semibold ${userType.iconColor} uppercase tracking-wider mb-2`}>
                      {userType.title}
                    </p>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-[#09391C] transition-colors">
                      {userType.headline}
                    </h2>

                    {/* Lead */}
                    <p className="text-gray-600 text-base leading-relaxed mb-6">
                      {userType.lead}
                    </p>

                    {/* Bullets */}
                    <ul className="space-y-3 mb-8">
                      {userType.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 ${userType.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className={`w-3 h-3 ${userType.iconColor}`} />
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Link
                      href={userType.ctaUrl}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${userType.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group/btn`}
                    >
                      <span>{userType.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Background decoration */}
                  <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${userType.iconBg} rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#09391C] mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you are listing, buying, or representing clients, Khabiteq gives you the tools to move with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/post-property"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#09391C] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Building2 className="w-5 h-5" />
                <span>List a Property</span>
              </Link>
              <Link
                href="/preference"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-[#09391C] font-semibold border-2 border-[#09391C] hover:bg-[#09391C] hover:text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                <span>Find a Property</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
