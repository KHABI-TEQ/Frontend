"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Briefcase,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "@/utils/axiosConfig";
import { URLS } from "@/utils/URLS";
import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { useUserContext, normalizeUser } from "@/context/user-context";
import KycSubmittedConfirmation from "@/components/kyc/KycSubmittedConfirmation";
import { isApprovedKyc, isPendingKyc } from "@/lib/kyc-status";
import { DUE_DILIGENCE_SERVICES, type DueDiligenceService } from "@/data/professional-due-diligence-services";

type Role = "Lawyer" | "Surveyor" | "Valuer";
type Tab = "overview" | "kyc" | "jobs" | "payout" | "activity" | "page";

function formatNaira(n?: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function formatFeeInput(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseFeeInput(raw: string) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function stillNeedsOffer(job: { status?: string; myOffer?: { serviceFee?: number } }) {
  if (String(job.status) !== "awaiting-offers") return true;
  return !(Number(job.myOffer?.serviceFee) > 0);
}

async function uploadAsset(file: File, fileFor: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("for", fileFor);
  const res = await POST_REQUEST_FILE_UPLOAD(
    `${URLS.BASE}${URLS.uploadSingleImg}`,
    formData,
  );
  if (!res.success) throw new Error(res.message || "Upload failed");
  return (res.data as { url?: string })?.url || "";
}

export default function ProfessionalWorkspace({ role }: { role: Role }) {
  const { user, setUser } = useUserContext();
  const isLawyer = role === "Lawyer";
  const isValuer = role === "Valuer";
  const [tab, setTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusBrief, setFocusBrief] = useState("");
  const [offerDrafts, setOfferDrafts] = useState<
    Record<string, { selectedServices: DueDiligenceService[]; agreed: boolean; letterheadAgreed: boolean }>
  >({});
  const [me, setMe] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [activitySummary, setActivitySummary] = useState<Record<string, number>>({});
  const [banks, setBanks] = useState<any[]>([]);
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    firmName: "",
    licenseNumber: "",
    fee: "",
    photo: "",
    docs: [] as { name: string; url: string }[],
    businessName: "",
    bankCode: "",
    accountNumber: "",
    slug: "",
    title: "",
    tagline: "",
    about: "",
  });

  const paths = isLawyer
    ? {
        me: URLS.lawyerMe,
        profile: URLS.lawyerProfile,
        kyc: URLS.lawyerKyc,
        bank: URLS.lawyerBank,
        jobs: URLS.lawyerJobs,
        respond: URLS.lawyerJobRespond,
        report: URLS.lawyerJobReport,
        publicPage: URLS.lawyerPublicPage,
      }
    : isValuer
      ? {
          me: URLS.valuerMe,
          profile: URLS.valuerKyc,
          kyc: URLS.valuerKyc,
          bank: URLS.valuerBank,
          jobs: URLS.valuerJobs,
          respond: (id: string) => `/account/professional-services/${id}/respond`,
          report: (_id: string) => "",
          publicPage: "",
        }
      : {
          me: URLS.surveyorMe,
          profile: URLS.surveyorProfile,
          kyc: URLS.surveyorKyc,
          bank: URLS.surveyorBank,
          jobs: URLS.surveyorJobs,
          respond: URLS.surveyorJobRespond,
          report: URLS.surveyorJobReport,
          publicPage: URLS.surveyorPublicPage,
        };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, jobsRes, bankRes, pageRes, activityRes] = await Promise.all([
        api.get(paths.me),
        api.get(paths.jobs),
        api.get(URLS.dealSiteBankList).catch(() => ({ data: { data: [] } })),
        paths.publicPage
          ? api.get(paths.publicPage).catch(() => ({ data: { data: null } }))
          : Promise.resolve({ data: { data: null } }),
        api.get("/account/transactions/activity").catch(() => ({ data: { data: null } })),
      ]);
      const meData = meRes.data?.data;
      setMe(meData);
      setJobs((jobsRes.data?.data || []).filter(stillNeedsOffer));
      setActivity(activityRes.data?.data?.activity || []);
      setActivitySummary(activityRes.data?.data?.summary || {});
      const bankList = bankRes.data?.data;
      setBanks(Array.isArray(bankList) ? bankList : bankList?.data || []);
      setPage(pageRes.data?.data || null);
      const p = meData?.profile;
      const site = pageRes.data?.data?.site;
      setForm((prev) => ({
        ...prev,
        bio: p?.bio || "",
        firmName: p?.firmName || "",
        licenseNumber: p?.licenseNumber || "",
        fee: String(p?.verificationFee || p?.surveyFee || ""),
        photo: p?.profilePhoto || "",
        docs: p?.kycDocuments || [],
        businessName: p?.bankDetails?.businessName || "",
        bankCode: p?.bankDetails?.bankCode || "",
        accountNumber: p?.bankDetails?.accountNumber || "",
        slug: site?.publicSlug || "",
        title: site?.title || "",
        tagline: site?.tagline || "",
        about: site?.about || "",
      }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not load workspace");
    } finally {
      setLoading(false);
    }
  }, [paths.jobs, paths.me, paths.publicPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (section === "briefs" || section === "jobs") setTab("jobs");
    else if (section === "kyc") setTab("kyc");
    else if (section === "payout") setTab("payout");
    else if (section === "page" && !isValuer) setTab("page");
    setFocusBrief(params.get("brief") || "");
  }, [isValuer]);

  useEffect(() => {
    if (!focusBrief || tab !== "jobs") return;
    document.getElementById(`brief-${focusBrief}`)?.scrollIntoView({ block: "center" });
  }, [focusBrief, tab, jobs]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(paths.profile, {
        bio: form.bio,
        firmName: form.firmName,
        licenseNumber: form.licenseNumber,
        profilePhoto: form.photo || undefined,
        ...(isValuer
          ? {}
          : isLawyer
            ? { verificationFee: Number(form.fee) }
            : { surveyFee: Number(form.fee) }),
      });
      toast.success("Profile saved");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const submitKyc = async () => {
    if (!form.docs.length) {
      toast.error("Upload at least one professional document.");
      return;
    }
    setSaving(true);
    try {
      await api.put(paths.kyc, {
        bio: form.bio,
        licenseNumber: form.licenseNumber,
        profilePhoto: form.photo || undefined,
        kycDocuments: form.docs,
        ...(isValuer
          ? {}
          : isLawyer
            ? { verificationFee: Number(form.fee) }
            : { surveyFee: Number(form.fee) }),
      });
      toast.success("KYC submitted successfully. Please await admin approval.");
      if (user) setUser(normalizeUser({ ...user, kycStatus: "pending" }));
      setTab("payout");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "KYC submit failed");
    } finally {
      setSaving(false);
    }
  };

  const saveBank = async () => {
    setSaving(true);
    try {
      await api.post(paths.bank, {
        businessName: form.businessName,
        bankCode: form.bankCode,
        accountNumber: form.accountNumber,
      });
      toast.success("Settlement account connected");
      setTab(isValuer ? "jobs" : "page");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Bank setup failed");
    } finally {
      setSaving(false);
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      await api.put(paths.publicPage, {
        publicSlug: form.slug,
        title: form.title,
        tagline: form.tagline,
        about: form.about,
      });
      toast.success("Practitioner page setup complete");
      setTab("overview");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Page update failed");
    } finally {
      setSaving(false);
    }
  };

  const sendOffer = async (job: any) => {
    const draft = offerDrafts[job._id] || {
      selectedServices: [],
      agreed: false,
      letterheadAgreed: false,
    };
    const serviceItems = draft.selectedServices
      .filter((item) => item.suggestedFee > 0)
      .map((item) => ({ serviceId: item.id, name: item.name, fee: item.suggestedFee }));
    const totalFee = serviceItems.reduce((total, item) => total + item.fee, 0);
    if (!serviceItems.length) {
      toast.error("Select at least one service and set its fee before sending your offer.");
      return;
    }
    if (!me?.profile?.paystackSubaccountCode) {
      toast.error("Connect the bank account from your KYC before you send an offer.");
      setTab("payout");
      return;
    }
    try {
      await api.post(`/account/professional-services/${job._id}/respond`, {
        coverageNote: serviceItems.map((item) => item.name).join("; "),
        serviceItems,
        fee: totalFee,
        commissionAccepted: draft.agreed,
        letterheadReportAccepted: draft.letterheadAgreed,
      });
      toast.success("Offer sent. The client can compare it with other professionals.");
      setJobs((prev) => prev.filter((item) => String(item._id) !== String(job._id)));
      setOfferDrafts((prev) => {
        const next = { ...prev };
        delete next[job._id];
        return next;
      });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not send the offer");
    }
  };

  const respond = async (id: string, accept: boolean) => {
    try {
      await api.post(paths.respond(id), { accept });
      toast.success(accept ? "Request accepted" : "Request declined");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not respond");
    }
  };

  const submitReport = async (id: string) => {
    const description = window.prompt("Report notes") || "";
    try {
      if (isLawyer) {
        const status = window.confirm("Mark as registered? Cancel for unregistered.")
          ? "registered"
          : "unregistered";
        await api.post(paths.report(id), { status, description });
      } else {
        await api.post(paths.report(id), { description });
      }
      toast.success("Report submitted");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Report failed");
    }
  };

  const profile = me?.profile;
  const bounds = me?.feeBounds || { min: 0, max: 0 };
  const kyc = profile?.kycStatus || "none";
  const pending = jobs.filter((j) =>
    ["pending", "payment-approved", "in-progress", "awaiting-acceptance", "awaiting-offers"].includes(
      String(j.status || ""),
    ),
  ).length;

  if (loading && !me) {
    return <div className="py-16 text-center text-[#5A5D63]">Loading workspace…</div>;
  }

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "kyc", label: "KYC & profile", icon: ShieldCheck },
    { id: "jobs", label: "Service briefs", icon: Briefcase },
    { id: "activity", label: "Transaction activity", icon: CreditCard },
    { id: "payout", label: "Payout", icon: CreditCard },
    ...(!isValuer ? [{ id: "page" as Tab, label: "Public page", icon: Globe2 }] : []),
  ];

  const openSection = (id: Tab) => {
    setTab(id);
    setMenuOpen(false);
  };

  const sidebar = (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => openSection(item.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
              active ? "bg-[#09391C] text-white" : "text-[#09391C] hover:bg-[#F4FBF5]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
      <Link
        href="/agent-subscriptions?tab=plans"
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#09391C] hover:bg-[#F4FBF5]"
      >
        <CreditCard className="h-4 w-4 shrink-0" />
        Subscription plans
      </Link>
    </nav>
  );

  const sectionTitle =
    tab === "jobs"
      ? "Service briefs"
      : tab === "kyc"
        ? "KYC & profile"
        : tab === "payout"
          ? "Payout"
          : tab === "activity"
            ? "Transaction activity & revenue"
          : tab === "page"
            ? "Public page"
            : "Overview";

  return (
    <div className="min-h-screen bg-[#F5F7F9] py-8">
      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        <aside className="sticky top-24 hidden h-[calc(100vh-7.5rem)] w-64 shrink-0 flex-col rounded-3xl border border-black/5 bg-white p-4 shadow-sm md:flex">
          <div className="mb-5 px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">
              {role} account
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[#09391C]">
              {user?.email || "Your account"}
            </p>
          </div>
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#09391C] md:text-3xl">{sectionTitle}</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#5A5D63]">
                {tab === "jobs"
                  ? "Select the services you will provide and set your fee for each item."
                  : tab === "activity"
                    ? "Follow each service engagement and the professional fee recorded for it."
                    : "Manage verification, service briefs, payouts and your public page."}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#09391C] md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>

          {menuOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)}>
              <div
                className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#09391C]">{role} account</p>
                  <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {sidebar}
              </div>
            </div>
          )}

        {tab === "overview" && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">KYC status</p>
              <p className="text-xl font-bold text-[#09391C] capitalize">{kyc}</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">Open briefs</p>
              <p className="text-xl font-bold text-[#09391C]">{pending}</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">Payout account</p>
              <p className="text-xl font-bold text-[#09391C]">
                {profile?.paystackSubaccountCode ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm text-[#5A5D63]">Confirmed professional fees</p>
                <p className="mt-1 text-xl font-bold text-[#09391C]">{formatNaira(activitySummary.confirmedRevenue)}</p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm text-[#5A5D63]">Awaiting payment or confirmation</p>
                <p className="mt-1 text-xl font-bold text-[#09391C]">{formatNaira(activitySummary.pendingRevenue)}</p>
              </div>
            </div>
            {!activity.length ? (
              <div className="rounded-2xl bg-white p-5 text-sm text-[#5A5D63]">No service or payment activity yet.</div>
            ) : activity.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white p-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-[#09391C]">{item.title || "Professional service"}</p>
                    <p className="mt-1 text-sm capitalize text-[#5A5D63]">{String(item.status || "pending").replace(/[-_]/g, " ")}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{item.reference || "Reference pending"}{item.occurredAt ? ` · ${new Date(item.occurredAt).toLocaleDateString("en-GB")}` : ""}</p>
                  </div>
                  <p className="font-bold text-[#09391C]">{formatNaira(item.amount)}</p>
                </div>
                {item.platformFee > 0 ? <p className="mt-2 text-xs text-[#5A5D63]">Platform fee: {formatNaira(item.platformFee)}</p> : null}
              </article>
            ))}
          </div>
        )}

        {tab === "kyc" && isPendingKyc(kyc) && (
          <KycSubmittedConfirmation userType={role} embedded />
        )}

        {tab === "kyc" && isApprovedKyc(kyc) && (
          <KycSubmittedConfirmation userType={role} variant="approved" embedded />
        )}

        {tab === "kyc" && !isPendingKyc(kyc) && !isApprovedKyc(kyc) && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            {!isValuer && (
              <p className="text-sm text-[#5A5D63]">
                Allowed fee: {formatNaira(bounds.min)} – {formatNaira(bounds.max)}
              </p>
            )}
            <input
              value={form.firmName}
              onChange={(e) => setForm({ ...form, firmName: e.target.value })}
              placeholder="Firm name"
              className="w-full p-3 border rounded-lg"
            />
            <input
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              placeholder={isLawyer ? "License / NBA number" : "Surveyor license number"}
              className="w-full p-3 border rounded-lg"
            />
            {!isValuer && (
              <input
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                placeholder="Fee (NGN)"
                className="w-full p-3 border rounded-lg"
              />
            )}
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              rows={4}
              className="w-full p-3 border rounded-lg"
            />
            <label className="block text-sm">
              Profile photo
              <input
                type="file"
                accept="image/*"
                className="block mt-1"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadAsset(file, "profile-picture");
                    setForm((prev) => ({ ...prev, photo: url }));
                    toast.success("Photo uploaded");
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                }}
              />
            </label>
            <label className="block text-sm">
              Add KYC document
              <input
                type="file"
                className="block mt-1"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadAsset(file, "identity-doc");
                    setForm((prev) => ({
                      ...prev,
                      docs: [...prev.docs, { name: file.name, url }],
                    }));
                    toast.success("Document uploaded");
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                }}
              />
              <p className="text-xs text-[#5A5D63] mt-1">{form.docs.length} document(s)</p>
            </label>
            <div className="flex flex-wrap gap-3">
              {!isValuer && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveProfile}
                  className="px-5 py-2 rounded-lg bg-[#09391C] text-white"
                >
                  Save profile
                </button>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={submitKyc}
                className="px-5 py-2 rounded-lg border border-[#09391C] text-[#09391C]"
              >
                Submit KYC
              </button>
            </div>
          </div>
        )}

        {tab === "jobs" && (
          <div className="space-y-4">
            {!profile?.paystackSubaccountCode && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                Connect the bank account from your KYC before you can send an offer.{" "}
                <button type="button" className="font-semibold underline" onClick={() => setTab("payout")}>
                  Open payout
                </button>
              </div>
            )}
            {!jobs.length && (
              <p className="text-[#5A5D63]">
                No service briefs yet. A brief appears here when a client asks for your kind of due diligence.
              </p>
            )}
            {jobs.map((job) => {
              const brief = String(job.status) === "awaiting-offers" || job.source === "catalog";
              const draft = offerDrafts[job._id] || {
                selectedServices: [],
                agreed: false,
                letterheadAgreed: false,
              };
              const objective = job.answers?.objective || job.answers?.additional || "";
              const serviceOptions = DUE_DILIGENCE_SERVICES[role] || [];
              const selectedTotal = draft.selectedServices.reduce((total, item) => total + item.suggestedFee, 0);
              return (
                <div
                  key={job._id}
                  id={`brief-${job._id}`}
                  className={`bg-white rounded-2xl p-5 ${
                    focusBrief === String(job._id) ? "ring-2 ring-[#8DDB90]" : ""
                  }`}
                >
                  <p className="font-semibold text-[#09391C]">
                    {job.serviceName || job.docType || job.serviceType || "Service brief"}
                  </p>
                  {job.reference && (
                    <p className="mt-1 text-sm text-[#5A5D63]">Reference: {job.reference}</p>
                  )}
                  <p className="text-sm text-[#5A5D63] capitalize">
                    Status: {String(job.status || "").replace(/-/g, " ")}
                  </p>
                  {job.buyerId?.fullName && (
                    <p className="text-sm mt-1">Client: {job.buyerId.fullName}</p>
                  )}
                  {objective ? <p className="mt-3 text-sm text-[#09391C]">{objective}</p> : null}
                  {brief && String(job.status) === "awaiting-offers" && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#09391C]">Choose the services in your offer</h3>
                        <p className="mt-1 text-xs text-[#5A5D63]">Suggested fees are editable starting points, not statutory tariffs.</p>
                      </div>
                      <div className="space-y-2">
                        {serviceOptions.map((service) => {
                          const selected = draft.selectedServices.find((item) => item.id === service.id);
                          return (
                            <div key={service.id} className="rounded-xl border border-gray-200 bg-white p-3">
                              <label className="flex items-start gap-3 text-sm text-[#09391C]">
                                <input
                                  type="checkbox"
                                  checked={Boolean(selected)}
                                  onChange={(event) => setOfferDrafts((previous) => {
                                    const current = previous[job._id] || draft;
                                    const selectedServices = event.target.checked
                                      ? [...current.selectedServices, { ...service }]
                                      : current.selectedServices.filter((item) => item.id !== service.id);
                                    return { ...previous, [job._id]: { ...current, selectedServices } };
                                  })}
                                  className="mt-0.5"
                                />
                                <span className="flex-1 font-medium">{service.name}</span>
                              </label>
                              {selected ? (
                                <div className="mt-2 flex items-center gap-2 pl-7">
                                  <span className="text-xs text-gray-500">Fee (NGN)</span>
                                  <input
                                    inputMode="numeric"
                                    aria-label={`${service.name} fee in naira`}
                                    value={formatFeeInput(String(selected.suggestedFee))}
                                    onChange={(event) => {
                                      const fee = parseFeeInput(event.target.value);
                                      setOfferDrafts((previous) => {
                                        const current = previous[job._id] || draft;
                                        return {
                                          ...previous,
                                          [job._id]: {
                                            ...current,
                                            selectedServices: current.selectedServices.map((item) =>
                                              item.id === service.id ? { ...item, suggestedFee: fee } : item,
                                            ),
                                          },
                                        };
                                      });
                                    }}
                                    className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-[#F1F8F2] px-4 py-3 font-semibold text-[#09391C]">
                        <span>Offer total</span><span>₦{selectedTotal.toLocaleString("en-NG")}</span>
                      </div>
                      <label className="flex items-start gap-2 text-sm text-[#09391C]">
                        <input
                          type="checkbox"
                          checked={draft.agreed}
                          onChange={(e) =>
                            setOfferDrafts((prev) => ({
                              ...prev,
                              [job._id]: { ...draft, agreed: e.target.checked },
                            }))
                          }
                          className="mt-1"
                        />
                        <span>
                          I agree that Khabiteq deducts 10% of this fee from my settlement. The client pays only the fee I set.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-[#09391C]">
                        <input
                          type="checkbox"
                          checked={draft.letterheadAgreed}
                          onChange={(e) =>
                            setOfferDrafts((prev) => ({
                              ...prev,
                              [job._id]: { ...draft, letterheadAgreed: e.target.checked },
                            }))
                          }
                          className="mt-1"
                        />
                        <span>
                          I agree that I will send a full report to the client using my company letterhead paper.
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => sendOffer(job)}
                        className="rounded-lg bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Send offer
                      </button>
                    </div>
                  )}
                  {!brief && ["pending", "awaiting-acceptance"].includes(String(job.status)) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => respond(job._id, true)}
                        className="px-3 py-1 rounded bg-[#09391C] text-white text-sm"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respond(job._id, false)}
                        className="px-3 py-1 rounded border text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {!brief && ["payment-approved", "in-progress"].includes(String(job.status)) && paths.report(job._id) && (
                    <button
                      type="button"
                      onClick={() => submitReport(job._id)}
                      className="mt-3 px-3 py-1 rounded bg-[#8DDB90] text-[#09391C] text-sm font-medium"
                    >
                      Submit report
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "payout" && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            {profile?.paystackSubaccountCode && (
              <p className="text-sm text-green-700">
                Connected: {profile.paystackSubaccountCode}
              </p>
            )}
            <input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Business name"
              className="w-full p-3 border rounded-lg"
            />
            <select
              value={form.bankCode}
              onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select bank</option>
              {banks.map((bank: any) => (
                <option key={bank.code || bank.id} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            <input
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="Account number"
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="button"
              disabled={saving}
              onClick={saveBank}
              className="px-5 py-2 rounded-lg bg-[#09391C] text-white"
            >
              Save payout account
            </button>
          </div>
        )}

        {tab === "page" && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            {page?.publicUrl && (
              <a
                href={page.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#16a34a] underline text-sm"
              >
                {page.publicUrl}
              </a>
            )}
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Public slug"
              className="w-full p-3 border rounded-lg"
            />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Page title"
              className="w-full p-3 border rounded-lg"
            />
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Tagline"
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              placeholder="About"
              rows={4}
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="button"
              disabled={saving}
              onClick={savePage}
              className="px-5 py-2 rounded-lg bg-[#09391C] text-white"
            >
              Save public page
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
