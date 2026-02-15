# Preference Module Implementation Files

Complete, production-ready source code for implementing the preference system in any React/Next.js application.

## Overview

This folder contains **all the files needed** to integrate the preference submission system into your application. Copy these files to your project and follow the setup guides.

## What's Included
 
### 9 Implementation Files (2,674 lines of code)
likewise the context file and other files
```
IMPLEMENTATION_FILES/
│
├── Core Types & Models
│   ├── types-preference-form.ts       (300 lines)  - Form interfaces
│   ├── Preference.ts                  (444 lines)  - MongoDB model
│   ├── api-types.ts                   (242 lines)  - API interfaces
│   └── system-settings.ts             (75 lines)   - Settings types
│
├── Logic & Configuration
│   ├── preference-configs.ts          (256 lines)  - 100+ amenities & budgets
│   ├── preference-validation.ts       (299 lines)  - 200+ validation rules
│   └── preference-form-context.tsx    (495 lines)  - State management
│
├── Styling
│   └── preference-form.css            (288 lines)  - Complete CSS
│
├── Testing
│   └── test-preferences.js            (275 lines)  - Sample data & tests
│
└── Documentation
    ├── README.md                      (this file)
    ├── FILES_INVENTORY.md             - Detailed file documentation
    └── HOW_TO_USE_THESE_FILES.md     - Implementation guide
```

## Quick Setup (5 minutes)

### 1. Copy Files
Copy all files to your project following this structure:

```bash
src/types/
  └── preference-form.ts
  └── api-types.ts
  └── system-settings.ts

src/models/
  └── Preference.ts

src/data/
  └── preference-configs.ts

src/utils/validation/
  └── preference-validation.ts

src/context/
  └── preference-form-context.tsx

src/styles/
  └── preference-form.css

public/
  └── test-preferences.js
```

### 2. Install Dependencies
```bash
npm install mongoose yup react-hot-toast
```

### 3. Setup Provider
```tsx
// app.tsx or _app.tsx
import { PreferenceFormProvider } from '@/context/preference-form-context';
import '@/styles/preference-form.css';

export default function App({ Component, pageProps }) {
  return (
    <PreferenceFormProvider>
      <Component {...pageProps} />
    </PreferenceFormProvider>
  );
}
```

### 4. Start Using
```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

export function MyForm() {
  const { state, updateFormData } = usePreferenceForm();
  return <div>{/* Your form */}</div>;
}
```

Done! You're ready to use the preference system.

---

## File Directory

### **Types & Models** (Foundation)

| File | Purpose | Size |
|------|---------|------|
| `types-preference-form.ts` | All TypeScript interfaces for forms | 300 lines |
| `Preference.ts` | MongoDB schema & model | 444 lines |
| `api-types.ts` | API request/response types | 242 lines |
| `system-settings.ts` | Configuration types | 75 lines |

### **Logic & Configuration** (Core)

| File | Purpose | Size |
|------|---------|------|
| `preference-configs.ts` | 100+ amenities, budgets, features | 256 lines |
| `preference-validation.ts` | 200+ validation rules | 299 lines |
| `preference-form-context.tsx` | React state management | 495 lines |

### **Styling & Testing** (Support)

| File | Purpose | Size |
|------|---------|------|
| `preference-form.css` | Complete responsive styling | 288 lines |
| `test-preferences.js` | Sample data & testing utilities | 275 lines |

---

## Features Included

### 4 Preference Types
- Buy preferences
- Rent preferences
- Shortlet bookings
- Joint venture opportunities

### 100+ Amenities
Configured by property type (Residential, Commercial, Industrial, etc.)

### 200+ Validation Rules
- Budget validation
- Location validation
- Property details validation
- Contact information validation
- Feature selection validation
- Document type validation

### 12 Budget Thresholds
- Lagos rates
- Abuja rates
- Default rates
- Buy, Rent, and Shortlet specific

### Complete State Management
- Multi-step form handling
- Form data persistence
- Validation error tracking
- Step navigation
- Form reset capability

