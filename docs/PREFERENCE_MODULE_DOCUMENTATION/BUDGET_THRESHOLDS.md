# Budget Thresholds

Location and property-type specific minimum budget requirements.

## Overview

Budget thresholds define minimum amounts users must budget for each location and property type combination. These are used to:
1. Validate user input
2. Show warnings if budget too low
3. Filter available features
4. Set realistic expectations

---

## Default Budget Thresholds

### Lagos

| Listing Type | Minimum Amount | Currency | Context |
|---|---|---|---|
| Buy | 5,000,000 | NGN | Residential/Commercial purchase |
| Rent | 200,000 | NGN | Annual rent (monthly: ~16,667) |
| Joint-Venture | 10,000,000 | NGN | Development partnership |
| Shortlet | 15,000 | NGN | Per night |

**Rationale**: Lagos is Nigeria's most expensive market. Prices reflect premium locations (Ikoyi, VI, Lekki).

---

### Abuja

| Listing Type | Minimum Amount | Currency | Context |
|---|---|---|---|
| Buy | 8,000,000 | NGN | Residential/Commercial purchase |
| Rent | 300,000 | NGN | Annual rent |
| Joint-Venture | 15,000,000 | NGN | Development partnership |
| Shortlet | 25,000 | NGN | Per night |

**Rationale**: Abuja has higher price points than Lagos average due to government presence and expatriate demand.

---

### Default (All Other Locations)

| Listing Type | Minimum Amount | Currency | Context |
|---|---|---|---|
| Buy | 2,000,000 | NGN | Residential/Commercial purchase |
| Rent | 100,000 | NGN | Annual rent |
| Joint-Venture | 5,000,000 | NGN | Development partnership |
| Shortlet | 10,000 | NGN | Per night |

**Rationale**: Conservative defaults for smaller cities and towns.

---

## Threshold Configuration

### Data Structure

```typescript
interface BudgetThreshold {
  location: string;           // "Lagos", "Abuja", "default"
  listingType: string;        // "buy", "rent", "joint-venture", "shortlet"
  minAmount: number;          // Minimum budget in Naira or per night
}
```

### Configuration Array

```typescript
export const DEFAULT_BUDGET_THRESHOLDS: BudgetThreshold[] = [
  // Lagos
  { location: "Lagos", listingType: "buy", minAmount: 5000000 },
  { location: "Lagos", listingType: "rent", minAmount: 200000 },
  { location: "Lagos", listingType: "joint-venture", minAmount: 10000000 },
  { location: "Lagos", listingType: "shortlet", minAmount: 15000 },

  // Abuja
  { location: "Abuja", listingType: "buy", minAmount: 8000000 },
  { location: "Abuja", listingType: "rent", minAmount: 300000 },
  { location: "Abuja", listingType: "joint-venture", minAmount: 15000000 },
  { location: "Abuja", listingType: "shortlet", minAmount: 25000 },

  // Default for all other locations
  { location: "default", listingType: "buy", minAmount: 2000000 },
  { location: "default", listingType: "rent", minAmount: 100000 },
  { location: "default", listingType: "joint-venture", minAmount: 5000000 },
  { location: "default", listingType: "shortlet", minAmount: 10000 },
];
```

---

## Threshold Lookup Logic

### Algorithm

```pseudocode
function getMinBudgetForLocation(location, listingType) {
  // Step 1: Look for exact match (case-insensitive location)
  threshold = find(budgetThresholds, {
    location: location.toLowerCase(),
    listingType: listingType
  })
  
  if threshold exists:
    return threshold.minAmount
  
  // Step 2: Fall back to default
  defaultThreshold = find(budgetThresholds, {
    location: "default",
    listingType: listingType
  })
  
  if defaultThreshold exists:
    return defaultThreshold.minAmount
  
  // Step 3: No threshold found
  return 0  // Or throw error
}
```

### Example Usage

