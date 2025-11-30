"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { transactionService } from "@/services/transactionService";
import { Transaction } from "@/types/transaction.types";
import { format } from "date-fns";
import { CheckCircle, ArrowLeft, Download, Printer, Share2 } from "lucide-react";

export default function TransactionReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchTrx = async () => {
      try {
        const res = await transactionService.fetchTransactionById(id);
        setTransaction(res.data);
      } catch (e) {
        router.push("/transactions");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrx();
  }, [id, router]);

  const printReceipt = () => {
    window.print();
  };

  const downloadReceipt = () => {
    // For now, trigger print to PDF; dedicated PDF generation can be added later
    window.print();
  };

  const shareReceipt = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Payment Receipt", text: `Reference: ${transaction?.reference}` });
      }
    } catch {}
  };

  const titleForType = (type?: string) => {
    if (!type) return "Payment Receipt";
    if (type === "inspection-request") return "Inspection Request Payment Receipt";
    if (type === "document-verification") return "Document Verification Receipt";
    return "Payment Receipt";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load the transaction receipt.</p>
          <button onClick={() => router.push("/transactions")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <CombinedAuthGuard requireAuth={true} allowedUserTypes={["Agent", "Landowners"]} requireAgentOnboarding={true} requireAgentApproval={true}>
      <div className="min-h-screen bg-gray-50 py-10 px-4 print:bg-white">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{titleForType(transaction.transactionType)}</h1>
              <p className="text-gray-600">Reference: <span className="font-mono">{transaction.reference}</span></p>
            </div>
            <div className="hidden print:block">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-2xl font-bold">₦{transaction.amount.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {transaction.status}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Payment Mode</p>
              <p className="font-medium capitalize">{transaction.paymentMode.replace('_', ' ')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>

          {typeof transaction.fromWho.item === 'object' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Billed To</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="font-medium">{(transaction.fromWho.item as any).firstName} {(transaction.fromWho.item as any).lastName}</p>
                <p className="text-sm text-gray-600">{(transaction.fromWho.item as any).email}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={downloadReceipt} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Download size={18} /> Download
            </button>
            <button onClick={printReceipt} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Printer size={18} /> Print
            </button>
            <button onClick={shareReceipt} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
