'use client';
import React from 'react';
import Link from 'next/link';

const PublicProfileFallback: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-[#09391C] mb-2">Profile Not Found</h1>
        <p className="text-[#5A5D63] mb-6">{message || 'The public profile you are looking for does not exist or the link is invalid.'}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 bg-[#8DDB90] text-white rounded-lg">Go Home</Link>
          <Link href="/market-place" className="px-4 py-2 border border-gray-200 rounded-lg">Browse Properties</Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileFallback;
