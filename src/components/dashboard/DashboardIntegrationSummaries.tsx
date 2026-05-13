"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { ArrowRight, Globe2, UserCircle } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type Connection = { status?: string };

function syndicationCounts(platforms: unknown[], connections: Connection[]) {
  const approved = Array.isArray(platforms) ? platforms.length : 0;
  const totalConn = connections.length;
  const activeConn = connections.filter((c) => c.status === "active").length;
  return { approved, totalConn, activeConn };
}

export function SyndicationIntegrationSummary() {
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(0);
  const [totalConn, setTotalConn] = useState(0);
  const [activeConn, setActiveConn] = useState(0);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [platformsRes, connectionsRes] = await Promise.all([
          GET_REQUEST<{ data?: unknown[] }>(`${URLS.BASE}${URLS.accountSyndicationPlatforms}`, token),
          GET_REQUEST<{ data?: Connection[] }>(`${URLS.BASE}${URLS.accountSyndicationConnections}`, token),
        ]);
        const platformsResUnknown = platformsRes as unknown as { data?: unknown[] };
        const connectionsResUnknown = connectionsRes as unknown as { data?: Connection[] };
        const p = Array.isArray(platformsResUnknown?.data) ? platformsResUnknown.data : [];
        const c = Array.isArray(connectionsResUnknown?.data) ? connectionsResUnknown.data : [];
        const counts = syndicationCounts(p, c);
        if (!cancelled) {
          setApproved(counts.approved);
          setTotalConn(counts.totalConn);
          setActiveConn(counts.activeConn);
        }
      } catch {
        if (!cancelled) {
          setApproved(0);
          setTotalConn(0);
          setActiveConn(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border border-[#E3E8EF] shadow-sm p-4 sm:p-5 flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-[#09391C]/10 text-[#09391C]">
          <Globe2 className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#09391C]">Syndication integrations</h3>
          <p className="text-xs text-[#5A5D63] mt-0.5">Partner platforms and live connections</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1">
        <div className="rounded-lg bg-[#FAFCFE] border border-[#E8EEF4] px-2 py-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-[#09391C] tabular-nums">{loading ? "—" : approved}</p>
          <p className="text-[10px] sm:text-xs text-[#5A5D63] mt-0.5 leading-tight">Approved platforms</p>
        </div>
        <div className="rounded-lg bg-[#FAFCFE] border border-[#E8EEF4] px-2 py-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-[#09391C] tabular-nums">{loading ? "—" : totalConn}</p>
          <p className="text-[10px] sm:text-xs text-[#5A5D63] mt-0.5 leading-tight">Connections</p>
        </div>
        <div className="rounded-lg bg-[#FAFCFE] border border-[#E8EEF4] px-2 py-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-[#0F6F32] tabular-nums">{loading ? "—" : activeConn}</p>
          <p className="text-[10px] sm:text-xs text-[#5A5D63] mt-0.5 leading-tight">Active</p>
        </div>
      </div>
      <Link
        href="/dashboard/syndication"
        className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#09391C] hover:text-[#0d4d27] py-2 rounded-lg border border-[#8DDB90]/60 hover:bg-[#F2FBF3] transition-colors"
      >
        Open syndication
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function InspectionRepresentativesSummary() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = `${URLS.BASE}${URLS.accountInspectionRepresentatives}`;
        const res = await GET_REQUEST<{ representatives?: unknown[] }>(url, token);
        const raw = res as { success?: boolean; data?: { representatives?: unknown[] } };
        const list =
          raw?.success && raw.data && Array.isArray(raw.data.representatives) ? raw.data.representatives : [];
        const n = list.length;
        if (!cancelled) setCount(n);
      } catch {
        if (!cancelled) setCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border border-[#E3E8EF] shadow-sm p-4 sm:p-5 flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-[#8DDB90]/20 text-[#09391C]">
          <UserCircle className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#09391C]">Inspection representatives</h3>
          <p className="text-xs text-[#5A5D63] mt-0.5">Contacts for inspection notifications</p>
        </div>
      </div>
      <div className="rounded-lg bg-[#FAFCFE] border border-[#E8EEF4] px-4 py-6 text-center flex-1 flex flex-col justify-center">
        <p className="text-3xl font-bold text-[#09391C] tabular-nums">{loading ? "—" : count}</p>
        <p className="text-sm text-[#5A5D63] mt-1">Saved representatives</p>
      </div>
      <Link
        href="/dashboard/inspection-representatives"
        className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#09391C] hover:text-[#0d4d27] py-2 rounded-lg border border-[#8DDB90]/60 hover:bg-[#F2FBF3] transition-colors"
      >
        Manage contacts
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
