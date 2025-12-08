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
- **Preference Type**: `buy`
- **Preference Mode**: `buy`
- **Form Steps**: 4 steps
- **Use Case**: Users looking to purchase property
- **Total Fields**: 18 fields across all steps

### 2. **Rent Property Preference**
- **Icon**: 🏡
- **Label**: "Rent Property"
- **Description**: Find rental properties
- **Preference Type**: `rent`
- **Preference Mode**: `tenant`
- **Form Steps**: 4 steps
- **Use Case**: Users looking for rental properties
- **Total Fields**: 18 fields across all steps

### 3. **Joint Venture Preference**
- **Icon**: 🏗
- **Label**: "Joint Venture"
- **Description**: Partner for development
- **Preference Type**: `joint-venture`
- **Preference Mode**: `developer`
- **Form Steps**: 5 steps
- **Use Case**: Developers/investors seeking JV partnerships
- **Total Fields**: 19 fields across all steps

### 4. **Shortlet Preference**
- **Icon**: 🏘
- **Label**: "Shortlet Guest Stay"
- **Description**: Book short-term stays
- **Preference Type**: `shortlet`
- **Preference Mode**: `shortlet`
- **Form Steps**: 4 steps
- **Use Case**: Users looking for short-term property rentals
- **Total Fields**: 24 fields across all steps (most comprehensive)

---

## Form Structure & Fields

### Buy & Rent Preferences (4-Step Form)

#### **Step 1: Location & Area Selection**

The location selection step allows users to specify where they want to find the property.

##### Fields:

1. **State** (Required)
   - **Type**: Single Select
   - **Purpose**: Select the state where the property should be located
   - **Options**: All Nigerian states (Lagos, Abuja, Enugu, Port Harcourt, etc.)
   - **Validation**: Required field
   - **Data Path**: `formData.location.state`
   - **Component**: `OptimizedLocationSelection.tsx`

2. **Local Government Areas (LGAs)** (Required)
   - **Type**: Multi-Select with Search
   - **Purpose**: Choose specific LGAs within the selected state
   - **Max Selection**: Up to 3 LGAs per preference
   - **Validation**: Required (at least one LGA must be selected)
   - **Data Path**: `formData.location.localGovernmentAreas`
   - **Dynamic**: Options change based on selected state
   - **Component**: `react-select` library

3. **Areas/Neighborhoods by LGA** (Optional)
   - **Type**: Multi-Select with Search
   - **Purpose**: Select specific areas within the chosen LGAs
   - **Limit**: Maximum 3 areas can be selected per LGA
   - **Organization**: Grouped by LGA for clarity
   - **Data Path**: `formData.location.selectedAreas` or `formData.location.lgasWithAreas[].areas`
   - **Display Format**: "LGA Name: Area 1, Area 2, Area 3"
   - **Component**: `react-select` library

4. **Custom Location** (Optional)
   - **Type**: Text Input
   - **Purpose**: Allow users to enter custom location if theirs isn't in the list
   - **Placeholder**: "Enter custom area or landmark"
   - **Max Length**: 255 characters
   - **Data Path**: `formData.location.customLocation`
   - **Validation**: Free text, max 255 characters
   - **When Used**: Shown when user searches and no matching areas found

5. **Location Summary** (Display Only)
   - **Purpose**: Visual confirmation of selected locations
   - **Displays**:
     - Selected State
     - Number and names of LGAs selected (e.g., "LGAs (1/3): Agege")
     - Areas by LGA with counts (e.g., "Agege: Agege Main Market (1/3)")
   - **Interactive**: Users can click to edit or remove selections

##### Component: `OptimizedLocationSelection.tsx`

---

#### **Step 2: Property Details & Budget**

This combined step collects information about the desired property and the budget.

##### **Property Details Section**

1. **Property Type/Sub-type** (Required)
   - **Type**: Single Select
   - **Purpose**: Define the primary type of property desired
   - **Buy Options**:
     - Land
     - Residential
     - Commercial
   - **Rent Options**:
     - Land
     - Residential
     - Commercial
   - **Data Path**: `formData.propertyDetails.propertySubtype`
   - **Validation**: Required
   - **Affects**: Shows/hides other fields (e.g., bedrooms only for residential)

2. **Building Type** (Required for Non-Land Properties)
   - **Type**: Single Select
   - **Purpose**: Specify the building structure type
   - **Buy - Residential Options** (with kebab-case stored values):
     - "bungalow" → Bungalow
     - "duplex-fully-detached" → Duplex (Fully Detached)
     - "duplex-semi-detached" → Duplex (Semi Detached)
     - "duplex-terrace" → Duplex (Terrace)
     - "blocks-of-flat" → Blocks of Flat
   - **Rent - Residential Options** (with kebab-case stored values):
     - "detached" → Detached
     - "semi-detached" → Semi-detached
     - "bungalow" → Bungalow
     - "duplex" → Duplex
     - "blocks-of-flat" → Blocks of Flat
   - **Buy - Commercial Options** (with kebab-case stored values):
     - "office-complex" → Office Complex
     - "warehouse" → Warehouse
     - "plaza" → Plaza
     - "shop" → Shop
   - **Rent - Commercial Options** (with kebab-case stored values):
     - "office-complex" → Office Complex
     - "plaza" → Plaza
     - "shop" → Shop
     - "warehouse" → Warehouse
   - **Joint Venture - Residential Options** (with kebab-case stored values):
     - "block-of-flats" → Block of Flats
     - "duplex" → Duplex
     - "bungalow" → Bungalow
     - "terrace" → Terrace
   - **Joint Venture - Commercial Options** (with kebab-case stored values):
     - "plaza" → Plaza
     - "office-complex" → Office Complex
     - "warehouse" → Warehouse
     - "shop-space" → Shop Space
   - **Data Path**: `formData.propertyDetails.buildingType`
   - **Conditional**: Only required if propertySubtype is "Residential" or "Commercial"
   - **Storage Format**: All values stored in kebab-case (e.g., "duplex-fully-detached")
   - **Component**: `PropertyDetails.tsx` (BUILDING_TYPES constant, lines 95-140)
   - **Kebab-case Usage**: These values are stored internally in kebab-case and converted to readable labels using the `kebabToTitleCase` utility when displayed

3. **Minimum Bedrooms** (Required for Residential)
   - **Type**: Single Select
   - **Purpose**: Specify minimum number of bedrooms needed
   - **Options** (with stored values):
     - "1" → 1 Bedroom
     - "2" → 2 Bedrooms
     - "3" → 3 Bedrooms
     - "4" → 4 Bedrooms
     - "5" → 5 Bedrooms
     - "6" → 6 Bedrooms
     - "7" → 7 Bedrooms
     - "8" → 8 Bedrooms
     - "9" → 9 Bedrooms
     - "10" → 10 Bedrooms
     - "more" → More than 10
   - **Default**: None (user must select)
   - **Data Path**: `formData.propertyDetails.bedrooms` or `propertyDetails.minBedrooms`
   - **Validation**: Required for residential properties
   - **Conditional**: Only shown if propertySubtype is "Residential"
   - **Storage Format**: Values "1"-"10" are strings, "more" for >10
   - **Component**: `PropertyDetails.tsx` (BEDROOM_OPTIONS constant, lines 151-163)

