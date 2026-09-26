export const LANDLORD_CANNOT_LIST_OFF_PLAN =
  "Off-plan projects are available to developers only. Agents and landlords list completed properties from this page.";

export function isLandlordUserType(userType?: string | null): boolean {
  const t = String(userType || "").trim().toLowerCase();
  return t === "landowners" || t === "landowner" || t === "landlord";
}

export function isOffPlanListingType(propertyType?: string | null): boolean {
  const t = String(propertyType || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return t === "off-plan" || t === "offplan";
}

export function isDeveloperUserType(userType?: string | null): boolean {
  return String(userType || "").trim().toLowerCase() === "developer";
}

export function canUserListOffPlan(userType?: string | null): boolean {
  return isDeveloperUserType(userType);
}

const LISTING_ACCOUNT_TYPES = new Set([
  "landowners",
  "landowner",
  "landlord",
  "developer",
  "agent",
  "propertyscout",
  "property_scout",
  "property scout",
]);

/** Agents, developers, landlords, and property scouts can open a listing form. */
export function canAccountListProperty(userType?: string | null): boolean {
  return LISTING_ACCOUNT_TYPES.has(String(userType || "").trim().toLowerCase());
}
