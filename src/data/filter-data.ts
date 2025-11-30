/** @format */

export interface FilterConfig {
  buy: TabFilterConfig;
  jv: TabFilterConfig;
  rent: TabFilterConfig;
  shortlet: TabFilterConfig;
}

export interface TabFilterConfig {
  usageOptions: {
    label: string;
    options: string[];
  };
  homeCondition?: {
    label: string;
    options: string[];
  };
  documentTypes: string[];
  propertyFeatures: string[];
  tenantCriteria?: string[];
  landSizeTypes: LandSizeType[];
  bedroomOptions: BedroomOption[];
  bathroomOptions: BathroomOption[];
  priceRanges: PriceRange[];
}

export interface LandSizeType {
  value: string;
  label: string;
}

export interface BedroomOption {
  value: number | string;
  label: string;
}

export interface BathroomOption {
  value: number | string;
  label: string;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export const FILTER_DATA: FilterConfig = {
  buy: {
    usageOptions: {
      label: "Filter by",
      options: ["All", "Land", "Residential", "Commercial", "Duplex"],
    },
    documentTypes: [
      "Certificate of Occupancy (C of O)",
      "Deed of Assignment",
      "Survey Plan",
      "Building Plan Approval",
      "Tax Receipt",
      "Power of Attorney",
      "Probate/Letters of Administration",
      "Gazette",
      "Registered Conveyance",
      "Consent to Assignment",
      "Right of Occupancy",
      "Customary Right of Occupancy",
    ],
    propertyFeatures: [
      "Air Conditioning",
      "Swimming Pool",
      "Garden/Lawn",
      "Gym/Fitness Center",
      "Security System",
      "Backup Generator",
      "Solar Power",
      "Balcony/Terrace",
      "Garage",
      "Servant Quarters",
      "Study Room",
      "Dining Room",
      "Family Lounge",
      "Kitchen Pantry",
      "Walk-in Closet",
      "En-suite Bathroom",
      "Guest Toilet",
      "Laundry Room",
      "Storage Room",
      "Elevator",
      "Playground",
      "24/7 Security",
      "CCTV Surveillance",
      "Intercom System",
      "Gated Community",
      "Paved Roads",
      "Street Lighting",
      "Water Treatment Plant",
      "Sewage Treatment",
      "Waste Management",
      "Internet Access",
      "Cable TV Ready",
      "Smart Home Features",
    ],
    landSizeTypes: [
      { value: "plot", label: "Plot" },
      { value: "acres", label: "Acres" },
      { value: "sqm", label: "Sqr Meter" },
      { value: "hectares", label: "Hectares" },
    ],
    bedroomOptions: [
      { value: 1, label: "1 Bedroom" },
      { value: 2, label: "2 Bedrooms" },
      { value: 3, label: "3 Bedrooms" },
      { value: 4, label: "4 Bedrooms" },
      { value: 5, label: "5 Bedrooms" },
      { value: 6, label: "6 Bedrooms" },
      { value: 7, label: "7 Bedrooms" },
      { value: 8, label: "8 Bedrooms" },
      { value: 9, label: "9 Bedrooms" },
      { value: "10+", label: "10+ Bedrooms" },
    ],
    bathroomOptions: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: "10+", label: "10+" },
    ],
    priceRanges: [
      { label: "Under ₦1M", min: 0, max: 1000000 },
      { label: "₦1M - ₦5M", min: 1000000, max: 5000000 },
      { label: "₦5M - ₦10M", min: 5000000, max: 10000000 },
      { label: "₦10M - ₦20M", min: 10000000, max: 20000000 },
      { label: "₦20M - ₦50M", min: 20000000, max: 50000000 },
      { label: "₦50M - ₦100M", min: 50000000, max: 100000000 },
      { label: "₦100M - ₦500M", min: 100000000, max: 500000000 },
      { label: "Above ₦500M", min: 500000000, max: 0 },
    ],
  },
  jv: {
    usageOptions: {
      label: "Usage Options",
      options: ["All", "Land", "Residential", "Commercial"],
    },
    documentTypes: [
      "Certificate of Occupancy (C of O)",
      "Deed of Assignment",
      "Survey Plan",
      "Building Plan Approval",
      "Tax Receipt",
      "Power of Attorney",
      "Probate/Letters of Administration",
      "Gazette",
      "Registered Conveyance",
      "Consent to Assignment",
      "Right of Occupancy",
      "Customary Right of Occupancy",
      "Joint Venture Agreement",
      "Development Agreement",
      "Partnership Agreement",
    ],
    propertyFeatures: [
      "Air Conditioning",
      "Swimming Pool",
      "Garden/Lawn",
      "Gym/Fitness Center",
      "Security System",
      "Backup Generator",
      "Solar Power",
      "Balcony/Terrace",
      "Garage",
      "Servant Quarters",
      "Study Room",
      "Dining Room",
      "Family Lounge",
      "Kitchen Pantry",
      "Walk-in Closet",
      "En-suite Bathroom",
      "Guest Toilet",
      "Laundry Room",
      "Storage Room",
      "Elevator",
      "Playground",
      "24/7 Security",
      "CCTV Surveillance",
      "Intercom System",
      "Gated Community",
      "Paved Roads",
      "Street Lighting",
      "Water Treatment Plant",
      "Sewage Treatment",
      "Waste Management",
      "Development Potential",
      "Commercial Viability",
      "High ROI Potential",
    ],
    landSizeTypes: [
      { value: "plot", label: "Plot" },
      { value: "acres", label: "Acres" },
      { value: "sqm", label: "Sqr Meter" },
      { value: "hectares", label: "Hectares" },
    ],
    bedroomOptions: [
      { value: 1, label: "1 Bedroom" },
      { value: 2, label: "2 Bedrooms" },
      { value: 3, label: "3 Bedrooms" },
      { value: 4, label: "4 Bedrooms" },
      { value: 5, label: "5 Bedrooms" },
      { value: 6, label: "6 Bedrooms" },
      { value: 7, label: "7 Bedrooms" },
      { value: 8, label: "8 Bedrooms" },
      { value: 9, label: "9 Bedrooms" },
      { value: "10+", label: "10+ Bedrooms" },
    ],
    bathroomOptions: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: "10+", label: "10+" },
    ],
    priceRanges: [
      { label: "Under ₦5M", min: 0, max: 5000000 },
      { label: "₦5M - ₦20M", min: 5000000, max: 20000000 },
      { label: "₦20M - ₦50M", min: 20000000, max: 50000000 },
      { label: "₦50M - ₦100M", min: 50000000, max: 100000000 },
      { label: "₦100M - ₦500M", min: 100000000, max: 500000000 },
      { label: "₦500M - ₦1B", min: 500000000, max: 1000000000 },
      { label: "Above ₦1B", min: 1000000000, max: 0 },
    ],
  },
  rent: {
    usageOptions: {
      label: "Filter by",
      options: ["All", "Land", "Residential", "Commercial", "Duplex"],
    },
    homeCondition: {
      label: "Home Condition",
      options: [
        "All",
        "Brand New",
        "Good Condition",
        "Fairly Used",
        "Need Renovation",
        "New Building",
      ],
    },
    documentTypes: [
      "Certificate of Occupancy (C of O)",
      "Deed of Assignment",
      "Survey Plan",
      "Building Plan Approval",
      "Tax Receipt",
      "Tenancy Agreement",
      "Rent Receipt",
      "Caution Fee Receipt",
      "Agency Agreement",
    ],
    propertyFeatures: [
      "Air Conditioning",
      "Swimming Pool",
      "Garden/Lawn",
      "Gym/Fitness Center",
      "Security System",
      "Backup Generator",
      "Solar Power",
      "Balcony/Terrace",
      "Garage",
      "Servant Quarters",
      "Study Room",
      "Dining Room",
      "Family Lounge",
      "Kitchen Pantry",
      "Walk-in Closet",
      "En-suite Bathroom",
      "Guest Toilet",
      "Laundry Room",
      "Storage Room",
      "Elevator",
      "Playground",
      "24/7 Security",
      "CCTV Surveillance",
      "Intercom System",
      "Gated Community",
      "Paved Roads",
      "Street Lighting",
      "Water Treatment Plant",
      "Sewage Treatment",
      "Waste Management",
      "Internet Access",
      "Cable TV Ready",
      "Furnished",
      "Semi-Furnished",
    ],
    tenantCriteria: [
      "No Pets",
      "Pets Allowed",
      "No Smoking",
      "Smoking Allowed",
      "Students Welcome",
      "No Students",
      "Family Only",
      "Professionals Only",
      "Long-term Lease (1+ years)",
      "Short-term Lease (less than 1 year)",
      "Furnished",
      "Unfurnished",
      "Semi-Furnished",
      "Utilities Included",
      "Utilities Excluded",
      "Parking Included",
      "No Parking",
      "Credit Check Required",
      "References Required",
      "Employment Verification",
    ],
    bedroomOptions: [
      { value: 1, label: "1 Bedroom" },
      { value: 2, label: "2 Bedrooms" },
      { value: 3, label: "3 Bedrooms" },
      { value: 4, label: "4 Bedrooms" },
      { value: 5, label: "5 Bedrooms" },
      { value: 6, label: "6 Bedrooms" },
      { value: 7, label: "7 Bedrooms" },
      { value: 8, label: "8 Bedrooms" },
      { value: 9, label: "9 Bedrooms" },
      { value: "10+", label: "10+ Bedrooms" },
    ],
    bathroomOptions: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: "10+", label: "10+" },
    ],
    priceRanges: [
      { label: "Under ₦100K", min: 0, max: 100000 },
      { label: "₦100K - ₦300K", min: 100000, max: 300000 },
      { label: "₦300K - ₦500K", min: 300000, max: 500000 },
      { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
      { label: "₦1M - ₦2M", min: 1000000, max: 2000000 },
      { label: "₦2M - ₦5M", min: 2000000, max: 5000000 },
      { label: "Above ₦5M", min: 5000000, max: 0 },
    ],
    // Rent tab excludes land size types as per specification
    landSizeTypes: [],
  },
  shortlet: {
    usageOptions: {
      label: "Filter by Property Type",
      options: ["All", "Apartment", "Studio", "House", "Duplex", "Penthouse"],
    },
    homeCondition: {
      label: "Property Condition",
      options: ["All", "Brand New", "Good Condition", "Needs Renovation"],
    },
    documentTypes: [
      "Certificate of Occupancy",
      "Deed of Assignment",
      "Survey Plan",
      "Building Approval",
      "Governor's Consent",
      "Receipt of Purchase",
      "Customary Right of Occupancy",
      "Statutory Right of Occupancy",
      "Power of Attorney",
      "Probate/Letters of Administration",
    ],
    propertyFeatures: [
      "24/7 Security",
      "Power Generator",
      "Water Supply",
      "Swimming Pool",
      "Gym/Fitness Center",
      "Parking Space",
      "Air Conditioning",
      "WiFi/Internet",
      "Furnished",
      "Kitchen Appliances",
      "Balcony/Terrace",
      "Garden/Green Area",
      "Elevator",
      "CCTV Surveillance",
      "Gated Community",
      "Cleaning Service",
      "Laundry Service",
      "24/7 Concierge",
      "Conference Room",
      "Children's Playground",
    ],
    tenantCriteria: [
      "No Pets Allowed",
      "Pets Allowed",
      "No Smoking",
      "Smoking Allowed",
      "Professionals Only",
      "Students Welcome",
      "Families Preferred",
      "Singles Only",
      "Corporate Guests",
      "Short Notice OK",
      "Long-term Stays",
      "Monthly Billing",
      "Weekly Billing",
      "Daily Billing",
    ],
    bedroomOptions: [
      { value: 0, label: "Studio" },
      { value: 1, label: "1 Bedroom" },
      { value: 2, label: "2 Bedrooms" },
      { value: 3, label: "3 Bedrooms" },
      { value: 4, label: "4 Bedrooms" },
      { value: 5, label: "5 Bedrooms" },
      { value: 6, label: "6 Bedrooms" },
      { value: 7, label: "7 Bedrooms" },
      { value: 8, label: "8 Bedrooms" },
      { value: 9, label: "9 Bedrooms" },
      { value: "10+", label: "10+ Bedrooms" },
    ],
    bathroomOptions: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: "10+", label: "10+" },
    ],
    priceRanges: [
      { label: "Under ₦5K", min: 0, max: 5000 },
      { label: "₦5K - ₦10K", min: 5000, max: 10000 },
      { label: "₦10K - ₦20K", min: 10000, max: 20000 },
      { label: "₦20K - ₦30K", min: 20000, max: 30000 },
      { label: "₦30K - ₦50K", min: 30000, max: 50000 },
      { label: "₦50K - ₦100K", min: 50000, max: 100000 },
      { label: "Above ₦100K", min: 100000, max: 0 },
    ],
    // Shortlet tab excludes land size types
    landSizeTypes: [],
  },
};

