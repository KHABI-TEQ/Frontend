/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faUpload,
  faFile,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import Button from "@/components/general-components/button";
import { archivo } from "@/styles/font";
import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface LOIUploadModalProps {
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


const LOIUploadModal: React.FC<LOIUploadModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(
    existingDocument?.document || null,
  );
  const [fileUrl, setFileUrl] = useState<string | null>(
    existingDocument?.documentUrl || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accept images and common document types
  const acceptedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxFileSize = 10 * 1024 * 1024; // Increased to 10MB for documents

  const handleFileSelect = async (file: File) => {
    const isImage = file.type?.startsWith("image/");
    const isDoc = acceptedFileTypes.includes(file.type);
    if (!isImage && !isDoc) {
      toast.error("Please select an image or document (PNG, JPG, JPEG, PDF, DOC, DOCX)");
      return;
    }

    if (file.size > maxFileSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Auto-upload the file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const url = `${URLS.BASE}${URLS.uploadSingleImg}`;

    try {
      const response = await toast.promise(
        POST_REQUEST_FILE_UPLOAD(url, formData) as Promise<any>,
        {
          loading: "Uploading document...",
          success: "Document uploaded successfully",
          error: "Document upload failed",
        },
      );

      const uploadedUrl =
        response?.data?.url ||
        response?.url ||
        response?.data?.imageUrl ||
        response?.imageUrl ||
        response?.data?.secure_url ||
        response?.secure_url ||
        response?.data?.path ||
        response?.path ||
        "";

      if (!uploadedUrl) {
        throw new Error("No URL in server response");
      }

      setFileUrl(uploadedUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Document upload failed");
      setSelectedFile(null);
      setFileUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !fileUrl) {
      toast.error("Please upload a document first");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(property, selectedFile, fileUrl);
      toast.success("LOI submitted successfully");
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit LOI");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(existingDocument?.document || null);
      setFileUrl(existingDocument?.documentUrl || null);
      setIsSubmitting(false);
      setIsUploading(false);
      setDragActive(false);
    }
  }, [isOpen, existingDocument]);

  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E9EBEB]">
              <h2
                className={`text-xl font-semibold text-[#24272C] ${archivo.className}`}
              >
                Upload Letter of Intent (LOI)
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faClose} className="text-[#5A5D63]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Property Info */}
              <div className="bg-[#F7F7F8] rounded-lg p-4 mb-6">
                <h3
                  className={`font-medium text-[#24272C] mb-2 ${archivo.className}`}
                >
                  Joint Venture Opportunity
                </h3>
                <div className="space-y-1 text-sm text-[#5A5D63]">
                  <p>Type: {property?.propertyType || "N/A"}</p>
                  <p>
                    Location: {property?.location?.area || "N/A"},{" "}
                    {property?.location?.localGovernment || ""}
                  </p>
                  <p className="font-semibold text-[#24272C]">
                    Investment: ₦
                    {Number(
                      property?.investmentAmount || property?.price || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* LOI Address Information */}
              <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-lg p-4 mb-6">
                <h4
                  className={`font-medium text-[#E65100] mb-2 ${archivo.className}`}
                >
                  Address your LOI to:
                </h4>
                <div className="text-sm text-[#E65100]">
                  <p className="font-semibold">Khabi-Teq Limited</p>
                  <p>Goldrim Plaza</p>
                  <p>Mokuolu Street, Ifako Agege</p>
                  <p>Lagos 101232, Nigeria</p>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label
                  className={`block text-base text-[#24272C] ${archivo.className} font-medium mb-2`}
                >
                  Upload LOI Document
                </label>

                {!selectedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      dragActive
                        ? "border-[#8DDB90] bg-[#E4EFE7]"
                        : "border-[#E9EBEB] hover:border-[#8DDB90] hover:bg-[#F9F9F9]"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDrag}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-[#8DDB90] text-2xl mb-4"
                    />
                    <p
                      className={`text-[#24272C] font-medium mb-1 ${archivo.className}`}
                    >
                      Drop your LOI document here, or click to browse
                    </p>
                    <p className="text-[#5A5D63] text-sm">
                      Supports: PDF, DOC, DOCX only (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#E9EBEB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faFile}
                          className="text-[#8DDB90] text-xl"
                        />
                        <div>
                          <p
                            className={`text-[#24272C] font-medium ${archivo.className}`}
                          >
                            {selectedFile.name}
                          </p>
                          <p className="text-[#5A5D63] text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {isUploading && (
                            <p className="text-[#8DDB90] text-sm">
                              Uploading...
                            </p>
                          )}
                          {fileUrl && !isUploading && (
                            <div className="flex items-center gap-3">
                              <span className="text-green-600 text-sm">✓ Uploaded</span>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0B423D] underline text-sm"
                              >
                                View
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        disabled={isUploading}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    {/* Inline preview for images */}
                    {fileUrl && selectedFile?.type?.startsWith("image/") && (
                      <div className="mt-3">
                        <img src={fileUrl} alt="Uploaded preview" className="max-h-48 rounded border border-[#E9EBEB]" />
                      </div>
                    )}
                  </div>
                )}

                {/* Accept images and documents */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Submission Note */}
              <div className="bg-[#E4EFE7] border border-[#8DDB90] rounded-lg p-3 mb-6">
                <p className="text-[#09391C] text-xs">
                  <strong>Note:</strong> Uploading your LOI will automatically
                  add this property to your inspection list.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-[#E9EBEB] text-[#5A5D63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  value={
                    isSubmitting
                      ? "Submitting..."
                      : isUploading
                        ? "Uploading..."
                        : "Submit LOI"
                  }
                  isDisabled={
                    isSubmitting || isUploading || !selectedFile || !fileUrl
                  }
                  className="flex-1 py-3 px-4 bg-[#FF9800] text-white rounded-lg font-medium hover:bg-[#F57C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LOIUploadModal;
