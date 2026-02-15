# PREFERENCE REFERENCE TYPES - DETAILED DOCUMENTATION

Complete step-by-step documentation for each preference reference type with all form fields, logics, validations, and conditions.

---

## TABLE OF CONTENTS

1. [Buy Preference](#buy-preference)
2. [Rent Preference](#rent-preference)
3. [Shortlet Preference](#shortlet-preference)
4. [Joint Venture Preference](#joint-venture-preference)

---

# BUY PREFERENCE

## Overview
Users searching to purchase residential, commercial, or land properties. This is the most comprehensive preference type with detailed property specifications and document requirements.

**Preference Type ID**: `buy`  
**Preference Mode**: `buy`  
**Total Steps**: 4  
**Average Completion Time**: 8-12 minutes  

---

## STEP 0: LOCATION & AREA SELECTION

### Purpose
Determine geographic boundaries for property search.

### Form Fields

#### 1. State (Required)
```
Field Type: Select/Dropdown
Required: Yes
Max Selection: 1 (single choice)
Options: Nigerian states (Lagos, Abuja, Rivers, Enugu, etc.)

Validation Rules:
  ✓ Must select exactly one state
  ✓ Must be valid Nigerian state
  ✓ Cannot be empty
  ✗ Multiple selections not allowed

UI Behavior:
  - Dropdown loads all 36 states + FCT
  - On selection, triggers LGA population
  - Shows selected state in summary
  
Error Messages:
  - "Please select a state" (if empty)
```

#### 2. Local Government Areas (Required)
```
Field Type: Multi-Select Checkbox or Chips
Required: Yes
Min Selection: 1
Max Selection: 3
Options: Populated based on selected state (varies by state)

Validation Rules:
  ✓ Minimum 1 LGA required
  ✓ Maximum 3 LGAs allowed
  ✓ Must be valid LGAs for selected state
  ✓ No duplicate selections
  ✗ Cannot be empty if areas not selected
  ✗ Cannot exceed 3 LGAs

Conditional Logic:
  - Enabled ONLY after state selection
  - Options change based on state
  - If state changes, LGA selection resets
  
UI Behavior:
  - Shows available LGAs for selected state
  - Displays checkbox or chip for each LGA
  - Shows selected count (X of 3)
  - Highlights maximum selection warning at 3
  - On LGA selection, populates available areas
  
Error Messages:
  - "Please select at least one Local Government Area" (if none selected)
  - "Maximum 3 LGAs can be selected" (if attempt to select 4th)
```

#### 3. Areas within Selected LGAs (Conditional)
```
Field Type: Multi-Select Checkbox or Chips
Required: Conditional (either areas OR customLocation)
Min Selection: 0
Max Selection: 3 per LGA (can have 3 areas across all selected LGAs)
Options: Populated based on selected LGAs

Validation Rules:
  ✓ Maximum 3 areas per LGA
  ✓ Either select areas OR provide customLocation
  ✓ Can leave empty if customLocation provided
  ✗ Cannot exceed 3 areas per LGA
  ✗ Cannot leave empty if customLocation also empty

Cross-Field Validation:
  - IF areas.length = 0 AND customLocation = empty → ERROR
  - IF areas.length > 0 → customLocation can be empty
  - IF customLocation provided → areas can be empty

Conditional Logic:
  - Enabled ONLY after LGA selection
  - Shows areas for each selected LGA separately
  - If LGA deselected, its areas are removed
  
UI Behavior:
  - Grouped display by LGA
  - Shows "Lagos - Select areas:" then checklist below
  - Counts areas per LGA
  - Shows "3 of 3" at max for each LGA
  - Displays selected areas summary
  
Error Messages:
  - "Please select areas or provide a custom location" (if both empty)
```

#### 4. Custom Location (Conditional)
```
Field Type: Text Input
Required: Conditional (if no areas selected)
Max Length: 200 characters
Placeholder: "Enter your preferred location if not listed"
Examples: "Off Banana Island, Ikoyi", "Behind Lekki Phase 1 Gate"

Validation Rules:
  ✓ Required if areas.length = 0
  ✓ Optional if areas.length > 0
  ✓ Max 200 characters
  ✓ Can be any text (no special format required)
  ✗ Cannot be empty if areas not selected

Conditional Logic:
  - Appears as fallback option
  - Must be filled if no areas selected
  - Can be used alongside areas
  
UI Behavior:
  - Hidden by default until relevant
  - Shows character count
  - Shows "Character limit: 200" helper text
  - Textarea or text input
  
Error Messages:
  - "Custom location is required if no areas are selected" (if both empty)
```

### Step 0 Validation Flow

```
┌─────────────────────────────────────┐
│ User selects state                  │
└────────────────┬────────────────────┘
                 │
         ✓ State selected?
                 │
      ┌──────────┴──────────┐
      │                     │
     YES                    NO → ERROR: "Select state"
      │
┌─────▼─────────────────────────────┐
│ LGAs list populated               │
│ User selects 1-3 LGAs             │
└────────────────┬────────────────────┘
                 │
    ✓ 1-3 LGAs selected?
                 │
      ┌──────────┴──────────┐
      │                     │
     YES                    NO → ERROR: "Select 1-3 LGAs"
      │
┌─────▼────────────────────────────┐
│ Areas populated for LGAs          │
│ User selects areas OR             │
│ provides custom location          │
└────────────────┬────────────────────┘
                 │
  ✓ (Areas selected OR
    CustomLocation provided)?
                 │
      ┌──────────┴───────────────┐
      │                          │
     YES                         NO → ERROR: "Select areas or
      │                                      provide custom location"
      │
┌─────▼────────────────────────┐
│ STEP 0 COMPLETE              │
│ UNLOCK STEP 1                │
└──────────────────────────────┘
```

### Sample Data - Buy Location Step

```json
{
  "location": {
    "state": "Lagos",
    "lgas": ["Ikoyi", "Victoria Island"],
    "areas": ["Ikoyi", "VI"]
  }
}
```

### Common Scenarios

**Scenario 1: User knows specific areas**
- Selects Lagos
- Selects Ikoyi, Victoria Island
- Selects specific areas within each LGA
- Proceeds to Step 1

**Scenario 2: User has general preference**
- Selects Abuja
- Selects Garki, Maitama
- Cannot find specific areas in list
- Uses custom location: "Garki District, Central Abuja"
- Proceeds to Step 1

**Scenario 3: User changes location**
- Initially selected Lagos + Ikoyi
- Changes to Abuja (state changes)
- LGA list updates to Abuja LGAs
- Previous selections cleared
- Restarts location selection

---

## STEP 1: PROPERTY DETAILS & BUDGET

### Purpose
Specify property characteristics and budget constraints.

### Section 1.A: Property Details

#### 1. Property Type (Required)
```
Field Type: Radio Buttons or Select
Required: Yes
Options: Land, Residential, Commercial
Allow Multiple: No

Validation Rules:
  ✓ Must select exactly one type
  ✓ Selection determines which fields appear next
  ✗ Cannot be empty

Conditional Logic:
  - Selection controls visibility of fields below:
    └─ If "Land":
       ├─ Hide: bedrooms, bathrooms, building type, purpose, property condition
       └─ Show: measurementUnit, landSize, documentTypes, landConditions
    
    └─ If "Residential":
       ├─ Show: buildingType, bedrooms, bathrooms, propertyCondition, purpose
       └─ Hide: None of above required for land
    
    └─ If "Commercial":
       ├─ Show: buildingType, bathrooms, propertyCondition
       ├─ Hide: bedrooms (not shown)
       └─ Purpose not required

UI Behavior:
  - Three distinct radio button options
  - Clear descriptions for each type
  - Selecting one hides irrelevant fields
  - Shows field state: "3 of 7 fields complete"
  
Error Messages:
  - "Please select a property type" (if empty)
```

#### 2. Building Type (Conditional - if not Land)
```
Field Type: Select/Dropdown
Required: If propertyType = "Residential" OR "Commercial"
Options: Detached, Semi-Detached, Block of Flats
Allow Multiple: No

Validation Rules:
  ✓ Required if propertyType ≠ "Land"
  ✓ Must select one option
  ✓ Valid only for Residential/Commercial
  ✗ Not applicable for Land

Conditional Logic:
  - HIDDEN if propertyType = "Land"
  - REQUIRED if propertyType = "Residential" OR "Commercial"
  - When propertyType changes to "Land", value is cleared
  
UI Behavior:
  - Dropdown with 3 options
  - All options available regardless of property type
  - No hierarchy or filtering
  
Error Messages:
  - "Please select a building type" (if empty and required)
```

#### 3. Bedrooms (Conditional - if Residential)
```
Field Type: Select/Dropdown
Required: If propertyType = "Residential"
Options: 1, 2, 3, 4, 5, More
Allow Multiple: No

Validation Rules:
  ✓ Required if propertyType = "Residential"
  ✓ Must select one value
  ✓ "More" indicates 5+ bedrooms
  ✗ Not required for Commercial or Land

Conditional Logic:
  - HIDDEN if propertyType ≠ "Residential"
  - REQUIRED if propertyType = "Residential"
  - Available for all properties
  
UI Behavior:
  - Dropdown with 6 options
  - "More" shows expandable input for exact number (optional)
  - Minimum bedroom affects feature filtering? No direct impact
  
Error Messages:
  - "Please select number of bedrooms" (if empty and required)
```

#### 4. Bathrooms (Optional)
```
Field Type: Number Input
Required: No
Min Value: 0
Max Value: 20
Allow Decimals: No
Placeholder: "0"

Validation Rules:
  ✓ Optional (can be empty)
  ✓ Must be non-negative number if provided
  ✓ Must be integer (no decimals)
  ✓ Practical max: 20
  ✗ Cannot be negative
  ✗ No decimal values

UI Behavior:
  - Number input with +/- buttons
  - Shows "Bathrooms: 2"
  - Can be left empty
  - Helper text: "Optional - leave empty if not applicable"
  
Error Messages:
  - "Bathrooms must be a positive number" (if invalid)
```

#### 5. Property Condition (Conditional - if not Land)
```
Field Type: Radio Buttons or Select
Required: If propertyType ≠ "Land"
Options: New, Renovated, Any
Allow Multiple: No

Validation Rules:
  ✓ Required if propertyType ≠ "Land"
  ✓ Must select one option
  ✗ Not applicable for Land
  ✗ Cannot be empty if required

Conditional Logic:
  - HIDDEN if propertyType = "Land"
  - REQUIRED if propertyType = "Residential" OR "Commercial"
  
UI Behavior:
  - 3 radio button options
  - "Any" means open to both new and renovated
  
Error Messages:
  - "Please select property condition" (if empty and required)
```

#### 6. Purpose (Conditional - if Residential)
```
Field Type: Radio Buttons or Select
Required: If propertyType = "Residential"
Options: For living, Resale, Development
Allow Multiple: No

Validation Rules:
  ✓ Required if propertyType = "Residential"
  ✓ Must select one value
  ✗ Not required for Commercial or Land
  ✗ Cannot be empty if required

Conditional Logic:
  - HIDDEN if propertyType ≠ "Residential"
  - REQUIRED if propertyType = "Residential"
  
UI Behavior:
  - 3 radio button options
  - Clear descriptions for each purpose
  - May affect feature filtering? Currently no
  
Error Messages:
  - "Please select property purpose" (if empty and required)
```

#### 7. Measurement Unit (Required - if Property has Land Size)
```
Field Type: Radio Buttons or Select
Required: If propertyType = Any (always for land size specification)
Options: Plot, Square Meters (sqm), Hectares
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one unit
  ✓ Selection determines land size input type
  ✗ Cannot be empty

Conditional Logic:
  - ALWAYS REQUIRED
  - Selection controls land size fields:
    └─ If "plot" or "hectares":
       ├─ Show: landSize (single number)
       └─ Hide: minLandSize, maxLandSize
    
    └─ If "sqm":
       ├─ Show: minLandSize, maxLandSize (range)
       └─ Hide: landSize (single)
  
UI Behavior:
  - 3 radio button options with explanations
  - Dynamic field replacement based on selection
  - Visual indicator of selected unit
  
Error Messages:
  - "Please select a measurement unit" (if empty)
```

#### 8. Land Size - Single Value (Conditional)
```
Field Type: Number Input
Required: If measurementUnit = "plot" OR "hectares"
Min Value: 0.01
Allow Decimals: Yes
Placeholder: "Enter land size"
Label: Dynamically shows unit (e.g., "Land Size (Hectares)")

Validation Rules:
  ✓ Required if measurementUnit ≠ "sqm"
  ✓ Must be > 0
  ✓ Can be decimal (e.g., 0.5 hectares)
  ✗ Cannot be zero or negative
  ✗ Cannot be empty if required

Conditional Logic:
  - HIDDEN if measurementUnit = "sqm"
  - REQUIRED if measurementUnit = "plot" OR "hectares"
  - Cannot coexist with minLandSize/maxLandSize
  
UI Behavior:
  - Number input with decimal support
  - Shows unit in label and placeholder
  - Example: "0.25 hectares"
  
Error Messages:
  - "Land size is required" (if empty)
  - "Land size must be greater than 0" (if ≤ 0)
```

#### 9. Min Land Size - Range Start (Conditional)
```
Field Type: Number Input
Required: If measurementUnit = "sqm"
Min Value: 0.01
Allow Decimals: Yes
Placeholder: "Minimum land size"
Label: "Minimum Land Size (sqm)"

Validation Rules:
  ✓ Required if measurementUnit = "sqm"
  ✓ Must be > 0
  ✓ Must be < maxLandSize
  ✓ Can be decimal
  ✗ Cannot be zero
  ✗ Must be less than max value

Conditional Logic:
  - HIDDEN if measurementUnit ≠ "sqm"
  - REQUIRED if measurementUnit = "sqm"
  - Paired with maxLandSize for range validation
  
UI Behavior:
  - Number input
  - Shows "sqm" unit in label
  - Help text: "Minimum land size you're willing to consider"
  
Error Messages:
  - "Minimum land size is required" (if empty)
  - "Minimum land size must be greater than 0" (if ≤ 0)
  - "Minimum must be less than maximum" (if > maxLandSize)
```

#### 10. Max Land Size - Range End (Conditional)
```
Field Type: Number Input
Required: If measurementUnit = "sqm"
Min Value: Must be > minLandSize
Allow Decimals: Yes
Placeholder: "Maximum land size"
Label: "Maximum Land Size (sqm)"

Validation Rules:
  ✓ Required if measurementUnit = "sqm"
  ✓ Must be > 0
  ✓ Must be > minLandSize (not equal)
  ✓ Can be decimal
  ✗ Cannot be zero
  ✗ Cannot be ≤ minLandSize

Cross-Field Validation:
  - maxLandSize > minLandSize (REQUIRED)
  - If minLandSize changes → validate maxLandSize
  - If maxLandSize ≤ minLandSize → show error
  
UI Behavior:
  - Number input
  - Shows "sqm" unit in label
  - Help text: "Maximum land size you're willing to consider"
  
Error Messages:
  - "Maximum land size is required" (if empty)
  - "Maximum land size must be greater than 0" (if ≤ 0)
  - "Maximum must be greater than minimum land size" (if ≤ minLandSize)
```

#### 11. Document Types (Required - for Buy)
```
Field Type: Multi-Checkbox
Required: Yes
Min Selection: 1
Max Selection: Unlimited
Options:
  - Deed of Assignment
  - Certificate of Occupancy (C of O)
  - Governor's Consent
  - Land Allocation Letter
  - Receipt of Payment

Validation Rules:
  ✓ Required (minimum 1)
  ✓ Can select multiple
  ✓ Each option selectable independently
  ✗ Must select at least one
  ✗ Cannot be empty

UI Behavior:
  - 5 checkboxes in a list
  - Shows selected count: "3 of 5 selected"
  - Helpful descriptions for each document type
  - Can be reordered visually (optional)
  
Error Messages:
  - "Please select at least one document type" (if none selected)
```

#### 12. Land Conditions (Conditional - if Land + JV)
```
Field Type: Multi-Checkbox
Required: If propertyType = "Land" AND preferenceType = "buy"
Options:
  - Clear/Accessible
  - With Tenant/Occupier
  - Reserved Land
  - Encumbered Land

Validation Rules:
  ✓ Required for Land properties in Buy
  ✓ Can select multiple
  ✗ Land without condition selection shows error

UI Behavior:
  - 4 checkboxes
  - Multiple selections allowed
  - Shows selected count
  
Error Messages:
  - "Please select at least one land condition" (if Land and none selected)
```

### Section 1.B: Budget

#### 1. Minimum Price (Required)
```
Field Type: Currency Input (formatted number)
Required: Yes
Currency: NGN (Naira)
Format: "1,000,000" (comma-separated for display)
Min Value: > 0
Max Value: Must be < maxPrice
Allow Input: Numeric only (no currency symbol from user)

Validation Rules:
  ✓ Required
  ✓ Must be > 0
  ✓ Must be < maxPrice
  ✓ Must meet location threshold
  ✓ Number must be valid
  ✗ Cannot be zero
  ✗ Cannot be negative
  ✗ Cannot be ≥ maxPrice

Location-Based Minimum Thresholds:
  Lagos:
    └─ Buy: ≥ 5,000,000 NGN
  
  Abuja:
    └─ Buy: ≥ 8,000,000 NGN
  
  Default (all other locations):
    └─ Buy: ≥ 2,000,000 NGN

Cross-Field Validation:
  - IF minPrice ≥ maxPrice → ERROR
  - IF minPrice < locationThreshold → ERROR
  - If location changes → revalidate minPrice
  
Threshold Lookup Algorithm:
```
function getMinBudgetThreshold(state, preferenceType):
  1. Look for exact match: state + preferenceType
  2. If found: return minAmount
  3. If not found: use "default" + preferenceType
  4. Return minAmount or 0 if not found
```

UI Behavior:
  - Currency input with formatting
  - Shows "₦" symbol for display
  - Comma separators for readability
  - Input stripped of formatting before save
  - Help text: "Minimum budget must be above location threshold"
  - Shows current location threshold as helper
  
Error Messages:
  - "Minimum price is required" (if empty)
  - "Minimum price must be greater than 0" (if ≤ 0)
  - "Minimum price must be less than maximum price"
  - "Minimum budget for {location} is {threshold}. You entered {entered}"
```

#### 2. Maximum Price (Required)
```
Field Type: Currency Input (formatted number)
Required: Yes
Currency: NGN (Naira)
Format: "1,000,000" (comma-separated for display)
Min Value: Must be > minPrice
Max Value: Unlimited (no upper cap)
Allow Input: Numeric only

Validation Rules:
  ✓ Required
  ✓ Must be > 0
  ✓ Must be > minPrice (not equal)
  ✗ Cannot be zero
  ✗ Cannot be negative
  ✗ Cannot be ≤ minPrice

Cross-Field Validation:
  - IF maxPrice ≤ minPrice → ERROR
  - If minPrice changes → revalidate maxPrice
  - If maxPrice becomes ≤ minPrice after minPrice update → ERROR
  
UI Behavior:
  - Currency input with formatting
  - Shows "₦" symbol for display
  - Comma separators
  - Input stripped of formatting before save
  - Help text: "Maximum budget must be greater than minimum price"
  
Error Messages:
  - "Maximum price is required" (if empty)
  - "Maximum price must be greater than 0" (if ≤ 0)
  - "Maximum price must be greater than minimum price"
```

### Step 1 Validation Flow

```
┌──────────────────────┐
│ Property Type Selected│
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
   Land      Non-Land
    │             │
    │      ┌──────▼──────┐
    │      │ Residential?│
    │      └──────┬──────┘
    │             │
    │        ┌────┴────┐
    │        │          │
    │       YES        NO
    │        │      (Commercial)
    │        │          │
    ├────────┼──────────┤
    │        │          │
    │   Show:│   Show:  │
    │   -BD  │   -BuildType
    │   -Purp│   -PropCond
    │   │    │          │
    └────────┴──────────┘
           │
    ┌──────▼──────────────────┐
    │ Measurement Unit Selected│
    │ (Plot/Sqm/Hectares)     │
    └──────┬───────────────────┘
           │
    ┌──────▴──────┬──────────┐
    │             │          │
   Plot/Hectares Sqm       Any
    │             │          │
    │      ┌──────▼──────┐   │
    │      │ Min & Max   │   │
    │      │ Entered     │   │
    │      └──────┬──────┘   │
    │             │          │
    ├─────────────┤          │
    │             │          │
    │        ┌────▼──────────┤
    │        │               │
    │   ┌────▼────────────┐  │
    │   │ Budget Values   │  │
    │   │ Entered         │  │
    │   └────┬────────────┘  │
    │        │               │
    │   ┌────▼─────────────────┐
    │   │ Validate:            │
    │   │ - minPrice > 0       │
    │   │ - maxPrice > minPrice│
    │   │ - threshold check    │
    │   └────┬──────────────────┘
    │        │
    │    ✓ All valid?
    │        │
    │   ┌────┴─────────┐
    │   │              │
    │  YES             NO → Show errors
    │   │
    │   │
    └──►│
        │
┌───────▼─────────────────────────┐
│ Step 1 Validation Complete      │
│ Move to Step 2: Features        │
└─────────────────────────────────┘
```

### Sample Data - Buy Property Details & Budget

```json
{
  "preferenceType": "buy",
  "propertyDetails": {
    "propertySubtype": "residential",
    "buildingType": "Detached",
    "bedrooms": 4,
    "bathrooms": 3,
    "propertyCondition": "New",
    "purpose": "For living",
    "measurementUnit": "sqm",
    "minLandSize": 500,
    "maxLandSize": 2000,
    "documentTypes": ["Deed of Assignment", "Certificate of Occupancy"]
  },
  "budget": {
    "minPrice": 150000000,
    "maxPrice": 800000000,
    "currency": "NGN"
  }
}
```

---

## STEP 2: FEATURES & AMENITIES

### Purpose
Select desired amenities and features for the property.

### Form Fields

#### 1. Basic Features (Optional)
```
Field Type: Multi-Checkbox Grid
Required: No
Selection: Multiple allowed
Available Features: Based on property type

Examples (Residential):
  - WiFi
  - Security Cameras
  - Children Playground
  - Kitchen
  - Air Conditioner
  - Parking Space
  - Garage
  - Home Office

Examples (Commercial):
  - Power Supply
  - Water Supply
  - Air Conditioning
  - Parking Space
  - Security
  - Internet (Wi-Fi)
  - Reception Area
  - Elevator

Validation Rules:
  ✓ Optional (can have 0 selections)
  ✓ Can select multiple
  ✓ All basic features always available
  ✓ No budget minimum for basic features
  ✗ Features must exist in configuration
  ✗ Invalid features rejected

UI Behavior:
  - Grid of checkboxes (4-6 per row)
  - Icons/images for each feature
  - Tooltip descriptions on hover
  - Shows selected count: "8 selected"
  - Scrollable if many options
  
Error Messages:
  - "Invalid feature selected" (if feature not in config)
  
Availability Logic:
  - All basic features available regardless of budget
  - No filtering or auto-removal
```

#### 2. Premium Features (Optional)
```
Field Type: Multi-Checkbox Grid
Required: No
Selection: Multiple allowed
Available Features: Filtered by budget

Examples (Residential):
  - Swimming Pool
  - Gym House
  - In-house Cinema
  - Tennis Court
  - Rooftop Lounge
  - Outdoor Kitchen
  - Jacuzzi
  - Sea View

Examples (Commercial):
  - CCTV Monitoring System
  - Conference Room
  - Fiber Optic Internet
  - Smart Building Automation
  - Central Cooling System
  - Industrial Lift
  - Loading Dock

Validation Rules:
  ✓ Optional (can have 0 selections)
  ✓ Can select multiple
  ✓ Must have sufficient budget if minBudgetRequired set
  ✓ Features filtered based on budget
  ✗ Cannot select feature with budget < minBudgetRequired
    (if autoAdjustToBudget = false)

Budget Filtering Logic:
```
function getAvailablePremiumFeatures(budget):
  availableFeatures = []
  
  for feature in FEATURE_CONFIGS[propertyType].premium:
    if feature.minBudgetRequired == null:
      // No budget requirement
      availableFeatures.push(feature)
    
    else if budget >= feature.minBudgetRequired:
      // Budget is sufficient
      availableFeatures.push(feature)
    
    // else: feature is unavailable (budget insufficient)
  
  return availableFeatures
```

Feature Budget Examples:
```
Budget: 100M NGN
  ✓ Available: Swimming Pool
  ✓ Available: Gym House
  ✗ Unavailable: In-house Cinema (requires 200M)

Budget: 50M NGN
  ✓ Available: WiFi
  ✗ Unavailable: Premium features
```

UI Behavior:
  - Grid of checkboxes (4-6 per row)
  - Icons/images for each feature
  - Grayed out unavailable features
  - Shows "Budget too low" tooltip on unavailable
  - Shows min budget requirement on hover
  - Selected count: "3 of 7 available"
  - Color difference for available vs unavailable
  
Error Messages:
  - "Swimming Pool requires minimum budget of 100M. Your budget: 50M"
  - "Some selected features are unavailable for your budget"
  
Availability Notifications:
  - Show which features become unavailable when:
    └─ Budget reduced below feature requirement
    └─ Property type changed
```

#### 3. Auto-Adjust to Budget (Optional)
```
Field Type: Checkbox or Toggle
Required: No
Default: false
Label: "Automatically adjust premium features if budget is insufficient"

Behavior:
  When ENABLED (true):
    - User reduces budget below feature requirement
    - System automatically removes that feature from selection
    - User is notified of removal
    - Happens silently or with notification
  
  When DISABLED (false):
    - User reduces budget but selected features remain
    - Validation warning shown
    - User must manually deselect unavailable features
    - Prevents accidental feature loss

Validation Rules:
  ✓ Optional (can be checked or unchecked)
  ✓ Boolean flag (true/false)
  ✓ No validation errors for this field

UI Behavior:
  - Single checkbox with description
  - Help text explains what happens when enabled
  - Recommended for users with flexible preferences
  
Examples:

Example 1 (Auto-Adjust = TRUE):
  1. User selects: Swimming Pool (requires 100M)
  2. User has budget: 150M (sufficient)
  3. User changes budget to: 80M
  4. System automatically removes "Swimming Pool"
  5. Feature removed silently OR with toast notification
  6. Remaining features: Gym House (still available)

Example 2 (Auto-Adjust = FALSE):
  1. User selects: Swimming Pool (requires 100M)
  2. User has budget: 150M (sufficient)
  3. User changes budget to: 80M
  4. System KEEPS "Swimming Pool" selected
  5. Validation error: "Swimming Pool unavailable for your budget"
  6. User must manually uncheck feature
```

### Step 2 Validation Flow

```
┌──────────────────────────┐
│ View Available Features  │
│ Based on:                │
│ - Property Type          │
│ - Budget Amount          │
└──────────┬───────────────┘
           │
    ┌──────▼─────────────────┐
    │ Basic Features Display  │
    │ (All always available)  │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Premium Features Display│
    │ (Filtered by budget)    │
    └──────┬──────────────────┘
           │
    ┌──────▼────────────────────────┐
    │ User Makes Selections          │
    │ - Basic (0 or more)            │
    │ - Premium (0 or more)          │
    │ - Sets AutoAdjust toggle       │
    └──────┬─────────────────────────┘
           │
    ┌──────▼────────────────────────┐
    │ Validate Feature Selections    │
    │ For each premium feature:      │
    │   ✓ Is feature valid?          │
    │   ✓ Budget >= minRequired?     │
    └──────┬─────────────────────────┘
           │
       ✓ All valid?
           │
    ┌──────┴──────────┐
    │                 │
   YES                NO
    │                 │
    │          ┌──────▼────────────┐
    │          │ AutoAdjust = true?│
    │          └──────┬────────────┘
    │                 │
    │            ┌────┴────┐
    │            │          │
    │           YES        NO
    │            │          │
    │      ┌─────▼──┐  ┌───▼─────────┐
    │      │ Remove │  │ Show Error: │
    │      │Feature │  │ Budget too  │
    │      │Silently│  │ low for X   │
    │      └─────┬──┘  └───┬─────────┘
    │            │         │
    ├────────────┘         │
    │                      │
    └─────────────────────►│
                           │
                ┌──────────▼──────────┐
                │ Step 2 Validation   │
                │ Complete            │
                │ Unlock Step 3       │
                └─────────────────────┘
```

### Sample Data - Buy Features

```json
{
  "features": {
    "baseFeatures": [
      "WiFi",
      "Security Cameras",
      "Home Office",
      "Garage"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Gym House"
    ],
    "autoAdjustToBudget": true
  }
}
```

---

## STEP 3: CONTACT & PREFERENCES

### Purpose
Collect buyer contact information and additional preferences.

### Form Fields

#### 1. Full Name (Required)
```
Field Type: Text Input
Required: Yes
Max Length: 100 characters
Min Length: 2 characters
Pattern: Letters and spaces only
Placeholder: "John Doe"

Validation Rules:
  ✓ Required
  ✓ 2-100 characters
  ✓ Only letters (a-z, A-Z) and spaces
  ✓ Can include accents (é, ñ, etc.)
  ✗ Cannot contain numbers
  ✗ Cannot contain special characters (!@#$%^&*)
  ✗ Cannot be single character
  ✗ Cannot be longer than 100 chars

Format Validation Regex:
  Pattern: ^[a-zA-Z\s]+$
  Matches: "John Doe", "Mary Jane Smith"
  Rejects: "John123", "John@Doe", "J_D"

UI Behavior:
  - Text input with max length indicator
  - Shows "100 characters remaining"
  - Character count updates as user types
  - Trim whitespace on save
  - Title case suggestion (optional)
  
Error Messages:
  - "Full name is required" (if empty)
  - "Full name must be at least 2 characters" (if too short)
  - "Full name must not exceed 100 characters" (if too long)
  - "Full name can only contain letters and spaces" (if invalid chars)
```

#### 2. Email Address (Required)
```
Field Type: Email Input
Required: Yes
Max Length: 255 characters
Placeholder: "john@example.com"

Validation Rules:
  ✓ Required
  ✓ Valid email format
  ✓ Contains @ symbol
  ✓ Has domain name
  ✓ Case-insensitive
  ✗ Invalid format
  ✗ Missing @ or domain
  ✗ Multiple @ symbols

Email Validation Regex:
  Pattern: ^[^\s@]+@[^\s@]+\.[^\s@]+$
  Matches:
    - "user@example.com"
    - "user.name@example.co.uk"
    - "user+tag@domain.org"
  
  Rejects:
    - "user@example" (no TLD)
    - "user@.com" (no domain)
    - "userexample.com" (missing @)
    - "user @example.com" (space before @)

Transformation:
  - Convert to lowercase before save
  - Trim whitespace
  - No other transformation

UI Behavior:
  - Email input type (browser validates)
  - On blur: validate format
  - Shows "Invalid email format" if invalid
  - Helpful error message
  
Error Messages:
  - "Email is required" (if empty)
  - "Please enter a valid email address" (if format invalid)
```

#### 3. Phone Number (Required)
```
Field Type: Phone Input (with formatting)
Required: Yes
Format: Nigerian phone numbers
Placeholder: "+234 701 234 5678" or "0701 234 5678"

Validation Rules:
  ✓ Required
  ✓ Valid Nigerian format
  ✓ Starts with +234 OR 0
  ✓ Operator code: 7, 8, or 9 (second digit after prefix)
  ✓ Bank code: 0 or 1 (third digit)
  ✓ Total: 11 digits with 0 prefix, 13 digits with +234

Phone Validation Regex:
  Pattern: ^(\+234|0)[789][01]\d{8}$
  
  Breakdown:
    ^          : Start of string
    (\+234|0)  : Either +234 or 0
    [789]      : Operator: 7, 8, or 9
    [01]       : Bank code: 0 or 1
    \d{8}      : Next 8 digits
    $          : End of string
  
  Valid Examples:
    - +2347012345678 ✓
    - 07012345678 ✓
    - +2348019876543 ✓
    - 08019876543 ✓
    - +2349089998888 ✓
  
  Invalid Examples:
    - 07112345678 ❌ (1 after 7 is invalid)
    - +2356701234567 ❌ (wrong prefix)
    - 7012345678 ❌ (missing 0 or +234)
    - +2347012345 ❌ (too short)

Formatting (for display):
  Input: "07012345678"
  Display: "+234 701 234 5678" or "0701 234 5678"
  Stored: "+2347012345678" (canonical format)

UI Behavior:
  - Phone input with auto-formatting
  - Accepts: +234 or 0 prefix
  - Shows spaces for readability
  - Removes non-numeric chars on input
  - Country code suggestion
  
Error Messages:
  - "Phone number is required" (if empty)
  - "Please enter a valid Nigerian phone number" (if format invalid)
  - Helper: "Format: +234 701 234 5678 or 0701 234 5678"
```

#### 4. WhatsApp Number (Optional)
```
Field Type: Phone Input
Required: No
Format: Same as phone number (Nigerian format)
Placeholder: "+234 701 234 5678"

Validation Rules:
  ✓ Optional (can be empty)
  ✓ If provided, must be valid Nigerian format
  ✓ Same regex as phone number
  ✗ If provided but invalid format → error
  ✗ Cannot save if invalid

UI Behavior:
  - Same as phone number input
  - Can leave empty
  - Help text: "Optional - leave empty if not applicable"
  - Often same as phone number
  
Error Messages:
  - "Please enter a valid WhatsApp number if provided" (if invalid)
```

#### 5. Additional Notes (Optional)
```
Field Type: Textarea
Required: No
Max Length: 1000 characters
Min Rows: 4
Max Rows: 6
Placeholder: "Add any additional information about your preferences..."

Validation Rules:
  ✓ Optional (can be empty)
  ✓ Max 1000 characters
  ✓ Can contain any text
  ✗ Cannot exceed 1000 characters

Allowed Content:
  - Letters, numbers, punctuation
  - Line breaks
  - Special characters (. , ! ? ; : ' " - etc.)
  - Emojis (optional)
  - URLs (optional)

Use Cases:
  - "Looking for properties with high ceilings"
  - "Must have modern finishes and large kitchen"
  - "Open to properties needing minor renovations"
  - "Prefer tree-lined neighborhoods"

UI Behavior:
  - Textarea with character counter
  - Shows "1000 characters remaining"
  - Counter updates as user types
  - Scrollable if content exceeds visible rows
  - Show/hide optional indicator
  
Error Messages:
  - "Notes cannot exceed 1000 characters" (if too long)
```

### Step 3 Validation Flow

```
┌──────────────────────┐
│ Contact Info Screen  │
└──────────┬───────────┘
           │
    ┌──────▼──────────────────┐
    │ Full Name Input          │
    │ Validate:                │
    │ - Required               │
    │ - 2-100 chars            │
    │ - Letters & spaces only  │
    └──────┬───────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Email Input              │
    │ Validate:                │
    │ - Required               │
    │ - Valid format           │
    └──────┬───────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Phone Input              │
    │ Validate:                │
    │ - Required               │
    │ - Nigerian format        │
    │ - Correct operator code  │
    └──────┬───────────────────┘
           │
    ┌──────▼──────────────────┐
    │ WhatsApp (Optional)      │
    │ Validate:                │
    │ - If provided: valid     │
    └──────┬───────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Additional Notes (Opt)   │
    │ Validate:                │
    │ - Max 1000 chars         │
    └──────┬───────────────────┘
           │
       ✓ All valid?
           │
    ┌──────┴──────┐
    │             │
   YES           NO → Show errors
    │
┌───▼────────────────────────┐
│ Form Complete              │
│ Enable Submit Button       │
│ Show Summary               │
└────────────────────────────┘
```

### Sample Data - Buy Contact Info

```json
{
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+2347012345678",
    "whatsappNumber": "+2348012345678"
  },
  "additionalNotes": "Looking for properties with modern finishes. Prefer high-ceiling apartments in secured estates.",
  "nearbyLandmark": "Close to Lekki Conservation Centre"
}
```

---

## COMPLETE BUY PREFERENCE WORKFLOW

### Full Submission Payload

```json
{
  "preferenceType": "buy",
  "preferenceMode": "buy",
  "userId": "user-12345",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ikoyi", "Victoria Island"],
    "selectedAreas": ["Ikoyi", "VI"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 150000000,
    "maxPrice": 800000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "residential",
    "buildingType": "Detached",
    "minBedrooms": 4,
    "minBathrooms": 3,
    "propertyCondition": "New",
    "purpose": "For living",
    "measurementUnit": "sqm",
    "minLandSize": 500,
    "maxLandSize": 2000,
    "documentTypes": ["Deed of Assignment", "Certificate of Occupancy"]
  },
  "features": {
    "baseFeatures": [
      "WiFi",
      "Security Cameras",
      "Home Office",
      "Garage"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Gym House"
    ],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+2347012345678",
    "whatsappNumber": "+2348012345678"
  },
  "nearbyLandmark": "Close to Lekki Conservation Centre",
  "additionalNotes": "Looking for properties with modern finishes and high ceilings.",
  "status": "active",
  "createdAt": "2024-03-01T10:30:00Z"
}
```

---

---

# RENT PREFERENCE

## Overview
Users searching to rent residential or commercial properties. Similar to Buy but with lease-specific fields.

**Preference Type ID**: `rent`  
**Preference Mode**: `tenant`  
**Total Steps**: 4  
**Average Completion Time**: 7-10 minutes  

---

## STEP 0: LOCATION & AREA SELECTION

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 0 above**

---

## STEP 1: PROPERTY DETAILS & BUDGET

### Section 1.A: Property Details - RENT SPECIFIC

#### 1. Property Type (Required)
```
Field Type: Select/Dropdown
Required: Yes
Options: Self-con, Flat, Mini Flat, Bungalow
Allow Multiple: No

Validation Rules:
  ✓ Must select one type
  ✗ Cannot be empty
```

#### 2. Building Type (Optional)
```
Field Type: Select/Dropdown
Required: No
Options: Detached, Semi-Detached, Block of Flats
Allow Multiple: No

Validation Rules:
  ✓ Optional
  ✓ If provided, must be valid option
```

#### 3. Bedrooms (Required)
```
Field Type: Select/Dropdown
Required: Yes
Options: 1, 2, 3, 4, 5+
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one value
```

#### 4. Bathrooms (Optional)
```
Field Type: Number Input
Required: No
Min: 0
Max: 20

Validation Rules:
  ✓ Optional
  ✓ Must be positive if provided
```

#### 5. Lease Term (Required)
```
Field Type: Radio Buttons / Select
Required: Yes
Options: 6 Months, 1 Year
Default: 1 Year
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one term
  ✗ Cannot be empty
```

#### 6. Property Condition (Required)
```
Field Type: Radio Buttons / Select
Required: Yes
Options: New, Renovated
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one condition
  ✗ Cannot be empty
```

#### 7. Purpose (Required)
```
Field Type: Radio Buttons / Select
Required: Yes
Options: Residential, Office
Default: Residential
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one purpose
  ✗ Cannot be empty
```

#### 8. Measurement Unit (Optional)
```
Field Type: Radio Buttons / Select
Required: No
Options: Plot, Sqm, Hectares
Allow Multiple: No

Validation Rules:
  ✓ Optional
  ✓ If selected, land size fields appear
```

#### 9-10. Land Size Fields (Conditional)
**Same as Buy Preference if Measurement Unit selected**

### Section 1.B: Budget

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 1 Section B**

Budget Thresholds for Rent:
```
Lagos:
  └─ Rent: ≥ 200,000 NGN

Abuja:
  └─ Rent: ≥ 300,000 NGN

Default (all other locations):
  └─ Rent: ≥ 100,000 NGN
```

---

## STEP 2: FEATURES & AMENITIES

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 2**

Rent-Specific Features:
```
Residential Basic:
  - WiFi
  - Security Cameras
  - Air Conditioner
  - Parking Space
  - Kitchenette
  - ... (same as buy)

Residential Premium:
  - Swimming Pool
  - Gym House
  - In-house Cinema
  - Tennis Court
  - ... (same as buy)
```

---

## STEP 3: CONTACT & PREFERENCES

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 3**

No additional fields for Rent.

---

## COMPLETE RENT PREFERENCE WORKFLOW

### Full Submission Payload

```json
{
  "preferenceType": "rent",
  "preferenceMode": "tenant",
  "userId": "user-12345",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki", "Ikoyi"],
    "selectedAreas": ["Lekki Phase 1", "Ikoyi"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 3000000,
    "maxPrice": 10000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "Mini Flat",
    "buildingType": "Semi-Detached",
    "minBedrooms": 2,
    "minBathrooms": 1,
    "leaseTerm": "1 Year",
    "propertyCondition": "Renovated",
    "purpose": "Residential"
  },
  "features": {
    "baseFeatures": [
      "WiFi",
      "Security Cameras",
      "Air Conditioner",
      "Parking Space"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Gym House"
    ],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "Grace Johnson",
    "email": "grace@example.com",
    "phoneNumber": "+2347089123456",
    "whatsappNumber": "+2347089123456"
  },
  "additionalNotes": "Looking for cozy apartments with good ventilation and security.",
  "status": "active"
}
```

---

---

# SHORTLET PREFERENCE

## Overview
Users searching for short-term accommodation (vacation, business travel, etc.). Focuses on booking dates and guest capacity.

**Preference Type ID**: `shortlet`  
**Preference Mode**: `shortlet`  
**Total Steps**: 4  
**Average Completion Time**: 5-7 minutes  

---

## STEP 0: LOCATION & AREA SELECTION

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 0**

---

## STEP 1: PROPERTY DETAILS & BOOKING DATES

### Section 1.A: Property Details - SHORTLET SPECIFIC

#### 1. Property Type (Required)
```
Field Type: Select/Dropdown
Required: Yes
Options: Studio, 1-Bed Apartment, 2-Bed Flat
Allow Multiple: No

Validation Rules:
  ✓ Must select one type
  ✗ Cannot be empty
```

#### 2. Number of Bedrooms (Required)
```
Field Type: Select/Dropdown
Required: Yes
Options: Studio, 1, 2, 3, 4+
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one value
```

#### 3. Number of Bathrooms (Required)
```
Field Type: Number Input
Required: Yes
Min: 1
Max: 10

Validation Rules:
  ✓ Required
  ✓ Must be at least 1
  ✓ Must be positive integer
```

#### 4. Maximum Number of Guests (Required)
```
Field Type: Number Input
Required: Yes
Min: 1
Max: 20

Validation Rules:
  ✓ Required
  ✓ Must be 1-20
  ✓ Typically matches bedrooms (1 bed = 2-4 guests)
```

#### 5. Travel Type (Required)
```
Field Type: Multi-Checkbox or Multi-Select
Required: Yes
Min Selection: 1
Options:
  - Solo
  - Couple
  - Family
  - Group
  - Business

Validation Rules:
  ✓ Required (minimum 1)
  ✓ Can select multiple
  ✗ Must select at least one
```

#### 6. Nearby Landmark (Optional)
```
Field Type: Text Input
Required: No
Max Length: 200 characters
Placeholder: "e.g., near Lekki Conservation Centre"

Validation Rules:
  ✓ Optional
  ✓ Max 200 characters
```

### Section 1.B: Booking Details - SHORTLET SPECIFIC

#### 1. Check-In Date (Required)
```
Field Type: Date Picker
Required: Yes
Format: YYYY-MM-DD
Min Date: Today (cannot be past)
Max Date: No limit

Validation Rules:
  ✓ Required
  ✓ Cannot be in past (>= today)
  ✓ Must be before check-out date
  ✗ Cannot be in past
  ✗ Cannot be equal to or after check-out date

Conditional Logic:
  - Min date = today (dynamic)
  - Dates before today are disabled
  - Check-out date minimum = check-in date + 1 day

UI Behavior:
  - Date picker calendar
  - Past dates grayed out
  - Minimum 1-night stay implied
  - Shows date range in summary
  
Error Messages:
  - "Check-in date is required" (if empty)
  - "Check-in date cannot be in the past" (if past date)
  - "Check-in date must be before check-out date"
```

#### 2. Check-Out Date (Required)
```
Field Type: Date Picker
Required: Yes
Format: YYYY-MM-DD
Min Date: Check-in date + 1 day
Max Date: No limit

Validation Rules:
  ✓ Required
  ✓ Must be after check-in date (not equal)
  ✓ Must be future date
  ✗ Cannot be equal to check-in date
  ✗ Cannot be before check-in date

Cross-Field Validation:
  - checkOutDate > checkInDate (REQUIRED)
  - If checkInDate changes → validate checkOutDate
  
UI Behavior:
  - Date picker calendar
  - Dates before check-in date are disabled
  - Calculates stay duration
  - Shows "X nights" in summary
  
Error Messages:
  - "Check-out date is required" (if empty)
  - "Check-out date must be after check-in date"
  - "Check-out date must be at least 1 day after check-in"
```

#### 3. Preferred Check-In Time (Optional)
```
Field Type: Time Picker / Select
Required: No
Format: HH:MM (24-hour)
Predefined Options:
  - 2:00 PM (14:00)
  - 3:00 PM (15:00)
  - 4:00 PM (16:00)
  - 5:00 PM (17:00)
  Or custom time input

Validation Rules:
  ✓ Optional
  ✓ Valid time format if provided
  ✗ Invalid time if provided
```

#### 4. Preferred Check-Out Time (Optional)
```
Field Type: Time Picker / Select
Required: No
Format: HH:MM (24-hour)
Predefined Options:
  - 10:00 AM (10:00)
  - 11:00 AM (11:00)
  - 12:00 PM (12:00)

Validation Rules:
  ✓ Optional
  ✓ Valid time format if provided
```

### Section 1.C: Budget

Budget Thresholds for Shortlet:
```
Lagos:
  └─ Shortlet: ≥ 15,000 NGN (per night)

Abuja:
  └─ Shortlet: ≥ 25,000 NGN (per night)

Default (all other locations):
  └─ Shortlet: ≥ 10,000 NGN (per night)
```

**SAME VALIDATION AS BUY PREFERENCE for minPrice/maxPrice**

---

## STEP 2: FEATURES & AMENITIES

**SIMILAR TO BUY PREFERENCE with Shortlet-Specific Features**

### Shortlet Feature Categories

#### Basic Features (Always Available)
```
- Wi-Fi
- Air Conditioning
- Power Supply
- Security
- Parking
- Clean Water
- Kitchen
- Clean Bathroom
```

#### Comfort Features (Shortlet Only)
```
- Laundry
- Smart TV / Netflix
- Balcony
- Housekeeping
- Breakfast Included
- Private Entrance
- POP Ceiling
- Access Gate
```

#### Premium Features (Budget-Dependent)
```
- Gym Access
- Swimming Pool
- Inverter / Solar Backup
- Rooftop Lounge
- Jacuzzi
- Sea View
- Pet-Friendly
- Outdoor Kitchen
- Smart Lock
- Close to Major Attractions
```

---

## STEP 3: CONTACT & PREFERENCES

**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 3**

---

## COMPLETE SHORTLET PREFERENCE WORKFLOW

### Full Submission Payload

```json
{
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "userId": "user-12345",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki"],
    "selectedAreas": ["Lekki Phase 1"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 150000,
    "maxPrice": 350000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "2-Bed Flat",
    "minBedrooms": 2,
    "numberOfBathrooms": 2,
    "maxGuests": 5,
    "travelType": "Family",
    "nearbyLandmark": "Close to Lekki Conservation Centre"
  },
  "bookingDetails": {
    "checkInDate": "2024-04-01",
    "checkOutDate": "2024-04-14",
    "preferredCheckInTime": "15:00",
    "preferredCheckOutTime": "10:00"
  },
  "features": {
    "baseFeatures": [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Clean Bathroom"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Balcony"
    ],
    "comfortFeatures": [
      "Smart TV / Netflix",
      "Housekeeping"
    ],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "Amara Okafor",
    "email": "amara@gmail.com",
    "phoneNumber": "+2347098765432"
  },
  "additionalNotes": "Family with 2 kids. Need spacious kitchen and child-safe environment.",
  "status": "active"
}
```

---

---

# JOINT VENTURE PREFERENCE

## Overview
Developers/Companies seeking partnership opportunities for land development projects. Extended contact info and detailed partnership terms.

**Preference Type ID**: `joint-venture`  
**Preference Mode**: `developer`  
**Total Steps**: 5  
**Average Completion Time**: 12-15 minutes  

---

## STEP 0: DEVELOPER INFORMATION

### Purpose
Collect business entity details.

### Form Fields

#### 1. Company Name (Required)
```
Field Type: Text Input
Required: Yes
Max Length: 200 characters
Min Length: 2 characters
Placeholder: "Enter your company name"

Validation Rules:
  ✓ Required
  ✓ 2-200 characters
  ✗ Cannot be empty
  ✗ Cannot be single character
  ✗ Cannot exceed 200 characters
```

#### 2. Contact Person (Required)
```
Field Type: Text Input
Required: Yes
Max Length: 100 characters
Min Length: 2 characters
Pattern: Letters and spaces only
Placeholder: "John Doe"

Validation Rules:
  ✓ Required
  ✓ 2-100 characters
  ✓ Letters and spaces only
  ✗ Cannot contain numbers
  ✗ Cannot contain special characters
```

#### 3. Email Address (Required)
```
**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 3 Field 2**
```

#### 4. Phone Number (Required)
```
**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 3 Field 3**
```

#### 5. WhatsApp Number (Optional)
```
**IDENTICAL TO BUY PREFERENCE - See Buy Preference STEP 3 Field 4**
```

#### 6. CAC Registration Number (Optional)
```
Field Type: Text Input
Required: No
Max Length: 10 characters
Pattern: RC followed by 6-7 digits
Placeholder: "RC123456"

Validation Rules:
  ✓ Optional
  ✓ If provided, must match pattern: RC\d{6,7}
  ✓ 6 or 7 digits after RC
  ✗ If provided but invalid format → error

Format Examples:
  - RC123456 ✓ (6 digits)
  - RC1234567 ✓ (7 digits)
  - RC12345 ❌ (5 digits)
  - 123456 ❌ (missing RC)
  - rc123456 ❌ (lowercase - convert to uppercase)

UI Behavior:
  - Text input with placeholder
  - Shows "RC XXXXXX or RC XXXXXXX" format hint
  - Auto-uppercase conversion
  
Error Messages:
  - "Please enter a valid CAC registration number (e.g., RC123456)" (if invalid)
```

---

## STEP 1: DEVELOPMENT TYPE

### Purpose
Specify what types of developments the company undertakes.

### Form Fields

#### 1. Development Types (Required)
```
Field Type: Multi-Checkbox
Required: Yes
Min Selection: 1
Max Selection: Unlimited
Options:
  - Residential Development
  - Commercial Development
  - Mixed-Use Development
  - Land Development

Validation Rules:
  ✓ Required (minimum 1)
  ✓ Can select multiple
  ✗ Must select at least one
  ✗ Cannot be empty

UI Behavior:
  - 4 checkboxes
  - Can select multiple
  - Shows selected count: "2 of 4 selected"
  
Error Messages:
  - "Please select at least one development type" (if none selected)
```

---

## STEP 2: LAND REQUIREMENTS

### Purpose
Specify land size and location requirements for the development.

### Form Fields

#### 1. State (Required)
```
**IDENTICAL TO BUY PREFERENCE STEP 0 - See above**
```

#### 2. Local Government Areas (Required)
```
**IDENTICAL TO BUY PREFERENCE STEP 0 - See above**

Same constraints: 1-3 LGAs allowed
```

#### 3. Measurement Unit (Required)
```
Field Type: Radio Buttons / Select
Required: Yes
Options: Plot, Sqm, Hectares
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one unit
  ✓ Controls land size field display
```

#### 4. Minimum Land Size (Required)
```
Field Type: Number Input
Required: Yes
Min Value: 0.01
Allow Decimals: Yes
Label: Dynamically shows unit (e.g., "Minimum Land Size (sqm)")

Validation Rules:
  ✓ Required
  ✓ Must be > 0
  ✓ Can be decimal
  ✓ Must be < maxLandSize (if provided)
```

#### 5. Maximum Land Size (Optional)
```
Field Type: Number Input
Required: No
Min Value: Must be > minLandSize
Allow Decimals: Yes
Label: "Maximum Land Size ({unit})"

Validation Rules:
  ✓ Optional
  ✓ If provided: must be > minLandSize
  ✓ Can be decimal
```

---

## STEP 3: JV TERMS & PROPOSAL

### Purpose
Define partnership terms and sharing arrangement.

### Form Fields

#### 1. JV Type (Required)
```
Field Type: Radio Buttons / Select
Required: Yes
Options:
  - Equity Split
  - Lease-to-Build
  - Development Partner
Allow Multiple: No

Validation Rules:
  ✓ Required
  ✓ Must select one type
  ✗ Cannot be empty

Description:
  - Equity Split: Investor gets ownership percentage
  - Lease-to-Build: Developer builds, investor leases
  - Development Partner: Shared responsibilities
```

#### 2. Preferred Sharing Ratio (Required)
```
Field Type: Text Input or Select
Required: Yes
Max Length: 20 characters
Placeholder: "e.g., 50-50, 60-40, 70-30"
Examples: 50-50, 60-40, 70-30, 40-60

Validation Rules:
  ✓ Required
  ✓ Valid ratio format
  ✓ Format: XX-YY (two numbers separated by hyphen)
  ✗ Cannot be empty
  ✗ Invalid format

Format Validation:
  Pattern: ^\d{1,3}-\d{1,3}$ (XX-YY format)
  Valid: "50-50", "60-40", "45-55"
  Invalid: "50/50", "50 50", "50"
```

#### 3. Proposal Details (Optional)
```
Field Type: Textarea
Required: No
Max Length: 1000 characters
Placeholder: "Describe your proposal, project vision, experience..."

Validation Rules:
  ✓ Optional
  ✓ Max 1000 characters
  ✓ Can contain any text
```

---

## STEP 4: TITLE & DOCUMENTATION

### Purpose
Specify required title documentation and flexibility.

### Form Fields

#### 1. Minimum Title Requirements (Required)
```
Field Type: Multi-Checkbox
Required: Yes
Min Selection: 1
Max Selection: Unlimited
Options:
  - Registered Deed of Assignment
  - Registered Deed of Mortgage
  - Certificate of Occupancy (C of O)
  - Governor's Consent
  - Land Allocation Letter
  - Government Gazette

Validation Rules:
  ✓ Required (minimum 1)
  ✓ Can select multiple
  ✗ Must select at least one
  ✗ Cannot be empty

UI Behavior:
  - 6 checkboxes
  - Multiple selections allowed
  - Shows selected count: "3 of 6 selected"
  
Error Messages:
  - "Please select at least one title requirement" (if none selected)
```

#### 2. Willing to Consider Pending Title (Optional)
```
Field Type: Checkbox / Toggle
Required: No
Default: false
Label: "Willing to consider properties with pending title documentation"

Validation Rules:
  ✓ Optional
  ✓ Boolean flag (true/false)
  ✓ No validation errors

UI Behavior:
  - Single checkbox
  - Help text explains implications
  - Default unchecked
```

---

## JV Specific Steps: LOCATION & BUDGET

### Location (Required)
**Similar to standard preferences, but represents development location**

```
Validation:
  - State required
  - 1-3 LGAs required
  - Areas optional (can use customLocation)
```

### Budget (Required)
**Budget for JV represents investment/development budget**

Budget Thresholds for Joint Venture:
```
Lagos:
  └─ JV: ≥ 10,000,000 NGN

Abuja:
  └─ JV: ≥ 15,000,000 NGN

Default (all other locations):
  └─ JV: ≥ 5,000,000 NGN
```

---

## STEP 2.5: FEATURES (Common)

**Features are minimal for JV but still included for matching purposes**

Typically only basic infrastructure features.

---

## COMPLETE JOINT VENTURE PREFERENCE WORKFLOW

### Full Submission Payload

```json
{
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "userId": "user-12345",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ajah", "Lekki"],
    "selectedAreas": ["Ajah", "Lekki Phase 2"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 500000000,
    "maxPrice": 5000000000,
    "currency": "NGN"
  },
  "contactInfo": {
    "companyName": "Premier Properties Development Ltd",
    "contactPerson": "David Adeyemi",
    "email": "david@premierdev.com",
    "phoneNumber": "+2347019876543",
    "whatsappNumber": "+2347019876543",
    "cacRegistrationNumber": "RC123456"
  },
  "developmentDetails": {
    "developmentTypes": ["Residential Development"],
    "minLandSize": "5000",
    "maxLandSize": "20000",
    "measurementUnit": "sqm",
    "jvType": "Equity Split",
    "propertyType": "Land",
    "expectedStructureType": "Luxury Duplexes",
    "timeline": "Within 1 Year",
    "preferredSharingRatio": "50-50",
    "proposalDetails": "Looking for partnership in premium Lagos areas. Experienced in luxury residential development.",
    "minimumTitleRequirements": [
      "Registered Deed of Assignment",
      "Governor's Consent"
    ],
    "willingToConsiderPendingTitle": false
  },
  "features": {
    "baseFeatures": [],
    "premiumFeatures": [],
    "autoAdjustToFeatures": false
  },
  "partnerExpectations": "Transparent dealings, regular project updates, and professional management team.",
  "status": "active"
}
```

---

---

## CROSS-PREFERENCE VALIDATION & BUSINESS RULES

### Universal Rules (All Preference Types)

1. **State Selection**
   - Must be valid Nigerian state
   - Case-insensitive (auto-normalized)

2. **LGA Selection**
   - 1-3 LGAs required
   - Must be valid for selected state

3. **Area Selection**
   - 0-3 areas per LGA
   - Custom location fallback required if no areas

4. **Budget Validation**
   - minPrice > 0
   - maxPrice > minPrice
   - minPrice >= location threshold

5. **Contact Information**
   - Full name required (letters & spaces)
   - Email required (valid format)
   - Phone required (Nigerian format)

6. **Feature Selection**
   - Basic features always available
   - Premium features filtered by budget
   - Auto-adjust removes unavailable features if enabled

### Location-Specific Thresholds

| Location | Buy Min | Rent Min | JV Min | Shortlet Min |
|----------|---------|----------|--------|-------------|
| Lagos | 5M | 200K | 10M | 15K |
| Abuja | 8M | 300K | 15M | 25K |
| Default | 2M | 100K | 5M | 10K |

---

This comprehensive documentation covers all steps, fields, validations, and conditions for each preference type. End of documentation.
