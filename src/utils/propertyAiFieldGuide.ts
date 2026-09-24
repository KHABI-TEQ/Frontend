/**
 * Property listing AI conversation — missing-field checklist aligned with
 * manual post-property forms (`shouldShowField` + step-1 field order).
 */

import {
  BRIEF_TYPES,
  PROPERTY_CATEGORIES,
  briefTypeConfig,
  buildingTypeOptions,
  documentOptions,
  getFeaturesByCategory,
  jvConditions,
  offPlanDevelopmentStageOptions,
  offPlanPaymentPlanOptions,
  propertyConditionOptions,
  shouldShowField,
} from "@/data/comprehensive-post-property-config";
import {
  applySmartLocationFromNaturalText,
  sanitizeConversationLocation,
} from "@/utils/preference-ai-conversation";
import { PILOT_STATE } from "@/utils/location-utils";

export const PROPERTY_AI_FIELD = {
  LISTING_TYPE: "listingType",
  CATEGORY: "propertyCategory",
  STATE: "state",
  LGA: "localGovernment",
  AREA: "area",
  ESTATE: "estate",
  MIN_PRICE: "minPrice",
  MAX_PRICE: "maxPrice",
  PRICE: "price",
  DESCRIPTION: "description",
  PROPERTY_CONDITION: "propertyCondition",
  LAND_SIZE: "landSize",
  TYPE_OF_BUILDING: "typeOfBuilding",
  BEDROOMS: "bedrooms",
  BATHROOMS: "bathrooms",
  TOILETS: "toilets",
  ROOMS: "rooms",
  PARKING: "parkingSpaces",
  DOCUMENTS: "documents",
  RENTAL_TYPE: "rentalType",
  LEASE_HOLD: "leaseHold",
  MAX_GUESTS: "maxGuests",
  DEVELOPMENT_STAGE: "developmentStage",
  PAYMENT_PLAN: "paymentPlan",
  EXPECTED_COMPLETION: "expectedCompletionDate",
  JV_CONDITIONS: "jvConditions",
  FEATURES: "features",
} as const;

export type PropertyAiFieldId = (typeof PROPERTY_AI_FIELD)[keyof typeof PROPERTY_AI_FIELD];

const LISTING_TYPE_LABEL =
  "property type — start with Sale, Off-Plan, Rent, Shortlet, or JV (listing type on the form)";

const FIELD_LABELS: Record<PropertyAiFieldId, string> = {
  [PROPERTY_AI_FIELD.LISTING_TYPE]: LISTING_TYPE_LABEL,
  [PROPERTY_AI_FIELD.CATEGORY]: "property category (e.g. Residential, Commercial, Land)",
  [PROPERTY_AI_FIELD.STATE]: "state (required)",
  [PROPERTY_AI_FIELD.LGA]: "local government / LGA (required by the form)",
  [PROPERTY_AI_FIELD.AREA]: "area (required by the form)",
  [PROPERTY_AI_FIELD.ESTATE]: "estate (optional — gated community or estate name)",
  [PROPERTY_AI_FIELD.MIN_PRICE]: "minimum price in Naira",
  [PROPERTY_AI_FIELD.MAX_PRICE]: "maximum / asking price in Naira",
  [PROPERTY_AI_FIELD.PRICE]: "price in Naira (required — comma-separated e.g. 85,000,000, as on the form)",
  [PROPERTY_AI_FIELD.DESCRIPTION]: "description of the property",
  [PROPERTY_AI_FIELD.PROPERTY_CONDITION]: "property condition (e.g. new, fairly used, renovated)",
  [PROPERTY_AI_FIELD.LAND_SIZE]: "land size (measurement type and numeric size, e.g. 500 Square Meter)",
  [PROPERTY_AI_FIELD.TYPE_OF_BUILDING]: "type of building (e.g. flat, duplex, terrace, detached house)",
  [PROPERTY_AI_FIELD.BEDROOMS]: "number of bedrooms",
  [PROPERTY_AI_FIELD.BATHROOMS]: "number of bathrooms",
  [PROPERTY_AI_FIELD.TOILETS]: "number of toilets",
  [PROPERTY_AI_FIELD.ROOMS]: "number of bedrooms, bathrooms, and toilets",
  [PROPERTY_AI_FIELD.PARKING]: "parking spaces (number of car parks, or 0 for none)",
  [PROPERTY_AI_FIELD.DOCUMENTS]: "property documents / title (e.g. C of O, governor's consent)",
  [PROPERTY_AI_FIELD.RENTAL_TYPE]: "rental type (Rent or Lease, as on the rent form)",
  [PROPERTY_AI_FIELD.LEASE_HOLD]: "lease hold duration (for Lease listings)",
  [PROPERTY_AI_FIELD.MAX_GUESTS]: "maximum guests (shortlet form)",
  [PROPERTY_AI_FIELD.DEVELOPMENT_STAGE]: "off-plan development stage",
  [PROPERTY_AI_FIELD.PAYMENT_PLAN]: "off-plan payment plan",
  [PROPERTY_AI_FIELD.EXPECTED_COMPLETION]: "off-plan expected completion date",
  [PROPERTY_AI_FIELD.JV_CONDITIONS]: "joint venture conditions",
  [PROPERTY_AI_FIELD.FEATURES]: "key features (e.g. parking, generator, security, water supply)",
};

/** Map UI brief label → form `propertyType`. */
export function briefTypeLabelToPropertyType(label: string): string | null {
  const t = label.toLowerCase();
  if (t.includes("joint venture") || t === "jv") return BRIEF_TYPES.JV;
  if (t.includes("shortlet")) return BRIEF_TYPES.SHORTLET;
  if (t.includes("rent")) return BRIEF_TYPES.RENT;
  if (t.includes("off-plan") || t.includes("off plan")) return BRIEF_TYPES.OFF_PLAN;
  if (t.includes("sale") || t.includes("sell") || t.includes("outright")) return BRIEF_TYPES.SELL;
  return null;
}

