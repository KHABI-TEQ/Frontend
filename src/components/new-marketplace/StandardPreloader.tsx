/** @format */

"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StandardPreloaderProps {
  isVisible: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
}

const StandardPreloader: React.FC<StandardPreloaderProps> = ({
  isVisible,
  message = "Loading...",
  size = "md",
  overlay = true,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6";
      case "lg":
        return "w-16 h-16";
      default:
        return "w-12 h-12";
    }
  };

  const SpinnerComponent = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`${getSizeClasses()} border-4 border-[#8DDB90] border-opacity-20 rounded-full`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${getSizeClasses()} border-4 border-transparent border-t-[#8DDB90] rounded-full animate-spin`}
        ></div>
      </div>
      {message && (
        <p className="text-sm text-[#5A5D63] text-center max-w-xs">{message}</p>
      )}
    </div>
  );

  // Inline spinner without overlay
  if (!overlay) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex justify-center items-center py-8"
          >
            <SpinnerComponent />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full overlay spinner
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 min-w-[200px] max-w-[300px] mx-4"
          >
            <SpinnerComponent />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StandardPreloader;
