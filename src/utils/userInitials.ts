/** First + last initials for the navbar avatar default. */
export function userDisplayInitials(
  user?: { firstName?: string; lastName?: string; email?: string } | null,
): string {
  const first = String(user?.firstName || "").trim();
  const last = String(user?.lastName || "").trim();
  const a = first.charAt(0);
  const b = last.charAt(0);
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  const email = String(user?.email || "").trim();
  if (email) return email.charAt(0).toUpperCase();
  return "U";
}
