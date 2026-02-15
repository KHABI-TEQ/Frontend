# Implementation Files - Usage Mapping

Complete guide showing what each file does and how to use it in your application.

## Files Included in IMPLEMENTATION_FILES/

### 1. types-preference-form.ts
**Purpose**: TypeScript type definitions and interfaces  
**Copy To**: `src/types/preference-form.ts`  
**File Size**: 300 lines  
**Dependencies**: None

**What It Defines**:
```typescript
// Core interfaces
- LocationSelection
- BudgetRange
- FeatureSelection
- BasePreferenceForm

// Preference-specific forms (extend BasePreferenceForm)
- BuyPreferenceForm
- RentPreferenceForm
- JointVenturePreferenceForm
- ShortletPreferenceForm

// API payloads for each type
- BuyPreferencePayload
- RentPreferencePayload
- JointVenturePreferencePayload
- ShortletPreferencePayload

// Supporting types
- ValidationError, FormValidationState
- FeatureDefinition, FeatureConfig
- BudgetThreshold, FormStep
- PreferenceFormState, PreferenceFormAction
```

**How to Use**:
```typescript
// In your form components
import { BuyPreferenceForm, PreferenceForm } from '@/types/preference-form';

const formData: BuyPreferenceForm = {
  preferenceType: 'buy',
  location: { state: 'Lagos', lgas: [], areas: [] },
  budget: { minPrice: 5000000, maxPrice: 50000000, currency: 'NGN' },
  // ... other fields
};

// Type-safe form handling
const handleSubmit = (data: PreferenceForm) => {
  switch(data.preferenceType) {
    case 'buy':
      // data is BuyPreferenceForm
      break;
    case 'rent':
      // data is RentPreferenceForm
      break;
  }
};
```

**What to Customize**:
- Add new fields to any interface if needed
- Add new preference types by extending BasePreferenceForm
- Modify field types based on your API

---

### 2. preference-configs.ts
**Purpose**: Static configuration data (features, budgets)  
**Copy To**: `src/data/preference-configs.ts`  
**File Size**: 256 lines  
**Dependencies**: `@/types/preference-form`

**What It Exports**:
```typescript
// 1. FEATURE_CONFIGS - Amenities for each property type
FEATURE_CONFIGS = {
  'buy-residential': { basic: [...], premium: [...] },
  'buy-commercial': { basic: [...], premium: [...] },
  'buy-land': { basic: [], premium: [] },
  'rent-residential': { basic: [...], premium: [...] },
  'rent-commercial': { basic: [...], premium: [...] },
  'rent-land': { basic: [], premium: [] },
  'joint-venture-residential': { basic: [...], premium: [...] },
  'joint-venture-commercial': { basic: [...], premium: [...] },
  'joint-venture-land': { basic: [], premium: [] },
  'shortlet': { basic: [...], comfort: [...], premium: [...] }
}

// 2. DEFAULT_BUDGET_THRESHOLDS - Minimum budgets by location
DEFAULT_BUDGET_THRESHOLDS = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Abuja", listingType: "buy", minAmount: 8000000 },
  // ... 12 total entries (3 locations × 4 types)
]
```

**Total Features**:
- Buy (Residential): 29 features
- Buy (Commercial): 18 features
- Rent (Residential): 29 features
- Rent (Commercial): 18 features
- Joint Venture (Residential): 29 features
- Joint Venture (Commercial): 18 features
- Shortlet: 26 features
- **Total: 167+ amenities**

**How to Use**:
```typescript
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

// Get features for a property type
const features = FEATURE_CONFIGS['buy-residential'];
// Returns: { basic: [...], premium: [...] }

// Get minimum budget for location
const threshold = DEFAULT_BUDGET_THRESHOLDS.find(
  t => t.location === 'Lagos' && t.listingType === 'buy'
);
// Returns: { minAmount: 5000000 }
```

**What to Customize**:
1. **Add Features**: Edit FEATURE_CONFIGS arrays
   ```typescript
   "buy-residential": {
     basic: [
       { name: "New Feature", type: "basic" },
       // ... existing features
     ]
   }
   ```

2. **Update Budgets**: Edit DEFAULT_BUDGET_THRESHOLDS
   ```typescript
   { location: "Kano", listingType: "buy", minAmount: 4000000 },
   ```

