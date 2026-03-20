/**
 * Builds the API payload for preference submission from form data.
 * Used by both the manual form (preference page) and the AI summary submit flow.
 */

import type {
  PreferencePayload,
  BuyPreferencePayload,
  RentPreferencePayload,
  JointVenturePreferencePayload,
  ShortletPreferencePayload,
} from "@/types/preference-form";

type FormData = Record<string, unknown>;

/** Ensures fields the API expects as strings are never sent as numbers (e.g. propertyDetails.minBedrooms). */
function ensurePreferencePayloadStrings(payload: Record<string, unknown>): void {
  const pd = payload.propertyDetails as Record<string, unknown> | undefined;
  if (pd && pd.minBedrooms !== undefined) {
    pd.minBedrooms = typeof pd.minBedrooms === "string" ? pd.minBedrooms : String(pd.minBedrooms ?? "0");
  }
  const bd = payload.bookingDetails as Record<string, unknown> | undefined;
  if (bd && bd.minBedrooms !== undefined) {
    bd.minBedrooms = typeof bd.minBedrooms === "string" ? bd.minBedrooms : String(bd.minBedrooms ?? "0");
  }
}

function cleanObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== null && item !== undefined && item !== "")
      .map(cleanObject);
  }
  if (obj !== null && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      const value = cleanObject((obj as Record<string, unknown>)[key]);
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === "object" && value !== null && Object.keys(value as object).length === 0)
      ) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }
  return obj;
}

function getLgasWithAreas(formData: FormData): { lgaName: string; areas: string[] }[] {
  const enhanced = formData.enhancedLocation as { lgasWithAreas?: { lgaName: string; areas: string[] }[] } | undefined;
  if (Array.isArray(enhanced?.lgasWithAreas) && enhanced.lgasWithAreas.length > 0) {
    return enhanced.lgasWithAreas.filter((item) => item?.lgaName?.trim());
  }
  const lgas = (formData.location as { lgas?: string[] } | undefined)?.lgas
    ?? (formData.location as { localGovernmentAreas?: string[] } | undefined)?.localGovernmentAreas
    ?? [];
  return (Array.isArray(lgas) ? lgas : [])
    .filter((lga) => typeof lga === "string" && lga.trim() !== "")
    .map((lga) => ({ lgaName: String(lga).trim(), areas: [] }));
}

