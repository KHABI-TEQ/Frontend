# Preference Page - Complete Documentation

## Overview

The Preference Page is a comprehensive multi-step form system that allows users to submit their property preferences across different transaction types. Users can select from 4 preference types: **Buy**, **Rent**, **Joint Venture**, and **Shortlet**. Each preference type has a customized form flow with specific fields relevant to that transaction type.

### Location
- **Route**: `/preference`
- **Layout**: `/src/app/preference/layout.tsx`
- **Main Component**: `/src/app/preference/page.tsx`
- **Context Provider**: `/src/context/preference-form-context.tsx`
- **Form Components**: `/src/components/preference-form/`

---

## Preference Types Overview

### 1. **Buy Property Preference**
- **Icon**: 🏠
- **Label**: "Buy a Property"
- **Description**: Find properties to purchase
- **Preference Mode**: `buy`
- **Form Steps**: 4 steps
- **Use Case**: Users looking to purchase property

### 2. **Rent Property Preference**
- **Icon**: 🏡
- **Label**: "Rent Property"
- **Description**: Find rental properties
- **Preference Mode**: `tenant`
- **Form Steps**: 4 steps
- **Use Case**: Users looking for rental properties

### 3. **Joint Venture Preference**
- **Icon**: 🏗
- **Label**: "Joint Venture"
- **Description**: Partner for development
- **Preference Mode**: `developer`
- **Form Steps**: 5 steps
- **Use Case**: Developers/investors seeking JV partnerships

### 4. **Shortlet Preference**
- **Icon**: 🏘
- **Label**: "Shortlet Guest Stay"
- **Description**: Book short-term stays
- **Preference Mode**: `shortlet`
- **Form Steps**: 4 steps
- **Use Case**: Users looking for short-term property rentals

---

## Form Structure & Fields

### Buy & Rent Preferences (4-Step Form)

#### **Step 1: Location Selection**

The location selection step allows users to specify where they want to find the property.

##### Fields:
1. **State** (Required)
   - **Type**: Single Select
   - **Purpose**: Select the state where the property should be located
   - **Options**: All Nigerian states
   - **Validation**: Required field
   - **Data Path**: `formData.location.state`

2. **Local Government Areas (LGAs)** (Required)
   - **Type**: Multi-Select
   - **Purpose**: Choose specific LGAs within the selected state
   - **Validation**: Required (at least one LGA must be selected)
   - **Data Path**: `formData.location.lgas`

3. **Areas/Neighborhoods** (Optional)
   - **Type**: Multi-Select
   - **Purpose**: Select specific areas within the chosen LGAs
   - **Limit**: Maximum 3 areas can be selected
   - **Data Path**: `formData.location.areas`

4. **Custom Location** (Optional)
   - **Type**: Text Input
   - **Purpose**: Allow users to enter custom location if theirs isn't in the list
   - **Data Path**: `formData.location.customLocation`
   - **Validation**: Free text, max 255 characters

##### Component: `OptimizedLocationSelection.tsx`

---

#### **Step 2: Property Details & Budget**

This combined step collects information about the desired property and the budget.

##### **Property Details Section**

1. **Property Type/Sub-type** (Required)
   - **Type**: Single Select
   - **Purpose**: Define the type of property desired
   - **Options**: 
     - Land
     - Residential
     - Commercial
   - **Data Path**: `formData.propertyDetails.propertySubtype`
   - **Validation**: Required

2. **Building Type** (Required for Residential/Commercial)
   - **Type**: Single Select
   - **Purpose**: Specify the building structure type
   - **Buy - Residential Options**:
     - Bungalow
     - Duplex (Fully Detached)
     - Duplex (Semi Detached)
     - Apartment Building
     - Flat/Apartment
     - Townhouse
     - Villa
     - Terraced
   - **Rent - Residential Options**:
     - Self-con
     - Flat
     - Mini Flat
     - Bungalow
     - Penthouse
     - Studio
   - **Buy - Commercial Options**:
     - Standalone Office
     - Office Space
     - Warehouse
     - Retail Space
     - Mall
     - Industrial Complex
   - **Data Path**: `formData.propertyDetails.buildingType`

3. **Minimum Bedrooms** (Required for Residential)
   - **Type**: Numeric Input / Select
   - **Purpose**: Specify minimum number of bedrooms needed
   - **Options**: 1, 2, 3, 4, 5+, More
   - **Data Path**: `formData.propertyDetails.bedrooms` or `minBedrooms`
   - **Validation**: Required for residential properties

