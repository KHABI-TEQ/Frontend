"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/context/user-context";
import { isPendingKyc, kycPathForUser, kycRoleLabel, resolveKycStatus } from "@/lib/kyc-status";

const STORAGE_PREFIX = "khabiteq-kyc-later-";

const KYC_ROLES = new Set([
  "Agent",
  "Developer",
  "Lawyer",
  "Surveyor",
  "Valuer",
]);

const KYC_BENEFITS = [
  "Create your verified professional profile",
  "Showcase your properties and services",
  "Get matched with relevant property requests",
  "Build trust with clients and other professionals",
] as const;

function storageKey(user: User) {
  return `${STORAGE_PREFIX}${user.id || user._id || user.accountId || "anon"}`;
}

export { kycPathForUser };

function isKycApproved(user: User) {
  return resolveKycStatus(user) === "approved";
}

export function shouldPromptPractitionerKyc(user: User) {
  if (!KYC_ROLES.has(String(user.userType || ""))) return false;
  const status = resolveKycStatus(user);
  if (isKycApproved(user) || isPendingKyc(status)) return false;
  return true;
}

type Props = {
  user: User;
  onOpenChange?: (open: boolean) => void;
};

export function PractitionerKycOverlay({ user, onOpenChange }: Props) {
  const shouldPrompt = shouldPromptPractitionerKyc(user);
  const [open, setOpen] = useState(shouldPrompt);
  const [deferred, setDeferred] = useState(false);
  const role = kycRoleLabel(user.userType);
  const kycHref = kycPathForUser(user.userType);
  const kycStatus = resolveKycStatus(user);
  const copy = useMemo(() => {
    if (kycStatus === "rejected") {
      return {
        eyebrow: "Verification required",
        title: `Your ${role} KYC needs attention`,
        body: "Khabiteq could not verify your documents. Update and resubmit KYC so your account stays in good standing.",
        cta: "Update your KYC",
      };
    }
    return {
      eyebrow: "Professional verification",
      title: "Complete Your Profile. Start Getting Opportunities.",
      body: "Your Khabiteq account is ready.",
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

  if (!shouldPrompt) return null;

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
            className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
          >
            <button
              type="button"
              onClick={defer}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-1.5 text-white hover:bg-white/25"
              aria-label="Cancel for later"
            >
              <X size={16} />
            </button>

            <div className="bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] px-6 sm:px-8 pt-7 pb-6 text-white">
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#8DDB90]">
                <ShieldCheck size={13} />
                {copy.eyebrow}
              </div>
              <h2
                id="practitioner-kyc-title"
                className="text-[22px] font-bold leading-snug sm:text-[26px]"
              >
                {copy.title}
              </h2>
              <p className="mt-2 text-sm text-white/80 sm:text-[15px]">{copy.body}</p>
            </div>

            <div className="px-5 pb-6 pt-5 sm:px-7">
              {kycStatus === "rejected" ? (
                <div className="rounded-2xl border border-[#8DDB90]/30 bg-[#F8FAF8] p-4 text-sm text-[#5A5D63]">
                  You remain a <span className="font-semibold text-[#09391C]">{role}</span>{" "}
                  on Khabiteq. Verification does not change the account you opened.
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E6EEE8] bg-[#F7FAF8] px-5 py-4">
                  <p className="mb-3 text-sm font-semibold text-[#09391C]">
                    Complete your practitioner KYC to:
                  </p>
                  <ul className="space-y-2">
                    {KYC_BENEFITS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#3A3D42]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3DAA4A]" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 text-sm text-[#3A3D42]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3DAA4A]" strokeWidth={3} />
                      <span>
                        Access{" "}
                        <span className="font-semibold text-[#3DAA4A]">Khabiteq</span>
                        &apos;s real estate ecosystem
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={kycHref}
                  onClick={() => onOpenChange?.(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#09391C] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#0B423D]"
                >
                  {copy.cta}
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={defer}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#09391C]"
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
