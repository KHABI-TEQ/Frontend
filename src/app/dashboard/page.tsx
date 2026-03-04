"use client";

import { useEffect } from "react";
import { useUserContext } from "@/context/user-context";
import Agent from "./agent";
import Landlord from "./landlord";
import FieldAgent from "./field-agent";
import Developer from "./developer";

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

  if (!user) return null;

  const effectiveType = getEffectiveUserType(user as unknown as Record<string, unknown>);
  const typeLower = effectiveType?.toLowerCase() ?? "";

  useEffect(() => {
    if (typeof window === "undefined" || !effectiveType) return;
    try {
      const current = localStorage.getItem("userType") ?? "";
      const canonical = typeLower === "landowner" ? "Landowners" : typeLower === "developer" ? "Developer" : typeLower === "agent" ? "Agent" : typeLower === "fieldagent" || typeLower === "field_agent" ? "FieldAgent" : effectiveType;
      if (canonical && current !== canonical) {
        localStorage.setItem("userType", canonical);
      }
    } catch {}
  }, [effectiveType, typeLower]);

  const showAgentDashboard = typeLower === "agent";
  const showDeveloperDashboard = typeLower === "developer";
  const showLandlord = typeLower === "landowners" || typeLower === "landowner";
  const showFieldAgent = typeLower === "fieldagent" || typeLower === "field_agent";

  const noTypeMatched =
    !showAgentDashboard && !showDeveloperDashboard && !showLandlord && !showFieldAgent;

  const fallbackDeveloper =
    noTypeMatched &&
    typeof window !== "undefined" &&
    /developer/i.test(localStorage.getItem("userType") ?? "");

  const showDeveloper =
    showDeveloperDashboard ||
    fallbackDeveloper ||
    (noTypeMatched && typeof window !== "undefined");

  return (
    <>
      {showAgentDashboard && <Agent />}
      {showDeveloper && <Developer />}
      {showLandlord && <Landlord />}
      {showFieldAgent && <FieldAgent />}
    </>
  );
}
