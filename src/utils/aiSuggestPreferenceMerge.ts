/**
 * Maps AI suggest-preference API response into partial preference form data for merge.
 * API returns: preferenceType, preferenceMode, location, budget, propertyDetails, features.
 */

function toStr(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return String(v);
  return String(v).trim();
}

function toNum(v: unknown): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Build partial form data from suggest-preference API data.
 * Safe to spread over existing formData and pass to updateFormData.
 */
export function mergeSuggestPreferenceIntoForm(
  apiData: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (apiData.preferenceType) {
    const v = toStr(apiData.preferenceType).toLowerCase();
    if (["buy", "rent", "shortlet", "joint-venture"].includes(v)) out.preferenceType = v;
  }
  if (apiData.preferenceMode) out.preferenceMode = toStr(apiData.preferenceMode);

  const loc = apiData.location as Record<string, unknown> | undefined;
  if (loc) {
    out.location = {
      state: toStr(loc.state),
      lgas: Array.isArray(loc.localGovernmentAreas) ? loc.localGovernmentAreas : Array.isArray(loc.lgas) ? loc.lgas : [],
      areas: Array.isArray(loc.areas) ? loc.areas : [],
      customLocation: toStr(loc.customLocation),
    };
  }

  const budget = apiData.budget as Record<string, unknown> | undefined;
  if (budget) {
    out.budget = {
      minPrice: toNum(budget.minPrice),
      maxPrice: toNum(budget.maxPrice),
      currency: "NGN",
    };
  }

  const features = apiData.features as Record<string, unknown> | undefined;
  if (features) {
    out.features = {
      basicFeatures: Array.isArray(features.baseFeatures) ? features.baseFeatures : [],
      premiumFeatures: Array.isArray(features.premiumFeatures) ? features.premiumFeatures : [],
      autoAdjustToBudget: Boolean(features.autoAdjustToBudget),
    };
  }

  if (apiData.propertyDetails && typeof apiData.propertyDetails === "object") {
    out.propertyDetails = apiData.propertyDetails;
  }
  if (apiData.developmentDetails && typeof apiData.developmentDetails === "object") {
    out.developmentDetails = apiData.developmentDetails;
  }
  if (apiData.bookingDetails && typeof apiData.bookingDetails === "object") {
    out.bookingDetails = apiData.bookingDetails;
  }
  if (apiData.additionalNotes) out.additionalNotes = toStr(apiData.additionalNotes);
  if (apiData.nearbyLandmark) out.nearbyLandmark = toStr(apiData.nearbyLandmark);

  const contact = apiData.contactInfo as Record<string, unknown> | undefined;
  if (contact && (contact.email || contact.phoneNumber || contact.fullName)) {
    out.contactInfo = {
      ...contact,
      fullName: toStr(contact.fullName),
      email: toStr(contact.email),
      phoneNumber: toStr(contact.phoneNumber),
      ...(contact.whatsappNumber != null && { whatsappNumber: toStr(contact.whatsappNumber) }),
    };
  }
  return out;
}
