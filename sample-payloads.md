# Sample Payloads for Preference Types

This document contains structured sample payloads for each preference type, showcasing the enhanced location & area mapping and proper data structure.

## Buy Property Preference Payload

```json
{
  "preferenceType": "buy",
  "preferenceMode": "buy",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ikeja", "Victoria Island", "Lekki"],
    "lgasWithAreas": [
      {
        "lgaName": "Ikeja",
        "areas": ["Allen Avenue", "Computer Village", "Alausa"]
      },
      {
        "lgaName": "Victoria Island",
        "areas": ["Oniru", "Tiamiyu Savage", "Akin Adesola"]
      },
      {
        "lgaName": "Lekki",
        "areas": ["Phase 1", "Ajah", "Chevron"]
      }
    ],
    "customLocation": ""
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 100000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "Apartment",
    "buildingType": "High-rise",
    "minBedrooms": "3",
    "minBathrooms": 2,
    "propertyCondition": "New",
    "purpose": "For living",
    "landSize": "",
    "measurementUnit": "",
    "documentTypes": ["Certificate of Occupancy", "Survey Plan"],
    "landConditions": []
  },
  "features": {
    "baseFeatures": ["Security Cameras", "Air Conditioner", "Garage", "WiFi"],
    "premiumFeatures": ["Swimming Pool", "Gym House", "Elevator"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+2348123456789"
  },
  "nearbyLandmark": "Close to Ikeja Mall",
  "additionalNotes": "Prefer a quiet neighborhood with good security"
}
```

## Rent Property Preference Payload

```json
{
  "preferenceType": "rent",
  "preferenceMode": "tenant",
  "location": {
    "state": "Abuja",
    "localGovernmentAreas": ["Abuja Municipal", "Gwagwalada"],
    "lgasWithAreas": [
      {
        "lgaName": "Abuja Municipal",
        "areas": ["Maitama", "Asokoro", "Garki"]
      },
      {
        "lgaName": "Gwagwalada",
        "areas": ["Gwagwalada Central", "Dobi"]
      }
    ],
    "customLocation": ""
  },
  "budget": {
    "minPrice": 500000,
    "maxPrice": 1000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "House",
    "buildingType": "Duplex",
    "minBedrooms": "4",
    "minBathrooms": 3,
    "leaseTerm": "1 Year",
    "propertyCondition": "Good",
    "purpose": "Residential",
    "landSize": "",
    "measurementUnit": "",
    "documentTypes": ["Tenancy Agreement"],
    "landConditions": []
  },
  "features": {
    "baseFeatures": [
      "Air Conditioner",
      "Security Post",
      "Parking",
      "Generator"
    ],
    "premiumFeatures": ["Swimming Pool", "Gym Access"],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+2348987654321"
  },
  "nearbyLandmark": "Near Central Business District",
  "additionalNotes": "Family-friendly environment preferred"
}
```

## Joint Venture Preference Payload

```json
{
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ikoyi", "Eti-Osa"],
    "lgasWithAreas": [
      {
        "lgaName": "Ikoyi",
        "areas": ["Banana Island", "Parkview Estate"]
      },
      {
        "lgaName": "Eti-Osa",
        "areas": ["Lekki Phase 1", "Victoria Garden City", "Osapa London"]
      }
    ],
    "customLocation": ""
  },
  "budget": {
    "minPrice": 200000000,
    "maxPrice": 500000000,
    "currency": "NGN"
  },
  "developmentDetails": {
    "minLandSize": "1000",
    "measurementUnit": "sqm",
    "jvType": "Equity Split",
    "propertyType": "Residential Estate",
    "expectedStructureType": "Mixed Development",
    "timeline": "24 months",
    "budgetRange": "₦200M - ₦500M",
    "documentTypes": [
      "Certificate of Occupancy",
      "Survey Plan",
      "EIA Certificate"
    ],
    "landConditions": ["Dry Land", "Good Access Road"],
    "buildingType": "Mixed-use",
    "propertyCondition": "Undeveloped",
    "minBedrooms": "",
    "minBathrooms": 0,
    "purpose": "Development"
  },
  "contactInfo": {
    "companyName": "ABC Development Ltd",
    "contactPerson": "Michael Johnson",
    "email": "m.johnson@abcdev.com",
    "phoneNumber": "+2348123123123",
    "cacRegistrationNumber": "RC123456"
  },
  "partnerExpectations": "Looking for experienced partners with proven track record in residential development",
  "nearbyLandmark": "Close to Lekki-Ikoyi Link Bridge",
  "additionalNotes": "Priority on sustainable development practices"
}
```

