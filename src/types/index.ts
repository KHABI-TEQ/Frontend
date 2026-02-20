/** @format */

import type { StaticImageData } from "next/image";

// Export all type definitions for easy importing
export * from "./api.types";
export * from "./contact.types";

export type {
  FormikInstance,
  InputType,
  BaseInputProps,
  TextInputProps,
  NumberInputProps,
  TextareaProps,
  SelectInputProps,
  CheckboxInputProps,
  RadioInputProps,
  FileInputProps,
  InputProps,
  FormStepProps,
  MultiStepFormProps,
  FieldArrayHelpers,
} from "./form.types";

export * from "./post-property.types";
export * from "./property.types";
export * from "./search.types";

// Navigation and UI types
export interface NavigationItem {
  name: string;
  url: string;
  isClicked: boolean;
  additionalLinks?: { name: string; url: string }[];
}

export interface SocialLink {
  image: StaticImageData;
  url: string;
}

export interface FAQItem {
  heading: string;
  text: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
  starsRated: number;
}

export interface StatsItem {
  name: string;
  count: number;
}

export interface HighlightItem {
  title: string;
  text: string;
}

export interface BenefitItem {
  title: string;
  text: string;
}

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type StringOrNumber = string | number;
export type ID = string;

// Status types
export type Status = "idle" | "loading" | "success" | "error";
export type RequestStatus = "pending" | "fulfilled" | "rejected";

// Generic response wrapper
export interface ApiResponseWrapper<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Modal and UI component types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Date and time types
export type DateString = string; // ISO date string
export type TimeString = string; // HH:MM format
export type DateTimeString = string; // ISO datetime string

// File and media types
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  filename: string;
  size: number;
  mimeType: string;
  alt?: string;
}

// Brief type (used by buy page / property reference)
export type BriefType = {
  id: string;
  _id: string;
  name: string;
  propertyType: string;
  price: number;
  propertyFeatures: { noOfBedrooms: string };
  location: { state: string; localGovernment: string };
  docOnProperty: { _id: string; docName: string }[];
  usageOptions?: [];
};

// Search and filter utility types
export type SortDirection = "asc" | "desc";
export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "contains";

export interface SortOption {
  field: string;
  direction: SortDirection;
  label: string;
}

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// Component state types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiError;
  message?: string;
}

export interface ComponentState extends LoadingState, ErrorState {
  data?: unknown;
  lastUpdated?: Date;
}
