/** @format */

"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Building,
  MapPin,
  DollarSign,
  Trash2
} from "lucide-react";
import Button from "@/components/general-components/button";
import { POST_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface SimplifiedLOIUploadModalProps {
  isOpen: boolean;
  property: any;
  onClose: () => void;
  onSubmit: (property: any, document: File, documentUrl: string) => void;
  existingDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
  } | null;
} 

const SimplifiedLOIUploadModal: React.FC<SimplifiedLOIUploadModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>(existingDocument?.documentUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }
    
    setUploadError("");
    setSelectedFile(file);
    
    // Immediately upload the file
    await uploadFile(file);
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('for', 'property-file');

      const uploadSingleFileUrl = URLS.BASE + URLS.uploadSingleImg;
      const response = await POST_REQUEST(uploadSingleFileUrl, formData, undefined, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.success) {
        setUploadedFileUrl(response.url);
        setUploadError("");
      }else{
        setUploadError("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadedFileUrl) return;

    try {
      await DELETE_REQUEST('/delete-single-file', { url: uploadedFileUrl });
      setUploadedFileUrl("");
      setSelectedFile(null);
      setUploadError("");
    } catch (error) {
      console.error("File deletion error:", error);
      setUploadError("Failed to delete file. Please try again.");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    if (!selectedFile || !uploadedFileUrl) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(property, selectedFile, uploadedFileUrl);
      onClose();
      setSelectedFile(null);
      setUploadedFileUrl("");
      setUploadError("");
    } catch (error) {
      console.error("Error submitting LOI:", error);
      setUploadError("Failed to submit LOI. Please try again.");
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

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="text-red-500" size={32} />;
    }
    return <File className="text-blue-500" size={32} />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Submit Letter of Intent
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload your LOI document for this property
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Property Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-orange-600" />
                  Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Property Type</p>
                    <p className="font-medium text-gray-900">
                      {property?.propertyType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Property Amount</p>
                    <p className="font-medium text-gray-900">
                      {property?.investmentAmount 
                        ? formatPrice(property.investmentAmount) 
                        : property?.price 
                        ? formatPrice(property.price)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin size={14} />
                      Location
                    </p>
                    <p className="font-medium text-gray-900">
                      {property?.location?.state && property?.location?.lga 
                        ? `${property.location.state}, ${property.location?.lga}` 
                        : "Location not specified"}
                    </p>
                  </div>
                  {property?.expectedROI && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                      <p className="font-medium text-orange-600">
                        {property.expectedROI}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-red-800 text-sm">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* File Upload/Display Section */}
              {uploadedFileUrl ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Document Uploaded Successfully
                  </h3>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {selectedFile && getFileIcon(selectedFile)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedFile?.name || "LOI Document"}
                          </p>
                          {selectedFile && (
                            <p className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          )}
                          <p className="text-xs text-green-600 mt-1">
                            Document ready for submission
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(uploadedFileUrl, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview document"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={handleDeleteFile}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove document"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Upload LOI Document</h3>
                  
                  {/* File Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-600">Uploading document...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload size={48} className="mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop your LOI document here
                          </p>
                          <p className="text-gray-600 mb-4">
                            or click to browse your files
                          </p>
                          <Button
                            value="Browse Files"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-2"
                          />
                        </div>
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
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">File Requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Format: PDF, DOC, or DOCX</li>
                          <li>Maximum size: 5MB</li>
                          <li>Document will be uploaded immediately upon selection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <Button
                  value={isSubmitting ? "Submitting..." : existingDocument ? "Update LOI" : "Submit LOI"}
                  isDisabled={isSubmitting || !uploadedFileUrl}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium py-3 px-6 rounded-lg transition-all"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimplifiedLOIUploadModal;
