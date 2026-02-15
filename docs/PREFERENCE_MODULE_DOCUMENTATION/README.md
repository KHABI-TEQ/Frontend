# Preference Submission Module Documentation

Complete documentation for implementing the Preference Submission system in any application.

## Overview

The Preference Submission Module is a comprehensive real estate preference collection system that supports four preference types:
- **Buy**: Property purchase preferences
- **Rent**: Property rental preferences  
- **Shortlet**: Short-term accommodation booking preferences
- **Joint Venture**: Developer partnership opportunities

## Quick Navigation

### Core Documentation
- **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** - High-level architecture and design principles
- **[DATA_STRUCTURES.md](./DATA_STRUCTURES.md)** - Complete TypeScript interfaces and data models
- **[FORM_FIELDS.md](./FORM_FIELDS.md)** - Detailed field specifications for each preference type
- **[VALIDATION_RULES.md](./VALIDATION_RULES.md)** - Comprehensive validation logic and rules
- **[BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md)** - Core business logic and algorithms
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - API payload structures and integration points

### Configuration & Setup
- **[FEATURE_CONFIGURATIONS.md](./FEATURE_CONFIGURATIONS.md)** - Feature sets and amenities by property type
- **[BUDGET_THRESHOLDS.md](./BUDGET_THRESHOLDS.md)** - Location-based budget requirements
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step implementation guide

### Data Reference
- **[SAMPLE_DATA.md](./SAMPLE_DATA.md)** - Complete test data for all preference types
- **[CONFIGURATION_TEMPLATES.md](./CONFIGURATION_TEMPLATES.md)** - Ready-to-use configuration objects

### Reference Materials
- **[GLOSSARY.md](./GLOSSARY.md)** - Terms and concepts used throughout the module
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guide for adopting this system

---

## Key Features

### Multi-Type Support
- Different form flows and validations per preference type
- Type-safe TypeScript interfaces for each preference
- Flexible feature sets matching property characteristics

### Advanced Validation
- Real-time step-by-step validation
- Conditional validation rules (e.g., bedrooms only for residential)
- Budget-aware feature availability
- Phone number and email format validation (Nigeria-specific)

### Budget Intelligence
- Location and listing-type based budget thresholds
- Budget-to-feature mapping for recommendations
- Dynamic feature availability based on budget
- Currency support (NGN)

### Location Management
- State, LGA (Local Government Area), and area selection
- Custom location fallback for unlisted areas
- Maximum 3 areas per selection
- Multi-LGA support (max 3 LGAs)

### Feature Management
- Basic and premium feature tiers
- Comfort features for shortlet properties
- Budget-driven feature filtering
- Auto-adjust features to budget option

---

## Data Flow

```
User Input
    ↓
Form Step Validation
    ↓
Data Aggregation
    ↓
Pre-submission Validation
    ↓
API Payload Transformation
    ↓
API Submission
```

---

## Preference Type Flows

### Buy Preference
1. Location & Area selection
2. Property details (type, size, bedrooms, condition)
3. Budget range (min-max price)
4. Features & amenities
5. Contact information

### Rent Preference
1. Location & Area selection  
2. Property details (type, bedrooms, lease term, condition)
3. Budget range (min-max price)
4. Features & amenities
5. Contact information

### Shortlet Preference
1. Location & Area selection
2. Property details (type, bedrooms, bathrooms, max guests)
3. Booking dates (check-in, check-out)
4. Budget per night
5. Features & amenities
6. Contact information

### Joint Venture Preference
1. Developer information (company, contact person)
2. Development types and requirements
3. Land requirements and location
4. JV terms and sharing ratios
5. Title documentation requirements

---

## Integration Checklist

- [ ] Review SYSTEM_OVERVIEW.md for architecture understanding
- [ ] Study DATA_STRUCTURES.md for TypeScript interfaces
- [ ] Review FORM_FIELDS.md for UI requirements
- [ ] Implement validation rules from VALIDATION_RULES.md
- [ ] Configure feature sets from FEATURE_CONFIGURATIONS.md
- [ ] Set budget thresholds in BUDGET_THRESHOLDS.md
- [ ] Implement API integration using API_INTEGRATION.md
- [ ] Test with SAMPLE_DATA.md provided test cases
- [ ] Review BUSINESS_LOGIC.md for core algorithms
- [ ] Reference GLOSSARY.md during implementation

---

## File Organization

```
docs/PREFERENCE_MODULE_DOCUMENTATION/
├── README.md (this file)
├── SYSTEM_OVERVIEW.md
├── DATA_STRUCTURES.md
├── FORM_FIELDS.md
├── VALIDATION_RULES.md
├── BUSINESS_LOGIC.md
├── API_INTEGRATION.md
├── FEATURE_CONFIGURATIONS.md
├── BUDGET_THRESHOLDS.md
├── SETUP_GUIDE.md
├── SAMPLE_DATA.md
├── CONFIGURATION_TEMPLATES.md
├── GLOSSARY.md
├── MIGRATION_GUIDE.md
└── CONFIG/ (directory with exportable configuration files)
    ├── feature-configs.ts
    ├── budget-thresholds.ts
    └── validation-schemas.ts
```

---

## Quick Reference

### Preference Type Identifiers
- `buy` - Property purchase
- `rent` - Property rental
- `shortlet` - Short-term accommodation
- `joint-venture` - Development partnership

### Property Subtypes
- **Buy**: Land, Residential, Commercial
- **Rent**: Residential, Commercial
- **Shortlet**: Studio, 1-Bed Apartment, 2-Bed Flat
- **Joint Venture**: Land, Residential, Commercial

### Feature Categories
- **Basic**: Essential amenities
- **Premium**: High-end additions
- **Comfort** (Shortlet only): Enhanced comfort features

### Validation Statuses
- ✅ Valid: All required fields present and correct
- ❌ Invalid: Validation errors present
- ⚠️ Warning: Optional validations failed

---

## Support & Updates

For questions about specific sections:
- Architecture questions → SYSTEM_OVERVIEW.md
- Data modeling questions → DATA_STRUCTURES.md
- UI/Form questions → FORM_FIELDS.md
- Implementation questions → SETUP_GUIDE.md
- Business rules → BUSINESS_LOGIC.md

---

**Documentation Version**: 1.0  
**Last Updated**: 2026-02-15  
**Module Version**: 1.0.0
