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

export const SUBSCRIPTION_JUST_ACTIVATED_KEY = "khabiteq-subscription-just-activated";

export function markSubscriptionJustActivated() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SUBSCRIPTION_JUST_ACTIVATED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hasSubscriptionJustActivated() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SUBSCRIPTION_JUST_ACTIVATED_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSubscriptionJustActivated() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SUBSCRIPTION_JUST_ACTIVATED_KEY);
  } catch {
    /* ignore */
  }
}

/** Live plan on the profile, or a subscription payment that just succeeded before the profile refresh lands. */
export function accountHasLivePlan(
  sub?: Parameters<typeof isLivePaidSubscription>[0],
): boolean {
  return isLivePaidSubscription(sub) || hasSubscriptionJustActivated();
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
