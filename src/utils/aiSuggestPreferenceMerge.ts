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

function isMeaningfulPatchValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  if (Array.isArray(v)) {
    return v.some((x) => x !== undefined && x !== null && String(x).trim() !== "");
  }
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return false;
}

function extractLgaArray(loc: Record<string, unknown>): string[] {
  const raw = Array.isArray(loc.localGovernmentAreas)
    ? loc.localGovernmentAreas
    : Array.isArray(loc.lgas)
      ? loc.lgas
      : [];
  return (raw as unknown[]).map((x) => String(x).trim()).filter((s) => s.length > 0);
}

function extractAreasArray(loc: Record<string, unknown>): string[] {
  const raw = Array.isArray(loc.areas) ? loc.areas : [];
  return (raw as unknown[]).map((x) => String(x).trim()).filter((s) => s.length > 0);
}

/** Keep existing list when API sends empty arrays (so user answers are not wiped each turn). */
function mergeLgaLists(prev: string[], incoming: string[], stateName: string): string[] {
  const stateL = stateName.trim().toLowerCase();
  const norm = (a: string[]) =>
    [...new Set(a.map((s) => s.trim()).filter((s) => s.length > 0 && s.toLowerCase() !== stateL))];
  const p = norm(prev);
  const i = norm(incoming);
  if (i.length > 0) return i;
  return p;
}

function mergeAreasLists(prev: string[], incoming: string[]): string[] {
  const norm = (a: string[]) => [...new Set(a.map((s) => s.trim()).filter((s) => s.length > 0))];
  const p = norm(prev);
  const i = norm(incoming);
  if (i.length > 0) return i;
  return p;
}

function shallowMergePreferExisting(
  prev: Record<string, unknown> | undefined,
  inc: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...(prev || {}) };
  for (const [k, v] of Object.entries(inc)) {
    if (isMeaningfulPatchValue(v)) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

/**
 * Deep-merge API suggest output into existing AI-collected preference data.
 * Prevents wiping location / propertyDetails when the API returns partial objects (empty arrays wipe bug).
 */
export function mergePreferenceAiCollectedData(
  existing: Record<string, unknown> | undefined,
  apiData: Record<string, unknown>,
): Record<string, unknown> {
  const base = { ...(existing || {}) };
  const patch = mergeSuggestPreferenceIntoForm(apiData);

  if (patch.location && typeof patch.location === "object") {
    const prevLoc = (base.location || {}) as Record<string, unknown>;
    const incLoc = patch.location as Record<string, unknown>;
    const state = toStr(incLoc.state) || toStr(prevLoc.state);
    const lgas = mergeLgaLists(extractLgaArray(prevLoc), extractLgaArray(incLoc), state);
    const areas = mergeAreasLists(extractAreasArray(prevLoc), extractAreasArray(incLoc));
    const customLoc = toStr(incLoc.customLocation) || toStr(prevLoc.customLocation);
    base.location = {
      state,
      lgas,
      localGovernmentAreas: lgas,
      areas,
      ...(customLoc ? { customLocation: customLoc } : {}),
    };
  }

  if (patch.propertyDetails && typeof patch.propertyDetails === "object") {
    base.propertyDetails = shallowMergePreferExisting(
      base.propertyDetails as Record<string, unknown> | undefined,
      patch.propertyDetails as Record<string, unknown>,
    );
  }

  if (patch.budget && typeof patch.budget === "object") {
    base.budget = shallowMergePreferExisting(
      base.budget as Record<string, unknown> | undefined,
      patch.budget as Record<string, unknown>,
    );
  }

  if (patch.bookingDetails && typeof patch.bookingDetails === "object") {
    base.bookingDetails = shallowMergePreferExisting(
      base.bookingDetails as Record<string, unknown> | undefined,
      patch.bookingDetails as Record<string, unknown>,
    );
  }

  if (patch.developmentDetails && typeof patch.developmentDetails === "object") {
    base.developmentDetails = shallowMergePreferExisting(
      base.developmentDetails as Record<string, unknown> | undefined,
      patch.developmentDetails as Record<string, unknown>,
    );
  }

  if (patch.features && typeof patch.features === "object") {
    base.features = shallowMergePreferExisting(
      base.features as Record<string, unknown> | undefined,
      patch.features as Record<string, unknown>,
    );
  }

  if (patch.enhancedLocation && typeof patch.enhancedLocation === "object") {
    base.enhancedLocation = shallowMergePreferExisting(
      base.enhancedLocation as Record<string, unknown> | undefined,
      patch.enhancedLocation as Record<string, unknown>,
    );
  }

  const skipKeys = new Set([
    "location",
    "propertyDetails",
    "budget",
    "bookingDetails",
    "developmentDetails",
    "features",
    "enhancedLocation",
  ]);
  const denyTopLevelKeys = new Set(["receiverMode", "status"]);
  for (const key of Object.keys(patch)) {
    if (skipKeys.has(key) || denyTopLevelKeys.has(key)) continue;
    const v = (patch as Record<string, unknown>)[key];
    if (v !== undefined) (base as Record<string, unknown>)[key] = v;
  }

  return base;
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
      lgas: Array.isArray(loc.localGovernmentAreas)
        ? loc.localGovernmentAreas
        : Array.isArray(loc.lgas)
          ? loc.lgas
          : [],
      areas: Array.isArray(loc.areas) ? loc.areas : [],
      customLocation: toStr(loc.customLocation),
    };
    const lwa = loc.lgasWithAreas;
    if (Array.isArray(lwa) && lwa.length > 0) {
      out.enhancedLocation = {
        lgasWithAreas: lwa as { lgaName: string; areas: string[] }[],
      };
    }
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
    const autoAdjust = Boolean(
      features.autoAdjustToFeatures ?? features.autoAdjustToBudget,
    );
    const baseFromApi = features.baseFeatures;
    const basicFromApi = (features as { basicFeatures?: unknown }).basicFeatures;
    const basicFeatures = Array.isArray(baseFromApi)
      ? baseFromApi
      : Array.isArray(basicFromApi)
        ? basicFromApi
        : [];
    out.features = {
      basicFeatures,
      premiumFeatures: Array.isArray(features.premiumFeatures) ? features.premiumFeatures : [],
      autoAdjustToBudget: autoAdjust,
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
  if (
    contact &&
    (contact.email || contact.phoneNumber || contact.fullName || contact.companyName)
  ) {
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
