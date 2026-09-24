"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserContext, normalizeUser } from "@/context/user-context";
import KycSubmittedConfirmation from "@/components/kyc/KycSubmittedConfirmation";
import { isApprovedKyc, isPendingKyc, normalizeKycStatus } from "@/lib/kyc-status";
import { GET_REQUEST, POST_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import AttachFile from "@/components/general-components/attach_file";
import { getCookie } from "cookies-next";
import { getLGAsByState, PILOT_STATE } from "@/utils/location-utils";
import ProcessingRequest from "@/components/loading-component/ProcessingRequest";
import { handleApiError } from "@/utils/handleApiError";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, CheckCircle2, Shield } from "lucide-react";

type AccountType = "Individual" | "Company";

function Field({
  label,
  why,
  children,
}: {
  label: string;
  why: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#09391C]">{label}</span>
      <p className="text-xs text-[#5A5D63] leading-relaxed">{why}</p>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#09391C] outline-none focus:border-[#8DDB90] focus:ring-2 focus:ring-[#8DDB90]/20";

const PRACTITIONER_SETUP_HREF = "/public-access-page/setup";

export default function DeveloperKycForm() {
  const router = useRouter();
  const { user, setUser } = useUserContext();
  const token = getCookie("token") as string;
  const lgas = useMemo(() => getLGAsByState(PILOT_STATE), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [verification, setVerification] = useState<any>(null);

  const [accountType, setAccountType] = useState<AccountType>("Individual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  const [cacNumber, setCacNumber] = useState("");
  const [companyType, setCompanyType] = useState("limited_liability");
  const [cacDoc, setCacDoc] = useState<string | null>(null);
  const [lookup, setLookup] = useState<any>(null);
  const [office, setOffice] = useState({
    homeNo: "",
    street: "",
    localGovtArea: "",
    state: PILOT_STATE,
  });

  const [repName, setRepName] = useState("");
  const [repRole, setRepRole] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [idType, setIdType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [idLookup, setIdLookup] = useState<any>(null);

  const steps = useMemo(() => {
    const base = [
      { key: "profile", label: "Profile" },
      ...(accountType === "Company" ? [{ key: "company", label: "Company registration" }] : []),
      { key: "identity", label: accountType === "Company" ? "Authorized representative" : "Your identity" },
      { key: "address", label: "Address" },
    ];
    return base;
  }, [accountType]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GET_REQUEST(`${URLS.BASE}${URLS.developerVerification}`, token);
        if (res.success && res.data) {
          const d = res.data as any;
          setVerification(d);
          setAccountType(d.practitionerType === "Company" ? "Company" : "Individual");
          setFirstName(d.profile?.firstName || user?.firstName || "");
          setLastName(d.profile?.lastName || user?.lastName || "");
          setPhone(d.profile?.phoneNumber || (user as any)?.phoneNumber || "");
          setEmail(d.profile?.email || user?.email || "");
          setBio(d.profile?.bio || "");
          setRegions(d.profile?.regionOfOperation || []);
          setCompanyName(d.profile?.companyName || d.company?.legalName || "");
          setBusinessPhone(d.profile?.businessPhone || "");
          setBusinessEmail(d.profile?.businessEmail || "");
          setCacNumber(d.company?.cacNumber || "");
          setOffice({
            homeNo: d.address?.homeNo || "",
            street: d.address?.street || "",
            localGovtArea: d.address?.localGovtArea || "",
            state: d.address?.state || PILOT_STATE,
          });
          setRepName(d.representative?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim());
          setRepPhone(d.profile?.phoneNumber || (user as any)?.phoneNumber || "");
          setRepEmail(d.profile?.email || user?.email || "");
          if (d.representative?.idType) setIdType(d.representative.idType);
          if (d.representative?.idNumber) setIdNumber(d.representative.idNumber);
          if (Array.isArray(d.representative?.idDocumentUrls) && d.representative.idDocumentUrls[0]) {
            setIdDoc(d.representative.idDocumentUrls[0]);
          }
        } else {
          setFirstName(user?.firstName || "");
          setLastName(user?.lastName || "");
          setPhone((user as any)?.phoneNumber || "");
          setEmail(user?.email || "");
          setRepName(`${user?.firstName || ""} ${user?.lastName || ""}`.trim());
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) void load();
    else setLoading(false);
  }, [token, user]);

  const saveProfile = async () => {
    const res = await PUT_REQUEST(
      `${URLS.BASE}${URLS.developerProfile}`,
      {
        practitionerType: accountType,
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        profileBio: bio,
        regionOfOperation: regions,
        companyName,
        businessPhone,
        businessEmail,
        address: office,
      },
      token,
    );
    if (!res.success) {
      handleApiError(res);
      return false;
    }
    setVerification(res.data);
    return true;
  };

  const lookupCompany = async () => {
    setSaving(true);
    try {
      const res = await POST_REQUEST(`${URLS.BASE}${URLS.developerCompanyLookup}`, { cacNumber }, token);
      if (!res.success) {
        handleApiError(res);
        return;
      }
      setLookup(res.data);
      const d = res.data as any;
      if (d.legalName) setCompanyName(d.legalName);
      if (d.registeredAddress) {
        setOffice((prev) => ({
          ...prev,
          homeNo: d.registeredAddress.homeNo || prev.homeNo,
          street: d.registeredAddress.street || prev.street,
          localGovtArea: d.registeredAddress.localGovtArea || prev.localGovtArea,
          state: d.registeredAddress.state || prev.state,
        }));
      }
      if (d.found) toast.success("Company record found. Confirm the details below.");
      else toast.error("We could not match this CAC number. Check the RC prefix or upload the certificate for review.");
    } finally {
      setSaving(false);
    }
  };

  const saveCompany = async () => {
    const res = await PUT_REQUEST(
      `${URLS.BASE}${URLS.developerCompany}`,
      {
        legalName: companyName,
        cacNumber,
        companyType,
        cacCertificateUrls: cacDoc ? [cacDoc] : [],
        registeredAddress: office,
        confirmProviderData: Boolean(lookup?.found),
      },
      token,
    );
    if (!res.success) {
      handleApiError(res);
      return false;
    }
    setVerification(res.data);
    return true;
  };

  const saveIdentity = async () => {
    const res = await PUT_REQUEST(
      `${URLS.BASE}${URLS.developerRepresentative}`,
      {
        fullName: accountType === "Company" ? repName : `${firstName} ${lastName}`.trim(),
        position: accountType === "Company" ? repRole : "Account holder",
        phone: accountType === "Company" ? repPhone : phone,
        email: accountType === "Company" ? repEmail : email,
        idType,
        idNumber,
        idDocumentUrls: idDoc ? [idDoc] : [],
        consent,
      },
      token,
    );
    if (!res.success) {
      handleApiError(res);
      return false;
    }
    setVerification((res.data as any)?.status ? res.data : (res.data as any));
    setIdLookup((res.data as any)?.lookup);
    return true;
  };

  const saveAddress = async () => {
    const res = await PUT_REQUEST(`${URLS.BASE}${URLS.developerAddress}`, office, token);
    if (!res.success) {
      handleApiError(res);
      return false;
    }
    setVerification(res.data);
    return true;
  };

  const next = async () => {
    setSaving(true);
    try {
      const key = steps[step]?.key;
      let ok = true;
      if (key === "profile") ok = await saveProfile();
      if (key === "company") ok = await saveCompany();
      if (key === "identity") ok = await saveIdentity();
      if (key === "address") {
        ok = await saveAddress();
        if (ok) {
          const submitted = await POST_REQUEST(
            `${URLS.BASE}${URLS.developerVerificationSubmit}`,
            {},
            token,
          );
          if (!submitted.success) {
            handleApiError(submitted);
            return;
          }
          if (submitted.data) {
            setVerification(submitted.data);
          }
          const nextStatus =
            (submitted.data as { isVerifiedDeveloper?: boolean; kycStatus?: string } | undefined)
              ?.isVerifiedDeveloper
              ? "approved"
              : "pending";
          if (user) {
            setUser(normalizeUser({ ...user, kycStatus: nextStatus }));
          }
          toast.success(
            nextStatus === "approved"
              ? "Verification approved."
              : "KYC submitted successfully.",
          );
          router.push(PRACTITIONER_SETUP_HREF);
          return;
        }
      }
      if (ok && step < steps.length - 1) setStep((s) => s + 1);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <ProcessingRequest
          isVisible
          title="Loading verification"
          message="Please wait while we load your practitioner profile..."
        />
      </div>
    );
  }

  const verified = Boolean(verification?.isVerifiedDeveloper);
  const kycStatus = normalizeKycStatus(verification?.kycStatus || user?.kycStatus);

  if (!loading && (verified || isApprovedKyc(kycStatus))) {
    return (
      <KycSubmittedConfirmation
        userType="Developer"
        variant="approved"
        continueHref={PRACTITIONER_SETUP_HREF}
        continueLabel="Set up your practitioner page"
      />
    );
  }

  if (!loading && isPendingKyc(kycStatus)) {
    return (
      <KycSubmittedConfirmation
        userType="Developer"
        continueHref={PRACTITIONER_SETUP_HREF}
        continueLabel="Set up your practitioner page"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-8 px-4">
      <ProcessingRequest
        isVisible={saving}
        title="Saving verification"
        message="Please wait while we save this step..."
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#5A5D63] uppercase">Practitioner account</p>
          <h1 className="text-3xl font-bold text-[#09391C] mt-1">Set up your Practitioner Profile</h1>
          <p className="text-[#5A5D63] mt-2">
            Tell us about your business. Verification helps establish your identity and build trust with property seekers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                i === step ? "bg-[#09391C] text-white" : "bg-white text-[#5A5D63] border border-slate-200"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {verified && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Verified practitioner — you can still update profile details below.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-6">
          {steps[step]?.key === "profile" && (
            <>
              <div>
                <p className="text-sm font-semibold text-[#09391C] mb-2">Account type</p>
                <p className="text-xs text-[#5A5D63] mb-3">
                  Choose whether you operate as an individual practitioner or a registered company.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["Individual", "Company"] as AccountType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                        accountType === type
                          ? "border-[#09391C] bg-[#09391C] text-white"
                          : "border-slate-200 text-[#09391C]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {accountType === "Individual" ? (
                <div className="grid gap-4">
                  <Field label="Full name" why="This is the legal name of the person operating this practitioner account.">
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                      <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                    </div>
                  </Field>
                  <Field label="Phone number" why="Property seekers and Khabiteq will use this number to reach you about listings and inspections.">
                    <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                  <Field label="Email address" why="Official account email for verification updates and listing activity.">
                    <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Profile bio" why="A short description of your development work. This can appear on your public practitioner page.">
                    <textarea className={inputClass} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </Field>
                </div>
              ) : (
                <div className="grid gap-4">
                  <Field label="Registered company name" why="This must match the name on the company's CAC registration record.">
                    <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </Field>
                  <Field label="Company bio" why="Describe the company so property seekers understand who is delivering the development.">
                    <textarea className={inputClass} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </Field>
                  <Field label="Business phone number" why="The official phone number for this company on Khabiteq.">
                    <input className={inputClass} value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
                  </Field>
                  <Field label="Business email address" why="The official email for company correspondence and verification updates.">
                    <input className={inputClass} type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
                  </Field>
                </div>
              )}

              <Field label="Areas / LGAs of operation" why="Select the Lagos local governments where you currently develop or intend to list.">
                <div className="flex flex-wrap gap-2">
                  {lgas.map((lga) => {
                    const on = regions.includes(lga);
                    return (
                      <button
                        key={lga}
                        type="button"
                        onClick={() =>
                          setRegions((prev) => (on ? prev.filter((x) => x !== lga) : [...prev, lga]))
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          on ? "bg-[#09391C] text-white" : "bg-slate-100 text-[#5A5D63]"
                        }`}
                      >
                        {lga}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {steps[step]?.key === "company" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-[#09391C]">Company Registration Details</h2>
                <p className="text-sm text-[#5A5D63] mt-1">
                  We verify the company through CAC / KYB. This is separate from the person who manages the account.
                </p>
              </div>
              <Field
                label="CAC registration number"
                why="This is the company's registration number issued by the Corporate Affairs Commission. Use the prefix, for example RC1234567."
              >
                <div className="flex gap-2">
                  <input className={inputClass} value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} placeholder="RC0000000" />
                  <button type="button" onClick={lookupCompany} className="shrink-0 rounded-lg bg-[#09391C] text-white px-4 text-sm font-semibold">
                    Look up
                  </button>
                </div>
              </Field>
              {lookup?.found && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="font-semibold text-emerald-900 mb-2">Returned from the verification provider</p>
                  <p>Registered name: {lookup.legalName || "—"}</p>
                  <p>Registration number: {lookup.registrationNumber || cacNumber}</p>
                  <p>Status: {lookup.companyStatus || lookup.status}</p>
                  <p className="mt-2 text-emerald-800">Confirm these details rather than retyping them.</p>
                </div>
              )}
              <Field label="Registered company name" why="This must correspond with the company's CAC registration record.">
                <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label="Company type" why="Identify the registered entity type on the CAC record.">
                <select className={inputClass} value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
                  <option value="business_name">Business Name</option>
                  <option value="limited_liability">Limited Liability Company</option>
                  <option value="other">Other CAC-registered entity</option>
                </select>
              </Field>
              <Field label="CAC registration document" why="Upload the CAC certificate or registration document so Khabiteq can review it if automatic lookup is incomplete.">
                <AttachFile id="cac-doc" heading="Upload CAC document" setFileUrl={setCacDoc} acceptedFileTypes="image/*,.pdf" />
                {cacDoc && <p className="text-xs text-emerald-700">Document uploaded</p>}
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="House / office number" why="The number of the registered office on the CAC record.">
                  <input className={inputClass} value={office.homeNo} onChange={(e) => setOffice({ ...office, homeNo: e.target.value })} />
                </Field>
                <Field label="Street address" why="The street of the registered office.">
                  <input className={inputClass} value={office.street} onChange={(e) => setOffice({ ...office, street: e.target.value })} />
                </Field>
                <Field label="LGA" why="The local government of the registered office.">
                  <select className={inputClass} value={office.localGovtArea} onChange={(e) => setOffice({ ...office, localGovtArea: e.target.value })}>
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </Field>
                <Field label="State" why="Registered office state. Khabiteq currently onboards Lagos developments.">
                  <input className={inputClass} value={office.state} readOnly />
                </Field>
              </div>
            </>
          )}

          {steps[step]?.key === "identity" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-[#09391C]">
                  {accountType === "Company" ? "Authorized Representative" : "Your identity"}
                </h2>
                <p className="text-sm text-[#5A5D63] mt-1">
                  {accountType === "Company"
                    ? "Tell us about the person authorized to manage this practitioner account. The company is verified separately through company registration."
                    : "Verify the person who will manage this practitioner account."}
                </p>
              </div>
              {accountType === "Company" && (
                <>
                  <Field label="Full legal name" why="The legal name of the person authorized to operate this company account.">
                    <input className={inputClass} value={repName} onChange={(e) => setRepName(e.target.value)} />
                  </Field>
                  <Field label="Position / role in the company" why="For example Director, Authorized signatory, or Company secretary.">
                    <input className={inputClass} value={repRole} onChange={(e) => setRepRole(e.target.value)} />
                  </Field>
                  <Field label="Phone number" why="Direct phone number for the authorized representative.">
                    <input className={inputClass} value={repPhone} onChange={(e) => setRepPhone(e.target.value)} />
                  </Field>
                  <Field label="Email address" why="Direct email for the authorized representative.">
                    <input className={inputClass} value={repEmail} onChange={(e) => setRepEmail(e.target.value)} />
                  </Field>
                </>
              )}
              <Field label="Means of identification" why="Choose the government ID we should verify. Your ID document stays private and is never shown on your practitioner page.">
                <select className={inputClass} value={idType} onChange={(e) => setIdType(e.target.value)}>
                  <option value="NIN">NIN</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Driver’s Licence">Driver’s Licence</option>
                </select>
              </Field>
              <Field label="ID number" why="The number printed on the selected identification document.">
                <input className={inputClass} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
              </Field>
              <Field label="Upload ID document" why="A clear photo or scan of the selected ID. This is used only for verification.">
                <AttachFile
                  id="id-doc"
                  heading="Upload ID"
                  fileUrl={idDoc}
                  setFileUrl={setIdDoc}
                  acceptedFileTypes="image/*,.pdf"
                />
              </Field>
              <label className="flex items-start gap-2 text-sm text-[#09391C]">
                <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                I consent to Khabiteq verifying this identity with our verification provider.
              </label>
              {idLookup?.found && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="font-semibold text-emerald-900">Returned identity</p>
                  <p>{idLookup.fullName || "Name matched"}</p>
                  {idLookup.dateOfBirth && <p>Date of birth: {idLookup.dateOfBirth}</p>}
                </div>
              )}
            </>
          )}

          {steps[step]?.key === "address" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-[#09391C]">Address verification</h2>
                <p className="text-sm text-[#5A5D63] mt-1">
                  Address is verified separately from the company and from the authorized representative.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="House / office number" why="The number of the address we should verify.">
                  <input className={inputClass} value={office.homeNo} onChange={(e) => setOffice({ ...office, homeNo: e.target.value })} />
                </Field>
                <Field label="Street address" why="The street we should verify.">
                  <input className={inputClass} value={office.street} onChange={(e) => setOffice({ ...office, street: e.target.value })} />
                </Field>
                <Field label="LGA" why="Local government of this address.">
                  <select className={inputClass} value={office.localGovtArea} onChange={(e) => setOffice({ ...office, localGovtArea: e.target.value })}>
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </Field>
                <Field label="State" why="Address state.">
                  <input className={inputClass} value={office.state} readOnly />
                </Field>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5A5D63] disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => void next()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#09391C] text-white px-5 py-2.5 text-sm font-semibold"
            >
              {step === steps.length - 1 ? (
                <>
                  <Shield className="h-4 w-4" /> Submit verification
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <Link href="/dashboard" className="text-sm text-[#09391C] font-medium hover:underline">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
