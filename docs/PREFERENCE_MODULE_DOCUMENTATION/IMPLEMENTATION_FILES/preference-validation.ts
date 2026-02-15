/**
 * PREFERENCE VALIDATION SCHEMAS
 * Copy this file to: src/utils/validation/preference-validation.ts
 * Uses Yup for form validation across all preference types
 * Install: npm install yup
 */

import * as Yup from "yup";

// Base validation schemas
const locationSchema = Yup.object({
  state: Yup.string().required("Please select a state"),
  lgas: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one Local Government Area"),
  areas: Yup.array()
    .of(Yup.string())
    .test(
      "areas-or-custom",
      "Please select areas or provide a custom location",
      function (value) {
        const { customLocation } = this.parent;
        return (value && value.length > 0) || customLocation;
      }
    )
    .max(3, "Maximum 3 areas can be selected"),
  customLocation: Yup.string().nullable(),
});

const budgetSchema = Yup.object({
  minPrice: Yup.number()
    .min(1, "Minimum price must be greater than 0")
    .required("Minimum price is required"),
  maxPrice: Yup.number()
    .min(1, "Maximum price must be greater than 0")
    .test(
      "max-greater-than-min",
      "Maximum price must be greater than minimum price",
      function (value) {
        const { minPrice } = this.parent;
        return !minPrice || !value || value > minPrice;
      }
    )
    .required("Maximum price is required"),
  currency: Yup.string().default("NGN"),
});

const featuresSchema = Yup.object({
  basicFeatures: Yup.array().of(Yup.string()).default([]),
  premiumFeatures: Yup.array().of(Yup.string()).default([]),
  autoAdjustToBudget: Yup.boolean().default(false),
});

const contactInfoSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
    .required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number"
    )
    .required("Phone number is required"),
  whatsappNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian WhatsApp number"
    )
    .nullable(),
});

const jointVentureContactSchema = Yup.object({
  companyName: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must be less than 200 characters")
    .required("Company name is required"),
  contactPerson: Yup.string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must be less than 100 characters")
    .matches(
      /^[a-zA-Z\s]+$/,
      "Contact person name can only contain letters and spaces"
    )
    .required("Contact person is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number"
    )
    .required("Phone number is required"),
  whatsappNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian WhatsApp number"
    )
    .nullable(),
  cacRegistrationNumber: Yup.string()
    .matches(
      /^RC\d{6,7}$/,
      "Please enter a valid CAC registration number (e.g., RC123456)"
    )
    .nullable(),
});