```typescript
// Get threshold for Lagos buy
getMinBudgetForLocation("Lagos", "buy")  // Returns: 5,000,000

// Get threshold for Abuja rent
getMinBudgetForLocation("Abuja", "rent")  // Returns: 300,000

// Get threshold for unknown location
getMinBudgetForLocation("Calabar", "buy")  // Returns: 2,000,000 (default)

// Case insensitive
getMinBudgetForLocation("LAGOS", "buy")  // Returns: 5,000,000
```

---

## Validation Usage

### In Budget Validation

```typescript
function validateBudget(minPrice, maxPrice, location, listingType) {
  const errors = [];

  // Basic validation
  if (minPrice <= 0) {
    errors.push("Minimum price must be greater than 0");
  }

  if (maxPrice <= minPrice) {
    errors.push("Maximum price must be greater than minimum price");
  }

  // Threshold validation
  const minimumRequired = getMinBudgetForLocation(location, listingType);
  
  if (minPrice < minimumRequired) {
    errors.push(
      `Your budget is too low for ${location}. ` +
      `Minimum required: ${minimumRequired.toLocaleString('en-NG')} NGN`
    );
  }

  return errors;
}
```

### In Feature Filtering

```typescript
function getAvailableFeatures(propertyType, budget, location, listingType) {
  const config = FEATURE_CONFIGS[propertyType];
  const minimumBudget = getMinBudgetForLocation(location, listingType);
  
  // Filter features based on budget
  const availableFeatures = {
    basic: config.basic || [],
    premium: (config.premium || []).filter(feature => {
      if (!feature.minBudgetRequired) return true;
      return budget >= feature.minBudgetRequired;
    })
  };

  // Also warn if budget below location minimum
  if (budget < minimumBudget) {
    console.warn(
      `Budget (${budget}) is below location minimum (${minimumBudget}). ` +
      `Fewer properties may be available.`
    );
  }

  return availableFeatures;
}
```

---

## Market Context

### Budget Tier Expectations

#### Buy - Lagos Market
```
Budget: 5M - 20M NGN
├─ Likely: Self-con, mini-flats in developing areas
├─ Unlikely: Land, residential compounds, prime locations
└─ Typical location: Outer Lagos (Ikorodu, Badagry)

Budget: 20M - 100M NGN
├─ Likely: 2-3 bed flats, semi-detached houses
├─ Possible: Land in developing areas
└─ Typical location: Lekki, Ajah, Ibeju-Lekki

Budget: 100M - 500M NGN
├─ Likely: 3-4 bed houses, commercial properties
├─ Possible: Prime location land
└─ Typical location: Ikoyi, Victoria Island, Lekki Phase 1

Budget: 500M+ NGN
├─ Likely: Luxury properties, premium locations
├─ Possible: Large estates, development sites
└─ Typical location: Ikoyi, VI, Banana Island
```

#### Rent - Lagos Market
```
Budget: 200K - 500K NGN
├─ Likely: Self-con in outer Lagos, mini-flat in developing area
└─ Typical location: Ikorodu, Badagry, Outer Lagos

Budget: 500K - 2M NGN
├─ Likely: 2-bed flat, mini-flat in good areas
└─ Typical location: Lekki, Ajah, Surulere

Budget: 2M - 5M NGN
├─ Likely: 2-3 bed flat/house in premium areas
└─ Typical location: Ikoyi, VI, Lekki Phase 1

Budget: 5M+ NGN
├─ Likely: Luxury flats, houses in prime locations
└─ Typical location: Ikoyi, VI, Banana Island
```

#### Shortlet - Lagos Market
```
Budget: 15K - 50K/night
├─ Likely: Basic apartments, standard rooms
└─ Typical location: Outer Lagos, developing areas

Budget: 50K - 150K/night
├─ Likely: Mid-range apartments, nice amenities
└─ Typical location: Lekki, Ajah, Ikoyi

Budget: 150K+/night
├─ Likely: Luxury apartments, premium amenities
└─ Typical location: Ikoyi, VI, Banana Island
```

---

## Customization

### Adding New Location

To add budget thresholds for a new location:

