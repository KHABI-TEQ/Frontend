/** @format */

import * as Yup from "yup";

// Helper function to format currency values
export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return "";
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.]/g, ""))
      : value;
  if (isNaN(numValue)) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(numValue);
};

// Helper function to format number with commas
export const formatNumber = (value: string | number): string => {
  if (!value && value !== 0) return "";
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.]/g, ""))
      : value;
  if (isNaN(numValue)) return "";
  return numValue.toLocaleString();
};

// Validation messages
const messages = {
  required: (field: string) => `${field} is required`,
  min: (field: string, min: number) => `${field} must be at least ${min}`,
  max: (field: string, max: number) => `${field} must be at most ${max}`,
  positive: (field: string) => `${field} must be a positive number`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid Nigerian phone number",
  minArray: (field: string, min: number) =>
    `Please select at least ${min} ${field}`,
};

// Base schemas for reusable fields
const stateSchema = Yup.object({
  value: Yup.string().required(),
  label: Yup.string().required(),
}).required(messages.required("State"));

const lgaSchema = Yup.object({
  value: Yup.string().required(),
  label: Yup.string().required(),
}).required(messages.required("Local Government"));

const areaSchema = Yup.string().required();

const priceSchema = Yup.string()
  .required(messages.required("Property Value"))
  .test("positive-price", messages.positive("Property Value"), (value) => {
    if (!value) return false;
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    return !isNaN(numValue) && numValue > 0;
  });

const contactInfoSchema = Yup.object({
  firstName: Yup.string()
    .min(2, messages.min("First name", 2))
    .max(50, messages.max("First name", 50))
    .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces")
    .required(messages.required("First name")),
  lastName: Yup.string()
    .min(2, messages.min("Last name", 2))
    .max(50, messages.max("Last name", 50))
    .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces")
    .required(messages.required("Last name")),
  email: Yup.string()
    .email(messages.email)
    .required(messages.required("Email")),
  phone: Yup.string()
    .matches(/^(\+234|0)[789][01]\d{8}$/, messages.phone)
    .required(messages.required("Phone number")),
});

// Property-specific validation schemas
const sellPropertySchema = Yup.object({
  propertyCategory: Yup.string()
    .oneOf(
      ["Residential", "Commercial", "Land"],
      "Please select a valid property category",
    )
    .required(messages.required("Property category")),
  propertyCondition: Yup.string().when("propertyCategory", {
    is: (category: string) => category !== "Land",
    then: (schema) => schema.required(messages.required("Property condition")),
    otherwise: (schema) => schema.nullable(),
  }),
  typeOfBuilding: Yup.string().when("propertyCategory", {
    is: (category: string) =>
      category === "Residential" || category === "Commercial",
    then: (schema) => schema.required(messages.required("Building type")),
    otherwise: (schema) => schema.nullable(),
  }),
  bedrooms: Yup.number().when("propertyCategory", {
    is: (category: string) =>
      category === "Residential" || category === "Commercial",
    then: (schema) =>
      schema
        .min(1, messages.min("Number of bedrooms", 1))
        .required(messages.required("Number of bedrooms")),
    otherwise: (schema) => schema.nullable(),
  }),
  measurementType: Yup.string().when("propertyCategory", {
    is: "Land",
    then: (schema) => schema.required(messages.required("Type of measurement")),
    otherwise: (schema) => schema.nullable(),
  }),
  landSize: Yup.string().when("propertyCategory", {
    is: "Land",
    then: (schema) => schema.required(messages.required("Land size")),
    otherwise: (schema) => schema.nullable(),
  }),
  documents: Yup.array()
    .of(Yup.string())
    .min(1, messages.minArray("document", 1))
    .required("At least one property document is required"),
  state: stateSchema,
  lga: lgaSchema,
  area: areaSchema,
  price: priceSchema,
  contactInfo: contactInfoSchema,
});

