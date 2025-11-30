/** @format */
//import { useRouter } from 'next/router';

import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Property } from "./property.types";
import { UserAgentDataProps } from "./agent_data_props";
  
interface Option {
  value: string;
  label: string;
}
export interface GlobalContextTypes {
  isContactUsClicked: boolean;
  setIsContactUsClicked: (type: boolean) => void;
  rentPage: {
    isSubmitForInspectionClicked: boolean;
    submitPreference: boolean;
  };
  setRentPage: ({
    isSubmitForInspectionClicked,
    submitPreference,
  }: {
    isSubmitForInspectionClicked: boolean;
    submitPreference: boolean;
  }) => void;
  //router: ReturnType<typeof useRouter> | null;
  selectedNav: string;
  setSelectedNav: (type: string) => void;
  //modal bar
  isModalOpened: boolean;
  setIsModalOpened: (type: boolean) => void;
  //view Image
  viewImage: boolean;
  setViewImage: (type: boolean) => void;
  //image data
  imageData: StaticImport[] | string[];
  setImageData: ([]: StaticImport[] | string[]) => void;
  //submitted successfully type
  isSubmittedSuccessfully: boolean;
  setIsSubmittedSuccessfully: (type: boolean) => void;
  //propertyDetailsProps
  propertyDetails: {
    propertyType: string;
    usageOptions: string[];
    price: string | number;
    documents: string[];
    docOnProperty: Array<
      string | { isProvided: boolean; _id: string; docName: string }
    >;
    noOfBedroom: string;
    additionalFeatures: string;
    selectedState: Option | null;
    selectedCity: Option | null;
  };
  setPropertyDetails: ({}: {
    propertyType: string;
    usageOptions: string[];
    price: string | number;
    documents: string[];
    docOnProperty: [];
    noOfBedroom: string;
    additionalFeatures: string;
    selectedState: Option | null;
    selectedCity: Option | null;
  }) => void;
  propertyReference: {
    type: "buy" | "rental" | "";
    payload: Record<string, unknown>;
  };
  setPropertyReference: (value: {
    type: "buy" | "rental" | "";
    payload: Record<string, unknown>;
  }) => void;
  cardData: [];
  setCardData: ([]: []) => void;
  selectedBriefs: Set<BriefType>;
  addBrief: (brief: BriefType) => void;
  removeBrief: (briefId: BriefType) => void;
  clearBriefs: () => void;
  propertyRefSelectedBriefs: BriefType[];
  setPropertyRefSelectedBriefs: ([]: BriefType[]) => void;
  /**Agent Brief Settings */
  settings: {
    selectedNav: string;
    isUpgradeButtonClicked: boolean;
    upgradeStatus: {
      isYetToUpgrade: boolean;
      isAwatingUpgrade: boolean;
      isUpgraded: boolean;
    };
    onUpgradeData: {
      companyName: string;
      regNo: number;
      image: string[];
    };
  };
  setSettings: ({}: {
    selectedNav: string;
    isUpgradeButtonClicked: boolean;
    upgradeStatus: {
      isYetToUpgrade: boolean;
      isAwatingUpgrade: boolean;
      isUpgraded: boolean;
    };
    onUpgradeData: {
      companyName: string;
      regNo: number;
      image: string[];
    };
  }) => void;

  userDetails: UserAgentDataProps;
  setUserDetails: ({}: UserAgentDataProps) => void;

  /**Dashboard Types */
  dashboard: {
    approveBriefsTable: {
      isApproveClicked: boolean;
      isRejectClicked: boolean;
      isDeleteClicked: boolean;
    };
  };

  setDashboard: ({}: {
    approveBriefsTable: {
      isApproveClicked: boolean;
      isRejectClicked: boolean;
      isDeleteClicked: boolean;
    };
  }) => void;

  /**Market Place */
  selectedType: string;
  setSelectedType: (type: string) => void;

  /**
   * Property selected for inspection from the property detailss page
   */
  propertySelectedForInspection: Property | undefined;
  setPropertySelectedForInspection: (
    property: Property | undefined,
  ) => void;

  //add for inspection modal
  isAddForInspectionModalOpened: boolean;
  setIsAddForInspectionModalOpened: (type: boolean) => void;

  //price negotiation button
  isComingFromPriceNeg: boolean;
  setIsComingFromPriceNeg: (type: boolean) => void;

  //commission
  commission: CommissionType;
  setCommission: (type: CommissionType) => void;
}

type CommissionType = {
  userType: "agent" | "land_owners";
  commission: string;
  payload: any;
};

export type BriefType = {
  id: string;
  _id: string;
  name: string;
  propertyType: string;
  price: number;
  propertyFeatures: { noOfBedrooms: string };
  location: {
    state: string;
    localGovernment: string;
  };
  docOnProperty: { _id: string; docName: string }[];
  usageOptions?: [];
}; // Adjust fields as needed

// type BriefsContextType = {
//   selectedBriefs: Set<BriefType>;
//   addBrief: (brief: BriefType) => void;
//   removeBrief: (briefId: string) => void;
//   clearBriefs: () => void;
// };

/**
 * Settings - User Details
 */

export type userDetailsProperties = {
  name: string;
  email: string;
  profile_picture: string;
  address: {
    localGovtArea: string;
    state: string;
    street: string;
  };
  regionOfOperation: string[];
  accountApproved: boolean;
  accountStatus: string;
  agentType: string;
  firstName: string;
  lastName: string;
  id: string;
  individualAgent: {
    typeOfId: string;
  };
  isAccountVerified: boolean;
  isInUpgrade: boolean;
  meansOfId: { docImg: string[]; name: string; _id: string }[];
  phoneNumber: string;
  upgradeData: {
    companyAgent: {
      companyName: string;
    };
    meansOfId: { docImg: string[]; name: string; _id: string }[];
    requestDate: string;
  };
  _id: string;
};
