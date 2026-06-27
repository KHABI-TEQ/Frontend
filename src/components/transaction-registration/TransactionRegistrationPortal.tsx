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
import { FileText, Search, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

type TabId = "guidelines" | "search" | "register";
const TAB_ORDER: TabId[] = ["guidelines", "search", "register"];

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

  const [tab, setTab] = useState<TabId>("guidelines");

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
  const [regExactAddress, setRegExactAddress] = useState("");
  const [regTitleNumber, setRegTitleNumber] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regLat, setRegLat] = useState("");
  const [regLng, setRegLng] = useState("");
  const [regSurveyPlan, setRegSurveyPlan] = useState("");
  const [regOwnerConfirmation, setRegOwnerConfirmation] = useState(false);
  const [buyerIdFile, setBuyerIdFile] = useState<File | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (propertyIdFromUrl) {
      setRegPropertyId(propertyIdFromUrl);
      setSearchPropertyId(propertyIdFromUrl);
      setPropertyListedOnPlatform(true);
    }
  }, [propertyIdFromUrl]);

  const regTransactionValueNum = useMemo(() => parseTransactionValueInput(regValue), [regValue]);
  const estimatedFee = useMemo(
    () => (Number.isFinite(regTransactionValueNum) ? getProcessingFeeFromTransactionValue(regTransactionValueNum) : 0),
    [regTransactionValueNum]
  );

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
    if (!practitionerName.trim() || !practitionerEmail.trim() || !practitionerPhone.trim()) {
      toast.error("Practitioner (agent) name, email, and phone are required.");
      return;
    }
    if (!buyerIdFile || !paymentReceiptFile) {
      toast.error("Upload your valid ID and payment receipt.");
      return;
    }
    const needsAddress = regPropType === "residential" || regPropType === "commercial";
    if (needsAddress && !regExactAddress.trim()) {
      toast.error("Exact address is required for this property type.");
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

      const body: RegisterTransactionBody = {
        transactionType: regTransactionType,
        buyer: {
          email: regBuyerEmail.trim(),
          fullName: regBuyerName.trim(),
          phoneNumber: regBuyerPhone.trim(),
        },
        transactionValue: valueNum,
        practitioner: {
          fullName: practitionerName.trim(),
          email: practitionerEmail.trim(),
          phoneNumber: practitionerPhone.trim(),
          companyName: practitionerCompany.trim() || undefined,
          licenceNumber: practitionerLicence.trim() || undefined,
          isOnPlatform: propertyListedOnPlatform && !!regPropertyId.trim(),
        },
        propertyIdentification: {
          type: regPropType,
          exactAddress: regExactAddress.trim() || undefined,
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
        toast.success(res.message || "Transaction registered successfully.");
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
            const labels = { guidelines: "Guidelines & fees", search: "Check status", register: "Register" };
            const icons = { guidelines: FileText, search: Search, register: ShieldCheck };
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
                <p className="text-sm font-bold text-gray-900">Practitioner (agent) details *</p>
                <p className="text-xs text-gray-600 -mt-2">The licensed agent or practitioner who handled this transaction with you.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full name *</label>
                    <input type="text" value={practitionerName} onChange={(e) => setPractitionerName(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" value={practitionerEmail} onChange={(e) => setPractitionerEmail(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input type="tel" value={practitionerPhone} onChange={(e) => setPractitionerPhone(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Company / firm</label>
                    <input type="text" value={practitionerCompany} onChange={(e) => setPractitionerCompany(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Licence / permit no.</label>
                    <input type="text" value={practitionerLicence} onChange={(e) => setPractitionerLicence(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propertyListedOnPlatform}
                    onChange={(e) => setPropertyListedOnPlatform(e.target.checked)}
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

              <div>
                <label className={labelClass}>Property identification type *</label>
                <select value={regPropType} onChange={(e) => setRegPropType(e.target.value as typeof regPropType)} className={inputClass}>
                  <option value="land">Land</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {(regPropType === "residential" || regPropType === "commercial") && (
                <div>
                  <label className={labelClass}>Exact address *</label>
                  <input type="text" value={regExactAddress} onChange={(e) => setRegExactAddress(e.target.value)} className={inputClass} required />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title number</label>
                  <input type="text" value={regTitleNumber} onChange={(e) => setRegTitleNumber(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Owner name</label>
                  <input type="text" value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Latitude{regPropType === "land" ? " *" : ""}</label>
                  <input type="text" value={regLat} onChange={(e) => setRegLat(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Longitude{regPropType === "land" ? " *" : ""}</label>
                  <input type="text" value={regLng} onChange={(e) => setRegLng(e.target.value)} className={inputClass} />
                </div>
              </div>

              {regPropType === "land" && (
                <>
                  <div>
                    <label className={labelClass}>Survey plan reference</label>
                    <input type="text" value={regSurveyPlan} onChange={(e) => setRegSurveyPlan(e.target.value)} className={inputClass} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={regOwnerConfirmation} onChange={(e) => setRegOwnerConfirmation(e.target.checked)} />
                    I confirm owner details for this land transaction
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
