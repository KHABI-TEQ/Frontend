"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CalendarCheck,
  FileCheck,
  LayoutDashboard,
  Menu,
  Search,
  Shield,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { clearBuyerSession, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  match?: string;
}[] = [
  { href: "/buyer", label: "Dashboard", exact: true, icon: LayoutDashboard },
  { href: "/buyer/profile", label: "Profile", icon: UserRound },
  { href: "/buyer/searches", label: "Preferences", icon: Search },
  { href: "/buyer/inspections", label: "Inspections", icon: CalendarCheck },
  { href: "/buyer/service-requests", label: "Offers", icon: Briefcase },
  { href: "/buyer/services", label: "Professionals", icon: Users },
  { href: "/transaction-registration", label: "Transactions", icon: FileCheck },
  { href: "/buyer/claims/new", label: "Insurance", match: "/buyer/claims", icon: Shield },
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
  const [open, setOpen] = useState(false);

  const signOut = () => {
    clearBuyerSession();
    window.location.href = "/buyer/login";
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.match || item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              active ? "bg-[#09391C] text-white" : "text-[#09391C] hover:bg-[#F4FBF5]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-[#F5F7F9] pt-24 pb-16">
      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        <aside className="sticky top-24 hidden h-[calc(100vh-7.5rem)] w-64 shrink-0 flex-col rounded-3xl border border-black/5 bg-white p-4 shadow-sm md:flex">
          <div className="mb-5 px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">Client account</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#09391C]">
              {buyer?.email || "Your account"}
            </p>
          </div>
          {nav}
          <div className="mt-4 border-t border-gray-100 pt-4">
            {signedIn ? (
              <button
                type="button"
                onClick={signOut}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#5A5D63] hover:bg-[#F5F7F9]"
              >
                Sign out
              </button>
            ) : (
              <Link href="/buyer/login" className="block rounded-xl bg-[#09391C] px-3 py-2 text-center text-sm font-semibold text-white">
                Sign in
              </Link>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#09391C] md:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-sm text-[#5A5D63]">{subtitle}</p>
              ) : buyer?.email ? (
                <p className="mt-1 text-sm text-[#5A5D63] md:hidden">{buyer.email}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#09391C] md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
          {children}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            aria-label="Close account menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">Client account</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#09391C]">{buyer?.email || "Your account"}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 text-[#09391C]">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            <div className="mt-4 border-t border-gray-100 pt-4">
              {signedIn ? (
                <button type="button" onClick={signOut} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#5A5D63]">
                  Sign out
                </button>
              ) : (
                <Link href="/buyer/login" className="block rounded-xl bg-[#09391C] px-3 py-2 text-center text-sm font-semibold text-white">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
