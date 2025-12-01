/**
 * Featured Listings Management
 * Select and manage which properties appear on your public page
 */

"use client";

import React from "react";
import { Star } from "lucide-react";

export default function FeaturedPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Star size={32} />
          Featured Listings
        </h1>
        <p className="text-gray-600 mt-2">
          Select which properties appear as featured on your public access page
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Featured listings management is being prepared. Check back soon!
        </p>
      </div>
    </div>
  );
}
