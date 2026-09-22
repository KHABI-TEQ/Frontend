export function resolveSubscriptionDisplayStatus(
  status?: string | null,
  expiresAt?: string | Date | null,
): string {
  const end = expiresAt ? new Date(expiresAt) : null;
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
    return "expired";
  }
  return String(status || "").trim() || "unknown";
}

export function isLivePaidSubscription(
  sub?: {
    status?: string | null;
    endDate?: string | Date | null;
    expiresAt?: string | Date | null;
    meta?: { planType?: string | null; appliedPlanName?: string | null };
    plan?: { name?: string | null; isTrial?: boolean; price?: number } | string | null;
  } | null,
): boolean {
  if (!sub) return false;
  const display = resolveSubscriptionDisplayStatus(
    sub.status,
    sub.endDate ?? sub.expiresAt,
  );
  if (display !== "active") return false;

  const planType = String(sub.meta?.planType || "");
  const planName =
    typeof sub.plan === "object" && sub.plan
      ? String(sub.plan.name || "")
      : String(sub.meta?.appliedPlanName || "");
  if (/free|trial/i.test(planType) || /free|trial/i.test(planName)) return false;
  if (typeof sub.plan === "object" && sub.plan?.isTrial) return false;
  if (typeof sub.plan === "object" && sub.plan?.price === 0) return false;
  return true;
}
