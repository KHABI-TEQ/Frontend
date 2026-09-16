"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function LandingSection({
  id,
  children,
  className = "",
  tone = "light",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "light" | "mist" | "dark" | "green";
}) {
  const tones = {
    light: "bg-[#FFFEFB]",
    mist: "bg-[#F5F7F9]",
    dark: "bg-gradient-to-br from-[#0B423D] via-[#09391C] to-[#0A3E72] text-white",
    green: "bg-gradient-to-br from-[#8DDB90] via-[#7BC87F] to-[#6BB26F]",
  };

  return (
    <section id={id} className={`w-full py-12 sm:py-16 lg:py-20 ${tones[tone]} ${className}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">{children}</div>
    </section>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <h2
      className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] ${
        light ? "text-white" : "text-[#09391C]"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export function SectionText({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
        light ? "text-white/90" : "text-[#5A5D63]"
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function PrimaryCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 px-6 sm:px-8 rounded-full bg-[#8DDB90] text-[#09391C] font-semibold text-sm sm:text-base hover:bg-[#7BC87F] hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all ${className}`}
    >
      {children}
    </Link>
  );
}

export function DarkCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 px-6 sm:px-8 rounded-full bg-[#09391C] text-white font-semibold text-sm sm:text-base hover:bg-[#0B423D] hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 px-6 sm:px-8 rounded-full border border-white/30 bg-white/10 text-white font-semibold text-sm sm:text-base hover:bg-white/20 transition-all ${className}`}
    >
      {children}
    </Link>
  );
}

export function OutlineCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 px-6 sm:px-8 rounded-full border border-[#09391C]/20 text-[#09391C] font-semibold text-sm sm:text-base hover:bg-[#09391C]/5 transition-all ${className}`}
    >
      {children}
    </Link>
  );
}