export function fieldLabelForPropertyAiField(id: PropertyAiFieldId): string {
  return FIELD_LABELS[id];
}

/** Stable key for skip tracking — maps legacy/long labels to one id. */
export function canonicalPropertyAiFieldKey(field: string): string {
  const f = field.toLowerCase();
  if (f.includes("listing type") || (f.includes("property type") && f.includes("sale"))) {
    return PROPERTY_AI_FIELD.LISTING_TYPE;
  }
  if (f.includes("category")) return PROPERTY_AI_FIELD.CATEGORY;
  if (f.includes("state") && !f.includes("estate")) return PROPERTY_AI_FIELD.STATE;
  if (f.includes("lga") || f.includes("local government")) return PROPERTY_AI_FIELD.LGA;
  if (f.includes("estate")) return PROPERTY_AI_FIELD.ESTATE;
  if (f.includes("area") && !f.includes("square")) return PROPERTY_AI_FIELD.AREA;
  if (f.includes("min price") || f.includes("minimum price")) return PROPERTY_AI_FIELD.MIN_PRICE;
  if (f.includes("max price") || f.includes("maximum") || f.includes("asking price")) {
    return PROPERTY_AI_FIELD.MAX_PRICE;
  }
  if (f.includes("price") || f.includes("naira")) return PROPERTY_AI_FIELD.PRICE;
  if (f.includes("description")) return PROPERTY_AI_FIELD.DESCRIPTION;
  if (f.includes("condition")) return PROPERTY_AI_FIELD.PROPERTY_CONDITION;
  if (f.includes("land size") || f.includes("measurement type")) return PROPERTY_AI_FIELD.LAND_SIZE;
  if (f.includes("building")) return PROPERTY_AI_FIELD.TYPE_OF_BUILDING;
  if (f.includes("number of bedrooms") || (f.includes("bedroom") && !f.includes("bathroom"))) {
    return PROPERTY_AI_FIELD.BEDROOMS;
  }
  if (f.includes("number of bathrooms") || (f.includes("bathroom") && !f.includes("toilet"))) {
    return PROPERTY_AI_FIELD.BATHROOMS;
  }
  if (f.includes("number of toilets") || f.includes("toilet")) return PROPERTY_AI_FIELD.TOILETS;
  if (f.includes("bedroom") || f.includes("bathroom") || f.includes("toilet")) {
    return PROPERTY_AI_FIELD.ROOMS;
  }
  if (f.includes("parking") || f.includes("car park")) return PROPERTY_AI_FIELD.PARKING;
  if (f.includes("document") || f.includes("title")) return PROPERTY_AI_FIELD.DOCUMENTS;
  if (f.includes("lease hold") || f.includes("leasehold")) return PROPERTY_AI_FIELD.LEASE_HOLD;
  if (f.includes("rental type") || (f.includes("lease") && !f.includes("hold"))) {
    return PROPERTY_AI_FIELD.RENTAL_TYPE;
  }
  if (f.includes("guest")) return PROPERTY_AI_FIELD.MAX_GUESTS;
  if (f.includes("development stage")) return PROPERTY_AI_FIELD.DEVELOPMENT_STAGE;
  if (f.includes("payment plan")) return PROPERTY_AI_FIELD.PAYMENT_PLAN;
  if (f.includes("completion")) return PROPERTY_AI_FIELD.EXPECTED_COMPLETION;
  if (f.includes("joint venture condition") || f.includes("jv condition")) {
    return PROPERTY_AI_FIELD.JV_CONDITIONS;
  }
  if (f.includes("features") || f.includes("amenities")) return PROPERTY_AI_FIELD.FEATURES;
  return field;
}

export function isPropertyAiFieldSkippable(fieldId: PropertyAiFieldId | string): boolean {
  const key = canonicalPropertyAiFieldKey(fieldId);
  return key === PROPERTY_AI_FIELD.FEATURES || key === PROPERTY_AI_FIELD.ESTATE;
}

function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value) && value >= 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function listingType(data: Record<string, unknown>): string {
  const t = String(data.propertyType || "").toLowerCase().trim();
  if (
    [
      BRIEF_TYPES.SELL,
      BRIEF_TYPES.OFF_PLAN,
      BRIEF_TYPES.RENT,
      BRIEF_TYPES.SHORTLET,
      BRIEF_TYPES.JV,
    ].includes(t as typeof BRIEF_TYPES.SELL)
  ) {
    return t;
  }
  return "";
}

function category(data: Record<string, unknown>): string {
  return String(data.propertyCategory || "").trim();
}

function additionalFeatures(data: Record<string, unknown>): Record<string, unknown> {
  return (data.additionalFeatures || {}) as Record<string, unknown>;
}

function getParkingCount(data: Record<string, unknown>): number | undefined {
  const add = additionalFeatures(data);
  const raw =
    add.noOfCarPark ??
    add.noOfCarParks ??
    add.parkingSpaces ??
    add.carPark ??
    add.carParks ??
    data.parkingSpaces ??
    data.parkingSpace ??
    data.noOfCarPark ??
    data.noOfCarParks;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0) return undefined;
  return n;
}

