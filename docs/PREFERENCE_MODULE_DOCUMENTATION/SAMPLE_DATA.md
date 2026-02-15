# Sample Data

Complete test data for all preference types. Use these samples to test form submission and integration.

## Buy Preference - Residential

### Minimal Valid Data
```json
{
  "preferenceType": "buy",
  "location": {
    "state": "Lagos",
    "lgas": ["Ikoyi"],
    "areas": ["Ikoyi"]
  },
  "budget": {
    "minPrice": 100000000,
    "maxPrice": 500000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
  },
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
    "documentTypes": ["Deed of Assignment"]
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+2347012345678"
  }
}
```

### Complete Data with Features & Notes
```json
{
  "preferenceType": "buy",
  "location": {
    "state": "Lagos",
    "lgas": ["Ikoyi", "Victoria Island"],
    "areas": ["Ikoyi", "VI"]
  },
  "budget": {
    "minPrice": 150000000,
    "maxPrice": 800000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [
      "Swimming Pool",
      "Security Cameras",
      "Home Office",
      "Garage"
    ],
    "premiumFeatures": [
      "In-house Cinema",
      "Gym House"
    ],
    "autoAdjustToBudget": true
  },
  "propertyDetails": {
    "propertySubtype": "residential",
    "buildingType": "Detached",
    "bedrooms": "More",
    "bathrooms": 4,
    "propertyCondition": "New",
    "purpose": "For living",
    "measurementUnit": "sqm",
    "minLandSize": 1000,
    "maxLandSize": 5000,
    "documentTypes": ["Deed of Assignment", "Certificate of Occupancy"]
  },
  "contactInfo": {
    "fullName": "John Doe Test",
    "email": "johntest@example.com",
    "phoneNumber": "+2347012345678",
    "whatsappNumber": "+2348012345678"
  },
  "nearbyLandmark": "Close to Lekki Conservation Centre",
  "additionalNotes": "Prefer properties with high ceilings and modern finishes. Willing to consider properties requiring minor renovations."
}
```

---

## Buy Preference - Commercial

### Commercial Property Data
```json
{
  "preferenceType": "buy",
  "location": {
    "state": "Lagos",
    "lgas": ["Ikoyi"],
    "areas": ["Ikoyi"]
  },
  "budget": {
    "minPrice": 500000000,
    "maxPrice": 2000000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [
      "Power Supply",
      "Water Supply",
      "Elevator",
      "Parking Space"
    ],
    "premiumFeatures": [
      "CCTV Monitoring System",
      "Conference Room",
      "Fiber Optic Internet"
    ],
    "autoAdjustToBudget": false
  },
  "propertyDetails": {
    "propertySubtype": "commercial",
    "buildingType": "Block of Flats",
    "bathrooms": 5,
    "propertyCondition": "New",
    "measurementUnit": "sqm",
    "minLandSize": 2000,
    "maxLandSize": 10000,
    "documentTypes": ["Deed of Assignment", "Governor's Consent"]
  },
  "contactInfo": {
    "fullName": "Jane Smith",
    "email": "jane@company.com",
    "phoneNumber": "+2348012345678"
  },
  "additionalNotes": "Looking for office spaces with good layout and modern facilities."
}
```

---

## Buy Preference - Land

### Land Purchase Data
```json
{
  "preferenceType": "buy",
  "location": {
    "state": "Abuja",
    "lgas": ["Garki"],
    "areas": ["Garki I"]
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 200000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
  },
  "propertyDetails": {
    "propertySubtype": "land",
    "measurementUnit": "sqm",
    "minLandSize": 500,
    "maxLandSize": 2000,
    "documentTypes": ["Land Allocation Letter", "Governor's Consent"],
    "landConditions": ["Clear/Accessible"]
  },
  "contactInfo": {
    "fullName": "Robert Brown",
    "email": "rbrown@example.com",
    "phoneNumber": "+2349012345678"
  },
  "nearbyLandmark": "Near Garki Shopping Complex"
}
```

---

## Rent Preference - Residential

