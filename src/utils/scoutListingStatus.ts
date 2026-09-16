export function scoutListingStatusLabel(property: {
  status?: string;
  isApproved?: boolean;
  isAvailable?: boolean;
  listingReviewNote?: string;
}): string {
  const status = String(property.status || "").toLowerCase();
  if (status === "draft") return "DRAFT";
  if (status === "rejected") return "REJECTED";
  if (status === "flagged" || property.listingReviewNote) return "ACTION REQUIRED";
  if (status === "pending") return "UNDER REVIEW";
  if (status === "approved" && property.isApproved && property.isAvailable !== false) return "LIVE";
  if (status === "approved") return "APPROVED";
  return (property.status || "UNKNOWN").toUpperCase();
}
