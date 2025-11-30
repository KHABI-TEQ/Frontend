import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/general-components/button";

interface AgreementModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  userName?: string;
  userType?: "landowner" | "agent";
  textValue?: string;
}

const AgreementModal: React.FC<AgreementModalProps> = ({
  open,
  onClose,
  onAccept,
  userName = "User",
  userType = "landowner",
  textValue = "Agree and Post Property"
}) => {
  const getUserTypeText = () => {
    return userType === "agent" ? "Agent" : "Property Owner";
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white shadow-xl rounded-lg p-6 md:p-8 w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#09391C] font-display mb-2">
                Post Agreement
              </h2>
              <p className="text-[#5A5D63] text-sm md:text-base">
                Before continuing, kindly review and accept the terms of use for posting your property.
              </p>
            </div>

            {/* User Info */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 mb-6 text-sm text-[#1E1E1E]">
              <p>
                <span className="font-semibold">Name:</span> {userName}
              </p>
              <p>
                <span className="font-semibold">User Type:</span> {getUserTypeText()}
              </p>
            </div>

            {/* Legal Notice */}
            <div className="bg-[#FFF8E1] border border-[#FFB74D] rounded-lg p-4 mb-6">
              <p className="text-[#F57F17] text-xs text-center leading-relaxed">
                <span className="font-medium">Legal Notice:</span> By agreeing, you confirm the accuracy of the details provided. All submissions are subject to moderation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    value="Cancel"
                    type="button"
                    onClick={onClose}
                    className="flex-1 border-2 border-[#E5E7EB] text-[#5A5D63] hover:bg-[#F9FAFB] text-base font-semibold min-h-[50px] py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                />
                <Button
                    value={textValue}
                    type="button"
                    onClick={onAccept}
                    className="flex-1 text-md bg-[#09391C] hover:bg-[#062f14] text-white text-base font-semibold min-h-[50px] py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgreementModal;
