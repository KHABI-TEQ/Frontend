# Validation Rules

Comprehensive validation rules for all forms and fields.

## Framework

Validation uses **Yup** schema validation library with custom error messages tailored for Nigerian real estate context.

## Global Validation Rules

### Phone Numbers (Nigeria)
- **Pattern**: `^(\+234|0)[789][01]\d{8}$`
- **Examples**:
  - `+234 701 234 5678` ✅
  - `0701 234 5678` ✅
  - `+2347012345678` ✅
  - `07012345678` ✅
  - `+2350701234567` ❌ (invalid prefix)
  - `07101234567` ❌ (invalid operator code)

### Email Addresses
- **Pattern**: Standard email validation
- **Examples**:
  - `user@example.com` ✅
  - `user.name@example.co.uk` ✅
  - `invalid.email@` ❌
  - `plainaddress` ❌

### Full Names
- **Pattern**: `^[a-zA-Z\s]+$`
- **Length**: 2-100 characters
- **Rules**:
  - Letters and spaces only
  - No numbers or special characters
  - Minimum 2 characters (catch single letter errors)
  - Maximum 100 characters

### CAC Registration Number
- **Pattern**: `^RC\d{6,7}$`
- **Format**: RC followed by 6 or 7 digits
- **Examples**:
  - `RC123456` ✅
  - `RC1234567` ✅
  - `RC12345` ❌ (5 digits)
  - `123456` ❌ (missing RC)

### Company Names
- **Length**: 2-200 characters
- **Rules**: No specific pattern restrictions

---

## Step-by-Step Validation Rules

### STEP 0: Location & Area Selection

#### Location Schema Validation

```yup
locationSchema = Yup.object({
  state: Yup.string()
    .required("Please select a state"),
    
  lgas: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one Local Government Area"),
    
  areas: Yup.array()
    .of(Yup.string())
    .test(
      "areas-or-custom",
      "Please select areas or provide a custom location",
      function (value) {
        const { customLocation } = this.parent;
        return (value && value.length > 0) || customLocation;
      }
    )
    .max(3, "Maximum 3 areas can be selected"),
    
  customLocation: Yup.string().nullable(),
})
```

#### Validation Logic
1. **State**: 
   - ✅ Required
   - ✅ Must be valid Nigerian state
   - ❌ Cannot be empty

2. **LGAs (Local Government Areas)**:
   - ✅ Required (minimum 1)
   - ✅ Maximum 3 LGAs
   - ✅ Must be valid LGAs for selected state
   - ❌ Empty LGA list

3. **Areas**:
   - ✅ Can select 0-3 areas per LGA
   - ✅ If no areas, customLocation must be provided
   - ✅ If areas provided, customLocation can be empty
   - ❌ More than 3 areas per LGA
   - ❌ No areas AND no customLocation

4. **Custom Location**:
   - ✅ Optional if areas selected
   - ✅ Required if no areas selected
   - ✅ Can be any text description
   - ❌ Empty if areas are empty

#### Enhanced Location Validation (LGA-Area Mapping)
```
For each selected LGA:
  └─ Check areas within that LGA
     ├─ Max 3 areas per LGA
     └─ Areas must be valid for that LGA
     
If no areas across all LGAs:
  └─ customLocation must be provided
```

---

### STEP 1: Property Details & Budget

#### Budget Schema Validation

```yup
budgetSchema = Yup.object({
  minPrice: Yup.number()
    .min(1, "Minimum price must be greater than 0")
    .required("Minimum price is required"),
    
  maxPrice: Yup.number()
    .min(1, "Maximum price must be greater than 0")
    .test(
      "max-greater-than-min",
      "Maximum price must be greater than minimum price",
      function (value) {
        const { minPrice } = this.parent;
        return !minPrice || !value || value > minPrice;
      }
    )
    .required("Maximum price is required"),
    
  currency: Yup.string().default("NGN"),
})
```

#### Budget Validation Rules
1. **Minimum Price**:
   - ✅ Required
   - ✅ Must be > 0
   - ✅ Must be less than maxPrice
   - ✅ Must meet location threshold
   - ❌ Zero or negative values
   - ❌ Greater than or equal to maxPrice

