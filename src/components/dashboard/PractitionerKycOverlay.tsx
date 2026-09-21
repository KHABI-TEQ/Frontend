"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/context/user-context";
import { resolveAgentKycStatus } from "@/hooks/useAgentEligibility";

const STORAGE_PREFIX = "khabiteq-kyc-later-";

const KYC_ROLES = new Set([
  "Agent",
  "Developer",
  "Lawyer",
  "Surveyor",
  "Valuer",
]);

function storageKey(user: User) {
  return `${STORAGE_PREFIX}${user.id || user._id || user.accountId || "anon"}`;
}

function roleLabel(userType?: string) {
  switch (userType) {
    case "Agent":
      return "Agent";
    case "Developer":
      return "Developer";
    case "Lawyer":
      return "Lawyer";
    case "Surveyor":
      return "Surveyor";
    case "Valuer":
      return "Valuer";
    default:
      return "professional";
  }
}

export function kycPathForUser(userType?: string) {
  switch (userType) {
    case "Developer":
      return "/developer-kyc";
    case "Lawyer":
      return "/lawyer-kyc";
    case "Surveyor":
      return "/surveyor-kyc";
    case "Valuer":
      return "/valuer-kyc";
    default:
      return "/agent-kyc";
  }
}

function isKycApproved(user: User) {
  return resolveAgentKycStatus(user) === "approved";
}

export function shouldPromptPractitionerKyc(user: User) {
  return KYC_ROLES.has(String(user.userType || "")) && !isKycApproved(user);
}

type Props = {
  user: User;
  onOpenChange?: (open: boolean) => void;
};

export function PractitionerKycOverlay({ user, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState(false);
  const role = roleLabel(user.userType);
  const kycHref = kycPathForUser(user.userType);
  const kycStatus = resolveAgentKycStatus(user);
  const copy = useMemo(() => {
    if (kycStatus === "rejected") {
      return {
        eyebrow: "Verification required",
        title: `Your ${role} KYC needs attention`,
        body: "Khabiteq could not verify your documents. Update and resubmit KYC so your account stays in good standing.",
        cta: "Update your KYC",
      };
    }
    if (kycStatus === "pending" || kycStatus === "in_review") {
      return {
        eyebrow: "Verification in progress",
        title: `Your ${role} KYC is under review`,
        body: "You can continue on Khabiteq while we review. Subscribe to unlock dashboard actions. Check your KYC status any time.",
        cta: "View KYC status",
      };
    }
    return {
      eyebrow: "Professional verification",
      title: `Complete your ${role} KYC`,
      body: `You opened this account as a ${role}. Complete KYC so Khabiteq can verify your professional identity. You can also do this later — dashboard actions stay locked until you subscribe.`,
      cta: "Proceed with KYC",
    };
  }, [kycStatus, role]);

  useEffect(() => {
    if (!shouldPromptPractitionerKyc(user)) {
      setOpen(false);
      setDeferred(false);
      onOpenChange?.(false);
      return;
    }
    try {
      const later = localStorage.getItem(storageKey(user)) === "1";
      setDeferred(later);
      setOpen(!later);
      onOpenChange?.(!later);
    } catch {
      setDeferred(false);
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

  if (!shouldPromptPractitionerKyc(user)) return null;

  const defer = () => {
    try {
      localStorage.setItem(storageKey(user), "1");
    } catch {
      /* ignore */
    }
    setDeferred(true);
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[#0B423D]/80 backdrop-blur-[3px]"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="practitioner-kyc-title"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
          >
            <button
              type="button"
              onClick={defer}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#09391C] shadow"
              aria-label="Cancel for later"
            >
              <X size={18} />
            </button>

            <div className="bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-8 pt-8 pb-6 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-[#8DDB90]">
                <ShieldCheck size={14} />
                {copy.eyebrow}
              </div>
              <h2
                id="practitioner-kyc-title"
                className="text-2xl font-bold leading-tight sm:text-3xl"
              >
                {copy.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm text-white/80 sm:text-base">
                {copy.body}
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-2xl border border-[#8DDB90]/30 bg-[#F8FAF8] p-4 text-sm text-[#5A5D63]">
                You remain a <span className="font-semibold text-[#09391C]">{role}</span>{" "}
                on Khabiteq. Verification does not change the account you opened.
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={kycHref}
                  onClick={() => onOpenChange?.(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#09391C] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#0B423D]"
                >
                  {copy.cta}
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={defer}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-[#09391C]"
                >
                  Cancel for later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {deferred && !open ? (
        <Link
          href={kycHref}
          className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full bg-[#09391C] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(9,57,28,0.8)] ring-2 ring-[#8DDB90]/50 hover:bg-[#0B423D]"
        >
          <ShieldCheck size={16} className="text-[#8DDB90]" />
          Complete your KYC
        </Link>
      ) : null}
    </>
  );
}
