"use client";

interface PublisherDashboardNoticeProps {
  userType: "Developer" | "Landowners";
}

/**
 * Developer and Landlord accounts are not subject to Agent KYC/subscription listing policy.
 */
export default function PublisherDashboardNotice({ userType }: PublisherDashboardNoticeProps) {
  if (userType === "Landowners") return null;

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
      <p className="font-semibold text-[#09391C]">Developer listing access</p>
      <p className="mt-1 leading-relaxed text-slate-700">
        Developer Distribution and Off-plan plans allow up to <strong>25 properties</strong> on Khabiteq.
      </p>
    </div>
  );
}
