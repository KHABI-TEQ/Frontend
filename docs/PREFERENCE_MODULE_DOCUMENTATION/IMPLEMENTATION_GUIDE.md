# Preference Module Implementation Guide

Complete step-by-step guide to integrate the Preference Submission module into another application.

## Quick Start (5 minutes)

### 1. Copy Implementation Files

Copy all files from `IMPLEMENTATION_FILES/` folder to your application:

```
IMPLEMENTATION_FILES/
├── types-preference-form.ts      → src/types/preference-form.ts
├── preference-configs.ts          → src/data/preference-configs.ts
├── preference-validation.ts       → src/utils/validation/preference-validation.ts
├── preference-form.css            → src/styles/preference-form.css
└── test-preferences.js            → public/test-preferences.js
```

### 2. Install Dependencies

```bash
npm install yup react-hot-toast
```

### 3. Create Context Provider (Optional but Recommended)

The context manages form state. Adapt from the original application's context structure if needed.

## Detailed Setup (30 minutes)

### Phase 1: Set Up Type Definitions

**File**: `src/types/preference-form.ts`

This file contains all TypeScript interfaces for:
- `LocationSelection` - State, LGAs, areas
- `BudgetRange` - Min/max prices in NGN
- `FeatureSelection` - Basic and premium features
- 4 Preference Form Types:
  - `BuyPreferenceForm`
  - `RentPreferenceForm`
  - `JointVenturePreferenceForm`
  - `ShortletPreferenceForm`
- API Payloads for each type
- Validation interfaces
- Form state management types

**No modifications needed** - just copy and use.

### Phase 2: Configure Features and Budgets

**File**: `src/data/preference-configs.ts`

Exports two main objects:

1. **FEATURE_CONFIGS**
   - 100+ amenities organized by:
     - Property type (buy, rent, joint-venture, shortlet)
     - Property category (residential, commercial, land)
     - Feature tier (basic, premium, comfort)
   
   **Customize**: Add/remove amenities specific to your market

2. **DEFAULT_BUDGET_THRESHOLDS**
   - Min budget amounts by location and preference type
   - Locations: Lagos, Abuja, Default
   - Types: buy, rent, joint-venture, shortlet
   
   **Customize**: Update amounts for your market rates

### Phase 3: Set Up Validation Rules

**File**: `src/utils/validation/preference-validation.ts`

Provides Yup validation schemas for:
- Location validation
- Budget range validation
- Feature selection validation
- Contact info validation (personal & company)
- Property details validation (buy, rent, shortlet)
- Development details validation (joint venture)
- Booking details validation (shortlet)

**Helper Functions**:
```typescript
getValidationSchema(preferenceType: string)
// Returns appropriate schema for: buy | rent | joint-venture | shortlet
```

**No modifications needed** unless you want to change validation rules.

### Phase 4: Add Styling

**File**: `src/styles/preference-form.css`

Includes:
- Phone input styling (with error states)
- Form animations (slide, fade)
- Feature card styling
- Budget input styling
- Progress indicators
- Responsive mobile adjustments
- Dark mode support
- Accessibility features (focus visible, high contrast)

**Import in your main layout or component:**
```typescript
import '@/styles/preference-form.css';
```

### Phase 5: Set Up State Management

You have two options:

#### Option A: Use Context + Reducer (Recommended)

The original application uses `useReducer` with Context for form state:

```typescript
// Manages:
- currentStep (which form step user is on)
- formData (all form values)
- validationErrors (error messages)
- isSubmitting (loading state)
- budgetThresholds (loaded from configs)
- featureConfigs (loaded from configs)

// Key actions:
SET_STEP, UPDATE_FORM_DATA, SET_VALIDATION_ERRORS, 
SET_SUBMITTING, RESET_FORM, SET_BUDGET_THRESHOLDS, 
SET_FEATURE_CONFIGS
```

#### Option B: Use Simple State (for simpler forms)

