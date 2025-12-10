/** @format */

// Comprehensive Post Property Form Configuration
export const BRIEF_TYPES = {
  SELL: "sell",
  RENT: "rent",
  JV: "jv",
  SHORTLET: "shortlet",
} as const;

export const PROPERTY_CATEGORIES = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
  MIXED_DEVELOPMENT: "Mixed Development",
} as const;

// Brief Type Configurations
export const briefTypeConfig = {
  [BRIEF_TYPES.SELL]: {
    label: "Sell Property (Outright Sale)",
    description: "I want to sell my property for an outright sale",
    icon: "🏡",
    propertyCategories: [
      PROPERTY_CATEGORIES.RESIDENTIAL,
      PROPERTY_CATEGORIES.COMMERCIAL,
      PROPERTY_CATEGORIES.LAND,
    ],
    commission: {
      landowner: 10,
      agent: 50, // 50% of agent's commission
    },
  },
  [BRIEF_TYPES.RENT]: {
    label: "Rent",
    description: "I want to rent out my property to tenants",
    icon: "🔑",
    propertyCategories: [
      PROPERTY_CATEGORIES.RESIDENTIAL,
      PROPERTY_CATEGORIES.COMMERCIAL,
      PROPERTY_CATEGORIES.LAND,
    ],
    commission: {
      landowner: 10,
      agent: 0, // No commission deducted by Khabiteq
    },
  },
  [BRIEF_TYPES.JV]: {
    label: "Joint Venture (JV)",
    description: "I want to partner with investors for development",
    icon: "🤝",
    propertyCategories: [
      PROPERTY_CATEGORIES.RESIDENTIAL,
      PROPERTY_CATEGORIES.COMMERCIAL,
      PROPERTY_CATEGORIES.LAND,
      PROPERTY_CATEGORIES.MIXED_DEVELOPMENT,
    ],
    commission: {
      landowner: 10,
      agent: 50,
    },
  },
  [BRIEF_TYPES.SHORTLET]: {
    label: "Shortlet",
    description: "I want to list my property for short-term rental",
    icon: "📅",
    propertyCategories: [PROPERTY_CATEGORIES.RESIDENTIAL],
    commission: {
      landowner: 7,
      agent: 7,
    },
  },
};

// Property Condition Options
export const propertyConditionOptions = [
  { value: "new", label: "New" },
  { value: "good-condition", label: "Good Condition" },
  { value: "old", label: "Old" },
];

// Building Type Options - Updated to match specifications
export const buildingTypeOptions = {
  residential: [
    { value: "bungalow", label: "Bungalow" },
    { value: "duplex", label: "Duplex" },
    { value: "detached", label: "Detached" },
    { value: "semi-detached", label: "Semi-Detached" },
    { value: "block-of-flats", label: "Block of Flats" },
    { value: "penthouse", label: "Penthouse" },
    { value: "terrace", label: "Terrace" },
  ],
  commercial: [
    { value: "offices", label: "Offices" },
    { value: "studio", label: "Studio" },
    { value: "retail-space", label: "Retail Space" },
    { value: "showroom", label: "Showroom" },
    { value: "warehouse", label: "Warehouse" },
    { value: "shopping-complex", label: "Shopping Complex" },
  ],
  shortlet: [
    { value: "apartment", label: "Apartment" },
    { value: "duplex", label: "Duplex" },
    { value: "studio", label: "Studio" },
    { value: "bungalow", label: "Bungalow" },
    { value: "penthouse", label: "Penthouse" },
  ],
};


// Document Types - Exact list from specifications (formatted with lowercase hyphenated values)
export const documentOptions = [
  { value: "deed-of-assignment", label: "Deed of Assignment" },
  { value: "deed-of-ownership", label: "Deed of Ownership" },
  { value: "deed-of-conveyance", label: "Deed of Conveyance" },
  { value: "survey-plan", label: "Survey Plan" },
  { value: "governor's-consent", label: "Governor's Consent" },
  { value: "certificate-of-occupancy", label: "Certificate of Occupancy" },
  { value: "family-receipt", label: "Family Receipt" },
  { value: "contract-of-sale", label: "Contract of Sale" },
  { value: "land-certificate", label: "Land Certificate" },
  { value: "gazette", label: "Gazette" },
  { value: "excision", label: "Excision" },
];