4. **Minimum Bathrooms** (Optional)
   - **Type**: Numeric Input
   - **Purpose**: Specify minimum number of bathrooms
   - **Default**: 0
   - **Data Path**: `formData.propertyDetails.bathrooms` or `minBathrooms`

5. **Property Condition** (Required)
   - **Type**: Single Select
   - **Purpose**: Specify the desired condition of the property
   - **Buy Options**:
     - New
     - Renovated
     - Old
   - **Rent Options**:
     - New
     - Good Condition
     - Renovation (Ready to Renovate)
   - **Joint Venture Options**:
     - New
     - Renovated
     - Uncompleted
   - **Data Path**: `formData.propertyDetails.propertyCondition`
   - **Validation**: Required

6. **Purpose** (Required)
   - **Type**: Single Select
   - **Purpose**: Clarify the intended use of the property
   - **Buy Options**:
     - For Living
     - Resale
     - Development
   - **Rent Options**:
     - Residential
     - Office
   - **Default**: "For Living" (Buy) / "Residential" (Rent)
   - **Data Path**: `formData.propertyDetails.purpose`

7. **Land Size** (Conditionally Required)
   - **Type**: Numeric Input
   - **Purpose**: Enter the desired land size
   - **Required**: For Buy and Joint Venture preference types
   - **Data Path**: `formData.propertyDetails.landSize`
   - **Validation**: Required if property type is Land or Joint Venture

8. **Measurement Unit** (Conditionally Required)
   - **Type**: Single Select
   - **Purpose**: Specify the unit of measurement for land size
   - **Options**:
     - Plot
     - SQM (Square Meters)
     - Hectares
   - **Required**: Only if land size is specified
   - **Data Path**: `formData.propertyDetails.measurementUnit`

9. **Document Types** (Conditionally Required)
   - **Type**: Multi-Select
   - **Purpose**: Specify acceptable property documentation types
   - **Required**: For Buy and Joint Venture property types
   - **Options**:
     - Deed of Assignment
     - Deed of Ownership
     - Deed of Conveyance
     - Survey Plan
     - Governor's Consent
     - Certificate of Occupancy
     - Family Receipt
     - Contract of Sale
     - Land Certificate
     - Gazette
     - Excision
   - **Data Path**: `formData.propertyDetails.documentTypes`
   - **Validation**: Minimum 1 document type required for Buy/JV

10. **Land Conditions** (Conditionally Required)
    - **Type**: Multi-Select
    - **Purpose**: Specify conditions/restrictions user is willing to accept
    - **Data Path**: `formData.propertyDetails.landConditions`
    - **Validation**: Optional

11. **Nearby Landmark** (Optional)
    - **Type**: Text Input
    - **Purpose**: Help describe the location with nearby landmarks
    - **Data Path**: `formData.propertyDetails.nearbyLandmark` or `formData.nearbyLandmark`

##### **Budget Section**

1. **Minimum Price** (Required)
   - **Type**: Numeric Input
   - **Purpose**: Specify the lowest budget the user is willing to spend
   - **Currency**: NGN (Nigerian Naira)
   - **Validation**: Must be less than or equal to Maximum Price
   - **Data Path**: `formData.budget.minPrice`
   - **Budget Thresholds**:
     - Lagos Buy: ₦5,000,000 minimum
     - Lagos Rent: ₦200,000 minimum
     - Lagos JV: ₦10,000,000 minimum
     - Lagos Shortlet: ₦15,000 minimum
     - Abuja Buy: ₦8,000,000 minimum
     - Abuja Rent: ₦300,000 minimum
     - Abuja JV: ₦15,000,000 minimum
     - Abuja Shortlet: ₦25,000 minimum

2. **Maximum Price** (Required)
   - **Type**: Numeric Input
   - **Purpose**: Specify the highest budget the user is willing to spend
   - **Currency**: NGN (Nigerian Naira)
   - **Validation**: Must be greater than or equal to Minimum Price
   - **Data Path**: `formData.budget.maxPrice`

##### Components: `PropertyDetails.tsx`, `OptimizedBudgetSelection.tsx`

---

#### **Step 3: Features & Amenities**

Users select desired features and amenities for the property.

##### **Feature Selection Section**

