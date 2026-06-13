export type LocationSearchHit = {
  state: string;
  lga?: string;
  area?: string;
};

export type LocationResolver = {
  getLGAsByState: (state: string) => string[];
  getAreasByLGA: (state: string, lga: string) => string[];
  /** All Nigerian state names for validation and extraction. */
  getAllStates?: () => string[];
  /** Fuzzy search across states, LGAs, and areas (for voice/typo correction). */
  searchLocations?: (query: string, limit?: number) => LocationSearchHit[];
};

let resolver: LocationResolver | null = null;

export function setPreferenceLocationResolver(r: LocationResolver): void {
  resolver = r;
}

export function getLGAsByState(state: string): string[] {
  return resolver?.getLGAsByState(state) ?? [];
}

export function getAreasByLGA(state: string, lga: string): string[] {
  return resolver?.getAreasByLGA(state, lga) ?? [];
}

export function getAllStatesFromResolver(): string[] {
  return resolver?.getAllStates?.() ?? [];
}

export function searchPreferenceLocations(query: string, limit = 20): LocationSearchHit[] {
  return resolver?.searchLocations?.(query, limit) ?? [];
}
