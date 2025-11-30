export type NegotiationStatus = 'completed' | 'offer_rejected' | 'negotiation_countered' | 'cancelled' | 'negotiation_accepted' | 'pending_inspection';

export interface InspectionDataResponse {
    status: NegotiationStatus;
    pendingResponseFrom?: 'buyer' | 'seller';
}

export interface ApiSuccessResponse {
    message: string;
    inspectionData: InspectionDataResponse;
}

export interface DealSiteLog {
  _id: string;
  dealSite?: string;
  actor?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  actorModel?: string;
  category?: string;
  action?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
}