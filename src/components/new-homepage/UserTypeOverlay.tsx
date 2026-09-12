"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
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
    id: "seekers",
    icon: Search,
    title: "Property Seekers",
    headline: "Find Property. Navigate Safely.",
    description:
      "Tell Khabiteq what you’re looking for, discover suitable properties, and schedule inspections all in one structured journey.\n\nWhen you’re ready, access transaction registration, legal support and regulatory escalation.",
    cta: "Start Your Journey",
    ctaUrl: "/for-clients",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgColor: "bg-gradient-to-br from-blue-50/90 to-indigo-50/90",
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200/50",
    shadowColor: "shadow-blue-500/20",
  },
  {
    id: "owners-developers",
    icon: Building2,
    title: "Owners & Developers",
    headline: "Bring Your Property Opportunities Into Africa's Digital Real Estate Ecosystem.",
    description:
      "Present your property opportunities within an infrastructure designed to connect them with relevant property seekers and real estate professionals.",
    cta: "Explore as an Owner or Developer",
    ctaUrl: "/for-owners-developers",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-emerald-50/90 to-teal-50/90",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200/50",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    id: "professionals",
    icon: Users,
    title: "Real Estate Professionals",
    headline: "Build and Grow Your Digital Practice",
    description:
      "Access digital tools designed to help you build your professional presence, present your property portfolio and work with structured property demand.",
    cta: "Explore Your Tools",
    ctaUrl: "/for-agents",
    gradient: "from-[#8DDB90] via-emerald-500 to-green-600",
    bgColor: "bg-gradient-to-br from-[#f0fdf4]/90 to-emerald-50/90",
    iconBg: "bg-gradient-to-br from-[#dcfce7] to-emerald-100",
    iconColor: "text-[#16a34a]",
    borderColor: "border-emerald-200/50",
    shadowColor: "shadow-emerald-500/20",
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-type-overlay-title"
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Animated Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0B423D]/85 pointer-events-none"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden
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

          {/* Always-visible dismiss control (previous absolute -top placement was often clipped) */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed z-[10000] flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-[#0B423D]/90 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-[#09391C] hover:border-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B423D] top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:right-[max(1.5rem,env(safe-area-inset-right))]"
            aria-label="Close and continue to homepage"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.25 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} aria-hidden />
          </motion.button>

          {/* Main Content Container — stopPropagation so outer overlay click dismisses */}
          <div
            className="relative z-10 flex-1 overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.25rem))] sm:px-6 sm:pb-10 lg:px-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
            {/* Header Section */}
            <motion.div
              className="mb-6 text-center sm:mb-8"
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
                id="user-type-overlay-title"
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
                Choose your path and discover how Khabiteq can support your real estate journey.
              </motion.p>

              <motion.p
                className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-base"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                Click anywhere on the dimmed background, or the close button in the top-right
                corner, to dismiss this window and browse the homepage.
              </motion.p>
            </motion.div>

            {/* User Type Cards - Horizontal scroll on mobile, grid on desktop */}
            <motion.div
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 lg:items-stretch"
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
                      group relative cursor-pointer flex h-full flex-col flex-shrink-0
                      w-[280px] sm:w-auto
                      snap-center
                      ${userType.bgColor}
                      rounded-2xl sm:rounded-3xl
                      border-2 ${userType.borderColor}
                      backdrop-blur-xl
                      p-6 sm:p-7
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
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line flex-1">
                      {userType.description}
                    </p>

                    {/* CTA Button */}
                    <motion.div
                      className={`
                        mt-auto inline-flex items-center gap-2
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
              className="mt-6 pb-2 text-center text-sm text-white/50 sm:mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Or choose a path below — each card opens tailored information for that role.
            </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
