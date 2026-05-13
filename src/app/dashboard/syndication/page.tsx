"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUserContext } from "@/context/user-context";
import Loading from "@/components/loading-component/loading";
import SyndicationConnectionsPanel from "@/components/dashboard/SyndicationConnectionsPanel";

function userTypeMatches(user: Record<string, unknown> | null, re: RegExp): boolean {
  if (!user) return false;
  const candidates = [user.userType, user.user_type, user.accountType, user.role, user.type]
    .filter(Boolean)
    .map((c) => String(c).toLowerCase());
  if (candidates.some((c) => re.test(c))) return true;
  if (typeof window === "undefined") return false;
  try {
    return re.test((localStorage.getItem("userType") ?? "").toLowerCase());
  } catch {
    return false;
  }
}

function canAccessSyndicationPage(user: Record<string, unknown> | null): boolean {
  return userTypeMatches(user, /agent|developer/);
}

export default function DashboardSyndicationPage() {
  const { user } = useUserContext();
  const router = useRouter();
  const allowed = useMemo(() => canAccessSyndicationPage(user as Record<string, unknown> | null), [user]);

  useEffect(() => {
    if (!user) return;
    if (!allowed) router.replace("/dashboard");
  }, [user, allowed, router]);

  if (!user) {
    return <Loading />;
  }

  if (!allowed) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#09391C] hover:text-[#0d4d27] font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#09391C] font-display mb-2">Syndication integrations</h1>
        <p className="text-[#5A5D63] text-sm sm:text-base mb-6 max-w-2xl">
          Connect approved partner platforms and control dispatch per connection. Changes here apply to your account
          immediately after you save.
        </p>
        <SyndicationConnectionsPanel />
      </div>
    </div>
  );
}
