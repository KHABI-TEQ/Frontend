# Preference Submission MongoDB Schema

## Collection: `preferences`

Complete MongoDB schema for preference submission covering all preference types (Buy, Rent, Joint Venture, Shortlet).

---

## Main Document Structure

```json
{
  "_id": ObjectId,
  "preferenceType": String,
  "preferenceMode": String,
  "userId": ObjectId,
  "location": {
    "state": String,
    "localGovernmentAreas": [String],
    "selectedAreas": [String],
    "customLocation": String
  },
  "budget": {
    "minPrice": Number,
    "maxPrice": Number,
    "currency": String
  },
  "propertyDetails": {
    "propertySubtype": String,
    "buildingType": String,
    "bedrooms": Number,
    "bathrooms": Number,
    "propertyCondition": String,
    "purpose": String,
    "measurementUnit": String,
    "landSize": String,
    "documentTypes": [String],
    "landConditions": [String]
  },
  "features": {
    "baseFeatures": [String],
    "premiumFeatures": [String],
    "autoAdjustToFeatures": Boolean,
    "comfortFeatures": [String]
  },
  "contactInfo": {
    "fullName": String,
    "email": String,
    "phoneNumber": String,
    "companyName": String,
    "contactPerson": String,
    "cacRegistrationNumber": String
  },
  "developmentDetails": {
    "minLandSize": String,
    "jvType": String,
    "propertyType": String,
    "expectedStructureType": String,
    "timeline": String,
    "budgetRange": Number,
    "measurementUnit": String,
    "developmentTypes": [String],
    "preferredSharingRatio": String,
    "minimumTitleRequirements": [String]
  },
  "bookingDetails": {
    "propertyType": String,
    "bedrooms": Number,
    "numberOfGuests": Number,
    "checkInDate": String,
    "checkOutDate": String,
    "travelType": String
  },
  "additionalNotes": String,
  "partnerExpectations": String,
  "nearbyLandmark": String,
  "status": String,
  "matchedProperties": [ObjectId],
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "expiresAt": ISODate,
  "views": Number,
  "responses": Number,
  "isActive": Boolean
}
```

---

## Field Definitions

### Core Identification
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Unique identifier |
| `preferenceType` | String | Yes | Type: "buy", "rent", "joint-venture", "shortlet" |
| `preferenceMode` | String | Yes | Mode: "buyer", "tenant", "developer", "shortlet" |
| `userId` | ObjectId | Yes | Reference to user who created preference |

### Location Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location.state` | String | Yes | State name (e.g., "Lagos", "Abuja") |
| `location.localGovernmentAreas` | Array[String] | Yes | Array of LGA names (max 3) |
| `location.selectedAreas` | Array[String] | Optional | Specific areas within LGAs (max 3 per LGA) |
| `location.customLocation` | String | Optional | Custom location if not found in system |

### Budget Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `budget.minPrice` | Number | Yes | Minimum budget in Naira |
| `budget.maxPrice` | Number | Yes | Maximum budget in Naira |
| `budget.currency` | String | Yes | Currency: "NGN" |

### Property Details (Conditional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `propertyDetails.propertySubtype` | String | Conditional | Type: "Land", "Residential", "Commercial", "Studio", "Self-con", "Flat", "Mini Flat", "Bungalow" |
| `propertyDetails.buildingType` | String | For Non-Land | Type: "Detached", "Semi-Detached", "Block of Flats" |
| `propertyDetails.bedrooms` | Number | For Residential | Minimum bedrooms needed (or "More" for unlimited) |
| `propertyDetails.bathrooms` | Number | For Residential | Minimum bathrooms |
| `propertyDetails.propertyCondition` | String | For Residential | Condition: "New", "Renovated", "Any" |
| `propertyDetails.purpose` | String | For Buy | Purpose: "For living", "Resale", "Development" |
| `propertyDetails.purpose` | String | For Rent | Purpose: "Residential", "Office" |
| `propertyDetails.measurementUnit` | String | For Land | Unit: "sqm", "sqft", "hectares", "plots" |
| `propertyDetails.landSize` | String | For Land | Minimum land size |
| `propertyDetails.documentTypes` | Array[String] | For Buy/JV | Required document types |
| `propertyDetails.landConditions` | Array[String] | For JV Land | Required land conditions |

