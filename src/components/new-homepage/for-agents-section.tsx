/** @format */

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';

interface ApiPlanFeature {
  feature: { _id: string; key: string; label: string; isActive: boolean };
  type: 'boolean' | 'count' | 'unlimited';
  value: number;
}

interface DiscountedPlan {
  name: string;
  price: number;
  durationInDays: number;
  discountPercentage?: number;
}

interface ApiPlan {
  _id: string;
  name: string;
  code: string;
  price: number;
  basePrice?: number;
  currency: string;
  durationInDays: number;
  isTrial?: boolean;
  discountedPlans?: DiscountedPlan[];
  raw?: { durationInDays?: number; discountedPlans?: DiscountedPlan[] };
  features: ApiPlanFeature[];
}

const formatDurationLabel = (days: number | undefined): string => {
  if (!days || days <= 0) return 'Duration not set';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.round(days / 30);
  if (months === 1) return '1 month';
  if (months === 3) return 'Quarterly (3 months)';
  if (months === 12) return 'Yearly (12 months)';
  return `${months} months`;
};

const currencySymbol = (cur?: string) => (cur && /usd|\$|dollar/i.test(cur) ? '$' : '₦');

const PlanCard: React.FC<{ plan: ApiPlan }> = ({ plan }) => {
  const dps = useMemo(
    () => (plan.discountedPlans || plan.raw?.discountedPlans || []).filter(Boolean),
    [plan.discountedPlans, plan.raw]
  );
  const [useDiscount, setUseDiscount] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const selectedDiscount = useMemo(() => (useDiscount && dps.length > 0 ? dps[Math.min(selectedIdx, dps.length - 1)] : null), [useDiscount, dps, selectedIdx]);

  const shownPrice = selectedDiscount ? selectedDiscount.price : (plan.price ?? plan.basePrice ?? 0);
  const shownDays = selectedDiscount ? selectedDiscount.durationInDays : (plan.durationInDays ?? plan.raw?.durationInDays ?? 30);
  const cur = plan.currency || 'NGN';

  return (
    <div className={`bg-white rounded-2xl p-8 border-2 ${plan.isTrial || (plan.price === 0) ? 'border-gray-200' : 'border-[#8DDB90]'} relative overflow-hidden`}>
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold text-[#09391C] mb-2">{plan.name}</h4>
        <div className="flex items-center justify-center gap-3 mb-1">
          {selectedDiscount && (
            <span className="text-sm text-gray-500 line-through">{currencySymbol(cur)}{Number(plan.price ?? plan.basePrice ?? 0).toLocaleString()}</span>
          )}
          <div className="text-3xl font-bold text-[#8DDB90]">{currencySymbol(cur)}{Number(shownPrice).toLocaleString()}</div>
        </div>
        <p className="text-gray-600 text-sm">{cur} • {formatDurationLabel(shownDays)}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {(plan.features || []).map((f, index) => {
          const type = String(f.type);
          const isOn = type === 'boolean' ? Number(f.value) === 1 : true;
          let valueText = '';
          if (type === 'count') valueText = `: ${f.value}`;
          if (type === 'unlimited') valueText = ': Unlimited';
          return (
            <li key={index} className={`flex items-center gap-3 ${isOn ? '' : 'text-gray-400 line-through'}`}>
              <svg className={`w-5 h-5 ${isOn ? 'text-[#8DDB90]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{f.feature?.label}{valueText}</span>
            </li>
          );
        })}
      </ul>

      {/* Discount Toggle */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#09391C]">Discounted</span>
          <span className="text-xs text-gray-500">switch pricing</span>
        </div>
        <button
          type="button"
          aria-pressed={useDiscount}
          onClick={() => dps.length > 0 && setUseDiscount(v => !v)}
          className={`w-12 h-7 rounded-full p-1 transition-colors ${dps.length === 0 ? 'bg-gray-200 cursor-not-allowed' : useDiscount ? 'bg-[#8DDB90]' : 'bg-gray-300'}`}
        >
          <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${useDiscount ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {useDiscount && dps.length > 0 && (
        <div className="mb-6">
          {dps.length > 1 && (
            <label className="block text-sm text-gray-700 mb-2">Choose discount</label>
          )}
          {dps.length > 1 ? (
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
              value={selectedIdx}
              onChange={e => setSelectedIdx(Number(e.target.value))}
            >
              {dps.map((dp, i) => (
                <option key={`${plan._id}-dp-${i}`} value={i}>
                  {dp.name} • {currencySymbol(cur)}{Number(dp.price).toLocaleString()} • {formatDurationLabel(dp.durationInDays)}{typeof dp.discountPercentage === 'number' ? ` (-${dp.discountPercentage}%)` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>{dps[0].name}</span>
              <span className="font-medium">{currencySymbol(cur)}{Number(dps[0].price).toLocaleString()} • {formatDurationLabel(dps[0].durationInDays)}</span>
            </div>
          )}
        </div>
      )}

      <Link href="/agent-subscriptions?tab=plans">
        <button className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white py-3 px-4 sm:px-6 rounded-full font-bold transition-colors duration-300 text-sm sm:text-base flex items-center justify-center min-h-[48px]">
          <span className="whitespace-nowrap">Subscribe Now</span>
        </button>
      </Link>
    </div>
  );
};

const ForAgentsSection = () => {
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const res = await GET_REQUEST<{ success: boolean; data: ApiPlan[] }>(`${URLS.BASE}${URLS.getSubscriptionPlans}`);
      if (res?.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => {
          const aFree = (a.price || 0) === 0 || a.isTrial || /free/i.test(a.name || '');
          const bFree = (b.price || 0) === 0 || b.isTrial || /free/i.test(b.name || '');
          if (aFree && !bFree) return -1;
          if (!aFree && bFree) return 1;
          return (a.price || 0) - (b.price || 0);
        });
        setPlans(sorted as ApiPlan[]);
      } else {
        setPlans([]);
      }
      setLoadingPlans(false);
    };
    fetchPlans();
  }, []);

  const agentBenefits = [
    {
      title: 'Verified Buyer Network',
      description: 'Connect with pre-qualified buyers who are serious about purchasing.',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
    },
    {
      title: 'Smart Matching System',
      description: 'Our AI matches your listings with the right buyers automatically.',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: 'Commission Protection',
      description: 'Secure your earnings with our transparent commission tracking.',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#FFFEFB]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#09391C] mb-6 font-display">For Real Estate Agents</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join our verified network of professional agents and grow your business with powerful tools and qualified leads.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {agentBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#8DDB90] rounded-full flex items-center justify-center text-white group-hover:bg-[#7BC87F] transition-colors duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#09391C] mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#F5F7F9] rounded-3xl p-8 md:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-[#09391C] text-center mb-12">Choose Your Dashboard</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingPlans
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                    <div className="h-8 w-28 bg-gray-200 rounded mb-6 animate-pulse" />
                    <ul className="space-y-3 mb-6">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
                        </li>
                      ))}
                    </ul>
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              : (plans || []).map((plan) => (
                  <PlanCard key={plan._id} plan={plan} />
                ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Join over 250+ verified agents already growing their business with Khabiteq</p>
            <Link href="/agent-kyc">
              <button className="bg-[#09391C] hover:bg-[#0B423D] text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-colors duration-300 flex items-center justify-center min-h-[48px] sm:min-h-[56px]">
                <span className="whitespace-nowrap">Become a Verified Agent</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForAgentsSection;
