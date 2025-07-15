/** @format */

"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "react-hot-toast";
import {
  PreferenceFormState,
  PreferenceFormAction,
  PreferenceForm,
  ValidationError,
  BudgetThreshold,
  FeatureConfig,
  FeatureDefinition,
} from "@/types/preference-form";

// Feature configurations with budget requirements - Memoized static data
const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "buy-residential": {
    basic: [
      { name: "Kitchenette", type: "basic" },
      { name: "Security Cameras", type: "basic" },
      { name: "Children Playground", type: "basic" },
      { name: "Open Floor Plan", type: "basic" },
      { name: "Walk-in Closet", type: "basic" },
      { name: "WiFi", type: "basic" },
      { name: "Library", type: "basic" },
      { name: "Home Office", type: "basic" },
      { name: "Bathtub", type: "basic" },
      { name: "Garage", type: "basic" },
      { name: "Staff Room", type: "basic" },
      { name: "Pantry", type: "basic" },
      { name: "Built-in Cupboards", type: "basic" },
      { name: "Security Post", type: "basic" },
      { name: "Access Gate", type: "basic" },
      { name: "Air Conditioner", type: "basic" },
      { name: "Wheelchair Friendly", type: "basic" },
      { name: "Garden", type: "basic" },
    ],
    premium: [
      { name: "Gym House", type: "premium" },
      { name: "Swimming Pool", type: "premium" },
      { name: "Outdoor Kitchen", type: "premium" },
      { name: "Rooftops", type: "premium" },
      { name: "In-house Cinema", type: "premium" },
      { name: "Tennis Court", type: "premium" },
      { name: "Elevator", type: "premium" },
      { name: "Electric Fencing", type: "premium" },
      { name: "Inverter", type: "premium" },
      { name: "Sea View", type: "premium" },
      { name: "Jacuzzi", type: "premium" },
    ],
  },
  "buy-commercial": {
    basic: [
      { name: "Power Supply", type: "basic" },
      { name: "Water Supply", type: "basic" },
      { name: "Air Conditioning", type: "basic" },
      { name: "Parking Space", type: "basic" },
      { name: "Security", type: "basic" },
      { name: "Internet (Wi-Fi)", type: "basic" },
      { name: "Reception Area", type: "basic" },
      { name: "Elevator", type: "basic" },
      { name: "Standby Generator", type: "basic" },
    ],
    premium: [
      { name: "Central Cooling System", type: "premium" },
      { name: "Fire Safety Equipment", type: "premium" },
      { name: "Industrial Lift", type: "premium" },
      { name: "CCTV Monitoring System", type: "premium" },
      { name: "Conference Room", type: "premium" },
      { name: "Fiber Optic Internet", type: "premium" },
      { name: "Backup Solar/Inverter", type: "premium" },
      { name: "Loading Dock", type: "premium" },
      { name: "Smart Building Automation", type: "premium" },
    ],
  },
  "buy-land": {
    basic: [],
    premium: [],
  },
  "rent-residential": {
    basic: [
      { name: "Kitchenette", type: "basic" },
      { name: "Security Cameras", type: "basic" },
      { name: "Children Playground", type: "basic" },
      { name: "Open Floor Plan", type: "basic" },
      { name: "Walk-in Closet", type: "basic" },
      { name: "WiFi", type: "basic" },
      { name: "Library", type: "basic" },
      { name: "Home Office", type: "basic" },
      { name: "Bathtub", type: "basic" },
      { name: "Garage", type: "basic" },
      { name: "Staff Room", type: "basic" },
      { name: "Pantry", type: "basic" },
      { name: "Built-in Cupboards", type: "basic" },
      { name: "Security Post", type: "basic" },
      { name: "Access Gate", type: "basic" },
      { name: "Air Conditioner", type: "basic" },
      { name: "Wheelchair Friendly", type: "basic" },
      { name: "Garden", type: "basic" },
    ],
    premium: [
      { name: "Gym House", type: "premium" },
      { name: "Swimming Pool", type: "premium" },
      { name: "Outdoor Kitchen", type: "premium" },
      { name: "Rooftops", type: "premium" },
      { name: "In-house Cinema", type: "premium" },
      { name: "Tennis Court", type: "premium" },
      { name: "Elevator", type: "premium" },
      { name: "Electric Fencing", type: "premium" },
      { name: "Inverter", type: "premium" },
      { name: "Sea View", type: "premium" },
      { name: "Jacuzzi", type: "premium" },
    ],
  },
  "rent-commercial": {
    basic: [
      { name: "Power Supply", type: "basic" },
      { name: "Water Supply", type: "basic" },
      { name: "Air Conditioning", type: "basic" },
      { name: "Parking Space", type: "basic" },
      { name: "Security", type: "basic" },
      { name: "Internet (Wi-Fi)", type: "basic" },
      { name: "Reception Area", type: "basic" },
      { name: "Elevator", type: "basic" },
      { name: "Standby Generator", type: "basic" },
    ],
    premium: [
      { name: "Central Cooling System", type: "premium" },
      { name: "Fire Safety Equipment", type: "premium" },
      { name: "Industrial Lift", type: "premium" },
      { name: "CCTV Monitoring System", type: "premium" },
      { name: "Conference Room", type: "premium" },
      { name: "Fiber Optic Internet", type: "premium" },
      { name: "Backup Solar/Inverter", type: "premium" },
      { name: "Loading Dock", type: "premium" },
      { name: "Smart Building Automation", type: "premium" },
    ],
  },
  "rent-land": {
    basic: [],
    premium: [],
  },
  "joint-venture-residential": {
    basic: [
      { name: "Kitchenette", type: "basic" },
      { name: "Security Cameras", type: "basic" },
      { name: "Children Playground", type: "basic" },
      { name: "Open Floor Plan", type: "basic" },
      { name: "Walk-in Closet", type: "basic" },
      { name: "WiFi", type: "basic" },
      { name: "Library", type: "basic" },
      { name: "Home Office", type: "basic" },
      { name: "Bathtub", type: "basic" },
      { name: "Garage", type: "basic" },
      { name: "Staff Room", type: "basic" },
      { name: "Pantry", type: "basic" },
      { name: "Built-in Cupboards", type: "basic" },
      { name: "Security Post", type: "basic" },
      { name: "Access Gate", type: "basic" },
      { name: "Air Conditioner", type: "basic" },
      { name: "Wheelchair Friendly", type: "basic" },
      { name: "Garden", type: "basic" },
    ],
    premium: [
      { name: "Gym House", type: "premium" },
      { name: "Swimming Pool", type: "premium" },
      { name: "Outdoor Kitchen", type: "premium" },
      { name: "Rooftops", type: "premium" },
      { name: "In-house Cinema", type: "premium" },
      { name: "Tennis Court", type: "premium" },
      { name: "Elevator", type: "premium" },
      { name: "Electric Fencing", type: "premium" },
      { name: "Inverter", type: "premium" },
      { name: "Sea View", type: "premium" },
      { name: "Jacuzzi", type: "premium" },
    ],
  },
  "joint-venture-commercial": {
    basic: [
      { name: "Power Supply", type: "basic" },
      { name: "Water Supply", type: "basic" },
      { name: "Air Conditioning", type: "basic" },
      { name: "Parking Space", type: "basic" },
      { name: "Security", type: "basic" },
      { name: "Internet (Wi-Fi)", type: "basic" },
      { name: "Reception Area", type: "basic" },
      { name: "Elevator", type: "basic" },
      { name: "Standby Generator", type: "basic" },
    ],
    premium: [
      { name: "Central Cooling System", type: "premium" },
      { name: "Fire Safety Equipment", type: "premium" },
      { name: "Industrial Lift", type: "premium" },
      { name: "CCTV Monitoring System", type: "premium" },
      { name: "Conference Room", type: "premium" },
      { name: "Fiber Optic Internet", type: "premium" },
      { name: "Backup Solar/Inverter", type: "premium" },
      { name: "Loading Dock", type: "premium" },
      { name: "Smart Building Automation", type: "premium" },
    ],
  },
  "joint-venture-land": {
    basic: [],
    premium: [],
  },
  shortlet: {
    basic: [
      { name: "Wi-Fi", type: "basic" },
      { name: "Air Conditioning", type: "basic" },
      { name: "Power Supply", type: "basic" },
      { name: "Security", type: "basic" },
      { name: "Parking", type: "basic" },
      { name: "Clean Water", type: "basic" },
      { name: "Kitchen", type: "basic" },
      { name: "Clean Bathroom", type: "basic" },
    ],
    comfort: [
      { name: "Laundry", type: "comfort" },
      { name: "Smart TV / Netflix", type: "comfort" },
      { name: "Balcony", type: "comfort" },
      { name: "Housekeeping", type: "comfort" },
      { name: "Breakfast Included", type: "comfort" },
      { name: "Private Entrance", type: "comfort" },
      { name: "POP Ceiling", type: "comfort" },
      { name: "Access Gate", type: "comfort" },
    ],
    premium: [
      { name: "Gym Access", type: "premium" },
      { name: "Swimming Pool", type: "premium" },
      { name: "Inverter / Solar Backup", type: "premium" },
      { name: "Rooftop Lounge", type: "premium" },
      { name: "Jacuzzi", type: "premium" },
      { name: "Sea View", type: "premium" },
      { name: "Pet-Friendly", type: "premium" },
      { name: "Outdoor Kitchen", type: "premium" },
      { name: "Smart Lock", type: "premium" },
      { name: "Close to Major Attractions", type: "premium" },
    ],
  },
};

