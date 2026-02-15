# Preference Module - Complete Setup Overview

Everything you need to implement the Preference Submission module in your application.

## What You're Getting

Complete, production-ready implementation package with:
- **5 Implementation Files** - Ready to copy-paste
- **14 Documentation Files** - Complete reference guides
- **100+ Amenities** - Pre-configured for all property types
- **12 Budget Thresholds** - Location and type-based minimums
- **200+ Validation Rules** - Comprehensive validation schemas
- **4 Preference Types** - Buy, Rent, Joint Venture, Shortlet
- **Sample Test Data** - All preference types with example values

## Files Structure

```
docs/PREFERENCE_MODULE_DOCUMENTATION/
├── IMPLEMENTATION_FILES/
│   ├── types-preference-form.ts          (300 lines) [TypeScript Types]
│   ├── preference-configs.ts              (256 lines) [Features & Budgets]
│   ├── preference-validation.ts           (299 lines) [Yup Validation]
│   ├── preference-form.css                (288 lines) [Styling]
│   └── test-preferences.js                (275 lines) [Test Data]
│
├── Documentation Files (14 files)
│   ├── README.md                          [Start here]
│   ├── QUICK_START.md                     [15-min guide]
│   ├── SYSTEM_OVERVIEW.md                 [Architecture]
│   ├── DATA_STRUCTURES.md                 [All interfaces]
│   ├── FORM_FIELDS.md                     [50+ field specs]
│   ├── VALIDATION_RULES.md                [200+ rules]
│   ├── BUSINESS_LOGIC.md                  [Algorithms]
│   ├── FEATURE_CONFIGURATIONS.md          [100+ amenities]
│   ├── BUDGET_THRESHOLDS.md               [Min budgets]
│   ├── SETUP_GUIDE.md                     [7-phase setup]
│   ├── SAMPLE_DATA.md                     [Test examples]
│   ├── API_INTEGRATION.md                 [API specs]
│   ├── GLOSSARY.md                        [Terminology]
│   └── This file                          [Overview]
│
└── FILE_USAGE_MAPPING.md                  [File-by-file usage guide]
IMPLEMENTATION_GUIDE.md                    [Detailed setup steps]
```

## Quick Reference

### Implementation Files at a Glance

| File | Purpose | Size | Copy To | Dependencies |
|------|---------|------|---------|--------------|
| types-preference-form.ts | TypeScript interfaces | 300 lines | src/types/ | None |
| preference-configs.ts | Features & budgets | 256 lines | src/data/ | types file |
| preference-validation.ts | Yup schemas | 299 lines | src/utils/validation/ | yup |
| preference-form.css | All styling | 288 lines | src/styles/ | Tailwind |
| test-preferences.js | Test data | 275 lines | public/ | None |

### Total Code

- **Implementation Files**: 1,418 lines
- **Documentation**: 7,100+ lines
- **Combined**: 8,500+ lines
- **Estimated Read Time**: 8-10 hours
- **Estimated Setup Time**: 30-60 minutes

## What Each Type Includes

### Buy Preference
- Property type selection (Land, Residential, Commercial)
- Building type (Detached, Semi-detached, Block)
- Bedroom/bathroom counts
- Condition (New, Renovated, Any)
- Purpose (For living, Resale, Development)
- 29 amenities (basic + premium)
- Budget range in NGN
- Contact information
- Min budget thresholds: 2M-8M NGN (by location)

### Rent Preference
- Property type selection (Self-con, Flat, Mini Flat, Bungalow)
- Building type options
- Bedroom/bathroom counts
- Lease term (6 months, 1 year)
- Purpose (Residential, Office)
- 29 amenities (basic + premium)
- Budget range in NGN
- Contact information
- Min budget thresholds: 100K-300K NGN (by location)

### Joint Venture Preference
- Development type (Equity Split, Lease-to-Build, Development Partner)
- Land size requirements
- Property type (Land, Old Building, Structure to demolish)
- Expected structure type
- Timeline selection
- Company information (CAC number)
- Contact person details
- JV partner expectations
- 29 amenities (basic + premium)
- Budget range in NGN
- Min budget thresholds: 5M-15M NGN (by location)

### Shortlet Preference
- Property type (Studio, 1-Bed, 2-Bed)
- Bedroom/bathroom counts
- Max guests
- Travel type (Solo, Couple, Family, Group, Business)
- Check-in and check-out dates
- 26 amenities (basic + comfort + premium)
- Budget per night in NGN
- Contact information
- Min budget thresholds: 10K-25K NGN (by location)

## Key Features Documented

### Amenities (167+ total)
- Buy Residential: 29 features
- Buy Commercial: 18 features
- Rent Residential: 29 features
- Rent Commercial: 18 features
- Joint Venture Residential: 29 features
- Joint Venture Commercial: 18 features
- Shortlet: 26 features
- Land property: No features (placeholder)

### Budget Thresholds (12 total)
- **Lagos**: buy (5M), rent (200K), jv (10M), shortlet (15K)
- **Abuja**: buy (8M), rent (300K), jv (15M), shortlet (25K)
- **Default**: buy (2M), rent (100K), jv (5M), shortlet (10K)

### Validation Rules
- Location: State + LGA + 1-3 areas
- Budget: Min < Max, both > 0
- Contact: Email, Nigerian phone, name constraints
- Company: CAC registration format
- Dates: Check-out > check-in (shortlet)
- Phone: +234 or 0 format, exact length
- Text: Character limits, no special chars in names

## How to Use This Documentation

### For Quick Implementation
1. Read QUICK_START.md (15 min)
2. Copy implementation files to your project
3. Follow IMPLEMENTATION_GUIDE.md sections 1-4
4. Create form components and API endpoints

### For Complete Understanding
1. Start with README.md
2. Read SYSTEM_OVERVIEW.md for architecture
3. Check DATA_STRUCTURES.md for all types
4. Review VALIDATION_RULES.md for all validations
5. Study FEATURE_CONFIGURATIONS.md for amenities
6. Reference FILE_USAGE_MAPPING.md while coding

### By Role

**Frontend Developer**:
- QUICK_START.md
- FORM_FIELDS.md
- FILE_USAGE_MAPPING.md
- IMPLEMENTATION_GUIDE.md (Steps 1-4, 6)

**Backend Developer**:
- SYSTEM_OVERVIEW.md
- DATA_STRUCTURES.md
- API_INTEGRATION.md
- IMPLEMENTATION_GUIDE.md (Step 7)

**Full-Stack Developer**:
- Read all documentation in recommended order
- Use IMPLEMENTATION_GUIDE.md for end-to-end setup

**Product Manager**:
- QUICK_START.md
- SYSTEM_OVERVIEW.md (high-level sections)
- FEATURE_CONFIGURATIONS.md

## Setup Phases

### Phase 1: Preparation (5 min)
- [ ] Review QUICK_START.md
- [ ] Understand 4 preference types
- [ ] Confirm project structure

### Phase 2: File Setup (10 min)
- [ ] Copy types-preference-form.ts → src/types/
- [ ] Copy preference-configs.ts → src/data/
- [ ] Copy preference-validation.ts → src/utils/validation/
- [ ] Copy preference-form.css → src/styles/
- [ ] Copy test-preferences.js → public/
- [ ] Install dependency: npm install yup

### Phase 3: Configuration (5 min)
- [ ] Review and customize amenities in preference-configs.ts
- [ ] Update budget thresholds for your locations
- [ ] Adjust validation rules if needed

### Phase 4: Component Development (30 min)
- [ ] Create LocationStep component
- [ ] Create BudgetStep component
- [ ] Create PropertyDetailsStep component
- [ ] Create FeaturesStep component
- [ ] Create ContactStep component
- [ ] Implement multi-step form orchestration

### Phase 5: State Management (15 min)
- [ ] Choose state approach (Context, React Hook Form, useState)
- [ ] Implement form state management
- [ ] Connect validation to state
- [ ] Handle step navigation

### Phase 6: API Integration (20 min)
- [ ] Create API endpoints for each preference type
- [ ] Transform form data to API payloads
- [ ] Implement error handling
- [ ] Add success feedback

