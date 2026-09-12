/** Shared listing-cap copy aligned with server publisherListingLimits / agent trial. */
export const STANDARD_LISTING_CAP = 25;
export const FREE_TRIAL_LISTING_CAP = 10;
/** Agent Free trial length in days (matches server AGENT_TRIAL_PERIOD_DAYS). */
export const AGENT_TRIAL_DAYS = 28;

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
 * Free/trial → 10; Premium → 25; Portfolio Unlimited → unlimited.
 */
export function formatCatalogListingsFeature(plan: {
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
  const baseLabel = feature.label || "Property listings";
  const isFree =
    !!plan.isFree ||
    !!plan.isTrial ||
    Number(plan.basePrice) === 0 ||
    /free/i.test(String(plan.name || ""));

  if (plan.unlimitedListings || /portfolio\s*unlimited/i.test(String(plan.name || ""))) {
    return { label: baseLabel, valueText: ": Unlimited", isOn: true };
  }

  if (isFree) {
    return {
      label: baseLabel,
      valueText: `: up to ${FREE_TRIAL_LISTING_CAP} in trial (1 in KYC grace)`,
      isOn: true,
    };
  }

  const capped =
    feature.type === "count" && Number(feature.value) > 0
      ? Number(feature.value)
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
