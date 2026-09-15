export const LANDLORD_CANNOT_LIST_OFF_PLAN =
  "Landlords cannot list off-plan properties. Off-plan listings are available to developers only.";

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

export function canUserListOffPlan(userType?: string | null): boolean {
  return !isLandlordUserType(userType);
}
