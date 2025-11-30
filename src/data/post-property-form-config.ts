/** @format */

// Dynamic form configuration for post property
export interface FormField {
  id: string;
  type:
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "radio"
    | "checkbox"
    | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ value: string; label: string }>;
  dependsOn?: {
    field: string;
    value: string | string[];
  };
  showForBriefTypes?: string[];
  showForPropertyTypes?: string[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface BriefTypeConfig {
  value: string;
  label: string;
  description: string;
  icon: string;
  commissionRate: {
    landowner: number;
    agent: number;
  };
}

export interface PropertyTypeConfig {
  briefType: string;
  options: Array<{ value: string; label: string }>;
}

// Brief types configuration
export const briefTypesConfig: BriefTypeConfig[] = [
  {
    value: "sell",
    label: "Sell Property",
    description: "I want to sell my property for an outright sale",
    icon: "🏡",
    commissionRate: {
      landowner: 10,
      agent: 20,
    },
  },
  {
    value: "rent",
    label: "Rent Property",
    description: "I want to rent out my property to tenants",
    icon: "🔑",
    commissionRate: {
      landowner: 10,
      agent: 20,
    },
  },
  {
    value: "shortlet",
    label: "Shortlet Property",
    description: "I want to list my property for short-term rental",
    icon: "📅",
    commissionRate: {
      landowner: 15,
      agent: 25,
    },
  },
  {
    value: "jv",
    label: "Joint Venture",
    description: "I want to partner with investors for development",
    icon: "🤝",
    commissionRate: {
      landowner: 10,
      agent: 20,
    },
  },
];

// Property types for each brief type
export const propertyTypesConfig: PropertyTypeConfig[] = [
  {
    briefType: "sell",
    options: [
      { value: "Residential", label: "Residential" },
      { value: "Commercial", label: "Commercial" },
      { value: "Land", label: "Land" },
    ],
  },
  {
    briefType: "rent",
    options: [
      { value: "Residential", label: "Residential" },
      { value: "Commercial", label: "Commercial" },
      { value: "Land", label: "Land" },
    ],
  },
  {
    briefType: "shortlet",
    options: [
      { value: "Residential", label: "Residential" },
      { value: "Commercial", label: "Commercial" },
    ],
  },
  {
    briefType: "jv",
    options: [
      { value: "Residential", label: "Residential" },
      { value: "Commercial", label: "Commercial" },
      { value: "Mixed Development", label: "Mixed Development" },
    ],
  },
];

// Dynamic form steps configuration
export const formStepsConfig: FormStep[] = [
  {
    id: "property-type",
    title: "Property Type Selection",
    description: "Select what type of brief you want to submit",
    fields: [
      {
        id: "propertyType",
        type: "radio",
        label: "Type of Brief",
        required: true,
        options: briefTypesConfig.map((brief) => ({
          value: brief.value,
          label: brief.label,
        })),
      },
    ],
  },
  {
    id: "basic-details",
    title: "Basic Details",
    description: "Provide basic information about your property",
    fields: [
      {
        id: "propertyCategory",
        type: "select",
        label: "Property Category",
        required: true,
        options: [], // Will be populated dynamically based on brief type
      },
      {
        id: "state",
        type: "select",
        label: "State",
        required: true,
        options: [], // Will be populated from location API
      },
      {
        id: "lga",
        type: "select",
        label: "Local Government Area",
        required: true,
        dependsOn: { field: "state", value: [] },
        options: [],
      },
      {
        id: "area",
        type: "text",
        label: "Area/Neighborhood",
        placeholder: "Enter area or neighborhood",
        required: true,
      },
      {
        id: "price",
        type: "text",
        label: "Price",
        placeholder: "Enter price",
        required: true,
      },
      {
        id: "rentalType",
        type: "select",
        label: "Rental Type",
        required: true,
        showForBriefTypes: ["rent"],
        showForPropertyTypes: ["Residential", "Commercial"],
        options: [
          { value: "Rent", label: "Rent" },
          { value: "Lease", label: "Lease" },
        ],
      },
      {
        id: "propertyCondition",
        type: "select",
        label: "Property Condition",
        required: true,
        showForBriefTypes: ["rent", "shortlet"],
        showForPropertyTypes: ["Residential", "Commercial"],
        options: [
          { value: "Brand New", label: "Brand New" },
          { value: "Good Condition", label: "Good Condition" },
          { value: "Needs Renovation", label: "Needs Renovation" },
        ],
      },
      {
        id: "leaseHold",
        type: "text",
        label: "Lease Hold Duration",
        placeholder: "e.g., 2 years",
        required: false,
        dependsOn: { field: "rentalType", value: ["Lease"] },
        showForBriefTypes: ["rent"],
      },
      {
        id: "shortletDuration",
        type: "select",
        label: "Shortlet Duration",
        required: true,
        showForBriefTypes: ["shortlet"],
        options: [
          { value: "Daily", label: "Daily" },
          { value: "Weekly", label: "Weekly" },
          { value: "Monthly", label: "Monthly" },
        ],
      },
      {
        id: "landSize",
        type: "text",
        label: "Land Size",
        placeholder: "Enter land size",
        required: false,
        showForBriefTypes: ["sell", "jv"],
        showForPropertyTypes: ["Land", "Residential", "Commercial"],
      },
      {
        id: "measurementType",
        type: "select",
        label: "Measurement Type",
        required: false,
        showForBriefTypes: ["sell", "jv"],
        showForPropertyTypes: ["Land", "Residential", "Commercial"],
        options: [
          { value: "Plot", label: "Plot" },
          { value: "Acres", label: "Acres" },
          { value: "Square Meter", label: "Square Meter" },
        ],
      },
      {
        id: "typeOfBuilding",
        type: "select",
        label: "Type of Building",
        required: true,
        showForPropertyTypes: ["Residential", "Commercial"],
        options: [
          { value: "Bungalow", label: "Bungalow" },
          { value: "Duplex", label: "Duplex" },
          { value: "Apartment", label: "Apartment" },
          { value: "Office Building", label: "Office Building" },
          { value: "Warehouse", label: "Warehouse" },
          { value: "Shop", label: "Shop" },
        ],
      },
      {
        id: "bedrooms",
        type: "number",
        label: "Number of Bedrooms",
        required: true,
        showForPropertyTypes: ["Residential"],
        validation: { min: 0, max: 20 },
      },
      {
        id: "bathrooms",
        type: "number",
        label: "Number of Bathrooms",
        required: true,
        showForPropertyTypes: ["Residential"],
        validation: { min: 0, max: 20 },
      },
      {
        id: "toilets",
        type: "number",
        label: "Number of Toilets",
        required: false,
        showForPropertyTypes: ["Residential"],
        validation: { min: 0, max: 20 },
      },
      {
        id: "parkingSpaces",
        type: "number",
        label: "Number of Car Parks",
        required: false,
        showForPropertyTypes: ["Residential", "Commercial"],
        validation: { min: 0, max: 50 },
      },
    ],
  },
  {
    id: "features-conditions",
    title: "Features & Conditions",
    description: "Specify property features and conditions",
    fields: [
      {
        id: "documents",
        type: "multiselect",
        label: "Documents on Property",
        required: true,
        showForBriefTypes: ["sell", "jv"],
        options: [
          {
            value: "Certificate of Occupancy",
            label: "Certificate of Occupancy",
          },
          { value: "Deed of Assignment", label: "Deed of Assignment" },
          { value: "Survey Plan", label: "Survey Plan" },
          { value: "Building Approval", label: "Building Approval" },
          { value: "Governor's Consent", label: "Governor's Consent" },
        ],
      },
      {
        id: "jvConditions",
        type: "multiselect",
        label: "JV Conditions",
        required: true,
        showForBriefTypes: ["jv"],
        options: [
          { value: "50/50 Split", label: "50/50 Split" },
          { value: "60/40 Split", label: "60/40 Split" },
          { value: "70/30 Split", label: "70/30 Split" },
          { value: "Custom Agreement", label: "Custom Agreement" },
          { value: "None", label: "None" },
        ],
      },
      {
        id: "features",
        type: "multiselect",
        label: "Property Features",
        required: false,
        options: [
          { value: "Swimming Pool", label: "Swimming Pool" },
          { value: "Gym", label: "Gym" },
          { value: "Security", label: "Security" },
          { value: "Generator", label: "Generator" },
          { value: "Air Conditioning", label: "Air Conditioning" },
          { value: "Balcony", label: "Balcony" },
          { value: "Garden", label: "Garden" },
          { value: "Parking", label: "Parking" },
        ],
      },
      {
        id: "tenantCriteria",
        type: "multiselect",
        label: "Tenant Criteria",
        required: false,
        showForBriefTypes: ["rent", "shortlet"],
        options: [
          { value: "No Pets", label: "No Pets" },
          { value: "No Smoking", label: "No Smoking" },
          { value: "Professional Only", label: "Professional Only" },
          { value: "Family Preferred", label: "Family Preferred" },
          { value: "Students Welcome", label: "Students Welcome" },
        ],
      },
      {
        id: "isTenanted",
        type: "radio",
        label: "Property Tenancy Status",
        required: true,
        options: [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "I live in it", label: "I live in it" },
        ],
      },
      {
        id: "additionalInfo",
        type: "textarea",
        label: "Additional Information",
        placeholder: "Provide any additional details about the property",
        required: false,
      },
    ],
  },
  {
    id: "image-upload",
    title: "Upload Images",
    description: "Upload property images (minimum 4 required)",
    fields: [
      {
        id: "images",
        type: "text", // Special handling in component
        label: "Property Images",
        required: true,
      },
    ],
  },
  {
    id: "ownership-declaration",
    title: "Owner Declaration",
    description: "Confirm ownership and provide contact information",
    fields: [
      {
        id: "contactInfo.firstName",
        type: "text",
        label: "First Name",
        required: true,
        placeholder: "Enter your first name",
      },
      {
        id: "contactInfo.lastName",
        type: "text",
        label: "Last Name",
        required: true,
        placeholder: "Enter your last name",
      },
      {
        id: "contactInfo.email",
        type: "text",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email",
      },
      {
        id: "contactInfo.phone",
        type: "text",
        label: "Phone Number",
        required: true,
        placeholder: "Enter your phone number",
      },
      {
        id: "isLegalOwner",
        type: "checkbox",
        label: "Legal Owner Confirmation",
        required: true,
        options: [
          {
            value: "true",
            label:
              "I confirm that I am the legal owner of this property or authorized to submit this brief",
          },
        ],
      },
    ],
  },
];

