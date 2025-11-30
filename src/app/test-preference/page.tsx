/** @format */

"use client";
import React from "react";
import Link from "next/link";

const TestPreferencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Preference Flows
          </h1>
          <p className="text-xl text-gray-600">
            Test all preference types to ensure they work correctly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Buy Property */}
          <Link href="/preference?type=buy" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent group-hover:border-emerald-500 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Buy Property
                </h3>
                <p className="text-sm text-gray-600">
                  Test buying property preferences with land size and document types
                </p>
              </div>
            </div>
          </Link>

          {/* Rent Property */}
          <Link href="/preference?type=rent" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent group-hover:border-blue-500 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏡</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Rent Property
                </h3>
                <p className="text-sm text-gray-600">
                  Test rental preferences without land size requirements
                </p>
              </div>
            </div>
          </Link>

          {/* Joint Venture */}
          <Link href="/preference?type=joint-venture" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent group-hover:border-purple-500 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏗</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Joint Venture
                </h3>
                <p className="text-sm text-gray-600">
                  Test joint venture with company details and land conditions
                </p>
              </div>
            </div>
          </Link>

          {/* Shortlet */}
          <Link href="/preference?type=shortlet" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent group-hover:border-amber-500 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏘</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Shortlet
                </h3>
                <p className="text-sm text-gray-600">
                  Test shortlet with dates, guests, and special requirements
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Testing Checklist
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                General Flow
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Step navigation works correctly</li>
                <li>✓ Form validation shows appropriate errors</li>
                <li>✓ Data persists between steps</li>
                <li>✓ Form resets properly when switching types</li>
                <li>✓ Submit button enables/disables correctly</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Type-Specific Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Buy: Land size + Document types required</li>
                <li>✓ Rent: Land size optional, yearly budget</li>
                <li>✓ Joint Venture: Company details + Land conditions</li>
                <li>✓ Shortlet: Dates + Guest preferences</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-semibold text-gray-800 mb-2">
              Expected Fixes Applied:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fixed "Yealy" → "Yearly" typo in rent budget label</li>
              <li>• Made land size optional for rent properties</li>
              <li>• Fixed form state management and resets</li>
              <li>• Improved validation for each property type</li>
              <li>• Fixed duplicate validation logic</li>
              <li>• Enhanced shortlet-specific validations</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/preference" 
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Go to Main Preference Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPreferencePage;
