# Form Fields Specification

Detailed field specifications for each preference type form.

## Standard Preference Types (Buy, Rent, Shortlet)

### Step 1: Location & Area Selection

#### Field: State
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**: Nigerian states (Lagos, Abuja, Rivers, etc.)
- **Validation**: 
  - Must select exactly one state
  - Must be valid Nigerian state
- **Dependencies**: None
- **UI Notes**: Load LGAs based on selected state

#### Field: Local Government Areas (LGAs)
- **Type**: Multi-Select Checkbox/Chips
- **Required**: Yes
- **Min Selection**: 1
- **Max Selection**: 3
- **Options**: Populated based on selected state
- **Validation**: 
  - Minimum 1 LGA required
  - Maximum 3 LGAs allowed
  - Must be valid LGA for selected state
- **Dependencies**: State selection
- **UI Notes**: Show available areas when LGA selected

#### Field: Areas within LGA
- **Type**: Multi-Select Checkbox/Chips
- **Required**: Conditional
- **Min Selection**: 0
- **Max Selection**: 3 per LGA
- **Options**: Populated based on selected LGAs
- **Validation**:
  - Maximum 3 areas per LGA
  - Either select areas OR provide custom location
- **Dependencies**: LGA selection
- **UI Notes**: Show area list for each selected LGA

#### Field: Custom Location
- **Type**: Text Input
- **Required**: Conditional
- **Max Length**: 200 characters
- **Placeholder**: "Enter your preferred location if not listed"
- **Validation**:
  - Required if no areas selected
  - Not required if areas already selected
- **Dependencies**: Area selection
- **UI Notes**: Hidden until needed

---

### Step 2: Property Details & Budget

#### Buy Preference - Property Details

**Field: Property Type**
- **Type**: Radio Buttons / Select
- **Required**: Yes
- **Options**: 
  - Land
  - Residential
  - Commercial
- **Validation**: Must select one type
- **Dependencies**: None
- **UI Notes**: Shows additional fields based on selection

**Field: Building Type (Non-Land)**
- **Type**: Select/Dropdown
- **Required**: Conditional (if not Land)
- **Options**: 
  - Detached
  - Semi-Detached
  - Block of Flats
- **Validation**: Required if property type is Residential/Commercial
- **Dependencies**: Property Type != "Land"

**Field: Bedrooms (Residential)**
- **Type**: Select/Dropdown
- **Required**: Conditional (if Residential)
- **Options**: 1, 2, 3, 4, 5, More
- **Validation**: Required for residential properties
- **Dependencies**: Property Type = "Residential"

**Field: Bathrooms (Residential)**
- **Type**: Number Input
- **Required**: No
- **Min**: 0
- **Max**: 20
- **Validation**: Must be non-negative number
- **Dependencies**: Property Type = "Residential"

**Field: Property Condition**
- **Type**: Radio Buttons / Select
- **Required**: Conditional (if not Land)
- **Options**:
  - New
  - Renovated
  - Any
- **Validation**: Required if property type is not Land
- **Dependencies**: Property Type != "Land"

**Field: Purpose**
- **Type**: Radio Buttons / Select
- **Required**: Conditional (if not Land)
- **Options**:
  - For living
  - Resale
  - Development
- **Validation**: Required if property type is Residential
- **Dependencies**: Property Type = "Residential"

**Field: Measurement Unit**
- **Type**: Radio Buttons / Select
- **Required**: Yes
- **Options**:
  - Plot (specific size)
  - Square Meters (sqm) - range
  - Hectares
- **Validation**: Must select one unit
- **Dependencies**: All property types
- **UI Notes**: Controls which land size fields appear

**Field: Land Size**
- **Type**: Number Input
- **Required**: Conditional
- **Min**: 0.01
- **Validation**: Required if measurementUnit is "plot" or "hectares"
- **Dependencies**: Measurement Unit != "sqm"
- **UI Notes**: Placeholder shows unit selected

**Field: Min Land Size (SQM)**
- **Type**: Number Input
- **Required**: Conditional
- **Min**: 0.01
- **Validation**: Required if measurementUnit = "sqm"
- **Dependencies**: Measurement Unit = "sqm"

