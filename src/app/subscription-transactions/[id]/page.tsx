/** @format */

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  RefreshCw,
  DollarSign,
  FileText,
  User,
  Building
} from 'lucide-react';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import { SubscriptionTransaction, AgentSubscription } from '@/types/subscription.types';
import { format } from 'date-fns';

export default function SubscriptionTransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUserContext();
  const [transaction, setTransaction] = useState<SubscriptionTransaction | null>(null);
  const [subscription, setSubscription] = useState<AgentSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = params.id as string;

  // Redirect non-agents
  useEffect(() => {
    if (user && user.userType !== 'Agent') {
      toast.error('Access denied. This page is only for agents.');
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchTransactionDetails = async () => {
    try {
      const response = await GET_REQUEST(`${URLS.BASE}${URLS.getSubscriptionTransactions}/${transactionId}`);
      if (response.success) {
        setTransaction(response.data.transaction);
        setSubscription(response.data.subscription);
      } else {
        toast.error('Transaction not found');
        router.push('/agent-subscriptions');
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
      toast.error('Failed to load transaction details');
      router.push('/agent-subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userType === 'Agent' && transactionId) {
      fetchTransactionDetails();
    }
  }, [user, transactionId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleDownloadReceipt = () => {
    // Implementation for downloading receipt
    toast.success('Receipt download feature coming soon!');
  };

  const handleRetryPayment = () => {
    // Implementation for retrying failed payments
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 mb-6">The requested transaction could not be found.</p>
          <button
            onClick={() => router.push('/agent-subscriptions')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Back to Subscriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/agent-subscriptions?tab=transactions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Transactions
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Details</h1>
          <p className="text-gray-600">View complete information about your subscription transaction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transaction Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Transaction Status</h2>
                <div className="flex items-center gap-3">
                  {getStatusIcon(transaction.status)}
                  <span className={`px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Reference</label>
                    <p className="text-lg font-mono text-gray-900">{transaction.reference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Transaction Type</label>
                    <p className="text-lg text-gray-900 capitalize">{transaction.transactionType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Payment Mode</label>
                    <p className="text-lg text-gray-900 capitalize">{transaction.paymentMode.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                    <p className="text-2xl font-bold text-gray-900">₦{transaction.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Currency</label>
                    <p className="text-lg text-gray-900">{transaction.currency}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Platform</label>
                    <p className="text-lg text-gray-900 capitalize">{transaction.platform}</p>
                  </div>
                </div>
              </div>

              {transaction.paymentDetails?.gateway_response && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gateway Response</label>
                  <p className="text-lg text-gray-900">{transaction.paymentDetails.gateway_response}</p>
                </div>
              )}
            </div>

            {/* Payment Details */}
            {transaction.paymentDetails && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
                <div className="space-y-4">
                  {transaction.paymentDetails.paid_at && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Payment Date</span>
                      <span className="font-medium">{format(new Date(transaction.paymentDetails.paid_at), 'MMM d, yyyy at h:mm a')}</span>
                    </div>
                  )}
                  {transaction.paymentDetails.access_code && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Access Code</span>
                      <span className="font-mono text-sm">{transaction.paymentDetails.access_code}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Created Date</span>
                    <span className="font-medium">{format(new Date(transaction.createdAt), 'MMM d, yyyy at h:mm a')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Transaction Created</p>
                    <p className="text-sm text-gray-500">{format(new Date(transaction.createdAt), 'MMM d, yyyy at h:mm a')}</p>
                  </div>
                </div>
                {transaction.paymentDetails?.paid_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Completed</p>
                      <p className="text-sm text-gray-500">{format(new Date(transaction.paymentDetails.paid_at), 'MMM d, yyyy at h:mm a')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${transaction.status === 'success' ? 'bg-green-500' : transaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Transaction {transaction.status === 'success' ? 'Completed' : transaction.status === 'failed' ? 'Failed' : 'Pending'}</p>
                    <p className="text-sm text-gray-500">{format(new Date(transaction.updatedAt), 'MMM d, yyyy at h:mm a')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download size={16} />
                  Download Receipt
                </button>
                {transaction.status === 'failed' && (
                  <button
                    onClick={handleRetryPayment}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Retry Payment
                  </button>
                )}
              </div>
            </div>

            {/* Subscription Info */}
            {subscription && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Subscription</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span className="font-medium capitalize">{subscription.subscriptionType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium">{subscription.duration} month{subscription.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">End Date</span>
                    <span className="font-medium">{format(new Date(subscription.endDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Need Help?</h3>
              <p className="text-sm text-green-700 mb-4">
                If you have any questions about this transaction, our support team is here to help.
              </p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
