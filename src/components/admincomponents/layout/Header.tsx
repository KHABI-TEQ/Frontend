"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu, Bell, Search, User, ChevronDown, Home, ChevronRight, LogOut, Settings
} from 'lucide-react'

// Define sidebar items (should ideally be imported from a shared constants file)
const sidebarItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Agent Management", href: "/admin/agent_management" },
  { name: "Property Briefs", href: "/admin/brief_management" },
  { name: "Buyer/Tenant Preferences", href: "/admin/buyer_tenant_preferences" },
  { name: "Inspection Management", href: "/admin/inspection-manegement" },
  { name: "System Settings", href: "/admin/preference_management" },
  { name: "Contact & Support", href: "/admin/contact_management" },
  { name: "Inventory", href: "/admin/inventory" },
  { name: "Financial Overview", href: "/admin/financials" },
]

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  pathname: string;
  adminData: { firstName?: string; lastName?: string; email?: string } | null;
  notifications: { message: string; time: string }[];
  handleLogout: () => void;
}

export default function Header({
  setSidebarOpen,
  pathname,
  adminData,
  notifications,
  handleLogout,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            title="Open Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4 text-gray-400" />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span>Admin Panel</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="font-semibold text-blue-600">
              {sidebarItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-56 sm:w-72 md:w-80 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-500"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              title="View Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md border border-white text-white text-xs font-bold">
                  {notifications.length}
                </div>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in-down origin-top-right">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">You have {notifications.length} new notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                    <button className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Profile Menu"
            >
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                <span>{adminData?.firstName?.[0]}{adminData?.lastName?.[0]}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {adminData?.firstName} {adminData?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in-down origin-top-right">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-base">
                      <span>{adminData?.firstName?.[0]}{adminData?.lastName?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-base">
                        {adminData?.firstName} {adminData?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{adminData?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="w-4 h-4 mr-3 text-blue-500" />
                    <span className="font-medium text-sm">Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 mr-3 text-green-500" />
                    <span className="font-medium text-sm">Preferences</span>
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}