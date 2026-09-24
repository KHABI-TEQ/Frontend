"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/context/user-context";
import Agent from "./agent";
import Landlord from "./landlord";
import FieldAgent from "./field-agent";
import Developer from "./developer";
import ProfessionalDashboard from "./professional";
import Scout from "./scout";
import Valuer from "./valuer";
import { DealSiteSetupOverlay } from "@/components/dashboard/DealSiteSetupOverlay";
import { PractitionerWelcomeOverlay } from "@/components/dashboard/PractitionerWelcomeOverlay";
import { PractitionerKycOverlay } from "@/components/dashboard/PractitionerKycOverlay";
import KycDashboardStatusCard, {
  shouldRenderKycDashboardStatus,
} from "@/components/kyc/KycDashboardStatusCard";
import CompletePractitionerPageBanner from "@/components/dashboard/CompletePractitionerPageBanner";
import Link from "next/link";
import type { User } from "@/context/user-context";
import { isLivePaidSubscription } from "@/utils/subscription-status";

function hasActiveSubscription(user: User) {
  return isLivePaidSubscription(user.activeSubscription);
}

function DashboardSubscribeBanner({ user }: { user: User }) {
  const type = String(user.userType || "");
  if (!["Agent", "Developer", "Lawyer", "Surveyor", "Valuer"].includes(type)) {
    return null;
  }
  if (hasActiveSubscription(user)) return null;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-950">
          <span className="font-semibold">Subscribe to use your {type} dashboard.</span>{" "}
          You keep this {type} account. Listing, inspections and professional tools stay locked until a paid plan is active.
        </p>
        <Link
          href="/agent-subscriptions?tab=plans"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#09391C] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Choose a plan
        </Link>
      </div>
    </div>
  );
}

function getEffectiveUserType(user: Record<string, unknown> | null): string | undefined {
  if (!user) return undefined;
  const u = user as Record<string, unknown>;
  const candidates = [
    u.userType,
    u.user_type,
    u.accountType,
    u.role,
    u.type,
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    const s = String(c).trim();
    if (s) return s;
  }
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem("userType");
    return stored?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export default function Dashboard() {
  const { user } = useUserContext();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [kycPromptOpen, setKycPromptOpen] = useState(true);
  const effectiveType = getEffectiveUserType(user as unknown as Record<string, unknown>);
  const typeLower = effectiveType?.toLowerCase() ?? "";

  useEffect(() => {
    if (typeof window === "undefined" || !effectiveType) return;
    try {
      const current = localStorage.getItem("userType") ?? "";
      const canonical =
        typeLower === "landowner"
          ? "Landowners"
          : typeLower === "developer"
            ? "Developer"
            : typeLower === "agent"
              ? "Agent"
              : typeLower === "propertyscout"
                ? "PropertyScout"
                : typeLower === "fieldagent" || typeLower === "field_agent"
                  ? "FieldAgent"
                  : effectiveType;
      if (canonical && current !== canonical) {
        localStorage.setItem("userType", canonical);
      }
    } catch {}
  }, [effectiveType, typeLower]);

  if (!user) return null;

  const showAgentDashboard = typeLower === "agent";
  const showDeveloperDashboard = typeLower === "developer";
  const showLandlord = typeLower === "landowners" || typeLower === "landowner";
  const showFieldAgent = typeLower === "fieldagent" || typeLower === "field_agent";
  const showLawyer = typeLower === "lawyer";
  const showSurveyor = typeLower === "surveyor";
  const showValuer = typeLower === "valuer";
  const showScout = typeLower === "propertyscout";

  const noTypeMatched =
    !showAgentDashboard &&
    !showDeveloperDashboard &&
    !showLandlord &&
    !showFieldAgent &&
    !showLawyer &&
    !showSurveyor &&
    !showValuer &&
    !showScout;

  const fallbackDeveloper =
    noTypeMatched &&
    typeof window !== "undefined" &&
    /developer/i.test(localStorage.getItem("userType") ?? "");

  const showDeveloper =
    showDeveloperDashboard ||
    fallbackDeveloper ||
    (noTypeMatched && typeof window !== "undefined" && !showScout);

  const showProfessionalWelcome =
    showAgentDashboard || showDeveloper || showLawyer || showSurveyor || showValuer;
  const showKycPrompt =
    showAgentDashboard || showDeveloper || showLawyer || showSurveyor || showValuer;

  return (
    <>
      {showKycPrompt && (
        <PractitionerKycOverlay user={user} onOpenChange={setKycPromptOpen} />
      )}
      {showProfessionalWelcome && !kycPromptOpen && (
        <PractitionerWelcomeOverlay user={user} onOpenChange={setWelcomeOpen} />
      )}
      {(showAgentDashboard || showDeveloper) && !welcomeOpen && !kycPromptOpen && (
        <DealSiteSetupOverlay user={user} />
      )}
      <DashboardSubscribeBanner user={user} />
      <CompletePractitionerPageBanner user={user} />
      {shouldRenderKycDashboardStatus(user) && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <KycDashboardStatusCard user={user} />
        </div>
      )}
      {showAgentDashboard && <Agent />}
      {showDeveloper && <Developer />}
      {showLandlord && <Landlord />}
      {showFieldAgent && <FieldAgent />}
      {showLawyer && <ProfessionalDashboard role="Lawyer" />}
      {showSurveyor && <ProfessionalDashboard role="Surveyor" />}
      {showValuer && <Valuer />}
      {showScout && <Scout />}
    </>
  );
}
