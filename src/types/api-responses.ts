export type NegotiationStatus = 'completed' | 'offer_rejected' | 'negotiation_countered' | 'cancelled' | 'negotiation_accepted' | 'pending_inspection';

export interface InspectionDataResponse {
    status: NegotiationStatus;
    pendingResponseFrom?: 'buyer' | 'seller';
}

export interface ApiSuccessResponse {
    message: string;
    inspectionData: InspectionDataResponse;
}