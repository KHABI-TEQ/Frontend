/**
 * Dashboard Sidebar Navigation
 * Displays menu items for the Public Access Page management dashboard
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  BarChart3,
  Palette,
  ShoppingCart,
  CheckSquare,
  MessageCircle,
  Share2,
  BookOpen,
  Mail,
  DollarSign,
  Star,
  Grid,
  Home,
  Lock,
  Activity,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  group: "overview" | "content" | "settings" | "system";
}

const NAV_ITEMS: NavItem[] = [
  // Overview
  { id: "overview", label: "Overview", path: "/public-access-page", icon: <BarChart3 size={18} />, group: "overview" },

  // Content & Design
  { id: "branding", label: "Branding & SEO", path: "/public-access-page/branding", icon: <Settings size={18} />, group: "content" },
  { id: "theme", label: "Theme", path: "/public-access-page/theme", icon: <Palette size={18} />, group: "content" },
  { id: "home-page", label: "Home Page", path: "/public-access-page/home-page", icon: <Home size={18} />, group: "content" },
  { id: "featured", label: "Featured Listings", path: "/public-access-page/featured", icon: <Star size={18} />, group: "content" },
  { id: "preferences", label: "Preferences Requests", path: "/public-access-page/preferences", icon: <FileText size={18} />, group: "content" },

  // Settings
  { id: "inspection", label: "Inspection Settings", path: "/public-access-page/inspection", icon: <CheckSquare size={18} />, group: "settings" },
  { id: "social", label: "Social Links", path: "/public-access-page/social", icon: <Share2 size={18} />, group: "settings" },
  { id: "about", label: "About Us", path: "/public-access-page/about", icon: <BookOpen size={18} />, group: "settings" },
  { id: "contact-us", label: "Contact Us Page", path: "/public-access-page/contact-us", icon: <Mail size={18} />, group: "settings" },
  { id: "payment", label: "Payment Details", path: "/public-access-page/payment", icon: <DollarSign size={18} />, group: "settings" },
  { id: "subscribe", label: "Subscribe Settings", path: "/public-access-page/subscribe-settings", icon: <Mail size={18} />, group: "settings" },

  // System
  { id: "security", label: "Security", path: "/public-access-page/security", icon: <Lock size={18} />, group: "system" },
  { id: "logs", label: "Activity Logs", path: "/public-access-page/logs", icon: <Activity size={18} />, group: "system" },
];

const GROUPS = {
  overview: "Dashboard",
  content: "Content & Design",
  settings: "Settings",
  system: "System",
};

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export default function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isPaused } = useDealSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const groupedItems = {
    overview: NAV_ITEMS.filter((item) => item.group === "overview"),
    content: NAV_ITEMS.filter((item) => item.group === "content"),
    settings: NAV_ITEMS.filter((item) => item.group === "settings"),
    system: NAV_ITEMS.filter((item) => item.group === "system"),
  };

  const isActive = (path: string) => {
    if (path === "/public-access-page") {
      return pathname === path || pathname === "/public-access-page/";
    }
    return pathname.startsWith(path);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    onNavigate?.();
  };

  const SidebarContent = (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Overview Group */}
        {groupedItems.overview.length > 0 && (
          <div className="px-4 py-4 space-y-1">
            {groupedItems.overview.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Content & Design Group */}
        {groupedItems.content.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {GROUPS.content}
            </h3>
            {groupedItems.content.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Settings Group */}
        {groupedItems.settings.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {GROUPS.settings}
            </h3>
            {groupedItems.settings.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* System Group */}
        {groupedItems.system.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {GROUPS.system}
            </h3>
            {groupedItems.system.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            isPaused ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-yellow-500" : "bg-emerald-500"}`} />
          {isPaused ? "Paused" : "Live"}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="px-4 py-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#09391C]">Public Access</h2>
          <p className="text-xs text-gray-500 mt-1">Dashboard</p>
        </div>
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Panel */}
          <aside className="absolute inset-y-0 left-0 w-64 bg-white flex flex-col">
            <div className="px-4 py-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#09391C]">Public Access</h2>
              <p className="text-xs text-gray-500 mt-1">Dashboard</p>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
