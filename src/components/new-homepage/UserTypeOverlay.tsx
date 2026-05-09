"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Users,
  Search,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";

interface UserType {
  id: string;
  icon: React.ElementType;
  title: string;
  headline: string;
  description: string;
  cta: string;
  ctaUrl: string;
  gradient: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  shadowColor: string;
}

const userTypes: UserType[] = [
  {
    id: "landlords",
    icon: Home,
    title: "Landlords",
    headline: "List your property",
    description: "Post for sale, rent, shortlet, or joint venture with AI-assisted listing",
    cta: "List Property",
    ctaUrl: "/for-landlords",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-amber-50/90 to-orange-50/90",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200/50",
    shadowColor: "shadow-amber-500/20",
  },
  {
    id: "developers",
    icon: Building2,
    title: "Developers",
    headline: "Showcase projects",
    description: "List projects and find the right partners for joint ventures",
    cta: "Publish Project",
    ctaUrl: "/for-developers",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-emerald-50/90 to-teal-50/90",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200/50",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    id: "agents",
    icon: Users,
    title: "Agents",
    headline: "Grow your business",
    description: "Get your own Practitioner page with AI-powered matching",
    cta: "Activate Page",
    ctaUrl: "/for-agents",
    gradient: "from-[#8DDB90] via-emerald-500 to-green-600",
    bgColor: "bg-gradient-to-br from-[#f0fdf4]/90 to-emerald-50/90",
    iconBg: "bg-gradient-to-br from-[#dcfce7] to-emerald-100",
    iconColor: "text-[#16a34a]",
    borderColor: "border-emerald-200/50",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    id: "buyers",
    icon: Search,
    title: "Buyers & Clients",
    headline: "Find your dream",
    description: "Describe what you need and let AI find your perfect match",
    cta: "Get Started",
    ctaUrl: "/for-clients",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgColor: "bg-gradient-to-br from-blue-50/90 to-indigo-50/90",
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200/50",
    shadowColor: "shadow-blue-500/20",
  },
];

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

interface UserTypeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserTypeOverlay({ isOpen, onClose }: UserTypeOverlayProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Handle card click with animation
  const handleCardClick = (userType: UserType) => {
    setSelectedId(userType.id);
    // Small delay for animation before navigation
    setTimeout(() => {
      router.push(userType.ctaUrl);
    }, 400);
  };

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain py-4 sm:py-8"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0B423D]/85"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated gradient orbs */}
            <motion.div
              className="absolute top-20 left-20 w-72 h-72 bg-[#8DDB90]/20 rounded-full blur-[100px]"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]"
              animate={{
                x: [0, -40, 0],
                y: [0, -50, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#8DDB90]/10 to-emerald-500/10 rounded-full blur-[150px]"
              animate={pulseAnimation}
            />
          </div>

          {/* Main Content Container */}
          <motion.div
            className="relative z-10 w-full max-w-6xl mx-4 sm:mx-6 lg:mx-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute -top-16 right-0 sm:-top-20 sm:right-0 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 group"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.8 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Header Section */}
            <motion.div
              className="text-center mb-8 sm:mb-12"
              variants={headerVariants}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8DDB90]/20 to-emerald-500/20 border border-[#8DDB90]/30 backdrop-blur-sm mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles className="w-4 h-4 text-[#8DDB90]" />
                <span className="text-sm font-medium text-white/90">
                  Choose your path
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Welcome to{" "}
                <span className="bg-gradient-to-r from-[#8DDB90] to-emerald-400 bg-clip-text text-transparent">
                  Khabiteq
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Select your role to get started with AI-powered real estate
              </motion.p>
            </motion.div>

            {/* User Type Cards - Horizontal scroll on mobile, grid on desktop */}
            <motion.div
              className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 scrollbar-hide"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {userTypes.map((userType, index) => {
                const Icon = userType.icon;
                const isHovered = hoveredId === userType.id;
                const isSelected = selectedId === userType.id;

                return (
                  <motion.div
                    key={userType.id}
                    variants={cardVariants}
                    onMouseEnter={() => setHoveredId(userType.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleCardClick(userType)}
                    className={`
                      group relative cursor-pointer flex-shrink-0
                      w-[280px] sm:w-auto
                      snap-center
                      ${userType.bgColor}
                      rounded-2xl sm:rounded-3xl
                      border-2 ${userType.borderColor}
                      backdrop-blur-xl
                      p-6 sm:p-8
                      transition-all duration-500
                      hover:shadow-2xl ${userType.shadowColor}
                      ${isSelected ? "scale-95 opacity-80" : ""}
                    `}
                    whileHover={{
                      y: -12,
                      scale: 1.02,
                      transition: { duration: 0.3 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />

                    {/* Icon Container */}
                    <motion.div
                      className={`
                        relative w-16 h-16 sm:w-20 sm:h-20
                        ${userType.iconBg}
                        rounded-2xl
                        flex items-center justify-center
                        mb-5
                        shadow-lg ${userType.shadowColor}
                      `}
                      animate={isHovered ? floatingAnimation : {}}
                    >
                      {/* Gradient border effect */}
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${userType.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                      />
                      <Icon
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${userType.iconColor} relative z-10`}
                      />
                    </motion.div>

                    {/* Title Badge */}
                    <div
                      className={`
                        inline-flex items-center gap-1.5
                        px-3 py-1.5 rounded-full
                        bg-gradient-to-r ${userType.gradient}
                        text-white text-xs font-bold
                        mb-4 shadow-lg ${userType.shadowColor}
                      `}
                    >
                      {userType.title}
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#09391C] transition-colors duration-300">
                      {userType.headline}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                      {userType.description}
                    </p>

                    {/* CTA Button */}
                    <motion.div
                      className={`
                        inline-flex items-center gap-2
                        px-5 py-2.5 rounded-xl
                        bg-gradient-to-r ${userType.gradient}
                        text-white font-semibold text-sm
                        shadow-lg ${userType.shadowColor}
                        group-hover:gap-4
                        transition-all duration-300
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{userType.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>

                    {/* Decorative Elements */}
                    <div
                      className={`
                        absolute -bottom-8 -right-8
                        w-32 h-32
                        bg-gradient-to-br ${userType.gradient}
                        rounded-full opacity-10 blur-2xl
                        group-hover:opacity-20 group-hover:scale-125
                        transition-all duration-700
                      `}
                    />

                    {/* Corner Accent */}
                    <div
                      className={`
                        absolute top-0 right-0
                        w-24 h-24
                        bg-gradient-to-bl ${userType.gradient}
                        opacity-0 group-hover:opacity-10
                        rounded-tr-2xl sm:rounded-tr-3xl
                        transition-opacity duration-500
                      `}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom Text */}
            <motion.p
              className="text-center text-white/50 text-sm mt-8 sm:mt-12 pb-6 sm:pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Click any card above to explore your personalized experience
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
