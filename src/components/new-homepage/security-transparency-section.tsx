/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SecurityTransparencySection = () => {
  const securityFeatures = [
    {
      title: "Document Verification",
      description: "Professional verification of property documents for ₦20,000",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-blue-500"
    },
    {
      title: "Secure Payments",
      description: "SSL-encrypted transactions with trusted payment partners",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-green-500"
    },
    {
      title: "Data Protection",
      description: "Your personal information is protected with bank-level security",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-purple-500"
    },
    {
      title: "Legal Compliance",
      description: "Fully compliant with Nigerian real estate regulations",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-red-500"
    }
  ];

  const documentTypes = [
    "Certificate of Occupancy",
    "Deed of Partition",
    "Deed of Assignment",
    "Governor's Consent",
    "Survey Plan",
    "Deed of Lease"
  ];

  const securityBadges = [
    { name: "SSL Secured", icon: "🔒" },
    { name: "Data Encrypted", icon: "🛡️" },
    { name: "GDPR Compliant", icon: "✅" },
    { name: "ISO Certified", icon: "🏆" }
  ];

  return (
    <section className='w-full py-16 md:py-24 bg-[#09391C]'>
      <div className='container mx-auto px-4 md:px-8'>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-display'>
            Security & Transparency
          </h2>
          <p className='text-lg md:text-xl text-gray-200 max-w-3xl mx-auto'>
            Your trust is our priority. We've built comprehensive security measures to protect your investments and personal information.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group hover:scale-105'>
              
              <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              <h3 className='text-xl font-bold text-white mb-4'>
                {feature.title}
              </h3>

              <p className='text-gray-200 leading-relaxed'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Document Verification Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 mb-16'>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            
            {/* Content */}
            <div>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-6'>
                Professional Document Verification
              </h3>
              <p className='text-gray-200 text-lg mb-8 leading-relaxed'>
                Protect your investment with our comprehensive document verification service. Our legal experts review all property documents to ensure authenticity and compliance.
              </p>

              {/* Price highlight */}
              <div className='bg-[#8DDB90] rounded-2xl p-6 mb-8'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-white font-bold text-xl mb-2'>Document Verification Service</h4>
                    <p className='text-white/80'>Complete legal document review</p>
                  </div>
                  <div className='text-right'>
                    <div className='text-3xl font-bold text-white'>₦20,000</div>
                    <div className='text-white/80 text-sm'>per property</div>
                  </div>
                </div>
              </div>

              <Link href="/document-verification">
                <button className='bg-white text-[#09391C] px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 text-sm sm:text-base md:text-lg flex items-center justify-center min-h-[48px] sm:min-h-[56px]'>
                  <span className="whitespace-nowrap">Learn More About Verification</span>
                </button>
              </Link>
            </div>

            {/* Document Types */}
            <div>
              <h4 className='text-xl font-bold text-white mb-6'>Documents We Verify:</h4>
              <div className='grid grid-cols-1 gap-4'>
                {documentTypes.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className='flex items-center gap-3 bg-white/5 rounded-lg p-4'>
                    <svg className="w-5 h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className='text-white'>{doc}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center'>
          
          <h3 className='text-xl md:text-2xl font-bold text-white mb-8'>
            Your Security is Our Priority
          </h3>

          <div className='flex flex-wrap justify-center items-center gap-6'>
            {securityBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border border-white/20'>
                <span className='text-2xl'>{badge.icon}</span>
                <span className='font-medium text-white'>{badge.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Privacy note */}
          <p className='text-gray-300 text-sm mt-8 max-w-2xl mx-auto'>
            We never share your personal information with third parties. All data is encrypted and stored securely according to international standards. Read our{' '}
            <Link href="/policies_page" className='text-[#8DDB90] hover:underline'>
              Privacy Policy
            </Link>{' '}
            for more details.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SecurityTransparencySection;
