/** Mirrors backend band logic. Used for display only; register response `processingFee` is authoritative. */

export const PROCESSING_FEE_BANDS: { label: string; feeNaira: number }[] = [
  { label: "Below ₦5,000,000", feeNaira: 50_000 },
  { label: "₦5,000,000 – ₦50,000,000", feeNaira: 100_000 },
  { label: "Above ₦50,000,000 – below ₦500,000,000", feeNaira: 150_000 },
  { label: "₦500,000,000 – ₦1,000,000,000", feeNaira: 300_000 },
  { label: "Above ₦1,000,000,000", feeNaira: 3_000_000 },
];

export function getProcessingFeeFromTransactionValue(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 5_000_000) return 50_000;
  if (value <= 50_000_000) return 100_000;
  if (value < 500_000_000) return 150_000;
  if (value <= 1_000_000_000) return 300_000;
  return 3_000_000;
}

export function parseTransactionValueInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly === "") return NaN;
  return Number(digitsOnly);
}
