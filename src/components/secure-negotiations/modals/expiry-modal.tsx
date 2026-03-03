"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiClock, FiRefreshCw, FiX } from "react-icons/fi";

interface ExpiryModalProps {
  onReopen: () => void;
  isReopening?: boolean;
  onClose?: () => void;
}

const ExpiryModal: React.FC<ExpiryModalProps> = ({
  onReopen,
  isReopening = false,
  onClose,
}) => {
  const router = useRouter();
  const handleClose = onClose ?? (() => router.back());

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expiry-modal-title"
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "hidden",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-md w-full border border-[#C7CAD0] relative shadow-xl"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 bg-white"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>
        <div className="p-8 pt-12 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6"
          >
            <FiClock className="w-8 h-8 text-red-600" />
          </motion.div>

          {/* Title */}
          <h2 id="expiry-modal-title" className="text-2xl font-bold text-[#09391C] mb-4">
            Link Expired
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            The 48-hour response window for this inspection has expired. Would
            you like to reopen this inspection and continue with the
            negotiation?
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onReopen}
              disabled={isReopening}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-[#09391C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              {isReopening ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reopening...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-5 h-5" />
                  <span>Reopen This Inspection</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium border border-gray-200"
            >
              Close
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4">
            Reopening will reset the 48-hour timer and notify the other party
          </p>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
};

export default ExpiryModal;
