"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  Building2,
  Users,
  Search,
  ArrowRight,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UserType {
  id: string;
  icon: React.ElementType;
  title: string;
  headline: string;
  description: string;
  cta: string;
  ctaUrl: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
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
    image: "/property-preference-matching.jpg",
    imageAlt: "Couple reviewing matched property options together",
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
    image: "/property-listings.jpg",
    imageAlt: "Owner reviewing a property listing with a professional",
    imagePosition: "object-[center_28%]",
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
      "Create a professional presence where property seekers can discover your profile, understand your services, view your credentials and engage you when your expertise is needed.\n\nIncrease your visibility, access relevant client and service opportunities, and build a more accessible practice through Khabiteq.",
    cta: "Read more..",
    ctaUrl: "/for-professionals",
    image: "/client-opportunities.jpg",
    imageAlt: "Real estate professional meeting clients",
    imagePosition: "object-[center_28%]",
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleCardClick = (userType: UserType) => {
    setSelectedId(userType.id);
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
          className="fixed inset-0 z-[9999] flex h-dvh max-h-dvh flex-col overflow-hidden"
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

          <div
            className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-[max(3.1rem,calc(env(safe-area-inset-top)+2.1rem))] sm:px-6 lg:px-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
            <motion.div
              className="mb-2 shrink-0 text-center sm:mb-3 lg:mb-4"
              variants={headerVariants}
            >
              <motion.div
                className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#8DDB90]/30 bg-gradient-to-r from-[#8DDB90]/20 to-emerald-500/20 px-3 py-1 backdrop-blur-sm sm:mb-3 sm:px-4 sm:py-1.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#8DDB90] sm:h-4 sm:w-4" />
                <span className="text-xs font-medium text-white/90 sm:text-sm">
                  Choose your path
                </span>
              </motion.div>

              <motion.h2
                id="user-type-overlay-title"
                className="text-xl font-bold tracking-tight text-white sm:mb-2 sm:text-3xl lg:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Welcome to{" "}
                <span className="bg-gradient-to-r from-[#8DDB90] to-emerald-400 bg-clip-text text-transparent">
                  Khabiteq
                </span>
              </motion.h2>

              <motion.p
                className="mx-auto hidden max-w-2xl text-white/70 sm:block sm:text-base lg:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Choose your path and discover how Khabiteq can support your real estate journey.
              </motion.p>
            </motion.div>

            <motion.div
              className="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="min-h-0 flex-1 overflow-hidden" ref={emblaRef}>
                <div className="flex h-full">
                  {userTypes.map((userType) => {
                    const Icon = userType.icon;
                    const isHovered = hoveredId === userType.id;
                    const isSelected = selectedId === userType.id;

                    return (
                      <div key={userType.id} className="flex h-full min-w-0 flex-[0_0_100%] px-0.5 sm:px-2">
                        <motion.div
                          variants={cardVariants}
                          onMouseEnter={() => setHoveredId(userType.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleCardClick(userType)}
                          className={`
                            group relative flex h-full min-h-0 w-full cursor-pointer overflow-hidden
                            ${userType.bgColor}
                            rounded-2xl sm:rounded-3xl
                            border-2 ${userType.borderColor}
                            backdrop-blur-xl
                            transition-all duration-500
                            hover:shadow-2xl ${userType.shadowColor}
                            ${isSelected ? "scale-[0.98] opacity-80" : ""}
                          `}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="grid h-full min-h-0 w-full grid-rows-[minmax(10.5rem,44%)_minmax(0,1fr)] sm:grid-rows-[minmax(12rem,40%)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-rows-none">
                            <div className="relative min-h-0 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={userType.image}
                                alt={userType.imageAlt}
                                className={`absolute inset-0 h-full w-full object-cover ${userType.imagePosition ?? "object-[center_65%]"}`}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/5 lg:to-black/20" />
                              <div
                                className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${userType.gradient} px-2.5 py-1 text-[11px] font-bold text-white shadow-lg sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs`}
                              >
                                {userType.title}
                              </div>
                            </div>

                            <div className="relative flex min-h-0 flex-col overflow-hidden px-3.5 py-3 sm:p-6 lg:p-7">
                              <motion.div
                                className={`
                                  relative mb-2 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:mb-3 sm:flex sm:h-12 sm:w-12
                                  ${userType.iconBg} shadow-lg ${userType.shadowColor}
                                `}
                                animate={isHovered ? floatingAnimation : {}}
                              >
                                <Icon className={`relative z-10 h-6 w-6 ${userType.iconColor}`} />
                              </motion.div>

                              <h3 className="mb-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-[#09391C] sm:mb-2 sm:text-xl lg:text-2xl">
                                {userType.headline}
                              </h3>
                              <p className="mb-3 min-h-0 flex-1 overflow-hidden text-xs leading-relaxed text-gray-600 line-clamp-2 sm:mb-4 sm:text-sm sm:line-clamp-4 lg:text-base lg:line-clamp-6">
                                {userType.description.replace(/\n\n/g, " ")}
                              </p>
                              <motion.div
                                className={`
                                  mt-auto inline-flex shrink-0 items-center gap-2 self-start rounded-xl
                                  bg-gradient-to-r ${userType.gradient}
                                  px-4 py-2 text-xs font-semibold text-white
                                  shadow-lg ${userType.shadowColor}
                                  transition-all duration-300 group-hover:gap-4
                                  sm:px-5 sm:py-2.5 sm:text-sm
                                `}
                              >
                                <span>{userType.cta}</span>
                                <ArrowRight className="h-4 w-4" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 flex shrink-0 items-center justify-center gap-3 sm:mt-4 sm:gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollPrev();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
                  aria-label="Previous path"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {userTypes.map((userType, index) => (
                    <button
                      key={userType.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollTo(index);
                      }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        selectedIndex === index
                          ? "w-8 bg-[#8DDB90]"
                          : "w-2.5 bg-white/35 hover:bg-white/60"
                      }`}
                      aria-label={`Show ${userType.title}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollNext();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
                  aria-label="Next path"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
