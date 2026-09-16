"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="w-full min-h-screen bg-[#FFFEFB] pt-24 sm:pt-28 lg:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {eyebrow ? (
          <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#0B423D]/60 mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl sm:text-5xl font-bold text-[#09391C] leading-tight">{title}</h1>
        {intro ? <p className="mt-4 text-lg text-[#5A5D63] leading-relaxed max-w-3xl">{intro}</p> : null}
        <div className="mt-10 space-y-8">{children}</div>
        <p className="mt-12 text-sm text-[#5A5D63]">
          <Link href="/" className="font-semibold text-[#09391C] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
