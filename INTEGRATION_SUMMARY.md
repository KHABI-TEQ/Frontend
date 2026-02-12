# Integration Summary - Preference Submission & Property View

This document provides a quick reference for integrating both the Preference Submission Form and Single Property View into another Next.js application.

---

## Quick Links to Full Documentation

- **[PREFERENCE_SUBMISSION_DOCUMENTATION.md](./PREFERENCE_SUBMISSION_DOCUMENTATION.md)** - Complete preference form guide
- **[PROPERTY_VIEW_DOCUMENTATION.md](./PROPERTY_VIEW_DOCUMENTATION.md)** - Complete property view guide

---

## What You Get

### 1. Preference Submission Form
A multi-step property preference collection system that supports:
- **4 Preference Types**: Buy, Rent, Shortlet, Joint-Venture
- **Multi-Step Navigation**: 4-5 steps depending on type
- **Smart Validation**: Context-aware validation rules
- **Feature Selection**: Basic/Premium/Comfort features
- **Budget Thresholds**: Location & type-specific minimums
- **API Integration**: Ready-to-use payload generation

### 2. Single Property View
A complete property detail page featuring:
- **Dynamic Routing**: `/property/[marketType]/[ID]`
- **Image Gallery**: Swiper-based carousel with videos
- **Location Mapping**: Interactive map display
- **Price Negotiation**: Modal for buy properties
- **Shortlet Booking**: Calendar booking for stays
- **Document Verification**: Document status display
- **Contact Integration**: Direct owner/agent communication
- **Type-Specific UI**: Different views for Buy/Rent/Shortlet/JV

---

## File Structure

Both systems are self-contained in specific directories:

### Core Files to Copy

```
For Preference System:
├── src/context/preference-form-context.tsx
├── src/data/preference-configs.ts
├── src/types/preference-form.ts
├── src/utils/validation/preference-validation.ts
└── src/components/preference-form/
    ├── OptimizedLocationSelection.tsx
    ├── OptimizedBudgetSelection.tsx
    ├── FeatureSelection.tsx
    ├── PropertyDetails.tsx
    ├── OptimizedContactInformation.tsx
    ├── DateSelection.tsx
    └── SubmitButton.tsx

For Property View:
├── src/app/property/[marketType]/[ID]/page.tsx
├── src/types/property.types.ts
├── src/components/property/PropertyLocationMap.tsx
├── src/components/modals/GlobalPriceNegotiationModal.tsx
├── src/components/shortlet/ShortletBookingModal.tsx
└── src/components/new-marketplace/modals/LOIUploadModal.tsx
```

---

## Integration Steps

### Step 1: Setup Dependencies

Install required packages:
```bash
npm install react-hot-toast framer-motion yup react-datepicker react-select swiper
npm install @lucide-react next/image axios
```

### Step 2: Copy Type Definitions

Copy TypeScript interfaces to your project:
- `src/types/preference-form.ts` - Preference interfaces
- `src/types/property.types.ts` - Property interfaces

### Step 3: Setup Context/State Management

#### For Preferences:
```tsx
// In your layout or root page
import { PreferenceFormProvider } from '@/context/preference-form-context';

export default function RootLayout({ children }) {
  return (
    <PreferenceFormProvider>
      {children}
    </PreferenceFormProvider>
  );
}
```

#### For Properties:
```tsx
// Setup API contexts
import { useSelectedBriefs } from '@/context/selected-briefs-context';
import { useGlobalPropertyActions } from '@/context/global-property-actions-context';
```

### Step 4: Configure API Endpoints

Update your URLS configuration:
```typescript
// src/utils/URLS.ts
export const URLS = {
  // Preference endpoints
  POST_PREFERENCE: '/api/preferences',
  
  // Property endpoints
  GET_PROPERTY: '/api/property',
  LIKE_PROPERTY: '/api/property/like',
  NEGOTIATE_PRICE: '/api/negotiation/create',
  CREATE_BOOKING: '/api/booking/shortlet/create',
  UPLOAD_LOI: '/api/loi/upload',
};
```

### Step 5: Setup Components

#### Preference Form:
```tsx
// pages/preferences/page.tsx
'use client';
import { PreferenceFormProvider } from '@/context/preference-form-context';
import PreferenceForm from '@/components/preference-form/PreferenceForm';

export default function PreferencesPage() {
  return (
    <PreferenceFormProvider>
      <PreferenceForm />
    </PreferenceFormProvider>
  );
}
```