### Production-Ready
- TypeScript fully typed
- Mongoose schema with indexing
- Performance optimized
- Accessible CSS
- Mobile responsive
- Security validated

---

## What Each File Does

### types-preference-form.ts
Defines the TypeScript interfaces for the entire preference system. All form data, state, and actions are typed here.

**Key Types**:
- `PreferenceForm` - Main form data
- `PreferenceFormState` - Reducer state
- `ValidationError` - Error structure
- `BudgetThreshold` - Budget config
- `FeatureConfig` - Feature config

**Use When**: Creating forms, handling data, type checking

---

### Preference.ts
MongoDB model for storing preferences in the database. Complete schema with validation and indexing.

**Key Features**:
- Full MongoDB schema
- Database-level validation
- Optimized indexes
- Multiple sub-schemas

**Use When**: Storing/retrieving preferences from database, backend operations

---

### api-types.ts
Type definitions for all API communication.

**Key Types**:
- `ApiResponse<T>` - Standard response format
- `User`, `Agent` - Entity types
- `FormFieldError` - Validation errors
- `FileUploadResponse` - File handling

**Use When**: Creating API routes, handling responses

---

### system-settings.ts
Types for system configuration and settings management.

**Key Types**:
- `SystemSetting` - Individual setting
- `SubscriptionSettings` - Subscription config
- `DocumentVerificationSettings` - Fee config
- `InspectionSettings` - Inspection config

**Use When**: Managing system configuration, dynamic settings

---

### preference-configs.ts
Pre-configured data for the entire system. Amenities, budgets, and feature definitions.

**Key Data**:
- 100+ amenities organized by type
- 12 budget thresholds
- Feature tier definitions
- Category mappings

**Use When**: Building dropdowns, getting available options, config values

---

### preference-validation.ts
All validation logic for the preference system.

**Key Functions**:
- Yup validation schemas for each type
- Helper validation functions
- 200+ validation rules
- Step-by-step validators

**Use When**: Validating form data, checking field values

---

### preference-form-context.tsx
React Context for managing form state and providing helper functions.

**Key Functions**:
- `goToStep()` - Navigate steps
- `updateFormData()` - Update state
- `validateStep()` - Validate
- `getMinBudgetForLocation()` - Get budget
- `getAvailableFeatures()` - Get features

**Use When**: Managing form state in components, navigating steps

---

### preference-form.css
Complete CSS for the entire preference form system.

**Key Classes**:
- `.preference-form-container` - Main wrapper
- `.preference-form-steps` - Step indicators
- `.preference-form-field` - Form fields
- `.preference-form-input` - Input styling
- `.preference-form-button` - Button styling

**Use When**: Styling form components, theming

---

### test-preferences.js
Sample data and testing utilities for all preference types.

**Key Data**:
- Sample buy preference
- Sample rent preference
- Sample shortlet booking
- Sample joint venture

**Key Functions**:
- `testAllPreferences()` - Run all tests
- `fillPreferenceForm(type)` - Fill with data
- Access `TEST_DATA` directly

**Use When**: Testing locally, debugging, creating test data

---

## Dependencies Required

```bash
npm install mongoose yup react-hot-toast
```

### mongoose (12.0 KB)
MongoDB object modeling. Required for database operations.

### yup (30.0 KB)
Schema validation. Required for form validation.

### react-hot-toast (15.0 KB)
Toast notifications. Required for user feedback.

**Total dependencies**: ~57 KB (production bundle)

---

## File Statistics

| Metric | Value |
|--------|-------|
| Total Lines | 2,674 |
| Total Size | ~106 KB |
| TypeScript Files | 5 |
| React Files | 1 |
| CSS Files | 1 |
| JavaScript Files | 1 |
| Documentation Files | 2 |
| Import Dependencies | 3 |
| Database Indexes | 7 |
| Validation Schemas | 4 |
| Validation Rules | 200+ |
| Amenities | 100+ |
| Budget Thresholds | 12 |