2. **Maximum Price**:
   - ✅ Required
   - ✅ Must be > 0
   - ✅ Must be > minPrice
   - ❌ Zero or negative values
   - ❌ Less than or equal to minPrice

3. **Budget Thresholds**:
   - Lagos + Buy: ≥ 5,000,000 NGN
   - Lagos + Rent: ≥ 200,000 NGN
   - Lagos + Shortlet: ≥ 15,000 NGN
   - Abuja + Buy: ≥ 8,000,000 NGN
   - Abuja + Rent: ≥ 300,000 NGN
   - Abuja + Shortlet: ≥ 25,000 NGN
   - Default + Buy: ≥ 2,000,000 NGN
   - Default + Rent: ≥ 100,000 NGN
   - Default + Shortlet: ≥ 10,000 NGN

#### Buy Property Details Validation

```
propertySubtype: required
└─ If "land":
    ├─ measurementUnit: required
    ├─ landSize OR (minLandSize + maxLandSize): required
    ├─ documentTypes: required (min 1)
    └─ landConditions: optional
    
└─ If "residential" or "commercial":
    ├─ buildingType: required
    ├─ propertyCondition: required
    ├─ bedrooms (residential only): required
    ├─ bathrooms: optional
    └─ documentTypes: required (min 1)
```

**Document Types Validation**:
- Minimum 1 required
- Options: Deed of Assignment, C of O, Governor's Consent, Land Allocation, Receipt

**Land Size Validation**:
```
If measurementUnit = "sqm":
  ├─ minLandSize: required, > 0
  ├─ maxLandSize: required, > 0
  └─ maxLandSize > minLandSize ✓

If measurementUnit = "plot" or "hectares":
  └─ landSize: required, > 0
```

#### Rent Property Details Validation

```
propertySubtype: required
├─ buildingType: required
├─ propertyCondition: required
├─ leaseTerm: required (6 Months or 1 Year)
├─ purpose: required (Residential or Office)
├─ bedrooms (residential): required
├─ bathrooms: optional
└─ measurementUnit + land size: optional
```

#### Shortlet Property Details Validation

```
propertyType: required
├─ bedrooms: required
├─ bathrooms: required (min 1)
├─ maxGuests: required (1-20)
└─ travelType: required
```

#### Joint Venture Land Requirements Validation

```
minLandSize: required
├─ measurementUnit: required
├─ maxLandSize: optional
│  └─ If provided: maxLandSize > minLandSize
└─ documentTypes: required (min 1)
```

---

### STEP 2: Features & Amenities

#### Features Schema Validation

```yup
featuresSchema = Yup.object({
  basicFeatures: Yup.array()
    .of(Yup.string())
    .default([]),
    
  premiumFeatures: Yup.array()
    .of(Yup.string())
    .default([]),
    
  autoAdjustToBudget: Yup.boolean()
    .default(false),
})
```

#### Feature Validation Rules
1. **Basic Features**:
   - ✅ Optional (can be empty)
   - ✅ Can select multiple
   - ✅ Must exist in feature configuration
   - ✅ No budget requirements for basic features

2. **Premium Features**:
   - ✅ Optional (can be empty)
   - ✅ Can select multiple
   - ✅ Must exist in feature configuration
   - ✅ Checked against minBudgetRequired
   - ❌ Feature not in configuration
   - ❌ Budget less than minBudgetRequired (if autoAdjustToBudget = false)

3. **Auto-Adjust to Budget**:
   - ✅ Boolean flag
   - ✅ If true: automatically removes premium features with insufficient budget
   - ✅ If false: premium features remain selected (but validation may warn)

#### Feature Availability Logic
```
For each premium feature:
  ├─ Check if minBudgetRequired exists
  ├─ If exists:
  │  ├─ If budget >= minBudgetRequired: ✅ available
  │  └─ If budget < minBudgetRequired: ❌ not available
  └─ If no minimum: ✅ always available
```

---

### STEP 3: Contact Information

#### Contact Info Schema Validation

```yup
contactInfoSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
    .required("Full name is required"),
    
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
    
  phoneNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number"
    )
    .required("Phone number is required"),
    
  whatsappNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian WhatsApp number"
    )
    .nullable(),
})
```

