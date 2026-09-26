/** @format */

import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import React from "react";
import toast from "react-hot-toast";

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
}

function uploadedFileLabel(url: string): string {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.split("?")[0] || "Document uploaded";
  } catch {
    return "Document uploaded";
  }
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
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const generatedId = React.useId();
  const id = idProp || generatedId;
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [localUrl, setLocalUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const displayUrl = fileUrl || localUrl;
  const displayName =
    selectedName || (displayUrl ? uploadedFileLabel(displayUrl) : null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedName(file.name);
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

  return (
    <div
      className={`min-h-[58px] w-full flex lg:flex-row flex-col justify-between lg:items-center items-start ${className}`}
    >
      <span className="text-base leading-[25.6px] text-[#202430] font-semibold">
        {heading}
      </span>

      <input
        ref={inputRef}
        type="file"
        id={id}
        title="file"
        accept={acceptedFileTypes}
        className="hidden"
        onChange={handleFileChange}
      />

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
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          style={style}
          className="w-full h-[58px] rounded-md border border-[#8DDB90] text-[#09391C] bg-[#F8F8FD] px-4 flex items-center justify-center gap-2 border-dashed disabled:opacity-70"
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
              : displayName
                ? displayName
                : "Click to upload"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AttachFile;
