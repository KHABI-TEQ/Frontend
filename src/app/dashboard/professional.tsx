"use client";

import ProfessionalWorkspace from "@/components/professional/ProfessionalWorkspace";

export default function ProfessionalDashboard({
  role,
}: {
  role: "Lawyer" | "Surveyor";
}) {
  return <ProfessionalWorkspace role={role} />;
}
