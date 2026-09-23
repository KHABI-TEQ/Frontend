"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors ${className}`}
    >
      <ArrowLeft size={20} />
      Back to Dashboard
    </Link>
  );
}
