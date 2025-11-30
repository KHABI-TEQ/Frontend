/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useClickOutside from "@/hooks/clickOutside";
import Image from "next/image";
import { User, useUserContext } from "@/context/user-context";
import {
  LayoutDashboardIcon,
  Settings,
  LogOut,
  Home,
  Briefcase,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePageContext } from "@/context/page-context";
import { AgentNavData } from "@/enums";

interface UserProfileModalProps {
  closeUserProfileModal: (type: boolean) => void;
  userDetails: User | null;
} 
 
const UserProfile: React.FC<UserProfileModalProps> = ({
  closeUserProfileModal,
  userDetails,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { logout } = useUserContext();
  const { setSelectedNav } = usePageContext();
  const [userType, setUserType] = useState<"Agent" | "Landowners"| "FieldAgent">("Agent");
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const router = useRouter();

  useClickOutside(ref, () => closeUserProfileModal(false));

  useEffect(() => {
    setUserType(userDetails?.userType as "Agent" | "Landowners" | "FieldAgent");
  }, [userDetails]);

  // Calculate position based on screen size
  useEffect(() => {
    const updatePosition = () => {
      if (typeof window !== "undefined") {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
          // Mobile: Center on screen
          setPosition({ top: 0, right: 0 });
        } else {
          // Desktop: Position relative to button
          setPosition({ top: 0, right: 0 });
        }
      }
    };

    updatePosition();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, []);

  const menuItems = [
    // Dashboard for all users
    {
      icon: <LayoutDashboardIcon size={18} />,
      label: "Dashboard",
      action: () => {
        router.push("/dashboard");
        closeUserProfileModal(false);
      },
    },

    // Agent-specific items
    ...(userType === "Agent"
      ? [
          {
            icon: <Briefcase size={18} />,
            label: "Marketplace",
            action: () => {
              router.push("/agent-marketplace");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Home size={18} />,
            label: "List Property",
            action: () => {
              router.push("/post-property");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Users size={18} />,
            label: "Referral",
            action: () => {
              router.push("/referral");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Settings size={18} />,
            label: "Account Settings",
            action: () => {
              setSelectedNav(AgentNavData.SETTINGS);
              router.push("/profile-settings");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Briefcase size={18} />,
            label: "Subscription",
            action: () => {
              router.push("/agent-subscriptions");
              closeUserProfileModal(false);
            },
          },
        ]
      : []),

    // Landowner-specific items
    ...(userType === "Landowners"
      ? [
          {
            icon: <Home size={18} />,
            label: "List Property",
            action: () => {
              router.push("/post-property");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Settings size={18} />,
            label: "Account Settings",
            action: () => {
              router.push("/profile-settings");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Users size={18} />,
            label: "Referral",
            action: () => {
              router.push("/referral");
              closeUserProfileModal(false);
            },
          },
        ]
      : []),

    // FieldAgent-specific items
    ...(userType === "FieldAgent"
      ? [
          {
            icon: <Briefcase size={18} />,
            label: "Assigned Inspection",
            action: () => {
              router.push("/field-agent-inspections");
              closeUserProfileModal(false);
            },
          },
          {
            icon: <Settings size={18} />,
            label: "Account Settings",
            action: () => {
              router.push("/profile-settings");
              closeUserProfileModal(false);
            },
          },
        ]
      : []),
  ];


  return (
    <motion.div
      ref={ref}
      initial={{ y: 10, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed top-20 right-4 md:absolute md:top-full md:right-0 z-50 md:mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden md:transform md:-translate-x-3/4"
    >
      {/* Header with user info */}
      <div className="bg-gradient-to-r from-[#8DDB90] to-[#09391C] p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {userDetails?.profile_picture ? (
              <Image
                src={userDetails?.profile_picture}
                width={40}
                height={40}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">
                {userDetails?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">
              {userDetails?.firstName} {userDetails?.lastName}
            </h3>
            <p className="text-white/80 text-sm truncate">
              {userDetails?.email}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 space-y-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block">Type</span>
            <span className="font-semibold text-gray-800">
              {userType === "Agent"
                ? userDetails?.agentData?.agentType || "Agent"
                : userType === "Landowners"
                ? "Landowner"
                : userType === "FieldAgent"
                ? "Field Agent"
                : ""}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">ID</span>
            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
              {userDetails?.accountId}
            </span>
          </div>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">Phone</span>
          <span className="font-semibold text-gray-800 text-sm">
            {userDetails?.phoneNumber}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-left group"
          >
            <div className="text-gray-600 group-hover:text-[#8DDB90] transition-colors">
              {item.icon}
            </div>
            <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          type="button"
          onClick={() => {
            logout(() => closeUserProfileModal(false));
          }}
          className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-medium transition-all duration-200 hover:shadow-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserProfile;