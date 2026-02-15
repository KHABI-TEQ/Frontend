# Feature Configurations

Complete feature specifications for all property types and preference categories.

## Overview

Features are organized by property type and category (basic/premium/comfort). Each feature can have a minimum budget requirement.

## Configuration Structure

```typescript
interface FeatureConfig {
  basic: FeatureDefinition[];
  premium: FeatureDefinition[];
  comfort?: FeatureDefinition[];  // Shortlet only
}

interface FeatureDefinition {
  name: string;
  type: "basic" | "premium" | "comfort";
  minBudgetRequired?: number;
  tooltip?: string;
}
```

---

## Buy - Residential

### Basic Features (18 items)
- Kitchenette
- Security Cameras
- Children Playground
- Open Floor Plan
- Walk-in Closet
- WiFi
- Library
- Home Office
- Bathtub
- Garage
- Staff Room
- Pantry
- Built-in Cupboards
- Security Post
- Access Gate
- Air Conditioner
- Wheelchair Friendly
- Garden

### Premium Features (11 items)
- Gym House
- Swimming Pool
- Outdoor Kitchen
- Rooftops
- In-house Cinema
- Tennis Court
- Elevator
- Electric Fencing
- Inverter
- Sea View
- Jacuzzi

---

## Buy - Commercial

### Basic Features (9 items)
- Power Supply
- Water Supply
- Air Conditioning
- Parking Space
- Security
- Internet (Wi-Fi)
- Reception Area
- Elevator
- Standby Generator

### Premium Features (9 items)
- Central Cooling System
- Fire Safety Equipment
- Industrial Lift
- CCTV Monitoring System
- Conference Room
- Fiber Optic Internet
- Backup Solar/Inverter
- Loading Dock
- Smart Building Automation

---

## Buy - Land

