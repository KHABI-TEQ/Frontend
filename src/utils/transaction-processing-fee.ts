export const PROCESSING_FEE_THRESHOLD_MIN = 5_000_000;
export const PROCESSING_FEE_THRESHOLD_MAX = 50_000_000;

export const PROCESSING_FEE_BANDS: { label: string; feeNaira: number }[] = [
  { label: "Below ₦5,000,000", feeNaira: 0 },
  { label: "₦5,000,000 – ₦50,000,000", feeNaira: 100_000 },
  { label: "Above ₦50,000,000", feeNaira: 150_000 },
];

export function getProcessingFeeFromTransactionValue(value: number): number {
  if (!Number.isFinite(value) || value < PROCESSING_FEE_THRESHOLD_MIN) return 0;
  if (value <= PROCESSING_FEE_THRESHOLD_MAX) return 100_000;
  return 150_000;
}

export function parseTransactionValueInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly === "") return NaN;
  return Number(digitsOnly);
}
