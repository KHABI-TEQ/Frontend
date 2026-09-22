/** Default agent commission on sale / off-plan listings. */
export const SALE_AGENT_COMMISSION_PERCENT = 5;
/** Default agent commission on rental listings. */
export const RENT_AGENT_COMMISSION_PERCENT = 10;
/** JV / shortlet default and upper cap. */
export const FLEXIBLE_AGENT_COMMISSION_PERCENT_MAX = 5;

export const LANDLORD_COMMISSION_PERCENT_MIN = 3;
export const DEVELOPER_COMMISSION_PERCENT_MIN = 1;

export function publisherCommissionPercentMin(
  publisherType?: string | null,
): number {
  const t = String(publisherType || "").toLowerCase();
  if (t === "developer") return DEVELOPER_COMMISSION_PERCENT_MIN;
  return LANDLORD_COMMISSION_PERCENT_MIN;
}

export function listingCommissionCap(propertyType?: string | null): number {
  const t = String(propertyType || "").toLowerCase().replace(/_/g, "-");
  if (t === "rent") return RENT_AGENT_COMMISSION_PERCENT;
  return SALE_AGENT_COMMISSION_PERCENT;
}

export function defaultAgentCommissionPercent(
  propertyType?: string | null,
): number {
  const t = String(propertyType || "").toLowerCase().replace(/_/g, "-");
  if (t === "rent") return RENT_AGENT_COMMISSION_PERCENT;
  if (t === "sell" || t === "buy" || t === "off-plan" || t === "offplan") {
    return SALE_AGENT_COMMISSION_PERCENT;
  }
  return FLEXIBLE_AGENT_COMMISSION_PERCENT_MAX;
}

/** @deprecated Rates are no longer mandatory-fixed. Use defaultAgentCommissionPercent. */
export function mandatoryAgentCommissionPercent(
  propertyType?: string | null,
): number | null {
  const t = String(propertyType || "").toLowerCase();
  if (t === "sell" || t === "off-plan") return SALE_AGENT_COMMISSION_PERCENT;
  if (t === "rent") return RENT_AGENT_COMMISSION_PERCENT;
  return null;
}

export function clampListingCommissionPercent(
  percent: number,
  opts: { propertyType?: string | null; publisherType?: string | null },
): number {
  const max = listingCommissionCap(opts.propertyType);
  const min = Math.min(publisherCommissionPercentMin(opts.publisherType), max);
  return Math.min(max, Math.max(min, percent));
}

export function listingAgentCommissionFields(
  propertyType: string,
  price: number,
  fallbackPercent?: number,
  publisherType?: string | null,
): { agentCommissionPercent: number; agentCommissionAmount: number } {
  const raw = Number(fallbackPercent);
  const pct = clampListingCommissionPercent(
    Number.isFinite(raw) ? raw : defaultAgentCommissionPercent(propertyType),
    { propertyType, publisherType },
  );
  return {
    agentCommissionPercent: pct,
    agentCommissionAmount: Math.round((Number(price) || 0) * pct / 100),
  };
}