3. **Add New Property Type**:
   ```typescript
   "buy-luxury": {
     basic: [...],
     premium: [...]
   }
   ```

---

### 3. preference-validation.ts
**Purpose**: Yup validation schemas for all forms  
**Copy To**: `src/utils/validation/preference-validation.ts`  
**File Size**: 299 lines  
**Dependencies**: `yup`, `@/types/preference-form`

**Install**: `npm install yup`

**What It Exports**:
```typescript
// Individual schemas
- locationSchema
- budgetSchema
- featuresSchema
- contactInfoSchema
- jointVentureContactSchema
- buyPropertyDetailsSchema
- rentPropertyDetailsSchema
- shortletPropertyDetailsSchema
- shortletBookingDetailsSchema
- developmentDetailsSchema

// Complete form schemas
- buyPreferenceValidationSchema
- rentPreferenceValidationSchema
- jointVenturePreferenceValidationSchema
- shortletPreferenceValidationSchema

// Helper function
- getValidationSchema(preferenceType)
```

**Validation Rules** (Examples):
```typescript
// Location must have state
state: Yup.string().required("Please select a state")

// Max 3 areas
areas: Yup.array().max(3, "Maximum 3 areas")

// Max price > min price
maxPrice: Yup.number().test(
  "max-greater-than-min",
  "Maximum price must be greater than minimum",
  function(value) {
    return !value || value > this.parent.minPrice;
  }
)

// Nigerian phone number format
phoneNumber: Yup.string().matches(
  /^(\+234|0)[789][01]\d{8}$/,
  "Please enter a valid Nigerian phone number"
)

// CAC registration number (company)
cacRegistrationNumber: Yup.string().matches(
  /^RC\d{6,7}$/,
  "e.g., RC123456"
)
```

**How to Use**:
```typescript
import { 
  buyPreferenceValidationSchema, 
  getValidationSchema 
} from '@/utils/validation/preference-validation';

// Option 1: Use specific schema
const buySchema = buyPreferenceValidationSchema;
const errors = await buySchema.validate(formData);

// Option 2: Use helper function
const schema = getValidationSchema('buy');
try {
  await schema.validate(formData);
} catch (err) {
  console.error(err.errors); // Array of error messages
}

// With Formik
<Formik
  initialValues={formData}
  validationSchema={getValidationSchema(preferenceType)}
  onSubmit={handleSubmit}
>
  {/* form fields */}
</Formik>
```

**What to Customize**:
1. **Change Error Messages**:
   ```typescript
   fullName: Yup.string()
     .min(2, "Name must be 2+ chars") // Change this
     .required("Name is required")
   ```

2. **Add Validation Rules**:
   ```typescript
   email: Yup.string()
     .email()
     .required()
     .test("domain", "Must be company email", (value) => {
       return value?.endsWith('@company.com');
     })
   ```

3. **Make Fields Optional**:
   ```typescript
   additionalNotes: Yup.string()
     .max(1000)
     .nullable() // Make it optional
   ```

---

### 4. preference-form.css
**Purpose**: All styling for the preference form  
**Copy To**: `src/styles/preference-form.css`  
**File Size**: 288 lines  
**Dependencies**: Tailwind CSS classes

**What It Styles**:
```css
/* Components */
.modern-phone-input          /* Phone number input field */
.preference-form-select      /* Select/dropdown fields */
.feature-card                /* Feature selection cards */
.budget-input-container      /* Budget input wrapper */
.tooltip                     /* Hover tooltips */

/* Animations */
.form-slide-enter            /* Form slide-in animation */
.form-slide-exit             /* Form slide-out animation */
.progress-step.completed     /* Progress checkmark */

/* States */
.feature-card.selected       /* Selected feature styling */
.feature-card.disabled       /* Disabled feature styling */
.modern-phone-input.error    /* Error state styling */
.modern-phone-input.valid    /* Valid state styling */

/* Responsive */
@media (max-width: 640px)    /* Mobile adjustments */

/* Dark mode */
@media (prefers-color-scheme: dark)  /* Dark theme */

/* Accessibility */
.focus-visible:focus         /* Keyboard focus indicator */
@media (prefers-contrast: high)      /* High contrast mode */
@media (prefers-reduced-motion: reduce)  /* No animations */
```