### Features & Amenities
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `features.baseFeatures` | Array[String] | Optional | Basic features required |
| `features.premiumFeatures` | Array[String] | Optional | Premium features desired |
| `features.comfortFeatures` | Array[String] | For Shortlet | Comfort features (Shortlet-specific) |
| `features.autoAdjustToFeatures` | Boolean | Optional | Auto-adjust features to budget (default: false) |

### Contact Information (Varies by Type)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contactInfo.fullName` | String | For Non-JV | Full name of preference owner |
| `contactInfo.email` | String | Yes | Email address |
| `contactInfo.phoneNumber` | String | Yes | Phone number |
| `contactInfo.companyName` | String | For JV | Company name |
| `contactInfo.contactPerson` | String | For JV | Contact person name |
| `contactInfo.cacRegistrationNumber` | String | For JV | CAC registration number |

### Development Details (Joint Venture Only)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `developmentDetails.minLandSize` | String | For JV | Minimum land size required |
| `developmentDetails.jvType` | String | For JV | Type: "Equity Split", "Lease-to-Build", "Development Partner" |
| `developmentDetails.propertyType` | String | For JV | Type: "Land", "Old Building", "Structure to demolish" |
| `developmentDetails.expectedStructureType` | String | For JV | Type: "Mini Flats", "Luxury Duplexes" |
| `developmentDetails.timeline` | String | For JV | Timeline: "Ready Now", "In 3 Months", "Within 1 Year" |
| `developmentDetails.budgetRange` | Number | Optional | Budget for development |
| `developmentDetails.measurementUnit` | String | For JV Land | Measurement unit |
| `developmentDetails.developmentTypes` | Array[String] | For JV | Types of development |
| `developmentDetails.preferredSharingRatio` | String | For JV | Preferred equity split ratio |
| `developmentDetails.minimumTitleRequirements` | Array[String] | For JV | Title requirements |

### Booking Details (Shortlet Only)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookingDetails.propertyType` | String | For Shortlet | Type: "Studio", "1-Bed Apartment", "2-Bed Flat" |
| `bookingDetails.bedrooms` | Number | For Shortlet | Number of bedrooms |
| `bookingDetails.numberOfGuests` | Number | For Shortlet | Number of guests |
| `bookingDetails.checkInDate` | String | For Shortlet | Check-in date (ISO 8601 format) |
| `bookingDetails.checkOutDate` | String | For Shortlet | Check-out date (ISO 8601 format) |
| `bookingDetails.travelType` | String | For Shortlet | Travel type: "Leisure", "Business", "Relocation" |

### Additional Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `additionalNotes` | String | Optional | Additional preferences or notes |
| `partnerExpectations` | String | For JV | Expectations from JV partner |
| `nearbyLandmark` | String | For Buy | Nearby landmark reference |

### Metadata
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | Status: "active", "paused", "fulfilled", "expired", "archived" |
| `matchedProperties` | Array[ObjectId] | Optional | References to matched properties |
| `createdAt` | ISODate | Yes | Creation timestamp |
| `updatedAt` | ISODate | Yes | Last update timestamp |
| `expiresAt` | ISODate | Optional | Preference expiration date |
| `views` | Number | Yes | Number of views (default: 0) |
| `responses` | Number | Yes | Number of agent responses (default: 0) |
| `isActive` | Boolean | Yes | Active status flag (default: true) |

---

## Preference Type Specific Schemas

### 1. Buy Preference

**preferenceMode:** "buyer"

**Required Fields:**
- preferenceType: "buy"
- location (state, LGAs, areas)
- budget (minPrice, maxPrice)
- propertyDetails.propertySubtype
- propertyDetails.bedrooms
- propertyDetails.buildingType (if not land)
- propertyDetails.propertyCondition
- propertyDetails.purpose
- contactInfo (fullName, email, phoneNumber)

**Optional Fields:**
- propertyDetails.bathrooms
- propertyDetails.measurementUnit (for land)
- propertyDetails.landSize (for land)
- propertyDetails.documentTypes
- features (baseFeatures, premiumFeatures)
- nearbyLandmark
- additionalNotes

**Example Payload:**
```json
{
  "preferenceType": "buy",
  "preferenceMode": "buyer",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki", "Ikoyi"],
    "selectedAreas": ["VI", "Ikoyi", "Oniru"]
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 300000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertySubtype": "residential",
    "buildingType": "Detached",
    "bedrooms": 4,
    "bathrooms": 3,
    "propertyCondition": "New",
    "purpose": "For living"
  },
  "features": {
    "baseFeatures": ["Air Conditioner", "Security Post"],
    "premiumFeatures": ["Swimming Pool", "Gym House"]
  },
  "contactInfo": {
    "fullName": "Chukwu Okafor",
    "email": "chukwu@example.com",
    "phoneNumber": "+234801234567"
  },
  "additionalNotes": "Looking for property with sea view"
}
```