1. **Basic Features** (Optional)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select standard amenities available in most properties
   - **Buy/Rent Residential Basic Features**:
     - Kitchenette
     - Security Cameras
     - Children Playground
     - Open Floor Plan
     - Walk-in Closet
     - WiFi
     - Library
     - Home Office
     - Bathtub
     - Garage
     - Staff Room
     - Pantry
     - Built-in Cupboards
     - Security Post
     - Access Gate
     - Air Conditioner
     - Wheelchair Friendly
     - Garden
   - **Buy/Rent Commercial Basic Features**:
     - Power Supply
     - Water Supply
     - Air Conditioning
     - Parking Space
     - Security
     - Internet (Wi-Fi)
     - Reception Area
     - Elevator
     - Standby Generator
   - **Shortlet Basic Features**:
     - Wi-Fi
     - Air Conditioning
     - Power Supply
     - Security
     - Parking
     - Clean Water
     - Kitchen
     - Clean Bathroom
   - **Data Path**: `formData.features.basicFeatures`

2. **Premium Features** (Optional)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select premium/luxury amenities
   - **Buy/Rent Residential Premium Features**:
     - Gym House
     - Swimming Pool
     - Outdoor Kitchen
     - Rooftops
     - In-house Cinema
     - Tennis Court
     - Elevator
     - Electric Fencing
     - Inverter
     - Sea View
     - Jacuzzi
   - **Buy/Rent Commercial Premium Features**:
     - Central Cooling System
     - Fire Safety Equipment
     - Industrial Lift
     - CCTV Monitoring System
     - Conference Room
     - Fiber Optic Internet
     - Backup Solar/Inverter
     - Loading Dock
     - Smart Building Automation
   - **Shortlet Premium Features**:
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
   - **Data Path**: `formData.features.premiumFeatures`

3. **Shortlet Comfort Features** (Shortlet Only)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select comfort amenities specific to shortlet stays
   - **Options**:
     - Laundry
     - Smart TV / Netflix
     - Balcony
     - Housekeeping
     - Breakfast Included
     - Private Entrance
     - POP Ceiling
     - Access Gate
   - **Data Path**: `formData.features.comfortFeatures`

4. **Auto-Adjust to Budget** (Optional)
   - **Type**: Toggle Checkbox
   - **Purpose**: Allow the system to automatically adjust feature selections based on budget
   - **Default**: false
   - **Data Path**: `formData.features.autoAdjustToBudget`

##### **Shortlet Date Selection** (Shortlet Only - Step 2/3)

For shortlet preferences only, this section appears on the same step as features:

1. **Check-In Date** (Required)
   - **Type**: Date Picker
   - **Purpose**: Specify the desired move-in date for shortlet
   - **Validation**: Required, must be today or future date
   - **Data Path**: `formData.bookingDetails.checkInDate`

2. **Check-Out Date** (Required)
   - **Type**: Date Picker
   - **Purpose**: Specify the departure date from shortlet
   - **Validation**: Required, must be after check-in date
   - **Data Path**: `formData.bookingDetails.checkOutDate`

3. **Number of Guests** (Required)
   - **Type**: Numeric Input or Stepper
   - **Purpose**: Specify how many guests will be staying
   - **Validation**: Required, minimum 1 guest
   - **Data Path**: `formData.bookingDetails.numberOfGuests` or `formData.propertyDetails.maxGuests`

4. **Travel Type** (Optional)
   - **Type**: Single Select
   - **Purpose**: Categorize the type of shortlet stay
   - **Data Path**: `formData.propertyDetails.travelType`

##### Components: `FeatureSelection.tsx`, `DateSelection.tsx`

---

#### **Step 4: Contact & Additional Information**

Users provide their contact details and any additional preferences.

##### **Contact Information Section**

1. **Full Name** (Required)
   - **Type**: Text Input
   - **Purpose**: User's full name
   - **Validation**: 
     - Required
     - Minimum 2 characters
     - Maximum 100 characters
     - Only letters and spaces allowed
   - **Data Path**: `formData.contactInfo.fullName`

2. **Email Address** (Required)
   - **Type**: Email Input
   - **Purpose**: User's email for communication
   - **Validation**: 
     - Required
     - Must be valid email format
   - **Data Path**: `formData.contactInfo.email`

3. **Phone Number** (Required)
   - **Type**: Phone Number Input
   - **Purpose**: User's contact phone number
   - **Validation**: 
     - Required
     - Must be valid Nigerian phone number (+234 or 0 prefix)
   - **Format**: Supports +234, 0789, 0801, etc.
   - **Data Path**: `formData.contactInfo.phoneNumber`

##### **Shortlet-Specific Contact Fields**

1. **Preferred Check-In Time** (Optional)
   - **Type**: Time Picker (Dropdown)
   - **Purpose**: Specify preferred arrival time
   - **Options**: 8:00 AM - 10:00 PM (hourly)
   - **Data Path**: `formData.contactInfo.preferredCheckInTime`

