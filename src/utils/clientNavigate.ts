/** Client-side navigation without next/navigation (safe in monorepo duplicate-React setups). */
export function clientNavigate(href: string): void {
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
}
