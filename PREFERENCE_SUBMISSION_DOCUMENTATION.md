# Preference Submission Form - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Form Types & Step Structure](#form-types--step-structure)
4. [Form Data Structure](#form-data-structure)
5. [Validation Rules](#validation-rules)
6. [Component Integration](#component-integration)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Feature Configurations](#feature-configurations)
10. [Budget Thresholds](#budget-thresholds)
11. [Usage Examples](#usage-examples)
12. [Integration Guide](#integration-guide)

---

## Overview

The Preference Submission Form is a multi-step, multi-type property preference collection system that allows users to specify their property preferences based on their needs (buying, renting, short-let, or joint-venture). The system is built with React Context API for state management and includes comprehensive validation.

### Key Features
- **Multi-Type Support**: Buy, Rent, Shortlet, Joint-Venture preferences
- **Step-Based Navigation**: Multi-step form progression with validation
- **Dynamic Validation**: Form validation rules adapt based on preference type
- **Budget Thresholds**: Location and type-specific minimum budget requirements
- **Feature Selection**: Categorized features (basic/premium/comfort)
- **API Integration**: Structured payload generation for backend submission

---

## Architecture

### Core Files

```
src/
├── context/
│   └── preference-form-context.tsx       # Context & reducer for form state
├── data/
│   └── preference-configs.ts             # Feature configs & budget thresholds
├── types/
│   └── preference-form.ts                # TypeScript interfaces
├── utils/validation/
│   └── preference-validation.ts          # Yup validation schemas
├── components/preference-form/
│   ├── OptimizedLocationSelection.tsx
│   ├── OptimizedBudgetSelection.tsx
│   ├── FeatureSelection.tsx
│   ├── PropertyDetails.tsx
│   ├── OptimizedContactInformation.tsx
│   ├── DateSelection.tsx
│   ├── SubmitButton.tsx
│   └── joint-venture/
│       └── JointVenturePreferenceForm.tsx
└── app/
    └── preference/
        └── page.tsx                      # Main preference form page
```

---

## Form Types & Step Structure

### 1. **Buy Preference**
**Steps**: 4 (Location → Property Details & Budget → Features → Contact)

**Purpose**: Users looking to purchase properties

**Specific Requirements**:
- Property subtype: Land, Residential, or Commercial
- Building type selection (Detached, Semi-Detached, Block of Flats)
- Document type requirements (Deed of Assignment, Certificate of Occupancy, etc.)
- Land conditions for land properties

---

### 2. **Rent Preference**
**Steps**: 4 (Location → Property Details & Budget → Features → Contact)

**Purpose**: Users looking to rent properties

**Specific Requirements**:
- Property subtype: Residential or Commercial only (no land)
- Lease term options (6 Months, 1 Year)
- Building type and property condition

---

### 3. **Shortlet Preference**
**Steps**: 4 (Location → Property Details & Budget → Features → Contact)

**Purpose**: Users booking short-term accommodations

**Specific Requirements**:
- Property type: Studio, 1-Bed Apartment, 2-Bed Flat
- Bedrooms and bathrooms count
- Maximum guests capacity (1-20)
- Travel type (solo, couple, family, group, business)
- Check-in and check-out dates

---

### 4. **Joint-Venture Preference**
**Steps**: 5 (Developer Info → Development Type → Land Requirements → JV Terms → Title & Documentation)

**Purpose**: Developers seeking joint venture partnerships

**Specific Requirements**:
- Company information instead of personal contact
- Development types selection
- Land size and measurement unit
- JV type: Equity Split, Lease-to-Build, Development Partner
- Preferred sharing ratio
- Minimum title requirements

---

## Form Data Structure

### Complete Form Interface

```typescript
interface FlexibleFormData {
  // Common fields across all types
  location?: LocationSelection;
  budget?: BudgetRange;
  features?: FeatureSelection;
  preferenceType?: string;
  contactInfo?: ContactInfo | JointVentureContactInfo;
  additionalNotes?: string;
  
  // Type-specific fields
  propertyDetails?: PropertyDetails;
  developmentDetails?: DevelopmentDetails;  // JV only
  bookingDetails?: BookingDetails;           // Shortlet only
  nearbyLandmark?: string;
  partnerExpectations?: string;              // JV only
  
  // Enhanced location data
  enhancedLocation?: {
    lgasWithAreas: Array<{
      lgaName: string;
      areas: string[];
    }>;
    customLocation?: string;
  };
}
```

### Location Selection

```typescript
interface LocationSelection {
  state: string;                // Required: State name
  lgas: string[];              // Required: Local Government Areas (max 3)
  areas: string[];             // Optional: Specific areas within LGAs (max 3 per LGA)
  customLocation?: string;     // Alternative if area not found
}

// Validation Rules:
// - At least 1 LGA required
// - Maximum 3 LGAs allowed
// - Either areas OR customLocation must be provided
// - Maximum 3 areas per LGA
```

### Budget Range

```typescript
interface BudgetRange {
  minPrice: number;            // Required: Minimum budget in NGN
  maxPrice: number;            // Required: Maximum budget in NGN
  currency: "NGN";            // Always NGN
}

// Validation Rules:
// - minPrice > 0
// - maxPrice > minPrice
// - Location/type-specific minimum thresholds apply
```

### Feature Selection

```typescript
interface FeatureSelection {
  basicFeatures: string[];      // Selected basic features
  premiumFeatures: string[];    // Selected premium features
  autoAdjustToBudget: boolean;  // Auto-filter features based on budget
}
```

### Contact Information

#### Standard Contact (Buy, Rent, Shortlet)

```typescript
interface ContactInfo {
  fullName: string;             // Required: 2-100 characters, letters only
  email: string;               // Required: Valid email
  phoneNumber: string;         // Required: Valid Nigerian number (+234 or 0)
  whatsappNumber?: string;     // Optional: Valid Nigerian WhatsApp number
}
```

#### Joint Venture Contact

```typescript
interface JointVentureContactInfo {
  companyName: string;         // Required: 2-200 characters
  contactPerson: string;       // Required: 2-100 characters, letters only
  email: string;               // Required: Valid email
  phoneNumber: string;         // Required: Valid Nigerian phone
  whatsappNumber?: string;     // Optional: Valid WhatsApp number
  cacRegistrationNumber?: string; // Optional: RC format (RC123456)
}
```

### Property Details (Buy)

```typescript
interface BuyPropertyDetails {
  propertySubtype: 'land' | 'residential' | 'commercial'; // Required
  
  // Land measurement
  measurementUnit: 'plot' | 'sqm' | 'hectares';  // Required
  landSize?: number;                             // For non-sqm units
  minLandSize?: number;                          // For sqm unit
  maxLandSize?: number;                          // For sqm unit
  
  // Building details (for non-land)
  buildingType?: 'Detached' | 'Semi-Detached' | 'Block of Flats'; // Required if not land
  propertyCondition?: 'New' | 'Renovated' | 'Any'; // Required if not land
  bedrooms?: number;                             // Required for residential
  bathrooms?: number;                            // Optional
  
  // Documentation
  documentTypes: string[];                       // Required: At least 1
  landConditions?: string[];                     // Required if property is land
}
```

### Development Details (Joint Venture)

```typescript
interface DevelopmentDetails {
  developmentTypes: string[];                    // Required: At least 1
  measurementUnit: 'plot' | 'sqm' | 'hectares'; // Required
  minLandSize: string;                           // Required
  jvType: 'Equity Split' | 'Lease-to-Build' | 'Development Partner'; // Required
  preferredSharingRatio: string;                 // Required: e.g., "60:40"
  minimumTitleRequirements: string[];            // Required: At least 1
  timeline?: 'Ready Now' | 'In 3 Months' | 'Within 1 Year'; // Optional
}
```

### Booking Details (Shortlet)

```typescript
interface BookingDetails {
  propertyType: 'studio' | 'apartment' | 'duplex' | 'bungalow'; // Required
  bedrooms: number;                             // Required
  bathrooms: number;                            // Required
  maxGuests: number;                            // Required: 1-20
  travelType: 'solo' | 'couple' | 'family' | 'group' | 'business'; // Required
  checkInDate: Date;                            // Required: Not in past
  checkOutDate: Date;                           // Required: After check-in
  preferredCheckInTime?: string;                // Optional: HH:MM format
  preferredCheckOutTime?: string;               // Optional: HH:MM format
}
```

---

## Validation Rules

### Step-by-Step Validation

#### Step 0: Location & Area
```
✓ State: Required
✓ Local Government Areas: Required (min 1, max 3)
✓ Areas within LGAs: Optional but max 3 per LGA
✓ Custom Location: Required if no areas selected
✓ Error: Must select areas OR provide custom location
```

#### Step 1: Property Details & Budget (Non-JV)
```
✓ Property Type/Subtype: Required
✓ Measurement Unit: Required
✓ Land Size: Required (format depends on unit)
  - If "sqm": min AND max size required
  - If other: single size required
  - Validation: Max > Min (for sqm)
✓ Building Type: Required (if not land)
✓ Property Condition: Required (if not land)
✓ Bedrooms: Required (if residential)
✓ Document Types: Required (at least 1)
✓ Budget: 
  - Min > 0
  - Max > Min
  - Min >= Location/Type threshold
```

#### Step 1 (Joint Venture): Development Type
```
✓ Development Types: Required (at least 1)
```

#### Step 2 (Joint Venture): Land Requirements
```
✓ State: Required
✓ LGAs: Required (min 1)
✓ Measurement Unit: Required
✓ Min Land Size: Required
```

#### Step 3 (Joint Venture): JV Terms
```
✓ Preferred Sharing Ratio: Required (format: "XX:XX")
✓ Validation: Ratio parts sum to 100
```

#### Step 4 (Joint Venture): Title & Documentation
```
✓ Minimum Title Requirements: Required (at least 1)
```

#### Final Step: Contact Information
```
✓ Full Name: 2-100 chars, letters + spaces only
✓ Email: Valid email format
✓ Phone: Valid Nigerian format (+234 or 0 prefix)
✓ WhatsApp: Optional but must be valid if provided
✓ Additional Notes: Max 1000 characters
```

---

## Component Integration

### Main Form Provider Setup

```tsx
// In your page or layout
import { PreferenceFormProvider } from '@/context/preference-form-context';

export default function Page() {
  return (
    <PreferenceFormProvider>
      <YourFormComponent />
    </PreferenceFormProvider>
  );
}
```

### Using the Form Context

```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

function MyComponent() {
  const {
    state,                    // Current form state
    updateFormData,          // Update form data
    goToStep,                // Navigate to specific step
    goToNextStep,            // Move to next step
    goToPreviousStep,        // Move to previous step
    validateStep,            // Validate specific step
    isStepValid,             // Check if step is valid
    canProceedToNextStep,    // Check if can move forward
    isFormValid,             // Check if entire form is valid
    resetForm,               // Reset form to initial state
    triggerValidation,       // Trigger validation on step/all
  } = usePreferenceForm();

  // Use these in your components
}
```

### Form State Structure

```typescript
interface PreferenceFormState {
  currentStep: number;                  // Currently active step (0-indexed)
  steps: FormStep[];                   // Array of form steps with validation state
  formData: FlexibleFormData;           // All form data entered so far
  isSubmitting: boolean;               // Submission in progress
  validationErrors: ValidationError[]; // Array of validation errors
  budgetThresholds: BudgetThreshold[]; // Location/type budget minimums
  featureConfigs: FeatureConfig;       // Available features by type
}
```

---

## State Management

### Context Actions

#### UPDATE_FORM_DATA
```typescript
dispatch({ 
  type: "UPDATE_FORM_DATA", 
  payload: { 
    location: { state: "Lagos", lgas: ["Lekki"] },
    preferenceType: "buy"
  } 
});
```

#### SET_STEP
```typescript
dispatch({ type: "SET_STEP", payload: 2 });
```

#### SET_VALIDATION_ERRORS
```typescript
dispatch({ 
  type: "SET_VALIDATION_ERRORS", 
  payload: [
    { field: "location.state", message: "State is required" }
  ] 
});
```

#### SET_SUBMITTING
```typescript
dispatch({ type: "SET_SUBMITTING", payload: true });
```

#### RESET_FORM
```typescript
dispatch({ type: "RESET_FORM" });
```

---

## API Integration

### Preference Submission Endpoint

**Endpoint**: `POST /api/preferences` (or your configured endpoint)

**Response Format**: 

Each preference type generates a specific payload structure after cleaning empty values.

#### Buy Preference Payload Example

```json
{
  "preferenceType": "buy",
  "preferenceMode": "buy",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki", "Ikoyi"],
    "lgasWithAreas": [
      {
        "lgaName": "Lekki",
        "areas": ["Victoria Island", "Lekki Phase 1"]
      }
    ],
    "customLocation": ""
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 100000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "residential",
    "buildingType": "Detached",
    "minBedrooms": 4,
    "minBathrooms": 3,
    "propertyCondition": "New",
    "purpose": "For living",
    "measurementUnit": "sqm",
    "minLandSize": 500,
    "maxLandSize": 1000,
    "documentTypes": ["Certificate of Occupancy"]
  },
  "features": {
    "baseFeatures": ["Swimming Pool", "Security"],
    "premiumFeatures": ["Gym House"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+234801234567"
  },
  "nearbyLandmark": "Near Lekki Phase 1 Gate",
  "additionalNotes": "Looking for a family home"
}
```

#### Rent Preference Payload Example

```json
{
  "preferenceType": "rent",
  "preferenceMode": "tenant",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ikoyi"],
    "lgasWithAreas": [
      {
        "lgaName": "Ikoyi",
        "areas": ["Ikoyi Island"]
      }
    ]
  },
  "budget": {
    "minPrice": 500000,
    "maxPrice": 1500000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "residential",
    "buildingType": "Block of Flats",
    "minBedrooms": 2,
    "minBathrooms": 2,
    "leaseTerm": "1 Year",
    "propertyCondition": "Renovated",
    "purpose": "Residential",
    "measurementUnit": "sqm",
    "minLandSize": 200,
    "maxLandSize": 500
  },
  "features": {
    "baseFeatures": ["WiFi", "Security Cameras"],
    "premiumFeatures": ["Swimming Pool"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+234801234567"
  }
}
```

#### Shortlet Preference Payload Example

```json
{
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki"],
    "customLocation": "Lekki Axis"
  },
  "budget": {
    "minPrice": 50000,
    "maxPrice": 150000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "apartment",
    "bedrooms": 1,
    "bathrooms": 1,
    "maxGuests": 4,
    "travelType": "family"
  },
  "bookingDetails": {
    "checkInDate": "2024-03-15",
    "checkOutDate": "2024-03-20",
    "preferredCheckInTime": "15:00",
    "preferredCheckOutTime": "11:00"
  },
  "features": {
    "baseFeatures": ["WiFi", "Air Conditioning"],
    "premiumFeatures": ["Swimming Pool"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "Robert Johnson",
    "email": "robert@example.com",
    "phoneNumber": "+234801234567"
  }
}
```

#### Joint Venture Preference Payload Example

```json
{
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ibeju-Lekki"],
    "lgasWithAreas": [
      {
        "lgaName": "Ibeju-Lekki",
        "areas": ["Epe", "Ibeju"]
      }
    ]
  },
  "budget": {
    "minPrice": 500000000,
    "maxPrice": 2000000000,
    "currency": "NGN"
  },
  "developmentDetails": {
    "developmentTypes": ["Residential", "Mixed-Use"],
    "minLandSize": "10",
    "measurementUnit": "hectares",
    "jvType": "Equity Split",
    "preferredSharingRatio": "60:40",
    "minimumTitleRequirements": ["C of O"],
    "timeline": "Ready Now"
  },
  "features": {
    "baseFeatures": ["Good Road Access"],
    "premiumFeatures": [],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "companyName": "Premium Developments Ltd",
    "contactPerson": "Tunde Oluwaseun",
    "email": "tunde@premiumdev.com",
    "phoneNumber": "+234801234567",
    "cacRegistrationNumber": "RC123456"
  },
  "partnerExpectations": "Looking for experienced partners with capital"
}
```

---

## Feature Configurations

### Available Features by Type

Features are categorized into three tiers:

#### Buy Residential

**Basic Features**:
- Kitchenette, Security Cameras, Children Playground, Open Floor Plan
- Walk-in Closet, WiFi, Library, Home Office, Bathtub, Garage
- Staff Room, Pantry, Built-in Cupboards, Security Post, Access Gate
- Air Conditioner, Wheelchair Friendly, Garden

**Premium Features**:
- Gym House, Swimming Pool, Outdoor Kitchen, Rooftops
- In-house Cinema, Tennis Court, Elevator, Electric Fencing
- Inverter, Sea View, Jacuzzi

#### Rent Residential
(Same as Buy Residential)

#### Commercial (Buy/Rent)

**Basic Features**:
- Power Supply, Water Supply, Air Conditioning, Parking Space
- Security, Internet (Wi-Fi), Reception Area, Elevator, Standby Generator

**Premium Features**:
- Central Cooling System, Fire Safety Equipment, Industrial Lift
- CCTV Monitoring System, Conference Room, Fiber Optic Internet
- Backup Solar/Inverter, Loading Dock, Smart Building Automation

#### Shortlet

**Basic Features**:
- Wi-Fi, Air Conditioning, Power Supply, Security, Parking
- Clean Water, Kitchen, Clean Bathroom

**Comfort Features**:
- Laundry, Smart TV / Netflix, Balcony, Housekeeping
- Breakfast Included, Private Entrance, POP Ceiling, Access Gate

**Premium Features**:
- Gym Access, Swimming Pool, Inverter / Solar Backup, Rooftop Lounge
- Jacuzzi, Sea View, Pet-Friendly, Outdoor Kitchen, Smart Lock
- Close to Major Attractions

---

## Budget Thresholds

Minimum budget requirements by location and preference type:

```typescript
// Lagos
{ location: "Lagos", listingType: "buy", minAmount: 5000000 }
{ location: "Lagos", listingType: "rent", minAmount: 200000 }
{ location: "Lagos", listingType: "joint-venture", minAmount: 10000000 }
{ location: "Lagos", listingType: "shortlet", minAmount: 15000 }

// Abuja
{ location: "Abuja", listingType: "buy", minAmount: 8000000 }
{ location: "Abuja", listingType: "rent", minAmount: 300000 }
{ location: "Abuja", listingType: "joint-venture", minAmount: 15000000 }
{ location: "Abuja", listingType: "shortlet", minAmount: 25000 }

// Default (Other Locations)
{ location: "default", listingType: "buy", minAmount: 2000000 }
{ location: "default", listingType: "rent", minAmount: 100000 }
{ location: "default", listingType: "joint-venture", minAmount: 5000000 }
{ location: "default", listingType: "shortlet", minAmount: 10000 }
```

---

## Usage Examples

### Complete Form Implementation

```tsx
"use client";
import React from "react";
import { PreferenceFormProvider } from "@/context/preference-form-context";
import PreferenceFormPage from "@/app/preference/page";

export default function PreferencePage() {
  return (
    <PreferenceFormProvider>
      <PreferenceFormPage />
    </PreferenceFormProvider>
  );
}
```

### Step Navigation Example

```tsx
function StepNavigation() {
  const {
    state,
    goToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    isFormValid,
  } = usePreferenceForm();

  return (
    <div className="flex justify-between">
      <button
        onClick={goToPreviousStep}
        disabled={state.currentStep === 0}
      >
        Previous
      </button>

      <span>Step {state.currentStep + 1} of {state.steps.length}</span>

      <button
        onClick={goToNextStep}
        disabled={!canProceedToNextStep()}
      >
        {state.currentStep === state.steps.length - 1 ? "Submit" : "Next"}
      </button>
    </div>
  );
}
```

### Form Submission Example

```tsx
async function handleSubmit() {
  const { state } = usePreferenceForm();

  if (!isFormValid()) {
    toast.error("Please fill all required fields");
    return;
  }

  try {
    const response = await POST_REQUEST(
      URLS.POST_PREFERENCE,
      generatePayload()
    );

    if (response.success) {
      toast.success("Preference submitted successfully");
      resetForm();
      router.push("/marketplace");
    }
  } catch (error) {
    toast.error("Failed to submit preference");
  }
}
```

### Validation Trigger Example

```tsx
function LocationStep() {
  const { validateStep, state } = usePreferenceForm();

  const handleLocationChange = (location) => {
    updateFormData({ location });
    
    // Validate after updating
    const errors = validateStep(state.currentStep);
    if (errors.length > 0) {
      console.log("Validation errors:", errors);
    }
  };

  return (
    // Your location component
  );
}
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install react-hot-toast framer-motion yup react-datepicker react-select
```

### Step 2: Copy Core Files

Copy these files to your project:
- `src/context/preference-form-context.tsx`
- `src/data/preference-configs.ts`
- `src/types/preference-form.ts`
- `src/utils/validation/preference-validation.ts`

### Step 3: Update API URLs

In your API configuration, ensure these endpoints are available:
```typescript
POST_PREFERENCE: '/api/preferences',  // or your endpoint
```

### Step 4: Customize Budget Thresholds

Edit `preference-configs.ts` to update minimum budget requirements for your locations:

```typescript
export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  { location: "YourCity", listingType: "buy", minAmount: YOUR_AMOUNT },
  // ... more thresholds
];
```

### Step 5: Customize Features

Edit `preference-configs.ts` to update available features:

```typescript
export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "buy-residential": {
    basic: [
      { name: "Your Feature", type: "basic" },
      // ... more features
    ],
    premium: [
      // ... premium features
    ],
  },
  // ... more types
};
```

### Step 6: Wrap Your Application

```tsx
// In your layout or page
import { PreferenceFormProvider } from '@/context/preference-form-context';

export default function Layout({ children }) {
  return (
    <PreferenceFormProvider>
      {children}
    </PreferenceFormProvider>
  );
}
```

### Step 7: Handle API Response

```typescript
// After successful submission
interface PreferenceResponse {
  success: boolean;
  preferenceId: string;
  message: string;
  data?: {
    preferenceType: string;
    createdAt: string;
    userId: string;
  };
}
```

---

## Common Validation Scenarios

### Scenario 1: User selects "Buy" but doesn't select property type
```
Error Field: propertyDetails.propertySubtype
Message: "Property type is required"
Step: 1 (Property Details & Budget)
```

### Scenario 2: User sets maxPrice less than minPrice
```
Error Field: budget.maxPrice
Message: "Maximum price must be greater than minimum price"
Step: 1 (Property Details & Budget)
```

### Scenario 3: User selects "sqm" but doesn't provide both min and max land size
```
Error Fields: propertyDetails.minLandSize, propertyDetails.maxLandSize
Message: "Minimum/Maximum land size is required"
Step: 1 (Property Details & Budget)
```

### Scenario 4: User provides invalid email in contact info
```
Error Field: contactInfo.email
Message: "Please enter a valid email address"
Step: 3 (Contact & Preferences) / Final step
```

### Scenario 5: User enters phone number without valid Nigerian format
```
Error Field: contactInfo.phoneNumber
Message: "Please enter a valid Nigerian phone number"
Expected Format: +234XXXXXXXXXX or 0XXXXXXXXXX
Step: 3 (Contact & Preferences) / Final step
```

---

## Performance Optimization Notes

1. **Context Memoization**: Form context uses useMemo to prevent unnecessary re-renders
2. **Lazy Loading**: DateSelection component is dynamically imported
3. **Debounce Updates**: Form data updates are debounced to prevent rapid state changes
4. **Shallow Comparison**: Form state checks use shallow comparison before deep comparison
5. **Component Memoization**: UI components (LoadingOverlay, SuccessModal, etc.) are memoized

---

## Error Handling

### Validation Errors Object

```typescript
interface ValidationError {
  field: string;      // Path to the field (e.g., "location.state")
  message: string;    // User-friendly error message
}
```

### Retrieving Errors for a Field

```typescript
const { getValidationErrorsForField } = usePreferenceForm();
const errors = getValidationErrorsForField("location.state");

errors.forEach(error => {
  console.log(error.message); // Display to user
});
```

---

## Testing Preferences

### Test User Scenarios

1. **Complete Buy Preference**
   - Select "Buy", fill all fields, submit
   - Expected: Payload generated with propertyDetails

2. **Joint Venture with Company**
   - Select "JV", fill developer info, complete all steps
   - Expected: contactInfo contains companyName instead of fullName

3. **Shortlet Booking**
   - Select "Shortlet", set dates in future
   - Expected: bookingDetails in payload

4. **Navigation Between Steps**
   - Open preference, change type, verify form resets
   - Click previous/next buttons, verify step changes
   - Expected: Only valid steps are navigable

5. **Validation Errors**
   - Submit incomplete form, verify errors display
   - Fix errors one by one, verify error clears
   - Expected: Submit button enabled only when no errors

---

## Support & Troubleshooting

### Issue: Form won't proceed to next step
**Solution**: Check validation errors with `getValidationErrorsForField(fieldName)`

### Issue: Budget threshold validation failing
**Solution**: Update DEFAULT_BUDGET_THRESHOLDS in preference-configs.ts

### Issue: Features not showing up
**Solution**: Check FEATURE_CONFIGS for your preference-property type combination

### Issue: Contact info validation failing
**Solution**: Ensure phone numbers follow format: +234XXXXXXXXXX or 0XXXXXXXXXX

---