// Features & Amenities for Residential Properties - Formatted with lowercase hyphenated values
export const residentialFeatures = [
  { value: "gym", label: "Gym" },
  { value: "kitchenette", label: "Kitchenette" },
  { value: "security-cameras", label: "Security Cameras" },
  { value: "swimming-pool", label: "Swimming Pool" },
  { value: "childrens-playground", label: "Children's Playground" },
  { value: "rooftop-access", label: "Rooftop Access" },
  { value: "walk-in-closet", label: "Walk-In Closet" },
  { value: "wifi", label: "WiFi" },
  { value: "library", label: "Library" },
  { value: "home-office", label: "Home Office" },
  { value: "cinema-room", label: "Cinema Room" },
  { value: "bathtub", label: "Bathtub" },
  { value: "tennis-court", label: "Tennis Court" },
  { value: "garage", label: "Garage" },
  { value: "elevator", label: "Elevator" },
  { value: "staff-room", label: "Staff Room" },
  { value: "pantry", label: "Pantry" },
  { value: "electric-fencing", label: "Electric Fencing" },
  { value: "inverter", label: "Inverter" },
  { value: "built-in-cupboards", label: "Built-In Cupboards" },
  { value: "security-post", label: "Security Post" },
  { value: "access-gate", label: "Access Gate" },
  { value: "sea-view", label: "Sea View" },
  { value: "air-conditioning", label: "Air Conditioning" },
  { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
  { value: "garden", label: "Garden" },
  { value: "jacuzzi", label: "Jacuzzi" },
  { value: "open-floor-plan", label: "Open Floor Plan" },
];


// Features for Land Properties - Formatted with lowercase hyphenated values
export const landFeatures = [
  { value: "perimeter-fence", label: "Perimeter Fence" },
  { value: "electricity-nearby", label: "Electricity Nearby" },
  { value: "drainage-system-in-place", label: "Drainage System In Place" },
  { value: "water-supply-available", label: "Water Supply Available" },
  { value: "security-post-or-nearby", label: "Security Post or Nearby" },
  { value: "estate-land-within-a-gated-estate", label: "Estate Land (within a gated estate)" },
  { value: "developed-neighborhood", label: "Developed Neighborhood" },
  { value: "developing-neighborhood", label: "Developing Neighborhood" },
  { value: "high-foot-traffic-area", label: "High Foot Traffic Area" },
  { value: "close-to-major-landmark-or-expressway", label: "Close to Major Landmark / Expressway" },
];


// Commercial Property Features - Formatted with lowercase hyphenated values
export const commercialFeatures = {
  structure: [
    { value: "open-floor-plan", label: "Open Floor Plan" },
    { value: "private-offices", label: "Private Offices" },
    { value: "conference-meeting-rooms", label: "Conference / Meeting Rooms" },
    { value: "reception-area", label: "Reception Area" },
    { value: "partitioned-spaces", label: "Partitioned Spaces" },
    { value: "elevator-lift-access", label: "Elevator / Lift Access" },
    { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
  ],
  utilities: [
    { value: "industrial-power-connection", label: "Industrial Power Connection" },
    { value: "prepaid-electricity-meter", label: "Prepaid Electricity Meter" },
    { value: "borehole-constant-water-supply", label: "Borehole / Constant Water Supply" },
    { value: "air-conditioning", label: "Air Conditioning" },
  ],
  security: [
    { value: "security-personnel-onsite", label: "Security Personnel Onsite" },
    { value: "gated-compound", label: "Gated Compound" },
    { value: "cctv-surveillance", label: "CCTV Surveillance" },
    { value: "access-control-smart-locks", label: "Access Control / Smart Locks" },
    { value: "fire-safety-equipment-alarms-extinguishers", label: "Fire Safety Equipment (Alarms, Extinguishers)" },
  ],
  parking: [
    { value: "dedicated-parking-spaces", label: "Dedicated Parking Spaces" },
    { value: "visitor-parking", label: "Visitor Parking" },
    { value: "modern-glass-facade", label: "Modern Glass Facade" },
    { value: "signage-branding-space", label: "Signage / Branding Space" },
    { value: "rooftop-terrace-area", label: "Rooftop / Terrace Area" },
    { value: "located-in-central-business-district-cbd", label: "Located in Central Business District (CBD)" },
  ],
};


// Rental Conditions - Updated to match exact specifications
export const rentalConditions = [
  { value: "no-pets-allowed", label: "No Pets Allowed" },
  { value: "must-provide-credit-report", label: "Must Provide Credit Report" },
  {
    value: "tenant-responsible-for-basic-maintenance",
    label: "Tenant Responsible for Basic Maintenance",
  },
];


// Employment Types - Exact list from specifications
export const employmentTypes = [
  { value: "employee", label: "Employee" },
  { value: "self-employed", label: "Self Employed" },
  { value: "corporate-tenant", label: "Corporate Tenant" },
  { value: "individual-tenant", label: "Individual Tenant" },
];


// Tenant Gender Preferences - Exact list from specifications
export const tenantGenderPreferences = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "both", label: "Both" },
];


