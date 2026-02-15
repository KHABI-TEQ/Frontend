# API Integration

Complete guide for integrating the Preference Submission Module with backend systems.

## API Endpoint Specification

### Submission Endpoint

**URL**: `/api/preferences`  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Authentication**: (Configure as needed)

---

## Request Payload Structure

### Common Fields (All Preference Types)

```typescript
{
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet",
  preferenceMode: "buy" | "tenant" | "developer" | "shortlet",
  location: {
    state: string,
    localGovernmentAreas: string[],
    selectedAreas?: string[],
    customLocation?: string
  },
  budget: {
    minPrice: number,
    maxPrice: number,
    currency: "NGN"
  },
  features: {
    baseFeatures: string[],
    premiumFeatures: string[],
    autoAdjustToFeatures: boolean
  },
  contactInfo: { /* varies by type */ }
}
```

---

## Buy Preference Payload

```json
{
  "preferenceType": "buy",
  "preferenceMode": "buy",
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
    "minLandSize": 1000,
    "maxLandSize": 5000,
    "documentTypes": ["Deed of Assignment", "Certificate of Occupancy"]
  },
  "features": {
    "baseFeatures": ["Swimming Pool", "Security Cameras", "Home Office"],
    "premiumFeatures": ["In-house Cinema", "Gym House"],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+2347012345678",
    "whatsappNumber": "+2348012345678"
  },
  "nearbyLandmark": "Close to Lekki Conservation Centre",
  "additionalNotes": "Prefer modern finishes with high ceilings"
}
```

### Response (Success)

**Status**: `201 Created`

```json
{
  "success": true,
  "id": "pref_123abc456def",
  "preferenceType": "buy",
  "submittedAt": "2024-03-01T10:30:00Z",
  "message": "Preference submitted successfully"
}
```

### Response (Error)

**Status**: `400 Bad Request` or `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Invalid budget range",
  "details": {
    "field": "budget",
    "message": "Maximum budget must be greater than minimum budget"
  }
}
```

---

## Rent Preference Payload

```json
{
  "preferenceType": "rent",
  "preferenceMode": "tenant",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki"],
    "selectedAreas": ["Lekki Phase 1"]
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
    "propertyCondition": "New",
    "purpose": "Residential"
  },
  "features": {
    "baseFeatures": ["WiFi", "Security Cameras", "Air Conditioner"],
    "premiumFeatures": ["Swimming Pool"],
    "autoAdjustToFeatures": true
  },
  "contactInfo": {
    "fullName": "Grace Johnson",
    "email": "grace@example.com",
    "phoneNumber": "+2347089123456"
  },
  "additionalNotes": "Looking for cozy apartments with good ventilation"
}
```

---

## Shortlet Preference Payload

```json
{
  "preferenceType": "shortlet",
  "preferenceMode": "shortlet",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Victoria Island"],
    "selectedAreas": ["VI"]
  },
  "budget": {
    "minPrice": 80000,
    "maxPrice": 250000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "1-Bed Apartment",
    "minBedrooms": 1,
    "maxGuests": 2,
    "bathrooms": 1,
    "travelType": "Business"
  },
  "bookingDetails": {
    "checkInDate": "2024-03-01",
    "checkOutDate": "2024-03-15",
    "preferredCheckInTime": "14:00",
    "preferredCheckOutTime": "11:00"
  },
  "features": {
    "baseFeatures": ["WiFi", "Air Conditioning", "Power Supply"],
    "premiumFeatures": [],
    "autoAdjustToFeatures": false
  },
  "contactInfo": {
    "fullName": "Michael Chen",
    "email": "michael@business.com",
    "phoneNumber": "+2347012345678"
  },
  "additionalNotes": "Need workspace for remote work"
}
```

---

## Joint Venture Preference Payload

```json
{
  "preferenceType": "joint-venture",
  "preferenceMode": "developer",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Ajah", "Lekki"],
    "selectedAreas": ["Ajah", "Lekki Phase 2"]
  },
  "budget": {
    "minPrice": 500000000,
    "maxPrice": 5000000000,
    "currency": "NGN"
  },
  "developmentDetails": {
    "minLandSize": "5000",
    "maxLandSize": "20000",
    "measurementUnit": "sqm",
    "jvType": "Equity Split",
    "propertyType": "land",
    "expectedStructureType": "Luxury Duplexes",
    "timeline": "Within 1 Year",
    "preferredSharingRatio": "50-50",
    "proposalDetails": "Looking for partnership in premium Lagos areas",
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
  "contactInfo": {
    "companyName": "Premier Properties Development Ltd",
    "contactPerson": "David Adeyemi",
    "email": "david@premierdev.com",
    "phoneNumber": "+2347019876543",
    "whatsappNumber": "+2347019876543",
    "cacRegistrationNumber": "RC123456"
  },
  "partnerExpectations": "Transparent dealings and professional management"
}
```

