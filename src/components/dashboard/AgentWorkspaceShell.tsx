"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useUserContext } from "@/context/user-context";

const AGENT_SHELL_PREFIXES = [
  "/dashboard",
  "/my-listings",
  "/my-transactions",
  "/my-inspection-requests",
  "/my-request-to-market",
  "/agent-marketplace",
  "/licensed-agent-representation-requests",
  "/lasrera-marketplace",
  "/agent-broadcast",
  "/agent-subscriptions",
  "/profile-settings",
  "/public-access-page",
  "/notifications",
  "/post-property",
];

export function isAgentWorkspacePath(pathname: string | null) {
  if (!pathname) return false;
  return AGENT_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AgentWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserContext();
  const [navOpen, setNavOpen] = useState(false);
  const [practitionerOpen, setPractitionerOpen] = useState(
    Boolean(pathname?.startsWith("/public-access-page")),
  );
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "A";

  const navLinkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active ? "bg-[#E7F6EC] text-[#14804A]" : "text-[#3d5244] hover:bg-[#F4FBF6]"
    }`;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] lg:flex">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[#E6EEE8] bg-white px-4 py-5 transition-transform lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/khabi-logo-nav.svg" alt="Khabi-Teq" className="h-8 w-auto" />
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className={navLinkClass("/dashboard", true)} onClick={() => setNavOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard overview
          </Link>
          <Link href="/my-listings" className={navLinkClass("/my-listings")} onClick={() => setNavOpen(false)}>
            <Briefcase size={16} /> My Listings
          </Link>
          <button
            type="button"
            onClick={() => setPractitionerOpen((open) => !open)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F4FBF6] ${
              pathname?.startsWith("/public-access-page") ? "bg-[#E7F6EC] text-[#14804A]" : "text-[#3d5244]"
            }`}
          >
            <span className="flex items-center gap-3">
              <Home size={16} /> Practitioner Page
            </span>
            <ChevronDown size={14} className={practitionerOpen ? "rotate-180" : ""} />
          </button>
          {practitionerOpen ? (
            <div className="ml-8 space-y-1">
              <Link href="/public-access-page" className="block rounded-lg px-3 py-2 text-sm text-[#3d5244] hover:bg-[#F4FBF6]" onClick={() => setNavOpen(false)}>
                Overview
              </Link>
              <Link href="/public-access-page/setup" className="block rounded-lg px-3 py-2 text-sm text-[#3d5244] hover:bg-[#F4FBF6]" onClick={() => setNavOpen(false)}>
                Setup
              </Link>
            </div>
          ) : null}
          <Link href="/my-transactions" className={navLinkClass("/my-transactions")} onClick={() => setNavOpen(false)}>
            <FileText size={16} /> My Transactions
          </Link>
          <Link href="/my-inspection-requests" className={navLinkClass("/my-inspection-requests")} onClick={() => setNavOpen(false)}>
            <Calendar size={16} /> Inspection Requests
          </Link>
          <Link href="/my-request-to-market" className={navLinkClass("/my-request-to-market")} onClick={() => setNavOpen(false)}>
            <Briefcase size={16} /> Deal requests
          </Link>
          <Link href="/agent-marketplace" className={navLinkClass("/agent-marketplace")} onClick={() => setNavOpen(false)}>
            <Users size={16} /> Agent Marketplace
          </Link>
          <Link href="/licensed-agent-representation-requests" className={navLinkClass("/licensed-agent-representation-requests")} onClick={() => setNavOpen(false)}>
            <Users size={16} /> Scout requests
          </Link>
          <Link href="/lasrera-marketplace" className={navLinkClass("/lasrera-marketplace")} onClick={() => setNavOpen(false)}>
            <Home size={16} /> Listing owner properties
          </Link>
          <Link href="/agent-broadcast" className={navLinkClass("/agent-broadcast")} onClick={() => setNavOpen(false)}>
            <Mail size={16} /> Broadcast
          </Link>
          <Link href="/agent-subscriptions" className={navLinkClass("/agent-subscriptions")} onClick={() => setNavOpen(false)}>
            <CreditCard size={16} /> Manage Subscriptions
          </Link>
          <Link href="/profile-settings" className={navLinkClass("/profile-settings")} onClick={() => setNavOpen(false)}>
            <Settings size={16} /> Settings
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => logout(() => router.push("/auth/login"))}
          className="mt-4 flex items-center gap-2 border-t border-[#E6EEE8] px-3 pt-4 text-sm font-medium text-[#3d5244]"
        >
          <LogOut size={16} /> Log out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button type="button" className="rounded-lg border border-[#E6EEE8] bg-white p-2 lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link href="/agent-subscriptions?tab=plans" className="rounded-full bg-[#14804A] px-4 py-2 text-xs font-semibold text-white sm:text-sm">
              Upgrade Plan
            </Link>
            <Link href="/notifications" className="rounded-full border border-[#E6EEE8] bg-white p-2 text-[#09391C]" aria-label="Notifications">
              <Bell size={16} />
            </Link>
            <Link href="/profile-settings" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14804A] text-xs font-bold text-white">
              {initials}
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
