/** @format */

// Export all property card components
export { default as StandardPropertyCard } from './StandardPropertyCard';
export type { StandardPropertyCardProps } from './StandardPropertyCard';

export { default as JVPropertyCard } from './JVPropertyCard';
export type { JVPropertyCardProps } from './JVPropertyCard';

export { default as UniversalPropertyCard, createPropertyCardData } from './UniversalPropertyCard';
export type { UniversalPropertyCardProps } from './UniversalPropertyCard';

// Export new global components (without button functionality)
export { default as GlobalPropertyCard } from './GlobalPropertyCard';
export { default as GlobalJVPropertyCard } from './GlobalJVPropertyCard';

// Export enhanced global component (with button functionality and modals)
export { default as EnhancedGlobalPropertyCard } from './EnhancedGlobalPropertyCard';

// Re-export for backward compatibility
export { default as PropertyCard } from './UniversalPropertyCard';
