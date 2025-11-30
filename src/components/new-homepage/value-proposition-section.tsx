/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';

const ValuePropositionSection = () => {
  const valuePoints = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Verified Agents & Listings",
      description: "Every property is vetted and every agent is verified for your peace of mind."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
        </svg>
      ),
      title: "Instant Notifications",
      description: "Get matched the moment a property fits your needs with our smart alert system."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Flexible Inspections",
      description: "Book physical or virtual inspections at your convenience, with professional guidance."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      ),
      title: "Secure Transactions",
      description: "Document verification and safe payments ensure every deal is protected and transparent."
    }
  ];

  return (
    <section className='w-full py-16 md:py-24 bg-[#FFFEFB]'>
      <div className='container mx-auto px-4 md:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#09391C] mb-6 font-display'>
            Why Choose Khabiteq?
          </h2>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
            We've revolutionized the real estate experience with trust, technology, and transparency at the core.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
          {valuePoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='text-center group hover:scale-105 transition-transform duration-300'>
              
              {/* Icon */}
              <div className='w-16 h-16 mx-auto mb-6 bg-[#8DDB90] rounded-full flex items-center justify-center text-white group-hover:bg-[#7BC87F] transition-colors duration-300'>
                {point.icon}
              </div>

              {/* Title */}
              <h3 className='text-xl md:text-2xl font-bold text-[#09391C] mb-4'>
                {point.title}
              </h3>

              {/* Description */}
              <p className='text-gray-600 leading-relaxed'>
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='text-center mt-16'>
          <div className='inline-flex items-center gap-2 bg-[#8DDB901A] px-6 py-3 rounded-full'>
            <div className='w-2 h-2 bg-[#8DDB90] rounded-full animate-pulse'></div>
            <span className='text-[#09391C] font-medium'>
              Join thousands of satisfied customers
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