4. **Minimum Bathrooms** (Required for Residential)
   - **Type**: Dropdown Select
   - **Purpose**: Specify minimum number of bathrooms
   - **Options** (with stored values):
     - "1" → 1 Bathroom
     - "2" → 2 Bathrooms
     - "3" → 3 Bathrooms
     - "4" → 4 Bathrooms
     - "5" → 5 Bathrooms
     - "6" → 6 Bathrooms
     - "7" → 7 Bathrooms
     - "8" → 8 Bathrooms
     - "9" → 9 Bathrooms
     - "10" → 10 Bathrooms
     - "more" → More than 10
   - **Data Path**: `formData.propertyDetails.bathrooms` or `propertyDetails.minBathrooms`
   - **Validation**: Required for residential properties
   - **Conditional**: Only shown if propertySubtype is "Residential"
   - **Storage Format**: Values "1"-"10" are strings, "more" for >10
   - **Component**: `PropertyDetails.tsx` (BATHROOM_OPTIONS constant, lines 166-178)

5. **Property Condition** (Required)
   - **Type**: Single Select
   - **Purpose**: Specify the desired condition of the property
   - **Buy Options** (with kebab-case stored values):
     - "new" → New
     - "renovated" → Renovated
     - "old" → Old
   - **Rent Options** (with kebab-case stored values):
     - "new" → New
     - "good-condition" → Good Condition
     - "renovation" → Renovation (Ready to Renovate)
   - **Joint Venture Options** (with kebab-case stored values):
     - "new" → New
     - "renovated" → Renovated
     - "uncompleted" → Uncompleted
   - **Data Path**: `formData.propertyDetails.propertyCondition`
   - **Validation**: Required
   - **Applies To**: All property types in Buy, Rent, and Joint Venture
   - **Storage Format**: All values stored in kebab-case (e.g., "good-condition")
   - **Component**: `PropertyDetails.tsx` (PROPERTY_CONDITIONS constant, lines 55-92)

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
   - **Validation**: Required

7. **Land Size** (Conditionally Required)
   - **Type**: Numeric Input
   - **Purpose**: Enter the desired land size
   - **Required For**: Buy and Joint Venture preference types when propertySubtype is "Land"
   - **Accepts**: Positive decimal numbers
   - **Data Path**: `formData.propertyDetails.landSize`
   - **Validation**: Required if property type is Land; must be > 0
   - **Paired With**: Measurement Unit field

8. **Measurement Unit** (Conditionally Required)
   - **Type**: Single Select
   - **Purpose**: Specify the unit of measurement for land size
   - **Options**:
     - Plot
     - SQM (Square Meters)
     - Hectares
   - **Required**: Only if land size is specified
   - **Data Path**: `formData.propertyDetails.measurementUnit`
   - **Validation**: Required if Land Size is filled

9. **Document Types** (Conditionally Required for Buy/JV)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Specify acceptable property documentation types
   - **Required For**: Buy and Joint Venture property types
   - **Options** (with kebab-case stored values):
     - "deed-of-assignment" → Deed of Assignment
     - "deed-of-ownership" → Deed of Ownership
     - "deed-of-conveyance" → Deed of Conveyance
     - "survey-plan" → Survey Plan
     - "governors-consent" → Governor's Consent
     - "certificate-of-occupancy" → Certificate of Occupancy
     - "family-receipt" → Family Receipt
     - "contract-of-sale" → Contract of Sale
     - "land-certificate" → Land Certificate
     - "gazette" → Gazette
     - "excision" → Excision
   - **Data Path**: `formData.propertyDetails.documentTypes`
   - **Validation**: Minimum 1 document type required for Buy/JV preferences
   - **Max Selections**: No limit
   - **Storage Format**: All values stored in kebab-case (e.g., "deed-of-assignment")
   - **Component**: `PropertyDetails.tsx` (DOCUMENT_TYPES constant, lines 32-45)
   - **Kebab-case Usage**: These values are stored internally in kebab-case for consistency and later converted to readable labels using the `kebabToTitleCase` utility when displayed to users

10. **Land Conditions** (Optional)
    - **Type**: Multi-Select with Checkboxes
    - **Purpose**: Specify conditions/restrictions user is willing to accept
    - **Options** (with kebab-case stored values):
      - "fenced" → Fenced
      - "dry" → Dry
      - "gated" → Gated
      - "accessible-road" → Accessible Road
    - **Data Path**: `formData.propertyDetails.landConditions`
    - **Validation**: Optional, no minimum selection required
    - **Shown For**: Buy and Joint Venture preferences with Land property type
    - **Storage Format**: All values stored in kebab-case (e.g., "accessible-road")
    - **Component**: `PropertyDetails.tsx` (LAND_CONDITIONS constant, lines 142-148)

11. **Nearby Landmark** (Optional)
    - **Type**: Text Input
    - **Purpose**: Help describe the location with nearby landmarks (e.g., "Near Lekki Toll Gate")
    - **Max Length**: 255 characters
    - **Data Path**: `formData.propertyDetails.nearbyLandmark` or `formData.nearbyLandmark`
    - **Placeholder**: "e.g., Near Lekki Toll Gate, Close to VI Market"

##### **Budget Section**

1. **Minimum Price** (Required)
   - **Type**: Numeric Input with Currency Formatting
   - **Purpose**: Specify the lowest budget the user is willing to spend
   - **Currency**: NGN (Nigerian Naira)
   - **Validation**: 
     - Required field
     - Must be greater than 0
     - Must be less than or equal to Maximum Price
     - Must meet location-specific minimum thresholds
   - **Data Path**: `formData.budget.minPrice`
   - **Budget Thresholds by Location & Type**:
     - **Lagos**:
       - Buy: ₦5,000,000 minimum
       - Rent: ₦200,000 minimum
       - Joint Venture: ₦10,000,000 minimum
       - Shortlet: ₦15,000 minimum
     - **Abuja**:
       - Buy: ₦8,000,000 minimum
       - Rent: ₦300,000 minimum
       - Joint Venture: ₦15,000,000 minimum
       - Shortlet: ₦25,000 minimum
   - **Display Format**: Formatted with thousand separators (e.g., "₦5,000,000")
   - **Component**: `OptimizedBudgetSelection.tsx`

2. **Maximum Price** (Required)
   - **Type**: Numeric Input with Currency Formatting
   - **Purpose**: Specify the highest budget the user is willing to spend
   - **Currency**: NGN (Nigerian Naira)
   - **Validation**: 
     - Required field
     - Must be greater than 0
     - Must be greater than or equal to Minimum Price
   - **Data Path**: `formData.budget.maxPrice`
   - **Display Format**: Formatted with thousand separators
   - **Error Message**: "Maximum price must be greater than or equal to minimum price" if validation fails
   - **Component**: `OptimizedBudgetSelection.tsx`

3. **Budget Range Display** (Display Only)
   - **Purpose**: Shows formatted budget range to user
   - **Format**: "₦5,000,000 - ₦50,000,000"
   - **Updates**: Real-time as user types in min/max fields
   - **Validation Feedback**: Shows error state if budget is invalid

##### Components: 
- `PropertyDetails.tsx` (with `OptimizedStepWrapper.tsx`)
- `OptimizedBudgetSelection.tsx`

---

#### **Step 3: Features & Amenities**

Users select desired features and amenities for the property.

##### **Feature Selection Section**

1. **Basic Features** (Optional)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select standard amenities available in most properties
   - **Max Selections**: No hard limit, but typically 8-15 selected
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
   - **Data Path**: `formData.features.basicFeatures` or `formData.features.baseFeatures`
   - **Interactive**: Checkboxes with labels and descriptions

2. **Premium Features** (Optional)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select premium/luxury amenities
   - **Visual Indicator**: Often marked with "Premium" badge or crown icon
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
   - **Conditional Display**: May be hidden if budget is below certain threshold

3. **Shortlet Comfort Features** (Shortlet Only)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select comfort amenities specific to shortlet stays
   - **Shortlet-Specific**: Only appears for shortlet preference type
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
   - **Context**: Features that enhance comfort for short-term stays

