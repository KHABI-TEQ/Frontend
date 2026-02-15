/**
 * PREFERENCE SYSTEM - EXPORTABLE VALIDATION SCHEMAS
 * 
 * Use this file in other applications to ensure consistent validation
 * with the preference submission system.
 * 
 * Built with Yup - install with: npm install yup
 * 
 * Includes:
 * - Field-level validation schemas
 * - Step-level validation schemas
 * - Complete form validation schemas
 * - Custom validation functions
 * - Error messages
 */

import * as Yup from "yup";

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

const PHONE_PATTERN = /^(\+234|0)[789][01]\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_PATTERN = /^[a-zA-Z\s]+$/;
const CAC_PATTERN = /^RC\d{6,7}$/;

// ============================================================================
// STEP 0: LOCATION VALIDATION
// ============================================================================

/**
 * Location schema validation
 * Used for: Buy, Rent, Shortlet, Joint Venture (Step 0)
 */
export const locationValidationSchema = Yup.object({
  state: Yup.string()
    .required("Please select a state")
    .typeError("State must be text"),

  lgas: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one Local Government Area")
    .required("Local Government Areas are required")
    .typeError("LGAs must be an array"),

  areas: Yup.array()
    .of(Yup.string())
    .test(
      "areas-or-custom",
      "Please select areas or provide a custom location",
      function (value) {
        const { customLocation } = this.parent;
        return (value && value.length > 0) || (customLocation && customLocation.trim().length > 0);
      }
    )
    .max(3, "Maximum 3 areas can be selected")
    .typeError("Areas must be an array"),

  customLocation: Yup.string()
    .max(200, "Custom location cannot exceed 200 characters")
    .nullable()
    .optional(),
});

// ============================================================================
// STEP 1A: BUY PROPERTY DETAILS VALIDATION
// ============================================================================

/**
 * Buy property details schema
 */
