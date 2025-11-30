export function formatDate(date: string | Date): string {
  if (!date) return '-'; // Return fallback for missing dates
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '-'; // Return fallback for invalid dates
  return parsedDate.toLocaleDateString(); // Format valid dates
}

export const kebabToTitleCase = (str: string): string => {
  if (!str) return "";

  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}; 


interface Location {
  state?: string | null;
  localGovernment?: string | null;
  area?: string | null;
  streetAddress?: string | null;
}

/**
 * Builds a human-readable title from location object
 * @param location - object with state, localGovernment, area, streetAddress
 * @returns string like "12 Bode Street, Agiliti, Kosofe, Lagos"
 */
export const buildLocationTitle = (location?: Location): string => {
  if (!location) return "";

  const { streetAddress, area, localGovernment, state } = location;

  // Trim values and remove null/empty ones
  return [streetAddress, area, localGovernment, state]
    .map((val) => (val ? val.trim() : "")) // clean up whitespace
    .filter(Boolean) // remove null/empty
    .join(", ");
};