4. **Auto-Adjust to Budget** (Optional)
   - **Type**: Toggle Checkbox
   - **Label**: "Auto-adjust features based on my budget"
   - **Purpose**: Allow the system to automatically adjust feature selections based on budget
   - **Default**: false (unchecked)
   - **Behavior**: When enabled, premium features outside budget range are automatically deselected
   - **Data Path**: `formData.features.autoAdjustToFeatures` or `formData.features.autoAdjustToBudget`
   - **Help Text**: "We'll automatically adjust your feature selection to match your budget"

##### **Shortlet Date & Guest Selection** (Shortlet Only - Appears on Same Step)

For shortlet preferences only, this section appears alongside features:

1. **Check-In Date** (Required for Shortlet)
   - **Type**: Date Picker (React DatePicker)
   - **Purpose**: Specify the desired move-in/arrival date for shortlet
   - **Format**: YYYY-MM-DD (ISO 8601)
   - **Min Date**: Today's date or later
   - **Max Date**: 365 days from today
   - **Validation**: 
     - Required
     - Must be today or future date
     - Must be before Check-Out Date
   - **Data Path**: `formData.bookingDetails.checkInDate`
   - **Calendar Picker**: Shows month/year navigation
   - **Placeholder**: "Select check-in date"

2. **Check-Out Date** (Required for Shortlet)
   - **Type**: Date Picker (React DatePicker)
   - **Purpose**: Specify the departure/check-out date from shortlet
   - **Format**: YYYY-MM-DD (ISO 8601)
   - **Min Date**: One day after Check-In Date
   - **Max Date**: 365 days after Check-In Date
   - **Validation**: 
     - Required
     - Must be after Check-In Date
     - Minimum 1 night stay required
     - Maximum 365 days stay (can be configured)
   - **Data Path**: `formData.bookingDetails.checkOutDate`
   - **Linked Validation**: Automatically validates against check-in date
   - **Placeholder**: "Select check-out date"

3. **Number of Guests** (Required for Shortlet)
   - **Type**: Numeric Input or Stepper Control
   - **Purpose**: Specify how many guests will be staying
   - **Min Value**: 1 guest (minimum)
   - **Max Value**: No hard limit (depends on property)
   - **Validation**: 
     - Required
     - Must be minimum 1 guest
     - Must be positive integer
   - **Data Path**: `formData.bookingDetails.numberOfGuests` or `formData.propertyDetails.maxGuests`
   - **Input Type**: Can be spinner control or text input
   - **Placeholder**: "Enter number of guests"

4. **Travel Type** (Optional for Shortlet)
   - **Type**: Single Select
   - **Purpose**: Categorize the type of shortlet stay for better recommendations
   - **Options** (with kebab-case/simple stored values):
     - "solo" → Solo
     - "couple" → Couple
     - "family" → Family
     - "group" → Group
     - "business" → Business
   - **Data Path**: `formData.bookingDetails.travelType` or `formData.propertyDetails.travelType`
   - **Default**: None (optional)
   - **Use**: Helps match properties suitable for travel purpose
   - **Storage Format**: Values stored as simple lowercase strings (e.g., "solo", "business")
   - **Component**: `PropertyDetails.tsx` (TRAVEL_TYPES constant, lines 188-195)

##### Components: 
- `FeatureSelection.tsx`
- `DateSelection.tsx` (lazy-loaded with `dynamic()`)
- `PropertyDetails.tsx` (contains guest/travel type fields for shortlet)

---

#### **Step 4: Contact & Additional Information**

Users provide their contact details and any additional preferences specific to the preference type.

##### **Contact Information Section (All Types)**

1. **Full Name** (Required - Not for Joint Venture)
   - **Type**: Text Input
   - **Purpose**: User's full name
   - **Validation**: 
     - Required (for Buy, Rent, Shortlet)
     - Minimum 2 characters
     - Maximum 100 characters
     - Only letters and spaces allowed (regex: `/^[a-zA-Z\s]+$/`)
     - Whitespace trimmed
   - **Error Messages**:
     - "Full name is required"
     - "Full name must be at least 2 characters"
     - "Full name must be less than 100 characters"
     - "Full name can only contain letters and spaces"
   - **Data Path**: `formData.contactInfo.fullName`
   - **Placeholder**: "Enter your full name"
   - **Component**: Text input field

2. **Email Address** (Required)
   - **Type**: Email Input
   - **Purpose**: User's email for communication and preference updates
   - **Validation**: 
     - Required
     - Must be valid email format (RFC 5322 compliance)
     - Lowercase conversion
     - Whitespace trimmed
   - **Error Messages**:
     - "Email is required"
     - "Please enter a valid email address"
   - **Data Path**: `formData.contactInfo.email`
   - **Placeholder**: "Enter your email address"
   - **Component**: Email input field
   - **Auto-fill**: May be pre-filled if user is logged in

3. **Phone Number** (Required)
   - **Type**: Phone Number Input with Validation
   - **Purpose**: User's primary contact phone number
   - **Validation**: 
     - Required
     - Must be valid Nigerian phone number
     - Accepts: +234, 0789, 0801 prefixes
     - Regex: `/^(\+234|0)[789][01]\d{8}$/`
     - Whitespace and special characters removed
   - **Error Messages**:
     - "Phone number is required"
     - "Please enter a valid Nigerian phone number"
   - **Accepted Formats**:
     - +2348012345678
     - +2347089876543
     - 08012345678
     - 07089876543
   - **Data Path**: `formData.contactInfo.phoneNumber`
   - **Component**: `react-phone-number-input` library with Nigerian country preset
   - **Auto-formatting**: Automatically formats as user types
   - **Placeholder**: "Enter your phone number"

##### **Shortlet-Specific Contact Fields**

4. **WhatsApp Number** (Optional - Shortlet Only)
   - **Type**: Phone Number Input with Validation
   - **Purpose**: Alternative contact via WhatsApp for better communication
   - **Validation**: 
     - Optional (nullable)
     - If provided, must be valid Nigerian phone number format
     - Same validation as Phone Number: `/^(\+234|0)[789][01]\d{8}$/`
   - **Error Message**: "Please enter a valid Nigerian WhatsApp number"
   - **Data Path**: `formData.contactInfo.whatsappNumber`
   - **Component**: `react-phone-number-input` library
   - **Placeholder**: "Enter your WhatsApp number (optional)"
   - **Help Text**: "We'll use this for quick updates about available properties"
   - **Shown For**: Shortlet preferences only

5. **Preferred Check-In Time** (Optional - Shortlet Only)
   - **Type**: Time Picker Dropdown
   - **Purpose**: Specify preferred arrival time for shortlet
   - **Format**: 24-hour format (HH:MM)
   - **Options**: 8:00 AM to 10:00 PM in hourly increments
     - 08:00 (8:00 AM)
     - 09:00 (9:00 AM)
     - 10:00 (10:00 AM)
     - ... (hourly)
     - 21:00 (9:00 PM)
     - 22:00 (10:00 PM)
   - **Default**: None (optional)
   - **Data Path**: `formData.contactInfo.preferredCheckInTime`
   - **Component**: Select dropdown
   - **Validation**: Must be valid time format if provided
   - **Shown For**: Shortlet preferences only

6. **Preferred Check-Out Time** (Optional - Shortlet Only)
   - **Type**: Time Picker Dropdown
   - **Purpose**: Specify preferred departure time for shortlet
   - **Format**: 24-hour format (HH:MM)
   - **Options**: Same as Check-In Time (8:00 AM to 10:00 PM)
   - **Default**: None (optional)
   - **Data Path**: `formData.contactInfo.preferredCheckOutTime`
   - **Component**: Select dropdown
   - **Validation**: Must be valid time format if provided
   - **Shown For**: Shortlet preferences only

