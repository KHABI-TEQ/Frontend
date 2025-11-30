/** @format */

"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { URLS } from "@/utils/URLS";
import { GET_REQUEST } from "@/utils/requests";

// Types - Simplified to focus on property data and search

export interface MarketTypeSelection {
  name: string;
  briefType: string;
  subValue: string;
}

export interface SearchParams {
  briefType: string;
  page?: number;
  limit?: number;
  location?: string;
  priceRange?: { min?: number; max?: number };
  documentType?: string[];
  bedroom?: number;
  bathroom?: number;
  landSizeType?: string;
  landSize?: number;
  desireFeature?: string[];
  homeCondition?: string;
  tenantCriteria?: string[];
  propertyType?: string[];
  type?: string;
}

interface TabState {
  properties: any[];
  formikStatus: "idle" | "pending" | "success" | "failed";
  errMessage: string;
  searchStatus: {
    status: "pending" | "success" | "failed" | "idle";
    couldNotFindAProperty: boolean;
  };
  currentPage: number;
  totalPages: number;
  totalItems: number;
  // Tab-specific filters
  usageOptions: string[];
  rentFilterBy: string[];
  jvFilterBy: string[];
  homeCondition: string;
  searchLocation: {
    state: string;
    localGovernment: string;
    area?: string;
  } | null;

  // Inspection and negotiation state
  selectedForInspection?: any[];
  negotiatedPrices?: any[];
  loiDocuments?: any[];
  priceRange: {
    min: number;
    max: number;
  } | null;
}

interface NewMarketplaceContextType {
  // Active tab management
  activeTab: "buy" | "jv" | "rent" | "shortlet";
  setActiveTab: (tab: "buy" | "jv" | "rent" | "shortlet") => void;

  // Tab states
  buyTab: TabState;
  jvTab: TabState;
  rentTab: TabState;
  shortletTab: TabState;

  // Current tab state getters
  getCurrentTabState: () => TabState;

  // Properties management
  setTabProperties: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    properties: any[],
  ) => void;

  // Loading and error states
  setTabStatus: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    status: "idle" | "pending" | "success" | "failed",
  ) => void;
  setTabError: (tab: "buy" | "jv" | "rent" | "shortlet", error: string) => void;
  setTabSearchStatus: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    status: {
      status: "pending" | "success" | "failed" | "idle";
      couldNotFindAProperty: boolean;
    },
  ) => void;

  // Note: Inspection selection and negotiation functionality removed as per requirements

  // Inspection and negotiation methods (re-added for compatibility)
  setIsAddForInspectionOpen?: (open: boolean) => void;
  removeFromInspection?: (propertyId: string) => void;
  clearInspectionSelection?: () => void;
  removeNegotiatedPrice?: (propertyId: string) => void;
  removeLOIDocument?: (propertyId: string) => void;

  // Filter management
  setTabFilter: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    filterType: string,
    value: any,
  ) => void;
  clearTabFilters: (tab: "buy" | "jv" | "rent" | "shortlet") => void;

  // Pagination
  setTabPage: (tab: "buy" | "jv" | "rent" | "shortlet", page: number) => void;
  setTabPagination: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    totalPages: number,
    totalItems: number,
  ) => void;

  // Data fetching
  fetchTabData: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    searchParams?: SearchParams,
  ) => Promise<void>;
  searchTabProperties: (
    tab: "buy" | "jv" | "rent" | "shortlet",
    searchParams: SearchParams,
  ) => Promise<void>;

  // Note: Add for inspection modal removed as per requirements

  // Item per page
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;

  // Reset all data
  resetAllTabs: () => void;
}

const NewMarketplaceContext = createContext<
  NewMarketplaceContextType | undefined
>(undefined);

// Initial tab state - simplified to focus on property data and search
const createInitialTabState = (): TabState => ({
  properties: [],
  formikStatus: "idle",
  errMessage: "",
  searchStatus: {
    status: "idle",
    couldNotFindAProperty: false,
  },
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  usageOptions: [],
  rentFilterBy: [],
  jvFilterBy: ["All"],
  homeCondition: "",
  searchLocation: null,
  priceRange: null,
});

