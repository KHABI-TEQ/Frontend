"use client";

import AttachFile from "@/components/general-components/attach_file";

export type RegistrationCertificateKind = "cac" | "lasrera";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#09391C] outline-none focus:border-[#8DDB90] focus:ring-2 focus:ring-[#8DDB90]/20";

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
}) {
  const isCac = kind === "cac";
  const label = isCac ? "CAC certificate" : "LASRERA certificate";
  const numberLabel = isCac ? "CAC registration number" : "LASRERA certificate number";
  const placeholder = isCac ? "RC0000000" : "LASRERA / permit number";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#09391C]">Company registration document</p>
        <p className="text-xs text-[#5A5D63] mt-1">
          Choose one: upload either a CAC certificate or a LASRERA certificate. The number and file are required so Admin can preview them before approving KYC.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onKindChange("cac")}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              isCac ? "border-[#09391C] bg-[#09391C] text-white" : "border-slate-200 bg-white text-[#09391C]"
            }`}
          >
            CAC certificate
          </button>
          <button
            type="button"
            onClick={() => onKindChange("lasrera")}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              !isCac ? "border-[#09391C] bg-[#09391C] text-white" : "border-slate-200 bg-white text-[#09391C]"
            }`}
          >
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
              className="shrink-0 rounded-lg bg-[#09391C] text-white px-4 text-sm font-semibold"
            >
              Look up
            </button>
          )}
        </div>
      </label>
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-[#09391C]">Upload {label}</span>
        <p className="text-xs text-[#5A5D63]">Image or PDF. Admin will preview this before approval.</p>
        <AttachFile
          id={uploadId}
          heading={`Upload ${label}`}
          setFileUrl={(url: string | null) => onFileUrlChange(url || "")}
          acceptedFileTypes="image/*,.pdf"
        />
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold text-[#09391C] underline"
          >
            Preview uploaded {label}
          </a>
        )}
      </div>
    </div>
  );
}

export function certificateDocName(kind: RegistrationCertificateKind) {
  return kind === "lasrera" ? "LASRERA certificate" : "CAC certificate";
}