// JV Conditions - Exact list from specifications
export const jvConditions = [
  { value: "proof-of-fund", label: "Proof of Fund" },
  { value: "premium", label: "Premium" },
  { value: "installment-plan", label: "Installment Plan" },
  { value: "none", label: "None" },
];

// Tenancy Status Options - Updated to match specifications exactly
export const tenancyStatusOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "i-live-in-it", label: "I live in it" },
];

// Shortlet Specific Options - Comprehensive list from specifications
export const shortletOptions = {
  propertyTypes: [
    { value: "apartment", label: "Apartment" },
    { value: "duplex", label: "Duplex" },
    { value: "studio", label: "Studio" },
    { value: "bungalow", label: "Bungalow" },
    { value: "penthouse", label: "Penthouse" },
  ],
  cancellationPolicies: [
    {
      value: "flexible",
      label: "Flexible – Full refund 1 day before check-in",
    },
    {
      value: "moderate",
      label: "Moderate – Full refund 5 days before check-in",
    },
    {
      value: "strict",
      label: "Strict – 50% refund up to 7 days before check-in",
    },
  ],
  amenities: {
    general: [
      { value: "air-conditioning", label: "Air Conditioning" },
      { value: "wi-fi", label: "Wi-Fi" },
      { value: "smart-tv", label: "Smart TV" },
      { value: "dstv", label: "DSTV" },
      { value: "king-bed", label: "King Bed" },
      { value: "balcony", label: "Balcony" },
      { value: "work-desk", label: "Work Desk" },
      { value: "inverter", label: "Inverter" },
    ],
    kitchen: [
      { value: "gas-cooker", label: "Gas Cooker" },
      { value: "refrigerator", label: "Refrigerator" },
      { value: "microwave", label: "Microwave" },
      { value: "coffee-maker", label: "Coffee Maker" },
      { value: "kitchen-utensils", label: "Kitchen Utensils" },
    ],
    bathroom: [
      { value: "ensuite", label: "Ensuite" },
      { value: "bathtub", label: "Bathtub" },
      { value: "water-heater", label: "Water Heater" },
      { value: "hair-dryer", label: "Hair Dryer" },
      { value: "towels", label: "Towels" },
      { value: "toiletries", label: "Toiletries" },
    ],
    leisure: [
      { value: "pool", label: "Pool" },
      { value: "gym", label: "Gym" },
      { value: "rooftop-view", label: "Rooftop View" },
      { value: "lounge-area", label: "Lounge Area" },
    ],
    transport: [
      { value: "free-parking", label: "Free Parking" },
      { value: "paid-parking", label: "Paid Parking" },
      { value: "car-hire", label: "Car Hire" },
      { value: "shuttle", label: "Shuttle" },
      { value: "elevator", label: "Elevator" },
    ],
    laundry: [
      { value: "washing-machine", label: "Washing Machine" },
      { value: "dryer", label: "Dryer" },
      { value: "ironing", label: "Ironing" },
    ],
    security: [
      { value: "24-7-security", label: "24/7 Security" },
      { value: "cctv", label: "CCTV" },
      { value: "gated-estate", label: "Gated Estate" },
      { value: "fire-extinguisher", label: "Fire Extinguisher" },
      { value: "smoke-detector", label: "Smoke Detector" },
    ],
    family: [
      { value: "baby-cot", label: "Baby Cot" },
      { value: "kids-playground", label: "Kids Playground" },
      { value: "high-chair", label: "High Chair" },
    ],
    accessibility: [
      { value: "wheelchair-access", label: "Wheelchair Access" },
      { value: "step-free-entry", label: "Step-Free Entry" },
    ],
    location: [
      { value: "sea-view", label: "Sea View" },
      { value: "close-to-mall", label: "Close to Mall" },
      { value: "airport-proximity", label: "Airport Proximity" },
      { value: "quiet-area", label: "Quiet Area" },
    ],
  },
};


