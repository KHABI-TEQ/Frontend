import React from 'react';
import { CheckCircle } from 'lucide-react';

type DocumentStatus = 'pending' | 'registered' | 'unregistered' | 'in-progress' | 'payment-approved' | 'payment-failed';

interface DocumentVerificationBoundaryProps {
  status: DocumentStatus;
  documentID: string;
}

const DocumentVerificationBoundary: React.FC<DocumentVerificationBoundaryProps> = ({ 
  status, 
  documentID 
}) => {
  const isVerified = status === 'registered' || status === 'unregistered';

  if (!isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-50 mb-6">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Document Already Verified
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            This document has already been successfully verified or attended to.
            No further action is required at this time.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              Document ID: <span className="font-medium">{documentID}</span>
            </p>
            <p className="text-sm text-green-700 mt-2">
              Status: <span className="font-medium uppercase">{status}</span>
            </p>
          </div>

          <div className="bg-[#0B423D] text-white p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Need Help?</p>
            <p className="text-xs sm:text-sm">
              Contact: <span className="text-[#8DDB90]">verification@khabiteqrealty.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationBoundary;
