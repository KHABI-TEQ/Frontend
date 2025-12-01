# Property Creation MongoDB Schema

## Collection: `properties`

Complete MongoDB schema for property creation covering all property types (Sell, Rent, Shortlet, Joint Venture).

---

## Main Document Structure

```json
{
  "_id": ObjectId,
  "briefType": String,
  "propertyType": String,
  "propertyCategory": String,
  "propertyCondition": String,
  "typeOfBuilding": String,
  "rentalType": String,
  "leaseHold": String,
  "holdDuration": String,
  "shortletDuration": String,
  "location": {
    "state": String,
    "localGovernment": String,
    "area": String,
    "streetAddress": String,
    "coordinates": {
      "latitude": Number,
      "longitude": Number
    }
  },
  "landSize": {
    "size": String,
    "measurementType": String
  },
  "price": Number,
  "additionalFeatures": {
    "noOfBedroom": Number,
    "noOfBathroom": Number,
    "noOfToilet": Number,
    "noOfCarPark": Number,
    "maxGuests": Number
  },
  "docOnProperty": [
    {
      "_id": ObjectId,
      "docName": String,
      "docType": String,
      "verified": Boolean,
      "uploadedAt": ISODate
    }
  ],
  "features": [String],
  "tenantCriteria": [String],
  "rentalConditions": [String],
  "employmentType": String,
  "tenantGenderPreference": String,
  "jvConditions": [String],
  "description": String,
  "addtionalInfo": String,
  "pictures": [String],
  "videos": [
    {
      "file": null,
      "preview": String,
      "id": String,
      "url": String,
      "isUploading": Boolean
    }
  ],
  "owner": {
    "_id": ObjectId,
    "fullName": String,
    "email": String,
    "phoneNumber": String,
    "verified": Boolean
  },
  "areYouTheOwner": Boolean,
  "ownershipDocuments": [String],
  "isTenanted": String,
  "availability": {
    "minStay": Number,
    "maxStay": Number,
    "calendar": String
  },
  "pricing": {
    "nightly": Number,
    "weeklyDiscount": Number,
    "monthlyDiscount": Number,
    "cleaningFee": Number,
    "securityDeposit": Number,
    "cancellationPolicy": String
  },
  "houseRules": {
    "checkIn": String,
    "checkOut": String,
    "smoking": Boolean,
    "pets": Boolean,
    "parties": Boolean,
    "otherRules": String
  },
  "status": String,
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "views": Number,
  "likes": Number,
  "isPremium": Boolean,
  "verificationStatus": String
}
```

---

## Field Definitions

### Core Identification
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Unique identifier |
| `briefType` | String | Yes | Type of property: "Outright Sales", "Rent", "Shortlet", "Joint Venture" |
| `propertyType` | String | Yes | Property classification |
| `propertyCategory` | String | Yes | Category: "Residential", "Commercial", "Land", "Mixed Development" |

### Property Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `propertyCondition` | String | Conditional | Condition of property: "New", "Renovated", "Original" |
| `typeOfBuilding` | String | Conditional | Building type for residential/commercial |
| `rentalType` | String | For Rent | "Rent" or "Lease" |
| `leaseHold` | String | For Rent | Lease type indicator |
| `holdDuration` | String | For Rent | Duration of lease hold |
| `shortletDuration` | String | For Shortlet | Duration preference for shortlet |

### Location Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location.state` | String | Yes | State name |
| `location.localGovernment` | String | Yes | Local government area |
| `location.area` | String | Yes | Specific area/neighborhood |
| `location.streetAddress` | String | For Shortlet | Street address |
| `location.coordinates.latitude` | Number | Optional | Latitude coordinate |
| `location.coordinates.longitude` | Number | Optional | Longitude coordinate |

### Land & Size Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `landSize.size` | String | For Land | Size of the land |
| `landSize.measurementType` | String | For Land | Unit of measurement (sqm, sqft, hectares, plots) |

### Pricing
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `price` | Number | Yes | Base property price |

### Additional Features
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `additionalFeatures.noOfBedroom` | Number | For Residential | Number of bedrooms |
| `additionalFeatures.noOfBathroom` | Number | For Residential | Number of bathrooms |
| `additionalFeatures.noOfToilet` | Number | For Residential | Number of toilets |
| `additionalFeatures.noOfCarPark` | Number | Optional | Number of parking spaces |
| `additionalFeatures.maxGuests` | Number | For Shortlet | Maximum number of guests |

### Documents
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `docOnProperty[].docName` | String | Optional | Document name |
| `docOnProperty[].docType` | String | Optional | Type of document (e.g., "Certificate of Occupancy", "Deed") |
| `docOnProperty[].verified` | Boolean | Optional | Verification status |
| `docOnProperty[].uploadedAt` | ISODate | Optional | Upload timestamp |

### Features & Amenities
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `features` | Array[String] | Optional | List of features/amenities |

### Rental-Specific Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantCriteria` | Array[String] | For Rent | Criteria for tenants |
| `rentalConditions` | Array[String] | For Rent | Rental conditions |
| `employmentType` | String | For Rent | Preferred employment type |
| `tenantGenderPreference` | String | For Rent | Gender preference for tenants |

### Joint Venture Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jvConditions` | Array[String] | For JV | Joint venture conditions |

### Media
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pictures` | Array[String] | Yes (Min 1) | Array of image URLs |
| `videos[].url` | String | Optional | Video URL |
| `videos[].id` | String | Optional | Video identifier |
| `videos[].preview` | String | Optional | Video preview/thumbnail |
| `videos[].isUploading` | Boolean | Optional | Upload status indicator |

### Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | String | Yes | Main property description |
| `addtionalInfo` | String | Optional | Additional information |

### Owner Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner.fullName` | String | Yes | Owner's full name |
| `owner.email` | String | Yes | Owner's email address |
| `owner.phoneNumber` | String | Yes | Owner's phone number |
| `owner.verified` | Boolean | Yes | Verification status |
| `areYouTheOwner` | Boolean | Yes | Ownership declaration |
| `ownershipDocuments` | Array[String] | For Direct Owner | Ownership proof documents |

### Shortlet-Specific Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `availability.minStay` | Number | For Shortlet | Minimum stay duration (nights) |
| `availability.maxStay` | Number | Optional | Maximum stay duration (nights) |
| `availability.calendar` | String | Optional | Calendar reference |
| `pricing.nightly` | Number | For Shortlet | Nightly rate |
| `pricing.weeklyDiscount` | Number | Optional | Weekly discount percentage |
| `pricing.monthlyDiscount` | Number | Optional | Monthly discount percentage |
| `pricing.cleaningFee` | Number | Optional | Cleaning fee amount |
| `pricing.securityDeposit` | Number | Optional | Security deposit amount |
| `pricing.cancellationPolicy` | String | Optional | Cancellation policy type |
| `houseRules.checkIn` | String | For Shortlet | Check-in time |
| `houseRules.checkOut` | String | For Shortlet | Check-out time |
| `houseRules.smoking` | Boolean | For Shortlet | Smoking allowed flag |
| `houseRules.pets` | Boolean | For Shortlet | Pets allowed flag |
| `houseRules.parties` | Boolean | For Shortlet | Parties allowed flag |
| `houseRules.otherRules` | String | Optional | Additional house rules |

### Tenant Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isTenanted` | String | Optional | Tenancy status |

### Metadata
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Property status: "active", "inactive", "sold", "rented", "under-review", "suspended" |
| `createdAt` | ISODate | Yes | Creation timestamp |
| `updatedAt` | ISODate | Yes | Last update timestamp |
| `views` | Number | Yes | Number of views (default: 0) |
| `likes` | Number | Yes | Number of likes (default: 0) |
| `isPremium` | Boolean | Yes | Premium listing flag (default: false) |
| `verificationStatus` | String | Yes | Verification status: "pending", "verified", "rejected" |

---

## Property Type Specific Schemas

### 1. Outright Sales (Sell)

**Required Fields:**
- briefType: "Outright Sales"
- propertyType
- propertyCategory (Residential, Commercial, Land)
- propertyCondition
- location (full details)
- price
- additionalFeatures (if applicable)
- pictures (minimum 1)
- description
- owner information
- areYouTheOwner: true
- ownershipDocuments

**Optional Fields:**
- docOnProperty
- features
- videos

---

### 2. Rent

**Required Fields:**
- briefType: "Rent"
- propertyType
- propertyCategory
- propertyCondition
- rentalType ("Rent" or "Lease")
- location (full details)
- price
- additionalFeatures
- pictures (minimum 1)
- description
- owner information
- tenantCriteria

**Optional Fields:**
- tenantGenderPreference
- rentalConditions
- employmentType
- docOnProperty
- features
- leaseHold
- holdDuration

---

### 3. Shortlet

**Required Fields:**
- briefType: "Shortlet"
- propertyType
- propertyCategory
- propertyCondition
- location (including streetAddress)
- additionalFeatures (maxGuests required)
- pictures (minimum 1)
- description
- owner information
- availability (minStay required)
- pricing (nightly rate required)
- houseRules (checkIn, checkOut required)

