"use client"
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Upload, FileText, Download, Eye, AlertTriangle, Lock, File, Trash2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { URLS } from '@/utils/URLS';
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD, GET_REQUEST } from '@/utils/requests';

// Types for verification data
type DocumentStatus = 'pending' | 'registered' | 'unregistered' | 'in-progress';

type Document = {
  documentType: string;
  documentNumber: string;
  documentUrl: string;
};
 
type VerificationReports = {
  status: 'pending' | 'registered' | 'unregistered';
  selfVerification: boolean;
};

type DocumentStatusDetails = {
  status: 'pending' | 'registered' | 'unregistered' | 'in-progress' | 'payment-approved' | 'payment-failed';
};

type DocumentDetails = {
  _id: string;
  buyerId: string;
  docCode: string;
  amountPaid: number;
  transaction: string;
  documents: Document[] | Document;
  status: string;
  docType: string;
  verificationReports: VerificationReports;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ReportDocument = {
  originalDocumentType: string;
  newDocumentUrl?: string;
  description: string;
  status: 'registered' | 'unregistered';
};

type TokenValidationResponse = {
  isValid: boolean;
  documents: Document[];
  message?: string;
};

type DynamicDocumentRecord = {
  id: string;
  name: string;
  documentFile: string;
  comment: string;
  uploadProgress?: number;
};

const ThirdPartyVerificationPage: React.FC = () => {
  const params = useParams();
  const documentID = params.documentID as string;

  // Validate document ID format
  const isValidDocumentID = documentID && documentID.length >= 5 && documentID !== 'sample-doc-123';

  
  // Token validation state
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  // Document verification state
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);

  // Document verification status
  const [documentStatusDetails, setDocumentStatusDetails] = useState<DocumentStatusDetails | null>(null);

  // const [reports, setReports] = useState<ReportDocument[]>([]);
  const [report, setReport] = useState<ReportDocument | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  const [dragged, setDragged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic document records state
  const [dynamicDocuments, setDynamicDocuments] = useState<DynamicDocumentRecord[]>([]);
  const dynamicFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});


  useEffect(() => {
    if (documentID) {
      checkDocuemntStatus();
    }
  }, [documentID]);

  if (!isValidDocumentID) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center py-8 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-50 mb-6">
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Invalid Document ID
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The document ID {documentID} is not valid. Please check your verification link.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-700">
                Valid document IDs are typically 10+ characters long and provided in your verification email.
              </p>
            </div>
            <div className="bg-[#0B423D] text-white p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Need Help?</p>
              <p className="text-xs sm:text-sm">
                Contact: <span className="text-[#8DDB90]">verification@khabiteqrealty.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // show this if the 
  if (documentStatusDetails?.status === "registered" || documentStatusDetails?.status === "unregistered") {
    return (
      <div className="min-h-screen bg-[#EEF1F1] flex items-center justify-center py-8 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-50 mb-6">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Document Already Verified
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              This document has already been successfully verified or attended to.
              No further action is required at this time.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                Document ID: <span className="font-medium">{documentID}</span>
              </p>
            </div>

            <div className="bg-[#0B423D] text-white p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Need Help?</p>
              <p className="text-xs sm:text-sm">
                Contact: <span className="text-[#8DDB90]">verification@khabiteqrealty.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const validateToken = async () => {
    if (!accessCode.trim()) {
      toast.error('Please enter the access code');
      return;
    }

    setIsValidatingToken(true);
    try {
      const response = await POST_REQUEST(`${URLS.BASE}${URLS.verifyAccessCode}`, {
        documentId: documentID,
        accessCode
      });

      if (response.success) {
        await fetchDocumentDetails();
        setIsTokenValidated(true);
        toast.success('Access code verified successfully!');
      } else {
        toast.error(response.message || 'Invalid access code. Please check your email for the correct code.');
      }
    } catch (error) {
      console.error('Access code validation error:', error);
      toast.error('Failed to validate access code. Please try again.');
    } finally {
      setIsValidatingToken(false);
    }
  };


  const checkDocuemntStatus = async () => {
    setIsLoadingData(true);
    try {
      const response = await GET_REQUEST(`${URLS.BASE}${URLS.getDocumentDetails}/${documentID}/status`);

      if (response.success && response.data) {
        setDocumentStatusDetails(response.data);

      } else {
        toast.error('Failed to fetch document status details');
      }
    } catch (error) {
      console.error('Error fetching document status details:', error);
      toast.error('Failed to fetch document status details');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchDocumentDetails = async () => {
    setIsLoadingData(true);
    try {
      const response = await GET_REQUEST(`${URLS.BASE}${URLS.getDocumentDetails}/${documentID}`);

      if (response.success && response.data) {
        setDocumentDetails(response.data);
 
        // Use single document instead of array
        const documentObj = Array.isArray(response.data.documents)
          ? response.data.documents[0]
          : response.data.documents;

        // Initialize reports data based on documents
        const initialReport: ReportDocument = {
          originalDocumentType: documentObj.documentType,
          description: '',
          status: 'registered'
        };

        setReport(initialReport);

      } else {
        toast.error('Failed to fetch document details');
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
      toast.error('Failed to fetch document details');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleReportChange = (field: keyof ReportDocument, value: string) => {
    setReport(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="w-6 h-6 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <Image className="w-6 h-6 text-blue-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",

      // Images
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",

      // Word
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      // Excel
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      // PowerPoint
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",

      // Text & CSV
      "text/plain",
      "text/csv",

      // Archives
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a valid document or image.");
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB, since backend allows bigger
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("for", "default");

      setUploadProgress(0);

      const uploadResponse = await POST_REQUEST_FILE_UPLOAD(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formData
      );

      if (uploadResponse.success) {
        handleReportChange("newDocumentUrl", uploadResponse.data.url);
        setUploadProgress(100);
        toast.success("Document uploaded successfully");

        setTimeout(() => setUploadProgress(undefined), 2000);
      } else {
        throw new Error(uploadResponse.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
      setUploadProgress(undefined);
    }
  };


  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragged(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragged(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragged(false);
  };


  const removeUploadedFile = () => {
    handleReportChange('newDocumentUrl', '');
    toast.success('File removed successfully');
  };

  const submitReport = async () => {
    if (!report) {
      toast.error('No report data available');
      return;
    }

    // Validate report have descriptions
    if (!report.description.trim()) {
      toast.error('Please provide a description for the document');
      return;
    }

    // Validate dynamic documents if any are added
    if (dynamicDocuments.length > 0) {
      for (const doc of dynamicDocuments) {
        if (!doc.name.trim()) {
          toast.error('Please provide a name for all additional documents');
          return;
        }
        if (!doc.documentFile.trim()) {
          toast.error('Please upload a file for all additional documents');
          return;
        }
      }
    }
 
    setIsSubmittingReport(true);
    try {
      const payload = {
        report,
        ...(dynamicDocuments.length > 0 && {
          additionalDocuments: dynamicDocuments.map(doc => ({
            name: doc.name,
            documentFile: doc.documentFile,
            comment: doc.comment
          }))
        })
      };

      console.log('Submission Payload:', JSON.stringify(payload, null, 2));

      const response = await toast.promise(
        POST_REQUEST(`${URLS.BASE}${URLS.submitReport}/${documentID}`, payload),
        {
          loading: 'Submitting verification report...',
          success: 'Report submitted successfully!',
          error: 'Failed to submit report'
        }
      );

      if (response.success) {
        // Refresh document details to show updated status
        await fetchDocumentDetails();
      }
    } catch (error) {
      console.error('Submit report error:', error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Dynamic document handlers
  const addDynamicDocument = () => {
    const newDocument: DynamicDocumentRecord = {
      id: Date.now().toString(),
      name: '',
      documentFile: '',
      comment: ''
    };
    setDynamicDocuments([...dynamicDocuments, newDocument]);
  };

  const removeDynamicDocument = (id: string) => {
    setDynamicDocuments(dynamicDocuments.filter(doc => doc.id !== id));
    delete dynamicFileInputRefs.current[id];
    toast.success('Document record removed');
  };

  const updateDynamicDocument = (id: string, field: keyof Omit<DynamicDocumentRecord, 'id' | 'uploadProgress'>, value: string) => {
    setDynamicDocuments(dynamicDocuments.map(doc =>
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleDynamicFileUpload = async (file: File, recordId: string) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a valid document or image.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("for", "default");

      setDynamicDocuments(dynamicDocuments.map(doc =>
        doc.id === recordId ? { ...doc, uploadProgress: 0 } : doc
      ));

      const uploadResponse = await POST_REQUEST_FILE_UPLOAD(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formData
      );

      if (uploadResponse.success) {
        updateDynamicDocument(recordId, 'documentFile', uploadResponse.data.url);
        setDynamicDocuments(dynamicDocuments.map(doc =>
          doc.id === recordId ? { ...doc, uploadProgress: 100 } : doc
        ));
        toast.success("Document uploaded successfully");

        setTimeout(() => {
          setDynamicDocuments(dynamicDocuments.map(doc =>
            doc.id === recordId ? { ...doc, uploadProgress: undefined } : doc
          ));
        }, 2000);
      } else {
        throw new Error(uploadResponse.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
      setDynamicDocuments(dynamicDocuments.map(doc =>
        doc.id === recordId ? { ...doc, uploadProgress: undefined } : doc
      ));
    }
  };

  const removeDynamicDocumentFile = (id: string) => {
    updateDynamicDocument(id, 'documentFile', '');
    toast.success('File removed successfully');
  };

  const handleDocumentPreview = (documentUrl: string) => {
    if (!documentUrl) {
      toast.error("Document URL not available");
      return;
    }

    let previewUrl = documentUrl;
    const lowerUrl = documentUrl.toLowerCase();

    if (documentUrl.includes("cloudinary.com")) {
      if (lowerUrl.endsWith(".pdf")) {
        // PDF → Cloudinary optimized preview
        previewUrl = documentUrl.replace(
          "/upload/",
          "/upload/f_auto,q_auto,pg_1/"
        );
      } else if (
        lowerUrl.endsWith(".jpg") ||
        lowerUrl.endsWith(".jpeg") ||
        lowerUrl.endsWith(".png") ||
        lowerUrl.endsWith(".webp")
      ) {
        // Images → optimized preview
        previewUrl = documentUrl.replace(
          "/upload/",
          "/upload/f_auto,q_auto,w_1200/"
        );
      } else if (
        lowerUrl.endsWith(".doc") ||
        lowerUrl.endsWith(".docx") ||
        lowerUrl.endsWith(".xls") ||
        lowerUrl.endsWith(".xlsx") ||
        lowerUrl.endsWith(".ppt") ||
        lowerUrl.endsWith(".pptx")
      ) {
        // Word, Excel, PowerPoint → Google Docs Viewer
        previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          documentUrl
        )}&embedded=true`;
      } else {
        // Other file types (zip, rar, etc.) → just open directly (browser may download)
        previewUrl = documentUrl;
      }
    }

    // Open in new tab
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };


  const handleDocumentDownload = async (documentUrl: string, documentType: string) => {
    if (!documentUrl) {
      toast.error('Document URL not available');
      return;
    }

    try {
      // For Cloudinary URLs, get the original file
      let downloadUrl = documentUrl;
      if (documentUrl.includes('cloudinary.com')) {
        // Remove any transformations to get original file
        downloadUrl = documentUrl.replace(/\/upload\/[^\/]+\//, '/upload/');
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get file extension from URL or default to pdf
      const urlParts = downloadUrl.split('.');
      const extension = urlParts.length > 1 ? urlParts.pop() : 'pdf';
      a.download = `${documentType.replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document. Trying alternative method...');
      
      // Fallback: open in new tab for manual download
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  // Token validation view
  if (!isTokenValidated) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] py-6 sm:py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#0B423D] to-[#8DDB90] mb-6">
                  <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Document Verification Access
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Please enter the access code sent to your email to verify the documents.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter your access code"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] pl-12 text-lg font-mono tracking-wider"
                      onKeyPress={(e) => e.key === 'Enter' && validateToken()}
                    />
                  </div>
                </div>

                <button
                  onClick={validateToken}
                  disabled={isValidatingToken || !accessCode.trim()}
                  className="w-full bg-gradient-to-r from-[#0B423D] to-[#8DDB90] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isValidatingToken ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Verifying Access Code...
                    </div>
                  ) : (
                    'Verify Access Code'
                  )}
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  Document ID: <span className="font-mono font-medium text-[#0B423D]">{documentID}</span>
                </p>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-2 h-2 bg-[#8DDB90] rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-gray-500">Secure Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Document verification view (after token validation)
  return (
    <div className="min-h-screen bg-[#EEF1F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Document Verification Portal
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Review and verify the documents submitted for third-party verification.
          </p>
          <div className="mt-4 p-3 bg-white rounded-lg shadow-sm inline-block">
            <span className="text-xs sm:text-sm text-gray-500">Document ID 1234: </span>
            <span className="font-mono font-medium text-[#0B423D] text-sm sm:text-base">{documentID}</span>
          </div>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B423D]"></div>
          </div>
        ) : (
          <>
            {/* Documents List */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 mb-6">
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Documents for Verification
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {(() => {
                        const docsArray = Array.isArray(documentDetails?.documents)
                          ? documentDetails.documents
                          : documentDetails?.documents ? [documentDetails.documents] : [];
                        const count = docsArray.length;
                        return `${count} document${count !== 1 ? 's' : ''} submitted`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {(() => {
                  const documentsArray = Array.isArray(documentDetails?.documents)
                    ? documentDetails.documents
                    : documentDetails?.documents ? [documentDetails.documents] : [];
                  return documentsArray.map((document, index) => (
                  <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Document Icon and Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0B423D] to-[#8DDB90] rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              {document.documentType}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8DDB90] text-[#0B423D]">
                                Document #{index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Document Number:</span> {document.documentNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                        {document.documentUrl && (
                          <button
                            onClick={() => handleDocumentPreview(document.documentUrl)}
                            className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-[#8DDB90] text-[#0B423D] font-medium rounded-xl hover:bg-[#8DDB90] hover:text-white transition-all duration-200 text-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Document
                          </button>
                        )}

                        {document.documentUrl && (
                          <button
                            onClick={() => handleDocumentDownload(document.documentUrl, document.documentType)}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0B423D] text-white font-medium rounded-xl hover:bg-[#0B423D]/90 transition-all duration-200 text-sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  ));
                })()}
              </div>

              {(() => {
                const documentsArray = Array.isArray(documentDetails?.documents)
                  ? documentDetails.documents
                  : documentDetails?.documents ? [documentDetails.documents] : [];
                return documentsArray.length === 0;
              })() && (
                <div className="text-center py-12 sm:py-16">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    There are no documents associated with this verification request.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Report Section - Only show if verificationReports.status is pending */}
            {(() => {
              const documentsArray = Array.isArray(documentDetails?.documents)
                ? documentDetails.documents
                : documentDetails?.documents ? [documentDetails.documents] : [];
              return documentsArray.length > 0 && documentDetails?.verificationReports?.status === 'pending';
            })() && (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Document Verification Report
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Provide verification status and description for each document
                  </p>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <span className="font-medium">Officer Action Required:</span>
                      {' '}Verification reports status is {documentDetails?.verificationReports?.status} - Submit your report to complete the verification process.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {report && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Document: {report.originalDocumentType}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Status *
                        </label>
                        <select
                          value={report.status}
                          onChange={(e) => handleReportChange('status', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        >
                          <option value="registered">Registered</option>
                          <option value="unregistered">Not Registered</option>
                        </select>
                      </div>

                      {/* Enhanced Document Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Verification Report (Optional)
                        </label>
                        
                        {!report.newDocumentUrl ? (
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                              dragged
                                ? "border-[#8DDB90] bg-[#8DDB90]/10"
                                : "border-gray-300 hover:border-[#8DDB90] hover:bg-gray-50"
                            }`}
                            onDrop={handleFileDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()} // ✅ simpler
                          >
                            <input
                              ref={fileInputRef} // ✅ direct ref
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                            />

                            {uploadProgress !== undefined ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8DDB90]"></div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#8DDB90] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Uploading... {uploadProgress}%
                                </p>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                  Drop your file here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                  Supports PDF, JPEG, PNG, WebP up to 10MB
                                </p>
                                <div className="inline-flex items-center px-4 py-2 bg-[#0B423D] text-white rounded-lg text-sm font-medium hover:bg-[#0B423D]/90 transition-colors">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose File
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getFileTypeIcon(report.newDocumentUrl)}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Verified Document Uploaded
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Ready for submission
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => window.open(report.newDocumentUrl, '_blank')}
                                  className="p-2 text-gray-400 hover:text-[#0B423D] transition-colors"
                                  title="Preview uploaded document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeUploadedFile()}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Remove uploaded document"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Description *
                        </label>
                        <textarea
                          rows={4}
                          value={report.description}
                          onChange={(e) => handleReportChange('description', e.target.value)}
                          placeholder={
                            report.status === 'registered'
                              ? "Describe the verification process and findings (e.g., 'Document verified against official records. All details match and are authentic.')"
                              : "Describe why the document was rejected and what issues were found (e.g., 'Document does not match official records. Inconsistencies found in...')"
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>)
                  }

                  {/* Additional Documents Section - Inside verification report */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Supporting Documents
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Add any additional documents to support your verification report
                    </p>

                    {dynamicDocuments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-4">No additional documents added yet</p>
                        <button
                          onClick={addDynamicDocument}
                          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#0B423D] to-[#8DDB90] text-white font-semibold rounded-xl hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Add Document
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {dynamicDocuments.map((doc) => (
                          <div key={doc.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Document Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Document Name *
                                </label>
                                <input
                                  type="text"
                                  value={doc.name}
                                  onChange={(e) => updateDynamicDocument(doc.id, 'name', e.target.value)}
                                  placeholder="e.g., Police Report, Land Inspection"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                                />
                              </div>

                              {/* File Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Document File {doc.documentFile ? '✓' : ''}
                                </label>
                                {!doc.documentFile ? (
                                  <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#8DDB90] hover:bg-white transition-all"
                                    onClick={() => dynamicFileInputRefs.current[doc.id]?.click()}
                                  >
                                    <input
                                      ref={(ref) => {
                                        if (ref) dynamicFileInputRefs.current[doc.id] = ref;
                                      }}
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDynamicFileUpload(file, doc.id);
                                      }}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                                    />
                                    {doc.uploadProgress !== undefined ? (
                                      <div className="space-y-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8DDB90] mx-auto"></div>
                                        <p className="text-sm text-gray-600">Uploading... {doc.uploadProgress}%</p>
                                      </div>
                                    ) : (
                                      <>
                                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Click to upload</p>
                                        <p className="text-xs text-gray-500">PDF, Images, or Documents</p>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        {getFileTypeIcon(doc.documentFile)}
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">File uploaded</p>
                                          <p className="text-xs text-gray-500">Ready to submit</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => window.open(doc.documentFile, '_blank')}
                                          className="p-2 text-gray-400 hover:text-[#0B423D] transition-colors"
                                          title="Preview document"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => removeDynamicDocumentFile(doc.id)}
                                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                          title="Remove document"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Comment */}
                              <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Comment
                                </label>
                                <textarea
                                  rows={3}
                                  value={doc.comment}
                                  onChange={(e) => updateDynamicDocument(doc.id, 'comment', e.target.value)}
                                  placeholder="Add any comments or notes about this document..."
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                                />
                              </div>
                            </div>

                            {/* Remove Document Button */}
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => removeDynamicDocument(doc.id)}
                                className="inline-flex items-center px-4 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Record
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add More Documents Button */}
                        <button
                          onClick={addDynamicDocument}
                          className="w-full py-3 px-4 border-2 border-dashed border-[#8DDB90] text-[#0B423D] font-semibold rounded-xl hover:bg-[#8DDB90]/10 transition-all duration-200"
                        >
                          <Upload className="w-4 h-4 mr-2 inline" />
                          Add Another Document
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-8">
                    <button
                      onClick={submitReport}
                      disabled={isSubmittingReport}
                      className="px-8 py-3 bg-gradient-to-r from-[#0B423D] to-[#8DDB90] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmittingReport ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Report...
                        </div>
                      ) : (
                        'Submit Verification Report'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message when verification is not available for officer action */}
            {(() => {
              const documentsArray = Array.isArray(documentDetails?.documents)
                ? documentDetails.documents
                : documentDetails?.documents ? [documentDetails.documents] : [];
              const verificationStatus = documentDetails?.verificationReports?.status;
              return documentsArray.length > 0 && verificationStatus && verificationStatus !== 'pending' && verificationStatus !== 'registered';
            })() && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Verification In Progress
                </h3>
                <p className="text-blue-700">
                  Verification status: <span className="font-semibold">{documentDetails?.verificationReports?.status}</span>
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Officer action will be available when status is pending
                </p>
              </div>
            )}

            {/* Completed Status Message */}
            {documentDetails?.verificationReports?.status === 'registered' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Verification Completed
                </h3>
                <p className="text-green-700">
                  All documents have been verified and the report has been submitted successfully.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Completed on: {formatDate(documentDetails.updatedAt)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ThirdPartyVerificationPage;
