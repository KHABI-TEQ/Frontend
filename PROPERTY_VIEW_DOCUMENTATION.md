# Single Property View - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Structures](#data-structures)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [Display Elements](#display-elements)
7. [User Interactions](#user-interactions)
8. [Modals & Overlays](#modals--overlays)
9. [Image Gallery](#image-gallery)
10. [API Integration](#api-integration)
11. [Location Mapping](#location-mapping)
12. [Usage Guide](#usage-guide)
13. [Integration for Other Apps](#integration-for-other-apps)

---

## Overview

The Single Property View is a comprehensive property detail page that displays complete information about a real estate property. It includes property specifications, images, documents, location mapping, price negotiation, and booking capabilities.

### Key Features
- **Dynamic Routing**: Properties accessed via `/property/[marketType]/[ID]`
- **Image Gallery**: Swiper-based image carousel with thumbnails
- **Video Integration**: Embedded property videos
- **Price Negotiation**: Modal-based negotiation system
- **Shortlet Booking**: Calendar-based booking for short-term stays
- **Document Verification**: Display property documents with verification status
- **Location Mapping**: Interactive map showing property location
- **Share Functionality**: Share property details with others
- **Responsive Design**: Works across all screen sizes
- **Type-Specific Views**: Different UI for Buy, Rent, Shortlet, Joint-Venture

---

## Architecture

### Core Files

```
src/
├── app/
│   └── property/
│       └── [marketType]/
│           └── [ID]/
│               └── page.tsx              # Main property view page
├── types/
│   └── property.types.ts                 # All property-related TypeScript types
├── components/
│   ├── property/
│   │   └── PropertyLocationMap.tsx       # Map component for location
│   ├── modals/
│   │   ├── GlobalPriceNegotiationModal.tsx
│   │   └── AdvancedPriceNegotiationModal.tsx
│   ├── shortlet/
│   │   └── ShortletBookingModal.tsx
│   ├── new-marketplace/modals/
│   │   └── LOIUploadModal.tsx            # Letter of Intent upload
│   └── loading-component/
│       └── loading.tsx                   # Loading state
├── context/
│   ├── selected-briefs-context.tsx       # Brief selection context
│   └── global-property-actions-context.tsx # Global property actions
└── utils/
    ├── axiosConfig.ts                    # API configuration
    ├── URLS.ts                           # API endpoints
    └── helpers.ts                        # Helper functions
```

---

## Data Structures

### Property Details Interface

```typescript
interface PropertyDetails {
  // Identifiers
  _id: string;                           // MongoDB ID
  propertyId: string;                    // Unique property identifier
  
  // Basic Information
  propertyType: string;                  // e.g., "Residential", "Commercial", "Land"
  propertyCategory: string;              // Category type
  propertyStatus: string;                // e.g., "available", "sold", "rented"
  propertyCondition: string;             // "New", "Renovated", "Any"
  
  // Pricing
  price: number;                         // Price in NGN
  
  // Location
  location: {
    state: string;                       // State name (e.g., "Lagos")
    localGovernment: string;             // LGA (e.g., "Lekki")
    area: string;                        // Specific area
    streetAddress?: string;              // Optional street address
  };
  streetAddress?: string;                // Alternative street address field
  
  // Physical Characteristics
  bedRoom: number;                       // Number of bedrooms
  landSize: {
    measurementType: string;             // "sqm", "plot", "hectares"
    size: number | null;                 // Numeric size value
  };
  
  // Additional Features
  additionalFeatures: {
    additionalFeatures: string[];        // Array of feature names
    noOfBedrooms: number;                // Bedroom count
    noOfBathrooms: number;               // Bathroom count
    noOfToilets: number;                 // Toilet count
    noOfCarParks: number;                // Parking spaces
  };
  features: string[];                    // General features list
  
  // Property Specifics
  tenantCriteria: string[];             // For rental properties
  jvConditions: string[];               // For joint-venture properties
  shortletDetails: any;                 // Shortlet-specific details
  
  // Media
  pictures: string[];                   // Array of image URLs
  videos: string[];                     // Array of video URLs
  
  // Documents
  docOnProperty: Array<{
    docName: string;                    // Document type name
    isProvided: boolean;                // Whether provided or not
  }>;
  
  // Ownership & Status
  owner: string;                        // Owner ID or name
  areYouTheOwner: boolean;             // Current user is owner
  isAvailable: boolean;                // Property is available
  isApproved: boolean;                 // Admin approved
  isRejected: boolean;                 // Admin rejected
  isPreference?: boolean;               // Is a preference
  isPremium: boolean;                  // Premium listing
  
  // Timestamps
  createdAt?: string;                   // ISO date string
  updatedAt?: string;                   // ISO date string
  
  // Additional Fields
  briefType: string;                    // Type of brief
  noOfCarParks: number;                 // Car parking spaces
  noOfBathrooms: number;                // Bathroom count
  noOfToilets: number;                  // Toilet count
}
```

### Route Parameters

```typescript
// URL: /property/[marketType]/[ID]

interface PropertyRouteParams {
  marketType: string;  // Type of property market:
                       // - "buy" (for sale properties)
                       // - "rent" (for rental properties)
                       // - "shortlet" (for short-term stays)
                       // - "joint-venture" (for JV properties)
  ID: string;         // Property ID or MongoDB _id
}
```

### Property Owner/Agent Information

```typescript
interface PropertyOwner {
  id: string;                    // Owner ID
  name: string;                  // Owner/Agent name
  email: string;                 // Contact email
  phone: string;                 // Contact phone
  verified: boolean;             // Verification status
}

interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;              // Real estate company
  verified: boolean;
  rating?: number;               // Agent rating (1-5)
}
```

---

## Component Structure

### Page Layout Structure

```
PropertyViewPage
├── Header/Navigation
│   ├── Back button
│   ├── Property title
│   └── Action buttons (Share, Like, etc.)
├── Image Gallery Section
│   ├── Main Swiper carousel
│   │   ├── Primary image
│   │   ├── Video thumbnails
│   │   └── Navigation arrows
│   └── Thumbnail strip
├── Main Content Container
│   ├── Property Overview Section
│   │   ├── Price display
│   │   ├── Property type/category
│   │   ├── Location
│   │   └── Status badge
│   ├── Key Features Section
│   │   ├── Bedrooms
│   │   ├── Bathrooms
│   │   ├── Toilets
│   │   └── Car parks
│   ├── Detailed Description Section
│   │   ├── Property description
│   │   ├── Land size info
│   │   └── Property condition
│   ├── Amenities & Features Section
│   │   └── Feature list
│   ├── Documents & Verification Section
│   │   └── Document status list
│   └── Location Map Section
│       └── PropertyLocationMap component
├── Sidebar/Right Panel
│   ├── Contact card
│   │   ├── Owner/Agent info
│   │   ├── Verification badge
│   │   └── Contact buttons
│   ├── Action buttons
│   │   ├── Message button
│   │   ├── Call button
│   │   ├── Negotiate price (Buy)
│   │   ├── Book now (Shortlet)
│   │   └── Request LOI (JV)
│   └── Property stats
│       ├── Views count
│       └── Likes count
└── Modals (conditional rendering)
    ├── PriceNegotiationModal (for Buy)
    ├── ShortletBookingModal (for Shortlet)
    └── LOIUploadModal (for JV)
```

---

## Data Flow

### 1. Page Load Flow

```
User visits /property/buy/property123
    ↓
Page extracts marketType and ID from URL
    ↓
useEffect triggers on mount
    ↓
Fetch property details from API
    ↓
Set property data to state
    ↓
Render property view with all sections
    ↓
User can interact with property
```

### 2. API Fetch Implementation

```typescript
// Pseudo-code flow
useEffect(() => {
  const fetchProperty = async () => {
    try {
      const response = await api.get(
        `${URLS.GET_PROPERTY}/${marketType}/${propertyID}`
      );
      
      if (response.data) {
        setPropertyDetails(response.data);
        // Update context with selected property
        // Track view analytics
      }
    } catch (error) {
      // Handle error - show error component
    }
  };

  if (propertyID) {
    fetchProperty();
  }
}, [propertyID, marketType]);
```

### 3. Data Dependencies

```
propertyDetails (fetched from API)
    ├── owner information → Contact card
    ├── pictures → Image gallery
    ├── videos → Video section
    ├── location → Map component
    ├── features → Features display
    ├── docOnProperty → Document verification
    ├── price → Price negotiation modal
    └── propertyStatus → Action buttons availability
```

---

## Display Elements

### Property Header Section

Displays at the top with:
- Property title/name
- Location (State, LGA, Area)
- Property type badge
- Premium badge (if applicable)
- Status indicator (Available/Unavailable)

```typescript
// Data mapped from
{
  propertyType: "Residential",
  location: { state: "Lagos", localGovernment: "Lekki", area: "VI" },
  isPremium: true,
  isAvailable: true
}
```

### Price Display

Formatted price with:
- Currency (NGN)
- Negotiation status
- Payment terms (if available)
- Price range (for certain properties)

```typescript
// Display logic
const formattedPrice = price.toLocaleString('en-NG', {
  style: 'currency',
  currency: 'NGN'
});
// Output: "₦50,000,000"
```

### Key Features Grid

Displays property features in grid/card format:

```
├── Bedrooms: 4 beds
├── Bathrooms: 3 baths
├── Toilets: 2 toilets
├── Car Parks: 2 spaces
├── Land Size: 500 sqm
└── Property Condition: New
```

### Amenities & Features List

Long-form features from property:

```typescript
features: [
  "Swimming Pool",
  "Security Cameras",
  "Gym",
  "WiFi",
  "Generator Backup",
  "Ceramic Tiles",
  "Spacious Rooms"
]

// Displayed as:
// • Swimming Pool
// • Security Cameras
// • Gym
// ... etc
```

### Document Verification Section

Shows property documents with status:

```typescript
docOnProperty: [
  { docName: "Certificate of Occupancy", isProvided: true },
  { docName: "Deed of Assignment", isProvided: true },
  { docName: "Consent Letter", isProvided: false },
  { docName: "Land Survey Plan", isProvided: true }
]

// Displayed as checkmarks (✓) or X marks
```

### Image Gallery

```typescript
// Structure
pictures: [
  "https://api.example.com/image1.jpg",
  "https://api.example.com/image2.jpg",
  "https://api.example.com/image3.jpg"
]

videos: [
  "https://youtube.com/embed/video1",
  "https://youtube.com/embed/video2"
]

// Gallery features:
// - Swiper carousel for main images
// - Thumbnail strip at bottom
// - Auto-play option
// - Navigation arrows
// - Play button on video thumbnails
// - Full-screen capability
```

---

## User Interactions

### 1. Image Gallery Interactions

```typescript
// User can:
// - Click prev/next arrows to navigate
// - Click on thumbnails to jump to image
// - Hover on video thumbnail to show play button
// - Click video to open in modal/expand
// - Swipe on mobile (Swiper handles this)

// Implementation:
<Swiper
  modules={[Navigation, Pagination, Autoplay, Thumbs]}
  navigation={{
    prevEl: ".swiper-button-prev",
    nextEl: ".swiper-button-next"
  }}
  thumbs={{ swiper: thumbsSwiper }}
  autoplay={{ delay: 5000 }}
/>
```

### 2. Like/Save Property

```typescript
const handleLike = async () => {
  try {
    // Call API to save property
    await api.post(`${URLS.LIKE_PROPERTY}/${propertyID}`);
    
    // Update UI to show liked status
    setIsLiked(true);
    
    // Update context with liked properties
    addToLikedProperties(propertyID);
    
    toast.success("Property saved to your list");
  } catch (error) {
    toast.error("Failed to save property");
  }
};
```

### 3. Share Property

```typescript
const handleShare = () => {
  const shareUrl = `${window.location.origin}/property/${marketType}/${propertyID}`;
  const shareData = {
    title: propertyTitle,
    text: propertyDescription,
    url: shareUrl
  };

  // Use Web Share API if available
  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  }
};
```

### 4. Contact Owner/Agent

```typescript
const handleContactClick = (type: 'email' | 'phone' | 'message') => {
  if (type === 'email') {
    window.location.href = `mailto:${owner.email}`;
  } else if (type === 'phone') {
    window.location.href = `tel:${owner.phone}`;
  } else if (type === 'message') {
    // Open messaging modal
    openMessagingModal(owner.id);
  }
};
```

### 5. Price Negotiation (Buy Properties)

```typescript
// User clicks "Negotiate Price" button
const handleNegotiateClick = () => {
  setShowPriceNegotiationModal(true);
};

// In modal:
// User enters:
// - Proposed price
// - Negotiation message
// - Preferred contact method

// On submit:
const handleNegotiationSubmit = async (negotiationData) => {
  try {
    const response = await api.post(
      `${URLS.NEGOTIATE_PRICE}`,
      {
        propertyId: propertyID,
        proposedPrice: negotiationData.price,
        message: negotiationData.message,
        contactMethod: negotiationData.method
      }
    );
    
    toast.success("Negotiation request sent");
    setShowPriceNegotiationModal(false);
  } catch (error) {
    toast.error("Failed to send negotiation");
  }
};
```

### 6. Shortlet Booking

```typescript
// User clicks "Book Now" button
const handleBookClick = () => {
  setShowBookingModal(true);
};

// In modal:
// User selects:
// - Check-in date (future dates only)
// - Check-out date (after check-in)
// - Number of guests
// - Special requests

// On submit:
const handleBookingSubmit = async (bookingData) => {
  try {
    const response = await api.post(
      `${URLS.CREATE_BOOKING}`,
      {
        propertyId: propertyID,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        specialRequests: bookingData.requests
      }
    );
    
    toast.success("Booking request submitted");
    setShowBookingModal(false);
    
    // Show booking confirmation
    navigateToBookingConfirmation(response.data.bookingId);
  } catch (error) {
    toast.error("Booking failed. Please try again.");
  }
};
```

### 7. LOI Upload (Joint Venture)

```typescript
// User clicks "Upload LOI" button
const handleLOIClick = () => {
  setShowLOIModal(true);
};

// In modal:
// User can:
// - Upload document file (PDF, Word, Image)
// - Add cover letter
// - Set terms and conditions

// On submit:
const handleLOISubmit = async (loiData) => {
  try {
    const formData = new FormData();
    formData.append('propertyId', propertyID);
    formData.append('document', loiData.file);
    formData.append('coverLetter', loiData.letter);

    const response = await api.post(
      `${URLS.UPLOAD_LOI}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    toast.success("LOI submitted successfully");
    setShowLOIModal(false);
  } catch (error) {
    toast.error("Failed to upload LOI");
  }
};
```

---

## Modals & Overlays

### 1. Price Negotiation Modal

**Triggered by**: "Negotiate Price" button (Buy properties)

**Contents**:
```typescript
interface NegotiationModalData {
  propertyId: string;
  currentPrice: number;
  proposedPrice: number;           // User input
  priceReduction: number;          // Calculated: currentPrice - proposedPrice
  percentageReduction: number;     // Calculated: (reduction / currentPrice) * 100
  negotiationMessage: string;      // Optional message from user
  preferredContactMethod: 'email' | 'phone' | 'message';
  timeValidUntil: string;          // Negotiation expiry (usually 30 days)
}
```

**Validation Rules**:
- Proposed price must be < current price
- Proposed price must be > 0
- Message max 500 characters

### 2. Shortlet Booking Modal

**Triggered by**: "Book Now" button (Shortlet properties)

**Contents**:
```typescript
interface ShortletBookingData {
  propertyId: string;
  checkInDate: Date;              // Must be future date
  checkOutDate: Date;             // Must be after checkInDate
  numberOfNights: number;         // Calculated: (checkOut - checkIn) / days
  numberOfGuests: number;         // 1-maxGuests
  totalPrice: number;             // Calculated from nightly rate
  specialRequests?: string;       // Optional special requests
  contactMethod: 'email' | 'phone';
  acceptTerms: boolean;           // Must accept booking terms
}
```

**Validation Rules**:
- Check-in date cannot be in past
- Check-out date must be after check-in
- Number of guests cannot exceed maxGuests
- Minimum stay requirements if applicable

### 3. LOI Upload Modal

**Triggered by**: "Submit Offer" button (Joint Venture properties)

**Contents**:
```typescript
interface LOIUploadData {
  propertyId: string;
  document: File;                 // PDF, DOC, DOCX, JPG, PNG
  documentType: 'LOI' | 'Expression of Interest';
  coverLetter: string;            // Message to property owner
  proposedTerms?: {
    equityPercentage?: number;
    developmentTimeline?: string;
    fundingCommitment?: string;
  };
  attachments: File[];            // Additional supporting docs
}
```

**Validation Rules**:
- File type must be document or image
- File size < 5MB
- Cover letter max 1000 characters
- Equity percentage (if provided) 0-100

### 4. Image/Video Lightbox

**Triggered by**: Click on image/video in gallery

**Features**:
- Full-screen view of selected image
- Previous/Next navigation
- Close button (X or ESC key)
- Image zoom capability
- Download option

---

## Image Gallery

### Swiper Configuration

```typescript
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';

// Main gallery
<Swiper
  modules={[Navigation, Pagination, Autoplay, Thumbs]}
  spaceBetween={10}
  slidesPerView={1}
  navigation
  pagination={{ clickable: true }}
  autoplay={{ delay: 5000, disableOnInteraction: false }}
  thumbs={{ swiper: thumbsSwiper }}
  className="main-gallery"
>
  {pictures.map((pic, idx) => (
    <SwiperSlide key={idx}>
      <img src={pic} alt={`Property view ${idx + 1}`} />
    </SwiperSlide>
  ))}
  {videos.map((vid, idx) => (
    <SwiperSlide key={`video-${idx}`}>
      <VideoThumbnail src={vid} onClick={handleVideoClick} />
    </SwiperSlide>
  ))}
</Swiper>

// Thumbnails
<Swiper
  onSwiper={setThumbsSwiper}
  spaceBetween={5}
  slidesPerView={6}
  watchSlidesProgress
  className="thumbs-gallery"
>
  {pictures.map((pic, idx) => (
    <SwiperSlide key={idx}>
      <img src={pic} alt={`Thumbnail ${idx + 1}`} />
    </SwiperSlide>
  ))}
</Swiper>
```

### Image Loading

```typescript
// Use Next.js Image component for optimization
import Image from 'next/image';

<Image
  src={propertyImage}
  alt="Property view"
  width={800}
  height={600}
  priority={isMainImage}
  loading={isMainImage ? "eager" : "lazy"}
/>
```

---

## API Integration

### Endpoints Used

```typescript
// Fetch single property details
GET /api/property/[marketType]/[propertyID]
Response: PropertyDetails

// View tracking
POST /api/property/[propertyID]/view
Payload: { userId?, timestamp }

// Like/Save property
POST /api/property/[propertyID]/like
Response: { liked: boolean, totalLikes: number }

// Unlike property
DELETE /api/property/[propertyID]/like
Response: { liked: boolean, totalLikes: number }

// Price negotiation
POST /api/negotiation/create
Payload: {
  propertyId: string,
  proposedPrice: number,
  message: string
}

// Shortlet booking
POST /api/booking/shortlet/create
Payload: {
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  numberOfGuests: number,
  specialRequests?: string
}

// LOI submission
POST /api/loi/upload
Payload: FormData with propertyId, document, coverLetter

// Get similar properties
GET /api/property/similar?
  propertyType=residential&
  location=Lagos&
  excludeId=[propertyID]
Response: PropertyDetails[]

// Contact owner/agent
POST /api/messaging/send
Payload: {
  recipientId: string,
  message: string,
  type: 'inquiry' | 'negotiation' | 'booking'
}
```

### Error Handling

```typescript
// Common error responses
{
  status: 404,
  message: "Property not found",
  data: null
}

{
  status: 403,
  message: "Property is no longer available",
  data: null
}

{
  status: 500,
  message: "Server error. Please try again later.",
  data: null
}

// Handle in component
try {
  const response = await api.get(url);
  setPropertyDetails(response.data);
} catch (error) {
  if (error.response?.status === 404) {
    showNotFound();
  } else if (error.response?.status === 403) {
    showUnavailable();
  } else {
    showError();
  }
}
```

---

## Location Mapping

### PropertyLocationMap Component

```typescript
interface PropertyLocationMapProps {
  property: PropertyDetails;
  displayMode?: 'embedded' | 'modal' | 'fullscreen';
  showAddress?: boolean;
  showOwnerInfo?: boolean;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
}

// Usage
<PropertyLocationMap
  property={propertyDetails}
  displayMode="embedded"
  showAddress={true}
/>
```

### Map Features

- **Address Display**: Full property address
- **Directions Link**: "Get Directions" button to Google Maps
- **Nearby Amenities**: Schools, hospitals, markets (optional)
- **Area Information**: LGA and state details
- **Distance Calculator**: Distance to city center (optional)

### Coordinates

```typescript
// If property has coordinates
property.location.coordinates = {
  latitude: 6.5244,
  longitude: 3.3792
}

// Map centers on these coordinates
// If no coordinates, use area/LGA geocoding
```

---

## Usage Guide

### Basic Implementation

```tsx
// pages/property/[marketType]/[ID]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/axiosConfig';
import { URLS } from '@/utils/URLS';
import PropertyDetailsContent from '@/components/property/PropertyDetailsContent';
import Loading from '@/components/loading-component/loading';

export default function PropertyPage() {
  const params = useParams();
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { marketType, ID } = params;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(
          `${URLS.GET_PROPERTY}/${marketType}/${ID}`
        );
        setPropertyDetails(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ID) fetchProperty();
  }, [ID, marketType]);

  if (loading) return <Loading />;
  if (error || !propertyDetails) return <ErrorComponent />;

  return (
    <PropertyDetailsContent 
      property={propertyDetails}
      marketType={marketType}
    />
  );
}
```

### Displaying Property Information

```tsx
function PropertyHeader({ property }: { property: PropertyDetails }) {
  return (
    <div className="property-header">
      <h1>{property.propertyType} for {marketTypeLabel}</h1>
      
      <div className="property-meta">
        <span className="location">
          {property.location.area}, {property.location.localGovernment}, 
          {property.location.state}
        </span>
        
        <span className="price">
          ₦{property.price.toLocaleString()}
        </span>
        
        <span className="status">
          {property.isAvailable ? 'Available' : 'Not Available'}
        </span>
      </div>
    </div>
  );
}
```

### Handling Property Actions

```tsx
function PropertyActions({ property }: { property: PropertyDetails }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleLike = async () => {
    try {
      await api.post(`${URLS.LIKE_PROPERTY}/${property._id}`);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking property:', error);
    }
  };

  const marketType = property.propertyCategory || 'buy';

  return (
    <div className="property-actions">
      <button onClick={handleLike} className="like-btn">
        {isLiked ? '❤️' : '🤍'} Save
      </button>

      {marketType === 'buy' && (
        <button onClick={() => setShowNegotiationModal(true)}>
          💬 Negotiate Price
        </button>
      )}

      {marketType === 'shortlet' && (
        <button onClick={() => setShowBookingModal(true)}>
          📅 Book Now
        </button>
      )}

      {marketType === 'joint-venture' && (
        <button>📄 Submit Offer</button>
      )}

      {showNegotiationModal && (
        <GlobalPriceNegotiationModal
          propertyId={property._id}
          currentPrice={property.price}
          onClose={() => setShowNegotiationModal(false)}
        />
      )}

      {showBookingModal && (
        <ShortletBookingModal
          propertyId={property._id}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}
```

---

## Integration for Other Apps

### Step 1: Extract Property Types

```typescript
// Copy from src/types/property.types.ts
export interface PropertyDetails { /* ... */ }
export interface PropertyLocation { /* ... */ }
export interface PropertyFeatures { /* ... */ }
// ... etc
```

### Step 2: Create Property Display Component

```tsx
// components/PropertyView.tsx
import { PropertyDetails } from '@/types/property.types';

export function PropertyView({ property }: { property: PropertyDetails }) {
  return (
    <div className="property-view">
      {/* Render property information */}
      <img src={property.pictures[0]} alt="Property" />
      <h1>{property.propertyType}</h1>
      <p>₦{property.price.toLocaleString()}</p>
      {/* ... more content ... */}
    </div>
  );
}
```

### Step 3: Fetch Properties Dynamically

```tsx
async function getProperty(marketType: string, propertyId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/property/${marketType}/${propertyId}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }
  
  return response.json() as Promise<PropertyDetails>;
}
```

### Step 4: Integrate into Your Pages

```tsx
import { PropertyView } from '@/components/PropertyView';
import { getProperty } from '@/services/property';

export default async function PropertyPage({ 
  params 
}: { 
  params: { marketType: string; id: string } 
}) {
  const property = await getProperty(params.marketType, params.id);
  
  return <PropertyView property={property} />;
}
```

### Step 5: Customize for Your Design

```typescript
// Create customized components based on your design system
// Use the PropertyDetails interface to structure your data
// Adapt the modals and interactions to your UX patterns

// Example: Custom property card for listing
interface PropertyCardProps {
  property: PropertyDetails;
  onSelect: (id: string) => void;
}

function PropertyCard({ property, onSelect }: PropertyCardProps) {
  return (
    <div onClick={() => onSelect(property._id)}>
      <img src={property.pictures[0]} />
      <h3>{property.propertyType}</h3>
      <p>₦{property.price.toLocaleString()}</p>
      <p>{property.location.area}, {property.location.state}</p>
    </div>
  );
}
```

---

## Performance Optimization

### 1. Image Optimization

```typescript
// Use Next.js Image component
<Image
  src={property.pictures[0]}
  alt="Property image"
  width={800}
  height={600}
  priority        // For main image
  quality={75}    // Balance quality vs size
/>

// Lazy load gallery images
<SwiperSlide>
  <img loading="lazy" src={picture} alt="Property" />
</SwiperSlide>
```

### 2. API Call Optimization

```typescript
// Cache property details with SWR
import useSWR from 'swr';

const fetcher = (url) => api.get(url).then(res => res.data);

const { data: property, isLoading } = useSWR(
  `/api/property/${marketType}/${id}`,
  fetcher,
  { revalidateOnFocus: false }
);
```

### 3. Component Memoization

```typescript
// Memoize expensive components
const PropertyGallery = React.memo(({ pictures, videos }) => (
  // Gallery implementation
));

const PropertyDetails = React.memo(({ property }) => (
  // Details implementation
));
```

---

## Troubleshooting

### Issue: Images not loading
**Solution**: Check image URLs are valid, check CORS settings on image server

### Issue: Map not displaying location
**Solution**: Verify coordinates are present, check map API key configuration

### Issue: Modal not opening
**Solution**: Check modal component is properly imported, verify state management

### Issue: Negotiation modal not submitting
**Solution**: Check API endpoint URL, verify request payload format

---

## API Response Examples

### Successful Property Fetch

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "propertyId": "PROP-2024-001",
    "propertyType": "Residential",
    "price": 50000000,
    "location": {
      "state": "Lagos",
      "localGovernment": "Lekki",
      "area": "Victoria Island",
      "streetAddress": "123 Banana Island Road"
    },
    "bedRoom": 4,
    "additionalFeatures": {
      "noOfBathrooms": 3,
      "noOfToilets": 2,
      "noOfCarParks": 2,
      "additionalFeatures": ["Swimming Pool", "Generator", "Solar Panels"]
    },
    "pictures": [
      "https://api.example.com/images/prop1.jpg",
      "https://api.example.com/images/prop2.jpg"
    ],
    "videos": [
      "https://youtube.com/embed/abc123"
    ],
    "isAvailable": true,
    "isApproved": true,
    "owner": "User123",
    "isPremium": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

