/** @format */

/** Human-readable practitioner incentive label for plan cards. */
export function formatSubscriptionBonusLabel(bonusDays: number): string | null {
  if (!bonusDays || bonusDays <= 0) return null;
  if (bonusDays === 15) return "+15 days free";
  if (bonusDays === 30) return "+1 month free";
  if (bonusDays === 60) return "+2 months free";
  if (bonusDays === 90) return "+3 months free";
  return `+${bonusDays} days free`;
}

/** Short tier hint when API does not return bonusDays (fallback from duration). */
export function inferBonusDaysFromDuration(durationInDays?: number): number {
  const d = Number(durationInDays ?? 0);
  if (d >= 300) return 90;
  if (d >= 150) return 60;
  if (d >= 80) return 30;
  if (d >= 20) return 15;
  return 0;
}

export function resolvePlanBonusDays(plan: {
  bonusDays?: number;
  durationInDays?: number;
  name?: string;
}): number {
  if (typeof plan.bonusDays === "number" && plan.bonusDays > 0) {
    return plan.bonusDays;
  }
  return inferBonusDaysFromDuration(plan.durationInDays);
}
