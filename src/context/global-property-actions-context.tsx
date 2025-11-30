/** @format */

"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import toast from "react-hot-toast";

// Types
interface InspectionProperty {
  propertyId: string;
  property: any;
  sourceTab?: "buy" | "jv" | "rent" | "shortlet";
  sourcePage?: string;
  sourceMeta?: {
    matchedId?: string;
    preferenceId?: string;
  };
}

interface NegotiatedPrice {
  propertyId: string;
  originalPrice: number;
  negotiatedPrice: number;
}

interface LOIDocument {
  propertyId: string;
  document: File | null;
  documentUrl?: string;
}

interface GlobalPropertyActionsContextType {
  // Inspection selection (max 2 properties)
  selectedForInspection: InspectionProperty[];
  toggleInspectionSelection: (
    property: any,
    sourceTab?: "buy" | "jv" | "rent" | "shortlet",
    sourcePage?: string,
    sourceMeta?: { matchedId?: string; preferenceId?: string }
  ) => void;
  removeFromInspection: (propertyId: string) => void;
  clearInspectionSelection: () => void;
  isSelectedForInspection: (propertyId: string) => boolean;
  canSelectMoreForInspection: () => boolean;

  // Price negotiation
  negotiatedPrices: NegotiatedPrice[];
  addNegotiatedPrice: (
    propertyId: string,
    originalPrice: number,
    negotiatedPrice: number
  ) => void;
  removeNegotiatedPrice: (propertyId: string) => void;
  getNegotiatedPrice: (propertyId: string) => NegotiatedPrice | null;

  // LOI documents
  loiDocuments: LOIDocument[];
  addLOIDocument: (
    propertyId: string,
    document: File,
    documentUrl?: string
  ) => void;
  removeLOIDocument: (propertyId: string) => void;
  getLOIDocument: (propertyId: string) => LOIDocument | null;

  // Computed values
  hasSelectedProperties: boolean;
  selectedCount: number;
}

const GlobalPropertyActionsContext = createContext<
  GlobalPropertyActionsContextType | undefined
>(undefined);

const STORAGE_KEY = "globalPropertyActionsState";

interface StorageState {
  selectedForInspection: InspectionProperty[];
  negotiatedPrices: NegotiatedPrice[];
  loiDocuments: LOIDocument[];
}