**How to Use**:
```typescript
// In your layout.tsx
import '@/styles/preference-form.css';

// In components
<div className="feature-card selected">...</div>
<div className="tooltip">Hover me</div>
<input className="modern-phone-input valid" />
```

**What to Customize**:
```css
/* Change colors */
.feature-card.selected {
  box-shadow: 0 0 0 3px #10b981; /* Change emerald to your brand color */
}

/* Change animation speed */
.form-slide-enter-active {
  transition: opacity 500ms; /* Was 300ms */
}

/* Add new styles */
.success-message {
  @apply p-4 bg-green-50 border border-green-200 rounded-lg;
}
```

---

### 5. test-preferences.js
**Purpose**: Sample data and testing utilities  
**Copy To**: `public/test-preferences.js`  
**File Size**: 275 lines  
**Dependencies**: Browser environment

**What It Provides**:
```javascript
// Test data for all 4 preference types
TEST_DATA = {
  buy: { /* Full buy preference */ },
  rent: { /* Full rent preference */ },
  shortlet: { /* Full shortlet preference */ },
  'joint-venture': { /* Full JV preference */ }
}

// Helper functions
waitForSubmitButton()        // Finds submit button
fillPreferenceForm(type)     // Fills form with test data
testAllPreferences()         // Tests all 4 types

// Global exports
window.TEST_DATA
window.testAllPreferences
window.fillPreferenceForm
```

**Sample Data Included**:
1. **Buy**: 4BR residential, Lagos, ₦100M-₦500M
2. **Rent**: 3BR flat, Abuja, ₦5M-₦15M
3. **Shortlet**: 2BR apartment, Lekki, ₦50K-₦200K
4. **Joint Venture**: Commercial partnership, Ajah

**How to Use**:
```javascript
// 1. Copy entire script
// 2. Open browser dev console (F12)
// 3. Paste script and press Enter
// 4. Call one of these:

testAllPreferences()           // Test all types
fillPreferenceForm('buy')      // Just fill buy form
console.log(TEST_DATA.rent)   // View rent test data
```

**What to Customize**:
```javascript
// Update test data
TEST_DATA.buy.location.state = "Kano";
TEST_DATA.buy.budget.minPrice = 20000000;
TEST_DATA.buy.contactInfo.fullName = "New Name";

// Add more test cases
TEST_DATA.premium_buy = {
  // Copy from existing and modify
};
```

---

## Implementation Workflow

### Step 1: Core Setup (5 min)
```bash
# 1. Copy types file
cp types-preference-form.ts src/types/

# 2. Copy configs
cp preference-configs.ts src/data/

# 3. Install validation
npm install yup
cp preference-validation.ts src/utils/validation/
```

### Step 2: Styling (2 min)
```bash
# Copy CSS
cp preference-form.css src/styles/

# Import in layout
# Add: import '@/styles/preference-form.css'
```

### Step 3: Form Components (30 min)
Create components that:
- Import types from `src/types/preference-form.ts`
- Use validation from `src/utils/validation/preference-validation.ts`
- Access features from `src/data/preference-configs.ts`
- Apply classes from `src/styles/preference-form.css`

### Step 4: State Management (15 min)
Choose approach:
- **Context + Reducer**: Full-featured state management
- **React Hook Form**: Easier form state handling
- **Simple useState**: For minimal complexity

### Step 5: API Integration (20 min)
Create endpoints to accept payloads from `BuyPreferencePayload`, `RentPreferencePayload`, etc.

### Step 6: Testing (10 min)
```javascript
// Copy test file to public/
// Open dev console and run:
testAllPreferences()
```

## File Dependencies Graph

```
types-preference-form.ts
    ↑
    ├── preference-configs.ts
    ├── preference-validation.ts
    └── Your components
    
preference-form.css
    ↓
    Your components

test-preferences.js
    (Independent - can run anytime)
```

## Total Implementation

**Files**: 5  
**Lines of Code**: 1,413  
**Dependencies**: yup, react-hot-toast  
**Time to Setup**: 30-60 minutes  
**Copy-Paste Ready**: 100%  

All files are production-ready and can be copied directly into any React/Next.js application!
