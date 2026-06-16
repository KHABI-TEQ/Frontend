/** @format */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, Search, Home, ArrowRight } from 'lucide-react';

const userTypes = [
  {
    id: 'landlords',
    icon: Home,
    title: 'Landlords',
    headline: 'Your property, your rules',
    description:
      'List up to 25 properties with no subscription—choose which verified agents market each one, and your contact stays private until you accept.',
    cta: 'List Property',
    ctaUrl: '/for-landlords',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    id: 'developers',
    icon: Building2,
    title: 'Developers',
    headline: 'Reach serious investors',
    description:
      'Publish developments with a dedicated project page and let verified agents request to promote them to qualified buyers.',
    cta: 'Publish Project',
    ctaUrl: '/for-developers',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'agents',
    icon: Users,
    title: 'Agents',
    headline: 'Every agent is the mandate',
    description:
      'Get your own Practitioner page, request to market landlord and developer listings, and earn commission when you close the deal. Listings on your page are auto-matched to buyer preferences, so qualified buyers discover your properties without extra effort.',
    cta: 'Activate Page',
    ctaUrl: '/agent-marketplace',
    color: 'from-[#8DDB90] to-emerald-600',
    bgColor: 'bg-[#f0fdf4]',
    iconBg: 'bg-[#dcfce7]',
    iconColor: 'text-[#16a34a]',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'buyers',
    icon: Search,
    title: 'Buyers & Clients',
    headline: 'Find your dream property',
    description:
      'Tell us what you want in plain words—get matched to verified listings and book inspections before you commit.',
    cta: 'Submit Preference',
    ctaUrl: '/preference',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
];

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
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AnimatedUserTypes() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#F5F7F9] to-white overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#09391C]/10 text-[#09391C] text-sm font-semibold mb-4">
            Who is Khabiteq For?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#09391C] mb-4 tracking-tight">
            Built for everyone in <span className="text-[#8DDB90]">real estate</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Simple tools for every role — from listing to closing
          </p>
        </div>

        {/* User Type Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;
            const isHovered = hoveredId === userType.id;
            const hasHover = hoveredId !== null;

            // When a card is hovered, it scales up; others scale down
            const scale = hasHover ? (isHovered ? 1.05 : 0.92) : 1;
            const opacity = hasHover ? (isHovered ? 1 : 0.6) : 1;

            return (
              <motion.div
                key={userType.id}
                variants={itemVariants}
                animate={{
                  scale,
                  opacity,
                  y: isHovered ? -12 : 0,
                }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                onMouseEnter={() => setHoveredId(userType.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative ${userType.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 border ${userType.borderColor} hover:shadow-2xl transition-shadow duration-500 cursor-pointer z-${isHovered ? 10 : 1}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${userType.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${userType.iconColor}`} />
                </div>

                {/* Title Badge */}
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${userType.color} text-white text-xs font-semibold mb-3`}>
                  {userType.title}
                </div>

                {/* Headline */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#09391C] transition-colors">
                  {userType.headline}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-5">
                  {userType.description}
                </p>

                {/* CTA Link */}
                <Link
                  href={userType.ctaUrl}
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${userType.iconColor} group-hover:gap-3 transition-all duration-300`}
                >
                  <span>{userType.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Decorative gradient blob */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${userType.color} rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Stats or Trust Indicators */}
        <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
          {[
            { value: '10K+', label: 'Properties Listed' },
            { value: '5K+', label: 'Active Agents' },
            { value: '50K+', label: 'Happy Clients' },
            { value: '98%', label: 'Satisfaction Rate' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#09391C]">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
