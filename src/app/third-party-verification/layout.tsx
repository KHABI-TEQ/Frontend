'use client';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import '../globals.css';

// Verification Portal Header Component
const VerificationHeader = () => {
  return (
    <header className="bg-gradient-to-r from-[#0B423D] via-[#0B423D] to-[#8DDB90] text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-24 gap-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-lg">
              <img
                src="/khabi-teq.svg"
                alt="Khabi-Teq"
                className="h-6 sm:h-8 w-auto"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Document Verification Portal
              </h1>
              <p className="text-[#8DDB90] font-medium text-sm sm:text-base">
                Secure • Trusted • Verified
              </p>
            </div>
          </div>

          {/* Security Indicators */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* SSL Indicator */}
            <div className="flex items-center space-x-2 bg-[#8DDB90] px-3 py-2 rounded-full">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-white">SSL Secured</span>
            </div>

            {/* Real-time Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#8DDB90] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[#8DDB90]">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Verification Portal Footer Component
const VerificationFooter = () => {
  return (
    <footer className="bg-[#0B423D] text-white border-t-4 border-[#8DDB90]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="bg-[#8DDB90] p-2 rounded-lg">
                <img
                  src="/khabi-teq.svg"
                  alt="Khabi-Teq"
                  className="h-6 w-auto"
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Khabiteqrealty</h3>
                <p className="text-[#8DDB90] font-medium">Document Verification Services</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-lg text-center sm:text-left">
              Nigeria&apos;s leading document verification platform. We provide secure, fast, and reliable
              verification services for real estate documents across Lagos and Ogun State.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 bg-[#0B423D]/80 border border-[#8DDB90]/30 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                <span className="text-xs text-gray-300">Verified Platform</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#0B423D]/80 border border-[#8DDB90]/30 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                <span className="text-xs text-gray-300">Bank Grade Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#0B423D]/80 border border-[#8DDB90]/30 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                <span className="text-xs text-gray-300">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h4 className="text-lg font-semibold text-[#8DDB90]">Verification Services</h4>
            <ul className="space-y-2 sm:space-y-3 text-sm text-gray-300">
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
                <span>Certificate of Occupancy</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
                <span>Deed of Assignment</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
                <span>Governor&apos;s Consent</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
                <span>Survey Plan Documents</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h4 className="text-lg font-semibold text-[#8DDB90]">Verification Support</h4>
            <div className="space-y-3 sm:space-y-4 text-sm text-gray-300">
              <div className="space-y-1 sm:space-y-2">
                <p className="font-medium text-white">24/7 Verification Hotline</p>
                <a href="tel:+2348012345678" className="text-[#8DDB90] hover:underline block">
                  +234 813 210 8659
                </a>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <p className="font-medium text-white">Email Support</p>
                <a href="mailto:info@khabiteqrealty.com" className="text-[#8DDB90] hover:underline block">
                  info@khabiteqrealty.com
                </a>
              </div>

              <div className="bg-[#0B423D]/60 border border-[#8DDB90]/20 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Business Hours</p>
                <p className="text-xs sm:text-sm font-medium text-white">Mon-Fri: 8AM-8PM</p>
                <p className="text-xs sm:text-sm font-medium text-white">Sat: 9AM-5PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#8DDB90]/30 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div className="text-xs sm:text-sm text-gray-400 text-center lg:text-left">
              <p>
                © {new Date().getFullYear()} Khabiteqrealty Limited. All rights reserved.
              </p>
              <p className="mt-1 hidden sm:block">Licensed Document Verification Provider • Registration No: RC-7378200</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#8DDB90] rounded-full animate-pulse"></div>
                <span className="text-xs text-[#8DDB90] font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function ThirdPartyVerificationLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Completely hide the main application layout
    const hideMainLayout = () => {
      // Hide the entire main app wrapper
      const mainAppWrapper = document.querySelector('body > div:first-child');
      if (mainAppWrapper && !(mainAppWrapper as HTMLElement).hasAttribute('data-verification-portal')) {
        (mainAppWrapper as HTMLElement).style.display = 'none !important';
      }

      // Hide specific elements by class names that might be visible
      const elementsToHide = [
        'header',
        'nav',
        'footer',
        '[data-header]',
        '[data-footer]',
        '[data-navigation]'
      ];

      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!(element as HTMLElement).closest('[data-verification-portal]')) {
            (element as HTMLElement).style.display = 'none';
          }
        });
      });

      // Set body styles for the verification portal
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.background = '#EEF1F1';
    };

    // Apply immediately and also after delays to catch dynamic content
    hideMainLayout();
    const timer1 = setTimeout(hideMainLayout, 100);
    const timer2 = setTimeout(hideMainLayout, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      // Restore body styles on cleanup
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.background = '';
    };
  }, []);

  return (
    <div
      data-verification-portal
      className="fixed inset-0 bg-[#EEF1F1] flex flex-col z-[99999] overflow-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999
      }}
    >
      {/* Verification Portal Header */}
      <VerificationHeader />

      {/* Main Content Area */}
      <main className="flex-grow bg-[#EEF1F1]">
        {children}
      </main>

      {/* Verification Portal Footer */}
      <VerificationFooter />

      {/* Enhanced Toast Notifications with Khabi-Teq colors */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#0B423D',
            color: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(11, 66, 61, 0.4)',
            border: '1px solid #8DDB90',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            style: {
              background: '#8DDB90',
              color: '#0B423D',
            },
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}
