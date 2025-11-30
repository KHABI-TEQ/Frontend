"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileImage,
  faFilePdf,
  faCheck,
  faExclamationTriangle,
  faSpinner,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { paymentValidator, formatAmount } from "@/utils/payment-validation";

interface PaymentReceiptUploadProps {
  expectedAmount: number;
  onValidationComplete: (result: any) => void;
  onFileChange?: (file: File | null) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  currency?: "NGN" | "USD";
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  extractedAmount?: number;
  extractedText?: string;
  errors?: string[];
}

const PaymentReceiptUpload: React.FC<PaymentReceiptUploadProps> = ({
  expectedAmount,
  onValidationComplete,
  onFileChange,
  allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  maxFileSize = 10,
  currency = "NGN",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      // Validate file type
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "Invalid file type. Please upload an image (JPG, PNG) or PDF file.",
        );
        return;
      }

      // Validate file size
      if (selectedFile.size > maxFileSize * 1024 * 1024) {
        toast.error(
          `File size too large. Please upload a file smaller than ${maxFileSize}MB.`,
        );
        return;
      }

      setFile(selectedFile);
      onFileChange?.(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }

      // Start validation
      await validateFile(selectedFile);
    },
    [allowedTypes, maxFileSize, onFileChange],
  );

  // Validate payment receipt
  const validateFile = async (fileToValidate: File) => {
    setValidating(true);
    setValidationResult(null);

    try {
      const result = await paymentValidator.validatePaymentReceipt(
        fileToValidate,
        { expectedAmount, currency },
      );

      setValidationResult(result);
      onValidationComplete(result);

      if (result.isValid) {
        toast.success(
          `Payment verified! Amount: ${formatAmount(result.extractedAmount || 0, currency)}`,
        );
      } else {
        toast.error("Payment verification failed. Please check the receipt.");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate payment receipt");
    } finally {
      setValidating(false);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove file
  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setValidationResult(null);
    onFileChange?.(null);
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return faFileImage;
    } else if (fileType === "application/pdf") {
      return faFilePdf;
    }
    return faFileImage;
  };

  return (
    <div className="w-full">
      {/* Expected Amount Display */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">
              Expected Payment Amount
            </h4>
            <p className="text-blue-700">
              {formatAmount(expectedAmount, currency)}
            </p>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatAmount(expectedAmount, currency)}
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Please upload a clear image or PDF of your payment receipt showing
          this amount.
        </p>
      </div>

      {/* File Upload Area */}
      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? "border-[#8DDB90] bg-[#8DDB90]/5"
              : "border-gray-300 hover:border-[#8DDB90] hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleInputChange}
            accept={allowedTypes.join(",")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <motion.div
              animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
              className="text-6xl text-gray-400"
            >
              <FontAwesomeIcon icon={faUpload} />
            </motion.div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Payment Receipt
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your receipt here, or click to browse
              </p>
              <div className="text-sm text-gray-500">
                <p>Supported formats: JPG, PNG, PDF</p>
                <p>Maximum file size: {maxFileSize}MB</p>
              </div>
            </div>

            <button
              type="button"
              className="bg-[#8DDB90] text-white px-6 py-3 rounded-lg hover:bg-[#7BC87F] transition-colors font-medium"
            >
              Choose File
            </button>
          </div>
        </div>
      ) : (
        /* File Preview */
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            {/* File Icon/Preview */}
            <div className="flex-shrink-0">
              {preview ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={getFileIcon(file.type)}
                    className="text-2xl text-gray-400"
                  />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {file.name}
              </h4>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {file.type.split("/")[1].toUpperCase()}
              </p>

              {/* Validation Status */}
              <div className="mt-3">
                {validating ? (
                  <div className="flex items-center text-blue-600">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                    <span className="text-sm">Validating payment...</span>
                  </div>
                ) : validationResult ? (
                  <div
                    className={`flex items-center ${
                      validationResult.isValid
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        validationResult.isValid
                          ? faCheck
                          : faExclamationTriangle
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {validationResult.isValid
                        ? `Payment verified (${validationResult.confidence}% confidence)`
                        : "Payment verification failed"}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {preview && (
                <button
                  type="button"
                  onClick={() => window.open(preview, "_blank")}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View full size"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              )}
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove file"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              {validationResult.isValid ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-green-600 mr-2"
                    />
                    <h5 className="font-medium text-green-900">
                      Payment Verified Successfully
                    </h5>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Expected: {formatAmount(expectedAmount, currency)}</p>
                    <p>
                      Found:{" "}
                      {formatAmount(
                        validationResult.extractedAmount || 0,
                        currency,
                      )}
                    </p>
                    <p>Confidence: {validationResult.confidence}%</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-red-600 mr-2"
                    />
                    <h5 className="font-medium text-red-900">
                      Payment Verification Failed
                    </h5>
                  </div>
                  {validationResult.errors && (
                    <div className="text-sm text-red-700 space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <p key={index}>• {error}</p>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => validateFile(file)}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Tips for better verification:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>• Ensure the receipt is clear and readable</li>
          <li>
            • Make sure the amount {formatAmount(expectedAmount, currency)} is
            visible
          </li>
          <li>• Include transaction date and reference if possible</li>
          <li>• Avoid blurry or cropped images</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentReceiptUpload;