```typescript
const [formData, setFormData] = useState<PreferenceForm>({});
const [errors, setErrors] = useState<ValidationError[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### Phase 6: Create Form Components

Create components for each form step:

1. **LocationStep** - State, LGA, Areas selection
2. **BudgetStep** - Min/Max price input
3. **PropertyDetailsStep** - Type-specific property info
4. **FeaturesStep** - Basic & premium feature selection
5. **ContactStep** - User/Company contact information

**For each component**:
- Use Formik or React Hook Form for easier state management
- Validate against schemas from `preference-validation.ts`
- Access features from `FEATURE_CONFIGS`
- Access budgets from `DEFAULT_BUDGET_THRESHOLDS`

### Phase 7: Create API Integration

**Buy Preference Example**:
```typescript
const submitBuyPreference = async (formData: BuyPreferenceForm) => {
  const payload: BuyPreferencePayload = {
    preferenceType: "buy",
    preferenceMode: "buy",
    location: {
      state: formData.location.state,
      localGovernmentAreas: formData.location.lgas,
      selectedAreas: formData.location.areas,
      customLocation: formData.location.customLocation
    },
    budget: {
      minPrice: formData.budget.minPrice,
      maxPrice: formData.budget.maxPrice,
      currency: "NGN"
    },
    propertyDetails: {
      propertyType: formData.propertyDetails.propertyType,
      buildingType: formData.propertyDetails.buildingType,
      minBedrooms: formData.propertyDetails.minBedrooms,
      minBathrooms: formData.propertyDetails.minBathrooms,
      propertyCondition: formData.propertyDetails.propertyCondition,
      purpose: formData.propertyDetails.purpose
    },
    features: {
      baseFeatures: formData.features.basicFeatures,
      premiumFeatures: formData.features.premiumFeatures,
      autoAdjustToFeatures: formData.features.autoAdjustToBudget
    },
    contactInfo: {
      fullName: formData.contactInfo.fullName,
      email: formData.contactInfo.email,
      phoneNumber: formData.contactInfo.phoneNumber
    },
    nearbyLandmark: formData.nearbyLandmark,
    additionalNotes: formData.additionalNotes
  };
  
  const response = await fetch('/api/preferences/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return response.json();
};
```

**Repeat for**:
- Rent preferences (preferenceMode: "tenant")
- Joint venture preferences (preferenceMode: "developer")
- Shortlet preferences (preferenceMode: "shortlet")

### Phase 8: Test with Sample Data

**File**: `public/test-preferences.js`

Includes test data for all 4 preference types:
- Buy: 4BR residential in Lagos
- Rent: 3BR flat in Abuja
- Shortlet: 2BR apartment in Lekki
- Joint Venture: Commercial partnership in Ajah

**Usage**:
1. Copy file to `public/test-preferences.js`
2. Open preference form in browser
3. Open dev console (F12)
4. Paste script content
5. Run: `testAllPreferences()`

## Database Schema (Optional)

If storing preferences in database:

```sql
CREATE TABLE preferences (
  id UUID PRIMARY KEY,
  preference_type VARCHAR(20) NOT NULL,
  user_id UUID,
  location_state VARCHAR(50),
  location_lgas TEXT[],
  location_areas TEXT[],
  min_budget INTEGER,
  max_budget INTEGER,
  features_basic TEXT[],
  features_premium TEXT[],
  property_details JSONB,
  contact_info JSONB,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- For multiple preferences per user
CREATE INDEX idx_user_preferences ON preferences(user_id, preference_type);
```

## Integration Checklist

- [ ] Copy 5 implementation files
- [ ] Install dependencies (yup, react-hot-toast)
- [ ] Set up type definitions
- [ ] Configure features and budgets
- [ ] Add validation schemas
- [ ] Import CSS styles
- [ ] Create form components
- [ ] Implement API endpoints
- [ ] Set up state management
- [ ] Test with sample data
- [ ] Add to database (if needed)
- [ ] Deploy and monitor

## Customization Guide

### Change Feature List

Edit `src/data/preference-configs.ts`:
```typescript
export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "buy-residential": {
    basic: [
      { name: "Your New Feature", type: "basic" },
      // ... more features
    ],
    premium: [
      // ... premium features
    ]
  }
};
```

### Update Budget Thresholds

Edit `src/data/preference-configs.ts`:
```typescript
export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "YourCity", listingType: "buy", minAmount: 3000000 },
];
```

### Add New Preference Type

1. Create new interface in `types-preference-form.ts`
2. Add validation schema in `preference-validation.ts`
3. Add feature configs in `preference-configs.ts`
4. Create form component
5. Add API endpoint
6. Update context if using one

### Change Validation Rules

Edit `src/utils/validation/preference-validation.ts`:
```typescript
const contactInfoSchema = Yup.object({
  fullName: Yup.string()
    .min(3, "Custom error") // Change here
    .required("Custom required message"),
  // ... more rules
});
```

## Troubleshooting

### "Cannot find module @/types/preference-form"
- Check paths in tsconfig.json
- Ensure @ alias points to src folder
- Import as: `import { PreferenceForm } from '@/types/preference-form'`

### Validation errors not showing
- Ensure Yup is installed: `npm install yup`
- Check that schema is being called correctly
- Validate before showing errors

### Features not loading
- Ensure FEATURE_CONFIGS is exported properly
- Check preference type matches config keys
- Verify property type selection updates features

### Context not updating
- Check reducer handles all action types
- Ensure dispatch is called with correct action object
- Verify initial state includes all fields

## Performance Optimization

1. **Memoize Features**
   ```typescript
   const features = useMemo(() => 
     FEATURE_CONFIGS[preferenceType], 
     [preferenceType]
   );
   ```

2. **Debounce Validation**
   ```typescript
   const validateField = useCallback(
     debounce((name, value) => {
       // validate
     }, 300),
     []
   );
   ```

3. **Lazy Load Form Steps**
   ```typescript
   const FormStep = lazy(() => import('./FormStep'));
   ```

## Support & Documentation

- See `README.md` for overview
- See `DATA_STRUCTURES.md` for detailed interfaces
- See `VALIDATION_RULES.md` for all validation rules
- See `FEATURE_CONFIGURATIONS.md` for all amenities
- See `BUSINESS_LOGIC.md` for algorithms
- See `SAMPLE_DATA.md` for test examples

**Files provided** enable complete copy-paste implementation!
