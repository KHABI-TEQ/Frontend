/**
 * Public Page Design Settings
 * Customize hero section, CTA buttons, and page layout
 */

"use client";

import React from "react";
import { Palette } from "lucide-react";

export default function DesignPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Palette size={32} />
          Public Page Design
        </h1>
        <p className="text-gray-600 mt-2">
          Customize the look and feel of your public access page
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Design customization tools are being prepared. Check back soon!
        </p>
      </div>
    </div>
  );
}
