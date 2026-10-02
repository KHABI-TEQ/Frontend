"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Home,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/context/user-context";
import {
  clearSubscriptionJustActivated,
  hasSubscriptionJustActivated,
  isLivePaidSubscription,
} from "@/utils/subscription-status";
import { isApprovedKyc, isPendingKyc, resolveKycStatus } from "@/lib/kyc-status";

const SUBSCRIPTION_ROLES = new Set([
  "Agent",
  "Developer",
  "Lawyer",
  "Surveyor",
  "Valuer",
]);

export function shouldForcePaidPlanOverlay(user: User | null | undefined, pathname?: string | null) {
  if (!user || !SUBSCRIPTION_ROLES.has(String(user.userType || ""))) return false;
  if (isLivePaidSubscription(user.activeSubscription) || hasSubscriptionJustActivated()) return false;
  const path = pathname || "";
  if (path.startsWith("/agent-subscriptions")) return false;
  if (path.startsWith("/auth")) return false;
  if (/-kyc(\/|$)/.test(path) || path.endsWith("-kyc")) return false;
  const status = resolveKycStatus(user);
  return isPendingKyc(status) || isApprovedKyc(status);
}

const BENEFITS = [
  {
    icon: Search,
    title: "Access qualified property requests",
    body: "Connect with buyers who have insured their preferences and shown commitment.",
  },
  {
    icon: MessageCircle,
    title: "Respond to relevant property opportunities",
    body: "Engage directly with serious property seekers.",
  },
  {
    icon: RefreshCw,
    title: "See buyer preferences that match your listings",
    body: "Save time and focus on the right opportunities.",
  },
  {
    icon: FileText,
    title: "Build your public Practitioner Page",
    body: "Show your credentials, listings and services.",
  },
  {
    icon: Home,
    title: "Showcase your properties and services",
    body: "Reach more clients locally and in the diaspora.",
  },
  {
    icon: Users,
    title: "Be part of a trusted real estate ecosystem",
    body: "Work with buyers, developers, landlords and other professionals.",
  },
] as const;

type Props = {
  user: User;
  onOpenChange?: (open: boolean) => void;
};

export function KycSubmittedCongratsOverlay({ user, onOpenChange }: Props) {
  const pathname = usePathname();
  const open = shouldForcePaidPlanOverlay(user, pathname);
  const [showArt, setShowArt] = useState(true);
  const firstName = user.firstName || "there";

  useEffect(() => {
    if (isLivePaidSubscription(user.activeSubscription)) {
      clearSubscriptionJustActivated();
    }
  }, [user.activeSubscription]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-[#0B423D]/80 backdrop-blur-[3px]"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kyc-congrats-title"
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] bg-[#0B3A28] text-white shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
      >
        <div className="relative px-5 pb-5 pt-5 sm:px-6">
          <p className="text-sm font-medium text-white/80">Khabiteq</p>
          <div className="mt-4 max-w-[62%] pr-2">
            <h2 id="kyc-congrats-title" className="text-[22px] font-bold leading-snug sm:text-[26px]">
              🎉 Congratulations, {firstName}.
            </h2>
            <p className="mt-1 text-base font-semibold text-white sm:text-lg">
              Your practitioner profile is ready!
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
              You&apos;ve completed your KYC and your professional account is
              verified. Now, unlock the full opportunities on Khabiteq with a
              subscription.
            </p>
          </div>

          {showArt ? (
            <div
              className="pointer-events-none absolute right-0 top-0 h-44 w-44 overflow-hidden sm:h-52 sm:w-56"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/overlays/kyc-submitted-overlay.png"
                alt=""
                className="h-full w-full object-cover object-[78%_8%]"
                onError={() => setShowArt(false)}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0B3A28]/10 to-[#0B3A28]" />
            </div>
          ) : null}

          <div className="relative mt-5 overflow-hidden rounded-2xl bg-white p-4 text-[#09391C] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 rounded-full bg-[#E8F7EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0B572B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3DAA4A]" />
                  Verified buyer demand
                </p>
                <p className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">
                  ₦20,000 INSURED
                  <br />
                  PROPERTY PREFERENCE
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-[#5A5D63] sm:text-xs">
                  Property seekers on <span className="font-semibold text-[#09391C]">Khabiteq</span> can
                  insure their property preference for{" "}
                  <span className="font-semibold">₦20,000</span> through{" "}
                  <span className="font-semibold">Heirs Insurance Group</span>, with up to{" "}
                  <span className="font-semibold">₦2,000,000</span> in cover. This shows
                  commitment and helps you connect with serious and qualified buyers.
                </p>
              </div>
              {showArt ? (
                <div className="hidden w-[42%] shrink-0 sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/overlays/kyc-submitted-overlay.png"
                    alt="Heirs Insurance Group — up to ₦2,000,000 cover"
                    className="h-28 w-full rounded-xl object-cover object-[85%_48%]"
                    onError={() => setShowArt(false)}
                  />
                </div>
              ) : (
                <div className="hidden w-36 shrink-0 flex-col items-center justify-center sm:flex">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1F8A4C] text-white">
                    ✓
                  </div>
                  <div className="mt-2 rounded-xl border border-slate-100 bg-[#F8FAF8] px-3 py-2 text-center shadow-sm">
                    <p className="text-[10px] text-[#5A5D63]">Up to</p>
                    <p className="text-sm font-extrabold leading-tight">₦2,000,000</p>
                    <p className="text-[10px] font-semibold tracking-wide text-[#5A5D63]">COVER</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold">With a Khabiteq subscription, you can:</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="flex gap-2.5 rounded-2xl bg-white/5 px-3 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F8A4C]">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/70">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/agent-subscriptions?tab=plans"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#F5C400] py-3.5 text-sm font-bold text-[#09391C] hover:bg-[#FFD24D]"
          >
            Choose a Paid Plan
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
