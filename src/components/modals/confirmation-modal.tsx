"use client";

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  type?: "warning" | "success" | "info" | "danger";
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return faCheck;
      case "danger":
        return faExclamationTriangle;
      case "warning":
        return faExclamationTriangle;
      default:
        return faExclamationTriangle;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return {
          icon: "text-green-600",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "danger":
        return {
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: "text-yellow-600",
          button: "bg-yellow-600 hover:bg-yellow-700",
        };
      default:
        return {
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const colors = getColorClasses();

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon
            icon={getIcon()}
            className={`text-2xl ${colors.icon}`}
          />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 leading-relaxed">{message}</p>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  );
};

export default ConfirmationModal;