#### Contact Validation Rules
1. **Full Name**:
   - ✅ Required
   - ✅ 2-100 characters
   - ✅ Letters and spaces only
   - ❌ Too short (< 2 chars)
   - ❌ Too long (> 100 chars)
   - ❌ Contains numbers or special characters

2. **Email Address**:
   - ✅ Required
   - ✅ Valid email format
   - ❌ Invalid format
   - ❌ Missing @ or domain

3. **Phone Number**:
   - ✅ Required
   - ✅ Valid Nigerian format
   - ✅ Prefix: +234 or 0
   - ✅ Operator: 7, 8, or 9
   - ✅ Format: +234 (3 digits) (8 digits) or 0 (3 digits) (8 digits)
   - ❌ Invalid operator code
   - ❌ Wrong number of digits
   - ❌ Invalid prefix

4. **WhatsApp Number** (optional):
   - ✅ Same validation as phone if provided
   - ✅ Can be empty
   - ❌ Invalid format if provided

#### Joint Venture Contact Schema Validation

```yup
jointVentureContactSchema = Yup.object({
  companyName: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must be less than 200 characters")
    .required("Company name is required"),
    
  contactPerson: Yup.string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must be less than 100 characters")
    .matches(
      /^[a-zA-Z\s]+$/,
      "Contact person name can only contain letters and spaces"
    )
    .required("Contact person is required"),
    
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
    
  phoneNumber: Yup.string()
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number"
    )
    .required("Phone number is required"),
    
  cacRegistrationNumber: Yup.string()
    .matches(
      /^RC\d{6,7}$/,
      "Please enter a valid CAC registration number (e.g., RC123456)"
    )
    .nullable(),
})
```

#### Joint Venture Contact Validation Rules
1. **Company Name**:
   - ✅ Required
   - ✅ 2-200 characters

2. **Contact Person**:
   - ✅ Required
   - ✅ 2-100 characters
   - ✅ Letters and spaces only

3. **Email, Phone**: Same as standard contact info

4. **CAC Registration Number** (optional):
   - ✅ Optional
   - ✅ Format: RC followed by 6-7 digits
   - ✅ Examples: RC123456, RC1234567
   - ❌ Invalid format if provided

---

### STEP 4: Shortlet-Specific Validations

#### Booking Details Schema

```yup
shortletBookingDetailsSchema = Yup.object({
  checkInDate: Yup.date()
    .min(new Date(), "Check-in date cannot be in the past")
    .required("Check-in date is required"),
    
  checkOutDate: Yup.date()
    .min(Yup.ref("checkInDate"), "Check-out date must be after check-in date")
    .required("Check-out date is required"),
    
  preferredCheckInTime: Yup.string().nullable(),
  preferredCheckOutTime: Yup.string().nullable(),
})
```

#### Shortlet Booking Validation Rules
1. **Check-In Date**:
   - ✅ Required
   - ✅ Cannot be in past (>= today)
   - ✅ Must be before check-out date

2. **Check-Out Date**:
   - ✅ Required
   - ✅ Must be after check-in date
   - ❌ Same as check-in date
   - ❌ Before check-in date

3. **Check-In Time**:
   - ✅ Optional
   - ✅ If provided: valid time format

4. **Check-Out Time**:
   - ✅ Optional
   - ✅ If provided: valid time format

---

### STEP 5: Joint Venture Development Details

#### Development Details Schema

```yup
developmentDetailsSchema = Yup.object({
  minLandSize: Yup.string().required("Land size is required"),
  
  measurementUnit: Yup.string()
    .oneOf(["plot", "sqm", "hectares"], "Please select a valid measurement unit")
    .required("Measurement unit is required"),
    
  jvType: Yup.string()
    .oneOf(
      ["Equity Split", "Lease-to-Build", "Development Partner"],
      "Please select a valid JV type"
    )
    .required("Joint venture type is required"),
    
  propertyType: Yup.string()
    .oneOf(
      ["land", "residential", "commercial"],
      "Please select a valid property type"
    )
    .required("Property type is required"),
    
  timeline: Yup.string()
    .oneOf(
      ["Ready Now", "In 3 Months", "Within 1 Year"],
      "Please select a valid timeline"
    )
    .required("Timeline is required"),
})
```

