/** @format */

"use client";

import React, { useEffect, useState } from "react";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { transactionService } from "@/services/transactionService";
import { Transaction, TransactionResponse } from "@/types/transaction.types";
import { useUserContext } from "@/context/user-context";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useUserContext();

  const fetchTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: TransactionResponse = await transactionService.fetchAllTransactions(page, 10);
      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to load transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = async (transactionId: string) => {
    try {
      const response = await transactionService.fetchTransactionById(transactionId);
      setSelectedTransaction(response.data);
      setModalOpen(true);
    } catch (error) {
      toast.error("Failed to load transaction details");
      console.error("Error fetching transaction:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTransactions(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners"]}
      requireAgentOnboarding={true}
      requireAgentApproval={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">
            View and manage your transaction history
          </p>
        </div>

        {transactions && transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No transactions found
            </h2>
            <p className="text-gray-600">
              Your transaction history will appear here once you make your first transaction.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions && transactions.map((transaction) => (
                  <li key={transaction._id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {transaction.transactionType.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {transaction.reference}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  transaction.status
                                )}`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <p>
                                {transaction.transactionType.replace("-", " ")} •{" "}
                                {transaction.paymentMode} • {transaction.platform}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(transaction.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewTransaction(transaction._id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Transaction Detail Modal */}
        {modalOpen && selectedTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Transaction Details
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reference
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.reference}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Transaction Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.transactionType.replace("-", " ")}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Mode
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.paymentMode}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Platform
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.platform}
                    </p>
                  </div>
                  
                  {typeof selectedTransaction.fromWho.item === "object" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTransaction.fromWho.item.firstName}{" "}
                        {selectedTransaction.fromWho.item.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedTransaction.fromWho.item.email}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CombinedAuthGuard>
  );
};

export default TransactionsPage;
