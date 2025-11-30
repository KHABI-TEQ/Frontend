export default function useAmount(
  nightlyRate?: number,
  cleaningFee?: number,
  checkIn?: string,
  checkOut?: string,
  weeklyDiscount?: number,
  monthlyDiscount?: number,
  securityDeposit?: number
) {
  const diffMs =
    checkIn && checkOut
      ? Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
      : 0;

  const nights = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const rate =
    typeof nightlyRate === "number" && Number.isFinite(nightlyRate) ? nightlyRate : 0;

  const base = nights * rate;
  const clean = typeof cleaningFee === "number" ? cleaningFee : 0;
  const weekly = typeof weeklyDiscount === "number" ? weeklyDiscount : 0;
  const monthly = typeof monthlyDiscount === "number" ? monthlyDiscount : 0;
  const secDep = typeof securityDeposit === "number" ? securityDeposit : 0;

  // Discounts apply only to nightly charges
  const discountPct = nights >= 30 ? monthly : nights >= 7 ? weekly : 0;
  const discountAmount = Math.round((base * discountPct) / 100);

  const subtotal = Math.max(0, base - discountAmount); // nightly charges only
  const total = subtotal + clean + secDep; // add fixed fees
  const serviceCharge = Math.round(total * 0.08); // 8% service charge on total
  const payable = total + serviceCharge;

  return {
    nights,
    base,
    rate,
    discountPct,
    discountAmount,
    subtotal,
    total,
    serviceCharge,
    payable,
    cleaningFee: clean,
    securityDeposit: secDep,
  };
}
