/**
 * PREFERENCE SYSTEM - EXPORTABLE TYPES
 * 
 * Use this file in other applications to ensure consistent type definitions
 * with the preference submission system.
 * 
 * Includes:
 * - All interface definitions
 * - Form data structures
 * - API payload structures
 * - Configuration interfaces
 * - Validation schemas
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Geographic location selection for property search
 */
export interface LocationSelection {
  state: string;                    // State name (e.g., "Lagos", "Abuja")
  lgas: string[];                   // Local Government Areas (max 3)
  areas: string[];                  // Specific areas within LGAs (max 3)
  customLocation?: string;          // Fallback for unlisted locations (max 200 chars)
}

/**
 * Budget range for property search
 */
export interface BudgetRange {
  minPrice: number;                 // Minimum budget in Naira (> 0)
  maxPrice: number;                 // Maximum budget in Naira (> minPrice)
  currency: "NGN";                  // Currency code (NGN only)
}

/**
 * Selected amenities and features
 */
export interface FeatureSelection {
  basicFeatures: string[];          // Basic amenities selected
  premiumFeatures: string[];        // Premium amenities selected
  comfortFeatures?: string[];       // Comfort features (shortlet only)
  autoAdjustToBudget: boolean;      // Auto-adjust features if budget insufficient
}

/**
 * Standard contact information (Buy, Rent, Shortlet)
 */
export interface ContactInfo {
  fullName: string;                 // User's full name (2-100 chars, letters & spaces)
  email: string;                    // Valid email address
  phoneNumber: string;              // Nigerian phone number (+234 or 0 prefix)
  whatsappNumber?: string;          // Optional WhatsApp number (same format)
}

/**
 * Business contact information (Joint Venture)
 */
export interface JointVentureContactInfo {
  companyName: string;              // Company name (2-200 chars)
  contactPerson: string;            // Contact person name (2-100 chars, letters & spaces)
  email: string;                    // Company email
  phoneNumber: string;              // Company phone number (Nigerian format)
  whatsappNumber?: string;          // Optional company WhatsApp
  cacRegistrationNumber?: string;   // CAC registration number (RC######)
}

// ============================================================================
// PROPERTY DETAILS INTERFACES
// ============================================================================

/**
 * Buy preference property details
 */
export interface BuyPropertyDetails {
  propertySubtype: "Land" | "Residential" | "Commercial"; // Property type
  buildingType?: "Detached" | "Semi-Detached" | "Block of Flats"; // If not Land
  minBedrooms?: number | "More";    // Bedroom count (residential only)
  minBathrooms?: number;            // Bathroom count (optional)
  propertyCondition?: "New" | "Renovated" | "Any"; // Condition (if not Land)
  purpose?: "For living" | "Resale" | "Development"; // Purpose (residential)
  measurementUnit: "plot" | "sqm" | "hectares"; // Land measurement unit
  landSize?: number;                // For plot or hectares
  minLandSize?: number;             // For sqm range
  maxLandSize?: number;             // For sqm range
  documentTypes: string[];          // Required documents (min 1)
  landConditions?: string[];        // Land conditions (if applicable)
}

/**
 * Rent preference property details
 */
export interface RentPropertyDetails {
  propertySubtype: "Self-con" | "Flat" | "Mini Flat" | "Bungalow";
  buildingType?: "Detached" | "Semi-Detached" | "Block of Flats";
  minBedrooms: number | "More";     // Minimum bedrooms (required)
  minBathrooms?: number;            // Bathroom count (optional)
  leaseTerm: "6 Months" | "1 Year"; // Lease term (required)
  propertyCondition: "New" | "Renovated"; // Condition (required)
  purpose: "Residential" | "Office"; // Purpose (required)
  measurementUnit?: "plot" | "sqm" | "hectares"; // Optional land spec
  landSize?: number;                // For plot/hectares
  minLandSize?: number;             // For sqm range
  maxLandSize?: number;             // For sqm range
}

/**
 * Shortlet preference property details
 */
