# Data Structures

Complete TypeScript interface definitions for the Preference Submission Module.

## Core Interfaces

### LocationSelection
Represents geographic selection for property search.

```typescript
interface LocationSelection {
  state: string;                    // State name (e.g., "Lagos", "Abuja")
  lgas: string[];                   // Local Government Areas (max 3)
  areas: string[];                  // Specific areas within LGAs (max 3)
  customLocation?: string;          // Fallback for unlisted locations
}
```

**Constraints**:
- `state`: Required, must be valid Nigerian state
- `lgas`: Required, 1-3 LGAs per selection
- `areas`: 0-3 areas per selection, OR
- `customLocation`: Custom location text if areas not found

### BudgetRange
Defines minimum and maximum budget for property search.

```typescript
interface BudgetRange {
  minPrice: number;                 // Minimum budget in Naira
  maxPrice: number;                 // Maximum budget in Naira
  currency: "NGN";                  // Currency code (NGN only)
}
```

**Constraints**:
- `minPrice`: > 0, required
- `maxPrice`: > minPrice, required
- `maxPrice` must be greater than `minPrice`

### FeatureSelection
User's selected amenities and features.

```typescript
interface FeatureSelection {
  basicFeatures: string[];          // Basic amenities selected
  premiumFeatures: string[];        // Premium amenities selected
  autoAdjustToBudget: boolean;      // Auto-adjust features if budget insufficient
}
```

**Constraints**:
- `basicFeatures`: Array of feature names from configuration
- `premiumFeatures`: Array of feature names from configuration
- `autoAdjustToBudget`: If true, premium features removed if insufficient budget

### ContactInfo
Standard contact information.

```typescript
interface ContactInfo {
  fullName: string;                 // User's full name (2-100 chars, letters & spaces)
  email: string;                    // Valid email address
  phoneNumber: string;              // Nigerian phone number (+234 or 0 prefix)
  whatsappNumber?: string;          // Optional WhatsApp number
}
```

**Constraints**:
- `fullName`: 2-100 chars, only letters and spaces
- `email`: Valid email format
- `phoneNumber`: Format ^(\+234|0)[789][01]\d{8}$
- `whatsappNumber`: Same format as phoneNumber

### JointVentureContactInfo
Extended contact information for business entities.

```typescript
interface JointVentureContactInfo {
  companyName: string;              // Company name (2-200 chars)
  contactPerson: string;            // Contact person name (2-100 chars)
  email: string;                    // Company email
  phoneNumber: string;              // Company phone number
  whatsappNumber?: string;          // Company WhatsApp number
  cacRegistrationNumber?: string;   // CAC registration number (RC######)
}
```

**Constraints**:
- `companyName`: 2-200 chars
- `contactPerson`: 2-100 chars, letters and spaces only
- `cacRegistrationNumber`: Format RC\d{6,7}

## Preference Type Interfaces

### BasePreferenceForm
Base structure shared by all preference types.

```typescript
interface BasePreferenceForm {
  location: LocationSelection;      // Geographic preferences
  budget: BudgetRange;              // Budget parameters
  features: FeatureSelection;       // Feature preferences
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  contactInfo: ContactInfo;         // Contact details
  additionalNotes?: string;         // Optional notes (max 1000 chars)
}
```

### BuyPreferenceForm
Specific structure for property purchase preferences.

```typescript
interface BuyPreferenceForm extends BasePreferenceForm {
  preferenceType: "buy";
  propertyDetails: {
    propertyType: "Land" | "Residential" | "Commercial";
    buildingType: "Detached" | "Semi-Detached" | "Block of Flats";
    minBedrooms: number | "More";
    minBathrooms: number;
    propertyCondition: "New" | "Renovated" | "Any";
    purpose: "For living" | "Resale" | "Development";
    measurementUnit: "plot" | "sqm" | "hectares";
    landSize?: number;              // For single land size
    minLandSize?: number;           // For sqm range
    maxLandSize?: number;           // For sqm range
    documentTypes: string[];        // Required documents
    landConditions?: string[];      // Land condition requirements
  };
  nearbyLandmark?: string;          // Reference landmark
}
```

**Constraints**:
- For residential: minBedrooms required
- For land: documentTypes required, landConditions if applicable
- Land size: required based on measurementUnit
- Must have valid budget >= location minimum

### RentPreferenceForm
Specific structure for property rental preferences.

```typescript
interface RentPreferenceForm extends BasePreferenceForm {
  preferenceType: "rent";
  propertyDetails: {
    propertyType: "Self-con" | "Flat" | "Mini Flat" | "Bungalow";
    minBedrooms: number | "More";
    leaseTerm: "6 Months" | "1 Year";
    propertyCondition: "New" | "Renovated";
    purpose: "Residential" | "Office";
    measurementUnit: "plot" | "sqm" | "hectares";
    landSize?: number;              // For single land size
    minLandSize?: number;           // For sqm range
    maxLandSize?: number;           // For sqm range
    buildingType?: string;
    bathrooms?: number;
  };
}
```

