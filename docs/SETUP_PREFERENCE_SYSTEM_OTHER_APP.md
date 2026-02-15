# PREFERENCE SYSTEM - SETUP GUIDE FOR OTHER APPLICATIONS

Complete guide to implementing the preference submission system in another application.

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [File Setup](#file-setup)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

This guide helps you integrate the preference system into a different application. The system supports:

- **4 Preference Types**: Buy, Rent, Shortlet, Joint Venture
- **4 Form Steps**: Progression through location, properties, features, contact
- **Complete Validation**: Client-side and server-side
- **Multi-step Form**: With state persistence
- **Budget Management**: Location-based thresholds

---

## PREREQUISITES

### Required Dependencies

```bash
# Core
npm install yup                    # Validation (v1.0+)
npm install react-hot-toast        # Notifications (optional but recommended)

# Backend (choose based on stack)
npm install express               # If using Node.js
npm install mongoose              # If using MongoDB

# TypeScript
npm install -D typescript
npm install -D @types/node
```

### Files You Need

The following files are exportable from the main application:

1. **EXPORT_PREFERENCE_TYPES.ts** - TypeScript interfaces
2. **EXPORT_PREFERENCE_VALIDATION.ts** - Yup validation schemas
3. **REFERENCE_TYPES_DETAILED_DOCUMENTATION.md** - Complete documentation

---

## FILE SETUP

### Step 1: Create Directory Structure

```
your-app/
├── src/
│   ├── types/
│   │   └── preferences/
│   │       └── index.ts              (import EXPORT_PREFERENCE_TYPES.ts)
│   ├── validations/
│   │   └── preferences/
│   │       └── index.ts              (import EXPORT_PREFERENCE_VALIDATION.ts)
│   ├── constants/
│   │   └── preferences/
│   │       ├── features.ts           (feature configurations)
│   │       └── budgets.ts            (budget thresholds)
│   ├── components/
│   │   └── preferences/
│   │       ├── LocationStep.tsx
│   │       ├── PropertyDetailsStep.tsx
│   │       ├── FeaturesStep.tsx
│   │       └── ContactStep.tsx
│   ├── api/
│   │   └── preferences/
│   │       ├── route.ts              (POST /api/preferences)
│   │       └── validate.ts
│   └── db/
│       └── models/
│           └── preference.ts
└── public/
    └── sample-data.json
```

### Step 2: Copy Type Files

```bash
# Copy the exported types
cp EXPORT_PREFERENCE_TYPES.ts src/types/preferences/index.ts
cp EXPORT_PREFERENCE_VALIDATION.ts src/validations/preferences/index.ts
```

### Step 3: Import Types

```typescript
// src/types/preferences/index.ts
export * from "./preference-types";

// src/components/preferences/LocationStep.tsx
import type {
  LocationSelection,
  PreferenceForm,
} from "@/types/preferences";
import { locationValidationSchema } from "@/validations/preferences";
```

---

## DATABASE SCHEMA

### MongoDB/Mongoose Schema

If using MongoDB, use this schema:

```typescript
// src/db/models/preference.ts
import { Schema, model, Document } from "mongoose";
import type {
  PreferenceForm,
  LocationSelection,
  BudgetRange,
  FeatureSelection,
  ContactInfo,
  JointVentureContactInfo,
  BuyPropertyDetails,
  RentPropertyDetails,
  ShortletPropertyDetails,
  JVDevelopmentDetails,
  ShortletBookingDetails,
} from "@/types/preferences";

export interface IPreferenceDocument extends Document {
  preferenceType: "buy" | "rent" | "shortlet" | "joint-venture";
  preferenceMode: "buy" | "tenant" | "shortlet" | "developer";
  userId: string;
  location: LocationSelection;
  budget: BudgetRange;
  propertyDetails?: BuyPropertyDetails | RentPropertyDetails;
  bookingDetails?: ShortletBookingDetails;
  developmentDetails?: JVDevelopmentDetails;
  features: FeatureSelection;
  contactInfo: ContactInfo | JointVentureContactInfo;
  additionalNotes?: string;
  partnerExpectations?: string;
  nearbyLandmark?: string;
  status: "active" | "paused" | "fulfilled" | "expired" | "archived";
  matchedProperties?: string[];
  views: number;
  responses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const preferencesSchema = new Schema<IPreferenceDocument>(
  {
    preferenceType: {
      type: String,
      enum: ["buy", "rent", "shortlet", "joint-venture"],
      required: true,
      index: true,
    },
    preferenceMode: {
      type: String,
      enum: ["buy", "tenant", "shortlet", "developer"],
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      state: { type: String, required: true },
      lgas: [{ type: String, required: true }],
      areas: [String],
      customLocation: String,
    },
    budget: {
      minPrice: { type: Number, required: true, min: 0 },
      maxPrice: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "NGN", enum: ["NGN"] },
    },
    propertyDetails: Schema.Types.Mixed,
    bookingDetails: Schema.Types.Mixed,
    developmentDetails: Schema.Types.Mixed,
    features: {
      baseFeatures: [String],
      premiumFeatures: [String],
      comfortFeatures: [String],
      autoAdjustToBudget: { type: Boolean, default: false },
    },
    contactInfo: Schema.Types.Mixed,
    additionalNotes: {
      type: String,
      maxlength: 1000,
    },
    partnerExpectations: {
      type: String,
      maxlength: 1000,
    },
    nearbyLandmark: {
      type: String,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["active", "paused", "fulfilled", "expired", "archived"],
      default: "active",
      index: true,
    },
    matchedProperties: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    views: { type: Number, default: 0 },
    responses: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
preferencesSchema.index({ userId: 1, createdAt: -1 });
preferencesSchema.index({ preferenceType: 1 });
preferencesSchema.index({ status: 1, expiresAt: 1 });
preferencesSchema.index({ "location.state": 1, preferenceType: 1 });
preferencesSchema.index({ "budget.minPrice": 1, "budget.maxPrice": 1 });

export const PreferenceModel =
  model<IPreferenceDocument>("Preference", preferencesSchema);
```

### PostgreSQL/SQL Schema

If using SQL:

```sql
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_type VARCHAR(20) NOT NULL CHECK (preference_type IN ('buy', 'rent', 'shortlet', 'joint-venture')),
  preference_mode VARCHAR(20) NOT NULL CHECK (preference_mode IN ('buy', 'tenant', 'shortlet', 'developer')),
  user_id VARCHAR(255) NOT NULL,
  
  -- Location
  state VARCHAR(100) NOT NULL,
  lgas TEXT[] NOT NULL,
  areas TEXT[],
  custom_location VARCHAR(200),
  
  -- Budget
  min_price BIGINT NOT NULL CHECK (min_price > 0),
  max_price BIGINT NOT NULL CHECK (max_price > min_price),
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Details (stored as JSONB for flexibility)
  property_details JSONB,
  booking_details JSONB,
  development_details JSONB,
  
  -- Features
  base_features TEXT[],
  premium_features TEXT[],
  comfort_features TEXT[],
  auto_adjust_to_budget BOOLEAN DEFAULT false,
  
  -- Contact
  contact_info JSONB NOT NULL,
  
  -- Notes
  additional_notes VARCHAR(1000),
  partner_expectations VARCHAR(1000),
  nearby_landmark VARCHAR(200),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'fulfilled', 'expired', 'archived')),
  matched_properties UUID[],
  views INTEGER DEFAULT 0,
  responses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_type (preference_type),
  INDEX idx_status (status, expires_at),
  INDEX idx_location (state, preference_type),
  INDEX idx_budget (min_price, max_price)
);
```

---

## BACKEND IMPLEMENTATION

### API Endpoint: POST /api/preferences

```typescript
// src/api/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PreferenceModel } from "@/db/models/preference";
import { validatePreferenceForm } from "@/validations/preferences";
import { validateBudgetThreshold } from "@/validations/preferences";
import { DEFAULT_BUDGET_THRESHOLDS } from "@/types/preferences";
import type {
  BuyPreferencePayload,
  RentPreferencePayload,
  ShortletPreferencePayload,
  JVPreferencePayload,
  PreferencePayload,
} from "@/types/preferences";

// Middleware to verify user authentication
async function getUserId(request: NextRequest): Promise<string> {
  // Implementation depends on your auth system
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Unauthorized");
  }
  // Extract userId from token/session
  return "user-123"; // Replace with actual extraction
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get user ID from auth
    const userId = await getUserId(request);

    // 2. Parse request body
    const body = (await request.json()) as PreferencePayload;

    // 3. Validate request structure
    const { valid, errors } = await validatePreferenceForm(
      body,
      body.preferenceType
    );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 422 }
      );
    }

    // 4. Validate budget against location threshold
    const budgetValidation = validateBudgetThreshold(
      body.budget.minPrice,
      body.location.state,
      body.preferenceType,
      DEFAULT_BUDGET_THRESHOLDS
    );

    if (!budgetValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: budgetValidation.message,
        },
        { status: 400 }
      );
    }

    // 5. Create preference document
    const preference = await PreferenceModel.create({
      preferenceType: body.preferenceType,
      preferenceMode: body.preferenceMode,
      userId,
      location: body.location,
      budget: body.budget,
      propertyDetails:
        body.propertyType && "propertyType" in body.propertyType
          ? body.propertyType
          : undefined,
      bookingDetails:
        "bookingDetails" in body ? body.bookingDetails : undefined,
      developmentDetails:
        "developmentDetails" in body ? body.developmentDetails : undefined,
      features: body.features,
      contactInfo: body.contactInfo,
      additionalNotes: body.additionalNotes,
      partnerExpectations:
        "partnerExpectations" in body
          ? body.partnerExpectations
          : undefined,
      nearbyLandmark:
        "nearbyLandmark" in body ? body.nearbyLandmark : undefined,
      status: "active",
      isActive: true,
      views: 0,
      responses: 0,
    });

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        preferenceId: preference._id,
        message: "Preference submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Preference submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
```

### Form State Management

```typescript
// src/hooks/usePreferenceForm.ts
import { useReducer, useCallback, useState } from "react";
import type {
  PreferenceForm,
  FlexibleFormData,
  ValidationError,
  FormStep,
} from "@/types/preferences";

interface FormState {
  currentStep: number;
  steps: FormStep[];
  formData: FlexibleFormData;
  isSubmitting: boolean;
  validationErrors: ValidationError[];
}

type FormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<FlexibleFormData> }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_FORM" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "UPDATE_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };

    case "RESET_FORM":
      return {
        ...state,
        currentStep: 0,
        formData: {},
        validationErrors: [],
      };

    default:
      return state;
  }
}

export function usePreferenceForm(preferenceType: string) {
  const [state, dispatch] = useReducer(formReducer, {
    currentStep: 0,
    steps: getStepsForType(preferenceType),
    formData: {},
    isSubmitting: false,
    validationErrors: [],
  });

  const setStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const updateFormData = useCallback((data: Partial<FlexibleFormData>) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: data });
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[]) => {
    dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", payload: submitting });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  return {
    ...state,
    setStep,
    updateFormData,
    setValidationErrors,
    setSubmitting,
    resetForm,
  };
}

function getStepsForType(type: string): FormStep[] {
  const baseSteps = [
    { id: "location", title: "Location & Area", isValid: false, isRequired: true },
    { id: "property", title: "Property Details", isValid: false, isRequired: true },
    { id: "features", title: "Features & Amenities", isValid: false, isRequired: false },
    { id: "contact", title: "Contact Information", isValid: false, isRequired: true },
  ];

  if (type === "joint-venture") {
    return [
      { id: "developer", title: "Developer Info", isValid: false, isRequired: true },
      { id: "development", title: "Development Type", isValid: false, isRequired: true },
      ...baseSteps,
    ];
  }

  return baseSteps;
}
```

---

## FRONTEND IMPLEMENTATION

### Location Step Component

```typescript
// src/components/preferences/LocationStep.tsx
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { locationValidationSchema } from "@/validations/preferences";
import type { LocationSelection } from "@/types/preferences";

interface LocationStepProps {
  initialData?: LocationSelection;
  onNext: (data: LocationSelection) => void;
}

export function LocationStep({ initialData, onNext }: LocationStepProps) {
  const [states] = useState<string[]>(NIGERIAN_STATES);
  const [lgas, setLgas] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: initialData || { state: "", lgas: [], areas: [], customLocation: "" },
    validationSchema: locationValidationSchema,
    onSubmit: (values) => {
      onNext(values);
    },
  });

  // Load LGAs when state changes
  useEffect(() => {
    if (formik.values.state) {
      setLgas(getLGAsForState(formik.values.state));
      formik.setFieldValue("lgas", []);
      formik.setFieldValue("areas", []);
    }
  }, [formik.values.state]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <label>State *</label>
        <select
          name="state"
          value={formik.values.state}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <option value="">Select state...</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {formik.touched.state && formik.errors.state && (
          <div className="error">{formik.errors.state}</div>
        )}
      </div>

      {/* LGAs Checkboxes */}
      {lgas.length > 0 && (
        <div>
          <label>Local Government Areas (1-3) *</label>
          {lgas.map((lga) => (
            <label key={lga}>
              <input
                type="checkbox"
                name="lgas"
                value={lga}
                checked={formik.values.lgas.includes(lga)}
                onChange={(e) => {
                  if (e.target.checked) {
                    formik.setFieldValue("lgas", [...formik.values.lgas, lga]);
                  } else {
                    formik.setFieldValue(
                      "lgas",
                      formik.values.lgas.filter((l) => l !== lga)
                    );
                  }
                }}
              />
              {lga}
            </label>
          ))}
          {formik.touched.lgas && formik.errors.lgas && (
            <div className="error">{formik.errors.lgas}</div>
          )}
        </div>
      )}

      {/* Areas and Custom Location - similar structure */}

      <button type="submit">Next</button>
    </form>
  );
}
```

### Complete Form Wrapper

```typescript
// src/components/preferences/PreferenceForm.tsx
import { useState } from "react";
import { LocationStep } from "./LocationStep";
import { PropertyDetailsStep } from "./PropertyDetailsStep";
import { FeaturesStep } from "./FeaturesStep";
import { ContactStep } from "./ContactStep";
import { usePreferenceForm } from "@/hooks/usePreferenceForm";
import type { PreferencePayload } from "@/types/preferences";

interface PreferenceFormProps {
  preferenceType: "buy" | "rent" | "shortlet" | "joint-venture";
  onSuccess: (preferenceId: string) => void;
}

export function PreferenceForm({ preferenceType, onSuccess }: PreferenceFormProps) {
  const {
    currentStep,
    steps,
    formData,
    isSubmitting,
    setStep,
    updateFormData,
    setSubmitting,
  } = usePreferenceForm(preferenceType);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferenceType,
          preferenceMode: mapTypeToMode(preferenceType),
          ...formData,
        } as PreferencePayload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.preferenceId);
      } else {
        console.error("Submission failed:", data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LocationStep
            initialData={formData.location}
            onNext={(location) => {
              updateFormData({ location });
              setStep(1);
            }}
          />
        );

      case 1:
        return (
          <PropertyDetailsStep
            preferenceType={preferenceType}
            initialData={formData.propertyDetails}
            onNext={(propertyDetails) => {
              updateFormData({ propertyDetails });
              setStep(2);
            }}
          />
        );

      case 2:
        return (
          <FeaturesStep
            initialData={formData.features}
            propertyType={formData.propertyDetails?.propertySubtype}
            onNext={(features) => {
              updateFormData({ features });
              setStep(3);
            }}
          />
        );

      case 3:
        return (
          <ContactStep
            preferenceType={preferenceType}
            initialData={formData.contactInfo}
            onSubmit={(contactInfo) => {
              updateFormData({ contactInfo });
              handleSubmit();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step ${index === currentStep ? "active" : ""}`}
          >
            {step.title}
          </div>
        ))}
      </div>

      <div className="form-content">{renderStep()}</div>

      <div className="form-footer">
        <button onClick={() => setStep(currentStep - 1)} disabled={currentStep === 0}>
          Back
        </button>
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>
    </div>
  );
}

