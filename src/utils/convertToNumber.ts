/** @format */

const convertToNumber = (value: string): number => {
  if (!value || value.trim() === '') {
    return 0;
  }

  const regex = /₦|,/g; // Matches ₦ and commas
  const formattedValue = value.replace(regex, ''); // Remove currency symbol and commas
  const numericValue = Number(formattedValue); // Convert to number

  if (isNaN(numericValue)) {
    console.error('Invalid number format:', value);
    return 0;
  }

  return numericValue;
};

export default convertToNumber;
