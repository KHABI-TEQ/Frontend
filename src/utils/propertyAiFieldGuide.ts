/**
 * Property listing AI conversation — missing-field checklist aligned with
 * manual post-property forms (`shouldShowField` + step-1 field order).
 */

import {
  BRIEF_TYPES,
  PROPERTY_CATEGORIES,
  shouldShowField,
} from "@/data/comprehensive-post-property-config";

export const PROPERTY_AI_FIELD = {
  LISTING_TYPE: "listingType",
  CATEGORY: "propertyCategory",
  STATE: "state",
  LGA: "localGovernment",
  AREA: "area",
  PRICE: "price",
  DESCRIPTION: "description",
  PROPERTY_CONDITION: "propertyCondition",
  LAND_SIZE: "landSize",
  TYPE_OF_BUILDING: "typeOfBuilding",
  ROOMS: "rooms",
  PARKING: "parkingSpaces",
  DOCUMENTS: "documents",
  RENTAL_TYPE: "rentalType",
  MAX_GUESTS: "maxGuests",
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
  [PROPERTY_AI_FIELD.PRICE]: "price in Naira (required — comma-separated e.g. 85,000,000, as on the form)",
  [PROPERTY_AI_FIELD.DESCRIPTION]: "description of the property",
  [PROPERTY_AI_FIELD.PROPERTY_CONDITION]: "property condition (e.g. new, fairly used, renovated)",
  [PROPERTY_AI_FIELD.LAND_SIZE]: "land size (measurement type and numeric size, e.g. 500 Square Meter)",
  [PROPERTY_AI_FIELD.TYPE_OF_BUILDING]: "type of building (e.g. flat, duplex, terrace, detached house)",
  [PROPERTY_AI_FIELD.ROOMS]: "number of bedrooms, bathrooms, and toilets",
  [PROPERTY_AI_FIELD.PARKING]: "parking spaces (number of car parks, or 0 for none)",
  [PROPERTY_AI_FIELD.DOCUMENTS]: "property documents / title (e.g. C of O, governor's consent)",
  [PROPERTY_AI_FIELD.RENTAL_TYPE]: "rental type (Rent or Lease, as on the rent form)",
  [PROPERTY_AI_FIELD.MAX_GUESTS]: "maximum guests (shortlet form)",
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
  if (f.includes("area") && !f.includes("square")) return PROPERTY_AI_FIELD.AREA;
  if (f.includes("price") || f.includes("naira")) return PROPERTY_AI_FIELD.PRICE;
  if (f.includes("description")) return PROPERTY_AI_FIELD.DESCRIPTION;
  if (f.includes("condition")) return PROPERTY_AI_FIELD.PROPERTY_CONDITION;
  if (f.includes("land size") || f.includes("measurement type")) return PROPERTY_AI_FIELD.LAND_SIZE;
  if (f.includes("building")) return PROPERTY_AI_FIELD.TYPE_OF_BUILDING;
  if (f.includes("bedroom") || f.includes("bathroom") || f.includes("toilet")) {
    return PROPERTY_AI_FIELD.ROOMS;
  }
  if (f.includes("parking") || f.includes("car park")) return PROPERTY_AI_FIELD.PARKING;
  if (f.includes("document") || f.includes("title")) return PROPERTY_AI_FIELD.DOCUMENTS;
  if (f.includes("rental type") || f.includes("lease")) return PROPERTY_AI_FIELD.RENTAL_TYPE;
  if (f.includes("guest")) return PROPERTY_AI_FIELD.MAX_GUESTS;
  if (f.includes("features") || f.includes("amenities")) return PROPERTY_AI_FIELD.FEATURES;
  return field;
}

