export type AddressBreakdown = {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

export const EMPTY_ADDRESS: AddressBreakdown = {
  houseNumber: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
};

export function buildFullAddress(parts: Partial<AddressBreakdown>): string {
  return [
    parts.houseNumber?.trim(),
    parts.street?.trim(),
    parts.city?.trim(),
    parts.state?.trim(),
    parts.postalCode?.trim(),
  ]
    .filter((part) => part && part.length > 0)
    .join(", ");
}

export function isAddressRequiredPartsFilled(parts: AddressBreakdown): boolean {
  return Boolean(parts.street.trim() && parts.city.trim() && parts.state.trim());
}
