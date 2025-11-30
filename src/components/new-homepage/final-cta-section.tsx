/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const FinalCTASection = () => {
  const quickActions = [
    {
      title: "I want to buy",
      description: "Find your perfect property",
      link: "/preference",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      )
    },
    {
      title: "I want to rent",
      description: "Browse rental properties",
      link: "/market-place?tab=rent",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: "I want to sell",
      description: "List your property",
      link: "/post-property",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: "I'm an agent",
      description: "Join our network",
      link: "/agent-onboard",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      )
    }
  ];

  return (
    <section className='w-full py-16 md:py-24 bg-gradient-to-br from-[#8DDB90] via-[#7BC87F] to-[#6BB26F] relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
      
      <div className='container mx-auto px-4 md:px-8 relative z-10'>
        
        {/* Main CTA Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          
          <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight'>
            Whether you&apos;re buying, renting, or selling—
            <br />
            <span className='text-[#09391C]'>Khabiteq gets you there faster.</span>
          </h2>
          
          <p className='text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed'>
            Join thousands of satisfied customers who&apos;ve found their perfect properties through our verified network.
          </p>

          {/* Primary CTA Button */}
          <Link href="/preference">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-[#09391C] hover:bg-[#0B423D] text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl transition-all duration-300 transform hover:shadow-3xl'>
              Get Started Now
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='mb-16'>
          
          <h3 className='text-2xl md:text-3xl font-bold text-white text-center mb-8'>
            What are you looking to do?
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}>
                
                <Link href={action.link}>
                  <div className='bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 group cursor-pointer hover:scale-105'>
                    
                    <div className='text-white mb-4 group-hover:scale-110 transition-transform duration-300'>
                      {action.icon}
                    </div>
                    
                    <h4 className='text-lg font-bold text-white mb-2'>
                      {action.title}
                    </h4>
                    
                    <p className='text-white/80 text-sm'>
                      {action.description}
                    </p>
                    
                    <div className='flex items-center gap-2 mt-4 text-white group-hover:translate-x-2 transition-transform duration-300'>
                      <span className='text-sm font-medium'>Get started</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Urgency/Scarcity Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30 text-center'>
          
          <div className='flex flex-col md:flex-row items-center justify-center gap-8'>
            
            {/* Urgency content */}
            <div className='flex-1'>
              <h4 className='text-2xl font-bold text-white mb-4'>
                Don't Miss Out on Your Dream Property
              </h4>
              <p className='text-white/90 text-lg mb-6'>
                New properties are added daily. Submit your preference now to get instant notifications when your perfect match becomes available.
              </p>
              
              <div className='flex items-center justify-center gap-6 text-white/80'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>50+</div>
                  <div className='text-sm'>New listings daily</div>
                </div>
                <div className='w-px h-12 bg-white/30'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>24hrs</div>
                  <div className='text-sm'>Average response time</div>
                </div>
                <div className='w-px h-12 bg-white/30'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>95%</div>
                  <div className='text-sm'>Match success rate</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className='flex-shrink-0'>
              <Link href="/preference">
                <button className='bg-white text-[#8DDB90] px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg flex items-center justify-center min-h-[48px] sm:min-h-[56px]'>
                  <span className="whitespace-nowrap">Submit Preference</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