1. **Update configuration**:
```typescript
DEFAULT_BUDGET_THRESHOLDS.push(
  { location: "Rivers", listingType: "buy", minAmount: 3000000 },
  { location: "Rivers", listingType: "rent", minAmount: 150000 },
  { location: "Rivers", listingType: "joint-venture", minAmount: 7000000 },
  { location: "Rivers", listingType: "shortlet", minAmount: 12000 }
);
```

2. **Research current market rates** for the location

3. **Document reasoning** in comments

4. **Update dynamically** (if needed):
```typescript
function updateBudgetThresholds(newThresholds) {
  dispatch({
    type: "SET_BUDGET_THRESHOLDS",
    payload: newThresholds
  });
}
```

### Adjusting Thresholds

To adjust thresholds over time (market changes):

1. **Research updated rates**
2. **Update values** in configuration
3. **Backfill historical preferences** if needed
4. **Document change** in CHANGELOG

Example adjustment:
```typescript
// Before: Lagos buy minimum 5M
// After: Lagos buy minimum 8M (market inflation)
{ location: "Lagos", listingType: "buy", minAmount: 8000000 }
```

---

## Validation Rules

### Rule 1: Cannot be zero or negative
```
minimumAmount > 0 ✓
minimumAmount <= 0 ✗
```

### Rule 2: Logical ordering
```
Lagos >= Abuja >= Default ✓
Lagos < Default ✗
```

### Rule 3: Consistency within category
```
All listing types should have thresholds ✓
Some listing types missing ✗
```

---

## User Messaging

### Budget Too Low Warning

```
Your budget of 3,000,000 NGN is below the recommended 
minimum for buying in Lagos (5,000,000 NGN). 

This may limit available properties. Consider:
• Increasing your budget
• Searching in nearby areas
• Looking at rental options instead
```

### Budget Advisory

```
Your budget of 50,000,000 NGN is good for buying in Lagos.
Typical properties available:
• 3-4 bed houses in emerging areas
• Commercial properties in good locations
• Land plots in developing areas
```

---

## Analytics

### Tracking Usage

Monitor these metrics:

```typescript
{
  location: "Lagos",
  listingType: "buy",
  avgBudgetEntered: 125000000,
  medianBudgetEntered: 80000000,
  budgetBelowThreshold: 15,  // % of users
  budgetAboveThreshold: 85,
  avgBudgetSpread: 75000000  // maxBudget - minBudget
}
```

### Optimization

Use analytics to:
- Identify if thresholds too high/low
- Detect market trends
- Adjust thresholds accordingly

---

## Integration Example

### In React Component

```typescript
import { usePreferenceForm } from "@/context/preference-form-context";

export function BudgetStep() {
  const { 
    state, 
    updateFormData, 
    getMinBudgetForLocation 
  } = usePreferenceForm();

  const minimumRequired = getMinBudgetForLocation(
    state.formData.location?.state,
    state.formData.preferenceType
  );

  return (
    <div>
      <label>Minimum Budget</label>
      <input type="number" />
      
      {state.formData.budget?.minPrice < minimumRequired && (
        <div className="text-amber-600">
          Budget below recommended minimum of {minimumRequired.toLocaleString()}
        </div>
      )}
    </div>
  );
}
```

---

## Updates & Maintenance

### Review Schedule
- **Quarterly**: Check if thresholds align with market
- **Annually**: Formal review and adjustment
- **As needed**: Emergency updates for major market changes

### Version History

| Version | Date | Lagos Buy | Abuja Buy | Default Buy |
|---------|------|-----------|-----------|-------------|
| 1.0 | 2024-01-01 | 5M | 8M | 2M |
| 1.1 | 2024-06-01 | 5M | 8M | 2M |
| TBD | TBD | TBD | TBD | TBD |

---

For implementation details, see:
- `src/data/preference-configs.ts` - Configuration
- `src/context/preference-form-context.tsx` - Lookup function
- `src/utils/validation/preference-validation.ts` - Validation usage