---

### 2. Rent Preference

**preferenceMode:** "tenant"

**Required Fields:**
- preferenceType: "rent"
- location (state, LGAs, areas)
- budget (minPrice, maxPrice)
- propertyDetails.propertySubtype
- propertyDetails.bedrooms
- propertyDetails.leaseTerm
- propertyDetails.propertyCondition
- propertyDetails.purpose
- contactInfo (fullName, email, phoneNumber)

**Optional Fields:**
- propertyDetails.bathrooms
- features (baseFeatures, premiumFeatures)
- additionalNotes

**Example Payload:**
```json
{
  "preferenceType": "rent",
  "preferenceMode": "tenant",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Yaba", "Surulere"],
    "selectedAreas": ["Yaba"]
  },
  "budget": {
    "minPrice": 300000,
    "maxPrice": 1000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertySubtype": "Flat",
    "bedrooms": 2,
    "leaseTerm": "1 Year",
    "propertyCondition": "Renovated",
    "purpose": "Residential"
  },
  "features": {
    "baseFeatures": ["Air Conditioner", "WiFi"],
    "premiumFeatures": []
  },
  "contactInfo": {
    "fullName": "Adeola Adeyemi",
    "email": "adeola@example.com",
    "phoneNumber": "+234809876543"
  }
}
```

---

### 3. Joint Venture Preference

**preferenceMode:** "developer"

**Required Fields:**
- preferenceType: "joint-venture"
- location (state, LGAs)
- developmentDetails.minLandSize
- developmentDetails.jvType
- developmentDetails.propertyType
- developmentDetails.expectedStructureType
- developmentDetails.timeline
- contactInfo (companyName, contactPerson, email, phoneNumber)

**Optional Fields:**
- budget (maxPrice for development)
- features
- developmentDetails.developmentTypes
- developmentDetails.preferredSharingRatio
- developmentDetails.minimumTitleRequirements
- partnerExpectations
- additionalNotes

**Example Payload:**
```json
{
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ibeju-Lekki", "Epe"]
  },
  "budget": {
    "minPrice": 100000000,
    "maxPrice": 500000000,
    "currency": "NGN"
  },
  "developmentDetails": {
    "minLandSize": "2",
    "jvType": "Equity Split",
    "propertyType": "Land",
    "expectedStructureType": "Luxury Duplexes",
    "timeline": "Within 1 Year",
    "measurementUnit": "hectares",
    "developmentTypes": ["Residential", "Commercial"],
    "preferredSharingRatio": "50/50",
    "minimumTitleRequirements": ["Certificate of Occupancy", "Deed of Assignment"]
  },
  "features": {
    "baseFeatures": ["Power Supply", "Water Supply"],
    "premiumFeatures": ["Road Infrastructure"]
  },
  "contactInfo": {
    "companyName": "BuildCorp Limited",
    "contactPerson": "Ayo Johnson",
    "email": "ayo@buildcorp.com",
    "phoneNumber": "+234807654321",
    "cacRegistrationNumber": "1234567"
  },
  "partnerExpectations": "Transparent partnership with regular updates"
}
```

---

### 4. Shortlet Preference

**preferenceMode:** "shortlet"

**Required Fields:**
- preferenceType: "shortlet"
- location (state, LGAs, areas)
- budget (minPrice, maxPrice)
- bookingDetails.propertyType
- bookingDetails.bedrooms
- bookingDetails.numberOfGuests
- bookingDetails.checkInDate
- bookingDetails.checkOutDate
- bookingDetails.travelType
- contactInfo (fullName, email, phoneNumber)

**Optional Fields:**
- features (baseFeatures, comfortFeatures, premiumFeatures)
- additionalNotes