// Helper functions to get configuration
export const getBriefTypeConfig = (
  briefType: string,
): BriefTypeConfig | undefined => {
  return briefTypesConfig.find((config) => config.value === briefType);
};

export const getPropertyTypesForBrief = (
  briefType: string,
): Array<{ value: string; label: string }> => {
  const config = propertyTypesConfig.find(
    (config) => config.briefType === briefType,
  );
  return config?.options || [];
};

export const getCommissionRate = (
  briefType: string,
  userType: "landowner" | "agent",
): number => {
  const config = getBriefTypeConfig(briefType);
  if (!config) return userType === "landowner" ? 10 : 20; // Default rates
  return config.commissionRate[userType];
};

export const getFieldsForStep = (
  stepId: string,
  briefType?: string,
  propertyCategory?: string,
): FormField[] => {
  const step = formStepsConfig.find((step) => step.id === stepId);
  if (!step) return [];

  return step.fields.filter((field) => {
    // Check if field should show for current brief type
    if (field.showForBriefTypes && briefType) {
      if (!field.showForBriefTypes.includes(briefType)) {
        return false;
      }
    }

    // Check if field should show for current property type
    if (field.showForPropertyTypes && propertyCategory) {
      if (!field.showForPropertyTypes.includes(propertyCategory)) {
        return false;
      }
    }

    return true;
  });
};

export const validateFieldValue = (
  field: FormField,
  value: any,
): string | null => {
  if (
    field.required &&
    (!value || (Array.isArray(value) && value.length === 0))
  ) {
    return `${field.label} is required`;
  }

  if (field.validation) {
    const validation = field.validation;

    if (
      validation.min !== undefined &&
      typeof value === "number" &&
      value < validation.min
    ) {
      return `${field.label} must be at least ${validation.min}`;
    }

    if (
      validation.max !== undefined &&
      typeof value === "number" &&
      value > validation.max
    ) {
      return `${field.label} must be at most ${validation.max}`;
    }

    if (
      validation.minLength !== undefined &&
      typeof value === "string" &&
      value.length < validation.minLength
    ) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (
      validation.maxLength !== undefined &&
      typeof value === "string" &&
      value.length > validation.maxLength
    ) {
      return `${field.label} must be at most ${validation.maxLength} characters`;
    }

    if (
      validation.pattern &&
      typeof value === "string" &&
      !new RegExp(validation.pattern).test(value)
    ) {
      return `${field.label} format is invalid`;
    }
  }

  return null;
};
