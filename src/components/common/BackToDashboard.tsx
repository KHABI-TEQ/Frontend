"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import { getBuyerToken } from "@/lib/search-insurance";

export default function BackToDashboard({ className = "" }: { className?: string }) {
  const [href, setHref] = useState("/dashboard");

  useEffect(() => {
    if (Cookies.get("token")) {
      setHref("/dashboard");
      return;
    }
    if (getBuyerToken()) {
      setHref("/buyer");
    }
  }, []);

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors ${className}`}
    >
      <ArrowLeft size={20} />
      Back to Dashboard
    </Link>
  );
}
