"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserContext, normalizeUser, type User } from "@/context/user-context";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import Loading from "@/components/loading-component/loading";
import { ArrowRight, Shield } from "lucide-react";

type Summary = {
  isVerifiedDeveloper: boolean;
  canSubmitOffPlan: boolean;
  verification: any;
  properties: { total: number; active: number; pendingReview: number; drafts: number; requiresAttention: number };
  projects: { total: number; draft: number; underReview: number; approved: number; live: number; requiresAttention: number };
  inspections: { pending: number; upcoming: number; completed: number; cancelled: number };
  transactions: { active: number; pending: number; completed: number };
  distribution: { connected: number; pending: number; active: number };
  unreadNotifications: number;
  plan: any;
  profile: any;
};

function StatusChip({ label, status }: { label: string; status?: string }) {
  const s = status || "Pending";
  const cls =
    s === "Verified"
      ? "text-emerald-800 bg-emerald-50"
      : s === "Requires Attention"
        ? "text-amber-800 bg-amber-50"
        : "text-slate-700 bg-slate-100";
  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${cls}`}>
      <span className="font-medium">{label}:</span> {s === "Verified" ? "✓ Verified" : s}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-[#09391C]">{value}</p>
      <p className="text-xs text-[#5A5D63]">{label}</p>
    </div>
  );
}

function DashCard({
  title,
  helper,
  href,
  cta,
  children,
}: {
  title: string;
  helper?: string;
  href: string;
  cta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold text-[#09391C]">{title}</h3>
      {helper && <p className="text-sm text-[#5A5D63] mt-1">{helper}</p>}
      {children && <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">{children}</div>}
      <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#09391C]">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function DeveloperDashboard() {
  const { user, setUser } = useUserContext();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem("userType", "Developer"); } catch {}
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GET_REQUEST(`${URLS.BASE}${URLS.developerDashboardSummary}`, Cookies.get("token"));
        if (res.success) {
          const data = res.data as Summary;
          setSummary(data);
          const nextStatus = data.verification?.kycStatus as string | undefined;
          if (user && nextStatus && user.kycStatus !== nextStatus) {
            setUser(normalizeUser({ ...user, kycStatus: nextStatus as User["kycStatus"] }));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <Loading />;
  if (!user) return null;

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Developer";
  const companyName = summary?.verification?.company?.legalName || summary?.profile?.companyName;
  const v = summary?.verification;
  const isCompany = v?.practitionerType === "Company";
  const verified = Boolean(summary?.isVerifiedDeveloper);
  const canProject = Boolean(summary?.canSubmitOffPlan);

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-[#09391C]">Welcome back, {name}</h1>
          {isCompany && companyName && (
            <p className="text-lg font-medium text-[#09391C] mt-1">{companyName}</p>
          )}
          <p className="text-[#5A5D63] mt-2">
            Manage your properties, projects, professional profile, inspections and transactions from one place.
          </p>
        </header>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[#09391C]" />
            <h2 className="text-lg font-semibold text-[#09391C]">Developer Verification</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <StatusChip
              label={isCompany ? "Company" : "Individual"}
              status={isCompany ? v?.company?.status : v?.individual?.status || v?.representative?.status}
            />
            <StatusChip
              label={isCompany ? "Authorized Representative" : "Identity"}
              status={v?.representative?.status}
            />
            <StatusChip label="Address" status={v?.address?.status} />
          </div>
          {!verified && (
            <div className="mt-4">
              <Link
                href="/developer-kyc"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#09391C]"
              >
                {user?.kycStatus === "pending" || user?.kycStatus === "in_review"
                  ? "View submission details →"
                  : "Complete Verification →"}
              </Link>
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#09391C] text-white rounded-2xl p-5">
            <h3 className="text-xl font-semibold">List a Property</h3>
            <p className="text-sm text-white/80 mt-2">
              List a completed, existing, or otherwise eligible property through the standard Khabiteq property-listing process.
            </p>
            <Link href="/post-property" className="mt-4 inline-flex items-center gap-1 font-semibold">
              List a Property →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-xl font-semibold text-[#09391C]">List Off-Plan Project</h3>
            {canProject ? (
              <>
                <p className="text-sm text-[#5A5D63] mt-2">
                  Submit an off-plan or under-construction development for project review.
                </p>
                <Link href="/developer/projects/new" className="mt-4 inline-flex items-center gap-1 font-semibold text-[#09391C]">
                  List Off-Plan Project →
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-[#5A5D63] mt-2">
                  Additional requirements are required before you can submit an off-plan project.
                </p>
                <Link href="/developer/requirements" className="mt-4 inline-flex items-center gap-1 font-semibold text-[#09391C]">
                  View Requirements →
                </Link>
              </>
            )}
          </div>
        </section>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63] mb-3">Business</p>
          <div className="grid md:grid-cols-2 gap-4">
            <DashCard title="My Properties" href="/my-listings" cta="View All Properties →">
              <Metric label="Total Properties" value={summary?.properties.total ?? 0} />
              <Metric label="Active Listings" value={summary?.properties.active ?? 0} />
              <Metric label="Pending Review" value={summary?.properties.pendingReview ?? 0} />
              <Metric label="Drafts" value={summary?.properties.drafts ?? 0} />
              <Metric label="Requires Attention" value={summary?.properties.requiresAttention ?? 0} />
            </DashCard>
            <DashCard title="My Projects" href="/developer/projects" cta="View All Projects →">
              {(summary?.projects.total ?? 0) === 0 ? (
                <div className="col-span-3">
                  <p className="text-sm text-[#5A5D63]">You haven&apos;t submitted an off-plan project yet.</p>
                  <Link
                    href={canProject ? "/developer/projects/new" : "/developer/requirements"}
                    className="text-sm font-semibold text-[#09391C]"
                  >
                    {canProject ? "List Off-Plan Project →" : "View Requirements →"}
                  </Link>
                </div>
              ) : (
                <>
                  <Metric label="Total Projects" value={summary?.projects.total ?? 0} />
                  <Metric label="Draft" value={summary?.projects.draft ?? 0} />
                  <Metric label="Under Review" value={summary?.projects.underReview ?? 0} />
                  <Metric label="Approved" value={summary?.projects.approved ?? 0} />
                  <Metric label="Live" value={summary?.projects.live ?? 0} />
                  <Metric label="Requires Attention" value={summary?.projects.requiresAttention ?? 0} />
                </>
              )}
            </DashCard>
            <DashCard
              title="My Transactions"
              helper="Track transactions associated with your properties and projects."
              href="/my-transactions"
              cta="View Transactions →"
            >
              <Metric label="Active Transactions" value={summary?.transactions.active ?? 0} />
              <Metric label="Pending Transactions" value={summary?.transactions.pending ?? 0} />
              <Metric label="Completed Transactions" value={summary?.transactions.completed ?? 0} />
            </DashCard>
            <DashCard title="Inspection Requests" href="/my-inspection-requests" cta="Manage Inspections →">
              <Metric label="Pending" value={summary?.inspections.pending ?? 0} />
              <Metric label="Upcoming" value={summary?.inspections.upcoming ?? 0} />
              <Metric label="Completed" value={summary?.inspections.completed ?? 0} />
              <Metric label="Cancelled" value={summary?.inspections.cancelled ?? 0} />
            </DashCard>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63] mb-3">Professional presence</p>
          <div className="grid md:grid-cols-3 gap-4">
            <DashCard
              title="Practitioner Page"
              helper="Manage your public professional profile and the information property seekers can view."
              href="/public-access-page"
              cta="Manage Practitioner Page →"
            />
            <DashCard
              title="Professional Distribution"
              helper="Manage participating real estate professionals and distribute eligible listings to your approved professional network."
              href="/my-request-to-market"
              cta="Manage Distribution →"
            >
              <Metric label="Professionals connected" value={summary?.distribution.connected ?? 0} />
              <Metric label="Pending requests" value={summary?.distribution.pending ?? 0} />
              <Metric label="Active connections" value={summary?.distribution.active ?? 0} />
            </DashCard>
            <DashCard
              title="Inspection Representatives"
              helper="Manage the people responsible for handling inspection requests for your approved listings."
              href="/dashboard/inspection-representatives"
              cta="Manage Representatives →"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63] mb-3">Platform connections</p>
          <div className="grid md:grid-cols-2 gap-4">
            <DashCard
              title="Syndication"
              helper="Manage connections with approved external property platforms."
              href="/dashboard/syndication"
              cta="Manage Syndication →"
            />
            <DashCard title="Notifications" href="/notifications" cta="View Notifications →">
              <Metric label="Unread" value={summary?.unreadNotifications ?? 0} />
            </DashCard>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5D63] mb-3">Account</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#09391C]">Developer Profile</h3>
              <p className="text-sm text-[#5A5D63] mt-2">
                {isCompany ? "Company" : "Individual"} · {name}
              </p>
              {summary?.profile?.bio && <p className="text-sm text-[#5A5D63] mt-2 line-clamp-3">{summary.profile.bio}</p>}
              <Link href="/developer-kyc" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#09391C]">
                Edit Developer Profile →
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#09391C]">Plans & Subscription</h3>
              <p className="text-sm text-[#09391C] mt-2 font-medium">
                Current Plan: {summary?.plan?.planName || "No active plan"}
              </p>
              <p className="text-xs text-[#5A5D63] mt-2">
                Off-plan projects may require additional verification and an applicable plan.
              </p>
              <div className="flex flex-col gap-1 mt-3">
                <Link href="/agent-subscriptions?tab=plans" className="text-sm font-semibold text-[#09391C]">
                  Manage Subscription →
                </Link>
                <Link href="/developer/requirements" className="text-sm font-semibold text-[#09391C]">
                  View Off-Plan Requirements →
                </Link>
              </div>
            </div>
            <DashCard title="Settings" helper="Account settings, login/security, password, notification preferences, contact information, and privacy settings." href="/profile-settings" cta="Settings →" />
          </div>
        </div>
      </div>
    </div>
  );
}
