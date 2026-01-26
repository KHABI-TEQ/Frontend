/** @format */

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { 
  Calendar, 
  CreditCard, 
  Package, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  ArrowLeftIcon
} from 'lucide-react';
import { GET_REQUEST, POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import { AgentSubscription, SubscriptionPlan, SubscriptionTransaction } from '@/types/subscription.types';
import { format } from 'date-fns';
import { getCookie } from 'cookies-next';
import Block from '@/components/access/Block';
import Link from 'next/link';

export default function AgentSubscriptionsPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [subscriptions, setSubscriptions] = useState<AgentSubscription[]>([]);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [subscriptionsTotalPages, setSubscriptionsTotalPages] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<SubscriptionTransaction | null>(null);
  const activeSubscriptionFromProfile = (user as any)?.activeSubscription as
    | { _id: string; plan: string; status: string; startDate?: string; endDate?: string; subscriptionType?: string }
    | undefined;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans' | 'transactions'>('subscriptions');
  const [tabLoading, setTabLoading] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AgentSubscription | null>(null);
  const [renewalDuration, setRenewalDuration] = useState<number>(2);
  const [isProcessingRenewal, setIsProcessingRenewal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPlanForSub, setSelectedPlanForSub] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number | null>(null);
  const [selectedPlanCodeForSub, setSelectedPlanCodeForSub] = useState<string | null>(null); 
  const [autoRenewal, setAutoRenewal] = useState<boolean>(false);
  const [isProcessingSubscribe, setIsProcessingSubscribe] = useState(false);

  const token = (getCookie('token') as string) || undefined;

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlTab = (searchParams.get('tab') || undefined) as ("subscriptions" | "plans" | "transactions") | undefined;

 
  // Apply URL tab if provided
  useEffect(() => {
    if (urlTab) {
      // Validate and set
      const allowed = ['subscriptions', 'plans', 'transactions'];
      if (allowed.includes(urlTab)) {
        setActiveTab(urlTab as any);
      }
    }
  }, [urlTab, setActiveTab]);

  // Redirect non-agents
  useEffect(() => {
    if (user && user.userType !== 'Agent') {
      toast.error('Access denied. This page is only for agents.');
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchSubscriptions = async (page = 1) => {
    try {
      setTabLoading(true);
      const response = await GET_REQUEST(`${URLS.BASE}/account/subscriptions/fetchAll?page=${page}&limit=10`, token);
      if (response.success) {
        setSubscriptions((response.data as any) || []);
        setSubscriptionsPage((response.pagination as any)?.page || 1);
        setSubscriptionsTotalPages((response.pagination as any)?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setTabLoading(true);
      const response = await GET_REQUEST(`${URLS.BASE}${URLS.getSubscriptionPlans}`, token);
      if (response.success) {
        const apiPlans = (response.data || []) as any[];
        let normalized = apiPlans.map((p: any) => {
          const baseMonths = Math.max(1, Math.round((p.durationInDays || 30) / 30));
          const prices: Record<number, number> = { [baseMonths]: Number(p.price) || 0 };
          (p.discountedPlans || []).forEach((dp: any) => {
            const m = Math.max(1, Math.round((dp.durationInDays || 30) / 30));
            prices[m] = Number(dp.price) || 0;
          });
          const features = (Array.isArray(p.features) ? p.features : []).map((f: any) => ({
            key: f?.feature?.key || '',
            label: f?.feature?.label || '',
            type: f?.type || 'boolean',
            value: f?.value ?? 0,
          }));
          return {
            id: p._id,
            code: p.code,
            name: p.name,
            description: features.slice(0, 2).map((x: any) => x.label).join(', '),
            features,
            prices,
            discountedPlans: p.discountedPlans,
            basePrice: Number(p.price) || 0,
            isTrial: !!p.isTrial,
            raw: p,
            popular: false,
          } as any;
        });
        // Always show free plan first, then by ascending base price
        normalized = normalized.sort((a: any, b: any) => {
          const aFree = a.basePrice === 0 || a.isTrial || /free/i.test(a.name || '');
          const bFree = b.basePrice === 0 || b.isTrial || /free/i.test(b.name || '');
          if (aFree && !bFree) return -1;
          if (!aFree && bFree) return 1;
          return a.basePrice - b.basePrice;
        });
        // Mark the most expensive as popular
        const idxMax = normalized.reduce((idx: number, cur: any, i: number, arr: any[]) =>
          (cur.basePrice > (arr[idx]?.basePrice ?? 0) ? i : idx), 0);
        if (normalized[idxMax]) normalized[idxMax].popular = true;
        setPlans(normalized as any);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTabLoading(true);
      const response = await GET_REQUEST(`${URLS.BASE}${URLS.getSubscriptionTransactions}`, token);
      if (response.success) {
        setTransactions((response.data as any) || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(false);
      if (!user || user.userType !== 'Agent') return;
      if (activeTab === 'subscriptions') await fetchSubscriptions(1);
      if (activeTab === 'plans') await fetchPlans();
      if (activeTab === 'transactions') await fetchTransactions();
    };
    boot();
  }, [user, activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleRenewSubscription = async () => {
    if (!selectedSubscription) return;

    setIsProcessingRenewal(true);
    try {
      // Determine plan identification from subscription (support new and old shapes)
      const subPlanName = (selectedSubscription.plan && typeof selectedSubscription.plan === 'object')
        ? selectedSubscription.plan.name
        : selectedSubscription.plan || selectedSubscription.subscriptionType || selectedSubscription.meta?.appliedPlanName;
      const subPlanCode = (selectedSubscription.plan && typeof selectedSubscription.plan === 'object')
        ? selectedSubscription.plan.code
        : selectedSubscription.meta?.planCode || selectedSubscription.subscriptionType;

      const plan = (plans as any).find((p: any) => p?.raw?.code === subPlanCode) ||
        (plans as any).find((p: any) => p?.name === subPlanName) ||
        plans[0];

      const amount = plan?.prices?.[renewalDuration] || (Object.values(plan?.prices || {})[0] as number) || 0;

      const payload = {
        subscriptionId: selectedSubscription._id,
        duration: renewalDuration,
        amount
      };

      const response = await POST_REQUEST(`${URLS.BASE}${URLS.renewSubscription}`, payload);

      if (response.success) {
        if (response.data?.transaction?.authorization_url) {
          toast.success('Renewal request created! Redirecting to payment...');
          setTimeout(() => {
            window.location.href = response.data.transaction.authorization_url;
          }, 2000);
        } else {
          toast.success('Subscription renewed successfully!');
          setShowRenewalModal(false);
          fetchSubscriptions();
        }
      } else {
        toast.error(response.message || 'Failed to renew subscription');
      }
    } catch (error) {
      console.error('Renewal error:', error);
      toast.error('Failed to process renewal');
    } finally {
      setIsProcessingRenewal(false);
    }
  };

  const handleSubscribeToPlan = async (plan: any, duration: number, price: number) => {
    setSelectedPlanForSub(plan);
    setSelectedDuration(duration);
    setSelectedPlanPrice(price);

    let specificPlanCode = plan?.code || plan?.id;

      // Find if this duration/price combination is a discounted plan
    const matchingDiscountedPlan = (plan.discountedPlans || []).find((dp: any) => {
      const dpDurationMonths = Math.max(1, Math.round((dp.durationInDays || 30) / 30));
      return dpDurationMonths === duration && Number(dp.price) === Number(price);
    });

    if (matchingDiscountedPlan && matchingDiscountedPlan.code) {
      specificPlanCode = matchingDiscountedPlan.code;
    }

    setSelectedPlanCodeForSub(specificPlanCode);
    setAutoRenewal(false);
    setShowSubscribeModal(true);
  };

  const confirmSubscribe = async () => {
    if (!selectedPlanForSub) return;
    setIsProcessingSubscribe(true);
    try {
      const planCode = selectedPlanCodeForSub;
  
      const payload = { planCode, autoRenewal } as any;
      const res = await POST_REQUEST<any>(`${URLS.BASE}/account/subscriptions/makeSub`, payload, token);
      if ((res as any)?.success && (res as any)?.data?.paymentUrl) {
        toast.success('Redirecting to payment...');
        window.location.href = (res as any).data.paymentUrl;
      } else if ((res as any)?.success) {
        toast.success((res as any)?.message || 'Subscription initiated');
        setShowSubscribeModal(false);
      } else {
        toast.error((res as any)?.message || 'Failed to initiate subscription');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to initiate subscription');
    } finally {
      setIsProcessingSubscribe(false);
    }
  };

  if (user?.userType !== 'Agent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to agents.</p>
        </div>
      </div>
    );
  }

  const kycApproved = (user as any)?.agentData?.kycStatus === 'approved';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
            <ArrowLeftIcon size={20} />
            Back to Dashboard
          </Link>
        </div>
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Subscriptions</h1>
            <p className="text-gray-600">Manage your subscriptions, view plans, and track transactions</p>
          </div>
          {activeSubscriptionFromProfile && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="text-sm text-green-800">
                Active subscription: <span className="font-semibold">{activeSubscriptionFromProfile.plan || activeSubscriptionFromProfile.subscriptionType}</span>
              </div>
              <div className="text-xs text-green-700">
                {activeSubscriptionFromProfile.startDate && <>Start: {new Date(activeSubscriptionFromProfile.startDate).toLocaleDateString()} • </>}
                {activeSubscriptionFromProfile.endDate && <>Ends: {new Date(activeSubscriptionFromProfile.endDate).toLocaleDateString()}</>}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'subscriptions', label: 'My Subscriptions', icon: Package },
                { key: 'plans', label: 'Subscription Plans', icon: CreditCard },
                { key: 'transactions', label: 'Transaction History', icon: Calendar }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab(key as any)}
                    className={`${
                      activeTab === key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                  <button
                    onClick={() => {
                      if (key === 'subscriptions') fetchSubscriptions(1);
                      if (key === 'plans') fetchPlans();
                      if (key === 'transactions') fetchTransactions();
                    }}
                    className={`text-xs inline-flex items-center gap-1 px-2 py-1 border rounded ${activeTab === key ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-500'}`}
                    title="Refresh"
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {(activeTab === 'subscriptions' || activeTab === 'plans') && (
          <>
          {!kycApproved ? (
            <Block
              title="KYC Verification Required"
              message={
                "You must complete your onboarding and be approved before you can post properties."
              }
              actionHref="/agent-kyc"
              actionLabel="Submit KYC"
              icon={<CheckCircle2 size={32} className="text-[#8DDB90]" />}
            />
          ) : (
            <>
              {/* Tab Content */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  {tabLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                  ) : subscriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions</h3>
                      <p className="text-gray-500 mb-6">You don&apos;t have any active subscriptions yet.</p>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Browse Plans
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscriptions.map((subscription: any) => {
                        // Normalize fields to support both old and new API shapes
                        const planObj = subscription.plan && typeof subscription.plan === 'object' ? subscription.plan : (subscription.plan || null);
                        const planName = planObj?.name || subscription.plan || subscription.subscriptionType || subscription.planName || (subscription.meta && subscription.meta.appliedPlanName) || '-';
                        const planCode = planObj?.code || subscription.plan?.code || subscription.subscriptionType || subscription.meta?.planCode || subscription.meta?.planCode;
                        const startDateRaw = subscription.startedAt || subscription.startDate || subscription.startedAt || null;
                        const endDateRaw = subscription.expiresAt || subscription.endDate || subscription.endsAt || null;
                        const amount = subscription.transaction?.amount || subscription.amount || 0;
                        const txnRef = subscription.transaction?._id || subscription.transaction?.reference || subscription.transaction?.id || '-';
                        const txnStatus = subscription.transaction?.status || subscription.status || '-';
                        const isFreePlan = ((planObj && ((planObj as any).basePrice === 0 || (planObj as any).isTrial)) ||
                          /free|trial/i.test(String(planName)) ||
                          Number(amount || 0) === 0);

                        return (
                          <div key={subscription._id || subscription.id} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">{planName}</h3>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(subscription.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                                  {subscription.status}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Start Date:</span>
                                <span className="font-medium">{startDateRaw ? format(new Date(startDateRaw), 'MMM d, yyyy') : '-'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">End Date:</span>
                                <span className="font-medium">{endDateRaw ? format(new Date(endDateRaw), 'MMM d, yyyy') : '-'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium">₦{Number(amount || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction</h4>
                              <div className="text-xs text-gray-600">Ref: {txnRef} • {txnStatus}</div>
                            </div>

                            {subscription.status === 'active' && !isFreePlan && (
                              <button
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowRenewalModal(true);
                                }}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <RefreshCw size={16} />
                                Renew Subscription
                              </button>
                            )}

                            {subscription.status === 'expired' && (
                              <button
                                onClick={() => setActiveTab('plans')}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus size={16} />
                                Subscribe Again
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {subscriptionsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button disabled={subscriptionsPage <= 1} onClick={() => fetchSubscriptions(subscriptionsPage - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                      <span className="text-sm text-gray-600">Page {subscriptionsPage} of {subscriptionsTotalPages}</span>
                      <button disabled={subscriptionsPage >= subscriptionsTotalPages} onClick={() => fetchSubscriptions(subscriptionsPage + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.map((plan: any) => (
                    <div key={plan.id || plan.name} className={`bg-white rounded-lg border-2 p-6 relative ${plan.popular ? 'border-green-500' : 'border-gray-200'}`}>
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          {(() => {
                            const isFreePlan = plan.basePrice === 0 || plan.isTrial || /free/i.test(plan.name || '');
                            const kycApproved = (user as any)?.agentData?.kycStatus === 'approved';
                            if (isFreePlan && kycApproved) {
                              return (
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">Used / Exhausted</span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Features:</h4>
                        <ul className="space-y-2">
                          {(plan.features || []).map((f: any, index: number) => {
                            const type = String(f.type);
                            const isOn = type === 'boolean' ? Number(f.value) === 1 : true;
                            let valueText = '';
                            if (type === 'count') valueText = `: ${f.value}`;
                            if (type === 'unlimited') valueText = ': Unlimited';
                            return (
                              <li key={index} className={`flex items-center gap-2 text-sm ${isOn ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                                {isOn ? (
                                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                                )}
                                <span>{f.label}{valueText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing:</h4>
                        <div className="space-y-2">
                          {Object.entries(plan.prices || {}).map(([duration, price]: any) => {
                            const isFreePlan = plan.basePrice === 0 || plan.isTrial || /free/i.test(plan.name || '');
                            const disabledByActive = !!(activeSubscriptionFromProfile && activeSubscriptionFromProfile.status === 'active');
                            const disabledByKyc = isFreePlan && ((user as any)?.agentData?.kycStatus === 'approved');
                            const disabled = disabledByActive || disabledByKyc;
                            const label = disabledByKyc ? 'Expired' : (disabled ? 'Active' : 'Subscribe');

                            return (
                              <div key={duration} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{duration} month{parseInt(duration) > 1 ? 's' : ''}:</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">₦{Number(price).toLocaleString()}</span>
                                  {!isFreePlan && (
                                    <button
                                      onClick={() => handleSubscribeToPlan(plan as any, parseInt(duration), price)}
                                      disabled={disabled}
                                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${disabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                      {label}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
        )}
      </>
    )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg border border-gray-200">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
                <p className="text-gray-500">Your subscription transactions will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {transaction.transactionType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-green-600 hover:text-green-700"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Download Receipt"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Renewal Modal */}
        {showRenewalModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Renew Subscription
              </h3>
              <p className="text-gray-600 mb-4">
                Renew your {selectedSubscription.subscriptionType} subscription
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Duration
                </label>
                <select
                  value={renewalDuration}
                  onChange={(e) => setRenewalDuration(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(
                    (
                      (plans as any).find(
                        (p: any) => p?.raw?.code === selectedSubscription.subscriptionType
                      ) ||
                      (plans as any).find(
                        (p: any) => p?.name === (selectedSubscription as any)?.plan
                      ) ||
                      plans[0] ||
                      { prices: {} }
                    ).prices || {}
                  ).map(([duration, price]) => {
                    const formattedPrice = (price as number) || 0; // 👈 assert as number
                    return (
                      <option key={duration} value={duration}>
                        {duration} month{parseInt(duration) > 1 ? 's' : ''} - ₦
                        {formattedPrice.toLocaleString()}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRenewalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenewSubscription}
                  disabled={isProcessingRenewal}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingRenewal ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscribe Confirmation Modal */}
        {showSubscribeModal && selectedPlanForSub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Subscription</h3>
              <p className="text-gray-700 mb-1">You are about to subscribe to:</p>
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="font-semibold text-gray-900">{selectedPlanForSub.name}</div>
                {selectedDuration && (
                  <div className="text-sm text-gray-600">Duration: {selectedDuration} month{selectedDuration > 1 ? 's' : ''}</div>
                )}

                {selectedPlanPrice && (
                  <div className="text-sm text-gray-600">Price: ₦{Number(selectedPlanPrice).toLocaleString()}</div>
                )}
              </div>
 
              <div className="flex items-center gap-2 mb-6">
                <input id="autoRenew" type="checkbox" checked={autoRenewal} onChange={(e) => setAutoRenewal(e.target.checked)} className="rounded border-gray-300 text-green-600 focus:ring-green-600" />
                <label htmlFor="autoRenew" className="text-sm text-gray-800">Enable auto-renewal when this plan expires</label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSubscribeModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={confirmSubscribe} disabled={isProcessingSubscribe} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isProcessingSubscribe ? (<><RefreshCw size={16} className="animate-spin" />Processing...</>) : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Reference:</span> <span className="font-medium">{selectedTransaction.reference}</span></div>
                <div><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{selectedTransaction.transactionType}</span></div>
                <div><span className="text-gray-600">Amount:</span> <span className="font-medium">₦{selectedTransaction.amount.toLocaleString()}</span></div>
                <div><span className="text-gray-600">Status:</span> <span className="font-medium capitalize">{selectedTransaction.status}</span></div>
                <div><span className="text-gray-600">Date:</span> <span className="font-medium">{format(new Date(selectedTransaction.createdAt), 'MMM d, yyyy, h:mm a')}</span></div>
                {selectedTransaction.paymentMode && (<div><span className="text-gray-600">Payment Mode:</span> <span className="font-medium capitalize">{selectedTransaction.paymentMode}</span></div>)}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setSelectedTransaction(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        )}
        {/* Processing Overlay */}
        {isProcessingRenewal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
              <RefreshCw className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Renewal</h3>
              <p className="text-gray-600">Please wait while we process your subscription renewal...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