**Example Payload:**
```json
{
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Victoria Island"],
    "selectedAreas": ["Victoria Island"]
  },
  "budget": {
    "minPrice": 15000,
    "maxPrice": 50000,
    "currency": "NGN"
  },
  "bookingDetails": {
    "propertyType": "2-Bed Flat",
    "bedrooms": 2,
    "numberOfGuests": 4,
    "checkInDate": "2024-02-15",
    "checkOutDate": "2024-02-20",
    "travelType": "Business"
  },
  "features": {
    "baseFeatures": ["WiFi", "Air Conditioner"],
    "comfortFeatures": ["Laundry", "Smart TV"],
    "premiumFeatures": ["Swimming Pool"]
  },
  "contactInfo": {
    "fullName": "Musa Ibrahim",
    "email": "musa@example.com",
    "phoneNumber": "+234803333333"
  }
}
```

---

## Validation Rules

### Location Validation
- State: Must be a valid Nigerian state
- Local Government Areas: Must be valid for selected state (max 3)
- Areas: Must be valid for selected LGA (max 3 per LGA)
- Custom Location: Max 100 characters, filled if area not found

### Budget Validation
- minPrice: Must be positive number ≥ state/location minimum threshold
- maxPrice: Must be greater than minPrice
- Currency: Always "NGN"
- Minimum thresholds by location/type:
  - Buy Lagos: ₦5,000,000
  - Rent Lagos: ₦200,000
  - JV Lagos: ₦10,000,000
  - Shortlet Lagos: ₦15,000

### Property Details Validation
- propertySubtype: Must be from predefined list
- buildingType (non-land): Required, must be valid option
- bedrooms: 0+ for residential, "More" option available
- bathrooms: 0+ for residential
- propertyCondition: Must be from predefined list
- purpose: Must match preference type requirements

### Contact Information Validation
- Email: Valid email format required
- Phone: Valid Nigerian phone number format
- Full Name: 2-50 characters, required for non-JV
- Company Name: 3-100 characters, required for JV
- CAC Registration: 7 characters, optional for JV

### Date Validation (Shortlet)
- checkInDate: Must be future date, ISO 8601 format
- checkOutDate: Must be after checkInDate
- Minimum stay: 1 night
- Maximum stay: 365 days

### Land Size Validation
- Must be numeric value > 0
- Measurement unit: Must be valid (sqm, sqft, hectares, plots)
- For JV: Minimum land size required

### Features Validation
- Features must be from predefined list for preference type
- Premium features: Require minimum budget threshold
- Auto-adjust: Boolean flag
- Max 20 features per category

---

## Indexes

```javascript
// Create indexes for better query performance
db.preferences.createIndex({ "userId": 1, "createdAt": -1 })
db.preferences.createIndex({ "preferenceType": 1 })
db.preferences.createIndex({ "status": 1, "expiresAt": 1 })
db.preferences.createIndex({ "location.state": 1, "preferenceType": 1 })
db.preferences.createIndex({ "budget.minPrice": 1, "budget.maxPrice": 1 })
db.preferences.createIndex({ "createdAt": -1 })
db.preferences.createIndex({ "isActive": 1, "expiresAt": 1 })
db.preferences.createIndex({ "matchedProperties": 1 })
db.preferences.createIndex({ "responses": -1 })
```

---

## Relationships

### User Reference
```
preferences._id -> users._id (via userId)
```

### Property Matches
```
preferences.matchedProperties -> properties._id (array of references)
```

### Status Transitions
```
active -> paused -> active
active -> fulfilled -> archived
active -> expired (automatic based on expiresAt)
```

---

## Preference Expiration

- Default expiration: 90 days from creation
- Can be extended by user
- Expired preferences automatically set to "expired" status
- Notification sent 7 days before expiration
- Can be renewed for additional 90 days

---

## Matching Algorithm Considerations

Preferences are matched with properties based on:
1. Location (state, LGA, area match)
2. Budget range (property price within budget range)
3. Property type match
4. Features overlap (at least 50% match)
5. Additional criteria (bedrooms, bathrooms, condition)
6. Recent properties (7 days) prioritized

---

## Sample Documents

### Buy Preference Document
```json
{
  "_id": ObjectId("607f1f77bcf86cd799439011"),
  "preferenceType": "buy",
  "preferenceMode": "buyer",
  "userId": ObjectId("507f1f77bcf86cd799439001"),
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki"],
    "selectedAreas": ["VI", "Ikoyi"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 200000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertySubtype": "residential",
    "buildingType": "Detached",
    "bedrooms": 4,
    "bathrooms": 3,
    "propertyCondition": "New",
    "purpose": "For living",
    "documentTypes": ["Certificate of Occupancy", "Deed of Assignment"]
  },
  "features": {
    "baseFeatures": ["Air Conditioner", "Security Post", "Gate"],
    "premiumFeatures": ["Swimming Pool", "Gym House"],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "Chukwu Okafor",
    "email": "chukwu@example.com",
    "phoneNumber": "+234801234567"
  },
  "additionalNotes": "Prefer properties with modern architecture",
  "status": "active",
  "matchedProperties": [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439012")
  ],
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z"),
  "expiresAt": ISODate("2024-04-15T10:30:00Z"),
  "views": 45,
  "responses": 3,
  "isActive": true
}
```

