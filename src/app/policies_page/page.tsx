'use client';
import Button from '@/components/general-components/button';
import Loading from '@/components/loading-component/loading';
import { usePageContext } from '@/context/page-context';
import { useLoading } from '@/hooks/useLoading';
import React, { FC, Fragment, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, FileText, Shield, Zap, Users, DollarSign, AlertCircle } from 'lucide-react';

const Policies = () => {
  const { isContactUsClicked, isModalOpened } = usePageContext();
  const isLoading = useLoading();
  const [selectedPolicy, setSelectedPolicy] = useState('platform');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (isLoading) return <Loading />;

  const filteredPolicy = useMemo(() => {
    const policy = POLICIES_DATA.find(p => p.id === selectedPolicy);
    if (!policy || !searchTerm.trim()) return policy;

    return {
      ...policy,
      content: policy.content
        .map(section => ({
          ...section,
          items: section.items.filter(item =>
            item.text.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter(section => section.items.length > 0),
    };
  }, [selectedPolicy, searchTerm]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <section
      className={`min-h-[600px] bg-gradient-to-br from-[#EEF1F1] via-[#F8FBFB] to-[#EEF1F1] w-full flex justify-center ${
        (isContactUsClicked || isModalOpened) && 'filter brightness-[30%]'
      } transition-all duration-500`}>
      <div className='container flex flex-col gap-[40px] my-[60px] px-[20px]'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full flex flex-col gap-[20px]'>
          <h2 className='text-[#09391C] lg:text-[44px] lg:leading-[64px] font-semibold font-display text-center text-[32px] leading-[41px]'>
            Our&nbsp;
            <span className='text-[#8DDB90] font-display'>Policies</span>
          </h2>
          <p className='text-center text-[#5A5D63] text-[18px] leading-[28px] max-w-2xl mx-auto'>
            Transparent, comprehensive policies designed to protect all parties and ensure trust and clarity in every transaction
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='w-full max-w-2xl mx-auto'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8DDB90] w-5 h-5' />
            <input
              type='text'
              placeholder='Search policies...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[#D6DDEB] bg-white text-[#09391C] placeholder-[#5A5D63] focus:border-[#8DDB90] focus:outline-none transition-colors'
            />
          </div>
        </motion.div>

        {/* Policy Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='w-full'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]'>
            {POLICIES_DATA.map((policy, idx) => (
              <motion.button
                key={policy.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedPolicy(policy.id);
                  setExpandedSections({});
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                  selectedPolicy === policy.id
                    ? 'bg-[#8DDB90] text-white border-[#8DDB90] shadow-lg shadow-[#8DDB90]/30'
                    : 'bg-white text-[#5A5D63] border-[#D6DDEB] hover:border-[#8DDB90] hover:bg-[#F8FBFB]'
                }`}>
                {policy.icon}
                <span className='text-sm font-medium hidden sm:inline'>{policy.name}</span>
                <span className='text-xs font-medium sm:hidden'>{policy.shortName}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Policy Content */}
        <AnimatePresence mode='wait'>
          {filteredPolicy ? (
            <motion.div
              key={selectedPolicy}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className='w-full'>
              {/* Policy Header */}
              <div className='mb-8 bg-white rounded-xl p-6 lg:p-8 border border-[#D6DDEB] shadow-sm'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-[#8DDB90]/10 rounded-lg'>
                    <FileText className='w-6 h-6 text-[#8DDB90]' />
                  </div>
                  <div>
                    <h3 className='text-[28px] lg:text-[32px] font-bold text-[#09391C] mb-2'>
                      {filteredPolicy.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Policy Sections */}
              <div className='space-y-4'>
                {filteredPolicy.content.map((section, sectionIdx) => {
                  const sectionId = `${selectedPolicy}-${sectionIdx}`;
                  const isExpanded = expandedSections[sectionId] ?? true;

                  return (
                    <motion.div
                      key={sectionIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIdx * 0.05 }}
                      className='bg-white rounded-xl border border-[#D6DDEB] shadow-sm overflow-hidden hover:shadow-md transition-shadow'>
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionId)}
                        className='w-full px-6 lg:px-8 py-4 flex items-center justify-between hover:bg-[#F8FBFB] transition-colors'>
                        <div className='flex items-center gap-3 flex-1'>
                          <span className='text-[#8DDB90] font-bold text-lg'>
                            {section.sectionNumber}
                          </span>
                          <h4 className='text-[18px] lg:text-[20px] font-bold text-[#09391C] text-left'>
                            {section.title}
                          </h4>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}>
                          <ChevronDown className='w-5 h-5 text-[#8DDB90]' />
                        </motion.div>
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className='border-t border-[#D6DDEB] px-6 lg:px-8 py-6'>
                            <div className='space-y-4'>
                              {section.items.map((item, itemIdx) => (
                                <motion.div
                                  key={itemIdx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIdx * 0.05 }}
                                  className='flex gap-3'>
                                  <span className='text-[#8DDB90] font-bold mt-1 flex-shrink-0'>•</span>
                                  <p className='text-[#5A5D63] text-[14px] lg:text-[15px] leading-[22px] flex-1'>
                                    {item.text}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredPolicy.content.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='bg-[#FFF3CD] border border-[#FFE69C] rounded-xl p-6 text-center'>
                  <AlertCircle className='w-8 h-8 text-[#FF9800] mx-auto mb-2' />
                  <p className='text-[#FF6F00] font-medium'>
                    No results found for "{searchTerm}"
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='mt-8 bg-gradient-to-r from-[#8DDB90]/10 to-[#09391C]/5 rounded-xl p-6 lg:p-8 border border-[#8DDB90]/20'>
          <div className='flex items-start gap-4'>
            <Shield className='w-6 h-6 text-[#8DDB90] flex-shrink-0 mt-1' />
            <div>
              <h4 className='font-bold text-[#09391C] mb-2'>Your Privacy Matters</h4>
              <p className='text-[#5A5D63] text-[14px] leading-[22px]'>
                These policies are designed to protect your rights and ensure transparent, secure transactions. For questions or concerns, contact us at privacy@khabiteqrealty.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

type PolicyContent = {
  sectionNumber: string;
  title: string;
  items: { text: string }[];
};

type PolicyData = {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  content: PolicyContent[];
};

const POLICIES_DATA: PolicyData[] = [
  {
    id: 'platform',
    name: 'Khabiteq Platform Policies (Master Framework)',
    shortName: 'Platform',
    icon: <Zap className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Subscription Policy',
        items: [
          { text: 'Subscription is available only to registered agents.' },
          { text: 'All new agents enjoy a 7-day Free Trial with Premium benefits. After trial, subscription is required to maintain access.' },
          { text: 'Premium – ₦15,000/month (all features, no commission).' },
          { text: 'Quarterly – (save 10%).' },
          { text: 'Yearly – (save 20%).' },
          { text: 'Agents cannot upgrade or downgrade mid-cycle; changes take effect in the next billing cycle.' },
          { text: 'Agents may choose auto-renewal or manual renewal.' },
          { text: 'Once a subscription expires, access is immediately revoked.' },
          { text: 'Document verification is excluded from subscription and charged separately on a pay-per-use basis.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Inspection Policy',
        items: [
          { text: 'Agents may set their own inspection fee; Khabiteq charges 15% of set inspection fee per booking for Premium agents and ₦5,000 per booking for unsubscribed agents.' },
          { text: 'Inspection fees are pay-per-request.' },
          { text: 'If inspection fails due to the client\'s error → no refund.' },
          { text: 'If inspection fails due to agent, landlord, or Khabiteq error → refund will be made after investigation.' },
          { text: 'Properties must be accessible, safe, and available during scheduled inspections.' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Payment & Refund Policy',
        items: [
          { text: 'Payments are made through Khabiteq\'s approved payment channels only.' },
          { text: 'Subscriptions are non-refundable, except where legally required.' },
          { text: 'Inspection refunds are case-specific as stated above.' },
          { text: 'All payments must be completed before services are activated.' },
          { text: 'Accepted currency: Nigerian Naira (₦). USD/GBP transactions may be allowed for diaspora clients.' },
          { text: 'All commissions, fees, and escrow deductions are subject to Paystack processing charges and applicable taxes.' },
          { text: 'Payouts to agents/hosts occur within the agreed timelines (e.g., 12–24 hours post shortlet check-in).' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Agent & Listing Policy',
        items: [
          { text: 'Only verified agents may list properties.' },
          { text: 'Listings must be accurate, updated, and not misleading.' },
          { text: 'Fraudulent or duplicate listings will be removed without refund.' },
          { text: 'Agents are responsible for ensuring compliance with all real estate laws, permits, and taxes.' },
          { text: 'No watermarks, stock images, or fake documents are allowed.' },
          { text: 'At posting, sellers/agents/landlords must complete an Ownership Declaration to confirm authority to list.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Verification & Due Diligence Policy',
        items: [
          { text: 'Document verification is optional and charged per request.' },
          { text: 'Verification outcomes are based on Khabiteq\'s checks, but Khabiteq is not liable for third-party fraud or misrepresentation.' },
          { text: 'Khabiteq reserves the right to suspend agents with repeated failed verifications.' },
          { text: 'Buyers/tenants are advised to use the verification service before committing.' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'Anti-Fraud & Scam Policy',
        items: [
          { text: 'Strict zero-tolerance for fraudulent activities.' },
          { text: 'Any suspected fraud leads to immediate suspension and possible blacklisting.' },
          { text: 'Agents found guilty will lose access without refund.' },
          { text: 'Khabiteq may notify law enforcement in cases of fraud, forgery, or scams.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Dispute Resolution Policy',
        items: [
          { text: 'Disputes between agents and clients should first be resolved directly.' },
          { text: 'Where unresolved, Khabiteq may act as a mediator but is not legally bound to enforce settlement.' },
          { text: 'If disputes escalate, parties are encouraged to use independent mediation or arbitration.' },
          { text: 'Escrow funds will only be released upon confirmation of milestones, mutual agreement, or dispute resolution outcome.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Data & Privacy Policy',
        items: [
          { text: 'Khabiteq collects only data necessary to operate the platform (e.g., agent profile info, listings, inspection history).' },
          { text: 'Data is processed under NDPR and GDPR standards.' },
          { text: 'Khabiteq does not sell personal data to third parties.' },
          { text: 'Agents consent to their profile, reviews, and listings being publicly displayed and promoted across the Khabiteq platform and social media.' },
          { text: 'Active agents → data retained as long as account is active.' },
          { text: 'Inactive/suspended agents → data retained for 3 years for compliance.' },
          { text: 'Users may request data deletion, subject to regulatory requirements.' },
        ],
      },
      {
        sectionNumber: '9',
        title: 'Intellectual Property & Content Use',
        items: [
          { text: 'Agents retain ownership of property photos, videos, and descriptions they upload.' },
          { text: 'By uploading, agents grant Khabiteq a royalty-free license to display, distribute, and advertise such content.' },
          { text: 'Unauthorized reproduction of platform content outside Khabiteq is prohibited.' },
        ],
      },
      {
        sectionNumber: '10',
        title: 'Termination & Suspension Policy',
        items: [
          { text: 'Khabiteq may suspend or terminate an agent\'s access if they engage in fraud or scams.' },
          { text: 'Khabiteq may suspend or terminate an agent\'s access if they repeatedly violate listing rules.' },
          { text: 'Khabiteq may suspend or terminate an agent\'s access if they misuse inspection or subscription services.' },
          { text: 'Suspended agents may appeal within 7 working days.' },
          { text: 'Termination due to fraud or major violations is final, with no refund.' },
        ],
      },
      {
        sectionNumber: '11',
        title: 'Platform Usage & Access Policy',
        items: [
          { text: 'Users must not share login credentials with third parties.' },
          { text: 'Multiple accounts for the same agent are prohibited.' },
          { text: 'Khabiteq may suspend accounts for misuse, impersonation, or unauthorized access.' },
        ],
      },
      {
        sectionNumber: '12',
        title: 'Advertising & Promotion Policy',
        items: [
          { text: 'Agents may promote their listings via Khabiteq\'s ad services (sponsored placements, featured listings).' },
          { text: 'Misleading promotions, false discounts, or use of Khabiteq branding without approval are prohibited.' },
          { text: 'Sponsored listings will always be clearly labeled.' },
        ],
      },
      {
        sectionNumber: '13',
        title: 'Client Protection Policy',
        items: [
          { text: 'Clients are advised to complete document verification before making payments.' },
          { text: 'Off-platform payments are strictly discouraged; Khabiteq is not liable for losses from such transactions.' },
          { text: 'Khabiteq reserves the right to suspend agents who attempt to divert clients off-platform.' },
        ],
      },
      {
        sectionNumber: '14',
        title: 'Content Moderation & Takedown Policy',
        items: [
          { text: 'Khabiteq may remove any content that is fraudulent, offensive, discriminatory, or misleading.' },
          { text: 'Khabiteq may remove content in breach of copyright (e.g., stolen photos).' },
          { text: 'Khabiteq may remove content not meeting platform quality standards.' },
        ],
      },
      {
        sectionNumber: '15',
        title: 'Customer Review & Rating Policy',
        items: [
          { text: 'Clients may rate and review agents honestly.' },
          { text: 'Fake, coerced, or manipulated reviews will be removed.' },
          { text: 'Agents cannot demand removal of genuine negative reviews but may respond professionally.' },
        ],
      },
      {
        sectionNumber: '16',
        title: 'Anti-Money Laundering (AML) & KYC Policy',
        items: [
          { text: 'For high-value sales, Khabiteq may request additional identity documents.' },
          { text: 'Suspicious transactions may be flagged or reported to authorities.' },
          { text: 'Agents must comply with all Nigerian KYC and AML requirements where applicable.' },
        ],
      },
      {
        sectionNumber: '17',
        title: 'Compliance & Legal Disclaimer',
        items: [
          { text: 'Khabiteq is a digital marketplace platform and does not act as a buyer, seller, or legal representative in property transactions.' },
          { text: 'Agents and landlords are fully responsible for the legality and accuracy of listed properties.' },
          { text: 'Khabiteq is not liable for disputes, financial losses, or damages from off-platform transactions.' },
        ],
      },
      {
        sectionNumber: '18',
        title: 'Customer Support Policy',
        items: [
          { text: 'Support is available via phone, email, and in-app channels.' },
          { text: 'Typical response time: 24–48 hours.' },
          { text: 'Khabiteq will not be responsible for unofficial communications outside its official channels.' },
        ],
      },
      {
        sectionNumber: '19',
        title: 'Force Majeure & Service Availability',
        items: [
          { text: 'Khabiteq will make reasonable efforts to keep the platform available 24/7.' },
          { text: 'Not liable for downtime caused by internet failures, power outages, maintenance, or acts of God, government action, or force majeure.' },
          { text: 'Subscription periods will not be extended unless downtime exceeds 7 consecutive days.' },
        ],
      },
    ],
  },
  {
    id: 'property-posting',
    name: 'Agent Rules & Property Posting Policy',
    shortName: 'Posting',
    icon: <FileText className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Registration & Verification',
        items: [
          { text: 'All agents must register through the Khabiteq website.' },
          { text: 'Required documents include: Valid government-issued ID, contact information, real estate license or association membership (if applicable), and at least one verifiable professional reference.' },
          { text: 'Khabiteq reserves the right to verify and approve all agents before granting full access.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Subscription & Access Levels',
        items: [
          { text: 'Subscribed Agents with a Public Page: Can display their WhatsApp and contact details. Clients may contact them directly for negotiations and inspections. Khabiteq still enforces compliance with all commission and platform rules.' },
          { text: 'Trial/Unsubscribed Agents: Clients cannot contact them directly. All communications, inspections, and payments must go through Khabiteq. A ₦5,000 inspection fee is paid by the buyer or tenant to Khabiteq. Khabiteq acts as the intermediary for these transactions.' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Property Posting Rules',
        items: [
          { text: 'No watermarks are allowed on property photos.' },
          { text: 'Images must be clear, recent, and accurate (no stock or misleading images).' },
          { text: 'All property documents must be valid and verifiable.' },
          { text: 'Duplicate or fake listings are strictly prohibited.' },
          { text: 'At the point of posting, the seller/agent/landlord must complete an Ownership Declaration to confirm they are authorized to list the property.' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Buyer/Tenant Responsibilities',
        items: [
          { text: 'Buyers and tenants should insist on document verification before making commitments.' },
          { text: 'Khabiteq provides a Document Verification feature that buyers can use to confirm ownership and property authenticity.' },
          { text: 'No transaction should proceed without proper verification.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Professional Conduct',
        items: [
          { text: 'Agents must treat clients professionally and transparently.' },
          { text: 'Agents must not divert clients off-platform to avoid fees.' },
          { text: 'Subscribed agents with public pages may transact directly, but Khabiteq\'s commission and compliance policies still apply.' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'Shortlets',
        items: [
          { text: 'Hosts must ensure properties are safe, clean, and accurately described.' },
          { text: 'Guests must pay the shortlet service fee, which applies whether the booking comes from an agent\'s public page or the marketplace.' },
          { text: 'Hosts are paid 12–24 hours after check-in is confirmed.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Joint Ventures (JV)',
        items: [
          { text: 'JV deals must include a signed Letter of Instruction (LOI) between landowners and developers.' },
          { text: 'Where no LOI is signed, Khabiteq reserves the right to apply industry-standard sales commission, as mutually agreed before closing.' },
          { text: 'Khabiteq must be included in the transaction process for commissions to apply.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Escrow & Dispute Resolution',
        items: [
          { text: 'Khabiteq may use escrow services to safeguard funds until conditions are met.' },
          { text: 'Any disputes between clients, agents, or landlords must be reported to Khabiteq.' },
          { text: 'Khabiteq reserves the right to mediate and take corrective action, including suspension or blacklisting.' },
        ],
      },
      {
        sectionNumber: '9',
        title: 'Compliance & Enforcement',
        items: [
          { text: 'Fraudulent, fake, or misleading listings will be removed.' },
          { text: 'Repeated offenders may be blacklisted and barred from re-registering.' },
          { text: 'Legal authorities may be notified in cases of fraud or misconduct.' },
        ],
      },
      {
        sectionNumber: '10',
        title: 'Refunds & Failed Inspections',
        items: [
          { text: 'Inspection fees are pay-per-request.' },
          { text: 'If inspection fails due to the client\'s error (buyer/tenant), no refund applies.' },
          { text: 'If inspection fails due to agent, landlord, or Khabiteq error, refunds will be made after investigation.' },
          { text: 'Subscriptions remain non-refundable, except where legally required.' },
        ],
      },
    ],
  },
  {
    id: 'subscription',
    name: 'Khabiteq Realty – Subscription & Account Management Policy',
    shortName: 'Subscription',
    icon: <Zap className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Subscription Plan',
        items: [
          { text: 'Premium Subscription Plan: ₦15,000 per month.' },
          { text: '3-month subscription: 10% discount.' },
          { text: '6-month subscription: 15% discount.' },
          { text: '12-month subscription: 20% discount.' },
          { text: 'Trial Period: Free 7-day trial before payment is required.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Account Features (Premium Subscribers)',
        items: [
          { text: 'Personal Agent Public Page with listings and profile.' },
          { text: 'Ability to set custom inspection fees (Khabiteq retains 15% as platform commission).' },
          { text: 'Zero sales/rental commission payable to Khabiteq (commission-free transactions).' },
          { text: 'Access to client preferences via Agent Marketplace.' },
          { text: 'Marketing exposure through the General Marketplace.' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Inspection Fees',
        items: [
          { text: 'Subscribed Agents: May set their own inspection fee; Khabiteq collects 15% of this fee.' },
          { text: 'Trial/Unsubscribed Agents: Cannot set fees; fixed inspection fee of ₦5,000 applies and is collected fully by Khabiteq.' },
          { text: 'Inspection fees are non-refundable except where required by law.' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Payments & Renewals',
        items: [
          { text: 'Subscriptions renew automatically unless cancelled before the billing date.' },
          { text: 'Payments are processed via Paystack with fees split (5% Paystack, 10% Khabiteq retention on inspection/service transactions).' },
          { text: 'Failed payments will result in immediate suspension of account access.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Refunds & Cancellations',
        items: [
          { text: 'Subscription fees are non-refundable, including partial months, even if the subscriber cancels before expiry.' },
          { text: 'Refunds are only considered where legally mandated (e.g., billing error).' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'User Obligations',
        items: [
          { text: 'Subscribers must ensure all listed properties are accurate and legally verifiable.' },
          { text: 'Agents must have the authority or ownership rights to list properties.' },
          { text: 'Subscriptions do not override property verification or due diligence requirements.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Limitations of Service',
        items: [
          { text: 'Subscription covers platform access, tools, and visibility.' },
          { text: 'It does not include external marketing services (e.g., social media ads, billboards) unless expressly offered in separate packages.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Account Use & Restrictions',
        items: [
          { text: 'One subscription = one agent only. Accounts cannot be shared, transferred, or resold.' },
          { text: 'Misuse (fraudulent listings, circumvention of Khabiteq fees, or multiple-user abuse) may lead to suspension or termination without refund.' },
        ],
      },
      {
        sectionNumber: '9',
        title: 'Suspension & Termination',
        items: [
          { text: 'Accounts may be suspended or terminated for non-payment of subscription fees.' },
          { text: 'Accounts may be suspended or terminated for fraudulent or misleading property listings.' },
          { text: 'Accounts may be suspended or terminated for circumventing Khabiteq to avoid inspection or service fees.' },
          { text: 'Termination does not exempt the subscriber from pending obligations (fees, commissions, disputes).' },
        ],
      },
      {
        sectionNumber: '10',
        title: 'Data Protection & Privacy',
        items: [
          { text: 'All subscriber data is handled per the Khabiteq Data Protection & Consent Policy.' },
          { text: 'By subscribing, users consent to the processing of personal and financial data for billing, compliance, and communication.' },
        ],
      },
      {
        sectionNumber: '11',
        title: 'Dispute Resolution',
        items: [
          { text: 'Subscription disputes should first be reported to Khabiteq Support.' },
          { text: 'If unresolved, disputes will follow the same escalation process in the Commission & Transaction Policy and Nigerian law.' },
        ],
      },
      {
        sectionNumber: '12',
        title: 'Policy Updates',
        items: [
          { text: 'Khabiteq reserves the right to update this policy. Updates take effect once published. Continued use of the platform after updates indicates acceptance.' },
        ],
      },
    ],
  },
  {
    id: 'commission',
    name: 'Commission & Transaction Policy',
    shortName: 'Commission',
    icon: <DollarSign className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Definitions',
        items: [
          { text: 'Standard Commission: The professional fee due to an agent for facilitating a property transaction (typically a percentage of the transaction value).' },
          { text: 'Agent Marketplace: The page where client preferences and requests are posted; agents match clients\' needs with their listings.' },
          { text: 'General Marketplace: The page listing all properties on Khabiteq available to site visitors.' },
          { text: 'Subscribed Agent: An agent who has purchased any paid subscription plan that includes a public agent page and expanded access. Subscribed agents pay subscription fees (and do not pay commissions to Khabiteq).' },
          { text: 'Non-Subscribed Agent: An agent who has not purchased any subscription.' },
          { text: 'Host: A person listing a shortlet property.' },
          { text: 'Guest: A person booking a shortlet property.' },
          { text: 'Joint Venture (JV): A formal partnership between a landowner and developer to develop property with a pre-agreed sharing ratio on completion.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Commission Structure (Summary)',
        items: [
          { text: 'Note: Shortlet service fees apply across all bookings (guest 8% service fee added at checkout; host 7% deducted at payout).' },
          { text: 'A. Agent Marketplace (client-preference matches – unsubscribed agent):' },
          { text: 'Rent: Khabiteq receives 25% of the standard commission.' },
          { text: 'Sale: Commission is set by the Letter of Instructions (LOI) between parties.' },
          { text: 'Where no LOI is signed, Khabiteq reserves the right to apply industry-standard sales commission as mutually agreed before closing.' },
          { text: 'Shortlet: 8% charged to guest and 7% charged to host.' },
          { text: 'Joint Venture (JV): Khabiteq receives 25% of the standard commission.' },
          { text: 'B. General Marketplace (public listings – unsubscribed agent):' },
          { text: 'Rent: Khabiteq receives 50% of the standard commission.' },
          { text: 'Sale: Commission is set by the LOI.' },
          { text: 'Where no LOI is signed, Khabiteq reserves the right to apply industry-standard sales commission as mutually agreed before closing.' },
          { text: 'Shortlet: 8% charged to guest and 7% charged to host.' },
          { text: 'Joint Venture (JV): Khabiteq receives 50% of the standard commission.' },
          { text: 'C. Subscribed Agents (full subscribers with public page):' },
          { text: 'No commission payable to Khabiteq on transactions.' },
          { text: 'Khabiteq collects 15% of the inspection fee set on the subscribed agent\'s public profile (see Inspection Fees below).' },
          { text: 'D. Trial/Unsubscribed Agents:' },
          { text: 'Inspection fee is ₦5,000, payable to Khabiteq (Khabiteq coordinates the inspection as intermediary).' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Inspection Fees',
        items: [
          { text: 'Subscribed agents may set their own inspection fee on their public page; Khabiteq collects 15% of that stated inspection fee.' },
          { text: 'Trial & non-subscribed agents: inspection fee is ₦5,000, paid to Khabiteq.' },
          { text: 'Refunds: Inspection fees are non-refundable unless the failure was caused by Khabiteq, the seller, or landlord. If the buyer/tenant cancels or defaults, the fee is forfeited.' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Shortlet (Booking) Rules & Disbursement',
        items: [
          { text: 'The guest service fee (8%) applies to all bookings regardless of source (subscribed agent, public page, agent marketplace, or general listing).' },
          { text: 'Hosts are also charged 7% per confirmed booking.' },
          { text: 'Disbursement: Host payout is released 12–24 hours after guest check-in confirmation.' },
          { text: 'Guest payment (including service fee) is charged at booking per platform payment flow.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Payment Flow, Escrow & Deductions',
        items: [
          { text: 'Commissions and service fees are automatically calculated and deducted at payment processing.' },
          { text: 'Generally, agents or landlords pay commissions and platform fees, except shortlets, where the guest pays the guest service fee (8%) and the host is charged 7%.' },
          { text: 'Escrow: Khabiteq may hold funds in escrow for high-value deals, JV milestones, or as agreed. Escrow terms and fees are disclosed before funds are accepted. Funds in escrow are released only on milestone confirmation, mutual instruction, or dispute resolution.' },
          { text: 'Khabiteq issues digital receipts and statements for all deductions.' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'Sales, Rent & JV Transactions',
        items: [
          { text: 'For transactions where Khabiteq is directly involved, commission terms are governed by the signed LOI.' },
          { text: 'Transactions completed via an agent\'s public page (without Khabiteq involvement) are direct agent-to-client deals. Khabiteq is not responsible for payments or disputes.' },
          { text: 'Buyers and tenants are strongly advised to use Khabiteq\'s document verification service before making payments or moving in.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Posting & Ownership Rules',
        items: [
          { text: 'All property owners, sellers, or landlord agents must sign an Ownership Declaration confirming they are authorized to post a listing.' },
          { text: 'Media Rules: Listings must not include watermarks, third-party branding, or misleading visuals. Breaches may lead to removal.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Communication Rules',
        items: [
          { text: 'Subscribed agents with public pages may display their WhatsApp for direct communication.' },
          { text: 'Non-subscribed or trial agents must transact via Khabiteq channels only.' },
        ],
      },
      {
        sectionNumber: '9',
        title: 'Non-Circumvention',
        items: [
          { text: 'Users must not bypass Khabiteq to avoid commissions or fees after introductions or matches.' },
          { text: 'Breaches may result in fee recovery, penalties, or account suspension/termination.' },
        ],
      },
      {
        sectionNumber: '10',
        title: 'Dispute Resolution & Escrow Claims',
        items: [
          { text: 'All disputes must be reported via Khabiteq\'s support channels.' },
          { text: 'Khabiteq first mediates; unresolved disputes proceed under Nigerian law.' },
          { text: 'Funds may be held in escrow until resolution.' },
        ],
      },
      {
        sectionNumber: '11',
        title: 'Taxes & Compliance',
        items: [
          { text: 'All commissions and service fees are subject to applicable Nigerian taxes (VAT, WHT, stamp duties, etc.).' },
          { text: 'This policy complies with Nigerian property regulations, including LASRERA where applicable.' },
        ],
      },
      {
        sectionNumber: '12',
        title: 'Liability & Disclaimer',
        items: [
          { text: 'Khabiteq acts as an intermediary/facilitator and is not responsible for third-party misrepresentations or default.' },
          { text: 'Users must perform due diligence (title, inspection, legal checks).' },
          { text: 'Khabiteq\'s liability is limited to direct losses caused by proven negligence.' },
        ],
      },
      {
        sectionNumber: '13',
        title: 'Data Protection',
        items: [
          { text: 'Personal/financial data for payments and escrow is handled per Khabiteq\'s Data Protection Policy.' },
          { text: 'By transacting, users consent to use of their data for compliance and communication.' },
        ],
      },
      {
        sectionNumber: '14',
        title: 'Policy Changes',
        items: [
          { text: 'Khabiteq may update this policy. Updates are effective upon publication.' },
          { text: 'Continued use of the platform means acceptance of changes.' },
        ],
      },
    ],
  },
  {
    id: 'data-consent',
    name: 'Khabiteq Realty Data Consent Policy (Agents)',
    shortName: 'Data Consent',
    icon: <Shield className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Personal Data We Collect',
        items: [
          { text: 'Identification Data: Full name, date of birth, National Identification Number (NIN), valid government-issued ID.' },
          { text: 'Contact Information: Phone numbers, email addresses, residential/business addresses.' },
          { text: 'Professional Information: Licenses, certifications, proof of agency/ownership, and related documents.' },
          { text: 'Financial Information: Bank account details for payment of inspection fees, commissions, and related transactions.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Purpose of Data Collection',
        items: [
          { text: 'Identity verification and Know Your Customer (KYC) compliance.' },
          { text: 'Processing inspection fees, commissions, and other payments due to you.' },
          { text: 'Communicating updates about your listings, account, and transactions.' },
          { text: 'Compliance with applicable laws, including anti-fraud and anti-money laundering regulations.' },
          { text: 'Secure record-keeping of transactions performed on the platform.' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Data Sharing',
        items: [
          { text: 'We will not sell your personal information. Data may only be shared with:' },
          { text: 'Authorized third-party service providers (e.g., payment processors, verification agencies).' },
          { text: 'Regulatory authorities or law enforcement agencies, if required by law.' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Data Security',
        items: [
          { text: 'All electronic records are encrypted during storage and transmission.' },
          { text: 'Access to your data is restricted to authorized Khabiteq staff and approved third parties.' },
          { text: 'Physical records (if any) are kept in secure, access-controlled facilities.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Consent',
        items: [
          { text: 'By signing this document, you consent to:' },
          { text: 'The collection, use, and storage of your personal and financial data for the purposes outlined above.' },
          { text: 'Khabiteq contacting you by phone, email, or SMS regarding your account, payments, and services.' },
          { text: 'Khabiteq sharing your data with trusted partners solely for payment processing, KYC, or regulatory compliance.' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'Withdrawal of Consent',
        items: [
          { text: 'You may withdraw your consent at any time by sending a written request to privacy@khabiteqrealty.com.' },
          { text: 'Withdrawal of consent may limit or prevent you from continuing as an agent on the platform, as certain data (e.g., NIN, bank details) is mandatory for compliance.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Data Retention',
        items: [
          { text: 'Your personal data will be retained for up to five (5) years after account closure, or longer if required by law.' },
          { text: 'After the retention period, your data will be securely deleted or anonymized.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Your Rights',
        items: [
          { text: 'Access your personal data.' },
          { text: 'Request corrections or updates to inaccurate information.' },
          { text: 'Request deletion of your data (subject to legal requirements).' },
          { text: 'Request a copy of your data in a machine-readable format.' },
        ],
      },
    ],
  },
  {
    id: 'data-protection',
    name: 'Data Protection & Privacy Policy',
    shortName: 'Privacy',
    icon: <Shield className='w-4 h-4' />,
    content: [
      {
        sectionNumber: '1',
        title: 'Personal Data We Collect',
        items: [
          { text: 'As part of your registration and activities as an agent on Khabiteq, we may collect contact information: Phone numbers, email addresses, residential/business addresses.' },
          { text: 'Property Preferences and Transactions: Search preferences (location, type, budget), property details, agreements, and payment information.' },
          { text: 'Business Information: Certifications and addresses for agents and landlords.' },
        ],
      },
      {
        sectionNumber: '2',
        title: 'Data Storage and Security',
        items: [
          { text: 'Digital Storage: Personal data is encrypted during storage and transit.' },
          { text: 'Physical Records: Hard copies, if any, are stored in secure, restricted-access locations.' },
          { text: 'Backups: Regular backups are performed to safeguard against data loss.' },
          { text: 'System Security: Continuous updates and security patches are applied to protect against vulnerabilities.' },
        ],
      },
      {
        sectionNumber: '3',
        title: 'Data Access',
        items: [
          { text: 'Access is restricted to authorized personnel based on their roles.' },
          { text: 'Third-party providers, such as payment processors, are given access only when necessary and under strict confidentiality agreements.' },
          { text: 'All access is monitored to ensure compliance with data protection protocols.' },
        ],
      },
      {
        sectionNumber: '4',
        title: 'Data Usage',
        items: [
          { text: 'Data is utilized solely for:' },
          { text: 'Providing services, such as property matching, rent collection, and transaction facilitation.' },
          { text: 'Communicating updates related to listings, inspections, or transactions.' },
          { text: 'Marketing, but only with explicit consent from data owners.' },
          { text: 'Prohibited Uses: Data is never sold or shared with unauthorized third parties.' },
        ],
      },
      {
        sectionNumber: '5',
        title: 'Data Sharing',
        items: [
          { text: 'Data is shared only with trusted third parties under confidentiality agreements (e.g., payment processors or legal service providers).' },
          { text: 'When possible, data is anonymized before sharing to safeguard privacy.' },
        ],
      },
      {
        sectionNumber: '6',
        title: 'Data Retention and Disposal',
        items: [
          { text: 'Retention Period: Personal and transactional data is kept for up to five years or as required by law.' },
          { text: 'Secure Disposal: Digital data is deleted using certified data-wiping software and Physical records are securely shredded before disposal.' },
        ],
      },
      {
        sectionNumber: '7',
        title: 'Breach Management',
        items: [
          { text: 'In the event of a data breach:' },
          { text: 'All affected parties will be notified within 72 hours.' },
          { text: 'Authorities will be informed as required by law.' },
          { text: 'An internal review will be conducted, and measures will be implemented to prevent future breaches.' },
        ],
      },
      {
        sectionNumber: '8',
        title: 'Data Owner Rights',
        items: [
          { text: 'Access: Request access to their personal data.' },
          { text: 'Correction: Request corrections or updates to inaccurate data.' },
          { text: 'Erasure: Request the deletion of personal data, subject to legal or contractual obligations.' },
          { text: 'Restriction: Restrict how their data is processed.' },
          { text: 'Objection: Object to specific types of data processing.' },
          { text: 'Portability: Request a copy of their data in a machine-readable format.' },
        ],
      },
      {
        sectionNumber: '9',
        title: 'Monitoring and Compliance',
        items: [
          { text: 'Regular audits ensure adherence to this policy and compliance with data protection regulations.' },
          { text: 'Non-compliance by employees or third-party providers will result in corrective actions, including termination of agreements if necessary.' },
        ],
      },
      {
        sectionNumber: '10',
        title: 'Policy Updates',
        items: [
          { text: 'This policy is reviewed regularly to reflect changes in regulations or company practices. Updates will be posted on our website and will take effect immediately.' },
        ],
      },
    ],
  },
];

export default Policies;
