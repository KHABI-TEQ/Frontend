"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Plus, ArrowLeft } from "lucide-react";
import Button from "@/components/general-components/button";
import { useRouter } from "next/navigation";

interface PreferenceSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName?: string;
}

const PreferenceSuccessModal: React.FC<PreferenceSuccessModalProps> = ({
  isOpen,
  onClose,
  buyerName,
}) => {
  const router = useRouter();

  const handleCreateAnother = () => {
    onClose();
    window.location.reload();
  };

  const handleBackToMarketplace = () => {
    router.push("/agent-marketplace");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#8DDB90] px-6 py-4 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3"
              >
                <CheckCircle size={32} className="text-[#8DDB90]" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Property Matched Successfully!
              </h2>
              <p className="text-white text-opacity-90">
                Your property has been successfully matched to a preference
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• The buyer will be notified about your property</li>
                <li>• Your property will be prioritized in their search results</li>
                <li>• You&apos;ll receive notifications for any inquiries</li>
                <li>• The buyer can schedule inspections directly</li>
              </ul>
            </div>

            {/* Action Question */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2 text-center">
                What would you like to do next?
              </h4>
              <p className="text-sm text-green-700 text-center">
                You can create another property for the same preference or return to find more opportunities.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                value="Create Another Property for Same Preference"
                onClick={handleCreateAnother}
                className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
              </Button>

              <Button
                type="button"
                value="Back to Agent Marketplace"
                onClick={handleBackToMarketplace}
                className="w-full border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team anytime
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreferenceSuccessModal;
