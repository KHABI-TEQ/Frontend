"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiFile,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

interface DocumentUploadProps {
  onFileUpload: (file: File) => Promise<string>;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  onUploadComplete,
  onError,
  acceptedTypes = [".docx", ".doc", ".pdf"],
  maxSizeInMB = 10,
  className = "",
  label = "Upload Document",
  description = "Drag and drop your document here, or click to browse",
  required = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!acceptedTypes.includes(fileExtension)) {
        return `File type not supported. Please upload: ${acceptedTypes.join(", ")}`;
      }

      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        return `File size too large. Maximum size is ${maxSizeInMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSizeInMB],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError("");

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return;
      }

      setSelectedFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Call the upload function
        const url = await onFileUpload(file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadedUrl(url);
        setUploadComplete(true);
        onUploadComplete(url);
      } catch (error) {
        console.error("Upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onFileUpload, onUploadComplete, onError],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleClick = useCallback(() => {
    if (!uploadComplete && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [uploadComplete, isUploading]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);
    setUploadedUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const getFileTypeIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      default:
        return "📎";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : uploadComplete
              ? "border-green-400 bg-green-50"
              : error
                ? "border-red-400 bg-red-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
        />

        <AnimatePresence mode="wait">
          {uploadComplete ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-2xl">
                  {selectedFile ? getFileTypeIcon(selectedFile.name) : "📄"}
                </span>
              </div>
              <p className="text-sm font-medium text-green-800 mb-1">
                Upload Complete!
              </p>
              <p className="text-xs text-green-600 mb-3">
                {selectedFile?.name}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
              >
                <FiX className="w-3 h-3" />
                <span>Upload Different File</span>
              </button>
            </motion.div>
          ) : isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <FiLoader className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xl">
                  {selectedFile ? getFileTypeIcon(selectedFile.name) : "📄"}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-800 mb-2">
                Uploading {selectedFile?.name}...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {uploadProgress}% complete
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <FiAlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-red-800 mb-1">
                Upload Failed
              </p>
              <p className="text-xs text-red-600 mb-3">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
              >
                <FiUpload className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {description}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Supported formats: {acceptedTypes.join(", ")} (max {maxSizeInMB}
                MB)
              </p>
              <span className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                <FiFile className="w-4 h-4" />
                <span>Choose File</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-80 rounded-lg flex items-center justify-center">
            <p className="text-blue-700 font-medium">Drop your file here</p>
          </div>
        )}
      </div>

      {selectedFile && !error && !uploadComplete && !isUploading && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {getFileTypeIcon(selectedFile.name)}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
