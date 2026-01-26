/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFile,
  faTrash,
  faCopy,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/general-components/button";
import toast from "react-hot-toast";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { POST_REQUEST } from "@/utils/requests";
 
interface PaymentUploadProps {
  selectedProperties: any[];
  inspectionFee: number;
  inspectionDetails: {
    date: string;
    time: string;
    inspectionMode: "in_person" | "virtual";
    buyerInfo: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
  };
  activeTab: "buy" | "jv" | "rent" | "shortlet";
  negotiatedPrices: any[];
  loiDocuments: any[];
  onBack: () => void;
  onComplete: () => void;
} 

const PaymentUpload: React.FC<PaymentUploadProps> = ({
  selectedProperties,
  inspectionFee,
  inspectionDetails,
  activeTab,
  negotiatedPrices,
  loiDocuments,
  onBack,
  onComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transaction details form
  const [transactionDetails, setTransactionDetails] = useState({
    fullName: inspectionDetails.buyerInfo.fullName,
  });

  // Bank details for payment
  const bankDetails = {
    bankName: "First Bank of Nigeria",
    accountNumber: "3074520381",
    accountName: "Khabi-Teq Limited",
    amount: inspectionFee,
  };

  const acceptedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${URLS.BASE}/upload-image`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.imageUrl || data.url || data.data?.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const buildInspectionPayload = () => {
    const payload = selectedProperties.map((property) => {
      const negotiatedPrice = negotiatedPrices.find(
        (price) => price.propertyId === property.propertyId,
      );

      const loiDoc = loiDocuments.find(
        (doc) => doc.propertyId === property.propertyId,
      );

      const propertyPayload: any = {
        propertyId: property.propertyId,
        inspectionType: property.sourceTab === "jv" ? "LOI" : "price",
        negotiationPrice: negotiatedPrice?.negotiatedPrice || undefined,
        letterOfIntention: loiDoc?.documentUrl || undefined,
      };

      // Include source tracking if present
      if (property.sourcePage) {
        propertyPayload.requestSource = {
          page: property.sourcePage,
        };
      }

      if (property.sourceMeta) {
        propertyPayload.requestSource = {
          ...(propertyPayload.requestSource || {}),
          matchedId: property.sourceMeta.matchedId,
          preferenceId: property.sourceMeta.preferenceId,
        };
      }

      return propertyPayload;
    });

    return {
      requestedBy: inspectionDetails.buyerInfo,
      inspectionDetails: {
        inspectionDate: inspectionDetails.date,
        inspectionTime: inspectionDetails.time,
        inspectionMode: inspectionDetails.inspectionMode,
      },
      transaction: {
        fullName: transactionDetails.fullName,
        transactionReceipt: uploadedReceiptUrl,
      },
      properties: payload
    };
  };

  const handleFileSelect = async (file: File) => {
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error("Please select a valid file type (JPEG, PNG, or PDF)");
      return;
    }

    if (file.size > maxFileSize) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Automatically upload the file
    await handleUploadReceipt(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedReceiptUrl("");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadReceipt = async (file?: File) => {
    const fileToUpload = file || selectedFile;

    if (!fileToUpload) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadImageToServer(fileToUpload);
      setUploadedReceiptUrl(imageUrl);
      toast.success("Payment receipt uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload receipt. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitInspectionRequest = async () => {
    if (!uploadedReceiptUrl) {
      toast.error("Please upload your payment receipt first");
      return;
    }

    if (!transactionDetails.fullName.trim()) {
      toast.error("Please enter the full name used for the transaction");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildInspectionPayload();

      const response = await POST_REQUEST(URLS.BASE + URLS.requestInspection, payload);

      if (response.success) {
        // Check if payment authorization URL is provided
        if ((response.data as any)?.transaction?.authorization_url) {
          toast.success("Inspection request submitted successfully! Redirecting to payment...");
          setIsRedirectingToPayment(true);

          // Redirect to payment after short delay
          setTimeout(() => {
            window.location.href = (response.data as any).transaction.authorization_url;
          }, 2000);
        } else {
          toast.success("Inspection request submitted successfully!");
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }else{
        toast.error("Failed to submit request. Please try again.");
      }
      
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
 
  // Lock body scroll when uploading or submitting
  useEffect(() => {
    if (isUploading || isSubmitting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isUploading, isSubmitting]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Loading Overlay */}
      {(isUploading || isSubmitting || isRedirectingToPayment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-[#8DDB90] text-4xl mb-4 animate-spin"
            />
            <h3 className="text-lg font-semibold text-[#24272C] mb-2">
              {isUploading ? "Uploading Receipt" : isRedirectingToPayment ? "Redirecting to Payment" : "Submitting Request"}
            </h3>
            <p className="text-[#5A5D63] text-sm">
              {isUploading
                ? "Please wait while we upload your payment receipt..."
                : isRedirectingToPayment
                ? "Your inspection request has been processed. You will be redirected to the payment page shortly..."
                : "Please wait while we process your inspection request and generate your payment link..."}
            </p>
          </div>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Payment Instructions
        </h3>

        <div className="space-y-4">
          <div className="bg-[#E4EFE7] border border-[#8DDB90] rounded-lg p-4">
            <h4 className="font-semibold text-[#09391C] mb-3">
              Bank Transfer Details
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#5A5D63]">Bank Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#24272C]">
                    {bankDetails.bankName}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Copy bank name"
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="text-[#8DDB90]"
                      size="sm"
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5D63]">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#24272C]">
                    {bankDetails.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Copy account number"
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="text-[#8DDB90]"
                      size="sm"
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5A5D63]">Account Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#24272C]">
                    {bankDetails.accountName}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountName)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Copy account name"
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="text-[#8DDB90]"
                      size="sm"
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-[#5A5D63]">Amount to Pay:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#09391C] text-lg">
                    ₦{bankDetails.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(bankDetails.amount.toString())
                    }
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Copy amount"
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="text-[#8DDB90]"
                      size="sm"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-lg p-4">
            <h4 className="font-semibold text-[#E65100] mb-2">Important:</h4>
            <ul className="text-sm text-[#E65100] space-y-1">
              <li>• Make the transfer using the exact amount shown above</li>
              <li>
                • Use your full name as the transfer description/narration
              </li>
              <li>• Upload clear screenshot or receipt of the transaction</li>
              <li>• Inspection will be confirmed once payment is verified</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Transaction Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#24272C] mb-2">
              Full Name on Transaction *
            </label>
            <input
              type="text"
              value={transactionDetails.fullName}
              onChange={(e) =>
                setTransactionDetails({
                  ...transactionDetails,
                  fullName: e.target.value,
                })
              }
              placeholder="Enter the full name used for the bank transfer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent outline-none transition-colors"
            />
            <p className="text-xs text-[#5A5D63] mt-1">
              This should match the name used when making the bank transfer
            </p>
          </div>
        </div>
      </div>

      {/* Payment Proof Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Upload Payment Receipt
        </h3>

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
              className="text-[#8DDB90] text-3xl mb-4"
            />
            <h4 className="text-lg font-semibold text-[#24272C] mb-2">
              Choose file or drag and drop
            </h4>
            <p className="text-[#5A5D63] mb-4">
              Your payment receipt will be uploaded automatically
            </p>
            <p className="text-sm text-[#5A5D63]">
              Supported formats: JPEG, PNG, PDF (Max 5MB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faFile}
                  className={`text-xl ${isUploading ? "text-[#8DDB90]" : uploadedReceiptUrl ? "text-green-500" : "text-[#8DDB90]"}`}
                />
                <div>
                  <p className="font-medium text-[#24272C]">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-[#5A5D63]">
                    {formatFileSize(selectedFile.size)}
                    {isUploading && (
                      <span className="ml-2 text-[#8DDB90]">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />{" "}
                        Uploading...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={removeFile}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove file"
                  disabled={isUploading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            {uploadedReceiptUrl && !isUploading && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✓ Receipt uploaded successfully
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-[#E9EBEB] text-[#5A5D63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Back to Date Selection
        </button>
        <Button
          onClick={handleSubmitInspectionRequest}
          value={isSubmitting ? "Submitting..." : "Submit Inspection Request"}
          className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors disabled:opacity-50"
          isDisabled={
            !uploadedReceiptUrl ||
            !transactionDetails.fullName.trim() ||
            isSubmitting
          }
        />
      </div>
    </div>
  );
};

export default PaymentUpload;
