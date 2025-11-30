# Universal Property Cards

This system provides reusable property cards that work across the entire application for displaying any type of property.

## Components

### 1. UniversalPropertyCard (Recommended)
Automatically selects the correct card type based on property data.

```tsx
import { UniversalPropertyCard, createPropertyCardData } from '@/components/common/property-cards';

const MyComponent = () => {
  const handlePropertyClick = (property) => {
    // Navigate to property details
    window.open(`/property/${propertyType}/${property._id}`, "_blank");
  };

  const handleInspectionToggle = (property) => {
    // Handle inspection selection
    console.log('Toggle inspection for:', property._id);
  };

  const handlePriceNegotiation = (property) => {
    // Handle price negotiation (for standard properties)
    console.log('Start price negotiation for:', property._id);
  };

  const handleLOIUpload = (property) => {
    // Handle LOI upload (for JV properties)
    console.log('Upload LOI for:', property._id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map(property => {
        const cardData = createPropertyCardData(property);
        
        return (
          <UniversalPropertyCard
            key={property._id}
            property={property}
            cardData={cardData}
            images={property.pictures || property.images || []}
            isPremium={property.isPremium || false}
            onPropertyClick={() => handlePropertyClick(property)}
            onInspectionToggle={() => handleInspectionToggle(property)}
            onPriceNegotiation={() => handlePriceNegotiation(property)}
            onRemoveNegotiation={(propertyId) => {/* handle removal */}}
            onLOIUpload={() => handleLOIUpload(property)}
            onRemoveLOI={(propertyId) => {/* handle LOI removal */}}
            isSelected={selectedProperties.includes(property._id)}
            negotiatedPrice={negotiatedPrices[property._id]}
            loiDocument={loiDocuments[property._id]}
            maxSelections={2}
            currentSelections={selectedProperties.length}
          />
        );
      })}
    </div>
  );
};
```

### 2. StandardPropertyCard
For "Outright Sales", "Rent", and "Shortlet" properties specifically.

### 3. JVPropertyCard  
For "Joint Venture" properties specifically.

## Property Types

- **Standard Properties**: Outright Sales, Rent, Shortlet
  - Shows: Price negotiation, Select for inspection
  - Features: Price, bedrooms, bathrooms, toilets, car parks

- **Joint Venture Properties**: Joint Venture
  - Shows: LOI upload, Select for inspection  
  - Features: Investment amount, expected ROI, investment type

## Card Data Helper

Use `createPropertyCardData()` to automatically generate the correct card data:

```tsx
// For standard properties
const cardData = createPropertyCardData(property);

// For JV properties (auto-detected or forced)
const cardData = createPropertyCardData(property, "Joint Venture");
```

## Customization Options

```tsx
<UniversalPropertyCard
  // ... required props
  
  // Optional customization
  showPriceNegotiation={false}    // Hide price negotiation button
  showInspectionToggle={false}    // Hide inspection toggle
  showLOIUpload={false}          // Hide LOI upload (JV only)
  className="custom-card-class"   // Custom styling
  maxSelections={5}              // Change max selections
  forceCardType="jv"             // Force specific card type
/>
```

## Usage Examples

### My Listings Page
```tsx
// Display user's properties with editing capabilities
<UniversalPropertyCard
  // ... standard props
  showInspectionToggle={false}  // Hide inspection for own properties
  onPropertyClick={() => router.push(`/edit-property/${property._id}`)}
/>
```

### Property Search Results
```tsx
// Display search results with full functionality
<UniversalPropertyCard
  // ... all standard props enabled
  maxSelections={2}
  currentSelections={selectedForInspection.length}
/>
```

### Property Recommendations
```tsx
// Display recommendations with limited functionality
<UniversalPropertyCard
  // ... standard props
  showPriceNegotiation={false}
  showLOIUpload={false}
  showInspectionToggle={false}
  onPropertyClick={() => window.open(`/property/${type}/${id}`, "_blank")}
/>
```

## Features

✅ **Automatic card type detection** based on property data  
✅ **Full functionality** - inspection selection, price negotiation, LOI upload  
✅ **Max selection enforcement** - prevents selecting more than allowed  
✅ **Responsive design** - works on all screen sizes  
✅ **Consistent styling** - matches application design system  
✅ **Type safety** - Full TypeScript support  
✅ **Reusable** - Use anywhere in the application  