2. **Preferred Check-Out Time** (Optional)
   - **Type**: Time Picker (Dropdown)
   - **Purpose**: Specify preferred departure time
   - **Options**: 8:00 AM - 10:00 PM (hourly)
   - **Data Path**: `formData.contactInfo.preferredCheckOutTime`

3. **Pets Allowed** (Optional)
   - **Type**: Toggle Checkbox
   - **Purpose**: Indicate if user will bring pets
   - **Default**: false
   - **Data Path**: `formData.contactInfo.petsAllowed`

4. **Smoking Allowed** (Optional)
   - **Type**: Toggle Checkbox
   - **Purpose**: Indicate if user intends to smoke
   - **Default**: false
   - **Data Path**: `formData.contactInfo.smokingAllowed`

5. **Parties Allowed** (Optional)
   - **Type**: Toggle Checkbox
   - **Purpose**: Indicate if user will host parties/gatherings
   - **Default**: false
   - **Data Path**: `formData.contactInfo.partiesAllowed`

6. **Additional Requests** (Optional)
   - **Type**: Text Area
   - **Purpose**: Special requests or additional requirements
   - **Data Path**: `formData.contactInfo.additionalRequests`

7. **Maximum Budget Per Night** (Optional - Shortlet)
   - **Type**: Numeric Input
   - **Purpose**: Maximum amount willing to pay per night
   - **Data Path**: `formData.contactInfo.maxBudgetPerNight`

8. **Willing to Pay Extra** (Optional - Shortlet)
   - **Type**: Toggle Checkbox
   - **Purpose**: Flexibility to pay more for preferred property
   - **Default**: false
   - **Data Path**: `formData.contactInfo.willingToPayExtra`

9. **Cleaning Fee Budget** (Optional - Shortlet)
   - **Type**: Numeric Input
   - **Purpose**: Budget allocated for cleaning services
   - **Data Path**: `formData.contactInfo.cleaningFeeBudget`

10. **Security Deposit Budget** (Optional - Shortlet)
    - **Type**: Numeric Input
    - **Purpose**: Amount willing to pay as security deposit
    - **Data Path**: `formData.contactInfo.securityDepositBudget`

11. **Cancellation Policy** (Optional - Shortlet)
    - **Type**: Single Select
    - **Purpose**: User's acceptable cancellation terms
    - **Options**:
      - Flexible
      - Moderate
      - Strict
    - **Data Path**: `formData.contactInfo.cancellationPolicy`

##### **Additional Information Section**

1. **Additional Notes** (Optional)
   - **Type**: Text Area
   - **Purpose**: Any additional preferences or special requirements
   - **Data Path**: `formData.additionalNotes`

##### Component: `OptimizedContactInformation.tsx`

---

### Joint Venture Preference (5-Step Form)

Joint Venture has a completely separate form flow with 5 distinct steps.

#### **Step 1: Developer Information**

Contact and company details for the developer/investor.

##### Fields:

1. **Full Name** (Required)
   - **Type**: Text Input
   - **Purpose**: Full name of the contact person
   - **Validation**: Required, 2-100 characters, letters and spaces only
   - **Data Path**: `formData.contactInfo.fullName`

2. **Company Name** (Required)
   - **Type**: Text Input
   - **Purpose**: Name of the development company
   - **Validation**: Required, minimum 2 characters
   - **Data Path**: `formData.contactInfo.companyName`

3. **Email Address** (Required)
   - **Type**: Email Input
   - **Purpose**: Company or personal email
   - **Validation**: Required, valid email format
   - **Data Path**: `formData.contactInfo.email`

4. **Phone Number** (Required)
   - **Type**: Phone Input
   - **Purpose**: Contact phone number
   - **Validation**: Required, valid Nigerian phone number
   - **Data Path**: `formData.contactInfo.phoneNumber`

5. **CAC Registration Number** (Optional)
   - **Type**: Text Input
   - **Purpose**: Company registration number from Corporate Affairs Commission
   - **Data Path**: `formData.contactInfo.cacRegistrationNumber`

##### Component: `JVStep1DeveloperInfo.tsx`

---

#### **Step 2: Development Type & Location**

Specifies the types of development projects the investor is interested in.

##### Fields:

1. **Development Types** (Required)
   - **Type**: Multi-Select
   - **Purpose**: Select the types of development projects interested in
   - **Options**:
     - Mini Flats
     - Luxury Duplexes
     - Mixed-Use Development
     - Commercial Complex
     - Residential Estate
     - Office Complex
   - **Validation**: Required (minimum 1 selection)
   - **Data Path**: `formData.developmentDetails.developmentTypes`

