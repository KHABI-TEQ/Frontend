# How to Use the Implementation Files

This folder contains all the source code files needed to implement the preference system in any React/Next.js application. This guide explains exactly what each file does and how to integrate it into your project.

## Quick Start (15 minutes)

### 1. Copy All Files
Copy all `.ts`, `.tsx`, `.js`, and `.css` files to your project:

```bash
# Copy to your project
cp types-preference-form.ts your-project/src/types/
cp Preference.ts your-project/src/models/
cp api-types.ts your-project/src/types/
cp system-settings.ts your-project/src/types/
cp preference-configs.ts your-project/src/data/
cp preference-validation.ts your-project/src/utils/validation/
cp preference-form-context.tsx your-project/src/context/
cp preference-form.css your-project/src/styles/
cp test-preferences.js your-project/public/
```

### 2. Install Dependencies
```bash
npm install mongoose yup react-hot-toast
```

### 3. Update Imports
Update any import paths that don't match your project structure.

### 4. Wrap Your App
```tsx
// app.tsx or _app.tsx
import { PreferenceFormProvider } from '@/context/preference-form-context';

export default function App() {
  return (
    <PreferenceFormProvider>
      {/* Your app */}
    </PreferenceFormProvider>
  );
}
```

### 5. Import CSS
```tsx
// In your app layout
import '@/styles/preference-form.css';
```

Done! The system is now ready to use.

---

## File-by-File Breakdown

### **types-preference-form.ts**

**What it does**: Defines all TypeScript interfaces for the preference system

**Where to put it**: `src/types/preference-form.ts`

**What it contains**:
```typescript
- PreferenceForm          // Main form data structure
- PreferenceFormState     // Reducer state
- PreferenceFormAction    // Actions for reducer
- ValidationError         // Error type
- BudgetThreshold         // Budget config
- FeatureConfig           // Feature configuration
- LocationData            // Location structure
- PropertyDetails         // Property info
```

**How to use**:
```typescript
import { PreferenceForm, ValidationError } from '@/types/preference-form';

const formData: PreferenceForm = {
  preferenceType: 'buy',
  location: { state: 'Lagos', lgas: ['Ikoyi'] },
  budget: { minPrice: 100000000, maxPrice: 500000000 },
  contactInfo: { email: 'test@example.com', phoneNumber: '+234...' }
};
```

**Dependencies**: None (pure TypeScript)

---

### **Preference.ts**

**What it does**: MongoDB schema and model for storing preferences in database

**Where to put it**: `src/models/Preference.ts`

**What it contains**:
- MongoDB collection schema
- All validation rules
- Database indexes
- Mongoose model

**How to use**:
```typescript
import { Preference } from '@/models/Preference';

// Create instance
const preference = new Preference();
const model = preference.model;

// Create a preference
const newPreference = await model.create({
  preferenceType: 'buy',
  userId: 'user123',
  location: { state: 'Lagos', localGovernmentAreas: ['Ikoyi'] },
  budget: { minPrice: 100000000, maxPrice: 500000000 },
  contactInfo: { email: 'user@example.com', phoneNumber: '+234...' },
  status: 'active'
});

// Find preferences
const userPreferences = await model.find({ userId: 'user123' });

// Update preference
await model.updateOne({ _id: id }, { status: 'paused' });

// Delete preference
await model.deleteOne({ _id: id });
```

**Dependencies**: 
- `mongoose` - Install with: `npm install mongoose`

**Database Setup**:
```typescript
// In your DB connection file
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);

// Now use Preference model
import { Preference } from '@/models/Preference';
const prefModel = new Preference().model;
```

---

### **api-types.ts**

**What it does**: Type definitions for all API requests/responses

**Where to put it**: `src/types/api.types.ts`

**What it contains**:
```typescript
- ApiResponse<T>           // Standard API response
- PaginatedResponse<T>     // Paginated API response
- User                     // User type
- Agent                    // Agent type
- AuthResponse             // Auth response
- FormFieldError           // Form validation error
- FileUploadResponse       // File upload response
```

