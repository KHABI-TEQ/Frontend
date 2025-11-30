/** @format */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { GET_REQUEST, POST_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { ApiResponse } from "@/types/api.types";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import type {
  InspectionDetails,
  InspectionDetailsResponse,
  AccessValidationResponse,
  InspectionType,
  InspectionStage,
  PendingResponseFrom,
  NegotiationPayload,
  UploadResponse,
} from "@/types/secure-negotiation";
import { ApiSuccessResponse } from "@/types/api-responses";

// Enhanced Types for Secure Negotiations
type InspectionStatus =
  | "accept"
  | "reject"
  | "countered"
  | "pending"
  | "expired";
type InspectionDateStatus =
  | "none"
  | "available"
  | "unavailable"
  | "countered"
  | "confirmed";
type LoadingType =
  | "submitting"
  | "accepting"
  | "rejecting"
  | "countering"
  | "loading";

interface SecureNegotiationState {
  // Security & Identity
  userId: string | null;
  inspectionId: string | null;
  isValidAccess: boolean;
  accessToken: string | null;

  // Data states
  formStatus: "idle" | "success" | "failed" | "pending";
  details: InspectionDetails | null;
  inspectionType: InspectionType | null;
  stage: InspectionStage | null;
  pendingResponseFrom: PendingResponseFrom | null;
  createdAt: string | null;
  inspectionStatus: InspectionStatus | null;
  currentUserId: string | null;
  currentUserType: "seller" | "buyer" | null;
  negotiationType?: "price" | "LOI" | null;

  // Interactive Features
  isExpired: boolean;

  // Loading states
  loadingStates: {
    submitting: boolean;
    accepting: boolean;
    rejecting: boolean;
    countering: boolean;
    loading: boolean;
  };
}

type SecureNegotiationAction =
  // Security Actions
  | {
      type: "SET_ACCESS_CREDENTIALS";
      payload: { userId: string; inspectionId: string; accessToken?: string };
    }
  | { type: "VALIDATE_ACCESS"; payload: { isValid: boolean } }

  // Data Actions
  | {
      type: "SET_FORM_STATUS";
      payload: "idle" | "success" | "failed" | "pending";
    }
  | { type: "SET_DETAILS"; payload: InspectionDetails }
  | { type: "SET_INSPECTION_TYPE"; payload: InspectionType }
  | { type: "SET_STAGE"; payload: InspectionStage }
  | { type: "SET_PENDING_RESPONSE_FROM"; payload: PendingResponseFrom }
  | { type: "SET_CREATED_AT"; payload: string }
  | { type: "SET_INSPECTION_STATUS"; payload: InspectionStatus }
  | {
      type: "SET_CURRENT_USER";
      payload: { userId: string; userType: "seller" | "buyer" };
    }

  // Interactive Actions
  | { type: "SET_EXPIRED_STATUS"; payload: boolean }

  // Loading Actions
  | {
      type: "SET_LOADING";
      payload: {
        type: keyof SecureNegotiationState["loadingStates"];
        isLoading: boolean;
      };
    };

const initialState: SecureNegotiationState = {
  // Security & Identity
  userId: null,
  inspectionId: null,
  isValidAccess: false,
  accessToken: null,

  // Data states
  formStatus: "idle",
  details: null,
  inspectionType: null,
  stage: null,
  pendingResponseFrom: null,
  createdAt: null,
  inspectionStatus: null,
  currentUserId: null,
  currentUserType: null,
  negotiationType: null,

  // Interactive Features
  isExpired: false,

  // Loading states
  loadingStates: {
    submitting: false,
    accepting: false,
    rejecting: false,
    countering: false,
    loading: false,
  },
};

function secureNegotiationReducer(
  state: SecureNegotiationState,
  action: SecureNegotiationAction,
): SecureNegotiationState {
  switch (action.type) {
    case "SET_ACCESS_CREDENTIALS":
      return {
        ...state,
        userId: action.payload.userId,
        inspectionId: action.payload.inspectionId,
        accessToken: action.payload.accessToken || null,
      };

    case "VALIDATE_ACCESS":
      return {
        ...state,
        isValidAccess: action.payload.isValid,
      };

    case "SET_FORM_STATUS":
      return { ...state, formStatus: action.payload };

    case "SET_DETAILS":
      return { ...state, details: action.payload };

    case "SET_INSPECTION_TYPE":
      return { ...state, inspectionType: action.payload };

    case "SET_STAGE":
      return { ...state, stage: action.payload };

    case "SET_PENDING_RESPONSE_FROM":
      return { ...state, pendingResponseFrom: action.payload };

    case "SET_CREATED_AT":
      return { ...state, createdAt: action.payload };

    case "SET_INSPECTION_STATUS":
      return { ...state, inspectionStatus: action.payload };

    case "SET_CURRENT_USER":
      return {
        ...state,
        currentUserId: action.payload.userId,
        currentUserType: action.payload.userType,
      };

    case "SET_EXPIRED_STATUS":
      return { ...state, isExpired: action.payload };

    case "SET_LOADING":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.type]: action.payload.isLoading,
        },
      };

    default:
      return state;
  }
}

