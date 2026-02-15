# Preference Module - Implementation Files Inventory

Complete list of all files needed to implement the preference system in another application.

## File Structure Overview

```
IMPLEMENTATION_FILES/
├── Types & Interfaces
│   ├── types-preference-form.ts          (300 lines)
│   ├── Preference.ts                     (444 lines)
│   ├── api-types.ts                      (242 lines)
│   └── system-settings.ts                (75 lines)
│
├── Configuration & Constants
│   ├── preference-configs.ts             (256 lines)
│
├── Logic & Utilities
│   ├── preference-validation.ts          (299 lines)
│   ├── preference-form-context.tsx       (495 lines)
│
├── Styles
│   ├── preference-form.css               (288 lines)
│
├── Testing & Data
│   └── test-preferences.js               (275 lines)
```

## File Descriptions & Usage

### 1. Core Type Definitions

#### **types-preference-form.ts** (300 lines)
**Purpose**: All TypeScript interfaces for the preference system
**Contains**:
- `PreferenceForm` - Main form data structure
- `PreferenceFormState` - Reducer state type
- `PreferenceFormAction` - Action types for reducer
- `ValidationError` - Error structure
- `BudgetThreshold` - Budget requirement type
- `FeatureConfig` - Feature configuration type
- `FeatureDefinition` - Individual feature type
- `LocationData` - Location structure
- `PropertyDetails` - Property information

**Usage**:
```typescript
import { 
  PreferenceForm, 
  PreferenceFormState,
  ValidationError 
} from '@/types/preference-form';
```

**How to Implement**:
1. Copy to `src/types/preference-form.ts` in your project
2. Update import paths if necessary
3. These are pure TypeScript - no dependencies except React

---

#### **Preference.ts** (444 lines)
**Purpose**: Mongoose database schema and model for preferences
**Contains**:
- MongoDB schema definitions
- Collection structure
- Validation rules at database level
- Indexes for query optimization
- Mongoose model export

**Usage**:
```typescript
import { Preference } from '@/models/Preference';

const preferenceModel = new Preference().model;
const newPreference = await preferenceModel.create(data);
```

**How to Implement**:
1. Copy to `src/models/Preference.ts` 
2. Requires: `mongoose` package
3. Ensure MongoDB is connected before using
4. Update connection string in your DB config

**Database Setup**:
```bash
npm install mongoose
```

---

#### **api-types.ts** (242 lines)
**Purpose**: API request/response types
**Contains**:
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Pagination structure
- `User` - User interface
- `Agent` - Agent interface
- `AuthResponse` - Authentication response
- Form validation types
- File upload types
- Payment types

**Usage**:
```typescript
import { ApiResponse } from '@/types/api.types';

const response: ApiResponse<PreferenceForm> = await fetch('/api/preferences');
```

**How to Implement**:
1. Copy to `src/types/api.types.ts`
2. Update any custom types specific to your app
3. Use as response wrapper for all API routes

---

#### **system-settings.ts** (75 lines)
**Purpose**: Configuration interface types
**Contains**:
- `SystemSetting` - Setting structure
- `SubscriptionSettings` - Subscription config
- `HomePageSettings` - UI configuration
- `DocumentVerificationSettings` - Document fees
- `InspectionSettings` - Inspection fees

**Usage**:
```typescript
import { SystemSetting } from '@/types/system-settings';
```

**How to Implement**:
1. Copy to `src/types/system-settings.ts`
2. Update categories and fields based on your needs
3. Store settings in database or environment variables

---

### 2. Configuration Files

#### **preference-configs.ts** (256 lines)
**Purpose**: Pre-configured data for the entire preference system
**Contains**:
- 100+ amenities organized by property type
- Budget thresholds (Lagos, Abuja, Default)
- Feature configurations
- Amenity categories
- Validation rules constants

**Usage**:
```typescript
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

const features = FEATURE_CONFIGS.find(f => f.propertyType === 'residential');
const minBudget = DEFAULT_BUDGET_THRESHOLDS.find(t => t.location === 'Lagos');
```

**How to Implement**:
1. Copy to `src/data/preference-configs.ts`
2. Update amenities, budgets, and features as needed
3. These are reusable constants - no dependencies
4. Can be moved to database later if needed

**Customization Points**:
- Add/remove amenities
- Update budget thresholds
- Add new property types
- Configure feature tiers

---

### 3. Logic & State Management

#### **preference-validation.ts** (299 lines)
**Purpose**: All validation rules and helper functions
**Contains**:
- Yup validation schemas
- 200+ validation rules
- Helper validation functions
- Step-by-step validators
- Budget validation logic
- Location validation logic
- Feature validation logic

**Usage**:
```typescript
import { validationSchemas } from '@/utils/validation/preference-validation';

const buySchema = validationSchemas.buyPreference;
const errors = await buySchema.validate(formData);
```

**How to Implement**:
1. Copy to `src/utils/validation/preference-validation.ts`
2. Install dependency: `npm install yup`
3. Use in form submission handlers
4. Can be extended with custom rules

**Dependencies**:
```bash
npm install yup
```

---

#### **preference-form-context.tsx** (495 lines)
**Purpose**: React Context for preference form state management
**Contains**:
- Context creation and setup
- Reducer logic for form state
- Helper functions (goToStep, validate, etc.)
- Memoized callbacks for performance
- Form validation logic
- Step management

**Usage**:
```typescript
// Wrap your app
<PreferenceFormProvider>
  <YourApp />
</PreferenceFormProvider>

// Use in components
import { usePreferenceForm } from '@/context/preference-form-context';

export function MyComponent() {
  const { state, updateFormData, validateStep } = usePreferenceForm();
  // Use context...
}
```