const rentPropertySchema = Yup.object({
  propertyCategory: Yup.string()
    .oneOf(
      ["Residential", "Commercial"],
      "Please select a valid property category",
    )
    .required(messages.required("Property category")),
  rentalType: Yup.string()
    .oneOf(["Rent", "Lease"], "Please select a valid rental type")
    .required(messages.required("Rental type")),
  propertyCondition: Yup.string().required(
    messages.required("Property condition"),
  ),
  typeOfBuilding: Yup.string().required(messages.required("Building type")),
  bedrooms: Yup.number()
    .min(1, messages.min("Number of bedrooms", 1))
    .required(messages.required("Number of bedrooms")),
  isTenanted: Yup.string()
    .oneOf(["Yes", "No"], "Please specify if property is currently tenanted")
    .required(messages.required("Tenancy status")),
  state: stateSchema,
  lga: lgaSchema,
  area: areaSchema,
  price: priceSchema,
  contactInfo: contactInfoSchema,
});

const shortletPropertySchema = Yup.object({
  propertyCategory: Yup.string()
    .oneOf(["Residential"], "Shortlet properties must be residential")
    .required(messages.required("Property category")),
  shortletDuration: Yup.string()
    .oneOf(
      ["Daily", "Weekly", "Monthly"],
      "Please select a valid shortlet duration",
    )
    .required(messages.required("Shortlet duration")),
  // Property condition not required for shortlet
  typeOfBuilding: Yup.string().required(messages.required("Building type")),
  bedrooms: Yup.number()
    .min(1, messages.min("Number of bedrooms", 1))
    .required(messages.required("Number of bedrooms")),
  streetAddress: Yup.string().required(messages.required("Street address")),
  availability: Yup.object({
    minStay: Yup.number()
      .min(1, messages.min("Minimum stay", 1))
      .required(messages.required("Minimum stay")),
  }),
  pricing: Yup.object({
    nightly: Yup.number()
      .min(1, messages.min("Nightly rate", 1))
      .required(messages.required("Nightly rate")),
    weeklyDiscount: Yup.number()
      .min(0, "Weekly discount must be at least 0%")
      .max(100, "Weekly discount cannot exceed 100%")
      .nullable(),
    monthlyDiscount: Yup.number()
      .min(0, "Monthly discount must be at least 0%")
      .max(100, "Monthly discount cannot exceed 100%")
      .nullable(),
  }),
  houseRules: Yup.object({
    checkIn: Yup.string().required(messages.required("Check-in time")),
    checkOut: Yup.string().required(messages.required("Check-out time")),
  }),
  state: stateSchema,
  lga: lgaSchema,
  area: areaSchema,
  price: priceSchema,
  contactInfo: contactInfoSchema,
});

const jvPropertySchema = Yup.object({
  propertyCategory: Yup.string()
    .oneOf(
      ["Residential", "Commercial", "Land"],
      "Please select a valid property category",
    )
    .required(messages.required("Property category")),
  // JV properties do not require property condition, building type, or bedrooms
  // These fields are optional for all JV property categories
  propertyCondition: Yup.string().nullable(),
  typeOfBuilding: Yup.string().nullable(),
  bedrooms: Yup.number().nullable(),
  measurementType: Yup.string().when("propertyCategory", {
    is: "Land",
    then: (schema) => schema.required(messages.required("Type of measurement")),
    otherwise: (schema) => schema.nullable(),
  }),
  landSize: Yup.string().when("propertyCategory", {
    is: "Land",
    then: (schema) => schema.required(messages.required("Land size")),
    otherwise: (schema) => schema.nullable(),
  }),
  documents: Yup.array()
    .of(Yup.string())
    .min(1, messages.minArray("document", 1))
    .required("At least one property document is required"),
  jvConditions: Yup.array()
    .of(Yup.string())
    .min(1, messages.minArray("JV condition", 1))
    .required("At least one JV condition is required"),
  isTenanted: Yup.string()
    .oneOf(["Yes", "No"], "Please specify if property is currently tenanted")
    .required(messages.required("Tenancy status")),
  state: stateSchema,
  lga: lgaSchema,
  area: areaSchema,
  price: priceSchema,
  contactInfo: contactInfoSchema,
});

// Main validation schema that switches based on property type
export const getPostPropertyValidationSchema = (propertyType: string) => {
  switch (propertyType) {
    case "sell":
      return sellPropertySchema;
    case "rent":
      return rentPropertySchema;
    case "shortlet":
      return shortletPropertySchema;
    case "jv":
      return jvPropertySchema;
    default:
      return Yup.object({});
  }
};

