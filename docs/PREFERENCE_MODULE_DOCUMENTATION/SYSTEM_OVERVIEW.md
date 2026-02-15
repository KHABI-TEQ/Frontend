# System Overview

## Architecture

The Preference Submission Module is built on a multi-layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                        │
│          ├─ Buy Preference Form                              │
│          ├─ Rent Preference Form                             │
│          ├─ Shortlet Preference Form                         │
│          └─ Joint Venture Preference Form                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 State Management Layer                       │
│  ├─ PreferenceFormContext (React Context + useReducer)      │
│  ├─ Form state (current step, data, validation)             │
│  └─ Helper functions (navigation, validation, budgeting)    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               Business Logic Layer                           │
│  ├─ Validation Engine (Yup schemas)                         │
│  ├─ Budget Calculation                                      │
│  ├─ Feature Availability Logic                              │
│  └─ Data Transformation                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Data Layer & Configuration                      │
│  ├─ Type Definitions (TypeScript interfaces)                │
│  ├─ Feature Configurations (features by property type)      │
│  ├─ Budget Thresholds (location-based)                      │
│  └─ Validation Schemas (Yup)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    API Layer                                 │
│          └─ Backend Submission Endpoint                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Type Safety
- Complete TypeScript interfaces for all data structures
- Separate interfaces for form data vs API payloads
- Union types for multi-type preference handling
- Strict validation before submission

### 2. Modular Design
- Each preference type (buy, rent, shortlet, JV) has its own flow
- Shared validation logic where applicable
- Extensible configuration system for features and budgets
- Reusable validation schemas using Yup

### 3. User Experience
- Step-by-step form progression with validation feedback
- Real-time validation at each step
- Automatic feature adjustment based on budget
- Context-aware field visibility and requirements
- Form state persistence across steps

### 4. Data Integrity
- Multi-level validation (client-side and schema-based)
- Budget threshold enforcement
- Feature availability filtering
- Contact information standardization

## State Management Flow

### Context-Based State
The module uses React Context API with useReducer for state management:

```
PreferenceFormProvider
  └── state: PreferenceFormState
      ├── currentStep: number
      ├── steps: FormStep[]
      ├── formData: FlexibleFormData
      ├── isSubmitting: boolean
      ├── validationErrors: ValidationError[]
      ├── budgetThresholds: BudgetThreshold[]
      └── featureConfigs: Record<string, FeatureConfig>
```

### Actions
- `SET_STEP`: Navigate to specific step
- `UPDATE_FORM_DATA`: Update form data (with type checking)
- `SET_VALIDATION_ERRORS`: Set validation errors
- `SET_SUBMITTING`: Toggle submission state
- `RESET_FORM`: Reset entire form
- `SET_BUDGET_THRESHOLDS`: Update budget thresholds
- `SET_FEATURE_CONFIGS`: Update feature configurations

## Form Step Progression

### Standard Preference Types (Buy, Rent, Shortlet)
```
Step 0: Location & Area
   ↓
Step 1: Property Details & Budget
   ↓
Step 2: Features & Amenities
   ↓
Step 3: Contact & Preferences
```

### Joint Venture Preference
```
Step 0: Developer Information
   ↓
Step 1: Development Type
   ↓
Step 2: Land Requirements
   ↓
Step 3: JV Terms & Proposal
   ↓
Step 4: Title & Documentation
```

## Data Transformation Pipeline

### Input Data
```
User Form Input
  ↓
Yup Validation Schema
  ↓
Validation Errors (if any)
  ↓
Validated Form Data
```

### Output Data
```
Validated Form Data
  ↓
API Payload Transformation
  ↓
API Request Format
  ↓
Backend Submission
  ↓
Success/Error Response
```

## Configuration System

### Static Configuration
Features and budget thresholds are configured statically in `preference-configs.ts`:

```typescript
FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "buy-residential": { basic: [...], premium: [...] },
  "buy-commercial": { basic: [...], premium: [...] },
  // ... other types
}

DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  // ... other thresholds
]
```

### Dynamic Configuration
Runtime configuration can be updated via context actions:
- Update feature configs: `SET_FEATURE_CONFIGS` action
- Update budget thresholds: `SET_BUDGET_THRESHOLDS` action

## Validation Strategy

### Multi-Level Validation

1. **Field-Level**: Individual field validation (format, length, required)
2. **Step-Level**: Complete step validation before progression
3. **Form-Level**: Full form validation before submission
4. **Conditional**: Rules that depend on other field values

### Validation Example
```
Location Step:
  ├─ state: required
  ├─ lgas: required, min 1, max 3
  └─ areas: max 3 per LGA OR customLocation
```

## Budget Management

### Budget Thresholds
Located by location and listing type:
```
Lagos + buy = 5,000,000 NGN minimum
Lagos + rent = 200,000 NGN minimum
Lagos + shortlet = 15,000 NGN minimum
```

### Feature Availability
Features are filtered based on budget:
1. User enters budget
2. System checks minimum budget for location
3. Features marked with minBudgetRequired are filtered
4. Only available features are offered to user
5. Auto-adjust option automatically removes premium features if budget insufficient

## Error Handling

### Validation Errors
- Collected during step validation
- Displayed to user with specific field references
- Cleared on successful correction
- Prevent step progression

### Business Logic Errors
- Budget insufficient for minimum location requirements
- Feature selection conflicts
- Invalid feature combinations

### API Errors
- Network errors during submission
- Server validation failures
- Business rule violations
- Logged and displayed to user

## Performance Considerations

### Optimization Techniques
1. **Memoization**: Helper functions memoized with useCallback
2. **Lazy Initialization**: Initial state created via factory function
3. **Shallow Comparison**: Form data deep comparison only when necessary
4. **Debouncing**: State updates debounced to prevent excessive renders

### Scalability
- Configuration system allows adding new property types
- Extensible validation schemas
- Dynamic budget threshold updates
- Feature set customization per location

## Integration Points

### APIs
The module expects a backend API endpoint that accepts:
- Preference submission endpoint
- Response with confirmation/error status
- Payload transformation before submission

### External Systems
- Location data service (states, LGAs, areas)
- Budget management system
- Feature catalog
- User/company database
- Document management system

## Security Considerations

1. **Input Validation**: All inputs validated before submission
2. **Type Safety**: TypeScript prevents type-related vulnerabilities
3. **Data Sanitization**: Contact information standardized and validated
4. **Phone Number Validation**: Nigeria-specific regex patterns
5. **Email Validation**: Standard email format validation
6. **CAC Number Validation**: Registration number format validation

## Extensibility

### Adding New Preference Types
1. Create new interface extending BasePreferenceForm
2. Add validation schema
3. Add step configuration
4. Add feature configuration
5. Update type discriminator

### Adding New Properties
1. Extend BasePreferenceForm or specific interface
2. Add field to relevant validation schema
3. Update step validation logic
4. Add UI component

### Adding New Features
1. Add to FEATURE_CONFIGS
2. Define feature category (basic/premium)
3. Set budget requirements
4. Add tooltip descriptions

---

## Next Steps

For implementation:
1. Read [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) for complete type definitions
2. Review [FORM_FIELDS.md](./FORM_FIELDS.md) for UI specifications
3. Check [VALIDATION_RULES.md](./VALIDATION_RULES.md) for validation logic
4. Study [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) for core algorithms
5. Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for implementation steps
