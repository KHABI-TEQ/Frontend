/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trio } from "ldrs/react";

interface OverlayPreloaderProps {
  message?: string;
  isVisible: boolean;
}

const OverlayPreloader: React.FC<OverlayPreloaderProps> = ({
  message = "Loading...",
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4"
      >
        <Trio size={50} speed={1.3} color="#09391C" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#09391C] mb-2">
            {message}
          </h3>
          <p className="text-sm text-[#5A5D63]">Please wait a moment...</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OverlayPreloader;
