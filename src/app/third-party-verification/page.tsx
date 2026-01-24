"use client"
import React, { useState } from 'react';
import { AlertTriangle, FileX, ExternalLink, Search, ArrowRight, Shield, CheckCircle, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DocumentVerificationLandingPage() {
  const [documentId, setDocumentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleDocumentSearch = async () => {
    if (!documentId.trim()) {
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      router.push(`/third-party-verification/${documentId.trim()}`);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDocumentSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#0B423D] to-[#8DDB90] mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Document Verification Portal
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Secure, trusted, and reliable document verification for real estate transactions in Nigeria.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Access Document Verification
            </h2>
            <p className="text-gray-600">
              Enter your document verification ID to access the verification portal
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Document ID (e.g., DOC-123456789)"
                  className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] text-lg font-mono"
                />
                <Search className="absolute left-4 top-4.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleDocumentSearch}
                disabled={!documentId.trim() || isSearching}
                className="px-6 py-4 bg-gradient-to-r from-[#0B423D] to-[#8DDB90] text-white font-semibold rounded-xl hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="hidden sm:inline">Verify Document</span>
                    <span className="sm:hidden">Verify</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                )}
              </button>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-amber-800 mb-1">
                    Document ID Format
                  </h3>
                  <p className="text-sm text-amber-700">
                    Document IDs are provided in your verification email and typically follow the format:
                    <br />
                    <code className="bg-amber-100 px-2 py-1 rounded text-xs font-mono mt-1 inline-block">
                      DOC-XXXXXXXXX or similar
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8DDB90] mb-4">
              <Search className="h-6 w-6 text-[#0B423D]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Enter Document ID</h3>
            <p className="text-gray-600 text-sm">
              Use the verification ID provided in your email to access the document portal.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8DDB90] mb-4">
              <FileText className="h-6 w-6 text-[#0B423D]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Review Documents</h3>
            <p className="text-gray-600 text-sm">
              Access and review all submitted documents with preview and download options.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8DDB90] mb-4">
              <CheckCircle className="h-6 w-6 text-[#0B423D]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Submit Verification</h3>
            <p className="text-gray-600 text-sm">
              Complete the verification process and submit your professional assessment report.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 text-center">
            Why Choose Our Verification Platform?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#0B423D] mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Bank-Grade Security</h3>
              <p className="text-sm text-gray-600">
                End-to-end encryption and secure document handling
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#0B423D] mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                Quick verification with real-time status updates
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#0B423D] mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Trusted Results</h3>
              <p className="text-sm text-gray-600">
                Professional verification by certified experts
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#0B423D] mb-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Detailed Reports</h3>
              <p className="text-sm text-gray-600">
                Comprehensive verification reports and documentation
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-[#0B423D] text-white rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="space-y-2">
              <p className="font-medium">24/7 Verification Support</p>
              <a
                href="tel:+2348012345678"
                className="text-[#8DDB90] hover:underline font-medium block"
              >
                +234 (0) 801 234 5678
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Email Support</p>
              <a
                href="mailto:info@khabiteqrealty.com"
                className="text-[#8DDB90] hover:underline font-medium block"
              >
                info@khabiteqrealty.com
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#8DDB90]/30">
            <a
              href="https://khabiteqrealty.com"
              className="inline-flex items-center space-x-2 text-[#8DDB90] hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Return to Khabiteq Realty Main Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
