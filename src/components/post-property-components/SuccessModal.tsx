"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Home, Eye } from "lucide-react";
import Button from "@/components/general-components/button";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUpdate?: boolean; // New prop to differentiate between create and update
} 

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  isUpdate = false,
}) => {
  const router = useRouter();

    const handleReturnDashboard = () => {
    router.push("/dashboard");
    onClose();
  };

  const handleCreateNewBrief = () => {
    router.push("/post-property");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#8DDB90] px-6 py-4 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3"
              >
                <CheckCircle size={32} className="text-[#8DDB90]" />
              </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                {isUpdate ? "Property Updated Successfully!" : "Property Listed Successfully!"}
              </h2>
              <p className="text-white text-opacity-90">
                {isUpdate
                  ? "Your property listing has been updated with the latest information"
                  : "Your property is now live and ready for potential buyers"
                }
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
         
            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {isUpdate ? (
                  <>
                    <li>• Your updated property details are now live</li>
                    <li>• Changes will be visible to potential buyers immediately</li>
                    <li>• Existing inquiries will see the updated information</li>
                    <li>• You&apos;ll continue receiving notifications for new inquiries</li>
                  </>
                ) : (
                  <>
                    <li>• Your property will be reviewed within 24 hours</li>
                    <li>• Once approved, it will appear in search results</li>
                    <li>• You&apos;ll receive notifications for inquiries</li>
                    <li>• Potential buyers can schedule inspections</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                            <Button
                type="button"
                value="Return back to dashboard"
                onClick={handleReturnDashboard}
                className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={18} />
              </Button>

              {!isUpdate && (
                <Button
                  type="button"
                  value="Create new brief"
                  onClick={handleCreateNewBrief}
                  className="w-full border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team anytime
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuccessModal;
