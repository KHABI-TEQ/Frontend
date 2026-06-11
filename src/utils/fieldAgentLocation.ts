export type PropertyLocationLike = {
  area?: string;
  state?: string;
  localGovernment?: string;
};

export type PropertyLocationSource = {
  location?: PropertyLocationLike;
  title?: string;
};

/**
 * Resolve state + LGA for Field Agent matching. LGA is the primary match key;
 * area/neighborhood (e.g. Alausa) is not required.
 */
export function resolvePropertyLocationForFieldAgent(
  property?: PropertyLocationSource | null,
): { state?: string; lga?: string } {
  if (!property) return {};

  const loc = property.location;
  if (loc?.state?.trim() || loc?.localGovernment?.trim()) {
    return {
      state: loc.state?.trim() || undefined,
      lga: loc.localGovernment?.trim() || undefined,
    };
  }

  // Fallback when API only returns composed title: "area, lga, state"
  const title = property.title?.trim();
  if (!title || title.toLowerCase().includes("undefined")) return {};

  const parts = title
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      lga: parts[parts.length - 2],
      state: parts[parts.length - 1],
    };
  }
  if (parts.length === 2) {
    return { lga: parts[0], state: parts[1] };
  }

  return {};
}