7. **Pets Allowed** (Optional - Shortlet Only)
   - **Type**: Toggle Checkbox
   - **Label**: "I will bring pets"
   - **Purpose**: Indicate if user will bring pets during stay
   - **Default**: false (unchecked)
   - **Data Path**: `formData.contactInfo.petsAllowed`
   - **Related Field**: Affects feature selection (Pet-Friendly filter)
   - **Shown For**: Shortlet preferences only

8. **Smoking Allowed** (Optional - Shortlet Only)
   - **Type**: Toggle Checkbox
   - **Label**: "I intend to smoke"
   - **Purpose**: Indicate if user intends to smoke during stay
   - **Default**: false (unchecked)
   - **Data Path**: `formData.contactInfo.smokingAllowed`
   - **Related Field**: Affects property matching (Smoking-Friendly filter)
   - **Shown For**: Shortlet preferences only

9. **Parties Allowed** (Optional - Shortlet Only)
   - **Type**: Toggle Checkbox
   - **Label**: "I will host parties/gatherings"
   - **Purpose**: Indicate if user will host parties or events during stay
   - **Default**: false (unchecked)
   - **Data Path**: `formData.contactInfo.partiesAllowed`
   - **Related Field**: Affects property matching rules
   - **Shown For**: Shortlet preferences only

10. **Additional Requests** (Optional - Shortlet Only)
    - **Type**: Text Area
    - **Purpose**: Special requests or additional requirements for shortlet
    - **Max Length**: 1000 characters
    - **Rows**: 4-5 rows visible
    - **Data Path**: `formData.contactInfo.additionalRequests`
    - **Placeholder**: "Enter any special requests or requirements (e.g., quiet neighborhood, near public transport)"
    - **Help Text**: Remaining character count
    - **Shown For**: Shortlet preferences only

11. **Maximum Budget Per Night** (Optional - Shortlet Only)
    - **Type**: Numeric Input with Currency Formatting
    - **Purpose**: Maximum amount willing to pay per night
    - **Currency**: NGN (Nigerian Naira)
    - **Validation**: 
     - Optional (nullable)
     - Must be positive number if provided
     - Cannot be negative
    - **Min Value**: 0
    - **Max Value**: No hard limit
    - **Data Path**: `formData.contactInfo.maxBudgetPerNight`
    - **Default**: Pulled from `budget.maxPrice` initially
    - **Display Format**: Formatted with thousand separators
    - **Placeholder**: "Enter maximum per night budget"
    - **Shown For**: Shortlet preferences only

12. **Willing to Pay Extra** (Optional - Shortlet Only)
    - **Type**: Toggle Checkbox
    - **Label**: "I'm willing to pay extra for my preferred property"
    - **Purpose**: Flexibility to pay more for preferred property features
    - **Default**: false (unchecked)
    - **Data Path**: `formData.contactInfo.willingToPayExtra`
    - **Help Text**: "Check this if you can exceed your budget for the right property"
    - **Related Fields**: Affects priority in matching algorithm
    - **Shown For**: Shortlet preferences only

13. **Cleaning Fee Budget** (Optional - Shortlet Only)
    - **Type**: Numeric Input with Currency Formatting
    - **Purpose**: Budget allocated for cleaning/laundry services
    - **Currency**: NGN (Nigerian Naira)
    - **Validation**: 
     - Optional (nullable)
     - Must be positive number if provided
     - Cannot be negative
    - **Min Value**: 0
    - **Max Value**: No hard limit
    - **Data Path**: `formData.contactInfo.cleaningFeeBudget`
    - **Display Format**: Formatted with thousand separators
    - **Placeholder**: "Enter cleaning fee budget"
    - **Shown For**: Shortlet preferences only

14. **Security Deposit Budget** (Optional - Shortlet Only)
    - **Type**: Numeric Input with Currency Formatting
    - **Purpose**: Amount willing to pay as security/caution deposit
    - **Currency**: NGN (Nigerian Naira)
    - **Validation**: 
     - Optional (nullable)
     - Must be positive number if provided
     - Cannot be negative
    - **Min Value**: 0
    - **Max Value**: No hard limit
    - **Data Path**: `formData.contactInfo.securityDepositBudget`
    - **Display Format**: Formatted with thousand separators
    - **Placeholder**: "Enter security deposit budget"
    - **Help Text**: "Typical deposit is 20-30% of rental cost"
    - **Shown For**: Shortlet preferences only

15. **Cancellation Policy** (Optional - Shortlet Only)
    - **Type**: Single Select Dropdown
    - **Purpose**: User's acceptable cancellation terms
    - **Options**:
      - Flexible (Can cancel anytime with no penalty)
      - Moderate (Can cancel with 7-14 days notice)
      - Strict (Non-refundable, or specific penalty terms)
    - **Default**: None (optional)
    - **Data Path**: `formData.contactInfo.cancellationPolicy`
    - **Component**: Select dropdown with values: "flexible", "moderate", "strict"
    - **Shown For**: Shortlet preferences only

##### **Additional Information Section**

16. **Additional Notes** (Optional - Buy & Rent Only)
    - **Type**: Text Area
    - **Purpose**: Any additional preferences, special requirements, or notes
    - **Max Length**: Typically 1000-2000 characters
    - **Rows**: 4-5 rows visible
    - **Data Path**: `formData.additionalNotes`
    - **Placeholder**: "Enter any additional preferences or special requirements"
    - **Shown For**: Buy and Rent preferences (not Shortlet)
    - **Examples**: "Prefer properties near good schools", "Need parking for 2 cars", etc.

##### Components: 
- `OptimizedContactInformation.tsx`
- `ContactInformation.tsx` (legacy version)

---

### Joint Venture Preference (5-Step Form)

Joint Venture has a completely separate form flow with 5 distinct steps tailored to developer/investor needs.

#### **Step 1: Developer Information**

Contact and company details for the developer/investor.

##### Fields:

1. **Full Name** (Required)
   - **Type**: Text Input
   - **Purpose**: Full name of the contact person/project lead
   - **Validation**: 
     - Required
     - Minimum 2 characters
     - Maximum 100 characters
     - Letters and spaces only
   - **Data Path**: `formData.contactInfo.fullName`
   - **Placeholder**: "Enter your full name"

2. **Company Name** (Required)
   - **Type**: Text Input
   - **Purpose**: Name of the development/investment company
   - **Validation**: 
     - Required
     - Minimum 2 characters
     - Maximum 150 characters
     - Can include numbers and special characters (like & Inc.)
   - **Data Path**: `formData.contactInfo.companyName`
   - **Placeholder**: "Enter your company name"
   - **Example**: "Prime Developments Ltd", "BuildCorp & Associates"

3. **Email Address** (Required)
   - **Type**: Email Input
   - **Purpose**: Company or personal email for contact
   - **Validation**: 
     - Required
     - Valid email format
   - **Data Path**: `formData.contactInfo.email`
   - **Placeholder**: "Enter email address"

4. **Phone Number** (Required)
   - **Type**: Phone Number Input
   - **Purpose**: Contact phone number (mobile or office)
   - **Validation**: 
     - Required
     - Valid Nigerian phone number format
     - Accepts: +234, 0789, 0801 prefixes
   - **Data Path**: `formData.contactInfo.phoneNumber`
   - **Component**: `react-phone-number-input` library

5. **CAC Registration Number** (Optional)
   - **Type**: Text Input
   - **Purpose**: Company registration number from Corporate Affairs Commission
   - **Format**: Typically 7-10 alphanumeric characters
   - **Example**: "RC 1234567", "BN7654321"
   - **Data Path**: `formData.contactInfo.cacRegistrationNumber`
   - **Placeholder**: "Enter CAC registration number (e.g., RC 1234567)"
   - **Validation**: Optional, but if provided should match CAC format
   - **Help Text**: "This helps verify your company legitimacy"

