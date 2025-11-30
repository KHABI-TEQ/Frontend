/** @format */

export interface LocationFilter {
  selectedState: string;
  selectedLGA: string;
  selectedArea: string;
  locationDisplay: string;
}

export interface PriceRangeFilter {
  min: number;
  max: number;
}

export interface LandSizeFilter {
  type: "plot" | "sqm" | "acre" | "hectare";
  size?: number;
}

export interface BuyPropertyFilters extends LocationFilter {
  priceRange: PriceRangeFilter;
  documentTypes: string[];
  usageOptions: string[];
  bedrooms?: number;
  bathrooms?: number;
  landSize: LandSizeFilter;
  desiredFeatures: string[];
  tenantCriteria: string[];
  homeCondition: string;
}

export interface RentPropertyFilters extends LocationFilter {
  priceRange: PriceRangeFilter;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  homeCondition: string;
  furnished: string;
  serviced: string;
  desiredFeatures: string[];
  tenantCriteria: string[];
}

export interface ShortletPropertyFilters extends LocationFilter {
  priceRange: PriceRangeFilter;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  homeCondition: string;
  furnished: string;
  serviced: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  desiredFeatures: string[];
  tenantCriteria: string[];
}

export interface JointVentureFilters extends LocationFilter {
  investmentRange: PriceRangeFilter;
  propertyType: string;
  investmentType: string;
  expectedReturns: string;
  projectDuration: string;
  riskTolerance: string;
  partnershipStructure: string;
  minimumInvestment: number;
  exitStrategy: string[];
  desiredFeatures: string[];
}

export type PropertySearchFilters = 
  | BuyPropertyFilters 
  | RentPropertyFilters 
  | ShortletPropertyFilters 
  | JointVentureFilters;

export interface SearchParams {
  briefType: "buy" | "rent" | "shortlet" | "joint-venture";
  page: number;
  limit: number;
  filters?: Partial<PropertySearchFilters>;
  sortBy?: "price" | "date" | "popularity" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterGroup {
  name: string;
  label: string;
  type: "select" | "multiselect" | "range" | "checkbox" | "radio";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string | number | string[];
  removable?: boolean;
}

export interface FilterUpdateFunction<T extends PropertySearchFilters> {
  <K extends keyof T>(key: K, value: T[K]): void;
}

export interface SearchComponentProps<T extends PropertySearchFilters> {
  filters: T;
  updateFilter: FilterUpdateFunction<T>;
  onSearch: (filters: T) => Promise<void>;
  isLoading?: boolean;
  showAdvancedFilters?: boolean;
}

export interface PropertySearchResponse {
  properties: Property[];
  filters: {
    priceRange: { min: number; max: number };
    locations: FilterOption[];
    propertyTypes: FilterOption[];
    features: FilterOption[];
  };
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Import Property type from property.types
import { Property } from "./property.types";