### Phase 7: Testing & Deployment (15 min)
- [ ] Test with sample data
- [ ] Verify all 4 preference types
- [ ] Check validation works
- [ ] Deploy to staging
- [ ] Deploy to production

**Total Time**: 1-2 hours

## Code Examples

### Import Types
```typescript
import {
  PreferenceForm,
  BuyPreferenceForm,
  RentPreferenceForm,
  JointVenturePreferenceForm,
  ShortletPreferenceForm,
  ValidationError
} from '@/types/preference-form';
```

### Use Validation
```typescript
import { getValidationSchema } from '@/utils/validation/preference-validation';

const schema = getValidationSchema('buy');
await schema.validate(formData);
```

### Access Features
```typescript
import { FEATURE_CONFIGS, DEFAULT_BUDGET_THRESHOLDS } from '@/data/preference-configs';

const features = FEATURE_CONFIGS['buy-residential'];
const minBudget = DEFAULT_BUDGET_THRESHOLDS.find(
  t => t.location === 'Lagos' && t.listingType === 'buy'
);
```

### Apply Styles
```typescript
// In CSS file
import '@/styles/preference-form.css';

// In JSX
<div className="feature-card selected">
  Swimming Pool
</div>
```

## Common Customizations

### Add New Feature
```typescript
// In preference-configs.ts
"buy-residential": {
  basic: [
    { name: "Your New Feature", type: "basic" },
    // ... existing
  ]
}
```

### Change Validation Rule
```typescript
// In preference-validation.ts
fullName: Yup.string()
  .min(3, "Custom minimum length") // Changed from 2
  .max(100)
  .required()
```

### Add New Location
```typescript
// In preference-configs.ts
{ location: "PortHarcourt", listingType: "buy", minAmount: 3000000 },
```

### Create New Preference Type
```typescript
// 1. Add interface in types-preference-form.ts
export interface CustomPreferenceForm extends BasePreferenceForm {
  preferenceType: 'custom';
  // ... custom fields
}

// 2. Add validation in preference-validation.ts
export const customPreferenceValidationSchema = Yup.object({
  // ... validation
});

// 3. Add features in preference-configs.ts
"custom-residential": {
  basic: [...],
  premium: [...]
}

// 4. Create component and integrate
```

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check path aliases in tsconfig.json |
| Validation not working | Ensure yup is installed: `npm install yup` |
| Features not showing | Verify property type matches config keys |
| Styles not applied | Import CSS file in layout.tsx |
| Context errors | Check reducer handles all action types |
| API payload mismatch | Compare with SAMPLE_DATA.md examples |

## Support Resources

- **FILE_USAGE_MAPPING.md** - What each file does
- **IMPLEMENTATION_GUIDE.md** - Step-by-step setup
- **DATA_STRUCTURES.md** - All type definitions
- **VALIDATION_RULES.md** - All validation schemas
- **API_INTEGRATION.md** - API request/response formats
- **SAMPLE_DATA.md** - Real example values
- **GLOSSARY.md** - Term definitions

## Success Criteria

Your implementation is complete when:
- [ ] All 5 implementation files are copied
- [ ] Dependencies installed (yup)
- [ ] Components render without errors
- [ ] All 4 preference types work
- [ ] Validation catches errors
- [ ] API submissions work
- [ ] Test data validates successfully
- [ ] Features and budgets load correctly

## Performance Notes

- FEATURE_CONFIGS: ~25KB (pre-loaded)
- DEFAULT_BUDGET_THRESHOLDS: ~1KB
- Validation schemas: Minimal overhead (~5KB)
- CSS: ~12KB (minified)
- Test data: Not included in production

**Total Bundle Size Impact**: ~40KB (gzipped: ~10KB)

## Next Steps

1. **Read**: QUICK_START.md (15 minutes)
2. **Copy**: Implementation files to your project (5 minutes)
3. **Setup**: Follow IMPLEMENTATION_GUIDE.md (30-60 minutes)
4. **Test**: Use test-preferences.js (5 minutes)
5. **Deploy**: Push to your application (ongoing)

---

**You now have everything needed to implement a complete, professional preference submission system!**

Start with README.md or QUICK_START.md →