### Basic Features
(None - land doesn't have built features)

### Premium Features
(None - features apply to developments)

---

## Rent - Residential

### Basic Features (18 items)
Same as Buy-Residential basic features

### Premium Features (11 items)
Same as Buy-Residential premium features

---

## Rent - Commercial

### Basic Features (9 items)
Same as Buy-Commercial basic features

### Premium Features (9 items)
Same as Buy-Commercial premium features

---

## Joint Venture - Residential

### Basic Features (18 items)
Same as Buy-Residential basic features

### Premium Features (11 items)
Same as Buy-Residential premium features

---

## Joint Venture - Commercial

### Basic Features (9 items)
Same as Buy-Commercial basic features

### Premium Features (9 items)
Same as Buy-Commercial premium features

---

## Joint Venture - Land

### Basic Features
(None)

### Premium Features
(None)

---

## Shortlet

### Basic Features (8 items)
- Wi-Fi
- Air Conditioning
- Power Supply
- Security
- Parking
- Clean Water
- Kitchen
- Clean Bathroom

### Comfort Features (8 items)
- Laundry
- Smart TV / Netflix
- Balcony
- Housekeeping
- Breakfast Included
- Private Entrance
- POP Ceiling
- Access Gate

### Premium Features (10 items)
- Gym Access
- Swimming Pool
- Inverter / Solar Backup
- Rooftop Lounge
- Jacuzzi
- Sea View
- Pet-Friendly
- Outdoor Kitchen
- Smart Lock
- Close to Major Attractions

---

## Feature Configuration Keys

The configuration is accessed using these keys:

```
"buy-residential"
"buy-commercial"
"buy-land"
"rent-residential"
"rent-commercial"
"rent-land"
"joint-venture-residential"
"joint-venture-commercial"
"joint-venture-land"
"shortlet"
```

---

## Feature Selection Rules

### Basic Features
- ✅ Always available
- ✅ No budget minimum
- ✅ Recommended for all budgets
- ✅ Multiple selections allowed

### Premium Features
- ✅ May require minimum budget (varies by feature)
- ✅ Optional selections
- ✅ Multiple selections allowed
- ⚠️ Check budget availability

### Comfort Features (Shortlet Only)
- ✅ Optional enhancements
- ✅ No budget minimum
- ✅ Multiple selections allowed

---

## Adding New Features

To add a new feature to the configuration:

1. **Define the feature**:
```typescript
{
  name: "Feature Name",
  type: "basic" | "premium" | "comfort",
  minBudgetRequired?: 50000000,  // Optional
  tooltip?: "Description of feature"
}
```

2. **Add to correct category**:
```typescript
FEATURE_CONFIGS["property-type"] = {
  basic: [..., newFeature],
  premium: [...],
  comfort: [...]  // if applicable
}
```

3. **Update feature validation** in preference-validation.ts if needed

4. **Test** feature availability with:
   - Budget below minBudgetRequired (should be filtered)
   - Budget above minBudgetRequired (should be available)

---

## Feature Availability Logic

Features become unavailable when:

1. **Budget insufficient**:
   - User budget < feature.minBudgetRequired
   - Feature marked as premium and auto-adjust = true

2. **Feature removed from configuration**:
   - Version update removes a feature
   - Property type changed

3. **User action**:
   - Explicitly deselected by user
   - Auto-adjusted due to budget reduction

---

## Budget-Feature Mapping

### Residential - Common Budget Tiers

**Budget < 20,000,000 NGN**:
```
Available: All basic features
Blocked: Swimming Pool, Tennis Court, In-house Cinema, 
         Gym House, Outdoor Kitchen, Sea View
```

**Budget 20,000,000 - 50,000,000 NGN**:
```
Available: All basic + most premium features
Blocked: Tennis Court, In-house Cinema (may require > 50M)
```

**Budget > 50,000,000 NGN**:
```
Available: All features
Blocked: None
```

### Commercial - Common Budget Tiers

**Budget < 50,000,000 NGN**:
```
Available: All basic features
Blocked: Advanced HVAC, Industrial equipment, 
         Smart building systems
```

**Budget > 50,000,000 NGN**:
```
Available: All features
Blocked: None
```

### Shortlet - Budget Tiers

**Budget < 100,000 NGN/night**:
```
Available: All basic features
Blocked: Premium features requiring luxury status
```

**Budget 100,000 - 200,000 NGN/night**:
```
Available: Basic + most comfort features
Blocked: Luxury premium features (Jacuzzi, Sea View)
```

**Budget > 200,000 NGN/night**:
```
Available: All features
Blocked: None
```

---

## Feature Descriptions

### Residential Features

**Basic**:
- **Kitchenette**: Equipped cooking area
- **Security Cameras**: CCTV surveillance system
- **Children Playground**: Dedicated kids play area
- **Open Floor Plan**: Spacious uninterrupted layout
- **Walk-in Closet**: Large closet with separate entrance
- **WiFi**: High-speed internet connectivity
- **Library**: Dedicated reading/study room
- **Home Office**: Equipped workspace
- **Bathtub**: Full bathing facility
- **Garage**: Covered vehicle parking
- **Staff Room**: Accommodation for domestic staff
- **Pantry**: Food storage room
- **Built-in Cupboards**: Custom storage solutions
- **Security Post**: Gate house/guard station
- **Access Gate**: Gated entrance with access control
- **Air Conditioner**: Climate control system
- **Wheelchair Friendly**: Accessibility features
- **Garden**: Landscaped outdoor space

**Premium**:
- **Gym House**: Full fitness facility
- **Swimming Pool**: Olympic/recreational pool
- **Outdoor Kitchen**: Patio cooking area
- **Rooftops**: Accessible rooftop space
- **In-house Cinema**: Home theater system
- **Tennis Court**: Tennis playing facility
- **Elevator**: Vertical transportation
- **Electric Fencing**: Security perimeter
- **Inverter**: Backup power system
- **Sea View**: Oceanfront location
- **Jacuzzi**: Hot tub/spa facility

### Commercial Features

**Basic**:
- **Power Supply**: Reliable electricity
- **Water Supply**: Running water system
- **Air Conditioning**: Climate control
- **Parking Space**: Vehicle parking facilities
- **Security**: Security systems/personnel
- **Internet (Wi-Fi)**: Connectivity
- **Reception Area**: Visitor reception space
- **Elevator**: Vertical transportation
- **Standby Generator**: Backup power

**Premium**:
- **Central Cooling System**: Enterprise HVAC
- **Fire Safety Equipment**: Fire suppression systems
- **Industrial Lift**: Heavy-duty elevator
- **CCTV Monitoring System**: Advanced surveillance
- **Conference Room**: Meeting facilities
- **Fiber Optic Internet**: High-speed connectivity
- **Backup Solar/Inverter**: Green energy backup
- **Loading Dock**: Goods handling area
- **Smart Building Automation**: Integrated controls

### Shortlet Features

**Basic**:
- **Wi-Fi**: Internet connectivity
- **Air Conditioning**: Climate control
- **Power Supply**: Reliable electricity
- **Security**: Secure premises
- **Parking**: Vehicle parking
- **Clean Water**: Potable water supply
- **Kitchen**: Cooking facilities
- **Clean Bathroom**: Sanitized facilities

**Comfort**:
- **Laundry**: Washing/drying facilities
- **Smart TV / Netflix**: Entertainment system
- **Balcony**: Outdoor space
- **Housekeeping**: Cleaning service
- **Breakfast Included**: Morning meal provided
- **Private Entrance**: Separate entry
- **POP Ceiling**: Decorative ceiling finish
- **Access Gate**: Secure gated entrance

**Premium**:
- **Gym Access**: Fitness facility
- **Swimming Pool**: Pool access
- **Inverter / Solar Backup**: Power backup
- **Rooftop Lounge**: Rooftop entertainment space
- **Jacuzzi**: Hot tub facility
- **Sea View**: Oceanfront location
- **Pet-Friendly**: Pets allowed
- **Outdoor Kitchen**: Patio cooking
- **Smart Lock**: Digital access control
- **Close to Major Attractions**: Convenient location

---

## Property Type Feature Mapping

| Feature | Buy Res | Rent Res | JV Res | Shortlet |
|---------|---------|----------|--------|----------|
| WiFi | ✅ | ✅ | ✅ | ✅ |
| Security Cameras | ✅ | ✅ | ✅ | ❌ |
| Parking | ❌ | ❌ | ❌ | ✅ |
| Swimming Pool | ✅ | ✅ | ✅ | ✅ |
| Gym House | ✅ | ✅ | ✅ | ✅ |
| CCTV System | ❌ | ❌ | ❌ | ❌ |
| Conference Room | ❌ | ❌ | ❌ | ❌ |

---

## Exporting Feature Configurations

### For API Integration
```typescript
// Export current features
const features = getAvailableFeatures(propertyType, budget);
const payload = {
  baseFeatures: features.basic,
  premiumFeatures: features.premium,
  autoAdjustToFeatures: autoAdjust
};
```

### For Database Storage
```typescript
// Store selected features
const selectedFeatures = {
  propertyType: "buy-residential",
  basic: ["WiFi", "Security Cameras"],
  premium: ["Swimming Pool"],
  timestamp: new Date()
};
```

### For Reporting
```typescript
// Generate feature report
const report = {
  propertyType: "buy-residential",
  totalAvailable: 29,
  basicAvailable: 18,
  premiumAvailable: 11,
  selected: 3,
  selectedBreakdown: {
    basic: 2,
    premium: 1
  }
};
```

---

## Configuration Updates

To update feature configurations:

1. **Edit** `src/data/preference-configs.ts`
2. **Update** FEATURE_CONFIGS object
3. **Test** feature availability with various budgets
4. **Document** changes in CHANGELOG
5. **Deploy** and monitor feature selection patterns

---

## Feature Analytics

Track these metrics for optimization:

- **Most Selected Features** by property type
- **Budget Distribution** across selections
- **Feature Availability** impact on selections
- **Auto-Adjust Usage** and impact

---

For implementation, see:
- `src/data/preference-configs.ts` - Configuration data
- `src/context/preference-form-context.tsx` - Feature logic
- `src/types/preference-form.ts` - Type definitions
