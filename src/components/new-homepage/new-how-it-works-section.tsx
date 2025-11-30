/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const NewHowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Submit your preference",
      description: "Tell us exactly what you're looking for - location, budget, property type, and features.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Receive property briefs",
      description: "Get instant notifications when properties matching your criteria become available.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
        </svg>
      )
    },
    {
      number: "03",
      title: "Inspect physically or virtually",
      description: "Book convenient inspections with verified agents, either in-person or through virtual tours.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Close the deal securely",
      description: "Complete your transaction with document verification, secure payments, and legal support.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <section className='w-full py-16 md:py-24 bg-[#0B423D]'>
      <div className='container mx-auto px-4 md:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-display'>
            How Khabiteq Works
          </h2>
          <p className='text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8'>
            From property search to closing deals - we&apos;ve simplified the entire real estate journey into 4 easy steps.
          </p>
          
          {/* "See it in Action" button */}
          <Link href="#demo-video">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='inline-flex items-center gap-2 bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-3 rounded-full font-medium transition-colors duration-300'>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              See it in Action
            </motion.button>
          </Link>
        </motion.div>

        {/* Steps Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='relative group'>
              
              {/* Connection line (desktop only) */}
              {index < steps.length - 1 && (
                <div className='hidden lg:block absolute top-20 left-full w-8 h-0.5 bg-[#8DDB90]/30 transform translate-x-4'></div>
              )}

              {/* Step Card */}
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105'>
                {/* Step Number */}
                <div className='w-12 h-12 bg-[#8DDB90] rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 group-hover:bg-[#7BC87F] transition-colors duration-300'>
                  {step.number}
                </div>

                {/* Icon */}
                <div className='text-[#8DDB90] mb-4 group-hover:text-[#7BC87F] transition-colors duration-300'>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className='text-xl font-bold text-white mb-4'>
                  {step.title}
                </h3>

                {/* Description */}
                <p className='text-gray-200 leading-relaxed'>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='text-center mt-16'>
          <div className='inline-flex flex-col sm:flex-row items-center gap-4'>
            <span className='text-white text-lg'>
              Ready to get started?
            </span>
            <Link href="/preference">
              <button className='bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 sm:px-6 md:px-8 py-3 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base md:text-lg flex items-center justify-center min-h-[48px]'>
                <span className="whitespace-nowrap">Submit Your Preference Now</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewHowItWorksSection;
