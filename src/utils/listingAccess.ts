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
