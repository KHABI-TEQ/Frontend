"use client"
import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import DocumentIframePreview from './DocumentIframePreview';

const DocumentPreviewDemo: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handlePreview = () => {
    if (uploadedFile) {
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Document Preview Demo
        </h2>
        <p className="text-gray-600">
          Upload a document to test the iframe preview functionality
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp,.svg"
          className="hidden"
        />
        
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Upload Document
          </h3>
          <p className="text-gray-500 mb-2">
            Click to select or drag and drop your file here
          </p>
          <p className="text-xs text-gray-400">
            Supports: PDF, DOC, DOCX, TXT, Images (PNG, JPG, etc.)
          </p>
        </div>
      </div>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-800">
                  {uploadedFile.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">
          Preview Features:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Full-screen iframe preview for PDFs</li>
          <li>• Image zoom and rotation controls</li>
          <li>• Keyboard shortcuts (Esc, Ctrl+/-, Ctrl+R, etc.)</li>
          <li>• Download functionality</li>
          <li>• Responsive design for mobile and desktop</li>
          <li>• Support for multiple file formats</li>
        </ul>
      </div>

      {/* Preview Modal */}
      {uploadedFile && (
        <DocumentIframePreview
          isOpen={showPreview}
          onClose={handleClosePreview}
          file={uploadedFile}
          documentName="Demo Document"
        />
      )}
    </div>
  );
};

export default DocumentPreviewDemo;
