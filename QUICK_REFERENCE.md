# Quick Reference Guide

## Preference Submission Form - At a Glance

### Preference Types & Steps

```
┌─────────────────────────────────────────────────────────────┐
│ PREFERENCE TYPES & THEIR STEPS                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ BUY PROPERTY                                                │
│ ├─ Step 0: Location & Area Selection                        │
│ ├─ Step 1: Property Details & Budget                        │
│ ├─ Step 2: Features & Amenities                             │
│ └─ Step 3: Contact Information                              │
│                                                              │
│ RENT PROPERTY                                               │
│ ├─ Step 0: Location & Area Selection                        │
│ ├─ Step 1: Property Details & Budget                        │
│ ├─ Step 2: Features & Amenities                             │
│ └─ Step 3: Contact Information                              │
│                                                              │
│ SHORTLET BOOKING                                            │
│ ├─ Step 0: Location & Area Selection                        │
│ ├─ Step 1: Property Details & Budget                        │
│ ├─ Step 2: Features & Amenities                             │
│ └─ Step 3: Contact Information                              │
│                                                              │
│ JOINT VENTURE                                               │
│ ├─ Step 0: Developer Information                            │
│ ├─ Step 1: Development Type Selection                       │
│ ├─ Step 2: Land Requirements                                │
│ ├─ Step 3: JV Terms & Proposal                              │
│ └─ Step 4: Title & Documentation                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Validation Summary

```
LOCATION STEP
├─ State: Required ✓
├─ LGAs: Min 1, Max 3 ✓
├─ Areas: Max 3 per LGA ✓
└─ Must have areas OR custom location ✓

PROPERTY DETAILS STEP
├─ Property Type: Required ✓
├─ Land Size: Required (varies by unit) ✓
├─ Building Type: Required (if not land) ✓
├─ Property Condition: Required (if not land) ✓
├─ Bedrooms: Required (if residential) ✓
└─ Document Types: Required (at least 1) ✓

BUDGET STEP
├─ Min Price: > 0 ✓
├─ Max Price: > Min Price ✓
└─ Min Price: >= Location Threshold ✓

CONTACT STEP
├─ Full Name: 2-100 chars, letters only ✓
├─ Email: Valid format ✓
├─ Phone: Valid Nigerian format ✓
└─ Additional Notes: Max 1000 chars ✓
```

### Feature Categories

```
RESIDENTIAL (Buy/Rent)          COMMERCIAL (Buy/Rent)
├─ Basic:                       ├─ Basic:
│  ├─ Security Cameras          │  ├─ Power Supply
│  ├─ WiFi                      │  ├─ Water Supply
│  ├─ Air Conditioner           │  ├─ Air Conditioning
│  ├─ Garage                    │  ├─ Parking Space
│  └─ ... 14 more               │  └─ ... 4 more
│                               │
└─ Premium:                     └─ Premium:
   ├─ Swimming Pool                ├─ CCTV System
   ├─ Gym House                    ├─ Conference Room
   ├─ Elevator                     ├─ Fiber Internet
   └─ ... 8 more                   └─ ... 6 more

SHORTLET
├─ Basic:
│  ├─ WiFi
│  ├─ Air Conditioning
│  ├─ Kitchen
│  └─ ... 5 more
├─ Comfort:
│  ├─ Smart TV
│  ├─ Laundry
│  └─ ... 6 more
└─ Premium:
   ├─ Swimming Pool
   ├─ Gym Access
   └─ ... 8 more
```

### Budget Thresholds by Location

```
LOCATION        BUY         RENT        JV              SHORTLET
─────────────────────────────────────────────────────────────
Lagos           ₦5M         ₦200K       ₦10M            ₦15K
Abuja           ₦8M         ₦300K       ₦15M            ₦25K
Default         ₦2M         ₦100K       ₦5M             ₦10K

M = Million, K = Thousand
```

---

## Single Property View - At a Glance

### Page URL Structure

```
/property/[marketType]/[propertyID]

