'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FileCheck } from 'lucide-react';

const DOCUMENT_TYPES = [
  'Certificate of Occupancy',
  'Deed of Assignment',
  "Governor's Consent",
  'Survey Plan',
  'Deed of Lease',
  'Deed of Partition',
];

const DocumentVerificationPromoSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative mt-8 rounded-3xl overflow-hidden bg-[#09391C] border border-[#09391C]/80 shadow-xl shadow-[#09391C]/20"
      aria-labelledby="document-verification-promo-heading"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.12]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#8DDB90] rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#8DDB90] rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative px-6 sm:px-10 lg:px-14 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#8DDB90] text-xs font-semibold tracking-wide uppercase mb-5">
              <FileCheck className="w-3.5 h-3.5" aria-hidden />
              Trusted by buyers & sellers
            </div>

            <h2
              id="document-verification-promo-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-display leading-tight mb-4"
            >
              Professional document verification
            </h2>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed mb-8">
              Protect every transaction with expert review of property titles and legal paperwork — the same service highlighted on our homepage.
            </p>

            <div className="bg-[#8DDB90] rounded-2xl p-5 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-lg sm:text-xl">Full legal document review</p>
                  <p className="text-white/85 text-sm mt-1">Per property · transparent pricing</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl sm:text-4xl font-bold text-white">₦20,000</p>
                  <p className="text-white/85 text-sm">per verification</p>
                </div>
              </div>
            </div>

            <Link
              href="/document-verification"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-[#09391C] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors duration-300 min-h-[52px] shadow-lg shadow-black/10"
            >
              Verify documents now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-5">Documents we verify</h3>
            <ul className="grid grid-cols-1 gap-3">
              {DOCUMENT_TYPES.map((doc) => (
                <li
                  key={doc}
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white text-sm sm:text-base"
                >
                  <svg
                    className="w-5 h-5 text-[#8DDB90] shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DocumentVerificationPromoSection;
