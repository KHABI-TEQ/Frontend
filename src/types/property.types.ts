/** @format */

import { StaticImageData } from "next/image";

export interface PropertyLocation {
  state: string;
  lga: string;
  area?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parkingSpace?: number;
  landSize?: string;
  buildingSize?: string;
  furnished?: boolean;
  serviced?: boolean;
  securityFeatures?: string[];
  amenities?: string[];
}

export interface PropertyDocument {
  type: string;
  verified: boolean;
  url?: string;
} 

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
}

export interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  verified: boolean;
  rating?: number;
}

export interface PropertyPrice {
  amount: number;
  currency: string;
  negotiable: boolean;
  paymentTerms?: string[];
}

export interface Property {
  id: string;
  _id?: string; // For API compatibility
  title: string;
  description: string;
  type: 'residential' | 'commercial' | 'land' | 'apartment' | 'duplex' | 'bungalow' | 'penthouse' | 'studio';
  category: 'sale' | 'rent' | 'shortlet' | 'joint-venture';
  status: 'available' | 'sold' | 'rented' | 'under-review' | 'suspended';
  price: PropertyPrice;
  location: PropertyLocation;
  features: PropertyFeatures;
  images: PropertyImage[];
  documents: PropertyDocument[];
  owner: PropertyOwner;
  agent?: PropertyAgent;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  verified: boolean;
  featured: boolean;
}

export interface PropertyCardProps {
  property: Property;
  onLike?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  onContact?: (propertyId: string) => void;
  showAgent?: boolean;
  variant?: 'standard' | 'enhanced' | 'compact';
}

export interface PropertyListResponse {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PropertyFilter {
  type?: Property['type'][];
  category?: Property['category'];
  location?: {
    state?: string;
    lga?: string;
    area?: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  features?: {
    bedrooms?: number[];
    bathrooms?: number[];
    furnished?: boolean;
    serviced?: boolean;
  };
  verified?: boolean;
  featured?: boolean;
}

export interface PropertySearchParams extends PropertyFilter {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'date' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

// Brief/Preference related types
export interface PropertyBrief {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: Property['type'];
  category: Property['category'];
  location: PropertyLocation;
  budget: PropertyPrice;
  features: PropertyFeatures;
  urgency: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'fulfilled' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  matchedProperties?: Property[];
}

export interface PropertyBriefFormData {
  title: string;
  description: string;
  type: Property['type'];
  category: Property['category'];
  location: {
    state: string;
    lga: string;
    area?: string;
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    furnished?: boolean;
    serviced?: boolean;
    amenities?: string[];
  };
  urgency: 'low' | 'medium' | 'high';
  contactMethod: 'email' | 'phone' | 'both';
}

// Property listing form types
export interface PropertyListingFormData {
  basicDetails: {
    title: string;
    description: string;
    type: Property['type'];
    category: Property['category'];
  };
  location: PropertyLocation;
  features: PropertyFeatures;
  pricing: PropertyPrice;
  images: File[];
  documents: {
    type: string;
    file: File;
  }[];
  ownershipDeclaration: {
    isOwner: boolean;
    hasRightToSell: boolean;
    noLegalDisputes: boolean;
    accurateInformation: boolean;
  };
}

export interface PropertyInspection {
  id: string;
  propertyId: string;
  userId: string;
  agentId?: string;
  scheduledDate: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyNegotiation {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agentId?: string;
  initialOffer: number;
  currentOffer: number;
  counterOffer?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  messages: {
    id: string;
    senderId: string;
    message: string;
    timestamp: string;
  }[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
