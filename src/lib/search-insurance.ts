export const SEARCH_INSURANCE = {
  premiumAmount: 20_000,
  coverAmount: 2_000_000,
  partner: "Consolidated Hallmark Insurance Plc",
  productName: "Property Search Insurance",
  headline: "Search with Confidence. You're Protected.",
  tagline:
    "Insure your property search on Khabiteq with Consolidated Hallmark Insurance Plc and get up to ₦2,000,000 cover if something goes wrong.",
};

const TOKEN_KEY = "buyerToken";
const BUYER_KEY = "buyerProfile";

export type BuyerProfile = {
  id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  address?: string;
  enableNotifications?: boolean;
};

export function getBuyerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getBuyerProfile(): BuyerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUYER_KEY);
    return raw ? (JSON.parse(raw) as BuyerProfile) : null;
  } catch {
    return null;
  }
}

export function setBuyerSession(token: string, buyer?: BuyerProfile | null) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (buyer) localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
  } catch {
    /* ignore */
  }
}

export function clearBuyerSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(BUYER_KEY);
  } catch {
    /* ignore */
  }
}

export function naira(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

export async function buyerFetch<T = any>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<{ success: boolean; message?: string; errors?: string[]; data?: T }> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const token = init?.token ?? getBuyerToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (!(init?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    errors?: string[];
    data?: T;
  };
  const errorDetail = Array.isArray(json.errors)
    ? json.errors.filter(Boolean).join(" ")
    : "";
  return {
    success: !!json.success,
    message: errorDetail || json.message,
    errors: json.errors,
    data: json.data,
  };
}

export async function checkoutSearchInsurance(preferenceId: string) {
  return buyerFetch<{ paymentUrl?: string }>(
    `/preferences/${preferenceId}/search-insurance/checkout`,
    { method: "POST", body: JSON.stringify({}) }
  );
}
