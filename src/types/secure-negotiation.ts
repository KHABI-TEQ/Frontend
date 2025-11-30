// Updated types based on new secure negotiation system specifications

export type InspectionType = "price" | "LOI";
export type InspectionStage =
  | "negotiation"
  | "inspection"
  | "completed"
  | "cancelled";
export type PendingResponseFrom = "buyer" | "seller" | "admin";
export type InspectionStatus =
  | "new"
  | "pending_transaction"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

// Property location structure
export interface PropertyLocation {
  state: string;
  localGovernment: string;
  area: string;
}

// Property details from API response
export interface PropertyDetails {
  location: PropertyLocation;
  _id: string;
  propertyType: string;
  briefType: string;
  price: number;
  owner: string;
  pictures: string[];
  thumbnail: string | null;
}

// User information structures
export interface RequestedBy {
  _id: string;
  fullName: string;
}

export interface Owner {
  _id: string;
  lastName?: string;
  firstName?: string;
  userType?: string;
  id: string;
}

// Main inspection details from API response
export interface InspectionDetails {
  _id: string;
  propertyId: PropertyDetails;
  inspectionDate: string;
  inspectionTime: string;
  inspectionMode?: "in_person" | "virtual";
  status: InspectionStatus;
  requestedBy: RequestedBy;
  transaction: string;
  isNegotiating: boolean;
  negotiationPrice: number;
  letterOfIntention?: string;
  owner: Owner;
  sellerCounterOffer: number;
  pendingResponseFrom: PendingResponseFrom;
  stage: InspectionStage;
  createdAt: string;
  updatedAt: string;
  __v: number;
  inspectionStatus: string;
  inspectionType: InspectionType;
  isLOI: boolean;
  finalPrice?: number;
  buyOffer?: number;
  propertyTitle?: string;
  propertyLocation?: string;
  agreementTerms?: string[];
  counterCount?: number;
}

// API response structure
export interface InspectionDetailsResponse {
  success: boolean;
  data: InspectionDetails;
}

// Access validation response
export interface AccessValidationResponse {
  status: string;
  success: boolean;
  role: "seller" | "buyer";
  message: string;
}

// Base payload for all actions
export interface BasePayload {
  action: "accept" | "reject" | "counter";
  inspectionType: InspectionType;
  inspectionDate?: string;
  inspectionTime?: string;
  rejectionReason?: string;
  counterPrice?: number;
  inspectionMode?: "in_person" | "virtual";
}

// Union type for all possible payloads
export type NegotiationPayload = BasePayload

// Upload response for LOI documents
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
  };
}
