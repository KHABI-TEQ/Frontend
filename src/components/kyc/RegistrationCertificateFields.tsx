"use client";

import AttachFile from "@/components/general-components/attach_file";

export type RegistrationCertificateKind = "cac" | "lasrera";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#09391C] outline-none placeholder:text-slate-400 focus:border-[#8DDB90] focus:ring-2 focus:ring-[#8DDB90]/20";

const toggleClass = (active: boolean) =>
  `rounded-xl px-3 py-3.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-[#09391C] text-white"
      : "border border-slate-200 bg-white text-[#09391C]"
  }`;

export function RegistrationCertificateFields({
  kind,
  onKindChange,
  certificateNumber,
  onCertificateNumberChange,
  fileUrl,
  onFileUrlChange,
  uploadId,
  showLookup,
  onLookup,
  onUploadStart,
  onUploadEnd,
}: {
  kind: RegistrationCertificateKind;
  onKindChange: (kind: RegistrationCertificateKind) => void;
  certificateNumber: string;
  onCertificateNumberChange: (value: string) => void;
  fileUrl: string;
  onFileUrlChange: (url: string) => void;
  uploadId: string;
  showLookup?: boolean;
  onLookup?: () => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}) {
  const isCac = kind === "cac";
  const label = isCac ? "CAC certificate" : "LASRERA certificate";
  const numberLabel = isCac ? "CAC registration number" : "LASRERA certificate number";
  const placeholder = isCac ? "RC0000000" : "LASRERA / permit number";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#09391C]">Company registration document</p>
        <p className="mt-1 text-xs text-[#5A5D63]">
          Choose one: upload either a CAC certificate or a LASRERA certificate. The number and file are required so Admin can preview them before approving KYC.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onKindChange("cac")} className={toggleClass(isCac)}>
            CAC certificate
          </button>
          <button type="button" onClick={() => onKindChange("lasrera")} className={toggleClass(!isCac)}>
            LASRERA certificate
          </button>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-[#09391C]">{numberLabel}</span>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={certificateNumber}
            onChange={(e) => onCertificateNumberChange(e.target.value)}
            placeholder={placeholder}
          />
          {isCac && showLookup && onLookup && (
            <button
              type="button"
              onClick={onLookup}
              className="shrink-0 rounded-xl bg-[#09391C] px-4 text-sm font-semibold text-white"
            >
              Look up
            </button>
          )}
        </div>
      </label>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-[#09391C]">Upload {label}</p>
          <p className="mt-1 text-xs text-[#5A5D63]">Image or PDF. Admin will preview this before approval.</p>
        </div>
        <AttachFile
          variant="kyc-id"
          id={uploadId}
          heading={`Upload ${label}`}
          fileUrl={fileUrl || null}
          setFileUrl={(url: string | null) => onFileUrlChange(url || "")}
          acceptedFileTypes="image/*,.pdf"
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />
      </div>
    </div>
  );
}

export function certificateDocName(kind: RegistrationCertificateKind) {
  return kind === "lasrera" ? "LASRERA certificate" : "CAC certificate";
}
