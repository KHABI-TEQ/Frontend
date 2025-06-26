/** @format */

// export type SubmitInspectionPayloadProp = {
//   propertyId: string;
//   inspectionDate: string;
//   inspectionTime: string;
//   status: 'pending' | 'success' | 'failed';
//   requestedBy: {
//     fullName: string;
//     phoneNumber: string;
//     email: string;
//   };
//   transaction: {
//     fullName: string;
//     transactionReceipt: string;
//   };
//   isNegotiating: boolean;
//   negotiationPrice: number;
//   letterOfIntention: string;
// };

export type SubmitInspectionPayloadProp = {
  properties: Array<{
    propertyId: string;
    negotiationPrice?: number;
  }>;
  inspectionDate: string;
  inspectionTime: string;
  status: 'pending' | 'success' | 'failed';
  requestedBy: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  transaction: {
    fullName: string;
    transactionReceipt: string;
  };
  isNegotiating: boolean;
  letterOfIntention: string;
};