// Budget thresholds by location and listing type - Memoized static data
const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  // Lagos thresholds
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Lagos", listingType: "joint-venture", minAmount: 10000000 },
  { location: "Lagos", listingType: "shortlet", minAmount: 15000 },

  // Abuja thresholds
  { location: "Abuja", listingType: "buy", minAmount: 8000000 },
  { location: "Abuja", listingType: "rent", minAmount: 300000 },
  { location: "Abuja", listingType: "joint-venture", minAmount: 15000000 },
  { location: "Abuja", listingType: "shortlet", minAmount: 25000 },

  // Default thresholds for other locations
  { location: "default", listingType: "buy", minAmount: 2000000 },
  { location: "default", listingType: "rent", minAmount: 100000 },
  { location: "default", listingType: "joint-venture", minAmount: 5000000 },
  { location: "default", listingType: "shortlet", minAmount: 10000 },
];

// Initial state factory - prevents object recreation
const createInitialState = (): PreferenceFormState => ({
  currentStep: 0,
  steps: [
    {
      id: "location",
      title: "Location & Area",
      isValid: false,
      isRequired: true,
    },
    {
      id: "property-budget",
      title: "Property Details & Budget",
      isValid: false,
      isRequired: true,
    },
    {
      id: "features",
      title: "Features & Amenities",
      isValid: false,
      isRequired: false,
    },
    {
      id: "contact",
      title: "Contact & Preferences",
      isValid: false,
      isRequired: true,
    },
  ],
  formData: {},
  isSubmitting: false,
  validationErrors: [],
  budgetThresholds: DEFAULT_BUDGET_THRESHOLDS,
  featureConfigs: FEATURE_CONFIGS,
});