export interface ShortletPropertyDetails {
  propertyType: "Studio" | "1-Bed Apartment" | "2-Bed Flat";
  minBedrooms: number;              // Number of bedrooms
  numberOfBathrooms: number;        // Number of bathrooms (min 1)
  maxGuests: number;                // Maximum guests (1-20)
  travelType: string;               // Travel type (solo, couple, family, group, business)
  nearbyLandmark?: string;          // Reference landmark (max 200 chars)
}

/**
 * Booking details for shortlet
 */
export interface ShortletBookingDetails {
  checkInDate: string;              // ISO date format (YYYY-MM-DD)
  checkOutDate: string;             // ISO date format (must be > checkInDate)
  preferredCheckInTime?: string;    // HH:MM 24-hour format
  preferredCheckOutTime?: string;   // HH:MM 24-hour format
}

/**
 * Joint venture development details
 */
export interface JVDevelopmentDetails {
  developmentTypes: string[];       // Types of development (min 1)
  minLandSize: string;              // Minimum land size (required)
  maxLandSize?: string;             // Maximum land size (optional)
  measurementUnit: "plot" | "sqm" | "hectares"; // Land measurement unit
  jvType: "Equity Split" | "Lease-to-Build" | "Development Partner";
  propertyType: "Land" | "Old Building" | "Structure to demolish";
  expectedStructureType?: string;   // Expected buildings (e.g., Luxury Duplexes)
  timeline: "Ready Now" | "In 3 Months" | "Within 1 Year";
  budgetRange?: number;             // Optional budget indicator
  preferredSharingRatio?: string;   // Sharing ratio (e.g., "50-50", "60-40")
  proposalDetails?: string;         // Proposal description (max 1000 chars)
  minimumTitleRequirements: string[]; // Required title docs (min 1)
  willingToConsiderPendingTitle?: boolean; // Flexibility on pending title
}

// ============================================================================
// PREFERENCE FORM INTERFACES
// ============================================================================

/**
 * Base preference form structure
 */
export interface BasePreferenceForm {
  location: LocationSelection;      // Geographic preferences
  budget: BudgetRange;              // Budget parameters
  features: FeatureSelection;       // Feature preferences
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  contactInfo: ContactInfo | JointVentureContactInfo; // Contact details
  additionalNotes?: string;         // Optional notes (max 1000 chars)
}

/**
 * Buy preference form
 */
export interface BuyPreferenceForm extends BasePreferenceForm {
  preferenceType: "buy";
  propertyDetails: BuyPropertyDetails;
  nearbyLandmark?: string;          // Reference landmark (max 200 chars)
  contactInfo: ContactInfo;         // Standard contact
}

/**
 * Rent preference form
 */
export interface RentPreferenceForm extends BasePreferenceForm {
  preferenceType: "rent";
  propertyDetails: RentPropertyDetails;
  contactInfo: ContactInfo;         // Standard contact
}

/**
 * Shortlet preference form
 */
export interface ShortletPreferenceForm extends BasePreferenceForm {
  preferenceType: "shortlet";
  propertyDetails: ShortletPropertyDetails;
  bookingDetails: ShortletBookingDetails;
  contactInfo: ContactInfo;         // Standard contact
}

/**
 * Joint venture preference form
 */
export interface JointVenturePreferenceForm extends BasePreferenceForm {
  preferenceType: "joint-venture";
  developmentDetails: JVDevelopmentDetails;
  partnerExpectations?: string;     // Partner expectations (max 1000 chars)
  contactInfo: JointVentureContactInfo; // Business contact
}

/**
 * Union type for all preference forms
 */
export type PreferenceForm =
  | BuyPreferenceForm
  | RentPreferenceForm
  | ShortletPreferenceForm
  | JointVenturePreferenceForm;

// ============================================================================
// API PAYLOAD INTERFACES
// ============================================================================

/**
 * Location payload for API
 */
export interface LocationPayload {
  state: string;
  localGovernmentAreas: string[];
  selectedAreas?: string[];
  customLocation?: string;
}

/**
 * Budget payload for API
 */
export interface BudgetPayload {
  minPrice: number;
  maxPrice: number;
  currency: "NGN";
}

