/** @format */

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash, AlertTriangle, Loader } from "lucide-react";
import { DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface Brief {
  _id: string;
  propertyType: string;
  propertyCondition: string;
  briefType: string;
  price: number;
  features: string[];
  tenantCriteria: string[];
  owner: string;
  areYouTheOwner: boolean;
  isAvailable: string;
  pictures: string[];
  isApproved: boolean;
  isRejected: boolean;
  docOnProperty: Array<{
    docName: string;
    isProvided: boolean;
    _id: string;
  }>;
  isPreference: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  landSize: {
    measurementType: string;
    size: number;
  };
  additionalFeatures: {
    additionalFeatures: string[];
    noOfBedroom?: string;
    noOfBathroom?: string;
    noOfToilet?: string;
    noOfCarPark?: string;
  };
}

interface DeleteConfirmationModalProps {
  brief: Brief;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  brief,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const expectedConfirmText = "DELETE";

  const handleDelete = async () => {
    if (confirmText !== expectedConfirmText) {
      toast.error(`Please type "${expectedConfirmText}" to confirm deletion`);
      return;
    }

    setIsDeleting(true);
    try {
      
      const response = await DELETE_REQUEST(
        `${URLS.BASE}/user/briefs/${brief._id}`,
        Cookies.get("token"),
      );

      if (response && response.success !== false) {
        toast.success("Brief deleted successfully!");
        onConfirm();
      } else {
        toast.error(response?.message || "Failed to delete brief");
      }
    } catch (error) {
      console.error("Error deleting brief:", error);
      toast.error("An error occurred while deleting the brief");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(1)}K`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const getApprovalStatus = () => {
    if (brief.isApproved && !brief.isRejected) {
      return { label: "Approved", color: "text-green-600" };
    } else if (brief.isRejected) {
      return { label: "Rejected", color: "text-red-600" };
    } else {
      return { label: "Pending Review", color: "text-yellow-600" };
    }
  };

  const approval = getApprovalStatus();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Brief</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isDeleting}
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Brief Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                {brief.pictures && brief.pictures.length > 0 ? (
                  <img
                    src={brief.pictures[0]}
                    alt={brief.propertyType}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8DDB90] to-[#09391C] rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {brief.propertyType.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {brief.propertyType}
                  </h3>
                  <p className="text-[#8DDB90] font-bold">
                    {formatPrice(brief.price)}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {brief.location.area}, {brief.location.localGovernment}
                  </p>
                  <span className={`text-xs font-medium ${approval.color}`}>
                    {approval.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this brief? This action cannot
                be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">This will permanently:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Remove the brief from your listings</li>
                      <li>Delete all associated data</li>
                      <li>Cancel any ongoing negotiations</li>
                      <li>Remove the property from search results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type{" "}
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-600">
                  {expectedConfirmText}
                </span>{" "}
                to confirm deletion:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={`Type "${expectedConfirmText}" here`}
                disabled={isDeleting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting || confirmText !== expectedConfirmText}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash size={16} />
                    Delete Brief
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