##### Component: `JVStep1DeveloperInfo.tsx`

---

#### **Step 2: Development Type & Location**

Specifies the types of development projects the investor is interested in and preferred locations.

##### Fields:

1. **Development Types** (Required)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Select the types of development projects interested in
   - **Options**:
     - Mini Flats
     - Luxury Duplexes
     - Mixed-Use Development
     - Commercial Complex
     - Residential Estate
     - Office Complex
     - Industrial Park
     - Retail Complex
     - Shopping Mall
     - Land Subdivision
   - **Max Selections**: Can select multiple
   - **Min Selections**: At least 1 required
   - **Data Path**: `formData.developmentDetails.developmentTypes`
   - **Validation**: Required (minimum 1 selection)
   - **Help Text**: "Select all development types you're interested in"

2. **State** (Required)
   - **Type**: Single Select
   - **Purpose**: State where development is desired
   - **Options**: All Nigerian states
   - **Data Path**: `formData.location.state`
   - **Validation**: Required

3. **Local Government Areas** (Required)
   - **Type**: Multi-Select with Search
   - **Purpose**: Specific LGAs within the selected state
   - **Max Selection**: Up to 3 LGAs
   - **Data Path**: `formData.location.localGovernmentAreas`
   - **Validation**: Required (minimum 1 selection)
   - **Dynamic**: Options change based on selected state

##### Component: `JVStep2DevelopmentType.tsx`

---

#### **Step 3: Land Requirements**

Specifications for the land needed for development.

##### Fields:

1. **Minimum Land Size** (Required)
   - **Type**: Numeric Input
   - **Purpose**: Smallest land size acceptable for development
   - **Accepts**: Positive numbers (integers or decimals)
   - **Data Path**: `formData.developmentDetails.minLandSize`
   - **Validation**: Required, must be > 0
   - **Paired With**: Measurement Unit field

2. **Maximum Land Size** (Optional)
   - **Type**: Numeric Input
   - **Purpose**: Largest land size needed for development
   - **Accepts**: Positive numbers (integers or decimals)
   - **Data Path**: `formData.developmentDetails.maxLandSize`
   - **Validation**: Optional, but if provided must be >= Minimum Land Size
   - **Help Text**: "Leave blank if no maximum"

3. **Measurement Unit** (Required)
   - **Type**: Single Select
   - **Purpose**: Unit for land size measurements
   - **Options**:
     - Plot
     - SQM (Square Meters)
     - Hectares
   - **Data Path**: `formData.developmentDetails.measurementUnit`
   - **Validation**: Required
   - **Applies To**: Both Minimum and Maximum land sizes

4. **Budget** (Required)
   - **Type**: Numeric Input with Currency Formatting
   - **Purpose**: Total budget for land acquisition
   - **Currency**: NGN (Nigerian Naira)
   - **Validation**: Required, must be > 0
   - **Data Path**: `formData.budget.maxPrice`
   - **Display Format**: Formatted with thousand separators
   - **Note**: This represents maximum willing to spend on land

##### Component: `JVStep3LandRequirements.tsx`

---

#### **Step 4: JV Terms & Proposal**

Details about the proposed joint venture terms and arrangement.

##### Fields:

1. **Preferred Sharing Ratio** (Optional)
   - **Type**: Text Input
   - **Purpose**: Proposed equity split or profit sharing arrangement
   - **Format**: "XX:XX" pattern (e.g., "50:50", "60:40", "70:30")
   - **Examples**:
     - "50:50" - Equal partnership
     - "60:40" - 60% investor, 40% land owner
     - "65:35" - 65% developer, 35% land owner
   - **Data Path**: `formData.developmentDetails.preferredSharingRatio`
   - **Placeholder**: "e.g., 50:50 or 60:40"
   - **Validation**: Optional, but if provided should match ratio format
   - **Help Text**: "Format: XX:XX (e.g., 60:40)"

2. **Proposal Details** (Optional)
   - **Type**: Text Area
   - **Purpose**: Detailed explanation of the JV proposal, terms, and conditions
   - **Max Length**: 2000-5000 characters
   - **Rows**: 6-8 rows visible
   - **Data Path**: `formData.developmentDetails.proposalDetails`
   - **Placeholder**: "Describe your JV proposal, timeline, expected ROI, payment terms, etc."
   - **Help Text**: "Include timeline, expected completion date, ROI expectations, payment schedule"
   - **Examples of Content**:
     - Timeline for construction
     - Expected return on investment
     - Payment schedule
     - Responsibilities of each party
     - Exit strategy

##### Component: `JVStep4TermsProposal.tsx`

---

#### **Step 5: Title & Documentation Requirements**

Specifications for acceptable property titles and documentation.

##### Fields:

1. **Minimum Title Requirements** (Required)
   - **Type**: Multi-Select with Checkboxes
   - **Purpose**: Acceptable documentation/title types
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
   - **Min Selections**: At least 1 required
   - **Max Selections**: No limit
   - **Data Path**: `formData.developmentDetails.minimumTitleRequirements`
   - **Validation**: Required (minimum 1 selection)
   - **Help Text**: "Select all title types you'll accept"
   - **Interactive**: Each option has checkbox with label

2. **Willing to Consider Pending Title** (Optional)
   - **Type**: Toggle Checkbox
   - **Label**: "Willing to consider properties with pending titles"
   - **Purpose**: Flexibility to accept properties with titles currently being processed
   - **Default**: false (unchecked)
   - **Data Path**: `formData.developmentDetails.willingToConsiderPendingTitle`
   - **Help Text**: "Some properties may have titles in final stages of processing"
   - **Related**: May unlock additional property matches

3. **Additional Requirements** (Optional)
   - **Type**: Text Area
   - **Purpose**: Any other specific documentation or property requirements
   - **Max Length**: 1000-2000 characters
   - **Rows**: 4-5 rows visible
   - **Data Path**: `formData.developmentDetails.additionalRequirements`
   - **Placeholder**: "e.g., Require environmental clearance, Must be zoned for commercial, etc."
   - **Examples**:
     - Environmental clearance requirements
     - Zoning requirements
     - Infrastructure requirements
     - Boundary disputes history
     - Utilities accessibility

##### Component: `JVStep5TitleDocumentation.tsx`

---

## Form Navigation & Step Progress

### Step Progress Indicator