interface SecureNegotiationContextType {
  state: SecureNegotiationState;

  // Security Methods
  validateAccess: (userId: string, inspectionId: string) => Promise<boolean>;
  setAccessCredentials: (
    userId: string,
    inspectionId: string,
    accessToken?: string,
  ) => void;

  // Data Methods
  fetchNegotiationDetails: (
    userId: string,
    inspectionId: string,
    userType: "seller" | "buyer",
  ) => Promise<void>;
  setFormStatus: (status: "idle" | "success" | "failed" | "pending") => void;
  setInspectionStatus: (status: InspectionStatus) => void;
  setCurrentUser: (userId: string, userType: "seller" | "buyer") => void;
  refreshData: () => Promise<void>;
  setInspectionType: (type: InspectionType) => void;
  setStage: (stage: InspectionStage) => void;
  setPendingResponseFrom: (from: PendingResponseFrom) => void;
  reopenInspection: () => Promise<any>;
  canNegotiate: (userType: "seller" | "buyer") => boolean;
  isUserTurn: (userType: "seller" | "buyer") => boolean;

  // Interactive Methods
  setExpiredStatus: (isExpired: boolean) => void;

  // Loading Methods
  setLoading: (
    type: keyof SecureNegotiationState["loadingStates"],
    isLoading: boolean,
  ) => void;

  // New unified API method
  submitNegotiationAction: (
    inspectionId: string,
    userType: "seller" | "buyer",
    payload: NegotiationPayload,
  ) => Promise<any>;

  // Utility methods for creating payloads
  createAcceptPayload: (
    inspectionType: InspectionType,
    inspectionDate?: string,
    inspectionTime?: string,
    inspectionMode?: string,
  ) => NegotiationPayload;
  createRejectPayload: (
    inspectionType: InspectionType,
    reason?: string,
    inspectionDate?: string,
    inspectionTime?: string,
    inspectionMode?: string,
  ) => NegotiationPayload;
  createCounterPayload: (
    inspectionType: InspectionType,
    counterPrice?: number,
    inspectionDate?: string,
    inspectionTime?: string,
    inspectionMode?: string,
  ) => NegotiationPayload;

  // File upload method
  uploadFile: (file: File) => Promise<string>;
}

const SecureNegotiationContext = createContext<
  SecureNegotiationContextType | undefined
>(undefined);