export const buyPropertyDetailsValidationSchema = Yup.object({
  propertySubtype: Yup.string()
    .required("Please select a property type")
    .oneOf(["Land", "Residential", "Commercial"], "Invalid property type"),

  buildingType: Yup.string()
    .when("propertySubtype", {
      is: (value) => value !== "Land",
      then: (schema) =>
        schema
          .required("Please select a building type")
          .oneOf(
            ["Detached", "Semi-Detached", "Block of Flats"],
            "Invalid building type"
          ),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  minBedrooms: Yup.mixed()
    .when("propertySubtype", {
      is: (value) => value === "Residential",
      then: (schema) =>
        schema
          .required("Please select number of bedrooms")
          .typeError("Bedrooms must be a number or 'More'"),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  minBathrooms: Yup.number()
    .min(0, "Bathrooms cannot be negative")
    .nullable()
    .optional(),

  propertyCondition: Yup.string()
    .when("propertySubtype", {
      is: (value) => value !== "Land",
      then: (schema) =>
        schema
          .required("Please select property condition")
          .oneOf(["New", "Renovated", "Any"], "Invalid property condition"),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  purpose: Yup.string()
    .when("propertySubtype", {
      is: (value) => value === "Residential",
      then: (schema) =>
        schema
          .required("Please select property purpose")
          .oneOf(
            ["For living", "Resale", "Development"],
            "Invalid property purpose"
          ),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  measurementUnit: Yup.string()
    .required("Please select measurement unit")
    .oneOf(["plot", "sqm", "hectares"], "Invalid measurement unit"),

  landSize: Yup.number()
    .when("measurementUnit", {
      is: (value) => value === "plot" || value === "hectares",
      then: (schema) =>
        schema
          .required("Land size is required")
          .positive("Land size must be greater than 0"),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  minLandSize: Yup.number()
    .when("measurementUnit", {
      is: (value) => value === "sqm",
      then: (schema) =>
        schema
          .required("Minimum land size is required")
          .positive("Minimum land size must be greater than 0"),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  maxLandSize: Yup.number()
    .when("measurementUnit", {
      is: (value) => value === "sqm",
      then: (schema) =>
        schema
          .required("Maximum land size is required")
          .positive("Maximum land size must be greater than 0")
          .test(
            "max-greater-than-min",
            "Maximum land size must be greater than minimum land size",
            function (value) {
              const { minLandSize } = this.parent;
              return !minLandSize || !value || value > minLandSize;
            }
          ),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  documentTypes: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one document type")
    .required("Document types are required"),

  landConditions: Yup.array()
    .of(Yup.string())
    .nullable()
    .optional(),
});

// ============================================================================
// STEP 1A: RENT PROPERTY DETAILS VALIDATION
// ============================================================================

/**
 * Rent property details schema
 */
export const rentPropertyDetailsValidationSchema = Yup.object({
  propertySubtype: Yup.string()
    .required("Please select a property type")
    .oneOf(
      ["Self-con", "Flat", "Mini Flat", "Bungalow"],
      "Invalid property type"
    ),

  minBedrooms: Yup.mixed()
    .required("Please select number of bedrooms")
    .typeError("Bedrooms must be a number"),

  minBathrooms: Yup.number()
    .min(0, "Bathrooms cannot be negative")
    .nullable()
    .optional(),

  leaseTerm: Yup.string()
    .required("Please select lease term")
    .oneOf(["6 Months", "1 Year"], "Invalid lease term"),

  propertyCondition: Yup.string()
    .required("Please select property condition")
    .oneOf(["New", "Renovated"], "Invalid property condition"),

  purpose: Yup.string()
    .required("Please select property purpose")
    .oneOf(["Residential", "Office"], "Invalid property purpose"),
});

// ============================================================================
// STEP 1A: SHORTLET PROPERTY DETAILS VALIDATION
// ============================================================================

/**
 * Shortlet property details schema
 */
export const shortletPropertyDetailsValidationSchema = Yup.object({
  propertyType: Yup.string()
    .required("Please select property type")
    .oneOf(
      ["Studio", "1-Bed Apartment", "2-Bed Flat"],
      "Invalid property type"
    ),

  minBedrooms: Yup.number()
    .required("Please select number of bedrooms")
    .positive("Bedrooms must be positive"),

  numberOfBathrooms: Yup.number()
    .required("Bathrooms are required")
    .min(1, "Minimum 1 bathroom required")
    .positive("Bathrooms must be positive"),

  maxGuests: Yup.number()
    .required("Maximum guests is required")
    .min(1, "Minimum 1 guest")
    .max(20, "Maximum 20 guests")
    .positive("Guests must be positive"),

  travelType: Yup.string().required("Please select travel type"),

  nearbyLandmark: Yup.string()
    .max(200, "Landmark cannot exceed 200 characters")
    .nullable()
    .optional(),
});

// ============================================================================
// STEP 1A: JOINT VENTURE DEVELOPMENT DETAILS VALIDATION
// ============================================================================

/**
 * Joint venture development details schema
 */
export const jvDevelopmentDetailsValidationSchema = Yup.object({
  developmentTypes: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one development type")
    .required("Development types are required"),

  minLandSize: Yup.string()
    .required("Minimum land size is required"),

  maxLandSize: Yup.string()
    .nullable()
    .optional()
    .test(
      "max-greater-than-min",
      "Maximum land size must be greater than minimum land size",
      function (value) {
        const { minLandSize } = this.parent;
        if (!value || !minLandSize) return true;
        return parseFloat(value) > parseFloat(minLandSize);
      }
    ),

  measurementUnit: Yup.string()
    .required("Please select measurement unit")
    .oneOf(["plot", "sqm", "hectares"], "Invalid measurement unit"),

  jvType: Yup.string()
    .required("Please select JV type")
    .oneOf(
      ["Equity Split", "Lease-to-Build", "Development Partner"],
      "Invalid JV type"
    ),

  propertyType: Yup.string().required("Please select property type"),

  expectedStructureType: Yup.string().nullable().optional(),

  timeline: Yup.string()
    .required("Please select timeline")
    .oneOf(
      ["Ready Now", "In 3 Months", "Within 1 Year"],
      "Invalid timeline"
    ),

  preferredSharingRatio: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-ratio",
      "Please enter valid ratio format (e.g., 50-50)",
      function (value) {
        if (!value) return true;
        return /^\d{1,3}-\d{1,3}$/.test(value);
      }
    ),

  proposalDetails: Yup.string()
    .max(1000, "Proposal cannot exceed 1000 characters")
    .nullable()
    .optional(),

  minimumTitleRequirements: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one title requirement")
    .required("Title requirements are required"),

  willingToConsiderPendingTitle: Yup.boolean().optional(),
});

// ============================================================================
// STEP 1B: BUDGET VALIDATION
// ============================================================================

/**
 * Budget schema validation
 * Note: Location threshold validation should be done at step level
 */
export const budgetValidationSchema = Yup.object({
  minPrice: Yup.number()
    .required("Minimum price is required")
    .positive("Minimum price must be greater than 0")
    .typeError("Minimum price must be a number"),

  maxPrice: Yup.number()
    .required("Maximum price is required")
    .positive("Maximum price must be greater than 0")
    .test(
      "max-greater-than-min",
      "Maximum price must be greater than minimum price",
      function (value) {
        const { minPrice } = this.parent;
        return !minPrice || !value || value > minPrice;
      }
    )
    .typeError("Maximum price must be a number"),

  currency: Yup.string().default("NGN"),
});

// ============================================================================
// STEP 2: FEATURES VALIDATION
// ============================================================================

/**
 * Features schema validation
 */
export const featuresValidationSchema = Yup.object({
  basicFeatures: Yup.array()
    .of(Yup.string())
    .default([]),

  premiumFeatures: Yup.array()
    .of(Yup.string())
    .default([]),

  comfortFeatures: Yup.array()
    .of(Yup.string())
    .nullable()
    .optional(),

  autoAdjustToBudget: Yup.boolean().default(false),
});

// ============================================================================
// STEP 3: CONTACT INFO VALIDATION
// ============================================================================

/**
 * Standard contact info schema (Buy, Rent, Shortlet)
 */
export const contactInfoValidationSchema = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .matches(
      FULL_NAME_PATTERN,
      "Full name can only contain letters and spaces"
    ),

  email: Yup.string()
    .required("Email is required")
    .matches(EMAIL_PATTERN, "Please enter a valid email address"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(
      PHONE_PATTERN,
      "Please enter a valid Nigerian phone number (e.g., +234701234567 or 07012345678)"
    ),

  whatsappNumber: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-whatsapp",
      "Please enter a valid WhatsApp number",
      function (value) {
        if (!value) return true;
        return PHONE_PATTERN.test(value);
      }
    ),

  additionalNotes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),
});

/**
 * Joint venture contact info schema
 */
export const jvContactInfoValidationSchema = Yup.object({
  companyName: Yup.string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters"),

  contactPerson: Yup.string()
    .required("Contact person is required")
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must not exceed 100 characters")
    .matches(
      FULL_NAME_PATTERN,
      "Contact person name can only contain letters and spaces"
    ),

  email: Yup.string()
    .required("Email is required")
    .matches(EMAIL_PATTERN, "Please enter a valid email address"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(
      PHONE_PATTERN,
      "Please enter a valid Nigerian phone number"
    ),

  whatsappNumber: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-whatsapp",
      "Please enter a valid WhatsApp number",
      function (value) {
        if (!value) return true;
        return PHONE_PATTERN.test(value);
      }
    ),

  cacRegistrationNumber: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-cac",
      "Please enter a valid CAC registration number (e.g., RC123456)",
      function (value) {
        if (!value) return true;
        return CAC_PATTERN.test(value.toUpperCase());
      }
    ),
});

// ============================================================================
// STEP 3: SHORTLET BOOKING VALIDATION
// ============================================================================

/**
 * Shortlet booking details schema
 */
export const shortletBookingDetailsValidationSchema = Yup.object({
  checkInDate: Yup.date()
    .required("Check-in date is required")
    .min(new Date(), "Check-in date cannot be in the past")
    .typeError("Check-in date must be a valid date"),

  checkOutDate: Yup.date()
    .required("Check-out date is required")
    .typeError("Check-out date must be a valid date")
    .test(
      "checkout-after-checkin",
      "Check-out date must be after check-in date",
      function (value) {
        const { checkInDate } = this.parent;
        if (!checkInDate || !value) return true;
        return value > checkInDate;
      }
    ),

  preferredCheckInTime: Yup.string()
    .nullable()
    .optional(),

  preferredCheckOutTime: Yup.string()
    .nullable()
    .optional(),
});

// ============================================================================
// COMPLETE FORM VALIDATION SCHEMAS
// ============================================================================

/**
 * Buy preference complete form validation
 */
export const buyPreferenceFormValidationSchema = Yup.object({
  location: locationValidationSchema,
  propertyDetails: buyPropertyDetailsValidationSchema,
  budget: budgetValidationSchema,
  features: featuresValidationSchema,
  contactInfo: contactInfoValidationSchema,
  additionalNotes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),
  nearbyLandmark: Yup.string()
    .max(200, "Landmark cannot exceed 200 characters")
    .nullable()
    .optional(),
});

/**
 * Rent preference complete form validation
 */
export const rentPreferenceFormValidationSchema = Yup.object({
  location: locationValidationSchema,
  propertyDetails: rentPropertyDetailsValidationSchema,
  budget: budgetValidationSchema,
  features: featuresValidationSchema,
  contactInfo: contactInfoValidationSchema,
  additionalNotes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),
});

/**
 * Shortlet preference complete form validation
 */
export const shortletPreferenceFormValidationSchema = Yup.object({
  location: locationValidationSchema,
  propertyDetails: shortletPropertyDetailsValidationSchema,
  bookingDetails: shortletBookingDetailsValidationSchema,
  budget: budgetValidationSchema,
  features: featuresValidationSchema,
  contactInfo: contactInfoValidationSchema,
  additionalNotes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),
});

/**
 * Joint venture preference complete form validation
 */
export const jvPreferenceFormValidationSchema = Yup.object({
  location: locationValidationSchema,
  developmentDetails: jvDevelopmentDetailsValidationSchema,
  budget: budgetValidationSchema,
  features: featuresValidationSchema,
  contactInfo: jvContactInfoValidationSchema,
  partnerExpectations: Yup.string()
    .max(1000, "Partner expectations cannot exceed 1000 characters")
    .nullable()
    .optional(),
});

// ============================================================================
// CUSTOM VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate budget against location thresholds
 */
export function validateBudgetThreshold(
  minPrice: number,
  location: string,
  listingType: string,
  thresholds: Array<{ location: string; listingType: string; minAmount: number }>
): { valid: boolean; message?: string } {
  // Look for exact match
  let threshold = thresholds.find(
    (t) =>
      t.location.toLowerCase() === location.toLowerCase() &&
      t.listingType === listingType
  );

  // Fall back to default
  if (!threshold) {
    threshold = thresholds.find(
      (t) => t.location.toLowerCase() === "default" && t.listingType === listingType
    );
  }

  if (!threshold) {
    return { valid: true }; // No threshold found, allow
  }

  if (minPrice < threshold.minAmount) {
    return {
      valid: false,
      message: `Budget too low for ${location}. Minimum: ₦${threshold.minAmount.toLocaleString()}`,
    };
  }

  return { valid: true };
}

/**
 * Validate premium features against budget
 */
export function validatePremiumFeatures(
  selectedPremiumFeatures: string[],
  budget: number,
  featureConfigs: Array<{ name: string; minBudgetRequired?: number }>
): { valid: boolean; errors?: Array<{ feature: string; message: string }> } {
  const errors: Array<{ feature: string; message: string }> = [];

  for (const featureName of selectedPremiumFeatures) {
    const feature = featureConfigs.find((f) => f.name === featureName);
    if (!feature) {
      errors.push({
        feature: featureName,
        message: `Invalid feature: ${featureName}`,
      });
      continue;
    }

    if (feature.minBudgetRequired && budget < feature.minBudgetRequired) {
      errors.push({
        feature: featureName,
        message: `${featureName} requires minimum budget of ₦${feature.minBudgetRequired.toLocaleString()}. Your budget: ₦${budget.toLocaleString()}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Auto-adjust premium features based on budget
 */
export function autoAdjustFeatures(
  selectedPremiumFeatures: string[],
  budget: number,
  featureConfigs: Array<{ name: string; minBudgetRequired?: number }>
): string[] {
  return selectedPremiumFeatures.filter((featureName) => {
    const feature = featureConfigs.find((f) => f.name === featureName);
    if (!feature || !feature.minBudgetRequired) {
      return true; // Keep feature if no budget requirement
    }
    return budget >= feature.minBudgetRequired; // Keep if budget sufficient
  });
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // Handle 0 prefix
  if (cleaned.startsWith("0")) {
    return "+234" + cleaned.substring(1);
  }

  // Handle +234
  if (cleaned.startsWith("234")) {
    return "+" + cleaned;
  }

  return phone;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate complete preference form
 */
export async function validatePreferenceForm(
  formData: any,
  preferenceType: string
): Promise<{ valid: boolean; errors?: any }> {
  let schema;

  switch (preferenceType) {
    case "buy":
      schema = buyPreferenceFormValidationSchema;
      break;
    case "rent":
      schema = rentPreferenceFormValidationSchema;
      break;
    case "shortlet":
      schema = shortletPreferenceFormValidationSchema;
      break;
    case "joint-venture":
      schema = jvPreferenceFormValidationSchema;
      break;
    default:
      return { valid: false, errors: "Unknown preference type" };
  }

  try {
    await schema.validate(formData, { abortEarly: false });
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      errors: error.inner.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    };
  }
}

// ============================================================================
// END OF VALIDATION SCHEMAS
// ============================================================================
