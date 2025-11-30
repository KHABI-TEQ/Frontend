/** @format */

export interface PropertyFormData {
  // Basic Details
  title: string;
  description: string;
  propertyType: string;
  propertyCategory: string;
  buildingType?: string;
  propertyCondition?: string;
  
  // Location
  state: string;
  lga: string;
  area: string;
  detailedAddress?: string;
  
  // Price
  price: number;
  currency: string;
  negotiable: boolean;
  paymentPlans?: string[];
  
  // Features
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parkingSpace?: number;
  landSize?: string;
  buildingSize?: string;
  
  // Property Features
  furnished?: boolean;
  serviced?: boolean;
  securityFeatures?: string[];
  amenities?: string[];
  keyFeatures?: string[];
  
  // Images and Documents
  images: File[];
  documents: {
    type: string;
    file: File;
  }[];
  
  // Ownership Declaration
  ownershipDeclaration: {
    isOwner: boolean;
    hasRightToSell: boolean;
    noLegalDisputes: boolean;
    accurateInformation: boolean;
  };
  
  // Contact Information
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
    preferredContactMethod: 'email' | 'phone' | 'whatsapp';
    contactTimes?: string[];
  };
  
  // Additional Properties
  [key: string]: unknown;
}

export interface StepProps {
  currentStep?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
}

export interface PropertyFormErrors {
  [key: string]: string | PropertyFormErrors;
}

export interface PropertyFormTouched {
  [key: string]: boolean | PropertyFormTouched;
}

export interface PostPropertyContextType {
  propertyData: PropertyFormData;
  updatePropertyData: <K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ) => void;
  resetForm: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export interface OwnershipDeclarationFormData {
  isOwner: boolean;
  hasRightToSell: boolean;
  noLegalDisputes: boolean;
  accurateInformation: boolean;
}

export interface ContactInfoFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  contactTimes?: string[];
}

export interface ImageUploadData {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
  error?: string;
}

export interface DocumentUploadData {
  id: string;
  type: string;
  file: File;
  uploaded: boolean;
  error?: string;
}

export interface PropertyPreviewData extends Omit<PropertyFormData, 'images' | 'documents'> {
  images: ImageUploadData[];
  documents: DocumentUploadData[];
  estimatedListingFee?: number;
  estimatedCommission?: number;
}