#### Property View:
```tsx
// pages/property/[marketType]/[ID]/page.tsx
'use client';
import PropertyDetailsPage from '@/components/property/PropertyDetailsPage';

export default function Page() {
  return <PropertyDetailsPage />;
}
```

### Step 6: Configure Validation

Update validation schemas if needed:
```typescript
// src/utils/validation/preference-validation.ts
// Customize Yup schemas for your requirements
```

### Step 7: Customize Feature & Budget Configurations

Update configuration files:
```typescript
// src/data/preference-configs.ts
export const DEFAULT_BUDGET_THRESHOLDS = [
  { location: "YourCity", listingType: "buy", minAmount: YOUR_AMOUNT },
  // ... your thresholds
];

export const FEATURE_CONFIGS = {
  "buy-residential": {
    basic: [/* your features */],
    premium: [/* your features */],
  },
  // ... more types
};
```

---

## Data Flow Overview

### Preference Form Flow

```
1. User visits preference page
   ↓
2. PreferenceFormProvider wraps component
   ↓
3. User selects preference type (Buy/Rent/Shortlet/JV)
   ↓
4. Form steps load based on type
   ↓
5. User fills each step with validation
   ↓
6. Each step validates on input/next button
   ↓
7. Form generates API payload
   ↓
8. POST to /api/preferences
   ↓
9. Success modal shown
   ↓
10. User can submit new preference or visit marketplace
```

### Property View Flow

```
1. User visits /property/[marketType]/[ID]
   ↓
2. Page fetches property details from API
   ↓
3. Property data loads and displays:
   - Image gallery
   - Basic information
   - Features & amenities
   - Location map
   - Owner/Agent info
   ↓
4. User can interact:
   - View images/videos
   - Like/save property
   - Negotiate (Buy)
   - Book (Shortlet)
   - Upload LOI (JV)
   ↓
5. Modals handle specific actions
   ↓
6. Actions POST to respective endpoints
   ↓
7. Success/Error feedback shown
```

---

## Key Validation Rules

### Preference Form Validations

**Location Step**:
- State is required
- At least 1 LGA, max 3
- Must have areas or custom location
- Max 3 areas per LGA

**Property Details Step**:
- Property type required
- Land size required (format varies by unit)
- Building type required (if not land)
- Document types required (at least 1)

**Budget Step**:
- Min > 0
- Max > Min
- Must meet location/type minimum threshold

**Contact Step**:
- Full name: 2-100 chars, letters only
- Email: Valid format
- Phone: Valid Nigerian format
- Additional notes: Max 1000 chars

### Property View Validations

**Price Negotiation**:
- Proposed price < current price
- Message max 500 chars

**Shortlet Booking**:
- Check-in not in past
- Check-out after check-in
- Guests ≤ max allowed

**LOI Upload**:
- File size < 5MB
- File type: PDF, DOC, Image
- Cover letter max 1000 chars

---

## API Payload Examples

### Sample Preference Submission

```json
{
  "preferenceType": "buy",
  "preferenceMode": "buy",
  "location": {
    "state": "Lagos",
    "localGovernmentAreas": ["Lekki"],
    "lgasWithAreas": [{"lgaName": "Lekki", "areas": ["VI"]}]
  },
  "budget": {
    "minPrice": 50000000,
    "maxPrice": 100000000,
    "currency": "NGN"
  },
  "propertyDetails": {
    "propertyType": "residential",
    "buildingType": "Detached",
    "minBedrooms": 4,
    "propertyCondition": "New",
    "documentTypes": ["Certificate of Occupancy"]
  },
  "features": {
    "baseFeatures": ["Security Cameras"],
    "premiumFeatures": ["Swimming Pool"]
  },
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+234801234567"
  }
}
```

### Sample Property Details Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "propertyType": "Residential",
    "price": 50000000,
    "location": {
      "state": "Lagos",
      "localGovernment": "Lekki",
      "area": "Victoria Island"
    },
    "bedRoom": 4,
    "additionalFeatures": {
      "noOfBathrooms": 3,
      "noOfCarParks": 2,
      "additionalFeatures": ["Swimming Pool", "Security"]
    },
    "pictures": ["url1.jpg", "url2.jpg"],
    "videos": ["video1.mp4"],
    "isAvailable": true
  }
}
```

---

## Component Usage Examples

### Using Preference Context

```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

