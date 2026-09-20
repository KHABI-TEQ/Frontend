"use client";

import Link from "next/link";
import { clearBuyerSession, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";

export default function BuyerShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const signedIn = Boolean(getBuyerToken());
  const buyer = getBuyerProfile();

  return (
    <main className="min-h-screen bg-[#F5F7F9] pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
              Buyer account
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#09391C]">{title}</h1>
            {buyer?.email ? (
              <p className="mt-1 text-sm text-[#5A5D63]">{buyer.email}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/buyer/searches" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#09391C] shadow-sm">
              My searches
            </Link>
            <Link href="/buyer/claims/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#09391C] shadow-sm">
              File a claim
            </Link>
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
        {children}
      </div>
    </main>
  );
}
