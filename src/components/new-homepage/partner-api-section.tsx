"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Secondary CTA for external property listing platforms (B2B syndication).
 * Placed after core user journeys on the homepage — not primary for agents, buyers, etc.
 */
export default function PartnerApiSection() {
  return (
    <section
      className="relative w-full overflow-hidden border-t border-white/10"
      aria-labelledby="partner-platforms-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#061512] via-[#0B2A24] to-[#0A1E2E]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(141, 219, 144, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 60%, rgba(96, 165, 250, 0.08) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.06] bg-[length:24px_24px] bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)]"
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_80px_-24px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute left-0 top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-[#8DDB90] via-[#5ec28a] to-transparent opacity-90 hidden sm:block" aria-hidden />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 lg:pl-12">
            <div className="lg:col-span-7 space-y-4">
              <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#8DDB90]/90">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                For listing platforms
              </p>

              <h2
                id="partner-platforms-heading"
                className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-white leading-tight tracking-tight"
              >
                Syndicate listings with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8F5CA] to-[#8DDB90]">
                  Khabiteq
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#B8C9C4] max-w-xl leading-relaxed">
                Built for teams running other property portals and marketplaces. Apply to connect
                your catalogue—separate from the tools we build for agents, developers, landlords,
                and buyers on this site.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#D6E8E3]">
                  <Layers className="h-3.5 w-3.5 text-[#8DDB90]" aria-hidden />
                  B2B onboarding
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#D6E8E3]">
                  Admin-reviewed
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center gap-3 sm:gap-4">
              <Link
                href="/partner-api"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 bg-[#8DDB90] text-[#09391C] font-semibold text-sm sm:text-base shadow-lg shadow-black/20 hover:bg-[#9ee4a1] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Start partner onboarding
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/syndication-integration-guide"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 border border-white/20 text-white/95 font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                <BookOpen className="h-4 w-4 opacity-90" aria-hidden />
                Integration guide
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