// Reducer function - Optimized for performance
function preferenceFormReducer(
  state: PreferenceFormState,
  action: PreferenceFormAction,
): PreferenceFormState {
  switch (action.type) {
    case "SET_STEP":
      // Only update if step actually changes
      if (state.currentStep === action.payload) return state;
      return {
        ...state,
        currentStep: action.payload,
      };

    case "UPDATE_FORM_DATA":
      // Deep comparison for form data to prevent unnecessary updates
      const newFormData = {
        ...state.formData,
        ...action.payload,
      };

      // Check if data actually changed using deep comparison
      const formDataChanged =
        JSON.stringify(state.formData) !== JSON.stringify(newFormData);
      if (!formDataChanged) {
        return state;
      }

      return {
        ...state,
        formData: newFormData,
      };

    case "SET_VALIDATION_ERRORS":
      // Only update if errors actually changed
      if (
        JSON.stringify(state.validationErrors) ===
        JSON.stringify(action.payload)
      ) {
        return state;
      }
      return {
        ...state,
        validationErrors: action.payload,
      };

    case "SET_SUBMITTING":
      // Only update if submitting state actually changes
      if (state.isSubmitting === action.payload) return state;
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case "RESET_FORM":
      return createInitialState();

    case "SET_BUDGET_THRESHOLDS":
      return {
        ...state,
        budgetThresholds: action.payload,
      };

    case "SET_FEATURE_CONFIGS":
      return {
        ...state,
        featureConfigs: action.payload,
      };

    default:
      return state;
  }
}

// Context type
interface PreferenceFormContextType {
  state: PreferenceFormState;
  dispatch: React.Dispatch<PreferenceFormAction>;

  // Helper functions
  goToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<PreferenceForm>) => void;
  validateStep: (step: number) => ValidationError[];
  isStepValid: (step: number) => boolean;
  canProceedToNextStep: () => boolean;
  getMinBudgetForLocation: (location: string, listingType: string) => number;
  getAvailableFeatures: (
    preferenceType: string,
    budget?: number,
  ) => {
    basic: FeatureDefinition[];
    premium: FeatureDefinition[];
  };
  isFormValid: () => boolean;
  getValidationErrorsForField: (fieldName: string) => ValidationError[];
  resetForm: () => void;
  triggerValidation: (step?: number) => void;
}

