"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Code2,
  Link2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function FlowCard({
  method,
  description,
  index,
  isLast = false,
}: {
  method: "GET" | "POST" | "PATCH";
  description: string;
  index: number;
  isLast?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#09391C]/15 bg-white text-xs font-bold text-[#09391C] shadow-sm">
          {index + 1}
        </div>
        {!isLast ? (
          <div
            className="w-px flex-1 min-h-[14px] bg-gradient-to-b from-[#09391C]/20 to-[#09391C]/08 mt-1"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="flex-1 rounded-2xl border border-[#DDE5EE] bg-gradient-to-br from-white to-[#FAFCFE] p-4 sm:p-5 shadow-sm mb-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EAF7ED] text-[#0F6F32] ring-1 ring-[#0F6F32]/10">
            {method}
          </span>
        </div>
        <p className="text-sm text-[#4A5560] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function SyndicationIntegrationGuidePage() {
  const checklist = [
    "Company name",
    "Contact name, email, and phone",
    "Platform name",
    "Platform key suggestion",
    "Auth type (e.g. api_key)",
    "Base URL",
    "Webhook support (true/false)",
    "Documentation URL",
    "Optional onboarding notes",
  ];

  return (
    <main className="min-h-screen bg-[#F0F4F8]">
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#061512] via-[#0B2A24] to-[#0A1E2E]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 25%, rgba(141, 219, 144, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 60%, rgba(96, 165, 250, 0.09) 0%, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 opacity-[0.05] bg-[length:20px_20px] bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)]" aria-hidden />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/new-homepage"
            className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#8DDB90]/95 mb-3">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Technical overview
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-white tracking-tight leading-tight">
              Syndication integration guide
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#B8C9C4] leading-relaxed">
              How listing platforms onboard with Khabiteq, and how developers and agents connect
              approved platforms from their accounts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <Code2 className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>Public partner onboarding</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <Link2 className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>Account-level connections</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>Admin-reviewed approvals</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm"
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7ED] text-[#09391C]">
              <ClipboardList className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#09391C] tracking-tight">
                Data required for platform registration
              </h2>
              <p className="text-sm text-[#5A6570] mt-1">
                Aligns with the partner application form so your team can prepare once.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checklist.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-[#E8EEF4] bg-[#FAFCFE] px-3.5 py-3 text-sm text-[#3D454D]"
              >
                <CheckCircle2 className="h-4 w-4 text-[#0F6F32] shrink-0" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#09391C] tracking-tight mb-2">
            Partner onboarding flow
          </h2>
          <p className="text-sm text-[#5A6570] mb-6 max-w-2xl">
            External platforms start here. After approval, account holders connect using the
            developer and agent flows below.
          </p>
          <div className="space-y-0">
            <FlowCard
              index={0}
              isLast
              method="POST"
              description="External platform submits an onboarding application for admin review."
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#09391C] tracking-tight mb-2">
            Developer &amp; Agent
          </h2>
          <p className="text-sm text-[#5A6570] mb-6 max-w-2xl">
            Once a platform is approved, these operations apply inside authenticated accounts.
          </p>
          <div className="space-y-0">
            <FlowCard
              index={0}
              method="GET"
              description="Fetch approved platform blueprints available for user connections."
            />
            <FlowCard
              index={1}
              method="POST"
              description="Connect your account to an approved platform using the credentials your integration requires."
            />
            <FlowCard
              index={2}
              method="PATCH"
              description="Enable or disable a specific platform connection to pause or resume syndication for that link."
            />
            <FlowCard
              index={3}
              isLast
              method="GET"
              description="List all platform connections you have created on your account."
            />
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border-2 border-[#09391C]/20 bg-gradient-to-br from-[#09391C] to-[#0B2A24] p-6 sm:p-8 text-center shadow-lg"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white">Ready to submit your platform?</h3>
          <p className="mt-2 text-sm text-[#B8C9C4] max-w-lg mx-auto">
            Use the partner onboarding form when your team is ready—we will follow up after review.
          </p>
          <Link
            href="/partner-api"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8DDB90] px-6 py-3 text-sm font-semibold text-[#09391C] shadow-md transition hover:bg-[#9ee4a1] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09391C]"
          >
            Go to partner application
            <Send className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