marketType values:
├─ "buy"           → Property for sale
├─ "rent"          → Property for rent
├─ "shortlet"      → Short-term accommodation
└─ "joint-venture" → JV partnership property
```

### Property Information Display

```
┌──────────────────────────────────────┐
│ PROPERTY HEADER                      │
├──────────────────────────────────────┤
│ Property Type | Location             │
│ Status Badge  | Premium Badge        │
│              Price                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ IMAGE GALLERY                        │
├──────────────────────────────────────┤
│ Main Image (with < > navigation)     │
│ Video Thumbnails with Play buttons   │
│                                      │
│ Thumbnail Strip:                     │
│ [img][img][img][img][img][img]      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ KEY FEATURES (Grid)                  │
├──────────────────────────────────────┤
│ Beds: 4   │ Baths: 3                │
│ Toilets: 2│ Parking: 2              │
│ Land Size │ Condition: New          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ AMENITIES & FEATURES (List)          │
├──────────────────────────────────────┤
│ • Swimming Pool                      │
│ • Security Cameras                   │
│ • WiFi                               │
│ • Generator Backup                   │
│ ... more features                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ DOCUMENTS & VERIFICATION             │
├──────────────────────────────────────┤
│ ✓ Certificate of Occupancy           │
│ ✓ Deed of Assignment                 │
│ ✗ Consent Letter                     │
│ ✓ Land Survey Plan                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ LOCATION MAP                         │
├──────────────────────────────────────┤
│ [Interactive Map with marker]        │
│ Address: 123 Main Street, Lagos      │
│ Get Directions →                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ OWNER/AGENT CONTACT CARD             │
├──────────────────────────────────────┤
│ Name: John Doe                       │
│ Phone: +234 801 234 5678             │
│ Email: john@example.com              │
│ ✓ Verified Agent                     │
│                                      │
│ [Message] [Call] [Actions]           │
└──────────────────────────────────────┘
```

### Action Buttons by Market Type

```
BUY PROPERTY
├─ 💚 Save (Like)
├─ 💬 Negotiate Price → Opens modal
├─ 📞 Contact
└─ 📧 Message

RENT PROPERTY
├─ 💚 Save
├─ 📞 Contact Agent
├─ 📧 Message
└─ 📅 Schedule Viewing

SHORTLET
├─ 💚 Save
├─ 📅 Book Now → Opens calendar modal
├─ 📞 Contact
└─ 📧 Message

JOINT VENTURE
├─ 💚 Save
├─ 📄 Upload LOI → Opens LOI modal
├─ 📞 Contact Developer
└─ 📧 Message
```

### Modals & Overlays

```
PRICE NEGOTIATION MODAL (Buy)
├─ Current Price: ₦50,000,000
├─ Proposed Price: [input]
├─ Price Reduction: Calculated
├─ Message: [textarea]
├─ Contact Method: [select]
└─ [Submit Negotiation]

SHORTLET BOOKING MODAL
├─ Check-in Date: [calendar]
├─ Check-out Date: [calendar]
├─ Number of Guests: [slider 1-max]
├─ Total Nights: Calculated
├─ Total Price: Calculated
├─ Special Requests: [textarea]
├─ Contact Method: [select]
└─ [Complete Booking]

