export function concatFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function isPersonNameComplete(firstName: string, lastName: string): boolean {
  return firstName.trim().length > 0 && lastName.trim().length > 0;
}
