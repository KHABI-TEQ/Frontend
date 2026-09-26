"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearBuyerSession, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

const NAV = [
  { href: "/buyer", label: "Dashboard", exact: true },
  { href: "/buyer/profile", label: "Profile" },
  { href: "/buyer/searches", label: "Preferences" },
  { href: "/buyer/inspections", label: "Inspections" },
  { href: "/buyer/services", label: "Professionals" },
  { href: "/transaction-registration", label: "Transactions" },
  { href: "/buyer/claims/new", label: "Insurance" },
];

export default function BuyerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const signedIn = Boolean(getBuyerToken());
  const buyer = getBuyerProfile();
  const pathname = usePathname() || "";

  return (
    <main className="min-h-screen bg-[#F5F7F9] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
              Client account
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#09391C]">{title}</h1>
            {subtitle ? (
              <p className="mt-1 max-w-2xl text-sm text-[#5A5D63]">{subtitle}</p>
            ) : buyer?.email ? (
              <p className="mt-1 text-sm text-[#5A5D63]">{buyer.email}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {signedIn ? (
              <button
                type="button"
                onClick={() => {
                  clearBuyerSession();
                  window.location.href = "/buyer/login";
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#5A5D63]"
              >
                Sign out
              </button>
            ) : (
              <Link href="/buyer/login" className="rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                  active ? "bg-[#09391C] text-white" : "bg-white text-[#09391C]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </main>
  );
}