---

## Backend Implementation Example

### Node.js/Express Example

```typescript
import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { validatePreferencePayload } from "./validation";
import { savePreference } from "./database";
import { notifyTeam } from "./notifications";

const router = Router();

router.post("/api/preferences", async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Step 1: Validate payload structure
    const { valid, errors } = validatePreferencePayload(payload);
    if (!valid) {
      return res.status(400).json({
        success: false,
        error: "Invalid payload",
        details: errors
      });
    }

    // Step 2: Generate ID
    const preferenceId = `pref_${uuidv4()}`;

    // Step 3: Save to database
    const saved = await savePreference({
      id: preferenceId,
      preferenceType: payload.preferenceType,
      preferenceMode: payload.preferenceMode,
      data: payload,
      status: "submitted",
      submittedAt: new Date(),
      createdAt: new Date()
    });

    if (!saved) {
      return res.status(500).json({
        success: false,
        error: "Failed to save preference"
      });
    }

    // Step 4: Send notifications
    await notifyTeam({
      type: payload.preferenceType,
      id: preferenceId,
      contact: payload.contactInfo.email
    });

    // Step 5: Return success response
    return res.status(201).json({
      success: true,
      id: preferenceId,
      preferenceType: payload.preferenceType,
      submittedAt: new Date().toISOString(),
      message: "Preference submitted successfully"
    });

  } catch (error) {
    console.error("Preference submission error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

export default router;
```

### Python/FastAPI Example

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

router = APIRouter()

class PreferencePayload(BaseModel):
    preferenceType: str
    preferenceMode: str
    location: dict
    budget: dict
    features: dict
    contactInfo: dict
    # ... other fields

