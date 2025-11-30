import React from 'react';
import { DocumentVerificationProvider } from '@/context/document-verification-context';

export default function DocumentVerificationLayout({ children }: { children: React.ReactNode }) {
  return <DocumentVerificationProvider>{children}</DocumentVerificationProvider>;
} 