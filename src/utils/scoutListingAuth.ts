import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { shouldHideListingOwnerDeclaration } from "@/utils/listingOwnerDeclaration";

/** Persist only an agent-set fee. Empty/0/null stays 0 (no fee). */
export function listingInspectionFeeNaira(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(50000, Math.max(1000, Math.round(n)));
}

/** True when a Property Scout tried to submit without the mandate checkbox. */
export async function scoutMustConfirmListingAuthorization(
  userType: string | undefined,
  authorized: boolean | undefined,
): Promise<boolean> {
  if (!shouldHideListingOwnerDeclaration(userType)) return false;
  const token = Cookies.get("token");
  if (!token) return false;
  try {
    const scoutRes = await GET_REQUEST(
      `${URLS.BASE}${URLS.propertyScoutStatus}`,
      token,
    );
    return Boolean((scoutRes as { data?: { isPropertyScout?: boolean } })?.data?.isPropertyScout) && !authorized;
  } catch {
    return false;
  }
}
