/** @format */

"use client";
import { BriefType, GlobalContextTypes } from "@/types/indexG";
import { UserAgentDataProps } from "@/types/agent_data_props";
import { Property } from "@/types/property.types";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { createContext, useContext, useState } from "react";
import { string } from "yup";

interface Option {
  value: string;
  label: string;
}

const PageContext = createContext<GlobalContextTypes | undefined>(undefined);

export const PageContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isContactUsClicked, setIsContactUsClicked] = useState<boolean>(false);
  const [rentPage, setRentPage] = useState({
    isSubmitForInspectionClicked: false,
    submitPreference: false,
  });
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  // const [selectedNav, setSelectedNav] = useState<string>('Create Brief'); //Agent Navigation
  const [selectedNav, setSelectedNav] = useState<string>("Overview"); //Agent Navigation

  /**Property Details */
  const [propertyDetails, setPropertyDetails] = useState<{
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
  }>({
    propertyType: "",
    usageOptions: [],
    price: "",
    documents: [],
    docOnProperty: [],
    noOfBedroom: "",
    additionalFeatures: "",
    selectedCity: null,
    selectedState: null,
  });

  /**
   * View image
   */
  const [viewImage, setViewImage] = useState<boolean>(false);
  const [imageData, setImageData] = useState<StaticImport[] | string[]>([]);

  //Submitted successfully context logic.
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] =
    useState<boolean>(false);

  //Buy page and rent page - property referenece
  const [propertyReference, setPropertyReference] = useState<{
    type: "buy" | "rental" | "";
    payload: Record<string, unknown>;
  }>({
    type: "",
    payload: {},
  });

  /**Selected Briefs for Buy Page - property reference */
  const [propertyRefSelectedBriefs, setPropertyRefSelectedBriefs] = useState<
    BriefType[]
  >([]);

  //all card data
  const [cardData, setCardData] = useState<[]>([]);

  //selecting cards for inspection
  const [selectedBriefs, setSelectedBriefs] = useState<Set<BriefType>>(
    new Set(),
  );

  const addBrief = (brief: BriefType) => {
    setSelectedBriefs((prev) => new Set([...prev, brief])); // Ensure immutability
  };

  const removeBrief = (brief: BriefType) => {
    setSelectedBriefs((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.delete(brief);
      return updatedSet;
    });
  };

  const clearBriefs = () => {
    setSelectedBriefs(new Set());
  };

  /**
   * Agent Brief Settings
   */
  const [settings, setSettings] = useState({
    selectedNav: "Change Password",
    isUpgradeButtonClicked: false,
    upgradeStatus: {
      isYetToUpgrade: true,
      isAwatingUpgrade: false,
      isUpgraded: false,
    },
    onUpgradeData: {
      companyName: "",
      regNo: 0,
      image: [""],
    },
  });

  const [userDetails, setUserDetails] = useState<UserAgentDataProps>(
    {} as UserAgentDataProps,
  );

  /**
   * Dashboard
   */
  const [dashboard, setDashboard] = useState({
    approveBriefsTable: {
      isApproveClicked: false,
      isRejectClicked: false,
      isDeleteClicked: false,
    },
  });

  /**
   * Market Place
   */
  const [selectedType, setSelectedType] = useState<string>("Buy a property");

  /**
   * Property selected for inspection from the property detailss page
   */
  const [propertySelectedForInspection, setPropertySelectedForInspection] =
    useState<Property | undefined>(undefined);

  /**
   * ismodalforInspection Opened
   */
  const [isAddForInspectionModalOpened, setIsAddForInspectionModalOpened] =
    useState<boolean>(false);

  //handle is coming from price negotiation
  const [isComingFromPriceNeg, setIsComingFromPriceNeg] =
    useState<boolean>(false);

  //commission
  type CommissionType = {
    userType: "agent" | "land_owners";
    commission: string;
    payload: any;
  };
  const [commission, setCommission] = useState<CommissionType>({
    userType: "land_owners",
    commission: "10%",
    payload: {},
  }); //default for land owners, agent is 20%

  return (
    <PageContext.Provider
      value={{
        isContactUsClicked,
        setIsContactUsClicked,
        rentPage,
        setRentPage,
        selectedNav,
        setSelectedNav,
        isModalOpened,
        setIsModalOpened,
        viewImage,
        setViewImage,
        imageData,
        setImageData,
        isSubmittedSuccessfully,
        setIsSubmittedSuccessfully,
        propertyDetails,
        setPropertyDetails,
        propertyReference,
        setPropertyReference,
        cardData,
        setCardData,
        selectedBriefs,
        addBrief,
        clearBriefs,
        removeBrief,
        propertyRefSelectedBriefs,
        setPropertyRefSelectedBriefs,
        settings,
        setSettings,
        dashboard,
        setDashboard,
        userDetails,
        setUserDetails,
        selectedType,
        setSelectedType,
        propertySelectedForInspection,
        setPropertySelectedForInspection,
        isAddForInspectionModalOpened,
        setIsAddForInspectionModalOpened,
        isComingFromPriceNeg,
        setIsComingFromPriceNeg,
        commission,
        setCommission,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("");
  }
  return context;
};