**How to Implement**:
1. Copy to `src/context/preference-form-context.tsx`
2. Dependencies: `react-hot-toast` (for notifications)
3. Wrap your application root with provider
4. Import and use `usePreferenceForm` hook in components

**Dependencies**:
```bash
npm install react-hot-toast
```

**Key Functions Provided**:
- `goToStep(step)` - Navigate to specific step
- `goToNextStep()` - Move to next step
- `goToPreviousStep()` - Move to previous step
- `updateFormData(data)` - Update form state
- `validateStep(step)` - Validate specific step
- `isStepValid(step)` - Check if step is valid
- `canProceedToNextStep()` - Check if can advance
- `resetForm()` - Reset entire form
- `triggerValidation(step)` - Run validation
- `getMinBudgetForLocation(location, type)` - Get budget
- `getAvailableFeatures(type, budget)` - Get features

---

### 4. Styling

#### **preference-form.css** (288 lines)
**Purpose**: Complete CSS styling for preference form
**Contains**:
- Form container styles
- Input and field styles
- Button styles
- Step indicator styles
- Responsive design (mobile-first)
- Dark mode support
- Accessibility styles
- Animation classes

**Usage**:
```typescript
import '@/styles/preference-form.css';
```

**How to Implement**:
1. Copy to `src/styles/preference-form.css`
2. Import in your app layout or component
3. All classes are scoped to prevent conflicts
4. Uses CSS variables for theming

**Customization**:
- Update color variables
- Adjust breakpoints for responsive design
- Modify font sizes and spacing
- Add custom animations

---

### 5. Testing & Sample Data

#### **test-preferences.js** (275 lines)
**Purpose**: Testing utilities and sample data for all preference types
**Contains**:
- Sample data for Buy preferences
- Sample data for Rent preferences
- Sample data for Shortlet preferences
- Sample data for Joint Venture preferences
- Browser console testing utilities
- Form filling functions

**Usage**:
```bash
# In browser console at /preference page:
testAllPreferences()

# Or test specific type:
fillPreferenceForm('buy')

# View test data:
TEST_DATA
```

**How to Implement**:
1. Save as `public/test-preferences.js` in your project
2. Load in development only (optional)
3. Run in browser console for quick testing
4. Use sample data structure for your own test data

**Available Functions**:
- `testAllPreferences()` - Run all tests
- `fillPreferenceForm(type)` - Fill form with test data
- Access `TEST_DATA` object directly

---

## Installation Order

Follow this order to implement all files:

### Phase 1: Type Definitions (No dependencies)
1. ✓ types-preference-form.ts
2. ✓ api-types.ts
3. ✓ system-settings.ts

### Phase 2: Configuration (No dependencies)
4. ✓ preference-configs.ts

### Phase 3: Database Setup (Requires MongoDB)
5. ✓ Preference.ts (Install: `npm install mongoose`)

### Phase 4: Validation (Requires Yup)
6. ✓ preference-validation.ts (Install: `npm install yup`)

### Phase 5: State Management (Requires React)
7. ✓ preference-form-context.tsx (Install: `npm install react-hot-toast`)

### Phase 6: Styling (No dependencies)
8. ✓ preference-form.css

### Phase 7: Testing (Optional)
9. ✓ test-preferences.js

## Required Dependencies Summary

```bash
npm install mongoose yup react-hot-toast
```

## File Size Summary

| File | Lines | Size |
|------|-------|------|
| types-preference-form.ts | 300 | ~12 KB |
| Preference.ts | 444 | ~18 KB |
| api-types.ts | 242 | ~10 KB |
| system-settings.ts | 75 | ~3 KB |
| preference-configs.ts | 256 | ~11 KB |
| preference-validation.ts | 299 | ~12 KB |
| preference-form-context.tsx | 495 | ~20 KB |
| preference-form.css | 288 | ~9 KB |
| test-preferences.js | 275 | ~11 KB |
| **TOTAL** | **2,674** | **~106 KB** |

## Import Map for Your Project

```typescript
// Types
import type { 
  PreferenceForm,
  PreferenceFormState,
  ValidationError
} from '@/types/preference-form';
import type { IPreference, IPreferenceDoc } from '@/models/Preference';
import type { ApiResponse } from '@/types/api.types';
import type { SystemSetting } from '@/types/system-settings';

// Data & Config
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

// Validation
import { validationSchemas } from '@/utils/validation/preference-validation';

// State Management
import { PreferenceFormProvider, usePreferenceForm } from '@/context/preference-form-context';

// Styling
import '@/styles/preference-form.css';

// Database
import { Preference } from '@/models/Preference';
```

## Notes

- All files are production-ready
- No hardcoded IDs or environment variables
- Fully typed with TypeScript
- Follows React and Node.js best practices
- Database schema includes proper indexing
- Validation includes security checks
- CSS is responsive and accessible
- Comments included for clarity

## Troubleshooting

**Issue**: Import errors after copying
**Solution**: Update import paths to match your project structure

**Issue**: Validation not working
**Solution**: Ensure `yup` is installed: `npm install yup`

**Issue**: Form not submitting
**Solution**: Check that context provider wraps your form component

**Issue**: Database errors
**Solution**: Ensure MongoDB is running and connected properly

**Issue**: Styling not applied
**Solution**: Ensure CSS file is imported in your app layout

---

See **FILE_USAGE_MAPPING.md** for detailed component-by-component usage.
See **IMPLEMENTATION_GUIDE.md** for step-by-step setup instructions.
