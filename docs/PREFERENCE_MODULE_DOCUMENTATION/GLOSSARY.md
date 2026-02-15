# Glossary

Terminology and concepts used throughout the Preference Submission Module.

## Core Concepts

### Preference Type
The category of real estate transaction a user is interested in:
- **Buy**: Purchase property (residential, commercial, or land)
- **Rent**: Lease property (residential or commercial)
- **Shortlet**: Book short-term accommodation
- **Joint Venture**: Partner for development projects

### Preference Mode
Internal categorization for backend routing:
- **buy**: Buy preference
- **tenant**: Rent preference
- **shortlet**: Shortlet preference
- **developer**: Joint venture preference

### Form Step
A single logical section of the preference form. Users progress through steps sequentially, with validation at each step.

### Validation Error
A message indicating a field doesn't meet requirements (format, required, constraints, etc).

---

## Location Terms

### State
Nigerian state or geographical region. Examples: Lagos, Abuja, Rivers, Kaduna.

### LGA (Local Government Area)
Administrative division within a state. Example: Ikoyi LGA in Lagos State.

### Area
Specific neighborhood or community within an LGA. Example: Ikoyi neighborhood in Ikoyi LGA.

### Custom Location
User-provided text description when specific areas not found in system. Example: "Off Banana Island, Ikoyi"

---

## Budget Terms

### Budget Range
The minimum and maximum amounts user willing to spend. For buy/rent, measured in Naira (NGN). For shortlet, measured per night.

### Minimum Price (Min Budget)
The lowest amount user willing to spend. Must be greater than zero and less than maximum price.

### Maximum Price (Max Budget)
The highest amount user willing to spend. Must be greater than minimum price.

### Budget Threshold
Location and listing-type specific minimum budget requirement. Example: Minimum 5,000,000 NGN for buying in Lagos.

### Budget Consistency
Validation that ensures features selected are available at the budget specified.

---

## Property Terms

### Property Type
Category of property:
- **Residential**: Homes, apartments, flats
- **Commercial**: Offices, shops, complexes
- **Land**: Undeveloped land plots

### Property Subtype
Specific type within category:
- Residential: Self-con, Flat, Mini Flat, Bungalow (for rent)
- Residential: Land, Residential, Commercial (for buy)

### Building Type
Structure classification:
- **Detached**: Standalone house
- **Semi-Detached**: House sharing one wall
- **Block of Flats**: Apartment building

### Property Condition
State of the property:
- **New**: Recently built, unused
- **Renovated**: Updated/refurbished
- **Any**: No preference on condition

### Land Size
Measurement of land area:
- **Plot**: Number of plots (Nigerian measurement)
- **Sqm**: Square meters
- **Hectares**: Larger land measurement

### Measurement Unit
Unit system for expressing land size. Options: Plot, Sqm, Hectares.

---

## Feature Terms

### Feature/Amenity
A specific characteristic or facility available in property. Example: Swimming Pool, WiFi, Security Cameras.

### Basic Feature
Essential or common amenities available in most properties. No budget minimum. Examples: WiFi, Kitchen, Security.

### Premium Feature
High-end or luxury amenities. May have minimum budget requirement. Examples: Swimming Pool, Gym House, In-house Cinema.

### Comfort Feature
(Shortlet only) Additional comfort enhancements. Examples: Laundry, Smart TV, Breakfast Included.

### Feature Category
Classification of amenity type: basic, premium, or comfort.

### Feature Availability
Whether a feature is offered given current property type and budget. Premium features filtered by budget.

### Feature Configuration
Static definition of available features for each property type.

### Auto-Adjust Features
Option to automatically remove premium features if user's budget insufficient for minimum requirements.

### Minimum Budget Requirement
Lowest budget needed to access a specific premium feature. Used for filtering feature availability.

---

## Contact Information Terms

### Full Name
User's complete legal name (2-100 characters, letters and spaces only).

### Email Address
User's email contact (standard email format validation).

### Phone Number
User's primary phone (Nigerian format: +234 or 0 prefix, 11 digits with 0 or 13 with +234).

### WhatsApp Number
Optional secondary contact via WhatsApp (same format as phone number).

### Company Name
(Joint Venture only) Official company name (2-200 characters).

### Contact Person
(Joint Venture only) Name of individual representing company (2-100 characters, letters and spaces).

### CAC Registration Number
(Joint Venture optional) Corporate Affairs Commission registration number. Format: RC followed by 6-7 digits.

---

## Joint Venture Terms

### Joint Venture (JV)
Partnership between property owner and developer for development/investment. Three types:

### Equity Split
Both parties contribute capital and share profits proportionally.

### Lease-to-Build
Developer leases land and builds property. Returns portion to owner.

### Development Partner
Developer manages project on behalf of owner.

### Development Details
Specific requirements for JV projects:
- Land size needs
- Timeline expectations
- Expected structure type (mini flats, duplexes, etc)
- Title documentation requirements

### Sharing Ratio
Proportional split of profits/returns. Example: 50-50 means equal split.

### Title Requirements
Documentation needed for property transfer:
- **Deed of Assignment**: Transfer document
- **Certificate of Occupancy (C of O)**: Government ownership certificate
- **Governor's Consent**: State approval
- **Land Allocation Letter**: Government allocation document
- **Government Gazette**: Official publication

### Pending Title
Property with incomplete documentation. May accept subject to conditions.

---

## Shortlet Terms

### Check-In Date
Date guest arrives and takes occupancy.

### Check-Out Date
Date guest departs and returns property. Must be after check-in date.

### Check-In Time
Preferred time to access property (typically afternoon).

### Check-Out Time
Preferred time to vacate property (typically morning).

