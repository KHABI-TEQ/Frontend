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
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from "@/data/preference-configs";

// Step configurations for different preference types
const getStepsForPreferenceType = (preferenceType?: string) => {
  if (preferenceType === "joint-venture") {
    return [
      {
        id: "jv-developer-info",
        title: "Developer Information",
        isValid: false,
        isRequired: true,
      },
      {
        id: "jv-development-type",
        title: "Development Type",
        isValid: false,
        isRequired: true,
      },
      {
        id: "jv-land-requirements",
        title: "Land Requirements",
        isValid: false,
        isRequired: true,
      },
      {
        id: "jv-terms-proposal",
        title: "JV Terms & Proposal",
        isValid: false,
        isRequired: true,
      },
      {
        id: "jv-title-documentation",
        title: "Title & Documentation",
        isValid: false,
        isRequired: true,
      },
    ];
  }

  // Default steps for buy, rent, shortlet
  return [
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
  ];
};

// Initial state factory - prevents object recreation
const createInitialState = (preferenceType?: string): PreferenceFormState => ({
  currentStep: 0,
  steps: getStepsForPreferenceType(preferenceType),
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
      if (state.currentStep === action.payload) return state;
      return {
        ...state,
        currentStep: action.payload,
      };

    case "UPDATE_FORM_DATA":
      const newFormData = {
        ...state.formData,
        ...action.payload,
      };

      let newSteps = state.steps;
      let resetCurrentStep = state.currentStep;

      if (action.payload.preferenceType && action.payload.preferenceType !== state.formData.preferenceType) {
        newSteps = getStepsForPreferenceType(action.payload.preferenceType);
        resetCurrentStep = 0;
      }

      let formDataChanged = false;
      const payloadKeys = Object.keys(action.payload);

      for (const key of payloadKeys) {
        const currentValue = state.formData[key as keyof PreferenceForm];
        const newValue = action.payload[key as keyof PreferenceForm];

        if (currentValue !== newValue) {
          if (
            typeof newValue !== "object" ||
            newValue === null ||
            currentValue === null ||
            currentValue === undefined
          ) {
            formDataChanged = true;
            break;
          }
          if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
            formDataChanged = true;
            break;
          }
        }
      }

      if (!formDataChanged && newSteps === state.steps) {
        return state;
      }

      return {
        ...state,
        formData: newFormData,
        steps: newSteps,
        currentStep: resetCurrentStep,
      };

    case "SET_VALIDATION_ERRORS":
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
  goToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<PreferenceForm>, immediate?: boolean) => void;
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
    createInitialState,
  );

  const isUpdatingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper functions
  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const goToNextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      goToStep(state.currentStep + 1);
    }
  }, [state.currentStep, state.steps.length, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 0) {
      goToStep(state.currentStep - 1);
    }
  }, [state.currentStep, goToStep]);

  const updateFormData = useCallback(
    (data: Partial<PreferenceForm>, immediate = false) => {
      if (isUpdatingRef.current && !immediate) return;

      isUpdatingRef.current = true;
      dispatch({ type: "UPDATE_FORM_DATA", payload: data });

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        isUpdatingRef.current = false;
      }, 300);
    },
    []
  );

  const getMinBudgetForLocation = useCallback(
    (location: string, listingType: string): number => {
      const threshold = state.budgetThresholds.find(
        (t) =>
          t.location.toLowerCase() === location.toLowerCase() &&
          t.listingType === listingType,
      );

      if (threshold) return threshold.minAmount;

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
      const currentStepId = state.steps[step]?.id;

      if (formData.preferenceType === "joint-venture") {
        switch (currentStepId) {
          case "jv-developer-info":
            if (!formData.contactInfo?.fullName?.trim()) {
              errors.push({
                field: "contactInfo.fullName",
                message: "Full name is required",
              });
            }
            if (!formData.contactInfo?.email?.trim()) {
              errors.push({
                field: "contactInfo.email",
                message: "Email address is required",
              });
            }
            if (!formData.contactInfo?.phoneNumber?.trim()) {
              errors.push({
                field: "contactInfo.phoneNumber",
                message: "Phone number is required",
              });
            }
            break;

          case "jv-development-type":
            if (!formData.developmentDetails?.developmentTypes || formData.developmentDetails.developmentTypes.length === 0) {
              errors.push({
                field: "developmentDetails.developmentTypes",
                message: "At least one development type is required",
              });
            }
            break;

          case "jv-land-requirements":
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
            if (!formData.developmentDetails?.measurementUnit) {
              errors.push({
                field: "developmentDetails.measurementUnit",
                message: "Measurement unit is required",
              });
            }
            if (!formData.developmentDetails?.minLandSize) {
              errors.push({
                field: "developmentDetails.minLandSize",
                message: "Minimum land size is required",
              });
            }
            break;

          case "jv-terms-proposal":
            if (!formData.developmentDetails?.preferredSharingRatio) {
              errors.push({
                field: "developmentDetails.preferredSharingRatio",
                message: "Preferred sharing ratio is required",
              });
            }
            break;

          case "jv-title-documentation":
            if (!formData.developmentDetails?.minimumTitleRequirements || formData.developmentDetails.minimumTitleRequirements.length === 0) {
              errors.push({
                field: "developmentDetails.minimumTitleRequirements",
                message: "At least one minimum title requirement is required",
              });
            }
            break;
        }
        return errors;
      }

      return errors;
    },
    [state],
  );

  const isStepValid = useCallback(
    (step: number) => {
      const errors = validateStep(step);
      return errors.length === 0;
    },
    [validateStep]
  );

  const canProceedToNextStep = useCallback(() => {
    return isStepValid(state.currentStep);
  }, [state.currentStep, isStepValid]);

  const getAvailableFeatures = useCallback(
    (preferenceType: string, budget?: number) => {
      const config = state.featureConfigs.find(
        (c) => c.propertyType === preferenceType
      );
      return {
        basic: config?.features.filter((f) => f.tier === "basic") || [],
        premium: config?.features.filter((f) => f.tier === "premium") || [],
      };
    },
    [state.featureConfigs]
  );

  const isFormValid = useCallback(() => {
    return state.steps.every((step) => isStepValid(step.id as any));
  }, [state.steps, isStepValid]);

  const getValidationErrorsForField = useCallback(
    (fieldName: string) => {
      return state.validationErrors.filter((error) =>
        error.field.startsWith(fieldName)
      );
    },
    [state.validationErrors]
  );

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  const triggerValidation = useCallback(
    (step?: number) => {
      const stepIndex = step !== undefined ? step : state.currentStep;
      const errors = validateStep(stepIndex);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
    },
    [state.currentStep, validateStep]
  );

  const value: PreferenceFormContextType = useMemo(
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
    ]
  );

  return (
    <PreferenceFormContext.Provider value={value}>
      {children}
    </PreferenceFormContext.Provider>
  );
};

// Hook to use the context
export const usePreferenceForm = () => {
  const context = useContext(PreferenceFormContext);
  if (!context) {
    throw new Error(
      "usePreferenceForm must be used within PreferenceFormProvider"
    );
  }
  return context;
};
