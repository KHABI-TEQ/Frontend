"use client";

import { useState } from "react";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import AttachFile from "@/components/general-components/attach_file";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function LawyerKycUpgradePage() {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!docUrl) {
      toast.error("Upload a professional document");
      return;
    }
    setBusy(true);
    try {
      const res = await PUT_REQUEST(
        `${URLS.BASE}/account/lawyer/kyc`,
        {
          licenseNumber,
          verificationFee: 25000,
          kycDocuments: [{ name: "Lawyer credential", url: docUrl }],
        },
        Cookies.get("token"),
      );
      if (res?.success) toast.success("Lawyer KYC submitted for review");
      else toast.error((res as { error?: string })?.error || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["PropertyScout", "Lawyer"]}>
      <div className="min-h-screen bg-[#EEF1F1] px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#09391C]">Lawyer verification</h1>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            placeholder="License number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
          <AttachFile id="lawyer-kyc-doc" heading="Upload credential" setFileUrl={(url: string | null) => setDocUrl(url || "")} />
          <button type="button" disabled={busy} onClick={() => void submit()} className="w-full rounded-xl bg-[#09391C] py-3 text-sm font-semibold text-white">
            Submit for review
          </button>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