LOI UPLOAD MODAL (JV)
├─ Document Type: [select]
├─ Document File: [upload]
├─ Cover Letter: [textarea]
├─ Proposed Terms: [form]
├─ Additional Attachments: [upload multiple]
└─ [Submit LOI]
```

---

## Data Structure Quick Reference

### Preference Form Data

```typescript
FlexibleFormData {
  // Common
  location: {
    state: "Lagos",
    lgas: ["Lekki", "Ikoyi"],
    areas: ["VI", "Ikoyi Island"],
    customLocation?: "My custom area"
  },
  
  budget: {
    minPrice: 50000000,
    maxPrice: 100000000,
    currency: "NGN"
  },
  
  features: {
    basicFeatures: ["Security", "WiFi"],
    premiumFeatures: ["Swimming Pool"],
    autoAdjustToBudget: false
  },
  
  contactInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "+234801234567"
  },
  
  // Buy/Rent specific
  propertyDetails: {
    propertySubtype: "residential",
    buildingType: "Detached",
    bedrooms: 4,
    bathrooms: 3,
    propertyCondition: "New",
    documentTypes: ["C of O"],
    measurementUnit: "sqm",
    minLandSize: 500,
    maxLandSize: 1000
  },
  
  // JV specific
  developmentDetails: {
    developmentTypes: ["Residential"],
    minLandSize: "10",
    measurementUnit: "hectares",
    preferredSharingRatio: "60:40",
    minimumTitleRequirements: ["C of O"]
  },
  
  // Shortlet specific
  bookingDetails: {
    checkInDate: "2024-03-15",
    checkOutDate: "2024-03-20",
    maxGuests: 4,
    travelType: "family"
  }
}
```

### Property Details Data

```typescript
PropertyDetails {
  _id: "507f...",
  propertyId: "PROP-2024-001",
  
  // Location
  location: {
    state: "Lagos",
    localGovernment: "Lekki",
    area: "Victoria Island",
    streetAddress?: "123 Main St"
  },
  
  // Basic info
  propertyType: "Residential",
  propertyCategory: "buy",
  price: 50000000,
  propertyCondition: "New",
  
  // Features
  bedRoom: 4,
  additionalFeatures: {
    noOfBedrooms: 4,
    noOfBathrooms: 3,
    noOfToilets: 2,
    noOfCarParks: 2,
    additionalFeatures: ["Pool", "Gym"]
  },
  
  // Media
  pictures: ["url1.jpg", "url2.jpg"],
  videos: ["video1.mp4"],
  
  // Documents
  docOnProperty: [
    { docName: "C of O", isProvided: true }
  ],
  
  // Status
  isAvailable: true,
  isApproved: true,
  isPremium: true,
  owner: "User123"
}
```

---

## API Endpoints Reference

### Preference Endpoints

```
POST /api/preferences
├─ Request: PreferencePayload
├─ Response: { success, preferenceId, message }
└─ Status: Preference saved

GET /api/preferences/:id
├─ Request: preference ID
├─ Response: PreferenceDetails
└─ Usage: Fetch existing preference

PUT /api/preferences/:id
├─ Request: Updated PreferencePayload
├─ Response: { success, message }
└─ Usage: Update preference

DELETE /api/preferences/:id
├─ Request: preference ID
├─ Response: { success, message }
└─ Usage: Delete preference
```

### Property Endpoints

```
GET /api/property/:marketType/:id
├─ Response: PropertyDetails
└─ Status: Property loaded

POST /api/property/:id/view
├─ Usage: Track property view
└─ Status: View recorded

POST /api/property/:id/like
├─ Response: { liked: true, totalLikes: number }
└─ Usage: Save property

DELETE /api/property/:id/like
├─ Response: { liked: false, totalLikes: number }
└─ Usage: Unsave property

POST /api/negotiation/create
├─ Payload: { propertyId, proposedPrice, message }
├─ Response: { success, negotiationId }
└─ Usage: Start price negotiation

POST /api/booking/shortlet/create
├─ Payload: { propertyId, checkIn, checkOut, guests }
├─ Response: { success, bookingId }
└─ Usage: Create shortlet booking

POST /api/loi/upload
├─ Payload: FormData with document
├─ Response: { success, loiId }
└─ Usage: Upload Letter of Intent
```

---

## Context Hooks Reference

### usePreferenceForm Hook

```typescript
const {
  // State
  state: PreferenceFormState,
  
  // Navigation
  goToStep(step: number),
  goToNextStep(),
  goToPreviousStep(),
  
  // Data Management
  updateFormData(data: Partial<FlexibleFormData>),
  resetForm(),
  
  // Validation
  validateStep(step: number): ValidationError[],
  isStepValid(step: number): boolean,
  canProceedToNextStep(): boolean,
  isFormValid(): boolean,
  triggerValidation(step?: number),
  getValidationErrorsForField(field: string): ValidationError[],
  
  // Utilities
  getMinBudgetForLocation(location: string, type: string): number,
  getAvailableFeatures(type: string, budget?: number): FeatureConfig,
  
  // Dispatch
  dispatch: React.Dispatch<PreferenceFormAction>
} = usePreferenceForm()
```

---

## File Organization

### Preference System

```
src/
├── app/preference/
│   ├── page.tsx                          # Main page
│   └── layout.tsx
├── components/preference-form/
│   ├── OptimizedLocationSelection.tsx    # Step 0
│   ├── OptimizedBudgetSelection.tsx      # Step 1
│   ├── FeatureSelection.tsx              # Step 2
│   ├── PropertyDetails.tsx               # Step 1
│   ├── OptimizedContactInformation.tsx   # Step 3
│   ├── DateSelection.tsx                 # Shortlet specific
│   ├── SubmitButton.tsx
│   ├── OptimizedStepWrapper.tsx
│   ├── PreferenceTypeSelector.tsx
│   └── joint-venture/
│       └── JointVenturePreferenceForm.tsx
├── context/
│   └── preference-form-context.tsx       # State management
├── data/
│   └── preference-configs.ts             # Features & budget
├── types/
│   └── preference-form.ts                # TypeScript types
└── utils/validation/
    └── preference-validation.ts          # Yup schemas
