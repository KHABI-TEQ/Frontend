"use client";

import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: "alert" | "check" | "custom";
  customIcon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  icon = "alert",
  customIcon,
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = isDangerous
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-emerald-600 hover:bg-emerald-700 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Icon Section */}
        <div className={`flex justify-center pt-8 ${isDangerous ? "bg-red-50" : "bg-emerald-50"}`}>
          {customIcon ? (
            <div className="text-4xl">{customIcon}</div>
          ) : icon === "alert" ? (
            <AlertCircle className={`w-12 h-12 ${isDangerous ? "text-red-600" : "text-amber-600"}`} />
          ) : (
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          )}
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 sm:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>

          {description && (
            <p className="text-center text-gray-600 text-sm mb-4">
              {description}
            </p>
          )}

          {message && (
            <div className={`rounded-lg p-4 mb-6 ${isDangerous ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className={`text-sm ${isDangerous ? "text-red-800" : "text-amber-800"}`}>
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex gap-3 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