/** Merge API additionalFeatures without letting null/empty API values wipe local answers. */
function mergeAdditionalFeaturesRecords(
  local: Record<string, unknown>,
  api: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...local };
  for (const [key, value] of Object.entries(api)) {
    if (value === null || value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

function getRoomCounts(data: Record<string, unknown>): {
  bedrooms?: number;
  sittingRooms?: number;
  bathrooms?: number;
  toilets?: number;
} {
  const add = additionalFeatures(data);
  const out: { bedrooms?: number; sittingRooms?: number; bathrooms?: number; toilets?: number } = {};
  const bed = add.noOfBedroom ?? data.bedrooms;
  const sitting = add.noOfSittingRoom ?? data.sittingRooms;
  const bath = add.noOfBathroom ?? data.bathrooms;
  const toilet = add.noOfToilet ?? data.toilets;
  if (bed !== undefined && bed !== null && bed !== "") {
    const n = Number(bed);
    if (!Number.isNaN(n) && n >= 0) out.bedrooms = n;
  }
  if (sitting !== undefined && sitting !== null && sitting !== "") {
    const n = Number(sitting);
    if (!Number.isNaN(n) && n >= 0) out.sittingRooms = n;
  }
  if (bath !== undefined && bath !== null && bath !== "") {
    const n = Number(bath);
    if (!Number.isNaN(n) && n >= 0) out.bathrooms = n;
  }
  if (toilet !== undefined && toilet !== null && toilet !== "") {
    const n = Number(toilet);
    if (!Number.isNaN(n) && n >= 0) out.toilets = n;
  }
  return out;
}

function getLandSize(data: Record<string, unknown>): { measurementType?: string; size?: number } {
  const landSizeObj = data.landSize as { measurementType?: string; size?: number } | undefined;
  const add = additionalFeatures(data);
  const measurementType =
    (isMeaningful(landSizeObj?.measurementType) ? String(landSizeObj!.measurementType) : "") ||
    (isMeaningful(data.measurementType) ? String(data.measurementType) : "") ||
    (isMeaningful(add.measurementType) ? String(add.measurementType) : "");
  let size: number | undefined;
  if (landSizeObj?.size != null && !Number.isNaN(Number(landSizeObj.size)) && Number(landSizeObj.size) > 0) {
    size = Number(landSizeObj.size);
  } else if (isMeaningful(data.landSize) && typeof data.landSize === "string") {
    const digits = data.landSize.replace(/\D/g, "");
    if (digits && Number(digits) > 0) size = Number(digits);
  } else if (add.landSize != null || add.plotSize != null) {
    const raw = add.landSize ?? add.plotSize;
    const n = Number(raw);
    if (!Number.isNaN(n) && n > 0) size = n;
  }
  return {
    measurementType: measurementType || undefined,
    size,
  };
}

/** Unify API + local keys so missing-field checks do not repeat the same question. */
export function normalizePropertyAiCollectedData(data: Record<string, unknown>): Record<string, unknown> {
  const next = { ...data };
  const add = { ...additionalFeatures(next) };
  const rooms = getRoomCounts(next);
  if (rooms.bedrooms !== undefined) {
    add.noOfBedroom = rooms.bedrooms;
    next.bedrooms = rooms.bedrooms;
  }
  if (rooms.sittingRooms !== undefined) {
    add.noOfSittingRoom = rooms.sittingRooms;
    next.sittingRooms = rooms.sittingRooms;
  }
  if (rooms.bathrooms !== undefined) {
    add.noOfBathroom = rooms.bathrooms;
    next.bathrooms = rooms.bathrooms;
  }
  if (rooms.toilets !== undefined) {
    add.noOfToilet = rooms.toilets;
    next.toilets = rooms.toilets;
  }
  const parking = getParkingCount(next);
  if (parking !== undefined) {
    add.noOfCarPark = parking;
    add.noOfCarParks = parking;
    add.parkingSpaces = parking;
    add.carPark = parking;
    add.carParks = parking;
    next.parkingSpaces = parking;
    next.noOfCarPark = parking;
  }
  const land = getLandSize(next);
  if (land.measurementType || land.size != null) {
    next.landSize = {
      measurementType: land.measurementType || "",
      size: land.size ?? 0,
    };
    if (land.measurementType) next.measurementType = land.measurementType;
  }
  next.additionalFeatures = add;
  const loc = (next.location || {}) as Record<string, unknown>;
  next.location = { ...loc, state: PILOT_STATE };
  const brief = listingType(next);
  if (brief === BRIEF_TYPES.SHORTLET && !isMeaningful(next.propertyCategory)) {
    next.propertyCategory = PROPERTY_CATEGORIES.RESIDENTIAL;
  }
  const askingDigits = priceDigitsOf(next.maxPrice ?? next.price);
  if (askingDigits) {
    next.maxPrice = askingDigits;
    next.price = askingDigits;
  }
  const minDigits = priceDigitsOf(next.minPrice);
  if (minDigits) next.minPrice = minDigits;
  return next;
}

function priceDigitsOf(value: unknown): string {
  if (value == null || value === "") return "";
  const digits = String(value).replace(/,/g, "").replace(/\D/g, "");
  return digits && Number(digits) > 0 ? digits : "";
}

export function getPropertyAiCategoryOptions(brief: string): string[] {
  const config = briefTypeConfig[brief as keyof typeof briefTypeConfig];
  if (config?.propertyCategories?.length) return [...config.propertyCategories];
  return [
    PROPERTY_CATEGORIES.RESIDENTIAL,
    PROPERTY_CATEGORIES.COMMERCIAL,
    PROPERTY_CATEGORIES.LAND,
  ];
}

function matchOptionValue(
  options: ReadonlyArray<{ value: string; label: string }>,
  raw: string,
): string {
  const t = raw.trim().toLowerCase();
  if (!t) return raw;
  const hit = options.find(
    (o) => o.value.toLowerCase() === t || o.label.toLowerCase() === t,
  );
  return hit?.value ?? raw;
}

function allFeatureOptions(data: Record<string, unknown>): { value: string; label: string }[] {
  const brief = listingType(data);
  const cat = category(data);
  return getFeaturesByCategory(cat, brief);
}

function extractCountFromText(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  if (/^(none|no|zero|nil|n\/a|na|-)$/i.test(t)) return 0;
  const m = t.match(/\b(\d+)\b/);
  if (m) return Number(m[1]);
  return null;
}

function extractRoomsFromText(text: string): Partial<{ bedrooms: number; sittingRooms: number; bathrooms: number; toilets: number }> {
  const t = text.trim();
  const out: Partial<{ bedrooms: number; sittingRooms: number; bathrooms: number; toilets: number }> = {};
  const bed = t.match(/(\d+)\s*(?:bed(?:room)?s?)/i);
  const sitting = t.match(/(\d+)\s*(?:sitting(?:\s*room)?s?)/i);
  const bath = t.match(/(\d+)\s*(?:bath(?:room)?s?)/i);
  const toilet = t.match(/(\d+)\s*(?:toilet)s?/i);
  if (bed) out.bedrooms = Number(bed[1]);
  if (sitting) out.sittingRooms = Number(sitting[1]);
  if (bath) out.bathrooms = Number(bath[1]);
  if (toilet) out.toilets = Number(toilet[1]);
  if (!bed && !sitting && !bath && !toilet) {
    const lone = extractCountFromText(t);
    if (lone !== null && /bathroom|toilet/i.test(t)) {
      if (/toilet/i.test(t)) out.toilets = lone;
      else out.bathrooms = lone;
    }
  }
  return out;
}

/** Apply the user's latest answer to the field we were asking about (before/after API). */
export function applyFocusedPropertyAnswer(
  text: string,
  focusedMissingField: string | undefined,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const value = text.trim();
  if (!value || !focusedMissingField) return data;

  const focus = canonicalPropertyAiFieldKey(focusedMissingField);
  let next = { ...data };

  if (focus === PROPERTY_AI_FIELD.CATEGORY) {
    const lower = value.toLowerCase();
    let cat = value;
    if (lower.includes("residential")) cat = PROPERTY_CATEGORIES.RESIDENTIAL;
    else if (lower.includes("commercial")) cat = PROPERTY_CATEGORIES.COMMERCIAL;
    else if (lower.includes("land") && !lower.includes("island")) cat = PROPERTY_CATEGORIES.LAND;
    else if (lower.includes("mixed")) cat = PROPERTY_CATEGORIES.MIXED_DEVELOPMENT;
    next.propertyCategory = cat;
  }

  if (focus === PROPERTY_AI_FIELD.PROPERTY_CONDITION) {
    next.propertyCondition = matchOptionValue(propertyConditionOptions, value);
  }

  if (focus === PROPERTY_AI_FIELD.TYPE_OF_BUILDING) {
    const buildingOpts = [
      ...buildingTypeOptions.residential,
      ...buildingTypeOptions.commercial,
      ...buildingTypeOptions.shortlet,
    ];
    next.typeOfBuilding = matchOptionValue(buildingOpts, value);
  }

  if (focus === PROPERTY_AI_FIELD.DESCRIPTION) {
    next.description = value;
  }

  if (focus === PROPERTY_AI_FIELD.ESTATE) {
    const loc = (next.location || {}) as Record<string, unknown>;
    next.location = { ...loc, estate: value };
  }

  if (focus === PROPERTY_AI_FIELD.RENTAL_TYPE) {
    next.rentalType = /lease/i.test(value) ? "Lease" : "Rent";
  }

  if (focus === PROPERTY_AI_FIELD.PARKING) {
    const n = extractCountFromText(value);
    if (n !== null) {
      const add = {
        ...additionalFeatures(next),
        noOfCarPark: n,
        noOfCarParks: n,
        parkingSpaces: n,
        carPark: n,
        carParks: n,
      };
      next = { ...next, parkingSpaces: n, noOfCarPark: n, additionalFeatures: add };
    }
  }

  if (focus === PROPERTY_AI_FIELD.DOCUMENTS) {
    const known = [
      "C of O",
      "Certificate of Occupancy",
      "Governors consent",
      "Governor consent",
      "Survey plan",
      "Deed of assignment",
      "Deed of Assignment",
      "Excision",
      "Gazette",
    ];
    const lower = value.toLowerCase();
    const found: string[] = [];
    for (const doc of known) {
      if (lower.includes(doc.toLowerCase())) found.push(doc);
    }
    const labelMatch = value.match(/(?:documents?|title)\s*[:\s]+\s*([^.]+)/i);
    if (labelMatch) {
      labelMatch[1]
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2)
        .forEach((s) => {
          if (!found.includes(s)) found.push(s);
        });
    }
    if (found.length === 0 && value.length >= 2) {
      value.split(/[,;]/).map((s) => s.trim()).filter(Boolean).forEach((s) => found.push(s));
    }
    const mapped = found.map((s) => matchOptionValue(documentOptions, s));
    const existing = Array.isArray(next.documents) ? (next.documents as string[]) : [];
    next.documents = [...new Set([...existing, ...mapped])];
  }

  if (focus === PROPERTY_AI_FIELD.ROOMS) {
    const rooms = extractRoomsFromText(value);
    const add = { ...additionalFeatures(next) };
    if (rooms.bedrooms !== undefined) {
      add.noOfBedroom = rooms.bedrooms;
      next.bedrooms = rooms.bedrooms;
    }
    if (rooms.sittingRooms !== undefined) {
      add.noOfSittingRoom = rooms.sittingRooms;
      next.sittingRooms = rooms.sittingRooms;
    }
    if (rooms.bathrooms !== undefined) {
      add.noOfBathroom = rooms.bathrooms;
      next.bathrooms = rooms.bathrooms;
    }
    if (rooms.toilets !== undefined) {
      add.noOfToilet = rooms.toilets;
      next.toilets = rooms.toilets;
    }
    const lone = extractCountFromText(value);
    if (lone !== null) {
      const existing = getRoomCounts({ ...next, additionalFeatures: add });
      const parsedAny = rooms.bedrooms !== undefined || rooms.sittingRooms !== undefined || rooms.bathrooms !== undefined || rooms.toilets !== undefined;
      if (!parsedAny) {
        // Combined prompt ("bedrooms, bathrooms, and toilets") — one number fills all still missing.
        if (existing.bedrooms === undefined) {
          add.noOfBedroom = lone;
          next.bedrooms = lone;
        }
        if (existing.sittingRooms === undefined) {
          add.noOfSittingRoom = lone;
          next.sittingRooms = lone;
        }
        if (existing.bathrooms === undefined) {
          add.noOfBathroom = lone;
          next.bathrooms = lone;
        }
        if (existing.toilets === undefined) {
          add.noOfToilet = lone;
          next.toilets = lone;
        }
      } else {
        if (rooms.bedrooms === undefined && existing.bedrooms === undefined && /bed/i.test(focusedMissingField)) {
          add.noOfBedroom = lone;
          next.bedrooms = lone;
        }
        if (rooms.sittingRooms === undefined && existing.sittingRooms === undefined && /sitting/i.test(focusedMissingField)) {
          add.noOfSittingRoom = lone;
          next.sittingRooms = lone;
        }
        if (rooms.bathrooms === undefined && existing.bathrooms === undefined && /bath/i.test(focusedMissingField)) {
          add.noOfBathroom = lone;
          next.bathrooms = lone;
        }
        if (rooms.toilets === undefined && existing.toilets === undefined && /toilet/i.test(focusedMissingField)) {
          add.noOfToilet = lone;
          next.toilets = lone;
        }
      }
    }
    next.additionalFeatures = add;
  }

  if (focus === PROPERTY_AI_FIELD.MAX_GUESTS) {
    const n = extractCountFromText(value);
    if (n !== null) next.maxGuests = n;
  }

  if (focus === PROPERTY_AI_FIELD.MIN_PRICE) {
    const digits = value.replace(/,/g, "").replace(/\D/g, "");
    if (digits) next.minPrice = digits;
  }

  if (focus === PROPERTY_AI_FIELD.MAX_PRICE || focus === PROPERTY_AI_FIELD.PRICE) {
    const digits = value.replace(/,/g, "").replace(/\D/g, "");
    if (digits) {
      next.maxPrice = digits;
      next.price = digits;
    }
  }

  if (focus === PROPERTY_AI_FIELD.LEASE_HOLD) {
    next.leaseHold = value;
  }

  if (focus === PROPERTY_AI_FIELD.DEVELOPMENT_STAGE) {
    next.developmentStage = matchOptionValue(offPlanDevelopmentStageOptions, value);
  }

  if (focus === PROPERTY_AI_FIELD.PAYMENT_PLAN) {
    next.paymentPlan = matchOptionValue(offPlanPaymentPlanOptions, value);
  }

  if (focus === PROPERTY_AI_FIELD.EXPECTED_COMPLETION) {
    next.expectedCompletionDate = value;
  }

  if (focus === PROPERTY_AI_FIELD.JV_CONDITIONS) {
    const parts = value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const mapped = (parts.length ? parts : [value]).map((s) => matchOptionValue(jvConditions, s));
    next.jvConditions = [...new Set(mapped)];
  }

  if (focus === PROPERTY_AI_FIELD.FEATURES) {
    const parts = value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const mapped = parts.map((s) => matchOptionValue(allFeatureOptions(next), s));
    const existing = Array.isArray(next.features) ? (next.features as string[]) : [];
    next.features = [...new Set([...existing, ...mapped])];
  }

  if (focus === PROPERTY_AI_FIELD.BEDROOMS) {
    const n = extractCountFromText(value);
    if (n !== null) {
      const add = { ...additionalFeatures(next), noOfBedroom: n };
      next = { ...next, bedrooms: n, additionalFeatures: add };
    }
  }

  if (focus === PROPERTY_AI_FIELD.BATHROOMS) {
    const n = extractCountFromText(value);
    if (n !== null) {
      const add = { ...additionalFeatures(next), noOfBathroom: n };
      next = { ...next, bathrooms: n, additionalFeatures: add };
    }
  }

  if (focus === PROPERTY_AI_FIELD.TOILETS) {
    const n = extractCountFromText(value);
    if (n !== null) {
      const add = { ...additionalFeatures(next), noOfToilet: n };
      next = { ...next, toilets: n, additionalFeatures: add };
    }
  }

  if (focus === PROPERTY_AI_FIELD.LAND_SIZE) {
    const measurementTypes = ["Square Meter", "SQM", "Plot", "Hectares", "Acres", "Square Feet"];
    const lower = value.toLowerCase();
    let measurementType = "";
    for (const mt of measurementTypes) {
      if (lower.includes(mt.toLowerCase()) || (mt === "SQM" && lower.includes("sqm"))) {
        measurementType = mt === "SQM" ? "Square Meter" : mt;
        break;
      }
    }
    const sizeMatch = value.match(/(\d+(?:\.\d+)?)/);
    const size = sizeMatch ? Number(sizeMatch[1]) : undefined;
    const existing = getLandSize(next);
    next.landSize = {
      measurementType: measurementType || existing.measurementType || "",
      size: size && size > 0 ? size : existing.size ?? 0,
    };
    if (measurementType) next.measurementType = measurementType;
  }

  return normalizePropertyAiCollectedData(next);
}

/**
 * Merge API suggest-property output into locally collected answers without wiping
 * fields the API omitted (e.g. parking after a documents-only response).
 */
export function mergePropertyAiCollectedData(
  local: Record<string, unknown>,
  api: Record<string, unknown>,
  listingType?: string,
): Record<string, unknown> {
  const localNorm = normalizePropertyAiCollectedData(local);
  const apiNorm = normalizePropertyAiCollectedData({
    ...api,
    ...(listingType ? { propertyType: listingType } : {}),
  });

  const locLocal = (localNorm.location || {}) as Record<string, unknown>;
  const locApi = (apiNorm.location || {}) as Record<string, unknown>;
  const addLocal = additionalFeatures(localNorm);
  const addApi = additionalFeatures(apiNorm);

  const landLocal = (localNorm.landSize || {}) as { measurementType?: string; size?: number };
  const landApi = (apiNorm.landSize || {}) as { measurementType?: string; size?: number };

  const merged: Record<string, unknown> = {
    ...localNorm,
    ...apiNorm,
    propertyType: listingType || apiNorm.propertyType || localNorm.propertyType,
    location: { ...locLocal, ...locApi },
    additionalFeatures: mergeAdditionalFeaturesRecords(addLocal, addApi),
    landSize: {
      measurementType: landApi.measurementType || landLocal.measurementType || "",
      size:
        landApi.size != null && landApi.size > 0
          ? landApi.size
          : landLocal.size != null && landLocal.size > 0
            ? landLocal.size
            : landApi.size ?? landLocal.size ?? 0,
    },
  };

  const localRooms = getRoomCounts(localNorm);
  const add = { ...additionalFeatures(merged) };
  if (localRooms.bedrooms !== undefined) {
    add.noOfBedroom = localRooms.bedrooms;
    merged.bedrooms = localRooms.bedrooms;
  }
  if (localRooms.sittingRooms !== undefined) {
    add.noOfSittingRoom = localRooms.sittingRooms;
    merged.sittingRooms = localRooms.sittingRooms;
  }
  if (localRooms.bathrooms !== undefined) {
    add.noOfBathroom = localRooms.bathrooms;
    merged.bathrooms = localRooms.bathrooms;
  }
  if (localRooms.toilets !== undefined) {
    add.noOfToilet = localRooms.toilets;
    merged.toilets = localRooms.toilets;
  }

  const localParking = getParkingCount(localNorm);
  if (localParking !== undefined) {
    add.noOfCarPark = localParking;
    add.noOfCarParks = localParking;
    add.parkingSpaces = localParking;
    add.carPark = localParking;
    add.carParks = localParking;
    merged.parkingSpaces = localParking;
    merged.noOfCarPark = localParking;
  }

  if (isMeaningful(localNorm.propertyCategory) && !isMeaningful(apiNorm.propertyCategory)) {
    merged.propertyCategory = localNorm.propertyCategory;
  }
  if (isMeaningful(localNorm.propertyCondition) && !isMeaningful(apiNorm.propertyCondition)) {
    merged.propertyCondition = localNorm.propertyCondition;
  }
  if (isMeaningful(localNorm.typeOfBuilding) && !isMeaningful(apiNorm.typeOfBuilding)) {
    merged.typeOfBuilding = localNorm.typeOfBuilding;
  }
  if (isMeaningful(localNorm.description) && !isMeaningful(apiNorm.description)) {
    merged.description = localNorm.description;
  }
  if (isMeaningful(localNorm.minPrice) && !isMeaningful(apiNorm.minPrice)) {
    merged.minPrice = localNorm.minPrice;
  }
  if (isMeaningful(localNorm.maxPrice) && !isMeaningful(apiNorm.maxPrice)) {
    merged.maxPrice = localNorm.maxPrice;
  }
  if (isMeaningful(localNorm.leaseHold) && !isMeaningful(apiNorm.leaseHold)) {
    merged.leaseHold = localNorm.leaseHold;
  }
  if (isMeaningful(localNorm.developmentStage) && !isMeaningful(apiNorm.developmentStage)) {
    merged.developmentStage = localNorm.developmentStage;
  }
  if (isMeaningful(localNorm.paymentPlan) && !isMeaningful(apiNorm.paymentPlan)) {
    merged.paymentPlan = localNorm.paymentPlan;
  }
  if (isMeaningful(localNorm.expectedCompletionDate) && !isMeaningful(apiNorm.expectedCompletionDate)) {
    merged.expectedCompletionDate = localNorm.expectedCompletionDate;
  }

  const localPriceDigits = priceDigitsOf(localNorm.maxPrice ?? localNorm.price);
  const apiPriceDigits = priceDigitsOf(apiNorm.maxPrice ?? apiNorm.price);
  if (localPriceDigits && !apiPriceDigits) {
    merged.price = localNorm.price;
    merged.maxPrice = localNorm.maxPrice ?? localNorm.price;
  }

  const localFeatures = Array.isArray(localNorm.features) ? localNorm.features.map(String) : [];
  const apiFeatures = Array.isArray(apiNorm.features) ? apiNorm.features.map(String) : [];
  if (localFeatures.length > 0) {
    merged.features = [...new Set([...localFeatures, ...apiFeatures])];
  }

  const locMerged = (merged.location || {}) as Record<string, unknown>;
  const locEstate = locLocal.estate || locApi.estate;
  if (isMeaningful(locEstate)) {
    merged.location = { ...locMerged, estate: locEstate };
  }

  const localDocs = Array.isArray(localNorm.documents) ? localNorm.documents : [];
  const apiDocs = Array.isArray(apiNorm.documents) ? apiNorm.documents : [];
  if (localDocs.length > 0) {
    merged.documents = [...new Set([...localDocs.map(String), ...apiDocs.map(String)])];
  }

  merged.additionalFeatures = add;
  return normalizePropertyAiCollectedData(merged);
}

export interface PropertyAiMissingFieldsOptions {
  /** When user opened AI flow from Sell/Rent/etc. form, skip asking listing type again. */
  listingTypePreset?: string | null;
}

/**
 * Ordered checklist of fields still needed — mirrors manual form visibility.
 */
export function getPropertyAiMissingFields(
  data: Record<string, unknown>,
  options: PropertyAiMissingFieldsOptions = {},
): string[] {
  const normalized = normalizePropertyAiCollectedData(data);
  const missing: PropertyAiFieldId[] = [];
  const brief = listingType(normalized) || options.listingTypePreset || "";
  const cat = category(normalized);
  const deps = { rentalType: normalized.rentalType };

  if (!brief && !options.listingTypePreset) {
    missing.push(PROPERTY_AI_FIELD.LISTING_TYPE);
  }

  if (!isMeaningful(normalized.propertyCategory)) {
    missing.push(PROPERTY_AI_FIELD.CATEGORY);
  }

  const loc = (normalized.location || {}) as Record<string, unknown>;
  const hasLga = isMeaningful(loc.localGovernment);
  const hasArea =
    isMeaningful(loc.area) ||
    (Array.isArray(loc.areas) && (loc.areas as unknown[]).length > 0);
  const hasEstate = isMeaningful(loc.estate);

  if (!hasLga) missing.push(PROPERTY_AI_FIELD.LGA);
  else if (!hasArea) missing.push(PROPERTY_AI_FIELD.AREA);
  else if (!hasEstate) missing.push(PROPERTY_AI_FIELD.ESTATE);

  if (!isMeaningful(normalized.description)) {
    missing.push(PROPERTY_AI_FIELD.DESCRIPTION);
  }

  if (brief && cat) {
    if (shouldShowField("propertyCondition", brief, cat, deps) && !isMeaningful(normalized.propertyCondition)) {
      missing.push(PROPERTY_AI_FIELD.PROPERTY_CONDITION);
    }

    if (shouldShowField("typeOfBuilding", brief, cat, deps) && !isMeaningful(normalized.typeOfBuilding)) {
      missing.push(PROPERTY_AI_FIELD.TYPE_OF_BUILDING);
    }

    const rooms = getRoomCounts(normalized);
    if (shouldShowField("bedrooms", brief, cat, deps) && rooms.bedrooms === undefined) {
      missing.push(PROPERTY_AI_FIELD.BEDROOMS);
    } else if (shouldShowField("bathrooms", brief, cat, deps) && rooms.bathrooms === undefined) {
      missing.push(PROPERTY_AI_FIELD.BATHROOMS);
    } else if (shouldShowField("toilets", brief, cat, deps) && rooms.toilets === undefined) {
      missing.push(PROPERTY_AI_FIELD.TOILETS);
    } else if (
      shouldShowField("parkingSpaces", brief, cat, deps) &&
      brief !== BRIEF_TYPES.JV &&
      cat !== PROPERTY_CATEGORIES.LAND &&
      getParkingCount(normalized) === undefined
    ) {
      missing.push(PROPERTY_AI_FIELD.PARKING);
    }

    if (shouldShowField("landSize", brief, cat, deps)) {
      const land = getLandSize(normalized);
      if (!land.measurementType || land.size == null || land.size <= 0) {
        missing.push(PROPERTY_AI_FIELD.LAND_SIZE);
      }
    }

    if (shouldShowField("rentalType", brief, cat, deps) && !isMeaningful(normalized.rentalType)) {
      missing.push(PROPERTY_AI_FIELD.RENTAL_TYPE);
    }

    if (shouldShowField("leaseHold", brief, cat, deps) && !isMeaningful(normalized.leaseHold)) {
      missing.push(PROPERTY_AI_FIELD.LEASE_HOLD);
    }

    if (shouldShowField("maxGuests", brief, cat, deps)) {
      const guests = normalized.maxGuests ?? additionalFeatures(normalized).maxGuests;
      if (!isMeaningful(guests) && !(typeof guests === "number" && guests > 0)) {
        missing.push(PROPERTY_AI_FIELD.MAX_GUESTS);
      }
    }

    if (shouldShowField("documents", brief, cat, deps)) {
      const documents = normalized.documents ?? normalized.docOnProperty;
      const docList = Array.isArray(documents) ? documents : [];
      const docNames = docList
        .map((d) => (typeof d === "string" ? d : (d as { docName?: string })?.docName))
        .filter(Boolean);
      if (docNames.length === 0) missing.push(PROPERTY_AI_FIELD.DOCUMENTS);
    }

    if (shouldShowField("developmentStage", brief, cat, deps) && !isMeaningful(normalized.developmentStage)) {
      missing.push(PROPERTY_AI_FIELD.DEVELOPMENT_STAGE);
    }

    if (shouldShowField("paymentPlan", brief, cat, deps) && !isMeaningful(normalized.paymentPlan)) {
      missing.push(PROPERTY_AI_FIELD.PAYMENT_PLAN);
    }

    if (
      shouldShowField("expectedCompletionDate", brief, cat, deps) &&
      !isMeaningful(normalized.expectedCompletionDate)
    ) {
      missing.push(PROPERTY_AI_FIELD.EXPECTED_COMPLETION);
    }

    if (shouldShowField("jvConditions", brief, cat, deps)) {
      const conditions = normalized.jvConditions;
      if (!Array.isArray(conditions) || conditions.length === 0) {
        missing.push(PROPERTY_AI_FIELD.JV_CONDITIONS);
      }
    }
  }

  if (brief !== BRIEF_TYPES.JV) {
    if (!priceDigitsOf(normalized.minPrice)) missing.push(PROPERTY_AI_FIELD.MIN_PRICE);
    if (!priceDigitsOf(normalized.maxPrice ?? normalized.price)) {
      missing.push(PROPERTY_AI_FIELD.MAX_PRICE);
    }
  }

  const features = normalized.features;
  if (!Array.isArray(features) || features.length === 0) {
    missing.push(PROPERTY_AI_FIELD.FEATURES);
  }

  return missing.map((id) => fieldLabelForPropertyAiField(id));
}

/** Map canonical id → prompt label for `getPropertyFieldPrompt`. */
/** Record that the user supplied an answer for this step (survives API responses that omit the field). */
export function markPropertyAiUserAnswer(
  answered: Set<string>,
  focusedMissingField: string | undefined,
  text: string,
): void {
  if (!focusedMissingField) return;
  const key = canonicalPropertyAiFieldKey(focusedMissingField);
  const value = text.trim();
  if (!value) return;

  if (key === PROPERTY_AI_FIELD.PARKING && extractCountFromText(value) !== null) {
    answered.add(PROPERTY_AI_FIELD.PARKING);
    return;
  }
  if (key === PROPERTY_AI_FIELD.ROOMS && extractCountFromText(value) !== null) {
    answered.add(PROPERTY_AI_FIELD.ROOMS);
    return;
  }
  if (key === PROPERTY_AI_FIELD.DOCUMENTS && value.length >= 2) {
    answered.add(PROPERTY_AI_FIELD.DOCUMENTS);
    return;
  }
  if (
    (key === PROPERTY_AI_FIELD.PRICE ||
      key === PROPERTY_AI_FIELD.MIN_PRICE ||
      key === PROPERTY_AI_FIELD.MAX_PRICE) &&
    value.replace(/\D/g, "").length > 0
  ) {
    answered.add(key);
    return;
  }
  if (key === PROPERTY_AI_FIELD.LAND_SIZE && value.length >= 2) {
    answered.add(PROPERTY_AI_FIELD.LAND_SIZE);
    return;
  }
  if (
    (key === PROPERTY_AI_FIELD.BEDROOMS ||
      key === PROPERTY_AI_FIELD.BATHROOMS ||
      key === PROPERTY_AI_FIELD.TOILETS ||
      key === PROPERTY_AI_FIELD.MAX_GUESTS) &&
    extractCountFromText(value) !== null
  ) {
    answered.add(key);
    return;
  }
  if (key === PROPERTY_AI_FIELD.FEATURES && value.length >= 2) {
    answered.add(PROPERTY_AI_FIELD.FEATURES);
    return;
  }
  if (key === PROPERTY_AI_FIELD.ESTATE && value.length >= 2) {
    answered.add(PROPERTY_AI_FIELD.ESTATE);
  }
}

export function filterMissingPropertyAiFields(
  missing: string[],
  skipped: Set<string>,
  userAnswered: Set<string>,
): string[] {
  return missing.filter((f) => {
    const key = canonicalPropertyAiFieldKey(f);
    return !skipped.has(key) && !userAnswered.has(key);
  });
}

export function propertyAiFieldIdFromLabel(label: string): PropertyAiFieldId {
  const key = canonicalPropertyAiFieldKey(label);
  if (Object.values(PROPERTY_AI_FIELD).includes(key as PropertyAiFieldId)) {
    return key as PropertyAiFieldId;
  }
  return PROPERTY_AI_FIELD.DESCRIPTION;
}

function propertyLocToPreferenceShape(loc: Record<string, unknown>): Record<string, unknown> {
  const lga = String(loc.localGovernment ?? "").trim();
  const areas = Array.isArray(loc.areas)
    ? (loc.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : String(loc.area ?? "").trim()
      ? [String(loc.area).trim()]
      : [];
  return {
    state: loc.state,
    localGovernmentAreas: lga ? [lga] : [],
    areas,
    customLocation: areas[0] ?? "",
    estate: loc.estate,
  };
}

function preferenceLocToPropertyShape(loc: Record<string, unknown>): Record<string, unknown> {
  const lgas = loc.localGovernmentAreas ?? loc.lgas;
  const lga = Array.isArray(lgas) ? String(lgas[0] ?? "").trim() : String(loc.localGovernment ?? "").trim();
  const areas = Array.isArray(loc.areas)
    ? (loc.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : String(loc.customLocation ?? loc.area ?? "").trim()
      ? [String(loc.customLocation ?? loc.area).trim()]
      : [];
  return {
    state: loc.state,
    localGovernment: lga,
    area: areas[0] ?? "",
    areas,
    estate: loc.estate ?? "",
  };
}

/** Drop API-invented LGA/area/estate unless the user actually mentioned or just answered them. */
export function keepPropertyLocationIfUserMentioned(
  loc: Record<string, unknown>,
  userText: string,
  focusedMissingField?: string,
): Record<string, unknown> {
  const focus = focusedMissingField ? canonicalPropertyAiFieldKey(focusedMissingField) : "";
  const text = userText.toLowerCase();
  const next: Record<string, unknown> = { ...loc, state: PILOT_STATE };
  const lga = String(loc.localGovernment || "").trim();
  const area = String(loc.area || "").trim();
  const estate = String(loc.estate || "").trim();

  if (lga && focus !== PROPERTY_AI_FIELD.LGA && !text.includes(lga.toLowerCase())) {
    next.localGovernment = "";
    next.area = "";
    next.areas = [];
    next.estate = "";
    return next;
  }

  if (area && focus !== PROPERTY_AI_FIELD.AREA && !text.includes(area.toLowerCase())) {
    next.area = "";
    next.areas = [];
    next.estate = "";
  }

  if (estate && focus !== PROPERTY_AI_FIELD.ESTATE && !text.includes(estate.toLowerCase())) {
    next.estate = "";
  }

  return next;
}

/** Extract and sanitize property listing location from natural text (State → LGA → Area order). */
export function applyPropertyLocationFromNaturalText(
  data: Record<string, unknown>,
  text: string,
  stateOptions: string[] = [],
): Record<string, unknown> {
  const prefWrapped = applySmartLocationFromNaturalText(
    { location: propertyLocToPreferenceShape((data.location || {}) as Record<string, unknown>) },
    text,
    stateOptions,
  );
  const prefLoc = (prefWrapped.location || {}) as Record<string, unknown>;
  return { ...data, location: preferenceLocToPropertyShape(prefLoc) };
}

export function sanitizePropertyConversationLocation(
  loc: Record<string, unknown> | undefined,
  userMessagesCombined: string,
  stateOptions: string[] = [],
): Record<string, unknown> {
  return preferenceLocToPropertyShape(
    sanitizeConversationLocation(propertyLocToPreferenceShape(loc || {}), userMessagesCombined, stateOptions),
  );
}
