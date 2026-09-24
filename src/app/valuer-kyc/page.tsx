"use client";

import { useState } from "react";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useUserContext, normalizeUser } from "@/context/user-context";
import KycSubmittedConfirmation from "@/components/kyc/KycSubmittedConfirmation";
import { isApprovedKyc, isPendingKyc, resolveKycStatus } from "@/lib/kyc-status";
import {
  RegistrationCertificateFields,
  certificateDocName,
  type RegistrationCertificateKind,
} from "@/components/kyc/RegistrationCertificateFields";

export default function ValuerKycPage() {
  const { user, setUser } = useUserContext();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [firmName, setFirmName] = useState("");
  const [certificateKind, setCertificateKind] = useState<RegistrationCertificateKind>("cac");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const kycStatus = resolveKycStatus(user);

  const submit = async () => {
    if (!certificateNumber.trim() || !docUrl) {
      toast.error("Enter the certificate number and upload the CAC or LASRERA certificate");
      return;
    }
    setBusy(true);
    try {
      const res = await PUT_REQUEST(
        `${URLS.BASE}/account/valuer/kyc`,
        {
          licenseNumber,
          firmName,
          certificateKind,
          certificateNumber,
          kycDocuments: [{ name: certificateDocName(certificateKind), url: docUrl }],
        },
        Cookies.get("token"),
      );
      if (res?.success) {
        if (user) setUser(normalizeUser({ ...user, kycStatus: "pending" }));
        toast.success("Practitioner KYC submitted for review");
      } else toast.error((res as { error?: string })?.error || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  if (isPendingKyc(kycStatus)) {
    return (
      <CombinedAuthGuard requireAuth allowedUserTypes={["PropertyScout", "Valuer"]}>
        <KycSubmittedConfirmation userType="Valuer" continueHref="/dashboard" continueLabel="Go to Dashboard" />
      </CombinedAuthGuard>
    );
  }
  if (isApprovedKyc(kycStatus)) {
    return (
      <CombinedAuthGuard requireAuth allowedUserTypes={["PropertyScout", "Valuer"]}>
        <KycSubmittedConfirmation userType="Valuer" variant="approved" continueHref="/dashboard" continueLabel="Go to Dashboard" />
      </CombinedAuthGuard>
    );
  }

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["PropertyScout", "Valuer"]}>
      <div className="min-h-screen bg-[#EEF1F1] px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#09391C]">Practitioner verification</h1>
          <p className="text-sm text-[#5A5D63]">Submit your professional credential for Khabiteq review.</p>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            placeholder="Firm name"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            placeholder="License / registration number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
          <RegistrationCertificateFields
            kind={certificateKind}
            onKindChange={setCertificateKind}
            certificateNumber={certificateNumber}
            onCertificateNumberChange={setCertificateNumber}
            fileUrl={docUrl}
            onFileUrlChange={setDocUrl}
            uploadId="valuer-kyc-doc"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="w-full rounded-xl bg-[#09391C] py-3 text-sm font-semibold text-white"
          >
            Submit for review
          </button>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
