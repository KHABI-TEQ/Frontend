/** @format */

"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useGlobalPropertyActions } from "@/context/global-property-actions-context";

const GlobalPropertyActionsFAB = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { hasSelectedProperties, selectedCount } = useGlobalPropertyActions();

  // Don't show FAB on the continue-inspection page itself or other specific pages
  const shouldHideFAB = pathname === "/continue-inspection" ||
                        (pathname && pathname.includes("/secure-buyer-response")) ||
                        (pathname && pathname.includes("/secure-seller-response"));

  const handleFABClick = () => {
    router.push("/continue-inspection");
  };

  return (
    <AnimatePresence>
      {hasSelectedProperties && !shouldHideFAB && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 0.3 
          }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={handleFABClick}
            className="group relative bg-[#8DDB90] hover:bg-[#76c77a] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            title={`Continue inspection for ${selectedCount} propert${selectedCount === 1 ? 'y' : 'ies'}`}
          >
            {/* Badge for count */}
            {selectedCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-[#09391C] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
              >
                {selectedCount}
              </motion.div>
            )}

            {/* Icon */}
            <FontAwesomeIcon 
              icon={faEye} 
              className="text-xl group-hover:scale-110 transition-transform duration-200" 
            />
          </button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Continue inspection for {selectedCount} propert{selectedCount === 1 ? 'y' : 'ies'}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalPropertyActionsFAB;