2. **State** (Required)
   - **Type**: Single Select
   - **Purpose**: State where development is desired
   - **Data Path**: `formData.location.state`

3. **Local Government Areas** (Required)
   - **Type**: Multi-Select
   - **Purpose**: Specific LGAs within the state
   - **Data Path**: `formData.location.lgas`

##### Component: `JVStep2DevelopmentType.tsx`

---

#### **Step 3: Land Requirements**

Specifications for the land needed for development.

##### Fields:

1. **Minimum Land Size** (Required)
   - **Type**: Numeric Input
   - **Purpose**: Smallest land size acceptable
   - **Data Path**: `formData.developmentDetails.minLandSize`

2. **Maximum Land Size** (Optional)
   - **Type**: Numeric Input
   - **Purpose**: Largest land size needed
   - **Data Path**: `formData.developmentDetails.maxLandSize`

3. **Measurement Unit** (Required)
   - **Type**: Single Select
   - **Purpose**: Unit for land size measurements
   - **Options**:
     - Plot
     - SQM (Square Meters)
     - Hectares
   - **Data Path**: `formData.developmentDetails.measurementUnit`

4. **Budget** (Required)
   - **Type**: Numeric Input
   - **Purpose**: Total budget for the land acquisition
   - **Data Path**: `formData.budget.maxPrice`

##### Component: `JVStep3LandRequirements.tsx`

---

#### **Step 4: JV Terms & Proposal**

Details about the proposed joint venture terms and sharing arrangement.

##### Fields:

1. **Preferred Sharing Ratio** (Optional)
   - **Type**: Text Input
   - **Purpose**: Proposed equity split or profit sharing arrangement (e.g., "50:50", "60:40")
   - **Data Path**: `formData.developmentDetails.preferredSharingRatio`

2. **Proposal Details** (Optional)
   - **Type**: Text Area
   - **Purpose**: Detailed explanation of the JV proposal and terms
   - **Data Path**: `formData.developmentDetails.proposalDetails`

##### Component: `JVStep4TermsProposal.tsx`

---

#### **Step 5: Title & Documentation Requirements**

Specifications for acceptable property titles and documentation.

##### Fields:

1. **Minimum Title Requirements** (Required)
   - **Type**: Multi-Select
   - **Purpose**: Acceptable documentation types
   - **Options**:
     - Deed of Assignment
     - Deed of Ownership
     - Deed of Conveyance
     - Survey Plan
     - Governor's Consent
     - Certificate of Occupancy
     - Family Receipt
     - Contract of Sale
     - Land Certificate
     - Gazette
     - Excision
   - **Validation**: Required (minimum 1 selection)
   - **Data Path**: `formData.developmentDetails.minimumTitleRequirements`

2. **Willing to Consider Pending Title** (Optional)
   - **Type**: Toggle Checkbox
   - **Purpose**: Flexibility to accept properties with pending titles
   - **Default**: false
   - **Data Path**: `formData.developmentDetails.willingToConsiderPendingTitle`

3. **Additional Requirements** (Optional)
   - **Type**: Text Area
   - **Purpose**: Any other specific documentation or property requirements
   - **Data Path**: `formData.developmentDetails.additionalRequirements`

##### Component: `JVStep5TitleDocumentation.tsx`

---

## Form Navigation & Step Progress

### Step Progress Indicator

The form displays a visual progress indicator showing:
- **Completed Steps**: Marked with a checkmark (✓)
- **Current Step**: Highlighted with emerald color and a ring
- **Upcoming Steps**: Grayed out and disabled
- **Navigation**: Users can click on completed steps to return to them

### Step Validation

Each step is validated before allowing progression:
- **Location Step**: State and at least one LGA required
- **Property Details Step**: Property type, condition, and purpose required; land size/documents required for Buy/JV
- **Features Step**: Can be empty; validation only checks format if present
- **Contact Step**: Full name, email, and valid Nigerian phone number required
- **JV Steps**: Each step has specific required fields as outlined above

### Form Controls

1. **Next Button**
   - Appears at bottom of each step
   - Validates current step before allowing progression
   - Shows error messages if validation fails

2. **Previous Button**
   - Allows users to return to previous steps
   - No validation required
   - Preserves previously entered data

3. **Submit Button**
   - Appears on the final step
   - Validates all form data before submission
   - Triggers success modal on successful submission

---

## API Submission

### Endpoint
```
POST /preferences/submit
```

### Payload Structure

All preference types send data with this base structure:

