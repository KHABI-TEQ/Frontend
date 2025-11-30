/** @format */

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Share2, 
  Users, 
  DollarSign, 
  Gift, 
  Calendar,
  ExternalLink,
  Wallet,
  TrendingUp,
  Award,
  UserPlus,
  CheckCircle,
  ArrowLeftIcon
} from 'lucide-react';
import Link from "next/link";
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { useUserContext } from '@/context/user-context';

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  dateReferred: string;
  status: 'pending' | 'verified' | 'completed';
  earnings: number;
  userType: 'Agent' | 'Landowner' | 'FieldAgent';
}

interface ReferralStats {
  totalReferred: number;
  totalEarnings: number;
  pendingEarnings: number;
  completedReferrals: number;
  thisMonthEarnings: number;
}

// API response types
interface ReferralStatsApiResponse {
  totalReferred?: number;
  totalEarnings?: number;
  totalEarningsThisMonth?: number;
  totalApprovedReffered?: number;
  totalPendingReffered?: number;
  totalSubscribedReferred?: number;
  code?: string;
}

interface ReferralRecordLog {
  _id: string;
  rewardType: string;
  rewardAmount: number;
  rewardStatus: 'pending' | 'granted' | string;
  triggerAction?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReferralRecordItem {
  referredUser: {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    userType?: 'Agent' | 'FieldAgent' | 'Landowner' | string;
    accountStatus?: string;
    isAccountVerified?: boolean;
  };
  logs: ReferralRecordLog[];
  totalRewards?: number;
}

const ReferralPage = () => {
  const { user } = useUserContext();
  const [selectedOption, setSelectedOption] = useState<'Share Invite' | 'Reward History'>('Share Invite');
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferred: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    completedReferrals: 0,
    thisMonthEarnings: 0,
  });
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareLoaded, setShareLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Prefer referral code from profile
  useEffect(() => {
    const preferred = (user as any)?.referralCode;
    if (preferred) {
      setReferralCode(preferred);
    } else if (!preferred && !referralCode) {
      const fallback = user?.email
        ? `${user.email.split('@')[0].toUpperCase()}2024`
        : `${(user?.firstName || 'USER').toUpperCase()}2024`;
      setReferralCode(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      const statsResp = await GET_REQUEST<ReferralStatsApiResponse>(`${URLS.BASE}/account/referrals/stats`, token);
      const stats = (statsResp && statsResp.success && statsResp.data) ? statsResp.data : ({} as ReferralStatsApiResponse);
      setReferralStats((prev) => ({
        ...prev,
        totalReferred: Number(stats.totalReferred || 0),
        totalEarnings: Number(stats.totalEarnings || 0),
        completedReferrals: Number(stats.totalApprovedReffered || 0),
        thisMonthEarnings: Number(stats.totalEarningsThisMonth || 0),
      }));
      if (!(user as any)?.referralCode && stats.code) {
        setReferralCode(stats.code);
      }
      setShareLoaded(true);
    } catch (error) {
      toast.error('Failed to load referral stats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordsAndStats = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      const [statsResp, recordsResp] = await Promise.all([
        GET_REQUEST<ReferralStatsApiResponse>(`${URLS.BASE}/account/referrals/stats`, token),
        GET_REQUEST<{ success: boolean; data: ReferralRecordItem[]; pagination?: any }>(`${URLS.BASE}/account/referrals/records?page=1&limit=50`, token),
      ]);
      const stats = (statsResp && statsResp.success && statsResp.data) ? statsResp.data : ({} as ReferralStatsApiResponse);
      const records = (recordsResp && (recordsResp as any).data && Array.isArray((recordsResp as any).data))
        ? ((recordsResp as any).data as ReferralRecordItem[])
        : [];
      const pendingFromLogs = records.reduce((sum, item) => {
        const pendingSum = (item.logs || []).reduce((s, log) => s + (log.rewardStatus === 'pending' ? Number(log.rewardAmount || 0) : 0), 0);
        return sum + pendingSum;
      }, 0);
      setReferralStats({
        totalReferred: Number(stats.totalReferred || 0),
        totalEarnings: Number(stats.totalEarnings || 0),
        pendingEarnings: Number(pendingFromLogs || 0),
        completedReferrals: Number(stats.totalApprovedReffered || 0),
        thisMonthEarnings: Number(stats.totalEarningsThisMonth || 0),
      });
      const mappedUsers: ReferredUser[] = records.map((item) => {
        const u = item.referredUser || ({} as ReferralRecordItem['referredUser']);
        const fullName = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unknown User';
        const earliestLog = (item.logs || []).slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        const hasGranted = (item.logs || []).some((l) => l.rewardStatus === 'granted');
        const status: ReferredUser['status'] = hasGranted ? 'completed' : (u.isAccountVerified ? 'verified' : 'pending');
        const userType = (u.userType === 'Agent' || u.userType === 'FieldAgent' || u.userType === 'Landowner') ? u.userType : 'Agent';
        return {
          id: u._id || Math.random().toString(36).slice(2),
          name: fullName,
          email: u.email || '',
          dateReferred: earliestLog ? earliestLog.createdAt : new Date().toISOString(),
          status,
          earnings: Number(item.totalRewards || 0),
          userType,
        };
      });
      setReferredUsers(mappedUsers);
      if (!(user as any)?.referralCode && stats.code) {
        setReferralCode(stats.code);
      }
      setHistoryLoaded(true);
    } catch (error) {
      toast.error('Failed to load referral history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (selectedOption === 'Share Invite' && !shareLoaded) {
      fetchStats();
    }
    if (selectedOption === 'Reward History' && !historyLoaded) {
      fetchRecordsAndStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, user]);

  const copyReferralLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khabiteq.com';
    const referralLink = `${origin}/auth/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khabiteq.com';
    const referralLink = `${origin}/auth/register?ref=${referralCode}`;
    const shareData = {
      title: 'Join Khabiteq with my referral link',
      text: 'Get verified properties and trusted agents on Khabiteq. Sign up with my referral link and let\'s both earn rewards!',
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to copy
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      verified: { color: 'bg-blue-100 text-blue-800', text: 'Verified' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderShareInvite = () => (
    <div className="space-y-6">
      {/* Referral Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#8DDB90] to-[#7BC87F] p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Referred</p>
              <p className="text-2xl font-bold">{referralStats.totalReferred}</p>
            </div>
            <Users className="w-8 h-8 text-white/80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-[#09391C] to-[#0B423D] p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(referralStats.totalEarnings)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-white/80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#FFB800] to-[#FFA000] p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">This Month</p>
              <p className="text-2xl font-bold">{formatCurrency(referralStats.thisMonthEarnings)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/80" />
          </div>
        </motion.div>
      </div>

      {/* Referral Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl  border border-gray-100">
        <h3 className="text-xl font-bold text-[#09391C] mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-[#8DDB90]" />
          Share Your Referral Link
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Referral Code
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <code className="flex-1 font-mono text-lg font-bold text-[#09391C]">
                {referralCode}
              </code>
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareReferralLink}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#09391C] text-white rounded-lg hover:bg-[#0B423D] transition-colors">
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khabiteq.com';
                window.open(`mailto:?subject=Join Khabiteq&body=Get verified properties and trusted agents on Khabiteq. Sign up with my referral link: ${origin}/auth/register?ref=${referralCode}`);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#8DDB90] text-[#8DDB90] rounded-lg hover:bg-[#8DDB90] hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5" />
              Email Invite
            </button>
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-xl  border border-gray-100">
        <h3 className="text-xl font-bold text-[#09391C] mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#8DDB90]" />
          How Referral Rewards Work
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#8DDB90] rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-[#09391C] mb-2">1. Invite Friends</h4>
            <p className="text-sm text-gray-600">Share your referral link with friends and family</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#09391C] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-[#09391C] mb-2">2. They Join</h4>
            <p className="text-sm text-gray-600">Your friend signs up and gets verified on Khabiteq</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-[#09391C] mb-2">3. Earn Rewards</h4>
            <p className="text-sm text-gray-600">Get ₦500 - ₦1,000 per successful referral</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderRewardHistory = () => (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl  border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#09391C]">Available Balance</h3>
            <Wallet className="w-6 h-6 text-[#8DDB90]" />
          </div>
          <p className="text-3xl font-bold text-[#8DDB90]">{formatCurrency(referralStats.totalEarnings - referralStats.pendingEarnings)}</p>
          <p className="text-sm text-gray-600 mt-2">Ready for withdrawal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl  border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#09391C]">Pending Earnings</h3>
            <Calendar className="w-6 h-6 text-[#FFB800]" />
          </div>
          <p className="text-3xl font-bold text-[#FFB800]">{formatCurrency(referralStats.pendingEarnings)}</p>
          <p className="text-sm text-gray-600 mt-2">Awaiting completion</p>
        </motion.div>
      </div>

      {/* Referred Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl  border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#09391C] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8DDB90]" />
            Referred Users ({referredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Referred</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-[#09391C]">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.userType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.dateReferred).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#8DDB90]">
                    {user.earnings > 0 ? formatCurrency(user.earnings) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {referredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No referrals yet. Start sharing your link!</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DDB90]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#EEF1F1] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
            <ArrowLeftIcon size={20} />
            Back to Dashboard
          </Link>
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#09391C] mb-4">
            Invite Friends and Get Rewarded
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Earn money for every friend you refer to Khabiteq. Share your unique link and start earning today!
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1  border border-gray-100">
            {['Share Invite', 'Reward History'].map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option as typeof selectedOption)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedOption === option
                    ? 'bg-[#8DDB90] text-white '
                    : 'text-[#5A5D63] hover:text-[#09391C] hover:bg-gray-50'
                }`}>
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={selectedOption}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          {selectedOption === 'Share Invite' ? renderShareInvite() : renderRewardHistory()}
        </motion.div>
      </div>
    </div>
  );
};

export default ReferralPage;
