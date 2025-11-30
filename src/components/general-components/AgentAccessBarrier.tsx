/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import Link from "next/link";
import { useUserContext } from "@/context/user-context";

interface AgentAccessBarrierProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireApproval?: boolean;
  customMessage?: string;
}

const AgentAccessBarrier: React.FC<AgentAccessBarrierProps> = ({
  children,
  requireOnboarding = true,
  requireApproval = true,
  customMessage,
}) => {
  const { user } = useUserContext();

  // Allow access if not an agent
  if (!user || user.userType !== "Agent") {
    return <>{children}</>;
  }

  const Container = ({
    icon,
    title,
    message,
    actionLabel,
    actionHref,
    bgColor,
    iconColor,
  }: {
    icon: React.ReactNode;
    title: string;
    message: string;
    actionLabel: string;
    actionHref: string;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className="min-h-screen bg-[#F6F8F8] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border ${bgColor} border-gray-200 p-10 max-w-md w-full text-center`}
      >
        <div
          className={`w-16 h-16 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-[#0C1E1B] mb-4">
          {title}
        </h2>
        <p className="text-[#4F5B57] mb-6">{message}</p>
        <Link
          href={actionHref}
          className="bg-[#0B572B] hover:bg-[#094C25] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
        >
          {actionLabel}
        </Link>
      </motion.div>
    </div>
  );

  // 🧾 Block if onboarding not complete
  if (requireOnboarding && !user.agentData?.agentType) {
    return (
      <Container
        icon={<User size={32} className="text-[#FF6B00]" />}
        title="Complete Your Onboarding"
        message={
          customMessage ||
          "You need to complete your agent onboarding process before accessing this feature."
        }
        actionLabel="Complete Onboarding"
        actionHref="/agent-onboard"
        bgColor="bg-white"
        iconColor="bg-orange-50"
      />
    );
  }

  // ⏳ Block if approval is pending
  if (requireApproval && user.accountApproved === false) {
    return (
      <Container
        icon={<Clock size={32} className="text-[#D97706]" />}
        title="Approval Pending"
        message={
          customMessage ||
          "Your agent application is currently under review. You'll be able to access this feature once approved."
        }
        actionLabel="Check Status"
        actionHref="/agent-under-review"
        bgColor="bg-white"
        iconColor="bg-yellow-50"
      />
    );
  }

  // ✅ All good
  return <>{children}</>;
};

export default AgentAccessBarrier;