**Optional Fields:**
- videos
- features
- availability.maxStay
- availability.calendar
- pricing (weeklyDiscount, monthlyDiscount, cleaningFee, securityDeposit)
- houseRules (smoking, pets, parties, otherRules)

---

### 4. Joint Venture (JV)

**Required Fields:**
- briefType: "Joint Venture"
- propertyType
- propertyCategory (typically Land or Commercial)
- location (full details)
- landSize (for land properties)
- pictures (minimum 1)
- description
- owner information
- jvConditions

**Optional Fields:**
- propertyCondition
- typeOfBuilding
- docOnProperty
- features
- additionalFeatures

---

## Validation Rules

### Price Validation
- Must be a positive number
- Minimum value depends on property type and location
- Currency: NGN (Nigerian Naira)

### Location Validation
- State: Must exist in predefined list of Nigerian states
- Local Government: Must be valid for the selected state
- Area: Must be provided

### Media Validation
- Minimum 1 image required
- Maximum file sizes:
  - Images: 5MB each
  - Videos: 50MB each
- Supported formats:
  - Images: JPG, PNG, WebP
  - Videos: MP4, WebM

### Document Validation
- Must be uploadable files
- Types: PDF, DOCX, XLSX, JPG, PNG
- Maximum 10 documents per property

### Bedroom/Bathroom Validation
- Must be non-negative integers
- Maximum: 20 (reasonable limit)

### Shortlet Specific Validation
- checkInTime: Valid time format (HH:MM)
- checkOutTime: Valid time format (HH:MM)
- minStay: Minimum 1 night
- maxStay: Must be greater than minStay (if specified)
- nightly price: Must be positive
- Discount percentages: 0-100

---

## Indexes

```javascript
// Create indexes for better query performance
db.properties.createIndex({ "createdAt": -1 })
db.properties.createIndex({ "status": 1 })
db.properties.createIndex({ "briefType": 1 })
db.properties.createIndex({ "location.state": 1, "location.localGovernment": 1 })
db.properties.createIndex({ "owner._id": 1 })
db.properties.createIndex({ "price": 1 })
db.properties.createIndex({ "propertyCategory": 1 })
db.properties.createIndex({ "isPremium": 1, "createdAt": -1 })
db.properties.createIndex({ "views": -1 })
```

---

## Sample Documents

### Sample Sell Property
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "briefType": "Outright Sales",
  "propertyType": "Detached Bungalow",
  "propertyCategory": "Residential",
  "propertyCondition": "New",
  "typeOfBuilding": "Detached",
  "location": {
    "state": "Lagos",
    "localGovernment": "Lekki",
    "area": "Ikoyi",
    "coordinates": {
      "latitude": 6.4637,
      "longitude": 3.4265
    }
  },
  "price": 150000000,
  "additionalFeatures": {
    "noOfBedroom": 4,
    "noOfBathroom": 3,
    "noOfToilet": 2,
    "noOfCarPark": 2
  },
  "features": ["Air Conditioner", "Swimming Pool", "Gym House", "Garden"],
  "pictures": [
    "https://example.com/property/image1.jpg",
    "https://example.com/property/image2.jpg"
  ],
  "description": "Luxurious 4-bedroom detached bungalow in premium Ikoyi location",
  "owner": {
    "_id": ObjectId("507f1f77bcf86cd799439012"),
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+234801234567",
    "verified": true
  },
  "areYouTheOwner": true,
  "ownershipDocuments": ["certificate_of_occupancy.pdf"],
  "docOnProperty": [
    {
      "_id": ObjectId(),
      "docName": "Certificate of Occupancy",
      "docType": "occupancy",
      "verified": true,
      "uploadedAt": ISODate("2024-01-15T10:30:00Z")
    }
  ],
  "status": "active",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z"),
  "views": 245,
  "likes": 12,
  "isPremium": true,
  "verificationStatus": "verified"
}
```

### Sample Rent Property
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "briefType": "Rent",
  "propertyType": "Flat",
  "propertyCategory": "Residential",
  "propertyCondition": "Renovated",
  "rentalType": "Rent",
  "location": {
    "state": "Lagos",
    "localGovernment": "Yaba",
    "area": "Yaba",
    "streetAddress": "123 Main Street"
  },
  "price": 500000,
  "additionalFeatures": {
    "noOfBedroom": 2,
    "noOfBathroom": 2,
    "noOfToilet": 2,
    "noOfCarPark": 1
  },
  "features": ["Air Conditioner", "Kitchenette", "WiFi"],
  "tenantCriteria": ["Employed", "No Children"],
  "rentalConditions": ["6 months minimum", "Refundable deposit required"],
  "tenantGenderPreference": "Female",
  "employmentType": "Formal Employment",
  "pictures": ["https://example.com/property/image1.jpg"],
  "description": "Well-maintained 2-bedroom apartment in Yaba",
  "owner": {
    "_id": ObjectId("507f1f77bcf86cd799439014"),
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+234809876543",
    "verified": true
  },
  "areYouTheOwner": true,
  "status": "active",
  "createdAt": ISODate("2024-01-10T14:20:00Z"),
  "updatedAt": ISODate("2024-01-10T14:20:00Z"),
  "views": 156,
  "likes": 8,
  "isPremium": false,
  "verificationStatus": "verified"
}
```

