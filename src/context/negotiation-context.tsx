/** @format */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { GET_REQUEST, POST_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import type { PotentialClientData, NegotiationType, DateTimeObj, ContentTracker } from '@/types/negotiation';
import { ApiSuccessResponse } from '@/types/api-responses';

// Types
type InspectionStatus = 'accept' | 'reject' | 'countered';
type InspectionDateStatus = 'none' | 'available' | 'unavailable' | 'countered';
type LoadingType = 'submitting' | 'accepting' | 'rejecting' | 'countering';

interface NegotiationState {
  // Data states
  formStatus: 'idle' | 'success' | 'failed' | 'pending';
  details: any | null;
  negotiationType: NegotiationType;
  createdAt: string | null;
  dateTimeObj: DateTimeObj;
  counterDateTimeObj: DateTimeObj;
  inspectionStatus: InspectionStatus | null;
  inspectionDateStatus: InspectionDateStatus | null;
  // NEW: Add userId and userType to state
  currentUserId: string | null;
  currentUserType: "seller" | "buyer" | null;

  // UI states
  contentTracker: ContentTracker;
  isNegotiated: boolean;

  // Modal states
  showSubmitOfferModal: boolean;
  showAcceptRejectModal: boolean;
  offerPrice: number | undefined;
  counterOffer: number | undefined;

  // Loading states
  isSubmitting: boolean;
  isAcceptingOffer: boolean;
  isRejectingOffer: boolean;
  isCountering: boolean;
  isSubmittingBasedOnStatus: boolean;

  // Error states
  error: string | null;
}

// API Payload interfaces
interface BasePayload {
  status: string;
  counterDateTimeObj: DateTimeObj;
  inspectionDateStatus: InspectionDateStatus;
  userId: string;
  userType: string;
}

interface AcceptOfferPayload extends BasePayload { }

interface RejectOfferPayload extends BasePayload {
  rejectionReason?: string;
}

interface CounterOfferPayload extends BasePayload {
  counterOffer: number;
  message?: string;
}

// Unified action type using template literals for better type safety
type NegotiationAction =
  | { type: 'SET_FORM_STATUS'; payload: NegotiationState['formStatus'] }
  | { type: 'SET_DETAILS'; payload: any }
  | { type: 'SET_NEGOTIATION_TYPE'; payload: NegotiationType }
  | { type: 'SET_CREATED_AT'; payload: string | null }
  | { type: 'SET_DATE_TIME_OBJ'; payload: DateTimeObj }
  | { type: 'SET_COUNTER_DATE_TIME_OBJ'; payload: DateTimeObj }
  | { type: 'SET_INSPECTION_STATUS'; payload: InspectionStatus | null }
  | { type: 'SET_INSPECTION_DATE_STATUS'; payload: InspectionDateStatus }
  | { type: 'SET_CONTENT_TRACKER'; payload: ContentTracker }
  | { type: 'SET_IS_NEGOTIATED'; payload: boolean }
  | { type: 'SET_SHOW_SUBMIT_OFFER_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_ACCEPT_REJECT_MODAL'; payload: boolean }
  | { type: 'SET_OFFER_PRICE'; payload: number | undefined }
  | { type: 'SET_COUNTER_OFFER'; payload: number | undefined }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_IS_ACCEPTING_OFFER'; payload: boolean }
  | { type: 'SET_IS_REJECTING_OFFER'; payload: boolean }
  | { type: 'SET_IS_COUNTERING'; payload: boolean }
  | { type: 'SET_IS_SUBMITTING_BASED_ON_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  // NEW: Actions for setting currentUserId and currentUserType
  | { type: 'SET_CURRENT_USER_ID'; payload: string | null }
  | { type: 'SET_CURRENT_USER_TYPE'; payload: "seller" | "buyer" | null }
  | { type: 'RESET_MODALS' }
  | { type: 'RESET_COUNTER_DATE_TIME' }
  | { type: 'BATCH_UPDATE'; payload: Partial<NegotiationState> };

interface NegotiationActions {
  // Modal actions
  openSubmitOfferModal: () => void;
  closeSubmitOfferModal: () => void;
  openAcceptRejectModal: () => void;
  closeAcceptRejectModal: () => void;

  // Setters
  setOfferPrice: (price: number | undefined) => void;
  setCounterOffer: (price: number | undefined) => void;
  goToNextPage: (page: ContentTracker) => void;
  setNegotiated: (negotiated: boolean) => void;
  updateDateTime: (dateTime: DateTimeObj) => void;
  setLoading: (type: LoadingType, loading: boolean) => void;
  setDetails: (details: any) => void;
  setNegotiationType: (type: NegotiationType) => void;
  setCreatedAt: (createdAt: string | null) => void;
  setDateTimeObj: (dateTime: DateTimeObj) => void;
  setCounterDateTimeObj: (dateTime: DateTimeObj) => void;
  setError: (error: string | null) => void;
  setFormStatus: (status: NegotiationState['formStatus']) => void;
  setInspectionDateStatus: (status: InspectionDateStatus) => void;
  setInspectionStatus: (status: InspectionStatus | null) => void;
  // NEW: Setters for currentUserId and currentUserType
  setCurrentUserId: (id: string | null) => void;
  setCurrentUserType: (type: "seller" | "buyer" | null) => void;

  // Reset actions
  resetCounterDateTime: () => void;
  resetToOriginalDateTime: () => void;

  // API Actions with auto-payload generation
  // Removed userId and userType from these signatures as they will now come from state
  acceptOffer: (negotiationId: string, payload?: Partial<AcceptOfferPayload>) => Promise<boolean>;
  rejectOffer: (negotiationId: string, payload?: Partial<RejectOfferPayload>) => Promise<boolean>;
  counterOffer: (negotiationId: string, payload?: Partial<CounterOfferPayload>) => Promise<boolean>;
  submitBasedOnStatus: (negotiationId: string, inspectionDateStatus?: Partial<InspectionDateStatus>, payload?: any) => Promise<boolean>;

  // Add batch update to actions
  batchUpdate: (updates: Partial<NegotiationState>) => void;
}

interface NegotiationContextType {
  state: NegotiationState;
  actions: NegotiationActions;
}

// Initial state
const initialState: NegotiationState = {
  formStatus: 'pending',
  details: null,
  negotiationType: 'NORMAL',
  createdAt: null,
  dateTimeObj: { selectedDate: '', selectedTime: '' },
  counterDateTimeObj: { selectedDate: '', selectedTime: '' },
  inspectionStatus: null,
  inspectionDateStatus: null,
  currentUserId: null, // Initial state
  currentUserType: null, // Initial state
  contentTracker: 'Negotiation',
  isNegotiated: true,
  showSubmitOfferModal: false,
  showAcceptRejectModal: false,
  offerPrice: undefined,
  counterOffer: undefined,
  isSubmitting: false,
  isAcceptingOffer: false,
  isRejectingOffer: false,
  isCountering: false,
  isSubmittingBasedOnStatus: false,
  error: null,
};

// Optimized reducer with batch updates and shallow comparison
const negotiationReducer = (state: NegotiationState, action: NegotiationAction): NegotiationState => {
  switch (action.type) {
    case 'BATCH_UPDATE': {
      // Only update if there are actual changes
      const hasChanges = Object.keys(action.payload).some(
        key => state[key as keyof NegotiationState] !== action.payload[key as keyof NegotiationState]
      );

      return hasChanges ? { ...state, ...action.payload } : state;
    }

    case 'RESET_COUNTER_DATE_TIME':
      return {
        ...state,
        counterDateTimeObj: { ...state.dateTimeObj },
        inspectionDateStatus: 'available',
      };

    case 'SET_FORM_STATUS':
    case 'SET_DETAILS':
    case 'SET_NEGOTIATION_TYPE':
    case 'SET_CREATED_AT':
    case 'SET_DATE_TIME_OBJ':
    case 'SET_COUNTER_DATE_TIME_OBJ':
    case 'SET_INSPECTION_STATUS':
    case 'SET_INSPECTION_DATE_STATUS':
    case 'SET_CONTENT_TRACKER':
    case 'SET_IS_NEGOTIATED':
    case 'SET_SHOW_SUBMIT_OFFER_MODAL':
    case 'SET_SHOW_ACCEPT_REJECT_MODAL':
    case 'SET_OFFER_PRICE':
    case 'SET_COUNTER_OFFER':
    case 'SET_IS_SUBMITTING':
    case 'SET_IS_ACCEPTING_OFFER':
    case 'SET_IS_REJECTING_OFFER':
    case 'SET_IS_COUNTERING':
    case 'SET_IS_SUBMITTING_BASED_ON_STATUS':
    case 'SET_ERROR':
    // NEW: Handle setting userId and userType
    case 'SET_CURRENT_USER_ID':
    case 'SET_CURRENT_USER_TYPE':
    {
      const key = action.type.replace('SET_', '').toLowerCase().replace(/_(.)/g, (_, char) => char.toUpperCase()) as keyof NegotiationState;

      // Prevent unnecessary updates if value hasn't changed
      if (state[key] === action.payload) {
        return state;
      }

      return { ...state, [key]: action.payload };
    }

    case 'RESET_MODALS':
      return {
        ...state,
        showSubmitOfferModal: false,
        showAcceptRejectModal: false,
        offerPrice: undefined,
        counterOffer: undefined,
        isSubmitting: false,
        isAcceptingOffer: false,
        isRejectingOffer: false,
        isCountering: false,
        isSubmittingBasedOnStatus: false,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const NegotiationContext = createContext<NegotiationContextType | undefined>(undefined);

// Provider component with memoized actions
export const NegotiationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(negotiationReducer, initialState);

  // Helper function for API requests - memoized with useCallback
  const makeApiRequest = useCallback(async <T extends ApiSuccessResponse> (
    url: string,
    method: 'PUT' | 'POST',
    payload: any,
    loadingType: LoadingType,
    successMessage?: string
  ): Promise<T | null> => { // Changed return type from Promise<boolean> to Promise<T | null>
    dispatch({ type: `SET_IS_${loadingType.toUpperCase()}` as any, payload: true });
    dispatch({ type: 'SET_IS_SUBMITTING_BASED_ON_STATUS' as any, payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const requestFn = method === 'PUT' ? PUT_REQUEST : POST_REQUEST;
      const response = await requestFn(url, payload, Cookies.get("token"));

      if (response.success) {
        // Use batch update for better performance
        const updatedDetails = { ...state.details, ...getUpdatedDetailsFromPayload(payload, loadingType) };

        dispatch({
          type: 'BATCH_UPDATE',
          payload: {
            details: updatedDetails,
            showSubmitOfferModal: false,
            showAcceptRejectModal: false,
            offerPrice: undefined,
            counterOffer: undefined,
            isSubmitting: false,
            isAcceptingOffer: false,
            isRejectingOffer: false,
            isCountering: false,
            error: null,
          }
        });

        return response.data as T; // Return the actual response data
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || `Failed to ${loadingType.replace('ing', '')} offer` });
        return null; // Return null instead of false
      }
    } catch (error) {
      console.error(`Error ${loadingType} offer:`, error);
      dispatch({ type: 'SET_ERROR', payload: `An error occurred while ${loadingType} the offer` });
      return null; // Return null instead of false
    } finally {
      dispatch({ type: 'SET_IS_SUBMITTING_BASED_ON_STATUS', payload: false });
      dispatch({ type: `SET_IS_${loadingType.toUpperCase()}` as any, payload: false });
    }
  }, [state.details]); // Only depend on state.details

  // Helper to get updated details from payload - memoized
  const getUpdatedDetailsFromPayload = useCallback((payload: any, loadingType: LoadingType) => {
    const baseUpdate = { negotiationStatus: payload.status };

    switch (loadingType) {
      case 'accepting':
        return { ...baseUpdate, acceptedDateTime: payload.counterDateTimeObj };
      case 'rejecting':
        return { ...baseUpdate, rejectionReason: payload.rejectionReason, rejectedDateTime: payload.counterDateTimeObj };
      case 'countering':
        return { ...baseUpdate, currentCounterOffer: payload.counterOffer, counterMessage: payload.message, counterDateTime: payload.counterDateTimeObj };
      default:
        return baseUpdate;
    }
  }, []);

  // Auto-generate payload helper - memoized
  const generatePayload = useCallback(<T extends BasePayload>(
    baseStatus: string,
    userPayload: Partial<T> = {},
    additionalDefaults: Partial<T> = {}
  ): T => ({
    status: baseStatus,
    counterDateTimeObj: state.counterDateTimeObj,
    inspectionDateStatus: userPayload.inspectionDateStatus ?? state.inspectionDateStatus,
    userId: state.currentUserId || '', // Get from state
    userType: state.currentUserType || '', // Get from state
    ...additionalDefaults,
    ...userPayload,
  } as T), [state.counterDateTimeObj, state.inspectionDateStatus, state.currentUserId, state.currentUserType]); // Add dependencies

  // Stable action creators using useCallback for individual functions
  const batchUpdate = useCallback((updates: Partial<NegotiationState>) => {
    dispatch({ type: 'BATCH_UPDATE', payload: updates });
  }, []);

  const setFormStatus = useCallback((payload: NegotiationState['formStatus']) => {
    dispatch({ type: 'SET_FORM_STATUS', payload });
  }, []);

  const setDetails = useCallback((payload: any) => {
    dispatch({ type: 'SET_DETAILS', payload });
  }, []);

  const setNegotiationType = useCallback((payload: NegotiationType) => {
    dispatch({ type: 'SET_NEGOTIATION_TYPE', payload });
  }, []);

  const setCreatedAt = useCallback((payload: string | null) => {
    dispatch({ type: 'SET_CREATED_AT', payload });
  }, []);

  const setDateTimeObj = useCallback((payload: DateTimeObj) => {
    dispatch({ type: 'SET_DATE_TIME_OBJ', payload });
  }, []);

  const setCounterDateTimeObj = useCallback((payload: DateTimeObj) => {
    dispatch({ type: 'SET_COUNTER_DATE_TIME_OBJ', payload });
  }, []);

  const setError = useCallback((payload: string | null) => {
    dispatch({ type: 'SET_ERROR', payload });
  }, []);

  const setInspectionStatus = useCallback((payload: InspectionStatus | null) => {
    dispatch({ type: 'SET_INSPECTION_STATUS', payload });
  }, []);

  const setInspectionDateStatus = useCallback((payload: InspectionDateStatus) => {
    dispatch({ type: 'SET_INSPECTION_DATE_STATUS', payload });
  }, []);

  // NEW: Callbacks for setting userId and userType
  const setCurrentUserId = useCallback((payload: string | null) => {
    dispatch({ type: 'SET_CURRENT_USER_ID', payload });
  }, []);

  const setCurrentUserType = useCallback((payload: "seller" | "buyer" | null) => {
    dispatch({ type: 'SET_CURRENT_USER_TYPE', payload });
  }, []);

  const goToNextPage = useCallback((payload: ContentTracker) => {
    dispatch({ type: 'SET_CONTENT_TRACKER', payload });
  }, []);

  // Reset actions
  const resetCounterDateTime = useCallback(() => {
    dispatch({ type: 'RESET_COUNTER_DATE_TIME' });
  }, []);

  const resetToOriginalDateTime = useCallback(() => {
    dispatch({ type: 'RESET_COUNTER_DATE_TIME' });
  }, []);

  // Create stable actions object using useMemo with individual stable functions
  const actions = useMemo((): NegotiationActions => ({
    // Modal actions
    openSubmitOfferModal: () => dispatch({ type: 'SET_SHOW_SUBMIT_OFFER_MODAL', payload: true }),
    closeSubmitOfferModal: () => dispatch({ type: 'SET_SHOW_SUBMIT_OFFER_MODAL', payload: false }),
    openAcceptRejectModal: () => dispatch({ type: 'SET_SHOW_ACCEPT_REJECT_MODAL', payload: true }),
    closeAcceptRejectModal: () => dispatch({ type: 'SET_SHOW_ACCEPT_REJECT_MODAL', payload: false }),

    // Setters - use stable callbacks
    setOfferPrice: (payload: number | undefined) => dispatch({ type: 'SET_OFFER_PRICE', payload }),
    setCounterOffer: (payload: number | undefined) => dispatch({ type: 'SET_COUNTER_OFFER', payload }),
    goToNextPage,
    setNegotiated: (payload: boolean) => dispatch({ type: 'SET_IS_NEGOTIATED', payload }),
    updateDateTime: (payload: DateTimeObj) => dispatch({ type: 'SET_DATE_TIME_OBJ', payload }),
    setDetails,
    setNegotiationType,
    setCreatedAt,
    setDateTimeObj,
    setCounterDateTimeObj,
    setError,
    setFormStatus,
    setInspectionStatus,
    setInspectionDateStatus,
    setCurrentUserId, // Exposed action
    setCurrentUserType, // Exposed action

    setLoading: (type: LoadingType, loading: boolean) => {
      const actionType = `SET_IS_${type.toUpperCase()}` as any;
      dispatch({ type: actionType, payload: loading });
    },

    // Reset actions
    resetCounterDateTime,
    resetToOriginalDateTime,

    // Add batch update action
    batchUpdate,

    // API Actions with auto-payload generation - userId and userType are now sourced from state
    acceptOffer: async (negotiationId: string, userPayload: Partial<AcceptOfferPayload> = {}): Promise<boolean> => {
      // Check if currentUserId and currentUserType are set
      if (!state.currentUserId || !state.currentUserType) {
        dispatch({ type: 'SET_ERROR', payload: 'User ID and User Type are not set for the negotiation context.' });
        return false;
      }
      const payload = generatePayload<AcceptOfferPayload>('accepted', userPayload);
      const responseData = await makeApiRequest<ApiSuccessResponse>(
        `${URLS.BASE + URLS.getOneInspection}/${negotiationId}/accept-offer`,
        'PUT',
        payload,
        'accepting'
      );

      if (responseData && responseData.inspectionData && responseData.inspectionData.status) {
        actions.setDetails({
          ...state.details, // Spread existing details
          negotiationStatus: responseData.inspectionData.status,
          pendingResponseFrom: responseData.inspectionData.pendingResponseFrom
        });

        return true;
      }

      return false;
    },

    rejectOffer: async (negotiationId: string, userPayload: Partial<RejectOfferPayload> = {}): Promise<boolean> => {
      // Check if currentUserId and currentUserType are set
      if (!state.currentUserId || !state.currentUserType) {
        dispatch({ type: 'SET_ERROR', payload: 'User ID and User Type are not set for the negotiation context.' });
        return false;
      }
      const payload = generatePayload<RejectOfferPayload>('rejected', userPayload);
      const responseData = await makeApiRequest<ApiSuccessResponse>(
        `${URLS.BASE + URLS.getOneInspection}/${negotiationId}/reject-offer`,
        'PUT',
        payload,
        'rejecting'
      );

      // Check if responseData is valid and contains the status
      if (responseData && responseData.inspectionData && responseData.inspectionData.status) {
        actions.setDetails({
          ...state.details, // Spread existing details
          negotiationStatus: responseData.inspectionData.status,
          pendingResponseFrom: responseData.inspectionData.pendingResponseFrom
        });

        return true;
      }

      return false;

    },

    counterOffer: async (negotiationId: string, userPayload: Partial<CounterOfferPayload> = {}): Promise<boolean> => {
      // Check if currentUserId and currentUserType are set
      if (!state.currentUserId || !state.currentUserType) {
        dispatch({ type: 'SET_ERROR', payload: 'User ID and User Type are not set for the negotiation context.' });
        return false;
      }
      const payload = generatePayload<CounterOfferPayload>(
        'countered',
        userPayload,
        { counterOffer: state.counterOffer || 0 }
      );

      if (!payload.counterOffer) {
        dispatch({ type: 'SET_ERROR', payload: 'Counter offer amount is required' });
        return false;
      }

      const responseData = await makeApiRequest<ApiSuccessResponse>(
        `${URLS.BASE + URLS.getOneInspection}/${negotiationId}/counter-offer`,
        'POST',
        payload,
        'countering'
      );

      if (responseData && responseData.inspectionData && responseData.inspectionData.status) {
        actions.setDetails({
          ...state.details, // Spread existing details
          negotiationStatus: responseData.inspectionData.status,
          pendingResponseFrom: responseData.inspectionData.pendingResponseFrom
        });

        return true;
      }

      return false;
    },

    // Automatic API submission based on inspection status
    submitBasedOnStatus: async (
      negotiationId: string,
      passedInspectionDateStatus?: InspectionDateStatus, // Accept as optional third argument
      userPayload: any = {}, // Keep this as the second argument
    ): Promise<boolean> => {

      console.log(state.inspectionStatus, "my inspection status");

      if (!state.inspectionStatus) {
        dispatch({ type: 'SET_ERROR', payload: 'No inspection status selected' });
        return false;
      }
      if (!state.currentUserId || !state.currentUserType) {
        dispatch({ type: 'SET_ERROR', payload: 'User ID and User Type are not set for the negotiation context.' });
        return false;
      }

      // Determine the inspectionDateStatus to use for the payload
      // Prioritize the passed argument, then fall back to the state value.
      const statusForPayload = passedInspectionDateStatus ?? state.inspectionDateStatus;

      // Ensure that a status is actually available to be sent
      if (!statusForPayload) {
          dispatch({ type: 'SET_ERROR', payload: 'Inspection Date Status is required for submission.' });
          return false;
      }

      // Pass inspectionDateStatus directly in the userPayload or as an override
      // to ensure it's used by generatePayload.
      const payloadWithInspectionDateStatus = {
        ...userPayload,
        inspectionDateStatus: statusForPayload // <--- Use the determined status
      };

      const statusMap = {
        accept: () => actions.acceptOffer(negotiationId, payloadWithInspectionDateStatus),
        reject: () => actions.rejectOffer(negotiationId, payloadWithInspectionDateStatus),
        countered: () => actions.counterOffer(negotiationId, payloadWithInspectionDateStatus),
      };

      // Ensure state.inspectionStatus is correctly mapped to an action
      const actionToExecute = statusMap[state.inspectionStatus];
      if (!actionToExecute) {
          dispatch({ type: 'SET_ERROR', payload: `Invalid negotiation status: ${state.inspectionStatus}` });
          return false;
      }

      return actionToExecute() || Promise.resolve(false);
    },
  }), [
    // Only include stable dependencies
    batchUpdate,
    setFormStatus,
    setDetails,
    setNegotiationType,
    setCreatedAt,
    setDateTimeObj,
    setCounterDateTimeObj,
    setError,
    setInspectionStatus,
    setInspectionDateStatus,
    setCurrentUserId, // Add to dependencies
    setCurrentUserType, // Add to dependencies
    goToNextPage,
    resetCounterDateTime,
    resetToOriginalDateTime,
    makeApiRequest,
    generatePayload, // generatePayload now depends on state.currentUserId and state.currentUserType
    state.counterOffer,
    state.inspectionStatus,
    state.currentUserId, // Add state values as dependencies for actions that rely on them
    state.currentUserType
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <NegotiationContext.Provider value={contextValue}>
      {children}
    </NegotiationContext.Provider>
  );
};

// Custom hook to use the context
export const useNegotiation = (): NegotiationContextType => {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiation must be used within a NegotiationProvider');
  }
  return context;
};

// Optimized data fetching hook with better memoization and fetch tracking
export const useNegotiationDataWithContext = (potentialClientID: string, userRole: "seller" | "buyer") => {
  const { state, actions } = useNegotiation();
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent multiple fetches for the same ID
    if (!potentialClientID || hasFetchedRef.current === potentialClientID) {
      return;
    }

    hasFetchedRef.current = potentialClientID;

    const fetchData = async () => {
      actions.setFormStatus('pending');

      try {
        const response = await GET_REQUEST(
          `${URLS.BASE + URLS.getOneNewInspection}/${potentialClientID}`,
          Cookies.get("token")
        );

        if (response.success) {
          const data: PotentialClientData = response.data;

          const property = data.propertyId || {};

          // Determine negotiation type
          const negotiationType: NegotiationType =
            data.letterOfIntention ? "LOI" :
              ["Outright Sales", "Rent"].includes(property.briefType) ? "NORMAL" : "LOI";

          let userIdToSet: string | null = null;
          let userTypeToSet: "seller" | "buyer" | null = null;

          // Logic to set userId and userType based on userRole
          if (userRole === "seller") {
            // Seller ID is propertyData.owner
            userIdToSet = property?.owner || data.owner._id;
            userTypeToSet = "seller";
          } else if (userRole === "buyer") {
            // Buyer ID is clientData._id (from requestedBy)
            userIdToSet = data.requestedBy?._id || null;
            userTypeToSet = "buyer";
          }


          // Use batch update for better performance
          const batchUpdates = {
            formStatus: 'success' as const,
            negotiationType,
            createdAt: data.createdAt || null,
            dateTimeObj: {
              selectedDate: data.inspectionDate ? new Date(data.inspectionDate).toISOString().split('T')[0] : "",
              selectedTime: data.inspectionTime || "N/A",
            },
            counterDateTimeObj: {
              selectedDate: data.inspectionDate ? new Date(data.inspectionDate).toISOString().split('T')[0] : "",
              selectedTime: data.inspectionTime || "N/A",
            },
            details: {
              negotiationID: data._id,
              firstName: data.owner?.firstName || "",
              lastName: data.owner?.lastName || "",
              currentAmount: property.price || 0,
              buyOffer: data.negotiationPrice || 0,
              letterOfIntention: data.letterOfIntention || "",
              propertyData: property,
              clientData: data.requestedBy,
              negotiationStatus: data.status || 'pending_inspection',
              sellerCounterOffer: data.sellerCounterOffer || null,
              pendingResponseFrom: data.pendingResponseFrom,
              stage: data.stage,
              inspection: {
                inspectionDate: data.inspectionDate,
                inspectionTime: data.inspectionTime
              }
            },
            currentUserId: userIdToSet,
            currentUserType: userTypeToSet,
          };

          // Use the batchUpdate action instead of direct dispatch
          actions.batchUpdate(batchUpdates);
        } else {
          actions.setFormStatus('failed');
          actions.setError(response.message || "Failed to fetch negotiation data.");
        }
      } catch (error) {
        actions.setFormStatus('failed');
        actions.setError("An error occurred while fetching negotiation data.");
        console.error("Error fetching negotiation data:", error);
      }
    };

    fetchData();
    // Depend on potentialClientID and userRole
  }, [potentialClientID, userRole, actions]);

  return useMemo(() => ({
    formStatus: state.formStatus,
    details: state.details,
    negotiationType: state.negotiationType,
    createdAt: state.createdAt,
    dateTimeObj: state.dateTimeObj,
    counterDateTimeObj: state.counterDateTimeObj,
    setDateTimeObj: actions.setDateTimeObj,
    currentUserId: state.currentUserId,
    currentUserType: state.currentUserType,
  }), [state.formStatus, state.details, state.negotiationType, state.createdAt, state.dateTimeObj, state.counterDateTimeObj, actions.setDateTimeObj, state.currentUserId, state.currentUserType]);
};

// Rest of the hooks remain the same...
export const useNegotiationData = () => {
  const { state, actions } = useNegotiation();

  return useMemo(() => ({
    // Data
    offerPrice: state.offerPrice,
    counterOffer: state.counterOffer,
    details: state.details,
    formStatus: state.formStatus,
    negotiationType: state.negotiationType,
    createdAt: state.createdAt,
    inspectionStatus: state.inspectionStatus,
    inspectionDateStatus: state.inspectionDateStatus,
    error: state.error,
    setError: actions.setError,
    currentUserId: state.currentUserId,
    currentUserType: state.currentUserType,

    // UI State
    contentTracker: state.contentTracker,
    isNegotiated: state.isNegotiated,
    dateTimeObj: state.dateTimeObj,
    counterDateTimeObj: state.counterDateTimeObj,

    // UI Actions
    goToNextPage: actions.goToNextPage,
    setNegotiated: actions.setNegotiated,
    updateDateTime: actions.updateDateTime,
    setCounterDateTimeObj: actions.setCounterDateTimeObj,
    setInspectionStatus: actions.setInspectionStatus,
    setInspectionDateStatus: actions.setInspectionDateStatus,
    setCurrentUserType: actions.setCurrentUserType,
    setCounterOffer: actions.setCounterOffer,

    // Utils
    isCounterDateTimeModified: () => {
      return (
        state.counterDateTimeObj.selectedDate !== state.dateTimeObj.selectedDate ||
        state.counterDateTimeObj.selectedTime !== state.dateTimeObj.selectedTime
      );
    },

    resetAllToOriginal: () => {
      actions.resetCounterDateTime();
    },
  }), [
    // State dependencies
    state.offerPrice,
    state.counterOffer,
    state.details,
    state.formStatus,
    state.negotiationType,
    state.createdAt,
    state.inspectionStatus,
    state.inspectionDateStatus,
    state.error,
    state.currentUserId,
    state.currentUserType,
    state.contentTracker,
    state.isNegotiated,
    state.dateTimeObj,
    state.counterDateTimeObj,

    // Action dependencies
    actions.goToNextPage,
    actions.setNegotiated,
    actions.updateDateTime,
    actions.setCounterDateTimeObj,
    actions.setInspectionStatus,
    actions.setInspectionDateStatus,
    actions.setCurrentUserType,
    actions.resetCounterDateTime,
    actions.setError,
    actions.setCounterOffer
  ]);
};


export const useNegotiationModals = () => {
  const { state, actions } = useNegotiation();
  return useMemo(() => ({
    // State
    showSubmitOfferModal: state.showSubmitOfferModal,
    showAcceptRejectModal: state.showAcceptRejectModal,
    isSubmitting: state.isSubmitting,
    isAcceptingOffer: state.isAcceptingOffer,
    isRejectingOffer: state.isRejectingOffer,
    isCountering: state.isCountering,
    isSubmittingBasedOnStatus: state.isSubmittingBasedOnStatus,

    // Actions
    openSubmitOfferModal: actions.openSubmitOfferModal,
    closeSubmitOfferModal: actions.closeSubmitOfferModal,
    openAcceptRejectModal: actions.openAcceptRejectModal,
    closeAcceptRejectModal: actions.closeAcceptRejectModal,
  }), [
    state.showSubmitOfferModal, state.showAcceptRejectModal, state.offerPrice, state.counterOffer,
    state.isSubmitting, state.isAcceptingOffer, state.isRejectingOffer, state.isCountering, state.isSubmittingBasedOnStatus,
    actions.openSubmitOfferModal, actions.closeSubmitOfferModal, actions.openAcceptRejectModal,
    actions.closeAcceptRejectModal, actions.setOfferPrice,
  ]);
};

export const useNegotiationActions = () => {
  const { actions, state } = useNegotiation();
  return useMemo(() => ({
    acceptOffer: actions.acceptOffer,
    rejectOffer: actions.rejectOffer,
    counterOffer: actions.counterOffer,
    submitBasedOnStatus: actions.submitBasedOnStatus,
  }), [actions.acceptOffer, actions.rejectOffer, actions.counterOffer, actions.submitBasedOnStatus]);
};


// Export types
export type {
  AcceptOfferPayload,
  RejectOfferPayload,
  CounterOfferPayload,
  InspectionStatus,
  LoadingType
};