export const NewMarketplaceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Tab management
  const [activeTab, setActiveTab] = useState<
    "buy" | "jv" | "rent" | "shortlet"
  >("buy");
  const [buyTab, setBuyTab] = useState<TabState>(createInitialTabState);
  const [jvTab, setJvTab] = useState<TabState>(createInitialTabState);
  const [rentTab, setRentTab] = useState<TabState>(createInitialTabState);
  const [shortletTab, setShortletTab] = useState<TabState>(
    createInitialTabState,
  );

  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Get current tab state
  const getCurrentTabState = useCallback((): TabState => {
    switch (activeTab) {
      case "buy":
        return buyTab;
      case "jv":
        return jvTab;
      case "rent":
        return rentTab;
      case "shortlet":
        return shortletTab;
      default:
        return buyTab;
    }
  }, [activeTab, buyTab, jvTab, rentTab, shortletTab]);

  // Update tab state helper
  const updateTabState = useCallback(
    (
      tab: "buy" | "jv" | "rent" | "shortlet",
      updater: (state: TabState) => TabState,
    ) => {
      switch (tab) {
        case "buy":
          setBuyTab(updater);
          break;
        case "jv":
          setJvTab(updater);
          break;
        case "rent":
          setRentTab(updater);
          break;
        case "shortlet":
          setShortletTab(updater);
          break;
      }
    },
    [],
  );

  // Properties management
  const setTabProperties = useCallback(
    (tab: "buy" | "jv" | "rent" | "shortlet", properties: any[]) => {
      updateTabState(tab, (state) => ({ ...state, properties }));
    },
    [updateTabState],
  );

  // Status management
  const setTabStatus = useCallback(
    (
      tab: "buy" | "jv" | "rent" | "shortlet",
      status: "idle" | "pending" | "success" | "failed",
    ) => {
      updateTabState(tab, (state) => ({ ...state, formikStatus: status }));
    },
    [updateTabState],
  );

  const setTabError = useCallback(
    (tab: "buy" | "jv" | "rent" | "shortlet", error: string) => {
      updateTabState(tab, (state) => ({ ...state, errMessage: error }));
    },
    [updateTabState],
  );

  const setTabSearchStatus = useCallback(
    (
      tab: "buy" | "jv" | "rent" | "shortlet",
      searchStatus: {
        status: "pending" | "success" | "failed" | "idle";
        couldNotFindAProperty: boolean;
      },
    ) => {
      updateTabState(tab, (state) => ({ ...state, searchStatus }));
    },
    [updateTabState],
  );

  // Note: Inspection selection methods removed as per requirements

  // Filter management
  const setTabFilter = useCallback(
    (
      tab: "buy" | "jv" | "rent" | "shortlet",
      filterType: string,
      value: any,
    ) => {
      updateTabState(tab, (state) => ({ ...state, [filterType]: value }));
    },
    [updateTabState],
  );

  const clearTabFilters = useCallback(
    (tab: "buy" | "jv" | "rent" | "shortlet") => {
      updateTabState(tab, (state) => ({
        ...state,
        usageOptions: [],
        rentFilterBy: [],
        jvFilterBy: ["All"],
        homeCondition: "",
        searchLocation: null,
        priceRange: null,
      }));
    },
    [updateTabState],
  );

  // Pagination
  const setTabPage = useCallback(
    (tab: "buy" | "jv" | "rent" | "shortlet", page: number) => {
      updateTabState(tab, (state) => ({ ...state, currentPage: page }));
    },
    [updateTabState],
  );

  const setTabPagination = useCallback(
    (
      tab: "buy" | "jv" | "rent" | "shortlet",
      totalPages: number,
      totalItems: number,
    ) => {
      updateTabState(tab, (state) => ({ ...state, totalPages, totalItems }));
    },
    [updateTabState],
  );

  // Data fetching
  const searchTabProperties = useCallback(
    async (
      tab: "buy" | "jv" | "rent" | "shortlet",
      searchParams: SearchParams,
      retryCount = 0,
    ) => {
      const maxRetries = 2;

      if (!isMountedRef.current) return;

      setTabStatus(tab, "pending");
      setTabError(tab, "");
      setTabSearchStatus(tab, {
        status: "pending",
        couldNotFindAProperty: false,
      });

      try {
        // Check network connectivity first
        if (!navigator.onLine) {
          throw new Error(
            "No internet connection. Please check your network and try again.",
          );
        }

        // Use static imports (already imported at top of file)

        // Validate URL construction
        if (!URLS.BASE || URLS.BASE.includes("undefined")) {
          throw new Error(
            "API URL is not properly configured. Please contact support.",
          );
        }

        // Build query parameters
        const queryParams = new URLSearchParams();

        // Required parameter - Map tab to correct briefType for API
        const briefTypeMapping = {
          buy: "Outright Sales",
          jv: "Joint Venture",
          rent: "Rent",
          shortlet: "Shortlet",
        };
        const apiBriefType =
          briefTypeMapping[
            searchParams.briefType as keyof typeof briefTypeMapping
          ] || searchParams.briefType;
        queryParams.append("briefType", apiBriefType);

        // Pagination parameters
        const currentTabState = getCurrentTabState();
        queryParams.append(
          "page",
          String(searchParams.page || currentTabState.currentPage),
        );
        queryParams.append("limit", String(searchParams.limit || itemsPerPage));

        // Optional filter parameters
        if (searchParams.location) {
          queryParams.append("location", searchParams.location);
        }

        if (searchParams.priceRange) {
          queryParams.append(
            "priceRange",
            JSON.stringify(searchParams.priceRange),
          );
        }

        if (searchParams.documentType && searchParams.documentType.length > 0) {
          queryParams.append(
            "documentType",
            searchParams.documentType.join(","),
          );
        }

        if (searchParams.bedroom) {
          queryParams.append("bedroom", String(searchParams.bedroom));
        }

        if (searchParams.bathroom) {
          queryParams.append("bathroom", String(searchParams.bathroom));
        }

        if (searchParams.landSizeType) {
          queryParams.append("landSizeType", searchParams.landSizeType);
        }

        if (searchParams.landSize) {
          queryParams.append("landSize", String(searchParams.landSize));
        }

        if (
          searchParams.desireFeature &&
          searchParams.desireFeature.length > 0
        ) {
          queryParams.append(
            "desireFeature",
            searchParams.desireFeature.join(","),
          );
        }

        if (searchParams.homeCondition) {
          queryParams.append("homeCondition", searchParams.homeCondition);
        }

        if (
          searchParams.tenantCriteria &&
          searchParams.tenantCriteria.length > 0
        ) {
          queryParams.append(
            "tenantCriteria",
            searchParams.tenantCriteria.join(","),
          );
        }

        if (searchParams.propertyType && searchParams.propertyType.length > 0) {
          queryParams.append("type", searchParams.propertyType.join(","));
        }

        const apiUrl = `${URLS.BASE}${URLS.propertyBaseUrl}/all?${queryParams.toString()}`;

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            setTabStatus(tab, "failed");
            setTabError(tab, "Request timed out. Please try again.");
            setTabSearchStatus(tab, {
              status: "failed",
              couldNotFindAProperty: true,
            });
          }
        }, 30000);

        const response = await GET_REQUEST(apiUrl);

        clearTimeout(timeoutId);

        if (!isMountedRef.current) return;

        // Check for API error response
        if (response?.error || response?.success === false) {
          const errorMessage =
            response?.message || response?.error || "Failed to fetch data";

          // Treat connectivity/CORS-like failures as network and use demo data
          const connectivityHints = [
            "Failed to fetch",
            "Unable to connect",
            "API configuration is missing",
            "Empty response",
            "Network",
            "CORS",
          ];
          const isConnectivityIssue = connectivityHints.some((h) =>
            errorMessage?.toLowerCase().includes(h.toLowerCase()),
          );

          if (isConnectivityIssue) {
            const getDemoData = (tabType: string) => {
              const baseData = [
                {
                  _id: `demo-${tabType}-1`,
                  propertyType:
                    tabType === "jv"
                      ? "Land Development"
                      : tabType === "shortlet"
                        ? "Apartment"
                        : "Duplex",
                  price:
                    tabType === "jv"
                      ? 50000000
                      : tabType === "shortlet"
                        ? 25000
                        : 25000000,
                  shortletDuration: tabType === "shortlet" ? "Daily" : undefined,
                  investmentAmount: tabType === "jv" ? 50000000 : undefined,
                  expectedROI: tabType === "jv" ? "20-25%" : undefined,
                  investmentType: tabType === "jv" ? "Joint Venture" : undefined,
                  noOfBedrooms: tabType === "jv" ? 0 : 4,
                  location: {
                    state: "Lagos",
                    localGovernment: "Lekki",
                    area: "Victoria Island",
                  },
                  images: [],
                  isPremium: true,
                  docOnProperty:
                    tabType === "shortlet"
                      ? []
                      : ["Certificate of Occupancy", "Survey Plan"],
                },
                {
                  _id: `demo-${tabType}-2`,
                  propertyType:
                    tabType === "jv"
                      ? "Commercial"
                      : tabType === "shortlet"
                        ? "Studio"
                        : "Apartment",
                  price:
                    tabType === "jv"
                      ? 30000000
                      : tabType === "shortlet"
                        ? 15000
                        : 15000000,
                  shortletDuration: tabType === "shortlet" ? "Weekly" : undefined,
                  investmentAmount: tabType === "jv" ? 30000000 : undefined,
                  expectedROI: tabType === "jv" ? "15-20%" : undefined,
                  investmentType: tabType === "jv" ? "Joint Venture" : undefined,
                  noOfBedrooms: tabType === "jv" ? 0 : 3,
                  location: {
                    state: "Lagos",
                    localGovernment: "Ikeja",
                    area: "Allen Avenue",
                  },
                  images: [],
                  isPremium: false,
                  docOnProperty:
                    tabType === "shortlet" ? [] : ["Deed of Assignment"],
                },
              ];
              return baseData;
            };

            const demoData: any[] = [];
            setTabProperties(tab, demoData);
            setTabPagination(tab, 1, demoData.length);
            setTabPage(tab, 1);
            setTabSearchStatus(tab, {
              status: "success",
              couldNotFindAProperty: false,
            });
            setTabStatus(tab, "success");
            return;
          }

          setTabError(tab, errorMessage);
          setTabStatus(tab, "failed");
          setTabSearchStatus(tab, {
            status: "failed",
            couldNotFindAProperty: true,
          });
          return;
        }

        // Handle successful response
        const responseData = response?.data || [];
        const pagination = response?.pagination || {};

        // Update all states at once to avoid multiple re-renders
        updateTabState(tab, (state) => ({
          ...state,
          properties: responseData,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.total || responseData.length,
          currentPage: pagination.currentPage || searchParams.page || state.currentPage,
          formikStatus: "success" as const,
          errMessage: "",
          searchStatus: {
            status: "success" as const,
            couldNotFindAProperty: responseData.length === 0,
          },
        }));
      } catch (err: any) {
        console.error(
          `${tab} tab search error (attempt ${retryCount + 1}):`,
          err,
        );

        if (!isMountedRef.current) return;

        // Retry logic for network errors
        if (
          retryCount < maxRetries &&
          (err.message?.includes("Failed to fetch") ||
            err.message?.includes("Network error") ||
            err.name === "TypeError")
        ) {
          console.log(
            `Retrying ${tab} tab request... (${retryCount + 1}/${maxRetries})`,
          );
          setTimeout(
            () => {
              if (isMountedRef.current) {
                searchTabProperties(tab, searchParams, retryCount + 1);
              }
            },
            1000 * (retryCount + 1),
          );
          return;
        }

        // If all retries failed due to network issues, use demo data
        if (
          err.message?.includes("Failed to fetch") ||
          err.name === "TypeError"
        ) {
          console.log(
            `Using demo data for ${tab} tab due to network connectivity issues`,
          );

          // Demo data based on tab type
          const getDemoData = (tabType: string) => {
            const baseData = [
              {
                _id: `demo-${tabType}-1`,
                propertyType:
                  tabType === "jv"
                    ? "Land Development"
                    : tabType === "shortlet"
                      ? "Apartment"
                      : "Duplex",
                price:
                  tabType === "jv"
                    ? 50000000
                    : tabType === "shortlet"
                      ? 25000
                      : 25000000,
                shortletDuration: tabType === "shortlet" ? "Daily" : undefined,
                investmentAmount: tabType === "jv" ? 50000000 : undefined,
                expectedROI: tabType === "jv" ? "20-25%" : undefined,
                investmentType: tabType === "jv" ? "Joint Venture" : undefined,
                noOfBedrooms: tabType === "jv" ? 0 : 4,
                location: {
                  state: "Lagos",
                  localGovernment: "Lekki",
                  area: "Victoria Island",
                },
                images: [],
                isPremium: true,
                docOnProperty:
                  tabType === "shortlet"
                    ? []
                    : ["Certificate of Occupancy", "Survey Plan"],
              },
              {
                _id: `demo-${tabType}-2`,
                propertyType:
                  tabType === "jv"
                    ? "Commercial"
                    : tabType === "shortlet"
                      ? "Studio"
                      : "Apartment",
                price:
                  tabType === "jv"
                    ? 30000000
                    : tabType === "shortlet"
                      ? 15000
                      : 15000000,
                shortletDuration: tabType === "shortlet" ? "Weekly" : undefined,
                investmentAmount: tabType === "jv" ? 30000000 : undefined,
                expectedROI: tabType === "jv" ? "15-20%" : undefined,
                investmentType: tabType === "jv" ? "Joint Venture" : undefined,
                noOfBedrooms: tabType === "jv" ? 0 : 3,
                location: {
                  state: "Lagos",
                  localGovernment: "Ikeja",
                  area: "Allen Avenue",
                },
                images: [],
                isPremium: false,
                docOnProperty:
                  tabType === "shortlet" ? [] : ["Deed of Assignment"],
              },
            ];
            return baseData;
          };

          const demoData: any[] = [];
          setTabProperties(tab, demoData);
          setTabPagination(tab, 1, demoData.length);
          setTabPage(tab, 1);
          setTabSearchStatus(tab, {
            status: "success",
            couldNotFindAProperty: false,
          });
          setTabStatus(tab, "success");

          return;
        }

        let errorMessage = `An error occurred while searching ${tab} properties`;

        if (err.name === "AbortError") {
          errorMessage =
            "Request timed out. Please check your connection and try again.";
        } else if (err.message?.includes("Failed to fetch")) {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setTabError(tab, errorMessage);
        setTabStatus(tab, "failed");
        setTabSearchStatus(tab, {
          status: "failed",
          couldNotFindAProperty: true,
        });
      }
    },
    [
      isMountedRef,
      getCurrentTabState,
      itemsPerPage,
      setTabStatus,
      setTabError,
      setTabSearchStatus,
      setTabProperties,
      setTabPagination,
      setTabPage,
    ],
  );

  // Simple data fetching for initial load
  const fetchTabData = useCallback(
    async (
      tab: "buy" | "jv" | "rent" | "shortlet",
      searchParams?: SearchParams,
    ) => {
      if (!isMountedRef.current) {
        console.log(`fetchTabData: Component unmounted, aborting for ${tab}`);
        return;
      }

      // Map tab to correct briefType for API
      const briefTypeMapping = {
        buy: "Outright Sales",
        jv: "Joint Venture",
        rent: "Rent",
        shortlet: "Shortlet",
      };
      const defaultSearchParams: SearchParams = {
        briefType: briefTypeMapping[tab as keyof typeof briefTypeMapping],
        page: 1,
        limit: itemsPerPage,
        ...searchParams,
      };

      await searchTabProperties(tab, defaultSearchParams);
    },
    [searchTabProperties, itemsPerPage],
  );

  // Disable auto-fetch to avoid complexity - let components handle their own fetching
  // useEffect(() => {
  //   console.log(`Auto-fetch effect for tab: ${activeTab}`);

  //   const currentState = activeTab === "buy" ? buyTab :
  //                       activeTab === "jv" ? jvTab :
  //                       activeTab === "rent" ? rentTab : shortletTab;

  //   if (currentState.formikStatus === "idle" && currentState.properties.length === 0) {
  //     fetchTabData(activeTab);
  //   }
  // }, [activeTab, fetchTabData]);

  // Reset all tabs
  const resetAllTabs = useCallback(() => {
    setBuyTab(createInitialTabState());
    setJvTab(createInitialTabState());
    setRentTab(createInitialTabState());
    setShortletTab(createInitialTabState());
  }, []);

  const contextValue: NewMarketplaceContextType = useMemo(
    () => ({
      // Active tab management
      activeTab,
      setActiveTab,

      // Tab states
      buyTab,
      jvTab,
      rentTab,
      shortletTab,

      // Current tab state
      getCurrentTabState,

      // Properties management
      setTabProperties,

      // Status management
      setTabStatus,
      setTabError,
      setTabSearchStatus,

      // Filter management
      setTabFilter,
      clearTabFilters,

      // Pagination
      setTabPage,
      setTabPagination,

      // Data fetching
      fetchTabData,
      searchTabProperties,

      // Note: Add for inspection modal removed

      // Inspection and negotiation methods (placeholder implementations)
      setIsAddForInspectionOpen: () => {},
      removeFromInspection: () => {},
      clearInspectionSelection: () => {},
      removeNegotiatedPrice: () => {},
      removeLOIDocument: () => {},

      // Items per page
      itemsPerPage,
      setItemsPerPage,

      // Reset
      resetAllTabs,
    }),
    [
      activeTab,
      setActiveTab,
      buyTab,
      jvTab,
      rentTab,
      shortletTab,
      getCurrentTabState,
      setTabProperties,
      setTabStatus,
      setTabError,
      setTabSearchStatus,
      setTabFilter,
      clearTabFilters,
      setTabPage,
      setTabPagination,
      fetchTabData,
      searchTabProperties,
      itemsPerPage,
      setItemsPerPage,
      resetAllTabs,
    ],
  );

  return (
    <NewMarketplaceContext.Provider value={contextValue}>
      {children}
    </NewMarketplaceContext.Provider>
  );
};

export const useNewMarketplace = (): NewMarketplaceContextType => {
  const context = useContext(NewMarketplaceContext);
  if (!context) {
    throw new Error(
      "useNewMarketplace must be used within a NewMarketplaceProvider",
    );
  }
  return context;
};
