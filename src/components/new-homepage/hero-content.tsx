/** @format */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../general-components/button';
import Link from 'next/link';

interface HeroContentProps {
  showTrustStrip?: boolean;
  className?: string;
}

export default function HeroContent({ showTrustStrip = true, className = '' }: HeroContentProps) {
  return (
    <div className={`max-w-4xl mx-auto text-center ${className}`}>
      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className='text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white mb-5 sm:mb-6 leading-[1.1] tracking-tight'>
        List smarter. Match faster.{' '}
        <span className='text-[#8DDB90]'>Close with confidence</span>.
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className='text-lg sm:text-xl md:text-xl lg:text-2xl text-white/90 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed'>
        Khabi-Teq connects landlords, developers, agents, and buyers on one platform — with simple tools that help you list properties, find what you need, and take action faster.
      </motion.p>

      {/* Primary and Secondary CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
        <Link href="/auth/register" className='w-full sm:w-auto'>
          <Button
            green={true}
            className='w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-[#0B423D] bg-[#8DDB90] hover:bg-[#7BC87F] transition-all duration-200 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-center flex items-center justify-center whitespace-nowrap rounded-lg'>
            Get started
          </Button>
        </Link>
        <Link href="#how-it-works" className='w-full sm:w-auto'>
          <Button
            green={false}
            className='w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 transition-all duration-200 hover:-translate-y-0.5 text-center flex items-center justify-center whitespace-nowrap rounded-lg backdrop-blur-sm'>
            See how it works
          </Button>
        </Link>
      </motion.div>

      {/* Trust Strip */}
      {showTrustStrip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='mt-10 sm:mt-12 text-center'>
          <p className='text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed'>
            Built for Nigeria — simple property listings, trusted processes, and tools that connect people to real opportunities.
          </p>
        </motion.div>
      )}
    </div>
  );
}
