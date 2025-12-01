'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { archivo } from '@/styles/font';
import { motion } from 'framer-motion';
import { useSocialLinskSettings } from '@/hooks/useSystemSettings';
import khabiTeqIcon from '@/svgs/white-khabi-teq.svg';
import toast from 'react-hot-toast';
import SuccessModal from '@/components/modals/SuccessModal';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';

const NewFooter = ({ isComingSoon }: { isComingSoon?: boolean }) => {
  const exploreLinks = [
    { name: 'Buy Properties', url: '#' },
    { name: 'Rent Properties', url: '#' },
    { name: 'Sell Properties', url: '#' },
    { name: 'Joint Ventures', url: '#' },
    { name: 'Agent Marketplace', url: '#' }
  ];

  const servicesLinks = [
    { name: 'Document Verification', url: '#' },
    { name: 'Property Inspection', url: '#' },
    { name: 'Secure Transactions', url: '#' },
    { name: 'Agent Services', url: '#' },
    { name: 'Referral Program', url: '#' }
  ];

  const supportLinks = [
    { name: 'About Us', url: '/about_us' },
    { name: 'Contact Us', url: '/contact-us' },
    { name: 'FAQs', url: '/homepage#faqs' },
    { name: 'Privacy Policy', url: '/policies_page' },
    { name: 'Terms of Service', url: '/policies_page' }
  ];

  const defaultSocialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/khabiteq',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/khabiteq',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/khabiteq',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C3.85 14.826 3.85 13.018 5.126 11.99c1.276-1.028 3.084-1.028 4.36 0 1.276 1.028 1.276 2.836 0 3.864-.875.807-2.026 1.297-3.323 1.297zm7.518 0c-1.297 0-2.448-.49-3.323-1.297-1.276-1.028-1.276-2.836 0-3.864 1.276-1.028 3.084-1.028 4.36 0 1.276 1.028 1.276 2.836 0 3.864-.875.807-2.026 1.297-3.323 1.297z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/khabiteq',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@khabiteq',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ];

  const quickActions = [
    { name: 'Submit Property Preference', url: '/preference' },
    { name: 'Join as an Agent', url: '/agent-kyc' },
    { name: 'Verify Documents', url: '/document-verification' },
    { name: 'Browse Properties', url: '/market-place' }
  ];

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const { settings } = useSocialLinskSettings();

  const computedLinks = React.useMemo(() => {
    const map: Record<string, { name: string; icon: React.ReactNode }> = {
      facebook_url: {
        name: 'Facebook',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      },
      twitter_url: {
        name: 'Twitter',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        )
      },
      instagram_url: {
        name: 'Instagram',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C3.85 14.826 3.85 13.018 5.126 11.99c1.276-1.028 3.084-1.028 4.36 0 1.276 1.028 1.276 2.836 0 3.864-.875.807-2.026 1.297-3.323 1.297zm7.518 0c-1.297 0-2.448-.49-3.323-1.297-1.276-1.028-1.276-2.836 0-3.864 1.276-1.028 3.084-1.028 4.36 0 1.276 1.028 1.276 2.836 0 3.864-.875.807-2.026 1.297-3.323 1.297z"/>
          </svg>
        )
      },
      linkedin_url: {
        name: 'LinkedIn',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      },
      youtube_url: {
        name: 'YouTube',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      },
      tiktok_url: {
        name: 'TikTok',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.001 2h2.81c.308 2.046 1.64 3.774 3.398 4.635a7.53 7.53 0 003.79 1.003v3.018a10.54 10.54 0 01-4.2-.853 8.597 8.597 0 01-1.868-1.12v5.86c0 3.94-2.68 7.347-6.6 8.196-4.97 1.08-9.36-2.42-9.36-7.103 0-4.109 3.33-7.444 7.44-7.444.573 0 1.13.066 1.668.19v3.24a4.44 4.44 0 00-1.668-.32 4.204 4.204 0 00-4.2 4.2 4.204 4.204 0 004.2 4.2 4.204 4.204 0 004.2-4.2V2z"/>
          </svg>
        )
      },
      whatsapp_url: {
        name: 'WhatsApp',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.52 3.48A11.9 11.9 0 0012.04 0C5.54 0 .27 5.27.27 11.77c0 2.07.54 4.02 1.49 5.71L0 24l6.72-1.75a11.7 11.7 0 005.33 1.29h.01c6.5 0 11.77-5.27 11.77-11.77 0-3.15-1.23-6.11-3.31-8.29zM12.06 21.4h-.01a9.7 9.7 0 01-4.95-1.35l-.35-.21-3.99 1.04 1.07-3.88-.23-.4a9.7 9.7 0 01-1.43-5.08c0-5.38 4.38-9.76 9.77-9.76a9.72 9.72 0 016.9 2.85 9.69 9.69 0 012.85 6.9c0 5.38-4.38 9.76-9.77 9.76zm5.64-7.29c-.31-.16-1.84-.91-2.12-1.01-.28-.1-.48-.16-.68.16-.2.31-.78 1-.95 1.2-.17.2-.35.23-.66.08-.31-.16-1.3-.48-2.48-1.52-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.2.06-.39-.03-.55-.09-.16-.68-1.64-.93-2.25-.24-.58-.49-.5-.68-.51l-.58-.01a1.12 1.12 0 00-.81.38c-.28.31-1.07 1.04-1.07 2.55 0 1.51 1.1 2.97 1.26 3.17.15.2 2.16 3.3 5.23 4.62.73.32 1.3.51 1.74.65.73.23 1.4.2 1.93.12.59-.09 1.84-.75 2.1-1.47.26-.72.26-1.35.18-1.47-.08-.12-.28-.2-.59-.35z"/>
          </svg>
        )
      },
      telegram_url: {
        name: 'Telegram',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.04 15.507l-.376 5.302c.54 0 .775-.232 1.055-.51l2.53-2.422 5.24 3.84c.96.53 1.645.25 1.905-.89l3.45-16.15.001-.002c.305-1.415-.51-1.967-1.44-1.62L1.1 9.61C-.277 10.16-.256 10.94.87 11.29l5.17 1.61 11.99-7.56c.56-.34 1.07-.15.65.19L9.04 15.507z"/>
          </svg>
        )
      },
      website_url: {
        name: 'Website',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.938 9h-3.342a15.91 15.91 0 00-1.2-5.145A8.019 8.019 0 0119.938 11zM12 4c1.53 0 2.945.43 4.15 1.172A13.92 13.92 0 0117.86 11H6.14a13.92 13.92 0 011.71-5.828A7.958 7.958 0 0112 4zM4.062 13h3.342c.26 1.79.77 3.52 1.2 5.145A8.02 8.02 0 014.062 13zM9.8 13h4.4a18.2 18.2 0 01-1.2 4.84c-.402.976-.85 1.795-1.002 2.03-.152-.235-.6-1.054-1.001-2.03A18.2 18.2 0 019.8 13zm6.798 5.145c.432-1.625.94-3.356 1.2-5.145h3.342a8.02 8.02 0 01-4.542 5.145z"/>
          </svg>
        )
      }
    };

    const links: { name: string; url: string; icon: React.ReactNode }[] = [];
    Object.entries(map).forEach(([key, def]) => {
      const url = (settings as any)?.[key as keyof typeof settings];
      if (typeof url === 'string' && url.trim()) {
        links.push({ name: def.name, url: url.trim(), icon: def.icon });
      }
    });
    return links;
  }, [settings]);

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    const isValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmed);
    if (!isValid) {
      toast.error('Please enter a valid email');
      return;
    }
    try {
      setIsSubmitting(true);
      await POST_REQUEST(`${URLS.BASE}/emailSubscription/subscribe`, { email: trimmed });
      setSuccessOpen(true);
      setEmail('');
    } catch (e: any) {
      toast.error(e?.message || 'Subscription failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`bg-[#0B423D] w-full ${isComingSoon && 'filter blur-sm'}`}>
      <div className='container mx-auto px-4 md:px-8 py-16'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12'>
          {/* Company Info */}
          <div className='lg:col-span-2'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}>
              <Image
                src={khabiTeqIcon}
                width={169}
                height={35}
                alt='Khabiteq Logo'
                className='mb-6'
              />
              <p className={`text-[#D6DDEB] text-base leading-relaxed mb-6 max-w-md ${archivo.variable}`}>
                Simplifying real estate transactions in Nigeria. Buy, sell, rent, and manage properties with ease through Khabi-Teq&apos;s trusted platform. Verified agents, secure transactions, and transparent deals.
              </p>
              {/* Quick Actions */}
              <div className='space-y-3'>
                <h4 className={`text-white font-semibold text-lg mb-4 ${archivo.variable}`}>
                  Quick Actions
                </h4>
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.url}
                    className='block text-[#8DDB90] hover:text-white transition-colors duration-300 text-sm font-medium'>
                    → {action.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Explore */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}>
              <h3 className={`text-white font-semibold text-lg mb-6 ${archivo.variable}`}>
                Explore
              </h3>
              <div className='space-y-4'>
                {exploreLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className={`block text-[#D6DDEB] hover:text-white transition-colors duration-300 text-base ${archivo.variable}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Services */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}>
              <h3 className={`text-white font-semibold text-lg mb-6 ${archivo.variable}`}>
                Services
              </h3>
              <div className='space-y-4'>
                {servicesLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className={`block text-[#D6DDEB] hover:text-white transition-colors duration-300 text-base ${archivo.variable}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
              {/* Contact Info */}
              <div className='mt-6 pt-6 border-t border-white/20'>
                <div className='space-y-2'>
                  <p className="text-[#D6DDEB] text-sm">
                    📧 info@khabiteqrealty.com
                  </p>
                  <p className="text-[#D6DDEB] text-sm">
                    📞 +234 813 210 8659, 02013306352
                  </p>
                  <p className="text-[#D6DDEB] text-sm">
                    📍 Lagos, Nigeria
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className='bg-white/5 rounded-2xl p-6 md:p-8 mb-12'>
          <div className='text-center md:text-left md:flex md:items-center md:justify-between'>
            <div className='mb-6 md:mb-0'>
              <h4 className={`text-white font-bold text-xl mb-2 ${archivo.variable}`}>
                Stay Updated with Property Deals
              </h4>
              <p className="text-[#D6DDEB]">
                Get notified about new properties, market insights, and exclusive offers.
              </p>
            </div>
            <div className='flex gap-3 max-w-md md:max-w-none'>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='flex-1 px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DDB90]'
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className='bg-[#8DDB90] hover:bg-[#7BC87F] disabled:opacity-60 text-white px-4 sm:px-6 py-3 rounded-full font-medium transition-colors duration-300 whitespace-nowrap text-sm sm:text-base flex items-center justify-center min-h-[48px]'
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className='border-t border-white/20 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}>
              <p className={`text-gray-400 text-center md:text-left ${archivo.variable}`}>
                © {new Date().getFullYear()} Khabiteq Realty Limited. All rights reserved.
              </p>
            </motion.div>
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className='flex items-center gap-4'>
              <span className="text-[#D6DDEB] text-sm mr-2">
                Follow us:
              </span>
              {(computedLinks.length ? computedLinks : defaultSocialLinks).map((social, index) => (
                <Link
                  key={index}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#D6DDEB] hover:bg-[#8DDB90] hover:text-white transition-all duration-300 hover:scale-110'
                  title={social.name}>
                  {social.icon}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="You're subscribed!"
        message="Thank you. We'll send property deals and updates to your inbox."
      />
    </footer>
  );
};

export default NewFooter;
