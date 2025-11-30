/** @format */

// Agent States as per specification
export type AgentState = 'free' | 'verified' | 'expired';

export interface AgentStatePermissions {
  canCreatePublicPage: boolean;
  canPostUnlimitedListings: boolean;
  hasCommissionRemoved: boolean;
  hasVerifiedBadge: boolean;
  canSetInspectionFee: boolean;
}

export const AGENT_STATE_PERMISSIONS: Record<AgentState, AgentStatePermissions> = {
  free: {
    canCreatePublicPage: false,
    canPostUnlimitedListings: false, // Basic listings only
    hasCommissionRemoved: false,
    hasVerifiedBadge: false,
    canSetInspectionFee: false,
  },
  verified: {
    canCreatePublicPage: true,
    canPostUnlimitedListings: true,
    hasCommissionRemoved: true,
    hasVerifiedBadge: true,
    canSetInspectionFee: true,
  },
  expired: {
    canCreatePublicPage: false, // Public page disabled
    canPostUnlimitedListings: false,
    hasCommissionRemoved: false, // Commission applies again
    hasVerifiedBadge: false,
    canSetInspectionFee: false,
  }
};

// Extended Profile / KYC Data
export interface AgentKYCData {
  // Basic Info (already collected in onboarding)
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  
  // Identity Documents
  idUpload: {
    type: 'nin' | 'drivers_license' | 'passport';
    documentUrl: string;
    documentNumber: string;
  };
  
  // Business Registration (optional)
  businessRegistration?: {
    cacNumber?: string;
    businessLicense?: string;
    documentUrl?: string;
  };
  
  // Professional Details
  agentLicenseNumber?: string;
  
  // Profile & Branding
  profileBio: string;
  specializations: AgentSpecialization[];
  languagesSpoken: string[];
  servicesOffered: AgentService[];
  
  // Achievements & Certifications (optional)
  achievements?: {
    title: string;
    description: string;
    certificateUrl?: string;
    dateReceived?: string;
  }[];
  
  // Featured Listings (3-5 properties)
  featuredListings?: {
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    price: number;
    location: string;
  }[];
}

export type AgentSpecialization = 
  | 'luxury_properties'
  | 'residential_sales'
  | 'commercial_real_estate'
  | 'rentals'
  | 'shortlet'
  | 'joint_ventures'
  | 'land_sales'
  | 'property_management'
  | 'investment_properties'
  | 'new_developments';

export type AgentService = 
  | 'property_consultation'
  | 'market_analysis'
  | 'property_valuation'
  | 'investment_advisory'
  | 'property_management'
  | 'legal_assistance'
  | 'financing_assistance'
  | 'inspection_services'
  | 'documentation_support'
  | 'relocation_services';

// Inspection Fee Setup
export interface InspectionFeeSetup {
  inspectionFee: number; // Amount in Naira
  currency: 'NGN';
  description?: string;
  terms?: string;
}

// Subscription Plans for Agent Upgrade
export interface AgentSubscriptionPlan {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  duration: number; // in months
  originalPrice: number;
  discountedPrice: number;
  discount?: number; // percentage
  savings?: number; // amount saved
  popular?: boolean;
  features: string[];
}

export const AGENT_SUBSCRIPTION_PLANS: AgentSubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    type: 'monthly',
    duration: 1,
    originalPrice: 25000,
    discountedPrice: 25000,
    features: [
      'Verified Agent Badge',
      'Public Agent Profile',
      'Unlimited Listings',
      'No Commission on Sales',
      'Inspection Fee Setup',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    type: 'quarterly',
    duration: 3,
    originalPrice: 75000,
    discountedPrice: 67500,
    discount: 10,
    savings: 7500,
    popular: true,
    features: [
      'Everything in Monthly',
      'Priority Listing Display',
      'Advanced Analytics',
      'Phone Support',
      'Quarterly Performance Report'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    type: 'yearly',
    duration: 12,
    originalPrice: 300000,
    discountedPrice: 240000,
    discount: 20,
    savings: 60000,
    features: [
      'Everything in Quarterly',
      'Featured Agent Status',
      'Custom Branding Options',
      'Dedicated Account Manager',
      'Marketing Support',
      'Annual Growth Report'
    ]
  }
];

// Agent Upgrade Flow Steps
export type AgentUpgradeStep = 
  | 'basic_profile'
  | 'extended_profile'
  | 'inspection_fee'
  | 'subscription_plan'
  | 'payment'
  | 'activation';

export interface AgentUpgradeFormData {
  // Step 1: Basic Profile (mostly pre-filled from onboarding)
  basicProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture?: string;
    address: {
      street: string;
      localGovtArea: string;
      state: string;
    };
  };
  
  // Step 2: Extended Profile / KYC
  extendedProfile: AgentKYCData;
  
  // Step 3: Inspection Fee Setup
  inspectionFee: InspectionFeeSetup;
  
  // Step 4: Subscription Plan Selection
  selectedPlan: AgentSubscriptionPlan;
  
  // Step 5: Payment
  paymentDetails?: {
    transactionReference: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
  };
}

// Agent Profile for Public Page
export interface PublicAgentProfile {
  agentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
  bio: string;
  specializations: AgentSpecialization[];
  languagesSpoken: string[];
  servicesOffered: AgentService[];
  inspectionFee: InspectionFeeSetup;
  