// Step-specific validation schemas
export const step1ValidationSchema = (propertyType: string) => {
  const baseSchema = {
    propertyCategory: Yup.string().required(),
    state: stateSchema,
    lga: lgaSchema,
    area: areaSchema,
    price: priceSchema,
  };

  switch (propertyType) {
    case "rent":
      return Yup.object({
        ...baseSchema,
        rentalType: Yup.string().required(),
        propertyCondition: Yup.string().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        typeOfBuilding: Yup.string().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        bedrooms: Yup.number().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.min(1).required(),
          otherwise: (schema) => schema.nullable(),
        }),
        landSize: Yup.string().when("propertyCategory", {
          is: (category: string) => category === "Commercial",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        measurementType: Yup.string().when("propertyCategory", {
          is: (category: string) => category === "Commercial",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
      });

    case "shortlet":
      return Yup.object({
        ...baseSchema,
        shortletDuration: Yup.string().required(),
        typeOfBuilding: Yup.string().required(),
        bedrooms: Yup.number().min(1).required(),
        streetAddress: Yup.string().required(),
        maxGuests: Yup.number().min(1).required(),
      });

        case "jv":
      return Yup.object({
        ...baseSchema,
        // JV properties do not require property condition, building type, or bedrooms
        propertyCondition: Yup.string().nullable(),
        typeOfBuilding: Yup.string().nullable(),
        bedrooms: Yup.number().nullable(),
        measurementType: Yup.string().when("propertyCategory", {
          is: "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        landSize: Yup.string().when("propertyCategory", {
          is: "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
      });

    case "sell":
    default:
      return Yup.object({
        ...baseSchema,
        propertyCondition: Yup.string().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        typeOfBuilding: Yup.string().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        bedrooms: Yup.number().when("propertyCategory", {
          is: (category: string) => category !== "Land",
          then: (schema) => schema.min(1).required(),
          otherwise: (schema) => schema.nullable(),
        }),
        measurementType: Yup.string().when("propertyCategory", {
          is: "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
        landSize: Yup.string().when("propertyCategory", {
          is: "Land",
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.nullable(),
        }),
      });
  }
};

export const step2ValidationSchema = (propertyType: string) => {
  switch (propertyType) {
    case "sell":
      return Yup.object({
        documents: Yup.array()
          .of(Yup.string())
          .min(1, "Please select at least one property document")
          .required("Property documents are required"),
        isTenanted: Yup.string().required("Please specify tenancy status"),
      });

    case "jv":
      return Yup.object({
        documents: Yup.array()
          .of(Yup.string())
          .min(1, "Please select at least one property document")
          .required("Property documents are required"),
        jvConditions: Yup.array()
          .of(Yup.string())
          .min(1, "Please select at least one JV condition")
          .required("JV conditions are required"),
        isTenanted: Yup.string().required("Please specify tenancy status"),
      });

    case "shortlet":
      return Yup.object({
        availability: Yup.object({
          minStay: Yup.number().min(1).required("Minimum stay is required"),
        }).required(),
        pricing: Yup.object({
          nightly: Yup.number().min(1).required("Nightly rate is required"),
          weeklyDiscount: Yup.number().min(0).max(100).nullable(),
          monthlyDiscount: Yup.number().min(0).max(100).nullable(),
        }).required(),
        houseRules: Yup.object({
          checkIn: Yup.string().required("Check-in time is required"),
          checkOut: Yup.string().required("Check-out time is required"),
        }).required(),
      });

    case "rent":
    default:
      return Yup.object({
        isTenanted: Yup.string().required("Please specify tenancy status"),
      });
  }
};

export const step3ValidationSchema = () => {
  return Yup.object({
    // Image validation will be handled by the component's areImagesValid function
  });
};

export const step4ValidationSchema = () => {
  return Yup.object({
    contactInfo: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone number is required"),
    }).required(),
    isLegalOwner: Yup.boolean().required("Please confirm ownership status"),
  });
};

// Export individual schemas for direct use
export {
  sellPropertySchema,
  rentPropertySchema,
  shortletPropertySchema,
  jvPropertySchema,
  contactInfoSchema,
};
