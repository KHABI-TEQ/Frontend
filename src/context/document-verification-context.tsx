"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type DocumentMetadata = {
  documentType: string;
  documentNumber: string;
};

export type ContactInfo = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

export type DocumentVerificationContextType = {
  documentsMetadata: DocumentMetadata[];
  setDocumentsMetadata: (docs: DocumentMetadata[]) => void;
  documentFiles: File[];
  setDocumentFiles: (files: File[]) => void;
  contactInfo: ContactInfo;
  setContactInfo: (info: ContactInfo) => void;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  amountPaid: number;
  setAmountPaid: (amount: number) => void;
  reset: () => void;
};

const DocumentVerificationContext = createContext<DocumentVerificationContextType | undefined>(undefined);

export const useDocumentVerification = () => {
  const ctx = useContext(DocumentVerificationContext);
  if (!ctx) throw new Error('useDocumentVerification must be used within DocumentVerificationProvider');
  return ctx;
};

export const DocumentVerificationProvider = ({ children }: { children: ReactNode }) => {
  const [documentsMetadata, setDocumentsMetadata] = useState<DocumentMetadata[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const reset = () => {
    setDocumentsMetadata([]);
    setDocumentFiles([]);
    setContactInfo({ fullName: '', email: '', phoneNumber: '', address: '' });
    setReceiptFile(null);
    setAmountPaid(0);
  };

  return (
    <DocumentVerificationContext.Provider
      value={{
        documentsMetadata,
        setDocumentsMetadata,
        documentFiles,
        setDocumentFiles,
        contactInfo,
        setContactInfo,
        receiptFile,
        setReceiptFile,
        amountPaid,
        setAmountPaid,
        reset,
      }}
    >
      {children}
    </DocumentVerificationContext.Provider>
  );
}; 