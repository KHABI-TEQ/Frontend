/** @format */

import { StaticImageData } from "next/image";

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phoneNumber: string;
  subject: string;
}

export interface ContactInfo {
  value: string;
  icon: StaticImageData;
  type: 'mail' | 'call' | 'social_media' | 'address';
}

export interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ContactUnitProps {
  icon: StaticImageData;
  value: string;
  type?: string;
}

export type ContactFormStatus = 'idle' | 'pending' | 'success' | 'failed';