**How to use**:
```typescript
import { ApiResponse } from '@/types/api.types';

// In your API handler
export async function GET(req: Request) {
  const response: ApiResponse<PreferenceForm[]> = {
    success: true,
    message: 'Preferences fetched successfully',
    data: preferences,
    statusCode: 200
  };
  return Response.json(response);
}

// In your components
const response: ApiResponse<PreferenceForm> = await fetch('/api/preferences/1').then(r => r.json());
if (response.success) {
  console.log(response.data);
}
```

**Dependencies**: None

---

### **system-settings.ts**

**What it does**: Type definitions for system configuration settings

**Where to put it**: `src/types/system-settings.ts`

**What it contains**:
```typescript
- SystemSetting                    // Individual setting
- SubscriptionSettings             // Subscription config
- HomePageSettings                 // UI settings
- DocumentVerificationSettings     // Verification fees
- InspectionSettings              // Inspection fees
```

**How to use**:
```typescript
import { SystemSetting, InspectionSettings } from '@/types/system-settings';

const inspectionFee: InspectionSettings = {
  inspection_base_fee: 50000,
  inspection_different_lga_fee: 25000,
  max_counter_counts: 5
};

// Fetch from API
const settings: SystemSetting[] = await fetch('/api/settings').then(r => r.json());
const inspectionSettings = settings.find(s => s.category === 'continue-inspection');
```

**Dependencies**: None

---

### **preference-configs.ts**

**What it does**: Pre-configured data for amenities, budgets, and features

**Where to put it**: `src/data/preference-configs.ts`

**What it contains**:
```typescript
- FEATURE_CONFIGS          // 100+ amenities by type
- DEFAULT_BUDGET_THRESHOLDS // Budget requirements
- Amenity categories
- Feature definitions
```

**How to use**:
```typescript
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

// Get features for a property type
const residentialFeatures = FEATURE_CONFIGS.find(
  f => f.propertyType === 'residential'
);
console.log(residentialFeatures.features); // Array of 50+ features

// Get minimum budget for a location
const lagosMinBudget = DEFAULT_BUDGET_THRESHOLDS.find(
  t => t.location === 'Lagos' && t.listingType === 'buy'
);
console.log(lagosMinBudget.minAmount); // 100,000,000

// In components
export function FeatureSelector() {
  return (
    <div>
      {FEATURE_CONFIGS[0].features.map(feature => (
        <label key={feature.id}>
          <input type="checkbox" />
          {feature.name}
        </label>
      ))}
    </div>
  );
}
```

**Customization**:
```typescript
// Add more amenities
const CUSTOM_AMENITIES = [
  { id: 'smart-home', name: 'Smart Home System', tier: 'premium' },
  { id: 'solar', name: 'Solar Power', tier: 'premium' }
];

// Add new locations to budget thresholds
const NEW_THRESHOLDS: BudgetThreshold[] = [
  {
    location: 'Port Harcourt',
    listingType: 'buy',
    minAmount: 50000000
  }
];
```

**Dependencies**: None

---

### **preference-validation.ts**

**What it does**: All validation rules for preference forms

**Where to put it**: `src/utils/validation/preference-validation.ts`

**What it contains**:
```typescript
- Yup validation schemas (200+ rules)
- Helper validation functions
- Budget validation logic
- Location validation logic
- Feature validation logic
```

**How to use**:
```typescript
import { validationSchemas } from '@/utils/validation/preference-validation';

// Validate buy preference
async function validateBuyPreference(data: PreferenceForm) {
  try {
    const schema = validationSchemas.buyPreference;
    const validData = await schema.validate(data);
    console.log('Valid:', validData);
  } catch (error) {
    console.log('Errors:', error.inner); // Array of validation errors
  }
}

// In form submission
const handleSubmit = async (formData) => {
  try {
    await validationSchemas[formData.preferenceType].validate(formData);
    // Submit to server
    await submitPreference(formData);
  } catch (error) {
    // Show errors to user
    showValidationErrors(error.inner);
  }
};
```

**Available Schemas**:
- `buyPreference` - Validation for buy preferences
- `rentPreference` - Validation for rent preferences
- `shortletPreference` - Validation for shortlet preferences
- `jointVenturePreference` - Validation for joint venture preferences

**Dependencies**: 
- `yup` - Install with: `npm install yup`

---

### **preference-form-context.tsx**

**What it does**: React Context for managing preference form state