// Payment methods for shortlet
export const paymentMethods = [
  { value: "bank-transfer-ngn", label: "Bank Transfer (NGN)" },
  { value: "mtn-momo", label: "MTN Momo" },
  { value: "opay", label: "Opay" },
  { value: "other-mobile-money", label: "Other Mobile Money" },
];

// Number options (for bedrooms, bathrooms, etc.)
export const numberOptions = Array.from({ length: 21 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

// Helper function to get features based on property category and brief type
export const getFeaturesByCategory = (category: string, briefType: string) => {
  switch (category) {
    case PROPERTY_CATEGORIES.RESIDENTIAL:
      if (briefType === BRIEF_TYPES.SHORTLET) {
        // Flatten all shortlet amenities
        return [
          ...shortletOptions.amenities.general,
          ...shortletOptions.amenities.kitchen,
          ...shortletOptions.amenities.bathroom,
          ...shortletOptions.amenities.leisure,
          ...shortletOptions.amenities.transport,
          ...shortletOptions.amenities.laundry,
          ...shortletOptions.amenities.security,
          ...shortletOptions.amenities.family,
          ...shortletOptions.amenities.accessibility,
          ...shortletOptions.amenities.location,
        ];
      }
      return residentialFeatures;
    case PROPERTY_CATEGORIES.COMMERCIAL:
      if (briefType === BRIEF_TYPES.SHORTLET) {
        return [
          ...shortletOptions.amenities.general,
          ...shortletOptions.amenities.kitchen,
          ...shortletOptions.amenities.bathroom,
          ...shortletOptions.amenities.leisure,
          ...shortletOptions.amenities.transport,
          ...shortletOptions.amenities.laundry,
          ...shortletOptions.amenities.security,
          ...shortletOptions.amenities.family,
          ...shortletOptions.amenities.accessibility,
          ...shortletOptions.amenities.location,
        ];
      }
      return [
        ...commercialFeatures.structure,
        ...commercialFeatures.utilities,
        ...commercialFeatures.security,
        ...commercialFeatures.parking,
      ];
    case PROPERTY_CATEGORIES.LAND:
      return landFeatures;
    default:
      return [];
  }
};

// Helper function to check if field should be displayed
export const shouldShowField = (
  fieldId: string,
  briefType: string,
  propertyCategory: string,
  dependencies?: Record<string, any>,
) => {
  const rules: Record<string, any> = {
        // Property Condition - only for Residential/Commercial (not Land), and NEVER for JV
    propertyCondition:
      briefType !== BRIEF_TYPES.JV &&
      (briefType === BRIEF_TYPES.SELL ||
        briefType === BRIEF_TYPES.RENT ||
        briefType === BRIEF_TYPES.SHORTLET) &&
      (propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL),

        // Building Type - only for Residential/Commercial, but NEVER for JV
    typeOfBuilding:
      briefType !== BRIEF_TYPES.JV &&
      (propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL),

        // Room Details - only for Residential/Commercial, but NEVER for JV
    bedrooms:
      briefType !== BRIEF_TYPES.JV &&
      (propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL),
    bathrooms:
      briefType !== BRIEF_TYPES.JV &&
      (propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL),
    toilets:
      briefType !== BRIEF_TYPES.JV &&
      (propertyCategory === PROPERTY_CATEGORIES.RESIDENTIAL ||
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL),

        // Land Size - for all Sell properties, for Commercial Rent, and all JV (NOT for shortlet)
    landSize:
      briefType === BRIEF_TYPES.SELL ||
      (briefType === BRIEF_TYPES.RENT &&
        propertyCategory === PROPERTY_CATEGORIES.COMMERCIAL) ||
      briefType === BRIEF_TYPES.JV,

    // Rental Type - only for Rent
    rentalType: briefType === BRIEF_TYPES.RENT,

    // Lease Hold - only for Rent when Lease is selected
    leaseHold:
      briefType === BRIEF_TYPES.RENT && dependencies?.rentalType === "Lease",

    // Documents - for Sell and JV
    documents: briefType === BRIEF_TYPES.SELL || briefType === BRIEF_TYPES.JV,

    // JV Conditions - only for JV
    jvConditions: briefType === BRIEF_TYPES.JV,

    // Rental Conditions - for Rent (except Land)
    rentalConditions:
      briefType === BRIEF_TYPES.RENT &&
      propertyCategory !== PROPERTY_CATEGORIES.LAND,

    // Employment Type - for Rent (except Land)
    employmentType:
      briefType === BRIEF_TYPES.RENT &&
      propertyCategory !== PROPERTY_CATEGORIES.LAND,

    // Tenant Gender Preference - for Rent (except Land)
    tenantGenderPreference:
      briefType === BRIEF_TYPES.RENT &&
      propertyCategory !== PROPERTY_CATEGORIES.LAND,

    // Shortlet specific fields
    shortletDuration: briefType === BRIEF_TYPES.SHORTLET,
    maxGuests: briefType === BRIEF_TYPES.SHORTLET,

    // Available for all property types
    streetAddress: true,
    minStay: briefType === BRIEF_TYPES.SHORTLET,
    maxStay: briefType === BRIEF_TYPES.SHORTLET,
    nightly: briefType === BRIEF_TYPES.SHORTLET,
    weeklyDiscount: briefType === BRIEF_TYPES.SHORTLET,
    monthlyDiscount: briefType === BRIEF_TYPES.SHORTLET,
    cleaningFee: briefType === BRIEF_TYPES.SHORTLET,
    securityDeposit: briefType === BRIEF_TYPES.SHORTLET,
    cancellationPolicy: briefType === BRIEF_TYPES.SHORTLET,
    checkIn: briefType === BRIEF_TYPES.SHORTLET,
    checkOut: briefType === BRIEF_TYPES.SHORTLET,
    smokingAllowed: briefType === BRIEF_TYPES.SHORTLET,
    petsAllowed: briefType === BRIEF_TYPES.SHORTLET,
    partiesAllowed: briefType === BRIEF_TYPES.SHORTLET,
    paymentMethod: briefType === BRIEF_TYPES.SHORTLET,
    bankDetails: briefType === BRIEF_TYPES.SHORTLET,
  };

  return rules[fieldId] !== undefined ? rules[fieldId] : true;
};

// Function to get fields that should be cleared when property category changes
export const getFieldsToClearOnCategoryChange = (briefType: string) => {
    return [
    // Clear price and location fields
    "price",
    "state",
    "lga",
    "area",
    "streetAddress",

    // Clear property details
    "propertyCondition",
    "typeOfBuilding",
    "bedrooms",
    "bathrooms",
    "toilets",
    "parkingSpaces",
    "maxGuests",

    // Clear size and measurement
    "landSize",
    "measurementType",

    // Clear rental/lease specific
    "rentalType",
    "leaseHold",

    // Clear shortlet specific
    "shortletDuration",
    "availability",
    "pricing",
    "houseRules",

    // Clear features and conditions
    "features",
    "documents",
    "jvConditions",
    "rentalConditions",
    "employmentType",
    "tenantGenderPreference",
    "isTenanted",

    // Clear descriptions
    "additionalInfo",
    "description",
  ];
};

// Function to get commission text
export const getCommissionText = (
  briefType: string,
  userType: "landowner" | "agent",
  userName: string,
) => {
  const config = briefTypeConfig[briefType as keyof typeof briefTypeConfig];
  if (!config) return "";

  if (userType === "landowner") {
    const rate = config.commission.landowner;
    if (briefType === BRIEF_TYPES.SHORTLET) {
      return `I, ${userName}, agree that Khabiteq Realty shall earn ${rate}% of the total value generated from this transaction when the deal is closed.`;
    } else if (briefType === BRIEF_TYPES.RENT) {
      return `I, ${userName}, agree that Khabiteq Realty shall earn ${rate}% of the final rental deal value as commission when the deal is closed.`;
    } else if (briefType === BRIEF_TYPES.SELL) {
      return `I, ${userName}, agree that Khabiteq Realty shall earn ${rate}% of the total value generated from this transaction as commission when the deal is closed.`;
    } else {
      return `I, ${userName}, agree that Khabiteq Realty shall earn ${rate}% of the total value generated from this transaction as commission when the deal is closed.`;
    }
  } else {
    // Agent
    if (briefType === BRIEF_TYPES.RENT) {
      return `I understand that Khabiteq does not collect commission on agent rental deals.`;
    } else {
      const rate = config.commission.agent;
      return `I, ${userName}, agree that Khabiteq Realty shall earn ${rate}% of the total commission accrued to me when the deal is closed.`;
    }
  }
};
