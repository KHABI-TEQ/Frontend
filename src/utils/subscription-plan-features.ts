/** Shared listing-cap copy aligned with server publisherListingLimits. */
export const STANDARD_LISTING_CAP = 25;
export const ANNUAL_LISTING_CAP = 50;
/** @deprecated Unpaid trial listings are retired. */
export const FREE_TRIAL_LISTING_CAP = 0;
/** @deprecated Time-boxed free trial is retired. */
export const AGENT_TRIAL_DAYS = 0;

export function isListingsFeature(feature: {
  key?: string;
  label?: string;
}): boolean {
  const key = String(feature.key || "").toUpperCase();
  if (key === "LISTINGS") return true;
  return /listing/i.test(String(feature.label || ""));
}

/**
 * Correct LISTINGS display for catalog plans.
 * Quarterly / default → 25; Licensed Agent annual → 50.
 */
export function formatCatalogListingsFeature(plan: {
  isFree?: boolean;
  isTrial?: boolean;
  basePrice?: number;
  name?: string;
  code?: string;
  listingLimit?: number;
  unlimitedListings?: boolean;
}, feature: {
  key?: string;
  label?: string;
  type?: string;
  value?: number | string | boolean;
}): { label: string; valueText: string; isOn: boolean } {
  const baseLabel = feature.label || "Property listings";
  const isFree =
    !!plan.isFree ||
    !!plan.isTrial ||
    Number(plan.basePrice) === 0 ||
    /free/i.test(String(plan.name || ""));
  const isAnnual =
    /YEARLY|ANNUAL/i.test(String(plan.code || "")) ||
    /year/i.test(String(plan.name || ""));

  if (isFree) {
    return {
      label: baseLabel,
      valueText: ": paid plan required to list",
      isOn: false,
    };
  }

  const capped =
    Number(plan.listingLimit) > 0
      ? Number(plan.listingLimit)
      : feature.type === "count" && Number(feature.value) > 0
        ? Number(feature.value)
        : isAnnual
          ? ANNUAL_LISTING_CAP
          : STANDARD_LISTING_CAP;

  return {
    label: baseLabel,
    valueText: `: up to ${capped}`,
    isOn: true,
  };
}

const RETIRED_STANDARD_FEATURE_KEYS = new Set([
  "AUTOMATIC_PUSHUP",
  "SOCIAL_MEDIA_ADS",
]);

export function isRetiredStandardFeature(feature: {
  key?: string;
  label?: string;
}): boolean {
  const key = String(feature.key || "").trim().toUpperCase();
  if (RETIRED_STANDARD_FEATURE_KEYS.has(key)) return true;
  const label = String(feature.label || "");
  return /automatic\s*push[-\s]?up/i.test(label) || /social\s*media\s*advertising/i.test(label);
}

export function formatCatalogFeatureRow(plan: {
  isFree?: boolean;
  isTrial?: boolean;
  basePrice?: number;
  name?: string;
  code?: string;
  unlimitedListings?: boolean;
}, feature: {
  key?: string;
  label?: string;
  type?: string;
  value?: number | string | boolean;
}): { label: string; valueText: string; isOn: boolean } {
  if (isRetiredStandardFeature(feature)) {
    return { label: "", valueText: "", isOn: false };
  }
  if (isListingsFeature(feature)) {
    return formatCatalogListingsFeature(plan, feature);
  }

  const type = String(feature.type || "boolean");
  const isOn =
    type === "boolean"
      ? Number(feature.value) === 1 || feature.value === true
      : type === "unlimited" || Number(feature.value) > 0;

  let valueText = "";
  if (type === "count" && feature.value) valueText = `: ${feature.value}`;
  if (type === "unlimited") valueText = ": Unlimited";

  return {
    label: feature.label || feature.key || "Feature",
    valueText,
    isOn,
  };
}