/**
 * Features payload for API
 */
export interface FeaturesPayload {
  baseFeatures: string[];
  premiumFeatures: string[];
  comfortFeatures?: string[];
  autoAdjustToFeatures: boolean;
}

/**
 * Buy preference API payload
 */
export interface BuyPreferencePayload {
  preferenceType: "buy";
  preferenceMode: "buy";
  userId: string;
  location: LocationPayload;
  budget: BudgetPayload;
  propertyDetails: BuyPropertyDetails;
  features: FeaturesPayload;
  contactInfo: ContactInfo;
  nearbyLandmark?: string;
  additionalNotes?: string;
}

/**
 * Rent preference API payload
 */
export interface RentPreferencePayload {
  preferenceType: "rent";
  preferenceMode: "tenant";
  userId: string;
  location: LocationPayload;
  budget: BudgetPayload;
  propertyDetails: RentPropertyDetails;
  features: FeaturesPayload;
  contactInfo: ContactInfo;
  additionalNotes?: string;
}

/**
 * Shortlet preference API payload
 */
export interface ShortletPreferencePayload {
  preferenceType: "shortlet";
  preferenceMode: "shortlet";
  userId: string;
  location: LocationPayload;
  budget: BudgetPayload;
  propertyDetails: ShortletPropertyDetails;
  bookingDetails: ShortletBookingDetails;
  features: FeaturesPayload;
  contactInfo: ContactInfo;
  additionalNotes?: string;
}

/**
 * Joint venture preference API payload
 */
export interface JVPreferencePayload {
  preferenceType: "joint-venture";
  preferenceMode: "developer";
  userId: string;
  location: LocationPayload;
  budget: BudgetPayload;
  developmentDetails: JVDevelopmentDetails;
  features: FeaturesPayload;
  contactInfo: JointVentureContactInfo;
  partnerExpectations?: string;
}

/**
 * Union type for all preference payloads
 */
export type PreferencePayload =
  | BuyPreferencePayload
  | RentPreferencePayload
  | ShortletPreferencePayload
  | JVPreferencePayload;

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

/**
 * Feature definition
 */
export interface FeatureDefinition {
  name: string;                     // Feature name (e.g., "Swimming Pool")
  type: "basic" | "premium" | "comfort"; // Feature category
  minBudgetRequired?: number;       // Minimum budget to access feature
  tooltip?: string;                 // Help text for feature
}

/**
 * Feature configuration for property type
 */
export interface FeatureConfig {
  basic: FeatureDefinition[];       // Basic features available
  premium: FeatureDefinition[];     // Premium features available
  comfort?: FeatureDefinition[];    // Optional comfort features (shortlet)
}

/**
 * Budget threshold for location and type
 */
export interface BudgetThreshold {
  location: string;                 // Location identifier ("Lagos", "Abuja", "default")
  listingType: string;              // Listing type ("buy", "rent", "joint-venture", "shortlet")
  minAmount: number;                // Minimum budget in Naira
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;                    // Field path (e.g., "contactInfo.email")
  message: string;                  // Error message
}

/**
 * Form step configuration
 */
export interface FormStep {
  id: string;                       // Unique step identifier
  title: string;                    // Display title
  isValid: boolean;                 // Current validation status
  isRequired: boolean;              // Is step required to submit
}

/**
 * Complete preference stored in database
 */
export interface StoredPreference {
  id: string;                       // Unique preference ID
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  preferenceMode: "buy" | "tenant" | "developer" | "shortlet";
  userId: string;                   // User/company ID
  data: PreferenceForm;             // Complete preference data
  status: "active" | "paused" | "fulfilled" | "expired" | "archived";
  matchedProperties?: string[];     // Matched property IDs
  createdAt: Date;                  // Creation timestamp
  updatedAt: Date;                  // Last update timestamp
  submittedAt?: Date;               // Submission timestamp
  views: number;                    // View count
  responses: number;                // Response count
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Budget thresholds for different locations
 */
export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  // Lagos thresholds
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Lagos", listingType: "shortlet", minAmount: 15000 },
  { location: "Lagos", listingType: "joint-venture", minAmount: 10000000 },

