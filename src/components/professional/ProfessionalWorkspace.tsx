"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/axiosConfig";
import { URLS } from "@/utils/URLS";
import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";

type Role = "Lawyer" | "Surveyor";
type Tab = "overview" | "kyc" | "jobs" | "payout" | "page";

function formatNaira(n?: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
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
  const isLawyer = role === "Lawyer";
  const [tab, setTab] = useState<Tab>("overview");
  const [me, setMe] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
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
      const [meRes, jobsRes, bankRes, pageRes] = await Promise.all([
        api.get(paths.me),
        api.get(paths.jobs),
        api.get(URLS.dealSiteBankList).catch(() => ({ data: { data: [] } })),
        api.get(paths.publicPage).catch(() => ({ data: { data: null } })),
      ]);
      const meData = meRes.data?.data;
      setMe(meData);
      setJobs(jobsRes.data?.data || []);
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

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(paths.profile, {
        bio: form.bio,
        firmName: form.firmName,
        licenseNumber: form.licenseNumber,
        profilePhoto: form.photo || undefined,
        ...(isLawyer
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
        ...(isLawyer
          ? { verificationFee: Number(form.fee) }
          : { surveyFee: Number(form.fee) }),
      });
      toast.success("KYC submitted for review");
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
      toast.success("Public page updated");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Page update failed");
    } finally {
      setSaving(false);
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
    ["pending", "payment-approved", "in-progress", "awaiting-acceptance"].includes(
      String(j.status || ""),
    ),
  ).length;

  if (loading && !me) {
    return <div className="py-16 text-center text-[#5A5D63]">Loading workspace…</div>;
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-[#09391C] mb-2">
          {role} workspace
        </h1>
        <p className="text-[#5A5D63] mb-6">
          Manage KYC, incoming jobs, payouts and your public professional page.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["overview", "Overview"],
              ["kyc", "KYC & profile"],
              ["jobs", "Jobs"],
              ["payout", "Payout"],
              ["page", "Public page"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                tab === id ? "bg-[#09391C] text-white" : "bg-white text-[#09391C]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">KYC status</p>
              <p className="text-xl font-bold text-[#09391C] capitalize">{kyc}</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">Open jobs</p>
              <p className="text-xl font-bold text-[#09391C]">{pending}</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-[#5A5D63]">Fee</p>
              <p className="text-xl font-bold text-[#09391C]">
                {formatNaira(profile?.verificationFee || profile?.surveyFee)}
              </p>
            </div>
          </div>
        )}

        {tab === "kyc" && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <p className="text-sm text-[#5A5D63]">
              Allowed fee: {formatNaira(bounds.min)} – {formatNaira(bounds.max)}
            </p>
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
            <input
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
              placeholder="Fee (NGN)"
              className="w-full p-3 border rounded-lg"
            />
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
              <button
                type="button"
                disabled={saving}
                onClick={saveProfile}
                className="px-5 py-2 rounded-lg bg-[#09391C] text-white"
              >
                Save profile
              </button>
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
            {!jobs.length && (
              <p className="text-[#5A5D63]">No jobs yet. They appear here when clients hire you.</p>
            )}
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-2xl p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#09391C]">
                      {job.docType || job.serviceType || "Request"}
                    </p>
                    <p className="text-sm text-[#5A5D63] capitalize">
                      Status: {String(job.status || "").replace(/-/g, " ")}
                    </p>
                    {job.buyerId?.fullName && (
                      <p className="text-sm mt-1">Client: {job.buyerId.fullName}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {["pending", "awaiting-acceptance"].includes(String(job.status)) && (
                      <>
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
                      </>
                    )}
                    {["payment-approved", "in-progress"].includes(String(job.status)) && (
                      <button
                        type="button"
                        onClick={() => submitReport(job._id)}
                        className="px-3 py-1 rounded bg-[#8DDB90] text-[#09391C] text-sm font-medium"
                      >
                        Submit report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
  );
}
