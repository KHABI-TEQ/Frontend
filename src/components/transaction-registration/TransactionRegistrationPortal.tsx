"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  transactionRegistrationService,
  type RegisterTransactionBody,
  type TransactionRegistrationSearchResult,
} from "@/services/transactionRegistrationService";
import { uploadRegistrationDocument } from "@/utils/transaction-registration-upload";
import {
  PROCESSING_FEE_BANDS,
  getProcessingFeeFromTransactionValue,
  parseTransactionValueInput,
} from "@/utils/transaction-processing-fee";
import { buildFullAddress, EMPTY_ADDRESS, isAddressRequiredPartsFilled } from "@/utils/address";
import { AddressBreakdownFields } from "@/components/transaction-registration/AddressBreakdownFields";
import { FileText, Search, ShieldCheck, ChevronLeft, ChevronRight, Award } from "lucide-react";

type TabId = "guidelines" | "search" | "register" | "certificate";
const TAB_ORDER: TabId[] = ["guidelines", "search", "register", "certificate"];

const TRANSACTION_TYPES = [
  { name: "Rental Agreement", slug: "rental" },
  { name: "Outright Property Purchase", slug: "outright-purchase" },
  { name: "Contract of Sale", slug: "contract-of-sale" },
  { name: "Off-Plan Purchases", slug: "off-plan" },
  { name: "Joint Venture Agreement", slug: "joint-venture" },
];

function formatNaira(n?: number | null) {
  if (n === undefined || n === null) return "—";
  return `₦${Number(n).toLocaleString("en-NG")}`;
}

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#8DDB90] focus:ring-2 focus:ring-[#8DDB90]/15 outline-none transition-all";
const labelClass = "block text-sm font-semibold text-gray-800 mb-2";

