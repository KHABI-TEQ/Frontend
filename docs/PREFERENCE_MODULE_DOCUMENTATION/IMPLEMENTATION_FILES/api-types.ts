/** @format */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'agent' | 'admin';
  verified: boolean;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  searchFilters: {
    location?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    propertyTypes?: string[];
  };
  currency: string;
  language: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  marketingEmails?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileFormData {
  name: string;
  email: string;
  phone?: string;
  avatar?: File;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface LocationOption extends SelectOption {
  state?: string;
  lga?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  value?: string | number;
  error?: string;
  touched?: boolean;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  className?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface Agent {
  id: string;
  user: User;
  company?: string;
  license?: string;
  experience: number;
  specializations: string[];
  rating: number;
  reviewCount: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profileComplete: boolean;
  activeListings: number;
  totalSales: number;
  joinedAt: string;
}

export interface AgentProfile {
  bio: string;
  experience: number;
  specializations: string[];
  serviceAreas: string[];
  languages: string[];
  certifications: string[];
  awards: string[];
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentReviews {
  agent: Agent;
  reviews: Review[];
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  details: {
    last4?: string;
    brand?: string;
    bankName?: string;
    accountNumber?: string;
  };
  isDefault: boolean;
  expiresAt?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'commission';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  propertyId?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
