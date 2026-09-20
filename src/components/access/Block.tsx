'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

interface BlockProps {
  title: string;
  message: string;
  actionHref: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  icon: React.ReactNode;
}

const Block: React.FC<BlockProps> = ({
  title,
  message,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  icon,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F8] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm"
      >
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-[#0C1E1B] mb-2">{title}</h2>
        <p className="text-[#4F5B57] mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={actionHref}
            className="bg-[#0B572B] hover:bg-[#094C25] text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors"
          >
            {actionLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="border border-[#0B572B] text-[#0B572B] px-6 py-3 rounded-lg font-medium inline-block hover:bg-[#F4FBF5] transition-colors"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default Block;
