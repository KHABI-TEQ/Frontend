/** @format */

"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, File } from "lucide-react";
import Button from "@/components/general-components/button";

interface GlobalLOIUploadModalProps {
  isOpen: boolean;
  property: any;
  onClose: () => void;
  onSubmit: (property: any, document: File, documentUrl?: string) => void;
  existingDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
}

const GlobalLOIUploadModal: React.FC<GlobalLOIUploadModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(property, selectedFile);
      onClose();
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading LOI document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Submit Letter of Intent (LOI)
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Property Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Property Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Property Type</p>
                <p className="font-medium text-gray-900 mb-3">
                  {property?.propertyType || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mb-1">Investment Amount</p>
                <p className="font-medium text-gray-900">
                  {property?.investmentAmount || property?.price || "N/A"}
                </p>
              </div>
            </div>

            {/* File Upload Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload LOI Document
                </label>
                
                {/* File Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-[#8DDB90] bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <File size={24} className="text-[#8DDB90]" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop your LOI document here, or
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#8DDB90] hover:text-[#76c77a] font-medium text-sm"
                      >
                        browse files
                      </button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX (Max size: 10MB)
                </p>
              </div>

              {/* Existing Document */}
              {existingDocument && !selectedFile && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You have already uploaded an LOI document for this property. 
                    Uploading a new document will replace the existing one.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel 2354
                </button>
                <Button
                  type="submit"
                  value={isSubmitting ? "Uploading..." : existingDocument ? "Update Document" : "Submit LOI"}
                  isDisabled={isSubmitting || !selectedFile}
                  className="flex-1 bg-[#FF9800] text-white hover:bg-[#F57C00] disabled:bg-gray-300 disabled:cursor-not-allowed"
                />
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLOIUploadModal;