export function buildPreferencePayload(
  formData: FormData,
  selectedPreferenceType: string
): PreferencePayload {
  const loc = (formData.location || {}) as Record<string, unknown>;
  const lgas = (loc.lgas ?? loc.localGovernmentAreas ?? []) as string[];
  const filteredLgas = Array.isArray(lgas) ? lgas.filter((l: string) => String(l).trim() !== "") : [];
  const lgasWithAreas = getLgasWithAreas(formData);

  const basePayload = {
    preferenceType: selectedPreferenceType,
    preferenceMode:
      selectedPreferenceType === "buy"
        ? "buy"
        : selectedPreferenceType === "rent"
          ? "tenant"
          : selectedPreferenceType === "joint-venture"
            ? "developer"
            : "shortlet",
    location: {
      state: String(loc.state ?? "").trim(),
      localGovernmentAreas: filteredLgas,
      lgasWithAreas: lgasWithAreas.length > 0 ? lgasWithAreas : filteredLgas.map((lga) => ({ lgaName: lga, areas: [] })),
      customLocation: String(loc.customLocation ?? "").trim(),
    },
    budget: {
      minPrice: Number((formData.budget as { minPrice?: number })?.minPrice) || 0,
      maxPrice: Number((formData.budget as { maxPrice?: number })?.maxPrice) || 0,
      currency: "NGN" as const,
    },
    features: {
      baseFeatures:
        ((formData.features as { basicFeatures?: string[] })?.basicFeatures ?? []).filter(
          (f: string) => String(f).trim() !== ""
        ) || [],
      premiumFeatures:
        ((formData.features as { premiumFeatures?: string[] })?.premiumFeatures ?? []).filter(
          (f: string) => String(f).trim() !== ""
        ) || [],
      autoAdjustToFeatures: Boolean((formData.features as { autoAdjustToBudget?: boolean })?.autoAdjustToBudget),
    },
  };

  const contact = (formData.contactInfo || {}) as Record<string, unknown>;

  switch (selectedPreferenceType) {
    case "buy": {
      const buyData = formData as Record<string, unknown>;
      const pd = (buyData.propertyDetails || {}) as Record<string, unknown>;
      const buyPayload: BuyPreferencePayload = {
        ...basePayload,
        preferenceType: "buy",
        preferenceMode: "buy",
        propertyDetails: {
          propertyType: String(pd.propertySubtype ?? pd.propertyType ?? ""),
          buildingType: String(pd.buildingType ?? ""),
          minBedrooms: (() => {
            const v = pd.bedrooms ?? pd.minBedrooms;
            return typeof v === "string" ? (v.trim() || "0") : String(Number(v) || 0);
          })(),
          minBathrooms: Number(pd.bathrooms ?? pd.minBathrooms) || 0,
          propertyCondition: String(pd.propertyCondition ?? ""),
          purpose: String(pd.purpose ?? "For living"),
        },
        contactInfo: {
          fullName: String(contact.fullName ?? "").trim(),
          email: String(contact.email ?? "").trim(),
          phoneNumber: String(contact.phoneNumber ?? "").trim(),
        },
        nearbyLandmark: String(
          (pd as Record<string, unknown>).nearbyLandmark ?? buyData.nearbyLandmark ?? ""
        ).trim(),
        additionalNotes: String(buyData.additionalNotes ?? "").trim(),
      };
      const buyCleaned = cleanObject(buyPayload) as BuyPreferencePayload;
      ensurePreferencePayloadStrings(buyCleaned as unknown as Record<string, unknown>);
      return buyCleaned;
    }

    case "rent": {
      const rentData = formData as Record<string, unknown>;
      const pd = (rentData.propertyDetails || {}) as Record<string, unknown>;
      const rentPayload: RentPreferencePayload = {
        ...basePayload,
        preferenceType: "rent",
        preferenceMode: "tenant",
        propertyDetails: {
          propertyType: String(pd.propertySubtype ?? pd.propertyType ?? ""),
          minBedrooms: (() => {
            const v = pd.bedrooms ?? pd.minBedrooms;
            return typeof v === "string" ? (v.trim() || "0") : String(Number(v) || 0);
          })(),
          leaseTerm: String(pd.leaseTerm ?? "1 Year"),
          propertyCondition: String(pd.propertyCondition ?? ""),
          purpose: String(pd.purpose ?? "Residential"),
        },
        contactInfo: {
          fullName: String(contact.fullName ?? "").trim(),
          email: String(contact.email ?? "").trim(),
          phoneNumber: String(contact.phoneNumber ?? "").trim(),
        },
        additionalNotes: String(rentData.additionalNotes ?? "").trim(),
      };
      const rentCleaned = cleanObject(rentPayload) as RentPreferencePayload;
      ensurePreferencePayloadStrings(rentCleaned as unknown as Record<string, unknown>);
      return rentCleaned;
    }

    case "joint-venture": {
      const jvData = formData as Record<string, unknown>;
      const dev = (jvData.developmentDetails || {}) as Record<string, unknown>;
      const devTypes = Array.isArray(dev.developmentTypes) ? (dev.developmentTypes as string[]) : [];
      const jvPayload: JointVenturePreferencePayload = {
        ...basePayload,
        preferenceType: "joint-venture",
        preferenceMode: "developer",
        developmentDetails: {
          minLandSize: String(dev.minLandSize ?? "").trim(),
          jvType: String(dev.jvType ?? "").trim(),
          propertyType: String(dev.propertyType ?? "").trim(),
          expectedStructureType: String(dev.expectedStructureType ?? devTypes[0] ?? "").trim(),
          timeline: String(dev.timeline ?? "").trim(),
          budgetRange: typeof dev.budgetRange === "number" ? dev.budgetRange : Number(dev.budgetRange) || undefined,
        },
        contactInfo: {
          companyName: String(contact.companyName ?? "").trim(),
          contactPerson: String(contact.contactPerson ?? contact.fullName ?? "").trim(),
          email: String(contact.email ?? "").trim(),
          phoneNumber: String(contact.phoneNumber ?? "").trim(),
          cacRegistrationNumber: String(contact.cacRegistrationNumber ?? "").trim() || undefined,
        },
        partnerExpectations: String(jvData.partnerExpectations ?? "").trim() || undefined,
      };
      return cleanObject(jvPayload) as JointVenturePreferencePayload;
    }

    case "shortlet": {
      const shortletData = formData as Record<string, unknown>;
      const pd = (shortletData.propertyDetails || {}) as Record<string, unknown>;
      const bd = (shortletData.bookingDetails || {}) as Record<string, unknown>;
      const shortletPayload: ShortletPreferencePayload = {
        ...basePayload,
        preferenceType: "shortlet",
        preferenceMode: "shortlet",
        bookingDetails: {
          propertyType: String(pd?.propertyType ?? "").trim(),
          minBedrooms: (() => {
            const v = pd?.bedrooms ?? pd?.minBedrooms;
            return typeof v === "string" ? (v.trim() || "0") : String(Number(v) || 0);
          })(),
          numberOfGuests: Number(pd?.maxGuests ?? bd?.numberOfGuests ?? 0) || 0,
          checkInDate: String(bd?.checkInDate ?? "").trim(),
          checkOutDate: String(bd?.checkOutDate ?? "").trim(),
        },
        contactInfo: {
          fullName: String(contact.fullName ?? "").trim(),
          email: String(contact.email ?? "").trim(),
          phoneNumber: String(contact.phoneNumber ?? "").trim(),
        },
        additionalNotes: String(shortletData.additionalNotes ?? "").trim() || undefined,
      };
      const shortletCleaned = cleanObject(shortletPayload) as ShortletPreferencePayload;
      ensurePreferencePayloadStrings(shortletCleaned as unknown as Record<string, unknown>);
      return shortletCleaned;
    }

    default:
      return basePayload as unknown as PreferencePayload;
  }
}