The form displays a visual progress indicator showing:
- **Current Step**: Highlighted with emerald/green color (#10B981) with a ring border
- **Completed Steps**: Marked with a checkmark (✓) icon, grayed slightly
- **Upcoming Steps**: Grayed out text, disabled to clicks
- **Step Numbers**: Shows "Step X of Y" format (e.g., "Step 1 of 4")
- **Step Titles**: Clear descriptive titles for each step

### Step Navigation Features

1. **Next Button**
   - **Label**: "Next"
   - **Appears**: At bottom of each non-final step
   - **Behavior**: Validates current step before allowing progression
   - **Disabled State**: Gray and non-interactive if step validation fails
   - **Loading State**: Shows spinner while processing
   - **Error Display**: Shows validation errors above button

2. **Previous Button**
   - **Label**: "Previous" or "Back"
   - **Appears**: At bottom of each non-first step
   - **Behavior**: No validation required, immediately returns to previous step
   - **Preserves Data**: All entered data on previous step remains intact
   - **Always Enabled**: Never disabled

3. **Submit Button**
   - **Label**: "Submit" or "Complete"
   - **Appears**: On the final step only
   - **Behavior**: 
     - Validates entire form before submission
     - Shows loading spinner on click
     - Displays error messages if validation fails
     - Succeeds only when form is completely valid
   - **Loading State**: "Submitting..." text with spinner
   - **Component**: `SubmitButton.tsx`

### Step Validation Rules

#### Buy Preference Validation
- **Step 1 (Location)**: State required; at least 1 LGA required
- **Step 2 (Property Details & Budget)**: Property type, condition, purpose required; land size + measurement unit + documents required if land; budget min < max and meets thresholds
- **Step 3 (Features)**: No required validation (optional step)
- **Step 4 (Contact)**: Full name, email, valid phone required

#### Rent Preference Validation
- **Step 1 (Location)**: State required; at least 1 LGA required
- **Step 2 (Property Details & Budget)**: Property type, building type, condition, purpose required; budget validation
- **Step 3 (Features)**: No required validation (optional step)
- **Step 4 (Contact)**: Full name, email, valid phone required

#### Joint Venture Validation
- **Step 1 (Developer Info)**: Full name, company, email, phone required; CAC optional
- **Step 2 (Development Type)**: At least 1 development type; state and at least 1 LGA required
- **Step 3 (Land Requirements)**: Min land size required; measurement unit required; budget required
- **Step 4 (JV Terms)**: Sharing ratio and proposal details optional
- **Step 5 (Title & Documentation)**: At least 1 title requirement required

#### Shortlet Validation
- **Step 1 (Location)**: State required; at least 1 LGA required
- **Step 2 (Property Details, Budget & Features)**: 
   - Property type required
   - Building type required if applicable
   - Bedrooms required
   - Check-in and check-out dates required (check-out must be after check-in)
   - Number of guests required (>= 1)
   - Budget validation
- **Step 3 (Features)**: No required validation
- **Step 4 (Contact)**: Full name, email, valid phone required

### Form State Management

#### Context: `PreferenceFormContext`

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

#### Available Actions:
- `SET_STEP`: Navigate to a specific step
- `UPDATE_FORM_DATA`: Update form field values
- `SET_VALIDATION_ERRORS`: Set validation errors for display
- `SET_SUBMITTING`: Toggle submission loading state
- `RESET_FORM`: Clear all form data and reset to step 0
- `SET_BUDGET_THRESHOLDS`: Update budget thresholds per location
- `SET_FEATURE_CONFIGS`: Update feature configurations per preference type
- `SET_PREFERENCE_TYPE`: Change preference type and reset appropriate data

#### Hook: `usePreferenceForm()`

Provides access to form state and actions:

```typescript
const {
  state,                              // Current form state
  dispatch,                           // Redux-style dispatch for actions
  goToNextStep,                       // Navigate to next step with validation
  goToPreviousStep,                   // Navigate to previous step
  updateFormData,                     // Update form field values
  validateStep,                       // Validate a specific step
  resetForm,                          // Reset entire form
  isFormValid,                        // Check if entire form is valid
  goToStep,                           // Jump to specific step (must be <= current + 1)
  getAvailableFeatures,               // Get features for preference type
  getCurrentStepValidation,           // Get validation errors for current step
} = usePreferenceForm();
```

---

## API Submission

### Endpoint
```
POST /preferences/submit
```

### Submission Behavior
- **Authentication**: Requires authenticated user (token in header)
- **Idempotency**: Not idempotent (multiple submissions create multiple preferences)
- **Response Time**: Typically 1-3 seconds
- **Success Response**: 
  ```json
  {
    "success": true,
    "preferenceId": "ObjectId",
    "message": "Preference submitted successfully"
  }
  ```
- **Error Handling**: Validation errors returned with 400 status; server errors with 500 status

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
    "propertySubtype": "land|residential|commercial",
    "buildingType": "string",
    "bedrooms": "string|number",
    "bathrooms": "string|number",
    "propertyCondition": "new|renovated|old",
    "purpose": "for-living|resale|development",
    "landSize": "string|number",
    "measurementUnit": "plot|sqm|hectares",
    "documentTypes": ["string"],
    "landConditions": ["string"]
  },
  "nearbyLandmark": "string (optional)",
  "additionalNotes": "string (optional)"
}
```

#### Rent Preference Additional Fields
```json
{
  "propertyDetails": {
    "propertySubtype": "residential|commercial|land",
    "buildingType": "string",
    "bedrooms": "string|number",
    "bathrooms": "string|number",
    "propertyCondition": "new|good-condition|renovation",
    "purpose": "residential|office"
  },
  "additionalNotes": "string (optional)"
}
```

#### Joint Venture Additional Fields
```json
{
  "developmentDetails": {
    "minLandSize": "string|number",
    "maxLandSize": "string|number (optional)",
    "measurementUnit": "plot|sqm|hectares",
    "developmentTypes": ["string"],
    "preferredSharingRatio": "string (optional)",
    "proposalDetails": "string (optional)",
    "minimumTitleRequirements": ["string"],
    "willingToConsiderPendingTitle": boolean (optional)
  },
  "contactInfo": {
    "companyName": "string",
    "contactPerson": "string (optional)",
    "cacRegistrationNumber": "string (optional)"
  }
}
```

#### Shortlet Additional Fields
```json
{
  "bookingDetails": {
    "propertyType": "string",
    "bedrooms": "string|number",
    "numberOfGuests": number,
    "checkInDate": "YYYY-MM-DD",
    "checkOutDate": "YYYY-MM-DD",
    "travelType": "string (optional)"
  },
  "contactInfo": {
    "whatsappNumber": "string (optional)",
    "preferredCheckInTime": "HH:MM (optional)",
    "preferredCheckOutTime": "HH:MM (optional)",
    "petsAllowed": boolean (optional),
    "smokingAllowed": boolean (optional),
    "partiesAllowed": boolean (optional),
    "additionalRequests": "string (optional)",
    "maxBudgetPerNight": number (optional),
    "willingToPayExtra": boolean (optional),
    "cleaningFeeBudget": number (optional)",
    "securityDepositBudget": number (optional)",
    "cancellationPolicy": "flexible|moderate|strict (optional)"
  }
}
```

---

## Validation Rules

### Location Validation
- **State**: Required, must be valid Nigerian state
- **LGAs**: Required (minimum 1), maximum 3, must be valid for selected state
- **Areas**: Optional, maximum 3 per LGA, must be valid for selected LGA
- **Custom Location**: Optional, max 255 characters, free text

### Property Details Validation
- **Property Type**: Required for all
- **Building Type**: Required if property is Residential or Commercial (not for Land)
- **Bedrooms**: Required for Residential properties
- **Bathrooms**: Required for Residential properties
- **Condition**: Required for all
- **Purpose**: Required for all
- **Land Size**: 
  - Required if property type is Land (for Buy/JV only)
  - Must be positive number
- **Measurement Unit**: 
  - Required if land size is specified
  - Must match one of: plot, sqm, hectares
- **Document Types**: 
  - Required for Buy/Joint Venture
  - Minimum 1 selection required
- **Land Conditions**: Optional

### Budget Validation
- **Minimum Price**: 
  - Required
  - Must be positive number
  - Must be >= location-specific minimum threshold
  - Must be <= Maximum Price
- **Maximum Price**: 
  - Required
  - Must be positive number
  - Must be >= Minimum Price
- **Thresholds enforced**:
  - Lagos Buy: ₦5,000,000 minimum
  - Lagos Rent: ₦200,000 minimum
  - Lagos JV: ₦10,000,000 minimum
  - Lagos Shortlet: ₦15,000 minimum
  - (Similar thresholds for other states)

### Contact Validation
- **Full Name**: 
  - Required (except Joint Venture uses it for contact person)
  - 2-100 characters
  - Letters and spaces only
- **Email**: 
  - Required
  - Valid email format
- **Phone Number**: 
  - Required
  - Valid Nigerian format: `/^(\+234|0)[789][01]\d{8}$/`
  - Accepts: +234, 0789, 0801 prefixes
- **WhatsApp Number** (Shortlet):
  - Optional (nullable)
  - If provided, must match phone number format
- **Check Times** (Shortlet):
  - Optional
  - Must be valid time format if provided
- **Amounts** (Shortlet):
  - Optional
  - Must be non-negative if provided
  - Cannot be negative

### Joint Venture Specific Validation
- **Company Name**: Required, 2+ characters
- **Development Types**: Required, minimum 1 selection
- **Land Size**: Required, must be positive
- **Title Requirements**: Required, minimum 1 selection
- **Sharing Ratio**: Optional, but if provided should match XX:XX format

### Shortlet Specific Validation
- **Check-In Date**: Required, must be today or future date
- **Check-Out Date**: Required, must be after check-in date
- **Number of Guests**: Required, must be >= 1
- **Dates**: Minimum 1 night stay required

---

## Components Structure

### Main Components

| Component | Purpose | File |
|-----------|---------|------|
| `PreferenceFormProvider` | Context provider wrapper | `preference-form-context.tsx` |
| `PreferenceFormContent` | Main form container and logic | `page.tsx` |
| `LoadingOverlay` | Shows submission loading state with spinner | `page.tsx` |
| `SuccessModal` | Success confirmation with next actions | `page.tsx` |
| `StepProgressIndicator` | Visual step progress display with checkmarks | `OptimizedStepWrapper.tsx` |
| `PreferenceTypeButton` | Preference type selection button/card | `page.tsx` |

### Form Step Components

| Component | Purpose | Preference Types | File |
|-----------|---------|-----------------|------|
| `OptimizedLocationSelection` | State/LGA/Area selection | All | `OptimizedLocationSelection.tsx` |
| `PropertyDetails` | Property type and specifications | Buy, Rent, Shortlet | `PropertyDetails.tsx` |
| `OptimizedBudgetSelection` | Budget range selection | All | `OptimizedBudgetSelection.tsx` |
| `FeatureSelection` | Amenities and features selection | All | `FeatureSelection.tsx` |
| `DateSelection` | Check-in/out dates (lazy-loaded) | Shortlet | `DateSelection.tsx` |
| `OptimizedContactInformation` | Contact details and shortlet preferences | All | `OptimizedContactInformation.tsx` |
| `JointVenturePreferenceForm` | Wrapper for all JV steps | Joint Venture | `joint-venture/JointVenturePreferenceForm.tsx` |
| `JVStep1DeveloperInfo` | Developer/company details | Joint Venture | `joint-venture/JVStep1DeveloperInfo.tsx` |
| `JVStep2DevelopmentType` | Development types selection | Joint Venture | `joint-venture/JVStep2DevelopmentType.tsx` |
| `JVStep3LandRequirements` | Land specifications | Joint Venture | `joint-venture/JVStep3LandRequirements.tsx` |
| `JVStep4TermsProposal` | JV terms and proposal | Joint Venture | `joint-venture/JVStep4TermsProposal.tsx` |
| `JVStep5TitleDocumentation` | Title requirements | Joint Venture | `joint-venture/JVStep5TitleDocumentation.tsx` |
| `SubmitButton` | Form submission button | All | `SubmitButton.tsx` |
| `OptimizedStepWrapper` | Step container with animations | All | `OptimizedStepWrapper.tsx` |

---

## Key Features

### 1. **Multi-Step Form with Progress Tracking**
- Visual progress indicator showing current step and completed steps
- Users can navigate back to previous steps but not skip ahead
- Auto-save form data as users progress (stored in context)
- Step validation prevents progression until all required fields valid

### 2. **Responsive Design**
- Mobile-first approach with touch-friendly controls
- Adaptive layouts for small (320px+), medium (768px+), and large (1024px+) screens
- Optimized button and input sizes for mobile
- Stack layout on mobile, grid layout on desktop

### 3. **Real-Time Validation**
- Validates each field as user enters data
- Shows error messages inline below fields
- Red border and error text styling for invalid fields
- Prevents form progression if validation fails

### 4. **Smart Feature Configurations**
- Different features available based on property type and budget
- Features are customized per preference type (Buy vs Rent vs Shortlet)
- Auto-adjust option to modify budget based on selected features
- Features list from `FEATURE_CONFIGS` in preference-configs.ts

### 5. **Success Workflow**
- Success modal displays after form submission
- Shows success message with property matching next steps
- Option to submit another preference
- Quick navigation to marketplace or dashboard
- 3-5 second display before auto-dismiss

### 6. **Preference Type Switching**
- Easy switching between preference types via button selection
- Form resets completely when preference type changed
- Each type has customized fields and validation
- Preference type selection at beginning prevents mistakes

### 7. **Budget Thresholds**
- Minimum budgets vary by location and preference type
- Validation ensures budget meets location requirements
- Thresholds loaded from `DEFAULT_BUDGET_THRESHOLDS` in preference-configs.ts
- Helps filter properties for better matches

### 8. **Accessible & User-Friendly**
- Clear labels and descriptions for each field
- Phone number input supports multiple Nigerian formats
- Date and time pickers for convenience
- Multi-select with search functionality for large lists
- Error messages explain validation failures
- Help text and placeholders guide users
- Required field indicators (red asterisk)

---

## Success Modal Behavior

After successful preference submission:

1. **Modal Displays With**:
   - Success checkmark icon (animated)
   - "Preference Submitted Successfully!" heading
   - Confirmation message about property matching
   - Count of matched properties found (if any)

2. **User Actions**:
   - **Submit Another Preference**: Resets form, returns to preference type selection
   - **View Matched Properties**: Navigates to marketplace/results page
   - **Go to Dashboard**: Navigates to user dashboard
   - Auto-dismiss after 5 seconds (returns to home)

3. **Behind The Scenes**:
   - Preference saved to database
   - Matching algorithm runs to find similar properties
   - User preference count incremented
   - Notification sent to agents matching criteria

---

## File Structure

```
src/
├── app/
│   └── preference/
│       ├── page.tsx                          # Main preference page
│       ├── layout.tsx                        # Page layout
│       └── matches/
│           └── [preferenceId]/buyer/[buyerId]/page.tsx  # Matched properties view
├── components/
│   └── preference-form/
│       ├── OptimizedLocationSelection.tsx   # Location step
│       ├── PropertyDetails.tsx              # Property details (shortlet, buy, rent)
│       ├── OptimizedBudgetSelection.tsx    # Budget selection
│       ├── FeatureSelection.tsx            # Features & amenities
│       ├── DateSelection.tsx               # Date picker (lazy-loaded)
│       ├── OptimizedContactInformation.tsx # Contact & preferences
│       ├── OptimizedStepWrapper.tsx        # Step container
│       ├── SubmitButton.tsx                # Submit button
│       ├── BudgetSelection.tsx             # Legacy version
│       ├── ContactInformation.tsx          # Legacy version
│       ├── LocationSelection.tsx           # Legacy version
│       ├── StepWrapper.tsx                 # Legacy version
│       └── joint-venture/
│           ├── JointVenturePreferenceForm.tsx       # JV form wrapper
│           ├── JVStep1DeveloperInfo.tsx            # Developer info
│           ├── JVStep2DevelopmentType.tsx          # Development types
│           ├── JVStep3LandRequirements.tsx         # Land specs
│           ├── JVStep4TermsProposal.tsx            # JV terms
│           └── JVStep5TitleDocumentation.tsx       # Title requirements
├── context/
│   └── preference-form-context.tsx          # Form state management
├── data/
│   └── preference-configs.ts                # Feature configs & defaults
├── types/
│   └── preference-form.ts                   # TypeScript interfaces
├── utils/
│   ├── validation/
│   │   └── preference-validation.ts         # Validation schemas
│   └── location-utils.ts                    # Location data utilities
└── styles/
    └── preference-form.css                  # Form styles