---

## Integration Path

### Day 1
- [ ] Copy all files to your project
- [ ] Install dependencies
- [ ] Fix any import path issues
- [ ] Verify no TypeScript errors

### Day 2
- [ ] Set up MongoDB connection
- [ ] Create API routes for preferences
- [ ] Wrap app with PreferenceFormProvider
- [ ] Import CSS

### Day 3
- [ ] Build preference form components
- [ ] Implement step navigation
- [ ] Add validation error display
- [ ] Test form validation

### Day 4
- [ ] Connect form to API
- [ ] Test form submission
- [ ] Test database operations
- [ ] Manual testing with test data

### Day 5
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Production deployment

---

## Usage Examples

### Basic Form Setup
```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

export function PreferenceForm() {
  const { state, updateFormData, goToNextStep } = usePreferenceForm();
  
  return (
    <form>
      <input 
        value={state.formData.location?.state}
        onChange={(e) => updateFormData({
          location: { ...state.formData.location, state: e.target.value }
        })}
      />
      <button onClick={goToNextStep}>Next</button>
    </form>
  );
}
```

### Database Operation
```tsx
import { Preference } from '@/models/Preference';

const preference = new Preference();
const model = preference.model;

const newPref = await model.create({
  preferenceType: 'buy',
  userId: 'user123',
  location: { state: 'Lagos', localGovernmentAreas: ['Ikoyi'] },
  budget: { minPrice: 100000000, maxPrice: 500000000 },
  contactInfo: { email: 'user@example.com', phoneNumber: '+234...' }
});
```

### Form Validation
```tsx
import { validationSchemas } from '@/utils/validation/preference-validation';

const schema = validationSchemas.buyPreference;
try {
  await schema.validate(formData);
  // Submit
} catch (error) {
  // Show errors
}
```

### Get Configuration
```tsx
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

const features = FEATURE_CONFIGS.find(f => f.propertyType === 'residential');
const minBudget = DEFAULT_BUDGET_THRESHOLDS.find(
  t => t.location === 'Lagos' && t.listingType === 'buy'
);
```

---

## Documentation Files

### FILES_INVENTORY.md
Detailed documentation of every file:
- What it does
- What it contains
- How to use it
- Dependencies
- File structure
- Import maps

**Read this for**: Understanding each file in detail

### HOW_TO_USE_THESE_FILES.md
Step-by-step guide for using the files:
- Quick start (15 minutes)
- File-by-file breakdown
- Integration checklist
- Common patterns
- Troubleshooting

**Read this for**: Implementing the files in your project

---

## Support & Troubleshooting

### Import Errors
**Problem**: Files not found after copying
**Solution**: Update import paths to match your project structure

### TypeScript Errors
**Problem**: Type errors when using context
**Solution**: Ensure TypeScript is configured correctly

### Validation Not Working
**Problem**: Validation rules not triggering
**Solution**: Install yup: `npm install yup`

### Database Errors
**Problem**: MongoDB connection issues
**Solution**: Verify connection string in environment variables

### CSS Not Applied
**Problem**: Styling not showing on form
**Solution**: Ensure CSS file is imported in your layout

---

## Next Steps

1. **Read FILES_INVENTORY.md** - Understand what each file does
2. **Read HOW_TO_USE_THESE_FILES.md** - Learn how to integrate them
3. **Follow Integration Checklist** - Complete setup step by step
4. **Copy Files** - Add to your project
5. **Test** - Use test data to verify functionality
6. **Deploy** - Push to production with confidence

---

## Summary

You now have:
- 9 complete implementation files
- 2,674 lines of production-ready code
- 200+ validation rules
- 100+ pre-configured amenities
- Complete state management
- Database schema & model
- Professional CSS styling
- Comprehensive documentation

Everything you need to add preference submission to your application. No more, no less.

**Let's build! 🚀**

---

See **FILES_INVENTORY.md** for complete file documentation.
See **HOW_TO_USE_THESE_FILES.md** for implementation guide.
