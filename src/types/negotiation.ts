export type NegotiationType = "NORMAL" | "LOI" | null

export type ContentTracker = "Negotiation" | "Confirm Inspection Date"

export interface NegotiationProps {
  firstName: string
  lastName: string
  currentAmount: number
  buyOffer: number
  contentTracker?: ContentTracker
  setContentTracker?: (type: ContentTracker) => void
  renderDynamicContent: () => { content: any; header: string }
  createdAt?: string | null
  letterOfIntention?: string
}

export interface DateTimeObj {
  selectedDate: string
  selectedTime: string
}

export interface PotentialClientData {
  _id: string
  propertyId: {
    location: {
      state: string
      localGovernment: string
      area: string
    }
    _id: string
    propertyType: string
    briefType: string
    price: number
    owner: string
  }
  inspectionDate: string
  inspectionTime: string
  status: string
  requestedBy: {
    _id: string
    fullName: string
    email: string
    phoneNumber: string
  }
  transaction: {
    _id: string
    transactionReceipt: string
  }
  isNegotiating: boolean
  negotiationPrice: number
  letterOfIntention: string
  owner: {
    _id: string
    email: string
    firstName: string
    lastName: string
    id: string
  }
  sellerCounterOffer: number
  createdAt: string
  updatedAt: string
  pendingResponseFrom: string
  stage: string
}
