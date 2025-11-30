/** @format */

"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import Button from "@/components/general-components/button";

interface InspectionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAgain: () => void;
  onWaitForReply: () => void;
}

const InspectionSuccessModal: React.FC<InspectionSuccessModalProps> = ({
  isOpen,
  onClose,
  onRequestAgain,
  onWaitForReply,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Inspection Request Submitted!
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your request has been sent successfully
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-4">
                  Your inspection request has been successfully submitted to the property owner. 
                </p>
                <p className="text-sm text-gray-600">
                  What would you like to do next?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={onRequestAgain}
                  value="Request Another Inspection"
                  className="w-full px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors"
                />
                <Button
                  onClick={onWaitForReply}
                  value="Wait for Seller's Reply"
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InspectionSuccessModal;
