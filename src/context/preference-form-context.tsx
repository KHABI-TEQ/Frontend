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
  buy: {
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
      {
        name: "Gym House",
        type: "premium",
        minBudgetRequired: 30000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Swimming Pool",
        type: "premium",
        minBudgetRequired: 30000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Outdoor Kitchen",
        type: "premium",
        minBudgetRequired: 25000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Rooftops",
        type: "premium",
        minBudgetRequired: 20000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "In-house Cinema",
        type: "premium",
        minBudgetRequired: 40000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Tennis Court",
        type: "premium",
        minBudgetRequired: 50000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Elevator",
        type: "premium",
        minBudgetRequired: 35000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Electric Fencing",
        type: "premium",
        minBudgetRequired: 15000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Inverter",
        type: "premium",
        minBudgetRequired: 10000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Sea View",
        type: "premium",
        minBudgetRequired: 60000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Jacuzzi",
        type: "premium",
        minBudgetRequired: 20000000,
        tooltip: "This feature requires a higher budget.",
      },
    ],
  },
  rent: {
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
      {
        name: "Gym House",
        type: "premium",
        minBudgetRequired: 800000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Swimming Pool",
        type: "premium",
        minBudgetRequired: 1000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Outdoor Kitchen",
        type: "premium",
        minBudgetRequired: 600000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Rooftops",
        type: "premium",
        minBudgetRequired: 500000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "In-house Cinema",
        type: "premium",
        minBudgetRequired: 1200000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Tennis Court",
        type: "premium",
        minBudgetRequired: 1500000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Elevator",
        type: "premium",
        minBudgetRequired: 900000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Electric Fencing",
        type: "premium",
        minBudgetRequired: 400000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Inverter",
        type: "premium",
        minBudgetRequired: 300000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Sea View",
        type: "premium",
        minBudgetRequired: 2000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Jacuzzi",
        type: "premium",
        minBudgetRequired: 700000,
        tooltip: "This feature requires a higher budget.",
      },
    ],
  },
  "joint-venture": {
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
      {
        name: "Gym House",
        type: "premium",
        minBudgetRequired: 15000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Swimming Pool",
        type: "premium",
        minBudgetRequired: 20000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Outdoor Kitchen",
        type: "premium",
        minBudgetRequired: 12000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Rooftops",
        type: "premium",
        minBudgetRequired: 10000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "In-house Cinema",
        type: "premium",
        minBudgetRequired: 25000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Tennis Court",
        type: "premium",
        minBudgetRequired: 30000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Elevator",
        type: "premium",
        minBudgetRequired: 20000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Electric Fencing",
        type: "premium",
        minBudgetRequired: 8000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Inverter",
        type: "premium",
        minBudgetRequired: 5000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Sea View",
        type: "premium",
        minBudgetRequired: 40000000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Jacuzzi",
        type: "premium",
        minBudgetRequired: 15000000,
        tooltip: "This feature requires a higher budget.",
      },
    ],
  },
  shortlet: {
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
      {
        name: "Gym House",
        type: "premium",
        minBudgetRequired: 80000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Swimming Pool",
        type: "premium",
        minBudgetRequired: 100000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Outdoor Kitchen",
        type: "premium",
        minBudgetRequired: 60000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Rooftops",
        type: "premium",
        minBudgetRequired: 50000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "In-house Cinema",
        type: "premium",
        minBudgetRequired: 120000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Tennis Court",
        type: "premium",
        minBudgetRequired: 150000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Elevator",
        type: "premium",
        minBudgetRequired: 90000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Electric Fencing",
        type: "premium",
        minBudgetRequired: 40000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Inverter",
        type: "premium",
        minBudgetRequired: 30000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Sea View",
        type: "premium",
        minBudgetRequired: 200000,
        tooltip: "This feature requires a higher budget.",
      },
      {
        name: "Jacuzzi",
        type: "premium",
        minBudgetRequired: 70000,
        tooltip: "This feature requires a higher budget.",
      },
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
    { id: "location", title: "Location", isValid: false, isRequired: true },
    { id: "budget", title: "Budget", isValid: false, isRequired: true },
    { id: "features", title: "Features", isValid: false, isRequired: false },
    { id: "contact", title: "Contact", isValid: false, isRequired: true },
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
        return { basic: [], premium: [] };
      }

      if (!budget) {
        return config;
      }

      // Filter premium features based on budget
      const availablePremium = config.premium.filter(
        (feature) =>
          !feature.minBudgetRequired || budget >= feature.minBudgetRequired,
      );

      return {
        basic: config.basic,
        premium: availablePremium,
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
    // Show confirmation before clearing form if there's data
    const hasData = Object.keys(state.formData).length > 0;

    if (hasData) {
      if (
        typeof window !== "undefined" &&
        window.confirm("Are you sure you want to clear all form data?")
      ) {
        dispatch({ type: "RESET_FORM" });
        toast.success("Form data cleared successfully");
      }
    } else {
      dispatch({ type: "RESET_FORM" });
    }
  }, [state.formData]);

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