**Field: Max Land Size (SQM)**
- **Type**: Number Input
- **Required**: Conditional
- **Min**: 0.01
- **Validation**: 
  - Required if measurementUnit = "sqm"
  - Must be greater than min land size
- **Dependencies**: Measurement Unit = "sqm"

**Field: Document Types**
- **Type**: Multi-Checkbox
- **Required**: Yes (Buy only)
- **Options**: 
  - Deed of Assignment
  - Certificate of Occupancy (C of O)
  - Governor's Consent
  - Land Allocation Letter
  - Receipt of Payment
- **Validation**: At least one document type required
- **Dependencies**: Preference Type = "Buy"

**Field: Land Conditions (Joint Venture)**
- **Type**: Multi-Checkbox
- **Required**: Conditional (JV + Land)
- **Options**:
  - Clear/Accessible
  - With Tenant/Occupier
  - Reserved Land
  - Encumbered Land
- **Validation**: Required if JV + property type = Land
- **Dependencies**: Preference Type = "Joint-Venture" AND Property Type = "Land"

#### Rent Preference - Property Details

**Field: Property Type**
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**:
  - Self-con
  - Flat
  - Mini Flat
  - Bungalow
- **Validation**: Must select one type

**Field: Bedrooms**
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**: 1, 2, 3, 4, 5+
- **Validation**: Required

**Field: Lease Term**
- **Type**: Radio Buttons / Select
- **Required**: Yes
- **Options**:
  - 6 Months
  - 1 Year
- **Validation**: Must select one term
- **Default**: 1 Year

**Field: Property Condition**
- **Type**: Radio Buttons
- **Required**: Yes
- **Options**:
  - New
  - Renovated
- **Validation**: Must select one condition

**Field: Purpose**
- **Type**: Radio Buttons
- **Required**: Yes
- **Options**:
  - Residential
  - Office
- **Validation**: Must select one purpose
- **Default**: Residential

#### Budget

**Field: Minimum Price**
- **Type**: Currency Input
- **Required**: Yes
- **Currency**: NGN
- **Min Value**: > 0
- **Max Value**: < maxPrice
- **Format**: Comma-separated (e.g., 1,000,000)
- **Validation**:
  - Required
  - Must be number > 0
  - Must be less than maxPrice
  - Must meet location minimum threshold

**Field: Maximum Price**
- **Type**: Currency Input
- **Required**: Yes
- **Currency**: NGN
- **Min Value**: > minPrice
- **Max Value**: Unlimited
- **Format**: Comma-separated
- **Validation**:
  - Required
  - Must be number > 0
  - Must be greater than minPrice

---

### Step 3: Features & Amenities

**Field: Basic Features**
- **Type**: Multi-Checkbox
- **Required**: No
- **Options**: Based on property type (from FEATURE_CONFIGS)
- **Examples** (Residential):
  - WiFi
  - Security Cameras
  - Kitchen
  - Air Conditioner
- **Validation**: Can select multiple basic features
- **Dependency**: Budget availability

**Field: Premium Features**
- **Type**: Multi-Checkbox
- **Required**: No
- **Options**: Based on property type (from FEATURE_CONFIGS)
- **Examples** (Residential):
  - Swimming Pool
  - Gym House
  - In-house Cinema
  - Tennis Court
- **Validation**: 
  - Can select multiple premium features
  - May be unavailable if budget < minBudgetRequired
- **Dependency**: Budget availability

**Field: Auto-Adjust to Budget**
- **Type**: Checkbox/Toggle
- **Required**: No
- **Default**: false
- **Label**: "Automatically adjust premium features if budget is insufficient"
- **Behavior**: If checked and budget insufficient, auto-remove premium features
- **Validation**: No validation
- **Dependency**: None

**Field: Comfort Features (Shortlet Only)**
- **Type**: Multi-Checkbox
- **Required**: No
- **Options**:
  - Laundry
  - Smart TV / Netflix
  - Balcony
  - Housekeeping
  - Breakfast Included
  - Private Entrance
  - POP Ceiling
  - Access Gate
- **Validation**: Optional
- **Dependency**: Preference Type = "Shortlet"

---

