/** @format */

/**
 * Utility functions for price formatting and validation
 */

/**
 * Formats a numeric value for display with naira symbol and commas
 * @param value - The numeric value to format
 * @returns Formatted string with ₦ symbol and commas
 */
export const formatPriceForDisplay = (value: string | number): string => {
  if (!value && value !== 0) return "";

  // Remove all non-numeric characters
  const numericValue = value.toString().replace(/[^0-9]/g, "");

  if (!numericValue || numericValue === "0") return "";

  // Convert to number and format with commas
  const num = parseInt(numericValue);
  return `₦${num.toLocaleString()}`;
};

/**
 * Extracts numeric value from formatted price string for API payload
 * @param formattedPrice - The formatted price string (e.g., "₦1,500,000")
 * @returns Clean numeric string without symbols or commas
 */
export const extractNumericValue = (input: unknown): number => {
  if (typeof input === "number") return input;

  if (typeof input === "string") {
    const numeric = parseFloat(input.replace(/[^0-9.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  }

  return 0;
};


/**
 * Formats a number with commas but without currency symbol
 * @param value - The numeric value to format
 * @returns Formatted string with commas only
 */
export const formatNumberWithCommas = (value: string | number): string => {
  if (!value && value !== 0) return "";

  const numericValue = value.toString().replace(/[^0-9]/g, "");

  if (!numericValue || numericValue === "0") return "";

  const num = parseInt(numericValue);
  return num.toLocaleString();
};

/**
 * Validates if a string contains only numeric characters
 * @param value - The string to validate
 * @returns true if the string contains only numbers
 */
export const isNumericOnly = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * Removes all non-numeric characters from a string
 * @param value - The string to clean
 * @returns String with only numeric characters
 */
export const cleanNumericInput = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};
