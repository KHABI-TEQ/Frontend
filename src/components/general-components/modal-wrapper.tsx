/** @format */

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  preventBackgroundScroll?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  preventBackgroundScroll = true,
  closeOnBackdropClick = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!preventBackgroundScroll) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "unset";
    };
  }, [isOpen, preventBackgroundScroll]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md w-full mx-4 sm:mx-6";
      case "md":
        return "max-w-lg w-full mx-4 sm:mx-6";
      case "lg":
        return "max-w-4xl w-full mx-4 sm:mx-6";
      case "xl":
        return "max-w-6xl w-full mx-4 sm:mx-6";
      case "full":
        return "max-w-full w-full h-full mx-2 sm:mx-4";
      default:
        return "max-w-lg w-full mx-4 sm:mx-6";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              relative bg-white rounded-lg sm:rounded-xl shadow-xl overflow-hidden
              ${getSizeClasses()}
              ${size === "full" ? "h-full" : "max-h-[95vh] sm:max-h-[90vh]"}
              ${className}
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
                {title && (
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#09391C] font-display pr-2">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={18} className="text-[#5A5D63] sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className={`${size === "full" ? "h-full overflow-auto" : "overflow-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]"}`}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWrapper;
