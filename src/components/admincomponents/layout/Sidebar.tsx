"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, UserCheck, Calendar, Settings,
  MessageSquare, LogOut, Shield, Activity, TrendingUp, ChevronRight, ChevronLeft,
  Briefcase, DollarSign, Package, UserPlus,
  X
} from 'lucide-react'

// Define sidebar items (can be moved to a separate constants file if preferred)
const sidebarItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overall system analytics",
  },
  {
    name: "Agent Management",
    href: "/admin/agent_management",
    icon: UserPlus,
    description: "Manage agent profiles & roles",
  },
  {
    name: "Property Briefs",
    href: "/admin/brief_management",
    icon: Briefcase,
    description: "Handle property listing details",
  },
  {
    name: "Buyer/Tenant Preferences",
    href: "/admin/buyer_tenant_preferences",
    icon: UserCheck,
    description: "User's property requirements",
  },
  {
    name: "Inspection Management",
    href: "/admin/inspection-manegement",
    icon: Calendar,
    description: "Schedule & monitor inspections",
  },
  {
    name: "System Settings",
    href: "/admin/preference_management",
    icon: Settings,
    description: "Configure application settings",
  },
  {
    name: "Contact & Support",
    href: "/admin/contact_management",
    icon: MessageSquare,
    description: "Manage inquiries & feedback",
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Package,
    description: "Manage assets and items",
  },
  {
    name: "Financial Overview",
    href: "/admin/financials",
    icon: DollarSign,
    description: "Track payments and revenue",
  },
]

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  adminData: { firstName?: string; lastName?: string; email?: string } | null;
  handleLogout: () => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  adminData,
  handleLogout,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 ${
        sidebarCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-100 shadow-xl transform transition-all duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:inset-0 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="relative h-20 flex items-center justify-center px-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-extrabold text-gray-800">
              KR Admin
            </h1>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          title="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Admin Profile Card */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
              <span>{adminData?.firstName?.[0]}{adminData?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate text-base">
                {adminData?.firstName} {adminData?.lastName}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">{adminData?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center ${
                sidebarCollapsed ? "justify-center p-3" : "px-4 py-3"
              } rounded-lg transition-all duration-150 ease-in-out
              ${isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200 transform translate-x-0.5"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:-translate-y-0.5"
              }`}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? item.name : ""}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"} transition-colors`} />
              {!sidebarCollapsed && (
                <div className="ml-3 flex-1">
                  <h4 className={`font-medium text-sm ${isActive ? "text-blue-700" : "text-gray-700 group-hover:text-blue-700"}`}>
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-full bg-blue-500 rounded-r-sm"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-md font-bold text-gray-800">156</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-center shadow-sm">
              <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-md font-bold text-gray-800">89</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            sidebarCollapsed ? "justify-center p-3" : "justify-center px-4 py-3"
          } text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors`}
          title={sidebarCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span className="ml-3 font-semibold text-base">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}