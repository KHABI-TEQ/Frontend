/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

interface FailedRequestProps {
  message?: string;
  onRetry: () => void;
  loading?: boolean;
  className?: string;
}

const FailedRequest: React.FC<FailedRequestProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  loading = false,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-lg border border-red-200 ${className}`}
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-red-600 mb-2">
        Request Failed
      </h3>

      <p className="text-gray-600 mb-6 max-w-md">{message}</p>

      <button
        onClick={onRetry}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Retrying..." : "Try Again"}
      </button>
    </motion.div>
  );
};

export default FailedRequest;