export function isPropertyAiFieldSkippable(fieldId: PropertyAiFieldId | string): boolean {
  return canonicalPropertyAiFieldKey(fieldId) === PROPERTY_AI_FIELD.FEATURES;
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
  return next;
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
    next.propertyCondition = value;
  }

  if (focus === PROPERTY_AI_FIELD.TYPE_OF_BUILDING) {
    next.typeOfBuilding = value;
  }

  if (focus === PROPERTY_AI_FIELD.DESCRIPTION) {
    next.description = value;
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
    if (found.length === 0 && value.length >= 2) found.push(value);
    const existing = Array.isArray(next.documents) ? (next.documents as string[]) : [];
    next.documents = [...new Set([...existing, ...found])];
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

  if (focus === PROPERTY_AI_FIELD.PRICE) {
    const digits = value.replace(/,/g, "").replace(/\D/g, "");
    if (digits) next.price = digits;
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

  const localPriceDigits =
    typeof localNorm.price === "string"
      ? localNorm.price.replace(/,/g, "").replace(/\D/g, "")
      : String(localNorm.price ?? "");
  const apiPriceDigits =
    typeof apiNorm.price === "string"
      ? apiNorm.price.replace(/,/g, "").replace(/\D/g, "")
      : String(apiNorm.price ?? "");
  if (localPriceDigits && Number(localPriceDigits) > 0 && (!apiPriceDigits || Number(apiPriceDigits) <= 0)) {
    merged.price = localNorm.price;
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
  const hasState = isMeaningful(loc.state);
  const hasLga = isMeaningful(loc.localGovernment);
  const hasArea =
    isMeaningful(loc.area) ||
    (Array.isArray(loc.areas) && (loc.areas as unknown[]).length > 0);

  if (!hasState) missing.push(PROPERTY_AI_FIELD.STATE);
  else if (!hasLga) missing.push(PROPERTY_AI_FIELD.LGA);
  else if (!hasArea) missing.push(PROPERTY_AI_FIELD.AREA);

  const price = normalized.price;
  const priceDigits =
    typeof price === "string" ? price.replace(/,/g, "").replace(/\D/g, "") : "";
  const priceOk =
    (typeof price === "number" && price > 0) ||
    (typeof price === "string" && price.trim() !== "" && Number(priceDigits) > 0);
  if (!priceOk) missing.push(PROPERTY_AI_FIELD.PRICE);

  if (!isMeaningful(normalized.description)) {
    missing.push(PROPERTY_AI_FIELD.DESCRIPTION);
  }

  if (brief && cat) {
    if (shouldShowField("propertyCondition", brief, cat, deps) && !isMeaningful(normalized.propertyCondition)) {
      missing.push(PROPERTY_AI_FIELD.PROPERTY_CONDITION);
    }

    if (shouldShowField("landSize", brief, cat, deps)) {
      const land = getLandSize(normalized);
      if (!land.measurementType || land.size == null || land.size <= 0) {
        missing.push(PROPERTY_AI_FIELD.LAND_SIZE);
      }
    }

    if (shouldShowField("typeOfBuilding", brief, cat, deps) && !isMeaningful(normalized.typeOfBuilding)) {
      missing.push(PROPERTY_AI_FIELD.TYPE_OF_BUILDING);
    }

    const rooms = getRoomCounts(normalized);
    const needsRooms =
      shouldShowField("bedrooms", brief, cat, deps) ||
      shouldShowField("bathrooms", brief, cat, deps) ||
      shouldShowField("toilets", brief, cat, deps);
    if (needsRooms) {
      const hasBed = rooms.bedrooms !== undefined;
      const hasBath = rooms.bathrooms !== undefined;
      const hasToilet = rooms.toilets !== undefined;
      if (!hasBed || !hasBath || !hasToilet) {
        missing.push(PROPERTY_AI_FIELD.ROOMS);
      }
    }

    if (shouldShowField("parkingSpaces", brief, cat, deps) && getParkingCount(normalized) === undefined) {
      missing.push(PROPERTY_AI_FIELD.PARKING);
    }

    if (shouldShowField("documents", brief, cat, deps)) {
      const documents = normalized.documents ?? normalized.docOnProperty;
      const docList = Array.isArray(documents) ? documents : [];
      const docNames = docList
        .map((d) => (typeof d === "string" ? d : (d as { docName?: string })?.docName))
        .filter(Boolean);
      if (docNames.length === 0) missing.push(PROPERTY_AI_FIELD.DOCUMENTS);
    }

    if (shouldShowField("rentalType", brief, cat, deps) && !isMeaningful(normalized.rentalType)) {
      missing.push(PROPERTY_AI_FIELD.RENTAL_TYPE);
    }

    if (shouldShowField("maxGuests", brief, cat, deps)) {
      const guests = normalized.maxGuests ?? additionalFeatures(normalized).maxGuests;
      if (!isMeaningful(guests) && !(typeof guests === "number" && guests > 0)) {
        missing.push(PROPERTY_AI_FIELD.MAX_GUESTS);
      }
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
  if (key === PROPERTY_AI_FIELD.PRICE && value.replace(/\D/g, "").length > 0) {
    answered.add(PROPERTY_AI_FIELD.PRICE);
    return;
  }
  if (key === PROPERTY_AI_FIELD.LAND_SIZE && value.length >= 2) {
    answered.add(PROPERTY_AI_FIELD.LAND_SIZE);
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