export const SecureNegotiationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(secureNegotiationReducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Security Methods
  const validateAccess = useCallback(
    async (userId: string, inspectionId: string): Promise<boolean> => {
      try {
        const response = await GET_REQUEST(
          `${URLS.BASE + URLS.inspectionBaseUrl}/validate-access/${userId}/${inspectionId}`,
        );
        const isValid = response?.success;
        dispatch({ type: "VALIDATE_ACCESS", payload: { isValid } });
        return isValid;
      } catch (error) {
        console.error("Access validation failed:", error);
        dispatch({ type: "VALIDATE_ACCESS", payload: { isValid: false } });
        return false;
      }
    },
    [],
  );

  const setAccessCredentials = useCallback(
    (userId: string, inspectionId: string, accessToken?: string) => {
      dispatch({
        type: "SET_ACCESS_CREDENTIALS",
        payload: { userId, inspectionId, accessToken },
      });
    },
    [],
  );

  // Data Methods
  const fetchNegotiationDetails = useCallback(
    async (
      userId: string,
      inspectionId: string,
      userType: "seller" | "buyer",
    ) => {
      dispatch({
        type: "SET_LOADING",
        payload: { type: "loading", isLoading: true },
      });
      dispatch({ type: "SET_FORM_STATUS", payload: "pending" });

      try {
        const response = await GET_REQUEST(
          `${URLS.BASE + URLS.inspectionBaseUrl}/inspection-details/${userId}/${inspectionId}/${userType}`,
        ) as ApiResponse<InspectionDetails>;

        if (response?.success && response.data) {
          const details = response.data;
          dispatch({ type: "SET_DETAILS", payload: details });
          dispatch({ type: "SET_FORM_STATUS", payload: "success" });

          // Set inspection type, stage, and pending response from new API structure
          if (details?.inspectionType) {
            dispatch({
              type: "SET_INSPECTION_TYPE",
              payload: details.inspectionType,
            });
          }
          if (details?.stage) {
            dispatch({ type: "SET_STAGE", payload: details.stage });
          }
          if (details?.pendingResponseFrom) {
            dispatch({
              type: "SET_PENDING_RESPONSE_FROM",
              payload: details.pendingResponseFrom,
            });
          }

          // Set created date
          if (details?.createdAt) {
            dispatch({
              type: "SET_CREATED_AT",
              payload: details.createdAt,
            });
          }

          // Check if inspection has expired (48 hours)
          if (details?.updatedAt) {
            const updateTime = new Date(details.updatedAt).getTime();
            const now = new Date().getTime();
            const elapsed = now - updateTime;
            const fortyEightHours = 48 * 60 * 60 * 1000;
            const isExpired = elapsed > fortyEightHours;

            dispatch({ type: "SET_EXPIRED_STATUS", payload: isExpired });
          }
        } else {
          dispatch({ type: "SET_FORM_STATUS", payload: "failed" });
        }
      } catch (error) {
        console.error("Failed to fetch negotiation details:", error);
        dispatch({ type: "SET_FORM_STATUS", payload: "failed" });
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { type: "loading", isLoading: false },
        });
      }
    },
    [],
  );

  const setFormStatus = useCallback(
    (status: "idle" | "success" | "failed" | "pending") => {
      dispatch({ type: "SET_FORM_STATUS", payload: status });
    },
    [],
  );

  const setInspectionStatus = useCallback((status: InspectionStatus) => {
    dispatch({ type: "SET_INSPECTION_STATUS", payload: status });
  }, []);

  const setCurrentUser = useCallback(
    (userId: string, userType: "seller" | "buyer") => {
      dispatch({ type: "SET_CURRENT_USER", payload: { userId, userType } });
    },
    [],
  );

  const setInspectionType = useCallback((type: InspectionType) => {
    dispatch({ type: "SET_INSPECTION_TYPE", payload: type });
  }, []);

  const setStage = useCallback((stage: InspectionStage) => {
    dispatch({ type: "SET_STAGE", payload: stage });
  }, []);

  const setPendingResponseFrom = useCallback((from: PendingResponseFrom) => {
    dispatch({ type: "SET_PENDING_RESPONSE_FROM", payload: from });
  }, []);

  const refreshData = useCallback(async () => {
    if (state.userId && state.inspectionId && state.currentUserType) {
      await fetchNegotiationDetails(
        state.userId,
        state.inspectionId,
        state.currentUserType,
      );
    }
  }, [
    state.userId,
    state.inspectionId,
    state.currentUserType,
    fetchNegotiationDetails,
  ]);

  // Expiry Methods
  const setExpiredStatus = useCallback((isExpired: boolean) => {
    dispatch({ type: "SET_EXPIRED_STATUS", payload: isExpired });
  }, []);

  // Loading Methods
  const setLoading = useCallback(
    (
      type: keyof SecureNegotiationState["loadingStates"],
      isLoading: boolean,
    ) => {
      dispatch({ type: "SET_LOADING", payload: { type, isLoading } });
    },
    [],
  );

  // File upload method
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await POST_REQUEST(
      `${URLS.BASE + URLS.uploadImg}`,
      formData,
    ) as ApiResponse<{ url: string }>;

    if (response?.success && response.data) {
      return response.data.url;
    }
    throw new Error("Failed to upload file");
  }, []);

  // Payload creation utilities
  const createAcceptPayload = useCallback(
    (
      inspectionType: InspectionType,
      inspectionDate?: string,
      inspectionTime?: string,
      inspectionMode?: string,
    ): NegotiationPayload => {
      const payload: any = {
        action: "accept",
        inspectionType,
      };

      if (inspectionDate) payload.inspectionDate = inspectionDate;
      if (inspectionTime) payload.inspectionTime = inspectionTime;
      if (inspectionMode) payload.inspectionMode = inspectionMode;

      return payload;
    },
    [],
  );

  const createRejectPayload = useCallback(
    (
      inspectionType: InspectionType, 
      reason?: string,
      inspectionDate?: string,
      inspectionTime?: string,
      inspectionMode?: string,
    ): NegotiationPayload => {
      const payload: any = {
        action: "reject",
        inspectionType,
      };

      payload.rejectionReason = reason;

      if (inspectionDate) payload.inspectionDate = inspectionDate;
      if (inspectionTime) payload.inspectionTime = inspectionTime;
      if (inspectionMode) payload.inspectionMode = inspectionMode;

      return payload;
    },
    [],
  );

  const createCounterPayload = useCallback(
    (
      inspectionType: InspectionType,
      counterPrice?: number,
      inspectionDate?: string,
      inspectionTime?: string,
      inspectionMode?: string,
    ): NegotiationPayload => {
      const payload: any = {
        action: "counter",
        inspectionType,
      };

      if (inspectionType === "price" && counterPrice) {
        payload.counterPrice = counterPrice;
      }

      if (inspectionDate) payload.inspectionDate = inspectionDate;
      if (inspectionTime) payload.inspectionTime = inspectionTime;
      if (inspectionMode) payload.inspectionMode = inspectionMode;

      return payload;
    },
    [],
  );


  // Main unified negotiation action method
  const submitNegotiationAction = useCallback(
    async (
      inspectionId: string,
      userType: "seller" | "buyer",
      payload: NegotiationPayload,
    ) => {
      const loadingType =
        payload.action === "accept"
          ? "accepting"
          : payload.action === "reject"
            ? "rejecting"
            : payload.action === "counter"
              ? "countering"
              : "submitting";

      dispatch({
        type: "SET_LOADING",
        payload: { type: loadingType, isLoading: true },
      });

      try {
        // Use the new API endpoint format: /inspections/:inspectionId/actions/:userId
        const endpoint = `${URLS.BASE}/inspections/${inspectionId}/actions/${state.userId}`;

        const response = await POST_REQUEST(endpoint, {
          userType,
          ...payload,
        });

        if (response?.success) {
          // Refetch data to get updated state
          await fetchNegotiationDetails(state.userId!, inspectionId, userType);
        }

        return response;
      } catch (error) {
        console.error(
          `Failed to ${payload.action} ${payload.inspectionType}:`,
          error,
        );
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { type: loadingType, isLoading: false },
        });
      }
    },
    [state.userId, fetchNegotiationDetails],
  );

  // Helper method to determine if it's the user's turn to respond
  const isUserTurn = useCallback(
    (userType: "seller" | "buyer") => {
      return state.pendingResponseFrom === userType;
    },
    [state.pendingResponseFrom],
  );

  // Helper method to check if negotiation can proceed
  const canNegotiate = useCallback(
    (userType: "seller" | "buyer") => {
      return (
        state.pendingResponseFrom === userType &&
        !state.isExpired
      );
    },
    [state.pendingResponseFrom, state.isExpired],
  );

  // Reopen inspection method (keeping for backward compatibility)
  const reopenInspection = useCallback(async () => {
    if (state.userId && state.inspectionId && state.currentUserType) {
      try {
        const response = await PUT_REQUEST(
          `${URLS.BASE + URLS.inspectionBaseUrl}/${state.inspectionId}/reOpen`,
          {
            userType: state.currentUserType,
          },
        );

        if (response?.success) {
          // Refetch data to get updated state
          await fetchNegotiationDetails(
            state.userId,
            state.inspectionId,
            state.currentUserType,
          );
          setExpiredStatus(false);
        }

        return response;
      } catch (error) {
        console.error("Failed to reopen inspection:", error);
        throw error;
      }
    }
  }, [
    state.userId,
    state.inspectionId,
    state.currentUserType,
    fetchNegotiationDetails,
    setExpiredStatus,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      validateAccess,
      setAccessCredentials,
      fetchNegotiationDetails,
      setFormStatus,
      setInspectionStatus,
      setCurrentUser,
      refreshData,
      setExpiredStatus,
      reopenInspection,
      setLoading,
      setInspectionType,
      setStage,
      setPendingResponseFrom,
      submitNegotiationAction,
      createAcceptPayload,
      createRejectPayload,
      createCounterPayload,
      uploadFile,
      isUserTurn,
      canNegotiate,
    }),
    [
      state,
      validateAccess,
      setAccessCredentials,
      fetchNegotiationDetails,
      setFormStatus,
      setInspectionStatus,
      setCurrentUser,
      refreshData,
      setExpiredStatus,
      reopenInspection,
      setLoading,
      setInspectionType,
      setStage,
      setPendingResponseFrom,
      submitNegotiationAction,
      createAcceptPayload,
      createRejectPayload,
      createCounterPayload,
      uploadFile,
      isUserTurn,
      canNegotiate,
    ],
  );

  return (
    <SecureNegotiationContext.Provider value={contextValue}>
      {children}
    </SecureNegotiationContext.Provider>
  );
};

export const useSecureNegotiation = () => {
  const context = useContext(SecureNegotiationContext);
  if (context === undefined) {
    throw new Error(
      "useSecureNegotiation must be used within a SecureNegotiationProvider",
    );
  }
  return context;
};

export default SecureNegotiationProvider;