**Where to put it**: `src/context/preference-form-context.tsx`

**What it contains**:
- Context creation
- Reducer for form state
- Helper functions
- Performance optimization

**How to use**:

**1. Wrap your app with the provider**:
```tsx
// app.tsx or _app.tsx
import { PreferenceFormProvider } from '@/context/preference-form-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PreferenceFormProvider>
          {children}
        </PreferenceFormProvider>
      </body>
    </html>
  );
}
```

**2. Use the hook in components**:
```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

export function PreferenceForm() {
  const {
    state,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    isStepValid
  } = usePreferenceForm();

  return (
    <form>
      <input
        value={state.formData.location?.state || ''}
        onChange={(e) => updateFormData({ 
          location: { ...state.formData.location, state: e.target.value }
        })}
      />
      <button onClick={() => goToNextStep()}>Next</button>
    </form>
  );
}
```

**Available Functions**:
```typescript
// Navigation
goToStep(step: number)           // Jump to specific step
goToNextStep()                   // Move to next step
goToPreviousStep()               // Move to previous step

// Form Data
updateFormData(data)             // Update form data
state.formData                   // Current form data
state.currentStep                // Current step index
state.steps                      // Array of steps

// Validation
validateStep(step)               // Validate specific step
isStepValid(step)                // Check if step is valid
canProceedToNextStep()           // Can advance?
isFormValid()                    // Is entire form valid?
triggerValidation(step?)         // Run validation

// Helpers
getMinBudgetForLocation()        // Get budget requirement
getAvailableFeatures()           // Get features for type
getValidationErrorsForField()    // Get field errors
resetForm()                      // Clear entire form
```

**Dependencies**: 
- `react-hot-toast` - Install with: `npm install react-hot-toast`

---

### **preference-form.css**

**What it does**: All CSS styling for the preference form

**Where to put it**: `src/styles/preference-form.css`

**How to use**:
```tsx
// In your layout file
import '@/styles/preference-form.css';

// In your components
export function PreferenceForm() {
  return (
    <div className="preference-form-container">
      <div className="preference-form-steps">
        {/* Your form content */}
      </div>
    </div>
  );
}
```

**CSS Classes Available**:
```css
.preference-form-container     /* Main form wrapper */
.preference-form-steps         /* Steps indicator */
.preference-form-step          /* Individual step */
.preference-form-step-active   /* Active step styling */
.preference-form-fields        /* Fields container */
.preference-form-field         /* Individual field */
.preference-form-input         /* Input styling */
.preference-form-button        /* Button styling */
.preference-form-error         /* Error message */
.preference-form-success       /* Success state */
.preference-form-loading       /* Loading state */
```

**Customization**:
```css
/* Override colors */
:root {
  --preference-primary: #your-color;
  --preference-border: #your-color;
  --preference-text: #your-color;
}

/* Override sizes */
.preference-form-input {
  font-size: 16px;  /* Change input size */
  padding: 12px;    /* Change padding */
}
```

**Features**:
- Mobile responsive (includes mobile-first design)
- Dark mode support
- Accessibility compliant
- Animation support
- Custom form styling

**Dependencies**: None

---

### **test-preferences.js**

**What it does**: Testing utilities and sample data for all preference types

**Where to put it**: `public/test-preferences.js`

**How to use**:

**1. In browser console**:
```javascript
// At any page with preference form
testAllPreferences()  // Test all preference types

// Test specific type
fillPreferenceForm('buy')
fillPreferenceForm('rent')
fillPreferenceForm('shortlet')
fillPreferenceForm('joint-venture')

// View test data
console.log(TEST_DATA)
```

**2. Sample data structure**:
```javascript
TEST_DATA = {
  buy: {
    location: { state: "Lagos", lgas: ["Ikoyi"], ... },
    propertyDetails: { propertySubtype: "Residential", ... },
    budget: { minPrice: 100000000, maxPrice: 500000000 },
    contactInfo: { fullName: "John Doe", ... }
  },
  rent: { /* ... */ },
  shortlet: { /* ... */ },
  "joint-venture": { /* ... */ }
}
```

**3. Using in tests**:
```javascript
// In your test file
import { TEST_DATA } from '@/public/test-preferences';

test('should fill buy preference form', () => {
  const data = TEST_DATA.buy;
  // Use data in your tests
});
```

