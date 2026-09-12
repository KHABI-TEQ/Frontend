/** Agents, developers, and property scouts list on mandate — hide the owner toggle. */
export function shouldHideListingOwnerDeclaration(
  userType?: string | null,
): boolean {
  const t = String(userType || "").trim().toLowerCase();
  return t === "agent" || t === "developer";
}