// Property Details Schemas
const buyPropertyDetailsSchema = Yup.object({
  propertySubtype: Yup.string()
    .oneOf(
      ["land", "residential", "commercial"],
      "Please select a valid property type"
    )
    .required("Property type is required"),
  buildingType: Yup.string().when("propertySubtype", {
    is: (val: string) => val !== "land",
    then: (schema) => schema.required("Building type is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  propertyCondition: Yup.string().when("propertySubtype", {
    is: (val: string) => val !== "land",
    then: (schema) => schema.required("Property condition is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  bedrooms: Yup.string().when("propertySubtype", {
    is: "residential",
    then: (schema) => schema.required("Number of bedrooms is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  bathrooms: Yup.number().when("propertySubtype", {
    is: (val: string) => val === "residential" || val === "commercial",
    then: (schema) => schema.min(0, "Number of bathrooms cannot be negative"),
    otherwise: (schema) => schema.nullable(),
  }),
});

const rentPropertyDetailsSchema = Yup.object({
  propertySubtype: Yup.string()
    .oneOf(["residential", "commercial"], "Please select a valid property type")
    .required("Property type is required"),
  buildingType: Yup.string().required("Building type is required"),
  propertyCondition: Yup.string().required("Property condition is required"),
  bedrooms: Yup.string().when("propertySubtype", {
    is: "residential",
    then: (schema) => schema.required("Number of bedrooms is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  bathrooms: Yup.number().min(0, "Number of bathrooms cannot be negative"),
  leaseTerm: Yup.string()
    .oneOf(["6 Months", "1 Year"], "Please select a valid lease term")
    .default("1 Year"),
  purpose: Yup.string()
    .oneOf(["Residential", "Office"], "Please select a valid purpose")
    .default("Residential"),
});

const shortletPropertyDetailsSchema = Yup.object({
  propertyType: Yup.string()
    .oneOf(
      ["studio", "apartment", "duplex", "bungalow"],
      "Please select a valid property type"
    )
    .required("Property type is required"),
  bedrooms: Yup.string().required("Number of bedrooms is required"),
  bathrooms: Yup.number()
    .min(1, "At least 1 bathroom is required")
    .required("Number of bathrooms is required"),
  maxGuests: Yup.number()
    .min(1, "At least 1 guest is required")
    .max(20, "Maximum 20 guests allowed")
    .required("Maximum number of guests is required"),
});

const shortletBookingDetailsSchema = Yup.object({
  checkInDate: Yup.date()
    .min(new Date(), "Check-in date cannot be in the past")
    .required("Check-in date is required"),
  checkOutDate: Yup.date()
    .min(Yup.ref("checkInDate"), "Check-out date must be after check-in date")
    .required("Check-out date is required"),
});

// Joint Venture specific schemas
const developmentDetailsSchema = Yup.object({
  minLandSize: Yup.string().required("Land size is required"),
  jvType: Yup.string()
    .oneOf(
      ["Equity Split", "Lease-to-Build", "Development Partner"],
      "Please select a valid JV type"
    )
    .required("Joint venture type is required"),
  propertyType: Yup.string()
    .oneOf(
      ["land", "residential", "commercial"],
      "Please select a valid property type"
    )
    .required("Property type is required"),
  timeline: Yup.string()
    .oneOf(
      ["Ready Now", "In 3 Months", "Within 1 Year"],
      "Please select a valid timeline"
    )
    .required("Timeline is required"),
});

// Main validation schemas for each preference type
export const buyPreferenceValidationSchema = Yup.object({
  preferenceType: Yup.string().equals(["buy"]).required(),
  location: locationSchema,
  budget: budgetSchema,
  features: featuresSchema,
  propertyDetails: buyPropertyDetailsSchema,
  contactInfo: contactInfoSchema,
  nearbyLandmark: Yup.string().nullable(),
  additionalNotes: Yup.string()
    .max(1000, "Additional notes must be less than 1000 characters")
    .nullable(),
});

export const rentPreferenceValidationSchema = Yup.object({
  preferenceType: Yup.string().equals(["rent"]).required(),
  location: locationSchema,
  budget: budgetSchema,
  features: featuresSchema,
  propertyDetails: rentPropertyDetailsSchema,
  contactInfo: contactInfoSchema,
  additionalNotes: Yup.string()
    .max(1000, "Additional notes must be less than 1000 characters")
    .nullable(),
});

export const jointVenturePreferenceValidationSchema = Yup.object({
  preferenceType: Yup.string().equals(["joint-venture"]).required(),
  location: locationSchema,
  budget: budgetSchema,
  features: featuresSchema,
  developmentDetails: developmentDetailsSchema,
  contactInfo: jointVentureContactSchema,
  partnerExpectations: Yup.string()
    .max(1000, "Partner expectations must be less than 1000 characters")
    .nullable(),
});

export const shortletPreferenceValidationSchema = Yup.object({
  preferenceType: Yup.string().equals(["shortlet"]).required(),
  location: locationSchema,
  budget: budgetSchema,
  features: featuresSchema,
  propertyDetails: shortletPropertyDetailsSchema,
  bookingDetails: shortletBookingDetailsSchema,
  contactInfo: contactInfoSchema,
  additionalNotes: Yup.string()
    .max(1000, "Additional notes must be less than 1000 characters")
    .nullable(),
});

// Helper function to get validation schema based on preference type
export const getValidationSchema = (preferenceType: string) => {
  switch (preferenceType) {
    case "buy":
      return buyPreferenceValidationSchema;
    case "rent":
      return rentPreferenceValidationSchema;
    case "joint-venture":
      return jointVenturePreferenceValidationSchema;
    case "shortlet":
      return shortletPreferenceValidationSchema;
    default:
      throw new Error(`Invalid preference type: ${preferenceType}`);
  }
};

// Step-specific validation schemas
export const locationStepSchema = locationSchema;
export const budgetStepSchema = budgetSchema;
export const featuresStepSchema = featuresSchema;
export const contactStepSchema = contactInfoSchema;
export const jointVentureContactStepSchema = jointVentureContactSchema;

// Export individual schemas for component use
export {
  locationSchema,
  budgetSchema,
  featuresSchema,
  contactInfoSchema,
  jointVentureContactSchema,
  buyPropertyDetailsSchema,
  rentPropertyDetailsSchema,
  shortletPropertyDetailsSchema,
  shortletBookingDetailsSchema,
  developmentDetailsSchema,
};