### Joint Venture Preference Document
```json
{
  "_id": ObjectId("607f1f77bcf86cd799439012"),
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "userId": ObjectId("507f1f77bcf86cd799439002"),
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ibeju-Lekki", "Epe"],
    "selectedAreas": null,
    "customLocation": null
  },
  "budget": {
    "minPrice": 100000000,
    "maxPrice": 500000000,
    "currency": "NGN"
  },
  "developmentDetails": {
    "minLandSize": "2",
    "measurementUnit": "hectares",
    "jvType": "Equity Split",
    "propertyType": "Land",
    "expectedStructureType": "Luxury Duplexes",
    "timeline": "Within 1 Year",
    "budgetRange": 250000000,
    "developmentTypes": ["Residential", "Commercial"],
    "preferredSharingRatio": "50/50",
    "minimumTitleRequirements": ["Certificate of Occupancy"]
  },
  "features": {
    "baseFeatures": ["Good Road Access", "Water Supply"],
    "premiumFeatures": ["Proximity to Transport Hub"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "companyName": "Prime Developments Ltd",
    "contactPerson": "Ayo Johnson",
    "email": "ayo@prime.com",
    "phoneNumber": "+234807654321",
    "cacRegistrationNumber": "BN7654321"
  },
  "partnerExpectations": "Strong track record in real estate development",
  "additionalNotes": "Open to different equity structures",
  "status": "active",
  "matchedProperties": [
    ObjectId("507f1f77bcf86cd799439021")
  ],
  "createdAt": ISODate("2024-01-10T14:20:00Z"),
  "updatedAt": ISODate("2024-01-10T14:20:00Z"),
  "expiresAt": ISODate("2024-04-10T14:20:00Z"),
  "views": 28,
  "responses": 5,
  "isActive": true
}
```

### Shortlet Preference Document
```json
{
  "_id": ObjectId("607f1f77bcf86cd799439013"),
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "userId": ObjectId("507f1f77bcf86cd799439003"),
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Victoria Island"],
    "selectedAreas": ["Victoria Island"],
    "customLocation": null
  },
  "budget": {
    "minPrice": 20000,
    "maxPrice": 50000,
    "currency": "NGN"
  },
  "bookingDetails": {
    "propertyType": "2-Bed Flat",
    "bedrooms": 2,
    "numberOfGuests": 4,
    "checkInDate": "2024-02-15T14:00:00Z",
    "checkOutDate": "2024-02-25T11:00:00Z",
    "travelType": "Business"
  },
  "features": {
    "baseFeatures": ["WiFi", "Air Conditioner", "Kitchen"],
    "comfortFeatures": ["Laundry", "Smart TV"],
    "premiumFeatures": ["Swimming Pool Access"],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "Musa Ibrahim",
    "email": "musa@example.com",
    "phoneNumber": "+234803333333"
  },
  "additionalNotes": "Need furnished apartment near commercial area",
  "status": "active",
  "matchedProperties": [
    ObjectId("507f1f77bcf86cd799439031"),
    ObjectId("507f1f77bcf86cd799439032")
  ],
  "createdAt": ISODate("2024-01-12T09:15:00Z"),
  "updatedAt": ISODate("2024-01-12T09:15:00Z"),
  "expiresAt": ISODate("2024-04-12T09:15:00Z"),
  "views": 62,
  "responses": 8,
  "isActive": true
}
```

---

## Migration and Maintenance

### Data Cleanup
- Archive fulfilled preferences after 6 months
- Delete test/invalid preferences
- Update expired status nightly via cron job

### Backups
- Daily backups of preferences collection
- Monthly full database backups

### Monitoring
- Track preference creation rates
- Monitor matching success rates
- Alert on validation errors

### Analytics Fields to Track
- Preference distribution by type
- Average response time to preferences
- Budget range analytics by location
- Feature popularity metrics
