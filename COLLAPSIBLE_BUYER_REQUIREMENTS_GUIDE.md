# Collapsible Buyer Requirements Component

## Overview

A new comprehensive and collapsible buyer requirements section has been implemented for the "Post Property by Preference" page. This component displays detailed preference information in organized, expandable sections, making it easier for agents to understand what the buyer is looking for.

## Features

### 1. **Collapsible Sections**
   - Each section can be expanded or collapsed independently
   - Smooth animations and icons for better UX
   - Default state: "Buyer's Basic Requirements" is expanded, others are collapsed

### 2. **Comprehensive Information Display**

The component displays the following sections:

#### Basic Requirements (Always Expanded by Default)
- Preference Type (Buy, Rent, Shortlet, Joint Venture)
- Preference Mode
- Buyer Name

#### Budget & Pricing
- Minimum Price
- Maximum Price
- Currency
- Average Budget (calculated)

#### Location Preferences
- State
- Local Government Areas (displayed as tags)
- Areas by LGA (organized hierarchically)
- Custom Location (if provided)

#### Property/Shortlet Requirements
- Property Type
- Building Type
- Minimum Bedrooms
- Minimum Bathrooms
- Property Condition
- Purpose
- Land Size (with support for SQM ranges: Min/Max)
- Document Types
- For Shortlet: Number of Guests, Check-in/Check-out Dates, Travel Type, Preferred Times

#### Features & Amenities
- Base Features (green tags)
- Premium Features (purple tags)
- Auto-adjust to Features Budget indicator

#### House Rules & Preferences
- Buyer Contact Information
- Pets Allowed (with status indicator)
- Smoking Allowed (with status indicator)
- Parties Allowed (with status indicator)
- Additional Requests/Notes

#### Additional Information
- Nearby Landmarks
- Additional Notes/Special Requests

## File Location

**Component File:** `src/components/post-property-components/CollapsibleBuyerRequirements.tsx`

**Page Integration:** `src/app/post-property-by-preference/page.tsx`

## Usage

### Import the Component
```typescript
import CollapsibleBuyerRequirements from "@/components/post-property-components/CollapsibleBuyerRequirements";
```

### Use in JSX
```tsx
{preference && !showPropertySummary && !showCommissionModal && (
  <div className="mb-6 md:mb-8 max-w-4xl mx-auto">
    <CollapsibleBuyerRequirements preference={preference as any} />
  </div>
)}
```

## Component Props

```typescript
interface CollapsibleBuyerRequirementsProps {
  preference: Preference;
}
```

### Preference Interface Structure

```typescript
interface Preference {
  preferenceType: string;
  preferenceMode: string;
  location: Location;
  budget: Budget;
  propertyDetails?: PropertyDetails;
  bookingDetails?: BookingDetails;
  features?: Features;
  contactInfo?: ContactInfo;
  nearbyLandmark?: string;
  additionalNotes?: string;
  buyer?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}
```

## Styling

The component uses:
- **Primary Color:** `#8DDB90` (Green accent)
- **Text Colors:** `#09391C` (Dark), `#5A5D63` (Gray)
- **Background:** White with gray hover states
- **Responsive:** Fully responsive design with Tailwind CSS
- **Icons:** Lucide React icons (ChevronDown, ChevronUp, MapPin, DollarSign, Home, CheckCircle)

## New Fields Support

The component now supports the new land size range fields for SQM:
- `minLandSize` - Minimum land size in SQM
- `maxLandSize` - Maximum land size in SQM

These fields are displayed in the Property Requirements section when the measurement unit is SQM.

## Collapse/Expand Functionality

The component maintains its own internal state for expanded sections:
```typescript
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
  basic: true,        // Basic Requirements (expanded by default)
  location: false,    // Location Preferences
  details: false,     // Property/Shortlet Requirements
  features: false,    // Features & Amenities
  contact: false,     // House Rules & Preferences
  additional: false,  // Additional Information
});
```

Users can toggle sections by clicking the section header, which triggers:
```typescript
const toggleSection = (section: string) => {
  setExpandedSections((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
};
```

## Benefits

1. **Better Information Clarity:** All preference details are organized logically
2. **Improved UX:** Collapsible sections prevent information overload
3. **Mobile Friendly:** Responsive design works well on all screen sizes
4. **Visual Feedback:** Icons and color-coded tags help users quickly scan information
5. **Comprehensive:** Displays all preference data from the database
6. **Easy to Maintain:** Well-structured component with clear separation of concerns

## Integration with Backend

The component reads preference data from the backend API endpoint:
- `GET /preferences/{preferenceId}/getOne` - Fetches preference details

This endpoint returns a Preference object that matches the component's interface.

## Future Enhancements

Potential improvements that could be added:
1. Preference matching percentage indicator
2. Quick filters/tags for important criteria
3. Preference history/timeline
4. Notes history for agent-buyer communication
5. Export preference details to PDF
6. Share preference with other agents

## Migration Notes

The old static buyer requirements section (3 columns: Type, Budget, Location) has been replaced with this new collapsible component. All preference information is now accessible in an organized, expandable format.

The change was made in `src/app/post-property-by-preference/page.tsx` at the section that previously rendered:
```tsx
// OLD CODE (replaced)
<div className="bg-white rounded-xl border-l-4 border-[#8DDB90] p-4 mb-6 md:mb-8 max-w-4xl mx-auto">
  {/* Simple 3-column layout */}
</div>

// NEW CODE
<div className="mb-6 md:mb-8 max-w-4xl mx-auto">
  <CollapsibleBuyerRequirements preference={preference as any} />
</div>
```