```

### Property System

```
src/
├── app/property/
│   └── [marketType]/
│       └── [ID]/
│           └── page.tsx                  # Main page
├── components/
│   ├── property/
│   │   └── PropertyLocationMap.tsx
│   ├── modals/
│   │   ├── GlobalPriceNegotiationModal.tsx
│   │   └── AdvancedPriceNegotiationModal.tsx
│   ├── shortlet/
│   │   └── ShortletBookingModal.tsx
│   └── new-marketplace/modals/
│       └── LOIUploadModal.tsx
├── types/
│   └── property.types.ts                 # TypeScript types
└── context/
    ├── selected-briefs-context.tsx
    └── global-property-actions-context.tsx
```

---

## Common Code Snippets

### Using Preference Form

```tsx
const { updateFormData, goToNextStep, validateStep } = usePreferenceForm();

// Update location
updateFormData({
  location: { state: "Lagos", lgas: ["Lekki"] }
});

// Validate and proceed
const errors = validateStep(0);
if (errors.length === 0) {
  goToNextStep();
}
```

### Fetching Property

```tsx
const [property, setProperty] = useState(null);

useEffect(() => {
  const fetch = async () => {
    const response = await api.get(`/api/property/${marketType}/${id}`);
    setProperty(response.data);
  };
  fetch();
}, [marketType, id]);
```

### Submitting Preference

```tsx
const handleSubmit = async () => {
  if (!isFormValid()) {
    toast.error("Please fill all fields");
    return;
  }
  
  const payload = generatePayload();
  const response = await POST_REQUEST(URLS.POST_PREFERENCE, payload);
  
  if (response.success) {
    toast.success("Preference submitted!");
    resetForm();
  }
};
```

---

## Troubleshooting Quick Reference

```
Issue: Form won't advance
→ Check: validateStep() returns errors
→ Fix: Correct validation errors shown

Issue: Images not loading
→ Check: Image URLs are valid
→ Fix: Verify CORS settings, check image server

Issue: Budget validation failing
→ Check: Compare with DEFAULT_BUDGET_THRESHOLDS
→ Fix: Update thresholds for your location

Issue: Modal not opening
→ Check: State management for modal visibility
→ Fix: Verify onClick handlers are wired correctly

Issue: API submission fails
→ Check: Verify endpoint URL in URLS config
→ Fix: Check payload matches backend schema

Issue: Context not available
→ Check: Component is wrapped with Provider
→ Fix: Wrap parent with PreferenceFormProvider
```

---

## Integration Checklist

- [ ] Copy all type definition files
- [ ] Copy context files
- [ ] Copy component files
- [ ] Install all dependencies
- [ ] Update API endpoint URLs
- [ ] Configure budget thresholds
- [ ] Customize feature lists
- [ ] Test all 4 preference types
- [ ] Test property view with sample data
- [ ] Verify validation works
- [ ] Check responsive design
- [ ] Test all modals/interactions
- [ ] Set up error handling
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## Documentation Map

| Feature | Full Doc | Quick Ref |
|---------|----------|-----------|
| Preference Form | PREFERENCE_SUBMISSION_DOCUMENTATION.md | This file |
| Property View | PROPERTY_VIEW_DOCUMENTATION.md | This file |
| Integration | INTEGRATION_SUMMARY.md | INTEGRATION_SUMMARY.md |
| Code Examples | Each main documentation | This file |

---