function MyComponent() {
  const {
    state,                    // Current form state
    updateFormData,          // Update form data
    goToNextStep,            // Navigate forward
    validateStep,            // Validate specific step
    isFormValid,             // Check if entire form is valid
  } = usePreferenceForm();

  return (
    <div>
      {/* Your form UI */}
    </div>
  );
}
```

### Displaying Property

```tsx
import { PropertyDetails } from '@/types/property.types';

interface PropertyViewProps {
  property: PropertyDetails;
}

function PropertyView({ property }: PropertyViewProps) {
  return (
    <div>
      <h1>{property.propertyType}</h1>
      <p>₦{property.price.toLocaleString()}</p>
      <p>{property.location.area}, {property.location.state}</p>
      {/* More content */}
    </div>
  );
}
```

---

## Common Customizations

### 1. Add More Preference Types
Edit `preference-form-context.tsx` `getStepsForPreferenceType()` function to add new types

### 2. Modify Validation Rules
Edit `preference-validation.ts` to add/remove validation constraints

### 3. Change Feature List
Edit `preference-configs.ts` FEATURE_CONFIGS object

### 4. Update Budget Thresholds
Edit `preference-configs.ts` DEFAULT_BUDGET_THRESHOLDS array

### 5. Customize Modals
Edit modal components in `src/components/modals/`

### 6. Change Property Display
Edit `src/app/property/[marketType]/[ID]/page.tsx`

---

## Performance Tips

1. **Use SWR for Property Caching**
   ```typescript
   const { data: property } = useSWR(`/api/property/${id}`, fetcher);
   ```

2. **Memoize Components**
   ```typescript
   const PropertyCard = React.memo(({ property }) => {...});
   ```

3. **Lazy Load Images**
   ```typescript
   <img src={url} loading="lazy" alt="Property" />
   ```

4. **Code Splitting**
   ```typescript
   const DateSelection = dynamic(() => 
     import('@/components/preference-form/DateSelection')
   );
   ```

5. **Optimize API Calls**
   - Revalidate only when needed
   - Cache responses appropriately
   - Batch requests when possible

---

## Testing Checklist

### Preference Form
- [ ] All 4 preference types work
- [ ] Validation catches errors
- [ ] Step navigation works
- [ ] Form submits successfully
- [ ] Budget thresholds apply correctly
- [ ] Features load for each type

### Property View
- [ ] Property details load correctly
- [ ] Images display and gallery works
- [ ] Modals open and close properly
- [ ] Negotiation/Booking submits data
- [ ] Map displays location
- [ ] Contact information appears
- [ ] All responsive on mobile

---

## Troubleshooting Guide

### Preference Form Issues

**Problem**: Form won't proceed to next step
**Solution**: Check validation errors with `getValidationErrorsForField()`

**Problem**: Budget threshold validation failing
**Solution**: Update `DEFAULT_BUDGET_THRESHOLDS` in `preference-configs.ts`

**Problem**: Features not showing
**Solution**: Check `FEATURE_CONFIGS` for your preference-property combination

### Property View Issues

**Problem**: Property details not loading
**Solution**: Verify API endpoint, check URL parameters

**Problem**: Images not displaying
**Solution**: Check image URLs are valid, verify CORS settings

**Problem**: Map not showing
**Solution**: Check coordinates in property data, verify map API key

**Problem**: Modals not opening
**Solution**: Verify modal component imports, check state management

---

## Support Resources

- See **PREFERENCE_SUBMISSION_DOCUMENTATION.md** for detailed form documentation
- See **PROPERTY_VIEW_DOCUMENTATION.md** for detailed property view documentation
- Check component prop interfaces in TypeScript files for usage details
- Review context files for available functions and state structure

---

## Next Steps

1. ✅ Read the full documentation files
2. ✅ Copy required files to your project
3. ✅ Install dependencies
4. ✅ Configure API endpoints
5. ✅ Update preference configurations
6. ✅ Test both features thoroughly
7. ✅ Deploy to production

---

## Version Information

- **React Version**: 18+
- **Next.js Version**: 13+ (App Router)
- **TypeScript**: 5.0+
- **Key Dependencies**:
  - react-hot-toast (notifications)
  - framer-motion (animations)
  - yup (validation)
  - react-datepicker (date selection)
  - react-select (multi-select)
  - swiper (image gallery)

---

