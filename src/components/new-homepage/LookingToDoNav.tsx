"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Compass,
  Home,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  LOOKING_TO_DO_HEADING,
  LOOKING_TO_DO_OVERVIEW_HREF,
  LOOKING_TO_DO_PATHS,
  type LookingToDoIcon,
} from "@/data/looking-to-do";

const ICONS: Record<LookingToDoIcon, ElementType> = {
  home: Home,
  building: Building2,
  briefcase: Briefcase,
  compass: Compass,
  scale: Scale,
};

export default function LookingToDoNav() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative navigation-dropdown shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={LOOKING_TO_DO_OVERVIEW_HREF}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`looking-to-do-bounce group inline-flex max-w-[11.5rem] xl:max-w-none items-center gap-2 rounded-full bg-gradient-to-r from-[#09391C] via-[#0B423D] to-[#0F766E] px-3 xl:px-3.5 py-2 text-white shadow-[0_10px_24px_-12px_rgba(9,57,28,0.7)] ring-2 ring-[#8DDB90]/40 transition-shadow duration-300 hover:shadow-[0_14px_28px_-12px_rgba(9,57,28,0.85)] hover:ring-[#8DDB90]/70 ${
          open ? "looking-to-do-bounce-paused" : ""
        }`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8DDB90] text-[#09391C]">
          <Sparkles size={13} />
        </span>
        <span className="text-left text-[10px] xl:text-[11px] font-bold uppercase leading-[1.15] tracking-[0.06em]">
          <span className="block xl:inline">What are you</span>
          <span className="block xl:inline xl:ml-1">looking to do?</span>
        </span>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute right-0 top-[calc(100%+0.45rem)] z-[80] w-[min(calc(100vw-1.5rem),34rem)] max-h-[min(28rem,calc(100vh-6.5rem))] overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-2.5 shadow-2xl shadow-black/15 backdrop-blur-xl"
          >
            <div className="rounded-xl bg-[#F4FBF5] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                {LOOKING_TO_DO_HEADING}
              </p>
              <p className="mt-0.5 text-xs text-[#5A5D63]">
                Jump straight to the path you need.
              </p>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-1.5">
              {LOOKING_TO_DO_PATHS.map((path) => {
                const Icon = ICONS[path.icon];
                return (
                  <li key={path.id}>
                    <Link
                      href={path.href}
                      role="menuitem"
                      className="group/item flex h-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[#8DDB90]/12"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09391C] text-[#8DDB90]">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[#09391C] leading-snug">
                          {path.shortTitle}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-[#5A5D63]">
                          {path.meta}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LookingToDoMobileNav({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="looking-to-do-bounce flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#09391C] to-[#0F766E] px-4 py-3 text-left text-white shadow-md ring-1 ring-[#8DDB90]/40"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8DDB90] text-[#09391C]">
            <Sparkles size={15} />
          </span>
          <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.08em]">
            What are you
            <br />
            looking to do?
          </span>
        </span>
        <ArrowRight
          size={16}
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-white p-2">
              {LOOKING_TO_DO_PATHS.map((path) => {
                const Icon = ICONS[path.icon];
                return (
                  <Link
                    key={path.id}
                    href={path.href}
                    onClick={onNavigate}
                    className="flex items-start gap-2 rounded-xl px-2.5 py-2.5 hover:bg-[#8DDB90]/12"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09391C] text-[#8DDB90]">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-[#09391C]">
                        {path.shortTitle}
                      </span>
                      <span className="block text-xs leading-snug text-[#5A5D63]">{path.meta}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