  // Contact Information
  phoneNumber: string;
  email: string;
  location: {
    state: string;
    localGovtArea: string;
  };
  
  // Professional Details
  agentLicenseNumber?: string;
  businessRegistration?: {
    companyName?: string;
    cacNumber?: string;
  };
  
  // Performance Metrics
  metrics: {
    totalListings: number;
    activeListing: number;
    completedDeals: number;
    yearsOfExperience: number;
    rating?: number;
    reviewCount: number;
  };
  
  // Portfolio
  featuredListings: {
    propertyId: string;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
    propertyType: string;
  }[];
  
  achievements: {
    title: string;
    description: string;
    certificateUrl?: string;
    dateReceived?: string;
  }[];
  
  // Social Links & Sharing
  socialLinks?: {
    whatsapp?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Timestamps
  verifiedAt: string;
  lastActive: string;
  joinedAt: string;
}

// Agent Upgrade API Responses
export interface AgentUpgradeResponse {
  success: boolean;
  message: string;
  data?: {
    agentState: AgentState;
    publicProfileUrl?: string;
    subscriptionDetails?: {
      subscriptionId: string;
      planType: string;
      expiresAt: string;
      status: 'active' | 'expired';
    };
  };
  error?: string;
}

export interface AgentUpgradeProgress {
  currentStep: AgentUpgradeStep;
  completedSteps: AgentUpgradeStep[];
  canProceedToNextStep: boolean;
  nextStep?: AgentUpgradeStep;
  progressPercentage: number;
}

// Enhanced User type to include agent upgrade data
export interface EnhancedAgentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'Agent' | 'Landowners' | 'FieldAgent';
  
  // Agent-specific data
  agentState: AgentState;
  agentData?: {
    isOnboarded: boolean;
    isKYCCompleted: boolean;
    hasActiveSubscription: boolean;
    publicProfileUrl?: string;
    inspectionFee?: InspectionFeeSetup;
    specializations: AgentSpecialization[];
    servicesOffered: AgentService[];
  };
  
  // Upgrade flow progress
  upgradeProgress?: AgentUpgradeProgress;
}

// Form validation schemas (to be used with Yup or similar)
export interface AgentUpgradeValidation {
  extendedProfile: {
    profileBio: { required: true; minLength: 50; maxLength: 500 };
    specializations: { required: true; minItems: 1; maxItems: 5 };
    languagesSpoken: { required: true; minItems: 1 };
    servicesOffered: { required: true; minItems: 2 };
    idUpload: { required: true };
  };
  inspectionFee: {
    inspectionFee: { required: true; min: 1000; max: 100000 };
  };
}

// Constants
export const AGENT_UPGRADE_CONSTANTS = {
  MIN_INSPECTION_FEE: 1000,
  MAX_INSPECTION_FEE: 100000,
  KHABITEQ_INSPECTION_DEDUCTION: 1000,
  MIN_BIO_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MAX_SPECIALIZATIONS: 5,
  MIN_SERVICES: 2,
  FEATURED_LISTINGS_COUNT: 5,
} as const;

export const SPECIALIZATION_OPTIONS: { value: AgentSpecialization; label: string }[] = [
  { value: 'luxury_properties', label: 'Luxury Properties' },
  { value: 'residential_sales', label: 'Residential Sales' },
  { value: 'commercial_real_estate', label: 'Commercial Real Estate' },
  { value: 'rentals', label: 'Rentals' },
  { value: 'shortlet', label: 'Short-let Properties' },
  { value: 'joint_ventures', label: 'Joint Ventures' },
  { value: 'land_sales', label: 'Land Sales' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'investment_properties', label: 'Investment Properties' },
  { value: 'new_developments', label: 'New Developments' },
];

export const SERVICE_OPTIONS: { value: AgentService; label: string }[] = [
  { value: 'property_consultation', label: 'Property Consultation' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'property_valuation', label: 'Property Valuation' },
  { value: 'investment_advisory', label: 'Investment Advisory' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'legal_assistance', label: 'Legal Assistance' },
  { value: 'financing_assistance', label: 'Financing Assistance' },
  { value: 'inspection_services', label: 'Inspection Services' },
  { value: 'documentation_support', label: 'Documentation Support' },
  { value: 'relocation_services', label: 'Relocation Services' },
];

export const LANGUAGE_OPTIONS = [
  'English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'French', 'Arabic', 'Fulani', 'Kanuri', 'Tiv', 'Ibibio', 'Ijaw'
];

// Agent KYC Submission Types
export interface AgentKycMeansOfId {
  name: string;
  docImg: string[];
}

export interface AgentKycAchievement {
  title: string;
  description: string;
  fileUrl?: string;
  dateAwarded: string;
}

export interface AgentKycAddress {
  street: string;
  homeNo: string;
  state: string;
  localGovtArea: string;
}

export interface AgentKycSubmissionPayload {
  meansOfId: AgentKycMeansOfId[];
  agentLicenseNumber?: string;
  profileBio: string;
  specializations: string[];
  languagesSpoken: string[];
  servicesOffered: string[];
  achievements?: AgentKycAchievement[];
  featuredListings?: string[];
  address: AgentKycAddress;
  regionOfOperation: string[];
  agentType: 'Individual' | 'Company';
}

export type AgentType = 'Individual' | 'Company';