### Step 4: Contact & Preferences

**Field: Full Name**
- **Type**: Text Input
- **Required**: Yes
- **Max Length**: 100 characters
- **Pattern**: Letters and spaces only
- **Placeholder**: "John Doe"
- **Validation**:
  - Required
  - 2-100 characters
  - Only letters and spaces
  - No special characters

**Field: Email Address**
- **Type**: Email Input
- **Required**: Yes
- **Max Length**: 255 characters
- **Placeholder**: "john@example.com"
- **Validation**:
  - Required
  - Valid email format
  - Standard email regex

**Field: Phone Number**
- **Type**: Phone Input
- **Required**: Yes
- **Format**: Nigerian phone numbers
- **Pattern**: ^(\+234|0)[789][01]\d{8}$
- **Placeholder**: "+234 701 234 5678" or "0701 234 5678"
- **Validation**:
  - Required
  - Valid Nigerian format
  - Either +234 or 0 prefix
  - 11 digits total

**Field: WhatsApp Number (Optional)**
- **Type**: Phone Input
- **Required**: No
- **Format**: Nigerian phone numbers
- **Pattern**: Same as phone number
- **Placeholder**: "+234 701 234 5678" or "0701 234 5678"
- **Validation**: Same format as phone number if provided

**Field: Additional Notes (Optional)**
- **Type**: Textarea
- **Required**: No
- **Max Length**: 1000 characters
- **Rows**: 4-6
- **Placeholder**: "Add any additional information about your preferences..."
- **Character Counter**: Show remaining characters
- **Validation**: Max 1000 characters

---

## Joint Venture Preference Form

### Step 1: Developer Information

**Field: Company Name**
- **Type**: Text Input
- **Required**: Yes
- **Max Length**: 200 characters
- **Placeholder**: "Enter your company name"
- **Validation**:
  - Required
  - 2-200 characters

**Field: Contact Person**
- **Type**: Text Input
- **Required**: Yes
- **Max Length**: 100 characters
- **Placeholder**: "John Doe"
- **Pattern**: Letters and spaces only
- **Validation**:
  - Required
  - 2-100 characters
  - Letters and spaces only

**Field: Email Address**
- **Type**: Email Input
- **Required**: Yes
- **Validation**: Valid email format

**Field: Phone Number**
- **Type**: Phone Input
- **Required**: Yes
- **Validation**: Valid Nigerian phone number

**Field: WhatsApp Number (Optional)**
- **Type**: Phone Input
- **Required**: No
- **Validation**: Valid Nigerian format if provided

**Field: CAC Registration Number (Optional)**
- **Type**: Text Input
- **Required**: No
- **Max Length**: 10 characters
- **Pattern**: RC######+ (6-7 digits)
- **Placeholder**: "RC123456"
- **Validation**: Format RC\d{6,7} if provided

### Step 2: Development Type

**Field: Development Types**
- **Type**: Multi-Checkbox
- **Required**: Yes
- **Options**:
  - Residential Development
  - Commercial Development
  - Mixed-Use Development
  - Land Development
- **Validation**: At least one type required

### Step 3: Land Requirements

**Field: State**
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**: Nigerian states
- **Validation**: Must select one state

**Field: Local Government Areas**
- **Type**: Multi-Select Checkbox
- **Required**: Yes
- **Min**: 1
- **Max**: 3
- **Validation**: 1-3 LGAs required

**Field: Measurement Unit**
- **Type**: Radio Buttons
- **Required**: Yes
- **Options**: Plot, Sqm, Hectares
- **Validation**: Must select one unit

**Field: Minimum Land Size**
- **Type**: Number Input
- **Required**: Yes
- **Min**: 0.01
- **Validation**: Required, must be positive number

**Field: Maximum Land Size (Optional)**
- **Type**: Number Input
- **Required**: No
- **Min**: 0.01
- **Validation**: If provided, must be > minLandSize

### Step 4: JV Terms & Proposal

**Field: JV Type**
- **Type**: Radio Buttons / Select
- **Required**: Yes
- **Options**:
  - Equity Split
  - Lease-to-Build
  - Development Partner
- **Validation**: Must select one type