// Helper functions to get data for specific tabs
export const getTabFilterData = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): TabFilterConfig => {
  return FILTER_DATA[tab];
};

export const getUsageOptions = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string[] => {
  return FILTER_DATA[tab].usageOptions.options;
};

export const getUsageOptionsLabel = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string => {
  return FILTER_DATA[tab].usageOptions.label;
};

export const getHomeConditionOptions = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string[] => {
  return FILTER_DATA[tab].homeCondition?.options || [];
};

export const getDocumentTypes = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string[] => {
  return FILTER_DATA[tab].documentTypes;
};

export const getPropertyFeatures = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string[] => {
  return FILTER_DATA[tab].propertyFeatures;
};

export const getTenantCriteria = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): string[] => {
  return FILTER_DATA[tab].tenantCriteria || [];
};

export const getLandSizeTypes = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): LandSizeType[] => {
  return FILTER_DATA[tab].landSizeTypes;
};

export const getBedroomOptions = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): BedroomOption[] => {
  return FILTER_DATA[tab].bedroomOptions;
};

export const getBathroomOptions = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): BathroomOption[] => {
  return FILTER_DATA[tab].bathroomOptions;
};

export const getPriceRanges = (
  tab: "buy" | "jv" | "rent" | "shortlet",
): PriceRange[] => {
  return FILTER_DATA[tab].priceRanges;
};
