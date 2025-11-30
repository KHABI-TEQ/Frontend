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
  className?: string;
  id: string;
  style?: React.CSSProperties;
  acceptedFileTypes?: string; // e.g. "image/*,.pdf"
  onUploadStart?: () => void; // for showing external process modal
  onUploadEnd?: () => void; // for hiding external process modal
}

const AttachFile: React.FC<AttachFileProps> = ({
  heading,
  setFileUrl,
  className = "",
  id,
  style,
  acceptedFileTypes = "*",
  onUploadStart,
  onUploadEnd,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file as Blob);

    const url = URLS.BASE + URLS.uploadImg;

    try {
      onUploadStart?.();
      await toast.promise(
        POST_REQUEST_FILE_UPLOAD(url, formData).then((response) => {
          const uploadedUrl = (response as unknown as { url?: string }).url;
          if (uploadedUrl) {
            setFileUrl?.(uploadedUrl);
            return "File uploaded successfully";
          }
          throw new Error("Upload failed");
        }),
        {
          loading: "Uploading...",
          success: "File uploaded successfully",
          error: "Upload failed",
        },
      );
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      onUploadEnd?.();
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

      <button
        type="button"
        onClick={handleClick}
        style={style}
        className="mt-3 lg:mt-0 w-full lg:w-[367px] h-[58px] rounded-md border border-[#8DDB90] text-[#09391C] bg-[#F8F8FD] px-4 flex items-center justify-center gap-2 border-dashed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8DDB90"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-sm font-medium">Click to upload</span>
      </button>
    </div>
  );
};

export default AttachFile;