**Field: Preferred Sharing Ratio**
- **Type**: Text Input / Select
- **Required**: Yes
- **Options/Examples**: 50-50, 60-40, 70-30
- **Validation**: Required, valid ratio format

**Field: Proposal Details (Optional)**
- **Type**: Textarea
- **Required**: No
- **Max Length**: 1000 characters
- **Validation**: Max 1000 characters

### Step 5: Title & Documentation

**Field: Minimum Title Requirements**
- **Type**: Multi-Checkbox
- **Required**: Yes
- **Options**:
  - Registered Deed of Assignment
  - Registered Deed of Mortgage
  - Certificate of Occupancy (C of O)
  - Governor's Consent
  - Land Allocation Letter
  - Government Gazette
- **Validation**: At least one required

**Field: Willing to Consider Pending Title**
- **Type**: Checkbox/Toggle
- **Required**: No
- **Default**: false
- **Label**: "Willing to consider properties with pending title documentation"
- **Validation**: No validation

---

## Shortlet Preference Form - Specific Fields

### Step 2: Property Details

**Field: Property Type**
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**:
  - Studio
  - 1-Bed Apartment
  - 2-Bed Flat
- **Validation**: Must select one type

**Field: Number of Bedrooms**
- **Type**: Select/Dropdown
- **Required**: Yes
- **Options**: Studio, 1, 2, 3, 4+
- **Validation**: Required

**Field: Number of Bathrooms**
- **Type**: Number Input
- **Required**: Yes
- **Min**: 1
- **Max**: 10
- **Validation**: Required, minimum 1

**Field: Maximum Number of Guests**
- **Type**: Number Input
- **Required**: Yes
- **Min**: 1
- **Max**: 20
- **Validation**: Required, 1-20 guests

**Field: Travel Type**
- **Type**: Radio Buttons / Multi-Select Checkbox
- **Required**: Yes
- **Options**:
  - Solo
  - Couple
  - Family
  - Group
  - Business
- **Validation**: At least one type required

**Field: Nearby Landmark (Optional)**
- **Type**: Text Input
- **Required**: No
- **Max Length**: 200 characters
- **Placeholder**: "e.g., near Lekki Conservation Centre"
- **Validation**: Max 200 characters

### Step 2: Booking Details (Part of Step 2)

**Field: Check-In Date**
- **Type**: Date Picker
- **Required**: Yes
- **Format**: YYYY-MM-DD
- **Min Date**: Today (cannot be past)
- **Validation**:
  - Required
  - Cannot be in past
  - Must be before check-out date

**Field: Check-Out Date**
- **Type**: Date Picker
- **Required**: Yes
- **Format**: YYYY-MM-DD
- **Min Date**: Check-in date + 1 day
- **Validation**:
  - Required
  - Must be after check-in date
  - Cannot be same as check-in date

**Field: Preferred Check-In Time (Optional)**
- **Type**: Time Picker / Select
- **Required**: No
- **Format**: HH:MM (24-hour)
- **Options**: Predefined times (2 PM, 3 PM, etc.)
- **Validation**: Valid time if provided

**Field: Preferred Check-Out Time (Optional)**
- **Type**: Time Picker / Select
- **Required**: No
- **Format**: HH:MM (24-hour)
- **Options**: Predefined times (10 AM, 11 AM, etc.)
- **Validation**: Valid time if provided

---

## Field Dependencies Summary

| Field | Depends On | Condition |
|-------|-----------|-----------|
| LGAs | state | Must have state selected |
| areas | lgas | Must have LGA selected |
| customLocation | areas | Must NOT have areas, or areas empty |
| buildingType | propertyType | propertyType != "land" |
| bedrooms | propertyType | propertyType = "residential" |
| propertyCondition | propertyType | propertyType != "land" |
| docTypes | preferenceType | preferenceType = "buy" |
| minLandSize | measurementUnit | measurementUnit = "sqm" |
| maxLandSize | measurementUnit | measurementUnit = "sqm" |
| comfortFeatures | preferenceType | preferenceType = "shortlet" |

---

## Validation Rules Reference

See [VALIDATION_RULES.md](./VALIDATION_RULES.md) for detailed validation logic
