/**
 * Maps AI suggest-property API response into partial PropertyData for merge.
 * Only non-empty values from API are applied; existing form values are preserved when not empty.
 */

import type { PropertyData } from "@/context/post-property-context";

function empty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function toStr(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return String(v);
  return String(v).trim();
}

/**
 * Merge API suggest-property data into current property data.
 * Only fills fields that are empty in current, or overwrites with API value when API provides one.
 */
export function mergeSuggestPropertyIntoForm(
  current: PropertyData,
  apiData: Record<string, unknown>
): Partial<PropertyData> {
  const out: Partial<PropertyData> = {};
  const loc = apiData.location as
    | {
        state?: string;
        localGovernment?: string;
        area?: string;
        estate?: string;
        streetAddress?: string;
      }
    | undefined;
  const add = apiData.additionalFeatures as Record<string, unknown> | undefined;

  if (!empty(apiData.propertyType)) {
    const v = toStr(apiData.propertyType).toLowerCase();
    if (["sell", "rent", "jv", "shortlet"].includes(v)) out.propertyType = v as PropertyData["propertyType"];
  }
  if (!empty(apiData.propertyCategory)) {
    const v = toStr(apiData.propertyCategory);
    if (["Residential", "Commercial", "Land", "Mixed Development"].includes(v))
      out.propertyCategory = v as PropertyData["propertyCategory"];
  }
  if (!empty(apiData.propertyCondition)) out.propertyCondition = toStr(apiData.propertyCondition);
  if (!empty(apiData.typeOfBuilding)) out.typeOfBuilding = toStr(apiData.typeOfBuilding);
  if (!empty(apiData.rentalType)) out.rentalType = toStr(apiData.rentalType);
  if (apiData.price != null && apiData.price !== "") out.price = toStr(apiData.price);
  if (!empty(apiData.description)) out.description = toStr(apiData.description);
  if (!empty(apiData.additionalInfo)) out.additionalInfo = toStr(apiData.additionalInfo);
  if (!empty(apiData.addtionalInfo)) out.additionalInfo = toStr(apiData.addtionalInfo);
  if (Array.isArray(apiData.features) && apiData.features.length > 0) out.features = apiData.features as string[];

  const docs = apiData.documents ?? apiData.docOnProperty;
  if (Array.isArray(docs) && docs.length > 0) {
    out.documents = docs.map((d) => (typeof d === "string" ? d : (d as { docName?: string })?.docName ?? "")).filter(Boolean);
  }

  const landSize = apiData.landSize as { measurementType?: string; size?: number } | undefined;
  if (landSize) {
    if (!empty(landSize.measurementType)) out.measurementType = toStr(landSize.measurementType);
    if (landSize.size != null && typeof landSize.size === "number" && !Number.isNaN(landSize.size)) {
      out.landSize = String(landSize.size);
    }
  }
  if (!empty(apiData.measurementType)) out.measurementType = toStr(apiData.measurementType);
  if (!empty(apiData.landSize) && typeof apiData.landSize === "string") out.landSize = toStr(apiData.landSize);

  if (loc) {
    if (!empty(loc.state) && empty(current.state)) {
      out.state = { value: toStr(loc.state), label: toStr(loc.state) };
    }
    if (!empty(loc.localGovernment) && empty(current.lga)) {
      out.lga = { value: toStr(loc.localGovernment), label: toStr(loc.localGovernment) };
    }
    if (!empty(loc.area) && empty(current.area)) out.area = toStr(loc.area);
    if (!empty(loc.estate) && empty(current.estate)) out.estate = toStr(loc.estate);
    if (!empty(loc.streetAddress) && empty(current.streetAddress)) {
      out.streetAddress = toStr(loc.streetAddress);
    }
  }

  if (add) {
    if (typeof add.noOfBedroom === "number" || !empty(add.noOfBedroom)) out.bedrooms = Number(add.noOfBedroom) || 0;
    if (typeof add.noOfSittingRoom === "number" || !empty(add.noOfSittingRoom)) out.sittingRooms = Number(add.noOfSittingRoom) || 0;
    if (typeof add.noOfBathroom === "number" || !empty(add.noOfBathroom)) out.bathrooms = Number(add.noOfBathroom) || 0;
    if (typeof add.noOfToilet === "number" || !empty(add.noOfToilet)) out.toilets = Number(add.noOfToilet) || 0;
    if (typeof add.noOfCarPark === "number" || !empty(add.noOfCarPark)) out.parkingSpaces = Number(add.noOfCarPark) || 0;
  }

  return out;
}