export default function TransactionRegistrationPortal() {
  const searchParams = useSearchParams();
  const propertyIdFromUrl = searchParams.get("propertyId") ?? "";
  const tabFromUrl = searchParams.get("tab");
  const initialTab: TabId =
    tabFromUrl === "certificate" || tabFromUrl === "search" || tabFromUrl === "register" || tabFromUrl === "guidelines"
      ? tabFromUrl
      : "guidelines";

  const [tab, setTab] = useState<TabId>(initialTab);

  const [searchMode, setSearchMode] = useState<"address" | "propertyId" | "gps">("address");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchPropertyId, setSearchPropertyId] = useState(propertyIdFromUrl);
  const [searchLat, setSearchLat] = useState("");
  const [searchLng, setSearchLng] = useState("");
  const [searchResults, setSearchResults] = useState<TransactionRegistrationSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [regTransactionType, setRegTransactionType] = useState("");
  const [propertyListedOnPlatform, setPropertyListedOnPlatform] = useState(!!propertyIdFromUrl);
  const [practitionerOnPlatform, setPractitionerOnPlatform] = useState(!!propertyIdFromUrl);
  const [offPlatformPartyType, setOffPlatformPartyType] = useState<"agent" | "property_owner">("agent");
  const [regPropertyId, setRegPropertyId] = useState(propertyIdFromUrl);
  const [regBuyerName, setRegBuyerName] = useState("");
  const [regBuyerEmail, setRegBuyerEmail] = useState("");
  const [regBuyerPhone, setRegBuyerPhone] = useState("");
  const [regValue, setRegValue] = useState("");
  const [practitionerName, setPractitionerName] = useState("");
  const [practitionerEmail, setPractitionerEmail] = useState("");
  const [practitionerPhone, setPractitionerPhone] = useState("");
  const [practitionerCompany, setPractitionerCompany] = useState("");
  const [practitionerLicence, setPractitionerLicence] = useState("");
  const [regPropType, setRegPropType] = useState<"land" | "residential" | "commercial">("residential");
  const [regAddress, setRegAddress] = useState(EMPTY_ADDRESS);
  const [regTitleNumber, setRegTitleNumber] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regLat, setRegLat] = useState("");
  const [regLng, setRegLng] = useState("");
  const [regSurveyPlan, setRegSurveyPlan] = useState("");
  const [regOwnerConfirmation, setRegOwnerConfirmation] = useState(false);
  const [buyerIdFile, setBuyerIdFile] = useState<File | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const [deedsOfAssignmentFile, setDeedsOfAssignmentFile] = useState<File | null>(null);
  const [conveyanceFile, setConveyanceFile] = useState<File | null>(null);
  const [registering, setRegistering] = useState(false);

  const [certEmail, setCertEmail] = useState("");
  const [certRegistrationId, setCertRegistrationId] = useState("");
  const [certDownloading, setCertDownloading] = useState(false);
  const [certResult, setCertResult] = useState<{
    certificateUrl: string;
    certificateNumber?: string;
    buyerName?: string;
  } | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

  useEffect(() => {
    if (tabFromUrl === "certificate") setTab("certificate");
  }, [tabFromUrl]);

  useEffect(() => {
    if (propertyIdFromUrl) {
      setRegPropertyId(propertyIdFromUrl);
      setSearchPropertyId(propertyIdFromUrl);
      setPropertyListedOnPlatform(true);
      setPractitionerOnPlatform(true);
    }
  }, [propertyIdFromUrl]);

  const regTransactionValueNum = useMemo(() => parseTransactionValueInput(regValue), [regValue]);
  const estimatedFee = useMemo(
    () => (Number.isFinite(regTransactionValueNum) ? getProcessingFeeFromTransactionValue(regTransactionValueNum) : 0),
    [regTransactionValueNum]
  );
  const regFullAddress = useMemo(() => buildFullAddress(regAddress), [regAddress]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setSearchResults(null);
    setSearching(true);
    try {
      const params: { address?: string; propertyId?: string; lat?: number; lng?: number } = {};
      if (searchMode === "propertyId") {
        if (!searchPropertyId.trim()) {
          setSearchError("Enter a Property ID or search by address/GPS for off-platform properties.");
          return;
        }
        params.propertyId = searchPropertyId.trim();
      } else if (searchMode === "address") {
        if (!searchAddress.trim()) {
          setSearchError("Enter the property address.");
          return;
        }
        params.address = searchAddress.trim();
      } else {
        if (!searchLat.trim() || !searchLng.trim()) {
          setSearchError("Enter both latitude and longitude.");
          return;
        }
        params.lat = Number(searchLat);
        params.lng = Number(searchLng);
      }
      const res = await transactionRegistrationService.search(params);
      if (res.success) {
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } else {
        setSearchResults([]);
        setSearchError(res.message || "Search could not be completed.");
      }
    } finally {
      setSearching(false);
    }
  }

  async function handleCertificateDownload(e: React.FormEvent) {
    e.preventDefault();
    setCertError(null);
    setCertResult(null);

    const email = certEmail.trim();
    const registrationId = certRegistrationId.trim();
    if (!email || !registrationId) {
      setCertError("Enter both your buyer email and registration reference.");
      return;
    }

    setCertDownloading(true);
    try {
      const res = await transactionRegistrationService.downloadCertificate({ email, registrationId });
      if (res.success && res.data?.certificateUrl) {
        setCertResult({
          certificateUrl: res.data.certificateUrl,
          certificateNumber: res.data.certificateNumber,
          buyerName: res.data.buyerName,
        });
      } else {
        setCertError(res.message || "Could not verify your certificate. Check your details and try again.");
      }
    } finally {
      setCertDownloading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const valueNum = Number(regValue.replace(/\D/g, ""));
    if (!regTransactionType || !regBuyerName.trim() || !regBuyerEmail.trim() || !regBuyerPhone.trim() || !Number.isFinite(valueNum)) {
      toast.error("Complete transaction type, buyer details, and transaction value.");
      return;
    }
    if (propertyListedOnPlatform && !regPropertyId.trim()) {
      toast.error("Property ID is required when the property is listed on KHABITEQ.");
      return;
    }
    if (!propertyListedOnPlatform && practitionerOnPlatform) {
      toast.error(
        'For properties not listed on KHABITEQ, uncheck "Practitioner (agent) is on KHABITEQ" and provide who you transacted with.'
      );
      return;
    }
    if (!practitionerOnPlatform && (!practitionerName.trim() || !practitionerEmail.trim() || !practitionerPhone.trim())) {
      const partyLabel = offPlatformPartyType === "property_owner" ? "Property owner" : "Agent";
      toast.error(`${partyLabel} name, email, and phone are required.`);
      return;
    }
    if (!buyerIdFile || !paymentReceiptFile) {
      toast.error("Upload your valid ID and payment receipt.");
      return;
    }
    const needsAddress = regPropType === "residential" || regPropType === "commercial";
    if (needsAddress && !isAddressRequiredPartsFilled(regAddress)) {
      toast.error("Street, city, and state are required for this property type.");
      return;
    }
    if (regPropType === "land" && (!regLat.trim() || !regLng.trim())) {
      toast.error("GPS coordinates are required for land.");
      return;
    }

    setRegistering(true);
    try {
      const [buyerIdUpload, paymentReceiptUpload] = await Promise.all([
        uploadRegistrationDocument(buyerIdFile),
        uploadRegistrationDocument(paymentReceiptFile),
      ]);
      if (!buyerIdUpload.ok) {
        toast.error(`Valid ID upload failed: ${buyerIdUpload.error}`);
        return;
      }
      if (!paymentReceiptUpload.ok) {
        toast.error(`Payment receipt upload failed: ${paymentReceiptUpload.error}`);
        return;
      }

      let deedsUpload: Awaited<ReturnType<typeof uploadRegistrationDocument>> | null = null;
      let conveyanceUpload: Awaited<ReturnType<typeof uploadRegistrationDocument>> | null = null;
      if (deedsOfAssignmentFile) {
        deedsUpload = await uploadRegistrationDocument(deedsOfAssignmentFile);
        if (!deedsUpload.ok) {
          toast.error(`Deed of assignment upload failed: ${deedsUpload.error}`);
          return;
        }
      }
      if (conveyanceFile) {
        conveyanceUpload = await uploadRegistrationDocument(conveyanceFile);
        if (!conveyanceUpload.ok) {
          toast.error(`Conveyance document upload failed: ${conveyanceUpload.error}`);
          return;
        }
      }

      const body: RegisterTransactionBody = {
        transactionType: regTransactionType,
        buyer: {
          email: regBuyerEmail.trim(),
          fullName: regBuyerName.trim(),
          phoneNumber: regBuyerPhone.trim(),
        },
        transactionValue: valueNum,
        propertyIdentification: {
          type: regPropType,
          exactAddress: regFullAddress || undefined,
          titleNumber: regTitleNumber.trim() || undefined,
          ownerName: regOwnerName.trim() || undefined,
          lat: regLat ? Number(regLat) : undefined,
          lng: regLng ? Number(regLng) : undefined,
          surveyPlanRef: regSurveyPlan.trim() || undefined,
          ownerConfirmation: regPropType === "land" ? regOwnerConfirmation : undefined,
        },
        buyerIdFileName: buyerIdUpload.fileName,
        buyerIdUrl: buyerIdUpload.url,
        paymentReceiptFileName: paymentReceiptUpload.fileName,
        paymentReceiptUrl: paymentReceiptUpload.url,
      };
      if (!practitionerOnPlatform) {
        body.offPlatformPartyType = offPlatformPartyType;
        body.practitioner = {
          fullName: practitionerName.trim(),
          email: practitionerEmail.trim(),
          phoneNumber: practitionerPhone.trim(),
          companyName: offPlatformPartyType === "agent" ? practitionerCompany.trim() || undefined : undefined,
          licenceNumber: offPlatformPartyType === "agent" ? practitionerLicence.trim() || undefined : undefined,
          isOnPlatform: false,
        };
      }
      if (deedsUpload?.ok) {
        body.deedsOfAssignmentFileName = deedsUpload.fileName;
        body.deedsOfAssignmentUrl = deedsUpload.url;
      }
      if (conveyanceUpload?.ok) {
        body.conveyanceFileName = conveyanceUpload.fileName;
        body.conveyanceUrl = conveyanceUpload.url;
      }
      if (propertyListedOnPlatform && regPropertyId.trim()) {
        body.propertyId = regPropertyId.trim();
      }

      const res = await transactionRegistrationService.register(body);
      if (res.success) {
        const paymentUrl = (res.data as { paymentUrl?: string } | null)?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
        const registrationId = (res.data as { registrationId?: string } | null)?.registrationId;
        toast.success(
          registrationId
            ? `Registration submitted. Reference: ${registrationId}`
            : res.message || "Transaction registered successfully."
        );
        if (registrationId) {
          setCertRegistrationId(registrationId);
          setCertEmail(regBuyerEmail.trim());
        }
        setTab("guidelines");
      } else {
        toast.error(res.message || "Registration failed.");
      }
    } finally {
      setRegistering(false);
    }
  }

  const tabIndex = TAB_ORDER.indexOf(tab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF8] to-white">
      <section className="relative bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C] text-white py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DDB90] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8DDB90] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 rounded-full bg-[#8DDB90]/20 border border-[#8DDB90]/30 text-[#8DDB90] text-xs font-bold uppercase tracking-widest">
            KHABITEQ compliance
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl">Register your property transaction</h1>
          <p className="text-white/90 max-w-2xl text-base md:text-lg leading-relaxed">
            Register transactions completed with any licensed practitioner — even when the property or agent is not listed on KHABITEQ.
            Protect your deal, prevent double allocation, and stay compliant with Lagos State requirements.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-wrap gap-2 p-1.5 mb-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          {TAB_ORDER.map((t) => {
            const labels = {
              guidelines: "Guidelines & fees",
              search: "Check status",
              register: "Register",
              certificate: "Download certificate",
            };
            const icons = { guidelines: FileText, search: Search, register: ShieldCheck, certificate: Award };
            const Icon = icons[t];
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active ? "bg-[#09391C] text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {labels[t]}
              </button>
            );
          })}
        </div>

        {tab === "guidelines" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Processing fees</h2>
              <p className="text-sm text-gray-600 mt-1">Fees are set by regulation and confirmed at checkout.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4">Transaction value</th>
                    <th className="py-2">Processing fee</th>
                  </tr>
                </thead>
                <tbody>
                  {PROCESSING_FEE_BANDS.map((b) => (
                    <tr key={b.label} className="border-b border-gray-100">
                      <td className="py-3 pr-4">{b.label}</td>
                      <td className="py-3 font-semibold">{formatNaira(b.feeNaira)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-[#8DDB90]/10 border border-[#8DDB90]/25 p-4 text-sm text-[#09391C]">
              <p className="font-semibold mb-2">Off-platform transactions</p>
              <p>
                You can register a transaction even if the property was never listed on KHABITEQ or your agent is not on the platform.
                Provide the practitioner&apos;s contact details and full property identification when registering.
              </p>
            </div>
          </div>
        )}

        {tab === "search" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check property status</h2>
            <p className="text-sm text-gray-600 mb-6">
              Search the KHABITEQ registry by Property ID (listed properties), address, or GPS. Unlisted properties can only be checked by address or coordinates.
            </p>
            <form onSubmit={handleSearch} className="space-y-4 max-w-xl">
              <div>
                <label className={labelClass}>Search by</label>
                <select value={searchMode} onChange={(e) => setSearchMode(e.target.value as typeof searchMode)} className={inputClass}>
                  <option value="address">Address</option>
                  <option value="propertyId">Property ID (KHABITEQ listing)</option>
                  <option value="gps">GPS (lat/lng)</option>
                </select>
              </div>
              {searchMode === "propertyId" && (
                <div>
                  <label className={labelClass}>Property ID</label>
                  <input type="text" value={searchPropertyId} onChange={(e) => setSearchPropertyId(e.target.value)} className={inputClass} />
                </div>
              )}
              {searchMode === "address" && (
                <div>
                  <label className={labelClass}>Address</label>
                  <input type="text" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} className={inputClass} placeholder="Street, area, LGA" />
                </div>
              )}
              {searchMode === "gps" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Latitude</label>
                    <input type="text" value={searchLat} onChange={(e) => setSearchLat(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Longitude</label>
                    <input type="text" value={searchLng} onChange={(e) => setSearchLng(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}
              <button type="submit" disabled={searching} className="h-12 px-6 rounded-xl bg-[#8DDB90] hover:bg-[#7BC97F] text-white font-bold disabled:opacity-70 transition-colors">
                {searching ? "Searching…" : "Search registry"}
              </button>
            </form>
            {searchError && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{searchError}</p>}
            {searchResults !== null && (
              <div className="mt-8">
                {searchResults.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 text-sm">
                    <p className="font-bold mb-1">No registration on record</p>
                    <p>No transaction registration was found for this search. Based on KHABITEQ data, the property appears clear for payment and registration.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((r, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 p-4 text-sm">
                        <p className="font-semibold">{r.registrationStatus || "Registered"}</p>
                        <p className="text-gray-600 mt-1">{r.address || "—"}</p>
                        {r.propertyId && <p className="text-gray-500 mt-1">Property ID: {r.propertyId}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "register" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Register transaction</h2>
            <p className="text-sm text-gray-600 mb-6">
              For deals completed outside a KHABITEQ listing, provide practitioner details and property identification below.
            </p>
            <form onSubmit={handleRegister} className="space-y-6 max-w-3xl">
              <div>
                <label className={labelClass}>Transaction type *</label>
                <select value={regTransactionType} onChange={(e) => setRegTransactionType(e.target.value)} className={inputClass} required>
                  <option value="">Select type</option>
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propertyListedOnPlatform}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPropertyListedOnPlatform(checked);
                      if (!checked) setPractitionerOnPlatform(false);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Property is listed on KHABITEQ</span>
                    <span className="block text-xs text-gray-600">Check only if you have a Property ID from our marketplace.</span>
                  </span>
                </label>
                {propertyListedOnPlatform && (
                  <div>
                    <label className={labelClass}>Property ID *</label>
                    <input type="text" value={regPropertyId} onChange={(e) => setRegPropertyId(e.target.value)} className={inputClass} />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={practitionerOnPlatform}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPractitionerOnPlatform(checked);
                      if (checked) {
                        setPractitionerName("");
                        setPractitionerEmail("");
                        setPractitionerPhone("");
                        setPractitionerCompany("");
                        setPractitionerLicence("");
                      }
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Practitioner (agent) is on KHABITEQ</span>
                    <span className="block text-xs text-gray-600">Uncheck if you transacted with an agent or property owner not registered on the platform.</span>
                  </span>
                </label>
                {!practitionerOnPlatform && (
                  <div className="space-y-4">
                    <div>
                      <p className={labelClass}>Who did you transact with? *</p>
                      <div className="mt-2 flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900">
                          <input
                            type="radio"
                            name="offPlatformPartyType"
                            checked={offPlatformPartyType === "agent"}
                            onChange={() => setOffPlatformPartyType("agent")}
                            className="h-4 w-4"
                          />
                          Real estate agent (not on KHABITEQ)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900">
                          <input
                            type="radio"
                            name="offPlatformPartyType"
                            checked={offPlatformPartyType === "property_owner"}
                            onChange={() => setOffPlatformPartyType("property_owner")}
                            className="h-4 w-4"
                          />
                          Property owner / landlord
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          {offPlatformPartyType === "property_owner" ? "Property owner full name *" : "Agent full name *"}
                        </label>
                        <input type="text" value={practitionerName} onChange={(e) => setPractitionerName(e.target.value)} className={inputClass} required={!practitionerOnPlatform} />
                      </div>
                      <div>
                        <label className={labelClass}>
                          {offPlatformPartyType === "property_owner" ? "Property owner email *" : "Agent email *"}
                        </label>
                        <input type="email" value={practitionerEmail} onChange={(e) => setPractitionerEmail(e.target.value)} className={inputClass} required={!practitionerOnPlatform} />
                      </div>
                      <div>
                        <label className={labelClass}>
                          {offPlatformPartyType === "property_owner" ? "Property owner phone *" : "Agent phone *"}
                        </label>
                        <input type="tel" value={practitionerPhone} onChange={(e) => setPractitionerPhone(e.target.value)} className={inputClass} required={!practitionerOnPlatform} />
                      </div>
                      {offPlatformPartyType === "agent" && (
                        <>
                          <div>
                            <label className={labelClass}>Company / firm (optional)</label>
                            <input type="text" value={practitionerCompany} onChange={(e) => setPractitionerCompany(e.target.value)} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Licence / permit no. (optional)</label>
                            <input type="text" value={practitionerLicence} onChange={(e) => setPractitionerLicence(e.target.value)} className={inputClass} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Buyer full name *</label>
                  <input type="text" value={regBuyerName} onChange={(e) => setRegBuyerName(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Buyer email *</label>
                  <input type="email" value={regBuyerEmail} onChange={(e) => setRegBuyerEmail(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Buyer phone *</label>
                  <input type="tel" value={regBuyerPhone} onChange={(e) => setRegBuyerPhone(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Transaction value (NGN) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={regValue}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "");
                    setRegValue(d === "" ? "" : Number(d).toLocaleString("en-NG"));
                  }}
                  className={inputClass}
                  required
                />
                {Number.isFinite(regTransactionValueNum) && regTransactionValueNum > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Estimated processing fee at checkout: <strong>{formatNaira(estimatedFee)}</strong>
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-4">
                <p className="text-sm font-bold text-gray-900">Required documents</p>
                <div>
                  <label className={labelClass}>Your valid ID *</label>
                  <input type="file" onChange={(e) => setBuyerIdFile(e.target.files?.[0] ?? null)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Deal payment receipt *</label>
                  <input type="file" onChange={(e) => setPaymentReceiptFile(e.target.files?.[0] ?? null)} className={inputClass} required />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-4">
                <p className="text-sm font-bold text-gray-900">Optional documents</p>
                <p className="text-xs text-gray-600">Upload if available — PDF or image, max 25 MB each.</p>
                <div>
                  <label className={labelClass}>Deed of assignment (optional)</label>
                  <input type="file" onChange={(e) => setDeedsOfAssignmentFile(e.target.files?.[0] ?? null)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Conveyance (optional)</label>
                  <input type="file" onChange={(e) => setConveyanceFile(e.target.files?.[0] ?? null)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Property identification type *</label>
                <select value={regPropType} onChange={(e) => setRegPropType(e.target.value as typeof regPropType)} className={inputClass}>
                  <option value="land">Land</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {(regPropType === "residential" || regPropType === "commercial") && (
                <>
                  <AddressBreakdownFields
                    value={regAddress}
                    onChange={setRegAddress}
                    labelClass={labelClass}
                    inputClass={inputClass}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Title number (optional)</label>
                      <input type="text" value={regTitleNumber} onChange={(e) => setRegTitleNumber(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Owner name (optional)</label>
                      <input type="text" value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Latitude (optional)</label>
                      <input type="text" value={regLat} onChange={(e) => setRegLat(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude (optional)</label>
                      <input type="text" value={regLng} onChange={(e) => setRegLng(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </>
              )}

              {regPropType === "land" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Latitude *</label>
                      <input type="text" value={regLat} onChange={(e) => setRegLat(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude *</label>
                      <input type="text" value={regLng} onChange={(e) => setRegLng(e.target.value)} className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Survey plan reference (optional)</label>
                    <input type="text" value={regSurveyPlan} onChange={(e) => setRegSurveyPlan(e.target.value)} className={inputClass} />
                  </div>
                  <AddressBreakdownFields
                    value={regAddress}
                    onChange={setRegAddress}
                    labelClass={labelClass}
                    inputClass={inputClass}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={regOwnerConfirmation} onChange={(e) => setRegOwnerConfirmation(e.target.checked)} />
                    Owner confirmation (optional)
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={registering}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#8DDB90] hover:bg-[#7BC97F] text-white font-bold disabled:opacity-70 transition-colors"
              >
                {registering ? "Submitting…" : estimatedFee > 0 ? `Register & pay ${formatNaira(estimatedFee)}` : "Register transaction"}
              </button>
            </form>
          </div>
        )}

        {tab === "certificate" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#0B5D3B]/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-[#0B5D3B]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Download transaction registration certificate</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Once LASRERA has approved your registration, download your official certificate here. For security, you must
              enter the <strong>buyer email</strong> and <strong>registration reference</strong> from your confirmation email.
            </p>
            <form onSubmit={handleCertificateDownload} className="space-y-4">
              <div>
                <label className={labelClass}>Registration reference (transaction ID) *</label>
                <input
                  type="text"
                  value={certRegistrationId}
                  onChange={(e) => setCertRegistrationId(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 674a1b2c3d4e5f678901234"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={labelClass}>Buyer email *</label>
                <input
                  type="email"
                  value={certEmail}
                  onChange={(e) => setCertEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Same email used when registering"
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={certDownloading}
                className="w-full h-12 px-6 rounded-xl bg-[#0B5D3B] hover:bg-[#094a30] text-white font-bold disabled:opacity-70 transition-colors"
              >
                {certDownloading ? "Verifying…" : "Verify & download certificate"}
              </button>
            </form>
            {certError && (
              <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{certError}</p>
            )}
            {certResult && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
                <p className="font-semibold text-emerald-950">
                  Certificate verified{certResult.buyerName ? ` for ${certResult.buyerName}` : ""}
                </p>
                {certResult.certificateNumber && (
                  <p className="text-sm text-emerald-900">Certificate no.: {certResult.certificateNumber}</p>
                )}
                <a
                  href={certResult.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-[#0B5D3B] text-white font-semibold text-sm hover:bg-[#094a30] transition-colors"
                >
                  Open certificate PDF
                </a>
              </div>
            )}
          </div>
        )}

        <nav className="mt-10 flex justify-between items-center border-t border-gray-200 pt-6">
          {tabIndex > 0 ? (
            <button type="button" onClick={() => setTab(TAB_ORDER[tabIndex - 1])} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
              <ChevronLeft className="w-4 h-4" /> {TAB_ORDER[tabIndex - 1] === "guidelines" ? "Guidelines" : "Previous"}
            </button>
          ) : <span />}
          {tabIndex < TAB_ORDER.length - 1 ? (
            <button type="button" onClick={() => setTab(TAB_ORDER[tabIndex + 1])} className="inline-flex items-center gap-1 text-sm font-semibold text-[#09391C] hover:text-[#8DDB90] transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : <span />}
        </nav>
      </div>
    </div>
  );
}