// Create context
const PreferenceFormContext = createContext<
  PreferenceFormContextType | undefined
>(undefined);

// Provider component
export const PreferenceFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    preferenceFormReducer,
    undefined,
    createInitialState, // Lazy initial state
  );

  // Use ref to track if we're already updating to prevent loops
  const isUpdatingRef = useRef(false);

  // Memoized helper functions to prevent unnecessary re-renders
  const getMinBudgetForLocation = useCallback(
    (location: string, listingType: string): number => {
      const threshold = state.budgetThresholds.find(
        (t) =>
          t.location.toLowerCase() === location.toLowerCase() &&
          t.listingType === listingType,
      );

      if (threshold) return threshold.minAmount;

      // Fallback to default
      const defaultThreshold = state.budgetThresholds.find(
        (t) => t.location === "default" && t.listingType === listingType,
      );

      return defaultThreshold?.minAmount || 0;
    },
    [state.budgetThresholds],
  );

  const validateStep = useCallback(
    (step: number): ValidationError[] => {
      const errors: ValidationError[] = [];
      const { formData } = state;

      switch (step) {
        case 0: // Location step
          if (!formData.location?.state) {
            errors.push({
              field: "location.state",
              message: "State is required",
            });
          }
          if (!formData.location?.lgas?.length) {
            errors.push({
              field: "location.lgas",
              message: "At least one LGA is required",
            });
          }
          if (
            !formData.location?.areas?.length &&
            !formData.location?.customLocation
          ) {
            errors.push({
              field: "location.areas",
              message: "Please select areas or enter a custom location",
            });
          }
          if (formData.location?.areas && formData.location.areas.length > 3) {
            errors.push({
              field: "location.areas",
              message: "Maximum 3 areas can be selected",
            });
          }
          break;

        case 1: // Budget step
          if (!formData.budget?.minPrice) {
            errors.push({
              field: "budget.minPrice",
              message: "Minimum price is required",
            });
          }
          if (!formData.budget?.maxPrice) {
            errors.push({
              field: "budget.maxPrice",
              message: "Maximum price is required",
            });
          }
          if (formData.budget?.minPrice && formData.budget?.maxPrice) {
            if (formData.budget.minPrice >= formData.budget.maxPrice) {
              errors.push({
                field: "budget.maxPrice",
                message: "Maximum price must be greater than minimum price",
              });
            }

            // Check minimum budget for location
            if (formData.location?.state && formData.preferenceType) {
              const minRequired = getMinBudgetForLocation(
                formData.location.state,
                formData.preferenceType,
              );
              if (formData.budget.minPrice < minRequired) {
                errors.push({
                  field: "budget.minPrice",
                  message: `₦${minRequired.toLocaleString()} is the minimum required for this location.`,
                });
              }
            }
          }
          break;

        case 2: // Features step (optional)
          // No required validations for features step
          break;

        case 3: // Contact step
          if (formData.preferenceType === "joint-venture") {
            // Check for joint-venture specific contact fields
            const jvContactInfo = formData.contactInfo as any;
            if (!jvContactInfo?.companyName) {
              errors.push({
                field: "contactInfo.companyName",
                message: "Company name is required",
              });
            }
            if (!jvContactInfo?.contactPerson) {
              errors.push({
                field: "contactInfo.contactPerson",
                message: "Contact person is required",
              });
            }
          } else {
            // Check for regular contact fields
            const regularContactInfo = formData.contactInfo as any;
            if (!regularContactInfo?.fullName) {
              errors.push({
                field: "contactInfo.fullName",
                message: "Full name is required",
              });
            }
          }
          if (!formData.contactInfo?.email) {
            errors.push({
              field: "contactInfo.email",
              message: "Email is required",
            });
          }
          if (!formData.contactInfo?.phoneNumber) {
            errors.push({
              field: "contactInfo.phoneNumber",
              message: "Phone number is required",
            });
          }

          // Joint venture specific validations
          if (formData.preferenceType === "joint-venture") {
            const jvContact = formData.contactInfo as any;
            if (!jvContact?.companyName) {
              errors.push({
                field: "contactInfo.companyName",
                message: "Company name is required",
              });
            }
            if (!jvContact?.contactPerson) {
              errors.push({
                field: "contactInfo.contactPerson",
                message: "Contact person is required",
              });
            }
          }
          break;
      }

      return errors;
    },
    [state.formData, getMinBudgetForLocation],
  );

  // Helper functions with memoization
  const goToStep = useCallback(
    (step: number) => {
      if (
        step >= 0 &&
        step < state.steps.length &&
        step !== state.currentStep
      ) {
        dispatch({ type: "SET_STEP", payload: step });
        // Trigger validation for the new step
        const currentErrors = validateStep(step);
        dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });
      }
    },
    [state.steps.length, state.currentStep, validateStep],
  );

  const goToNextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      const nextStep = state.currentStep + 1;
      dispatch({ type: "SET_STEP", payload: nextStep });
      // Trigger validation for the new step
      const currentErrors = validateStep(nextStep);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });
    }
  }, [state.currentStep, state.steps.length, validateStep]);

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 0) {
      const prevStep = state.currentStep - 1;
      dispatch({ type: "SET_STEP", payload: prevStep });
      // Trigger validation for the new step
      const currentErrors = validateStep(prevStep);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });
    }
  }, [state.currentStep, validateStep]);

  // STABLE updateFormData function that never changes
  const updateFormData = useCallback((data: Partial<PreferenceForm>) => {
    // Prevent infinite loops with update guard
    if (isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    // Use setTimeout to batch updates and prevent loops
    setTimeout(() => {
      dispatch({ type: "UPDATE_FORM_DATA", payload: data });
      isUpdatingRef.current = false;
    }, 0);
  }, []); // Empty dependencies - this function never changes

  const getAvailableFeatures = useCallback(
    (preferenceType: string, budget?: number) => {
      const config = state.featureConfigs[preferenceType];
      if (!config) {
        return { basic: [], premium: [], comfort: [] };
      }

      // For shortlet, return all feature types
      if (preferenceType === "shortlet") {
        return {
          basic: config.basic || [],
          comfort: config.comfort || [],
          premium: config.premium || [],
        };
      }

      if (!budget) {
        return {
          basic: config.basic || [],
          premium: config.premium || [],
          comfort: config.comfort || [],
        };
      }

      // Filter premium features based on budget
      const availablePremium =
        config.premium?.filter(
          (feature) =>
            !feature.minBudgetRequired || budget >= feature.minBudgetRequired,
        ) || [];

      return {
        basic: config.basic || [],
        premium: availablePremium,
        comfort: config.comfort || [],
      };
    },
    [state.featureConfigs],
  );

  const isStepValid = useCallback(
    (step: number): boolean => {
      const errors = validateStep(step);
      return errors.length === 0;
    },
    [validateStep],
  );

  const canProceedToNextStep = useCallback((): boolean => {
    return isStepValid(state.currentStep);
  }, [state.currentStep, isStepValid]);

  const isFormValid = useCallback((): boolean => {
    for (let i = 0; i < state.steps.length; i++) {
      if (!isStepValid(i)) {
        return false;
      }
    }
    return true;
  }, [state.steps.length, isStepValid]);

  const getValidationErrorsForField = useCallback(
    (fieldName: string): ValidationError[] => {
      return state.validationErrors.filter(
        (error) => error.field === fieldName,
      );
    },
    [state.validationErrors],
  );

  const resetForm = useCallback(() => {
    // Reset form data immediately without confirmation
    dispatch({ type: "RESET_FORM" });
  }, []);

  // Manual validation - removed automatic validation to prevent infinite loops
  // Validation will be triggered on step changes and form submission
  const triggerValidation = useCallback(
    (step?: number) => {
      const targetStep = step !== undefined ? step : state.currentStep;
      const currentErrors = validateStep(targetStep);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });
    },
    [state.currentStep, validateStep],
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: PreferenceFormContextType = useMemo(
    () => ({
      state,
      dispatch,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateFormData,
      validateStep,
      isStepValid,
      canProceedToNextStep,
      getMinBudgetForLocation,
      getAvailableFeatures,
      isFormValid,
      getValidationErrorsForField,
      resetForm,
      triggerValidation,
    }),
    [
      state,
      dispatch,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateFormData, // This is now stable
      validateStep,
      isStepValid,
      canProceedToNextStep,
      getMinBudgetForLocation,
      getAvailableFeatures,
      isFormValid,
      getValidationErrorsForField,
      resetForm,
      triggerValidation,
    ],
  );

  return (
    <PreferenceFormContext.Provider value={contextValue}>
      {children}
    </PreferenceFormContext.Provider>
  );
};

// Hook to use the context
export const usePreferenceForm = (): PreferenceFormContextType => {
  const context = useContext(PreferenceFormContext);
  if (context === undefined) {
    throw new Error(
      "usePreferenceForm must be used within a PreferenceFormProvider",
    );
  }
  return context;
};

export default PreferenceFormContext;
