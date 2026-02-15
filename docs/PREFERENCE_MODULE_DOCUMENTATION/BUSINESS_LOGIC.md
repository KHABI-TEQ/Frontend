# Business Logic

Core business logic algorithms and rules for the Preference Submission Module.

## Budget Management

### Budget Threshold System

#### Location-Based Thresholds
Budget minimums vary by location and property type to reflect real estate market variations:

```
LOCATION: Lagos
├─ Buy: 5,000,000 NGN
├─ Rent: 200,000 NGN
├─ Joint-Venture: 10,000,000 NGN
└─ Shortlet: 15,000 NGN

LOCATION: Abuja
├─ Buy: 8,000,000 NGN
├─ Rent: 300,000 NGN
├─ Joint-Venture: 15,000,000 NGN
└─ Shortlet: 25,000 NGN

LOCATION: Default (All Others)
├─ Buy: 2,000,000 NGN
├─ Rent: 100,000 NGN
├─ Joint-Venture: 5,000,000 NGN
└─ Shortlet: 10,000 NGN
```

#### Threshold Lookup Algorithm
```pseudocode
function getMinBudgetForLocation(location, listingType) {
  // Step 1: Look for exact location match
  threshold = find(budgetThresholds, {
    location: location.toLowerCase(),
    listingType: listingType
  })
  
  if threshold exists:
    return threshold.minAmount
  
  // Step 2: Fall back to default
  defaultThreshold = find(budgetThresholds, {
    location: "default",
    listingType: listingType
  })
  
  return defaultThreshold?.minAmount OR 0
}
```

#### Budget Validation
```pseudocode
function validateBudget(minPrice, maxPrice, location, listingType) {
  errors = []
  
  // Check basic validity
  if minPrice <= 0:
    errors.push("Minimum price must be greater than 0")
  
  if maxPrice <= 0:
    errors.push("Maximum price must be greater than 0")
  
  if maxPrice <= minPrice:
    errors.push("Maximum price must be greater than minimum price")
  
  // Check location threshold
  minimumRequired = getMinBudgetForLocation(location, listingType)
  if minPrice < minimumRequired:
    errors.push(`Budget too low for ${location}. Minimum: ${minimumRequired}`)
  
  return errors
}
```

### Budget Range Flexibility
- **Minimum**: Can be any amount > 0 (subject to location threshold)
- **Maximum**: Can be any amount (no upper limit)
- **Range Width**: No restriction on range size (min to max spread)

---

## Feature Management

### Feature Configuration Structure

#### By Property Type
Features are organized by property type, with budget requirements:

```
PROPERTY TYPE: Buy Residential
├─ Basic Features
│  ├─ Kitchenette
│  ├─ Security Cameras
│  ├─ Children Playground
│  ├─ WiFi
│  ├─ Home Office
│  ├─ Garage
│  └─ ... (18 basic features)
│
└─ Premium Features
   ├─ Swimming Pool (min budget: varies)
   ├─ Gym House
   ├─ In-house Cinema
   ├─ Rooftops
   ├─ Tennis Court
   └─ ... (11 premium features)

PROPERTY TYPE: Shortlet
├─ Basic Features
│  ├─ Wi-Fi
│  ├─ Air Conditioning
│  ├─ Power Supply
│  ├─ Kitchen
│  └─ Clean Bathroom
│
├─ Comfort Features
│  ├─ Laundry
│  ├─ Smart TV / Netflix
│  ├─ Balcony
│  └─ Housekeeping
│
└─ Premium Features
   ├─ Gym Access
   ├─ Swimming Pool
   ├─ Inverter / Solar Backup
   └─ Jacuzzi
```

### Feature Availability Algorithm

```pseudocode
function getAvailableFeatures(propertyType, budget) {
  config = FEATURE_CONFIGS[propertyType]
  availableFeatures = { basic: [], premium: [], comfort: [] }
  
  // Basic features always available
  availableFeatures.basic = config.basic || []
  
  // Comfort features (shortlet only)
  availableFeatures.comfort = config.comfort || []
  
  // Premium features: filter by budget
  for feature in config.premium:
    if feature.minBudgetRequired is null:
      // No budget requirement
      availableFeatures.premium.push(feature)
    
    else if budget >= feature.minBudgetRequired:
      // Budget is sufficient
      availableFeatures.premium.push(feature)
    
    // else: feature filtered out (budget insufficient)
  
  return availableFeatures
}
```