### Travel Type
Reason for short-term stay:
- **Solo**: Single traveler
- **Couple**: Two people
- **Family**: Family group
- **Group**: Larger group
- **Business**: Work-related travel

### Number of Guests
How many people will stay in property.

### Maximum Guests
Property capacity - how many guests it can accommodate.

### Booking Duration
Length of stay (from check-in to check-out date).

### Per Night Rate
Cost per night for shortlet. Budget entered as daily rate.

---

## Validation Terms

### Field Validation
Checking a single field meets requirements (format, length, required).

### Step Validation
Checking all fields in a form step are valid.

### Form Validation
Checking entire form is valid before submission.

### Conditional Validation
Validation rule depends on another field's value. Example: Bedrooms required only if property is residential.

### Cross-Field Validation
Validation comparing multiple fields. Example: Max price must be > min price.

### Error Message
User-friendly text explaining what's wrong with a field.

### Validation Schema
(Yup) Structured rules for what valid data looks like.

---

## State Management Terms

### Form State
Current state of the entire form including:
- Current step
- Form data entered
- Validation errors
- Configuration data

### Form Data
User's input values across all steps.

### Current Step
Which form step user is currently viewing (0-indexed).

### Validation Errors
Array of fields with errors and messages.

### Context
(React) Mechanism for sharing form state across components without prop drilling.

### Provider
(React) Component that makes context available to child components.

### Hook (usePreferenceForm)
React hook for accessing preference form context and actions.

### Action
(Redux-style) Instruction to modify state. Example: SET_STEP, UPDATE_FORM_DATA.

### Reducer
Function that takes current state and action, returns new state.

### Dispatch
Function that sends action to reducer.

---

## Data Transformation Terms

### Form Data
User-facing structure with human-readable field names.

### API Payload
Backend-facing structure with technical field names and format transformations.

### Transformation
Converting form data to API payload format.

### Serialization
Converting complex objects to JSON for transmission.

### Deserialization
Converting JSON back to objects.

---

## UI/UX Terms

### Step Indicator
Visual progress showing current position in form.

### Form Progress
How far through the form user has progressed.

### Navigation
Moving between form steps (next, previous, skip).

### Form Submission
Sending completed form to backend API.

### Success State
Form successfully submitted.

### Error State
Validation errors preventing progression or submission.

### Loading State
Form is submitting (button disabled, spinner shown).

---

## API Terms

### Endpoint
URL path for API request. Example: `/api/preferences`

### Request
Data sent to API (includes method, headers, body).

### Response
Data returned from API (includes status, headers, body).

### Status Code
HTTP code indicating success/failure:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 500: Server error

### Payload
Data sent in request body.

### Request Method
HTTP method (POST for preference submission).

---

## Database Terms

### Record
Single saved preference in database.

### Schema
Table structure defining available columns and types.

### Preference ID
Unique identifier for saved preference.

### Timestamp
Date/time record was created or updated.

### Submitted At
When preference was submitted to backend.

---

## Performance Terms

### Memoization
Caching function results to prevent unnecessary recalculation.

### Debouncing
Delaying action execution until user stops triggering it.

### Optimization
Improving speed and efficiency.

### Rendering
Converting component code to visible UI.

### Re-render
Re-executing component when state/props change.

---

## Security Terms

### Input Validation
Checking user input meets format and business rules before processing.

### Sanitization
Removing potentially harmful characters from input.

### Type Safety
Using TypeScript to catch type errors at compile time.

### Regex (Regular Expression)
Pattern matching for format validation (phone, email, etc).

---

## Error Types

### Validation Error
User input doesn't meet format/constraint requirements.

### Business Logic Error
User input violates business rules (e.g., budget below threshold).

### API Error
Backend rejection or network failure.

### Network Error
Connection failure to backend.

### Type Error
TypeScript compilation error due to type mismatch.

---

## Preference-Specific Terms

### Buy Preference
User wants to purchase property.

### Rent Preference
User wants to lease property.

### Shortlet Preference
User wants to book short-term accommodation.

### Joint Venture Preference
Developer/investor wants partnership opportunity.

### Preference Submission
Completed form submission to backend.

### Preference Record
Saved preference in database.

---

## Common Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| LGA | Local Government Area |
| NGN | Nigerian Naira (currency) |
| C of O | Certificate of Occupancy |
| JV | Joint Venture |
| CCTV | Closed-Circuit Television |
| API | Application Programming Interface |
| UI | User Interface |
| UX | User Experience |
| SMS | Short Message Service |
| CAC | Corporate Affairs Commission |
| RC | Registration Certificate |
| UUID | Universally Unique Identifier |
| JSON | JavaScript Object Notation |

---

## Format Specifications

### Phone Number Format
- **Input**: +234701234567 or 07012345678
- **Pattern**: ^(\+234|0)[789][01]\d{8}$
- **Length**: 11 digits (with 0) or 13 (with +234)

### Email Format
- **Input**: user@example.com
- **Pattern**: Standard email validation
- **Length**: Max 255 characters

### Currency Format
- **Input**: 100000000 (NGN)
- **Display**: 100,000,000 (with comma separators)
- **Decimal**: Not used for property prices

### Date Format
- **Input**: YYYY-MM-DD (2024-03-01)
- **Display**: Localized (01/03/2024 in Nigeria)

### Time Format
- **Input**: HH:MM (14:00)
- **Display**: 2:00 PM or 14:00

---

For additional context, refer to specific documentation sections:
- [FORM_FIELDS.md](./FORM_FIELDS.md) - Field definitions
- [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) - Data types
- [VALIDATION_RULES.md](./VALIDATION_RULES.md) - Rules and constraints