export const GlobalPropertyActionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedForInspection, setSelectedForInspection] = useState<
    InspectionProperty[]
  >([]);
  const [negotiatedPrices, setNegotiatedPrices] = useState<NegotiatedPrice[]>(
    []
  );
  const [loiDocuments, setLoiDocuments] = useState<LOIDocument[]>([]);

  // Load state from localStorage on mount only
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState && savedState.trim()) {
        const parsedState: StorageState = JSON.parse(savedState);
        if (parsedState && typeof parsedState === "object") {
          setSelectedForInspection(
            Array.isArray(parsedState.selectedForInspection)
              ? parsedState.selectedForInspection
              : []
          );
          setNegotiatedPrices(
            Array.isArray(parsedState.negotiatedPrices)
              ? parsedState.negotiatedPrices
              : []
          );
          setLoiDocuments(
            Array.isArray(parsedState.loiDocuments)
              ? parsedState.loiDocuments
              : []
          );
        }
      }
    } catch (error) {
      console.error("Failed to parse global property actions state:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save to localStorage function
  const saveToStorage = useCallback(() => {
    try {
      const state: StorageState = {
        selectedForInspection,
        negotiatedPrices,
        loiDocuments,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save global property actions state:", error);
    }
  }, [selectedForInspection, negotiatedPrices, loiDocuments]);

  // Save to storage whenever state changes
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // Inspection selection methods
  const toggleInspectionSelection = useCallback(
    (
      property: any,
      sourceTab?: "buy" | "jv" | "rent" | "shortlet",
      sourcePage?: string,
      sourceMeta?: { matchedId?: string; preferenceId?: string }
    ) => {
      const propertyId = property._id;

      setSelectedForInspection((current) => {
        const isAlreadySelected = current.some(
          (item) => item.propertyId === propertyId
        );

        if (isAlreadySelected) {
          // Clear associated price negotiation and LOI document when removing from inspection
          setNegotiatedPrices((prices) =>
            prices.filter((price) => price.propertyId !== propertyId)
          );
          setLoiDocuments((docs) =>
            docs.filter((doc) => doc.propertyId !== propertyId)
          );

          setTimeout(() => toast.success("Property removed from inspection"), 0);
          return current.filter((item) => item.propertyId !== propertyId);
        } else {
          if (current.length >= 2) {
            setTimeout(() => toast.error("Maximum of 2 properties can be selected for inspection"), 0);
            return current;
          }

          setTimeout(() => toast.success("Property selected for inspection"), 0);
          return [
            ...current,
            { propertyId, property, sourceTab, sourcePage, sourceMeta },
          ];
        }
      });
    },
    []
  );

  const removeFromInspection = useCallback((propertyId: string) => {
    setSelectedForInspection((current) =>
      current.filter((item) => item.propertyId !== propertyId)
    );
    setNegotiatedPrices((current) =>
      current.filter((price) => price.propertyId !== propertyId)
    );
    setLoiDocuments((current) =>
      current.filter((doc) => doc.propertyId !== propertyId)
    );
  }, []);

  const clearInspectionSelection = useCallback(() => {
    setSelectedForInspection([]);
    setNegotiatedPrices([]);
    setLoiDocuments([]);
  }, []);

  const isSelectedForInspection = useCallback(
    (propertyId: string): boolean => {
      return selectedForInspection.some(
        (item) => item.propertyId === propertyId
      );
    },
    [selectedForInspection]
  );

  const canSelectMoreForInspection = useCallback((): boolean => {
    return selectedForInspection.length < 2;
  }, [selectedForInspection.length]);

  // Price negotiation methods
  const addNegotiatedPrice = useCallback(
    (propertyId: string, originalPrice: number, negotiatedPrice: number) => {
      setNegotiatedPrices((current) => {
        const existingIndex = current.findIndex(
          (p) => p.propertyId === propertyId
        );

        if (existingIndex >= 0) {
          const newPrices = [...current];
          newPrices[existingIndex] = {
            propertyId,
            originalPrice,
            negotiatedPrice,
          };
          return newPrices;
        } else {
          return [
            ...current,
            { propertyId, originalPrice, negotiatedPrice },
          ];
        }
      });
    },
    []
  );

  const removeNegotiatedPrice = useCallback((propertyId: string) => {
    setNegotiatedPrices((current) =>
      current.filter((p) => p.propertyId !== propertyId)
    );
  }, []);

  const getNegotiatedPrice = useCallback(
    (propertyId: string): NegotiatedPrice | null => {
      return (
        negotiatedPrices.find((p) => p.propertyId === propertyId) || null
      );
    },
    [negotiatedPrices]
  );

  // LOI document methods
  const addLOIDocument = useCallback(
    (propertyId: string, document: File, documentUrl?: string) => {
      setLoiDocuments((current) => {
        const existingIndex = current.findIndex(
          (doc) => doc.propertyId === propertyId
        );

        if (existingIndex >= 0) {
          const newDocuments = [...current];
          newDocuments[existingIndex] = { propertyId, document, documentUrl };
          return newDocuments;
        } else {
          return [
            ...current,
            { propertyId, document, documentUrl },
          ];
        }
      });
    },
    []
  );

  const removeLOIDocument = useCallback((propertyId: string) => {
    setLoiDocuments((current) =>
      current.filter((doc) => doc.propertyId !== propertyId)
    );
  }, []);

  const getLOIDocument = useCallback(
    (propertyId: string): LOIDocument | null => {
      return loiDocuments.find((doc) => doc.propertyId === propertyId) || null;
    },
    [loiDocuments]
  );

  const contextValue: GlobalPropertyActionsContextType = useMemo(
    () => ({
      // Inspection selection
      selectedForInspection,
      toggleInspectionSelection,
      removeFromInspection,
      clearInspectionSelection,
      isSelectedForInspection,
      canSelectMoreForInspection,

      // Price negotiation
      negotiatedPrices,
      addNegotiatedPrice,
      removeNegotiatedPrice,
      getNegotiatedPrice,

      // LOI documents
      loiDocuments,
      addLOIDocument,
      removeLOIDocument,
      getLOIDocument,

      // Computed values
      hasSelectedProperties: selectedForInspection.length > 0,
      selectedCount: selectedForInspection.length,
    }),
    [
      selectedForInspection,
      toggleInspectionSelection,
      removeFromInspection,
      clearInspectionSelection,
      isSelectedForInspection,
      canSelectMoreForInspection,
      negotiatedPrices,
      addNegotiatedPrice,
      removeNegotiatedPrice,
      getNegotiatedPrice,
      loiDocuments,
      addLOIDocument,
      removeLOIDocument,
      getLOIDocument,
    ]
  );

  return (
    <GlobalPropertyActionsContext.Provider value={contextValue}>
      {children}
    </GlobalPropertyActionsContext.Provider>
  );
};

export const useGlobalPropertyActions = (): GlobalPropertyActionsContextType => {
  const context = useContext(GlobalPropertyActionsContext);
  if (!context) {
    throw new Error(
      "useGlobalPropertyActions must be used within a GlobalPropertyActionsProvider"
    );
  }
  return context;
};
