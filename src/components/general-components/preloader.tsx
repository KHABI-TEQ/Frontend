/** @format */

"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  isVisible: boolean;
  message?: string;
}

const Preloader: React.FC<PreloaderProps> = ({
  isVisible,
  message = "Processing...",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 min-w-[280px] max-w-[400px] mx-4"
          >
            {/* Spinner */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#8DDB90] border-opacity-20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#8DDB90] rounded-full animate-spin"></div>
            </div>

            {/* Message */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#09391C] mb-2">
                {message}
              </h3>
              <p className="text-sm text-[#5A5D63]">
                Please wait while we process your request...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
