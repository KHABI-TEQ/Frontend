# Marketplace Filters & Search Features Documentation

## Table of Contents
1. [Overview](#overview)
2. [Property Types](#property-types)
3. [Available Filters by Property Type](#available-filters-by-property-type)
4. [Search Functionality](#search-functionality)
5. [User Interface Components](#user-interface-components)
6. [Technical Architecture](#technical-architecture)
7. [API Integration](#api-integration)
8. [Filter Configuration](#filter-configuration)
9. [User Experience Flow](#user-experience-flow)
10. [Mobile vs Desktop](#mobile-vs-desktop)

---

## Overview

The Marketplace page (`/market-place`) is a comprehensive property search and discovery platform that allows users to browse, filter, and search for properties across four different market types:
- **Buy** (Outright Sales)
- **Joint Venture** (JV)
- **Rent**
- **Shortlet**

Each market type has its own set of properties, filters, and search capabilities tailored to the specific needs of buyers, investors, landlords, and short-term rental providers.

---

## Property Types

### 1. **Buy** (Outright Sales)
Property types available for purchase:
- Land
- Residential
- Commercial
- Duplex
- All (displays all property types)

**Use Case**: Users looking to purchase properties outright with full ownership.

### 2. **Joint Venture** (JV)
Property types available for investment:
- Land
- Residential
- Commercial
- All (displays all property types)

**Use Case**: Investors seeking joint venture opportunities with potential for ROI.

### 3. **Rent**
Property types available for rental:
- Land
- Residential
- Commercial
- Duplex
- All (displays all property types)

**Use Case**: Tenants or businesses looking to rent properties on a long-term lease basis.

### 4. **Shortlet**
Property types available for short-term rental:
- Apartment
- Studio
- House
- Duplex
- Penthouse
- All (displays all property types)

**Use Case**: Travelers, business visitors, or short-term occupants needing accommodation for days/weeks.

---

## Available Filters by Property Type

### Common Filters Across All Property Types

These filters are available on all four market types:

#### 1. **Location Search**
- **Type**: Autocomplete search field
- **Supports**: State, Local Government Area (LGA), and Area
- **Examples**: 
  - "Lagos" (state)
  - "Lekki" (LGA)
  - "Victoria Island" (Area)
- **Behavior**: Multiple level filtering - users can narrow down from state → LGA → area
- **API Parameter**: `location`

#### 2. **Price Range**
- **Type**: Dropdown with predefined ranges or custom min/max input
- **Currency**: Nigerian Naira (₦)
- **Options vary by property type** (see sections below)
- **Behavior**: Users can select a predefined range OR enter custom minimum and maximum prices
- **API Parameters**: `priceRange` (JSON with min/max)

#### 3. **Property Type (Usage Options)**
- **Type**: Checkbox filters
- **Behavior**: Multiple selection allowed
- **Default**: "All" is included in every property type list
- **API Parameter**: `type` (comma-separated string)

#### 4. **Document Types**
- **Type**: Multi-select modal
- **Behavior**: Users can select multiple documents
- **Available**: All tabs except JV (JV shows reduced set)
- **API Parameter**: `documentType` (comma-separated string)

#### 5. **Bedrooms**
- **Type**: Single selection (radio buttons or quick select)
- **Options**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10+ (Shortlet includes Studio as 0)
- **Behavior**: Click to select one bedroom count
- **API Parameter**: `bedroom` (numeric)

#### 6. **Bathrooms**
- **Type**: Single selection (numeric buttons)
- **Options**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10+
- **Behavior**: Click to select one bathroom count
- **API Parameter**: `bathroom` (numeric)

#### 7. **Desired Features**
- **Type**: Multi-select checkboxes in modal
- **Behavior**: Users can select multiple amenities and features
- **API Parameter**: `desireFeature` (comma-separated string)

### Type-Specific Filters

#### **Buy & Joint Venture (JV) Only**

**Land Size**
- **Type**: Dropdown selection + numeric input
- **Units Available**:
  - Plot
  - Acres
  - Square Meters (Sqm)
  - Hectares
- **Behavior**: Select unit, then enter numeric value
- **API Parameters**: 
  - `landSizeType` (unit)
  - `landSize` (numeric value)
- **Not Available**: Rent and Shortlet tabs

#### **Rent Only**

**Home Condition**
- **Type**: Checkbox filters (displayed prominently in filter bar)
- **Options**:
  - All
  - Brand New
  - Good Condition
  - Fairly Used
  - Need Renovation
  - New Building
- **Behavior**: Single or multiple selection
- **API Parameter**: `homeCondition` (string)

**Tenant Criteria**
- **Type**: Multi-select checkboxes in "More Filters" modal
- **Options** (20 items):
  - No Pets / Pets Allowed
  - No Smoking / Smoking Allowed
  - Students Welcome / No Students
  - Family Only / Professionals Only
  - Long-term Lease (1+ years) / Short-term Lease (< 1 year)
  - Furnished / Semi-Furnished / Unfurnished
  - Utilities Included / Excluded
  - Parking Included / No Parking
  - Credit Check Required
  - References Required
  - Employment Verification
- **Behavior**: Multiple selection
- **API Parameter**: `tenantCriteria` (comma-separated string)

#### **Shortlet Only**

**Home Condition** (Property Condition)
- **Type**: Checkbox filters
- **Options**:
  - All
  - Brand New
  - Good Condition
  - Needs Renovation
- **Behavior**: Single or multiple selection
- **API Parameter**: `homeCondition` (string)

**Tenant Criteria** (Booking Criteria)
- **Type**: Multi-select checkboxes in "More Filters" modal
- **Options** (14 items):
  - No Pets Allowed / Pets Allowed
  - No Smoking / Smoking Allowed
  - Professionals Only / Students Welcome / Families Preferred / Singles Only
  - Corporate Guests
  - Short Notice OK / Long-term Stays
  - Monthly Billing / Weekly Billing / Daily Billing
- **Behavior**: Multiple selection
- **API Parameter**: `tenantCriteria` (comma-separated string)

---

## Price Ranges by Property Type

### Buy (Outright Sales)
| Label | Minimum | Maximum |
|-------|---------|---------|
| Under ₦1M | ₦0 | ₦1,000,000 |
| ₦1M - ₦5M | ₦1,000,000 | ₦5,000,000 |
| ₦5M - ₦10M | ₦5,000,000 | ₦10,000,000 |
| ₦10M - ₦20M | ₦10,000,000 | ₦20,000,000 |
| ₦20M - ₦50M | ₦20,000,000 | ₦50,000,000 |
| ₦50M - ₦100M | ₦50,000,000 | ₦100,000,000 |
| ₦100M - ₦500M | ₦100,000,000 | ₦500,000,000 |
| Above ₦500M | ₦500,000,000 | Unlimited |

### Joint Venture (JV)
| Label | Minimum | Maximum |
|-------|---------|---------|
| Under ₦5M | ₦0 | ₦5,000,000 |
| ₦5M - ₦20M | ₦5,000,000 | ₦20,000,000 |
| ₦20M - ₦50M | ₦20,000,000 | ₦50,000,000 |
| ₦50M - ₦100M | ₦50,000,000 | ₦100,000,000 |
| ₦100M - ₦500M | ₦100,000,000 | ₦500,000,000 |
| ₦500M - ₦1B | ₦500,000,000 | ₦1,000,000,000 |
| Above ₦1B | ₦1,000,000,000 | Unlimited |

### Rent
| Label | Minimum | Maximum |
|-------|---------|---------|
| Under ₦100K | ₦0 | ₦100,000 |
| ₦100K - ₦300K | ₦100,000 | ₦300,000 |
| ₦300K - ₦500K | ₦300,000 | ₦500,000 |
| ₦500K - ₦1M | ₦500,000 | ₦1,000,000 |
| ₦1M - ₦2M | ₦1,000,000 | ₦2,000,000 |
| ₦2M - ₦5M | ₦2,000,000 | ₦5,000,000 |
| Above ₦5M | ₦5,000,000 | Unlimited |

### Shortlet (Daily/Weekly rates)
| Label | Minimum | Maximum |
|-------|---------|---------|
| Under ₦5K | ₦0 | ₦5,000 |
| ₦5K - ₦10K | ₦5,000 | ₦10,000 |
| ₦10K - ₦20K | ₦10,000 | ₦20,000 |
| ₦20K - ₦30K | ₦20,000 | ₦30,000 |
| ₦30K - ₦50K | ₦30,000 | ₦50,000 |
| ₦50K - ₦100K | ₦50,000 | ₦100,000 |
| Above ₦100K | ₦100,000 | Unlimited |

---

## Search Functionality

### Search Execution

**Trigger Points**:
1. User clicks "Search" button after selecting filters
2. User clicks "Apply Filters" in mobile filter modal
3. User navigates to a different page using pagination

### Search Parameters Construction

When a user initiates a search, the system constructs a `SearchParams` object containing:

```typescript
{
  briefType: string;           // "Outright Sales" | "Joint Venture" | "Rent" | "Shortlet"
  page?: number;               // Current page number (default: 1)
  limit?: number;              // Items per page (default: 12)
  location?: string;           // Comma-separated: "state,lga,area"
  priceRange?: {               // Price filter
    min?: number;
    max?: number;
  };
  documentType?: string[];     // Array of selected documents
  bedroom?: number;            // Selected bedroom count
  bathroom?: number;           // Selected bathroom count
  landSizeType?: string;       // "plot" | "acres" | "sqm" | "hectares"
  landSize?: number;           // Numeric land size
  desireFeature?: string[];    // Array of selected features
  homeCondition?: string;      // Selected home condition
  tenantCriteria?: string[];   // Array of selected criteria
  propertyType?: string[];     // Array of selected property types
}
```

### Search Behavior

**Pagination**:
- Default: 12 properties per page
- User can navigate using pagination controls at the bottom
- Each page change triggers a new search request

**Results Display**:
- Properties are displayed in a responsive grid
- Grid layout: 1 column on mobile, 2-4 columns on larger screens
- Cards show property images, details, price, location, and action buttons

**Empty State**:
- If no properties match the search criteria, an empty state message is displayed
- User is prompted to adjust filters or try a different search

**Error Handling**:
- Network errors: Displays error message with retry option
- Timeout: Shows "Request timed out" message
- API failures: Displays appropriate error message

---

## User Interface Components

### Desktop View (≥1024px)

**Top Filter Bar** (Sticky):
- Property Type checkboxes (inline)
- Home Condition checkboxes (Rent tab only, inline)
- Location search input (280px fixed width)
- Price Range dropdown
- Document Type dropdown
- Bedroom selection input
- More Filters button
- Search button

**Active Filters Section**:
- Displays selected filters as removable chips
- "Clear All" option to reset all filters
- Shows active filter summary

**Properties Grid**:
- Responsive 3-4 column layout
- Each property card shows image, type, price, location, beds, baths
- Inspection checkbox (where applicable)
- More actions dropdown menu

**Pagination**:
- Shows current page and total pages
- Previous/Next buttons
- Page number links

### Mobile View (<1024px)

**Filter Button**:
- Single "Filters" button opens full-screen modal
- "Search" button to execute search

**Filter Modal**:
- Full-screen overlay modal
- Scrollable filter options
- All filters consolidated into one interface
- Apply and Clear buttons at bottom

**Properties Grid**:
- 1-2 column responsive layout
- Touch-optimized card design
- Simplified action buttons

**Active Filters**:
- Displayed as horizontal scrollable chips
- Quick removal without reopening modals

---

## Technical Architecture

### State Management

**Context-Based Architecture**:
- `NewMarketplaceContext` manages all marketplace state
- Separate state object for each tab (buyTab, jvTab, rentTab, shortletTab)
- Each tab state includes:
  - `properties`: Array of property objects
  - `searchStatus`: Current search status (pending, success, failed, idle)
  - `currentPage`: Current pagination page
  - `totalPages`: Total number of pages
  - `totalItems`: Total count of matching properties
  - Filter states for location, price, documents, bedrooms, bathrooms, features, criteria

### Component Hierarchy

```
NewMarketplacePage
├── NewMarketPlace (Main Container)
│   ├── Header
│   ├── MarketplaceTabs (Tab Navigation)
│   │   ├── Buy Tab
│   │   │   ├── SearchFilters
│   │   │   ├── PropertyGrid
│   │   │   └── Pagination
│   │   ├── JV Tab
│   │   ├── Rent Tab
│   │   └── Shortlet Tab
│   │
│   └── Filter Modals
│       ├── FilterModal (Mobile)
│       ├── PriceRangeFilter
│       ├── BedroomFilter
│       ├── DocumentTypeFilter
│       └── MoreFiltersModal
```

### Data Flow

```
User Action (Filter Selection/Search)
    ↓
SearchFilters Component (stores local filter state)
    ↓
onSearch() callback
    ↓
searchTabProperties() (Context function)
    ↓
Build API URL with query parameters
    ↓
GET_REQUEST (Axios wrapper)
    ↓
Backend API (/properties/all)
    ↓
Response data
    ↓
Update context state (setTabProperties, setTabSearchStatus, etc.)
    ↓
PropertyGrid re-renders with new data
```

---

## API Integration

### Endpoint

**Base URL**: `${NEXT_PUBLIC_API_URL}/properties/all`

**Example**: `https://khabiteq-realty.onrender.com/api/properties/all`

### HTTP Method

`GET`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `briefType` | string | Yes | "Outright Sales" \| "Joint Venture" \| "Rent" \| "Shortlet" |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 12) |
| `location` | string | No | Comma-separated location (e.g., "Lagos,Lekki,VI") |
| `priceRange` | JSON | No | `{"min": 0, "max": 50000000}` |
| `documentType` | string | No | Comma-separated document types |
| `bedroom` | number | No | Number of bedrooms |
| `bathroom` | number | No | Number of bathrooms |
| `landSizeType` | string | No | "plot" \| "acres" \| "sqm" \| "hectares" |
| `landSize` | number | No | Land size value |
| `desireFeature` | string | No | Comma-separated feature names |
| `homeCondition` | string | No | Property condition |
| `tenantCriteria` | string | No | Comma-separated criteria |
| `type` | string | No | Comma-separated property types |

### Example API Requests

**Buy Properties with Filters**:
```
GET https://khabiteq-realty.onrender.com/api/properties/all?briefType=Outright%20Sales&page=1&limit=12&location=Lagos&priceRange={%22min%22:5000000,%22max%22:20000000}&type=Residential,Duplex&bedroom=3&bathroom=2
```

**Rent Properties**:
```
GET https://khabiteq-realty.onrender.com/api/properties/all?briefType=Rent&page=1&limit=12&location=Lagos,Ikeja&homeCondition=Brand%20New&tenantCriteria=Pets%20Allowed,Furnished
```

**Shortlet Properties**:
```
GET https://khabiteq-realty.onrender.com/api/properties/all?briefType=Shortlet&page=1&limit=12&type=Apartment,Studio&priceRange={%22min%22:10000,%22max%22:50000}
```

### Response Structure

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "property-id-123",
      "propertyType": "Duplex",
      "price": 25000000,
      "location": {
        "state": "Lagos",
        "localGovernment": "Lekki",
        "area": "Victoria Island"
      },
      "noOfBedrooms": 4,
      "noOfBathrooms": 3,
      "images": ["url1", "url2"],
      "docOnProperty": ["Certificate of Occupancy", "Survey Plan"],
      "features": ["Air Conditioning", "Swimming Pool"],
      "isPremium": true,
      "briefType": "Outright Sales"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 48,
    "limit": 12
  }
}
```

**Error Response** (4xx/5xx):
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Error Handling

**Network Errors**:
- Automatic retry logic (up to 2 retries)
- Timeout: 30 seconds per request
- Falls back to demo data if connectivity issues persist

**API Errors**:
- Invalid parameters: 400 Bad Request
- Unauthorized: 401 (triggers re-authentication)
- Server errors: 500 Internal Server Error
- User receives error message with retry option

---

## Filter Configuration

### Configuration File

**Location**: `src/data/filter-data.ts`

**Structure**:
```typescript
FILTER_DATA = {
  buy: {
    usageOptions: { label: "Filter by", options: ["All", "Land", ...] },
    documentTypes: ["Certificate of Occupancy", ...],
    propertyFeatures: ["Air Conditioning", ...],
    landSizeTypes: [{ value: "plot", label: "Plot" }, ...],
    bedroomOptions: [{ value: 1, label: "1 Bedroom" }, ...],
    bathroomOptions: [{ value: 1, label: "1" }, ...],
    priceRanges: [{ label: "Under ₦1M", min: 0, max: 1000000 }, ...]
  },
  jv: { ... },
  rent: { ... },
  shortlet: { ... }
}
```

### Helper Functions

The configuration exports utility functions for retrieving tab-specific data:

- `getTabFilterData(tab)` - Get all filter data for a tab
- `getUsageOptions(tab)` - Get property type options
- `getDocumentTypes(tab)` - Get document type options
- `getPropertyFeatures(tab)` - Get feature options
- `getTenantCriteria(tab)` - Get tenant criteria options
- `getPriceRanges(tab)` - Get price range presets
- `getBedroomOptions(tab)` - Get bedroom options
- `getBathroomOptions(tab)` - Get bathroom options
- `getLandSizeTypes(tab)` - Get land size unit options

### Adding New Filters

**Steps to add a new filter**:

1. **Add to Configuration** (`src/data/filter-data.ts`):
   - Add new property to `TabFilterConfig` interface
   - Add new data to relevant tab objects (buy, jv, rent, shortlet)
   - Create helper function if needed

2. **Update Component State** (e.g., `BuyPropertySearch.tsx`):
   - Add filter to local state
   - Add to `onFilterChange` handler
   - Include in `SearchParams` construction

3. **Update UI Component** (`SearchFilters.tsx`, `FilterModal.tsx`):
   - Add filter input/selection component
   - Wire up `onFilterChange` callback
   - Add to active filters display

4. **Update API Integration** (`new-marketplace-context.tsx`):
   - Add query parameter construction in `searchTabProperties()`
   - Handle response data mapping

---

## User Experience Flow

### 1. Initial Page Load
```
User navigates to /market-place
    ↓
Page loads with "Buy" tab selected by default
    ↓
No properties displayed initially (waiting for search)
    ↓
User sees filter options and empty state
```

### 2. Searching Properties (Desktop)
```
User selects property type checkbox (e.g., "Residential")
    ↓
User enters location (e.g., "Lagos")
    ↓
User selects price range (e.g., "₦10M - ₦20M")
    ↓
User clicks "Search" button
    ↓
API request sent with selected filters
    ↓
Loading spinner displays "Searching properties..."
    ↓
Results display in grid (or empty state if no matches)
    ↓
Active filters shown as removable chips
```

### 3. Searching Properties (Mobile)
```
User opens /market-place on mobile device
    ↓
Sees simplified filter interface with "Filters" button
    ↓
User clicks "Filters" button
    ↓
Full-screen filter modal opens
    ↓
User selects desired filters
    ↓
User clicks "Apply Filters"
    ↓
Modal closes and search executes
    ↓
Results display in responsive grid
```

### 4. Refining Search
```
User views search results
    ↓
User wants to narrow results further
    ↓
User clicks X on price filter chip to remove it
    ↓
Filter is removed from active filters
    ↓
User clicks "Search" to apply updated filters
    ↓
API requests updated search
    ↓
Results refresh with new criteria
```

### 5. Pagination
```
User viewing page 1 of 5 results
    ↓
User scrolls to bottom
    ↓
User clicks page number or "Next" button
    ↓
Pagination change event triggered
    ↓
API request sent for page N
    ↓
Results update to show new page properties
```

### 6. Switching Tabs
```
User viewing Buy tab with results
    ↓
User clicks "Rent" tab
    ↓
Active tab switches (Buy filters preserved in state)
    ↓
Rent tab loads with default state (no search executed)
    ↓
User applies Rent-specific filters
    ↓
Search executes with Rent briefType
```

---

## Mobile vs Desktop

### Desktop Features (≥1024px)

✅ **Sticky filter bar** at top with all filters visible
✅ **Inline property type checkboxes** in filter bar
✅ **Multiple dropdown modals** for price, documents, bedrooms
✅ **Wide property grid** (3-4 columns)
✅ **Search and More Filters buttons** in same row
✅ **Horizontal active filters** display

### Mobile Features (<1024px)

✅ **Collapsible filter modal** (full-screen)
✅ **Simplified filter interface** (all in one modal)
✅ **Touch-optimized buttons** and controls
✅ **Single/Double column property grid**
✅ **Single "Filters" button** to open modal
✅ **Scrollable active filters** chips
✅ **"Selected briefs" button** to view inspection list

### Responsive Breakpoints

- **Mobile**: < 1024px (lg breakpoint)
- **Tablet**: 768px - 1023px (md breakpoint)
- **Desktop**: ≥ 1024px (lg breakpoint)

---

## Filter Summary Table

| Filter | Buy | JV | Rent | Shortlet | Type |
|--------|-----|----|----|---------|------|
| Property Type | ✅ | ✅ | ✅ | ✅ | Checkbox |
| Location | ✅ | ✅ | ✅ | ✅ | Search |
| Price Range | ✅ | ✅ | ✅ | ✅ | Dropdown |
| Document Type | ✅ | ✅ | ✅ | ✅ | Multi-select |
| Bedrooms | ✅ | ✅ | ✅ | ✅ | Single select |
| Bathrooms | ✅ | ✅ | ✅ | ✅ | Single select |
| Home Condition | ❌ | ❌ | ✅ | ✅ | Checkbox |
| Land Size | ✅ | ✅ | ❌ | ❌ | Input |
| Desired Features | ✅ | ✅ | ✅ | ✅ | Multi-select |
| Tenant Criteria | ❌ | ❌ | ✅ | ✅ | Multi-select |

---

## Document Types by Tab

### Buy
- Certificate of Occupancy (C of O)
- Deed of Assignment
- Survey Plan
- Building Plan Approval
- Tax Receipt
- Power of Attorney
- Probate/Letters of Administration
- Gazette
- Registered Conveyance
- Consent to Assignment
- Right of Occupancy
- Customary Right of Occupancy

### Joint Venture (All Buy items + 3 JV-specific)
- All Buy documents, plus:
- Joint Venture Agreement
- Development Agreement
- Partnership Agreement

### Rent
- Certificate of Occupancy (C of O)
- Deed of Assignment
- Survey Plan
- Building Plan Approval
- Tax Receipt
- Tenancy Agreement
- Rent Receipt
- Caution Fee Receipt
- Agency Agreement

### Shortlet
- Certificate of Occupancy
- Deed of Assignment
- Survey Plan
- Building Approval
- Governor's Consent
- Receipt of Purchase
- Customary Right of Occupancy
- Statutory Right of Occupancy
- Power of Attorney
- Probate/Letters of Administration

---

## Key Features

### Search Intelligence
- ✅ Real-time filter updates
- ✅ Quick location autocomplete suggestions
- ✅ Multiple property type selection
- ✅ Custom price range input
- ✅ Feature-based filtering (33+ amenities)

### User-Friendly Interface
- ✅ Sticky filter bar (desktop)
- ✅ Active filters display with quick removal
- ✅ Clear all filters option
- ✅ Visual feedback during search
- ✅ Responsive design for all devices

### Performance
- ✅ Pagination (12 items per page)
- ✅ Request timeout (30 seconds)
- ✅ Automatic retry logic
- ✅ Demo data fallback for connectivity issues
- ✅ Optimized re-renders with React Context

### Accessibility
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Mobile-touch optimized
- ✅ Clear error messages

---

## Troubleshooting

### Common Issues

**1. Search Returns No Results**
- Check if filters are too restrictive
- Try removing optional filters (land size, features, criteria)
- Clear all filters and search with just property type and location

**2. Filters Not Applying**
- Ensure "Search" button was clicked after selecting filters
- Check that filters are shown in active filters section
- Mobile: Confirm "Apply Filters" was clicked in modal

**3. Properties Not Loading**
- Check internet connection
- Wait for timeout and click retry
- Refresh page and try again
- Clear all filters and perform new search

**4. Mobile Modal Not Opening**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try clearing browser cache
- Use latest browser version

---

## File References

**Key Implementation Files**:
- `src/app/market-place/page.tsx` - Main page component
- `src/components/new-marketplace/index.tsx` - Main marketplace wrapper
- `src/context/new-marketplace-context.tsx` - State management and API calls
- `src/components/new-marketplace/search/SearchFilters.tsx` - Filter UI composition
- `src/components/new-marketplace/FilterModal.tsx` - Mobile filter modal
- `src/components/new-marketplace/ActiveFilters.tsx` - Active filters display
- `src/components/new-marketplace/PropertyGrid.tsx` - Property results grid
- `src/data/filter-data.ts` - Filter configuration and options
- `src/utils/URLS.ts` - API endpoint configuration
- `src/utils/requests.ts` - HTTP request utility (GET_REQUEST)

---

## Support & Questions

For issues or questions about marketplace filters and search:
1. Check this documentation first
2. Review the troubleshooting section
3. Inspect browser console for error messages
4. Check API response in Network tab of developer tools

---

**Last Updated**: January 2026
**Document Version**: 1.0
**Status**: Complete