### Auto-Adjust Feature Logic

```pseudocode
function autoAdjustFeaturesForBudget(selectedFeatures, propertyType, budget, autoAdjust) {
  if not autoAdjust:
    return selectedFeatures  // No adjustment
  
  config = FEATURE_CONFIGS[propertyType]
  adjustedFeatures = { basic: [], premium: [] }
  
  // Keep all basic features
  adjustedFeatures.basic = selectedFeatures.basic.filter(feature =>
    config.basic.some(f => f.name === feature)
  )
  
  // Filter premium features by budget
  adjustedFeatures.premium = selectedFeatures.premium.filter(feature =>
    const featureDef = config.premium.find(f => f.name === feature)
    if not featureDef:
      return false
    if featureDef.minBudgetRequired is null:
      return true
    return budget >= featureDef.minBudgetRequired
  )
  
  return adjustedFeatures
}
```

### Feature-Budget Consistency Check

```pseudocode
function validateFeatureBudgetConsistency(features, propertyType, budget) {
  errors = []
  config = FEATURE_CONFIGS[propertyType]
  
  for feature in features.premium:
    featureDef = config.premium.find(f => f.name === feature)
    
    if not featureDef:
      errors.push(`Invalid feature: ${feature}`)
    
    else if featureDef.minBudgetRequired and budget < featureDef.minBudgetRequired:
      errors.push(
        `${feature} requires minimum budget of ${featureDef.minBudgetRequired}. ` +
        `Your budget: ${budget}`
      )
  
  return errors
}
```

---

## Step Progression Logic

### Standard Preference (Buy, Rent, Shortlet)
```
Step 0: Location & Area
  └─ Validates: state, lgas, areas OR customLocation
  └─ After: Unlock Step 1

Step 1: Property Details & Budget
  └─ Validates: property type, budget, land size (conditional)
  └─ After: Check budget threshold, Unlock Step 2

Step 2: Features & Amenities
  └─ Validates: feature selections
  └─ After: Apply auto-adjust if needed, Unlock Step 3

Step 3: Contact & Preferences
  └─ Validates: contact information
  └─ After: Enable Submit button
```

### Joint Venture Preference
```
Step 0: Developer Information
  └─ Validates: company name, contact person, email, phone
  └─ After: Unlock Step 1

Step 1: Development Type
  └─ Validates: development types (at least 1)
  └─ After: Unlock Step 2

Step 2: Land Requirements
  └─ Validates: location, LGAs, land size, measurement unit
  └─ After: Unlock Step 3

Step 3: JV Terms & Proposal
  └─ Validates: JV type, sharing ratio, proposal details
  └─ After: Unlock Step 4

Step 4: Title & Documentation
  └─ Validates: title requirements (at least 1)
  └─ After: Enable Submit button
```

### Step Navigation Rules

```pseudocode
function canProceedToNextStep(currentStep, formData) {
  currentStepId = getStepId(currentStep)
  errors = validateStep(currentStep, formData)
  
  return errors.isEmpty()
}

function goToStep(targetStep, currentStep, formData) {
  if targetStep < currentStep:
    // Going back is always allowed
    return true
  
  // Going forward requires validation
  for step from currentStep to targetStep-1:
    if not canProceedToNextStep(step, formData):
      return false  // Block progression
  
  return true
}
```

---

## Data Transformation

### Form Data to API Payload

#### Contact Information Transformation
```pseudocode
function transformContactInfo(contactInfo, preferenceType) {
  if preferenceType === "joint-venture":
    return {
      companyName: contactInfo.companyName,
      contactPerson: contactInfo.contactPerson,
      email: contactInfo.email,
      phoneNumber: contactInfo.phoneNumber,
      whatsappNumber: contactInfo.whatsappNumber,
      cacRegistrationNumber: contactInfo.cacRegistrationNumber
    }
  
  else:  // buy, rent, shortlet
    return {
      fullName: contactInfo.fullName,
      email: contactInfo.email,
      phoneNumber: contactInfo.phoneNumber,
      whatsappNumber: contactInfo.whatsappNumber
    }
}
```

#### Location Transformation
```pseudocode
function transformLocation(location) {
  return {
    state: location.state,
    localGovernmentAreas: location.lgas,
    selectedAreas: location.areas.length > 0 ? location.areas : undefined,
    customLocation: location.customLocation
  }
}
```

