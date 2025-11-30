"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actionLabel?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message, actionLabel = "Close" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
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
            <div className="p-6">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors"
              >
                {actionLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
