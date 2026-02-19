/** @format */

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Home,
  Building,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  CheckCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Shield,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  requiresVerified?: boolean;
}

const AgentNavigationWithUpgrade: React.FC = () => {
  const { user, logout } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Mock agent state - in real implementation, this would come from user context or API
  const agentState = "free"; // "free" | "verified" | "expired"
  const isVerifiedAgent = false;
  const hasExpiredSubscription = false;

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      id: "listings",
      label: "My Listings",
      href: "/my-listings",
      icon: Building,
    },
    {
      id: "inspections",
      label: "Inspections",
      href: "/my-inspection-requests",
      icon: CheckCircle,
      requiresVerified: true,
    },
    {
      id: "broadcast",
      label: "Broadcast to Subscribers",
      href: "/agent-broadcast",
      icon: Mail,
    },
    {
      id: "profile",
      label: "Public Profile",
      href: `/agent-profile/${user?.id || user?._id}`,
      icon: Star,
      requiresVerified: true,
      badge: isVerifiedAgent ? "Live" : "Upgrade",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      href: "/agent-subscriptions",
      icon: CreditCard,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/profile-settings",
      icon: Settings,
    },
  ];

  const getAgentStatusBadge = () => {
    switch (agentState) {
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <User size={14} />
            Free Agent
          </div>
        );
    }
  };

  const handleNavItemClick = (item: NavigationItem) => {
    if (item.requiresVerified && !isVerifiedAgent) {
      setShowUpgradePrompt(true);
      return;
    }
    router.push(item.href);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#8DDB90] rounded-lg flex items-center justify-center">
            <Building size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#09391C] font-display">
            Khabiteq
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.requiresVerified && !isVerifiedAgent;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-[#8DDB90]/10 text-[#8DDB90]"
                    : isDisabled
                      ? "text-gray-400 hover:text-gray-500"
                      : "text-gray-700 hover:text-[#8DDB90] hover:bg-gray-50"
                }`}
                disabled={isDisabled}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.badge === "Live" 
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
                
                {isDisabled && (
                  <Crown size={14} className="text-[#8DDB90]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Agent Status */}
          {getAgentStatusBadge()}


          {/* User Menu */}
          <div className="relative">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8DDB90] rounded-lg flex items-center justify-center">
              <Building size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[#09391C] font-display">
              Khabiteq
            </span>
          </Link>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getAgentStatusBadge()}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#8DDB90] transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isDisabled = item.requiresVerified && !isVerifiedAgent;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavItemClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors text-left ${
                        isActive
                          ? "bg-[#8DDB90]/10 text-[#8DDB90]"
                          : isDisabled
                            ? "text-gray-400"
                            : "text-gray-700 hover:text-[#8DDB90] hover:bg-white"
                      }`}
                      disabled={isDisabled}
                    >
                      <item.icon size={20} />
                      <span className="flex-1">{item.label}</span>
                      
                      {item.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.badge === "Live" 
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {isDisabled && (
                        <Crown size={16} className="text-[#8DDB90]" />
                      )}
                    </button>
                  );
                })}


                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Upgrade Prompt Modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X size={16} />
              </button>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Subscription Expiry Banner */}
      {hasExpiredSubscription && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 bg-orange-500 text-white p-3 z-40"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">
                Your subscription has expired. Renew to restore verified features.
              </span>
            </div>
            <Link
              href="/agent-subscriptions"
              className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Renew Now
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AgentNavigationWithUpgrade;