**Available Functions**:
```javascript
testAllPreferences()           // Run all preference tests
fillPreferenceForm(type)       // Fill form with test data
TEST_DATA                      // Access test data directly
```

**Dependencies**: None (browser API only)

---

## Integration Checklist

### Phase 1: Setup (Day 1)
- [ ] Copy all files to correct directories
- [ ] Install dependencies: `npm install mongoose yup react-hot-toast`
- [ ] Update import paths for your project
- [ ] Verify no TypeScript errors

### Phase 2: Database (Day 1-2)
- [ ] Set up MongoDB connection
- [ ] Create Preference model instance
- [ ] Test database operations
- [ ] Add API routes for CRUD operations

### Phase 3: Frontend (Day 2-3)
- [ ] Wrap app with PreferenceFormProvider
- [ ] Import preference-form.css
- [ ] Create preference form components
- [ ] Implement form steps
- [ ] Add validation error display

### Phase 4: Integration (Day 3-4)
- [ ] Connect form to API
- [ ] Handle form submission
- [ ] Test end-to-end flow
- [ ] Add error handling

### Phase 5: Testing (Day 4-5)
- [ ] Use test-preferences.js for manual testing
- [ ] Test all 4 preference types
- [ ] Test validation rules
- [ ] Test database persistence

### Phase 6: Optimization (Day 5)
- [ ] Performance testing
- [ ] Bundle size analysis
- [ ] Accessibility audit
- [ ] Cross-browser testing

---

## Common Patterns

### Using Preference Type Specific Logic

```typescript
import { usePreferenceForm } from '@/context/preference-form-context';

export function AdditionalDetails() {
  const { state } = usePreferenceForm();
  
  // Show different fields based on preference type
  switch (state.formData.preferenceType) {
    case 'buy':
      return <BuyPreferenceFields />;
    case 'rent':
      return <RentPreferenceFields />;
    case 'shortlet':
      return <ShortletPreferenceFields />;
    case 'joint-venture':
      return <JointVentureFields />;
    default:
      return null;
  }
}
```

### Form Submission

```typescript
async function handleFormSubmit() {
  const { state, isFormValid } = usePreferenceForm();
  
  if (!isFormValid()) {
    toast.error('Please complete all required fields');
    return;
  }
  
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.formData)
    });
    
    const result = await response.json();
    if (result.success) {
      toast.success('Preference saved successfully');
    }
  } catch (error) {
    toast.error('Failed to save preference');
  }
}
```

### Dynamic Feature Selection

```typescript
import { FEATURE_CONFIGS } from '@/data/preference-configs';

export function FeatureSelection() {
  const { state, updateFormData } = usePreferenceForm();
  const selectedType = state.formData.preferenceType;
  
  const config = FEATURE_CONFIGS.find(f => f.propertyType === selectedType);
  
  return (
    <div>
      {config?.features.map(feature => (
        <label key={feature.id}>
          <input 
            type="checkbox"
            onChange={(e) => {
              const features = state.formData.features || {};
              const selected = features[feature.tier] || [];
              updateFormData({
                features: {
                  ...features,
                  [feature.tier]: e.target.checked
                    ? [...selected, feature.id]
                    : selected.filter(f => f !== feature.id)
                }
              });
            }}
          />
          {feature.name}
        </label>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Import errors | Update import paths to match your project structure |
| Type errors | Ensure TypeScript strict mode is disabled or types match |
| Validation not working | Install yup: `npm install yup` |
| Form not appearing | Ensure CSS is imported in layout |
| Context errors | Verify PreferenceFormProvider wraps entire app |
| Database errors | Check MongoDB connection string |
| Toast not showing | Verify react-hot-toast is installed |

---

## Next Steps

1. **Complete Setup**: Follow the integration checklist above
2. **Create Components**: Build form components using the hooks
3. **Add API Routes**: Create endpoints for CRUD operations
4. **Test**: Use test-preferences.js to test functionality
5. **Deploy**: Push to production with confidence

See **FILES_INVENTORY.md** for detailed file documentation.
See **IMPLEMENTATION_GUIDE.md** for step-by-step implementation guide.
