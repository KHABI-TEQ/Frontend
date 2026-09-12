"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/context/user-context";

const STORAGE_PREFIX = "khabiteq-practitioner-welcome-";

function storageKey(user: User) {
  return `${STORAGE_PREFIX}${user.id || user._id || user.accountId || "anon"}`;
}

function hasActiveSubscription(user: User) {
  const status = String(user.activeSubscription?.status || "").toLowerCase();
  return status === "active";
}

function roleLabel(user: User) {
  switch (user.userType) {
    case "Developer":
      return "Developer";
    case "Lawyer":
      return "Lawyer";
    case "Surveyor":
      return "Surveyor";
    default:
      return "Real estate professional";
  }
}

function suggestedSlug(user: User) {
  const fromDealSite = String(
    (user.dealSite as { publicSlug?: string } | null | undefined)?.publicSlug || "",
  ).trim();
  if (fromDealSite) return fromDealSite;
  const name = `${user.firstName || ""} ${user.lastName || ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return name || "your-practice";
}

type Props = {
  user: User;
  onOpenChange?: (open: boolean) => void;
};

export function PractitionerWelcomeOverlay({ user, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const slug = useMemo(() => suggestedSlug(user), [user]);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Your practice";
  const previewUrl = `https://${slug}.khabiteqrealty.com`;

  useEffect(() => {
    if (hasActiveSubscription(user)) {
      setOpen(false);
      onOpenChange?.(false);
      return;
    }
    try {
      const seen = localStorage.getItem(storageKey(user));
      const shouldOpen = !seen;
      setOpen(shouldOpen);
      onOpenChange?.(shouldOpen);
    } catch {
      setOpen(true);
      onOpenChange?.(true);
    }
  }, [user, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey(user), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-[#0B423D]/80 backdrop-blur-[3px]"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="practitioner-welcome-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#09391C] shadow"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-8 pt-8 pb-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-[#8DDB90] mb-4">
            <Sparkles size={14} />
            Welcome to your practice
          </div>
          <h2
            id="practitioner-welcome-title"
            className="text-2xl sm:text-3xl font-bold leading-tight"
          >
            Congratulations, {user.firstName || "welcome"}.
          </h2>
          <p className="mt-3 text-white/80 text-sm sm:text-base max-w-xl">
            Your professional account is ready. Below is a preview of your Practitioner
            Page. It is not live for public access yet — activate it with a subscription.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5A5D63] mb-3">
            Preview — not yet public
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#F8FAF8]">
            <div className="absolute right-3 top-3 z-10 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              Inactive
            </div>
            <div className="bg-gradient-to-br from-[#09391C] to-[#0B423D] px-5 py-6 text-white">
              <div className="flex items-center gap-3">
                {user.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_picture}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover border-2 border-[#8DDB90]"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-[#8DDB90] text-[#09391C] font-bold flex items-center justify-center text-xl">
                    {fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg leading-tight">{fullName}</p>
                  <p className="text-sm text-white/70">{roleLabel(user)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/75">
                Discover my services, credentials and property opportunities.
              </p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white text-center">
              {["Listings", "Services", "Contact"].map((label) => (
                <div key={label} className="py-3 text-xs font-medium text-[#5A5D63]">
                  {label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-5 py-3 text-xs text-[#5A5D63] bg-white border-t border-gray-100">
              <Globe size={14} />
              <span className="truncate">{previewUrl}</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#5A5D63]">
            Subscribe to make this Practitioner Page active and available for public access.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/agent-subscriptions"
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#09391C] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#0B423D]"
            >
              Subscribe to go live
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-[#09391C]"
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
