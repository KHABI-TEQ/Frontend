/** @format */

import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import React from "react";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import DocumentPreviewOverlay from "@/components/kyc/DocumentPreviewOverlay";
import { fileNameFromUrl, fileStem } from "@/utils/mediaPreview";

type SetFileUrlType =
  | React.Dispatch<React.SetStateAction<string | null>>
  | ((url: string | null) => void);

interface AttachFileProps {
  heading: string;
  setFileUrl?: SetFileUrlType;
  fileUrl?: string | null;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  acceptedFileTypes?: string; // e.g. "image/*,.pdf"
  onUploadStart?: () => void; // for showing external process modal
  onUploadEnd?: () => void; // for hiding external process modal
  /** Identity-document row: upload control + filename beside in-page Preview. */
  variant?: "default" | "kyc-id";
}

function uploadedFileLabel(url: string): string {
  return fileNameFromUrl(url);
}

const AttachFile: React.FC<AttachFileProps> = ({
  heading,
  setFileUrl,
  fileUrl,
  className = "",
  id: idProp,
  style,
  acceptedFileTypes = "*",
  onUploadStart,
  onUploadEnd,
  variant = "default",
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const generatedId = React.useId();
  const id = idProp || generatedId;
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [localUrl, setLocalUrl] = React.useState<string | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const displayUrl = fileUrl || localUrl || objectUrl;
  const displayName =
    selectedName || (displayUrl && !displayUrl.startsWith("blob:") ? uploadedFileLabel(displayUrl) : null);

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedName(file.name);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const nextObjectUrl = URL.createObjectURL(file);
    setObjectUrl(nextObjectUrl);

    const formData = new FormData();
    formData.append("file", file as Blob);

    const url = URLS.BASE + URLS.uploadImg;

    try {
      setUploading(true);
      onUploadStart?.();
      await toast.promise(
        POST_REQUEST_FILE_UPLOAD(url, formData).then((response) => {
          const uploadedUrl = (response as unknown as { url?: string }).url;
          if (uploadedUrl) {
            setLocalUrl(uploadedUrl);
            setFileUrl?.(uploadedUrl);
            return "File uploaded successfully";
          }
          throw new Error("Upload failed");
        }),
        {
          loading: `Uploading ${file.name}...`,
          success: `${file.name} uploaded`,
          error: "Upload failed",
        },
      );
    } catch {
      if (!displayUrl) setSelectedName(null);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      onUploadEnd?.();
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const previewSrc = objectUrl || displayUrl;
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      id={id}
      title="file"
      accept={acceptedFileTypes}
      className="hidden"
      onChange={handleFileChange}
    />
  );

  const uploadButton = (
    <button
      type="button"
      onClick={handleClick}
      disabled={uploading}
      style={style}
      className={`flex items-center justify-center gap-2 border border-dashed border-[#8DDB90] px-4 text-[#09391C] disabled:opacity-70 ${
        variant === "kyc-id"
          ? "h-[52px] w-full shrink-0 rounded-xl bg-[#F7FBF7] sm:w-[280px]"
          : "h-[58px] w-full rounded-md bg-[#F8F8FD]"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8DDB90"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span className="text-sm font-medium truncate">
        {uploading
          ? `Uploading ${displayName || "file"}…`
          : variant === "kyc-id"
            ? "Click to upload"
            : displayName || "Click to upload"}
      </span>
    </button>
  );

  if (variant === "kyc-id") {
    return (
      <div className={`w-full ${className}`}>
        {fileInput}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[#5A5D63]">{heading}</span>
          {uploadButton}
        </div>
        {displayName && displayUrl ? (
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#3DAA4A]" />
            <span className="truncate text-sm font-medium text-[#09391C]" title={displayName}>
              {fileStem(displayName)}
            </span>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="shrink-0 text-sm font-medium text-[#3DAA4A] underline-offset-2 hover:underline"
            >
              Preview
            </button>
          </div>
        ) : null}
        {previewOpen && previewSrc ? (
          <DocumentPreviewOverlay
            url={previewSrc}
            name={displayName}
            onClose={() => setPreviewOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`min-h-[58px] w-full flex lg:flex-row flex-col justify-between lg:items-center items-start ${className}`}
    >
      <span className="text-base leading-[25.6px] text-[#202430] font-semibold">
        {heading}
      </span>

      {fileInput}

      <div className="mt-3 lg:mt-0 w-full lg:w-[367px] space-y-2">
        {displayName ? (
          <p
            className="text-xs text-[#09391C] truncate font-medium"
            title={displayName}
          >
            {uploading ? "Uploading: " : "Uploaded: "}
            {displayName}
          </p>
        ) : null}
        {uploadButton}
        {displayUrl ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="text-sm font-medium text-[#0B572B] underline"
          >
            Preview
          </button>
        ) : null}
      </div>
      {previewOpen && previewSrc ? (
        <DocumentPreviewOverlay
          url={previewSrc}
          name={displayName}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default AttachFile;
