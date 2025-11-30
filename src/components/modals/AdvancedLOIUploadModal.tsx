/** @format */

"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Edit3,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building
} from "lucide-react";
import Button from "@/components/general-components/button";

interface AdvancedLOIUploadModalProps {
  isOpen: boolean;
  property: any;
  onClose: () => void;
  onSubmit: (property: any, document: File, metadata: LOIMetadata) => void;
  existingDocument?: {
    propertyId: string;
    document: File | null;
    documentUrl?: string;
    metadata?: LOIMetadata;
  } | null;
}

interface LOIMetadata {
  investmentAmount: string;
  expectedROI: string;
  timeframe: string;
  partnershipType: string;
  additionalTerms: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
}

const AdvancedLOIUploadModal: React.FC<AdvancedLOIUploadModalProps> = ({
  isOpen,
  property,
  onClose,
  onSubmit,
  existingDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "details" | "review">("upload");
  const [loiMetadata, setLoiMetadata] = useState<LOIMetadata>({
    investmentAmount: "",
    expectedROI: "",
    timeframe: "12_months",
    partnershipType: "50_50",
    additionalTerms: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
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
    setCurrentStep("details");
  }, []);

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

  const handleMetadataChange = (field: keyof LOIMetadata, value: string) => {
    setLoiMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(property, selectedFile, loiMetadata);
      onClose();
      setSelectedFile(null);
      setCurrentStep("upload");
      setLoiMetadata({
        investmentAmount: "",
        expectedROI: "",
        timeframe: "12_months",
        partnershipType: "50_50",
        additionalTerms: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
      });
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

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="text-red-500" size={24} />;
    }
    return <File className="text-blue-500" size={24} />;
  };

  const isStepComplete = (step: string) => {
    switch (step) {
      case "upload":
        return !!selectedFile;
      case "details":
        return !!(loiMetadata.investmentAmount && loiMetadata.contactPerson && loiMetadata.email);
      case "review":
        return true;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {["upload", "details", "review"].map((step, index) => {
        const stepNames = ["Upload Document", "Investment Details", "Review & Submit"];
        const isActive = currentStep === step;
        const isCompleted = isStepComplete(step);
        const stepNumber = index + 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle size={20} />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`text-xs mt-2 ${isActive ? "text-orange-600" : "text-gray-500"}`}>
                {stepNames[index]}
              </span>
            </div>
            {index < 2 && (
              <div
                className={`w-16 h-0.5 mx-2 mt-5 ${
                  isStepComplete(["upload", "details"][index]) ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Your Letter of Intent
        </h3>
        <p className="text-gray-600">
          Upload your comprehensive LOI document to express your investment interest
        </p>
      </div>

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
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {getFileIcon(selectedFile)}
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setCurrentStep("upload");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                value="Replace File"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2"
              />
              <Button
                value="Continue"
                onClick={() => setCurrentStep("details")}
                className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-2"
              />
            </div>
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
            <p className="font-medium mb-1">Document Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Format: PDF, DOC, or DOCX</li>
              <li>Maximum size: 10MB</li>
              <li>Should include investment terms, timeline, and contact information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Investment Details
        </h3>
        <p className="text-gray-600">
          Provide key details about your investment proposal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign size={16} className="inline mr-1" />
            Investment Amount (₦)
          </label>
          <input
            type="text"
            value={loiMetadata.investmentAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, "");
              const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              handleMetadataChange("investmentAmount", formatted);
            }}
            placeholder="Enter investment amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Expected ROI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected ROI (%)
          </label>
          <input
            type="number"
            value={loiMetadata.expectedROI}
            onChange={(e) => handleMetadataChange("expectedROI", e.target.value)}
            placeholder="e.g., 15"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Timeframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Investment Timeframe
          </label>
          <select
            value={loiMetadata.timeframe}
            onChange={(e) => handleMetadataChange("timeframe", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="6_months">6 Months</option>
            <option value="12_months">12 Months</option>
            <option value="18_months">18 Months</option>
            <option value="24_months">24 Months</option>
            <option value="36_months">36+ Months</option>
          </select>
        </div>

        {/* Partnership Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building size={16} className="inline mr-1" />
            Partnership Structure
          </label>
          <select
            value={loiMetadata.partnershipType}
            onChange={(e) => handleMetadataChange("partnershipType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="50_50">50/50 Partnership</option>
            <option value="60_40">60/40 Partnership</option>
            <option value="70_30">70/30 Partnership</option>
            <option value="80_20">80/20 Partnership</option>
            <option value="silent_partner">Silent Partner</option>
            <option value="managing_partner">Managing Partner</option>
            <option value="custom">Custom Arrangement</option>
          </select>
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Contact Person
          </label>
          <input
            type="text"
            value={loiMetadata.contactPerson}
            onChange={(e) => handleMetadataChange("contactPerson", e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={loiMetadata.phoneNumber}
            onChange={(e) => handleMetadataChange("phoneNumber", e.target.value)}
            placeholder="+234 xxx xxx xxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={loiMetadata.email}
            onChange={(e) => handleMetadataChange("email", e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Additional Terms */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Terms & Conditions
          </label>
          <textarea
            value={loiMetadata.additionalTerms}
            onChange={(e) => handleMetadataChange("additionalTerms", e.target.value)}
            placeholder="Any specific terms, conditions, or requirements..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          value="Back"
          onClick={() => setCurrentStep("upload")}
          className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2"
        />
        <Button
          value="Review & Continue"
          onClick={() => setCurrentStep("review")}
          isDisabled={!loiMetadata.investmentAmount || !loiMetadata.contactPerson || !loiMetadata.email}
          className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-400 py-2"
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review Your Submission
        </h3>
        <p className="text-gray-600">
          Please review all details before submitting your LOI
        </p>
      </div>

      {/* Property Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Property Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Property Type:</span>
            <p className="font-medium">{property?.propertyType || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-600">Investment Amount:</span>
            <p className="font-medium">{property?.investmentAmount || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Document Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Document Upload</h4>
        {selectedFile && (
          <div className="flex items-center gap-3">
            {getFileIcon(selectedFile)}
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Investment Details Summary */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Investment Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Investment Amount:</span>
            <p className="font-medium">₦{loiMetadata.investmentAmount}</p>
          </div>
          <div>
            <span className="text-gray-600">Expected ROI:</span>
            <p className="font-medium">{loiMetadata.expectedROI}%</p>
          </div>
          <div>
            <span className="text-gray-600">Timeframe:</span>
            <p className="font-medium">{loiMetadata.timeframe.replace("_", " ")}</p>
          </div>
          <div>
            <span className="text-gray-600">Partnership:</span>
            <p className="font-medium">{loiMetadata.partnershipType.replace("_", " ")}</p>
          </div>
          <div>
            <span className="text-gray-600">Contact Person:</span>
            <p className="font-medium">{loiMetadata.contactPerson}</p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium">{loiMetadata.email}</p>
          </div>
        </div>
        {loiMetadata.additionalTerms && (
          <div className="mt-4">
            <span className="text-gray-600">Additional Terms:</span>
            <p className="font-medium mt-1">{loiMetadata.additionalTerms}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          value="Back to Edit"
          onClick={() => setCurrentStep("details")}
          className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2"
        />
        <Button
          value={isSubmitting ? "Submitting..." : "Submit LOI"}
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 py-2"
        />
      </div>
    </div>
  );

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
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Submit Letter of Intent
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Express your investment interest with a comprehensive LOI
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
            <div className="p-6">
              {renderStepIndicator()}
              
              <div className="min-h-[400px]">
                {currentStep === "upload" && renderUploadStep()}
                {currentStep === "details" && renderDetailsStep()}
                {currentStep === "review" && renderReviewStep()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedLOIUploadModal;
