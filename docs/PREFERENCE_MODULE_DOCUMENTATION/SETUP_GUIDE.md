# Setup Guide

Step-by-step guide to implement the Preference Submission Module in your application.

## Prerequisites

- React 18+
- TypeScript 4.5+
- Tailwind CSS (for styling)
- Yup (validation library)
- Node.js 16+

## Installation

### Step 1: Install Dependencies

```bash
npm install yup react-hot-toast
# or
yarn add yup react-hot-toast
```

### Step 2: Create Directory Structure

```
src/
├── types/
│   └── preference-form.ts
├── data/
│   └── preference-configs.ts
├── utils/
│   └── validation/
│       └── preference-validation.ts
├── context/
│   └── preference-form-context.tsx
├── styles/
│   └── preference-form.css
└── pages/
    └── preferences.tsx
```

## Implementation Steps

### Step 1: Add Type Definitions

Create `src/types/preference-form.ts` with all interfaces from [DATA_STRUCTURES.md](./DATA_STRUCTURES.md):

```typescript
// Copy all interfaces from DATA_STRUCTURES.md
export interface LocationSelection { ... }
export interface BudgetRange { ... }
export interface FeatureSelection { ... }
// ... etc
```

### Step 2: Add Feature Configurations

Create `src/data/preference-configs.ts` with feature sets from [FEATURE_CONFIGURATIONS.md](./FEATURE_CONFIGURATIONS.md):

```typescript
import { FeatureConfig, BudgetThreshold } from "@/types/preference-form";

export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "buy-residential": {
    basic: [...],
    premium: [...]
  },
  // ... other types
};

export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  // ... other thresholds
];
```

### Step 3: Add Validation Schemas

Create `src/utils/validation/preference-validation.ts` with Yup schemas from [VALIDATION_RULES.md](./VALIDATION_RULES.md):

```typescript
import * as Yup from "yup";

const locationSchema = Yup.object({
  state: Yup.string().required("Please select a state"),
  lgas: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one Local Government Area"),
  // ... rest of schema
});

// Export all schemas
export const buyPreferenceValidationSchema = Yup.object({...});
export const rentPreferenceValidationSchema = Yup.object({...});
export const shortletPreferenceValidationSchema = Yup.object({...});
export const jointVenturePreferenceValidationSchema = Yup.object({...});

export const getValidationSchema = (preferenceType: string) => {
  switch(preferenceType) {
    case "buy": return buyPreferenceValidationSchema;
    case "rent": return rentPreferenceValidationSchema;
    case "shortlet": return shortletPreferenceValidationSchema;
    case "joint-venture": return jointVenturePreferenceValidationSchema;
    default: throw new Error(`Invalid preference type: ${preferenceType}`);
  }
};
```

### Step 4: Create Context Provider

Create `src/context/preference-form-context.tsx`:

```typescript
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  PreferenceFormState,
  PreferenceFormAction,
  PreferenceForm,
  ValidationError,
  BudgetThreshold,
  FeatureConfig,
} from "@/types/preference-form";
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from "@/data/preference-configs";

// Step configurations
const getStepsForPreferenceType = (preferenceType?: string) => {
  if (preferenceType === "joint-venture") {
    return [
      { id: "jv-developer-info", title: "Developer Information", isValid: false, isRequired: true },
      { id: "jv-development-type", title: "Development Type", isValid: false, isRequired: true },
      { id: "jv-land-requirements", title: "Land Requirements", isValid: false, isRequired: true },
      { id: "jv-terms-proposal", title: "JV Terms & Proposal", isValid: false, isRequired: true },
      { id: "jv-title-documentation", title: "Title & Documentation", isValid: false, isRequired: true },
    ];
  }

  return [
    { id: "location", title: "Location & Area", isValid: false, isRequired: true },
    { id: "property-budget", title: "Property Details & Budget", isValid: false, isRequired: true },
    { id: "features", title: "Features & Amenities", isValid: false, isRequired: false },
    { id: "contact", title: "Contact & Preferences", isValid: false, isRequired: true },
  ];
};

// Initial state
const createInitialState = (preferenceType?: string): PreferenceFormState => ({
  currentStep: 0,
  steps: getStepsForPreferenceType(preferenceType),
  formData: {},
  isSubmitting: false,
  validationErrors: [],
  budgetThresholds: DEFAULT_BUDGET_THRESHOLDS,
  featureConfigs: FEATURE_CONFIGS,
});

// Reducer
function preferenceFormReducer(
  state: PreferenceFormState,
  action: PreferenceFormAction,
): PreferenceFormState {
  switch (action.type) {
    case "SET_STEP":
      if (state.currentStep === action.payload) return state;
      return { ...state, currentStep: action.payload };

    case "UPDATE_FORM_DATA":
      const newFormData = { ...state.formData, ...action.payload };
      let newSteps = state.steps;
      let resetCurrentStep = state.currentStep;

      if (action.payload.preferenceType && 
          action.payload.preferenceType !== state.formData.preferenceType) {
        newSteps = getStepsForPreferenceType(action.payload.preferenceType);
        resetCurrentStep = 0;
      }

      return {
        ...state,
        formData: newFormData,
        steps: newSteps,
        currentStep: resetCurrentStep,
      };

    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload };

    case "SET_SUBMITTING":
      if (state.isSubmitting === action.payload) return state;
      return { ...state, isSubmitting: action.payload };

    case "RESET_FORM":
      return createInitialState();

    case "SET_BUDGET_THRESHOLDS":
      return { ...state, budgetThresholds: action.payload };

    case "SET_FEATURE_CONFIGS":
      return { ...state, featureConfigs: action.payload };

    default:
      return state;
  }
}

// Context type
interface PreferenceFormContextType {
  state: PreferenceFormState;
  dispatch: React.Dispatch<PreferenceFormAction>;
  goToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<PreferenceForm>) => void;
  validateStep: (step: number) => ValidationError[];
  isFormValid: () => boolean;
  resetForm: () => void;
  getMinBudgetForLocation: (location: string, listingType: string) => number;
  getAvailableFeatures: (propertyType: string, budget?: number) => any;
}

const PreferenceFormContext = createContext<PreferenceFormContextType | undefined>(
  undefined
);

export const PreferenceFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    preferenceFormReducer,
    undefined,
    createInitialState
  );

  const getMinBudgetForLocation = useCallback(
    (location: string, listingType: string): number => {
      const threshold = state.budgetThresholds.find(
        (t) =>
          t.location.toLowerCase() === location.toLowerCase() &&
          t.listingType === listingType,
      );
      if (threshold) return threshold.minAmount;

      const defaultThreshold = state.budgetThresholds.find(
        (t) => t.location === "default" && t.listingType === listingType,
      );
      return defaultThreshold?.minAmount || 0;
    },
    [state.budgetThresholds],
  );

  // ... implement other helper functions from preference-form-context.tsx

  const value: PreferenceFormContextType = {
    state,
    dispatch,
    goToStep: (step) => dispatch({ type: "SET_STEP", payload: step }),
    goToNextStep: () => {
      if (state.currentStep < state.steps.length - 1) {
        dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
      }
    },
    goToPreviousStep: () => {
      if (state.currentStep > 0) {
        dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
      }
    },
    updateFormData: (data) => dispatch({ type: "UPDATE_FORM_DATA", payload: data }),
    validateStep: () => [],  // Implement validation logic
    isFormValid: () => true,  // Implement validation logic
    resetForm: () => dispatch({ type: "RESET_FORM" }),
    getMinBudgetForLocation,
    getAvailableFeatures: () => ({basic: [], premium: []}),  // Implement feature logic
  };

  return (
    <PreferenceFormContext.Provider value={value}>
      {children}
    </PreferenceFormContext.Provider>
  );
};

export const usePreferenceForm = () => {
  const context = useContext(PreferenceFormContext);
  if (!context) {
    throw new Error(
      "usePreferenceForm must be used within PreferenceFormProvider"
    );
  }
  return context;
};
```

### Step 5: Create Components

Create form components for each step:

#### Location Component (`src/components/LocationStep.tsx`)
```typescript
import { usePreferenceForm } from "@/context/preference-form-context";

export function LocationStep() {
  const { state, updateFormData } = usePreferenceForm();
  
  return (
    <div>
      <h2>Location & Area Selection</h2>
      {/* State selector */}
      {/* LGA selector */}
      {/* Area selector */}
      {/* Custom location input */}
    </div>
  );
}
```

#### Property Details Component
```typescript
import { usePreferenceForm } from "@/context/preference-form-context";

export function PropertyDetailsStep() {
  const { state, updateFormData } = usePreferenceForm();
  
  return (
    <div>
      <h2>Property Details & Budget</h2>
      {/* Property type selector */}
      {/* Conditional fields based on type */}
      {/* Budget inputs */}
    </div>
  );
}
```

#### Features Component
```typescript
import { usePreferenceForm } from "@/context/preference-form-context";

export function FeaturesStep() {
  const { state, updateFormData, getAvailableFeatures } = usePreferenceForm();
  
  return (
    <div>
      <h2>Features & Amenities</h2>
      {/* Feature checkboxes */}
      {/* Auto-adjust toggle */}
    </div>
  );
}
```

#### Contact Component
```typescript
import { usePreferenceForm } from "@/context/preference-form-context";

export function ContactStep() {
  const { state, updateFormData } = usePreferenceForm();
  
  return (
    <div>
      <h2>Contact & Preferences</h2>
      {/* Contact info inputs */}
      {/* Additional notes */}
    </div>
  );
}
```

### Step 6: Create Main Form Page

Create `src/pages/preferences.tsx`:

```typescript
"use client";

import { PreferenceFormProvider, usePreferenceForm } from "@/context/preference-form-context";
import { LocationStep } from "@/components/LocationStep";
import { PropertyDetailsStep } from "@/components/PropertyDetailsStep";
import { FeaturesStep } from "@/components/FeaturesStep";
import { ContactStep } from "@/components/ContactStep";
import { useState } from "react";

function PreferenceFormContent() {
  const { state, updateFormData, goToNextStep, goToPreviousStep } = usePreferenceForm();
  const [submitting, setSubmitting] = useState(false);

  const currentStep = state.steps[state.currentStep];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Transform form data to API payload
      const payload = transformToPayload(state.formData);
      
      // Submit to API
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Show success message
        // Redirect to confirmation page
      }
    } catch (error) {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Real Estate Preference Form</h1>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex gap-2">
          {state.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${
                index === state.currentStep ? "bg-blue-500" : "bg-gray-300"
              } h-2`}
            />
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="mb-8">
        {state.currentStep === 0 && <LocationStep />}
        {state.currentStep === 1 && <PropertyDetailsStep />}
        {state.currentStep === 2 && <FeaturesStep />}
        {state.currentStep === 3 && <ContactStep />}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={goToPreviousStep}
          disabled={state.currentStep === 0}
          className="px-4 py-2 bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        
        {state.currentStep < state.steps.length - 1 ? (
          <button
            onClick={goToNextStep}
            className="px-4 py-2 bg-blue-500 text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-green-500 text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <PreferenceFormProvider>
      <PreferenceFormContent />
    </PreferenceFormProvider>
  );
}
```

### Step 7: Create API Endpoint

Create `app/api/preferences/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload structure
    // Transform if needed
    // Save to database
    // Call external services if needed

    return NextResponse.json(
      { success: true, id: "preference-123" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Preference submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit preference" },
      { status: 500 }
    );
  }
}
```

## Testing

### Unit Testing

```typescript
import { getValidationSchema } from "@/utils/validation/preference-validation";

describe("Preference Validation", () => {
  it("should validate buy preference", async () => {
    const schema = getValidationSchema("buy");
    const data = {
      preferenceType: "buy",
      location: { state: "Lagos", lgas: ["Ikoyi"], areas: ["Ikoyi"] },
      budget: { minPrice: 100000000, maxPrice: 500000000, currency: "NGN" },
      features: { basicFeatures: [], premiumFeatures: [], autoAdjustToBudget: false },
      contactInfo: {
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "+2347012345678",
      },
      propertyDetails: {
        propertySubtype: "residential",
        buildingType: "Detached",
        bedrooms: 3,
        bathrooms: 2,
        propertyCondition: "New",
        purpose: "For living",
        measurementUnit: "sqm",
        minLandSize: 500,
        maxLandSize: 2000,
        documentTypes: ["Deed of Assignment"],
      },
    };

    await schema.validate(data);
    // Passes validation
  });
});
```

### Integration Testing

Test form flow end-to-end:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import PreferencesPage from "@/pages/preferences";

describe("Preference Form", () => {
  it("should complete form submission", async () => {
    render(<PreferencesPage />);

    // Fill location step
    // Fill property details step
    // Fill features step
    // Fill contact step
    // Submit form

    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
API_KEY=your-api-key
DATABASE_URL=your-database-url
```

### Database Schema

```sql
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_type VARCHAR(50),
  preference_mode VARCHAR(50),
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP
);

CREATE INDEX idx_preferences_type ON preferences(preference_type);
CREATE INDEX idx_preferences_created ON preferences(created_at);
```

## Troubleshooting

### Common Issues

**Issue**: Form state not updating
- Check context provider is wrapping component
- Verify dispatch actions are correct type

**Issue**: Validation not triggering
- Ensure validation schema imported correctly
- Check field names match schema keys

**Issue**: Budget threshold not working
- Verify location string matches configuration
- Check listing type is correct

**Issue**: Features not displaying
- Confirm FEATURE_CONFIGS has property type key
- Verify budget is sufficient for premium features

## Next Steps

1. Customize styling for your brand
2. Add location data service integration
3. Implement file upload for documents (if needed)
4. Add analytics tracking
5. Set up email notifications
6. Create admin dashboard for viewing submissions

---

For complete code examples, see the sample data and documentation files.
