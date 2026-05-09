"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles } from "lucide-react";

interface UserTypeFloatingButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function UserTypeFloatingButton({
  onClick,
  isVisible,
}: UserTypeFloatingButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.button
            onClick={onClick}
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#09391C] to-[#0B423D] text-white shadow-2xl shadow-[#09391C]/30 border border-white/10 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(9, 57, 28, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated sparkle icon */}
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-[#8DDB90]" />
            </motion.div>

            {/* Icon */}
            <div className="relative">
              <Users className="w-5 h-5" />
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#8DDB90]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Text */}
            <span className="font-semibold text-sm pr-1">Explore User Types</span>

            {/* Gradient shimmer effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>

          {/* Floating particles decoration */}
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 bg-[#8DDB90] rounded-full"
            animate={{
              y: [-5, 5, -5],
              x: [-3, 3, -3],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-2 w-2 h-2 bg-emerald-400 rounded-full"
            animate={{
              y: [5, -5, 5],
              x: [3, -3, 3],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