function mapTypeToMode(type: string): string {
  const modes: Record<string, string> = {
    buy: "buy",
    rent: "tenant",
    shortlet: "shortlet",
    "joint-venture": "developer",
  };
  return modes[type];
}
```

---

## TESTING

### Test Location Validation

```typescript
// tests/preferences.test.ts
import { locationValidationSchema } from "@/validations/preferences";

describe("Location Validation", () => {
  it("should validate correct location data", async () => {
    const validData = {
      state: "Lagos",
      lgas: ["Ikoyi"],
      areas: ["Ikoyi"],
      customLocation: null,
    };

    const result = await locationValidationSchema.validate(validData);
    expect(result).toEqual(validData);
  });

  it("should require state", async () => {
    const invalidData = {
      state: "",
      lgas: ["Ikoyi"],
      areas: ["Ikoyi"],
    };

    await expect(locationValidationSchema.validate(invalidData)).rejects.toThrow(
      "Please select a state"
    );
  });

  it("should require areas or customLocation", async () => {
    const invalidData = {
      state: "Lagos",
      lgas: ["Ikoyi"],
      areas: [],
      customLocation: "",
    };

    await expect(locationValidationSchema.validate(invalidData)).rejects.toThrow(
      "Please select areas or provide a custom location"
    );
  });
});
```

### Test API Endpoint

```typescript
// tests/api.test.ts
import { POST } from "@/api/preferences/route";
import { NextRequest } from "next/server";

describe("POST /api/preferences", () => {
  it("should create preference with valid data", async () => {
    const request = new NextRequest("http://localhost:3000/api/preferences", {
      method: "POST",
      body: JSON.stringify({
        preferenceType: "buy",
        preferenceMode: "buy",
        location: {
          state: "Lagos",
          lgas: ["Ikoyi"],
          areas: ["Ikoyi"],
        },
        budget: {
          minPrice: 150000000,
          maxPrice: 800000000,
          currency: "NGN",
        },
        features: {
          baseFeatures: [],
          premiumFeatures: [],
          autoAdjustToBudget: false,
        },
        contactInfo: {
          fullName: "John Doe",
          email: "john@example.com",
          phoneNumber: "+2347012345678",
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.preferenceId).toBeDefined();
  });

  it("should reject invalid preference type", async () => {
    const request = new NextRequest("http://localhost:3000/api/preferences", {
      method: "POST",
      body: JSON.stringify({
        preferenceType: "invalid",
        preferenceMode: "invalid",
        // ...minimal data
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it("should enforce budget thresholds", async () => {
    const request = new NextRequest("http://localhost:3000/api/preferences", {
      method: "POST",
      body: JSON.stringify({
        preferenceType: "buy",
        preferenceMode: "buy",
        location: {
          state: "Lagos",
          lgas: ["Ikoyi"],
          areas: ["Ikoyi"],
        },
        budget: {
          minPrice: 1000000, // Below Lagos minimum of 5M
          maxPrice: 2000000,
          currency: "NGN",
        },
        // ...rest of data
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain("Budget too low");
  });
});
```

---

## TROUBLESHOOTING

### Common Issues

#### 1. "Phone number format invalid"

**Problem**: Phone number validation fails

**Solution**: Ensure phone number matches Nigerian format:
- Starts with +234 or 0
- Operator code: 7, 8, or 9
- Bank code: 0 or 1
- Examples: +2347012345678, 07012345678

```typescript
// Test your phone number
import { validatePhoneNumber } from "@/validations/preferences";

const isValid = validatePhoneNumber("+2347012345678"); // true
const isInvalid = validatePhoneNumber("07112345678"); // false (1 after 7 is invalid)
```

#### 2. "Budget below location minimum"

**Problem**: Budget validation fails even though it seems correct

**Solution**: Check budget thresholds:

```typescript
// src/constants/preferences/budgets.ts
export const DEFAULT_BUDGET_THRESHOLDS = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  // Update if your thresholds are different
];
```

#### 3. "Feature not found in configuration"

**Problem**: Selected feature validation fails

**Solution**: Ensure feature exists in FEATURE_CONFIGS:

```typescript
// Verify feature exists before submission
import { FEATURE_CONFIGS } from "@/constants/preferences/features";

const config = FEATURE_CONFIGS["buy-residential"];
const hasFeature = config.premium.some(f => f.name === "Swimming Pool");
```

#### 4. "Database connection error"

**Problem**: Preferences not saving to database

**Solution**: Check connection string and model:

```typescript
// Verify MongoDB connection
await mongoose.connect(process.env.MONGODB_URI);

// Verify model is defined
import { PreferenceModel } from "@/db/models/preference";
const pref = await PreferenceModel.findOne({ userId: "test" });
```

### Debug Logging

Add comprehensive logging for troubleshooting:

```typescript
// src/api/preferences/route.ts
export async function POST(request: NextRequest) {
  console.log("[PREFERENCE] Request received");

  try {
    const body = await request.json();
    console.log("[PREFERENCE] Body parsed:", body);

    const { valid, errors } = await validatePreferenceForm(
      body,
      body.preferenceType
    );
    console.log("[PREFERENCE] Validation result:", { valid, errors });

    if (!valid) {
      console.log("[PREFERENCE] Validation failed:", errors);
      return NextResponse.json(
        { success: false, errors },
        { status: 422 }
      );
    }

    const preference = await PreferenceModel.create(body);
    console.log("[PREFERENCE] Created preference:", preference._id);

    return NextResponse.json({ success: true, preferenceId: preference._id });
  } catch (error) {
    console.error("[PREFERENCE] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

---

## NEXT STEPS

1. **Copy the exported files** to your project
2. **Create database schema** using the provided SQL/Mongoose schemas
3. **Implement components** using the provided examples
4. **Test thoroughly** with the test cases
5. **Deploy** and monitor errors

For detailed field specifications, see **REFERENCE_TYPES_DETAILED_DOCUMENTATION.md**

---

This setup guide provides everything needed to implement the preference system in another application. Refer to the detailed documentation for field specifications and business rules.