```json
{
  "preferenceType": "buy|rent|joint-venture|shortlet",
  "preferenceMode": "buy|tenant|developer|shortlet",
  "location": {
    "state": "string",
    "localGovernmentAreas": ["string"],
    "customLocation": "string (optional)",
    "lgasWithAreas": [
      {
        "lgaName": "string",
        "areas": ["string"]
      }
    ]
  },
  "budget": {
    "minPrice": number,
    "maxPrice": number,
    "currency": "NGN"
  },
  "features": {
    "baseFeatures": ["string"],
    "premiumFeatures": ["string"],
    "autoAdjustToFeatures": boolean
  },
  "contactInfo": {
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string"
  }
}
```

### Type-Specific Payload Fields

#### Buy Preference Additional Fields
```json
{
  "propertyDetails": {
    "propertyType": "Land|Residential|Commercial",
    "buildingType": "string",
    "minBedrooms": "number|string",
    "minBathrooms": number,
    "propertyCondition": "New|Renovated|Old",
    "purpose": "For living|Resale|Development",
    "landSize": "string",
    "measurementUnit": "plot|sqm|hectares",
    "documentTypes": ["string"],
    "landConditions": ["string"]
  },
  "nearbyLandmark": "string",
  "additionalNotes": "string"
}
```

#### Rent Preference Additional Fields
```json
{
  "propertyDetails": {
    "propertyType": "Self-con|Flat|Mini Flat|Bungalow",
    "buildingType": "string",
    "minBedrooms": "number|string",
    "minBathrooms": number,
    "leaseTerm": "6 Months|1 Year",
    "propertyCondition": "New|Good Condition|Renovation",
    "purpose": "Residential|Office",
    "documentTypes": ["string"]
  },
  "additionalNotes": "string"
}
```

#### Joint Venture Additional Fields
```json
{
  "developmentDetails": {
    "minLandSize": "string",
    "maxLandSize": "string",
    "measurementUnit": "plot|sqm|hectares",
    "developmentTypes": ["string"],
    "preferredSharingRatio": "string",
    "proposalDetails": "string",
    "minimumTitleRequirements": ["string"],
    "willingToConsiderPendingTitle": boolean,
    "additionalRequirements": "string"
  }
}
```

#### Shortlet Additional Fields
```json
{
  "bookingDetails": {
    "propertyType": "string",
    "buildingType": "string",
    "minBedrooms": "number|string",
    "minBathrooms": number,
    "numberOfGuests": number,
    "checkInDate": "YYYY-MM-DD",
    "checkOutDate": "YYYY-MM-DD",
    "travelType": "string",
    "preferredCheckInTime": "HH:MM",
    "preferredCheckOutTime": "HH:MM"
  },
  "contactInfo": {
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string",
    "petsAllowed": boolean,
    "smokingAllowed": boolean,
    "partiesAllowed": boolean,
    "additionalRequests": "string",
    "maxBudgetPerNight": number,
    "willingToPayExtra": boolean,
    "cleaningFeeBudget": number,
    "securityDepositBudget": number,
    "cancellationPolicy": "flexible|moderate|strict"
  }
}
```

---

## Validation Rules

### Location Validation
- **State**: Required
- **LGAs**: Required (minimum 1)
- **Areas**: Optional, maximum 3
- **Custom Location**: Optional, max 255 characters

### Property Details Validation
- **Property Type**: Required
- **Building Type**: Required (if property is Residential or Commercial)
- **Bedrooms**: Required (if Residential)
- **Bathrooms**: Optional
- **Condition**: Required
- **Purpose**: Required
- **Land Size**: Required if property type is Land or for Joint Venture
- **Measurement Unit**: Required if land size is specified
- **Document Types**: Required for Buy/Joint Venture (minimum 1)

### Budget Validation
- **Minimum Price**: Required, must be ≥ location minimum threshold
- **Maximum Price**: Required, must be ≥ Minimum Price
- Both must be positive numbers

### Contact Validation
- **Full Name**: Required, 2-100 characters, letters and spaces only
- **Email**: Required, valid email format
- **Phone Number**: Required, valid Nigerian format
- **Shortlet Times**: Must be valid time format if provided
- **Shortlet Amounts**: Must be positive numbers if provided

### Joint Venture Validation
- **Company Name**: Required, 2+ characters
- **Development Types**: Required (minimum 1)
- **Land Size**: Required
- **Title Requirements**: Required (minimum 1)

---

## Form State Management

### Context: `PreferenceFormContext`

The form uses a React Context with reducer pattern for state management:

```typescript
interface PreferenceFormState {
  currentStep: number;
  steps: FormStep[];
  formData: FlexibleFormData;
  isSubmitting: boolean;
  validationErrors: ValidationError[];
  budgetThresholds: BudgetThreshold[];
  featureConfigs: Record<string, FeatureConfig>;
}
```

### Available Actions:
- `SET_STEP`: Navigate to a specific step
- `UPDATE_FORM_DATA`: Update form field values
- `SET_VALIDATION_ERRORS`: Set validation errors
- `SET_SUBMITTING`: Toggle submission loading state
- `RESET_FORM`: Clear all form data
- `SET_BUDGET_THRESHOLDS`: Update budget thresholds
- `SET_FEATURE_CONFIGS`: Update feature configurations

### Hook: `usePreferenceForm()`

Provides access to form state and actions:

```typescript
const {
  state,                    // Current form state
  dispatch,                 // Redux-style dispatch
  goToNextStep,            // Navigate to next step
  goToPreviousStep,        // Navigate to previous step
  updateFormData,          // Update form data
  validateStep,            // Validate a step
  resetForm,               // Reset entire form
  isFormValid,             // Check if form is valid
  goToStep,                // Jump to specific step
  getAvailableFeatures,    // Get features for preference type
} = usePreferenceForm();
```

---

## Components Structure

### Main Components

| Component | Purpose |
|-----------|---------|
| `PreferenceFormProvider` | Context provider wrapper |
| `PreferenceFormContent` | Main form container and logic |
| `LoadingOverlay` | Shows submission loading state |
| `SuccessModal` | Success confirmation with next actions |
| `StepProgressIndicator` | Visual step progress display |
| `PreferenceTypeButton` | Preference type selection button |

### Form Step Components

| Component | Purpose | Preference Types |
|-----------|---------|-----------------|
| `OptimizedLocationSelection` | Location/state/LGA selection | All |
| `PropertyDetails` | Property type and specifications | Buy, Rent, Shortlet |
| `OptimizedBudgetSelection` | Budget range selection | All |
| `FeatureSelection` | Amenities and features selection | All |
| `DateSelection` | Check-in/out dates (dynamic import) | Shortlet |
| `OptimizedContactInformation` | Contact details | All |
| `JointVenturePreferenceForm` | All JV steps wrapper | Joint Venture |
| `JVStep1DeveloperInfo` | Developer/company details | Joint Venture |
| `JVStep2DevelopmentType` | Development types | Joint Venture |
| `JVStep3LandRequirements` | Land specifications | Joint Venture |
| `JVStep4TermsProposal` | JV terms and proposal | Joint Venture |
| `JVStep5TitleDocumentation` | Title requirements | Joint Venture |
| `SubmitButton` | Form submission button | All |
| `OptimizedStepWrapper` | Step container with animations | All |

---

## Key Features

### 1. **Multi-Step Form with Progress Tracking**
- Visual progress indicator showing current step
- Users can navigate back to previous steps
- Auto-save form data as users progress

### 2. **Responsive Design**
- Mobile-first approach
- Adapted layouts for small, medium, and large screens
- Touch-friendly interface elements

### 3. **Real-Time Validation**
- Validates each field as user enters data
- Shows error messages inline
- Prevents progression until step is valid

### 4. **Smart Feature Configurations**
- Different features available based on property type and budget
- Features are customized per preference type
- Auto-adjust option to modify budget based on selected features

### 5. **Success Workflow**
- Success modal after form submission
- Option to submit another preference
- Quick navigation to marketplace

### 6. **Preference Type Switching**
- Easy switching between preference types
- Form resets when changing preference type
- Each type has customized fields and validation

### 7. **Budget Thresholds**
- Minimum budgets vary by location and preference type
- Validation ensures budget meets location requirements
- Helps filter properties for better matches

### 8. **Accessible & User-Friendly**
- Clear labels and descriptions for each field
- Phone number input supports multiple formats
- Date and time pickers for convenience
- Multi-select with search functionality

---

## File Structure

