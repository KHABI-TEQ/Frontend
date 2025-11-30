import nigeriaLocationData from "@/data/nigeria-locations.json";

export interface LocationData {
  [state: string]: {
    [lga: string]: string[];
  };
}

export const getStates = (): string[] => {
  return Object.keys(nigeriaLocationData);
};

export const getLGAsByState = (state: string): string[] => {
  return state
    ? Object.keys(
        nigeriaLocationData[state as keyof typeof nigeriaLocationData] || {},
      )
    : [];
};

export const getAreasByStateLGA = (state: string, lga: string): string[] => {
  if (!state || !lga) return [];
  const stateData =
    nigeriaLocationData[state as keyof typeof nigeriaLocationData];
  if (!stateData) return [];
  return stateData[lga as keyof typeof stateData] || [];
};

export const searchLocations = (
  query: string,
): { state: string; lga?: string; area?: string }[] => {
  const results: { state: string; lga?: string; area?: string }[] = [];
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return results;

  Object.entries(nigeriaLocationData).forEach(([state, lgaData]) => {
    // Search states
    if (state.toLowerCase().includes(searchTerm)) {
      results.push({ state });
    }

    // Search LGAs
    Object.entries(lgaData).forEach(([lga, areas]) => {
      if (lga.toLowerCase().includes(searchTerm)) {
        results.push({ state, lga });
      }

      // Search areas
      areas.forEach((area: string) => {
        if (area.toLowerCase().includes(searchTerm)) {
          results.push({ state, lga, area });
        }
      });
    });
  });

  return results.slice(0, 20); // Limit results for performance
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
