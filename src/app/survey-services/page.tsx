"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProfessionalPicker, {
  type MarketplaceProfessional,
} from "@/components/professionals/ProfessionalPicker";
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

const SERVICE_TYPES = ["plan-verification", "site-survey"] as const;

export default function SurveyServicesPage() {
  const [selected, setSelected] = useState<MarketplaceProfessional | null>(null);
  const [serviceType, setServiceType] =
    useState<(typeof SERVICE_TYPES)[number]>("plan-verification");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [planUrl, setPlanUrl] = useState("");
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uploadPlan = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("for", "identity-doc");
      const res = await POST_REQUEST_FILE_UPLOAD(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formData,
      );
      if (res.success) {
        setPlanUrl((res.data as { url?: string })?.url || "");
        toast.success("Survey plan uploaded");
      } else {
        toast.error(res.message || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!selected) {
      toast.error("Select a surveyor from the marketplace.");
      return;
    }
    if (!contact.fullName || !contact.email || !contact.phoneNumber) {
      toast.error("Fill in your contact details.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await POST_REQUEST(`${URLS.BASE}${URLS.surveyRequests}`, {
        contactInfo: {
          fullName: contact.fullName.trim(),
          email: contact.email.trim().toLowerCase(),
          phoneNumber: contact.phoneNumber.trim(),
        },
        surveyorId: selected.id,
        serviceType,
        propertyAddress: propertyAddress.trim() || undefined,
        surveyPlanUrl: planUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      if (res.success) {
        toast.success(
          `${selected.fullName} will accept or decline. We will notify you when payment is due.`,
        );
        setSelected(null);
        setNotes("");
        setPropertyAddress("");
        setPlanUrl("");
      } else {
        toast.error(res.message || "Submit failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F8FAF8] pt-24 sm:pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#09391C]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/document-verification" className="hover:text-[#09391C]">
            Compliance
          </Link>
          <span className="mx-2">/</span>
          <span>Survey services</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#09391C] mb-3">
          Survey services
        </h1>
        <p className="text-[#5A5D63] mb-8">
          Request plan verification or a site survey from a licensed surveyor.
          Payment is only due after the surveyor accepts.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <ProfessionalPicker
            kind="surveyor"
            selectedId={selected?.id || null}
            onChange={setSelected}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <p className="font-semibold text-[#09391C] mb-3">Service type</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    serviceType === type
                      ? "bg-[#09391C] text-white"
                      : "bg-gray-100 text-[#09391C]"
                  }`}
                >
                  {type.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Property address</span>
            <input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Upload survey plan (optional)
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => uploadPlan(e.target.files?.[0])}
            />
            {uploading && <p className="text-xs text-[#5A5D63] mt-1">Uploading…</p>}
            {planUrl && <p className="text-xs text-green-600 mt-1">Plan uploaded</p>}
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={contact.fullName}
              onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
              placeholder="Full name"
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              value={contact.phoneNumber}
              onChange={(e) => setContact({ ...contact, phoneNumber: e.target.value })}
              placeholder="Phone number"
              className="p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            disabled={submitting || !selected}
            onClick={onSubmit}
            className="w-full py-3 rounded-xl bg-[#09391C] text-white font-semibold disabled:opacity-50"
          >
            {submitting
              ? "Submitting…"
              : `Submit request${selected?.surveyFee ? ` · ₦${selected.surveyFee.toLocaleString()}` : ""}`}
          </button>
        </div>
      </div>
    </section>
  );
}