### Minimal Rental Data
```json
{
  "preferenceType": "rent",
  "location": {
    "state": "Abuja",
    "lgas": ["Garki"],
    "areas": ["Garki I"]
  },
  "budget": {
    "minPrice": 5000000,
    "maxPrice": 15000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": ["Security", "Air Conditioner"],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
  },
  "propertyDetails": {
    "propertySubtype": "Flat",
    "buildingType": "Block of Flats",
    "bedrooms": 3,
    "bathrooms": 2,
    "leaseTerm": "1 Year",
    "propertyCondition": "New",
    "purpose": "Residential"
  },
  "contactInfo": {
    "fullName": "Jane Smith",
    "email": "janesmith@example.com",
    "phoneNumber": "+2348012345678"
  }
}
```

### Complete Rental Data
```json
{
  "preferenceType": "rent",
  "location": {
    "state": "Lagos",
    "lgas": ["Lekki", "Ikoyi"],
    "areas": ["Lekki Phase 1", "Ikoyi"]
  },
  "budget": {
    "minPrice": 3000000,
    "maxPrice": 10000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [
      "WiFi",
      "Security Cameras",
      "Air Conditioner",
      "Parking Space"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Gym House"
    ],
    "autoAdjustToBudget": true
  },
  "propertyDetails": {
    "propertySubtype": "Mini Flat",
    "buildingType": "Semi-Detached",
    "bedrooms": 2,
    "bathrooms": 1,
    "leaseTerm": "1 Year",
    "propertyCondition": "Renovated",
    "purpose": "Residential"
  },
  "contactInfo": {
    "fullName": "Grace Johnson",
    "email": "grace@example.com",
    "phoneNumber": "+2347089123456",
    "whatsappNumber": "+2347089123456"
  },
  "additionalNotes": "Looking for cozy apartments with good ventilation and security."
}
```

---

## Shortlet Preference

### Business Traveler
```json
{
  "preferenceType": "shortlet",
  "location": {
    "state": "Lagos",
    "lgas": ["Victoria Island"],
    "areas": ["VI"]
  },
  "budget": {
    "minPrice": 80000,
    "maxPrice": 250000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": ["WiFi", "Air Conditioning", "Power Supply"],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
  },
  "propertyDetails": {
    "propertyType": "1-Bed Apartment",
    "bedrooms": 1,
    "bathrooms": 1,
    "maxGuests": 2,
    "travelType": "Business"
  },
  "bookingDetails": {
    "checkInDate": "2024-03-01",
    "checkOutDate": "2024-03-15",
    "preferredCheckInTime": "14:00",
    "preferredCheckOutTime": "11:00"
  },
  "contactInfo": {
    "fullName": "Michael Chen",
    "email": "michael@business.com",
    "phoneNumber": "+2347012345678"
  },
  "additionalNotes": "Need workspace for remote work. Fast WiFi essential."
}
```

### Family Vacation
```json
{
  "preferenceType": "shortlet",
  "location": {
    "state": "Lagos",
    "lgas": ["Lekki"],
    "areas": ["Lekki Phase 1"]
  },
  "budget": {
    "minPrice": 150000,
    "maxPrice": 350000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [
      "WiFi",
      "Kitchen",
      "Air Conditioning",
      "Clean Bathroom"
    ],
    "premiumFeatures": [
      "Swimming Pool",
      "Balcony"
    ],
    "autoAdjustToBudget": true
  },
  "propertyDetails": {
    "propertyType": "2-Bed Flat",
    "bedrooms": 2,
    "bathrooms": 2,
    "maxGuests": 5,
    "travelType": "Family"
  },
  "bookingDetails": {
    "checkInDate": "2024-04-01",
    "checkOutDate": "2024-04-14",
    "preferredCheckInTime": "15:00",
    "preferredCheckOutTime": "10:00"
  },
  "contactInfo": {
    "fullName": "Amara Okafor",
    "email": "amara@gmail.com",
    "phoneNumber": "+2347098765432"
  },
  "nearbyLandmark": "Close to Lekki Conservation Centre",
  "additionalNotes": "Family with 2 kids. Need spacious kitchen and child-safe environment."
}
```

---

## Joint Venture Preference

### Developer Partnership
```json
{
  "preferenceType": "joint-venture",
  "location": {
    "state": "Lagos",
    "lgas": ["Ajah", "Lekki"],
    "areas": ["Ajah", "Lekki Phase 2"]
  },
  "budget": {
    "minPrice": 500000000,
    "maxPrice": 5000000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
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
  "partnerExpectations": "Transparent dealings, regular project updates, and professional management team."
}
```