#### Joint Venture Development Validation Rules
1. **Development Types**:
   - ✅ Required (minimum 1)
   - ✅ Options: Residential, Commercial, Mixed-Use, Land Development

2. **Land Size**:
   - ✅ Required
   - ✅ Must be valid number

3. **Measurement Unit**:
   - ✅ Required
   - ✅ Options: Plot, Sqm, Hectares

4. **JV Type**:
   - ✅ Required
   - ✅ Options: Equity Split, Lease-to-Build, Development Partner

5. **Property Type**:
   - ✅ Required
   - ✅ Options: Land, Old Building, Structure to demolish

6. **Timeline**:
   - ✅ Required
   - ✅ Options: Ready Now, In 3 Months, Within 1 Year

7. **Minimum Title Requirements**:
   - ✅ Required (minimum 1)
   - ✅ Options: Deed of Assignment, Mortgage, C of O, etc.

---

## Cross-Step Validation

### Budget Consistency Check
```
After step 1 completion:
  └─ Check: minPrice <= maxPrice
     └─ Check: minPrice >= location threshold
        └─ Check: maxPrice - minPrice >= reasonable range
```

### Feature-Budget Consistency Check
```
After step 2 completion (if features selected):
  └─ For each premium feature:
      └─ If feature has minBudgetRequired:
          ├─ If budget < requirement:
          │  ├─ If autoAdjustToBudget = true: remove feature
          │  └─ If autoAdjustToBudget = false: allow (may warn)
          └─ Else: feature available
```

### Property Details Consistency Check
```
For non-land properties:
  └─ If propertyType = "residential":
      ├─ bedrooms: required
      └─ bathrooms: optional
  └─ Else (commercial):
      ├─ buildingType: required
      └─ bathrooms: optional
```

---

## Conditional Validation Rules

### Property Type Dependencies
```
If propertySubtype = "land":
  ├─ buildingType: NOT required
  ├─ bedrooms: NOT required
  └─ propertyCondition: NOT required

If propertySubtype = "residential":
  ├─ buildingType: REQUIRED
  ├─ bedrooms: REQUIRED
  └─ propertyCondition: REQUIRED

If propertySubtype = "commercial":
  ├─ buildingType: REQUIRED
  ├─ bedrooms: NOT required
  └─ propertyCondition: REQUIRED
```

### Preference Type Dependencies
```
If preferenceType = "buy":
  ├─ documentTypes: REQUIRED
  └─ nearbyLandmark: OPTIONAL

If preferenceType = "rent":
  ├─ leaseTerm: REQUIRED
  └─ purpose: REQUIRED

If preferenceType = "shortlet":
  ├─ bookingDetails: REQUIRED
  └─ maxGuests: REQUIRED

If preferenceType = "joint-venture":
  ├─ developmentDetails: REQUIRED
  ├─ jvType: REQUIRED
  └─ contactInfo type: JointVentureContactInfo
```

---

## Error Messages

All error messages are user-friendly and specific:

| Field | Error | Message |
|-------|-------|---------|
| state | empty | Please select a state |
| lgas | min | Please select at least one Local Government Area |
| lgas | max | Maximum 3 LGAs can be selected |
| areas | conditional | Please select areas or provide a custom location |
| minPrice | required | Minimum price is required |
| minPrice | value | Minimum price must be greater than 0 |
| maxPrice | range | Maximum price must be greater than minimum price |
| fullName | length | Full name must be at least 2 characters |
| fullName | pattern | Full name can only contain letters and spaces |
| email | format | Please enter a valid email address |
| phone | format | Please enter a valid Nigerian phone number |
| documentTypes | min | At least one document type is required |

---

## Validation Testing Checklist

- [ ] Valid single state selection
- [ ] Multiple LGA selection (1-3)
- [ ] Area selection per LGA
- [ ] Custom location fallback
- [ ] Budget range validation
- [ ] Location budget threshold
- [ ] Conditional property fields
- [ ] Phone number Nigerian format
- [ ] Email format validation
- [ ] Feature availability by budget
- [ ] Auto-adjust feature logic
- [ ] Cross-step consistency

---

For complete implementation, see source files:
- `src/utils/validation/preference-validation.ts`
- `src/types/preference-form.ts`