```
src/
├── app/
│   └── preference/
│       ├── page.tsx           # Main preference page
│       └── layout.tsx          # Page layout
├── components/
│   └── preference-form/
│       ├── OptimizedLocationSelection.tsx
│       ├── PropertyDetails.tsx
│       ├── OptimizedBudgetSelection.tsx
│       ├── FeatureSelection.tsx
│       ├── DateSelection.tsx
│       ├── OptimizedContactInformation.tsx
│       ├── OptimizedStepWrapper.tsx
│       ├── SubmitButton.tsx
│       └── joint-venture/
│           ├── JointVenturePreferenceForm.tsx
│           ├── JVStep1DeveloperInfo.tsx
│           ├── JVStep2DevelopmentType.tsx
│           ├── JVStep3LandRequirements.tsx
│           ├── JVStep4TermsProposal.tsx
│           └── JVStep5TitleDocumentation.tsx
├── context/
│   └── preference-form-context.tsx  # Form state management
├── data/
│   └── preference-configs.ts        # Feature configurations
├── types/
│   └── preference-form.ts           # TypeScript interfaces
├── utils/
│   ├── validation/
│   │   └── preference-validation.ts # Validation schemas
│   └── location-utils.ts            # Location data utilities
└── styles/
    └── preference-form.css          # Form styles
```

---

## Error Handling

### Validation Errors
- Displayed inline below each field
- Clear message explaining what's wrong
- Errors cleared when user corrects the field

### Submission Errors
- Toast notification shows error message
- Form remains on same step for correction
- User can retry submission

### Network Errors
- Caught and displayed as toast notifications
- Loading state cleared on failure
- User can attempt resubmission

---

## Performance Optimizations

### 1. **Memoization**
- Components wrapped with `memo()` to prevent unnecessary re-renders
- Callbacks memoized with `useCallback()`
- Values memoized with `useMemo()`

### 2. **Code Splitting**
- `DateSelection` component lazy-loaded with `dynamic()`
- Reduces initial bundle size

### 3. **Form Updates**
- Debounced form updates to prevent excessive re-renders
- Immediate updates only for critical changes

### 4. **Context Optimization**
- Separate context value memoization
- Prevents triggering updates on unchanged values

---

## Testing Considerations

### Test Routes
The application provides a test page at `/test-preference` with links to test all preference types:
- `/preference?type=buy`
- `/preference?type=rent`
- `/preference?type=joint-venture`
- `/preference?type=shortlet`

### Testing Checklist
- [ ] All form fields render correctly per preference type
- [ ] Validation works for required fields
- [ ] Previous/Next navigation works properly
- [ ] Form data persists when navigating between steps
- [ ] Preference type switching resets form
- [ ] Budget thresholds are enforced
- [ ] Features load based on property type
- [ ] Form submission sends correct payload
- [ ] Success modal displays after submission
- [ ] Mobile responsive layout works
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Future Enhancements

1. **Draft Saving**: Save form progress locally for incomplete submissions
2. **Form History**: Show users their previous preferences
3. **Smart Matching**: Display matched properties as they fill the form
4. **AI Suggestions**: Recommend features based on budget and location
5. **Template Preferences**: Save and reuse preference templates
6. **Batch Preferences**: Submit multiple preferences at once
7. **Comparison Tool**: Compare different preference scenarios

---

## Integration Points

### APIs Used
- `POST /preferences/submit` - Submit preference to backend

### Context Dependencies
- `PreferenceFormContext` - Form state and management
- `POST_REQUEST` utility - API communication

### External Libraries
- `react-hot-toast` - Notifications
- `framer-motion` - Animations
- `react-select` - Select dropdowns
- `react-datepicker` - Date selection
- `react-phone-number-input` - Phone number input
- `formik` & `yup` - Form validation
- `next/dynamic` - Code splitting

---

## Glossary

| Term | Definition |
|------|-----------|
| **Preference** | User's property requirements and search criteria |
| **Preference Mode** | Backend categorization of preference type (buy, tenant, developer, shortlet) |
| **LGA** | Local Government Area - administrative division in Nigeria |
| **Joint Venture (JV)** | Partnership agreement between investor/developer and land owner |
| **Shortlet** | Short-term rental property (days/weeks, not months/years) |
| **Property Subtype** | Specific classification: Land, Residential, Commercial |
| **Document Type** | Legal documentation proving property ownership |
| **Basic Feature** | Standard amenity included in most properties |
| **Premium Feature** | Luxury amenity indicating higher-end property |

---

## Support & Maintenance

### Common Issues

1. **Form not submitting**
   - Check all required fields are completed
   - Verify phone number is valid Nigerian format
   - Check internet connection

2. **Validation errors not clearing**
   - Clear field and re-enter data
   - Refresh page if issue persists

3. **Features not loading**
   - Ensure property type is selected first
   - Check browser console for errors

### Debugging

The form includes a debug panel in development mode (`NODE_ENV === 'development'`) showing:
- Current form data
- Payload structure
- Form validation state

To enable: Run app in development mode and check bottom of page

---

**Last Updated**: 2024
**Documentation Version**: 1.0
**Created for**: Khabiteq Realty Platform