### Land Lease-to-Build
```json
{
  "preferenceType": "joint-venture",
  "location": {
    "state": "Abuja",
    "lgas": ["Garki", "Maitama"],
    "areas": ["Garki I", "Maitama"]
  },
  "budget": {
    "minPrice": 1000000000,
    "maxPrice": 3000000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": [],
    "premiumFeatures": [],
    "autoAdjustToBudget": false
  },
  "contactInfo": {
    "companyName": "BuildRight Construction",
    "contactPerson": "Chioma Obi",
    "email": "chioma@buildright.com.ng",
    "phoneNumber": "+2348012345678",
    "cacRegistrationNumber": "RC654321"
  },
  "developmentDetails": {
    "developmentTypes": ["Commercial Development"],
    "minLandSize": "10000",
    "measurementUnit": "sqm",
    "jvType": "Lease-to-Build",
    "propertyType": "Land",
    "expectedStructureType": "Commercial Complex",
    "timeline": "In 3 Months",
    "preferredSharingRatio": "40-60",
    "proposalDetails": "BuildRight specializes in commercial development. We have a proven track record of successful projects.",
    "minimumTitleRequirements": [
      "Certificate of Occupancy",
      "Registered Deed of Assignment"
    ],
    "willingToConsiderPendingTitle": true
  }
}
```

---

## Custom Location Example

### Buy with Custom Location
```json
{
  "preferenceType": "buy",
  "location": {
    "state": "Lagos",
    "lgas": ["Ikoyi"],
    "areas": [],
    "customLocation": "Off Banana Island, Ikoyi"
  },
  "budget": {
    "minPrice": 200000000,
    "maxPrice": 1000000000,
    "currency": "NGN"
  },
  "features": {
    "basicFeatures": ["WiFi", "Security"],
    "premiumFeatures": ["Sea View", "Swimming Pool"],
    "autoAdjustToBudget": false
  },
  "propertyDetails": {
    "propertySubtype": "residential",
    "buildingType": "Detached",
    "bedrooms": 5,
    "bathrooms": 4,
    "propertyCondition": "New",
    "purpose": "For living",
    "measurementUnit": "sqm",
    "minLandSize": 2000,
    "maxLandSize": 5000,
    "documentTypes": ["Deed of Assignment"]
  },
  "contactInfo": {
    "fullName": "Olusegun Okonkwo",
    "email": "olusegun@example.com",
    "phoneNumber": "+2347089999999"
  }
}
```

---

## Data Validation Checklist

Use these samples to verify:

### Required Fields Present
- [ ] preferenceType
- [ ] location.state
- [ ] location.lgas (min 1)
- [ ] location.areas OR customLocation
- [ ] budget.minPrice
- [ ] budget.maxPrice
- [ ] features
- [ ] contactInfo
- [ ] propertyDetails (for non-JV) or developmentDetails (for JV)

### Budget Validation
- [ ] minPrice > 0
- [ ] maxPrice > minPrice
- [ ] Budget >= location minimum threshold

### Phone Number Format
- [ ] Format: +234 or 0 prefix
- [ ] Valid operator code: 7, 8, or 9 as third digit
- [ ] 11 total digits (with 0 prefix) or 13 (with +234)

### Property Type Consistency
- [ ] Correct fields for preference type
- [ ] No field mismatches across types
- [ ] All conditional requirements met

### Contact Information
- [ ] Name: letters and spaces only
- [ ] Email: valid format
- [ ] Phone: valid Nigerian format
- [ ] CAC (if JV): format RC######

---

## Performance Testing Data

For load testing, generate variations:

```javascript
// Generate 100 test records
const testRecords = Array.from({ length: 100 }, (_, i) => ({
  ...buyResidentialData,
  contactInfo: {
    fullName: `Test User ${i}`,
    email: `test${i}@example.com`,
    phoneNumber: `+234701234567${String(i).padStart(2, '0')}`
  }
}));
```

---

## Database Insertion Format

When storing preferences, use this structure:

```json
{
  "id": "uuid",
  "preferenceType": "buy|rent|shortlet|joint-venture",
  "preferenceMode": "buy|tenant|shortlet|developer",
  "data": { /* full preference object */ },
  "status": "submitted|processed|archived",
  "createdAt": "2024-03-01T10:30:00Z",
  "updatedAt": "2024-03-01T10:30:00Z",
  "submittedAt": "2024-03-01T10:30:00Z"
}
```

---

For more details on field specifications, see [FORM_FIELDS.md](./FORM_FIELDS.md)
