/** @format */

// Types matching the API response sample structure

export interface PropertyLocation {
  state: string;
  localGovernment: string;
  area: string;
}

export interface LandSize {
  measurementType: string;
  size: number;
}

export interface DocumentOnProperty {
  docName: string;
  isProvided: boolean;
}

export interface PropertyOwner {
  _id: string;
  fullName: string;
  email: string;
}

export interface AdditionalFeatures {
  noOfBedroom?: number;
  noOfBathroom?: number;
  noOfToilet?: number;
  noOfCarPark?: number;
}

export interface Property {
  _id: string;
  propertyType: string;
  propertyCategory: string;
  price: number;
  location: PropertyLocation;
  landSize: LandSize;
  docOnProperty: DocumentOnProperty[];
  owner: PropertyOwner;
  areYouTheOwner: boolean;
  features: string[];
  tenantCriteria: string[];
  additionalFeatures: AdditionalFeatures;
  pictures: string[];
  videos?: string[];
  description: string;
  isTenanted: string;
  isAvailable: boolean;
  status: string;
  briefType: string;
  isPremium: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isDeleted: boolean;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertiesApiResponse {
  success: boolean;
  data: Property[];
  pagination: PaginationData;
}

export interface SinglePropertyApiResponse {
  success: boolean;
  data: Property;
}

export interface SearchFilters {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  propertyCategory?: string;
  state?: string;
  localGovernment?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  isApproved?: boolean;
}

export interface StatusUpdatePayload {
  status: string;
  reason?: string;
}

export interface DeletePropertyPayload {
  reason?: string;
}
