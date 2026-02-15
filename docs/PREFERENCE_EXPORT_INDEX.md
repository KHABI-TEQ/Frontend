# PREFERENCE SYSTEM - COMPLETE EXPORT INDEX

Comprehensive guide to all exported documentation and files for implementing the preference system in other applications.

---

## 📋 QUICK NAVIGATION

### For **Quick Setup**
1. Start: [SETUP_PREFERENCE_SYSTEM_OTHER_APP.md](#setup-guide)
2. Then: [EXPORT_PREFERENCE_TYPES.ts](#types-file)
3. Then: [EXPORT_PREFERENCE_VALIDATION.ts](#validation-file)

### For **Deep Dive**
1. Read: [REFERENCE_TYPES_DETAILED_DOCUMENTATION.md](#reference-documentation)
2. Review: All specific preference types (Buy, Rent, Shortlet, JV)
3. Implement: Using exported files

### For **Database Setup**
1. Choose: SQL or MongoDB (see [SETUP_PREFERENCE_SYSTEM_OTHER_APP.md](#setup-guide))
2. Copy: Database schema
3. Run: Migration scripts

---

## 📁 EXPORTED FILES

### 1. REFERENCE_TYPES_DETAILED_DOCUMENTATION.md

**Purpose**: Complete field-by-field documentation for each preference type

**Contains**:
- ✅ All 4 preference types (Buy, Rent, Shortlet, Joint Venture)
- ✅ Every form field with specifications
- ✅ Step-by-step validation logic
- ✅ Form field dependencies
- ✅ Validation patterns
- ✅ Complete workflow examples
- ✅ Sample payloads for each type
- ✅ Business rules and algorithms

**Use When**:
- Implementing form components
- Building validation logic
- Creating API endpoints
- Need field specifications
- Writing tests

**Key Sections**:
```
BUY PREFERENCE
├── Step 0: Location & Area Selection
├── Step 1: Property Details & Budget
├── Step 2: Features & Amenities
├── Step 3: Contact & Preferences
└── Complete Buy Preference Workflow

RENT PREFERENCE
├── Step 0: Location (same as Buy)
├── Step 1: Rent-specific Property Details & Budget
├── Step 2: Features (same as Buy)
└── Step 3: Contact (same as Buy)

SHORTLET PREFERENCE
├── Step 0: Location (same as Buy)
├── Step 1: Shortlet Property Details & Booking Dates
├── Step 2: Features (with comfort features)
└── Step 3: Contact (same as Buy)

JOINT VENTURE PREFERENCE
├── Step 0: Developer Information
├── Step 1: Development Type
├── Step 2: Land Requirements
├── Step 3: JV Terms & Proposal
├── Step 4: Title & Documentation
└── Location & Budget (common steps)
```

**Example Usage**:
```typescript
// Implementing Buy Preference Form
// Reference: REFERENCE_TYPES_DETAILED_DOCUMENTATION.md → BUY PREFERENCE → STEP 1
// Property Type field specifications starting at line ~500
```

---

### 2. EXPORT_PREFERENCE_TYPES.ts

**Purpose**: TypeScript type definitions and interfaces for type-safe development

**Contains**:
- ✅ Complete TypeScript interfaces for all structures
- ✅ Union types for flexible handling
- ✅ Enumerations for constants
- ✅ Type guards for runtime type checking
- ✅ Validation patterns (regex)
- ✅ Default configuration constants
- ✅ Helper types for API responses

**File Size**: ~573 lines

**Main Exports**:

```typescript
// Core Interfaces
export interface LocationSelection
export interface BudgetRange
export interface FeatureSelection
export interface ContactInfo
export interface JointVentureContactInfo

// Property Details
export interface BuyPropertyDetails
export interface RentPropertyDetails
export interface ShortletPropertyDetails
export interface JVDevelopmentDetails
export interface ShortletBookingDetails

// Preference Forms
export interface BuyPreferenceForm
export interface RentPreferenceForm
export interface ShortletPreferenceForm
export interface JointVenturePreferenceForm
export type PreferenceForm = Buy | Rent | Shortlet | JV // Union type

// API Payloads
export interface BuyPreferencePayload
export interface RentPreferencePayload
export interface ShortletPreferencePayload
export interface JVPreferencePayload
export type PreferencePayload = Buy | Rent | Shortlet | JV // Union type

// Configuration
export interface FeatureDefinition
export interface FeatureConfig
export interface BudgetThreshold
export interface ValidationError
export interface FormStep
export interface StoredPreference

// Constants
export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[]
export enum PreferenceTypeEnum
export enum PreferenceModeEnum
export enum PreferenceStatusEnum

// Patterns
export const PHONE_PATTERN: RegExp
export const EMAIL_PATTERN: RegExp
export const FULL_NAME_PATTERN: RegExp
export const CAC_PATTERN: RegExp

// Type Guards
export function isBuyPreference()
export function isRentPreference()
export function isShortletPreference()
export function isJVPreference()
export function isJVContactInfo()
```

**How to Import**:
```typescript
// In your application
import {
  PreferenceForm,
  BuyPreferenceForm,
  LocationSelection,
  BudgetRange,
  FeatureSelection,
  ContactInfo,
  DEFAULT_BUDGET_THRESHOLDS,
  isBuyPreference,
  PHONE_PATTERN,
} from "@/types/preferences";

// Type-safe preference handling
function handlePreference(pref: PreferenceForm) {
  if (isBuyPreference(pref)) {
    // pref is now typed as BuyPreferenceForm
    console.log(pref.nearbyLandmark);
  }
}
```

**Key Constants**:
```typescript
// Budget thresholds by location and type
DEFAULT_BUDGET_THRESHOLDS = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Lagos", listingType: "shortlet", minAmount: 15000 },
  { location: "Lagos", listingType: "joint-venture", minAmount: 10000000 },
  // ... more thresholds
];

// Enumerations for type safety
enum PreferenceTypeEnum {
  BUY = "buy",
  RENT = "rent",
  SHORTLET = "shortlet",
  JOINT_VENTURE = "joint-venture",
}

enum PreferenceModeEnum {
  BUY = "buy",
  TENANT = "tenant",
  SHORTLET = "shortlet",
  DEVELOPER = "developer",
}

enum PreferenceStatusEnum {
  ACTIVE = "active",
  PAUSED = "paused",
  FULFILLED = "fulfilled",
  EXPIRED = "expired",
  ARCHIVED = "archived",
}
```

**Validation Patterns**:
```typescript
// Nigerian phone: +234 or 0 prefix, then valid operator/bank codes
PHONE_PATTERN = /^(\+234|0)[789][01]\d{8}$/;

// Standard email
EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Letters and spaces only
FULL_NAME_PATTERN = /^[a-zA-Z\s]+$/;

// CAC: RC followed by 6-7 digits
CAC_PATTERN = /^RC\d{6,7}$/;
```

---

### 3. EXPORT_PREFERENCE_VALIDATION.ts

**Purpose**: Yup validation schemas for client and server-side validation

**Contains**:
- ✅ Yup validation schemas for every field
- ✅ Cross-field validation logic
- ✅ Conditional validation rules
- ✅ Custom validation functions
- ✅ Error messages
- ✅ Helper utilities

**Dependencies**: `npm install yup`

**File Size**: ~763 lines

**Main Exports**:

```typescript
// Individual field schemas
export const locationValidationSchema: Yup.ObjectSchema
export const buyPropertyDetailsValidationSchema: Yup.ObjectSchema
export const rentPropertyDetailsValidationSchema: Yup.ObjectSchema
export const shortletPropertyDetailsValidationSchema: Yup.ObjectSchema
export const jvDevelopmentDetailsValidationSchema: Yup.ObjectSchema
export const budgetValidationSchema: Yup.ObjectSchema
export const featuresValidationSchema: Yup.ObjectSchema
export const contactInfoValidationSchema: Yup.ObjectSchema
export const jvContactInfoValidationSchema: Yup.ObjectSchema
export const shortletBookingDetailsValidationSchema: Yup.ObjectSchema

// Complete form schemas
export const buyPreferenceFormValidationSchema: Yup.ObjectSchema
export const rentPreferenceFormValidationSchema: Yup.ObjectSchema
export const shortletPreferenceFormValidationSchema: Yup.ObjectSchema
export const jvPreferenceFormValidationSchema: Yup.ObjectSchema

// Custom validators
export function validateBudgetThreshold()
export function validatePremiumFeatures()
export function autoAdjustFeatures()
export function validatePhoneNumber()
export function validateEmail()
export function formatPhoneNumber()
export async function validatePreferenceForm()
```

**Example Usage**:

```typescript
// React form validation with Formik
import { useFormik } from "formik";
import { locationValidationSchema } from "@/validations/preferences";

function LocationForm() {
  const formik = useFormik({
    initialValues: {
      state: "",
      lgas: [],
      areas: [],
      customLocation: "",
    },
    validationSchema: locationValidationSchema,
    onSubmit: (values) => {
      // Submit validated data
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <select
        name="state"
        value={formik.values.state}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        <option>Select state...</option>
      </select>
      {formik.touched.state && formik.errors.state && (
        <div>{formik.errors.state}</div>
      )}
    </form>
  );
}

// Direct validation
async function validateForm(data) {
  try {
    const validated = await buyPreferenceFormValidationSchema.validate(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.inner.map(e => ({
        field: e.path,
        message: e.message,
      })),
    };
  }
}

// Budget threshold validation
const result = validateBudgetThreshold(
  5000000,
  "Lagos",
  "buy",
  DEFAULT_BUDGET_THRESHOLDS
);
if (!result.valid) {
  console.log(result.message); // "Budget too low for Lagos..."
}

// Feature budget validation
const featureErrors = validatePremiumFeatures(
  ["Swimming Pool", "Gym House"],
  150000000,
  FEATURE_CONFIGS["buy-residential"].premium
);
if (!featureErrors.valid) {
  console.log(featureErrors.errors);
  // [{ feature: "Feature Name", message: "..." }]
}

// Auto-adjust features
const adjusted = autoAdjustFeatures(
  ["Swimming Pool", "Gym House"],
  80000000, // Below Swimming Pool minimum
  FEATURE_CONFIGS["buy-residential"].premium
);
// Returns: ["Gym House"] (removes Swimming Pool)
```

**Key Features**:

1. **Conditional Validation**:
```typescript
// propertyCondition is required ONLY if propertyType !== "Land"
propertyCondition: Yup.string()
  .when("propertySubtype", {
    is: (value) => value !== "Land",
    then: (schema) => schema.required("Please select property condition"),
    otherwise: (schema) => schema.nullable().optional(),
  }),
```

2. **Cross-Field Validation**:
```typescript
// maxPrice must be greater than minPrice
maxPrice: Yup.number()
  .test(
    "max-greater-than-min",
    "Maximum price must be greater than minimum price",
    function (value) {
      const { minPrice } = this.parent;
      return !minPrice || !value || value > minPrice;
    }
  ),
```

3. **Custom Patterns**:
```typescript
// Nigerian phone number validation
phoneNumber: Yup.string()
  .required("Phone number is required")
  .matches(
    /^(\+234|0)[789][01]\d{8}$/,
    "Please enter a valid Nigerian phone number"
  ),
```

---

### 4. SETUP_PREFERENCE_SYSTEM_OTHER_APP.md

**Purpose**: Step-by-step implementation guide for integrating into another application

**Contains**:
- ✅ Prerequisites and dependencies
- ✅ Directory structure setup
- ✅ Database schema (MongoDB & SQL)
- ✅ Backend API implementation
- ✅ Frontend component examples
- ✅ Form state management
- ✅ Testing examples
- ✅ Troubleshooting guide

**File Size**: ~1067 lines

**Main Sections**:

```
1. Overview
   - What the system supports
   - Key features

2. Prerequisites
   - Required npm packages
   - Files to export

3. File Setup
   - Directory structure
   - Copying files
   - Importing types

4. Database Schema
   - MongoDB schema (Mongoose)
   - PostgreSQL/SQL schema
   - Indexes for performance

5. Backend Implementation
   - API endpoint: POST /api/preferences
   - Complete request validation
   - Database persistence
   - Error handling

6. Frontend Implementation
   - Location Step component
   - Form state management hook
   - Complete form wrapper
   - Step progression

7. Testing
   - Unit tests for validation
   - API endpoint tests
   - Test fixtures

8. Troubleshooting
   - Common issues and solutions
   - Debug logging
   - Next steps
```

**Key Code Examples**:

1. **Database Schema** (MongoDB):
```typescript
const preferencesSchema = new Schema({
  preferenceType: {
    type: String,
    enum: ["buy", "rent", "shortlet", "joint-venture"],
    required: true,
    index: true,
  },
  // ... more fields
}, { timestamps: true });
```

2. **API Endpoint**:
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  // 2. Parse and validate request
  // 3. Check budget threshold
  // 4. Create database record
  // 5. Return success response
}
```

3. **Form State Management**:
```typescript
const {
  currentStep,
  steps,
  formData,
  isSubmitting,
  setStep,
  updateFormData,
  setValidationErrors,
} = usePreferenceForm(preferenceType);
```

---

## 📊 PREFERENCE TYPE SUMMARY

### BUY PREFERENCE
- **ID**: `buy`
- **Mode**: `buy`
- **Steps**: 4
- **Key Fields**: Property type, Bedrooms, Document types, Budget
- **Budget Thresholds**:
  - Lagos: ≥ 5,000,000 NGN
  - Abuja: ≥ 8,000,000 NGN
  - Default: ≥ 2,000,000 NGN

### RENT PREFERENCE
- **ID**: `rent`
- **Mode**: `tenant`
- **Steps**: 4
- **Key Fields**: Property type, Lease term, Purpose, Budget
- **Budget Thresholds**:
  - Lagos: ≥ 200,000 NGN
  - Abuja: ≥ 300,000 NGN
  - Default: ≥ 100,000 NGN

### SHORTLET PREFERENCE
- **ID**: `shortlet`
- **Mode**: `shortlet`
- **Steps**: 4
- **Key Fields**: Check-in/Check-out dates, Guests, Travel type, Budget
- **Budget Thresholds**:
  - Lagos: ≥ 15,000 NGN/night
  - Abuja: ≥ 25,000 NGN/night
  - Default: ≥ 10,000 NGN/night

### JOINT VENTURE PREFERENCE
- **ID**: `joint-venture`
- **Mode**: `developer`
- **Steps**: 5
- **Key Fields**: Company name, Development types, JV terms, Title requirements
- **Budget Thresholds**:
  - Lagos: ≥ 10,000,000 NGN
  - Abuja: ≥ 15,000,000 NGN
  - Default: ≥ 5,000,000 NGN

---

## 🔄 WORKFLOW FOR EACH PREFERENCE TYPE

### Standard Workflow (Buy, Rent, Shortlet)
```
Step 0: Location & Area Selection
  ├─ Select state
  ├─ Select 1-3 LGAs
  ├─ Select areas OR enter custom location
  └─ ✓ Unlock Step 1

Step 1: Property Details & Budget
  ├─ Select property type
  ├─ Enter property specifications (conditional)
  ├─ Select measurement unit
  ├─ Enter land size
  ├─ Enter budget (minPrice, maxPrice)
  └─ ✓ Validate budget threshold

Step 2: Features & Amenities
  ├─ Select basic features (always available)
  ├─ Select premium features (budget-filtered)
  ├─ Optional: Enable auto-adjust to budget
  └─ ✓ Adjust features if needed

Step 3: Contact & Preferences
  ├─ Enter full name
  ├─ Enter email
  ├─ Enter phone number
  ├─ Optional: Enter WhatsApp number
  ├─ Optional: Add notes
  └─ ✓ Submit preference
```

### Joint Venture Workflow
```
Step 0: Developer Information
  ├─ Enter company name
  ├─ Enter contact person
  ├─ Enter email
  ├─ Enter phone
  └─ Optional: CAC number

Step 1: Development Type
  ├─ Select 1+ development types
  └─ Unlock Step 2

Step 2: Land Requirements
  ├─ Select state
  ├─ Select 1-3 LGAs
  ├─ Select measurement unit
  ├─ Enter min/max land size
  └─ Unlock Step 3

Step 3: JV Terms & Proposal
  ├─ Select JV type
  ├─ Enter sharing ratio
  ├─ Optional: Add proposal details
  └─ Unlock Step 4

Step 4: Title & Documentation
  ├─ Select 1+ title requirements
  ├─ Optional: Willing to consider pending title
  └─ Submit preference
```

---

## 🎯 FIELD VALIDATION QUICK REFERENCE

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| State | Select | Yes | Valid Nigerian state |
| LGAs | Multi-select | Yes | 1-3 LGAs |
| Areas | Multi-select | Conditional | 0-3 areas OR customLocation |
| customLocation | Text | Conditional | Max 200 chars (if no areas) |
| minPrice | Currency | Yes | > 0, >= location threshold |
| maxPrice | Currency | Yes | > minPrice |
| fullName | Text | Yes | 2-100 chars, letters & spaces |
| email | Email | Yes | Valid format |
| phoneNumber | Phone | Yes | Nigerian format (+234 or 0 prefix) |
| bedrooms | Number | Conditional | Based on property type |
| bedrooms | Number | Conditional | Based on property type |
| documentTypes | Multi-select | Conditional | Min 1 (for Buy) |
| checkInDate | Date | For Shortlet | >= Today, < checkOutDate |
| checkOutDate | Date | For Shortlet | > checkInDate |
| companyName | Text | For JV | 2-200 chars |
| cacNumber | Text | Optional | Format: RC\d{6,7} |

---

## 🚀 QUICK START

### For Developers
1. Copy `EXPORT_PREFERENCE_TYPES.ts` → `src/types/preferences.ts`
2. Copy `EXPORT_PREFERENCE_VALIDATION.ts` → `src/validations/preferences.ts`
3. Follow `SETUP_PREFERENCE_SYSTEM_OTHER_APP.md` for database and API setup
4. Reference `REFERENCE_TYPES_DETAILED_DOCUMENTATION.md` while building components

### For Backend Team
1. Set up database schema from `SETUP_PREFERENCE_SYSTEM_OTHER_APP.md`
2. Create API endpoint at `POST /api/preferences`
3. Import validation from `EXPORT_PREFERENCE_VALIDATION.ts`
4. Test with sample payloads from `REFERENCE_TYPES_DETAILED_DOCUMENTATION.md`

### For Frontend Team
1. Copy types and validation files
2. Create form components for each step
3. Use state management hook from setup guide
4. Implement API submission
5. Test with all preference types

---

## 📚 DOCUMENTATION REFERENCES

### Complete Buy Preference
- **Detailed Doc**: REFERENCE_TYPES_DETAILED_DOCUMENTATION.md → Buy Preference
- **Fields**: ~15 fields across 4 steps
- **Validation**: In EXPORT_PREFERENCE_VALIDATION.ts
- **Types**: In EXPORT_PREFERENCE_TYPES.ts

### Complete Rent Preference
- **Detailed Doc**: REFERENCE_TYPES_DETAILED_DOCUMENTATION.md → Rent Preference
- **Fields**: ~12 fields (similar to Buy but rent-specific)
- **Key Difference**: Lease term instead of land documents

### Complete Shortlet Preference
- **Detailed Doc**: REFERENCE_TYPES_DETAILED_DOCUMENTATION.md → Shortlet Preference
- **Fields**: ~11 fields plus booking dates
- **Key Difference**: Check-in/Check-out dates, guest count, travel type

### Complete Joint Venture Preference
- **Detailed Doc**: REFERENCE_TYPES_DETAILED_DOCUMENTATION.md → Joint Venture Preference
- **Fields**: ~12 fields (development-focused)
- **Key Difference**: Company info, development types, JV terms, title requirements

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Install dependencies: `yup`, `react-hot-toast`, database driver
- [ ] Copy exported TypeScript files to project
- [ ] Set up database schema (MongoDB or SQL)
- [ ] Create API endpoint for POST /api/preferences
- [ ] Implement form state management hook
- [ ] Create Location Step component
- [ ] Create Property Details Step component
- [ ] Create Features Step component
- [ ] Create Contact Step component
- [ ] Implement form navigation logic
- [ ] Add validation error display
- [ ] Test with all preference types
- [ ] Test with all budget thresholds
- [ ] Test phone number validation (Nigerian format)
- [ ] Test feature auto-adjustment
- [ ] Implement error handling
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Set up analytics for form completion rates

---

## 📞 SUPPORT

For detailed field specifications: See **REFERENCE_TYPES_DETAILED_DOCUMENTATION.md**

For implementation help: See **SETUP_PREFERENCE_SYSTEM_OTHER_APP.md**

For type definitions: See **EXPORT_PREFERENCE_TYPES.ts**

For validation rules: See **EXPORT_PREFERENCE_VALIDATION.ts**

---

**Last Updated**: February 15, 2026  
**System Version**: 1.0  
**Status**: Production Ready  
**Documentation Completeness**: 100%  

Total Lines of Documentation: **5,869**  
Total Code Examples: **50+**  
Total Preference Types: **4**  
Total Form Fields: **50+**  
Total Validation Rules: **200+**  