@router.post("/api/preferences", status_code=201)
async def submit_preference(payload: PreferencePayload):
    try:
        # Validate payload
        if not validate_preference(payload):
            raise HTTPException(status_code=400, detail="Invalid payload")
        
        # Generate ID
        preference_id = f"pref_{uuid.uuid4()}"
        
        # Save to database
        saved = await save_to_db({
            "id": preference_id,
            "type": payload.preferenceType,
            "data": payload.dict(),
            "created_at": datetime.now(),
            "submitted_at": datetime.now()
        })
        
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save")
        
        return {
            "success": True,
            "id": preference_id,
            "preferenceType": payload.preferenceType,
            "submittedAt": datetime.now().isoformat(),
            "message": "Preference submitted successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Frontend Integration

### Submission Function

```typescript
async function submitPreference(formData: FlexibleFormData): Promise<string> {
  // Transform form data to API payload
  const payload = transformToPayload(formData);

  try {
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Submission failed");
    }

    const result = await response.json();
    return result.id;

  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
}
```

### Usage in Component

```typescript
async function handleSubmit() {
  try {
    dispatch({ type: "SET_SUBMITTING", payload: true });

    const preferenceId = await submitPreference(state.formData);

    // Show success message
    toast.success("Preference submitted successfully!");

    // Redirect to confirmation page
    window.location.href = `/preferences/confirmation/${preferenceId}`;

  } catch (error) {
    toast.error(error.message);
  } finally {
    dispatch({ type: "SET_SUBMITTING", payload: false });
  }
}
```

---

## Payload Transformation

### Transform Function

```typescript
function transformToPayload(formData: FlexibleFormData): PreferencePayload {
  const preference = formData.preferenceType;

  // Common payload
  const payload: any = {
    preferenceType: preference,
    preferenceMode: mapPreferenceMode(preference),
    location: {
      state: formData.location?.state,
      localGovernmentAreas: formData.location?.lgas,
      selectedAreas: formData.location?.areas?.length ? formData.location.areas : undefined,
      customLocation: formData.location?.customLocation
    },
    budget: {
      minPrice: formData.budget?.minPrice,
      maxPrice: formData.budget?.maxPrice,
      currency: "NGN"
    },
    features: {
      baseFeatures: formData.features?.basicFeatures || [],
      premiumFeatures: formData.features?.premiumFeatures || [],
      autoAdjustToFeatures: formData.features?.autoAdjustToBudget || false
    },
    contactInfo: transformContactInfo(formData.contactInfo, preference),
  };

  // Add preference-type-specific fields
  switch (preference) {
    case "buy":
      payload.propertyDetails = transformBuyDetails(formData.propertyDetails);
      payload.nearbyLandmark = formData.nearbyLandmark;
      break;

    case "rent":
      payload.propertyDetails = transformRentDetails(formData.propertyDetails);
      break;

    case "shortlet":
      payload.propertyDetails = transformShortletDetails(formData.propertyDetails);
      payload.bookingDetails = formData.bookingDetails;
      break;

    case "joint-venture":
      payload.developmentDetails = transformJVDetails(formData.developmentDetails);
      break;
  }

  // Add optional fields
  if (formData.additionalNotes) {
    payload.additionalNotes = formData.additionalNotes;
  }

  return payload;
}

function mapPreferenceMode(preferenceType: string): string {
  const modeMap: Record<string, string> = {
    "buy": "buy",
    "rent": "tenant",
    "shortlet": "shortlet",
    "joint-venture": "developer"
  };
  return modeMap[preferenceType];
}
```

---

## Error Handling

### Client-Side Error Handling

```typescript
async function submitWithErrorHandling(formData: FlexibleFormData) {
  try {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    
    const preferenceId = await submitPreference(formData);
    
    // Success
    toast.success("Preference submitted successfully!");
    navigate(`/preferences/confirmation/${preferenceId}`);
    
  } catch (error) {
    if (error instanceof NetworkError) {
      toast.error("Network error. Please check your connection.");
    } else if (error instanceof ValidationError) {
      toast.error(`Validation error: ${error.message}`);
      // Update form validation errors
      dispatch({
        type: "SET_VALIDATION_ERRORS",
        payload: error.errors
      });
    } else if (error instanceof ServerError) {
      toast.error("Server error. Please try again later.");
    } else {
      toast.error(error.message);
    }
  } finally {
    dispatch({ type: "SET_SUBMITTING", payload: false });
  }
}
```

### Server-Side Error Handling

```typescript
// Validation errors (400)
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "budget.minPrice",
      "message": "Minimum price must be greater than 0"
    },
    {
      "field": "contactInfo.phoneNumber",
      "message": "Invalid phone number format"
    }
  ]
}

// Business logic errors (422)
{
  "success": false,
  "error": "Business rule violation",
  "details": {
    "field": "budget.minPrice",
    "message": "Budget below minimum threshold for Lagos (5,000,000 NGN)"
  }
}

// Server errors (500)
{
  "success": false,
  "error": "Internal server error",
  "details": "An unexpected error occurred. Please try again later."
}
```

---

## Data Storage

### Database Schema

```sql
CREATE TABLE preferences (
  id VARCHAR(50) PRIMARY KEY,
  preference_type VARCHAR(50) NOT NULL,
  preference_mode VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  processed_at TIMESTAMP,
  INDEX idx_preference_type (preference_type),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
);

CREATE TABLE preference_audit (
  id SERIAL PRIMARY KEY,
  preference_id VARCHAR(50),
  action VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preference_id) REFERENCES preferences(id)
);
```

---

## Rate Limiting

### Recommended Configuration

```
- Per IP: 10 requests per minute
- Per user: 50 requests per day
- Burst: 5 requests in 10 seconds
```

### Implementation

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 10,                   // 10 requests
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/preferences", limiter, async (req, res) => {
  // ... handle request
});
```

---

## Monitoring & Logging

### Log Structure

```json
{
  "timestamp": "2024-03-01T10:30:00Z",
  "event": "preference_submitted",
  "preference_id": "pref_123abc",
  "preference_type": "buy",
  "status": "success",
  "duration_ms": 245,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "location": "Lagos",
    "budget_min": 150000000,
    "features_count": 5
  }
}
```

### Metrics to Track

- Total submissions by type
- Average submission time
- Errors by type
- Geographic distribution
- Peak usage times
- Feature popularity

---

## Testing

### Unit Test Example

```typescript
describe("Preference API", () => {
  it("should accept valid buy preference", async () => {
    const payload = validBuyPayload();
    const response = await api.post("/api/preferences", payload);
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.success).toBe(true);
  });

  it("should reject invalid budget", async () => {
    const payload = validBuyPayload();
    payload.budget.minPrice = -100;
    const response = await api.post("/api/preferences", payload);
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

---

## Documentation & Support

For more information:
- [FORM_FIELDS.md](./FORM_FIELDS.md) - Field specifications
- [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) - Type definitions
- [VALIDATION_RULES.md](./VALIDATION_RULES.md) - Validation logic
- [SAMPLE_DATA.md](./SAMPLE_DATA.md) - Example payloads
