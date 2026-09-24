export function resolveSubscriptionDisplayStatus(
  status?: string | null,
  expiresAt?: string | Date | null,
): string {
  const end = expiresAt ? new Date(expiresAt) : null;
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
    return "expired";
  }
  return String(status || "").trim().toLowerCase() || "unknown";
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
  return true;
}

export function isLiveSubscription(
  sub?: {
    status?: string | null;
    endDate?: string | Date | null;
    expiresAt?: string | Date | null;
  } | null,
): boolean {
  return isLivePaidSubscription(sub);
}
