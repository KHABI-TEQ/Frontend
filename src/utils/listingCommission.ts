/** Mandatory agent commission on sale / off-plan listings. */
export const SALE_AGENT_COMMISSION_PERCENT = 5;
/** Mandatory agent commission on rental listings. */
export const RENT_AGENT_COMMISSION_PERCENT = 10;
/** JV / shortlet remain optionally adjustable up to this cap. */
export const FLEXIBLE_AGENT_COMMISSION_PERCENT_MAX = 5;

export function mandatoryAgentCommissionPercent(
  propertyType?: string | null,
): number | null {
  const t = String(propertyType || "").toLowerCase();
  if (t === "sell" || t === "off-plan") return SALE_AGENT_COMMISSION_PERCENT;
  if (t === "rent") return RENT_AGENT_COMMISSION_PERCENT;
  return null;
}

export function listingAgentCommissionFields(
  propertyType: string,
  price: number,
  fallbackPercent?: number,
): { agentCommissionPercent: number; agentCommissionAmount: number } {
  const mandatory = mandatoryAgentCommissionPercent(propertyType);
  const pct =
    mandatory ??
    Math.min(
      FLEXIBLE_AGENT_COMMISSION_PERCENT_MAX,
      Math.max(0, fallbackPercent ?? FLEXIBLE_AGENT_COMMISSION_PERCENT_MAX),
    );
  return {
    agentCommissionPercent: pct,
    agentCommissionAmount: Math.round((Number(price) || 0) * pct / 100),
  };
}