```

---

## Error Handling

### Validation Errors
- **Display**: Inline below each field in red text
- **Styling**: Field border changes to red, background slightly highlighted
- **Auto-clear**: Errors disappear when user corrects the field
- **Examples**:
  - "Full name must be at least 2 characters"
  - "Please enter a valid Nigerian phone number"
  - "Minimum price must be less than maximum price"

### Submission Errors
- **Display**: Toast notification with error message
- **Duration**: 5-10 seconds before auto-dismiss
- **Type**: Error toast (red background)
- **Action**: User can click to dismiss
- **Form State**: Form remains on current step for correction

### Network Errors
- **Handling**: Caught and displayed as toast notifications
- **Loading State**: Clears loading spinner on error
- **User Action**: Can attempt resubmission
- **Messaging**: "Network error. Please check your connection and try again"

### Server-Side Validation
- **If Fields Fail**: Backend returns 400 status with error details
- **Display**: Toast shows error message
- **Form State**: No step progression
- **Recovery**: User corrects fields and resubmits

---

## Performance Optimizations

### 1. **Memoization**
- Components wrapped with `React.memo()` to prevent unnecessary re-renders
- Callbacks memoized with `useCallback()` for event handlers
- Values memoized with `useMemo()` for expensive calculations
- Context values memoized to prevent triggering all subscribers

### 2. **Code Splitting**
- `DateSelection` component lazy-loaded with `next/dynamic`
- Reduces initial bundle size by ~50KB
- Loading fallback shows skeleton while loading

### 3. **Form Updates**
- Debounced form updates to prevent excessive re-renders
- Immediate updates for critical changes (step navigation)
- Batch updates where possible

### 4. **Context Optimization**
- Separate context value memoization prevents stale closures
- Only relevant state passed to components
- Context split if needed to prevent over-subscription

### 5. **Asset Optimization**
- SVG icons used for progress indicator (no image requests)
- CSS classes for styling (no custom CSS in JS)
- External libraries lazy-loaded where possible

---

## Testing Considerations

### Test Routes
The application provides test pages:
- `/preference?type=buy` - Test buy preference
- `/preference?type=rent` - Test rent preference
- `/preference?type=joint-venture` - Test JV preference
- `/preference?type=shortlet` - Test shortlet preference
- `/test-preference` - Main test page with all links

### Testing Checklist
- [ ] All form fields render correctly per preference type
- [ ] Required field validation works
- [ ] Phone number validation accepts all Nigerian formats
- [ ] Date validation prevents past dates and invalid ranges
- [ ] Budget validation enforces location minimums
- [ ] Previous/Next navigation works correctly
- [ ] Form data persists when navigating between steps
- [ ] Preference type switching resets form completely
- [ ] Feature selection updates based on property type
- [ ] Form submission sends correct API payload
- [ ] Success modal displays after submission
- [ ] Error handling shows appropriate messages
- [ ] Mobile responsive layout works
- [ ] Accessibility features work (keyboard nav, labels, etc.)

### Unit Test Examples
```typescript
// Test location validation
test('location step requires state and at least one LGA', () => {
  // Render location step
  // Try to proceed without selections
  // Verify error messages shown
});