**Constraints**:
- `propertyType`: Must match enum values
- `minBedrooms`: Required for residential properties
- `leaseTerm`: Predefined options only
- `propertyCondition`: New or Renovated only

### JointVenturePreferenceForm
Structure for development partnership opportunities.

```typescript
interface JointVenturePreferenceForm
  extends Omit<BasePreferenceForm, "contactInfo"> {
  preferenceType: "joint-venture";
  contactInfo: JointVentureContactInfo;  // Business contact info
  developmentDetails: {
    minLandSize: string;            // Minimum land size
    maxLandSize?: string;           // Maximum land size
    measurementUnit: "plot" | "sqm" | "hectares";
    jvType: "Equity Split" | "Lease-to-Build" | "Development Partner";
    propertyType: "Land" | "Old Building" | "Structure to demolish";
    expectedStructureType: string;  // Expected buildings (Mini Flats, Luxury Duplexes)
    timeline: "Ready Now" | "In 3 Months" | "Within 1 Year";
    budgetRange?: number;
    developmentTypes: string[];     // Types of development
    preferredSharingRatio?: string; // e.g., "50-50", "60-40"
    proposalDetails?: string;
    minimumTitleRequirements: string[];  // Required title docs
    willingToConsiderPendingTitle?: boolean;
  };
  partnerExpectations?: string;     // Partner expectations (max 1000 chars)
}
```

**Constraints**:
- `jvType`: Predefined options only
- `timeline`: Predefined options only
- `developmentTypes`: At least one required
- `minimumTitleRequirements`: At least one required
- `companyName` and business details required

### ShortletPreferenceForm
Structure for short-term accommodation booking preferences.

```typescript
interface ShortletPreferenceForm extends BasePreferenceForm {
  preferenceType: "shortlet";
  propertyDetails: {
    propertyType: "Studio" | "1-Bed Apartment" | "2-Bed Flat";
    minBedrooms: number | "More";
    numberOfGuests: number;         // Number of guests
    bathrooms?: number;
    maxGuests?: number;             // Maximum guests allowed
    travelType: string;             // solo, couple, family, group, business
    nearbyLandmark?: string;
  };
  bookingDetails: {
    checkInDate: string;            // ISO date format
    checkOutDate: string;           // ISO date format (> checkInDate)
    preferredCheckInTime?: string;
    preferredCheckOutTime?: string;
  };
}
```

**Constraints**:
- `checkInDate`: Must not be in past
- `checkOutDate`: Must be after checkInDate
- `numberOfGuests`: Min 1, fits propertyDetails
- Dates in ISO format (YYYY-MM-DD)

## API Payload Interfaces

### LocationPayload
API representation of location selection.

```typescript
interface LocationPayload {
  state: string;
  localGovernmentAreas: string[];
  selectedAreas?: string[];
  customLocation?: string;
}
```

### BudgetPayload
API representation of budget range.

```typescript
interface BudgetPayload {
  minPrice: number;
  maxPrice: number;
  currency: "NGN";
}
```

### FeaturesPayload
API representation of feature selection.

```typescript
interface FeaturesPayload {
  baseFeatures: string[];
  premiumFeatures: string[];
  autoAdjustToFeatures: boolean;
}
```

### Preference Payloads
Each preference type has a specific payload structure for API submission.

**BuyPreferencePayload**:
```typescript
{
  preferenceType: "buy",
  preferenceMode: "buy",
  location: LocationPayload,
  budget: BudgetPayload,
  propertyDetails: { ... },
  features: FeaturesPayload,
  contactInfo: ContactInfoPayload,
  nearbyLandmark?: string,
  additionalNotes?: string
}
```

**RentPreferencePayload**:
```typescript
{
  preferenceType: "rent",
  preferenceMode: "tenant",
  location: LocationPayload,
  budget: BudgetPayload,
  propertyDetails: { ... },
  features: FeaturesPayload,
  contactInfo: ContactInfoPayload,
  additionalNotes?: string
}
```

**JointVenturePreferencePayload**:
```typescript
{
  preferenceType: "joint-venture",
  preferenceMode: "developer",
  location: LocationPayload,
  budget: BudgetPayload,
  developmentDetails: { ... },
  features: FeaturesPayload,
  contactInfo: JointVentureContactPayload,
  partnerExpectations?: string
}
```

**ShortletPreferencePayload**:
```typescript
{
  preferenceType: "shortlet",
  preferenceMode: "shortlet",
  location: LocationPayload,
  budget: BudgetPayload,
  bookingDetails: { ... },
  features: FeaturesPayload,
  contactInfo: ContactInfoPayload,
  additionalNotes?: string
}
```

## Configuration Interfaces

