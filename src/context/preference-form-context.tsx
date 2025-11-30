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

      // Check if preference type changed and we need to reconfigure steps
      let newSteps = state.steps;
      let resetCurrentStep = state.currentStep;

      if (action.payload.preferenceType && action.payload.preferenceType !== state.formData.preferenceType) {
        newSteps = getStepsForPreferenceType(action.payload.preferenceType);
        resetCurrentStep = 0; // Reset to first step when changing preference type
      }

      // Enhanced comparison for nested objects with shallow check first
      let formDataChanged = false;
      const payloadKeys = Object.keys(action.payload);

      // Quick shallow check first
      for (const key of payloadKeys) {
        const currentValue = state.formData[key as keyof PreferenceForm];
        const newValue = action.payload[key as keyof PreferenceForm];

        if (currentValue !== newValue) {
          // For primitives, this is enough
          if (
            typeof newValue !== "object" ||
            newValue === null ||
            currentValue === null ||
            currentValue === undefined
          ) {
            formDataChanged = true;
            break;
          }
          // For objects/arrays, do deep comparison only when necessary
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
    createInitialState, // Lazy initial state
  );

  // Use ref to track if we're already updating to prevent loops
  const isUpdatingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const currentStepId = state.steps[step]?.id;

      // Handle Joint Venture specific step validation
      if (formData.preferenceType === "joint-venture") {
        
        switch (currentStepId) {
          case "jv-developer-info": // Step 0 for JV
          
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

          case "jv-development-type": // Step 1 for JV
            if (!formData.developmentDetails?.developmentTypes || formData.developmentDetails.developmentTypes.length === 0) {
              errors.push({
                field: "developmentDetails.developmentTypes",
                message: "At least one development type is required",
              });
            }
            
            break;

          case "jv-land-requirements": // Step 2 for JV
            // Location validation (reuse existing logic)
            
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
            // Land size requirements
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

          case "jv-terms-proposal": // Step 3 for JV
            if (!formData.developmentDetails?.preferredSharingRatio) {
              errors.push({
                field: "developmentDetails.preferredSharingRatio",
                message: "Preferred sharing ratio is required",
              });
            }
            break;

          case "jv-title-documentation": // Step 4 for JV
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
    
      // Original validation for other preference types
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
          if (formData.location?.lgas && formData.location.lgas.length > 3) {
            errors.push({
              field: "location.lgas",
              message: "Maximum 3 LGAs can be selected",
            });
          }

          // Enhanced validation for LGA-area mapping
          const enhancedLocation = (formData as any).enhancedLocation;
          if (
            enhancedLocation?.lgasWithAreas &&
            enhancedLocation.lgasWithAreas.length > 0
          ) {
            const lgasWithAreas = enhancedLocation.lgasWithAreas;
            let hasAnyAreas = false;
            let hasCustomLocation = false;

            // Check for custom location
            if (
              formData.location?.customLocation?.trim() ||
              enhancedLocation.customLocation?.trim()
            ) {
              hasCustomLocation = true;
            }

            // Check areas in LGAs
            for (const lgaArea of lgasWithAreas) {
              if (lgaArea.areas && lgaArea.areas.length > 0) {
                hasAnyAreas = true;
                if (lgaArea.areas.length > 3) {
                  errors.push({
                    field: `location.areas.${lgaArea.lgaName}`,
                    message: `Maximum 3 areas allowed per LGA (${lgaArea.lgaName})`,
                  });
                }
              }
            }

            // Check if at least one area is selected or custom location is provided
            if (!hasAnyAreas && !hasCustomLocation) {
              errors.push({
                field: "location.areas",
                message:
                  "Please select at least one area or enter a custom location",
              });
            }
          } else {
            // Fallback to legacy validation
            const hasLegacyAreas =
              formData.location?.areas && formData.location.areas.length > 0;
            const hasCustomLocation = formData.location?.customLocation?.trim();

            if (!hasLegacyAreas && !hasCustomLocation) {
              errors.push({
                field: "location.areas",
                message: "Please select areas or enter a custom location",
              });
            }
          }
          break;

        case 1: // Property details & Budget step
          // Property Details Validation
          // Basic property fields validation
          if (["buy", "rent"].includes(formData.preferenceType as string)) {
            if (!formData.propertyDetails?.propertySubtype) {
              errors.push({
                field: "propertyDetails.propertySubtype",
                message: "Property type is required",
              });
            }
          }

          // Only require measurement unit and land size for buy and joint-venture
          if (formData.preferenceType !== "rent" && formData.preferenceType !== "shortlet") {
            if (!formData.propertyDetails?.measurementUnit) {
              errors.push({
                field: "propertyDetails.measurementUnit",
                message: "Measurement unit is required",
              });
            }

            if (!formData.propertyDetails?.landSize) {
              errors.push({
                field: "propertyDetails.landSize",
                message: "Land size is required",
              });
            }
          }

          // Non-land property validations
          if (formData.propertyDetails?.propertySubtype && formData.propertyDetails.propertySubtype !== "land") {
            if (!formData.propertyDetails?.buildingType) {
              errors.push({
                field: "propertyDetails.buildingType",
                message: "Building type is required",
              });
            }

            if (!formData.propertyDetails?.propertyCondition) {
              errors.push({
                field: "propertyDetails.propertyCondition",
                message: "Property condition is required",
              });
            }

            // Residential specific validations
            if (formData.propertyDetails.propertySubtype === "residential") {
              if (!formData.propertyDetails?.bedrooms) {
                errors.push({
                  field: "propertyDetails.bedrooms",
                  message: "Number of bedrooms is required",
                });
              }
            }
          }

          // Document types for buy/joint-venture
          if (
            (formData.preferenceType === "buy" || formData.preferenceType === "joint-venture") &&
            (!formData.propertyDetails?.documentTypes || formData.propertyDetails.documentTypes.length === 0)
          ) {
            errors.push({
              field: "propertyDetails.documentTypes",
              message: "At least one document type is required",
            });
          }

          // Joint-venture land conditions
          if (
            formData.preferenceType === "joint-venture" &&
            formData.propertyDetails?.propertySubtype === "land" &&
            (!formData.propertyDetails?.landConditions || formData.propertyDetails.landConditions.length === 0)
          ) {
            errors.push({
              field: "propertyDetails.landConditions",
              message: "Land conditions are required",
            });
          }

          // Shortlet specific validations
          if (formData.preferenceType === "shortlet") {
            if (!formData.propertyDetails?.propertyType) {
              errors.push({
                field: "propertyDetails.propertyType",
                message: "Property type is required",
              });
            }

            if (!formData.propertyDetails?.travelType) {
              errors.push({
                field: "propertyDetails.travelType",
                message: "Travel type is required",
              });
            }

            if (!formData.propertyDetails?.bedrooms) {
              errors.push({
                field: "propertyDetails.bedrooms",
                message: "Number of bedrooms is required",
              });
            }

            if (!formData.propertyDetails?.bathrooms || formData.propertyDetails.bathrooms <= 0) {
              errors.push({
                field: "propertyDetails.bathrooms",
                message: "Number of bathrooms is required",
              });
            }

            // Allow empty maxGuests during editing, but require it when submitting
            const maxGuestsValue = formData.propertyDetails?.maxGuests;
            if (maxGuestsValue === undefined || maxGuestsValue === null || maxGuestsValue === "" ||
                (typeof maxGuestsValue === "number" && maxGuestsValue <= 0) ||
                (typeof maxGuestsValue === "string" && (maxGuestsValue === "" || parseInt(maxGuestsValue) <= 0))) {
              errors.push({
                field: "propertyDetails.maxGuests",
                message: "Maximum guests is required",
              });
            }
          }

          // Budget Validation
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

        case 2: // Features step (optional for most, but includes dates for shortlet)
          // Shortlet date validations (since DateSelection is shown on step 2)
          if (formData.preferenceType === "shortlet") {
            if (!formData.bookingDetails?.checkInDate) {
              errors.push({
                field: "bookingDetails.checkInDate",
                message: "Check-in date is required",
              });
            }
            if (!formData.bookingDetails?.checkOutDate) {
              errors.push({
                field: "bookingDetails.checkOutDate",
                message: "Check-out date is required",
              });
            }
          }
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
          } else {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.contactInfo.email)) {
              errors.push({
                field: "contactInfo.email",
                message: "Please enter a valid email address",
              });
            }
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

  // Helper function to scroll to top
  const scrollToTop = useCallback(() => {
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

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

        // Scroll to top after step change, especially important on mobile
        setTimeout(() => {
          scrollToTop();
        }, 100);
      }
    },
    [state.steps.length, state.currentStep, validateStep, scrollToTop],
  );

  const goToNextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      const nextStep = state.currentStep + 1;
      dispatch({ type: "SET_STEP", payload: nextStep });
      // Trigger validation for the new step
      const currentErrors = validateStep(nextStep);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });

      // Scroll to top after step change
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  }, [state.currentStep, state.steps.length, validateStep, scrollToTop]);

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 0) {
      const prevStep = state.currentStep - 1;
      dispatch({ type: "SET_STEP", payload: prevStep });
      // Trigger validation for the new step
      const currentErrors = validateStep(prevStep);
      dispatch({ type: "SET_VALIDATION_ERRORS", payload: currentErrors });

      // Scroll to top after step change
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  }, [state.currentStep, validateStep, scrollToTop]);

  // STABLE updateFormData function with centralized debouncing
  const updateFormData = useCallback(
    (data: Partial<PreferenceForm>, immediate = false) => {
      // Prevent infinite loops with update guard
      if (isUpdatingRef.current) {
        return;
      }

      if (immediate) {
        // For immediate updates (like step changes)
        isUpdatingRef.current = true;
        dispatch({ type: "UPDATE_FORM_DATA", payload: data });
        isUpdatingRef.current = false;
      } else {
        // Debounced updates for form field changes
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            dispatch({ type: "UPDATE_FORM_DATA", payload: data });
            isUpdatingRef.current = false;
          }
        }, 150); // Reduced debounce time for better UX
      }
    },
    [],
  ); // Empty dependencies - this function never changes

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
          comfort: (config as any).comfort || [],
          premium: config.premium || [],
        };
      }

      if (!budget) {
        return {
          basic: config.basic || [],
          premium: config.premium || [],
          comfort: (config as any).comfort || [],
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
        comfort: (config as any).comfort || [],
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

  // Memoize context value to prevent unnecessary re-renders - optimize dependencies
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
      // Only include state properties that actually change
      state.currentStep,
      state.formData,
      state.isSubmitting,
      state.validationErrors,
      // Functions are stable now
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
      goToStep,
      goToNextStep,
      goToPreviousStep,
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