### Sample Shortlet Property
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "briefType": "Shortlet",
  "propertyType": "1-Bed Apartment",
  "propertyCategory": "Residential",
  "propertyCondition": "New",
  "location": {
    "state": "Lagos",
    "localGovernment": "Victoria Island",
    "area": "Victoria Island",
    "streetAddress": "45 Admiralty Way"
  },
  "additionalFeatures": {
    "noOfBedroom": 1,
    "noOfBathroom": 1,
    "noOfToilet": 1,
    "maxGuests": 2
  },
  "features": ["WiFi", "Air Conditioner", "Kitchen", "Balcony"],
  "pictures": ["https://example.com/shortlet/image1.jpg"],
  "videos": [
    {
      "id": "video-1",
      "url": "https://example.com/shortlet/video.mp4",
      "preview": "https://example.com/shortlet/preview.jpg"
    }
  ],
  "availability": {
    "minStay": 1,
    "maxStay": 30
  },
  "pricing": {
    "nightly": 25000,
    "weeklyDiscount": 10,
    "monthlyDiscount": 20,
    "cleaningFee": 5000,
    "securityDeposit": 50000,
    "cancellationPolicy": "flexible"
  },
  "houseRules": {
    "checkIn": "15:00",
    "checkOut": "11:00",
    "smoking": false,
    "pets": false,
    "parties": false,
    "otherRules": "Quiet hours after 10 PM"
  },
  "description": "Cozy 1-bed apartment in prime VI location",
  "owner": {
    "_id": ObjectId("507f1f77bcf86cd799439016"),
    "fullName": "Alex Johnson",
    "email": "alex@example.com",
    "phoneNumber": "+234807654321",
    "verified": true
  },
  "areYouTheOwner": true,
  "status": "active",
  "createdAt": ISODate("2024-01-05T09:15:00Z"),
  "updatedAt": ISODate("2024-01-05T09:15:00Z"),
  "views": 389,
  "likes": 34,
  "isPremium": true,
  "verificationStatus": "verified"
}
```

### Sample Joint Venture Property
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439017"),
  "briefType": "Joint Venture",
  "propertyType": "Land",
  "propertyCategory": "Land",
  "location": {
    "state": "Lagos",
    "localGovernment": "Lekki",
    "area": "Ibeju-Lekki",
    "coordinates": {
      "latitude": 6.4637,
      "longitude": 3.6265
    }
  },
  "landSize": {
    "size": "2",
    "measurementType": "hectares"
  },
  "jvConditions": ["60/40 equity split", "Developer to handle construction", "5 year partnership"],
  "features": ["Accessible by road", "Flat terrain"],
  "pictures": ["https://example.com/jv/image1.jpg"],
  "description": "Prime land in Ibeju-Lekki ideal for residential development",
  "owner": {
    "_id": ObjectId("507f1f77bcf86cd799439018"),
    "fullName": "Estate Holdings Ltd",
    "email": "estatehold@example.com",
    "phoneNumber": "+234801111111",
    "verified": true
  },
  "areYouTheOwner": true,
  "ownershipDocuments": ["deed_of_assignment.pdf"],
  "status": "active",
  "createdAt": ISODate("2024-01-01T08:00:00Z"),
  "updatedAt": ISODate("2024-01-01T08:00:00Z"),
  "views": 89,
  "likes": 5,
  "isPremium": true,
  "verificationStatus": "verified"
}
```

---

## Data Migration Notes

- Ensure all required fields are populated before saving
- Use MongoDB validators for schema enforcement
- Maintain referential integrity for owner._id references
- Archive old property documents after specified retention period
- Keep audit trail for property status changes
