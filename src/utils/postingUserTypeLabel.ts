/** @format */

/** Human-readable label for posting flows (agreement modal, property summary, etc.). */
export function getPostingAgreementUserTypeLabel(accountType: string | undefined): string {
  const raw = (accountType ?? "").trim();
  if (!raw) return "Property Owner";
  const lower = raw.toLowerCase().replace(/\s+/g, "");
  if (lower === "agent") return "Agent";
  if (lower === "landowner" || lower === "landowners") return "Property Owner";
  if (lower === "developer") return "Developer";
  switch (raw) {
    case "Agent":
      return "Agent";
    case "Developer":
      return "Developer";
    case "Landowners":
      return "Property Owner";
    default:
      return raw;
  }
}
