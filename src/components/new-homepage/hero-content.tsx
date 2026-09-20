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
        REAL ESTATE,
        <br />
        <span className='text-[#8DDB90]'>STRUCTURED FOR TRUST.</span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className='text-lg sm:text-xl md:text-xl lg:text-2xl text-white/90 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed'>
        Khabiteq helps property seekers and real estate professionals navigate a more structured property transaction journey, from finding the right opportunity to due diligence, inspection and transaction registration.
      </motion.p>

      {/* Primary and Secondary CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
        <Link href="/preference" className='w-full sm:w-auto'>
          <Button
            green={true}
            className='w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-[#0B423D] bg-[#8DDB90] hover:bg-[#7BC87F] transition-all duration-200 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-center flex items-center justify-center whitespace-nowrap rounded-lg'>
            SUBMIT YOUR PREFERENCE
          </Button>
        </Link>
        <Link href="/preference?insure=1" className='w-full sm:w-auto'>
          <Button
            green={false}
            className='w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 transition-all duration-200 hover:-translate-y-0.5 text-center flex items-center justify-center whitespace-nowrap rounded-lg backdrop-blur-sm'>
            INSURE YOUR SEARCH
          </Button>
        </Link>
        <Link href="/how-it-works" className='w-full sm:w-auto'>
          <Button
            green={false}
            className='w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 transition-all duration-200 hover:-translate-y-0.5 text-center flex items-center justify-center whitespace-nowrap rounded-lg backdrop-blur-sm'>
            HOW IT WORKS
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
            Built around a structured real estate journey — not another place to browse listings.
          </p>
        </motion.div>
      )}
    </div>
  );
}
