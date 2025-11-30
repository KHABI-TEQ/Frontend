/** @format */

// Core form interfaces
export interface LocationSelection {
  state: string;
  lgas: string[];
  areas: string[]; // Max 3 areas
  customLocation?: string; // When user can't find their location
}

export interface BudgetRange {
  minPrice: number;
  maxPrice: number;
  currency: "NGN";
}

export interface FeatureSelection {
  basicFeatures: string[];
  premiumFeatures: string[];
  autoAdjustToBudget: boolean;
}

// Base preference form interface
export interface BasePreferenceForm {
  location: LocationSelection;
  budget: BudgetRange;
  features: FeatureSelection;
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  contactInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  additionalNotes?: string;
}

// Buy preference specific fields
export interface BuyPreferenceForm extends BasePreferenceForm {
  preferenceType: "buy";
  propertyDetails: {
    propertyType: "Land" | "Residential" | "Commercial";
    buildingType: "Detached" | "Semi-Detached" | "Block of Flats";
    minBedrooms: number | "More";
    minBathrooms: number;
    propertyCondition: "New" | "Renovated" | "Any";
    purpose: "For living" | "Resale" | "Development";
  };
  nearbyLandmark?: string;
}

// Rent preference specific fields
export interface RentPreferenceForm extends BasePreferenceForm {
  preferenceType: "rent";
  propertyDetails: {
    propertyType: "Self-con" | "Flat" | "Mini Flat" | "Bungalow";
    minBedrooms: number | "More";
    leaseTerm: "6 Months" | "1 Year";
    propertyCondition: "New" | "Renovated";
    purpose: "Residential" | "Office";
  };
}

// Joint venture preference specific fields
export interface JointVenturePreferenceForm
  extends Omit<BasePreferenceForm, "contactInfo"> {
  preferenceType: "joint-venture";
  developmentDetails: {
    minLandSize: string;
    jvType: "Equity Split" | "Lease-to-Build" | "Development Partner";
    propertyType: "Land" | "Old Building" | "Structure to demolish";
    expectedStructureType: "Mini Flats" | "Luxury Duplexes";
    timeline: "Ready Now" | "In 3 Months" | "Within 1 Year";
    budgetRange?: number;
  };
  contactInfo: {
    companyName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    cacRegistrationNumber?: string;
  };
  partnerExpectations?: string;
}

// Shortlet preference specific fields
export interface ShortletPreferenceForm extends BasePreferenceForm {
  preferenceType: "shortlet";
  bookingDetails: {
    propertyType: "Studio" | "1-Bed Apartment" | "2-Bed Flat";
    minBedrooms: number | "More";
    numberOfGuests: number;
    checkInDate: string;
    checkOutDate: string;
  };
}

// Union type for all preference forms
export type PreferenceForm =
  | BuyPreferenceForm
  | RentPreferenceForm
  | JointVenturePreferenceForm
  | ShortletPreferenceForm;

// API payload interfaces
export interface LocationPayload {
  state: string;
  localGovernmentAreas: string[];
  selectedAreas?: string[];
  customLocation?: string;
}

export interface BudgetPayload {
  minPrice: number;
  maxPrice: number;
  currency: "NGN";
}

export interface FeaturesPayload {
  baseFeatures: string[];
  premiumFeatures: string[];
  autoAdjustToFeatures: boolean;
}

export interface ContactInfoPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface JointVentureContactPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  cacRegistrationNumber?: string;
}

// API Request payloads for each preference type
export interface BuyPreferencePayload {
  preferenceType: "buy";
  preferenceMode: "buy";
  location: LocationPayload;
  budget: BudgetPayload;
  propertyDetails: {
    propertyType: string;
    buildingType: string;
    minBedrooms: number | string;
    minBathrooms: number;
    propertyCondition: string;
    purpose: string;
  };
  features: FeaturesPayload;
  contactInfo: ContactInfoPayload;
  nearbyLandmark?: string;
  additionalNotes?: string;
}

export interface RentPreferencePayload {
  preferenceType: "rent";
  preferenceMode: "tenant";
  location: LocationPayload;
  budget: BudgetPayload;
  propertyDetails: {
    propertyType: string;
    minBedrooms: number | string;
    leaseTerm: string;
    propertyCondition: string;
    purpose: string;
  };
  features: FeaturesPayload;
  contactInfo: ContactInfoPayload;
  additionalNotes?: string;
}

export interface JointVenturePreferencePayload {
  preferenceType: "joint-venture";
  preferenceMode: "developer";
  location: LocationPayload;
  budget: BudgetPayload;
  developmentDetails: {
    minLandSize: string;
    jvType: string;
    propertyType: string;
    expectedStructureType: string;
    timeline: string;
    budgetRange?: number;
  };
  features: FeaturesPayload;
  contactInfo: JointVentureContactPayload;
  partnerExpectations?: string;
}

export interface ShortletPreferencePayload {
  preferenceType: "shortlet";
  preferenceMode: "shortlet";
  location: LocationPayload;
  budget: BudgetPayload;
  bookingDetails: {
    propertyType: string;
    minBedrooms: number | string;
    numberOfGuests: number;
    checkInDate: string;
    checkOutDate: string;
  };
  features: FeaturesPayload;
  contactInfo: ContactInfoPayload;
  additionalNotes?: string;
}

// Union type for all API payloads
export type PreferencePayload =
  | BuyPreferencePayload
  | RentPreferencePayload
  | JointVenturePreferencePayload
  | ShortletPreferencePayload;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
}

// Feature definitions with budget requirements
export interface FeatureDefinition {
  name: string;
  type: "basic" | "premium" | "comfort";
  minBudgetRequired?: number; // In Naira
  tooltip?: string;
}

export interface FeatureConfig {
  basic: FeatureDefinition[];
  premium: FeatureDefinition[];
  comfort?: FeatureDefinition[]; // Optional comfort features for shortlet
}

// Budget threshold configurations
export interface BudgetThreshold {
  location: string;
  listingType: string;
  minAmount: number;
}

// Form step configuration
export interface FormStep {
  id: string;
  title: string;
  isValid: boolean;
  isRequired: boolean;
}

type PreferenceType = "rent" | "shortlet" | "buy" | "joint-venture";
 
// Flexible form data interface that can handle all preference types
export interface FlexibleFormData {
  location?: LocationSelection;
  budget?: BudgetRange;
  features?: FeatureSelection;
  preferenceType?: string;
  contactInfo?: any; // Can be either regular or joint-venture contact info
  additionalNotes?: string;
  propertyDetails?: any; // Can be any of the property detail types
  developmentDetails?: any; // For joint-venture
  bookingDetails?: any; // For shortlet
  nearbyLandmark?: string;
  partnerExpectations?: string;
}

// Form context state
export interface PreferenceFormState {
  currentStep: number;
  steps: FormStep[];
  formData: FlexibleFormData;
  isSubmitting: boolean;
  validationErrors: ValidationError[];
  budgetThresholds: BudgetThreshold[];
  featureConfigs: Record<string, FeatureConfig>;
}

// Context actions
export type PreferenceFormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<FlexibleFormData> }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_FORM" }
  | { type: "SET_BUDGET_THRESHOLDS"; payload: BudgetThreshold[] }
  | { type: "SET_FEATURE_CONFIGS"; payload: Record<string, FeatureConfig> };
