"use client"
import React, { useState, useRef } from 'react';
import { X, Paperclip, File as FileIcon, Trash2, Download, Eye, Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDocumentVerification } from '@/context/document-verification-context';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import { DELETE_REQUEST, POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from '@/utils/requests';
import DocumentIframePreview from '@/components/document-verification/DocumentIframePreview';
import { useDocumentVerificationSettings, useDocumentVerificationPrices } from '@/hooks/useSystemSettings';

// Define the document types as a union type
const documentOptions = [
  'certificate-of-occupancy',
  'deed-of-partition',
  'deed-of-assignment',
  'governors-consent',
  'survey-plan',
  'deed-of-lease',
] as const;


type DocumentType = typeof documentOptions[number];

type DocumentNumbers = {
  [key in DocumentType]: string;
};

type UploadedFile = {
  file: File;
  url: string;
  uploadStatus: 'uploading' | 'success' | 'error';
};

type ContactInfo = {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
};

type PaymentDetails = {
  amountPaid: number;
  receiptFile: File | null;
  receiptUrl: string;
  receiptUploadStatus: 'uploading' | 'success' | 'error' | 'idle';
};

const initialDocumentNumbers: DocumentNumbers = {
  'certificate-of-occupancy': '',
  'deed-of-partition': '',
  'deed-of-assignment': '',
  'governors-consent': '',
  'survey-plan': '',
  'deed-of-lease': '',
};


const DocumentVerificationPage: React.FC = () => {
  // System settings for dynamic pricing
  const { settings: docVerificationSettings, loading: settingsLoading } = useDocumentVerificationSettings();
  const { settings: documentPrices, loading: pricesLoading } = useDocumentVerificationPrices();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showGuideline, setShowGuideline] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentType[]>([]);
  const [documentNumbers, setDocumentNumbers] = useState<DocumentNumbers>(initialDocumentNumbers);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key in DocumentType]?: UploadedFile }>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amountPaid: 0,
    receiptFile: null,
    receiptUrl: '',
    receiptUploadStatus: 'idle',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; documentName: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRefs = useRef<{ [key in DocumentType]?: HTMLInputElement | null }>({});
  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const {
    setDocumentsMetadata,
    setDocumentFiles,
    setContactInfo: setContextContactInfo,
    setReceiptFile,
    setAmountPaid,
    reset,
  } = useDocumentVerification();

  const handleDocumentToggle = (document: DocumentType) => {
    if (selectedDocuments.includes(document)) {
      setSelectedDocuments(selectedDocuments.filter(doc => doc !== document));
      // Remove uploaded file for this document
      const newUploadedFiles = { ...uploadedFiles };
      delete newUploadedFiles[document];
      setUploadedFiles(newUploadedFiles);
    } else if (selectedDocuments.length < 2) {
      setSelectedDocuments([...selectedDocuments, document]);
    }
  };

  const handleDocumentNumberChange = (document: DocumentType, value: string) => {
    setDocumentNumbers(prev => ({
      ...prev,
      [document]: value
    }));
  }; 

  const getDocumentDisplayName = (document: DocumentType): string => {
    const displayNames: Record<DocumentType, string> = {
      'certificate-of-occupancy': 'Certificate of Occupancy',
      'deed-of-partition': 'Deed of Partition',
      'deed-of-assignment': 'Deed of Assignment',
      "governors-consent": "Governor's Consent",
      'survey-plan': 'Survey plan',
      'deed-of-lease': 'Deed of Lease',
    };
    return displayNames[document] || document;
  };

  const calculateFee = (): number => {
    if (selectedDocuments.length === 0) return 0;

    // Calculate total fee based on individual document pricing from system settings
    const totalFee = selectedDocuments.reduce((total, documentType) => {
      const price = documentPrices[documentType] || 20000; // fallback to 20000 if price not found
      return total + price;
    }, 0);

    return totalFee;
  };

  const validateFileType = (file: File): boolean => {
    const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpeg', 'jpg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  };

  const deleteFile = async (url: string): Promise<any> => {
    try {
      const response = await DELETE_REQUEST(`${URLS.BASE}${URLS.deleteUploadedSingleImg}`, { url });
      if (!response.success) {
        toast.error("Failed to delete file")
      }
      return response;
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file');
    }
  };

  const uploadFile = async (file: File, document: DocumentType): Promise<string> => {
    // Validate file type before upload
    if (!validateFileType(file)) {
      throw new Error('Invalid file type. Only PNG, JPEG, JPG, PDF, DOC, and DOCX files are allowed.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('for', 'default');

    try {
      const response = await POST_REQUEST_FILE_UPLOAD(`${URLS.BASE}${URLS.uploadSingleImg}`, formData)

      if (response.success) {
        return (response.data as any).url;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  };

  const handleFileChange = async (document: DocumentType, fileList: FileList | null) => {
    if (fileList && fileList[0]) {
      const file = fileList[0];

      // Validate file type first
      if (!validateFileType(file)) {
        toast.error(`Invalid file type for ${getDocumentDisplayName(document)}. Only Only PNG, JPEG, JPG, PDF, DOC, and DOCX files are allowed.`);
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is 10MB.`);
        return;
      }

      // Update state to show uploading
      setUploadedFiles(prev => ({
        ...prev,
        [document]: {
          file,
          url: '',
          uploadStatus: 'uploading'
        }
      }));

      try {
        const uploadedUrl = await uploadFile(file, document);

        // Update state with successful upload
        setUploadedFiles(prev => ({
          ...prev,
          [document]: {
            file,
            url: uploadedUrl,
            uploadStatus: 'success'
          }
        }));

        toast.success(`${getDocumentDisplayName(document)} uploaded successfully! ✅`);
      } catch (error) {
        // Update state with error
        setUploadedFiles(prev => ({
          ...prev,
          [document]: {
            file,
            url: '',
            uploadStatus: 'error'
          }
        }));

        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload ${getDocumentDisplayName(document)}: ${errorMessage}`);
      }
    }
  };

  const handleRemoveFile = (document: DocumentType) => {
    const newUploadedFiles = { ...uploadedFiles };
    delete newUploadedFiles[document];
    setUploadedFiles(newUploadedFiles);
    
    if (fileInputRefs.current[document]) {
      fileInputRefs.current[document]!.value = '';
    }
  };

  const handleUploadClick = (document: DocumentType) => {
    fileInputRefs.current[document]?.click();
  };

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewFile = (file: File, documentType: DocumentType) => {
    setPreviewFile({
      file,
      documentName: getDocumentDisplayName(documentType)
    });
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const validateStep1 = (): boolean => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select at least one document');
      return false;
    }

    for (const doc of selectedDocuments) {
      const hasFile = !!uploadedFiles[doc] && uploadedFiles[doc]?.uploadStatus === 'success';
      const hasNumber = !!documentNumbers[doc]?.trim();
      if (!hasFile && !hasNumber) {
        toast.error(`Provide either a file or the ${getDocumentDisplayName(doc)} number`);
        return false;
      }
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    const { fullName, phoneNumber, email, address } = contactInfo;
    if (!fullName || !phoneNumber || !email || !address) {
      toast.error('Please fill in all contact information fields');
      return false;
    }
    return true;
  };


  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setPaymentDetails(prev => ({ ...prev, amountPaid: calculateFee() }));
    } else if (currentStep === 2 && validateStep2()) {
      setPaymentDetails(prev => ({ ...prev, amountPaid: calculateFee() }));
    }
  };
 
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleFinalSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {

      const docsMeta = selectedDocuments.map((doc) => ({
        documentType: doc,
        documentNumber: documentNumbers[doc],
        uploadedUrl: uploadedFiles[doc]?.url || '',
      }));

      // Prepare the JSON payload
      const payload = {
        contactInfo: {
          fullName: contactInfo.fullName,
          email: contactInfo.email,
          phoneNumber: contactInfo.phoneNumber,
          address: contactInfo.address,
        },
        paymentInfo: {
          amountPaid: paymentDetails.amountPaid,
        },
        documentsMetadata: docsMeta,
      };

      const response = await POST_REQUEST(`${URLS.BASE}${URLS.submitVerificationDocs}`, payload);

      if (response.success) {
        // Check if payment authorization URL is provided
        if ((response.data as any)?.transaction?.authorization_url) {
          toast.success('Document verification request submitted! Redirecting to payment...');
          setIsRedirectingToPayment(true);

          // Show overlay and redirect to payment
          setTimeout(() => {
            window.location.href = (response.data as any).transaction.authorization_url;
          }, 2000);
        } else {
          setShowSuccessModal(true);
        }
        reset();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > step ? <Check size={20} /> : step}
            </div>
            {step < 2 && (
              <ChevronRight className={`w-5 h-5 ${
                currentStep > step ? 'text-green-500' : 'text-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Step 1: Select & Upload Documents</h2>
        <p className="text-gray-600">Choose up to 2 documents for verification and upload them securely</p>
      </div>

      {/* Document Selection Grid */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-800 mb-6 text-center">
          Available Document Types
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {documentOptions.map((document) => {
            const isSelected = selectedDocuments.includes(document);
            const isUploaded = uploadedFiles[document]?.uploadStatus === 'success';
            const isUploading = uploadedFiles[document]?.uploadStatus === 'uploading';
            const hasError = uploadedFiles[document]?.uploadStatus === 'error';

            return (
              <div
                key={document}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? isUploaded
                      ? 'border-green-500 bg-green-50'
                      : hasError
                      ? 'border-red-500 bg-red-50'
                      : isUploading
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-green-300 bg-green-25'
                    : selectedDocuments.length >= 2
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-25'
                }`}
                onClick={() => {
                  if (selectedDocuments.length < 2 || isSelected) {
                    handleDocumentToggle(document);
                  }
                }}
              >
                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                  {isSelected && (
                    <>
                      {isUploaded && <Check className="w-5 h-5 text-green-600" />}
                      {isUploading && <Upload className="w-5 h-5 text-blue-600 animate-pulse" />}
                      {hasError && <X className="w-5 h-5 text-red-600" />}
                      {!uploadedFiles[document] && <div className="w-5 h-5 rounded-full border-2 border-green-600"></div>}
                    </>
                  )}
                </div>

                <div className="text-center">
                  <FileIcon className={`w-8 h-8 mx-auto mb-3 ${
                    isSelected ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`font-medium text-sm ${
                    isSelected ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {getDocumentDisplayName(document)}
                  </h3>
                  {isSelected && (
                    <p className="text-xs text-gray-500 mt-1">
                      {isUploaded ? 'Uploaded' : isUploading ? 'Uploading...' : hasError ? 'Failed' : 'Selected'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Selected: {selectedDocuments.length}/2 documents
            {selectedDocuments.length >= 2 && <span className="text-orange-600 ml-2">Maximum reached</span>}
          </p>
        </div>
      </div>

      {/* Upload and Details Section */}
      {selectedDocuments.length > 0 && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Upload Documents & Enter Details
            </h3>

            {selectedDocuments.map((document, index) => (
              <div key={document} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800">
                    {index + 1}. {getDocumentDisplayName(document)}
                  </h4>
                  <button
                    onClick={() => handleDocumentToggle(document)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    title={`Remove ${getDocumentDisplayName(document)}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      📄 Upload Document File
                    </label>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      ref={el => { fileInputRefs.current[document] = el; }}
                      onChange={e => handleFileChange(document, e.target.files)}
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />

                    {!uploadedFiles[document] ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 cursor-pointer transition-colors"
                        onClick={() => handleUploadClick(document)}
                      >
                        <Paperclip className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-1">Click to upload document</p>
                        <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX files only</p>
                      </div>
                    ) : (
                      <div className={`border-2 rounded-lg p-6 text-center transition-colors ${
                        uploadedFiles[document]?.uploadStatus === 'success'
                          ? 'border-green-300 bg-green-50'
                          : uploadedFiles[document]?.uploadStatus === 'uploading'
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-red-300 bg-red-50'
                      }`}>
                        {uploadedFiles[document]?.uploadStatus === 'uploading' ? (
                          <>
                            <Upload className="mx-auto h-10 w-10 text-blue-500 mb-3 animate-pulse" />
                            <p className="text-blue-600 font-medium">Uploading...</p>
                            <p className="text-xs text-blue-500">Please wait while we process your file</p>
                          </>
                        ) : uploadedFiles[document]?.uploadStatus === 'success' ? (
                          <>
                            <Check className="mx-auto h-10 w-10 text-green-500 mb-3" />
                            <p className="text-green-600 font-medium">Upload Successful!</p>
                            <p className="text-xs text-green-600 truncate mb-3">
                              {uploadedFiles[document]?.file.name}
                            </p>
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handlePreviewFile(uploadedFiles[document]!.file, document)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                <Eye size={12} className="inline mr-1" />
                                Preview
                              </button>
                              <button
                                onClick={() => handleDownloadFile(uploadedFiles[document]!.file)}
                                className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                              >
                                <Download size={12} className="inline mr-1" />
                                Download
                              </button>
                              <button
                                onClick={() => handleRemoveFile(document)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                              >
                                <Trash2 size={12} className="inline mr-1" />
                                Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <X className="mx-auto h-10 w-10 text-red-500 mb-3" />
                            <p className="text-red-600 font-medium">Upload Failed</p>
                            <p className="text-xs text-red-500 mb-3">Click to try again</p>
                            <button
                              onClick={() => handleUploadClick(document)}
                              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                            >
                              Retry Upload
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Document Number Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🔢 Document Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter document number if available"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      value={documentNumbers[document]}
                      onChange={(e) => handleDocumentNumberChange(document, e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Providing the document number helps speed up verification
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fee Information Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Verification Fee</h3>

              {/* Individual document pricing breakdown */}
              {selectedDocuments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {selectedDocuments.map((doc) => (
                    <div key={doc} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{getDocumentDisplayName(doc)}</span>
                      <span className="font-medium text-gray-800">
                        {pricesLoading ? (
                          <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                        ) : (
                          `₦${(documentPrices[doc] || 20000).toLocaleString()}`
                        )}
                      </span>
                    </div>
                  ))}
                  {selectedDocuments.length > 1 && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span>₦{calculateFee().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-3xl font-bold text-green-600 mb-2">
                {(settingsLoading || pricesLoading) ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-32 mx-auto rounded"></div>
                ) : (
                  `₦${calculateFee().toLocaleString()}`
                )}
              </div>
              <p className="text-gray-600 text-sm">
                Total fee for {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                Fast verification
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                Secure process
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                Expert review
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedDocuments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Documents Selected</h3>
          <p className="text-sm">Choose document types above to get started with verification</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 2: Contact Information</h2>
      <p className="text-gray-600 mb-6">
        Please provide your contact details so we can get back to you.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Full name of the buyer"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={contactInfo.fullName}
              onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Active phone number for follow-up"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={contactInfo.phoneNumber}
              onChange={(e) => handleContactInfoChange('phoneNumber', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="for communication"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={contactInfo.email}
            onChange={(e) => handleContactInfoChange('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            placeholder="Residential or business address"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={contactInfo.address}
            onChange={(e) => handleContactInfoChange('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-green-400">Verify</span>{' '}
            <span className="text-gray-800">Your Document</span>
          </h1>
          <p className="text-gray-600 mb-6">
            Need to verify a document? Upload it and we&apos;ll handle the verification for you—fast, secure, and independent
          </p>
          
          <div className="mb-4">
            <span className="font-semibold text-gray-800">Verification Report:</span>
            <span className="text-gray-600">You will receive a verification report with a certified true copy (CTC)</span>
          </div>

          {/* Report Guideline Section */}
          {!showGuideline ? (
            <button
              onClick={() => setShowGuideline(true)}
              className="text-blue-500 hover:text-blue-600 underline mb-6"
            >
              Report guideline
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left relative">
              <button
                onClick={() => setShowGuideline(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              
              <h3 className="font-semibold text-gray-800 mb-4">Report guideline</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">What the Report Will Show</h4>
                <p className="text-gray-600 text-sm mb-3">
                  When you use our service, you&apos;ll receive a comprehensive report that breaks down critical information about your land document. Here&apos;s what&apos;s included:
                </p>
                
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium">Document Authenticity:</span> We verify whether your document is genuine and properly registered with the relevant state authorities in Nigeria. This ensures you&apos;re not dealing with a forged or invalid document.
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium">Ownership Information:</span> The report provides details on the current owner of the land and, where applicable, a history of previous owners. This helps you confirm who legally holds the title.
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium">Expert Recommendations:</span> Our legal team offers clear advice on what to do next—whether it&apos;s safe to proceed with a transaction or if further investigation is required. This guidance is tailored to your situation.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-8">
            <span className="font-medium">Note:</span> This only applies to{' '}
            <span className="font-semibold">Lagos</span> and{' '}
            <span className="font-semibold">Ogun State</span> users
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back
          </button>

          {currentStep < 2 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors"
            >
              Next
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>

      {/* Submission and Payment Redirect Overlay */}
      {(isSubmitting || isRedirectingToPayment) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            </div>
            {isRedirectingToPayment ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Redirecting to Payment</h2>
                <p className="mb-6 text-gray-600">Your document verification request has been processed. You will be redirected to the payment page shortly...</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Processing Request</h2>
                <p className="mb-6 text-gray-600">Please wait while we process your document verification request and generate your payment link...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <div className="mb-4">
              <Check size={48} className="mx-auto text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Documents sent for verification</h2>
            <p className="mb-6">Your documents have been submitted successfully. We will contact you soon.</p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/document-verification');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Document Iframe Preview Modal */}
      {previewFile && (
        <DocumentIframePreview
          isOpen={showPreview}
          onClose={handleClosePreview}
          file={previewFile.file}
          documentName={previewFile.documentName}
        />
      )}
    </div>
  );
};

export default DocumentVerificationPage;