#### Budget Transformation
```pseudocode
function transformBudget(budget) {
  return {
    minPrice: budget.minPrice,
    maxPrice: budget.maxPrice,
    currency: budget.currency
  }
}
```

#### Property Details Transformation (Buy)
```pseudocode
function transformBuyPropertyDetails(details) {
  payload = {
    propertyType: details.propertySubtype,
    buildingType: details.buildingType,
    minBedrooms: details.bedrooms,
    minBathrooms: details.bathrooms,
    propertyCondition: details.propertyCondition,
    purpose: details.purpose,
    documentTypes: details.documentTypes
  }
  
  // Add land size based on measurement unit
  if details.measurementUnit === "sqm":
    payload.minLandSize = parseFloat(details.minLandSize)
    payload.maxLandSize = parseFloat(details.maxLandSize)
  else:
    payload.landSize = parseFloat(details.landSize)
  
  return payload
}
```

### Full Submission Payload Assembly

```pseudocode
function buildSubmissionPayload(formData, preferenceType) {
  payload = {
    preferenceType: preferenceType,
    preferenceMode: mapPreferenceMode(preferenceType),
    location: transformLocation(formData.location),
    budget: transformBudget(formData.budget),
    features: {
      baseFeatures: formData.features.basicFeatures,
      premiumFeatures: formData.features.premiumFeatures,
      autoAdjustToFeatures: formData.features.autoAdjustToBudget
    },
    contactInfo: transformContactInfo(formData.contactInfo, preferenceType)
  }
  
  // Add preference-type-specific fields
  switch(preferenceType):
    case "buy":
      payload.propertyDetails = transformBuyPropertyDetails(formData.propertyDetails)
      payload.nearbyLandmark = formData.nearbyLandmark
      break
    
    case "rent":
      payload.propertyDetails = transformRentPropertyDetails(formData.propertyDetails)
      break
    
    case "shortlet":
      payload.bookingDetails = {
        propertyType: formData.bookingDetails.propertyType,
        minBedrooms: formData.bookingDetails.minBedrooms,
        numberOfGuests: formData.bookingDetails.numberOfGuests,
        checkInDate: formData.bookingDetails.checkInDate,
        checkOutDate: formData.bookingDetails.checkOutDate
      }
      break
    
    case "joint-venture":
      payload.developmentDetails = transformJVDetails(formData.developmentDetails)
      break
  
  // Add optional fields if present
  if formData.additionalNotes:
    payload.additionalNotes = formData.additionalNotes
  
  return payload
}
```

---

## Validation Flow

### Multi-Level Validation Strategy

```
USER INPUT
    ↓
[FIELD-LEVEL VALIDATION]
  ├─ Type checking
  ├─ Format validation (email, phone)
  ├─ Length constraints
  └─ Pattern matching
    ↓ (if field valid)
[STEP-LEVEL VALIDATION]
  ├─ Conditional requirements
  ├─ Cross-field dependencies
  ├─ Budget threshold checks
  └─ Feature availability
    ↓ (if step valid)
[FORM-LEVEL VALIDATION]
  ├─ Cross-step consistency
  ├─ Budget-feature alignment
  ├─ Complete data integrity
  └─ Business rule compliance
    ↓ (if all valid)
[SUBMISSION]
  └─ API payload transformation
  └─ Backend submission
```

### Step Validation Algorithm

```pseudocode
function validateStep(stepId, formData) {
  errors = []
  
  switch(stepId):
    case "location":
      validateLocation(formData.location, errors)
      break
    
    case "property-budget":
      validatePropertyDetails(formData.propertyDetails, formData.preferenceType, errors)
      validateBudget(formData.budget, formData.location, formData.preferenceType, errors)
      validateBudgetFeatureConsistency(formData.budget, formData.features, 
                                       formData.propertyDetails, errors)
      break
    
    case "features":
      validateFeatures(formData.features, formData.propertyDetails, errors)
      break
    
    case "contact":
      validateContact(formData.contactInfo, formData.preferenceType, errors)
      break
  
  return errors
}
```

---

## State Persistence & Recovery

### Form State Transitions