// Test budget validation
test('budget must meet location-specific minimums', () => {
  // Set state to Lagos
  // Set budget below minimum
  // Verify validation error
});

// Test phone number validation
test('phone number accepts various Nigerian formats', () => {
  // Test +234801234567
  // Test 08012345678
  // Test 0789876543
  // All should pass validation
});
```

---

## Future Enhancements

1. **Draft Saving**: Save form progress locally for incomplete submissions
2. **Form History**: Show users their previous preferences with ability to duplicate
3. **Smart Matching**: Display matched properties as they fill the form in real-time
4. **AI Suggestions**: Recommend features based on budget and location
5. **Template Preferences**: Save and reuse preference templates
6. **Batch Preferences**: Submit multiple preferences at once
7. **Comparison Tool**: Compare different preference scenarios
8. **Mobile App**: Native mobile app for preference submission
9. **Voice Input**: Voice-to-text for field input (especially for mobile)
10. **Multi-language**: Support for Yoruba, Hausa, Igbo languages

---

## Integration Points

### APIs Used
- `POST /preferences/submit` - Submit preference to backend
- `GET /budget-thresholds` - Fetch location-specific budget minimums
- `GET /features-config` - Fetch feature configurations
- `GET /matched-properties` - Fetch properties matching preference

### Context Dependencies
- `PreferenceFormContext` - Form state and management
- `UserContext` - User authentication and data
- `PageContext` - Global page state

### External Libraries
- `react-hot-toast` - Notifications and alerts
- `framer-motion` - Animations and transitions
- `react-select` - Multi-select dropdowns with search
- `react-datepicker` - Date selection picker
- `react-phone-number-input` - Phone number input with formatting
- `formik` & `yup` - Form validation
- `next/dynamic` - Code splitting and lazy loading

---

## Glossary

| Term | Definition |
|------|-----------|
| **Preference** | User's property requirements and search criteria |
| **Preference Mode** | Backend categorization: buy, tenant, developer, shortlet |
| **LGA** | Local Government Area - administrative division in Nigeria |
| **Joint Venture (JV)** | Partnership agreement between investor/developer and land owner |
| **Shortlet** | Short-term rental property (days/weeks, not months/years) |
| **Property Subtype** | Classification: Land, Residential, Commercial |
| **Building Type** | Structure type: Bungalow, Duplex, Flat, Studio, Office, Warehouse, etc. |
| **Document Type** | Legal proof of ownership: Deed, Certificate, Gazette, etc. |
| **Basic Feature** | Standard amenity in most properties |
| **Premium Feature** | Luxury amenity indicating higher-end property |
| **Budget Threshold** | Minimum budget required by location and preference type |
| **Feature Config** | Mapping of available features per property type |
| **Measurement Unit** | Land size unit: Plot, SQM, Hectares |
| **Cancellation Policy** | Acceptable terms for canceling shortlet bookings |
| **CAC Registration** | Corporate Affairs Commission registration number |
| **Equity Split** | Profit/ownership division in JV agreements |

---

## Support & Maintenance

### Common Issues

1. **Form not submitting**
   - Check all required fields are completed (red asterisks show requirements)
   - Verify phone number is valid Nigerian format (+234 or 0xxx)
   - Check internet connection
   - Try clearing browser cache

2. **Validation errors not clearing**
   - Clear the field completely and re-enter data
   - Refresh page if issue persists
   - Check browser console for JavaScript errors

3. **Features not loading**
   - Ensure property type is selected first (features depend on type)
   - Check browser console for errors
   - Verify preference-configs.ts has feature data

4. **Dates showing as invalid**
   - Ensure check-out date is after check-in date
   - Check dates are not in past
   - Verify your browser's date/time is correct

### Debugging

Development mode enables debug information:
- Check bottom of page for debug panel (dev mode only)
- Panel shows current form data structure
- Shows validation state for each field
- Displays payload that will be sent to API
- View in browser console for detailed logs

To enable debug mode:
```bash
NODE_ENV=development npm run dev
```

### Contact Support

For bugs or questions:
- Email: support@khabiteq.com
- Report issues with preference form in GitHub
- Include preference type, browser info, and reproduction steps

---

**Last Updated**: December 2024
**Documentation Version**: 2.0 (Complete)
**Created for**: Khabiteq Realty Platform
**Scope**: Full preference form documentation with all fields, validations, and behaviors
