/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Keyboard } from 'lucide-react';

const AIAdvantageSection = () => {
  return (
    <section className='w-full py-16 sm:py-20 bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A3E72] relative overflow-hidden'>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />

      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className='text-center mb-10 sm:mb-12'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight'>
            Speak or type — <span className="text-[#8DDB90]">we make it work</span>.
          </h2>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto'>
          {/* For Property Owners */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className='group bg-white/8 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-white/20 hover:bg-white/12 transition-all duration-300 hover:-translate-y-1'
          >
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-11 h-11 bg-gradient-to-br from-[#8DDB90] to-[#6BC76F] rounded-xl flex items-center justify-center shadow-lg shadow-[#8DDB90]/20 group-hover:shadow-xl group-hover:shadow-[#8DDB90]/30 transition-all duration-300 group-hover:scale-105'>
                <Mic className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-white'>Landlords, developers, agents</h3>
            </div>
            <p className='text-white/80 leading-relaxed text-base'>
              Describe your property in simple words. We help you turn it into a complete listing.
            </p>
          </motion.div>

          {/* For Buyers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className='group bg-white/8 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-white/20 hover:bg-white/12 transition-all duration-300 hover:-translate-y-1'
          >
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-11 h-11 bg-gradient-to-br from-[#8DDB90] to-[#6BC76F] rounded-xl flex items-center justify-center shadow-lg shadow-[#8DDB90]/20 group-hover:shadow-xl group-hover:shadow-[#8DDB90]/30 transition-all duration-300 group-hover:scale-105'>
                <Keyboard className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-white'>Buyers & investors</h3>
            </div>
            <p className='text-white/80 leading-relaxed text-base'>
              Tell us what you want. We help you fill everything correctly before you submit.
            </p>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className='text-center text-white/60 mt-8 sm:mt-10 text-sm sm:text-base'
        >
          Use voice or type — same easy result.
        </motion.p>
      </div>
    </section>
  );
};

export default AIAdvantageSection;
