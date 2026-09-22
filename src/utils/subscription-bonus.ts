/** @format */

/** Human-readable practitioner incentive label for plan cards. */
export function formatSubscriptionBonusLabel(_bonusDays: number): string | null {
  return null;
}

export function inferBonusDaysFromDuration(_durationInDays?: number): number {
  return 0;
}

export function resolvePlanBonusDays(_plan: {
  bonusDays?: number;
  durationInDays?: number;
  name?: string;
}): number {
  return 0;
}
