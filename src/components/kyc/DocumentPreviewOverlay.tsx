"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  isPdfSource,
  toInlinePreviewUrl,
} from "@/utils/mediaPreview";

type Props = {
  url: string;
  name?: string | null;
  onClose: () => void;
};

export default function DocumentPreviewOverlay({ url, name, onClose }: Props) {
  const inlineUrl = toInlinePreviewUrl(url);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const asPdf = isPdfSource(name || url) || isPdfSource(inlineUrl);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    if (url.startsWith("blob:") || url.startsWith("data:")) return;
    if (!asPdf) return;

    void (async () => {
      try {
        const res = await fetch(inlineUrl, { mode: "cors" });
        if (!res.ok) return;
        const blob = await res.blob();
        const next = URL.createObjectURL(blob);
        revoked = next;
        if (!cancelled) setBlobUrl(next);
      } catch {
        /* keep iframe on remote url */
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [asPdf, inlineUrl, url]);

  const src = blobUrl || inlineUrl;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name ? `Preview ${name}` : "Document preview"}
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <p className="truncate text-sm font-semibold text-[#09391C]">{name || "Document preview"}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#09391C] hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#111827]">
          {failed ? (
            <p className="px-6 py-10 text-center text-sm text-white/80">
              This document could not be previewed here.
            </p>
          ) : asPdf ? (
            <iframe
              title={name || "PDF preview"}
              src={src}
              className="h-[80vh] w-full bg-white"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={name || "Document preview"}
              className="max-h-[80vh] w-auto max-w-full object-contain"
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