### FeatureDefinition
Definition of a single feature/amenity.

```typescript
interface FeatureDefinition {
  name: string;                     // Feature name (e.g., "Swimming Pool")
  type: "basic" | "premium" | "comfort";  // Feature category
  minBudgetRequired?: number;       // Minimum budget to access feature
  tooltip?: string;                 // Help text for feature
}
```

### FeatureConfig
Feature configuration for a specific property type.

```typescript
interface FeatureConfig {
  basic: FeatureDefinition[];       // Basic features available
  premium: FeatureDefinition[];     // Premium features available
  comfort?: FeatureDefinition[];    // Optional comfort features (shortlet)
}
```

**Example**:
```typescript
{
  basic: [
    { name: "WiFi", type: "basic" },
    { name: "Security Cameras", type: "basic" }
  ],
  premium: [
    { name: "Swimming Pool", type: "premium", minBudgetRequired: 100000000 },
    { name: "Gym House", type: "premium", minBudgetRequired: 150000000 }
  ]
}
```

### BudgetThreshold
Location and type-specific budget requirement.

```typescript
interface BudgetThreshold {
  location: string;                 // Location identifier ("Lagos", "Abuja", "default")
  listingType: string;              // Listing type ("buy", "rent", "joint-venture", "shortlet")
  minAmount: number;                // Minimum budget in Naira
}
```

**Example**:
```typescript
[
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Abuja", listingType: "buy", minAmount: 8000000 }
]
```

## State Management Interfaces

### FormStep
Configuration for a form step.

```typescript
interface FormStep {
  id: string;                       // Unique step identifier
  title: string;                    // Display title
  isValid: boolean;                 // Current validation status
  isRequired: boolean;              // Is step required to submit
}
```

### ValidationError
Single validation error.

```typescript
interface ValidationError {
  field: string;                    // Field path (e.g., "contactInfo.email")
  message: string;                  // Error message
}
```

### FormValidationState
Validation state snapshot.

```typescript
interface FormValidationState {
  isValid: boolean;                 // Overall form validity
  errors: ValidationError[];        // Array of validation errors
}
```

### PreferenceFormState
Complete form state.

```typescript
interface PreferenceFormState {
  currentStep: number;              // Current step index (0-based)
  steps: FormStep[];                // Available steps for current preference type
  formData: FlexibleFormData;       // Current form data
  isSubmitting: boolean;            // Is form being submitted
  validationErrors: ValidationError[];  // Current validation errors
  budgetThresholds: BudgetThreshold[];  // Budget thresholds
  featureConfigs: Record<string, FeatureConfig>;  // Feature configurations
}
```

### PreferenceFormAction
Redux-style action types for state updates.

```typescript
type PreferenceFormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<FlexibleFormData> }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_FORM" }
  | { type: "SET_BUDGET_THRESHOLDS"; payload: BudgetThreshold[] }
  | { type: "SET_FEATURE_CONFIGS"; payload: Record<string, FeatureConfig> };
```

## Flexible Form Data Interface

```typescript
interface FlexibleFormData {
  location?: LocationSelection;
  budget?: BudgetRange;
  features?: FeatureSelection;
  preferenceType?: string;
  contactInfo?: any;                // Can be ContactInfo or JointVentureContactInfo
  additionalNotes?: string;
  propertyDetails?: any;            // Can be any property details object
  developmentDetails?: any;         // For joint-venture
  bookingDetails?: any;             // For shortlet
  nearbyLandmark?: string;
  partnerExpectations?: string;
  enhancedLocation?: any;           // For LGA-area mapping
}
```

## Union Types

```typescript
// All preference form types
type PreferenceForm =
  | BuyPreferenceForm
  | RentPreferenceForm
  | JointVenturePreferenceForm
  | ShortletPreferenceForm;

// All API payload types
type PreferencePayload =
  | BuyPreferencePayload
  | RentPreferencePayload
  | JointVenturePreferencePayload
  | ShortletPreferencePayload;

// Preference type identifier
type PreferenceType = "buy" | "rent" | "joint-venture" | "shortlet";
```

## Size and Constraints Summary

| Field | Type | Max Size | Required |
|-------|------|----------|----------|
| state | string | - | Yes |
| lgas | array | 3 items | Yes (1+) |
| areas | array | 3 items | Conditional |
| customLocation | string | - | Conditional |
| minPrice | number | - | Yes |
| maxPrice | number | - | Yes |
| fullName | string | 100 chars | Yes |
| email | string | - | Yes |
| phoneNumber | string | - | Yes |
| additionalNotes | string | 1000 chars | No |
| companyName | string | 200 chars | For JV |
| contactPerson | string | 100 chars | For JV |
| cacRegistrationNumber | string | - | No |
| partnerExpectations | string | 1000 chars | No |

---

For more details on validation rules, see [VALIDATION_RULES.md](./VALIDATION_RULES.md)
