/** @format */

export interface DataProps {
  areYouTheOwner?: boolean;
  fileUrl?: string[];
  features?: { featureName: string; _id: string }[];
  createdAt?: string;
  rentalPrice?: number;
  docOnProperty: { docName: string; isProvided: boolean; _id: string }[];
  isApproved?: boolean;
  isAvailable?: boolean;
  isRejected?: boolean;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  owner?: string;
  ownerModel?: string;
  pictures?: string[];
  price: number | string;
  propertyFeatures?: {
    additionalFeatures: string[];
    noOfBedrooms: number;
  };
  propertyType: string;
  updatedAt?: string;
  propertyPrice: string | number;
  usageOptions?: string[];
  __v?: number;
  _id?: string;

  noOfBedrooms?: number;
  propertyCondition?: string;
  tenantCriteria?: {
    _id: string;
    criteria: string;
  }[];
  briefType?: string;
  statusLabel?: string;
}

export interface UserAgentDataProps {
  accountApproved: boolean;
  accountId: string;
  accountStatus: "active" | "inactive";
  agentData: {
    accountApproved: boolean;
    accountStatus: "active" | "inactive";
    address: {
      homeNo: string;
      street: string;
      state: string;
      localGovtArea: string;
    };
    agentType: string; // e.g., "Individual"
    companyAgent: string | null;
    createdAt: string; // ISO date string
    id: string;
    isAccountVerified: boolean;
    isDeleted: boolean;
    isFlagged: boolean;
    isInActive: boolean;
    isInUpgrade: boolean;
    meansOfId: {
      docImg: string[];
      name: string;
      _id: string;
    }[];
    regionOfOperation: string[];
    updatedAt: string;
    upgradeData: {
      meansOfId: {
        docImg: string;
        name: string;
        _id: string;
      }[];
      requestDate: string;
    };
    userId: string;
    __v?: number;
    _id?: string;
  };
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  isAccountVerified: boolean;
  isFlagged: boolean;
  lastName: string;
  phoneNumber: string;
  updatedAt: string;
  userType: "Agent" | string;
  __v?: number;
  _id?: string;
}

export type DataPropsArray = DataProps[];