```
Initial State
  └─ currentStep: 0
  └─ formData: {}
  └─ validationErrors: []

User Input → UPDATE_FORM_DATA
  └─ Update only changed properties
  └─ Revalidate affected fields
  └─ Update error list
  └─ Check if step is now valid

Valid Step → SET_STEP
  └─ Change currentStep
  └─ Step becomes active
  └─ Show step-specific UI

Preference Type Change → UPDATE_FORM_DATA
  └─ If preferenceType changes:
  └─ Regenerate steps for new type
  └─ Reset currentStep to 0
  └─ Clear non-applicable form data

Form Reset → RESET_FORM
  └─ Return to initial state
  └─ Clear all data
  └─ Clear all errors
```

### Debouncing & Optimization

```pseudocode
function updateFormDataOptimized(newData, immediate = false) {
  // Cancel pending update
  if debounceTimeout exists:
    clearTimeout(debounceTimeout)
  
  if immediate:
    // Direct update
    dispatch(UPDATE_FORM_DATA, newData)
  else:
    // Debounce update (300ms)
    debounceTimeout = setTimeout(() => {
      dispatch(UPDATE_FORM_DATA, newData)
    }, 300)
}
```

---

## Error Recovery

### Validation Error Display

```pseudocode
function getErrorsForField(fieldName, validationErrors) {
  return validationErrors.filter(error =>
    error.field === fieldName OR
    error.field.startsWith(fieldName + ".")
  )
}

function displayFieldError(fieldName, errors) {
  fieldErrors = getErrorsForField(fieldName, errors)
  
  if fieldErrors.isEmpty():
    showSuccess()  // Field is valid
  else:
    showError(fieldErrors[0].message)  // Show first error
}
```

### Error Clearing Logic

```pseudocode
function clearErrorsForField(fieldName) {
  // Remove errors for this specific field
  validationErrors = validationErrors.filter(error =>
    not (error.field === fieldName OR 
         error.field.startsWith(fieldName + "."))
  )
}
```

---

## Preference Mode Mapping

Maps preference type to backend preference mode:

```
Buy Preference
  └─ preferenceType: "buy"
  └─ preferenceMode: "buy"

Rent Preference
  └─ preferenceType: "rent"
  └─ preferenceMode: "tenant"

Shortlet Preference
  └─ preferenceType: "shortlet"
  └─ preferenceMode: "shortlet"

Joint Venture Preference
  └─ preferenceType: "joint-venture"
  └─ preferenceMode: "developer"
```

---

## Performance Considerations

### State Update Optimization
1. **Shallow Comparison**: Quick check if values actually changed
2. **Deep Comparison**: Only when shallow check indicates change
3. **Memoized Functions**: Helper functions cached to prevent recreation

### Memory Management
1. **Debounced Updates**: Prevents excessive re-renders
2. **Ref-based Tracking**: Prevents callback loops
3. **Lazy Initialization**: State created only once

### Rendering Efficiency
1. **Step-based Rendering**: Only relevant step shown
2. **Conditional Feature Loading**: Features loaded based on type
3. **Configuration Memoization**: Static data not recreated

---

## Edge Cases & Handling

### Budget Edge Cases
```
Case: User enters very large budget
└─ Action: Accept value (no upper limit)
└─ Validation: Still check > minPrice

Case: User enters non-integer price
└─ Action: Attempt parsing as float
└─ Validation: Reject if NaN

Case: Currency mismatch
└─ Action: Always use NGN
└─ Validation: Force NGN in data
```

### Location Edge Cases
```
Case: User selects area from multiple LGAs
└─ Action: Accept (areas tracked per LGA)
└─ Validation: Max 3 areas per LGA

Case: Custom location with spaces/special chars
└─ Action: Accept as-is
└─ Validation: Required if no areas selected

Case: LGA not available in state
└─ Action: Show from available list only
└─ Validation: Reject if user tries to set invalid LGA
```

### Feature Edge Cases
```
Case: Feature budget requirement changes
└─ Action: Update available features
└─ Validation: May remove currently selected premium features

Case: User selects feature then reduces budget
└─ Action: If autoAdjust = true: remove feature
  └─ If autoAdjust = false: keep selection (but validation warns)

Case: Feature not in configuration
└─ Action: Reject in validation
└─ Error: "Feature no longer available"
```

---

For implementation details, see:
- `src/context/preference-form-context.tsx` (State management)
- `src/utils/validation/preference-validation.ts` (Validation logic)
- `src/data/preference-configs.ts` (Configuration data)
