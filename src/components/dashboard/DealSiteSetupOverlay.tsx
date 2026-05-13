"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/context/user-context";

/** Legacy key from when dismissal persisted in sessionStorage (cleared once so refresh shows overlay again). */
const LEGACY_SESSION_DISMISSED_KEY = "dashboardDealSiteOverlayDismissed";

function isLandownerUser(user: User | null): boolean {
  const t = (user?.userType ?? "").toLowerCase();
  return t === "landowners" || t === "landowner";
}

type Props = {
  user: User;
};

const backdropTransition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

const cardTransition = { type: "spring" as const, damping: 26, stiffness: 320, mass: 0.85 };

/**
 * Full-screen prompt when profile has no Practitioner Page yet (`dealSite` nullish).
 * Not shown for landowners. Dismissal is in-memory only: a full page refresh shows the overlay
 * again until `dealSite` is configured.
 */
export function DealSiteSetupOverlay({ user }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem(LEGACY_SESSION_DISMISSED_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const needsPractitionerPage = user.dealSite == null;
  const shouldShow =
    !dismissed && !isLandownerUser(user) && needsPractitionerPage;

  useEffect(() => {
    if (!shouldShow) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  const dismiss = () => setDismissed(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#09391C]/75 via-emerald-900/55 to-teal-900/60 backdrop-blur-[3px]"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={backdropTransition}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <motion.div
          className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#8DDB90]/25 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-400/15 blur-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="practitioner-page-overlay-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-[#8DDB90]/50 bg-gradient-to-br from-white via-[#f6fff7] to-[#e8fce9] shadow-[0_28px_90px_rgba(9,57,28,0.28)]"
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={cardTransition}
        whileHover={{
          boxShadow: "0 32px 100px rgba(9, 57, 28, 0.32), 0 0 0 1px rgba(141, 219, 144, 0.35)",
          transition: { duration: 0.25 },
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(141,219,144,0.12)_0%,transparent_45%,rgba(45,212,191,0.08)_100%)]" />

        <motion.button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 rounded-xl bg-white/80 p-2 text-[#09391C] shadow-sm ring-1 ring-[#8DDB90]/30 backdrop-blur-sm"
          aria-label="Close"
          whileHover={{ scale: 1.08, rotate: 90, backgroundColor: "rgba(255,255,255,1)" }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <X size={20} strokeWidth={2} />
        </motion.button>

        <div className="relative p-6 sm:p-8 pt-12 sm:pt-10">
          <motion.div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8DDB90] to-emerald-500 text-white shadow-lg shadow-emerald-600/25"
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ ...cardTransition, delay: 0.08 }}
            whileHover={{
              scale: 1.08,
              rotate: [0, -4, 4, 0],
              boxShadow: "0 12px 28px rgba(16, 185, 129, 0.35)",
            }}
          >
            <Sparkles size={28} strokeWidth={1.75} />
          </motion.div>

          <motion.h2
            id="practitioner-page-overlay-title"
            className="bg-gradient-to-r from-[#09391C] via-emerald-800 to-[#09391C] bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Set up your Practitioner Page
          </motion.h2>
          <motion.p
            className="mt-3 text-sm leading-relaxed text-[#3d5244] sm:text-[15px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Your Practitioner Page is how clients discover you, browse your listings, and get in
            touch. Completing setup unlocks your branded presence and keeps your dashboard and
            marketplace experience aligned with your profile.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="sm:flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/public-access-page"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#09391C] via-emerald-800 to-[#0a4d2a] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/25 ring-2 ring-white/20 transition-shadow hover:shadow-lg hover:shadow-emerald-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2"
              >
                Set up now
                <motion.span
                  aria-hidden
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={dismiss}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/30 ring-2 ring-white/25 hover:shadow-lg hover:shadow-fuchsia-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 sm:flex-1 sm:max-w-[11.5rem]"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              Set up later
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