## Shortlet Preference Payload

```json
{
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lagos Island", "Eti-Osa"],
    "lgasWithAreas": [
      {
        "lgaName": "Lagos Island",
        "areas": ["Victoria Island", "Ikoyi"]
      },
      {
        "lgaName": "Eti-Osa",
        "areas": ["Lekki Phase 1", "Ajah", "Chevron"]
      }
    ],
    "customLocation": ""
  },
  "budget": {
    "minPrice": 25000,
    "maxPrice": 50000,
    "currency": "NGN"
  },
  "bookingDetails": {
    "propertyType": "Apartment",
    "buildingType": "Service Apartment",
    "minBedrooms": "2",
    "minBathrooms": 2,
    "numberOfGuests": 4,
    "checkInDate": "2024-03-15",
    "checkOutDate": "2024-03-20",
    "travelType": "Business",
    "preferredCheckInTime": "14:00",
    "preferredCheckOutTime": "11:00",
    "propertyCondition": "Excellent",
    "purpose": "Short-term stay",
    "landSize": "",
    "measurementUnit": "",
    "documentTypes": [],
    "landConditions": []
  },
  "features": {
    "baseFeatures": ["Wi-Fi", "Air Conditioning", "Security", "Clean Bathroom"],
    "premiumFeatures": ["Swimming Pool", "Gym Access", "Sea View"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "Sarah Wilson",
    "email": "sarah.wilson@example.com",
    "phoneNumber": "+2348567890123",
    "petsAllowed": false,
    "smokingAllowed": false,
    "partiesAllowed": false,
    "additionalRequests": "Late check-in accommodation needed",
    "maxBudgetPerNight": 50000,
    "willingToPayExtra": true,
    "cleaningFeeBudget": 5000,
    "securityDepositBudget": 20000,
    "cancellationPolicy": "Flexible"
  },
  "nearbyLandmark": "Near Landmark Beach",
  "additionalNotes": "Business traveler seeking quiet and comfortable accommodation"
}
```

## Key Features of Enhanced Payload Structure

### Location Structure

- **State**: Single state selection
- **Local Government Areas**: Maximum of 3 LGAs
- **LGA-Area Mapping**: Each LGA can have up to 3 specific areas
- **Custom Location**: Optional custom location description

### LGA-Area Mapping Example

```json
"lgasWithAreas": [
  {
    "lgaName": "Ikeja",
    "areas": ["Allen Avenue", "Computer Village", "Alausa"]
  },
  {
    "lgaName": "Victoria Island",
    "areas": ["Oniru", "Tiamiyu Savage"]
  }
]
```

### Budget Structure

- **Min/Max Price**: Range-based pricing
- **Currency**: Always NGN for Nigerian properties

### Features Structure

- **Base Features**: Basic amenities and features
- **Premium Features**: High-end amenities
- **Auto-adjust**: Whether to adjust features based on budget

### Contact Information

- **Regular Properties**: Full name, email, phone
- **Joint Venture**: Company details, CAC registration
- **Shortlet**: Additional guest preferences and policies

## Validation Rules

1. **Maximum Limits**:
   - 3 LGAs per preference
   - 3 areas per LGA
   - Total of 9 areas maximum across all LGAs

2. **Required Fields**:
   - State, at least 1 LGA
   - At least 1 area or custom location
   - Budget range (min < max)
   - Contact information appropriate to preference type

3. **Conditional Requirements**:
   - Joint Venture: Company name and CAC registration
   - Shortlet: Check-in/out dates and guest details
   - Budget minimums vary by location and property type

This enhanced structure provides clear mapping between LGAs and their specific areas, enabling better property matching and search functionality while maintaining backward compatibility with existing systems.