  // Abuja thresholds
  { location: "Abuja", listingType: "buy", minAmount: 8000000 },
  { location: "Abuja", listingType: "rent", minAmount: 300000 },
  { location: "Abuja", listingType: "shortlet", minAmount: 25000 },
  { location: "Abuja", listingType: "joint-venture", minAmount: 15000000 },

  // Default thresholds
  { location: "default", listingType: "buy", minAmount: 2000000 },
  { location: "default", listingType: "rent", minAmount: 100000 },
  { location: "default", listingType: "shortlet", minAmount: 10000 },
  { location: "default", listingType: "joint-venture", minAmount: 5000000 },
];

/**
 * Preference type enumeration
 */
export enum PreferenceTypeEnum {
  BUY = "buy",
  RENT = "rent",
  SHORTLET = "shortlet",
  JOINT_VENTURE = "joint-venture",
}

/**
 * Preference mode enumeration
 */
export enum PreferenceModeEnum {
  BUY = "buy",
  TENANT = "tenant",
  SHORTLET = "shortlet",
  DEVELOPER = "developer",
}

/**
 * Status enumeration
 */
export enum PreferenceStatusEnum {
  ACTIVE = "active",
  PAUSED = "paused",
  FULFILLED = "fulfilled",
  EXPIRED = "expired",
  ARCHIVED = "archived",
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Phone number validation pattern (Nigerian)
 * Format: +234 or 0 prefix, operator 7/8/9, bank 0/1, then 8 digits
 */
export const PHONE_PATTERN = /^(\+234|0)[789][01]\d{8}$/;

/**
 * Email validation pattern
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Full name validation pattern (letters and spaces only)
 */
export const FULL_NAME_PATTERN = /^[a-zA-Z\s]+$/;

/**
 * CAC registration pattern (RC followed by 6-7 digits)
 */
export const CAC_PATTERN = /^RC\d{6,7}$/;

/**
 * Budget ratio pattern (e.g., "50-50", "60-40")
 */
export const RATIO_PATTERN = /^\d{1,3}-\d{1,3}$/;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Flexible form data for dynamic updates
 */
export interface FlexibleFormData {
  location?: LocationSelection;
  budget?: BudgetRange;
  features?: FeatureSelection;
  preferenceType?: string;
  contactInfo?: any;
  additionalNotes?: string;
  propertyDetails?: any;
  developmentDetails?: any;
  bookingDetails?: any;
  nearbyLandmark?: string;
  partnerExpectations?: string;
  [key: string]: any;
}

/**
 * API response for preference submission
 */
export interface PreferenceSubmissionResponse {
  success: boolean;
  preferenceId?: string;
  message: string;
  errors?: ValidationError[];
  data?: any;
}

/**
 * Query parameters for preference search
 */
export interface PreferenceQueryParams {
  preferenceType?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if preference is a Buy preference
 */
export function isBuyPreference(
  preference: PreferenceForm
): preference is BuyPreferenceForm {
  return preference.preferenceType === "buy";
}

/**
 * Type guard to check if preference is a Rent preference
 */
export function isRentPreference(
  preference: PreferenceForm
): preference is RentPreferenceForm {
  return preference.preferenceType === "rent";
}

/**
 * Type guard to check if preference is a Shortlet preference
 */
export function isShortletPreference(
  preference: PreferenceForm
): preference is ShortletPreferenceForm {
  return preference.preferenceType === "shortlet";
}

/**
 * Type guard to check if preference is a Joint Venture preference
 */
export function isJVPreference(
  preference: PreferenceForm
): preference is JointVenturePreferenceForm {
  return preference.preferenceType === "joint-venture";
}

/**
 * Type guard to check if contact is JV contact
 */
export function isJVContactInfo(
  contact: ContactInfo | JointVentureContactInfo
): contact is JointVentureContactInfo {
  return "companyName" in contact;
}

// ============================================================================
// END OF TYPES
// ============================================================================
