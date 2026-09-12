import nigeriaLocationData from "@/data/nigeria-locations.json";
import nigeriaEstatesData from "@/data/nigeria-estates.json";

export interface LocationData {
  [state: string]: {
    [lga: string]: string[];
  };
}

export const getStates = (): string[] => {
  return Object.keys(nigeriaLocationData).sort();
};

export const getLGAsByState = (state: string): string[] => {
  return state
    ? Object.keys(
        nigeriaLocationData[state as keyof typeof nigeriaLocationData] || {},
      ).sort()
    : [];
};

export const getAreasByStateLGA = (state: string, lga: string): string[] => {
  if (!state || !lga) return [];
  const stateData =
    nigeriaLocationData[state as keyof typeof nigeriaLocationData];
  if (!stateData) return [];
  const areas = stateData[lga as keyof typeof stateData] || [];
  return (areas as string[]).sort();
};

const estatesRoot = nigeriaEstatesData as Record<string, unknown>;

export const getEstatesByStateLgaArea = (
  state: string,
  lga: string,
  area: string,
): string[] => {
  if (!state || !lga || !area) return [];
  const stateBucket =
    (estatesRoot[state] as Record<string, Record<string, string[]>> | undefined) ||
    (Object.keys(estatesRoot)
      .filter((k) => k !== "_meta")
      .find((k) => k.toLowerCase() === state.toLowerCase())
      ? (estatesRoot[
          Object.keys(estatesRoot).find(
            (k) => k !== "_meta" && k.toLowerCase() === state.toLowerCase(),
          ) as string
        ] as Record<string, Record<string, string[]>>)
      : null);
  if (!stateBucket) return [];
  const lgaKey = Object.keys(stateBucket).find(
    (k) => k.toLowerCase() === lga.toLowerCase(),
  );
  if (!lgaKey) return [];
  const areaMap = stateBucket[lgaKey] || {};
  const areaKey = Object.keys(areaMap).find(
    (k) => k.toLowerCase() === area.toLowerCase(),
  );
  if (!areaKey) return [];
  return [...(areaMap[areaKey] || [])].sort();
};

export const searchLocations = (
  query: string,
  limit = 20,
): { state: string; lga?: string; area?: string }[] => {
  const results: { state: string; lga?: string; area?: string }[] = [];
  const searchTerm = query.toLowerCase().trim();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const searchNorm = norm(searchTerm);

  if (!searchTerm) return results;

  const matches = (candidate: string): boolean => {
    const c = candidate.toLowerCase();
    const cn = norm(candidate);
    if (c.includes(searchTerm) || searchTerm.includes(c)) return true;
    if (cn.includes(searchNorm) || searchNorm.includes(cn)) return true;
    return false;
  };

  Object.entries(nigeriaLocationData).forEach(([state, lgaData]) => {
    if (matches(state)) {
      results.push({ state });
    }

    Object.entries(lgaData).forEach(([lga, areas]) => {
      if (matches(lga)) {
        results.push({ state, lga });
      }

      areas.forEach((area: string) => {
        if (matches(area)) {
          results.push({ state, lga, area });
        }
      });
    });
  });

  return results.slice(0, limit);
};

export const formatLocationString = (
  state?: string,
  lga?: string,
  area?: string,
): string => {
  const parts = [area, lga, state].filter(Boolean);
  return parts.join(", ");
};

export const parseLocationString = (
  locationString: string,
): { state?: string; lga?: string; area?: string } => {
  const parts = locationString.split(",").map((part) => part.trim());

  if (parts.length === 1) {
    return { state: parts[0] };
  } else if (parts.length === 2) {
    return { lga: parts[0], state: parts[1] };
  } else if (parts.length >= 3) {
    return { area: parts[0], lga: parts[1], state: parts[2] };
  }

  return {};
};
